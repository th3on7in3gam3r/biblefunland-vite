/**
 * server/routes/parentalControls.js — Parental controls and progress endpoints
 * PIN-gated controls, daily limits, and progress reports
 */

const express = require('express');
const router = express.Router();
const { queryOne, query, execute } = require('../lib/turso');

// GET /api/parental-controls/:parentId — Get parental controls
router.get('/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;

    if (!parentId) {
      return res.status(400).json({ error: 'parentId is required' });
    }

    const { data, error } = await queryOne(
      `SELECT * FROM parental_controls WHERE parent_id = ? LIMIT 1`,
      [parentId]
    );

    if (error) throw error;

    // Parse ai_toggles if it exists
    if (data && data.ai_toggles) {
      try {
        data.ai_toggles = JSON.parse(data.ai_toggles);
      } catch (e) {
        data.ai_toggles = {};
      }
    }

    // Return default values if no controls exist
    const result = data || {
      parent_id: parentId,
      parent_pin: '4318',
      ai_toggles: {},
      daily_limit: 0
    };

    res.json({ data: result });
  } catch (err) {
    console.error('Error getting parental controls:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/parental-controls/:parentId — Update parental controls with PIN validation
router.put('/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    const { pin, new_pin, daily_limit, ai_toggles } = req.body;

    if (!parentId || !pin) {
      return res.status(400).json({ error: 'parentId and pin are required' });
    }

    // Validate PIN format
    if (!/^\d{4}$/.test(pin)) {
      return res.status(403).json({ error: 'Invalid PIN format', detail: 'invalid_pin' });
    }

    // Validate new_pin format if provided
    if (new_pin && !/^\d{4}$/.test(new_pin)) {
      return res.status(400).json({ error: 'Invalid new PIN format' });
    }

    // Get current controls to verify PIN
    const { data: currentControls } = await queryOne(
      `SELECT parent_pin FROM parental_controls WHERE parent_id = ? LIMIT 1`,
      [parentId]
    );

    // Verify current PIN (default is 4318 if no controls exist)
    const currentPin = currentControls?.parent_pin || '4318';
    if (pin !== currentPin) {
      return res.status(403).json({ error: 'Incorrect PIN', detail: 'invalid_pin' });
    }

    // Validate daily_limit if provided
    if (daily_limit !== undefined) {
      const validLimits = [0, 15, 30, 45, 60];
      if (!validLimits.includes(daily_limit)) {
        return res.status(400).json({ 
          error: 'Invalid daily limit', 
          detail: 'invalid_daily_limit',
          validValues: validLimits
        });
      }
    }

    // Prepare ai_toggles JSON string
    const aiTogglesStr = ai_toggles ? JSON.stringify(ai_toggles) : null;

    // Update parental controls
    const { error } = await execute(
      `INSERT INTO parental_controls (parent_id, parent_pin, ai_toggles, daily_limit, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(parent_id) DO UPDATE SET
         parent_pin = COALESCE(?, parent_pin),
         ai_toggles = COALESCE(?, ai_toggles),
         daily_limit = COALESCE(?, daily_limit),
         updated_at = datetime('now')`,
      [
        parentId,
        new_pin || currentPin,
        aiTogglesStr,
        daily_limit ?? null,
        new_pin || null,
        aiTogglesStr,
        daily_limit ?? null
      ]
    );

    if (error) throw error;

    res.json({ success: true, message: 'Parental controls updated' });
  } catch (err) {
    console.error('Error updating parental controls:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/progress/:childId — Get progress report for a child
router.get('/progress/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const { period = '7d' } = req.query;

    if (!childId) {
      return res.status(400).json({ error: 'childId is required' });
    }

    let dateFilter = '';
    let startDate;

    if (period === '7d') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = `AND completed_at >= ?`;
    } else if (period === '30d') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = `AND completed_at >= ?`;
    }

    const activityParams = [childId];
    if (dateFilter) activityParams.push(startDate.toISOString());

    const { data: activityData } = await queryOne(
      `SELECT COUNT(*) as totalActivities, SUM(CASE WHEN activity_type = 'quiz' THEN 1 ELSE 0 END) as quizzesCompleted FROM child_activity WHERE child_id = ? ${dateFilter}`,
      activityParams
    );

    const { data: streakData } = await queryOne(
      `SELECT streak FROM streaks WHERE user_id = ? LIMIT 1`,
      [childId]
    );

    const { data: badgesData } = await query(
      `SELECT badge_id FROM badges WHERE user_id = ? ${dateFilter ? 'AND earned_at >= ?' : ''}`,
      dateFilter ? [childId, startDate.toISOString()] : [childId]
    );

    res.json({
      data: {
        streak: streakData?.streak || 0,
        totalDaysRead: activityData?.totalActivities || 0,
        badgesEarned: badgesData?.length || 0,
        quizzesCompleted: activityData?.quizzesCompleted || 0,
        quizAccuracy: 0,
        period
      }
    });
  } catch (err) {
    console.error('Error getting progress:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
