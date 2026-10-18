const { redisSet, redisGet } = require('../utils/redis');

/**
 * Middleware to cache API responses in Redis.
 * @param {number} ttlSeconds - Time to live in seconds.
 */
function cacheResponse(ttlSeconds = 60) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl || req.url}`;
    
    try {
      const cachedData = await redisGet(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
    } catch (err) {
      console.error('[CACHE] Redis get error:', err);
    }

    // Intercept res.json to cache the response
    const originalJson = res.json;
    res.json = function (body) {
      res.json = originalJson; // Restore original to avoid loops
      
      // Cache the response body asynchronously
      redisSet(cacheKey, body, ttlSeconds).catch(err => 
        console.error('[CACHE] Redis set error:', err)
      );
      
      return res.json(body);
    };

    next();
  };
}

module.exports = { cacheResponse };
