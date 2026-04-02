/**
 * db.js — BibleFunLand database layer for Turso
 *
 * Every function here mirrors the equivalent in supabase.js
 * so your pages and context files don't need to change.
 *
 * Import pattern (replace supabase imports with these):
 *   import { getStreak, upsertStreak, ... } from '../lib/db'
 */

export { query, queryOne, execute } from './turso';
import { query, queryOne, execute } from './turso';
import API_URL from './api-config';

// ─── IDs ──────────────────────────────────────────────────────────────────────
// Turso uses SQLite which doesn't have gen_random_uuid().
// We generate IDs in JS instead.
function uid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

export async function getStreak(userId) {
  return queryOne(`SELECT * FROM streaks WHERE user_id = ? LIMIT 1`, [userId]);
}

export async function upsertStreak(userId, data) {
  const { streak = 0, last_checkin, read_days = '', checkin_count = 0 } = data;

  // Try update first, then insert — SQLite upsert pattern
  const { data: existing } = await getStreak(userId);

  if (existing) {
    return execute(
      `UPDATE streaks
       SET streak = ?, last_checkin = ?, read_days = ?, checkin_count = ?, updated_at = ?
       WHERE user_id = ?`,
      [streak, last_checkin, read_days, checkin_count, now(), userId]
    );
  } else {
    return execute(
      `INSERT INTO streaks (id, user_id, streak, last_checkin, read_days, checkin_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid(), userId, streak, last_checkin, read_days, checkin_count, now(), now()]
    );
  }
}

// ─── Prayer Wall ──────────────────────────────────────────────────────────────

// API_URL imported above

export async function getPrayers() {
  const res = await fetch(`${API_URL}/api/prayers/recent`);
  if (!res.ok) throw new Error('Error fetching prayers');
  return res.json();
}

export async function insertPrayer({
  userId,
  name,
  category,
  text,
  country,
  city,
  lat,
  lng,
  bibleReference,
}) {
  const res = await fetch(`${API_URL}/api/prayers/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name, category, text, country, city, lat, lng, bibleReference }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error submitting prayer');
  }

  return res.json();
}

export async function incrementPrayCount(id) {
  const res = await fetch(`${API_URL}/api/prayers/pray/${id}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error updating pray count');
  }

  return res.json();
}

export async function getPendingPrayers() {
  const res = await fetch(`${API_URL}/api/prayers/pending`);
  if (!res.ok) throw new Error('Error fetching pending prayers');
  return res.json();
}

export async function moderatePrayer(id, action, moderatingUser) {
  const res = await fetch(`${API_URL}/api/prayers/moderate/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, moderatingUser }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error moderating prayer');
  }
  return res.json();
}

// ─── Sermon Notes ─────────────────────────────────────────────────────────────

export async function getNotes(userId) {
  return query(`SELECT * FROM sermon_notes WHERE user_id = ? ORDER BY updated_at DESC`, [userId]);
}

export async function upsertNote(note) {
  const { id, user_id, title, speaker, date, scripture, content, tags } = note;
  const tagsStr = Array.isArray(tags) ? tags.join(',') : tags || '';

  if (id) {
    // Update existing
    return execute(
      `UPDATE sermon_notes
       SET title = ?, speaker = ?, date = ?, scripture = ?, content = ?, tags = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [title, speaker, date, scripture, content, tagsStr, now(), id, user_id]
    );
  } else {
    // Insert new
    return execute(
      `INSERT INTO sermon_notes (id, user_id, title, speaker, date, scripture, content, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid(), user_id, title, speaker, date, scripture, content, tagsStr, now(), now()]
    );
  }
}

export async function deleteNote(id) {
  return execute(`DELETE FROM sermon_notes WHERE id = ?`, [id]);
}

export async function deleteChildProfile(id, parentId) {
  return execute(`DELETE FROM child_profiles WHERE id = ? AND parent_id = ?`, [id, parentId]);
}

// ── Parental Controls ─────────────────────────────────────────────────────────

export async function getParentalControls(parentId) {
  const { data } = await queryOne(`SELECT * FROM parental_controls WHERE parent_id = ? LIMIT 1`, [
    parentId,
  ]);
  if (data && data.ai_toggles) {
    try {
      data.ai_toggles = JSON.parse(data.ai_toggles);
    } catch {
      data.ai_toggles = {};
    }
  }
  return {
    data: data || { parent_id: parentId, ai_toggles: {}, daily_limit: 0, parent_pin: '4318' },
  };
}

