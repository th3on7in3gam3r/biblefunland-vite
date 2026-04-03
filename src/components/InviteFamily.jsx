/**
 * InviteFamily — viral referral invite component
 * Generates a unique referral link, awards 50pts to referrer on signup.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
const BASE_URL = import.meta.env.VITE_APP_URL || 'https://biblefunland.com';

export default function InviteFamily({ compact = false }) {
  const { user } = useAuth();
  const [code, setCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    // Instant fallback — derive a code from userId so it never shows "Generating..."
    const fallbackCode = user.id.slice(0, 6).toUpperCase() + 'SHARE';
    setCode(fallbackCode);

    // Try to get/create a real persistent code from the backend
    fetch(`${API}/api/referrals/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code) {
          setCode(d.code);
          return fetch(`${API}/api/referrals/stats/${user.id}`).then((r) => r.json());
        }
      })
      .then((s) => {
        if (s) setStats(s);
      })
      .catch(() => {}); // backend down — fallback code already set
  }, [user?.id]);

  const link = code ? `${BASE_URL}/?ref=${code}` : `${BASE_URL}`;

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `🙏 Join me on BibleFunLand — free Bible games, AI devotionals & more for the whole family!\n${link}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  function shareTwitter() {
    const text = encodeURIComponent(
      `Loving BibleFunLand — free Bible games & AI devotionals for families! 🎮✝️\n${link}\n#BibleFunLand #FaithAndFun`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }

  if (!user?.id) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          border: '1.5px solid var(--border)',
          padding: '20px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🎁</div>
        <div
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontWeight: 800,
            color: 'var(--ink)',
            marginBottom: 6,
          }}
        >
          Invite Family & Earn Points
        </div>
        <p style={{ fontSize: '.82rem', color: 'var(--ink3)', marginBottom: 14 }}>
          Sign in to get your personal invite link and earn 50 points for every family member who
          joins.
        </p>
        <a
          href="/auth"
          style={{
            display: 'inline-block',
            padding: '9px 20px',
            borderRadius: 10,
            background: 'var(--blue)',
            color: 'white',
            fontWeight: 700,
            fontSize: '.82rem',
            textDecoration: 'none',
          }}
        >
          Sign In to Invite
        </a>
      </div>
    );
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          readOnly
          value={link}
          style={{
            flex: 1,
            minWidth: 180,
            padding: '8px 12px',
            borderRadius: 9,
            border: '1.5px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontSize: '.78rem',
          }}
        />
        <button
          onClick={copy}
          style={{
            padding: '8px 14px',
            borderRadius: 9,
            background: 'var(--blue)',
            color: 'white',
            fontWeight: 700,
            fontSize: '.78rem',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✅ Copied!' : '🔗 Copy Link'}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg,#1E1B4B,#0F172A)',
        borderRadius: 24,
        padding: '32px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '7rem', opacity: 0.04 }}>
        🎁
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: '2.2rem' }}>🎁</div>
          <div>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'white',
              }}
            >
              Invite Family & Friends
            </div>
            <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)' }}>
              Earn 50 points for every person who joins using your link
            </div>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
            {[
              ['🔗', stats.clicks || 0, 'Link Clicks'],
              ['👥', stats.conversions || 0, 'Joined'],
              ['⭐', stats.points_awarded || 0, 'Points Earned'],
            ].map(([icon, val, label]) => (
              <div
                key={label}
                style={{
                  background: 'rgba(255,255,255,.07)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  textAlign: 'center',
                  flex: 1,
                  minWidth: 80,
                }}
              >
                <div style={{ fontSize: '1.1rem' }}>{icon}</div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: 'white',
                  }}
                >
                  {val}
                </div>
                <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <input
            readOnly
            value={code ? link : 'Generating...'}
            style={{
              flex: 1,
              minWidth: 200,
              padding: '11px 14px',
              borderRadius: 11,
              border: '1.5px solid rgba(255,255,255,.15)',
              background: 'rgba(255,255,255,.08)',
              color: 'white',
              fontSize: '.82rem',
            }}
          />
          <button
            onClick={copy}
            style={{
              padding: '11px 18px',
              borderRadius: 11,
              background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
              color: 'white',
              fontWeight: 800,
              fontSize: '.82rem',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? '✅ Copied!' : '🔗 Copy'}
          </button>
        </div>

        {/* Social share */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={shareWhatsApp}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: 10,
              border: '1.5px solid #25D366',
              background: 'rgba(37,211,102,.1)',
              color: '#25D366',
              fontWeight: 700,
              fontSize: '.78rem',
              cursor: 'pointer',
            }}
          >
            💬 WhatsApp
          </button>
          <button
            onClick={shareTwitter}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: 10,
              border: '1.5px solid #1DA1F2',
              background: 'rgba(29,161,242,.1)',
              color: '#1DA1F2',
              fontWeight: 700,
              fontSize: '.78rem',
              cursor: 'pointer',
            }}
          >
            𝕏 Twitter
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '.68rem', marginTop: 12 }}>
          Your friend gets a warm welcome. You get 50 points when they sign up. Win-win! 🙌
        </p>
      </div>
    </div>
  );
}
