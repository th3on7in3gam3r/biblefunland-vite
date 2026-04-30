/**
 * src/lib/turso.js — Frontend Turso client
 *
 * Calls Turso's HTTP API directly from the browser using credentials
 * stored in VITE_ env vars. This works on Vercel (no backend needed).
 *
 * Falls back to the Express backend proxy (/api/db/*) when env vars
 * are not available (e.g. during local dev without VITE_ vars set).
 */

const TURSO_URL = import.meta.env.VITE_TURSO_DATABASE_URL;
const TURSO_TOKEN = import.meta.env.VITE_TURSO_AUTH_TOKEN;

// Convert libsql:// → https:// for the HTTP API
function getTursoHttpUrl() {
  if (!TURSO_URL) return null;
  return TURSO_URL.replace(/^libsql:\/\//, 'https://');
}

/**
 * Call Turso HTTP API directly — works in browser + Vercel
 */
async function tursoHttp(sql, args = []) {
  const baseUrl = getTursoHttpUrl();
  if (!baseUrl || !TURSO_TOKEN) {
    throw new Error('Turso env vars not set');
  }

  // Turso HTTP API expects args as typed values
  const typedArgs = args.map(v => {
    if (v === null || v === undefined) return { type: 'null', value: null };
    if (typeof v === 'number') return { type: 'integer', value: String(v) };
    return { type: 'text', value: String(v) };
  });

  const response = await fetch(`${baseUrl}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TURSO_TOKEN}`,
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: typedArgs } },
        { type: 'close' },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Turso HTTP ${response.status}: ${text}`);
  }

  const json = await response.json();
  const result = json.results?.[0];

  if (result?.type === 'error') {
    throw new Error(result.error?.message || 'Turso query error');
  }

  const cols = result?.response?.result?.cols?.map(c => c.name) || [];
  const rows = (result?.response?.result?.rows || []).map(row => {
    const obj = {};
    cols.forEach((col, i) => {
      const cell = row[i];
      obj[col] = cell?.value ?? null;
    });
    return obj;
  });

  return rows;
}

/**
 * Fallback: proxy through Express/Vercel API routes (same-origin, relative path)
 */
async function apiCall(endpoint, body = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Always use relative path — works on Vercel (same origin) and proxied in dev via vite config
    const base = import.meta.env.DEV ? 'http://localhost:3001' : '';
    const response = await fetch(`${base}/api/db${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { data: [], error: `Server returned ${response.status}`, success: false };
    }

    return await response.json();
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[Turso API Error] ${endpoint}:`, err.message);
    }
    return {
      data: [],
      error: err.name === 'AbortError' ? 'Request timeout' : err.message,
      success: false,
    };
  }
}

/**
 * Generic query - returns array of rows
 */
export async function query(sql, args = []) {
  try {
    if (TURSO_URL && TURSO_TOKEN) {
      const rows = await tursoHttp(sql, args);
      return { data: rows, error: null, success: true };
    }
    const result = await apiCall('/query', { sql, args });
    return { data: result.data || [], error: result.error, success: result.success };
  } catch (e) {
    console.warn('[turso.query]', e.message);
    return { data: [], error: e.message, success: false };
  }
}

/**
 * Get single row or null
 */
export async function queryOne(sql, args = []) {
  try {
    if (TURSO_URL && TURSO_TOKEN) {
      const rows = await tursoHttp(sql, args);
      return { data: rows[0] ?? null, error: null, success: true };
    }
    const result = await apiCall('/query', { sql, args });
    return { data: result.data?.[0] ?? null, error: result.error, success: result.success };
  } catch (e) {
    console.warn('[turso.queryOne]', e.message);
    return { data: null, error: e.message, success: false };
  }
}

/**
 * Execute without expecting rows (INSERT, UPDATE, DELETE)
 */
export async function execute(sql, args = []) {
  try {
    if (TURSO_URL && TURSO_TOKEN) {
      await tursoHttp(sql, args);
      return { data: null, error: null, success: true };
    }
    const result = await apiCall('/execute', { sql, args });
    return { data: result.data, error: result.error, success: result.success };
  } catch (err) {
    console.warn('[turso.execute]', err.message);
    return { data: null, error: err.message, success: false };
  }
}

/**
 * Get streak data for a user
 */
export async function getStreak(userId) {
  return apiCall('/streak/get', { userId });
}

/**
 * Update or insert streak data
 */
export async function upsertStreak(userId, data) {
  return apiCall('/streak/upsert', {
    userId,
    ...data,
  });
}

/**
 * Get all badges for a user
 */
export async function getBadges(userId) {
  return apiCall('/badges/get', { userId });
}

/**
 * Award a badge to a user
 */
export async function earnBadge(userId, badgeId, name, description, icon) {
  return apiCall('/badges/earn', {
    userId,
    badgeId,
    name,
    description,
    icon,
  });
}

/**
 * Get scripture memory verses for a user
 */
export async function getScriptureMemory(userId, limit = 50) {
  return apiCall('/scripture/get', { userId, limit });
}

/**
 * Save a scripture memory verse
 */
export async function saveScripture(userId, bookName, chapter, verse, text, progress) {
  return apiCall('/scripture/save', {
    userId,
    bookName,
    chapter,
    verse,
    text,
    progress,
  });
}

// Re-export for compatibility with existing code
export default {
  execute,
  query,
  queryOne,
  getStreak,
  upsertStreak,
  getBadges,
  earnBadge,
  getScriptureMemory,
  saveScripture,
};
