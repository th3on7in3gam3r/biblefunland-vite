const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Rate Limiters ─────────────────────────────────────────────────────────
// Strict limits for expensive operations (AI, Email)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 requests per hour per IP
  message: 'Too many AI requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 emails per hour per IP
  message: 'Too many email requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 checkout attempts per 15 mins
  message: 'Too many checkout attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());

// CORS configuration - allow both localhost and production origins
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      process.env.FRONTEND_URL, // Production frontend URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(apiLimiter); // Apply general limiter to all routes

// ROUTES
// ─── Stripe Webhook MUST come before express.json() for signature verification ───
app.use('/api/checkout', checkoutLimiter, require('./routes/stripe'));

// Regular JSON parsing for all other routes
app.use(express.json());

// Basic Home route
app.get('/', (req, res) => {
  res.json({ message: 'BibleFunLand Backend Proxy is running! 🕊️' });
});

// Database API routes (no rate limit for now)
app.use('/api/db', require('./routes/db'));

// Other Routes with specific rate limiters
app.use('/api/ai', aiLimiter, require('./routes/ai'));
app.use('/api/email', emailLimiter, require('./routes/email'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    status: err.status || 500,
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});
