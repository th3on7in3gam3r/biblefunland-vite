/**
 * server/routes/profiles.js — Profile enforcement routes
 * Age locking and role validation
 */

const express = require('express');
const router = express.Router();
const { queryOne, execute } = require('../lib/turso');

// POST /api/profiles/:userId/age — Set age with lock enforcement
router.post('/:userId/age', async (req, res) => {
  try {
    const { userId } = req.params;
    const { age } = req.body;

    if (!userId || age === undefined) {
      return res.status(400).json({ error: 'userId and age are required' });
    }

    // Validate age range [1, 120]
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return res.status(400).json({ error: 'Age must be between 1 and 120', detail: 'invalid_age_range' });
    }

    // Check if age is already locked
    const { data: profile } = await queryOne(
      `SELECT is_age_locked FROM profiles WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (profile?.is_age_locked === 1) {
      return res.status(403).json({ error: 'Age is locked and cannot be changed', detail: 'age_locked' });
    }

    // Update age and lock it
    const { error } = await execute(
      `INSERT INTO profiles (id, age, is_age_locked, updated_at) 
       VALUES (?, ?, 1, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET 
         age = ?,
         is_age_locked = 1,
         updated_at = datetime('now')`,
      [userId, ageNum, ageNum]
    );

    if (error) throw error;

    res.json({ success: true, age: ageNum, is_age_locked: 1 });
  } catch (err) {
    console.error('Error setting age:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/profiles/:userId/role — Validate and set role
router.patch('/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, pastor_code } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    // Validate role enum (Pastor requires a secret code)
    const validRoles = ['General', 'Parent', 'Teacher', 'Pastor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role', detail: 'invalid_role_enum' });
    }

    // Pastor requires the special access code
    if (role === 'Pastor') {
      const correctCode = process.env.PASTOR_ACCESS_CODE || 'GRACE2024';
      if (!pastor_code || pastor_code.trim().toUpperCase() !== correctCode.toUpperCase()) {
        return res.status(403).json({
          error: 'Invalid pastor verification code',
          detail: 'invalid_pastor_code'
        });
      }
    }

    // Check age restriction for Parent/Teacher
    if (['Parent', 'Teacher'].includes(role)) {
      const { data: profile } = await queryOne(
        `SELECT age FROM profiles WHERE id = ? LIMIT 1`,
        [userId]
      );

      if (profile?.age && profile.age < 13) {
        return res.status(403).json({ 
          error: 'Users under 13 cannot have Parent or Teacher role', 
          detail: 'role_restricted_by_age' 
        });
      }
    }

    // Update role
    const { error } = await execute(
      `INSERT INTO profiles (id, role, updated_at) 
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET 
         role = ?,
         updated_at = datetime('now')`,
      [userId, role, role]
    );

    if (error) throw error;

    res.json({ success: true, role });
  } catch (err) {
    console.error('Error setting role:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// DELETE /api/profiles/:userId — Delete user profile + all related data from Turso
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    // Delete all user data from Turso tables
    const tables = [
      'child_activity',
      'badges',
      'streaks',
      'bookmarks',
      'family_group_members',
      'prayer_requests',
      'subscriptions',
      'profiles',
    ];

    for (const table of tables) {
      await execute(
        `DELETE FROM ${table} WHERE user_id = ? OR id = ?`,
        [userId, userId]
      ).catch(() => {}); // ignore if table doesn't have that column
    }

    res.json({ success: true, message: `User ${userId} deleted from Turso` });
  } catch (err) {
    console.error('[profiles/delete]', err);
    res.status(500).json({ error: err.message });
  }
});
