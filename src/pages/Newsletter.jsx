import { useState } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

const PERKS = [
  {
    icon: '🖨️',
    title: 'Free Weekly Printable',
    desc: 'Bible activity sheets, word searches & coloring pages every week',
  },
  {
    icon: '🎮',
    title: 'New Game Alerts',
    desc: 'Be first to know when new games and AI tools drop',
  },
  {
    icon: '🎄',
    title: 'Seasonal Content',
    desc: 'Easter, Christmas & Back-to-School special resources',
  },
  {
    icon: '🙏',
    title: 'Faith Encouragement',
    desc: 'Weekly scripture, devotional prompts & family challenges',
  },
];

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus('success');
      setMsg("You're in! Check your inbox for your first free printable. 🎉");
      setEmail('');
      setName('');
    } catch (err) {
      setStatus('error');
      setMsg(err.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg,#1E1B4B,#0F172A,#064E3B)',
          padding: '72px 24px 60px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {[
          ['#60A5FA', '10%', '5%'],
          ['#34D399', '85%', '15%'],
          ['#F472B6', '5%', '75%'],
          ['#FCD34D', '80%', '72%'],
        ].map(([c, l, t], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 200 + i * 60,
              height: 200 + i * 60,
              borderRadius: '50%',
              background: `radial-gradient(circle,${c}18 0%,transparent 70%)`,
              left: l,
              top: t,
              pointerEvents: 'none',
            }}
          />
        ))}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📬</div>
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(2rem,5vw,3.2rem)',
              fontWeight: 800,
              color: 'white',
              marginBottom: 12,
              lineHeight: 1.1,
            }}
          >
            Free Weekly Printables
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg,#60A5FA,#34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              + New Game Alerts
            </span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(.9rem,2vw,1.05rem)',
              color: 'rgba(255,255,255,.6)',
              lineHeight: 1.75,
              marginBottom: 8,
            }}
          >
            Join 10,000+ families. Get a free Bible activity sheet every week, plus alerts when new
            games and AI tools drop.
          </p>
          <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.3)', fontWeight: 500 }}>
            No spam. Unsubscribe anytime. Faith-centered content only.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}
          className="newsletter-grid"
        >
          {/* Signup form */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1.5px solid var(--border)',
              padding: '32px 28px',
              boxShadow: '0 8px 32px rgba(0,0,0,.08)',
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              Subscribe — It's Free
            </div>
            <p
              style={{
                fontSize: '.82rem',
                color: 'var(--ink3)',
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Your first free printable arrives in your inbox right away.
            </p>

            {status === 'success' ? (
              <div
                style={{
                  background: 'var(--green-bg)',
                  border: '1.5px solid var(--green)',
                  borderRadius: 14,
                  padding: '20px 22px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--green)',
                    marginBottom: 6,
                  }}
                >
                  You're subscribed!
                </div>
                <p style={{ fontSize: '.82rem', color: 'var(--ink2)', lineHeight: 1.6 }}>{msg}</p>
                <Link
                  to="/"
                  style={{
                    display: 'inline-block',
                    marginTop: 14,
                    padding: '9px 20px',
                    borderRadius: 10,
                    background: 'var(--green)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '.82rem',
                    textDecoration: 'none',
                  }}
                >
                  Back to Home →
                </Link>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '.75rem',
                      fontWeight: 700,
                      color: 'var(--ink3)',
                      marginBottom: 5,
                      textTransform: 'uppercase',
                      letterSpacing: '.5px',
                    }}
                  >
                    Your Name (optional)
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah"
                    className="input-field"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '.75rem',
                      fontWeight: 700,
                      color: 'var(--ink3)',
                      marginBottom: 5,
                      textTransform: 'uppercase',
                      letterSpacing: '.5px',
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="input-field"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                {status === 'error' && (
                  <div
                    style={{
                      background: 'var(--red-bg)',
                      color: 'var(--red)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      fontSize: '.78rem',
                      fontWeight: 600,
                      marginBottom: 14,
                    }}
                  >
                    ⚠️ {msg}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    width: '100%',
                    padding: '13px 0',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(59,130,246,.35)',
                    transition: 'all .2s',
                  }}
                >
                  {status === 'loading' ? '...' : '📧 Get Free Printables'}
                </button>
                <p
                  style={{
                    fontSize: '.68rem',
                    color: 'var(--ink3)',
                    textAlign: 'center',
                    marginTop: 10,
                  }}
                >
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>

          {/* Perks */}
          <div>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 20,
              }}
            >
              What you'll get every week:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PERKS.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    background: 'var(--surface)',
                    borderRadius: 16,
                    padding: '16px 18px',
                    border: '1.5px solid var(--border)',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--blue)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{p.icon}</div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Baloo 2',cursive",
                        fontSize: '.95rem',
                        fontWeight: 800,
                        color: 'var(--ink)',
                        marginBottom: 3,
                      }}
                    >
                      {p.title}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--ink3)', lineHeight: 1.5 }}>
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:640px){.newsletter-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
