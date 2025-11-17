import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (req, res, next) => {
  try {
    if (req.path === '/health' || !req.get('User-Agent')) {
      return next();
    }

    const role = req.user?.role || 'guest';

    let limit;

    switch (role) {
      case 'admin':
        limit = 20;
        break;
      case 'user':
        limit = 10;
        break;
      default:
        limit = 5;
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    // Only block if it's a confirmed automated bot, not API clients like Postman
    if (decision.isDenied() && decision.reason.isBot()) {
      const userAgent = req.get('User-Agent') || 'Unknown';
      // Allow Postman and other API testing tools
      if (
        userAgent.includes('Postman') ||
        userAgent.includes('Insomnia') ||
        userAgent.includes('curl') ||
        userAgent.includes('httpie')
      ) {
        return next();
      }

      logger.warn('Bot request blocked', {
        ip: req.ip,
        userAgent,
        path: req.path,
      });
      return res.status(429).json({
        error: 'Bot detected',
        message:
          'Automated bots are not allowed. Please use a proper API client.',
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield request blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });
      return res.status(429).json({
        error: 'Shield blocked',
        message: 'Shield blocked the request. Please try again later.',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit request blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
      });
    }

    next();
  } catch (error) {
    logger.error('Arcjet middleware error ', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong with security middleware',
    });
  }
};
