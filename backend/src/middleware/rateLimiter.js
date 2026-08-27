const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * Strict rate limiter for authentication endpoints.
 * Prevents brute-force attacks on login/register.
 * Default: 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
  },
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind a proxy, fallback to remote IP
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  },
});

/**
 * General API rate limiter.
 * Default: 100 requests per minute per IP.
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.api.windowMs,
  max: config.rateLimit.api.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many requests. Please slow down.',
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  },
});

/**
 * Strict limiter for footprint logging (to prevent log flooding).
 * 30 requests per minute per IP.
 */
const footprintLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Footprint log rate limit exceeded.',
  },
});

module.exports = { authLimiter, apiLimiter, footprintLimiter };
