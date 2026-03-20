#!/usr/bin/env node
/**
 * Migration: add missing columns to profiles table
 * Run: node scripts/migrate-profiles.js
 */
import { createClient } from '@libsql/client'

const url       = process.env.VITE_TURSO_DATABASE_URL
const authToken = process.env.VITE_TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('Missing VITE_TURSO_DATABASE_URL or VITE_TURSO_AUTH_TOKEN')
  process.exit(1)
}

const turso = createClient({ url, authToken })

const migrations = [
  // profiles — add columns that may be missing
  `ALTER TABLE profiles ADD COLUMN favorite_verse TEXT DEFAULT ''`,
  `ALTER TABLE profiles ADD COLUMN age INTEGER`,
  `ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'General'`,
  `ALTER TABLE profiles ADD COLUMN is_age_locked INTEGER DEFAULT 0`,

  // Ensure profiles table exists at all (safe no-op if already there)
  `CREATE TABLE IF NOT EXISTS profiles (
    id            TEXT PRIMARY KEY,
    display_name  TEXT,
    avatar_url    TEXT,
    bio           TEXT,
    favorite_verse TEXT DEFAULT '',
    age           INTEGER,
    role          TEXT DEFAULT 'General',
    is_age_locked INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
  )`,
]

async function run() {
  for (const sql of migrations) {
    const label = sql.trim().split('\n')[0].substring(0, 60)
    try {
      await turso.execute(sql)
      console.log(`✅  ${label}`)
    } catch (err) {
      if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
        console.log(`⏭️  already exists — ${label}`)
      } else {
        console.error(`❌  ${label}\n    ${err.message}`)
      }
    }
  }
  console.log('\nDone.')
}

run().catch(err => { console.error(err); process.exit(1) })
