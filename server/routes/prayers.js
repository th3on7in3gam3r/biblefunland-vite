/**
 * server/routes/prayers.js — Prayer wall endpoints with moderation + realtime SSE
 */
const express = require('express');
const router = express.Router();
const { query, queryOne, execute } = require('../lib/turso');

const BANNED_WORDS = ['hate', 'kill', 'stupid', 'idiot', 'trash', 'damn', 'hell'];

function containsBannedLanguage(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => lower.includes(word));
}

// In-memory SSE clients
const clients = new Set();

function broadcast(event, data) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res) => res.write(message));
}

// Sticky default: approved prayers only
router.get('/recent', async (req, res) => {
  const { data: prayers, success, error } = await query(
    `SELECT id, user_id, name, category, text, pray_count, country, city, lat, lng, created_at
     FROM prayers
     ORDER BY created_at DESC
     LIMIT 100`
  );
  res.json({ data: prayers || [], success, error });
});

// Alias for RealTimeContext compatibility
router.get('/live', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const { data: prayers, success, error } = await query(
    `SELECT id, user_id, name, category, text, pray_count, country, city, lat, lng, created_at
     FROM prayers
     ORDER BY created_at DESC
     LIMIT ?`, [limit]
  );
  res.json({ data: prayers || [], success, error });
});

// Main submission: goes to moderation queue
router.post('/submit', async (req, res) => {
  const { userId, name, category, text, country, city, lat, lng, bibleReference } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }

  if (containsBannedLanguage(text) || containsBannedLanguage(name) || containsBannedLanguage(category)) {
    return res.status(400).json({ error: 'Your prayer contains inappropriate or unsafe language' });
  }

  const id = `prayer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();

  try {
    const { success, error } = await execute(
      `INSERT INTO prayer_submissions
         (id, user_id, name, category, text, country, city, lat, lng, bible_ref, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, userId || null, name || 'Anonymous', category || 'General', text, country || null, city || null, lat || null, lng || null, bibleReference || null, createdAt]
    );

    if (!success) {
      return res.status(500).json({ error: 'Failed to submit prayer to database', details: error });
    }

    broadcast('new_submission', { id, userId, name, category, createdAt });
    return res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('[Prayers /submit]', err);
    return res.status(500).json({ error: 'Failed to submit prayer (unexpected error)' });
  }
});

router.get('/pending', async (req, res) => {
  const { data, success, error } = await query(
    `SELECT id, user_id, name, category, text, country, city, lat, lng, bible_ref, created_at
     FROM prayer_submissions
     WHERE status = 'pending'
     ORDER BY created_at ASC
     LIMIT 100`
  );
  res.json({ data: data || [], success, error });
});

router.post('/moderate/:id', async (req, res) => {
  const { id } = req.params;
  const { action, moderatingUser } = req.body || {};
  if (!id || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid moderation action' });
  }

  try {
    const { data: submission } = await queryOne(`SELECT * FROM prayer_submissions WHERE id = ?`, [id]);
    if (!submission) {
      return res.status(404).json({ error: 'Prayer submission not found' });
    }

    if (action === 'approve') {
      const approvedAt = new Date().toISOString();
      await execute(
        `INSERT INTO prayers
          (id, user_id, name, category, text, pray_count, country, city, lat, lng, created_at)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
        [submission.id, submission.user_id, submission.name, submission.category, submission.text, submission.country, submission.city, submission.lat, submission.lng, approvedAt]
      );
      await execute(`UPDATE prayer_submissions SET status = 'approved', reviewed_by = ?, reviewed_at = ? WHERE id = ?`, [moderatingUser || null, approvedAt, id]);
      broadcast('prayer_approved', { id: submission.id, name: submission.name, category: submission.category });
      return res.json({ success: true });
    }

    await execute(`UPDATE prayer_submissions SET status = 'rejected', reviewed_by = ?, reviewed_at = ? WHERE id = ?`, [moderatingUser || null, new Date().toISOString(), id]);
    broadcast('prayer_rejected', { id });
    res.json({ success: true });
  } catch (err) {
    console.error('[Prayers /moderate]', err);
    res.status(500).json({ error: 'Could not moderate prayer' });
  }
});

router.post('/pray/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await execute(`UPDATE prayers SET pray_count = pray_count + 1 WHERE id = ?`, [id]);
    const { data } = await queryOne(`SELECT pray_count FROM prayers WHERE id = ?`, [id]);
    broadcast('pray_count', { id, pray_count: data?.pray_count || 0 });
    res.json({ success: true, pray_count: data?.pray_count || 0 });
  } catch (err) {
    console.error('[Prayers /pray]', err);
    res.status(500).json({ error: 'Could not update pray count' });
  }
});

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write('retry: 15000\n\n');
  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
});

module.exports = router;
