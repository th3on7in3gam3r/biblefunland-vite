/**
 * server/lib/turso.js — Server-side database client
 * This connects to Turso and is used by API routes only
 */

const { createClient } = require('@libsql/client');
const path = require('path');

const url = process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;

// Local fallback URL
const localUrl = `file:${path.join(__dirname, '../local.db')}`;

let client;
try {
  client = createClient({
    url: url || localUrl,
    authToken: authToken || undefined,
  });
} catch (err) {
  console.error('[Turso Client Init Error]', err.message);
  // Create a dummy client that returns errors instead of crashing
  client = {
    execute: async () => { throw new Error('Database client not initialized (missing env vars)'); }
  };
}

/**
 * Execute a query and return { data, error, success }
 */
async function query(sql, args = []) {
  try {
    const result = await client.execute({ sql, args });
    return { data: result.rows, error: null, success: true };
  } catch (err) {
    // Only log once to avoid terminal spam
    if (!err.message?.includes('no such table')) {
      console.warn(`[Turso Query Error] SQL: ${sql.slice(0, 50)}... | Error: ${err.message}`);
    }
    return { data: [], error: err.message, success: false };
  }
}

/**
 * Get a single row or null
 */
async function queryOne(sql, args = []) {
  try {
    const { data, success, error } = await query(sql, args);
    return { data: data?.[0] ?? null, error, success };
  } catch (err) {
    return { data: null, error: err.message, success: false };
  }
}

/**
 * Execute without expecting rows (INSERT, UPDATE, DELETE)
 */
async function execute(sql, args = []) {
  try {
    const result = await client.execute({ sql, args });
    return { data: result, error: null, success: true };
  } catch (err) {
    console.error(`[Turso Execute Error] SQL: ${sql.slice(0, 50)}... | Error: ${err.message}`);
    return { data: null, error: err.message, success: false };
  }
}

module.exports = { client, query, queryOne, execute };
