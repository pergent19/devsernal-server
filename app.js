const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable trust proxy for Render's reverse proxy
app.set('trust proxy', 1); // Trust the first proxy (Render's load balancer)

// Configure CORS to allow multiple origins
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'https://your-frontend.onrender.com', // Production frontend
  'http://localhost:5173', // Local development
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., non-browser clients like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.message.includes('CORS')) {
    return res.status(403).json({ error: 'CORS error', detail: err.message });
  }

  if (err.status === 429) {
    return res.status(429).json({ error: 'Too many requests', detail: err.message });
  }

  res.status(500).json({ error: 'Internal Server Error', detail: err.message });
});

app.listen(PORT, () => {
  logger.info(`Server started`, { port: PORT, environment: process.env.NODE_ENV });
});