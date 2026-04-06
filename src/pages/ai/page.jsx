import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useKidsMode } from '../../context/KidsModeContext';
import usePageMetadata from '../../hooks/usePageMetadata';

const AI_TOOLS = [
  {
    icon: '📜',
    title: 'My Personal Parable',
    desc: 'Describe your situation and receive an original parable written just for you — in the style of Jesus. Includes reflection questions, a prayer, and an action step.',
    path: '/ai/personal-parable',
    color: '#6D28D9',
    bg: 'linear-gradient(145deg,#F5F3FF,#EDE9FE)',
    tag: '✨ New Feature',
    tagColor: '#6D28D9',
    btnBg: 'linear-gradient(135deg,#6D28D9,#4C1D95)',
    featured: true,
  },
  {
    icon: '🙏',
    title: 'AI Devotional',
    desc: 'Tell it your mood, a verse, or a topic — get a beautiful personalized devotional in seconds.',
    path: '/ai/devotional',
    color: '#8B5CF6',
    bg: 'linear-gradient(145deg,#F5F3FF,#EDE9FE)',
    tag: '⭐ Most Popular',
    tagColor: '#7C3AED',
    btnBg: 'linear-gradient(135deg,#8B5CF6,#6D28D9)',
  },
  {
    icon: '💬',
    title: 'Bible Character Chat',
    desc: 'Have a real conversation with Moses, David, Paul, Mary, or Jesus — powered by AI. Kids absolutely love this.',
    path: '/ai/chat/characters',
    color: '#EC4899',
    bg: 'linear-gradient(145deg,#FDF2F8,#FCE7F3)',
    tag: '🧒 Kids Love This',
    tagColor: '#BE185D',
    btnBg: 'linear-gradient(135deg,#EC4899,#BE185D)',
  },
  {
    icon: '🎵',
    title: 'Bible Rap Generator',
    desc: 'Pick any scripture and watch it transform into a rap, gospel song, or worship lyric. Perfect for memorization.',
    path: '/ai/rap-generator',
    color: '#F97316',
    bg: 'linear-gradient(145deg,#FFF7ED,#FFEDD5)',
    tag: '🎤 Creative',
    tagColor: '#C2410C',
    btnBg: 'linear-gradient(135deg,#F97316,#C2410C)',
  },
  {
    icon: '🖼️',
    title: 'Miracle Art Generator',
    desc: 'Describe any Bible scene — the parting of the Red Sea, the nativity, David and Goliath — and get stunning AI art prompts.',
    path: '/ai/miracle-art',
    color: '#14B8A6',
    bg: 'linear-gradient(145deg,#F0FDFA,#CCFBF1)',
    tag: '🎨 Visual',
    tagColor: '#0F766E',
    btnBg: 'linear-gradient(135deg,#14B8A6,#0F766E)',
  },
];

const COMING_SOON = [
  {
    icon: '🎭',
    title: 'Drama Scripts',
    desc: 'AI-generated Bible drama scripts for church plays, classrooms, and family nights.',
    color: '#A78BFA',
  },
  {
    icon: '🤝',
    title: 'AI Prayer Companion',
    desc: 'A gentle AI that helps you pray — guides you through scripture-based prayer for any situation.',
    color: '#34D399',
  },
  {
    icon: '📖',
    title: 'Bible Story Creator',
    desc: 'Create custom Bible-based stories for your kids — personalized with their name and favorite characters.',
    color: '#FBBF24',
  },
];

