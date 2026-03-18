/**
 * db.js — BibleFunLand database layer for Turso
 *
 * Every function here mirrors the equivalent in supabase.js
 * so your pages and context files don't need to change.
 *
 * Import pattern (replace supabase imports with these):
 *   import { getStreak, upsertStreak, ... } from '../lib/db'
 */

import { query, queryOne, execute } from './turso'

// ─── IDs ──────────────────────────────────────────────────────────────────────
// Turso uses SQLite which doesn't have gen_random_uuid().
// We generate IDs in JS instead.
function uid() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

export async function getStreak(userId) {
  return queryOne(
    `SELECT * FROM streaks WHERE user_id = ? LIMIT 1`,
    [userId]
  )
}

export async function upsertStreak(userId, data) {
  const { streak = 0, last_checkin, read_days = '', checkin_count = 0 } = data

  // Try update first, then insert — SQLite upsert pattern
  const { data: existing } = await getStreak(userId)

  if (existing) {
    return execute(
      `UPDATE streaks
       SET streak = ?, last_checkin = ?, read_days = ?, checkin_count = ?, updated_at = ?
       WHERE user_id = ?`,
      [streak, last_checkin, read_days, checkin_count, now(), userId]
    )
  } else {
    return execute(
      `INSERT INTO streaks (id, user_id, streak, last_checkin, read_days, checkin_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid(), userId, streak, last_checkin, read_days, checkin_count, now(), now()]
    )
  }
}

// ─── Prayer Wall ──────────────────────────────────────────────────────────────

export async function getPrayers() {
  return query(
    `SELECT * FROM prayers ORDER BY created_at DESC LIMIT 100`
  )
}

export async function insertPrayer({ name, category, text }) {
  return execute(
    `INSERT INTO prayers (id, name, category, text, pray_count, created_at)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [uid(), name || 'Anonymous', category || 'General', text, now()]
  )
}

export async function incrementPrayCount(id) {
  return execute(
    `UPDATE prayers SET pray_count = pray_count + 1 WHERE id = ?`,
    [id]
  )
}

// ─── Sermon Notes ─────────────────────────────────────────────────────────────

export async function getNotes(userId) {
  return query(
    `SELECT * FROM sermon_notes WHERE user_id = ? ORDER BY updated_at DESC`,
    [userId]
  )
}

export async function upsertNote(note) {
  const { id, user_id, title, speaker, date, scripture, content, tags } = note
  const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '')

  if (id) {
    // Update existing
    return execute(
      `UPDATE sermon_notes
       SET title = ?, speaker = ?, date = ?, scripture = ?, content = ?, tags = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [title, speaker, date, scripture, content, tagsStr, now(), id, user_id]
    )
  } else {
    // Insert new
    return execute(
      `INSERT INTO sermon_notes (id, user_id, title, speaker, date, scripture, content, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid(), user_id, title, speaker, date, scripture, content, tagsStr, now(), now()]
    )
  }
}

