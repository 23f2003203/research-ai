import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled error during ${req.method} ${req.url}`, err);

  // Handle Zod schema validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `An account or record with this ${field} already exists.`,
    });
  }

  // Default internal server error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred',
    ...(env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};