export async function upsertParentalControls(parentId, data) {
  const { ai_toggles, daily_limit, parent_pin } = data;
  const togglesStr = JSON.stringify(ai_toggles || {});
  const { data: existing } = await queryOne(
    `SELECT parent_id FROM parental_controls WHERE parent_id = ?`,
    [parentId]
  );

  if (existing) {
    return execute(
      `UPDATE parental_controls
       SET ai_toggles = ?, daily_limit = ?, parent_pin = ?, updated_at = ?
       WHERE parent_id = ?`,
      [togglesStr, daily_limit ?? 0, parent_pin ?? '4318', now(), parentId]
    );
  } else {
    return execute(
      `INSERT INTO parental_controls (parent_id, ai_toggles, daily_limit, parent_pin, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [parentId, togglesStr, daily_limit ?? 0, parent_pin ?? '4318', now()]
    );
  }
}

// ── Family Devotional Tracking ───────────────────────────────────────────────

export async function getFamilyProgress(planId) {
  return query(`SELECT * FROM family_devotional_progress WHERE plan_id = ?`, [planId]);
}

export async function updateFamilyProgress(planId, childId, day, status) {
  const completed_at = status === 'completed' ? now() : null;
  const { data: existing } = await queryOne(
    `SELECT plan_id FROM family_devotional_progress WHERE plan_id = ? AND child_id = ? AND day_number = ?`,
    [planId, childId, day]
  );

  if (existing) {
    return execute(
      `UPDATE family_devotional_progress SET status = ?, completed_at = ?
       WHERE plan_id = ? AND child_id = ? AND day_number = ?`,
      [status, completed_at, planId, childId, day]
    );
  } else {
    return execute(
      `INSERT INTO family_devotional_progress (plan_id, child_id, day_number, status, completed_at)
       VALUES (?, ?, ?, ?, ?)`,
      [planId, childId, day, status, completed_at]
    );
  }
}

export async function getActivityHistory(parentId, limit = 30) {
  return query(
    `SELECT ca.id, ca.child_id, ca.activity_type, ca.activity_data, ca.duration, ca.completed_at, cp.display_name AS child_name
     FROM child_activity ca
     LEFT JOIN child_profiles cp ON cp.id = ca.child_id
     WHERE cp.parent_id = ?
     ORDER BY ca.completed_at DESC
     LIMIT ?`,
    [parentId, limit]
  );
}

export async function getUserProgressSummary(userId) {
  return queryOne(`SELECT * FROM user_progress WHERE clerk_user_id = ?`, [userId]);
}

export async function getBadges(userId) {
  return query(`SELECT * FROM badges WHERE user_id = ?`, [userId]);
}

export async function awardBadge(userId, badgeId) {
  // INSERT OR IGNORE = upsert without error on duplicate
  return execute(
    `INSERT OR IGNORE INTO badges (id, user_id, badge_id, earned_at)
     VALUES (?, ?, ?, ?)`,
    [uid(), userId, badgeId, now()]
  );
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getSubscription(userId) {
  return queryOne(`SELECT * FROM subscriptions WHERE user_id = ? LIMIT 1`, [userId]);
}

export async function upsertSubscription(userId, data) {
  const { stripe_customer_id, stripe_subscription_id, status, plan, expires_at } = data;
  const { data: existing } = await getSubscription(userId);

  if (existing) {
    return execute(
      `UPDATE subscriptions
       SET stripe_customer_id = ?, stripe_subscription_id = ?, status = ?, plan = ?, expires_at = ?, updated_at = ?
       WHERE user_id = ?`,
      [stripe_customer_id, stripe_subscription_id, status, plan, expires_at, now(), userId]
    );
  } else {
    return execute(
      `INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, status, plan, expires_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uid(),
        userId,
        stripe_customer_id,
        stripe_subscription_id,
        status || 'inactive',
        plan || 'free',
        expires_at,
        now(),
        now(),
      ]
    );
  }
}

// ─── Testimonies ──────────────────────────────────────────────────────────────

export async function getTestimonies(category = null) {
  if (category && category !== 'All') {
    return query(
      `SELECT * FROM testimonies WHERE status = 'approved' AND category = ? ORDER BY created_at DESC`,
      [category]
    );
  }
  return query(`SELECT * FROM testimonies WHERE status = 'approved' ORDER BY created_at DESC`);
}

