import { useRealTime } from '../context/RealTimeContext';
import { Link } from 'react-router-dom';

export default function FamilyLiveProgress() {
  const { familyProgress, kidsMode } = useRealTime();
  const { members, challenge, live } = familyProgress;

  if (!live || members.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 18,
        border: '1.5px solid var(--border)',
        padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 8px #10B981',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        <div
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: '.95rem',
            fontWeight: 800,
            color: 'var(--ink)',
          }}
        >
          👨‍👩‍👧 Family Live
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      </div>

      {/* Members */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: challenge ? 14 : 0,
        }}
      >
        {members.slice(0, 5).map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: `hsl(${i * 60},70%,60%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '.9rem',
                fontWeight: 800,
                color: 'white',
                flexShrink: 0,
              }}
            >
              {m.name?.[0] || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '.78rem',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginBottom: 2,
                }}
              >
                {m.name || 'Family Member'}
              </div>
              <div
                style={{
                  height: 5,
                  borderRadius: 99,
                  background: 'var(--border)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 99,
                    background: `hsl(${i * 60},70%,55%)`,
                    width: `${Math.min(100, m.progress || 0)}%`,
                    transition: 'width .5s ease',
                  }}
                />
              </div>
            </div>
            <div
              style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--ink3)', flexShrink: 0 }}
            >
              {m.streak || 0}🔥
            </div>
          </div>
        ))}
      </div>

      {/* Active challenge */}
      {challenge && (
        <div
          style={{
            background: 'var(--violet-bg)',
            borderRadius: 12,
            padding: '10px 12px',
            border: '1px solid rgba(139,92,246,.2)',
          }}
        >
          <div
            style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--violet)', marginBottom: 3 }}
          >
            🏆 Family Challenge
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--ink2)', fontWeight: 600 }}>
            {challenge.title}
          </div>
        </div>
      )}

      <Link
        to="/community/family"
        style={{
          display: 'block',
          textAlign: 'center',
          marginTop: 12,
          fontSize: '.75rem',
          fontWeight: 700,
          color: 'var(--blue)',
          textDecoration: 'none',
        }}
      >
        View Family Hub →
      </Link>
    </div>
  );
}
