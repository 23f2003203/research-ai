import { env } from './env.js';

export const MODEL_CONFIG = {
  mainModel: env.GEMINI_MODEL,
  premiumModel: env.GEMINI_PREMIUM_MODEL,
  embeddingModel: env.GEMINI_EMBEDDING_MODEL,

  agentSettings: {
    planner: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
    analyst: {
      temperature: 0.1,
      maxOutputTokens: 3072,
    },
    critic: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
    reportWriter: {
      temperature: 0.3,
      maxOutputTokens: 6144,
    },
    citationVerifier: {
      temperature: 0.0,
      maxOutputTokens: 2048,
    },
  },

  budgets: {
    maxRounds: env.DEFAULT_MAX_ROUNDS,
    maxSourcesTotal: env.DEFAULT_MAX_SOURCES,
    maxSourcesPerRound: 6,
    maxSearchQueriesPerRound: 4,
    maxExtractedTextLength: 20000, // characters per source page
    chunkSize: 700, // characters / approximate tokens
    chunkOverlap: 100,
  },
};
