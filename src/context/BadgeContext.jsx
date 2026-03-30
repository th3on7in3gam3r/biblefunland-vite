// src/context/BadgeContext.jsx
// ─────────────────────────────────────────────────────────────────────
// Global badge / achievement system.
// Call awardBadge('streak_7') from anywhere — it handles deduplication,
// Supabase sync, confetti, and the toast notification.
//
// Usage:
//   const { awardBadge, badges, hasBadge } = useBadges()
//   awardBadge('trivia_perfect')   ← fires toast + confetti if new
// ─────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as db from '../lib/db';
import { requestQueue } from '../lib/requestQueue';

// ── Badge definitions ─────────────────────────────────────────────────
export const BADGE_DEFS = {
  // Streak badges
  streak_1: {
    emoji: '🌱',
    name: 'First Step',
    desc: 'Check in for the first time',
    category: 'Streak',
    rarity: 'common',
  },
  streak_3: {
    emoji: '🔥',
    name: '3-Day Streak',
    desc: 'Check in 3 days in a row',
    category: 'Streak',
    rarity: 'common',
  },
  streak_7: {
    emoji: '💪',
    name: 'Week Warrior',
    desc: 'Check in 7 days in a row',
    category: 'Streak',
    rarity: 'uncommon',
  },
  streak_30: {
    emoji: '🏆',
    name: 'Monthly Faithful',
    desc: 'Check in 30 days in a row',
    category: 'Streak',
    rarity: 'rare',
  },
  streak_100: {
    emoji: '👑',
    name: 'Century Saint',
    desc: 'Check in 100 days in a row',
    category: 'Streak',
    rarity: 'legendary',
  },
  // Games
  trivia_play: {
    emoji: '❓',
    name: 'Quiz Taker',
    desc: 'Play your first Trivia game',
    category: 'Games',
    rarity: 'common',
  },
  trivia_perfect: {
    emoji: '🎯',
    name: 'Scripture Scholar',
    desc: 'Score 100% in Trivia',
    category: 'Games',
    rarity: 'rare',
  },
  runner_play: {
    emoji: '🏃',
    name: 'On the Run',
    desc: 'Play Scripture Runner',
    category: 'Games',
    rarity: 'common',
  },
  runner_1000: {
    emoji: '⚡',
    name: 'Speed of Faith',
    desc: 'Score 1000+ points in Scripture Runner',
    category: 'Games',
    rarity: 'uncommon',
  },
  escape_jonah: {
    emoji: '🐟',
    name: 'Whale Escaper',
    desc: "Escape Jonah's Whale",
    category: 'Games',
    rarity: 'uncommon',
  },
  escape_daniel: {
    emoji: '🦁',
    name: 'Lion Tamer',
    desc: "Escape Daniel's Lion's Den",
    category: 'Games',
    rarity: 'uncommon',
  },
  escape_moses: {
    emoji: '🔥',
    name: 'Burning Bush',
    desc: 'Escape the Burning Bush room',
    category: 'Games',
    rarity: 'uncommon',
  },
  escape_all: {
    emoji: '🧩',
    name: 'Escape Artist',
    desc: 'Complete all 3 Parable Escape Rooms',
    category: 'Games',
    rarity: 'rare',
  },
  // AI & Tools
  rap_first: {
    emoji: '🎵',
    name: 'First Verse',
    desc: 'Generate your first Bible rap',
    category: 'AI',
    rarity: 'common',
  },
  rap_five: {
    emoji: '🎤',
    name: 'Gospel MC',
    desc: 'Generate 5 Bible songs',
    category: 'AI',
    rarity: 'uncommon',
  },
  devotional_10: {
    emoji: '🙏',
    name: 'Devoted',
    desc: 'Generate 10 AI devotionals',
    category: 'AI',
    rarity: 'uncommon',
  },
  voice_ace: {
    emoji: '🎙️',
    name: 'Perfect Reciter',
    desc: 'Score 95%+ on Voice Bible Reader',
    category: 'Learning',
    rarity: 'rare',
  },
  // Community
  prayer_first: {
    emoji: '🙌',
    name: 'Prayer Warrior',
    desc: 'Submit your first prayer',
    category: 'Community',
    rarity: 'common',
  },
  prayer_10: {
    emoji: '🌍',
    name: 'Intercessor',
    desc: 'Submit 10 prayers',
    category: 'Community',
    rarity: 'uncommon',
  },
  encourage_5: {
    emoji: '❤️',
    name: 'Encourager',
    desc: 'Encourage 5 people on the wall',
    category: 'Community',
    rarity: 'uncommon',
  },
  map_pin: {
    emoji: '🌍',
    name: 'Prayer Mapper',
    desc: 'Add a pin to the Global Prayer Map',
    category: 'Community',
    rarity: 'common',
  },
  // Learning
  cert_first: {
    emoji: '🎓',
    name: 'Certified',
    desc: 'Earn your first Bible certificate',
    category: 'Learning',
    rarity: 'rare',
  },
  flashcard_all: {
    emoji: '🧠',
    name: 'Memory Master',
    desc: 'Mark all flashcards as Known',
    category: 'Learning',
    rarity: 'uncommon',
  },
  reading_plan: {
    emoji: '📅',
    name: 'Plan Starter',
    desc: 'Start a Bible Reading Plan',
    category: 'Learning',
    rarity: 'common',
  },
  reading_finish: {
    emoji: '📖',
    name: 'Plan Finisher',
    desc: 'Complete a full Reading Plan',
    category: 'Learning',
    rarity: 'legendary',
  },
  book_explorer: {
    emoji: '🗺️',
    name: 'Book Explorer',
    desc: 'Browse all 66 books of the Bible',
    category: 'Learning',
    rarity: 'uncommon',
  },
  beads_complete: {
    emoji: '📿',
    name: 'Prayer Beads',
    desc: 'Complete a full Prayer Beads session',
    category: 'Soul',
    rarity: 'uncommon',
  },
  quiz_character: {
    emoji: '🧬',
    name: 'Self-Aware',
    desc: 'Complete the Bible Character Quiz',
    category: 'Soul',
    rarity: 'common',
  },
  spin_jackpot: {
    emoji: '🎰',
    name: 'Jackpot!',
    desc: 'Hit a match-3 jackpot in Spin the Verse',
    category: 'Games',
    rarity: 'uncommon',
  },
};

