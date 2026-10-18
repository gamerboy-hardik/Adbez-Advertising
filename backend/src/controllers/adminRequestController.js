const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRequest(req, res) {
  try {
    const { type, amount, metadata } = req.body;
    
    if (!['WALLET_TOPUP', 'ACCOUNT_APPLICATION'].includes(type)) {
      return res.status(400).json({ success: false, error: 'INVALID_TYPE' });
    }

    const adminRequest = await prisma.adminRequest.create({
      data: {
        userId: req.user.userId,
        type,
        amount: amount ? parseFloat(amount) : null,
        metadata: metadata || {}
      }
    });
    return res.status(201).json({ success: true, data: adminRequest });
  } catch (err) {
    console.error('[REQUESTS] createRequest error:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

async function getUserRequests(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 50);

    const [requests, total] = await Promise.all([
      prisma.adminRequest.findMany({
        where: { userId: req.user.userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.adminRequest.count({ where: { userId: req.user.userId } })
    ]);

    return res.json({
      success: true,
      data: {
        requests,
        pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) }
      }
    });
  } catch (err) {
    console.warn('[REQUESTS] Database offline, returning fallback requests:', err.message);
    const { FALLBACK_REQUESTS } = require('../utils/fallbackData');
    return res.json({
      success: true,
      data: {
        requests: FALLBACK_REQUESTS,
        pagination: { total: FALLBACK_REQUESTS.length, page: 1, limit: take, totalPages: 1 }
      }
    });
  }
}

module.exports = { createRequest, getUserRequests };
