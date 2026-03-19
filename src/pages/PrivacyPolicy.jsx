// src/pages/PrivacyPolicy.jsx
// ─────────────────────────────────────────────────────────
// REQUIRED by Google AdSense — must exist at /privacy
// Update: SITE_EMAIL, SITE_URL, OWNER_NAME before submitting
// ─────────────────────────────────────────────────────────

const SITE_NAME  = 'BibleFunLand'
const SITE_URL   = 'https://biblefunland.com'
const SITE_EMAIL = 'privacy@biblefunland.com'   // ← change this
const OWNER_NAME = 'BibleFunLand'               // ← change this
const LAST_UPDATED = 'March 16, 2026'

export default function PrivacyPolicy() {
  const s = {
    page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' },
    hero: { background: 'linear-gradient(135deg,var(--blue-bg),var(--violet-bg))', padding: '52px 36px 40px', borderBottom: '1px solid var(--border)' },
    wrap: { maxWidth: 820, margin: '0 auto', padding: '52px 36px' },
    h1: { fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 },
    meta: { fontSize: '.84rem', color: 'var(--ink3)', fontWeight: 500 },
    section: { marginBottom: 40 },
    h2: { fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink)', margin: '32px 0 12px', paddingBottom: 8, borderBottom: '2px solid var(--border)' },
    p: { fontSize: '.9rem', color: 'var(--ink2)', lineHeight: 1.85, fontWeight: 500, marginBottom: 14 },
    li: { fontSize: '.88rem', color: 'var(--ink2)', lineHeight: 1.8, fontWeight: 500, marginBottom: 6, paddingLeft: 8 },
    ul: { paddingLeft: 24, marginBottom: 14 },
    link: { color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' },
    box: { background: 'var(--blue-bg)', border: '1.5px solid rgba(59,130,246,.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 },
    toc: { background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 36 },
    tocItem: { fontSize: '.84rem', color: 'var(--blue)', fontWeight: 600, display: 'block', padding: '3px 0', textDecoration: 'none', cursor: 'pointer' },
  }

  const sections = [
    'Information We Collect',
    'How We Use Your Information',
    'Google AdSense & Advertising',
    'Cookies',
    'Third-Party Services',
    'Children\'s Privacy (COPPA)',
    'GDPR Rights (European Users)',
    'CCPA Rights (California Users)',
    'Data Retention',
    'Security',
    'Changes to This Policy',
    'Contact Us',
  ]

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, background: 'var(--blue-bg)', color: 'var(--blue)', padding: '3px 12px', borderRadius: 100, display: 'inline-block', marginBottom: 12, border: '1px solid rgba(59,130,246,.2)' }}>
            📄 Legal
          </div>
          <h1 style={s.h1}>Privacy Policy</h1>
          <p style={s.meta}>{SITE_NAME} · {SITE_URL} · Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div style={s.wrap}>
        {/* Summary box */}
        <div style={s.box}>
          <p style={{ ...s.p, marginBottom: 0, color: 'var(--blue)' }}>
            <strong>Summary:</strong> We collect minimal data to operate {SITE_NAME}. We use Google AdSense to display ads, which uses cookies. You can opt out of personalized ads at any time. We do not sell your personal data to third parties. We take children's privacy seriously and comply with COPPA.
          </p>
        </div>

        {/* Table of Contents */}
        <div style={s.toc}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Contents</div>
          {sections.map((sec, i) => (
            <a key={i} href={`#sec-${i}`} style={s.tocItem}>{i + 1}. {sec}</a>
          ))}
        </div>

        {/* 1 */}
        <div id="sec-0" style={s.section}>
          <h2 style={s.h2}>1. Information We Collect</h2>
          <p style={s.p}>We collect information you provide directly and information collected automatically when you use our site.</p>
          <p style={{ ...s.p, fontWeight: 700, color: 'var(--ink)' }}>Information you provide:</p>
          <ul style={s.ul}>
            <li style={s.li}><strong>Account information</strong> — email address and password when you create an account via Supabase Auth</li>
            <li style={s.li}><strong>Profile information</strong> — display name, chosen avatar, and optional bio</li>
            <li style={s.li}><strong>Prayer requests</strong> — text you submit to the Prayer Wall (may be public)</li>
            <li style={s.li}><strong>Sermon notes</strong> — private notes stored in your account</li>
            <li style={s.li}><strong>Email newsletter</strong> — email address if you subscribe</li>
            <li style={s.li}><strong>Contact form</strong> — name, email, and message</li>
          </ul>
          <p style={{ ...s.p, fontWeight: 700, color: 'var(--ink)' }}>Information collected automatically:</p>
          <ul style={s.ul}>
            <li style={s.li}><strong>Usage data</strong> — pages visited, features used, game scores (via Google Analytics)</li>
            <li style={s.li}><strong>Device information</strong> — browser type, operating system, screen size</li>
            <li style={s.li}><strong>IP address</strong> — used for geographic analytics (not stored with personal data)</li>
            <li style={s.li}><strong>Cookies</strong> — see Section 4 for full details</li>
            <li style={s.li}><strong>Reading streak and progress</strong> — stored locally in your browser (localStorage)</li>
          </ul>
        </div>

        {/* 2 */}
        <div id="sec-1" style={s.section}>
          <h2 style={s.h2}>2. How We Use Your Information</h2>
          <p style={s.p}>We use the information we collect to:</p>
          <ul style={s.ul}>
            <li style={s.li}>Provide, maintain, and improve {SITE_NAME}</li>
            <li style={s.li}>Authenticate your account and keep it secure</li>
            <li style={s.li}>Sync your reading streak, badges, and notes across devices</li>
            <li style={s.li}>Send you the daily verse notification (only with your permission)</li>
            <li style={s.li}>Send you our newsletter (only if you subscribed)</li>
            <li style={s.li}>Respond to your support requests</li>
            <li style={s.li}>Display relevant advertisements via Google AdSense</li>
            <li style={s.li}>Analyze site performance and usage to improve our service</li>
            <li style={s.li}>Comply with legal obligations</li>
          </ul>
          <p style={s.p}>We do <strong>not</strong> sell, rent, or trade your personal information to any third parties for their marketing purposes.</p>
        </div>

        {/* 3 */}
        <div id="sec-2" style={s.section}>
          <h2 style={s.h2}>3. Google AdSense & Advertising</h2>
          <p style={s.p}>
            {SITE_NAME} uses <strong>Google AdSense</strong> to display advertisements. Google AdSense uses cookies and similar technologies to serve ads based on your prior visits to our website and other websites on the internet.
          </p>
          <p style={s.p}>
            Google's use of advertising cookies enables it and its partners to serve ads based on your visit to {SITE_NAME} and/or other sites on the internet. You may opt out of personalized advertising by visiting{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" style={s.link}>Google Ads Settings</a>{' '}
            or by visiting{' '}
            <a href="https://www.aboutads.info" target="_blank" rel="noreferrer" style={s.link}>www.aboutads.info</a>.
          </p>
          <p style={s.p}>
            Pro subscribers who have paid for an ad-free experience will not see ads on {SITE_NAME}. Google AdSense may still set cookies in accordance with Google's own privacy policy.
          </p>
          <p style={s.p}>
            For more information about Google's data practices, see the{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={s.link}>Google Privacy Policy</a>.
          </p>
        </div>

        {/* 4 */}
        <div id="sec-3" style={s.section}>
          <h2 style={s.h2}>4. Cookies</h2>
          <p style={s.p}>We use the following types of cookies:</p>
          <ul style={s.ul}>
            <li style={s.li}><strong>Essential cookies</strong> — Required for the site to function (authentication, session management). Cannot be disabled.</li>
            <li style={s.li}><strong>Preference cookies</strong> — Remember your settings (dark mode, language, music preferences).</li>
            <li style={s.li}><strong>Analytics cookies</strong> — Google Analytics tracks page views and user behavior. You can opt out via our cookie banner.</li>
            <li style={s.li}><strong>Advertising cookies</strong> — Google AdSense uses cookies to serve relevant ads. You can opt out via our cookie banner or at <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" style={s.link}>Google Ads Settings</a>.</li>
          </ul>
          <p style={s.p}>
            You can control cookies through our cookie consent banner (shown on first visit) or through your browser settings. Note that disabling certain cookies may affect site functionality.
          </p>
        </div>

        {/* 5 */}
        <div id="sec-4" style={s.section}>
          <h2 style={s.h2}>5. Third-Party Services</h2>
          <p style={s.p}>We use the following third-party services which may collect data:</p>
          <ul style={s.ul}>
            <li style={s.li}><strong>Supabase</strong> — Database and authentication provider. <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" style={s.link}>Privacy Policy</a></li>
            <li style={s.li}><strong>Google Analytics</strong> — Website analytics. <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={s.link}>Privacy Policy</a></li>
            <li style={s.li}><strong>Google AdSense</strong> — Advertising platform. <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={s.link}>Privacy Policy</a></li>
            <li style={s.li}><strong>Stripe</strong> — Payment processing for Pro subscriptions. <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer" style={s.link}>Privacy Policy</a></li>
            <li style={s.li}><strong>Anthropic Claude API</strong> — Powers AI Devotional Generator and Bible Character Chat. Prompts are processed but not stored. <a href="https://www.anthropic.com/privacy" target="_blank" rel="noreferrer" style={s.link}>Privacy Policy</a></li>
            <li style={s.li}><strong>YouTube</strong> — Embedded video content. <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={s.link}>Privacy Policy</a></li>
          </ul>
        </div>

        {/* 6 */}
        <div id="sec-5" style={s.section}>
          <h2 style={s.h2}>6. Children's Privacy (COPPA)</h2>
          <div style={{ background: 'var(--orange-bg)', border: '1.5px solid rgba(249,115,22,.3)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
            <p style={{ ...s.p, marginBottom: 0, color: 'var(--orange)', fontWeight: 600 }}>
              ⚠️ {SITE_NAME} is designed for use by families and is intended for users of all ages including children under 13. We take COPPA compliance seriously.
            </p>
          </div>
          <p style={s.p}>
            In accordance with the Children's Online Privacy Protection Act (COPPA), we do not knowingly collect personally identifiable information from children under 13 without verifiable parental consent.
          </p>
          <p style={s.p}>
            Children under 13 may use {SITE_NAME} without creating an account. Games, devotionals, and most features are available without registration. Account creation requires a valid email address, and we encourage parents to supervise their children's use of our site.
          </p>
          <p style={s.p}>
            If we learn that we have inadvertently collected personal information from a child under 13, we will promptly delete that information. If you believe we have collected information from a child under 13, please contact us at <a href={`mailto:${SITE_EMAIL}`} style={s.link}>{SITE_EMAIL}</a>.
          </p>
          <p style={s.p}>
            <strong>Regarding advertising:</strong> Google AdSense serves non-personalized ads to users we identify as potentially under 13, or when we cannot verify consent status.
          </p>
        </div>

        {/* 7 */}
        <div id="sec-6" style={s.section}>
          <h2 style={s.h2}>7. GDPR Rights (European Users)</h2>
          <p style={s.p}>If you are located in the European Economic Area (EEA), you have the following rights under the General Data Protection Regulation (GDPR):</p>
          <ul style={s.ul}>
            <li style={s.li}><strong>Right to access</strong> — Request a copy of the personal data we hold about you</li>
            <li style={s.li}><strong>Right to rectification</strong> — Request correction of inaccurate personal data</li>
            <li style={s.li}><strong>Right to erasure</strong> — Request deletion of your personal data ("right to be forgotten")</li>
            <li style={s.li}><strong>Right to restriction</strong> — Request restriction of processing your personal data</li>
            <li style={s.li}><strong>Right to data portability</strong> — Request transfer of your data in a machine-readable format</li>
            <li style={s.li}><strong>Right to object</strong> — Object to processing based on legitimate interests or for direct marketing</li>
            <li style={s.li}><strong>Right to withdraw consent</strong> — Withdraw consent for cookie-based tracking at any time</li>
          </ul>
          <p style={s.p}>To exercise any of these rights, contact us at <a href={`mailto:${SITE_EMAIL}`} style={s.link}>{SITE_EMAIL}</a>. We will respond within 30 days.</p>
        </div>

        {/* 8 */}
        <div id="sec-7" style={s.section}>
          <h2 style={s.h2}>8. CCPA Rights (California Users)</h2>
          <p style={s.p}>If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):</p>
          <ul style={s.ul}>
            <li style={s.li}><strong>Right to know</strong> — Request disclosure of personal information we've collected about you</li>
            <li style={s.li}><strong>Right to delete</strong> — Request deletion of your personal information</li>
            <li style={s.li}><strong>Right to opt-out</strong> — We do not sell personal information. If this changes, you will have the right to opt-out.</li>
            <li style={s.li}><strong>Right to non-discrimination</strong> — We will not discriminate against you for exercising your CCPA rights</li>
          </ul>
        </div>

        {/* 9 */}
        <div id="sec-8" style={s.section}>
          <h2 style={s.h2}>9. Data Retention</h2>
          <p style={s.p}>We retain your data for as long as your account is active or as needed to provide services. Specifically:</p>
          <ul style={s.ul}>
            <li style={s.li}><strong>Account data</strong> — Retained until you delete your account</li>
            <li style={s.li}><strong>Prayer wall posts</strong> — Retained until you delete them or request removal</li>
            <li style={s.li}><strong>Sermon notes</strong> — Retained until you delete them</li>
            <li style={s.li}><strong>Analytics data</strong> — Retained for 26 months (Google Analytics default)</li>
            <li style={s.li}><strong>Local storage data</strong> — Stored in your browser until you clear it</li>
          </ul>
          <p style={s.p}>To delete your account and all associated data, email <a href={`mailto:${SITE_EMAIL}`} style={s.link}>{SITE_EMAIL}</a> with the subject "Delete My Account".</p>
        </div>

        {/* 10 */}
        <div id="sec-9" style={s.section}>
          <h2 style={s.h2}>10. Security</h2>
          <p style={s.p}>
            We take reasonable measures to protect your personal information, including SSL/TLS encryption, Supabase Row Level Security policies, and hashed password storage. However, no method of internet transmission is 100% secure, and we cannot guarantee absolute security.
          </p>
        </div>

        {/* 11 */}
        <div id="sec-10" style={s.section}>
          <h2 style={s.h2}>11. Changes to This Policy</h2>
          <p style={s.p}>
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page with an updated date and, where appropriate, by email notification. We encourage you to review this policy periodically.
          </p>
        </div>

        {/* 12 */}
        <div id="sec-11" style={s.section}>
          <h2 style={s.h2}>12. Contact Us</h2>
          <p style={s.p}>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
          <div style={{ background: 'var(--bg2)', borderRadius: 14, padding: '20px 24px', border: '1.5px solid var(--border)', fontSize: '.88rem', color: 'var(--ink2)', lineHeight: 2 }}>
            <strong style={{ color: 'var(--ink)' }}>{SITE_NAME}</strong><br />
            Email: <a href={`mailto:${SITE_EMAIL}`} style={s.link}>{SITE_EMAIL}</a><br />
            Website: <a href={SITE_URL} style={s.link}>{SITE_URL}</a>
          </div>
        </div>
      </div>
    </div>
  )
}
