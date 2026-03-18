const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());

// ROUTES
// ─── Stripe Webhook MUST come before express.json() for signature verification ───
app.use('/api/checkout', require('./routes/stripe'));

// Regular JSON parsing for all other routes
app.use(express.json());

// Basic Home route
app.get('/', (req, res) => {
  res.json({ message: 'BibleFunLand Backend Proxy is running! 🕊️' });
});

// Other Routes
app.use('/api/ai', require('./routes/ai'));
app.use('/api/email', require('./routes/email'));

app.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});
