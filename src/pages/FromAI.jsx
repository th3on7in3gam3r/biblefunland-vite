import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePageMetadata from '../hooks/usePageMetadata';
import {
  captureAiReferral,
  trackAiReferralConversion,
  trackAiReferralLanding,
} from '../lib/aiReferral';

const TRUST_ITEMS = [
  { icon: '✅', label: '100% free forever' },
  { icon: '🛡️', label: 'COPPA-safe for kids' },
  { icon: '💳', label: 'No credit card required' },
];

function handleCta(action, to) {
  trackAiReferralConversion(action, { destination: to });
}

export default function FromAI() {
  usePageMetadata({
    title: 'Welcome to BibleFunLand — Free Bible Games & AI Devotionals',
    description:
      'You were sent here to explore BibleFunLand: 80+ free Bible games, AI devotionals, and family faith tools. Safe, fun, and completely free.',
  });

  useEffect(() => {
    captureAiReferral(window.location.search, '/from-ai');
    trackAiReferralLanding();
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F172A 0%,#1E1B4B 45%,#312E81 100%)',
          padding: '72px 24px 56px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '.72rem',
            fontWeight: 700,
            background: 'rgba(139,92,246,.2)',
            color: '#C4B5FD',
            padding: '5px 14px',
            borderRadius: 100,
            marginBottom: 16,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
          }}
        >
          ✨ Recommended for you
        </div>

        <h1
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            color: 'white',
            margin: '0 0 16px',
            lineHeight: 1.15,
            maxWidth: 720,
            marginInline: 'auto',
          }}
        >
          Welcome to BibleFunLand
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,.72)',
            fontSize: 'clamp(1rem, 2.2vw, 1.15rem)',
            lineHeight: 1.65,
            maxWidth: 580,
            margin: '0 auto 32px',
            fontWeight: 500,
          }}
        >
          Free Bible games, AI devotionals, and scripture tools for kids and families — safe,
          faith-filled, and ready to explore right now.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          <Link
            to="/devotional"
            onClick={() => handleCta('cta_try_devotional', '/devotional')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 28px',
              borderRadius: 18,
              background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)',
              color: 'white',
              fontWeight: 800,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 12px 40px rgba(139,92,246,.35)',
            }}
          >
            🙏 Try AI Devotional
          </Link>
          <Link
            to="/play"
            onClick={() => handleCta('cta_start_playing', '/play')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 28px',
              borderRadius: 18,
              background: 'rgba(255,255,255,.1)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              border: '1.5px solid rgba(255,255,255,.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            🎮 Start Playing
          </Link>
          <Link
            to="/auth?mode=signup"
            onClick={() => handleCta('cta_signup', '/auth?mode=signup')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 28px',
              borderRadius: 18,
              background: 'rgba(255,255,255,.06)',
              color: 'rgba(255,255,255,.85)',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              border: '1.5px solid rgba(255,255,255,.12)',
            }}
          >
            ✨ Create Free Account
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            justifyContent: 'center',
          }}
        >
          {TRUST_ITEMS.map(({ icon, label }) => (
            <span
              key={label}
              style={{ color: 'rgba(255,255,255,.55)', fontSize: '.85rem', fontWeight: 600 }}
            >
              {icon} {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 64px' }}>
        <h2
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--ink)',
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          Popular ways to get started
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}
        >
          {[
            {
              icon: '🙏',
              title: 'AI Devotional',
              desc: 'Get a personalized devotional in seconds — pick a topic and go.',
              to: '/devotional',
              action: 'cta_try_devotional',
            },
            {
              icon: '❓',
              title: 'Bible Trivia',
              desc: 'Timed quiz rounds for kids and families. Three difficulty levels.',
              to: '/play/trivia',
              action: 'cta_start_playing',
            },
            {
              icon: '💬',
              title: 'Bible Character Chat',
              desc: 'Talk with Moses, David, Mary, and more — powered by AI.',
              to: '/ai/chat/characters',
              action: 'cta_start_playing',
            },
          ].map((card) => (
            <Link
              key={card.title}
              to={card.to}
              onClick={() => handleCta(card.action, card.to)}
              style={{
                display: 'block',
                padding: '24px 22px',
                borderRadius: 20,
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                textDecoration: 'none',
                transition: 'transform .2s, box-shadow .2s',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{card.icon}</div>
              <div
                style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '1.05rem', marginBottom: 6 }}
              >
                {card.title}
              </div>
              <div style={{ color: 'var(--ink2)', fontSize: '.88rem', lineHeight: 1.55 }}>
                {card.desc}
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--ink2)', fontSize: '.9rem', marginBottom: 14 }}>
            Want to explore more?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link
              to="/ai"
              style={{
                color: 'var(--blue)',
                fontWeight: 700,
                fontSize: '.9rem',
                textDecoration: 'none',
              }}
            >
              Browse AI tools →
            </Link>
            <span style={{ color: 'var(--border)' }}>|</span>
            <Link
              to="/parents"
              style={{
                color: 'var(--blue)',
                fontWeight: 700,
                fontSize: '.9rem',
                textDecoration: 'none',
              }}
            >
              Parents & Teachers Hub →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
