const AppError = require('../utils/AppError');

// requireRole(...roles) — use after protect middleware
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(`Access denied. Requires role: ${roles.join(' or ')}`, 403)
    );
  }
  next();
};

module.exports = requireRole;
