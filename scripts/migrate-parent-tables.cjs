/**
 * Migration: Create parent/teacher tables missing from live DB
 * Run: node scripts/migrate-parent-tables.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') })
const { createClient } = require('@libsql/client')

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const migrations = [
  // ── Child Profiles ──────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS child_profiles (
    id            TEXT PRIMARY KEY,
    parent_id     TEXT NOT NULL,
    display_name  TEXT NOT NULL,
    avatar_url    TEXT DEFAULT 'sarah',
    age           INTEGER,
    streak        INTEGER DEFAULT 0,
    badges_count  INTEGER DEFAULT 0,
    quiz_score    INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_child_profiles_parent ON child_profiles(parent_id)`,

  // ── Child Activity ──────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS child_activity (
    id            TEXT PRIMARY KEY,
    child_id      TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_data TEXT,
    duration      INTEGER DEFAULT 0,
    completed_at  TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_child_activity_child ON child_activity(child_id)`,

  // ── Parental Controls ───────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS parental_controls (
    parent_id     TEXT PRIMARY KEY,
    ai_toggles    TEXT DEFAULT '{}',
    daily_limit   INTEGER DEFAULT 0,
    parent_pin    TEXT DEFAULT '4318',
    updated_at    TEXT DEFAULT (datetime('now'))
  )`,

  // ── Family Plans (parent-owned plan records) ────────────────────────────────
  // Note: db.js getFamilyPlans/upsertFamilyPlan queries this table
  // with columns: id, parent_id, title, total_days, current_day, completed_days
  `CREATE TABLE IF NOT EXISTS family_devotional_progress (
    id             TEXT PRIMARY KEY,
    parent_id      TEXT NOT NULL,
    title          TEXT NOT NULL,
    total_days     INTEGER DEFAULT 7,
    current_day    INTEGER DEFAULT 0,
    completed_days TEXT DEFAULT '[]',
    created_at     TEXT DEFAULT (datetime('now')),
    updated_at     TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_fdp_parent ON family_devotional_progress(parent_id)`,

  // ── Family Challenges ───────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS family_challenges (
    id             TEXT PRIMARY KEY,
    family_id      TEXT NOT NULL,
    challenge_id   TEXT NOT NULL,
    participants   TEXT NOT NULL DEFAULT '[]',
    start_date     TEXT NOT NULL,
    end_date       TEXT NOT NULL,
    progress       TEXT DEFAULT '{}',
    status         TEXT DEFAULT 'active',
    completed_date TEXT,
    created_at     TEXT DEFAULT (datetime('now')),
    updated_at     TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_family_challenges_family ON family_challenges(family_id)`,

  // ── Scripture Memory Verses ─────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS memory_verses (
    id             TEXT PRIMARY KEY,
    reference      TEXT NOT NULL,
    text           TEXT NOT NULL,
    category       TEXT DEFAULT 'general',
    difficulty     TEXT DEFAULT 'medium',
    assigned_by    TEXT NOT NULL,
    assigned_to    TEXT NOT NULL,
    user_type      TEXT NOT NULL,
    status         TEXT DEFAULT 'assigned',
    progress       INTEGER DEFAULT 0,
    assigned_date  TEXT NOT NULL,
    memorized_date TEXT,
    last_practiced TEXT,
    created_at     TEXT DEFAULT (datetime('now')),
    updated_at     TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_memory_verses_assigned_to ON memory_verses(assigned_to)`,

  // ── Classrooms ──────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS classrooms (
    id           TEXT PRIMARY KEY,
    teacher_id   TEXT NOT NULL,
    name         TEXT NOT NULL,
    grade_level  TEXT NOT NULL,
    subject      TEXT DEFAULT 'Bible Study',
    description  TEXT,
    max_students INTEGER DEFAULT 30,
    settings     TEXT DEFAULT '{}',
    created_at   TEXT DEFAULT (datetime('now')),
    updated_at   TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id)`,

  `CREATE TABLE IF NOT EXISTS classroom_students (
    id           TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    parent_email TEXT,
    grade        TEXT,
    age          INTEGER,
    notes        TEXT,
    joined_at    TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS classroom_activities (
    id           TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    title        TEXT NOT NULL,
    description  TEXT,
    type         TEXT NOT NULL,
    content      TEXT,
    due_date     TEXT,
    points       INTEGER DEFAULT 10,
    difficulty   TEXT DEFAULT 'medium',
    created_at   TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS classroom_submissions (
    id            TEXT PRIMARY KEY,
    activity_id   TEXT NOT NULL,
    student_id    TEXT NOT NULL,
    content       TEXT,
    points_earned INTEGER DEFAULT 0,
    feedback      TEXT,
    completed_at  TEXT DEFAULT (datetime('now'))
  )`,
]

async function run() {
  console.log('Running parent/teacher table migrations...\n')
  let passed = 0
  let failed = 0

  for (const sql of migrations) {
    const name = sql.trim().split('\n')[0].slice(0, 80)
    try {
      await client.execute(sql)
      console.log(`✅ ${name}`)
      passed++
    } catch (err) {
      console.error(`❌ ${name}\n   ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone — ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

run()