export const RARITY_COLORS = {
  common: { color: '#6B7280', bg: '#F3F4F6', label: 'Common' },
  uncommon: { color: '#10B981', bg: '#ECFDF5', label: 'Uncommon' },
  rare: { color: '#3B82F6', bg: '#EFF6FF', label: 'Rare' },
  legendary: { color: '#F59E0B', bg: '#FFFBEB', label: 'Legendary' },
};

const BadgeContext = createContext(null);

export function BadgeProvider({ children }) {
  const { user } = useAuth();
  const [earned, setEarned] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('bfl_badges') || '[]'));
    } catch {
      return new Set();
    }
  });
  const [toasts, setToasts] = useState([]);

  // Load from Turso when user logs in
  useEffect(() => {
    if (!user) return;
    requestQueue
      .execute(`badges:${user.id}`, () => db.getBadges(user.id), {
        priority: 4,
        cacheable: true,
        ttl: 10 * 60 * 1000,
      })
      .then(({ data }) => {
        if (data?.length) {
          const ids = new Set(data.map((b) => b.badge_id));
          setEarned(ids);
          localStorage.setItem('bfl_badges', JSON.stringify([...ids]));
        }
      })
      .catch(() => {});
  }, [user]);

  const awardBadge = useCallback(
    (badgeId) => {
      if (!BADGE_DEFS[badgeId]) return;
      if (earned.has(badgeId)) return; // already earned

      const badge = BADGE_DEFS[badgeId];
      const newEarned = new Set([...earned, badgeId]);
      setEarned(newEarned);
      localStorage.setItem('bfl_badges', JSON.stringify([...newEarned]));

      // Show toast
      const toastId = Date.now();
      setToasts((t) => [...t, { id: toastId, badge, badgeId }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toastId)), 4500);

      // Sync to Turso
      if (user) {
        db.awardBadge(user.id, badgeId).catch(() => {});
      }
    },
    [earned, user]
  );

  const hasBadge = useCallback((id) => earned.has(id), [earned]);

  return (
    <BadgeContext.Provider value={{ awardBadge, hasBadge, earned, toasts }}>
      {children}
      <BadgeToastStack toasts={toasts} />
    </BadgeContext.Provider>
  );
}

export const useBadges = () => {
  const ctx = useContext(BadgeContext);
  if (!ctx) throw new Error('useBadges must be inside BadgeProvider');
  return ctx;
};

// ── Toast notification stack ──────────────────────────────────────────
function BadgeToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        fontFamily: 'Poppins,sans-serif',
      }}
    >
      {toasts.map((t) => (
        <BadgeToast key={t.id} badge={t.badge} />
      ))}
    </div>
  );
}

function BadgeToast({ badge }) {
  const rarity = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--surface)',
        borderRadius: 16,
        border: `2px solid ${rarity.color}44`,
        boxShadow: `0 8px 32px rgba(0,0,0,.18), 0 0 0 1px ${rarity.color}22`,
        padding: '14px 18px',
        maxWidth: 300,
        animation: 'badgeIn .4s cubic-bezier(.34,1.56,.64,1)',
      }}
    >
      {/* Confetti burst */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 13,
            background: rarity.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            border: `2px solid ${rarity.color}44`,
          }}
        >
          {badge.emoji}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: -3,
            borderRadius: 16,
            border: `2px solid ${rarity.color}`,
            animation: 'badgePing 1s ease-out',
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '.58rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: rarity.color,
            marginBottom: 2,
          }}
        >
          🏆 Badge Earned · {badge.rarity}
        </div>
        <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 1 }}>
          {badge.name}
        </div>
        <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 500 }}>
          {badge.desc}
        </div>
      </div>
    </div>
  );
}

/*
  ── Supabase SQL ──

  CREATE TABLE IF NOT EXISTS badges (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id   TEXT NOT NULL,
    earned_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_id)
  );
  ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users read own badges"
    ON badges FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users insert own badges"
    ON badges FOR INSERT WITH CHECK (auth.uid() = user_id);
*/
