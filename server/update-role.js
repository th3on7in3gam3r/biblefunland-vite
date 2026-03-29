#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const { createClient } = require('@libsql/client')

const turso = createClient({ 
  url: process.env.TURSO_DATABASE_URL, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});

(async () => {
  await turso.execute({
    sql: 'UPDATE profiles SET role = ? WHERE id = ?',
    args: ['Parent', 'user_3B8K1Fd6iKY8wg3b4ilhwEhZv50']
  });
  console.log('✅ Role updated to Parent');
  
  const result = await turso.execute({
    sql: 'SELECT id, display_name, role FROM profiles WHERE id = ?',
    args: ['user_3B8K1Fd6iKY8wg3b4ilhwEhZv50']
  });
  console.log('Profile:', result.rows[0]);
})();
