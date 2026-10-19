import { Router } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { geminiService } from '../services/gemini.service.js';
import { tavilyService } from '../services/tavily.service.js';

const router = Router();

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Research AI API',
    environment: env.NODE_ENV,
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'research_ai',
    },
    providers: {
      gemini: {
        configured: geminiService.isConfigured(),
        model: env.GEMINI_MODEL,
        embeddingModel: env.GEMINI_EMBEDDING_MODEL,
      },
      tavily: {
        configured: tavilyService.isConfigured(),
      },
    },
    uptime: process.uptime(),
  });
});

export default router;
