/**
 * src/lib/turso.js — Frontend database client proxy
 * 
 * IMPORTANT: Database operations MUST happen on the backend!
 * This file proxies requests to /api/db/* endpoints
 * 
 * The backend (server/lib/turso.js) actually connects to Turso
 * The frontend just calls these functions which make HTTP requests
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Make a database API call to the backend
 */
async function apiCall(endpoint, body = {}) {
  try {
    const response = await fetch(`${API_URL}/api/db${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Database request failed');
    }

    return await response.json();
  } catch (err) {
    console.error('[Turso API]', err);
    return { data: null, error: err };
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
 */
export async function execute(sql, args = []) {
  return apiCall('/execute', { sql, args });
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
