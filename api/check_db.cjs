// Load dotenv first to ensure the Turso client can pick up the remote credentials
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { client } = require('./lib/turso');

async function check() {
  console.log('🔍 [Remote Database Audit] BibleFunLand Production Check...');
  try {
    // 📊 Table Presence Check
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
    const tableList = tables.rows.map(r => r.name);
    console.log('✅ LIVE REMOTE TABLE LIST:', tableList.join(', '));

    // 🏆 Streaks Check
    if (tableList.includes('streaks')) {
      const streaks = await client.execute("SELECT COUNT(*) as count FROM streaks;");
      console.log('🏆 STREAKS:', streaks.rows[0].count);
    } else {
      console.warn('❌ Missing table: streaks');
    }

    // 🙏 Prayers Check
    if (tableList.includes('live_prayers')) {
      const prayers = await client.execute("SELECT COUNT(*) as count FROM live_prayers;");
      console.log('🙏 LIVE PRAYERS:', prayers.rows[0].count);
    } else {
      console.warn('❌ Missing table: live_prayers');
    }

    // 📈 Family Progress Check
    if (tableList.includes('family_progress')) {
      const progress = await client.execute("SELECT COUNT(*) as count FROM family_progress;");
      console.log('👨‍👩‍👧‍👦 FAMILY PROGRESS:', progress.rows[0].count);
    } else {
      console.warn('❌ Missing table: family_progress');
    }

  } catch (err) {
    console.error('❌ [Remote Database Audit Failure]:', err.message);
  }
}

check();