export async function insertTestimony({ name, category, title, text }) {
  return execute(
    `INSERT INTO testimonies (id, name, category, title, text, prayer_count, status, created_at)
     VALUES (?, ?, ?, ?, ?, 0, 'pending', ?)`,
    [uid(), name || 'Anonymous', category, title, text, now()]
  );
}

export async function prayForTestimony(id) {
  return execute(`UPDATE testimonies SET prayer_count = prayer_count + 1 WHERE id = ?`, [id]);
}

// ─── World Prayers ────────────────────────────────────────────────────────────

export async function getWorldPrayerCount(country, date) {
  return queryOne(`SELECT count FROM world_prayers WHERE country = ? AND date = ?`, [
    country,
    date,
  ]);
}

export async function incrementWorldPrayer(country) {
  const date = new Date().toISOString().split('T')[0];
  const { data: existing } = await getWorldPrayerCount(country, date);

  if (existing) {
    return execute(`UPDATE world_prayers SET count = count + 1 WHERE country = ? AND date = ?`, [
      country,
      date,
    ]);
  } else {
    return execute(`INSERT INTO world_prayers (id, country, date, count) VALUES (?, ?, ?, 1)`, [
      uid(),
      country,
      date,
    ]);
  }
}

// ─── Users (profiles) ─────────────────────────────────────────────────────────
// Clerk handles auth — this stores extra profile data

export async function getProfile(userId) {
  return queryOne(`SELECT * FROM profiles WHERE id = ? LIMIT 1`, [userId]);
}

export async function upsertProfile(userId, data) {
  const {
    display_name,
    avatar_url,
    bio,
    favorite_verse,
    age,
    role,
    is_age_locked,
    goal,
    reading_plan,
  } = data;
  const { data: existing } = await getProfile(userId);

  // Turso only accepts: null, string, number, bigint, ArrayBuffer
  // Sanitize every value — never pass undefined, NaN, or objects
  const safeAge = age !== null && age !== undefined && !isNaN(age) ? Number(age) : null;

  if (existing) {
    return execute(
      `UPDATE profiles
       SET display_name = ?, avatar_url = ?, bio = ?, favorite_verse = ?,
           age = ?, role = ?, is_age_locked = ?, goal = ?, reading_plan = ?, updated_at = ?
       WHERE id = ?`,
      [
        display_name ?? existing.display_name ?? '',
        avatar_url ?? existing.avatar_url ?? 'david',
        bio ?? existing.bio ?? '',
        favorite_verse ?? existing.favorite_verse ?? '',
        safeAge ?? existing.age ?? null,
        role ?? existing.role ?? 'General',
        is_age_locked ?? existing.is_age_locked ?? 0,
        goal ?? existing.goal ?? '',
        reading_plan ?? existing.reading_plan ?? '',
        now(),
        userId,
      ]
    );
  } else {
    return execute(
      `INSERT INTO profiles (id, display_name, avatar_url, bio, favorite_verse, age, role, is_age_locked, goal, reading_plan, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        display_name || '',
        avatar_url || 'david',
        bio || '',
        favorite_verse || '',
        safeAge,
        role || 'General',
        is_age_locked != null ? Number(is_age_locked) : 0,
        goal || '',
        reading_plan || '',
        now(),
        now(),
      ]
    );
  }
}

// ─── Child Profiles ───────────────────────────────────────────────────────────

export async function getChildProfiles(parentId, skipCache = false) {
  try {
    if (skipCache) {
      // Use the query function directly for consistency and error handling
      return await query(
        `SELECT * FROM child_profiles WHERE parent_id = ? ORDER BY created_at DESC`,
        [parentId]
      );
    }

    return await query(
      `SELECT * FROM child_profiles WHERE parent_id = ? ORDER BY created_at DESC`,
      [parentId]
    );
  } catch (error) {
    // Handle missing table or other database errors
    if (error.message?.includes('no such table') || error.message?.includes('child_profiles')) {
      console.warn('Child profiles table not found, returning empty array');
      return { data: [] };
    }
    throw error;
  }
}

export async function upsertChildProfile(parentId, data) {
  const { display_name, avatar_url, age } = data;
  const { data: existing } = await queryOne(
    `SELECT id FROM child_profiles WHERE parent_id = ? AND display_name = ?`,
    [parentId, display_name]
  );

  if (existing) {
    return execute(
      `UPDATE child_profiles
       SET display_name = ?, avatar_url = ?, age = ?, updated_at = ?
       WHERE id = ? AND parent_id = ?`,
      [display_name, avatar_url, age || null, now(), existing.id, parentId]
    );
  } else {
    return execute(
      `INSERT INTO child_profiles (id, parent_id, display_name, avatar_url, age, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uid(), parentId, display_name, avatar_url || 'david', age || null, now(), now()]
    );
  }
}

