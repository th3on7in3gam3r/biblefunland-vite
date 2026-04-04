import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { query } from '../lib/db';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ADMIN_LINKS = [
  { to: '/admin/analytics', icon: '📊', label: 'Analytics', color: '#3B82F6' },
  { to: '/admin/ab-tests', icon: '🧪', label: 'A/B Tests', color: '#8B5CF6' },
  { to: '/admin/launch', icon: '🚀', label: 'Launch Checklist', color: '#10B981' },
  { to: '/community/prayer', icon: '🙏', label: 'Prayer Queue', color: '#EC4899' },
  { to: '/seasonal', icon: '🎄', label: 'Seasonal AI', color: '#F59E0B' },
  { to: '/admin/newsletter', icon: '📧', label: 'Newsletter', color: '#14B8A6' },
];

export default function Admin() {
  const navigate = useNavigate();
  useEffect(() => {
    if (sessionStorage.getItem('bfl_admin_verified') !== 'true')
      navigate('/admin/login', { replace: true });
  }, []);

  // Real stats from Turso
  const [stats, setStats] = useState({ users: '—', prayers: '—', activities: '—', badges: '—' });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [users, prayers, activities, badges] = await Promise.all([
          query('SELECT COUNT(*) AS total FROM profiles', []),
          query('SELECT COUNT(*) AS total FROM prayer_requests', []),
          query('SELECT COUNT(*) AS total FROM child_activity', []),
          query('SELECT COUNT(*) AS total FROM badges', []),
        ]);
        setStats({
          users: (users.data?.[0]?.total ?? 0).toLocaleString(),
          prayers: (prayers.data?.[0]?.total ?? 0).toLocaleString(),
          activities: (activities.data?.[0]?.total ?? 0).toLocaleString(),
          badges: (badges.data?.[0]?.total ?? 0).toLocaleString(),
        });
      } catch {
        // backend down — keep showing dashes
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

  const GAMES = [
    ['Scripture Trivia', 92, '4.2K'],
    ['Bible Checkers', 74, '3.4K'],
    ["Noah's Voyage", 61, '2.8K'],
    ['David & Goliath', 52, '2.4K'],
    ["Jonah's Escape", 40, '1.8K'],
  ];
  const ACTIVITY = [
    { c: 'var(--blue)', t: 'New game played — Scripture Trivia', when: 'Just now' },
    { c: 'var(--green)', t: 'Prayer request submitted', when: '2 min ago' },
    { c: 'var(--violet)', t: 'AI Devotional generated — "Hope"', when: '5 min ago' },
    { c: 'var(--orange)', t: 'Badge unlocked — Week Warrior', when: '12 min ago' },
    { c: 'var(--pink)', t: 'Share card downloaded', when: '18 min ago' },
    { c: 'var(--teal)', t: 'Daily check-in streak: 7 days', when: '1 hr ago' },
  ];
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B,#0F172A)',
          padding: '44px 36px 0',
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '.68rem',
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  background: 'rgba(99,102,241,.2)',
                  color: '#A5B4FC',
                  border: '1px solid rgba(99,102,241,.3)',
                  padding: '4px 12px',
                  borderRadius: 100,
                  marginBottom: 10,
                }}
              >
                🔐 Admin Only
              </div>
              <h1
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: 'clamp(1.8rem,4vw,2.6rem)',
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: 4,
                }}
              >
                📊 Admin Dashboard
              </h1>
              <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>
                BibleFunLand · Site analytics, moderation &amp; tools
              </p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('bfl_admin_verified');
                navigate('/');
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: '1.5px solid rgba(255,255,255,.15)',
                background: 'rgba(255,255,255,.06)',
                color: 'rgba(255,255,255,.5)',
                fontWeight: 700,
                fontSize: '.8rem',
                cursor: 'pointer',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)')}
            >
              🔒 Lock Admin
            </button>
          </div>

          {/* Quick nav */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 0 }}>
            {ADMIN_LINKS.map(({ to, icon, label, color }) => (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  borderRadius: '12px 12px 0 0',
                  fontSize: '.8rem',
                  fontWeight: 700,
                  background: 'rgba(255,255,255,.07)',
                  color: 'rgba(255,255,255,.65)',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderBottom: 'none',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = color + '22';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.07)';
                  e.currentTarget.style.color = 'rgba(255,255,255,.65)';
                }}
              >
                <span style={{ fontSize: '1rem' }}>{icon}</span> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 32px 60px' }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            ['👥', 'Total Users', stats.users, 'From profiles table', '#3B82F6'],
            ['🎯', 'Activities Tracked', stats.activities, 'From child_activity', '#10B981'],
            ['🙏', 'Prayer Requests', stats.prayers, 'From prayer_requests', '#8B5CF6'],
            ['🏆', 'Badges Earned', stats.badges, 'From badges table', '#F59E0B'],
          ].map(([icon, l, v, sub, c], i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                borderRadius: 18,
                padding: '20px 22px',
                border: '1.5px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: c,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: c + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}
                >
                  {icon}
                </div>
                <div
                  style={{
                    fontSize: '.7rem',
                    fontWeight: 700,
                    color: 'var(--ink3)',
                    letterSpacing: '.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  {l}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: statsLoading ? 'var(--ink3)' : 'var(--ink)',
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {statsLoading ? '...' : v}
              </div>
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--green)' }}>
                {sub}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Bar chart */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--sh)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                }}
              >
                🎮 Game Popularity
              </div>
              <div
                style={{
                  fontSize: '.68rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 100,
                  background: 'var(--blue-bg)',
                  color: 'var(--blue)',
                }}
              >
                This Month
              </div>
            </div>
            <div
              style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {GAMES.map(([name, pct, val], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: '.75rem',
                      fontWeight: 600,
                      color: 'var(--ink2)',
                      width: 130,
                      flexShrink: 0,
                    }}
                  >
                    {name}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      borderRadius: 100,
                      background: 'var(--bg3)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 100,
                        background: `linear-gradient(90deg,hsl(${220 + i * 30},80%,55%),hsl(${250 + i * 30},70%,60%))`,
                        width: `${pct}%`,
                        transition: 'width 1s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '.72rem',
                      fontWeight: 700,
                      color: 'var(--ink3)',
                      width: 36,
                      textAlign: 'right',
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Activity feed */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--sh)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                }}
              >
                ⚡ Recent Activity
              </div>
              <div
                style={{
                  fontSize: '.68rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 100,
                  background: 'var(--green-bg)',
                  color: 'var(--green)',
                }}
              >
                Live
              </div>
            </div>
            <div style={{ padding: '0 20px' }}>
              {ACTIVITY.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '11px 0',
                    borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: a.c,
                      flexShrink: 0,
                      marginTop: 5,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: '.8rem',
                        color: 'var(--ink2)',
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}
                    >
                      {a.t}
                    </div>
                    <div style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 500 }}>
                      {a.when}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Table */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--sh)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--ink)',
              }}
            >
              📄 Top Content
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Page', 'Views', 'Avg Time', 'Trend'].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: '.68rem',
                        fontWeight: 700,
                        color: 'var(--ink3)',
                        letterSpacing: '.5px',
                        textTransform: 'uppercase',
                        padding: '8px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Scripture Trivia Game', '4,218', '6:42', '+22%'],
                  ['AI Devotional Generator', '3,105', '4:18', '+35%'],
                  ['Prayer Wall', '2,890', '3:55', '+12%'],
                  ['Interactive Bible Map', '2,340', '5:21', '+48%'],
                  ['Memory Flashcards', '1,980', '7:10', 'Steady'],
                ].map(([p, v, t, tr], i) => (
                  <tr
                    key={i}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td
                      style={{
                        fontSize: '.8rem',
                        padding: '11px 16px',
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--ink2)',
                        fontWeight: 500,
                      }}
                    >
                      {p}
                    </td>
                    <td
                      style={{
                        fontSize: '.8rem',
                        padding: '11px 16px',
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--ink2)',
                        fontWeight: 500,
                      }}
                    >
                      {v}
                    </td>
                    <td
                      style={{
                        fontSize: '.8rem',
                        padding: '11px 16px',
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--ink2)',
                        fontWeight: 500,
                      }}
                    >
                      {t}
                    </td>
                    <td
                      style={{
                        fontSize: '.8rem',
                        padding: '11px 16px',
                        borderBottom: '1px solid var(--border)',
                        fontWeight: 700,
                        color: tr === 'Steady' ? 'var(--orange)' : 'var(--green)',
                      }}
                    >
                      {tr === 'Steady' ? '→ ' + tr : '↑ ' + tr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
