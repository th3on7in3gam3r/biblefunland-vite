import { useState } from 'react';
import { useStreak } from '../context/StreakContext';
import { useAuth } from '../context/AuthContext';
import { useBadges, BADGE_DEFS } from '../context/BadgeContext';
import { Link } from 'react-router-dom';
function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}
export default function Dashboard() {
  const { streak, readDays, checkedToday, checkIn } = useStreak();
  const { user } = useAuth();
  const { earned } = useBadges();
  const [calDate, setCalDate] = useState(new Date());
  const now = new Date();
  const y = calDate.getFullYear(),
    m = calDate.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const days = daysInMonth(y, m);
  const thisMonthRead = readDays.filter((d) =>
    d.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`)
  ).length;

  // Build badge display from BadgeContext
  const RARITY_COLORS = {
    common: '#6B7280',
    uncommon: '#10B981',
    rare: '#3B82F6',
    legendary: '#F59E0B',
  };
  const badges = Object.entries(BADGE_DEFS)
    .slice(0, 9)
    .map(([id, b]) => ({
      id,
      ...b,
      color: RARITY_COLORS[b.rarity] || '#6B7280',
      earned: earned.has(id),
    }));
  const earnedCount = earned.size;
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0A0A1A,#1E1B4B)',
          padding: '52px 36px 36px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,4vw,3.2rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 8,
          }}
        >
          My Progress 📊
        </h1>
        {user && (
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.88rem', fontWeight: 500 }}>
            Welcome back, {user.email?.split('@')[0]} 🙏
          </p>
        )}
        {!user && (
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.84rem', fontWeight: 500 }}>
            <Link to="/auth" style={{ color: '#60A5FA', fontWeight: 700 }}>
              Sign in
            </Link>{' '}
            to sync your progress across all devices!
          </p>
        )}
      </div>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '36px 24px' }}>
        {/* Top stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 18,
            marginBottom: 24,
          }}
        >
          {[
            ['🔥', streak, 'Day Streak', 'linear-gradient(135deg,#F97316,#EF4444)'],
            ['📅', thisMonthRead, 'Days Read This Month', 'var(--green)'],
            ['🏆', earnedCount, 'Badges Earned', 'var(--yellow)'],
          ].map(([e, n, l, c], i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                padding: 24,
                border: '1.5px solid var(--border)',
                textAlign: 'center',
                boxShadow: 'var(--sh)',
              }}
            >
              <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: 8 }}>{e}</span>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '2.8rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  marginBottom: 4,
                  background: c,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {n}
              </div>
              <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--ink3)' }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Calendar */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              padding: 28,
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--sh)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                }}
              >
                {calDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['‹', '›'].map((arrow, i) => (
                  <button
                    key={arrow}
                    onClick={() =>
                      setCalDate(
                        (d) => new Date(d.getFullYear(), d.getMonth() + (i === 0 ? -1 : 1), 1)
                      )
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: '1.5px solid var(--border)',
                      background: 'var(--surface)',
                      cursor: 'pointer',
                      fontSize: '.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ink2)',
                      transition: 'all .2s',
                    }}
                  >
                    {arrow}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div
                  key={d}
                  style={{
                    fontSize: '.62rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    color: 'var(--ink3)',
                    paddingBottom: 5,
                  }}
                >
                  {d}
                </div>
              ))}
              {Array(firstDay)
                .fill(null)
                .map((_, i) => (
                  <div key={'e' + i} />
                ))}
              {Array(days)
                .fill(null)
                .map((_, i) => {
                  const day = i + 1;
                  const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isRead = readDays.includes(ds);
                  const isToday = ds === todayStr();
                  return (
                    <div
                      key={day}
                      onClick={() => {}}
                      style={{
                        aspectRatio: 1,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all .2s',
                        background: isRead
                          ? 'linear-gradient(135deg,#34D399,#10B981)'
                          : isToday
                            ? 'transparent'
                            : 'transparent',
                        color: isRead ? 'white' : isToday ? 'var(--blue)' : 'var(--ink2)',
                        border:
                          isToday && !isRead ? '2px solid var(--blue)' : '2px solid transparent',
                        position: 'relative',
                      }}
                    >
                      {day}
                      {isRead && (
                        <span
                          style={{ position: 'absolute', top: 1, right: 2, fontSize: '.45rem' }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginTop: 14,
                fontSize: '.72rem',
                color: 'var(--ink3)',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg,#34D399,#10B981)',
                  }}
                />{' '}
                Read
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 4,
                    border: '2px solid var(--blue)',
                  }}
                />{' '}
                Today
              </div>
            </div>
            <button
              className="btn btn-green btn-full"
              style={{ marginTop: 18, justifyContent: 'center' }}
              onClick={checkIn}
              disabled={checkedToday}
            >
              {checkedToday ? '✅ Checked In Today!' : '✅ Mark Today as Read'}
            </button>
          </div>
          {/* Badges */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              padding: 28,
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--sh)',
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 18,
              }}
            >
              🏆 Your Badges
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {badges.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '14px 8px',
                    borderRadius: 14,
                    border: `1.5px solid ${b.earned ? b.color : 'var(--border)'}`,
                    background: b.earned ? 'var(--surface)' : 'var(--bg2)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all .25s',
                    boxShadow: b.earned ? `0 3px 14px ${b.color}25` : 'none',
                    filter: b.earned ? 'none' : 'grayscale(.8)',
                    opacity: b.earned ? 1 : 0.45,
                    transform: b.earned ? 'none' : 'scale(.98)',
                  }}
                >
                  <span style={{ fontSize: '1.9rem' }}>{b.emoji}</span>
                  <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--ink)' }}>
                    {b.name}
                  </span>
                  {!b.earned && (
                    <span style={{ fontSize: '.55rem', color: 'var(--ink3)', fontWeight: 500 }}>
                      {b.desc}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
