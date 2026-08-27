const { Router } = require('express');
const { body } = require('express-validator');
const {
  getAllAccounts, createAccount, updateAccount, deleteAccount, importAccounts,
  getAllTransactions, updateTransactionStatus,
  getFootprintLogs,
  getAllUsers, updateUserWallet,
  getDashboardStats,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, adminOnly);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
router.get('/stats', apiLimiter, getDashboardStats);

// ─── ACCOUNTS (Inventory Control Matrix) ─────────────────────────────────────
router.get('/accounts', apiLimiter, getAllAccounts);
router.post('/accounts',
  apiLimiter,
  [
    body('platform').notEmpty().withMessage('Platform required.'),
    body('category').notEmpty().withMessage('Category required.'),
    body('profileName').notEmpty().withMessage('Profile name required.'),
    body('price').isNumeric().withMessage('Price must be a number.'),
  ],
  createAccount
);
router.put('/accounts/:id', apiLimiter, updateAccount);
router.delete('/accounts/:id', apiLimiter, deleteAccount);
router.post('/accounts/import', apiLimiter, importAccounts);

// ─── TRANSACTIONS (Ledger) ────────────────────────────────────────────────────
router.get('/transactions', apiLimiter, getAllTransactions);
router.put('/transactions/:id/status',
  apiLimiter,
  [body('status').notEmpty()],
  updateTransactionStatus
);

// ─── FOOTPRINT MONITOR ────────────────────────────────────────────────────────
router.get('/footprint', apiLimiter, getFootprintLogs);

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
router.get('/users', apiLimiter, getAllUsers);
router.put('/users/:id/wallet', apiLimiter, updateUserWallet);

module.exports = router;
