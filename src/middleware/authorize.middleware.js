import logger from '#config/logger.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        logger.warn(
          `Access denied for user ${req.user.id} with role ${userRole} to ${req.path}`
        );
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource',
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      next(error);
    }
  };
};

export const authorizeSelfOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const requestedUserId = parseInt(req.params[userIdParam], 10);
      const currentUserId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (currentUserId !== requestedUserId && !isAdmin) {
        logger.warn(
          `Access denied: User ${currentUserId} tried to access user ${requestedUserId} resource`
        );
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access your own resources',
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      next(error);
    }
  };
};
