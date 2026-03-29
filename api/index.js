/**
 * api/index.js
 * Vercel Serverless Function — wraps the Express server for production
 */
try {
  // Load .env only when running locally (npm run dev)
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
  }

  const app = require('../server/index.js');

  module.exports = app;
} catch (err) {
  console.error('CRITICAL STARTUP ERROR:', err);
  
  // Return the error as a response so we can see it in the browser!
  const express = require('express');
  const app = express();
  app.all('*', (req, res) => {
    res.status(500).json({
      error: 'CRITICAL STARTUP ERROR',
      message: err.message,
      stack: err.stack
    });
  });
  module.exports = app;
}
