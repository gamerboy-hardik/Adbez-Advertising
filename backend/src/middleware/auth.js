const admin = require('../config/firebase');
const { getAuth } = require('firebase-admin/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Firebase Authentication Middleware with DB Sync
 * Validates Firebase ID Token from Authorization header.
 * Auto-syncs the user to the PostgreSQL DB so footprints and roles work.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'No authentication token provided.',
      });
    }

    const token = authHeader.slice(7);
    
    // Verify Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) {
      return res.status(401).json({ success: false, error: 'NO_EMAIL', message: 'Firebase token missing email.' });
    }

    // Check if user exists in our DB, if not create them
    try {
      const providerStr = decodedToken.firebase?.sign_in_provider === 'google.com' ? 'Google' : 'Email';
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';

      let dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email,
            passwordHash: 'FIREBASE_AUTH',
            role: ['admin@adbez.com', 'admin2@adbez.com', 'root@adbez.com'].includes(email.toLowerCase()) ? 'ADMIN' : 'CLIENT',
            provider: providerStr,
            lastLogin: new Date(),
            ipAddress: ip,
          }
        });
      } else {
        dbUser = await prisma.user.update({
          where: { email },
          data: {
            role: ['admin@adbez.com', 'admin2@adbez.com', 'root@adbez.com'].includes(email.toLowerCase()) ? 'ADMIN' : undefined,
            provider: providerStr,
            lastLogin: new Date(),
            ipAddress: ip,
          }
        });
      }

      // Attach our Postgres DB User to the request
      req.user = {
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      };
    } catch (dbErr) {
      // Postgres is offline, mock the user session so the frontend doesn't break
      console.warn('⚠️ Database is offline. Mocking user session for', email);
      req.user = {
        userId: 'mock-uuid-1234',
        email: email,
        role: ['admin@adbez.com', 'admin2@adbez.com', 'root@adbez.com'].includes(email.toLowerCase()) ? 'ADMIN' : 'CLIENT',
      };
    }

    next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Access token has expired. Please refresh your session.',
      });
    }
    console.error('Firebase Auth Error:', err);
    return res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid authentication token.',
    });
  }
}

/**
 * Optional auth — attaches user if token is valid, but doesn't block request.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decodedToken = await getAuth().verifyIdToken(token);
      const email = decodedToken.email;
      if (email) {
        let dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) {
          req.user = {
            userId: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
          };
        }
      }
    }
  } catch (_) {
    // Silently ignore — request continues as guest
  }
  next();
}

module.exports = { authenticate, optionalAuth };
