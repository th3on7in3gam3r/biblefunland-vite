/**
 * server/routes/newsletter.js
 * Newsletter signup — stores emails in Turso + sends Resend welcome email
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

const WELCOME_HTML = (siteUrl = 'https://biblefunland.com') => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Poppins,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1E1B4B,#312E81);padding:40px 32px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">✝️</div>
      <h1 style="color:white;font-size:28px;font-weight:800;margin:0 0 8px">Welcome to BibleFunLand!</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;margin:0">Faith-powered fun for kids &amp; families</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 32px">
      <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 20px">
        You're in! 🎉 Thank you for joining thousands of families using BibleFunLand to make Bible learning joyful and memorable.
      </p>

      <h2 style="font-size:18px;font-weight:800;color:#1E1B4B;margin:0 0 16px">🎁 Your free resources are ready:</h2>

      <!-- Resource cards -->
      <div style="background:#F0FDF4;border:1.5px solid #A7F3D0;border-radius:12px;padding:16px 20px;margin-bottom:12px">
        <div style="font-weight:800;color:#065F46;font-size:15px;margin-bottom:4px">🖨️ Free Bible Activity Sheets</div>
        <div style="color:#6B7280;font-size:13px;margin-bottom:10px">Word searches, coloring pages, crosswords &amp; more — print-ready for home or classroom.</div>
        <a href="${siteUrl}/play/activity-sheets" style="display:inline-block;background:#10B981;color:white;padding:9px 20px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">Download Free Sheets →</a>
      </div>

      <div style="background:#EFF6FF;border:1.5px solid #BFDBFE;border-radius:12px;padding:16px 20px;margin-bottom:12px">
        <div style="font-weight:800;color:#1E40AF;font-size:15px;margin-bottom:4px">🎮 Bible Games — 100% Free</div>
        <div style="color:#6B7280;font-size:13px;margin-bottom:10px">Scripture Trivia, David &amp; Goliath, Escape Room, Scripture Runner &amp; more.</div>
        <a href="${siteUrl}/play" style="display:inline-block;background:#3B82F6;color:white;padding:9px 20px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">Play Now →</a>
      </div>

      <div style="background:#F5F3FF;border:1.5px solid #DDD6FE;border-radius:12px;padding:16px 20px;margin-bottom:24px">
        <div style="font-weight:800;color:#4C1D95;font-size:15px;margin-bottom:4px">🤖 AI Bible Tools</div>
        <div style="color:#6B7280;font-size:13px;margin-bottom:10px">AI Devotionals, Bible Character Chat, Personal Parables &amp; Bible Adventure Builder.</div>
        <a href="${siteUrl}/ai" style="display:inline-block;background:#8B5CF6;color:white;padding:9px 20px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">Try AI Fun →</a>
      </div>

      <p style="font-size:14px;color:#6B7280;line-height:1.7;margin:0 0 8px">
        We'll send you alerts when new games, printables, and seasonal content drop. No spam — ever.
      </p>
      <p style="font-size:14px;color:#6B7280;margin:0">
        — The BibleFunLand Team 🕊️
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#F9FAFB;padding:20px 32px;text-align:center;border-top:1px solid #E5E7EB">
      <p style="font-size:12px;color:#9CA3AF;margin:0">
        BibleFunLand · Faith-centered learning for families · 100% Free<br>
        <a href="${siteUrl}" style="color:#6366F1;text-decoration:none">biblefunland.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`

const GUIDE_HTML = (siteUrl = 'https://biblefunland.com') => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Poppins,Arial,sans-serif">
  <div style="max-width:600px;margin:24px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#3B82F6,#8B5CF6,#EC4899);padding:40px 32px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">🎁</div>
      <h1 style="color:white;font-size:26px;font-weight:800;margin:0 0 8px">Your Free 7-Day Bible Adventure Guide!</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0">Games · Devotionals · Memory Verses · Printables</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 32px">
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px">
        Welcome! Here's your 7-day plan to make Bible learning a daily adventure for your family. Each day takes just 10–15 minutes. 🌟
      </p>

      <!-- 7 Days -->
      ${[
        ['Day 1 — Creation', '🌍', 'Read Genesis 1. Play the Bible Timeline at BibleFunLand and find the Creation event.', '/explore/timeline'],
        ['Day 2 — Heroes of Faith', '🏹', 'Read about David & Goliath (1 Samuel 17). Play the David & Goliath game!', '/play/game/david-goliath'],
        ['Day 3 — Jesus\' Ministry', '✝️', 'Explore 3 locations from Jesus\' Ministry on the Living Bible Map.', '/explore/world'],
        ['Day 4 — Memory Verse', '📖', 'Memorize Philippians 4:13 using the Flashcards tool. Try to say it from memory!', '/play/flashcards'],
        ['Day 5 — AI Devotional', '🙏', 'Use the AI Devotional to get a personalized devotional for your family today.', '/ai/devotional'],
        ['Day 6 — Bible Adventure', '🗺️', 'Build a Bible Adventure together — pick a hero and answer the questions!', '/ai/adventure-builder'],
        ['Day 7 — Celebrate!', '🏆', 'Print a Bible activity sheet and celebrate completing your 7-day adventure!', '/play/activity-sheets'],
      ].map(([title, emoji, desc, link]) => `
        <div style="border-left:4px solid #8B5CF6;padding:12px 16px;margin-bottom:12px;background:#F9FAFB;border-radius:0 10px 10px 0">
          <div style="font-weight:800;color:#1E1B4B;font-size:14px;margin-bottom:4px">${emoji} ${title}</div>
          <div style="color:#6B7280;font-size:13px;margin-bottom:8px;line-height:1.5">${desc}</div>
          <a href="${siteUrl}${link}" style="display:inline-block;background:#8B5CF6;color:white;padding:6px 14px;border-radius:7px;font-weight:700;font-size:12px;text-decoration:none">Start Day →</a>
        </div>
      `).join('')}

      <div style="background:#FFFBEB;border:1.5px solid #FDE68A;border-radius:12px;padding:16px 20px;margin-top:20px;text-align:center">
        <div style="font-weight:800;color:#92400E;font-size:15px;margin-bottom:6px">🖨️ Free Printable Bonus</div>
        <div style="color:#B45309;font-size:13px;margin-bottom:10px">Download and print Bible activity sheets, coloring pages, and word searches — free forever.</div>
        <a href="${siteUrl}/play/activity-sheets" style="display:inline-block;background:#F59E0B;color:white;padding:9px 20px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">Get Free Printables →</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F9FAFB;padding:20px 32px;text-align:center;border-top:1px solid #E5E7EB">
      <p style="font-size:12px;color:#9CA3AF;margin:0">
        BibleFunLand · Faith-centered learning for families · 100% Free<br>
        <a href="${siteUrl}" style="color:#6366F1;text-decoration:none">biblefunland.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`
router.post('/subscribe', async (req, res) => {
  const { email, source = 'website' } = req.body || {}
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' })

  const cleanEmail = email.toLowerCase().trim()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const { error } = await execute(
    `INSERT OR IGNORE INTO newsletter_subscribers (id, email, subscribed_at, source) VALUES (?,?,?,?)`,
    [id, cleanEmail, now, source]
  )

  if (error) return res.status(500).json({ error: 'Failed to subscribe' })

  // Send appropriate welcome email via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = require('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      const siteUrl = process.env.VITE_APP_URL || 'https://biblefunland.com'
      const is7Day = source === 'popup_7day'
      await resend.emails.send({
        from: 'BibleFunLand <hello@biblefunland.com>',
        to: cleanEmail,
        subject: is7Day
          ? '🎁 Your Free 7-Day Bible Adventure Guide is here!'
          : '🎁 Your free Bible printables are ready!',
        html: is7Day ? GUIDE_HTML(siteUrl) : WELCOME_HTML(siteUrl),
      })
    } catch (e) {
      console.warn('[Newsletter] Welcome email failed:', e.message)
    }
  }

  // Optional: sync to Resend audience
  if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
    try {
      await fetch(`https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, unsubscribed: false }),
      })
    } catch (e) {
      console.warn('[Newsletter] Resend audience sync failed:', e.message)
    }
  }

  res.json({ success: true, message: 'Subscribed successfully' })
})

// GET /api/newsletter/subscribers (admin only)
router.get('/subscribers', async (req, res) => {
  const { data } = await query('SELECT email, subscribed_at, source FROM newsletter_subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC', [])
  res.json({ subscribers: data || [], total: (data || []).length })
})

module.exports = router
