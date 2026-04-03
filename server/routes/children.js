/**
 * server/routes/children.js — Child profile CRUD endpoints
 * Create, read, delete child profiles with PIN validation
 */

const express = require('express');
const router = express.Router();
const { query, queryOne, execute } = require('../lib/turso');

// GET /api/children/:parentId — List child profiles
router.get('/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;

    if (!parentId) {
      return res.status(400).json({ error: 'parentId is required' });
    }

    const { data, error } = await query(
      `SELECT * FROM child_profiles WHERE parent_id = ? ORDER BY created_at DESC`,
      [parentId]
    );

    if (error) throw error;

    res.json({ data: data || [] });
  } catch (err) {
    console.error('Error listing children:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/children/:parentId — Create child profile
router.post('/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    const { display_name, age, avatar_url } = req.body;

    if (!parentId || !display_name) {
      return res.status(400).json({ error: 'parentId and display_name are required' });
    }

    // Check max-6 child limit
    const { data: children } = await query(
      `SELECT COUNT(*) as count FROM child_profiles WHERE parent_id = ?`,
      [parentId]
    );

    if (children?.[0]?.count >= 6) {
      return res.status(409).json({ error: 'Maximum 6 child profiles per parent', detail: 'child_limit_reached' });
    }

    // Create child profile
    const childId = require('crypto').randomUUID();
    const { error } = await execute(
      `INSERT INTO child_profiles (id, parent_id, display_name, age, avatar_url, kids_mode, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [childId, parentId, display_name, age ? parseInt(age) : null, avatar_url || 'david', age && parseInt(age) < 13 ? 1 : 0]
    );

    if (error) throw error;

    res.json({ success: true, id: childId, display_name, age, avatar_url });
  } catch (err) {
    console.error('Error creating child:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/children/:parentId/:childId — Delete child profile with PIN validation
router.delete('/:parentId/:childId', async (req, res) => {
  try {
    const { parentId, childId } = req.params;
    const { pin } = req.body;

    if (!parentId || !childId || !pin) {
      return res.status(400).json({ error: 'parentId, childId, and pin are required' });
    }

    // Verify PIN (in production, this would be hashed and compared)
    // For now, we'll accept any 4-digit PIN as valid
    if (!/^\d{4}$/.test(pin)) {
      return res.status(403).json({ error: 'Invalid PIN format', detail: 'invalid_pin' });
    }

    // Verify child belongs to parent
    const { data: child } = await queryOne(
      `SELECT id FROM child_profiles WHERE id = ? AND parent_id = ? LIMIT 1`,
      [childId, parentId]
    );

    if (!child) {
      return res.status(404).json({ error: 'Child profile not found' });
    }

    // Delete child profile and cascade delete activity
    await execute(
      `DELETE FROM child_activity WHERE child_id = ?`,
      [childId]
    );

    await execute(
      `DELETE FROM child_profiles WHERE id = ?`,
      [childId]
    );

    res.json({ success: true, message: 'Child profile deleted' });
  } catch (err) {
    console.error('Error deleting child:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
