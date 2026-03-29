#!/usr/bin/env node
/**
 * Migration: Create family_plans table
 * Run from project root:
 *   node server/migrate-family-plans.js
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
  `CREATE TABLE IF NOT EXISTS family_plans (
    id            TEXT PRIMARY KEY,
    parent_id     TEXT NOT NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    total_days    INTEGER DEFAULT 7,
    created_at    TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS family_devotional_progress (
    plan_id       TEXT NOT NULL,
    child_id      TEXT NOT NULL,
    day_number    INTEGER NOT NULL,
    status        TEXT DEFAULT 'pending',
    completed_at  TEXT,
    PRIMARY KEY (plan_id, child_id, day_number)
  )`
]

async function run() {
  console.log('🔌  Connected to:', url)

  for (const sql of createStatements) {
    try {
      await turso.execute(sql)
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1]
      console.log(`✅  Table ready: ${tableName}`)
    } catch (err) {
      console.error('❌ ', err.message)
    }
  }

  // Verify tables exist
  console.log('\n🔍  Verifying tables...')
  try {
    const result = await turso.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name IN ('family_plans', 'family_devotional_progress')`)
    console.log('   Found tables:', result.rows.map(r => r.name).join(', '))
  } catch (err) {
    console.error('❌  Could not verify tables:', err.message)
  }

  console.log('\n✨  Migration complete.')
}

run().catch(err => { console.error(err); process.exit(1) })
