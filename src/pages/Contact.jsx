import { useState } from 'react'

const CONTACT_EMAIL = 'hello@biblefunland.com'  // ← change this

const TOPICS = [
  '💡 Feature Request',
  '🐛 Report a Bug',
  '💎 Pro Subscription Help',
  '🙏 Ministry / Partnership',
  '📄 Privacy / Data Request',
  '⛪ Church Licensing',
  '📰 Press / Media',
  '👋 General Hello',
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0], message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  function change(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    // In production: send to a Supabase Edge Function or FormSpree
    // For now we simulate a send
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  const s = {
    page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' },
    hero: { background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', padding: '56px 36px 44px', textAlign: 'center' },
    h1: { fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,4.5vw,3.4rem)', fontWeight: 800, background: 'linear-gradient(90deg,#60A5FA,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 },
    sub: { color: 'rgba(255,255,255,.5)', fontSize: '.92rem', fontWeight: 500 },
    wrap: { maxWidth: 900, margin: '0 auto', padding: '52px 24px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 28, alignItems: 'start' },
    card: { background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', padding: 32 },
    label: { fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', display: 'block', marginBottom: 7 },
    link: { color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' },
  }

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={{ fontSize: '.7rem', fontWeight: 700, background: 'rgba(59,130,246,.15)', color: '#93C5FD', padding: '3px 12px', borderRadius: 100, display: 'inline-block', marginBottom: 12 }}>📬 Get in Touch</div>
        <h1 style={s.h1}>Contact BibleFunLand</h1>
        <p style={s.sub}>We'd love to hear from you. We typically respond within 1–2 business days.</p>
      </div>

      <div style={s.wrap}>
        {/* Info sidebar */}
        <div>
          <div style={{ ...s.card, marginBottom: 18 }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 18 }}>📬 Other Ways to Reach Us</div>
            {[
              { icon: '✉️', label: 'General Inquiries', val: 'hello@biblefunland.com' },
              { icon: '💎', label: 'Pro Support', val: 'support@biblefunland.com' },
              { icon: '📄', label: 'Privacy Requests', val: 'privacy@biblefunland.com' },
              { icon: '⛪', label: 'Partnerships', val: 'ministry@biblefunland.com' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ fontSize: '1.2rem', marginTop: 2 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>{item.label}</div>
                  <a href={`mailto:${item.val}`} style={{ ...s.link, fontSize: '.84rem' }}>{item.val}</a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...s.card, background: 'var(--blue-bg)', border: '1.5px solid rgba(59,130,246,.2)' }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'var(--blue)', marginBottom: 10 }}>⏱️ Response Times</div>
            <div style={{ fontSize: '.82rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.8 }}>
              General inquiries: <strong>1–2 business days</strong><br />
              Pro support: <strong>Within 24 hours</strong><br />
              Privacy requests: <strong>Within 30 days</strong><br />
              Bug reports: <strong>Within 48 hours</strong>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div style={s.card}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🙏</div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Message Sent!</div>
              <div style={{ fontSize: '.88rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.7, marginBottom: 24 }}>
                Thank you for reaching out, <strong>{form.name}</strong>!<br />
                We'll reply to <strong>{form.email}</strong> within 1–2 business days.
              </div>
              <button className="btn btn-outline" onClick={() => setSent(false)}>Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 22 }}>Send Us a Message</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={s.label}>Your Name *</label>
                  <input className="input-field" placeholder="John Smith" value={form.name} onChange={e => change('name', e.target.value)} required />
                </div>
                <div>
                  <label style={s.label}>Email Address *</label>
                  <input className="input-field" type="email" placeholder="you@email.com" value={form.email} onChange={e => change('email', e.target.value)} required />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Topic</label>
                <select className="input-field" value={form.topic} onChange={e => change('topic', e.target.value)}>
                  {TOPICS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={s.label}>Message *</label>
                <textarea
                  className="textarea-field"
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  value={form.message}
                  onChange={e => change('message', e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-blue" disabled={loading} style={{ minWidth: 160, justifyContent: 'center' }}>
                  {loading
                    ? <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: 'white', animation: 'spin .7s linear infinite' }} />
                    : '📬 Send Message'}
                </button>
                <p style={{ fontSize: '.76rem', color: 'var(--ink3)', fontWeight: 500 }}>
                  We respect your privacy. See our{' '}
                  <a href="/privacy" style={{ color: 'var(--blue)', fontWeight: 600 }}>Privacy Policy</a>.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
