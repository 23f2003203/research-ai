import { EvidenceChunk } from '../models/EvidenceChunk.js';
import { geminiService } from './gemini.service.js';
import { chunkText, cosineSimilarity } from '../utils/text.js';
import { logger } from '../utils/logger.js';
import { MODEL_CONFIG } from '../config/models.js';

class EmbeddingService {
  /**
   * Chunks a source's text, computes embeddings, and persists EvidenceChunk records.
   * @param {Object} options
   * @param {string} options.researchId
   * @param {string} options.sourceId
   * @param {string} options.userId
   * @param {string} options.text
   * @returns {Promise<Array<Object>>} Created evidence chunks
   */
  async processAndStoreChunks({ researchId, sourceId, userId, text }) {
    if (!text || text.trim().length === 0) return [];

    const rawChunks = chunkText(
      text,
      MODEL_CONFIG.budgets.chunkSize,
      MODEL_CONFIG.budgets.chunkOverlap
    );

    if (rawChunks.length === 0) return [];

    try {
      // 1. Generate embeddings in a single fast batch API call
      const texts = rawChunks.map((c) => c.text);
      const embeddings = await geminiService.generateBatchEmbeddings(texts);

      // 2. Map into EvidenceChunk documents
      const docsToInsert = rawChunks.map((chunk, idx) => ({
        researchId,
        sourceId,
        userId,
        text: chunk.text,
        chunkIndex: chunk.chunkIndex,
        embedding: embeddings[idx] || [],
        sectionTitle: chunk.sectionTitle || '',
      }));

      // 3. Perform fast bulk insertion into MongoDB
      const chunkDocuments = await EvidenceChunk.insertMany(docsToInsert, { ordered: false });

      logger.info(`Stored ${chunkDocuments.length} evidence chunks for source ${sourceId}`);
      return chunkDocuments;
    } catch (err) {
      logger.warn(`Failed to process chunk batch for source ${sourceId}: ${err.message}. Retrying individually...`);
      // Resilient fallback: store individually
      const fallbackDocs = [];
      for (const chunk of rawChunks) {
        try {
          const embedding = await geminiService.generateEmbedding(chunk.text);
          const doc = await EvidenceChunk.create({
            researchId,
            sourceId,
            userId,
            text: chunk.text,
            chunkIndex: chunk.chunkIndex,
            embedding,
            sectionTitle: chunk.sectionTitle || '',
          });
          fallbackDocs.push(doc);
        } catch (individualErr) {
          logger.warn(`Fallback chunk error: ${individualErr.message}`);
        }
      }
      return fallbackDocs;
    }
  }

  /**
   * Retrieves the most semantically relevant evidence chunks for a given query and research job.
   * Implements Atlas Vector Search if configured, with an exact in-memory cosine similarity fallback.
   *
   * @param {Object} options
   * @param {string} options.researchId
   * @param {string} options.userId
   * @param {string} options.query - The search query to match against evidence
   * @param {number} options.limit - Max passages to retrieve
   * @returns {Promise<Array<Object>>} Matching chunks with score and source details
   */
  async searchRelevantChunks({ researchId, userId, query, limit = 6 }) {
    try {
      const queryEmbedding = await geminiService.generateEmbedding(query);

      // Attempt MongoDB Atlas Vector Search first if index exists
      try {
        const atlasPipeline = [
          {
            $vectorSearch: {
              index: 'vector_index',
              path: 'embedding',
              queryVector: queryEmbedding,
              numCandidates: limit * 10,
              limit,
              filter: {
                researchId: { $eq: researchId },
                userId: { $eq: userId },
              },
            },
          },
          {
            $lookup: {
              from: 'sources',
              localField: 'sourceId',
              foreignField: '_id',
              as: 'source',
            },
          },
          { $unwind: { path: '$source', preserveNullAndEmptyArrays: true } },
        ];

        const results = await EvidenceChunk.aggregate(atlasPipeline);
        if (results && results.length > 0) {
          logger.info(`Retrieved ${results.length} chunks via Atlas Vector Search`);
          return results;
        }
      } catch (atlasErr) {
        // Documented fallback: when running on local MongoDB or without Atlas Vector Search index configured
        logger.debug('Atlas Vector Search not available or index not built. Using exact cosine similarity fallback.');
      }

      // Exact in-memory cosine similarity fallback
      const allChunks = await EvidenceChunk.find({ researchId, userId })
        .populate('sourceId', 'title url domain publishedAt')
        .lean();

      if (!allChunks || allChunks.length === 0) {
        return [];
      }

      const scored = allChunks
        .map((chunk) => {
          const score = chunk.embedding && chunk.embedding.length > 0
            ? cosineSimilarity(queryEmbedding, chunk.embedding)
            : 0;
          return {
            ...chunk,
            score,
            source: chunk.sourceId,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      logger.info(`Retrieved ${scored.length} chunks via in-memory vector similarity fallback for "${query}"`);
      return scored;
    } catch (err) {
      logger.error('Failed to search relevant chunks', err);
      return [];
    }
  }
}

export const embeddingService = new EmbeddingService();
