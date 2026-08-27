const Redis = require('ioredis');

let redisClient = null;

/**
 * Lazy-initialize Redis client.
 * Falls back gracefully if REDIS_URL is not configured.
 */
function getRedisClient() {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn('[REDIS] REDIS_URL not set — Redis features disabled. Falling back to in-memory/DB store.');
    return null;
  }

  redisClient = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
    reconnectOnError: (err) => {
      const targetErrors = ['READONLY', 'ECONNRESET'];
      return targetErrors.some(e => err.message.includes(e));
    },
  });

  redisClient.on('connect', () => console.log('[REDIS] Connected'));
  redisClient.on('error',   (err) => console.error('[REDIS] Error:', err.message));

  return redisClient;
}

/**
 * Set a key with optional TTL (seconds).
 */
async function redisSet(key, value, ttlSeconds = null) {
  const client = getRedisClient();
  if (!client) return false;
  try {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
    return true;
  } catch (err) {
    console.error('[REDIS] set error:', err.message);
    return false;
  }
}

/**
 * Get a key value.
 * Auto-parses JSON if possible.
 */
async function redisGet(key) {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const val = await client.get(key);
    if (!val) return null;
    try { return JSON.parse(val); } catch { return val; }
  } catch (err) {
    console.error('[REDIS] get error:', err.message);
    return null;
  }
}

/**
 * Delete one or more keys.
 */
async function redisDel(...keys) {
  const client = getRedisClient();
  if (!client) return false;
  try {
    await client.del(...keys);
    return true;
  } catch (err) {
    console.error('[REDIS] del error:', err.message);
    return false;
  }
}

/**
 * Check if a key exists.
 */
async function redisExists(key) {
  const client = getRedisClient();
  if (!client) return false;
  try {
    const result = await client.exists(key);
    return result === 1;
  } catch {
    return false;
  }
}

/**
 * Blacklist a refresh token in Redis (for logout/revocation).
 * TTL matches the refresh token expiry duration.
 */
async function blacklistRefreshToken(token, ttlSeconds = 7 * 24 * 60 * 60) {
  return redisSet(`blacklist:${token}`, '1', ttlSeconds);
}

/**
 * Check if a refresh token is blacklisted.
 */
async function isRefreshTokenBlacklisted(token) {
  return redisExists(`blacklist:${token}`);
}

/**
 * Cache user session data (wallet balance, role) for fast lookups.
 * TTL: 5 minutes.
 */
async function cacheUserSession(userId, data) {
  return redisSet(`session:${userId}`, data, 300);
}

/**
 * Get cached user session.
 */
async function getCachedUserSession(userId) {
  return redisGet(`session:${userId}`);
}

/**
 * Invalidate user session cache (call after wallet update, role change, etc.)
 */
async function invalidateUserSession(userId) {
  return redisDel(`session:${userId}`);
}

module.exports = {
  getRedisClient,
  redisSet, redisGet, redisDel, redisExists,
  blacklistRefreshToken, isRefreshTokenBlacklisted,
  cacheUserSession, getCachedUserSession, invalidateUserSession,
};
