import { env } from '../config/env.js';
import { MODEL_CONFIG } from '../config/models.js';
import { logger } from '../utils/logger.js';
import { hashText } from '../utils/text.js';

// In-memory cache for embeddings to prevent redundant API calls
const embeddingCache = new Map();

/**
 * Helper to normalize and map deprecated or prefixed model names
 */
function normalizeModelName(model, type = 'generate') {
  let clean = (model || '').replace(/^models\//, '').trim();
  if (type === 'embed') {
    if (!clean || clean.startsWith('text-embedding') || clean === 'embedding-001') {
      return 'gemini-embedding-001';
    }
    return clean;
  }
  if (!clean || clean === 'gemini-2.5-flash' || clean.startsWith('gemini-1.5')) {
    return 'gemini-3.8-flash';
  }
  return clean;
}

/**
 * Robust Google Gemini API client service
 */
class GeminiService {
  constructor() {
    this.apiKey = env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Generates content from Gemini with retry and exponential backoff
   */
  async generateContent({
    prompt,
    systemInstruction = '',
    model = MODEL_CONFIG.mainModel,
    temperature = 0.2,
    maxOutputTokens = 2048,
    jsonMode = true,
    retries = 3,
  }) {
    if (!this.isConfigured()) {
      throw new Error(
        'Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.'
      );
    }

    const cleanModel = normalizeModelName(model, 'generate');
    const endpoint = `${this.baseUrl}/models/${cleanModel}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    let delay = 1000;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errMsg = errorData.error?.message || response.statusText;

          // Rate limit or quota error
          if (response.status === 429) {
            logger.warn(`Gemini rate limited (attempt ${attempt}/${retries}). Backing off ${delay}ms...`);
            if (attempt < retries) {
              await new Promise((r) => setTimeout(r, delay));
              delay *= 2;
              continue;
            }
          }

          throw new Error(`Gemini API Error [${response.status}]: ${errMsg}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (!text) {
          throw new Error('Gemini returned an empty response candidate');
        }

        if (jsonMode) {
          try {
            // Clean markdown code blocks if model wrapped json in ```json ... ```
            const cleanJson = text
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();
            return JSON.parse(cleanJson);
          } catch (parseErr) {
            logger.warn('Failed to parse Gemini JSON output directly, attempting fallback extraction', { text: text.slice(0, 300) });
            // Fallback: extract first JSON object or array match
            const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (match) {
              return JSON.parse(match[0]);
            }
            throw new Error(`Invalid JSON returned by Gemini: ${parseErr.message}`);
          }
        }

        return text;
      } catch (err) {
        if (attempt === retries) {
          logger.error('Gemini generation failed after retries', err);
          throw err;
        }
        logger.warn(`Gemini attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }

  /**
   * Generates embedding vector for a given text snippet with caching
   */
  async generateEmbedding(text, model = MODEL_CONFIG.embeddingModel) {
    if (!text || typeof text !== 'string') return this._generateDeterministicPseudoVector('', 768);

    const textHash = hashText(text);
    if (embeddingCache.has(textHash)) {
      return embeddingCache.get(textHash);
    }

    if (!this.isConfigured()) {
      const pseudoVector = this._generateDeterministicPseudoVector(text, 768);
      embeddingCache.set(textHash, pseudoVector);
      return pseudoVector;
    }

    const cleanModel = normalizeModelName(model, 'embed');
    const endpoint = `${this.baseUrl}/models/${cleanModel}:embedContent?key=${this.apiKey}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${cleanModel}`,
          content: {
            parts: [{ text: text.slice(0, 4000) }],
          },
          outputDimensionality: 768,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Embedding API error [${response.status}]: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const vector = data.embedding?.values;
      if (!vector || !Array.isArray(vector)) {
        throw new Error('Gemini embedding response missing values');
      }

      embeddingCache.set(textHash, vector);
      return vector;
    } catch (err) {
      logger.warn(`Failed to generate real embedding with ${cleanModel}: ${err.message}. Using resilient fallback vector.`);
      const fallbackVector = this._generateDeterministicPseudoVector(text, 768);
      embeddingCache.set(textHash, fallbackVector);
      return fallbackVector;
    }
  }

  /**
   * Generates embedding vectors for a batch of text snippets using batchEmbedContents
   */
  async generateBatchEmbeddings(texts, model = MODEL_CONFIG.embeddingModel) {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    const cleanModel = normalizeModelName(model, 'embed');
    const results = new Array(texts.length);
    const unindexed = [];

    // Check cache first
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text || typeof text !== 'string') {
        results[i] = this._generateDeterministicPseudoVector('', 768);
        continue;
      }
      const textHash = hashText(text);
      if (embeddingCache.has(textHash)) {
        results[i] = embeddingCache.get(textHash);
      } else {
        unindexed.push({ index: i, text, hash: textHash });
      }
    }

    if (unindexed.length === 0) {
      return results;
    }

    if (!this.isConfigured()) {
      for (const item of unindexed) {
        const pseudoVector = this._generateDeterministicPseudoVector(item.text, 768);
        embeddingCache.set(item.hash, pseudoVector);
        results[item.index] = pseudoVector;
      }
      return results;
    }

    // Process in batches of up to 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < unindexed.length; i += BATCH_SIZE) {
      const slice = unindexed.slice(i, i + BATCH_SIZE);
      const endpoint = `${this.baseUrl}/models/${cleanModel}:batchEmbedContents?key=${this.apiKey}`;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: slice.map((item) => ({
              model: `models/${cleanModel}`,
              content: { parts: [{ text: item.text.slice(0, 4000) }] },
              outputDimensionality: 768,
            })),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Batch Embedding error [${response.status}]: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const embeddings = data.embeddings || [];

        for (let j = 0; j < slice.length; j++) {
          const item = slice[j];
          const vector = embeddings[j]?.values;
          if (vector && Array.isArray(vector)) {
            embeddingCache.set(item.hash, vector);
            results[item.index] = vector;
          } else {
            const fallback = this._generateDeterministicPseudoVector(item.text, 768);
            embeddingCache.set(item.hash, fallback);
            results[item.index] = fallback;
          }
        }
      } catch (err) {
        logger.warn(`Batch embedding call failed (${err.message}), using resilient fallback vectors`);
        for (const item of slice) {
          const fallback = this._generateDeterministicPseudoVector(item.text, 768);
          embeddingCache.set(item.hash, fallback);
          results[item.index] = fallback;
        }
      }
    }

    return results;
  }

  /**
   * Deterministic normalized vector generator for offline fallback/testing
   */
  _generateDeterministicPseudoVector(text, dimensions = 768) {
    const vector = new Array(dimensions).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * (i + 1) * 31) % dimensions;
      vector[index] += Math.sin(charCode);
    }
    // Normalize
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return norm > 0 ? vector.map((val) => val / norm) : vector;
  }
}

export const geminiService = new GeminiService();
