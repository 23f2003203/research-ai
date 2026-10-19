import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env, validateEnv } from './config/env.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    const { warnings } = validateEnv();
    for (const w of warnings) {
      logger.warn(w);
    }

    // Connect to database
    await connectDB();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`Research AI Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`Client URL allowed: ${env.CLIENT_URL}`);
    });

    // Graceful termination handling
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('Server and database closed. Process terminating.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

bootstrap();
