const { Router } = require('express');
const { body } = require('express-validator');
const { checkout, getUserTransactions, getTransaction, initiateTopup } = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

// POST /api/transactions/checkout
router.post('/checkout',
  apiLimiter,
  [body('accountIds').isArray({ min: 1 }).withMessage('accountIds must be a non-empty array.')],
  checkout
);

// POST /api/transactions/topup
router.post('/topup',
  apiLimiter,
  [body('amount').isNumeric().withMessage('Amount must be a number.')],
  initiateTopup
);

// GET /api/transactions
router.get('/', apiLimiter, getUserTransactions);

// GET /api/transactions/:id
router.get('/:id', apiLimiter, getTransaction);

module.exports = router;
