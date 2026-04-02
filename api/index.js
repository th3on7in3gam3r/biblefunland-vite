// api/index.js — Vercel entry point
const express = require('express');

let app;
try {
  // If we are in production, we skip .env loading for performance/safety
  if (process.env.NODE_ENV !== 'production') {
    try {
      require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
    } catch (e) {
      console.warn('Dotenv not loaded (may be missing or in production)');
    }
  }

  // Require the actual Express app from the server directory
  // We use a relative path from the api folder
  app = require('../server/index.js');

  // If for some reason it didn't export an app, create one
  if (!app || typeof app !== 'function') {
    throw new Error('Server/index.js did not export a valid Express app');
  }
} catch (err) {
  console.error('CRITICAL BACKEND STARTUP ERROR:', err.message);
  console.error(err.stack);
  
  // Create a minimal fallback app to return the error
  app = express();
  app.all('*', (req, res) => {
    res.status(500).json({
      error: 'CRITICAL BACKEND STARTUP ERROR',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });
}

module.exports = app;
