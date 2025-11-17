import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (req, res, next) => {
    try {
        const role = req.user?.role || 'guest';
        
        let limit;
        let message;

        switch(role) {
            case 'admin':
                limit=20
                message='Admin request limit exceeded. Slow down'
                break;
            case 'user':
                limit=10
                message='User request limit exceeded. Slow down'
                break;
            default:
                limit=5
                message='Guest request limit exceeded. Slow down'
                break;
        }

        const client = aj.withRule(slidingWindow({ mode: 'LIVE', interval: '1m', max: limit, name: `${role}-rate-limit`}));

        const decision = await client.protect(req);

        if(decision.isDenied() && decision.reason.isBot()) {
            logger.warn('Bot request blocked', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path
            });
            return res.status(429).json({
                error: 'Too many requests',
                message: 'You have exceeded the request limit. Please try again later.'
            });
        }

        if(decision.isDenied() && decision.reason.isShield()) {
            logger.warn('Shield request blocked', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method
            });
            return res.status(429).json({
                error: 'Shield blocked',
                message: 'Shield blocked the request. Please try again later.'
            });
        }

        if(decision.isDenied() && decision.reason.isRateLimit()) {
            logger.warn('Rate limit request blocked', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path
            });
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many requests. Please try again later.'
            });
        }

        next();

    } catch (error) {
        logger.error(`Arcjet middleware error `, error);
        res.status(500).josn({
            error: 'Internal server error',
            message: 'Something went wrong with security middleware'
        })
    }
}
