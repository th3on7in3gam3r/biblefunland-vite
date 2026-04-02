/**
 * src/lib/turso.js — Frontend database client proxy
 *
 * IMPORTANT: Database operations MUST happen on the backend!
 * This file proxies requests to /api/db/* endpoints
 *
 * The backend (server/lib/turso.js) actually connects to Turso
 * The frontend just calls these functions which make HTTP requests
 */

import API_URL from './api-config';

/**
 * Make a database API call to the backend - direct execution without queuing
 */
async function apiCall(endpoint, body = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_URL}/api/db${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Return error but DON'T THROW - allow UI to handle gracefully
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
      success: false 
    };
  }
}

/**
 * Generic query - returns array of rows
 */
export async function query(sql, args = []) {
  try {
    const result = await apiCall('/query', { sql, args });
    return { data: result.data || [], error: result.error, success: result.success };
  } catch (e) {
    return { data: [], error: e.message, success: false };
  }
}

/**
 * Get single row or null
 */
export async function queryOne(sql, args = []) {
  try {
    const result = await apiCall('/query', { sql, args });
    return { data: result.data?.[0] ?? null, error: result.error, success: result.success };
  } catch (e) {
    return { data: null, error: e.message, success: false };
  }
}

/**
 * Execute without expecting rows (INSERT, UPDATE, DELETE)
 */
export async function execute(sql, args = []) {
  try {
    const result = await apiCall('/execute', { sql, args });
    return { data: result.data, error: result.error, success: result.success };
  } catch (err) {
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
