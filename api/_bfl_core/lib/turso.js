/**
 * server/lib/turso.js — Server-side database client
 * This connects to Turso and is used by API routes only
 */

const { createClient } = require('@libsql/client');
const path = require('path');

// Safe environment variable reading for both dev and production
// In standard Node.js, process.env is the source of truth.
// In some Vite-bundled environments, import.meta.env might be used.
const getEnv = (key) => {
  try {
    // Standard Node.js environment variables
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    // If the server is bundled with Vite/ESM, we'd need a different approach,
    // but for this CommonJS file, process.env is the standard.
  } catch (e) {
    // Ignore errors reading env
  }
  return undefined;
};

const url = getEnv('TURSO_DATABASE_URL') || getEnv('VITE_TURSO_DATABASE_URL');
const authToken = getEnv('TURSO_AUTH_TOKEN') || getEnv('VITE_TURSO_AUTH_TOKEN');

// Local fallback URL
const localUrl = `file:${path.join(__dirname, '../local.db')}`;

let client = null;

function getOrCreateClient() {
  if (client) return client;

  try {
    let dbUrl = url || localUrl;
    const dbToken = authToken || undefined;

    // In production (Vercel serverless), the HTTP driver is more stable.
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || !!process.env.VERCEL;
    if (dbUrl && dbUrl.startsWith('libsql://') && (isVercel || process.env.NODE_ENV === 'production')) {
      const originalProtocol = dbUrl.split('://')[0];
      dbUrl = dbUrl.replace('libsql://', 'https://');
      console.log(`[Turso Init] Protocol change: ${originalProtocol} -> https (lazy-init)`);
    }

    console.log(`[Turso Init] URL Type: ${dbUrl ? (dbUrl.startsWith('file:') ? 'local' : 'remote') : 'missing'}`);

    client = createClient({
      url: dbUrl,
      authToken: dbToken,
    });
    return client;
  } catch (err) {
    console.error('[Turso Lazy Init Error]', err.message);
    // Return a dummy client that returns errors instead of crashing
    return {
      execute: async () => {
        throw new Error(`Database client failed to init: ${err.message}`);
      },
    };
  }
}

/**
 * Execute a query and return { data, error, success }
 */
async function query(sql, args = []) {
  try {
    const db = getOrCreateClient();
    const result = await db.execute({ sql, args });
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
    const db = getOrCreateClient();
    const result = await db.execute({ sql, args });
    return { data: result, error: null, success: true };
  } catch (err) {
    console.error(`[Turso Execute Error] SQL: ${sql.slice(0, 50)}... | Error: ${err.message}`);
    return { data: null, error: err.message, success: false };
  }
}

module.exports = { 
  get client() { return getOrCreateClient(); },
  query, 
  queryOne, 
  execute 
};
