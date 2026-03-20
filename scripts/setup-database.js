#!/usr/bin/env node

/**
 * BibleFunLand Database Setup Script
 * Automatically initializes all required Turso database tables
 * 
 * Usage:
 *   node scripts/setup-database.js
 * 
 * Requires environment variables:
 *   - VITE_TURSO_DATABASE_URL
 *   - VITE_TURSO_AUTH_TOKEN
 */

import { createClient } from '@libsql/client'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get environment variables
const url = process.env.VITE_TURSO_DATABASE_URL
const authToken = process.env.VITE_TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('❌ Missing environment variables!')
  console.error('Please set:')
  console.error('  export VITE_TURSO_DATABASE_URL="libsql://your-db.turso.io"')
  console.error('  export VITE_TURSO_AUTH_TOKEN="your-token"')
  console.error('')
  console.error('Or create a .env file in the project root with these variables.')
  process.exit(1)
}

console.log('🔌 Connecting to Turso database...')
console.log(`   URL: ${url}`)

const turso = createClient({ url, authToken })

// Read schema SQL
const schemaPath = join(__dirname, '..', 'src', 'lib', 'schema.sql')
let schemaSQL

try {
  schemaSQL = readFileSync(schemaPath, 'utf-8')
  console.log('📄 Loaded schema.sql')
} catch (err) {
  console.error(`❌ Could not read schema file: ${schemaPath}`)
  console.error(err.message)
  process.exit(1)
}

// Split SQL into individual statements
const statements = schemaSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))

console.log(`📝 Found ${statements.length} SQL statements to execute`)
console.log('')

// Execute each statement
async function setupDatabase() {
  let success = 0
  let failed = 0
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';'
    const firstLine = stmt.split('\n')[0].trim()
    const description = firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine
    
    process.stdout.write(`[${i + 1}/${statements.length}] ${description} ... `)
    
    try {
      await turso.execute(stmt)
      console.log('✅')
      success++
    } catch (err) {
      console.log('❌')
      console.error(`   Error: ${err.message}`)
      
      // Don't fail on "table already exists" errors
      if (err.message.includes('already exists')) {
        console.log('   (Table already exists, continuing...)')
        success++
      } else {
        failed++
      }
    }
  }
  
  console.log('')
  console.log('─'.repeat(50))
  console.log('📊 Setup Results:')
  console.log(`   ✅ Successful: ${success}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log('─'.repeat(50))
  
  if (failed === 0) {
    console.log('')
    console.log('🎉 Database setup completed successfully!')
    console.log('')
    console.log('Created tables:')
    console.log('   • profiles')
    console.log('   • streaks')
    console.log('   • prayers')
    console.log('   • sermon_notes')
    console.log('   • badges')
    console.log('   • subscriptions')
    console.log('   • testimonies')
    console.log('   • child_profiles')
    console.log('   • child_activity')
    console.log('   • memory_verses')
    console.log('   • classrooms')
    console.log('   • classroom_students')
    console.log('   • classroom_activities')
    console.log('   • classroom_submissions')
    console.log('   • family_challenges')
    console.log('   • parental_controls')
    console.log('   • family_plans')
    console.log('   • family_devotional_progress')
    console.log('   • world_prayers')
    console.log('')
    console.log('✨ Your BibleFunLand database is ready to use!')
  } else {
    console.log('')
    console.log('⚠️  Some tables could not be created. Please check the errors above.')
    process.exit(1)
  }
}

// Run setup
setupDatabase().catch(err => {
  console.error('❌ Fatal error during setup:', err.message)
  process.exit(1)
})
