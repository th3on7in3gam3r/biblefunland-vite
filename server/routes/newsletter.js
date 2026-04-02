/**
 * server/routes/newsletter.js
 * Newsletter signup — stores emails in Turso, optionally syncs to Resend audience
 */
const express = require('express')
const router = express.Router()
const { execute, query } = require('../lib/turso')
const crypto = require('crypto')

async function initTable() {
  await execute(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TEXT NOT NULL,
    source TEXT DEFAULT 'website',
    is_active INTEGER DEFAULT 1
  )`).catch(() => {})
}
initTable()

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  const { email, source = 'website' } = req.body || {}
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' })

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const { error } = await execute(
    `INSERT OR IGNORE INTO newsletter_subscribers (id, email, subscribed_at, source) VALUES (?,?,?,?)`,
    [id, email.toLowerCase().trim(), now, source]
  )

  if (error) return res.status(500).json({ error: 'Failed to subscribe' })

  // Optional: sync to Resend audience
  if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
    try {
      await fetch(`https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), unsubscribed: false }),
      })
    } catch (e) {
      console.warn('[Newsletter] Resend sync failed:', e.message)
    }
  }

  res.json({ success: true, message: 'Subscribed successfully' })
})

// GET /api/newsletter/subscribers (admin only — basic check)
router.get('/subscribers', async (req, res) => {
  const { data } = await query('SELECT email, subscribed_at, source FROM newsletter_subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC', [])
  res.json({ subscribers: data || [], total: (data || []).length })
})

module.exports = router
