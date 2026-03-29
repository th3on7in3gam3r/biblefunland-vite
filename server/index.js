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
  max: 500, // 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
// CORS configuration - allow all local development and production origins
const corsOptions = {
  origin: (origin, callback) => {
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Dynamic dev check: Allow any localhost or 127.0.0.1 origin
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️  CORS Blocked for origin:', origin);
      // Don't pass an Error to callback to avoid triggering 500 error
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'Cache-Control', 'Pragma'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["*"],
//       scriptSrc: ["* ", "'unsafe-inline'", "'unsafe-eval'"],
//       styleSrc: ["*", "'unsafe-inline'"],
//       imgSrc: ["*", "data:", "blob:"],
//       connectSrc: ["*"],
//       frameSrc: ["*"],
//       frameAncestors: ["'self'"]
//     },
//   }
// }));

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
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/bible', require('./routes/bible'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/churches', require('./routes/churchFinder'));

// Profile enforcement routes
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/children', require('./routes/children'));
app.use('/api/parental-controls', require('./routes/parentalControls'));
app.use('/api/classrooms', require('./routes/classrooms'));

// Faith Milestones routes
app.use('/api/faith-milestones', require('./routes/faith-milestones'));

// Other Routes with specific rate limiters
app.use('/api/ai', aiLimiter, require('./routes/ai'));
app.use('/api/email', emailLimiter, require('./routes/email'));
app.use('/api/pastor-requests', emailLimiter, require('./routes/pastorRequests'));

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
