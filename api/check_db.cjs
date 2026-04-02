const { client } = require('./server/lib/turso');
require('dotenv').config({ path: './server/.env' });

async function check() {
  try {
    const result = await client.execute("SELECT * FROM child_profiles;");
    console.log('--- CHILD PROFILES ---');
    console.log(JSON.stringify(result.rows, null, 2));
    
    const profiles = await client.execute("SELECT * FROM profiles;");
    console.log('--- USER PROFILES ---');
    console.log(JSON.stringify(profiles.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
