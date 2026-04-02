import { useState } from 'react';
import { Link } from 'react-router-dom';

const CHECKLIST = [
  {
    category: '📱 Mobile & Tablet',
    items: [
      { id: 'mobile-home', label: 'Home page renders correctly on mobile (375px)', route: '/' },
      { id: 'mobile-play', label: '/play section — game cards stack properly', route: '/play' },
      { id: 'mobile-nav', label: 'Nav hamburger menu opens/closes', route: '/' },
      { id: 'mobile-bible', label: 'Bible Explorer readable on mobile', route: '/explore/bible' },
      {
        id: 'mobile-trivia',
        label: 'Trivia game playable on touch devices (44px+ targets)',
        route: '/play/trivia',
      },
      { id: 'tablet-layout', label: 'Tablet (768px) layouts look correct', route: '/' },
      {
        id: 'mobile-prayer',
        label: 'Prayer Wall form usable on mobile',
        route: '/community/prayer',
      },
    ],
  },
  {
    category: '👶 Kids Mode & Parent Mode',
    items: [
      { id: 'kids-toggle', label: 'Kids Mode toggle works in Nav', route: '/' },
      { id: 'kids-font', label: 'Kids Mode increases font size + Baloo 2 font', route: '/' },
      {
        id: 'kids-hide',
        label: 'Advanced sections hidden in Kids Mode (Apologetics, Finance)',
        route: '/grow',
      },
      { id: 'kids-pin', label: 'PIN required to exit Kids Mode', route: '/' },
      { id: 'parent-hub', label: 'Parent Hub accessible and loads', route: '/parents' },
      {
        id: 'parental-controls',
        label: 'Parental controls page works',
        route: '/parents/controls',
      },
      { id: 'child-profiles', label: 'Child profiles load correctly', route: '/parents' },
      { id: 'kids-ab-test', label: 'A/B tests show control variant in Kids Mode', route: '/' },
    ],
  },
  {
    category: '💎 Pro & Stripe',
    items: [
      { id: 'pro-page', label: 'Premium/Pro page loads', route: '/premium' },
      { id: 'stripe-checkout', label: 'Stripe checkout flow initiates', route: '/premium' },
      { id: 'pro-gate', label: 'ProGate blocks non-Pro users on /ai and /grow', route: '/ai' },
      { id: 'pro-badge', label: 'Pro badge shows in profile after upgrade', route: '/profile' },
      {
        id: 'stripe-webhook',
        label: 'Stripe webhook endpoint responds (POST /api/checkout)',
        route: null,
      },
    ],
  },
  {
    category: '🏆 Gamification',
    items: [
      { id: 'streak-checkin', label: 'Daily check-in increments streak', route: '/' },
      {
        id: 'trivia-score',
        label: 'Trivia completion records to child_activity',
        route: '/play/trivia',
      },
      {
        id: 'trivia-share',
        label: 'Share game card shows on trivia results',
        route: '/play/trivia',
      },
      { id: 'badges-load', label: 'Badges display in dashboard', route: '/dashboard' },
      { id: 'leaderboard', label: 'Leaderboard shows real data', route: '/community/leaderboard' },
      { id: 'weekly-challenge', label: 'Weekly challenge card shows on Home', route: '/' },
      { id: 'seasonal-banner', label: 'Seasonal banner shows (if season active)', route: '/' },
      {
        id: 'points-popup',
        label: 'Points popup fires on correct trivia answer',
        route: '/play/trivia',
      },
    ],
  },
  {
    category: '🙏 Community & Moderation',
    items: [
      {
        id: 'prayer-wall',
        label: 'Prayer Wall loads and shows prayers',
        route: '/community/prayer',
      },
      { id: 'prayer-submit', label: 'Prayer submission works', route: '/community/prayer' },
      { id: 'chat-rooms', label: 'Chat rooms load', route: '/community/chat' },
      { id: 'moderation', label: 'Moderation queue accessible at /parents/', route: '/parents' },
      { id: 'prayer-rate-limit', label: 'Prayer submission rate limited (20/min)', route: null },
    ],
  },
  {
    category: '🧪 A/B Tests',
    items: [
      {
        id: 'ab-hero-cta',
        label: 'Hero CTA shows variant (check cookie bfl_ab_hero_cta)',
        route: '/',
      },
      { id: 'ab-pro-msg', label: 'Pro button shows variant label', route: '/' },
      {
        id: 'ab-admin',
        label: 'A/B admin dashboard loads at /admin/ab-tests',
        route: '/admin/ab-tests',
      },
      { id: 'ab-kids-safe', label: 'Kids Mode always shows control variant', route: '/' },
    ],
  },
  {
    category: '🎄 Seasonal & Marketing',
    items: [
      {
        id: 'seasonal-ai',
        label: '/seasonal page loads and generates content',
        route: '/seasonal',
      },
      { id: 'seasonal-banner-test', label: 'SeasonalBanner renders for active season', route: '/' },
      {
        id: 'seasonal-hook',
        label: 'Seasonal marketing hook shows on Home (if season active)',
        route: '/',
      },
      { id: 'invite-family', label: 'Invite Family section shows on Home', route: '/' },
      { id: 'referral-link', label: 'Referral link generates for logged-in users', route: '/' },
      { id: 'newsletter-signup', label: 'Newsletter signup form submits successfully', route: '/' },
      {
        id: 'story-form',
        label: 'Share Your Story form submits (check Turso testimonials table)',
        route: '/',
      },
    ],
  },
  {
    category: '🔍 SEO & Performance',
    items: [
      { id: 'meta-home', label: 'Home page has correct title + long-tail keywords', route: '/' },
      { id: 'meta-play', label: '/play has correct meta tags', route: '/play' },
      { id: 'og-image', label: 'OG image loads at /og-image.png', route: null },
      { id: 'robots', label: 'robots.txt accessible at /robots.txt', route: null },
      { id: 'sitemap', label: 'sitemap.xml accessible at /sitemap.xml', route: null },
      {
        id: 'lighthouse',
        label:
          'Lighthouse score > 80 on mobile (run: npx lighthouse https://biblefunland.com --view)',
        route: null,
      },
      {
        id: 'bundle-size',
        label: 'Bundle analysis run (npm run analyze) — no chunk > 600kb',
        route: null,
      },
      { id: 'lazy-load', label: 'Heavy game pages lazy-load (check Network tab)', route: '/play' },
    ],
  },
  {
    category: '🔒 Security & Safety',
    items: [
      { id: 'clerk-protected', label: '/parents routes require Clerk auth', route: '/parents' },
      { id: 'admin-protected', label: '/admin routes require AdminRoute', route: '/admin' },
      {
        id: 'rate-limits',
        label: 'AI rate limit: 30/hr per IP (test with rapid requests)',
        route: null,
      },
      {
        id: 'helmet-headers',
        label: 'Security headers present (X-Frame-Options, HSTS, etc.)',
        route: null,
      },
      {
        id: 'prayer-moderation',
        label: 'Banned words blocked in prayer submission',
        route: '/community/prayer',
      },
      { id: 'gdpr-footer', label: 'GDPR/COPPA note visible in footer', route: '/' },
      {
        id: 'error-monitoring',
        label: 'Error monitoring initialized (check console for [ErrorMonitoring])',
        route: null,
      },
    ],
  },
  {
    category: '🚀 Deployment',
    items: [
      {
        id: 'env-vars',
        label:
          'All env vars set in Vercel dashboard (VITE_CLERK_*, TURSO_*, ANTHROPIC_*, STRIPE_*)',
        route: null,
      },
      { id: 'backend-deploy', label: 'Backend server deployed and healthy (GET /)', route: null },
      { id: 'bible-api', label: 'Bible API key working in production', route: '/explore/bible' },
      { id: 'clerk-prod', label: 'Clerk production keys configured (not dev keys)', route: null },
      { id: 'stripe-prod', label: 'Stripe live keys configured', route: null },
      { id: 'turso-prod', label: 'Turso production DB connected', route: null },
      {
        id: 'vercel-headers',
        label: 'Vercel security headers active (check Response Headers)',
        route: null,
      },
      { id: 'sentry-dsn', label: 'VITE_SENTRY_DSN set (optional but recommended)', route: null },
      { id: 'concurrently', label: 'npm run dev:all starts both frontend + backend', route: null },
    ],
  },
];

