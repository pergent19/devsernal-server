const express = require('express');
const app = express();
const cors = require('cors');
const generateContent = require('./route/gemini');
const rateLimit = require('express-rate-limit');

const PORT = 3000;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.use(express.json())

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    error: "Too many requests, please try again later.",
  },
});


app.use(globalLimiter);

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,              // only 5 requests per minute per IP
  message: {
    status: 429,
    error: "Too many chat requests. Please wait and try again.",
  },
});
;

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.post('/api/chat', chatLimiter, generateContent);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
