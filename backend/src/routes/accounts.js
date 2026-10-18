const { Router } = require('express');
const { listAccounts, getAccount, getCategoryStats } = require('../controllers/accountsController');
const { optionalAuth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { cacheResponse } = require('../middleware/cache');

const router = Router();

// GET /api/accounts/stats
router.get('/stats', apiLimiter, cacheResponse(300), getCategoryStats);

// GET /api/accounts
router.get('/', apiLimiter, cacheResponse(60), optionalAuth, listAccounts);

// GET /api/accounts/:id
router.get('/:id', apiLimiter, cacheResponse(60), optionalAuth, getAccount);

module.exports = router;
