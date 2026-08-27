/**
 * RBAC Admin-Only Middleware
 * Must be used AFTER the authenticate middleware.
 * Blocks access if user role is not ADMIN.
 */
function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'Administrator access required. This incident has been logged.',
    });
  }

  next();
}

module.exports = { adminOnly };
