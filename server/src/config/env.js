import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory first, then root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/research_ai',
  JWT_SECRET: process.env.JWT_SECRET || 'research_ai_development_jwt_secret_min_32_chars_long_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',

  // Groq API (High-Performance Fast AI Reasoning Engine)
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  GROQ_FAST_MODEL: process.env.GROQ_FAST_MODEL || 'qwen/qwen3.8-27b',

  // Google Gemini API (Optional Fallback)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  GEMINI_PREMIUM_MODEL: process.env.GEMINI_PREMIUM_MODEL || 'gemini-3.8-flash',
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',

  // Tavily Search API
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',

  // Research Budgets & Limits
  DEFAULT_MAX_ROUNDS: parseInt(process.env.DEFAULT_MAX_ROUNDS || '3', 10),
  DEFAULT_MAX_SOURCES: parseInt(process.env.DEFAULT_MAX_SOURCES || '10', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

export const validateEnv = () => {
  const warnings = [];
  if (!env.GROQ_API_KEY && !env.GEMINI_API_KEY) {
    warnings.push('GROQ_API_KEY is not set. Real AI generation will require this key.');
  }
  if (!env.TAVILY_API_KEY) {
    warnings.push('TAVILY_API_KEY is not set. Live web searches will require this key.');
  }
  if (env.NODE_ENV === 'production' && env.JWT_SECRET.includes('development')) {
    throw new Error('FATAL: Using development JWT_SECRET in production is not allowed.');
  }
  return { valid: true, warnings };
};
