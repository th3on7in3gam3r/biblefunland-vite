import { Link } from 'react-router-dom';
import usePageMetadata from '../../hooks/usePageMetadata';

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const EXPLORE_FEATURES = [
  {
    icon: '📖',
    title: 'Bible Explorer',
    sectionId: 'bible-explorer',
    desc: 'Read, search & bookmark scripture across 100+ translations',
    to: '/explore/bible',
    color: '#10B981',
    tag: 'Essential',
    verse: 'Hebrews 4:12',
    detail: 'KJV · NIV · ESV · 100+ more',
  },
  {
    icon: '🗺️',
    title: 'Bible Map',
    desc: 'Interactive geography — trace the journeys of Moses, Paul & Jesus',
    to: '/explore/map',
    color: '#3B82F6',
    tag: 'Interactive',
    verse: 'Joshua 1:3',
    detail: 'Real GPS coordinates · 9 locations',
    sectionId: 'bible-map',
  },
  {
    icon: '📜',
    title: 'Bible Timeline',
    desc: 'From Creation to Revelation — 6,000 years of sacred history',
    to: '/explore/timeline',
    color: '#8B5CF6',
    tag: 'History',
    verse: 'Ecclesiastes 3:1',
    detail: 'Old & New Testament events',
    sectionId: 'bible-timeline',
  },
  {
    icon: '🔤',
    title: 'Original Languages',
    desc: 'Explore Hebrew & Greek roots of scripture with AI explanations',
    to: '/explore/language-explorer',
    color: '#F59E0B',
    tag: 'Deep Study',
    verse: 'Proverbs 2:6',
    detail: 'Hebrew · Greek · Aramaic',
    sectionId: 'original-languages',
  },
  {
    icon: '🔗',
    title: 'Cross Reference',
    desc: 'Find connected verses across the entire Bible instantly',
    to: '/explore/cross-reference',
    color: '#EC4899',
    tag: 'Study',
    verse: '2 Timothy 3:16',
    detail: 'Thousands of connections',
    sectionId: 'cross-reference',
  },
  {
    icon: '🎙️',
    title: 'Voice Bible Reader',
    desc: 'Read scripture aloud — AI grades your accuracy word by word',
    to: '/explore/voice-reader',
    color: '#0369A1',
    tag: 'Practice',
    verse: 'Psalm 119:11',
    detail: 'Microphone · Word-by-word grading',
    sectionId: 'voice-bible-reader',
  },
  {
    icon: '🌍',
    title: 'Bible Names',
    desc: 'Meanings, origins & stories behind every name in Scripture',
    to: '/names',
    color: '#14B8A6',
    tag: 'Reference',
    verse: 'Isaiah 43:1',
    detail: '3,000+ names explained',
    sectionId: 'bible-names',
  }
];

const STATS = [
  { n: '6', label: 'Study Tools' },
  { n: '100+', label: 'Translations' },
  { n: '6,000', label: 'Years of History' },
  { n: '100%', label: 'Free' },
];

export default function ExploreOverview() {
  usePageMetadata({
    title: 'Explore Hub — Bible Maps, Timeline & Study Tools',
    description: 'Deep dive into Bible history, geography, and scripture study tools.',
  });

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg,#064E3B 0%,#065F46 35%,#0F172A 70%,#1E1B4B 100%)',
          padding: '60px 24px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {[
          ['#34D399', '8%', '5%'],
          ['#60A5FA', '85%', '10%'],
          ['#A78BFA', '5%', '70%'],
          ['#FCD34D', '80%', '72%'],
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
            Bible Study · History · Geography
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
            🔍 Explore
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg,#34D399,#60A5FA,#A78BFA)',
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
            Maps, timelines, original languages, cross-references &amp; more — all rooted in
            Scripture.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 36,
            }}
          >
            <button
              onClick={() => scrollToSection('bible-explorer')}
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
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(16,185,129,.4)',
              }}
            >
              📖 Bible Explorer ↓
            </button>
            <button
              onClick={() => scrollToSection('bible-map')}
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
                cursor: 'pointer',
              }}
            >
              🗺️ Bible Map ↓
            </button>
            <button
              onClick={() => scrollToSection('voice-bible-reader')}
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
                cursor: 'pointer',
              }}
            >
              🎙️ Voice Reader ↓
            </button>
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
        {/* ── Quick Jump Tools ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 24, marginBottom: 24, scrollbarWidth: 'none' }}>
           {EXPLORE_FEATURES.map(f => (
             <button
               key={f.sectionId}
               onClick={() => scrollToSection(f.sectionId)}
               style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: 8,
                 whiteSpace: 'nowrap',
                 padding: '8px 16px',
                 borderRadius: 100,
                 background: 'white',
                 border: '1.5px solid var(--border)',
                 color: 'var(--ink2)',
                 fontSize: '.85rem',
                 fontWeight: 700,
                 cursor: 'pointer',
                 transition: 'all .2s'
               }}
               onMouseEnter={e => {
                 e.currentTarget.style.borderColor = f.color;
                 e.currentTarget.style.color = f.color;
               }}
               onMouseLeave={e => {
                 e.currentTarget.style.borderColor = 'var(--border)';
                 e.currentTarget.style.color = 'var(--ink2)';
               }}
             >
               {f.icon} {f.title}
             </button>
           ))}
        </div>

        {/* ── Feature cards ───────────────────────────────────────────────────── */}
        <div id="explore-filter-section" style={{ marginBottom: 48, scrollMarginTop: 80 }}>
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
              🔍 Study Tools
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
              Everything You Need to Explore Scripture
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
              gap: 20,
            }}
          >
            {EXPLORE_FEATURES.map((f, i) => (
              <Link
                key={i}
                to={f.to}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 22,
                    border: '1.5px solid var(--border)',
                    overflow: 'hidden',
                    transition: 'all .25s',
                    boxShadow: '0 2px 12px rgba(0,0,0,.06)',
                    cursor: 'pointer',
                    height: '100%',
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
                    height: 120,
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
                      width: 100,
                      height: 100,
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
                      fontSize: '3.5rem',
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
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0,0,0,.2)',
                      padding: '4px 14px',
                      fontSize: '.65rem',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,.7)',
                    }}
                  >
                    {f.detail}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '18px 20px 20px' }}>
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
                  <div
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
                      border: 'none',
                      boxShadow: `0 4px 14px ${f.color}40`,
                      transition: 'all .2s',
                    }}
                  >
                    🔍 Open →
                  </div>
                </div>
              </div>
            </Link>
            ))}          </div>
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
            ✝️ The Living Word
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
            "For the word of God is alive and active. Sharper than any double-edged sword."
          </p>
          <div
            style={{
              fontSize: '.84rem',
              fontWeight: 700,
              color: 'rgba(110,231,183,.7)',
              marginBottom: 20,
            }}
          >
            — Hebrews 4:12
          </div>
          <Link
            to="/explore/bible"
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
            📖 Start Reading →
          </Link>
        </div>

        {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 10,
            }}
          >
            Ready to go deeper? Try our AI tools and games too.
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
              to="/play"
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
              🎮 Play →
            </Link>
            <Link
              to="/grow"
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
              🌱 Grow →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
