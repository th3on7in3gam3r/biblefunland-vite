/**
 * server/routes/leaderboard.js — Community leaderboard endpoint
 * GET /api/leaderboard/:category — streaks | badges | trivia
 * 5-minute in-memory cache per category
 */

const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../lib/turso');

const VALID_CATEGORIES = ['streaks', 'badges', 'trivia'];
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// In-memory cache: category → { data: LeaderboardEntry[], expiresAt: number }
const cache = new Map();

/**
 * Substitute null/empty/whitespace display_name with "Anonymous"
 */
function sanitizeName(name) {
  if (!name || !name.trim()) return 'Anonymous';
  return name.trim();
}

/**
 * Map raw DB rows to LeaderboardEntry shape with rank
 */
function toEntries(rows) {
  return rows.map((row, i) => ({
    rank: i + 1,
    userId: row.user_id,
    displayName: sanitizeName(row.display_name),
    avatarUrl: row.avatar_url || null,
    score: Number(row.score) || 0,
    isLegendary: row.is_legendary === 1 || row.is_legendary === true,
  }));
}

async function queryStreaks() {
  const { data, error } = await query(
    `SELECT s.user_id,
            COALESCE(NULLIF(TRIM(p.display_name), ''), 'Anonymous') AS display_name,
            p.avatar_url,
            s.streak AS score
     FROM streaks s
     LEFT JOIN profiles p ON p.id = s.user_id
     ORDER BY s.streak DESC
     LIMIT 25`,
    []
  );
  if (error) throw error;
  return toEntries(data || []);
}

async function queryBadges() {
  const { data, error } = await query(
    `SELECT b.user_id,
            COALESCE(NULLIF(TRIM(p.display_name), ''), 'Anonymous') AS display_name,
            p.avatar_url,
            COUNT(b.badge_id) AS score,
            MAX(CASE WHEN b.badge_id LIKE '%legendary%' THEN 1 ELSE 0 END) AS is_legendary
     FROM badges b
     LEFT JOIN profiles p ON p.id = b.user_id
     GROUP BY b.user_id
     ORDER BY score DESC
     LIMIT 25`,
    []
  );
  if (error) throw error;
  return toEntries(data || []);
}

async function queryTrivia() {
  const { data, error } = await query(
    `SELECT ca.child_id AS user_id,
            COALESCE(
              NULLIF(TRIM(cp.display_name), ''),
              NULLIF(TRIM(p.display_name), ''),
              'Anonymous'
            ) AS display_name,
            COALESCE(cp.avatar_url, p.avatar_url) AS avatar_url,
            COUNT(*) AS score
     FROM child_activity ca
     LEFT JOIN child_profiles cp ON cp.id = ca.child_id
     LEFT JOIN profiles p ON p.id = ca.child_id
     WHERE ca.activity_type = 'quiz'
     GROUP BY ca.child_id
     ORDER BY score DESC
     LIMIT 25`,
    []
  );
  if (error) throw error;
  return toEntries(data || []);
}

async function getEntries(category) {
  switch (category) {
    case 'streaks': return queryStreaks();
    case 'badges':  return queryBadges();
    case 'trivia':  return queryTrivia();
    default: throw new Error('Invalid category');
  }
}

/**
 * Get the current user's rank and entry if outside top 25
 */
async function getCurrentUserEntry(category, userId, topEntries) {
  // Check if already in top 25
  const inTop = topEntries.find(e => e.userId === userId);
  if (inTop) return null;

  try {
    let rankRow;
    if (category === 'streaks') {
      const { data } = await queryOne(
        `SELECT s.user_id,
                COALESCE(NULLIF(TRIM(p.display_name), ''), 'Anonymous') AS display_name,
                p.avatar_url,
                s.streak AS score,
                (SELECT COUNT(*) FROM streaks WHERE streak > s.streak) + 1 AS rank
         FROM streaks s
         LEFT JOIN profiles p ON p.id = s.user_id
         WHERE s.user_id = ?`,
        [userId]
      );
      rankRow = data;
    } else if (category === 'badges') {
      const { data } = await queryOne(
        `SELECT b.user_id,
                COALESCE(NULLIF(TRIM(p.display_name), ''), 'Anonymous') AS display_name,
                p.avatar_url,
                COUNT(b.badge_id) AS score,
                MAX(CASE WHEN b.badge_id LIKE '%legendary%' THEN 1 ELSE 0 END) AS is_legendary,
                (SELECT COUNT(DISTINCT user_id) FROM badges
                 GROUP BY user_id HAVING COUNT(badge_id) > (SELECT COUNT(*) FROM badges WHERE user_id = ?)) + 1 AS rank
         FROM badges b
         LEFT JOIN profiles p ON p.id = b.user_id
         WHERE b.user_id = ?
         GROUP BY b.user_id`,
        [userId, userId]
      );
      rankRow = data;
    } else if (category === 'trivia') {
      const { data } = await queryOne(
        `SELECT ca.child_id AS user_id,
                COALESCE(NULLIF(TRIM(cp.display_name), ''), NULLIF(TRIM(p.display_name), ''), 'Anonymous') AS display_name,
                COALESCE(cp.avatar_url, p.avatar_url) AS avatar_url,
                COUNT(*) AS score,
                (SELECT COUNT(DISTINCT child_id) FROM child_activity
                 WHERE activity_type = 'quiz'
                 GROUP BY child_id HAVING COUNT(*) > (SELECT COUNT(*) FROM child_activity WHERE child_id = ? AND activity_type = 'quiz')) + 1 AS rank
         FROM child_activity ca
         LEFT JOIN child_profiles cp ON cp.id = ca.child_id
         LEFT JOIN profiles p ON p.id = ca.child_id
         WHERE ca.child_id = ? AND ca.activity_type = 'quiz'
         GROUP BY ca.child_id`,
        [userId, userId]
      );
      rankRow = data;
    }

    if (!rankRow) return null;

    return {
      rank: Number(rankRow.rank) || 26,
      userId: rankRow.user_id,
      displayName: sanitizeName(rankRow.display_name),
      avatarUrl: rankRow.avatar_url || null,
      score: Number(rankRow.score) || 0,
      isLegendary: rankRow.is_legendary === 1 || rankRow.is_legendary === true,
    };
  } catch (err) {
    console.warn('Could not fetch current user rank:', err.message);
    return null;
  }
}

// GET /api/leaderboard/:category
router.get('/:category', async (req, res) => {
  const { category } = req.params;
  const { userId } = req.query;

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `Invalid category. Use: ${VALID_CATEGORIES.join(', ')}`
    });
  }

  try {
    // Check cache
    const cached = cache.get(category);
    let entries;
    if (cached && Date.now() < cached.expiresAt) {
      entries = cached.data;
    } else {
      entries = await getEntries(category);
      cache.set(category, { data: entries, expiresAt: Date.now() + CACHE_TTL });
    }

    // Current user rank (never cached)
    let currentUser = null;
    if (userId) {
      currentUser = await getCurrentUserEntry(category, userId, entries);
    }

    res.json({ entries, currentUser });
  } catch (err) {
    console.error(`[Leaderboard] Error fetching ${category}:`, err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

module.exports = router;
