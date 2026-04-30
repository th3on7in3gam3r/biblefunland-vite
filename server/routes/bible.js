/**
 * server/routes/bible.js — Bible Module API routes
 * Proxies API.Bible requests (key stays server-side) and persists
 * bookmarks/highlights in Turso (SQLite).
 *
 * Mount: app.use('/api/bible', require('./routes/bible'))
 */

const express = require('express');
const router = express.Router();
const { execute, query } = require('../lib/turso');
const crypto = require('crypto');

const API_KEY = process.env.BIBLE_API_KEY || 'I8LpaQ_H2CEc1BTNLIXj8';
const API_BASE = 'https://rest.api.bible/v1';

// ─── In-memory cache ──────────────────────────────────────────────────────────
const cache = new Map();

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function cacheSet(key, data, ttlMs) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const TTL = {
  BIBLES:   24 * 60 * 60 * 1000, // 24h
  BOOKS:     1 * 60 * 60 * 1000, // 1h
  CHAPTERS:  1 * 60 * 60 * 1000, // 1h
  CHAPTER:  30 * 60 * 1000,      // 30min
};

// ─── DB init ──────────────────────────────────────────────────────────────────
async function initTables() {
  await execute(`CREATE TABLE IF NOT EXISTS bible_bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    bible_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    verse_id TEXT NOT NULL,
    verse_text TEXT,
    created_at TEXT NOT NULL
  )`);

  await execute(`CREATE TABLE IF NOT EXISTS bible_highlights (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    bible_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    verse_id TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);

  // Unique constraints (ignore errors if index already exists)
  await execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_bm_unique
    ON bible_bookmarks(user_id, bible_id, chapter_id, verse_id)`).catch(() => {});
  await execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_hl_unique
    ON bible_highlights(user_id, bible_id, chapter_id, verse_id)`).catch(() => {});
}

initTables().catch(err => console.error('[Bible] DB init error:', err));

// ─── Auth helper ──────────────────────────────────────────────────────────────
function getUserId(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim() || null;
  return null;
}

function requireAuth(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  return userId;
}

// ─── API.Bible fetch helper ───────────────────────────────────────────────────
async function bibleFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'api-key': API_KEY },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw Object.assign(new Error(`API.Bible error: ${res.status}`), { status: res.status, body: text });
  }
  return res.json();
}

// ─── Read-only proxy routes ───────────────────────────────────────────────────

// GET /api/bible/bibles
router.get('/bibles', async (req, res) => {
  try {
    const cached = cacheGet('bibles');
    if (cached) return res.json(cached);

    const json = await bibleFetch('/bibles');
    cacheSet('bibles', json, TTL.BIBLES);
    res.json(json);
  } catch (err) {
    console.error('[Bible] /bibles error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/bible/:bibleId/books
router.get('/:bibleId/books', async (req, res) => {
  const { bibleId } = req.params;
  const key = `books:${bibleId}`;
  try {
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    const json = await bibleFetch(`/bibles/${bibleId}/books`);
    cacheSet(key, json, TTL.BOOKS);
    res.json(json);
  } catch (err) {
    console.error('[Bible] /books error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/bible/:bibleId/chapters/:bookId
router.get('/:bibleId/chapters/:bookId', async (req, res) => {
  const { bibleId, bookId } = req.params;
  const key = `chapters:${bibleId}:${bookId}`;
  try {
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    const json = await bibleFetch(`/bibles/${bibleId}/books/${bookId}/chapters`);
    cacheSet(key, json, TTL.CHAPTERS);
    res.json(json);
  } catch (err) {
    console.error('[Bible] /chapters error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/bible/:bibleId/chapter/:chapterId
router.get('/:bibleId/chapter/:chapterId', async (req, res) => {
  const { bibleId, chapterId } = req.params;
  const key = `chapter:${bibleId}:${chapterId}`;
  try {
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    const params = new URLSearchParams({
      'content-type': 'html',
      'include-notes': 'false',
      'include-titles': 'true',
      'include-chapter-numbers': 'false',
      'include-verse-numbers': 'true',
      'include-verse-spans': 'false',
    });
    const json = await bibleFetch(`/bibles/${bibleId}/chapters/${chapterId}?${params}`);
    cacheSet(key, json, TTL.CHAPTER);
    res.json(json);
  } catch (err) {
    console.error('[Bible] /chapter error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/bible/:bibleId/search?q=
router.get('/:bibleId/search', async (req, res) => {
  const { bibleId } = req.params;
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ data: { verses: [], total: 0 } });

  try {
    const params = new URLSearchParams({ query: q, limit: '20' });
    const json = await bibleFetch(`/bibles/${bibleId}/search?${params}`);
    res.json(json);
  } catch (err) {
    console.error('[Bible] /search error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Bookmarks ────────────────────────────────────────────────────────────────

// POST /api/bible/bookmarks
router.post('/bookmarks', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { bibleId, bookId, chapterId, verseId, verseText } = req.body || {};
  if (!bibleId || !chapterId || !verseId) {
    return res.status(400).json({ error: 'bibleId, chapterId, verseId are required' });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const { error } = await execute(
    `INSERT OR IGNORE INTO bible_bookmarks (id, user_id, bible_id, book_id, chapter_id, verse_id, verse_text, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, bibleId, bookId || '', chapterId, verseId, verseText || '', createdAt]
  );

  if (error) return res.status(500).json({ error: 'Failed to save bookmark' });
  res.json({ id, created: true });
});

// GET /api/bible/bookmarks
router.get('/bookmarks', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { data, error } = await query(
    `SELECT * FROM bible_bookmarks WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  if (error) return res.status(500).json({ error: 'Failed to fetch bookmarks' });
  res.json({ data: data || [] });
});

// DELETE /api/bible/bookmarks/:id
router.delete('/bookmarks/:id', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { error } = await execute(
    `DELETE FROM bible_bookmarks WHERE id = ? AND user_id = ?`,
    [req.params.id, userId]
  );

  if (error) return res.status(500).json({ error: 'Failed to delete bookmark' });
  res.json({ deleted: true });
});

// ─── Highlights ───────────────────────────────────────────────────────────────

// POST /api/bible/highlights
router.post('/highlights', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { bibleId, chapterId, verseId, color } = req.body || {};
  if (!bibleId || !chapterId || !verseId || !color) {
    return res.status(400).json({ error: 'bibleId, chapterId, verseId, color are required' });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  // INSERT OR REPLACE allows updating the color for an existing highlight
  const { error } = await execute(
    `INSERT OR REPLACE INTO bible_highlights (id, user_id, bible_id, chapter_id, verse_id, color, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, bibleId, chapterId, verseId, color, createdAt]
  );

  if (error) return res.status(500).json({ error: 'Failed to save highlight' });
  res.json({ id, created: true });
});

// GET /api/bible/highlights
router.get('/highlights', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { data, error } = await query(
    `SELECT * FROM bible_highlights WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  if (error) return res.status(500).json({ error: 'Failed to fetch highlights' });
  res.json({ data: data || [] });
});

// DELETE /api/bible/highlights/:id
router.delete('/highlights/:id', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { error } = await execute(
    `DELETE FROM bible_highlights WHERE id = ? AND user_id = ?`,
    [req.params.id, userId]
  );

  if (error) return res.status(500).json({ error: 'Failed to delete highlight' });
  res.json({ deleted: true });
});

module.exports = router;
