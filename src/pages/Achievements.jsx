import { Link } from 'react-router-dom';
import { BADGE_DEFS, RARITY_COLORS, useBadges } from '../context/BadgeContext';

const CATEGORIES = ['All', 'Streak', 'Games', 'AI', 'Learning', 'Community', 'Soul'];

import { useState } from 'react';

export default function Achievements() {
  const { earned } = useBadges();
  const [cat, setCat] = useState('All');
  const allBadges = Object.entries(BADGE_DEFS);
  const filtered = cat === 'All' ? allBadges : allBadges.filter(([, b]) => b.category === cat);
  const totalEarned = [...earned].filter((id) => BADGE_DEFS[id]).length;
  const total = allBadges.length;
  const pct = Math.round((totalEarned / total) * 100);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1A0A2E)',
          padding: '52px 36px 40px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#FCD34D,#A5B4FC,#34D399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          🏆 Achievements
        </h1>
        <div
          style={{
            fontSize: '.9rem',
            color: 'rgba(255,255,255,.5)',
            fontWeight: 500,
            marginBottom: 14,
          }}
        >
          {totalEarned} / {total} badges earned · {pct}% complete
        </div>
        <div
          style={{
            maxWidth: 360,
            margin: '0 auto',
            height: 10,
            borderRadius: 100,
            background: 'rgba(255,255,255,.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 100,
              background: 'linear-gradient(90deg,#FCD34D,#F97316)',
              width: `${pct}%`,
              transition: 'width .6s ease',
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                fontSize: '.76rem',
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: 100,
                cursor: 'pointer',
                border: `1.5px solid ${cat === c ? 'var(--violet)' : 'var(--border)'}`,
                background: cat === c ? 'var(--violet)' : 'var(--surface)',
                color: cat === c ? 'white' : 'var(--ink2)',
                transition: 'all .2s',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Rarity legend */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {Object.entries(RARITY_COLORS).map(([r, v]) => (
            <div
              key={r}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '.72rem',
                fontWeight: 700,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color }} />
              <span style={{ color: 'var(--ink3)' }}>{v.label}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
            gap: 12,
          }}
        >
          {filtered.map(([id, badge]) => {
            const isEarned = earned.has(id);
            const rarity = RARITY_COLORS[badge.rarity];
            return (
              <div
                key={id}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 18,
                  border: `1.5px solid ${isEarned ? rarity.color + '44' : 'var(--border)'}`,
                  padding: '20px 16px',
                  textAlign: 'center',
                  position: 'relative',
                  opacity: isEarned ? 1 : 0.45,
                  transition: 'all .2s',
                  filter: isEarned ? 'none' : 'grayscale(0.6)',
                }}
                onMouseEnter={(e) => {
                  if (isEarned) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 10px 28px ${rarity.color}22`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {isEarned && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: rarity.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '.6rem',
                      color: 'white',
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </div>
                )}
                <div
                  style={{
                    fontSize: '2.2rem',
                    marginBottom: 10,
                    filter: isEarned ? `drop-shadow(0 0 8px ${rarity.color}66)` : 'none',
                  }}
                >
                  {badge.emoji}
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '.88rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 4,
                  }}
                >
                  {badge.name}
                </div>
                <div
                  style={{
                    fontSize: '.7rem',
                    color: 'var(--ink3)',
                    fontWeight: 500,
                    lineHeight: 1.5,
                    marginBottom: 8,
                  }}
                >
                  {badge.desc}
                </div>
                <div
                  style={{
                    fontSize: '.62rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 100,
                    display: 'inline-block',
                    background: rarity.bg,
                    color: rarity.color,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {badge.rarity}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/profile" className="btn btn-outline">
            ← Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
