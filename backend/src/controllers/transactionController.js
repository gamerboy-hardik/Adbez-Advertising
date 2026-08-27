const { PrismaClient } = require('@prisma/client');
const { decryptJSON, decrypt } = require('../utils/encryption');

const prisma = new PrismaClient();

/**
 * POST /api/transactions/checkout
 * Processes a wallet-based checkout for one or more ad accounts.
 * Deducts from user wallet and marks accounts as SOLD.
 */
async function checkout(req, res) {
  const { accountIds } = req.body;

  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    return res.status(400).json({ success: false, error: 'INVALID_INPUT', message: 'accountIds must be a non-empty array.' });
  }
  if (accountIds.length > 50) {
    return res.status(400).json({ success: false, error: 'INVALID_INPUT', message: 'Maximum 50 accounts per transaction.' });
  }

  try {
    // Fetch all requested accounts in a single query
    const accounts = await prisma.adAccount.findMany({
      where: { id: { in: accountIds }, status: 'AVAILABLE' },
    });

    if (accounts.length !== accountIds.length) {
      const foundIds = accounts.map(a => a.id);
      const missing = accountIds.filter(id => !foundIds.includes(id));
      return res.status(409).json({
        success: false,
        error: 'ACCOUNTS_UNAVAILABLE',
        message: `Some accounts are no longer available: ${missing.join(', ')}`,
      });
    }

    const totalAmount = accounts.reduce((sum, a) => sum + a.price, 0);

    // Volume discount
    let discount = 0;
    if (accounts.length >= 10) discount = 0.10;
    else if (accounts.length >= 5) discount = 0.05;
    const discountedTotal = parseFloat((totalAmount * (1 - discount)).toFixed(2));

    // Check wallet balance
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (user.walletBalance < discountedTotal) {
      return res.status(402).json({
        success: false,
        error: 'INSUFFICIENT_BALANCE',
        message: `Insufficient wallet balance. Required: $${discountedTotal.toFixed(2)}, Available: $${user.walletBalance.toFixed(2)}`,
      });
    }

    // Execute everything atomically in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: req.user.userId,
          totalAmount: discountedTotal,
          paymentStatus: 'COMPLETED',
          paymentMethod: 'WALLET',
          items: {
            create: accounts.map(a => ({
              adAccountId: a.id,
              price: a.price,
            })),
          },
        },
        include: { items: true },
      });

      // Mark accounts as SOLD
      await tx.adAccount.updateMany({
        where: { id: { in: accountIds } },
        data: { status: 'SOLD' },
      });

      // Deduct wallet balance
      await tx.user.update({
        where: { id: req.user.userId },
        data: { walletBalance: { decrement: discountedTotal } },
      });

      return transaction;
    });

    // Fetch purchased accounts with decrypted credentials for delivery
    const purchasedAccounts = await prisma.adAccount.findMany({
      where: { id: { in: accountIds } },
    });

    const deliveredAssets = purchasedAccounts.map(account => ({
      id: account.id,
      profileName: account.profileName,
      platform: account.platform,
      country: account.country,
      credentials: account.credentialsJson ? decryptJSON(account.credentialsJson) : null,
      proxyDetails: account.proxyDetails ? decrypt(account.proxyDetails) : null,
      cookieFile: account.cookieFile ? decrypt(account.cookieFile) : null,
      recoveryFile: account.recoveryFile ? decrypt(account.recoveryFile) : null,
    }));

    return res.status(201).json({
      success: true,
      message: 'Checkout completed successfully.',
      data: {
        transactionId: result.id,
        totalAmount: discountedTotal,
        discount: discount > 0 ? `${(discount * 100).toFixed(0)}%` : null,
        purchasedAt: result.createdAt,
        assets: deliveredAssets,
      },
    });
  } catch (err) {
    console.error('[TRANSACTION] checkout error:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Checkout failed. No charges were made.' });
  }
}

/**
 * GET /api/transactions
 * Get current user's order history.
 */
async function getUserTransactions(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 50);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.user.userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              adAccount: {
                select: { id: true, profileName: true, platform: true, country: true, countryFlag: true, price: true },
              },
            },
          },
        },
      }),
      prisma.transaction.count({ where: { userId: req.user.userId } }),
    ]);

    return res.json({
      success: true,
      data: {
        transactions,
        pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

/**
 * GET /api/transactions/:id
 * Get a single transaction's details + decrypted credentials (owner only).
 */
async function getTransaction(req, res) {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: {
        items: {
          include: { adAccount: true },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Transaction not found.' });
    }

    const assets = transaction.items.map(item => {
      const account = item.adAccount;
      return {
        id: account.id,
        profileName: account.profileName,
        platform: account.platform,
        country: account.country,
        countryFlag: account.countryFlag,
        price: item.price,
        credentials: account.credentialsJson ? decryptJSON(account.credentialsJson) : null,
        proxyDetails: account.proxyDetails ? decrypt(account.proxyDetails) : null,
        cookieFile: account.cookieFile ? decrypt(account.cookieFile) : null,
        recoveryFile: account.recoveryFile ? decrypt(account.recoveryFile) : null,
      };
    });

    return res.json({
      success: true,
      data: {
        id: transaction.id,
        totalAmount: transaction.totalAmount,
        paymentStatus: transaction.paymentStatus,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
        assets,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

/**
 * POST /api/transactions/topup
 * Initiate a wallet top-up (frontend-only flow, NowPayments to be integrated later).
 */
async function initiateTopup(req, res) {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
    return res.status(400).json({ success: false, error: 'INVALID_AMOUNT', message: 'Amount must be at least $1.' });
  }

  const parsedAmount = parseFloat(parseFloat(amount).toFixed(2));
  const bonus = parsedAmount >= 500 ? parseFloat((parsedAmount * 0.05).toFixed(2)) : 0;

  // Placeholder for NowPayments integration
  return res.json({
    success: true,
    message: 'Top-up initiated. Payment gateway integration pending.',
    data: {
      amount: parsedAmount,
      bonus,
      totalCredit: parseFloat((parsedAmount + bonus).toFixed(2)),
      paymentUrl: null, // Will be filled by NowPayments integration
      invoiceId: `INV-${Date.now()}`,
    },
  });
}

module.exports = { checkout, getUserTransactions, getTransaction, initiateTopup };
