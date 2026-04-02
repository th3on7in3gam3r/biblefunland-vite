import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getActiveChallenge, getCurrentSeason } from '../lib/seasonal';
import { useAuth } from '../context/AuthContext';
import { useStreak } from '../context/StreakContext';

export default function WeeklyChallenge({ compact = false }) {
  const challenge = getActiveChallenge();
  const season = getCurrentSeason();
  const { user } = useAuth();
  const { streak } = useStreak();
  const [accepted, setAccepted] = useState(
    () =>
      localStorage.getItem(`challenge_accepted_${challenge.week || challenge.season}`) === 'true'
  );

  const color = season?.color || '#8B5CF6';
  const bg = season ? `${color}12` : 'var(--violet-bg)';

  function accept() {
    localStorage.setItem(`challenge_accepted_${challenge.week || challenge.season}`, 'true');
    setAccepted(true);
  }

  if (compact) {
    return (
      <div
        style={{
          background: bg,
          borderRadius: 16,
          border: `1.5px solid ${color}30`,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ fontSize: '2rem', flexShrink: 0 }}>{challenge.seasonal ? '🏆' : '📅'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '.9rem',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 2,
            }}
          >
            {challenge.title}
          </div>
          <div
            style={{
              fontSize: '.72rem',
              color: 'var(--ink3)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {challenge.desc}
          </div>
        </div>
        <span
          style={{
            fontSize: '.68rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 99,
            background: `${color}20`,
            color,
            flexShrink: 0,
          }}
        >
          +{challenge.points} pts
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: bg,
        borderRadius: 20,
        border: `1.5px solid ${color}30`,
        padding: '24px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          fontSize: '6rem',
          opacity: 0.05,
          lineHeight: 1,
        }}
      >
        🏆
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            flexShrink: 0,
          }}
        >
          {challenge.seasonal ? '🏆' : '📅'}
        </div>
        <div>
          <div
            style={{
              fontSize: '.68rem',
              fontWeight: 800,
              color,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            {challenge.seasonal ? '🌟 Seasonal Challenge' : `📅 Week ${challenge.week} Challenge`}
          </div>
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}
          >
            {challenge.title}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '.85rem', color: 'var(--ink2)', lineHeight: 1.7, marginBottom: 18 }}>
        {challenge.desc}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '.72rem',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: 99,
            background: `${color}20`,
            color,
          }}
        >
          +{challenge.points} pts
        </span>
        {challenge.badge && (
          <span
            style={{
              fontSize: '.72rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 99,
              background: 'var(--surface)',
              color: 'var(--ink3)',
              border: '1px solid var(--border)',
            }}
          >
            🏅 Earns: {challenge.badge}
          </span>
        )}
        {streak > 0 && (
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#F97316' }}>
            🔥 {streak} day streak bonus!
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {!accepted ? (
          <button
            onClick={accept}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 22px',
              borderRadius: 12,
              background: color,
              color: 'white',
              fontWeight: 800,
              fontSize: '.85rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: `0 4px 16px ${color}30`,
            }}
          >
            ✅ Accept Challenge
          </button>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 22px',
              borderRadius: 12,
              background: 'var(--green-bg)',
              color: 'var(--green)',
              fontWeight: 800,
              fontSize: '.85rem',
              border: '1.5px solid var(--green)',
            }}
          >
            ✅ Challenge Accepted!
          </div>
        )}
        {challenge.seasonal && (
          <Link
            to={`/play?season=${challenge.season}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 12,
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontWeight: 700,
              fontSize: '.85rem',
              textDecoration: 'none',
              border: '1.5px solid var(--border)',
            }}
          >
            🎮 View Seasonal Games
          </Link>
        )}
      </div>
    </div>
  );
}
