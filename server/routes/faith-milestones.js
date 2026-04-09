/**
 * API Routes for Faith Milestones Tracker
 * /api/faith-milestones/...
 */

const express = require('express');
const router = express.Router();
const { query, queryOne, execute } = require('../lib/turso');

// ────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION MIDDLEWARE
// ────────────────────────────────────────────────────────────────────────────

const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.userId = userId;
  next();
};

// ────────────────────────────────────────────────────────────────────────────
// CRUD FACTORY
// ────────────────────────────────────────────────────────────────────────────

function registerCrud(path, { table, label, idPrefix, requiredFields, columns, orderBy }) {
  // GET all
  router.get(`/${path}`, requireAuth, async (req, res) => {
    try {
      const { data, error } = await query(
        `SELECT * FROM ${table} WHERE user_id = ? ORDER BY ${orderBy} DESC`,
        [req.userId]
      );
      if (error) throw error;
      res.json(data || []);
    } catch (err) {
      console.error(`Error fetching ${path}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET single
  router.get(`/${path}/:id`, requireAuth, async (req, res) => {
    try {
      const { data, error } = await queryOne(
        `SELECT * FROM ${table} WHERE id = ? AND user_id = ?`,
        [req.params.id, req.userId]
      );
      if (error) throw error;
      if (!data) return res.status(404).json({ error: `${label} not found` });
      res.json(data);
    } catch (err) {
      console.error(`Error fetching ${label}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post(`/${path}`, requireAuth, async (req, res) => {
    try {
      const missing = requiredFields.filter(f => !req.body[f]);
      if (missing.length) {
        return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
      }

      const id = `${idPrefix}_${Date.now()}`;
      const now = new Date().toISOString();
      const values = columns.map(col => {
        const val = req.body[col];
        if (typeof val === 'boolean') return val ? 1 : 0;
        return val ?? null;
      });

      const placeholders = columns.map(() => '?').join(', ');
      const colNames = ['id', 'user_id', ...columns, 'created_at', 'updated_at'].join(', ');
      const allPlaceholders = ['?', '?', placeholders, '?', '?'].join(', ');

      const result = await execute(
        `INSERT INTO ${table} (${colNames}) VALUES (${allPlaceholders})`,
        [id, req.userId, ...values, now, now]
      );

      if (result.error) {
        console.error(`[faith-milestones] INSERT error for ${table}:`, result.error);
        return res.status(500).json({ error: String(result.error) });
      }

      const { data } = await queryOne(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      res.status(201).json(data || { id, user_id: req.userId });
    } catch (err) {
      console.error(`Error creating ${label}:`, err);
      res.status(500).json({ error: err?.message || String(err) });
    }
  });

  // PUT update
  router.put(`/${path}/:id`, requireAuth, async (req, res) => {
    try {
      const { data: existing, error: checkError } = await queryOne(
        `SELECT id FROM ${table} WHERE id = ? AND user_id = ?`,
        [req.params.id, req.userId]
      );
      if (checkError) throw checkError;
      if (!existing) return res.status(404).json({ error: `${label} not found` });

      const values = columns.map(col => {
        const val = req.body[col];
        if (typeof val === 'boolean') return val ? 1 : 0;
        return val ?? null;
      });

      const setClause = columns.map(col => `${col} = ?`).join(', ');

      const { error } = await execute(
        `UPDATE ${table} SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
        [...values, req.params.id]
      );
      if (error) throw error;

      const { data } = await queryOne(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json(data);
    } catch (err) {
      console.error(`Error updating ${label}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete(`/${path}/:id`, requireAuth, async (req, res) => {
    try {
      const { data: existing, error: checkError } = await queryOne(
        `SELECT id FROM ${table} WHERE id = ? AND user_id = ?`,
        [req.params.id, req.userId]
      );
      if (checkError) throw checkError;
      if (!existing) return res.status(404).json({ error: `${label} not found` });

      const { error } = await execute(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      console.error(`Error deleting ${label}:`, err);
      res.status(500).json({ error: err.message });
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// REGISTER ALL RESOURCES
// ────────────────────────────────────────────────────────────────────────────

registerCrud('milestones', {
  table: 'faith_milestones',
  label: 'Milestone',
  idPrefix: 'milestone',
  requiredFields: ['category', 'title'],
  columns: ['category', 'title', 'description', 'milestone_date', 'photo_url', 'impact_story', 'tags', 'is_public'],
  orderBy: 'milestone_date',
});

registerCrud('mentors', {
  table: 'spiritual_mentors',
  label: 'Mentor',
  idPrefix: 'mentor',
  requiredFields: ['name', 'relationship'],
  columns: ['name', 'relationship', 'how_they_shaped', 'meeting_date', 'photo_url', 'still_connected', 'contact_info'],
  orderBy: 'meeting_date',
});

registerCrud('verses', {
  table: 'hard_season_verses',
  label: 'Verse',
  idPrefix: 'verse',
  requiredFields: ['reference', 'text'],
  columns: ['reference', 'text', 'what_was_hard', 'how_it_helped', 'season_date', 'still_meaningful'],
  orderBy: 'season_date',
});

registerCrud('prayers', {
  table: 'answered_prayers_milestones',
  label: 'Prayer',
  idPrefix: 'prayer',
  requiredFields: ['prayer_text'],
  columns: ['prayer_text', 'answer_text', 'prayer_date', 'answer_date', 'impact_story', 'photos', 'is_public'],
  orderBy: 'answer_date',
});

// ────────────────────────────────────────────────────────────────────────────
// SUMMARY ENDPOINT - Get all faith journey data
// ────────────────────────────────────────────────────────────────────────────

router.get('/summary', requireAuth, async (req, res) => {
  try {
    const safeQuery = async (sql, args) => {
      try {
        const result = await query(sql, args);
        return result.data || [];
      } catch {
        return []; // table doesn't exist yet — return empty
      }
    };

    const [milestones, mentors, verses, prayers] = await Promise.all([
      safeQuery('SELECT * FROM faith_milestones WHERE user_id = ? ORDER BY milestone_date DESC', [req.userId]),
      safeQuery('SELECT * FROM spiritual_mentors WHERE user_id = ? ORDER BY meeting_date DESC', [req.userId]),
      safeQuery('SELECT * FROM hard_season_verses WHERE user_id = ? ORDER BY season_date DESC', [req.userId]),
      safeQuery('SELECT * FROM answered_prayers_milestones WHERE user_id = ? ORDER BY answer_date DESC', [req.userId]),
    ]);

    res.json({ milestones, mentors, verses, prayers });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
