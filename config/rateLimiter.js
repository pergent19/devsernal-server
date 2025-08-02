const rateLimit = require('express-rate-limit');
const logger = require('../helpers/logger')

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  handler: (req, res, next, options) => {
    logger.error('Global rate limit exceeded', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      limit: options.max,
    });

    res.status(options.statusCode || 429).json({
      status: 429,
      error: 'Too many requests, please try again later.',
    });
  },
});

module.exports = globalLimiter;
