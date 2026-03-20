/**
 * server/routes/db.js — Database API endpoints
 * All database queries go through here (not from frontend directly)
 */

const express = require('express');
const router = express.Router();
const { query, queryOne, execute } = require('../lib/turso');
const { randomUUID } = require('crypto');

// Middleware to validate userId
const validateUserId = (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  next();
};

// ─── Streaks ─────────────────────────────────────────────────────────────────

router.post('/streak/get', validateUserId, async (req, res) => {
  try {
    const { userId } = req.body;
    const { data, error } = await queryOne(
      `SELECT * FROM streaks WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('Error getting streak:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/streak/upsert', validateUserId, async (req, res) => {
  try {
    const { userId, streak, last_checkin, read_days, checkin_count } = req.body;
    const { data, error } = await execute(
      `INSERT INTO streaks (user_id, streak, last_checkin, read_days, checkin_count, updated_at) 
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET 
         streak = ?,
         last_checkin = ?,
         read_days = ?,
         checkin_count = ?,
         updated_at = datetime('now')`,
      [userId, streak || 0, last_checkin, read_days || '', checkin_count || 0, streak || 0, last_checkin, read_days || '', checkin_count || 0]
    );
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('Error upserting streak:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Badges ──────────────────────────────────────────────────────────────────

router.post('/badges/get', validateUserId, async (req, res) => {
  try {
    const { userId } = req.body;
    const { data, error } = await query(
      `SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC`,
      [userId]
    );
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('Error getting badges:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/badges/earn', validateUserId, async (req, res) => {
  try {
    const { userId, badgeId } = req.body;
    if (!badgeId) {
      return res.status(400).json({ error: 'badgeId is required' });
    }
    const { data, error } = await execute(
      `INSERT OR IGNORE INTO badges (id, user_id, badge_id, earned_at) 
       VALUES (?, ?, ?, datetime('now'))`,
      [randomUUID(), userId, badgeId]
    );
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('Error earning badge:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Scripture Memory ─────────────────────────────────────────────────────────

router.post('/scripture/get', validateUserId, async (req, res) => {
  try {
    const { userId, limit = 50 } = req.body;
    const { data, error } = await query(
      `SELECT * FROM scripture_memory WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, limit]
    );
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('Error getting scripture memory:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/scripture/save', validateUserId, async (req, res) => {
  try {
    const { userId, bookName, chapter, verse, text, progress } = req.body;
    const { data, error } = await execute(
      `INSERT INTO scripture_memory (user_id, book_name, chapter, verse, text, progress, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [userId, bookName, chapter, verse, text, progress || 0]
    );
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('Error saving scripture:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Generic Query Endpoint (for advanced use) ────────────────────────────────

router.post('/query', async (req, res) => {
  try {
    // Only allow read operations (SELECT)
    const { sql, args = [] } = req.body;
    if (!sql || !sql.toUpperCase().startsWith('SELECT')) {
      return res.status(400).json({ error: 'Only SELECT queries are allowed' });
    }
    const { data, error } = await query(sql, args);
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Generic Execute Endpoint (for INSERT, UPDATE, DELETE) ────────────────────

router.post('/execute', async (req, res) => {
  try {
    const { sql, args = [] } = req.body;
    if (!sql) {
      return res.status(400).json({ error: 'sql is required' });
    }
    const { data, error } = await execute(sql, args);
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('Error executing statement:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
