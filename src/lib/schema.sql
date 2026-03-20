-- ─────────────────────────────────────────────────────────────────────────────
-- BibleFunLand — Turso / SQLite Schema
-- Run this in Turso shell:  turso db shell your-db-name < schema.sql
-- Or paste into the Turso dashboard shell tab
-- ─────────────────────────────────────────────────────────────────────────────

-- User profiles (Clerk handles auth — this stores extra data)
CREATE TABLE IF NOT EXISTS profiles (
  id            TEXT PRIMARY KEY,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  favorite_verse TEXT DEFAULT '',
  age           INTEGER,
  role          TEXT DEFAULT 'General',    -- Parent | Teacher | General
  is_age_locked INTEGER DEFAULT 0,         -- 0 = unlocked, 1 = locked
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- Reading streaks
CREATE TABLE IF NOT EXISTS streaks (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL UNIQUE,     -- Clerk user ID
  streak        INTEGER DEFAULT 0,
  last_checkin  TEXT,                     -- ISO date string  YYYY-MM-DD
  read_days     TEXT DEFAULT '',          -- comma-separated dates
  checkin_count INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- Prayer wall
CREATE TABLE IF NOT EXISTS prayers (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,                       -- optional — anonymous allowed
  name        TEXT DEFAULT 'Anonymous',
  category    TEXT DEFAULT 'General',
  text        TEXT NOT NULL,
  pray_count  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Sermon notes
CREATE TABLE IF NOT EXISTS sermon_notes (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT DEFAULT 'Untitled',
  speaker     TEXT,
  date        TEXT,
  scripture   TEXT,
  content     TEXT,
  tags        TEXT DEFAULT '',            -- comma-separated
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  badge_id    TEXT NOT NULL,
  earned_at   TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, badge_id)              -- prevents duplicates
);

-- Subscriptions (Stripe webhook writes here)
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      TEXT PRIMARY KEY,
  user_id                 TEXT NOT NULL UNIQUE,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  status                  TEXT DEFAULT 'inactive',
  plan                    TEXT DEFAULT 'free',
  expires_at              TEXT,
  created_at              TEXT DEFAULT (datetime('now')),
  updated_at              TEXT DEFAULT (datetime('now'))
);

-- Testimonies
CREATE TABLE IF NOT EXISTS testimonies (
  id            TEXT PRIMARY KEY,
  name          TEXT DEFAULT 'Anonymous',
  category      TEXT NOT NULL,
  title         TEXT NOT NULL,
  text          TEXT NOT NULL,
  prayer_count  INTEGER DEFAULT 0,
  verified      INTEGER DEFAULT 0,       -- SQLite has no BOOLEAN — 0/1
  status        TEXT DEFAULT 'pending',  -- pending | approved | rejected
  created_at    TEXT DEFAULT (datetime('now'))
);

-- Child Profiles (Managed by Parents/Teachers)
CREATE TABLE IF NOT EXISTS child_profiles (
  id            TEXT PRIMARY KEY,
  parent_id     TEXT NOT NULL,            -- Clerk user ID of parent
  display_name  TEXT NOT NULL,
  avatar_url    TEXT DEFAULT 'sarah',
  age           INTEGER,
  streak        INTEGER DEFAULT 0,
  badges_count  INTEGER DEFAULT 0,
  quiz_score    INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- Child Activity Tracking
CREATE TABLE IF NOT EXISTS child_activity (
  id            TEXT PRIMARY KEY,
  child_id      TEXT NOT NULL,
  activity_type TEXT NOT NULL,             -- 'trivia', 'reading', 'game', 'prayer', etc.
  activity_data TEXT,                     -- JSON with activity details
  duration      INTEGER DEFAULT 0,        -- minutes spent
  completed_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE
);

-- Scripture Memory Verses
CREATE TABLE IF NOT EXISTS memory_verses (
  id            TEXT PRIMARY KEY,
  reference     TEXT NOT NULL,             -- "John 3:16", "Psalm 23:1", etc.
  text          TEXT NOT NULL,             -- The full verse text
  category      TEXT DEFAULT 'general',    -- 'salvation', 'wisdom', 'faith', etc.
  difficulty    TEXT DEFAULT 'medium',     -- 'easy', 'medium', 'hard'
  assigned_by   TEXT NOT NULL,             -- Parent/Teacher who assigned it
  assigned_to   TEXT NOT NULL,             -- Child who should memorize it
  user_type     TEXT NOT NULL,             -- 'child' or 'parent'
  status        TEXT DEFAULT 'assigned',   -- 'assigned', 'practicing', 'memorized'
  progress      INTEGER DEFAULT 0,         -- 0-100 percentage
  assigned_date TEXT NOT NULL,             -- YYYY-MM-DD
  memorized_date TEXT,                     -- YYYY-MM-DD when completed
  last_practiced TEXT,                     -- YYYY-MM-DD of last practice
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- Teacher Classroom System
CREATE TABLE IF NOT EXISTS classrooms (
  id            TEXT PRIMARY KEY,
  teacher_id    TEXT NOT NULL,             -- Clerk user ID of teacher
  name          TEXT NOT NULL,             -- "Grade 3 Bible Class", "Sunday School Group A"
  grade_level   TEXT NOT NULL,             -- "K-2", "3-5", "6-8", "9-12", "All"
  subject       TEXT DEFAULT 'Bible Study',
  description   TEXT,                      -- Class description and goals
  max_students  INTEGER DEFAULT 30,
  settings      TEXT DEFAULT '{}',        -- JSON: { allowParentAccess, requireApproval, etc. }
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS classroom_students (
  id            TEXT PRIMARY KEY,
  classroom_id  TEXT NOT NULL,
  student_name  TEXT NOT NULL,             -- Child's display name
  parent_email  TEXT,                      -- Parent's email for communication
  grade         TEXT,                      -- Student's grade level
  age           INTEGER,                   -- Student's age
  notes         TEXT,                      -- Teacher notes about student
  joined_at     TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS classroom_activities (
  id            TEXT PRIMARY KEY,
  classroom_id  TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL,             -- 'lesson', 'quiz', 'memory_verse', 'project'
  content       TEXT,                      -- JSON with activity content/data
  due_date      TEXT,                      -- YYYY-MM-DD
  points        INTEGER DEFAULT 10,
  difficulty    TEXT DEFAULT 'medium',     -- 'easy', 'medium', 'hard'
  created_at    TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS classroom_submissions (
  id            TEXT PRIMARY KEY,
  activity_id   TEXT NOT NULL,
  student_id    TEXT NOT NULL,             -- References classroom_students.id
  content       TEXT,                      -- Student's submitted work/answers
  points_earned INTEGER DEFAULT 0,
  feedback      TEXT,                      -- Teacher feedback
  completed_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (activity_id) REFERENCES classroom_activities(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES classroom_students(id) ON DELETE CASCADE
);

-- Family Challenges System
CREATE TABLE IF NOT EXISTS family_challenges (
  id            TEXT PRIMARY KEY,
  family_id     TEXT NOT NULL,             -- Parent user ID
  challenge_id  TEXT NOT NULL,             -- Reference to predefined challenge
  participants  TEXT NOT NULL,             -- JSON array of participant IDs
  start_date    TEXT NOT NULL,
  end_date      TEXT NOT NULL,
  progress      TEXT DEFAULT '{}',        -- JSON: { requirements: [], overall: 0 }
  status        TEXT DEFAULT 'active',     -- 'active', 'completed', 'expired'
  completed_date TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- Parental Controls
CREATE TABLE IF NOT EXISTS parental_controls (
  parent_id     TEXT PRIMARY KEY,         -- Clerk user ID
  ai_toggles    TEXT DEFAULT '{}',        -- JSON: { trivia: true, rap: false, ... }
  daily_limit   INTEGER DEFAULT 0,        -- 0 = no limit, otherwise minutes
  parent_pin    TEXT DEFAULT '4318',      -- Override default PIN
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- Family Devotional Tracking
CREATE TABLE IF NOT EXISTS family_plans (
  id            TEXT PRIMARY KEY,
  parent_id     TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  total_days    INTEGER DEFAULT 7,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS family_devotional_progress (
  plan_id       TEXT NOT NULL,
  child_id      TEXT NOT NULL,
  day_number    INTEGER NOT NULL,
  status        TEXT DEFAULT 'pending',   --'pending', 'completed'
  completed_at  TEXT,
  PRIMARY KEY (plan_id, child_id, day_number)
);

-- World prayer counters
CREATE TABLE IF NOT EXISTS world_prayers (
  id       TEXT PRIMARY KEY,
  country  TEXT NOT NULL,
  date     TEXT NOT NULL,               -- YYYY-MM-DD
  count    INTEGER DEFAULT 1,
  UNIQUE(country, date)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
-- SQLite is fast for small datasets but indexes help as you scale

CREATE INDEX IF NOT EXISTS idx_streaks_user    ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user      ON sermon_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user     ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_created ON prayers(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonies_cat ON testimonies(category, status);
CREATE INDEX IF NOT EXISTS idx_world_country   ON world_prayers(country, date);
CREATE INDEX IF NOT EXISTS idx_subs_user       ON subscriptions(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- DONE. Verify with:  .tables
-- ─────────────────────────────────────────────────────────────────────────────
