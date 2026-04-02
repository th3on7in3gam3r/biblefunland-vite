const { execute } = require('./lib/turso');

async function migrate() {
  console.log('🚀 Starting Church Dashboard Migration...');

  try {
    // 1. Create Churches table
    console.log('Creating churches table...');
    await execute(`
      CREATE TABLE IF NOT EXISTS churches (
        id TEXT PRIMARY KEY,
        pastor_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        invite_code TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 2. Create Church Members table
    console.log('Creating church_members table...');
    await execute(`
      CREATE TABLE IF NOT EXISTS church_members (
        id TEXT PRIMARY KEY,
        church_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at TEXT NOT NULL,
        UNIQUE(church_id, user_id)
      )
    `);

    console.log('✅ Church Dashboard tables created successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

migrate();
