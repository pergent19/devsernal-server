const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://deployment.com' : 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.',
  },
});

app.use(globalLimiter);

// Routes
app.use('/api', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', detail: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});