const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/accounts
 * Returns paginated, filterable list of AVAILABLE ad accounts (no credentials).
 */
async function listAccounts(req, res) {
  try {
    const {
      category,
      platform,
      country,
      minPrice,
      maxPrice,
      minSpend,
      search,
      page = 1,
      limit = 50,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const where = {
      status: 'AVAILABLE',
    };

    if (category) where.category = category;
    if (platform) where.platform = platform.toUpperCase();
    if (country) where.country = country.toUpperCase();
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (minSpend) {
      where.spendingLimit = { gte: parseFloat(minSpend) };
    }
    if (search) {
      where.OR = [
        { profileName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { platform: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100); // cap at 100

    const [accounts, total] = await Promise.all([
      prisma.adAccount.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
        select: {
          id: true,
          platform: true,
          category: true,
          profileName: true,
          country: true,
          countryFlag: true,
          spendingLimit: true,
          ageMonths: true,
          price: true,
          status: true,
          features: true,
          description: true,
          isFeatured: true,
          createdAt: true,
          // Explicitly EXCLUDED: credentialsJson, proxyDetails, cookieFile, recoveryFile
        },
      }),
      prisma.adAccount.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        accounts,
        pagination: {
          total,
          page: parseInt(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (err) {
    console.error('[ACCOUNTS] list error:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

/**
 * GET /api/accounts/:id
 * Returns public details of a single account (no credentials).
 */
async function getAccount(req, res) {
  try {
    const account = await prisma.adAccount.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        platform: true,
        category: true,
        profileName: true,
        country: true,
        countryFlag: true,
        spendingLimit: true,
        ageMonths: true,
        price: true,
        status: true,
        features: true,
        description: true,
        isFeatured: true,
        createdAt: true,
      },
    });

    if (!account) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Account not found.' });
    }

    return res.json({ success: true, data: { account } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

/**
 * GET /api/accounts/categories/stats
 * Returns count of available accounts per category (for sidebar badges).
 */
async function getCategoryStats(req, res) {
  try {
    const stats = await prisma.adAccount.groupBy({
      by: ['category'],
      where: { status: 'AVAILABLE' },
      _count: { id: true },
    });

    const result = {};
    stats.forEach(s => { result[s.category] = s._count.id; });

    return res.json({ success: true, data: { stats: result } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

module.exports = { listAccounts, getAccount, getCategoryStats };
