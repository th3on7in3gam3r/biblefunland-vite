import { useState } from 'react';
import { Link } from 'react-router-dom';

const TOPICS = [
  { icon: '💡', label: 'Feature Request' },
  { icon: '🐛', label: 'Report a Bug' },
  { icon: '💎', label: 'Pro Subscription Help' },
  { icon: '🙏', label: 'Ministry / Partnership' },
  { icon: '📄', label: 'Privacy / Data Request' },
  { icon: '⛪', label: 'Church Licensing' },
  { icon: '📰', label: 'Press / Media' },
  { icon: '👋', label: 'General Hello' },
];

const CONTACT_CARDS = [
  {
    icon: '✉️',
    label: 'General Inquiries',
    email: 'hello@biblefunland.com',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,.1)',
    border: 'rgba(59,130,246,.2)',
  },
  {
    icon: '💎',
    label: 'Pro Support',
    email: 'support@biblefunland.com',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,.1)',
    border: 'rgba(139,92,246,.2)',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    label: 'Family Priority Support',
    email: 'family@biblefunland.com',
    color: '#F97316',
    bg: 'rgba(249,115,22,.1)',
    border: 'rgba(249,115,22,.2)',
  },
  {
    icon: '⛪',
    label: 'Partnerships',
    email: 'ministry@biblefunland.com',
    color: '#10B981',
    bg: 'rgba(16,185,129,.1)',
    border: 'rgba(16,185,129,.2)',
  },
  {
    icon: '📄',
    label: 'Privacy Requests',
    email: 'privacy@biblefunland.com',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,.1)',
    border: 'rgba(245,158,11,.2)',
  },
];

