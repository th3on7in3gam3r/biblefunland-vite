#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

const { query, execute } = require('../server/lib/turso');

async function checkDatabase() {
  console.log('🔍 Checking Turso database...\n');
  
  try {
    // List all tables
    console.log('📋 Checking for faith_milestones tables:\n');
    
    const { data: tables, error: tablesError } = await query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'faith_%' OR name LIKE 'answered_%' OR name LIKE 'hard_%' OR name LIKE 'spiritual_%'"
    );
    
    if (tablesError) {
      console.error('❌ Error querying tables:', tablesError);
    } else if (tables && tables.length > 0) {
      console.log('✅ Found tables:');
      tables.forEach(row => console.log(`   - ${row.name}`));
    } else {
      console.log('❌ No faith milestone tables found in database');
      
      // Try to list ALL tables to debug
      console.log('\n📊 All tables in database:');
      const { data: allTables } = await query("SELECT name FROM sqlite_master WHERE type='table'");
      if (allTables && allTables.length > 0) {
        allTables.forEach(row => console.log(`   - ${row.name}`));
      } else {
        console.log('   (none found)');
      }
    }
    
    // Try creating one table to test write access
    console.log('\n🧪 Testing CREATE TABLE permission...');
    const testTable = `
      CREATE TABLE IF NOT EXISTS test_faith_milestone (
        id TEXT PRIMARY KEY,
        test TEXT
      )
    `;
    
    const { error: createError } = await execute(testTable);
    if (createError) {
      console.error('❌ CREATE TABLE failed:', createError.message);
    } else {
      console.log('✅ CREATE TABLE works');
      
      // Clean up test table
      await execute('DROP TABLE IF EXISTS test_faith_milestone');
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

checkDatabase();
