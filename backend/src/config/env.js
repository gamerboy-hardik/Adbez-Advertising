require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5500').split(',').map(s => s.trim()),
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY,
  },

  rateLimit: {
    auth: {
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    },
    api: {
      max: parseInt(process.env.API_RATE_LIMIT_MAX) || 100,
      windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 60 * 1000,
    },
  },
};

// Validate critical secrets at startup
const required = [
  ['JWT_ACCESS_SECRET', config.jwt.accessSecret],
  ['JWT_REFRESH_SECRET', config.jwt.refreshSecret],
  ['ENCRYPTION_KEY', config.encryption.key],
];

for (const [name, value] of required) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Copy .env.example to .env and fill in all values.`);
  }
}

module.exports = config;
