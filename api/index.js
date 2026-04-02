// api/main.js — Vercel entry point
module.exports = (req, res) => {
  // 🩺 High-level health check: proof-of-life before loading anything else
  if (req.url === '/api/health' || req.originalUrl === '/api/health') {
    return res.status(200).send('✅ VERCEL ENTRY POINT IS LIVE! (Node ' + process.version + ')');
  }

  try {
    // 🚀 Literal require for Vercel's static analysis bundler (nft)
    // This MUST be a literal string for the bundler to find the dependencies
    const app = require('./_bfl_core/index.js');
    
    // Invoke the actual Express app
    return app(req, res);
  } catch (err) {
    console.error('CRITICAL BACKEND STARTUP ERROR:', err.message);
    res.status(500).json({
      error: 'CRITICAL BACKEND STARTUP ERROR',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path_attempted: './_bfl_core/index.js'
    });
  }
};
