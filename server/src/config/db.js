import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let memoryServer = null;

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    logger.info('Attempting to connect to MongoDB...', { uri: env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') });

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('Connected to MongoDB successfully');
    return mongoose.connection;
  } catch (err) {
    logger.warn('Direct MongoDB connection failed', { error: err.message });

    if (env.NODE_ENV !== 'production') {
      try {
        logger.info('Starting MongoMemoryServer as fallback for development/testing...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();

        await mongoose.connect(memoryUri);
        logger.info('Connected to MongoMemoryServer fallback successfully', { memoryUri });
        return mongoose.connection;
      } catch (memErr) {
        logger.error('Failed to start MongoMemoryServer fallback', memErr);
        throw memErr;
      }
    } else {
      logger.error('Could not connect to MongoDB in production mode', err);
      throw err;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    logger.info('Disconnected from database');
  } catch (err) {
    logger.error('Error disconnecting from database', err);
  }
};
