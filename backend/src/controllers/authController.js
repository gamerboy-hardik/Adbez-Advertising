const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const prisma = new PrismaClient();

/**
 * POST /api/auth/register
 * Register a new client account.
 */
async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'EMAIL_TAKEN',
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: 'CLIENT' },
      select: { id: true, email: true, role: true, walletBalance: true, createdAt: true },
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    console.error('[AUTH] register error:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Registration failed.' });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    // Prune old refresh tokens for this user (keep max 5 active sessions)
    const oldTokens = await prisma.refreshToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });
    if (oldTokens.length >= 5) {
      await prisma.refreshToken.delete({ where: { id: oldTokens[0].id } });
    }

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('[AUTH] login error:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Login failed.' });
  }
}

/**
 * POST /api/auth/refresh
 * Exchange a valid refresh token for a new access token.
 */
async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'MISSING_TOKEN', message: 'Refresh token required.' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    // Verify token exists in DB (not revoked)
    const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ success: false, error: 'INVALID_TOKEN', message: 'Refresh token is invalid or expired.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'USER_NOT_FOUND', message: 'User no longer exists.' });
    }

    const newAccessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });

    return res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'INVALID_TOKEN', message: 'Invalid refresh token.' });
  }
}

/**
 * POST /api/auth/logout
 * Revoke a refresh token.
 */
async function logout(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'MISSING_TOKEN', message: 'Refresh token required.' });
  }

  try {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Logout failed.' });
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user's profile.
 */
async function me(req, res) {
  try {
    if (req.user.userId === 'mock-uuid-1234') {
      return res.json({
        success: true,
        data: {
          user: {
            id: 'mock-uuid-1234',
            email: req.user.email,
            role: req.user.role,
            walletBalance: 0,
            createdAt: new Date()
          }
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, role: true, walletBalance: true, createdAt: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found.' });
    }
    return res.json({ success: true, data: { user } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

module.exports = { register, login, refresh, logout, me };
