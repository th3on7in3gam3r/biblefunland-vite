// api/index.js — Definitive Vercel Entry Point (Flat Architecture)
const express = require('express');
const path = require('path');

// Safe loading of the Express app 
let app;
try {
  // Use literal require for the actual API server logic (now in the same folder)
  // This logic is now flattened into the /api/ folder.
  app = require('./server_app.js'); 
} catch (err) {
  console.error('FATAL BACKEND LOAD ERROR:', err.message);
}

module.exports = (req, res) => {
  // 🩺 High-level health check
  if (req.url === '/api/health' || req.originalUrl === '/api/health') {
    return res.status(200).send('✅ BFL BACKEND IS LIVE (Node ' + process.version + ')');
  }

  // 🛡️ Guard against loading failures
  if (!app) {
    return res.status(500).json({
      error: 'BACKEND_NOT_LOADED',
      message: 'The internal server logic failed to load during function boot.'
    });
  }

  // 🚀 Delegate to the actual Express app
  return app(req, res);
};
