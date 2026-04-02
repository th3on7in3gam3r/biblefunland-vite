import { Link } from 'react-router-dom';
import usePageMetadata from '../../hooks/usePageMetadata';
import { useAuth } from '../../context/AuthContext';
import Tooltip from '../../components/Tooltip';

const FEATURES = [
  {
    icon: '🏠',
    title: 'Parent Hub',
    desc: 'Family dashboard — child profiles, streaks, badges & weekly email digest',
    path: '/parents/parent-hub',
    color: '#10B981',
    tag: 'Dashboard',
    verse: 'Proverbs 22:6',
    tooltip: 'Opens your family dashboard ↓',
    tags: ['👶 Child Profiles', '📊 Progress', '📧 Email Digest'],
  },
  {
    icon: '📋',
    title: 'Parent & Teacher Resources',
    desc: 'AI lesson plans, Sunday school tools, classroom assignments & reading plans',
    path: '/parents/parents-teachers',
    color: '#3B82F6',
    tag: 'Teaching',
    verse: 'Deuteronomy 6:7',
    tooltip: 'Opens teaching resources ↓',
    tags: ['📋 Lesson Plans', '🎓 Classroom', '📅 Reading Plans'],
  },
  {
    icon: '🔒',
    title: 'Parental Controls',
    desc: 'PIN lock for Kids Mode, content filters, per-child settings & usage time limits',
    path: '/parents/controls',
    color: '#8B5CF6',
    tag: 'Safety',
    verse: 'Psalm 127:3',
    tooltip: 'Opens parental controls ↓',
    tags: ['🔒 PIN Lock', '🚫 Filters', '⏱️ Time Limits'],
  },
  {
    icon: '📊',
    title: 'Family Progress',
    desc: 'Shared milestones, challenge tracking & detailed activity reports — Pro feature',
    path: '/parents/progress',
    color: '#F59E0B',
    tag: '💎 Pro',
    verse: 'Philippians 1:6',
    tooltip: 'Opens family progress (Pro) ↓',
    tags: ['🏆 Milestones', '📈 Reports', '🎯 Challenges'],
    pro: true,
  },
];

const STATS = [
  { n: '4', label: 'Tools' },
  { n: '100%', label: 'Safe' },
  { n: 'PIN', label: 'Protected' },
  { n: 'Free', label: 'Core Features' },
];

export default function ParentsOverview() {
  usePageMetadata({
    title: 'Parents & Teachers Hub — Child Profiles, Controls & Lesson Plans',
    description:
      'Parent and teacher resources, controls, and class tools for safe spiritual growth.',
  });
  const { user, profile } = useAuth();
  const role = profile?.role?.toLowerCase() || '';
  const isTeacher = role === 'teacher';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg,#064E3B 0%,#065F46 30%,#1E1B4B 70%,#0F172A 100%)',
          padding: '60px 24px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {[
          ['#34D399', '8%', '5%'],
          ['#A78BFA', '85%', '10%'],
          ['#FCD34D', '5%', '72%'],
          ['#60A5FA', '80%', '70%'],
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
            {isTeacher ? 'Teacher Tools' : 'Parents & Teachers Hub'}
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
            🏫 {isTeacher ? 'Classroom' : 'Family'}
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg,#34D399,#A78BFA,#FCD34D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Faith Tools
            </span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(.9rem,2vw,1.05rem)',
              color: 'rgba(255,255,255,.6)',
              fontWeight: 500,
              lineHeight: 1.75,
              marginBottom: 28,
              maxWidth: 500,
              margin: '0 auto 28px',
            }}
          >
            {isTeacher
              ? 'AI lesson plans, classroom tools, reading plans & student progress tracking.'
              : 'Child profiles, parental controls, lesson plans, progress tracking & family challenges.'}
          </p>

          {/* Auth nudge for guests */}
          {!user && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(251,191,36,.12)',
                border: '1px solid rgba(251,191,36,.25)',
                borderRadius: 12,
                padding: '10px 18px',
                marginBottom: 28,
              }}
            >
              <span style={{ fontSize: '1rem' }}>🔐</span>
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: '#FCD34D' }}>
                Sign in to access your family dashboard and controls
              </span>
              <Link
                to="/auth"
                style={{
                  fontSize: '.75rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: 8,
                  background: 'rgba(252,211,77,.2)',
                  color: '#FCD34D',
                  textDecoration: 'none',
                  border: '1px solid rgba(252,211,77,.3)',
                }}
              >
                Sign In →
              </Link>
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
              to="/parents/parent-hub"
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
              🏠 Open Hub
            </Link>
            <Link
              to="/parents/controls"
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
              🔒 Controls
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
              🏫 Tools
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
              Everything You Need to Raise Faith
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
              gap: 20,
            }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 22,
                  border: `1.5px solid ${f.pro ? '#F59E0B33' : 'var(--border)'}`,
                  overflow: 'hidden',
                  transition: 'all .25s',
                  boxShadow: '0 2px 12px rgba(0,0,0,.06)',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 20px 48px ${f.color}20`;
                  e.currentTarget.style.borderColor = f.color + '55';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)';
                  e.currentTarget.style.borderColor = f.pro ? '#F59E0B33' : 'var(--border)';
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
                      background: f.pro
                        ? 'linear-gradient(135deg,#F59E0B,#F97316)'
                        : 'rgba(255,255,255,.2)',
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
                      marginBottom: 10,
                    }}
                  >
                    {f.desc}
                  </p>
                  {/* Feature tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {f.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '.62rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 99,
                          background: f.color + '18',
                          color: f.color,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
                      → Open
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
            background: 'linear-gradient(135deg,#064E3B,#1E1B4B,#0F172A)',
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
            ✝️ The Greatest Commission
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
            "Train up a child in the way he should go; even when he is old he will not depart from
            it."
          </p>
          <div
            style={{
              fontSize: '.84rem',
              fontWeight: 700,
              color: 'rgba(110,231,183,.7)',
              marginBottom: 20,
            }}
          >
            — Proverbs 22:6
          </div>
          <Link
            to="/parents/parent-hub"
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
            🏠 Open Parent Hub →
          </Link>
        </div>

        {/* ── Quick links ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
            gap: 12,
          }}
        >
          {[
            {
              icon: '👶',
              label: 'Manage Children',
              to: '/parents/parent-hub',
              color: '#10B981',
              desc: 'Add & view child profiles',
            },
            {
              icon: '📋',
              label: 'Lesson Plans',
              to: '/parents/parents-teachers',
              color: '#3B82F6',
              desc: 'AI-generated',
            },
            {
              icon: '🔒',
              label: 'PIN Controls',
              to: '/parents/controls',
              color: '#8B5CF6',
              desc: 'Safety settings',
            },
            {
              icon: '🏆',
              label: 'Family Challenges',
              to: '/community/family',
              color: '#F59E0B',
              desc: 'Weekly goals',
            },
            {
              icon: '📊',
              label: 'Progress Reports',
              to: '/parents/progress',
              color: '#EC4899',
              desc: 'Pro feature',
            },
            {
              icon: '📧',
              label: 'Email Digest',
              to: '/parents/parent-hub',
              color: '#14B8A6',
              desc: 'Weekly summary',
            },
          ].map(({ icon, label, to, color, desc }) => (
            <Link
              key={label}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                borderRadius: 14,
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                textDecoration: 'none',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color + '55';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = '';
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{icon}</span>
              <div>
                <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {label}
                </div>
                <div style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 500 }}>
                  {desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
