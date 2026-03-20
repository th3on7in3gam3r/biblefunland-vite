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

export async function deleteChildProfile(id, parentId) {
  return execute(`DELETE FROM child_profiles WHERE id = ? AND parent_id = ?`, [id, parentId])
}

// ── Parental Controls ─────────────────────────────────────────────────────────

export async function getParentalControls(parentId) {
  const { data } = await queryOne(
    `SELECT * FROM parental_controls WHERE parent_id = ? LIMIT 1`,
    [parentId]
  )
  if (data && data.ai_toggles) {
    try { data.ai_toggles = JSON.parse(data.ai_toggles) } catch { data.ai_toggles = {} }
  }
  return { data: data || { parent_id: parentId, ai_toggles: {}, daily_limit: 0, parent_pin: '4318' } }
}

export async function upsertParentalControls(parentId, data) {
  const { ai_toggles, daily_limit, parent_pin } = data
  const togglesStr = JSON.stringify(ai_toggles || {})
  const { data: existing } = await queryOne(`SELECT parent_id FROM parental_controls WHERE parent_id = ?`, [parentId])

  if (existing) {
    return execute(
      `UPDATE parental_controls
       SET ai_toggles = ?, daily_limit = ?, parent_pin = ?, updated_at = ?
       WHERE parent_id = ?`,
      [togglesStr, daily_limit ?? 0, parent_pin ?? '4318', now(), parentId]
    )
  } else {
    return execute(
      `INSERT INTO parental_controls (parent_id, ai_toggles, daily_limit, parent_pin, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [parentId, togglesStr, daily_limit ?? 0, parent_pin ?? '4318', now()]
    )
  }
}

// ── Family Devotional Tracking ───────────────────────────────────────────────

export async function getFamilyProgress(planId) {
  return query(`SELECT * FROM family_devotional_progress WHERE plan_id = ?`, [planId])
}

export async function updateFamilyProgress(planId, childId, day, status) {
  const completed_at = status === 'completed' ? now() : null
  const { data: existing } = await queryOne(
    `SELECT plan_id FROM family_devotional_progress WHERE plan_id = ? AND child_id = ? AND day_number = ?`,
    [planId, childId, day]
  )

  if (existing) {
    return execute(
      `UPDATE family_devotional_progress SET status = ?, completed_at = ?
       WHERE plan_id = ? AND child_id = ? AND day_number = ?`,
      [status, completed_at, planId, childId, day]
    )
  } else {
    return execute(
      `INSERT INTO family_devotional_progress (plan_id, child_id, day_number, status, completed_at)
       VALUES (?, ?, ?, ?, ?)`,
      [planId, childId, day, status, completed_at]
    )
  }
}

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
  const { display_name, avatar_url, bio, favorite_verse, age, role, is_age_locked } = data
  const { data: existing } = await getProfile(userId)

  // Turso only accepts: null, string, number, bigint, ArrayBuffer
  // Sanitize every value — never pass undefined, NaN, or objects
  const safeAge = (age !== null && age !== undefined && !isNaN(age)) ? Number(age) : null

  if (existing) {
    return execute(
      `UPDATE profiles
       SET display_name = ?, avatar_url = ?, bio = ?, favorite_verse = ?,
           age = ?, role = ?, is_age_locked = ?, updated_at = ?
       WHERE id = ?`,
      [
        display_name ?? existing.display_name ?? '',
        avatar_url ?? existing.avatar_url ?? 'david',
        bio ?? existing.bio ?? '',
        favorite_verse ?? existing.favorite_verse ?? '',
        safeAge ?? existing.age ?? null,
        role ?? existing.role ?? 'General',
        is_age_locked ?? existing.is_age_locked ?? 0,
        now(),
        userId
      ]
    )
  } else {
    return execute(
      `INSERT INTO profiles (id, display_name, avatar_url, bio, favorite_verse, age, role, is_age_locked, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        display_name || '',
        avatar_url || 'david',
        bio || '',
        favorite_verse || '',
        safeAge,
        role || 'General',
        is_age_locked != null ? Number(is_age_locked) : 0,
        now(),
        now()
      ]
    )
  }
}

// ─── Child Profiles ───────────────────────────────────────────────────────────

export async function getChildProfiles(parentId) {
  try {
    return await query(
      `SELECT * FROM child_profiles WHERE parent_id = ? ORDER BY created_at DESC`,
      [parentId]
    )
  } catch (error) {
    // Handle missing table or other database errors
    if (error.message?.includes('no such table') || error.message?.includes('child_profiles')) {
      console.warn('Child profiles table not found, returning empty array')
      return { data: [] }
    }
    throw error
  }
}

