#!/usr/bin/env node
/**
 * Setup script for Faith Milestones tables
 * Uses the existing turso.js library from the project
 */

const path = require('path');

// Add server/node_modules to require path
module.paths.push(path.join(__dirname, '..', 'server', 'node_modules'));

// Load environment from server/.env (not root .env)
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

const { execute } = require('../server/lib/turso');

async function setupFaithMilestones() {
  console.log('Setting up Faith Milestones tables...\n');

  try {
    const createStatements = [
      `CREATE TABLE IF NOT EXISTS faith_milestones (
        id              TEXT PRIMARY KEY,
        user_id         TEXT NOT NULL,
        category        TEXT NOT NULL,
        title           TEXT NOT NULL,
        description     TEXT,
        milestone_date  TEXT NOT NULL,
        photo_url       TEXT,
        impact_story    TEXT,
        tags            TEXT DEFAULT '',
        is_public       INTEGER DEFAULT 0,
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
      )`,

      `CREATE TABLE IF NOT EXISTS spiritual_mentors (
        id              TEXT PRIMARY KEY,
        user_id         TEXT NOT NULL,
        name            TEXT NOT NULL,
        relationship    TEXT NOT NULL,
        how_they_shaped TEXT,
        meeting_date    TEXT,
        photo_url       TEXT,
        still_connected INTEGER DEFAULT 1,
        contact_info    TEXT,
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
      )`,

      `CREATE TABLE IF NOT EXISTS hard_season_verses (
        id              TEXT PRIMARY KEY,
        user_id         TEXT NOT NULL,
        reference       TEXT NOT NULL,
        text            TEXT NOT NULL,
        what_was_hard   TEXT NOT NULL,
        how_it_helped   TEXT,
        season_date     TEXT NOT NULL,
        still_meaningful INTEGER DEFAULT 1,
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
      )`,

      `CREATE TABLE IF NOT EXISTS answered_prayers_milestones (
        id              TEXT PRIMARY KEY,
        user_id         TEXT NOT NULL,
        prayer_text     TEXT NOT NULL,
        answer_text     TEXT NOT NULL,
        prayer_date     TEXT NOT NULL,
        answer_date     TEXT NOT NULL,
        impact_story    TEXT,
        photos          TEXT DEFAULT '',
        is_public       INTEGER DEFAULT 0,
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
      )`
    ];

    let successCount = 0;
    for (const statement of createStatements) {
      const { error } = await execute(statement);
      if (error) {
        console.error(`Error: ${error}`);
      } else {
        const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
        successCount++;
        console.log(`Created table: ${tableName}`);
      }
    }

    const indexStatements = [
      `CREATE INDEX IF NOT EXISTS idx_faith_milestones_user ON faith_milestones(user_id, milestone_date DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_faith_milestones_cat ON faith_milestones(user_id, category)`,
      `CREATE INDEX IF NOT EXISTS idx_spiritual_mentors_user ON spiritual_mentors(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_hard_season_verses_user ON hard_season_verses(user_id, season_date DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_answered_prayers_user ON answered_prayers_milestones(user_id, answer_date DESC)`
    ];

    for (const statement of indexStatements) {
      const { error } = await execute(statement);
      if (!error) {
        const indexName = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/)[1];
        console.log(`Created index: ${indexName}`);
      }
    }

    console.log(`\nSuccessfully created ${successCount}/4 tables`);
    console.log('Tables ready for Faith Milestones tracker!\n');

  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }
}

setupFaithMilestones();
