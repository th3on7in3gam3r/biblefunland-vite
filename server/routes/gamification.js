/**
 * server/routes/gamification.js — Gamification API endpoints
 */
const express = require('express');
const router = express.Router();
const { query, queryOne, execute } = require('../lib/turso');

const BADGE_CATEGORY = {
  streak: 'Streak Champion',
  practice: 'Practice Hero',
  family: 'Family Builder',
};

function safeDate(input) {
  if (!input) return new Date().toISOString();
  const maybe = new Date(input);
  return Number.isNaN(maybe.getTime()) ? new Date().toISOString() : maybe.toISOString();
}

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: progress } = await queryOne(
      `SELECT * FROM user_progress WHERE clerk_user_id = ?`,
      [userId]
    );

    const { data: badges } = await query(
      `SELECT badge_id, earned_at FROM badges WHERE user_id = ? ORDER BY earned_at DESC`,
      [userId]
    );

    const { data: streak } = await queryOne(
      `SELECT streak FROM streaks WHERE user_id = ?`,
      [userId]
    );

    res.json({
      userId,
      progress: progress || { points: 0, streak_days: 0, score: 0, last_activity: null },
      badges: badges || [],
      streak: streak?.streak || 0,
    });
  } catch (err) {
    console.error('[Gamification /user]', err);
    res.status(500).json({ error: 'Could not fetch gamification state' });
  }
});

router.post('/points/earn', async (req, res) => {
  const { userId, points = 5, reason = 'activity' } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO user_progress (clerk_user_id, points, total_score, last_activity)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(clerk_user_id) DO UPDATE SET
         points = points + ?,
         total_score = total_score + ?,
         last_activity = ?`,
      [userId, points, points, now, points, points, now]
    );

    res.json({ success: true, points, reason });
  } catch (err) {
    console.error('[Gamification /points/earn]', err);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

router.post('/streaks/update', async (req, res) => {
  const { userId, date } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const today = new Date(safeDate(date));
  const allDate = today.toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    const existing = await queryOne(
      `SELECT streak_date, streak_days FROM streaks WHERE user_id = ?`,
      [userId]
    );

    let streakDays = 1;
    if (existing.data) {
      const lastDate = existing.data.streak_date ? new Date(existing.data.streak_date) : null;
      if (lastDate) {
        const diffMs = today - lastDate;
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streakDays = existing.data.streak_days + 1;
        } else if (diffDays === 0) {
          streakDays = existing.data.streak_days;
        }
      }
    }

    await execute(
      `INSERT INTO streaks (user_id, streak_date, streak_days)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         streak_date = ?,
         streak_days = ?`,
      [userId, allDate, streakDays, allDate, streakDays]
    );

    // award streak badge thresholds
    const thresholds = [3, 7, 14, 30];
    if (thresholds.includes(streakDays)) {
      await execute(
        `INSERT OR IGNORE INTO badges (user_id, badge_id, earned_at) VALUES (?, ?, ?)`,
        [userId, `streak_${streakDays}`, new Date().toISOString()]
      );
    }

    res.json({ userId, streakDays });
  } catch (err) {
    console.error('[Gamification /streaks/update]', err);
    res.status(500).json({ error: 'Failed to update streaks' });
  }
});

router.post('/badge/award', async (req, res) => {
  const { userId, badgeId, extra = {} } = req.body || {};
  if (!userId || !badgeId) {
    return res.status(400).json({ error: 'userId and badgeId are required' });
  }

  try {
    const earned_at = new Date().toISOString();
    await execute(
      `INSERT OR IGNORE INTO badges (user_id, badge_id, earned_at) VALUES (?, ?, ?)`,
      [userId, badgeId, earned_at]
    );

    res.json({ success: true, badgeId, earned_at, extra });
  } catch (err) {
    console.error('[Gamification /badge/award]', err);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

router.get('/family/:familyId/challenges', async (req, res) => {
  const { familyId } = req.params;

  try {
    const { data } = await query(
      `SELECT * FROM family_challenges WHERE family_id = ? ORDER BY created_at DESC`,
      [familyId]
    );
    res.json({ challenges: data || [] });
  } catch (err) {
    console.error('[Gamification /family/challenges]', err);
    res.status(500).json({ error: 'Failed to fetch family challenges' });
  }
});

router.post('/family/challenge', async (req, res) => {
  const { familyId, title, description, goal = 100, expiresAt } = req.body || {};
  if (!familyId || !title || !description) {
    return res.status(400).json({ error: 'familyId, title, description required' });
  }

  const id = `fc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const created_at = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO family_challenges (id, family_id, title, description, goal, progress, created_by, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [id, familyId, title, description, goal, req.body.createdBy || 'system', created_at, expiresAt || null]
    );

    res.status(201).json({ id, familyId, title, description, goal, created_at, expiresAt });
  } catch (err) {
    console.error('[Gamification /family/challenge]', err);
    res.status(500).json({ error: 'Failed to create family challenge' });
  }
});

router.patch('/family/challenge/:id/progress', async (req, res) => {
  const { id } = req.params;
  const { increment = 1 } = req.body || {};

  try {
    const existing = await queryOne('SELECT * FROM family_challenges WHERE id = ?', [id]);
    if (!existing.data) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const newProgress = (existing.data.progress || 0) + Number(increment);
    await execute('UPDATE family_challenges SET progress = ? WHERE id = ?', [newProgress, id]);

    res.json({ id, progress: newProgress, goal: existing.data.goal });
  } catch (err) {
    console.error('[Gamification /family/challenge progress]', err);
    res.status(500).json({ error: 'Could not update challenge progress' });
  }
});

module.exports = router;