const RESPONSE_TIMES = [
  { label: 'General inquiries', time: '1–2 business days' },
  { label: 'Pro support', time: 'Within 24 hours' },
  { label: 'Family priority support', time: 'Within 12 hours' },
  { label: 'Bug reports', time: 'Within 48 hours' },
  { label: 'Privacy requests', time: 'Within 30 days' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0].label, message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function change(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          background: 'linear-gradient(160deg,#0F0F1A 0%,#1E1B4B 50%,#0D1F14 100%)',
          padding: '72px 24px 56px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Mesh blobs */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(99,102,241,.12) 0%,transparent 70%)',
            top: '-20%',
            left: '-10%',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)',
            bottom: '-10%',
            right: '-5%',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontSize: '.7rem',
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              background: 'rgba(59,130,246,.15)',
              color: '#93C5FD',
              border: '1px solid rgba(59,130,246,.2)',
              padding: '5px 14px',
              borderRadius: 100,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#4ADE80',
                boxShadow: '0 0 8px #4ADE80',
                display: 'inline-block',
              }}
            />
            We're here to help
          </div>
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(2rem,5vw,3.6rem)',
              fontWeight: 800,
              color: 'white',
              marginBottom: 14,
              lineHeight: 1.1,
            }}
          >
            Get in{' '}
            <span
              style={{
                background: 'linear-gradient(90deg,#60A5FA,#C084FC,#34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Touch
            </span>
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,.5)',
              fontSize: '.95rem',
              fontWeight: 500,
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            Questions, feedback, partnerships, or just want to say hi — we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Contact cards row ────────────────────────────── */}
      <section style={{ padding: '48px 24px 0', maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}
          className="contact-cards-grid"
        >
          {CONTACT_CARDS.map((c, i) => (
            <a
              key={i}
              href={`mailto:${c.email}`}
              style={{
                textDecoration: 'none',
                display: 'block',
                borderRadius: 18,
                border: `1.5px solid ${c.border}`,
                background: c.bg,
                padding: '20px 18px',
                transition: 'all .25s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 12px 32px ${c.bg}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{c.icon}</div>
              <div
                style={{
                  fontSize: '.72rem',
                  fontWeight: 800,
                  color: c.color,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 4,
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  fontSize: '.76rem',
                  color: 'var(--ink3)',
                  fontWeight: 500,
                  wordBreak: 'break-all',
                }}
              >
                {c.email}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Main content: form + sidebar ─────────────────── */}
      <section
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '40px 24px 80px',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 24,
          alignItems: 'start',
        }}
        className="contact-main-grid"
      >
        {/* Form card */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--sh)',
            padding: '36px 32px',
          }}
        >
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div
                style={{
                  fontSize: '4.5rem',
                  marginBottom: 18,
                  filter: 'drop-shadow(0 0 20px rgba(16,185,129,.4))',
                }}
              >
                🙏
              </div>
              <h2
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 10,
                }}
              >
                Message Sent!
              </h2>
              <p
                style={{
                  fontSize: '.9rem',
                  color: 'var(--ink2)',
                  fontWeight: 500,
                  lineHeight: 1.75,
                  marginBottom: 28,
                }}
              >
                Thanks for reaching out, <strong>{form.name}</strong>!<br />
                We'll reply to <strong>{form.email}</strong> within 1–2 business days.
              </p>
              <button className="btn btn-outline" onClick={() => setSent(false)}>
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 6,
                }}
              >
                Send Us a Message
              </h2>
              <p
                style={{
                  fontSize: '.84rem',
                  color: 'var(--ink3)',
                  marginBottom: 28,
                  fontWeight: 500,
                }}
              >
                Fill out the form and we'll get back to you shortly.
              </p>

              <form onSubmit={submit}>
                {/* Name + Email row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 14,
                    marginBottom: 16,
                  }}
                  className="contact-name-row"
                >
                  <div>
                    <label
                      style={{
                        fontSize: '.72rem',
                        fontWeight: 700,
                        color: 'var(--ink3)',
                        letterSpacing: '.5px',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: 7,
                      }}
                    >
                      Your Name *
                    </label>
                    <input
                      className="input-field"
                      placeholder="John Smith"
                      value={form.name}
                      onChange={(e) => change('name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '.72rem',
                        fontWeight: 700,
                        color: 'var(--ink3)',
                        letterSpacing: '.5px',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: 7,
                      }}
                    >
                      Email Address *
                    </label>
                    <input
                      className="input-field"
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) => change('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Topic */}
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      fontSize: '.72rem',
                      fontWeight: 700,
                      color: 'var(--ink3)',
                      letterSpacing: '.5px',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: 7,
                    }}
                  >
                    Topic
                  </label>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}
                    className="contact-topics-grid"
                  >
                    {TOPICS.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => change('topic', t.label)}
                        style={{
                          padding: '9px 6px',
                          borderRadius: 12,
                          border: `1.5px solid ${form.topic === t.label ? 'var(--blue)' : 'var(--border)'}`,
                          background: form.topic === t.label ? 'var(--blue-bg)' : 'var(--bg2)',
                          color: form.topic === t.label ? 'var(--blue)' : 'var(--ink3)',
                          fontSize: '.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all .2s',
                          textAlign: 'center',
                          lineHeight: 1.4,
                        }}
                      >
                        <div style={{ fontSize: '1rem', marginBottom: 3 }}>{t.icon}</div>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{
                      fontSize: '.72rem',
                      fontWeight: 700,
                      color: 'var(--ink3)',
                      letterSpacing: '.5px',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: 7,
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    className="textarea-field"
                    rows={5}
                    placeholder="Tell us what's on your mind..."
                    value={form.message}
                    onChange={(e) => change('message', e.target.value)}
                    required
                  />
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    className="btn btn-blue"
                    disabled={loading}
                    style={{ minWidth: 160, justifyContent: 'center' }}
                  >
                    {loading ? (
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: '2.5px solid rgba(255,255,255,.35)',
                          borderTopColor: 'white',
                          animation: 'spin .7s linear infinite',
                          display: 'inline-block',
                        }}
                      />
                    ) : (
                      '📬 Send Message'
                    )}
                  </button>
                  <p style={{ fontSize: '.76rem', color: 'var(--ink3)', fontWeight: 500 }}>
                    We respect your privacy.{' '}
                    <Link to="/privacy" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Response times */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1.5px solid var(--border)',
              padding: '24px 22px',
              boxShadow: 'var(--sh)',
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 16,
              }}
            >
              ⏱️ Response Times
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RESPONSE_TIMES.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: '.8rem', color: 'var(--ink3)', fontWeight: 500 }}>
                    {r.label}
                  </span>
                  <span
                    style={{
                      fontSize: '.76rem',
                      fontWeight: 700,
                      color: 'var(--green)',
                      background: 'var(--green-bg)',
                      padding: '2px 9px',
                      borderRadius: 100,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ quick links */}
          <div
            style={{
              background: 'linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.05))',
              borderRadius: 20,
              border: '1.5px solid rgba(99,102,241,.15)',
              padding: '24px 22px',
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 14,
              }}
            >
              🔗 Quick Links
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/premium', label: '💎 View Pro Plans' },
                { to: '/privacy', label: '🔒 Privacy Policy' },
                { to: '/terms', label: '📄 Terms of Use' },
                { to: '/blog', label: '✍️ Read Our Blog' },
              ].map((l, i) => (
                <Link
                  key={i}
                  to={l.to}
                  style={{
                    fontSize: '.82rem',
                    fontWeight: 600,
                    color: 'var(--ink2)',
                    textDecoration: 'none',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    transition: 'all .2s',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--blue)';
                    e.currentTarget.style.borderColor = 'var(--blue)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--ink2)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Scripture */}
          <div
            style={{
              background: 'linear-gradient(135deg,#0D1B2A,#1E1B4B)',
              borderRadius: 20,
              border: '1.5px solid rgba(99,102,241,.15)',
              padding: '24px 22px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>📖</div>
            <p
              style={{
                fontFamily: 'Georgia,serif',
                fontSize: '.88rem',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,.7)',
                lineHeight: 1.7,
                marginBottom: 8,
              }}
            >
              "Ask and it will be given to you; seek and you will find."
            </p>
            <div
              style={{
                fontSize: '.7rem',
                fontWeight: 700,
                color: 'rgba(165,180,252,.6)',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Matthew 7:7
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 760px) {
          .contact-main-grid  { grid-template-columns: 1fr !important; }
          .contact-cards-grid { grid-template-columns: repeat(2,1fr) !important; }
          .contact-name-row   { grid-template-columns: 1fr !important; }
          .contact-topics-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 420px) {
          .contact-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
