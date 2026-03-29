/**
 * api/index.js
 * Vercel Serverless Function — wraps the Express server for production
 */
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
const app = require('../server/index.js');

module.exports = app;
