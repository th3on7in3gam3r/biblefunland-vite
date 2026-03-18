const SITE_NAME  = 'BibleFunLand'
const SITE_URL   = 'https://biblefunland.com'
const SITE_EMAIL = 'legal@biblefunland.com'
const LAST_UPDATED = 'March 16, 2026'

export default function TermsOfService() {
  const s = {
    page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' },
    hero: { background: 'linear-gradient(135deg,var(--green-bg),var(--teal-bg))', padding: '52px 36px 40px', borderBottom: '1px solid var(--border)' },
    wrap: { maxWidth: 820, margin: '0 auto', padding: '52px 36px' },
    h1: { fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 },
    meta: { fontSize: '.84rem', color: 'var(--ink3)', fontWeight: 500 },
    h2: { fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink)', margin: '32px 0 12px', paddingBottom: 8, borderBottom: '2px solid var(--border)' },
    p: { fontSize: '.9rem', color: 'var(--ink2)', lineHeight: 1.85, fontWeight: 500, marginBottom: 14 },
    li: { fontSize: '.88rem', color: 'var(--ink2)', lineHeight: 1.8, fontWeight: 500, marginBottom: 6, paddingLeft: 8 },
    ul: { paddingLeft: 24, marginBottom: 14 },
    link: { color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' },
  }

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, background: 'var(--green-bg)', color: 'var(--green)', padding: '3px 12px', borderRadius: 100, display: 'inline-block', marginBottom: 12, border: '1px solid rgba(16,185,129,.2)' }}>📋 Legal</div>
          <h1 style={s.h1}>Terms of Service</h1>
          <p style={s.meta}>{SITE_NAME} · {SITE_URL} · Last updated: {LAST_UPDATED}</p>
        </div>
      </div>
      <div style={s.wrap}>
        <p style={s.p}>By accessing or using {SITE_NAME} ("the Service"), you agree to be bound by these Terms of Service. If you disagree, please do not use our Service.</p>

        <h2 style={s.h2}>1. Acceptance of Terms</h2>
        <p style={s.p}>{SITE_NAME} is a faith-based platform providing Bible games, AI-powered devotionals, scripture resources, and community features. By using our Service, you confirm you are at least 13 years old, or have parental consent to use the Service.</p>

        <h2 style={s.h2}>2. Use of the Service</h2>
        <p style={s.p}>You agree to use {SITE_NAME} only for lawful purposes and in ways that align with our Christian values. You may <strong>not</strong>:</p>
        <ul style={s.ul}>
          <li style={s.li}>Post content that is hateful, abusive, harassing, or offensive</li>
          <li style={s.li}>Spam the Prayer Wall, Chat Rooms, or any community feature</li>
          <li style={s.li}>Impersonate another person or entity</li>
          <li style={s.li}>Attempt to hack, reverse-engineer, or disrupt the Service</li>
          <li style={s.li}>Use automated bots or scrapers on the Service</li>
          <li style={s.li}>Post content that violates copyright or intellectual property rights</li>
          <li style={s.li}>Attempt to circumvent AdSense ad filtering or click ads fraudulently</li>
        </ul>

        <h2 style={s.h2}>3. User-Generated Content</h2>
        <p style={s.p}>By submitting content to {SITE_NAME} (prayer requests, sermon notes, chat messages), you grant us a non-exclusive, royalty-free license to display that content on our platform. You retain ownership of your content. We reserve the right to remove content that violates these terms.</p>
        <p style={s.p}>Prayer Wall posts are public by default. Please do not share sensitive personal information in public posts.</p>

        <h2 style={s.h2}>4. Pro Subscription & Payments</h2>
        <p style={s.p}>Pro and Family subscriptions are billed through Stripe. By subscribing, you authorize recurring charges. You may cancel at any time — cancellation takes effect at the end of the current billing period. We do not offer refunds for partial periods except where required by law.</p>
        <p style={s.p}>Pro subscribers enjoy an ad-free experience on {SITE_NAME}'s platform. This applies to ads served directly by {SITE_NAME} and does not affect any ads served by third-party embedded content (e.g., YouTube videos).</p>

        <h2 style={s.h2}>5. Advertising</h2>
        <p style={s.p}>{SITE_NAME} displays advertisements via Google AdSense to support free access to our platform. You agree not to click on ads for any reason other than genuine interest. Fraudulent clicking is a violation of these Terms and Google AdSense policies.</p>

        <h2 style={s.h2}>6. Intellectual Property</h2>
        <p style={s.p}>All original content on {SITE_NAME} — including our games, artwork, devotionals, and site design — is owned by {SITE_NAME} and protected by copyright. Bible scripture quotes are in the public domain unless otherwise noted. AI-generated devotional content is generated at your request and may be used for personal, non-commercial purposes.</p>

        <h2 style={s.h2}>7. Disclaimer of Warranties</h2>
        <p style={s.p}>The Service is provided "as is" without warranty of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that any particular result will be obtained. AI-generated content (devotionals, character chat) is for inspirational purposes only and should not be treated as theological authority.</p>

        <h2 style={s.h2}>8. Limitation of Liability</h2>
        <p style={s.p}>{SITE_NAME} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, even if we have been advised of the possibility of such damages.</p>

        <h2 style={s.h2}>9. Termination</h2>
        <p style={s.p}>We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or disrupt the community. You may delete your account at any time by contacting <a href={`mailto:${SITE_EMAIL}`} style={s.link}>{SITE_EMAIL}</a>.</p>

        <h2 style={s.h2}>10. Governing Law</h2>
        <p style={s.p}>These Terms are governed by and construed in accordance with the laws of the United States. Any disputes shall be resolved through binding arbitration in accordance with the American Arbitration Association rules.</p>

        <h2 style={s.h2}>11. Changes to Terms</h2>
        <p style={s.p}>We may update these Terms at any time. We will notify you of material changes via email or a prominent notice on the site. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>

        <h2 style={s.h2}>12. Contact</h2>
        <p style={s.p}>Questions about these Terms? Contact us at <a href={`mailto:${SITE_EMAIL}`} style={s.link}>{SITE_EMAIL}</a>.</p>
      </div>
    </div>
  )
}
