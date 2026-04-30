import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = 'BibleFunLand <hello@biblefunland.com>'
const SITE_URL = 'https://biblefunland.com'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ─── Email Templates ──────────────────────────────────────────────────────────

function welcomeEmail(name: string) {
  return {
    subject: '🌟 Welcome to BibleFunLand!',
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to BibleFunLand</title></head>
<body style="margin:0;padding:0;background:#0F0F1A;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;padding:40px 30px;background:linear-gradient(135deg,#1A0A2E,#0A1A14);border-radius:20px 20px 0 0;border:1px solid rgba(255,255,255,.08);">
      <div style="font-size:3rem;margin-bottom:12px;">📖</div>
      <h1 style="margin:0;color:white;font-size:2rem;font-weight:800;">Welcome to BibleFunLand!</h1>
      <p style="color:rgba(255,255,255,.5);margin:10px 0 0;font-size:1rem;">The most complete Bible platform on the internet</p>
    </div>
    <!-- Body -->
    <div style="background:#1A1A2E;padding:36px 32px;border-left:1px solid rgba(255,255,255,.08);border-right:1px solid rgba(255,255,255,.08);">
      <p style="color:rgba(255,255,255,.8);font-size:1rem;line-height:1.8;margin:0 0 20px;">Hi ${name || 'friend'} 👋</p>
      <p style="color:rgba(255,255,255,.6);font-size:.95rem;line-height:1.8;margin:0 0 24px;">
        We're so glad you're here. BibleFunLand was built for one reason: to make Scripture engaging, accessible, and life-changing for everyone — from kids to pastors.
      </p>
      <!-- Features list -->
      <div style="background:rgba(255,255,255,.04);border-radius:14px;padding:20px;margin-bottom:24px;border:1px solid rgba(255,255,255,.06);">
        <p style="color:rgba(255,255,255,.5);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">Here's what's waiting for you:</p>
        ${[
          ['🎮','Games','Bible Trivia, David & Goliath, Scripture Runner, Battle Arena'],
          ['🤖','AI Tools','Prayer Companion, Devotional Generator, Bible Study Creator'],
          ['🌍','World Prayer','Pray for a different nation every single day'],
          ['📖','Bible Tools','Timeline, Cross-Reference Web, Original Language Explorer'],
          ['🎨','Create','Scripture Wallpapers, Share Cards, Rap Generator'],
        ].map(([e,t,d]) => `
          <div style="display:flex;gap:12px;margin-bottom:10px;align-items:flex-start;">
            <span style="font-size:1.2rem;flex-shrink:0;margin-top:2px;">${e}</span>
            <div><strong style="color:white;font-size:.9rem;">${t}</strong><br><span style="color:rgba(255,255,255,.4);font-size:.8rem;">${d}</span></div>
          </div>
        `).join('')}
      </div>
      <!-- Today's verse -->
      <div style="background:linear-gradient(135deg,rgba(16,185,129,.15),rgba(16,185,129,.05));border-left:3px solid #10B981;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px;">
        <p style="color:rgba(16,185,129,.8);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Today's Verse</p>
        <p style="color:white;font-size:.95rem;font-style:italic;line-height:1.7;margin:0 0 6px;">"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."</p>
        <p style="color:rgba(255,255,255,.5);font-size:.8rem;margin:0;">— Jeremiah 29:11</p>
      </div>
      <div style="text-align:center;">
        <a href="${SITE_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#064E3B,#0F9D58);color:white;text-decoration:none;border-radius:12px;font-weight:700;font-size:.95rem;letter-spacing:.3px;">Start Exploring →</a>
      </div>
    </div>
    <!-- Footer -->
    <div style="background:#111118;padding:24px 32px;border-radius:0 0 20px 20px;border:1px solid rgba(255,255,255,.06);border-top:none;text-align:center;">
      <p style="color:rgba(255,255,255,.3);font-size:.72rem;margin:0 0 8px;">
        You're receiving this because you signed up at BibleFunLand.com
      </p>
      <a href="${SITE_URL}/privacy" style="color:rgba(255,255,255,.25);font-size:.68rem;">Privacy Policy</a> &nbsp;·&nbsp;
      <a href="${SITE_URL}/unsubscribe" style="color:rgba(255,255,255,.25);font-size:.68rem;">Unsubscribe</a>
    </div>
  </div>
</body></html>`
  }
}

function streakNudgeEmail(name: string, streakDays: number) {
  return {
    subject: `🔥 Your ${streakDays}-day streak is waiting, ${name || 'friend'}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0F0F1A;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#1A0A00,#2D1500);border-radius:20px;padding:40px 36px;border:1px solid rgba(249,115,22,.2);text-align:center;">
      <div style="font-size:4rem;margin-bottom:8px;">🔥</div>
      <h1 style="color:white;font-size:1.8rem;margin:0 0 12px;">Don't break your streak!</h1>
      <p style="color:rgba(255,255,255,.5);font-size:.95rem;margin:0 0 8px;">Hi ${name || 'friend'} — it's been a couple days.</p>
      <p style="color:rgba(255,255,255,.65);font-size:.9rem;line-height:1.7;margin:0 0 24px;">
        You've built a <strong style="color:#F97316;">${streakDays} day reading streak</strong>. Come back today — even one verse counts. 
        Your future self will thank you.
      </p>
      <div style="background:rgba(255,255,255,.04);border-radius:14px;padding:18px;margin-bottom:28px;border:1px solid rgba(255,255,255,.06);">
        <p style="color:rgba(255,255,255,.4);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Quick ways to get back in →</p>
        ${[
          ['📖','Read a daily verse — 30 seconds'],
          ['🎮','Play Bible Trivia — 5 minutes'],
          ['🙏','Use the Prayer Companion'],
        ].map(([e,l])=>`<div style="text-align:left;padding:8px 0;color:rgba(255,255,255,.6);font-size:.88rem;">${e} &nbsp;${l}</div>`).join('')}
      </div>
      <a href="${SITE_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#C2410C,#EA580C);color:white;text-decoration:none;border-radius:12px;font-weight:700;font-size:.9rem;">Back to BibleFunLand 🔥</a>
    </div>
  </div>
</body></html>`
  }
}

function weeklyNewsletterEmail(weekVerse: {text: string, ref: string}, featuredGame: string) {
  return {
    subject: `📖 This Week at BibleFunLand · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'})}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0F0F1A;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0A1A14,#064E3B);border-radius:20px 20px 0 0;padding:36px 32px;border:1px solid rgba(16,185,129,.15);text-align:center;">
      <p style="color:rgba(16,185,129,.7);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Weekly Devotional</p>
      <h1 style="color:white;font-size:1.9rem;margin:0;">This Week at BibleFunLand</h1>
      <p style="color:rgba(255,255,255,.35);font-size:.82rem;margin:8px 0 0;">${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>
    </div>
    <!-- Verse of the week -->
    <div style="background:#1A1A2E;padding:28px 32px;border-left:1px solid rgba(255,255,255,.08);border-right:1px solid rgba(255,255,255,.08);">
      <p style="color:rgba(255,255,255,.4);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">📖 Verse of the Week</p>
      <div style="background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(6,78,59,.08));border-left:3px solid #10B981;border-radius:0 14px 14px 0;padding:18px 20px;margin-bottom:28px;">
        <p style="color:white;font-size:1.05rem;font-style:italic;line-height:1.8;margin:0 0 8px;">"${weekVerse.text}"</p>
        <p style="color:#6EE7B7;font-size:.82rem;font-weight:700;margin:0;">— ${weekVerse.ref}</p>
      </div>
      <!-- Featured game -->
      <div style="background:rgba(255,255,255,.03);border-radius:14px;padding:20px;margin-bottom:24px;border:1px solid rgba(255,255,255,.06);">
        <p style="color:rgba(255,255,255,.4);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">🎮 Featured This Week: ${featuredGame}</p>
        <p style="color:rgba(255,255,255,.6);font-size:.88rem;line-height:1.7;margin:0 0 16px;">Challenge yourself (or a friend) this week. Bible Battle Arena is live — grab a room code and compete in real-time trivia.</p>
        <a href="${SITE_URL}/game/battle-arena" style="display:inline-block;padding:10px 20px;background:linear-gradient(135deg,#1C0A00,#3D1500);color:#F97316;text-decoration:none;border-radius:10px;font-weight:700;font-size:.82rem;border:1px solid rgba(249,115,22,.3);">Play Now ⚔️</a>
      </div>
      <!-- Quick links -->
      <p style="color:rgba(255,255,255,.4);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">🔗 This Week's Features</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:28px;">
        ${[
          ['🤖','AI Prayer Companion','/ai/prayer-companion'],
          ['🌍','Pray for the World','/pray-for-world'],
          ['🔤','Language Explorer','/language-explorer'],
          ['🎨','Wallpaper Maker','/wallpaper'],
        ].map(([e,l,u])=>`
          <a href="${SITE_URL}${u}" style="display:block;padding:12px;background:rgba(255,255,255,.03);border-radius:10px;border:1px solid rgba(255,255,255,.06);text-decoration:none;color:white;font-size:.82rem;">
            ${e} <strong>${l}</strong>
          </a>
        `).join('')}
      </div>
      <div style="text-align:center;">
        <a href="${SITE_URL}" style="display:inline-block;padding:13px 28px;background:linear-gradient(135deg,#064E3B,#0F9D58);color:white;text-decoration:none;border-radius:12px;font-weight:700;font-size:.9rem;">Visit BibleFunLand →</a>
      </div>
    </div>
    <!-- Footer -->
    <div style="background:#111118;padding:20px 32px;border-radius:0 0 20px 20px;border:1px solid rgba(255,255,255,.06);border-top:none;text-align:center;">
      <p style="color:rgba(255,255,255,.25);font-size:.68rem;margin:0 0 6px;">BibleFunLand.com · Weekly newsletter every Sunday</p>
      <a href="${SITE_URL}/unsubscribe" style="color:rgba(255,255,255,.2);font-size:.65rem;">Unsubscribe</a>
    </div>
  </div>
</body></html>`
  }
}

// ─── Send via Resend ──────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
  })
  return res.json()
}

// ─── Handler ──────────────────────────────────────────────────────────────────

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { type, to, name, streakDays } = await req.json()

    let emailData
    const weekVerse = { text: 'For I know the plans I have for you, declares the Lord.', ref: 'Jeremiah 29:11' }

    switch (type) {
      case 'welcome':
        emailData = welcomeEmail(name)
        break
      case 'streak_nudge':
        emailData = streakNudgeEmail(name, streakDays || 7)
        break
      case 'weekly_newsletter':
        emailData = weeklyNewsletterEmail(weekVerse, 'Bible Battle Arena')
        break
      default:
        return new Response(JSON.stringify({ error: 'Unknown email type' }), { status: 400, headers: corsHeaders })
    }

    const result = await sendEmail(to, emailData.subject, emailData.html)
    return new Response(JSON.stringify({ success: true, result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})

// ─── Supabase SQL to wire this up ─────────────────────────────────────────────
// Run in Supabase SQL Editor:
//
// 1. Welcome email trigger (fires when user signs up):
// CREATE OR REPLACE FUNCTION trigger_welcome_email()
// RETURNS TRIGGER AS $$
// BEGIN
//   PERFORM net.http_post(
//     url := current_setting('app.supabase_url') || '/functions/v1/send-email',
//     headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || current_setting('app.service_key')),
//     body := jsonb_build_object('type','welcome','to',NEW.email,'name',NEW.raw_user_meta_data->>'full_name')
//   );
//   RETURN NEW;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;
//
// CREATE TRIGGER on_auth_user_created
//   AFTER INSERT ON auth.users
//   FOR EACH ROW EXECUTE PROCEDURE trigger_welcome_email();
//
// 2. Deploy:
// supabase functions deploy send-email --no-verify-jwt
//
// 3. Set secrets:
// supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
