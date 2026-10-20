import { env } from '../config/env.js';
import { MODEL_CONFIG } from '../config/models.js';
import { logger } from '../utils/logger.js';
import { hashText } from '../utils/text.js';

// In-memory cache for embeddings to prevent redundant computations
const embeddingCache = new Map();

/**
 * Normalizes model names to active Groq models
 */
function normalizeGroqModel(model) {
  if (!model) return 'openai/gpt-oss-120b';
  const clean = model.trim();
  // Map legacy names or nonexistent models to the flagship Groq model
  if (
    clean.includes('gemini') ||
    clean.includes('llama-3.3') ||
    clean.includes('llama-3.1') ||
    clean === 'openai/gpt-oss-120b'
  ) {
    return 'openai/gpt-oss-120b';
  }
  return clean;
}

/**
 * High-Performance Groq API Client Service
 */
export class GroqService {
  constructor() {
    this.apiKey = env.GROQ_API_KEY;
    this.baseUrl = 'https://api.groq.com/openai/v1';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Generates content from Groq with retry and exponential backoff
   */
  async generateContent({
    prompt,
    systemInstruction = '',
    model = MODEL_CONFIG.mainModel,
    temperature = 0.2,
    maxOutputTokens = 4096,
    jsonMode = true,
    retries = 3,
  }) {
    if (!this.isConfigured()) {
      throw new Error(
        'Groq API key is not configured. Please add GROQ_API_KEY to your environment variables.'
      );
    }

    const cleanModel = normalizeGroqModel(model);
    const endpoint = `${this.baseUrl}/chat/completions`;

    const messages = [];
    if (systemInstruction && systemInstruction.trim()) {
      messages.push({
        role: 'system',
        content: systemInstruction.trim(),
      });
    }
    messages.push({
      role: 'user',
      content: prompt,
    });

    const body = {
      model: cleanModel,
      messages,
      temperature,
      max_tokens: maxOutputTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };

    let delay = 1000;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errMsg = errorData.error?.message || response.statusText;

          // Rate limit or quota error backoff
          if (response.status === 429) {
            logger.warn(`Groq rate limited (attempt ${attempt}/${retries}). Backing off ${delay}ms...`);
            if (attempt < retries) {
              await new Promise((r) => setTimeout(r, delay));
              delay *= 2;
              continue;
            }
          }

          throw new Error(`Groq API Error [${response.status}]: ${errMsg}`);
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const text = choice?.message?.content;

        if (!text) {
          throw new Error('Groq returned an empty response candidate');
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
            logger.warn('Failed to parse Groq JSON output directly, attempting fallback extraction', {
              text: text.slice(0, 300),
            });
            // Fallback: extract first JSON object or array match
            const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (match) {
              return JSON.parse(match[0]);
            }
            throw new Error(`Invalid JSON returned by Groq: ${parseErr.message}`);
          }
        }

        return text;
      } catch (err) {
        if (attempt === retries) {
          logger.error('Groq generation failed after retries', err);
          throw err;
        }
        logger.warn(`Groq attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }

  /**
   * Generates embedding vector for a given text snippet with caching
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') return this._generateDeterministicPseudoVector('', 768);

    const textHash = hashText(text);
    if (embeddingCache.has(textHash)) {
      return embeddingCache.get(textHash);
    }

    const vector = this._generateDeterministicPseudoVector(text, 768);
    embeddingCache.set(textHash, vector);
    return vector;
  }

  /**
   * Generates embedding vectors for a batch of text snippets
   */
  async generateBatchEmbeddings(texts) {
    if (!Array.isArray(texts) || texts.length === 0) return [];
    return Promise.all(texts.map((text) => this.generateEmbedding(text)));
  }

  /**
   * Deterministic normalized vector generator for embeddings and similarity
   */
  _generateDeterministicPseudoVector(text, dimensions = 768) {
    const vector = new Array(dimensions).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * (i + 1) * 31) % dimensions;
      vector[index] += Math.sin(charCode);
    }
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return norm > 0 ? vector.map((val) => val / norm) : vector;
  }
}

export const groqService = new GroqService();
export const geminiService = groqService;
