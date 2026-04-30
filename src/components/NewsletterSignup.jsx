import { useState } from 'react';
import { Analytics } from '../lib/analytics';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export default function NewsletterSignup({ compact = false }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus('success');
      setMsg("You're in! Check your inbox — your free printables link is on the way. 🎉");
      setEmail('');
      Analytics.featureUsed('newsletter_signup');
    } catch (err) {
      setStatus('error');
      setMsg(err.message || 'Something went wrong. Please try again.');
    }
  }

  if (compact) {
    return (
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Your email address"
          required
          style={{
            flex: 1,
            minWidth: 200,
            padding: '10px 14px',
            borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontSize: '.85rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            background: 'var(--blue)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '.85rem',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'loading' ? '...' : '📧 Subscribe'}
        </button>
        {status === 'success' && (
          <div
            style={{ width: '100%', fontSize: '.78rem', color: 'var(--green)', fontWeight: 600 }}
          >
            ✅ {msg}
          </div>
        )}
        {status === 'error' && (
          <div style={{ width: '100%', fontSize: '.78rem', color: 'var(--red)', fontWeight: 600 }}>
            ⚠️ {msg}
          </div>
        )}
      </form>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg,#1E1B4B,#0F172A)',
        borderRadius: 24,
        padding: '40px 36px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -30, right: -30, fontSize: '8rem', opacity: 0.04 }}>
        📧
      </div>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📬</div>
      <h2
        style={{
          fontFamily: "'Baloo 2',cursive",
          fontSize: 'clamp(1.4rem,3vw,2rem)',
          fontWeight: 800,
          color: 'white',
          marginBottom: 8,
        }}
      >
        Free Weekly Printables + New Game Alerts
      </h2>
      <p
        style={{
          color: 'rgba(255,255,255,.55)',
          fontSize: '.9rem',
          maxWidth: 460,
          margin: '0 auto 24px',
          lineHeight: 1.7,
        }}
      >
        Get a free Bible activity sheet link in your inbox right now, plus alerts when new
        games, AI tools, and seasonal content drop.
      </p>
      {status === 'success' ? (
        <div
          style={{
            background: 'rgba(16,185,129,.15)',
            border: '1.5px solid rgba(16,185,129,.3)',
            borderRadius: 14,
            padding: '16px 24px',
            color: '#34D399',
            fontWeight: 700,
            fontSize: '.9rem',
          }}
        >
          ✅ {msg}
        </div>
      ) : (
        <form
          onSubmit={submit}
          style={{ display: 'flex', gap: 10, maxWidth: 480, margin: '0 auto', flexWrap: 'wrap' }}
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email address"
            required
            style={{
              flex: 1,
              minWidth: 220,
              padding: '13px 16px',
              borderRadius: 12,
              border: '1.5px solid rgba(255,255,255,.15)',
              background: 'rgba(255,255,255,.08)',
              color: 'white',
              fontSize: '.9rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              padding: '13px 24px',
              borderRadius: 12,
              background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '.9rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(59,130,246,.4)',
              whiteSpace: 'nowrap',
            }}
          >
            {status === 'loading' ? '...' : '📧 Get Free Printables'}
          </button>
          {status === 'error' && (
            <div style={{ width: '100%', fontSize: '.78rem', color: '#FCA5A5', fontWeight: 600 }}>
              ⚠️ {msg}
            </div>
          )}
        </form>
      )}
      <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '.72rem', marginTop: 14 }}>
        No spam. Unsubscribe anytime. Faith-centered content only.
      </p>
    </div>
  );
}
