const { Router } = require('express');
const { me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

// GET /api/auth/me  (protected)
// This endpoint is used by the frontend to fetch the synchronized PostgreSQL User object
// after a successful Firebase login.
router.get('/me', authenticate, me);

module.exports = router;
