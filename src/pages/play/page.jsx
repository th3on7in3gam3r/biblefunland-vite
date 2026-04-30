import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStreak } from '../../context/StreakContext';
import { useKidsMode } from '../../context/KidsModeContext';
import Tooltip from '../../components/Tooltip';

// ── All games & activities (nothing removed, enhanced) ────────────────────────
const ALL_GAMES = [
  {
    icon: '❓',
    title: 'Scripture Trivia',
    desc: 'Timed rounds · 3 difficulty levels · Earn badges',
    to: '/play/trivia',
    color: '#3B82F6',
    tag: 'All Ages',
    category: 'Quiz',
    verse: 'Psalm 119:11',
    hot: true,
    anchor: null,
    tooltip: 'Opens Scripture Trivia — test your Bible knowledge!',
  },
  {
    icon: '🏃',
    title: 'Scripture Runner',
    desc: 'Endless runner · Collect Fruits of the Spirit',
    to: '/play/game/runner',
    color: '#10B981',
    tag: 'Kids Fav',
    category: 'Action',
    verse: 'Hebrews 12:1',
    hot: true,
    anchor: null,
    tooltip: 'Opens Scripture Runner — an endless faith adventure!',
  },
  {
    icon: '🏹',
    title: 'David & Goliath',
    desc: 'Sling stones of faith · 5 epic levels',
    to: '/play/game/david-goliath',
    color: '#EC4899',
    tag: 'Action',
    category: 'Action',
    verse: '1 Samuel 17:45',
    anchor: null,
    tooltip: 'Opens David & Goliath — sling stones of faith!',
  },
  {
    icon: '🎰',
    title: 'Spin the Verse',
    desc: 'Match 3 themes = jackpot devotional',
    to: '/play/game/spin-the-verse',
    color: '#8B5CF6',
    tag: 'Daily',
    category: 'Casual',
    verse: 'Proverbs 3:5',
    anchor: null,
    tooltip: 'Opens Spin the Verse — match themes for a devotional!',
  },
  {
    icon: '🧩',
    title: 'Parable Escape Room',
    desc: "Solve riddles from the whale & lion's den",
    to: '/play/game/escape-room',
    color: '#F97316',
    tag: 'Puzzle',
    category: 'Puzzle',
    verse: 'Matthew 13:34',
    anchor: null,
    tooltip: 'Opens Parable Escape Room — solve Bible riddles!',
  },
  {
    icon: '🧠',
    title: 'Flashcards',
    desc: 'Memorize scripture with 3D flip cards',
    to: '/play/flashcards',
    color: '#6366F1',
    tag: 'Memory',
    category: 'Study',
    verse: 'Deuteronomy 6:6',
    anchor: null,
    tooltip: 'Opens Flashcards — memorize scripture with flip cards!',
  },
  {
    icon: '�️',
    title: 'Activity Sheets',
    desc: 'Printable word search, coloring & more',
    to: '/play/activity-sheets',
    color: '#14B8A6',
    tag: 'Print',
    category: 'Printable',
    verse: 'Proverbs 22:6',
    anchor: null,
    tooltip: 'Opens printable Bible activity sheets — scroll down to browse & print!',
  },
  {
    icon: '📅',
    title: 'Daily Challenge',
    desc: 'New scramble or riddle every 24 hours',
    to: '/play/challenge',
    color: '#F59E0B',
    tag: 'Daily',
    category: 'Quiz',
    verse: 'Lamentations 3:23',
    anchor: null,
    tooltip: "Opens today's Daily Challenge — new every 24 hours!",
  },
];

const CATEGORIES = ['All', 'Action', 'Quiz', 'Puzzle', 'Study', 'Casual', 'Printable'];

const STATS = [
  { n: '8+', label: 'Games' },
  { n: '10K+', label: 'Players' },
  { n: '3', label: 'Difficulty Levels' },
  { n: '100%', label: 'Free' },
];

