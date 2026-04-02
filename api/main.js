// api/main.js — Vercel entry point
module.exports = (req, res) => {
  // 🩺 High-level health check: proof-of-life before loading anything else
  if (req.url === '/api/health' || req.originalUrl === '/api/health') {
    return res.status(200).send('✅ VERCEL ENTRY POINT IS LIVE! (Node ' + process.version + ')');
  }

  try {
    // Determine the server directory path (now nested inside api/)
    const path = require('path');
    const serverPath = path.resolve(__dirname, './server/index.js');
    
    // Load .env only when running locally
    if (process.env.NODE_ENV !== 'production') {
      try {
        require('dotenv').config({ path: path.resolve(__dirname, './server/.env') });
      } catch (e) {}
    }

    // Require and invoke the actual Express app
    const app = require(serverPath);
    return app(req, res);
  } catch (err) {
    console.error('CRITICAL BACKEND STARTUP ERROR:', err.message);
    res.status(500).json({
      error: 'CRITICAL BACKEND STARTUP ERROR',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path_attempted: path.resolve(__dirname, './server/index.js')
    });
  }
};
