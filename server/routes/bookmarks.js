/**
 * server/routes/bookmarks.js — Verse Bookmarking with folders & public sharing
 * Mount: app.use('/api/bookmarks', require('./routes/bookmarks'))
 */

const express = require('express');
const router = express.Router();
const { execute, query } = require('../lib/turso');
const crypto = require('crypto');

const DEFAULT_FOLDERS = ['Favorites', 'Morning Prayer', 'Memorizing', 'Sermon Prep'];

// ─── DB init ──────────────────────────────────────────────────────────────────
async function initTables() {
  await execute(`CREATE TABLE IF NOT EXISTS verse_bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    verse_ref TEXT NOT NULL,
    verse_text TEXT NOT NULL,
    book TEXT NOT NULL,
    chapter TEXT NOT NULL,
    note TEXT DEFAULT '',
    folder TEXT DEFAULT 'Favorites',
    is_public INTEGER DEFAULT 0,
    share_token TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await execute(`CREATE INDEX IF NOT EXISTS idx_vb_user ON verse_bookmarks(user_id)`).catch(() => {});
  await execute(`CREATE INDEX IF NOT EXISTS idx_vb_token ON verse_bookmarks(share_token)`).catch(() => {});
  await execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_vb_unique ON verse_bookmarks(user_id, verse_ref)`).catch(() => {});

  // Public collections table — one row per user's public profile
  await execute(`CREATE TABLE IF NOT EXISTS bookmark_collections (
    user_id TEXT PRIMARY KEY,
    display_name TEXT,
    share_token TEXT UNIQUE NOT NULL,
    is_public INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  )`).catch(() => {});
}

initTables().catch(err => console.error('[Bookmarks] DB init error:', err));

// ─── Auth helper ──────────────────────────────────────────────────────────────
function getUserId(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim() || null;
  return null;
}
function requireAuth(req, res) {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: 'Authentication required' }); return null; }
  return userId;
}

// ─── GET /api/bookmarks — all bookmarks for user, grouped by folder ───────────
router.get('/', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { data, error } = await query(
    `SELECT * FROM verse_bookmarks WHERE user_id = ? ORDER BY folder, created_at DESC`,
    [userId]
  );
  if (error) return res.status(500).json({ error: 'Failed to fetch bookmarks' });

  // Group by folder
  const grouped = {};
  DEFAULT_FOLDERS.forEach(f => { grouped[f] = [] });
  for (const row of (data || [])) {
    const folder = row.folder || 'Favorites';
    if (!grouped[folder]) grouped[folder] = [];
    grouped[folder].push(row);
  }

  res.json({ bookmarks: data || [], grouped, folders: Object.keys(grouped) });
});

// ─── POST /api/bookmarks — create or update bookmark ─────────────────────────
router.post('/', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { verseRef, verseText, book, chapter, note = '', folder = 'Favorites' } = req.body || {};
  if (!verseRef || !verseText) return res.status(400).json({ error: 'verseRef and verseText required' });

  const now = new Date().toISOString();

  // Check if already exists — update if so
  const { data: existing } = await query(
    `SELECT id FROM verse_bookmarks WHERE user_id = ? AND verse_ref = ?`,
    [userId, verseRef]
  );

  if (existing && existing.length > 0) {
    await execute(
      `UPDATE verse_bookmarks SET note = ?, folder = ?, updated_at = ? WHERE user_id = ? AND verse_ref = ?`,
      [note, folder, now, userId, verseRef]
    );
    return res.json({ id: existing[0].id, updated: true });
  }

  const id = crypto.randomUUID();
  const { error } = await execute(
    `INSERT INTO verse_bookmarks (id, user_id, verse_ref, verse_text, book, chapter, note, folder, is_public, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [id, userId, verseRef, verseText, book || '', chapter || '', note, folder, now, now]
  );

  if (error) return res.status(500).json({ error: 'Failed to save bookmark' });
  res.json({ id, created: true });
});

// ─── PUT /api/bookmarks/:id — update note/folder ──────────────────────────────
router.put('/:id', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { note, folder } = req.body || {};
  const now = new Date().toISOString();

  const { error } = await execute(
    `UPDATE verse_bookmarks SET note = COALESCE(?, note), folder = COALESCE(?, folder), updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [note ?? null, folder ?? null, now, req.params.id, userId]
  );

  if (error) return res.status(500).json({ error: 'Failed to update bookmark' });
  res.json({ updated: true });
});

// ─── DELETE /api/bookmarks/:id ────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { error } = await execute(
    `DELETE FROM verse_bookmarks WHERE id = ? AND user_id = ?`,
    [req.params.id, userId]
  );

  if (error) return res.status(500).json({ error: 'Failed to delete bookmark' });
  res.json({ deleted: true });
});

// ─── POST /api/bookmarks/share — make collection public, get share token ──────
router.post('/share', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { displayName = 'Anonymous', isPublic = true } = req.body || {};
  const now = new Date().toISOString();

  // Get or create collection record
  const { data: existing } = await query(
    `SELECT share_token FROM bookmark_collections WHERE user_id = ?`, [userId]
  );

  let token;
  if (existing && existing.length > 0) {
    token = existing[0].share_token;
    await execute(
      `UPDATE bookmark_collections SET display_name = ?, is_public = ? WHERE user_id = ?`,
      [displayName, isPublic ? 1 : 0, userId]
    );
  } else {
    token = crypto.randomBytes(8).toString('hex');
    await execute(
      `INSERT INTO bookmark_collections (user_id, display_name, share_token, is_public, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, displayName, token, isPublic ? 1 : 0, now]
    );
  }

  res.json({ token, shareUrl: `/bookmarks/shared/${token}` });
});

// ─── GET /api/bookmarks/shared/:token — public collection (no auth) ───────────
router.get('/shared/:token', async (req, res) => {
  const { data: col } = await query(
    `SELECT * FROM bookmark_collections WHERE share_token = ? AND is_public = 1`,
    [req.params.token]
  );

  if (!col || col.length === 0) return res.status(404).json({ error: 'Collection not found or not public' });

  const collection = col[0];
  const { data: bookmarks } = await query(
    `SELECT * FROM verse_bookmarks WHERE user_id = ? ORDER BY folder, created_at DESC`,
    [collection.user_id]
  );

  // Group by folder
  const grouped = {};
  for (const row of (bookmarks || [])) {
    const f = row.folder || 'Favorites';
    if (!grouped[f]) grouped[f] = [];
    grouped[f].push(row);
  }

  res.json({ displayName: collection.display_name, grouped, total: (bookmarks || []).length });
});

module.exports = router;
