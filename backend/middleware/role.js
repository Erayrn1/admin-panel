const roleMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // If no roles specified, allow all authenticated users
      if (allowedRoles.length === 0) {
        return next();
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Required role: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Error in role middleware', error: error.message });
    }
  };
};

module.exports = roleMiddleware;