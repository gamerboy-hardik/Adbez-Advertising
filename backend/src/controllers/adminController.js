const { PrismaClient } = require('@prisma/client');
const { encryptJSON, encrypt } = require('../utils/encryption');
const { validationResult } = require('express-validator');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── INVENTORY ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/accounts
 * All accounts with full details (including encrypted credential status).
 */
async function getAllAccounts(req, res) {
  try {
    const { status, category, platform, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (platform) where.platform = platform.toUpperCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100);

    const [accounts, total] = await Promise.all([
      prisma.adAccount.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, platform: true, category: true, profileName: true, country: true,
          countryFlag: true, spendingLimit: true, ageMonths: true, price: true,
          status: true, features: true, description: true, isFeatured: true, createdAt: true,
          // Show presence (not value) of encrypted fields
          credentialsJson: false,
          _count: false,
        },
      }),
      prisma.adAccount.count({ where }),
    ]);

    // Annotate with credential presence
    const accountsRaw = await prisma.adAccount.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const annotated = accountsRaw.map(a => ({
      id: a.id, platform: a.platform, category: a.category, profileName: a.profileName,
      country: a.country, countryFlag: a.countryFlag, spendingLimit: a.spendingLimit,
      ageMonths: a.ageMonths, price: a.price, status: a.status, features: a.features,
      description: a.description, isFeatured: a.isFeatured, createdAt: a.createdAt,
      hasCredentials: !!a.credentialsJson,
      hasProxy: !!a.proxyDetails,
      hasCookie: !!a.cookieFile,
      hasRecovery: !!a.recoveryFile,
    }));

    return res.json({
      success: true,
      data: { accounts: annotated, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } },
    });
  } catch (err) {
    console.error('[ADMIN] getAllAccounts error:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

/**
 * POST /api/admin/accounts
 * Create a new ad account with encrypted credentials.
 */
async function createAccount(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const {
      platform, category, profileName, country, countryFlag, spendingLimit,
      ageMonths, price, features, description, isFeatured,
      credentials, proxyDetails, cookieFile, recoveryFile,
    } = req.body;

    const account = await prisma.adAccount.create({
      data: {
        platform: platform.toUpperCase(),
        category,
        profileName,
        country: country?.toUpperCase(),
        countryFlag,
        spendingLimit: spendingLimit ? parseFloat(spendingLimit) : null,
        ageMonths: ageMonths ? parseInt(ageMonths) : null,
        price: parseFloat(price),
        features: features || [],
        description,
        isFeatured: !!isFeatured,
        credentialsJson: credentials ? encryptJSON(credentials) : null,
        proxyDetails: proxyDetails ? encrypt(proxyDetails) : null,
        cookieFile: cookieFile ? encrypt(cookieFile) : null,
        recoveryFile: recoveryFile ? encrypt(recoveryFile) : null,
        status: 'AVAILABLE',
      },
    });

    return res.status(201).json({ success: true, data: { account: { id: account.id, ...account, credentialsJson: undefined, proxyDetails: undefined } } });
  } catch (err) {
    console.error('[ADMIN] createAccount error:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

/**
 * PUT /api/admin/accounts/:id
 * Update an existing account.
 */
async function updateAccount(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.adAccount.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: 'NOT_FOUND' });

    const {
      platform, category, profileName, country, countryFlag, spendingLimit,
      ageMonths, price, status, features, description, isFeatured,
      credentials, proxyDetails, cookieFile, recoveryFile,
    } = req.body;

    const updated = await prisma.adAccount.update({
      where: { id },
      data: {
        ...(platform && { platform: platform.toUpperCase() }),
        ...(category && { category }),
        ...(profileName && { profileName }),
        ...(country && { country: country.toUpperCase() }),
        ...(countryFlag !== undefined && { countryFlag }),
        ...(spendingLimit !== undefined && { spendingLimit: parseFloat(spendingLimit) }),
        ...(ageMonths !== undefined && { ageMonths: parseInt(ageMonths) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(status && { status }),
        ...(features && { features }),
        ...(description !== undefined && { description }),
        ...(isFeatured !== undefined && { isFeatured: !!isFeatured }),
        ...(credentials && { credentialsJson: encryptJSON(credentials) }),
        ...(proxyDetails && { proxyDetails: encrypt(proxyDetails) }),
        ...(cookieFile && { cookieFile: encrypt(cookieFile) }),
        ...(recoveryFile && { recoveryFile: encrypt(recoveryFile) }),
      },
    });

    return res.json({ success: true, data: { account: { id: updated.id, status: updated.status, price: updated.price, profileName: updated.profileName } } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

/**
 * DELETE /api/admin/accounts/:id
 */
async function deleteAccount(req, res) {
  try {
    await prisma.adAccount.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Account deleted.' });
  } catch (err) {
    return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  }
}

/**
 * POST /api/admin/accounts/import
 * Mass import from CSV or JSON body.
 */
async function importAccounts(req, res) {
  try {
    const { accounts } = req.body;
    if (!Array.isArray(accounts) || accounts.length === 0) {
      return res.status(400).json({ success: false, error: 'INVALID_INPUT', message: 'Provide an accounts array.' });
    }

    const toCreate = accounts.map(a => ({
      platform: (a.platform || '').toUpperCase(),
      category: a.category || 'ad-accounts',
      profileName: a.profileName || a.profile_name || 'Unnamed',
      country: a.country?.toUpperCase() || null,
      countryFlag: a.countryFlag || a.country_flag || null,
      spendingLimit: a.spendingLimit ? parseFloat(a.spendingLimit) : null,
      ageMonths: a.ageMonths ? parseInt(a.ageMonths) : null,
      price: parseFloat(a.price) || 0,
      features: a.features || [],
      description: a.description || null,
      credentialsJson: a.credentials ? encryptJSON(a.credentials) : null,
      proxyDetails: a.proxyDetails ? encrypt(a.proxyDetails) : null,
      status: 'AVAILABLE',
    }));

    const result = await prisma.adAccount.createMany({ data: toCreate });
    return res.status(201).json({ success: true, message: `Imported ${result.count} accounts.`, data: { count: result.count } });
  } catch (err) {
    console.error('[ADMIN] import error:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

async function getAllTransactions(req, res) {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const where = status ? { paymentStatus: status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true } },
          items: {
            include: {
              adAccount: { select: { id: true, profileName: true, platform: true, country: true } },
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return res.json({
      success: true,
      data: { transactions, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

async function updateTransactionStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'COMPLETED', 'FLAGGED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'INVALID_STATUS' });
    }

    const updated = await prisma.transaction.update({
      where: { id: req.params.id },
      data: { paymentStatus: status },
    });

    return res.json({ success: true, data: { id: updated.id, paymentStatus: updated.paymentStatus } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

// ─── FOOTPRINT MONITOR ────────────────────────────────────────────────────────

async function getFootprintLogs(req, res) {
  try {
    const { action, page = 1, limit = 100, vpnOnly } = req.query;
    const where = {};
    if (action) where.actionPerformed = action;
    if (vpnOnly === 'true') where.vpnDetected = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 200);

    const [logs, total] = await Promise.all([
      prisma.footprintLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true } } },
      }),
      prisma.footprintLog.count({ where }),
    ]);

    // Detect anomalies: same canvas hash from multiple IPs
    const hashGroups = {};
    logs.forEach(log => {
      if (log.canvasHash) {
        if (!hashGroups[log.canvasHash]) hashGroups[log.canvasHash] = new Set();
        if (log.ipAddress) hashGroups[log.canvasHash].add(log.ipAddress);
      }
    });

    const annotated = logs.map(log => ({
      ...log,
      anomaly: log.canvasHash && hashGroups[log.canvasHash]?.size > 1,
    }));

    return res.json({
      success: true,
      data: { logs: annotated, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

// ─── USERS ────────────────────────────────────────────────────────────────────

async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, walletBalance: true, provider: true, lastLogin: true, ipAddress: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: { users } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

async function updateUserWallet(req, res) {
  try {
    const { amount } = req.body;
    if (isNaN(amount)) return res.status(400).json({ success: false, error: 'INVALID_AMOUNT' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { walletBalance: { increment: parseFloat(amount) } },
      select: { id: true, email: true, walletBalance: true },
    });
    return res.json({ success: true, data: { user } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

async function getDashboardStats(req, res) {
  try {
    const [totalAccounts, availableAccounts, soldAccounts, totalTransactions, completedRevenue, totalUsers, recentTransactions] = await Promise.all([
      prisma.adAccount.count(),
      prisma.adAccount.count({ where: { status: 'AVAILABLE' } }),
      prisma.adAccount.count({ where: { status: 'SOLD' } }),
      prisma.transaction.count(),
      prisma.transaction.aggregate({ where: { paymentStatus: 'COMPLETED' }, _sum: { totalAmount: true } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        stats: {
          totalAccounts,
          availableAccounts,
          soldAccounts,
          totalTransactions,
          completedRevenue: completedRevenue._sum.totalAmount || 0,
          totalUsers,
        },
        recentTransactions,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

module.exports = {
  getAllAccounts, createAccount, updateAccount, deleteAccount, importAccounts,
  getAllTransactions, updateTransactionStatus,
  getFootprintLogs,
  getAllUsers, updateUserWallet,
  getDashboardStats,
};
