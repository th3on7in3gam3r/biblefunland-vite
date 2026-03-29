/**
 * src/lib/turso.js — Frontend database client proxy
 *
 * IMPORTANT: Database operations MUST happen on the backend!
 * This file proxies requests to /api/db/* endpoints
 *
 * The backend (server/lib/turso.js) actually connects to Turso
 * The frontend just calls these functions which make HTTP requests
 */

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

/**
 * Make a database API call to the backend - direct execution without queuing
 */
async function apiCall(endpoint, body = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_URL}/db${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = new Error('Database request failed');
      error.status = response.status;

      const errorData = await response.json();
      error.message = errorData.error || error.message;
      console.warn('[Turso API] Request failed (retry may help):', error.message);
      throw error;
    }

    const result = await response.json();
    return result;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[Turso API] Request timeout');
      throw new Error('Request timeout - backend server may not be running');
    }
    throw err;
  }
}

/**
 * Generic query - returns array of rows
 */
export async function query(sql, args = []) {
  return apiCall('/query', { sql, args });
}

/**
 * Get single row or null
 */
export async function queryOne(sql, args = []) {
  const result = await apiCall('/query', { sql, args });
  if (result.error) return { data: null, error: result.error };
  return { data: result.data?.[0] ?? null, error: null };
}

/**
 * Execute without expecting rows (INSERT, UPDATE, DELETE)
 * Bypasses the queue for immediate execution since writes are critical
 */
export async function execute(sql, args = []) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_URL}/db/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, args }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('[Turso] Execute error:', errorData.error);
      return { data: null, error: errorData.error || 'Database request failed' };
    }

    const result = await response.json();
    return result;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[Turso] Execute timeout');
      return { data: null, error: 'Request timeout - backend server may not be running' };
    }
    return { data: null, error: err.message || err };
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