// ─── Child Activity Tracking ───────────────────────────────────────────────────

export async function getChildActivity(childId, limit = 50) {
  return query(
    `SELECT * FROM child_activity WHERE child_id = ? ORDER BY completed_at DESC LIMIT ?`,
    [childId, limit]
  );
}

export async function addChildActivity(childId, activityType, activityData = null, duration = 0) {
  try {
    return await execute(
      `INSERT INTO child_activity (id, child_id, activity_type, activity_data, duration, completed_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uid(),
        childId,
        activityType,
        activityData ? JSON.stringify(activityData) : null,
        duration,
        now(),
      ]
    );
  } catch (error) {
    // Handle missing table or other database errors
    if (error.message?.includes('no such table') || error.message?.includes('child_activity')) {
      console.warn('Child activity table not found, skipping activity tracking');
      return { success: false };
    }
    throw error;
  }
}

export async function getChildActivityStats(childId, days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

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
  );
}

// ─── Scripture Memory Verses ──────────────────────────────────────────────────

export async function getMemoryVerses(userId, userType = 'parent') {
  return query(
    `SELECT * FROM memory_verses 
     WHERE assigned_to = ? AND user_type = ? 
     ORDER BY assigned_date DESC`,
    [userId, userType]
  );
}

export async function addMemoryVerse(verseData) {
  const {
    reference,
    text,
    category,
    difficulty,
    assigned_by,
    assigned_to,
    user_type,
    status,
    assigned_date,
    progress = 0,
  } = verseData;

  return execute(
    `INSERT INTO memory_verses (
      id, reference, text, category, difficulty, assigned_by,
      assigned_to, user_type, status, assigned_date, progress, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uid(),
      reference,
      text,
      category,
      difficulty,
      assigned_by,
      assigned_to,
      user_type,
      status,
      assigned_date,
      progress,
      now(),
    ]
  );
}

export async function updateMemoryVerse(verseId, updates) {
  const fields = [];
  const values = [];

  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });

  values.push(verseId);

  return execute(`UPDATE memory_verses SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`, [
    ...values,
    now(),
  ]);
}

export async function deleteMemoryVerse(verseId) {
  return execute(`DELETE FROM memory_verses WHERE id = ?`, [verseId]);
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
  );
}

// ─── Family Devotional Plans ──────────────────────────────────────────────────

export async function getFamilyPlans(parentId, skipCache = false) {
  if (skipCache) {
    return await query(
      `SELECT id, parent_id, title, description, total_days, created_at
            FROM family_plans 
            WHERE parent_id = ? 
            ORDER BY created_at DESC`,
      [parentId]
    );
  }

  return query(
    `SELECT id, parent_id, title, description, total_days, created_at
     FROM family_plans 
     WHERE parent_id = ? 
     ORDER BY created_at DESC`,
    [parentId]
  );
}

export async function upsertFamilyPlan(parentId, data) {
  const { title, description, total_days } = data;
  const planId = uid();

  console.log('Attempting to insert family plan:', { planId, parentId, title, total_days });
  console.log('About to call execute...');
  console.log('Execute function type:', typeof execute);

  const result = await execute(
    `INSERT INTO family_plans (id, parent_id, title, description, total_days, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [planId, parentId, title, description || '', total_days, now()]
  );

  console.log('Family plan insert result:', result);

  // Check if there was an error in the result
  if (result?.error) {
    return { data: null, error: result.error };
  }

  return { data: { id: planId, parent_id: parentId, title, description, total_days }, error: null };
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
  );
}

export async function createClassroom(classroomData) {
  const { teacher_id, name, grade_level, subject, description, max_students, settings } =
    classroomData;

  return execute(
    `INSERT INTO classrooms (
      id, teacher_id, name, grade_level, subject, description, 
      max_students, settings, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uid(),
      teacher_id,
      name,
      grade_level,
      subject,
      description,
      max_students,
      JSON.stringify(settings),
      now(),
      now(),
    ]
  );
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
  );
}

