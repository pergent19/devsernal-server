const express = require('express');
const { chat } = require('../controllers/chatController');
const rateLimit = require('express-rate-limit');
const logger = require('../helpers/logger');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  handler: (req, res, next, options) => {
    logger.error('Rate limit exceeded on /chat', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      limit: options.max,
    });

    res.status(options.statusCode || 429).json({
      status: 429,
      error: 'Too many chat requests. Please wait and try again.',
    });
  },
});

router.post('/chat', chatLimiter, chat);

module.exports = router;
