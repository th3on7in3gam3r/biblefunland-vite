/**
 * api/index.cjs
 * Vercel Serverless Function — wraps the Express server for production
 */
// Load .env only when running locally (npm run dev)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
}

const app = require('../server/index.cjs');

module.exports = app;