export async function addStudentToClassroom(studentData) {
  const { classroom_id, student_name, parent_email, grade, age, notes } = studentData;

  return execute(
    `INSERT INTO classroom_students (
      id, classroom_id, student_name, parent_email, grade, age, notes, joined_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [uid(), classroom_id, student_name, parent_email, grade, age, notes, now()]
  );
}

export async function removeStudentFromClassroom(studentId) {
  return execute(`DELETE FROM classroom_students WHERE id = ?`, [studentId]);
}

export async function assignActivityToClassroom(activityData) {
  const { classroom_id, title, description, type, content, due_date, points, difficulty } =
    activityData;

  return execute(
    `INSERT INTO classroom_activities (
      id, classroom_id, title, description, type, content, 
      due_date, points, difficulty, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [uid(), classroom_id, title, description, type, content, due_date, points, difficulty, now()]
  );
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
  );
}

export async function updateClassroomSettings(classroomId, settings) {
  return execute(
    `UPDATE classrooms 
     SET settings = ?, updated_at = ? 
     WHERE id = ?`,
    [JSON.stringify(settings), now(), classroomId]
  );
}

// ─── Family Challenges System ───────────────────────────────────────────────────

export async function createFamilyChallenge(challengeData) {
  const { id, family_id, challenge_id, participants, start_date, end_date, progress, status } =
    challengeData;

  return execute(
    `INSERT INTO family_challenges (
      id, family_id, challenge_id, participants, start_date, end_date, 
      progress, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      family_id,
      challenge_id,
      JSON.stringify(participants),
      start_date,
      end_date,
      JSON.stringify(progress),
      status,
      now(),
      now(),
    ]
  );
}

export async function updateFamilyChallengeProgress(challengeData) {
  const { id, progress, status, completed_date } = challengeData;

  return execute(
    `UPDATE family_challenges 
     SET progress = ?, status = ?, completed_date = ?, updated_at = ? 
     WHERE id = ?`,
    [JSON.stringify(progress), status, completed_date, now(), id]
  );
}

export async function getFamilyChallenges(familyId) {
  return query(
    `SELECT * FROM family_challenges 
     WHERE family_id = ? 
     ORDER BY created_at DESC`,
    [familyId]
  );
}

export async function addBadge(userId, badgeName, badgeIcon) {
  return execute(
    `INSERT INTO badges (id, user_id, badge_id, icon, earned_at) 
     VALUES (?, ?, ?, ?, ?)`,
    [uid(), userId, badgeName, badgeIcon, now()]
  );
}

export async function updatePoints(userId, points) {
  // This would update a user points table
  console.log(`Adding ${points} points to user ${userId}`);
  return { success: true };
}

export async function unlockContent(userId, contentId) {
  // This would unlock premium content for the user
  console.log(`Unlocking content ${contentId} for user ${userId}`);
  return { success: true };
}

// ─── Progress Reports ─────────────────────────────────────────────────────────

/**
 * Get progress report for a child with optional time period filter
 * @param {string} childId - Child profile ID
 * @param {string} period - Time period: '7d' (last 7 days), '30d' (last 30 days), 'all' (no filter)
 * @returns {Promise} { streak, totalDaysRead, badgesEarned, quizzesCompleted, quizAccuracy, activities[] }
 */
export async function getProgressReport(childId, period = '7d') {
  try {
    // Calculate date filter
    let dateFilter = '';
    let dateParam = null;

    if (period === '7d') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateParam = sevenDaysAgo.toISOString();
      dateFilter = 'AND ca.completed_at >= ?';
    } else if (period === '30d') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateParam = thirtyDaysAgo.toISOString();
      dateFilter = 'AND ca.completed_at >= ?';
    }
    // else: 'all' — no date filter

    // Get activity stats
    const activityQuery = `SELECT COUNT(*) as totalActivities, SUM(CASE WHEN activity_type = 'quiz' THEN 1 ELSE 0 END) as quizzesCompleted FROM child_activity WHERE child_id = ? ${dateFilter.replace('ca.completed_at', 'completed_at')}`;

    const activityParams = [childId];
    if (dateParam) activityParams.push(dateParam);

    const { data: activityData } = await queryOne(activityQuery, activityParams);

    // Get streaks
    const { data: streakData } = await queryOne(
      `SELECT streak FROM streaks WHERE user_id = ? LIMIT 1`,
      [childId]
    );

    // Get badges
    const badgesQuery = `SELECT badge_id FROM badges WHERE user_id = ? ${dateParam ? 'AND earned_at >= ?' : ''}`;
    const badgesParams = [childId];
    if (dateParam) badgesParams.push(dateParam);

    const { data: badgesData } = await query(badgesQuery, badgesParams);

    // Get recent activities
    const activitiesQuery = `SELECT * FROM child_activity WHERE child_id = ? ${dateFilter.replace('ca.completed_at', 'completed_at')} ORDER BY completed_at DESC LIMIT 10`;
    const activitiesParams = [childId];
    if (dateParam) activitiesParams.push(dateParam);

    const { data: activitiesData } = await query(activitiesQuery, activitiesParams);

    // Calculate accuracy
    const quizzesCompleted = activityData?.quizzesCompleted || 0;
    const quizAccuracy = 0; // score column not available in schema

    return {
      data: {
        streak: streakData?.streak || 0,
        totalDaysRead: activityData?.totalActivities || 0,
        badgesEarned: badgesData?.length || 0,
        quizzesCompleted,
        quizAccuracy,
        activities: activitiesData || [],
        period,
      },
    };
  } catch (err) {
    console.error('Error getting progress report:', err);
    return { error: err.message };
  }
}

/**
 * Delete child profile and cascade delete all associated activity
 * @param {string} childId - Child profile ID
 * @param {string} parentId - Parent ID (for verification)
 * @returns {Promise} { success: true } or { error: string }
 */
export async function deleteChildProfileCascade(childId, parentId) {
  try {
    // Verify child belongs to parent
    const { data: child } = await queryOne(
      `SELECT id FROM child_profiles WHERE id = ? AND parent_id = ? LIMIT 1`,
      [childId, parentId]
    );

    if (!child) {
      return { error: 'Child profile not found or does not belong to this parent' };
    }

    // Delete all child activity records
    await execute(`DELETE FROM child_activity WHERE child_id = ?`, [childId]);

    // Delete child profile
    await execute(`DELETE FROM child_profiles WHERE id = ?`, [childId]);

    return { success: true };
  } catch (err) {
    console.error('Error deleting child profile cascade:', err);
    return { error: err.message };
  }
}
// ─── Church Dashboard System ───────────────────────────────────────────────────

export async function getChurchByPastor(pastorId) {
  return queryOne(`SELECT * FROM churches WHERE pastor_id = ? LIMIT 1`, [pastorId]);
}

export async function getChurchByInviteCode(code) {
  return queryOne(`SELECT * FROM churches WHERE invite_code = ? LIMIT 1`, [code]);
}

export async function createChurch({ pastor_id, name, description, invite_code }) {
  return execute(
    `INSERT INTO churches (id, pastor_id, name, description, invite_code, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uid(), pastor_id, name, description || '', invite_code, now(), now()]
  );
}