export default function AIOverview() {
  usePageMetadata({
    title: 'AI Fun — BibleFunLand',
    description: 'AI-powered Bible tools: devotionals, character chat, rap generator, and miracle art.',
  });
  const { kidsMode } = useKidsMode();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#1E1B4B 0%,#312E81 45%,#0F172A 100%)',
        padding: kidsMode ? '52px 24px 44px' : '60px 24px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow blobs */}
        {[['#8B5CF6','8%','10%',320],['#EC4899','82%','20%',260],['#F97316','48%','72%',200]].map(([c,l,t,s],i) => (
          <div key={i} style={{
            position: 'absolute', width: s, height: s, borderRadius: '50%',
            background: `radial-gradient(circle,${c}22 0%,transparent 70%)`,
            left: l, top: t, pointerEvents: 'none',
          }} />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            style={{
              fontSize: kidsMode ? '4rem' : '3.2rem', marginBottom: 14,
              filter: 'drop-shadow(0 4px 20px rgba(139,92,246,0.6))',
              display: 'inline-block',
            }}
          >
            🤖
          </motion.div>

          <h1 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800,
            fontSize: kidsMode ? 'clamp(2rem,6vw,3.2rem)' : 'clamp(1.8rem,4.5vw,2.8rem)',
            background: 'linear-gradient(90deg,#C084FC,#F472B6,#FB923C)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 12, lineHeight: 1.1,
          }}>
            {kidsMode ? '🌟 AI Fun! 🌟' : 'AI Fun'}
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: kidsMode ? '1rem' : '.95rem',
            maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.75, fontWeight: 500,
          }}>
            {kidsMode
              ? 'Chat with Bible heroes, make rap songs, and create amazing art — all powered by AI! 🎉'
              : 'Faith-powered AI tools that make Bible learning personal, creative, and unforgettable.'}
          </p>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 20, justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: 20,
          }}>
            {[['5', 'Live Tools'],['∞', 'Possibilities'],['100%', 'Faith-Safe']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.4rem', color: '#C084FC', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '.7rem', fontWeight: 800, letterSpacing: '1px',
            textTransform: 'uppercase', color: '#C084FC',
            background: 'rgba(192,132,252,0.12)',
            border: '1px solid rgba(192,132,252,0.25)',
            padding: '5px 14px', borderRadius: 100,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80', display: 'inline-block' }} />
            Pro Feature — Included in your plan
          </span>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* ── Section label ─────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{
            fontSize: '.72rem', fontWeight: 800, letterSpacing: '1px',
            textTransform: 'uppercase', color: '#8B5CF6',
            background: '#F5F3FF', padding: '5px 14px', borderRadius: 100,
          }}>
            Live Now — Try Them Free
          </span>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800,
            fontSize: kidsMode ? '1.8rem' : '1.6rem',
            color: 'var(--ink)', marginTop: 12, marginBottom: 0,
          }}>
            {kidsMode ? 'Pick your adventure! 🚀' : 'Choose your AI tool'}
          </h2>
        </div>

        {/* ── Tool cards ────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: kidsMode ? '1fr' : 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: kidsMode ? 20 : 18,
          marginBottom: 64,
        }}>
          {AI_TOOLS.map((tool, i) => (
            <motion.div
              key={tool.path}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              whileHover={{ y: -6, boxShadow: `0 24px 56px ${tool.color}28` }}
              style={{
                background: tool.bg,
                borderRadius: 22,
                padding: kidsMode ? '28px 24px' : tool.featured ? '30px 26px' : '26px 22px',
                border: `${tool.featured ? '2px' : '1.5px'} solid ${tool.color}${tool.featured ? '40' : '22'}`,
                display: 'flex', flexDirection: 'column', gap: 14,
                cursor: 'pointer',
                boxShadow: tool.featured ? `0 8px 32px ${tool.color}20` : '0 2px 16px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.25s, transform 0.25s',
                gridColumn: tool.featured && !kidsMode ? 'span 2' : 'span 1',
              }}
            >
              {/* Tag */}
              <span style={{
                alignSelf: 'flex-start', fontSize: '.65rem', fontWeight: 800,
                color: tool.tagColor, background: `${tool.color}18`,
                border: `1px solid ${tool.color}28`,
                padding: '3px 10px', borderRadius: 100,
              }}>
                {tool.tag}
              </span>

              {/* Icon */}
              <div style={{
                width: kidsMode ? 68 : 60, height: kidsMode ? 68 : 60,
                borderRadius: 20, background: tool.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: kidsMode ? '2rem' : '1.8rem',
                boxShadow: `0 8px 24px ${tool.color}50`,
              }}>
                {tool.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                  fontSize: kidsMode ? '1.25rem' : '1.1rem',
                  color: '#1E1B4B', marginBottom: 6,
                }}>
                  {tool.title}
                </div>
                <p style={{
                  fontSize: kidsMode ? '.9rem' : '.82rem',
                  color: '#6B7280', lineHeight: 1.65, margin: 0,
                }}>
                  {tool.desc}
                </p>
              </div>

              {/* Button */}
              <Link to={tool.path} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: kidsMode ? '13px 20px' : '10px 18px',
                borderRadius: 12, background: tool.btnBg,
                color: 'white', fontWeight: 800,
                fontSize: kidsMode ? '.95rem' : '.85rem',
                textDecoration: 'none',
                boxShadow: `0 6px 18px ${tool.color}40`,
                transition: 'opacity 0.2s',
              }}>
                {kidsMode ? `Let's Go! →` : 'Try it now →'}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Coming Soon ───────────────────────────────── */}
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <span style={{
            fontSize: '.72rem', fontWeight: 800, letterSpacing: '1px',
            textTransform: 'uppercase', color: '#A78BFA',
            background: '#F5F3FF', padding: '5px 14px', borderRadius: 100,
          }}>
            Coming Soon
          </span>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800,
            fontSize: '1.5rem', color: 'var(--ink)',
            marginTop: 12, marginBottom: 4,
          }}>
            More AI Fun on the way ✨
          </h2>
          <p style={{ fontSize: '.85rem', color: 'var(--ink3)', marginBottom: 28 }}>
            We're building more tools — here's a sneak peek.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}>
          {COMING_SOON.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
              style={{
                background: 'var(--surface)',
                borderRadius: 18, padding: '22px 20px',
                border: `1.5px dashed ${tool.color}40`,
                display: 'flex', flexDirection: 'column', gap: 10,
                opacity: 0.85,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${tool.color}18`,
                border: `1.5px solid ${tool.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                {tool.icon}
              </div>
              <div>
                <div style={{
                  fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                  fontSize: '1rem', color: 'var(--ink)', marginBottom: 4,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {tool.title}
                  <span style={{
                    fontSize: '.6rem', fontWeight: 800, color: tool.color,
                    background: `${tool.color}15`, border: `1px solid ${tool.color}25`,
                    padding: '2px 8px', borderRadius: 99,
                  }}>
                    Soon
                  </span>
                </div>
                <p style={{ fontSize: '.78rem', color: 'var(--ink3)', lineHeight: 1.6, margin: 0 }}>
                  {tool.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
