const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'jwt_secret',
  'token',
  'apiKey',
  'api_key',
  'groq_api_key',
  'gemini_api_key',
  'tavily_api_key',
  'authorization',
  'cookie',
];

function redactSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? JSON.stringify(redactSensitiveData(meta)) : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? JSON.stringify(redactSensitiveData(meta)) : '');
  },
  error: (message, error = {}) => {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, JSON.stringify(redactSensitiveData(errorDetails)));
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? JSON.stringify(redactSensitiveData(meta)) : '');
    }
  },
};
