#!/usr/bin/env node
/**
 * Migration: create gamification tables for progress/streaks/badges/family challenges
 * Usage: node server/migrate-gamification.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const { createClient } = require('@libsql/client')

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('❌  Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in server/.env')
  process.exit(1)
}

const turso = createClient({ url, authToken })

const createStatements = [
  `CREATE TABLE IF NOT EXISTS user_progress (
    clerk_user_id TEXT PRIMARY KEY,
    points INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    last_activity TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS streaks (
    user_id TEXT PRIMARY KEY,
    streak_date TEXT,
    streak_days INTEGER DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    earned_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, badge_id)
  )`,

  `CREATE TABLE IF NOT EXISTS badge_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    criteria TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS family_challenges (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    goal INTEGER DEFAULT 100,
    progress INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT
  )`,
]

async function run() {
  console.log('🔌  Connected to:', url)

  for (const sql of createStatements) {
    try {
      await turso.execute(sql)
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1]
      console.log(`✅  Table ready: ${tableName}`)
    } catch (err) {
      console.error('❌  Failed to create table:', err.message)
    }
  }

  console.log('\n✨  Gamification migration complete.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
migrate().catch((err) => {
  console.error('[Gamification Migration] Failed:', err);
  process.exit(1);
});