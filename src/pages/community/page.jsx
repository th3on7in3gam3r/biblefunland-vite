import { Link } from 'react-router-dom';
import usePageMetadata from '../../hooks/usePageMetadata';
import { useRealTime } from '../../context/RealTimeContext';
import Tooltip from '../../components/Tooltip';

const COMMUNITY_FEATURES = [
  {
    icon: '🙏',
    title: 'Prayer Wall',
    desc: 'Post and pray for real community requests — updated live',
    path: '/community/prayer',
    color: '#10B981',
    tag: 'Live',
    verse: 'Matthew 18:20',
    tooltip: 'Opens the live Prayer Wall ↓',
  },
  {
    icon: '🤝',
    title: 'Prayer Partner',
    desc: 'Get matched with a prayer buddy for weekly intercession',
    path: '/community/prayer-partner',
    color: '#3B82F6',
    tag: 'Connect',
    verse: 'Ecclesiastes 4:9',
    tooltip: 'Find a prayer partner ↓',
  },
  {
    icon: '📿',
    title: 'Prayer Beads',
    desc: 'Focused digital prayer practice — guided & meditative',
    path: '/community/prayer-beads',
    color: '#8B5CF6',
    tag: 'Devotion',
    verse: '1 Thessalonians 5:17',
    tooltip: 'Opens digital prayer beads ↓',
  },
  {
    icon: '💬',
    title: 'Chat Rooms',
    desc: '6 rooms — Family, Youth, Worship, Prayer & more',
    path: '/community/chat',
    color: '#EC4899',
    tag: 'Chat',
    verse: 'Proverbs 27:17',
    tooltip: 'Opens community chat rooms ↓',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Family Groups',
    desc: 'Private family discussion rooms with shared challenges',
    path: '/community/family',
    color: '#F59E0B',
    tag: 'Family',
    verse: 'Joshua 24:15',
    tooltip: 'Opens family group rooms ↓',
  },
  {
    icon: '⛪',
    title: 'Church Events',
    desc: 'Local services, VBS, and faith community activities',
    path: '/community/events',
    color: '#14B8A6',
    tag: 'Events',
    verse: 'Hebrews 10:25',
    tooltip: 'Browse church events ↓',
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    desc: 'Top streaks, badges & trivia champions across the community',
    path: '/community/leaderboard',
    color: '#F97316',
    tag: 'Compete',
    verse: 'Philippians 3:14',
    tooltip: 'Opens the leaderboard ↓',
  },
];

const STATS = [
  { n: '10K+', label: 'Members' },
  { n: '7', label: 'Features' },
  { n: '40+', label: 'Countries' },
  { n: '100%', label: 'Moderated' },
];

