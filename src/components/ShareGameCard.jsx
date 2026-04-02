/**
 * ShareGameCard — "Share this game" button with referral link + social share
 * Drop into any game results screen.
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_APP_URL || 'https://biblefunland.com';

export default function ShareGameCard({
  game = { title: 'BibleFunLand', to: '/', emoji: '🎮' },
  score = null,
  compact = false,
}) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const refParam = user?.id ? `?ref=${user.id.slice(0, 8).toUpperCase()}` : '';
  const shareUrl = `${BASE_URL}${game.to}${refParam}`;
  const shareText =
    score !== null
      ? `I just scored ${score} points on ${game.emoji} ${game.title} on BibleFunLand! Can you beat me? 🎮✝️`
      : `Check out ${game.emoji} ${game.title} on BibleFunLand — free Bible games for the whole family! ✝️`;

  function copy() {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank');
  }

  function shareTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText}\n${shareUrl}\n#BibleFunLand`)}`,
      '_blank'
    );
  }

  function shareFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--ink3)' }}>Share:</span>
        <button
          onClick={copy}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--ink2)',
            fontWeight: 700,
            fontSize: '.75rem',
            cursor: 'pointer',
          }}
        >
          {copied ? '✅' : '🔗 Copy'}
        </button>
        <button
          onClick={shareWhatsApp}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1.5px solid #25D366',
            background: 'rgba(37,211,102,.08)',
            color: '#25D366',
            fontWeight: 700,
            fontSize: '.75rem',
            cursor: 'pointer',
          }}
        >
          💬
        </button>
        <button
          onClick={shareTwitter}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1.5px solid #1DA1F2',
            background: 'rgba(29,161,242,.08)',
            color: '#1DA1F2',
            fontWeight: 700,
            fontSize: '.75rem',
            cursor: 'pointer',
          }}
        >
          𝕏
        </button>
        <button
          onClick={shareFacebook}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1.5px solid #1877F2',
            background: 'rgba(24,119,242,.08)',
            color: '#1877F2',
            fontWeight: 700,
            fontSize: '.75rem',
            cursor: 'pointer',
          }}
        >
          📘
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 18,
        border: '1.5px solid var(--border)',
        padding: '20px 22px',
      }}
    >
      <div
        style={{
          fontFamily: "'Baloo 2',cursive",
          fontSize: '1rem',
          fontWeight: 800,
          color: 'var(--ink)',
          marginBottom: 6,
        }}
      >
        📤 Share this game
      </div>
      <p style={{ fontSize: '.78rem', color: 'var(--ink3)', marginBottom: 14, lineHeight: 1.6 }}>
        {shareText}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={copy}
          style={{
            flex: 1,
            padding: '9px 14px',
            borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--ink2)',
            fontWeight: 700,
            fontSize: '.78rem',
            cursor: 'pointer',
          }}
        >
          {copied ? '✅ Copied!' : '🔗 Copy Link'}
        </button>
        <button
          onClick={shareWhatsApp}
          style={{
            padding: '9px 14px',
            borderRadius: 10,
            border: '1.5px solid #25D366',
            background: 'rgba(37,211,102,.08)',
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
            padding: '9px 14px',
            borderRadius: 10,
            border: '1.5px solid #1DA1F2',
            background: 'rgba(29,161,242,.08)',
            color: '#1DA1F2',
            fontWeight: 700,
            fontSize: '.78rem',
            cursor: 'pointer',
          }}
        >
          𝕏 Twitter
        </button>
        <button
          onClick={shareFacebook}
          style={{
            padding: '9px 14px',
            borderRadius: 10,
            border: '1.5px solid #1877F2',
            background: 'rgba(24,119,242,.08)',
            color: '#1877F2',
            fontWeight: 700,
            fontSize: '.78rem',
            cursor: 'pointer',
          }}
        >
          📘 Facebook
        </button>
      </div>
    </div>
  );
}