export async function joinChurch(userId, churchId) {
  return execute(
    `INSERT OR IGNORE INTO church_members (id, church_id, user_id, joined_at)
     VALUES (?, ?, ?, ?)`,
    [uid(), churchId, userId, now()]
  );
}

export async function getChurchMembers(churchId) {
  return query(
    `
    SELECT p.*, s.streak, s.last_checkin, s.checkin_count
    FROM profiles p
    JOIN church_members cm ON p.id = cm.user_id
    LEFT JOIN streaks s ON p.id = s.user_id
    WHERE cm.church_id = ?
    ORDER BY s.streak DESC
  `,
    [churchId]
  );
}

export async function getChurchStats(churchId) {
  // Aggregate stats like active this week, new badges, etc.
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();

  const activeCount = await queryOne(
    `
    SELECT COUNT(DISTINCT s.user_id) as count
    FROM streaks s
    JOIN church_members cm ON s.user_id = cm.user_id
    WHERE cm.church_id = ? AND s.last_checkin >= ?
  `,
    [churchId, weekAgoStr]
  );

  const newBadgeCount = await queryOne(
    `
    SELECT COUNT(*) as count
    FROM badges b
    JOIN church_members cm ON b.user_id = cm.user_id
    WHERE cm.church_id = ? AND b.earned_at >= ?
  `,
    [churchId, weekAgoStr]
  );

  return {
    active_this_week: activeCount?.data?.count || 0,
    new_badges_this_week: newBadgeCount?.data?.count || 0,
  };
}
