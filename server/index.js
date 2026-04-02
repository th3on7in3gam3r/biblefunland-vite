const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Capture uncaught rejections and exceptions in backend service (guard rails for server-side bugs)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider process.exit(1) in production/pm2 if you want an auto-restart behavior
});

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

// Community features (prayer, chat) — tighter to prevent spam
const communityLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many requests, please slow down',
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

// Security headers — enabled with permissive CSP for SPA
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Managed by Vercel headers / index.html meta
}));

app.use(apiLimiter); // Apply general limiter to all routes

// ─── Route Mounting ──────────────────────────────────────────────────────────
// Helper to mount routes with and without the /api prefix for maximum compatibility
const mount = (path, middleware) => {
  app.use(path, middleware);
  if (path.startsWith('/api')) {
    app.use(path.replace('/api', ''), middleware);
  }
};

// ─── STRIPE WEBHOOK ──────────────────────────────────────────────────────────
// Must come before express.json()
app.use('/api/checkout', checkoutLimiter, require('./routes/stripe'));
app.use('/checkout', checkoutLimiter, require('./routes/stripe'));

// Regular JSON parsing for all other routes
app.use(express.json());

// Basic Home route
app.get('/', (req, res) => {
  res.json({ message: 'BibleFunLand Backend Proxy is running! 🕊️' });
});

// Database and Feature routes
mount('/api/db', require('./routes/db'));
mount('/api/leaderboard', require('./routes/leaderboard'));
mount('/api/bible', require('./routes/bible'));
mount('/api/bookmarks', require('./routes/bookmarks'));
mount('/api/churches', require('./routes/churchFinder'));
mount('/api/seasonal', require('./routes/seasonal'));
mount('/api/newsletter', require('./routes/newsletter'));
mount('/api/profiles', require('./routes/profiles'));
mount('/api/children', require('./routes/children'));
mount('/api/parental-controls', require('./routes/parentalControls'));
mount('/api/classrooms', require('./routes/classrooms'));
mount('/api/faith-milestones', require('./routes/faith-milestones'));
mount('/api/ai', aiLimiter, require('./routes/ai'));
mount('/api/email', emailLimiter, require('./routes/email'));
mount('/api/pastor-requests', emailLimiter, require('./routes/pastorRequests'));
mount('/api/gamification', require('./routes/gamification'));
mount('/api/prayers', communityLimiter, require('./routes/prayers'));

// Real-time endpoints (prayers/live + family/live-progress)
const realtimeRouter = require('./routes/realtime');
app.use('/api', realtimeRouter);
app.use('/', realtimeRouter);
mount('/api/abtest', require('./routes/abtest'));
mount('/api/referrals', require('./routes/referrals'));
mount('/api/printables', require('./routes/printables'));
mount('/api/clerk-webhook', require('./routes/clerkWebhook'));

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
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// Only start HTTP server when running locally — Vercel handles this in serverless mode
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend listening at http://localhost:${PORT}`);
  });
}

module.exports = app;