export default function CommunityOverview() {
  usePageMetadata({
    title: 'Community Hub — Prayer, Chat & Family Groups',
    description: 'Connect with prayer, family groups, events, and community tools.',
  });
  const { prayers } = useRealTime();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg,#064E3B 0%,#065F46 30%,#0F172A 65%,#1E1B4B 100%)',
          padding: '60px 24px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {[
          ['#34D399', '8%', '5%'],
          ['#60A5FA', '85%', '10%'],
          ['#F472B6', '5%', '72%'],
          ['#FCD34D', '80%', '70%'],
        ].map(([c, l, t], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 180 + i * 60,
              height: 180 + i * 60,
              borderRadius: '50%',
              background: `radial-gradient(circle,${c}18 0%,transparent 70%)`,
              left: l,
              top: t,
              pointerEvents: 'none',
            }}
          />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '.7rem',
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              background: 'rgba(16,185,129,.2)',
              color: '#6EE7B7',
              border: '1px solid rgba(16,185,129,.3)',
              padding: '5px 16px',
              borderRadius: 100,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#34D399',
                boxShadow: '0 0 8px #34D399',
                display: 'inline-block',
              }}
            />
            Prayer · Chat · Family · Leaderboard
          </div>
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(2.2rem,6vw,4rem)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.05,
              marginBottom: 14,
            }}
          >
            🌐 Community
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg,#34D399,#60A5FA,#F472B6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              You're Not Alone
            </span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(.9rem,2vw,1.05rem)',
              color: 'rgba(255,255,255,.6)',
              fontWeight: 500,
              lineHeight: 1.75,
              marginBottom: 28,
              maxWidth: 480,
              margin: '0 auto 28px',
            }}
          >
            Real-time prayer, family groups, chat rooms, leaderboards &amp; church events — all in
            one place.
          </p>

          {/* Live prayer count */}
          {prayers?.live && prayers.total > 0 && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(16,185,129,.15)',
                border: '1px solid rgba(16,185,129,.3)',
                borderRadius: 100,
                padding: '6px 16px',
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#34D399',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#34D399' }}>
                {prayers.total} prayers active right now
              </span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 36,
            }}
          >
            <Link
              to="/community/prayer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 14,
                background: 'linear-gradient(135deg,#10B981,#34D399)',
                color: 'white',
                fontWeight: 800,
                fontSize: '.9rem',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(16,185,129,.4)',
              }}
            >
              🙏 Prayer Wall
            </Link>
            <Link
              to="/community/chat"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 14,
                background: 'rgba(255,255,255,.1)',
                color: 'white',
                fontWeight: 700,
                fontSize: '.9rem',
                textDecoration: 'none',
                border: '1.5px solid rgba(255,255,255,.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              💬 Chat Rooms
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 28,
              justifyContent: 'center',
              flexWrap: 'wrap',
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,.08)',
            }}
          >
            {STATS.map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'white',
                    lineHeight: 1,
                  }}
                >
                  {n}
                </div>
                <div
                  style={{
                    fontSize: '.65rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,.4)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginTop: 3,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px' }}>
        {/* ── Feature cards ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '.68rem',
                fontWeight: 800,
                letterSpacing: '.5px',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: 100,
                background: '#ECFDF5',
                color: '#10B981',
                marginBottom: 10,
              }}
            >
              🌐 Community Features
            </div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: 'clamp(1.3rem,3vw,1.8rem)',
                fontWeight: 800,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              Connect, Pray &amp; Grow Together
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
              gap: 20,
            }}
          >
            {COMMUNITY_FEATURES.map((f, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 22,
                  border: '1.5px solid var(--border)',
                  overflow: 'hidden',
                  transition: 'all .25s',
                  boxShadow: '0 2px 12px rgba(0,0,0,.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 20px 48px ${f.color}20`;
                  e.currentTarget.style.borderColor = f.color + '55';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {/* Banner */}
                <div
                  style={{
                    height: 110,
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg,${f.color}dd,${f.color}88)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,.08)',
                      top: -20,
                      right: -20,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      fontSize: '5rem',
                      opacity: 0.07,
                      userSelect: 'none',
                    }}
                  >
                    ✝
                  </div>
                  <div
                    style={{
                      fontSize: '3rem',
                      position: 'relative',
                      zIndex: 1,
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.25))',
                    }}
                  >
                    {f.icon}
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 12,
                      fontSize: '.6rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: 99,
                      background: 'rgba(255,255,255,.2)',
                      color: 'white',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,.25)',
                    }}
                  >
                    {f.tag}
                  </span>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 20px 20px' }}>
                  <div
                    style={{
                      fontSize: '.66rem',
                      color: f.color,
                      fontWeight: 700,
                      marginBottom: 6,
                      fontStyle: 'italic',
                    }}
                  >
                    📖 {f.verse}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      marginBottom: 6,
                    }}
                  >
                    {f.title}
                  </div>
                  <p
                    style={{
                      fontSize: '.8rem',
                      color: 'var(--ink3)',
                      lineHeight: 1.6,
                      marginBottom: 14,
                    }}
                  >
                    {f.desc}
                  </p>
                  <Tooltip text={f.tooltip} position="top">
                    <Link
                      to={f.path}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '9px 20px',
                        borderRadius: 11,
                        background: `linear-gradient(135deg,${f.color},${f.color}cc)`,
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '.82rem',
                        textDecoration: 'none',
                        boxShadow: `0 4px 14px ${f.color}40`,
                        transition: 'all .2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '.88')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      → Join
                    </Link>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scripture banner ────────────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg,#064E3B,#065F46,#0F172A)',
            borderRadius: 24,
            padding: '36px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              fontSize: '8rem',
              opacity: 0.04,
              fontFamily: 'Georgia,serif',
            }}
          >
            "
          </div>
          <div
            style={{
              fontSize: '.68rem',
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'rgba(110,231,183,.6)',
              marginBottom: 12,
            }}
          >
            ✝️ Together in Faith
          </div>
          <p
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1rem,2.5vw,1.3rem)',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.6,
              fontStyle: 'italic',
              marginBottom: 10,
              maxWidth: 600,
              margin: '0 auto 10px',
            }}
          >
            "For where two or three gather in my name, there am I with them."
          </p>
          <div
            style={{
              fontSize: '.84rem',
              fontWeight: 700,
              color: 'rgba(110,231,183,.7)',
              marginBottom: 20,
            }}
          >
            — Matthew 18:20
          </div>
          <Link
            to="/community/prayer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 22px',
              borderRadius: 12,
              background: 'rgba(16,185,129,.2)',
              color: '#6EE7B7',
              fontWeight: 700,
              fontSize: '.82rem',
              textDecoration: 'none',
              border: '1px solid rgba(16,185,129,.3)',
            }}
          >
            🙏 Go to Prayer Wall →
          </Link>
        </div>

        {/* ── Safety note ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg,#1E1B4B,#0F172A)',
            borderRadius: 18,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: '1.8rem' }}>🛡️</div>
          <div>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '.95rem',
                fontWeight: 800,
                color: 'white',
                marginBottom: 3,
              }}
            >
              Moderated Community for Families
            </div>
            <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>
              All content is rooted in Scripture. Prayer Wall &amp; Chat are moderated for child
              safety.
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}`}</style>
    </div>
  );
}
