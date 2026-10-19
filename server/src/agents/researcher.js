import { tavilyService } from '../services/tavily.service.js';
import { extractionService } from '../services/extraction.service.js';
import { embeddingService } from '../services/embedding.service.js';
import { Source } from '../models/Source.js';
import { ResearchJob } from '../models/ResearchJob.js';
import { emitResearchEvent } from '../services/sse.service.js';
import { AGENT_EVENT_TYPES, RESEARCH_STATUSES } from '../../../shared/constants/research.js';
import { logger } from '../utils/logger.js';
import { MODEL_CONFIG } from '../config/models.js';

export async function runResearcherAgent(state) {
  const { researchId, userId, searchQueries, round = 0, maxSources = 10, configuration } = state;
  const currentRound = round + 1;
  logger.info(`[Agent:Researcher] Starting round ${currentRound} with ${searchQueries.length} queries`);

  await ResearchJob.findByIdAndUpdate(researchId, {
    status: RESEARCH_STATUSES.RESEARCHING,
    currentStep: `Round ${currentRound}: Executing web discovery across ${searchQueries.length} search queries`,
    roundCount: currentRound,
  });

  await emitResearchEvent(researchId, userId, {
    eventType: AGENT_EVENT_TYPES.SEARCH_STARTED,
    stage: 'researching',
    message: `Executing round ${currentRound} web searches for ${searchQueries.length} queries`,
    metadata: { round: currentRound, queries: searchQueries },
  });

  // Check how many sources we already have
  const existingSourceCount = await Source.countDocuments({ researchId, userId });
  const remainingBudget = Math.max(0, maxSources - existingSourceCount);

  if (remainingBudget === 0) {
    logger.info('[Agent:Researcher] Max source budget reached. Proceeding to analysis.');
    return { round: currentRound, status: RESEARCH_STATUSES.ANALYZING };
  }

  const queriesToRun = searchQueries.slice(0, MODEL_CONFIG.budgets.maxSearchQueriesPerRound);
  const discoveredResults = [];
  const existingSources = await Source.find({ researchId, userId }).select('canonicalUrl').lean();
  const seenCanonicalUrls = new Set(existingSources.map((s) => s.canonicalUrl));

  // 1. Execute live searches across queries
  for (const query of queriesToRun) {
    try {
      if (tavilyService.isConfigured()) {
        const results = await tavilyService.search({
          query,
          maxResults: Math.min(remainingBudget, 4),
          includeDomains: configuration?.preferredDomains || [],
          excludeDomains: configuration?.excludedDomains || [],
        });

        for (const res of results) {
          if (!seenCanonicalUrls.has(res.canonicalUrl)) {
            seenCanonicalUrls.add(res.canonicalUrl);
            discoveredResults.push(res);
          }
        }
      } else {
        logger.warn('Tavily is not configured; live web search is paused for this query.');
      }
    } catch (err) {
      logger.warn(`Search failed for query "${query}": ${err.message}`);
    }
  }

  await emitResearchEvent(researchId, userId, {
    eventType: AGENT_EVENT_TYPES.SOURCES_DISCOVERED,
    stage: 'researching',
    message: `Discovered ${discoveredResults.length} new unique candidate sources across the web`,
    metadata: { count: discoveredResults.length, round: currentRound },
  });

  // 2. Extract pages & embed chunks
  const newSourcesSaved = [];
  const sourcesToProcess = discoveredResults.slice(0, remainingBudget);

  for (const candidate of sourcesToProcess) {
    try {
      const extracted = await extractionService.extractPage(candidate.canonicalUrl);

      // Save Source in DB idempotently to avoid duplicate key errors
      const sourceDoc = await Source.findOneAndUpdate(
        { researchId, canonicalUrl: candidate.canonicalUrl },
        {
          $setOnInsert: {
            researchId,
            userId,
            url: candidate.url,
            canonicalUrl: candidate.canonicalUrl,
            title: extracted.title || candidate.title,
            domain: candidate.domain,
            publishedAt: extracted.publishedAt || candidate.publishedDate || null,
            retrievedAt: new Date(),
            contentHash: extracted.contentHash || '',
            extractedText: extracted.extractedText || candidate.snippet || '',
            qualitySignals: extracted.qualitySignals || { relevanceScore: candidate.score || 0.8 },
            extractionStatus: extracted.status === 'failed' ? 'failed' : 'success',
          },
        },
        { upsert: true, new: true }
      );

      newSourcesSaved.push(sourceDoc);

      // Process and store evidence chunks for RAG if text exists
      const textToChunk = extracted.extractedText || candidate.snippet;
      if (textToChunk && textToChunk.trim().length > 0) {
        await embeddingService.processAndStoreChunks({
          researchId,
          sourceId: sourceDoc._id,
          userId,
          text: textToChunk,
        });
      }

      await emitResearchEvent(researchId, userId, {
        eventType: AGENT_EVENT_TYPES.SOURCE_EXTRACTED,
        stage: 'researching',
        message: `Extracted content from ${sourceDoc.domain} ("${sourceDoc.title.slice(0, 50)}")`,
        metadata: {
          sourceId: sourceDoc._id,
          title: sourceDoc.title,
          domain: sourceDoc.domain,
          wordCount: sourceDoc.qualitySignals?.wordCount || 0,
        },
      });
    } catch (err) {
      logger.error(`Error processing candidate ${candidate.canonicalUrl}`, err);
    }
  }

  const totalSourceCount = await Source.countDocuments({ researchId, userId });
  await ResearchJob.findByIdAndUpdate(researchId, {
    sourceCount: totalSourceCount,
    currentStep: `Completed round ${currentRound} research: ${totalSourceCount} authoritative sources indexed`,
  });

  return {
    round: currentRound,
    sources: newSourcesSaved,
    status: RESEARCH_STATUSES.ANALYZING,
  };
}
