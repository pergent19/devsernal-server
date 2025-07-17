const express = require('express');
const { chat } = require('../controllers/chatController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    status: 429,
    error: 'Too many chat requests. Please wait and try again.',
  },
});

router.post('/chat', chatLimiter, chat);

module.exports = router;