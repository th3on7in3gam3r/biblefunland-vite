#!/usr/bin/env node
/**
 * Migration: create prayer_journal and family_prayer_journal tables
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TURSO_URL = (process.env.VITE_TURSO_DATABASE_URL || '').replace(/^libsql:\/\//, 'https://');
const TURSO_TOKEN = process.env.VITE_TURSO_AUTH_TOKEN;

async function exec(sql) {
  const r = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TURSO_TOKEN}` },
    body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql, args: [] } }, { type: 'close' }] }),
  });
  const j = await r.json();
  const res = j.results?.[0];
  if (res?.type === 'error') return { error: res.error?.message };
  return { ok: true };
}

async function run() {
  console.log('Creating prayer_journal table...');
  let r = await exec(`CREATE TABLE IF NOT EXISTS prayer_journal (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Personal',
    verse TEXT DEFAULT '',
    verse_text TEXT DEFAULT '',
    text TEXT NOT NULL,
    tags TEXT DEFAULT '',
    answered INTEGER DEFAULT 0,
    answered_note TEXT DEFAULT '',
    answered_date TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);
  console.log(r.ok ? '  ✓ prayer_journal' : `  ✗ ${r.error}`);

  console.log('Creating family_prayer_journal table...');
  r = await exec(`CREATE TABLE IF NOT EXISTS family_prayer_journal (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Family',
    verse TEXT DEFAULT '',
    verse_text TEXT DEFAULT '',
    text TEXT NOT NULL,
    tags TEXT DEFAULT '',
    answered INTEGER DEFAULT 0,
    answered_note TEXT DEFAULT '',
    answered_date TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);
  console.log(r.ok ? '  ✓ family_prayer_journal' : `  ✗ ${r.error}`);

  console.log('Creating indexes...');
  await exec(`CREATE INDEX IF NOT EXISTS idx_prayer_journal_user ON prayer_journal(user_id, date DESC)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_family_prayer_group ON family_prayer_journal(group_id, date DESC)`);
  console.log('Done.');
}

run().catch(err => { console.error(err.message); process.exit(1); });
