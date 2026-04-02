const express = require('express');
const router = express.Router();
const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

// Ensure tables exist
async function ensureTables() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS ab_impressions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      user_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS ab_conversions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      user_id TEXT,
      goal TEXT DEFAULT 'click',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS ab_winners (
      test_id TEXT PRIMARY KEY,
      variant_id TEXT NOT NULL,
      applied INTEGER DEFAULT 0,
      set_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
ensureTables().catch(err => console.error('[abtest] table init error:', err.message));

// POST /api/abtest/impression
router.post('/impression', async (req, res) => {
  const { testId, variantId, userId } = req.body;
  if (!testId || !variantId) return res.status(400).json({ error: 'Missing fields' });
  try {
    await db.execute({
      sql: 'INSERT INTO ab_impressions (test_id, variant_id, user_id) VALUES (?,?,?)',
      args: [testId, variantId, userId || null],
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/abtest/conversion
router.post('/conversion', async (req, res) => {
  const { testId, variantId, userId, goal = 'click' } = req.body;
  if (!testId || !variantId) return res.status(400).json({ error: 'Missing fields' });
  try {
    await db.execute({
      sql: 'INSERT INTO ab_conversions (test_id, variant_id, user_id, goal) VALUES (?,?,?,?)',
      args: [testId, variantId, userId || null, goal],
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/abtest/results — all test results with conversion rates
router.get('/results', async (req, res) => {
  try {
    const [impressions, conversions, winners] = await Promise.all([
      db.execute('SELECT test_id, variant_id, COUNT(*) as cnt FROM ab_impressions GROUP BY test_id, variant_id'),
      db.execute('SELECT test_id, variant_id, COUNT(*) as cnt FROM ab_conversions GROUP BY test_id, variant_id'),
      db.execute('SELECT * FROM ab_winners'),
    ]);

    // Build results map
    const imp = {};
    for (const row of impressions.rows) {
      if (!imp[row.test_id]) imp[row.test_id] = {};
      imp[row.test_id][row.variant_id] = Number(row.cnt);
    }
    const conv = {};
    for (const row of conversions.rows) {
      if (!conv[row.test_id]) conv[row.test_id] = {};
      conv[row.test_id][row.variant_id] = Number(row.cnt);
    }
    const winnerMap = {};
    for (const row of winners.rows) {
      winnerMap[row.test_id] = { variantId: row.variant_id, applied: !!row.applied };
    }

    res.json({ impressions: imp, conversions: conv, winners: winnerMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/abtest/winner — set winner for a test
router.post('/winner', async (req, res) => {
  const { testId, variantId, apply = false } = req.body;
  if (!testId || !variantId) return res.status(400).json({ error: 'Missing fields' });
  try {
    await db.execute({
      sql: `INSERT INTO ab_winners (test_id, variant_id, applied) VALUES (?,?,?)
            ON CONFLICT(test_id) DO UPDATE SET variant_id=excluded.variant_id, applied=excluded.applied, set_at=datetime('now')`,
      args: [testId, variantId, apply ? 1 : 0],
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/abtest/winners — get all applied winners (used by frontend to override variants)
router.get('/winners', async (req, res) => {
  try {
    const result = await db.execute('SELECT test_id, variant_id FROM ab_winners WHERE applied = 1');
    const winners = {};
    for (const row of result.rows) winners[row.test_id] = row.variant_id;
    res.json(winners);
  } catch (err) {
    res.json({});
  }
});

module.exports = router;
