#!/usr/bin/env node
/**
 * Migration: ensure all required tables and columns exist
 * Run from project root:
 *   node server/migrate-profiles.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const { createClient } = require('@libsql/client')

const url       = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('❌  Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in server/.env')
  process.exit(1)
}

const turso = createClient({ url, authToken })

// Step 1: CREATE TABLE IF NOT EXISTS (safe to run anytime)
const createStatements = [
  `CREATE TABLE IF NOT EXISTS profiles (
    id            TEXT PRIMARY KEY,
    display_name  TEXT DEFAULT '',
    avatar_url    TEXT DEFAULT 'david',
    bio           TEXT DEFAULT '',
    favorite_verse TEXT DEFAULT '',
    age           INTEGER,
    role          TEXT DEFAULT 'General',
    is_age_locked INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS streaks (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL UNIQUE,
    streak        INTEGER DEFAULT 0,
    last_checkin  TEXT,
    read_days     TEXT DEFAULT '',
    checkin_count INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
  )`,
]

// Step 2: ALTER TABLE to add any missing columns (idempotent — errors are ignored)
const alterStatements = [
  `ALTER TABLE profiles ADD COLUMN display_name  TEXT DEFAULT ''`,
  `ALTER TABLE profiles ADD COLUMN avatar_url    TEXT DEFAULT 'david'`,
  `ALTER TABLE profiles ADD COLUMN bio           TEXT DEFAULT ''`,
  `ALTER TABLE profiles ADD COLUMN favorite_verse TEXT DEFAULT ''`,
  `ALTER TABLE profiles ADD COLUMN age           INTEGER`,
  `ALTER TABLE profiles ADD COLUMN role          TEXT DEFAULT 'General'`,
  `ALTER TABLE profiles ADD COLUMN is_age_locked INTEGER DEFAULT 0`,
  `ALTER TABLE profiles ADD COLUMN created_at    TEXT DEFAULT (datetime('now'))`,
  `ALTER TABLE profiles ADD COLUMN updated_at    TEXT DEFAULT (datetime('now'))`,
]

async function run() {
  console.log('🔌  Connected to:', url)

  // Create tables first
  for (const sql of createStatements) {
    try {
      await turso.execute(sql)
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1]
      console.log(`✅  Table ready: ${tableName}`)
    } catch (err) {
      console.error('❌ ', err.message)
    }
  }

  // Then add any missing columns
  for (const sql of alterStatements) {
    try {
      await turso.execute(sql)
      const col = sql.match(/ADD COLUMN (\w+)/)?.[1]
      console.log(`✅  Column added: ${col}`)
    } catch (err) {
      if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
        const col = sql.match(/ADD COLUMN (\w+)/)?.[1]
        console.log(`⏭️  Already exists: ${col}`)
      } else {
        console.error('❌ ', sql, '\n   ', err.message)
      }
    }
  }

  // Verify final schema
  console.log('\n🔍  Verifying profiles table schema...')
  try {
    const result = await turso.execute(`PRAGMA table_info(profiles)`)
    const cols = result.rows.map(r => r.name)
    console.log('   Columns:', cols.join(', '))
    const required = ['id','display_name','avatar_url','bio','favorite_verse','age','role','is_age_locked']
    const missing = required.filter(c => !cols.includes(c))
    if (missing.length) {
      console.error('❌  Still missing columns:', missing.join(', '))
    } else {
      console.log('✅  All required columns present')
    }
  } catch (err) {
    console.error('❌  Could not verify schema:', err.message)
  }

  console.log('\n✨  Migration complete.')
}

run().catch(err => { console.error(err); process.exit(1) })
