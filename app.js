const express = require('express');
const chatRoutes = require('./routes/chatRoutes');
const logger = require('./helpers/logger');
const corsConfig = require('./config/corsConfig');
const rateLimiter = require('./config/rateLimiter');

const app = express();

// Middleware
app.set('trust proxy', 1);
app.use(corsConfig);
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api', chatRoutes);

app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Server is awake' });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Server error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({ error: 'Internal Server Error', detail: err.message });
});

module.exports = app;
