const express = require('express');
const router = express.Router();
const { createClient } = require('@libsql/client');
const { v4: uuidv4 } = require('uuid');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

async function ensureTables() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      referrer_id TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      points_awarded INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS referral_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      event_type TEXT NOT NULL,
      new_user_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      quote TEXT NOT NULL,
      approved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
ensureTables().catch(err => console.error('[referrals] table init:', err.message));

// POST /api/referrals/generate — create or get referral code for a user
router.post('/generate', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const existing = await db.execute({
      sql: 'SELECT * FROM referrals WHERE referrer_id = ? LIMIT 1',
      args: [userId],
    });
    if (existing.rows.length) return res.json({ code: existing.rows[0].code });

    const code = userId.slice(0, 6).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    await db.execute({
      sql: 'INSERT INTO referrals (id, referrer_id, code) VALUES (?,?,?)',
      args: [uuidv4(), userId, code],
    });
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/referrals/click — record a referral link click
router.post('/click', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'code required' });
  try {
    await db.execute({ sql: 'UPDATE referrals SET clicks = clicks + 1 WHERE code = ?', args: [code] });
    await db.execute({ sql: 'INSERT INTO referral_events (code, event_type) VALUES (?,?)', args: [code, 'click'] });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/referrals/convert — record conversion + award points to referrer
router.post('/convert', async (req, res) => {
  const { code, newUserId } = req.body;
  if (!code || !newUserId) return res.status(400).json({ error: 'code and newUserId required' });
  try {
    const ref = await db.execute({ sql: 'SELECT * FROM referrals WHERE code = ? LIMIT 1', args: [code] });
    if (!ref.rows.length) return res.status(404).json({ error: 'Invalid referral code' });

    await db.execute({
      sql: 'UPDATE referrals SET conversions = conversions + 1, points_awarded = points_awarded + 50 WHERE code = ?',
      args: [code],
    });
    await db.execute({
      sql: 'INSERT INTO referral_events (code, event_type, new_user_id) VALUES (?,?,?)',
      args: [code, 'conversion', newUserId],
    });

    // Award 50 points to referrer via gamification table
    const referrerId = ref.rows[0].referrer_id;
    await db.execute({
      sql: `INSERT INTO gamification_points (user_id, points, reason, created_at)
            VALUES (?,50,'referral',datetime('now'))
            ON CONFLICT DO NOTHING`,
      args: [referrerId],
    }).catch(() => {}); // table may not exist yet — silent

    res.json({ ok: true, referrerId, pointsAwarded: 50 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/referrals/stats/:userId
router.get('/stats/:userId', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM referrals WHERE referrer_id = ? LIMIT 1',
      args: [req.params.userId],
    });
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/referrals/testimonial — submit a story (moderated)
router.post('/testimonial', async (req, res) => {
  const { name, role, quote } = req.body;
  if (!name || !quote) return res.status(400).json({ error: 'name and quote required' });
  if (quote.length > 500) return res.status(400).json({ error: 'Quote too long (max 500 chars)' });
  try {
    await db.execute({
      sql: 'INSERT INTO testimonials (name, role, quote) VALUES (?,?,?)',
      args: [name.slice(0, 80), (role || '').slice(0, 80), quote.slice(0, 500)],
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