export default function LaunchChecklist() {
  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('launch_checklist') || '{}');
    } catch {
      return {};
    }
  });

  function toggle(id) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem('launch_checklist', JSON.stringify(next));
  }

  const total = CHECKLIST.flatMap((c) => c.items).length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
          padding: '52px 32px 40px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.8rem,4vw,3rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 8,
          }}
        >
          🚀 Launch Checklist
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', marginBottom: 20 }}>
          Internal pre-launch verification — {done}/{total} complete
        </p>
        <div
          style={{
            maxWidth: 400,
            margin: '0 auto',
            height: 10,
            borderRadius: 99,
            background: 'rgba(255,255,255,.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 99,
              background: pct === 100 ? '#10B981' : '#3B82F6',
              width: `${pct}%`,
              transition: 'width .4s ease',
            }}
          />
        </div>
        <div
          style={{
            color: pct === 100 ? '#34D399' : 'rgba(255,255,255,.5)',
            fontSize: '.82rem',
            marginTop: 8,
            fontWeight: 700,
          }}
        >
          {pct === 100 ? '✅ Ready to launch!' : `${pct}% complete`}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>
        {CHECKLIST.map((section) => (
          <div key={section.category} style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 14,
                paddingBottom: 8,
                borderBottom: '1.5px solid var(--border)',
              }}
            >
              {section.category}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: checked[item.id] ? 'var(--green-bg)' : 'var(--surface)',
                    border: `1.5px solid ${checked[item.id] ? 'var(--green)' : 'var(--border)'}`,
                    transition: 'all .2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!checked[item.id]}
                    onChange={() => toggle(item.id)}
                    style={{
                      width: 18,
                      height: 18,
                      cursor: 'pointer',
                      accentColor: 'var(--green)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: '.85rem',
                      color: checked[item.id] ? 'var(--green)' : 'var(--ink)',
                      fontWeight: checked[item.id] ? 700 : 500,
                      textDecoration: checked[item.id] ? 'line-through' : 'none',
                    }}
                  >
                    {item.label}
                  </span>
                  {item.route && (
                    <Link
                      to={item.route}
                      target="_blank"
                      style={{
                        fontSize: '.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 8,
                        background: 'var(--blue-bg)',
                        color: 'var(--blue)',
                        textDecoration: 'none',
                        flexShrink: 0,
                      }}
                    >
                      Test →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Deployment instructions */}
        <div
          style={{
            background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
            borderRadius: 20,
            padding: '28px 24px',
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'white',
              marginBottom: 16,
            }}
          >
            🚀 Deploy to Vercel
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'git add . && git commit -m "Production ready — launch checklist complete"',
              'git push origin main',
              'vercel --prod (or push triggers auto-deploy)',
              'Verify all env vars in Vercel dashboard',
              'Run Lighthouse audit on production URL',
              'Test Stripe webhook in production mode',
            ].map((cmd, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span
                  style={{ fontSize: '.72rem', fontWeight: 800, color: '#3B82F6', minWidth: 20 }}
                >
                  {i + 1}.
                </span>
                <code
                  style={{
                    fontSize: '.78rem',
                    color: 'rgba(255,255,255,.7)',
                    background: 'rgba(255,255,255,.06)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    flex: 1,
                  }}
                >
                  {cmd}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
