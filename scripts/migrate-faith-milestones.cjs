#!/usr/bin/env node
/**
 * Migration: Add missing columns to faith milestone tables in Turso
 * Uses the VITE_ credentials from root .env via direct HTTP API
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TURSO_URL = (process.env.VITE_TURSO_DATABASE_URL || '').replace(/^libsql:\/\//, 'https://');
const TURSO_TOKEN = process.env.VITE_TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('Missing VITE_TURSO_DATABASE_URL or VITE_TURSO_AUTH_TOKEN in .env');
  process.exit(1);
}

async function tursoExec(sql) {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TURSO_TOKEN}`,
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: [] } },
        { type: 'close' },
      ],
    }),
  });
  const json = await res.json();
  const result = json.results?.[0];
  if (result?.type === 'error') return { error: result.error?.message };
  return { error: null, data: result?.response?.result };
}

async function tursoQuery(sql) {
  const { data, error } = await tursoExec(sql);
  if (error) return { rows: [], error };
  const cols = data?.cols?.map(c => c.name) || [];
  const rows = (data?.rows || []).map(row => {
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]?.value ?? null; });
    return obj;
  });
  return { rows, error: null };
}

async function showColumns(table) {
  const { rows } = await tursoQuery(`PRAGMA table_info(${table})`);
  const cols = rows.map(r => r.name).filter(Boolean);
  console.log(`  existing columns: ${cols.length ? cols.join(', ') : '(none / table missing)'}`);
  return cols;
}

async function safeAlter(sql) {
  const col = sql.match(/ADD COLUMN (\w+)/i)?.[1] || '?';
  const { error } = await tursoExec(sql);
  if (!error) {
    console.log(`  + ${col}`);
  } else if (error.includes('duplicate column')) {
    console.log(`  ~ ${col} (already exists)`);
  } else {
    console.warn(`  WARN [${col}]: ${error}`);
  }
}

async function run() {
  console.log(`\nConnecting to: ${TURSO_URL}\n`);
  console.log('=== Faith Milestones Column Migration ===\n');

  // ── faith_milestones ──
  console.log('faith_milestones:');
  await showColumns('faith_milestones');
  await safeAlter(`ALTER TABLE faith_milestones ADD COLUMN category TEXT NOT NULL DEFAULT 'general'`);
  await safeAlter(`ALTER TABLE faith_milestones ADD COLUMN title TEXT NOT NULL DEFAULT ''`);
  await safeAlter(`ALTER TABLE faith_milestones ADD COLUMN description TEXT`);
  await safeAlter(`ALTER TABLE faith_milestones ADD COLUMN milestone_date TEXT`);
  await safeAlter(`ALTER TABLE faith_milestones ADD COLUMN photo_url TEXT`);
  await safeAlter(`ALTER TABLE faith_milestones ADD COLUMN impact_story TEXT`);
  await safeAlter(`ALTER TABLE faith_milestones ADD COLUMN tags TEXT DEFAULT ''`);
  await safeAlter(`ALTER TABLE faith_milestones ADD COLUMN is_public INTEGER DEFAULT 0`);
  await safeAlter(`ALTER TABLE faith_milestones ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`);
  await safeAlter(`ALTER TABLE faith_milestones ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`);

  // ── spiritual_mentors ──
  console.log('\nspiritual_mentors:');
  await showColumns('spiritual_mentors');
  await safeAlter(`ALTER TABLE spiritual_mentors ADD COLUMN name TEXT NOT NULL DEFAULT ''`);
  await safeAlter(`ALTER TABLE spiritual_mentors ADD COLUMN relationship TEXT NOT NULL DEFAULT ''`);
  await safeAlter(`ALTER TABLE spiritual_mentors ADD COLUMN how_they_shaped TEXT`);
  await safeAlter(`ALTER TABLE spiritual_mentors ADD COLUMN meeting_date TEXT`);
  await safeAlter(`ALTER TABLE spiritual_mentors ADD COLUMN photo_url TEXT`);
  await safeAlter(`ALTER TABLE spiritual_mentors ADD COLUMN still_connected INTEGER DEFAULT 1`);
  await safeAlter(`ALTER TABLE spiritual_mentors ADD COLUMN contact_info TEXT`);
  await safeAlter(`ALTER TABLE spiritual_mentors ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`);
  await safeAlter(`ALTER TABLE spiritual_mentors ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`);

  // ── hard_season_verses ──
  console.log('\nhard_season_verses:');
  await showColumns('hard_season_verses');
  await safeAlter(`ALTER TABLE hard_season_verses ADD COLUMN reference TEXT NOT NULL DEFAULT ''`);
  await safeAlter(`ALTER TABLE hard_season_verses ADD COLUMN text TEXT NOT NULL DEFAULT ''`);
  await safeAlter(`ALTER TABLE hard_season_verses ADD COLUMN what_was_hard TEXT`);
  await safeAlter(`ALTER TABLE hard_season_verses ADD COLUMN how_it_helped TEXT`);
  await safeAlter(`ALTER TABLE hard_season_verses ADD COLUMN season_date TEXT`);
  await safeAlter(`ALTER TABLE hard_season_verses ADD COLUMN still_meaningful INTEGER DEFAULT 1`);
  await safeAlter(`ALTER TABLE hard_season_verses ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`);
  await safeAlter(`ALTER TABLE hard_season_verses ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`);

  // ── answered_prayers_milestones ──
  console.log('\nanswered_prayers_milestones:');
  await showColumns('answered_prayers_milestones');
  await safeAlter(`ALTER TABLE answered_prayers_milestones ADD COLUMN prayer_text TEXT NOT NULL DEFAULT ''`);
  await safeAlter(`ALTER TABLE answered_prayers_milestones ADD COLUMN answer_text TEXT`);
  await safeAlter(`ALTER TABLE answered_prayers_milestones ADD COLUMN prayer_date TEXT`);
  await safeAlter(`ALTER TABLE answered_prayers_milestones ADD COLUMN answer_date TEXT`);
  await safeAlter(`ALTER TABLE answered_prayers_milestones ADD COLUMN impact_story TEXT`);
  await safeAlter(`ALTER TABLE answered_prayers_milestones ADD COLUMN photos TEXT DEFAULT ''`);
  await safeAlter(`ALTER TABLE answered_prayers_milestones ADD COLUMN is_public INTEGER DEFAULT 0`);
  await safeAlter(`ALTER TABLE answered_prayers_milestones ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`);
  await safeAlter(`ALTER TABLE answered_prayers_milestones ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`);

  console.log('\n=== Migration complete ===\n');
}

run().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
