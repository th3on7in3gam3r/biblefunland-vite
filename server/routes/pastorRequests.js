/**
 * server/routes/pastorRequests.js
 * POST /api/pastor-requests — Submit a pastor verification request
 * GET  /api/pastor-requests — List all pending requests (admin only)
 * POST /api/pastor-requests/:id/approve — Approve a request (admin only)
 */

const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const { execute, query, queryOne } = require('../lib/turso');

const resend = new Resend(process.env.RESEND_API_KEY);

// Ensure the pastor_requests table exists on startup
async function ensureTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS pastor_requests (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      user_email  TEXT NOT NULL,
      full_name   TEXT NOT NULL,
      church_name TEXT NOT NULL,
      city        TEXT NOT NULL,
      denomination TEXT,
      website     TEXT,
      message     TEXT,
      status      TEXT DEFAULT 'pending',
      created_at  TEXT NOT NULL,
      reviewed_at TEXT
    )
  `);
}
ensureTable().catch(err => console.warn('[pastor_requests] Table init warning:', err.message));

function uid() {
  return crypto.randomUUID();
}
function now() {
  return new Date().toISOString();
}

// ── POST /api/pastor-requests ─────────────────────────────────────────────────
// Submit a new pastor verification request
router.post('/', async (req, res) => {
  try {
    const { user_id, user_email, full_name, church_name, city, denomination, website, message } = req.body;

    if (!user_id || !user_email || !full_name || !church_name || !city) {
      return res.status(400).json({ error: 'user_id, user_email, full_name, church_name, and city are required' });
    }

    // Check if user already has a pending request
    const { data: existing } = await queryOne(
      `SELECT id FROM pastor_requests WHERE user_id = ? AND status = 'pending' LIMIT 1`,
      [user_id]
    );
    if (existing) {
      return res.status(409).json({ error: 'You already have a pending verification request', detail: 'duplicate_request' });
    }

    const requestId = uid();

    // Save to database
    await execute(
      `INSERT INTO pastor_requests (id, user_id, user_email, full_name, church_name, city, denomination, website, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [requestId, user_id, user_email, full_name, church_name, city, denomination || null, website || null, message || null, now()]
    );

    // ── Email 1: Admin notification ───────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@biblefunland.com';
    const adminHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#e2e8f0;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:32px;text-align:center">
          <div style="font-size:3rem">⛪</div>
          <h1 style="color:white;margin:12px 0 4px;font-size:1.5rem">New Pastor Verification Request</h1>
          <p style="color:rgba(255,255,255,.7);margin:0">Action required — review and send the access code</p>
        </div>
        <div style="padding:32px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;color:#94a3b8;font-size:.85rem;width:140px">Full Name</td><td style="padding:10px 0;font-weight:700;color:white">${full_name}</td></tr>
            <tr><td style="padding:10px 0;color:#94a3b8;font-size:.85rem">Email</td><td style="padding:10px 0;font-weight:700;color:white"><a href="mailto:${user_email}" style="color:#60a5fa">${user_email}</a></td></tr>
            <tr><td style="padding:10px 0;color:#94a3b8;font-size:.85rem">Church</td><td style="padding:10px 0;font-weight:700;color:white">${church_name}</td></tr>
            <tr><td style="padding:10px 0;color:#94a3b8;font-size:.85rem">City</td><td style="padding:10px 0;font-weight:700;color:white">${city}</td></tr>
            <tr><td style="padding:10px 0;color:#94a3b8;font-size:.85rem">Denomination</td><td style="padding:10px 0;font-weight:700;color:white">${denomination || '—'}</td></tr>
            <tr><td style="padding:10px 0;color:#94a3b8;font-size:.85rem">Website</td><td style="padding:10px 0;font-weight:700;color:white">${website ? `<a href="${website}" style="color:#60a5fa">${website}</a>` : '—'}</td></tr>
            ${message ? `<tr><td style="padding:10px 0;color:#94a3b8;font-size:.85rem;vertical-align:top">Message</td><td style="padding:10px 0;color:#cbd5e1;font-style:italic">"${message}"</td></tr>` : ''}
          </table>
          <div style="margin-top:24px;padding:20px;background:#1e293b;border-radius:12px;border:1px solid #334155">
            <p style="margin:0 0 12px;color:#94a3b8;font-size:.85rem">To approve this pastor, reply to their email with the access code:</p>
            <div style="font-size:2rem;font-weight:900;letter-spacing:6px;color:#60a5fa;text-align:center;padding:16px;background:#0f172a;border-radius:8px">${process.env.PASTOR_ACCESS_CODE || 'GRACE2024'}</div>
            <p style="margin:12px 0 0;color:#64748b;font-size:.75rem;text-align:center">Request ID: ${requestId}</p>
          </div>
        </div>
      </div>
    `;

    // ── Email 2: Pastor confirmation ──────────────────────────────────────────
    const pastorHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#e2e8f0;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:32px;text-align:center">
          <div style="font-size:3rem">✝️</div>
          <h1 style="color:white;margin:12px 0 4px;font-size:1.5rem">Request Received!</h1>
          <p style="color:rgba(255,255,255,.7);margin:0">We'll review your pastor verification soon</p>
        </div>
        <div style="padding:32px">
          <p style="color:#cbd5e1;line-height:1.7">Hi <strong style="color:white">${full_name}</strong>,</p>
          <p style="color:#cbd5e1;line-height:1.7">
            Thank you for submitting your pastor verification request for
            <strong style="color:white">${church_name}</strong> in ${city}.
            We've received your application and our team will review it within
            <strong style="color:white">24–48 hours</strong>.
          </p>
          <p style="color:#cbd5e1;line-height:1.7">
            Once approved, you'll receive an email with your unique access code
            to unlock the Pastor role and Church Hub on BibleFunLand.
          </p>
          <div style="margin:24px 0;padding:20px;background:#1e293b;border-radius:12px;border:1px solid #334155">
            <p style="margin:0;font-size:.85rem;color:#94a3b8">Your submitted details:</p>
            <p style="margin:8px 0 0;color:white;font-weight:700">${church_name} · ${city}${denomination ? ` · ${denomination}` : ''}</p>
          </div>
          <p style="color:#64748b;font-size:.8rem;line-height:1.7">
            If you have questions, reply to this email or contact us at
            <a href="mailto:support@biblefunland.com" style="color:#60a5fa">support@biblefunland.com</a>
          </p>
          <p style="color:#cbd5e1;margin-top:24px">God bless your ministry! 🙏<br/><strong style="color:white">The BibleFunLand Team</strong></p>
        </div>
      </div>
    `;

    // Send both emails (don't block on failure)
    const emailFrom = 'BibleFunLand <onboarding@resend.dev>';
    const emailResults = await Promise.allSettled([
      resend.emails.send({ from: emailFrom, to: adminEmail, subject: `⛪ New Pastor Request: ${full_name} — ${church_name}`, html: adminHtml }),
      resend.emails.send({ from: emailFrom, to: user_email, subject: '✝️ BibleFunLand — Pastor Verification Request Received', html: pastorHtml })
    ]);

    const adminEmailOk = emailResults[0].status === 'fulfilled';
    const pastorEmailOk = emailResults[1].status === 'fulfilled';

    if (!adminEmailOk) console.error('[PastorRequest] Admin email failed:', emailResults[0].reason);
    if (!pastorEmailOk) console.error('[PastorRequest] Pastor confirmation email failed:', emailResults[1].reason);

    res.json({
      success: true,
      request_id: requestId,
      admin_email_sent: adminEmailOk,
      confirmation_email_sent: pastorEmailOk
    });

  } catch (err) {
    console.error('[PastorRequest] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit request' });
  }
});

// ── GET /api/pastor-requests — List all requests (admin use) ─────────────────
router.get('/', async (req, res) => {
  try {
    const { data } = await query(
      `SELECT * FROM pastor_requests ORDER BY created_at DESC LIMIT 100`
    );
    res.json({ data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
