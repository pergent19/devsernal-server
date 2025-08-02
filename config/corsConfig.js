const cors = require('cors');
const logger = require('../helpers/logger')
require('dotenv').config();

const allowedOrigins = [
  process.env.CORS_ORIGIN || 'https://devsernal.netlify.app',
  'http://localhost:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }

    // Log the disallowed origin
    logger.error(`CORS error: Origin "${origin}" is not allowed`);

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
};

module.exports = cors(corsOptions);
