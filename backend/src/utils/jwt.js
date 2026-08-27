const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Signs a JWT access token (short-lived).
 * @param {object} payload - { userId, email, role }
 * @returns {string} signed JWT
 */
function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'adbez-systems',
    audience: 'adbez-client',
  });
}

/**
 * Signs a JWT refresh token (long-lived).
 * @param {object} payload - { userId }
 * @returns {string} signed JWT
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'adbez-systems',
    audience: 'adbez-client',
  });
}

/**
 * Verifies and decodes an access token.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'adbez-systems',
    audience: 'adbez-client',
  });
}

/**
 * Verifies and decodes a refresh token.
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'adbez-systems',
    audience: 'adbez-client',
  });
}

/**
 * Decodes a token WITHOUT verifying (for logging/debugging only).
 * @param {string} token
 * @returns {object|null}
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, decodeToken };
