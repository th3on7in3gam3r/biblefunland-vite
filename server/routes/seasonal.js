/**
 * server/routes/seasonal.js
 * Seasonal content management + AI generation
 */
const express = require('express')
const router = express.Router()
const { execute, query } = require('../lib/turso')
const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── DB init ───────────────────────────────────────────────────────────────────
async function initTables() {
  await execute(`CREATE TABLE IF NOT EXISTS seasonal_content (
    id TEXT PRIMARY KEY,
    season TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    route TEXT,
    is_active INTEGER DEFAULT 1,
    created_by TEXT,
    created_at TEXT NOT NULL
  )`).catch(() => {})

  await execute(`CREATE TABLE IF NOT EXISTS seasonal_badges (
    id TEXT PRIMARY KEY,
    season TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    label TEXT NOT NULL,
    emoji TEXT,
    points INTEGER DEFAULT 100,
    is_active INTEGER DEFAULT 1
  )`).catch(() => {})
}
initTables()

function getUserId(req) {
  const auth = req.headers['authorization'] || ''
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
}

// ── POST /api/seasonal/generate — AI content generation ───────────────────────
router.post('/generate', async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Auth required' })

  const { prompt, type, season } = req.body
  if (!prompt) return res.status(400).json({ error: 'prompt required' })

  try {
    const systemPrompt = `You are a faith-based content creator for BibleFunLand, a platform for families and children. 
Create engaging, Scripture-based content that is appropriate for all ages. 
Keep content warm, encouraging, and rooted in the Bible.
For ${season} season content, make it relevant and celebratory.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]?.text || ''
    res.json({ content, type, season })
  } catch (err) {
    console.error('[Seasonal AI] Error:', err.message)
    res.status(500).json({ error: 'AI generation failed' })
  }
})

// ── GET /api/seasonal/active — get current season config ──────────────────────
router.get('/active', (req, res) => {
  const now = new Date()
  const m = now.getMonth()
  const d = now.getDate()

  let season = null
  if ((m === 2 && d >= 15) || (m === 3 && d <= 30)) season = 'easter'
  else if (m === 11) season = 'christmas'
  else if ((m === 7 && d >= 15) || (m === 8 && d <= 15)) season = 'back-to-school'
  else if (m === 10 && d >= 15 && d <= 30) season = 'thanksgiving'

  res.json({ season, date: now.toISOString() })
})

// ── GET /api/seasonal/badges — get active seasonal badges ─────────────────────
router.get('/badges', async (req, res) => {
  const { data } = await query('SELECT * FROM seasonal_badges WHERE is_active = 1', [])
  res.json({ badges: data || [] })
})

// ── POST /api/seasonal/badges — create seasonal badge (admin) ─────────────────
router.post('/badges', async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Auth required' })

  const { season, badge_id, label, emoji, points } = req.body
  const id = require('crypto').randomUUID()

  const { error } = await execute(
    'INSERT INTO seasonal_badges (id, season, badge_id, label, emoji, points) VALUES (?,?,?,?,?,?)',
    [id, season, badge_id, label, emoji || '🏅', points || 100]
  )
  if (error) return res.status(500).json({ error: 'Failed to create badge' })
  res.json({ id, created: true })
})

module.exports = router
