const { Router } = require('express');
const { createRequest, getUserRequests } = require('../controllers/adminRequestController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = Router();

// All request routes require authentication
router.use(authenticate);

// POST /api/requests
router.post('/', apiLimiter, createRequest);

// GET /api/requests
router.get('/', apiLimiter, getUserRequests);

module.exports = router;