export default function PlayOverview() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { streak } = useStreak();
  const { kidsMode } = useKidsMode();

  const filtered =
    activeCategory === 'All' ? ALL_GAMES : ALL_GAMES.filter((g) => g.category === activeCategory);

  const featured = ALL_GAMES.filter((g) => g.hot);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg,#1E1B4B 0%,#312E81 40%,#0F172A 70%,#064E3B 100%)',
          padding: '60px 24px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Blobs */}
        {[
          ['#60A5FA', '8%', '5%'],
          ['#34D399', '85%', '15%'],
          ['#F472B6', '5%', '75%'],
          ['#FCD34D', '80%', '70%'],
        ].map(([c, l, t], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 200 + i * 60,
              height: 200 + i * 60,
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
              background: 'rgba(99,102,241,.2)',
              color: '#A5B4FC',
              border: '1px solid rgba(99,102,241,.3)',
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
                background: '#4ADE80',
                boxShadow: '0 0 8px #4ADE80',
                display: 'inline-block',
              }}
            />
            Bible Games · Faith-Powered Fun
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
            🎮 Play &amp; Learn
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg,#60A5FA,#C084FC,#F472B6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              God's Word
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
            Games, trivia, escape rooms, flashcards &amp; printables — all rooted in Scripture.
            Completely free.
          </p>

          {/* Quick CTA */}
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
              to="/play/trivia"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 14,
                background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                color: 'white',
                fontWeight: 800,
                fontSize: '.9rem',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(99,102,241,.4)',
              }}
            >
              ❓ Play Trivia
            </Link>
            <Link
              to="/play/game/runner"
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
              🏃 Scripture Runner
            </Link>
          </div>

          {/* Stats */}
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

      {/* ── Streak nudge ─────────────────────────────────────────────────────── */}
      {streak > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg,#1C1305,#2D1E00)',
            padding: '12px 24px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>🔥</span>
          <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#FCD34D' }}>
            You're on a {streak}-day streak! Keep it going — play a game today.
          </span>
          <Link
            to="/play/trivia"
            style={{
              fontSize: '.75rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 8,
              background: 'rgba(252,211,77,.15)',
              color: '#FCD34D',
              textDecoration: 'none',
              border: '1px solid rgba(252,211,77,.2)',
            }}
          >
            Play Now →
          </Link>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px' }}>
        {/* ── Featured spotlight ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '.68rem',
                  fontWeight: 800,
                  letterSpacing: '.5px',
                  textTransform: 'uppercase',
                  padding: '4px 12px',
                  borderRadius: 100,
                  background: '#FEF3C7',
                  color: '#D97706',
                  marginBottom: 8,
                }}
              >
                ⭐ Featured
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
                Most Popular Right Now
              </h2>
            </div>
            <Link
              to="/play/trivia"
              style={{
                fontSize: '.8rem',
                fontWeight: 700,
                color: 'var(--blue)',
                textDecoration: 'none',
              }}
            >
              See all games →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
              gap: 20,
            }}
          >
            {featured.map((g, i) => (
              <div
                key={i}
                style={{
                  background: `linear-gradient(135deg,${g.color}15,${g.color}05)`,
                  borderRadius: 24,
                  border: `2px solid ${g.color}30`,
                  overflow: 'hidden',
                  transition: 'all .25s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 20px 48px ${g.color}25`;
                  e.currentTarget.style.borderColor = g.color + '60';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = g.color + '30';
                }}
              >
                {/* Hot badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    fontSize: '.6rem',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 99,
                    background: '#EF4444',
                    color: 'white',
                    letterSpacing: 0.5,
                  }}
                >
                  🔥 HOT
                </div>

                <div
                  style={{
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    position: 'relative',
                  }}
                >
                  {g.icon}
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 14,
                      fontSize: '.62rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: 99,
                      background: g.color,
                      color: 'white',
                    }}
                  >
                    {g.tag}
                  </span>
                </div>
                <div style={{ padding: '18px 20px 20px' }}>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      marginBottom: 5,
                    }}
                  >
                    {g.title}
                  </div>
                  <p
                    style={{
                      fontSize: '.8rem',
                      color: 'var(--ink3)',
                      lineHeight: 1.6,
                      marginBottom: 10,
                    }}
                  >
                    {g.desc}
                  </p>
                  <div
                    style={{
                      fontSize: '.68rem',
                      color: g.color,
                      fontWeight: 700,
                      marginBottom: 14,
                      fontStyle: 'italic',
                    }}
                  >
                    📖 {g.verse}
                  </div>
                  <Link
                    to={g.to}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 22px',
                      borderRadius: 12,
                      background: g.color,
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '.85rem',
                      textDecoration: 'none',
                      boxShadow: `0 4px 14px ${g.color}40`,
                      transition: 'all .2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '.88')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    ▶ Play Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Category tabs ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '.68rem',
                  fontWeight: 800,
                  letterSpacing: '.5px',
                  textTransform: 'uppercase',
                  padding: '4px 12px',
                  borderRadius: 100,
                  background: '#EFF6FF',
                  color: '#3B82F6',
                  marginBottom: 8,
                }}
              >
                🎮 All Games
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
                Browse by Category
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 99,
                  fontSize: '.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all .2s',
                  border: activeCategory === cat ? '2px solid #3B82F6' : '2px solid var(--border)',
                  background: activeCategory === cat ? '#EFF6FF' : 'var(--surface)',
                  color: activeCategory === cat ? '#3B82F6' : 'var(--ink2)',
                  boxShadow: activeCategory === cat ? '0 4px 12px rgba(59,130,246,.15)' : 'none',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
              gap: 18,
            }}
          >
            {filtered.map((g, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 20,
                  border: '1.5px solid var(--border)',
                  overflow: 'hidden',
                  transition: 'all .25s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px ${g.color}18`;
                  e.currentTarget.style.borderColor = g.color + '55';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div
                  style={{
                    height: 100,
                    background: `linear-gradient(135deg,${g.color}18,${g.color}06)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    position: 'relative',
                  }}
                >
                  {g.icon}
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontSize: '.62rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 99,
                      background: g.color,
                      color: 'white',
                    }}
                  >
                    {g.tag}
                  </span>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      marginBottom: 4,
                    }}
                  >
                    {g.title}
                  </div>
                  <p
                    style={{
                      fontSize: '.78rem',
                      color: 'var(--ink3)',
                      lineHeight: 1.6,
                      marginBottom: 8,
                    }}
                  >
                    {g.desc}
                  </p>
                  <div
                    style={{
                      fontSize: '.66rem',
                      color: g.color,
                      fontWeight: 600,
                      marginBottom: 12,
                      fontStyle: 'italic',
                    }}
                  >
                    📖 {g.verse}
                  </div>
                  <Tooltip text={g.tooltip} position="top">
                    <Link
                      to={g.to}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 18px',
                        borderRadius: 10,
                        background: g.color,
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '.8rem',
                        textDecoration: 'none',
                        transition: 'all .2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '.85')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      {g.tag === 'Print' ? '🖨️ View Sheets' : '▶ Play Now'}
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
            background: 'linear-gradient(135deg,#0D1B2A,#1E1B4B)',
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
              color: 'rgba(252,211,77,.6)',
              marginBottom: 12,
            }}
          >
            ✝️ Scripture of the Day
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
            "Your word is a lamp for my feet, a light on my path."
          </p>
          <div
            style={{
              fontSize: '.84rem',
              fontWeight: 700,
              color: 'rgba(165,180,252,.7)',
              marginBottom: 20,
            }}
          >
            — Psalm 119:105
          </div>
          <Link
            to="/explore/bible"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 22px',
              borderRadius: 12,
              background: 'rgba(99,102,241,.2)',
              color: '#A5B4FC',
              fontWeight: 700,
              fontSize: '.82rem',
              textDecoration: 'none',
              border: '1px solid rgba(99,102,241,.3)',
            }}
          >
            📖 Read the Bible →
          </Link>
        </div>

        {/* ── Kids section ────────────────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
            borderRadius: 24,
            border: '2px solid #FDE68A',
            padding: '32px 28px',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: '2.5rem' }}>🐣</div>
            <div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#92400E',
                }}
              >
                Little Learners Corner
              </div>
              <div style={{ fontSize: '.8rem', color: '#B45309', fontWeight: 500 }}>
                Ages 3–8 · Safe · Fun · Faith-filled
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: '🔤 Bible Alphabet', to: '/kids/alphabet' },
              { label: '🔢 Bible Numbers', to: '/kids/numbers' },
              { label: '🐾 Bible Animals', to: '/kids/animals' },
              { label: "🔷 God's Shapes", to: '/kids/shapes' },
              { label: '📚 Kids Stories', to: '/kids-stories' },

              { label: '🎨 Coloring Pages', to: '/kids/coloring' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  borderRadius: 12,
                  background: 'white',
                  color: '#92400E',
                  fontWeight: 700,
                  fontSize: '.8rem',
                  textDecoration: 'none',
                  border: '1.5px solid #FDE68A',
                  transition: 'all .2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEF3C7';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = '';
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 8,
            }}
          >
            Want more? Explore AI tools, Bible study, and community features.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/ai"
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
                color: 'white',
                fontWeight: 700,
                fontSize: '.85rem',
                textDecoration: 'none',
              }}
            >
              🤖 AI Fun →
            </Link>
            <Link
              to="/explore"
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                background: 'var(--surface)',
                color: 'var(--ink2)',
                fontWeight: 700,
                fontSize: '.85rem',
                textDecoration: 'none',
                border: '1.5px solid var(--border)',
              }}
            >
              🔍 Explore →
            </Link>
            <Link
              to="/community"
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                background: 'var(--surface)',
                color: 'var(--ink2)',
                fontWeight: 700,
                fontSize: '.85rem',
                textDecoration: 'none',
                border: '1.5px solid var(--border)',
              }}
            >
              🌐 Community →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
