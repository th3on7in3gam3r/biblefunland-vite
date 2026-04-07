import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BibleLoader } from '../../components/Skeleton';
import usePageMetadata from '../../hooks/usePageMetadata';

const GROW_FEATURES = [
  {
    icon: '🎓',
    title: 'Bible Certification',
    desc: 'Complete structured courses and earn a real Bible certification you can share and be proud of.',
    path: '/grow/certification',
    color: '#F59E0B',
    bg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
    tag: 'Earn a Certificate',
    tagColor: '#D97706',
  },
  {
    icon: '📅',
    title: 'Reading Plan',
    desc: 'Follow a structured daily Bible reading schedule — from Genesis to Revelation or topical plans.',
    path: '/grow/reading-plan',
    color: '#3B82F6',
    bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
    tag: 'Daily Habit',
    tagColor: '#2563EB',
  },
  {
    icon: '📿',
    title: 'Faith Milestones',
    desc: 'Track your spiritual journey — baptism, first Bible read, memory verses, and personal goals.',
    path: '/grow/faith-milestones',
    color: '#10B981',
    bg: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)',
    tag: 'Track Progress',
    tagColor: '#059669',
  },
  {
    icon: '🌳',
    title: 'Bible Family Tree',
    desc: 'Explore the genealogy of Jesus and the great families of Scripture in an interactive tree.',
    path: '/grow/family-tree',
    color: '#8B5CF6',
    bg: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
    tag: 'Interactive',
    tagColor: '#7C3AED',
  },
  {
    icon: '🎵',
    title: 'Worship Discovery',
    desc: 'Find worship music matched to your mood, season, or scripture — curated for families.',
    path: '/grow/worship',
    color: '#EC4899',
    bg: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)',
    tag: 'Music & Worship',
    tagColor: '#DB2777',
  },
];

const STATS = [
  { value: '5', label: 'Growth Tools' },
  { value: '12+', label: 'Reading Plans' },
  { value: '50+', label: 'Milestones' },
  { value: '100%', label: 'Faith-Focused' },
];

export default function GrowOverview() {
  usePageMetadata({
    title: 'Grow — BibleFunLand',
    description: 'Grow your faith with Bible certification, reading plans, milestones, and worship discovery.',
  });
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 400); return () => clearTimeout(t); }, []);
  if (!ready) return <BibleLoader message="Growing in faith..." />;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#064E3B 0%,#065F46 40%,#0F172A 100%)',
        padding: '64px 24px 52px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {[['#10B981','8%','20%'],['#34D399','88%','30%'],['#6EE7B7','45%','80%']].map(([c,l,t],i) => (
          <div key={i} style={{
            position: 'absolute', width: 280, height: 280, borderRadius: '50%',
            background: `radial-gradient(circle,${c}18 0%,transparent 70%)`,
            left: l, top: t, pointerEvents: 'none',
          }} />
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{ fontSize: '3.2rem', marginBottom: 12, filter: 'drop-shadow(0 4px 16px rgba(16,185,129,0.5))' }}>🌱</div>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800,
            fontSize: 'clamp(1.8rem,4.5vw,3rem)',
            background: 'linear-gradient(90deg,#34D399,#6EE7B7,#A7F3D0)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 10,
          }}>
            Grow in Faith
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: '.95rem',
            maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.7,
          }}>
            Deepen your walk with God through structured learning, milestones, and worship — at your own pace.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 24, justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: 20,
          }}>
            {STATS.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                  fontSize: '1.5rem', color: '#34D399', lineHeight: 1,
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: '.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2,
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '.72rem', fontWeight: 800, letterSpacing: '1px',
            textTransform: 'uppercase', color: '#34D399',
            background: 'rgba(52,211,153,0.12)',
            border: '1px solid rgba(52,211,153,0.25)',
            padding: '5px 14px', borderRadius: 100,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80', display: 'inline-block' }} />
            Pro Feature — Included in your plan
          </span>
        </motion.div>
      </div>

      {/* Features grid */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 20px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {GROW_FEATURES.map((feat, i) => (
            <Link key={feat.path} to={feat.path} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                whileHover={{ y: -6, boxShadow: `0 20px 48px ${feat.color}22` }}
                style={{
                  background: feat.bg,
                  borderRadius: 22,
                  padding: '28px 24px',
                  border: `1.5px solid ${feat.color}20`,
                  display: 'flex', flexDirection: 'column', gap: 14,
                  height: '100%', cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.25s, transform 0.25s',
                }}
              >
                {/* Tag */}
                <span style={{
                  alignSelf: 'flex-start', fontSize: '.65rem', fontWeight: 800,
                  color: feat.tagColor, background: `${feat.color}15`,
                  border: `1px solid ${feat.color}25`,
                  padding: '3px 10px', borderRadius: 100,
                }}>
                  {feat.tag}
                </span>

                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: 18,
                  background: feat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.7rem',
                  boxShadow: `0 8px 20px ${feat.color}40`,
                }}>
                  {feat.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                    fontSize: '1.15rem', color: '#1E1B4B', marginBottom: 6,
                  }}>
                    {feat.title}
                  </div>
                  <p style={{ fontSize: '.83rem', color: '#6B7280', lineHeight: 1.65, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>

                <div style={{
                  color: feat.color, fontWeight: 800, fontSize: '.82rem',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  Start now →
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Encouragement banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            marginTop: 48,
            background: 'linear-gradient(135deg,#064E3B,#065F46)',
            borderRadius: 22, padding: '32px 28px',
            textAlign: 'center', border: '1.5px solid rgba(52,211,153,0.2)',
            boxShadow: '0 8px 32px rgba(16,185,129,0.15)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>📖</div>
          <div style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800,
            fontSize: '1.2rem', color: 'white', marginBottom: 8,
          }}>
            "Grow in the grace and knowledge of our Lord"
          </div>
          <p style={{
            fontSize: '.8rem', color: 'rgba(255,255,255,0.45)',
            margin: '0 auto 20px', maxWidth: 360, lineHeight: 1.6,
          }}>
            2 Peter 3:18 — Every tool here is designed to help you and your family grow deeper in faith.
          </p>
          <Link to="/grow/certification" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '11px 24px', borderRadius: 12,
            background: '#10B981', color: 'white',
            fontWeight: 800, fontSize: '.88rem', textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(16,185,129,0.4)',
          }}>
            🎓 Start Certification →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
