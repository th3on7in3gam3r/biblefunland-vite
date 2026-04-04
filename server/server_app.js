const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ─── Rate Limiters ───────────────────────────────────────────────────────── (Production Conservative)
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
const emailLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20 });
const communityLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(apiLimiter);
app.use(express.json());

// ─── Routes (Flattened pathing) ──────────────────────────────────────────────────────────
// Each route module is now located directly in the /api/routes folder.
const mount = (path, middleware) => {
  app.use(path, middleware);
  if (path.startsWith('/api')) {
    app.use(path.replace('/api', ''), middleware);
  }
};

app.get('/', (req, res) => res.json({ message: 'BibleFunLand Backend is Stable! 🕊️' }));

// Feature Mounting (Self-contained routes)
mount('/api/db', require('./routes/db'));
mount('/api/leaderboard', require('./routes/leaderboard'));
mount('/api/bible', require('./routes/bible'));
mount('/api/bookmarks', require('./routes/bookmarks'));
mount('/api/churches', require('./routes/churchFinder'));
mount('/api/seasonal', require('./routes/seasonal'));
mount('/api/profiles', require('./routes/profiles'));
mount('/api/referrals', require('./routes/referrals'));
mount('/api/gamification', require('./routes/gamification'));
mount('/api/prayers', communityLimiter, require('./routes/prayers'));
mount('/api/clerk-webhook', require('./routes/clerkWebhook'));
mount('/api/checkout', require('./routes/stripe'));

mount('/api/family-groups', require('./routes/familyGroups'));

// Restoring the omitted core routes
mount('/api', require('./routes/realtime'));
mount('/api/abtest', require('./routes/abtest'));
mount('/api/ai', require('./routes/ai'));
mount('/api/children', require('./routes/children'));
mount('/api/classrooms', require('./routes/classrooms'));
mount('/api/email', emailLimiter, require('./routes/email'));
mount('/api/faith-milestones', require('./routes/faith-milestones'));
mount('/api/newsletter', require('./routes/newsletter'));
mount('/api/parents', require('./routes/parentalControls'));
mount('/api/pastor', require('./routes/pastorRequests'));
mount('/api/printables', require('./routes/printables'));

// Error Handlers (Universal version-agnostic 404 catching)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route not found', path: req.path });
  }
  next();
});
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
