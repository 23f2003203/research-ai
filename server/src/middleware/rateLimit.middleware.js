import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

export const researchCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 research creations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Research creation rate limit exceeded. Please wait a moment before starting new research.',
  },
});
