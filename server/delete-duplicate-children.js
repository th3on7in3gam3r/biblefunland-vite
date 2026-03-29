#!/usr/bin/env node
/**
 * Delete duplicate Hadassah profiles, keeping only the first one
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

async function run() {
  console.log('🔌  Connected to:', url)

  // Get all Hadassah profiles for this user
  const result = await turso.execute({
    sql: `SELECT * FROM child_profiles WHERE parent_id = ? AND display_name = ? ORDER BY created_at ASC`,
    args: ['user_3B8K1Fd6iKY8wg3b4ilhwEhZv50', 'Hadassah']
  })

  console.log(`\n📊 Found ${result.rows.length} Hadassah profiles`)

  if (result.rows.length <= 1) {
    console.log('✅ No duplicates to delete')
    return
  }

  // Keep the first one, delete the rest
  const toKeep = result.rows[0].id
  const toDelete = result.rows.slice(1).map(r => r.id)

  console.log(`\n✅ Keeping: ${toKeep} (created ${result.rows[0].created_at})`)
  console.log(`🗑️  Deleting ${toDelete.length} duplicates:`)

  for (const id of toDelete) {
    const row = result.rows.find(r => r.id === id)
    console.log(`   - ${id} (created ${row.created_at})`)
    await turso.execute({
      sql: `DELETE FROM child_profiles WHERE id = ?`,
      args: [id]
    })
  }

  console.log(`\n✨ Done! Deleted ${toDelete.length} duplicate profiles`)
  console.log(`✅ 1 Hadassah profile remains`)
}

run().catch(err => { console.error(err); process.exit(1) })