export async function deleteNote(id) {
  return execute(`DELETE FROM sermon_notes WHERE id = ?`, [id])
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export async function getBadges(userId) {
  return query(
    `SELECT * FROM badges WHERE user_id = ?`,
    [userId]
  )
}

export async function awardBadge(userId, badgeId) {
  // INSERT OR IGNORE = upsert without error on duplicate
  return execute(
    `INSERT OR IGNORE INTO badges (id, user_id, badge_id, earned_at)
     VALUES (?, ?, ?, ?)`,
    [uid(), userId, badgeId, now()]
  )
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getSubscription(userId) {
  return queryOne(
    `SELECT * FROM subscriptions WHERE user_id = ? LIMIT 1`,
    [userId]
  )
}

export async function upsertSubscription(userId, data) {
  const { stripe_customer_id, stripe_subscription_id, status, plan, expires_at } = data
  const { data: existing } = await getSubscription(userId)

  if (existing) {
    return execute(
      `UPDATE subscriptions
       SET stripe_customer_id = ?, stripe_subscription_id = ?, status = ?, plan = ?, expires_at = ?, updated_at = ?
       WHERE user_id = ?`,
      [stripe_customer_id, stripe_subscription_id, status, plan, expires_at, now(), userId]
    )
  } else {
    return execute(
      `INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, status, plan, expires_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid(), userId, stripe_customer_id, stripe_subscription_id, status || 'inactive', plan || 'free', expires_at, now(), now()]
    )
  }
}

// ─── Testimonies ──────────────────────────────────────────────────────────────

export async function getTestimonies(category = null) {
  if (category && category !== 'All') {
    return query(
      `SELECT * FROM testimonies WHERE status = 'approved' AND category = ? ORDER BY created_at DESC`,
      [category]
    )
  }
  return query(
    `SELECT * FROM testimonies WHERE status = 'approved' ORDER BY created_at DESC`
  )
}

export async function insertTestimony({ name, category, title, text }) {
  return execute(
    `INSERT INTO testimonies (id, name, category, title, text, prayer_count, status, created_at)
     VALUES (?, ?, ?, ?, ?, 0, 'pending', ?)`,
    [uid(), name || 'Anonymous', category, title, text, now()]
  )
}

export async function prayForTestimony(id) {
  return execute(
    `UPDATE testimonies SET prayer_count = prayer_count + 1 WHERE id = ?`,
    [id]
  )
}

// ─── World Prayers ────────────────────────────────────────────────────────────

export async function getWorldPrayerCount(country, date) {
  return queryOne(
    `SELECT count FROM world_prayers WHERE country = ? AND date = ?`,
    [country, date]
  )
}

export async function incrementWorldPrayer(country) {
  const date = new Date().toISOString().split('T')[0]
  const { data: existing } = await getWorldPrayerCount(country, date)

  if (existing) {
    return execute(
      `UPDATE world_prayers SET count = count + 1 WHERE country = ? AND date = ?`,
      [country, date]
    )
  } else {
    return execute(
      `INSERT INTO world_prayers (id, country, date, count) VALUES (?, ?, ?, 1)`,
      [uid(), country, date]
    )
  }
}

// ─── Users (profiles) ─────────────────────────────────────────────────────────
// Clerk handles auth — this stores extra profile data

export async function getProfile(userId) {
  return queryOne(`SELECT * FROM profiles WHERE id = ? LIMIT 1`, [userId])
}

export async function upsertProfile(userId, data) {
  const { display_name, avatar_url, bio } = data
  const { data: existing } = await getProfile(userId)

  if (existing) {
    return execute(
      `UPDATE profiles SET display_name = ?, avatar_url = ?, bio = ?, updated_at = ? WHERE id = ?`,
      [display_name, avatar_url, bio, now(), userId]
    )
  } else {
    return execute(
      `INSERT INTO profiles (id, display_name, avatar_url, bio, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, display_name, avatar_url, bio, now(), now()]
    )
  }
}

// ─── Reading Plans ────────────────────────────────────────────────────────────

export async function getReadingProgress(userId) {
  return query(`SELECT * FROM reading_progress WHERE user_id = ?`, [userId])
}

export async function updateReadingProgress(userId, planId, day, completed) {
  // SQLite INSERT OR REPLACE pattern
  return execute(
    `INSERT OR REPLACE INTO reading_progress (id, user_id, plan_id, day, completed, updated_at)
     VALUES ((SELECT id FROM reading_progress WHERE user_id = ? AND plan_id = ? AND day = ?), ?, ?, ?, ?, ?)`,
    [userId, planId, day, userId, planId, day, completed ? 1 : 0, now()]
  )
}

// ─── Community Chat ───────────────────────────────────────────────────────────

export async function getMessages(room, limit = 50) {
  return query(`SELECT * FROM messages WHERE room = ? ORDER BY created_at DESC LIMIT ?`, [room, limit])
}

export async function insertMessage(userId, room, text, userDisplayName) {
  return execute(
    `INSERT INTO messages (id, user_id, room, text, user_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uid(), userId, room, text, userDisplayName, now()]
  )
}
