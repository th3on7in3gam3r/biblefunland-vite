// api/index.js — Definitive Vercel Entry Point (Flat Architecture)
const express = require('express');
const path = require('path');

// Safe loading of the Express app 
let app;
try {
  // Use literal require for the actual API server logic (moved back to /server/ to bypass Vercel function limits)
  app = require('../server/server_app.js'); 
} catch (err) {
  console.error('FATAL BACKEND LOAD ERROR:', err.message);
}

module.exports = (req, res) => {
  // 🩺 High-level health check (Using native Node.js res methods)
  if (req.url === '/api/health' || req.originalUrl === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end('✅ BFL BACKEND IS LIVE (Node ' + process.version + ')');
  }

  // 🛡️ Guard against loading failures
  if (!app) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      error: 'BACKEND_NOT_LOADED',
      message: 'The internal server logic failed to load during function boot.'
    }));
  }

  // 🚀 Delegate to the actual Express app
  return app(req, res);
};
