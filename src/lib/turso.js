import { createClient } from '@libsql/client'

// ─── Client ───────────────────────────────────────────────────────────────────
// Get these from turso.tech → your database → Connect
// VITE_TURSO_DATABASE_URL=libsql://your-db-name-yourname.turso.io
// VITE_TURSO_AUTH_TOKEN=your-auth-token-here

const url   = import.meta.env.VITE_TURSO_DATABASE_URL
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.warn(
    '⚠️  Turso environment variables not set.\n' +
    'Add to your .env file:\n' +
    '  VITE_TURSO_DATABASE_URL=libsql://your-db.turso.io\n' +
    '  VITE_TURSO_AUTH_TOKEN=your-token\n' +
    'Get both from: turso.tech → your database → Connect button'
  )
}

export const turso = createClient({
  url:       url       ?? 'file:local.db',   // falls back to local SQLite for dev
  authToken: authToken ?? undefined,
})

// ─── Query helper ─────────────────────────────────────────────────────────────
// Wraps turso.execute() in a consistent { data, error } shape
// so it reads exactly like Supabase calls throughout your pages.

export async function query(sql, args = []) {
  try {
    const result = await turso.execute({ sql, args })
    return { data: result.rows, error: null }
  } catch (err) {
    console.error('[Turso]', err)
    return { data: null, error: err }
  }
}

// Single row helper — returns first row or null
export async function queryOne(sql, args = []) {
  const { data, error } = await query(sql, args)
  return { data: data?.[0] ?? null, error }
}

// Execute without caring about returned rows (INSERT, UPDATE, DELETE)
export async function execute(sql, args = []) {
  try {
    await turso.execute({ sql, args })
    return { error: null }
  } catch (err) {
    console.error('[Turso]', err)
    return { error: err }
  }
}

// Batch multiple statements in a single round trip
export async function batch(statements) {
  try {
    await turso.batch(statements)
    return { error: null }
  } catch (err) {
    console.error('[Turso batch]', err)
    return { error: err }
  }
}

export default turso
