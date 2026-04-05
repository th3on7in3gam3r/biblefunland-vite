import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePageMetadata from '../../hooks/usePageMetadata';

const AI_TOOLS = [
  {
    icon: '🙏',
    title: 'AI Devotional',
    desc: 'Get a personalized devotional in seconds — tailored to your mood, season, or scripture topic.',
    path: '/ai/devotional',
    color: '#8B5CF6',
    bg: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
    tag: 'Most Popular',
    tagColor: '#8B5CF6',
  },
  {
    icon: '💬',
    title: 'Bible Character Chat',
    desc: 'Have a real conversation with Moses, David, Paul, Mary, and more — powered by AI.',
    path: '/ai/chat/characters',
    color: '#EC4899',
    bg: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)',
    tag: 'Kids Love This',
    tagColor: '#EC4899',
  },
  {
    icon: '🎵',
    title: 'Bible Rap Generator',
    desc: 'Turn any scripture into a rap, gospel song, or worship lyric. Great for memorization.',
    path: '/ai/rap-generator',
    color: '#F97316',
    bg: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)',
    tag: 'Creative',
    tagColor: '#F97316',
  },
  {
    icon: '🖼️',
    title: 'Miracle Art Generator',
    desc: 'Describe a Bible scene and get beautiful AI art prompts to bring Scripture to life.',
    path: '/ai/miracle-art',
    color: '#14B8A6',
    bg: 'linear-gradient(135deg,#F0FDFA,#CCFBF1)',
    tag: 'Visual',
    tagColor: '#14B8A6',
  },
];

export default function AIOverview() {
  usePageMetadata({
    title: 'AI Fun — BibleFunLand',
    description: 'AI-powered Bible tools: devotionals, character chat, rap generator, and miracle art.',
  });

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#0F172A 100%)',
        padding: '64px 24px 52px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {[['#8B5CF6','10%','15%'],['#EC4899','85%','25%'],['#F97316','50%','75%']].map(([c,l,t],i) => (
          <div key={i} style={{
            position: 'absolute', width: 280, height: 280, borderRadius: '50%',
            background: `radial-gradient(circle,${c}20 0%,transparent 70%)`,
            left: l, top: t, pointerEvents: 'none',
          }} />
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{ fontSize: '3.2rem', marginBottom: 12, filter: 'drop-shadow(0 4px 16px rgba(139,92,246,0.5))' }}>🤖</div>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800,
            fontSize: 'clamp(1.8rem,4.5vw,3rem)',
            background: 'linear-gradient(90deg,#C084FC,#F472B6,#FB923C)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 10,
          }}>
            AI Fun
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: '.95rem',
            maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.7,
          }}>
            Faith-powered AI tools that make Bible learning personal, creative, and unforgettable.
          </p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '.72rem', fontWeight: 800, letterSpacing: '1px',
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

      {/* Tools grid */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 20px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {AI_TOOLS.map((tool, i) => (
            <Link key={tool.path} to={tool.path} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                whileHover={{ y: -6, boxShadow: `0 20px 48px ${tool.color}22` }}
                style={{
                  background: tool.bg,
                  borderRadius: 22,
                  padding: '28px 24px',
                  border: `1.5px solid ${tool.color}20`,
                  display: 'flex', flexDirection: 'column', gap: 14,
                  height: '100%', cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.25s, transform 0.25s',
                }}
              >
                {/* Tag */}
                <span style={{
                  alignSelf: 'flex-start', fontSize: '.65rem', fontWeight: 800,
                  color: tool.tagColor, background: `${tool.color}15`,
                  border: `1px solid ${tool.color}25`,
                  padding: '3px 10px', borderRadius: 100,
                }}>
                  {tool.tag}
                </span>

                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: 18,
                  background: tool.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.7rem',
                  boxShadow: `0 8px 20px ${tool.color}40`,
                }}>
                  {tool.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                    fontSize: '1.15rem', color: '#1E1B4B', marginBottom: 6,
                  }}>
                    {tool.title}
                  </div>
                  <p style={{ fontSize: '.83rem', color: '#6B7280', lineHeight: 1.65, margin: 0 }}>
                    {tool.desc}
                  </p>
                </div>

                <div style={{
                  color: tool.color, fontWeight: 800, fontSize: '.82rem',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  Try it now →
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{
          marginTop: 48, textAlign: 'center',
          padding: '24px', borderRadius: 18,
          background: 'var(--surface)', border: '1.5px solid var(--border)',
        }}>
          <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>✨</div>
          <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--ink)', marginBottom: 4 }}>
            More AI tools coming soon
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--ink3)', margin: 0 }}>
            Drama Scripts, AI Prayer Companion, Bible Study Generator and more are on the way.
          </p>
        </div>
      </div>
    </div>
  );
}
