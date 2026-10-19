import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import researchRoutes from './routes/research.routes.js';
import healthRoutes from './routes/health.routes.js';

export const createApp = () => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible development and Vite client proxying
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body and cookie parsing
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());

  // API Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/research', researchRoutes);

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
};
