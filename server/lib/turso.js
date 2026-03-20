/**
 * server/lib/turso.js — Server-side database client
 * This connects to Turso and is used by API routes only
 */

const { createClient } = require('@libsql/client');
require('dotenv').config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.warn(
    '⚠️  Turso environment variables not set.\n' +
    'Add to your server/.env file:\n' +
    '  TURSO_DATABASE_URL=libsql://your-db.turso.io\n' +
    '  TURSO_AUTH_TOKEN=your-token\n' +
    'Get both from: turso.tech → your database → Connect button'
  );
}

const client = createClient({
  url: url || 'file:local.db',
  authToken: authToken || undefined,
});

/**
 * Execute a query and return { data, error }
 * Matches the frontend interface for compatibility
 */
async function query(sql, args = []) {
  try {
    const result = await client.execute({ sql, args });
    return { data: result.rows, error: null };
  } catch (err) {
    if (!err.message?.includes('no such table')) {
      console.error('[Turso]', err);
    }
    return { data: null, error: err };
  }
}

/**
 * Get a single row or null
 */
async function queryOne(sql, args = []) {
  const { data, error } = await query(sql, args);
  return { data: data?.[0] ?? null, error };
}

/**
 * Execute without expecting rows (INSERT, UPDATE, DELETE)
 */
async function execute(sql, args = []) {
  try {
    const result = await client.execute({ sql, args });
    return { data: result, error: null };
  } catch (err) {
    console.error('[Turso Execute]', err);
    return { data: null, error: err };
  }
}

module.exports = { client, query, queryOne, execute };
