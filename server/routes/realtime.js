const express = require('express');
const router = express.Router();
const { client: db } = require('../lib/turso');

// GET /api/prayers/live — approved prayers for real-time wall
router.get('/prayers/live', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  try {
    const result = await db.execute({
      sql: `SELECT id, name, category, text, pray_count, created_at
            FROM prayers
            WHERE status = 'approved' OR status IS NULL
            ORDER BY created_at DESC
            LIMIT ?`,
      args: [limit],
    });
    const prayers = result.rows || [];
    res.json({ prayers, total: prayers.length, live: true });
  } catch (err) {
    console.error('[realtime] prayers/live error:', err.message);
    res.json({ prayers: [], total: 0, live: false });
  }
});

// GET /api/family/live-progress — family member activity for the day
router.get('/family/live-progress', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.headers.authorization?.replace('Bearer ', '');
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Get family group members via family_members table
    const familyResult = await db.execute({
      sql: `SELECT fm.child_id, p.display_name, p.avatar_url
            FROM family_members fm
            LEFT JOIN profiles p ON p.user_id = fm.child_id
            WHERE fm.parent_id = ?`,
      args: [userId],
    });

    const members = await Promise.all(
      (familyResult.rows || []).map(async (member) => {
        // Get today's activity count
        const today = new Date().toISOString().split('T')[0];
        const actResult = await db.execute({
          sql: `SELECT COUNT(*) as count, SUM(duration) as total_duration
                FROM child_activity
                WHERE child_id = ? AND DATE(completed_at) = ?`,
          args: [member.child_id, today],
        });
        const stats = actResult.rows?.[0] || {};
        return {
          id: member.child_id,
          name: member.display_name || 'Child',
          avatar: member.avatar_url || null,
          activitiesToday: Number(stats.count) || 0,
          minutesToday: Math.round((Number(stats.total_duration) || 0) / 60),
        };
      })
    );

    // Get active family challenge
    const challengeResult = await db.execute({
      sql: `SELECT * FROM family_challenges WHERE parent_id = ? AND status = 'active' LIMIT 1`,
      args: [userId],
    });
    const challenge = challengeResult.rows?.[0] || null;

    res.json({ members, challenge, live: true });
  } catch (err) {
    console.error('[realtime] family/live-progress error:', err.message);
    res.json({ members: [], challenge: null, live: false });
  }
});

module.exports = router;
