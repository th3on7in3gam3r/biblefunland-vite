-- ─────────────────────────────────────────────────────────────────────────────
-- BibleFunLand — Turso / SQLite Schema
-- Run this in Turso shell:  turso db shell your-db-name < schema.sql
-- Or paste into the Turso dashboard shell tab
-- ─────────────────────────────────────────────────────────────────────────────

-- User profiles (Clerk handles auth — this stores extra data)
CREATE TABLE IF NOT EXISTS profiles (
  id           TEXT PRIMARY KEY,          -- Clerk user ID (clerk_xxxxxxx)
  display_name TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
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