export async function upsertChildProfile(parentId, data) {
  const { display_name, avatar_url, age } = data
  const { data: existing } = await queryOne(`SELECT id FROM child_profiles WHERE parent_id = ? AND display_name = ?`, [parentId, display_name])

  if (existing) {
    return execute(
      `UPDATE child_profiles
       SET display_name = ?, avatar_url = ?, age = ?, updated_at = ?
       WHERE id = ? AND parent_id = ?`,
      [display_name, avatar_url, age || null, now(), existing.id, parentId]
    )
  } else {
    return execute(
      `INSERT INTO child_profiles (id, parent_id, display_name, avatar_url, age, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uid(), parentId, display_name, avatar_url || 'david', age || null, now(), now()]
    )
  }
}

// ─── Child Activity Tracking ───────────────────────────────────────────────────

export async function getChildActivity(childId, limit = 50) {
  return query(
    `SELECT * FROM child_activity WHERE child_id = ? ORDER BY completed_at DESC LIMIT ?`,
    [childId, limit]
  )
}

export async function addChildActivity(childId, activityType, activityData = null, duration = 0) {
  try {
    return await execute(
      `INSERT INTO child_activity (id, child_id, activity_type, activity_data, duration, completed_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uid(), childId, activityType, activityData ? JSON.stringify(activityData) : null, duration, now()]
    )
  } catch (error) {
    // Handle missing table or other database errors
    if (error.message?.includes('no such table') || error.message?.includes('child_activity')) {
      console.warn('Child activity table not found, skipping activity tracking')
      return { success: false }
    }
    throw error
  }
}

export async function getChildActivityStats(childId, days = 7) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  
  return query(
    `SELECT 
      activity_type,
      COUNT(*) as count,
      SUM(duration) as total_duration,
      DATE(completed_at) as date
    FROM child_activity 
    WHERE child_id = ? AND completed_at >= ?
    GROUP BY activity_type, DATE(completed_at)
    ORDER BY date DESC, activity_type`,
    [childId, cutoffStr]
  )
}

// ─── Scripture Memory Verses ──────────────────────────────────────────────────

export async function getMemoryVerses(userId, userType = 'parent') {
  return query(
    `SELECT * FROM memory_verses 
     WHERE assigned_to = ? AND user_type = ? 
     ORDER BY assigned_date DESC`,
    [userId, userType]
  )
}

export async function addMemoryVerse(verseData) {
  const {
    reference, text, category, difficulty, assigned_by, 
    assigned_to, user_type, status, assigned_date, progress = 0
  } = verseData

  return execute(
    `INSERT INTO memory_verses (
      id, reference, text, category, difficulty, assigned_by,
      assigned_to, user_type, status, assigned_date, progress, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uid(), reference, text, category, difficulty, assigned_by,
      assigned_to, user_type, status, assigned_date, progress, now()
    ]
  )
}

export async function updateMemoryVerse(verseId, updates) {
  const fields = []
  const values = []

  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = ?`)
    values.push(value)
  })

  values.push(verseId)

  return execute(
    `UPDATE memory_verses SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
    [...values, now()]
  )
}

export async function deleteMemoryVerse(verseId) {
  return execute(`DELETE FROM memory_verses WHERE id = ?`, [verseId])
}

export async function getMemoryVerseStats(userId, userType = 'parent') {
  return query(
    `SELECT 
      status,
      difficulty,
      category,
      COUNT(*) as count,
      AVG(progress) as avg_progress
    FROM memory_verses 
    WHERE assigned_to = ? AND user_type = ?
    GROUP BY status, difficulty, category`,
    [userId, userType]
  )
}

// ─── Family Devotional Plans ──────────────────────────────────────────────────

export async function getFamilyPlans(parentId) {
  return query(
    `SELECT * FROM family_devotional_progress 
     WHERE parent_id = ? 
     ORDER BY created_at DESC`,
    [parentId]
  )
}

export async function upsertFamilyPlan(parentId, data) {
  const { title, total_days } = data
  const { data: existing } = await queryOne(
    `SELECT id FROM family_devotional_progress WHERE parent_id = ? AND title = ?`,
    [parentId, title]
  )

  if (existing) {
    return execute(
      `UPDATE family_devotional_progress 
       SET total_days = ?, updated_at = ? 
       WHERE id = ? AND parent_id = ?`,
      [total_days, now(), existing.id, parentId]
    )
  } else {
    return execute(
      `INSERT INTO family_devotional_progress (id, parent_id, title, total_days, current_day, completed_days, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, '[]', ?, ?)`,
      [uid(), parentId, title, total_days, now(), now()]
    )
  }
}

// ─── Teacher Classroom System ───────────────────────────────────────────────────

export async function getTeacherClassrooms(teacherId) {
  return query(
    `SELECT c.*, 
            (SELECT COUNT(*) FROM classroom_students WHERE classroom_id = c.id) as student_count
     FROM classrooms c 
     WHERE c.teacher_id = ? 
     ORDER BY c.created_at DESC`,
    [teacherId]
  )
}

export async function createClassroom(classroomData) {
  const {
    teacher_id, name, grade_level, subject, description, max_students, settings
  } = classroomData

  return execute(
    `INSERT INTO classrooms (
      id, teacher_id, name, grade_level, subject, description, 
      max_students, settings, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uid(), teacher_id, name, grade_level, subject, description,
      max_students, JSON.stringify(settings), now(), now()
    ]
  )
}

