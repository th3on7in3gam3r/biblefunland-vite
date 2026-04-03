#!/usr/bin/env node
/**
 * Migration: Create child_profiles table
 * Run from project root:
 *   node server/migrate-child-profiles.js
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

const createStatements = [
  `CREATE TABLE IF NOT EXISTS child_profiles (
    id            TEXT PRIMARY KEY,
    parent_id     TEXT NOT NULL,
    display_name  TEXT NOT NULL,
    age           INTEGER,
    avatar_url    TEXT DEFAULT 'david',
    kids_mode     INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS child_activity (
    id            TEXT PRIMARY KEY,
    child_id      TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    score         INTEGER,
    duration      INTEGER,
    completed_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE
  )`,
]

const alterStatements = [
  `ALTER TABLE child_profiles ADD COLUMN kids_mode INTEGER DEFAULT 0`,
]

async function run() {
  console.log('🔌  Connected to:', url)

  // Create tables
  for (const sql of createStatements) {
    try {
      await turso.execute(sql)
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1]
      console.log(`✅  Table ready: ${tableName}`)
    } catch (err) {
      console.error('❌ ', err.message)
    }
  }

  // Add missing columns
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

  // Verify schema
  console.log('\n🔍  Verifying child_profiles table schema...')
  try {
    const result = await turso.execute(`PRAGMA table_info(child_profiles)`)
    const cols = result.rows.map(r => r.name)
    console.log('   Columns:', cols.join(', '))
    const required = ['id','parent_id','display_name','age','avatar_url','kids_mode','created_at','updated_at']
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
