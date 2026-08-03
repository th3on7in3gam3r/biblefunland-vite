import { useAds } from '../context/AdsContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FAMILY_TEASER,
  PLAN_PRICES,
  PRO_EXCLUSIVES,
} from '../lib/membershipOffers';

const FEATURE_CONFIG = {
  AI: {
    emoji: '🤖',
    color: '#8B5CF6',
    bg: 'linear-gradient(135deg,#1E1B4B,#312E81,#0F172A)',
    glow: '#8B5CF6',
    perks: [
      '🙏 AI Devotional — personalized every day',
      '💬 Bible Character Chat — talk to Moses, David & more',
      '🎵 Bible Rap Generator — scripture songs in seconds',
      '🖼️ Miracle Art — AI Bible scene art prompts',
    ],
  },
  Growth: {
    emoji: '🌱',
    color: '#10B981',
    bg: 'linear-gradient(135deg,#064E3B,#065F46,#0F172A)',
    glow: '#10B981',
    perks: [
      '🎓 Bible Certification — earn a real certificate',
      '📅 Reading Plans — structured daily Bible reading',
      '📿 Faith Milestones — track your spiritual journey',
      '🌳 Bible Family Tree — explore biblical genealogy',
      '🎵 Worship Discovery — find worship music by mood',
    ],
  },
  'Parent Progress': {
    emoji: '📊',
    color: '#3B82F6',
    bg: 'linear-gradient(135deg,#1E3A5F,#1E1B4B,#0F172A)',
    glow: '#3B82F6',
    perks: [
      '📊 Detailed progress reports per child',
      '📈 Reading streaks and quiz score history',
      '🏅 Badge and milestone tracking',
      '📧 Weekly email digests for parents',
    ],
  },
};

export default function ProGate({ children, feature = 'Pro' }) {
  const { isProUser, proChecked } = useAds();
  const { user } = useAuth();

  // Still checking subscription
  if (!proChecked) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: '#8B5CF6',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: 'var(--ink3)', fontSize: '.9rem' }}>Checking your subscription…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Pro user — show the content
  if (isProUser) return <>{children}</>;

  // Not Pro — show upgrade wall (BLOCKS content entirely)
  const cfg = FEATURE_CONFIG[feature] || FEATURE_CONFIG.AI;
  const perkList = cfg.perks;

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', background: 'var(--bg)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: 560, width: '100%',
          background: cfg.bg,
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: `0 24px 80px ${cfg.glow}30`,
          border: `1.5px solid ${cfg.color}30`,
        }}
      >
        {/* Top glow bar */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, ${cfg.color}, ${cfg.glow}80, ${cfg.color})`,
        }} />

        <div style={{ padding: '40px 36px 36px', textAlign: 'center' }}>
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              fontSize: '3.5rem', marginBottom: 16,
              filter: `drop-shadow(0 4px 16px ${cfg.glow}60)`,
            }}
          >
            {cfg.emoji}
          </motion.div>

          {/* Headline */}
          <h2 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800,
            fontSize: 'clamp(1.5rem,4vw,2rem)',
            color: 'white', marginBottom: 8, lineHeight: 1.2,
          }}>
            Unlock {feature} Features
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: '.9rem',
            lineHeight: 1.7, marginBottom: 20, maxWidth: 380, margin: '0 auto 20px',
          }}>
            {user
              ? `Upgrade to Pro to access all ${feature} tools — ad-free, priority AI, and full access.`
              : 'Sign in and upgrade to Pro to unlock these powerful faith-building tools.'}
          </p>

          {/* Shared Pro exclusives */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
            marginBottom: 20,
          }}>
            {PRO_EXCLUSIVES.map((item) => (
              <span
                key={item}
                style={{
                  fontSize: '.65rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.75)',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${cfg.color}40`,
                  padding: '4px 9px',
                  borderRadius: 100,
                }}
              >
                {item}
              </span>
            ))}
          </div>

          {/* Perks list */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${cfg.color}25`,
            borderRadius: 16, padding: '20px 24px',
            marginBottom: 24, textAlign: 'left',
          }}>
            <div style={{
              fontSize: '.7rem', fontWeight: 800, letterSpacing: '1px',
              textTransform: 'uppercase', color: cfg.color, marginBottom: 12,
            }}>
              What you get with Pro
            </div>
            {perkList.map((perk, i) => (
              <div key={i} style={{
                fontSize: '.85rem', color: 'rgba(255,255,255,0.75)',
                fontWeight: 500, padding: '5px 0',
                borderBottom: i < perkList.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                {perk}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/premium" style={{
              padding: '13px 28px', borderRadius: 14,
              background: `linear-gradient(135deg, ${cfg.color}, ${cfg.glow}cc)`,
              color: 'white', fontWeight: 800, fontSize: '.95rem',
              textDecoration: 'none',
              boxShadow: `0 8px 24px ${cfg.glow}40`,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              💎 Upgrade to Pro — from {PLAN_PRICES.pro.monthly}/mo
            </Link>
            {!user && (
              <Link to="/auth" style={{
                padding: '13px 22px', borderRadius: 14,
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 700, fontSize: '.9rem', textDecoration: 'none',
                border: '1.5px solid rgba(255,255,255,0.15)',
              }}>
                🔐 Sign In First
              </Link>
            )}
          </div>

          <p style={{
            marginTop: 18, fontSize: '.78rem',
            color: 'rgba(251,146,60,0.85)', fontWeight: 600,
          }}>
            {FAMILY_TEASER}
          </p>
          <Link
            to="/premium"
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: '.78rem',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Compare Free, Pro & Family plans →
          </Link>

          {/* Free preview note */}
          <p style={{
            marginTop: 16, fontSize: '.75rem',
            color: 'rgba(255,255,255,0.3)', fontWeight: 500,
          }}>
            Games, prayer wall, and Verse of the Day stay free — explore while you decide.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
