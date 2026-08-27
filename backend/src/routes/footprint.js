const { Router } = require('express');
const { logFootprint } = require('../controllers/footprintController');
const { optionalAuth } = require('../middleware/auth');
const { footprintLimiter } = require('../middleware/rateLimiter');

const router = Router();

// POST /api/footprint
// Uses optionalAuth so both guests and authenticated users can log
router.post('/', footprintLimiter, optionalAuth, logFootprint);

module.exports = router;