export async function getClassroomWithStudents(classroomId) {
  return query(
    `SELECT c.*, 
            JSON_GROUP_ARRAY(
              JSON_OBJECT(
                'id', s.id,
                'student_name', s.student_name,
                'parent_email', s.parent_email,
                'grade', s.grade,
                'age', s.age,
                'notes', s.notes,
                'joined_at', s.joined_at
              )
            ) as students
     FROM classrooms c
     LEFT JOIN classroom_students s ON c.id = s.classroom_id
     WHERE c.id = ?
     GROUP BY c.id`,
    [classroomId]
  )
}

export async function addStudentToClassroom(studentData) {
  const {
    classroom_id, student_name, parent_email, grade, age, notes
  } = studentData

  return execute(
    `INSERT INTO classroom_students (
      id, classroom_id, student_name, parent_email, grade, age, notes, joined_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [uid(), classroom_id, student_name, parent_email, grade, age, notes, now()]
  )
}

export async function removeStudentFromClassroom(studentId) {
  return execute(`DELETE FROM classroom_students WHERE id = ?`, [studentId])
}

export async function assignActivityToClassroom(activityData) {
  const {
    classroom_id, title, description, type, content, due_date, points, difficulty
  } = activityData

  return execute(
    `INSERT INTO classroom_activities (
      id, classroom_id, title, description, type, content, 
      due_date, points, difficulty, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uid(), classroom_id, title, description, type, content,
      due_date, points, difficulty, now()
    ]
  )
}

export async function getClassroomProgress(classroomId) {
  return query(
    `SELECT 
        c.id as classroom_id,
        c.name as classroom_name,
        COUNT(s.id) as total_students,
        COUNT(DISTINCT a.id) as total_activities,
        COUNT(DISTINCT sub.id) as completed_submissions,
        AVG(CASE WHEN sub.completed_at IS NOT NULL THEN sub.points_earned END) as avg_score
     FROM classrooms c
     LEFT JOIN classroom_students s ON c.id = s.classroom_id
     LEFT JOIN classroom_activities a ON c.id = a.classroom_id
     LEFT JOIN classroom_submissions sub ON a.id = sub.activity_id
     WHERE c.id = ?
     GROUP BY c.id`,
    [classroomId]
  )
}

export async function updateClassroomSettings(classroomId, settings) {
  return execute(
    `UPDATE classrooms 
     SET settings = ?, updated_at = ? 
     WHERE id = ?`,
    [JSON.stringify(settings), now(), classroomId]
  )
}

// ─── Family Challenges System ───────────────────────────────────────────────────

export async function createFamilyChallenge(challengeData) {
  const {
    id, family_id, challenge_id, participants, start_date, end_date, progress, status
  } = challengeData

  return execute(
    `INSERT INTO family_challenges (
      id, family_id, challenge_id, participants, start_date, end_date, 
      progress, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, family_id, challenge_id, JSON.stringify(participants), start_date, end_date,
      JSON.stringify(progress), status, now(), now()
    ]
  )
}

export async function updateFamilyChallengeProgress(challengeData) {
  const { id, progress, status, completed_date } = challengeData

  return execute(
    `UPDATE family_challenges 
     SET progress = ?, status = ?, completed_date = ?, updated_at = ? 
     WHERE id = ?`,
    [JSON.stringify(progress), status, completed_date, now(), id]
  )
}

export async function getFamilyChallenges(familyId) {
  return query(
    `SELECT * FROM family_challenges 
     WHERE family_id = ? 
     ORDER BY created_at DESC`,
    [familyId]
  )
}

export async function addBadge(userId, badgeName, badgeIcon) {
  return execute(
    `INSERT INTO badges (id, user_id, badge_id, icon, earned_at) 
     VALUES (?, ?, ?, ?, ?)`,
    [uid(), userId, badgeName, badgeIcon, now()]
  )
}

export async function updatePoints(userId, points) {
  // This would update a user points table
  console.log(`Adding ${points} points to user ${userId}`)
  return { success: true }
}

export async function unlockContent(userId, contentId) {
  // This would unlock premium content for the user
  console.log(`Unlocking content ${contentId} for user ${userId}`)
  return { success: true }
}
