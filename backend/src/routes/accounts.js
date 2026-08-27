const { Router } = require('express');
const { listAccounts, getAccount, getCategoryStats } = require('../controllers/accountsController');
const { optionalAuth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = Router();

// GET /api/accounts/stats
router.get('/stats', apiLimiter, getCategoryStats);

// GET /api/accounts
router.get('/', apiLimiter, optionalAuth, listAccounts);

// GET /api/accounts/:id
router.get('/:id', apiLimiter, optionalAuth, getAccount);

module.exports = router;
