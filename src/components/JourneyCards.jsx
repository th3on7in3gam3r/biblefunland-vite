/**
 * JourneyCards — "Journey Through Scripture" sticky scroll section
 * 5 warm, faith-themed cards with Framer Motion scroll animations.
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const CARDS = [
  {
    icon: '🌍',
    title: 'Virtual Bible World',
    desc: 'Immerse yourself in 3D Bible lands and stories — walk where Jesus walked.',
    to: '/explore/map',
    color: '#2D6A4F',
    accent: '#52B788',
    bg: 'linear-gradient(135deg,#F0F7F4,#E8F5E9)',
    border: '#A8D5B5',
  },
  {
    icon: '🎙️',
    title: 'Voice Bible Reader',
    desc: "Listen to God's Word beautifully narrated — perfect for families and bedtime.",
    to: '/explore/voice-reader',
    color: '#1B4F72',
    accent: '#5DADE2',
    bg: 'linear-gradient(135deg,#EBF5FB,#E8F4FD)',
    border: '#AED6F1',
  },
  {
    icon: '📜',
    title: 'Bible Timeline',
    desc: 'Explore the full story of Scripture through 6,000 years of sacred history.',
    to: '/explore/timeline',
    color: '#7D6608',
    accent: '#D4AC0D',
    bg: 'linear-gradient(135deg,#FEFDE7,#FEF9E7)',
    border: '#F9E79F',
  },
  {
    icon: '🙏',
    title: 'Prayer Wall',
    desc: 'Share prayers and lift each other up — a moderated, safe space for families.',
    to: '/community/prayer',
    color: '#6C3483',
    accent: '#A569BD',
    bg: 'linear-gradient(135deg,#F5EEF8,#F0E6F6)',
    border: '#D7BDE2',
  },
  {
    icon: '🐣',
    title: 'Kids Mode',
    desc: 'Safe, joyful, faith-building adventures designed just for children.',
    to: '/play',
    color: '#B7410E',
    accent: '#E67E22',
    bg: 'linear-gradient(135deg,#FEF5EC,#FEF0E7)',
    border: '#FAD7A0',
  },
];

function StickyCard({ card, index, total }) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [40, -20]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.96, 1, 0.98]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    prefersReducedMotion ? [1, 1, 1, 1] : [0, 1, 1, 0.8]
  );

  return (
    <motion.div
      ref={ref}
      style={{ y, scale, opacity }}
      whileHover={
        prefersReducedMotion ? {} : { scale: 1.03, y: -6, transition: { duration: 0.25 } }
      }
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 32 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        style={{
          background: card.bg,
          borderRadius: 24,
          border: `2px solid ${card.border}`,
          padding: '32px 28px',
          boxShadow: `0 4px 24px rgba(0,0,0,.06), 0 1px 4px rgba(0,0,0,.04)`,
          transition: 'box-shadow .25s',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = `0 12px 40px ${card.accent}30, 0 4px 16px rgba(0,0,0,.08)`)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,.06), 0 1px 4px rgba(0,0,0,.04)`)
        }
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle,${card.accent}18 0%,transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: '2.8rem',
            marginBottom: 16,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.12))',
          }}
        >
          {card.icon}
        </div>

        {/* Content */}
        <div
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: '1.2rem',
            fontWeight: 800,
            color: card.color,
            marginBottom: 10,
            lineHeight: 1.2,
          }}
        >
          {card.title}
        </div>
        <p
          style={{
            fontSize: '.88rem',
            color: '#5D4E37',
            lineHeight: 1.65,
            fontWeight: 500,
            flex: 1,
            marginBottom: 20,
          }}
        >
          {card.desc}
        </p>

        {/* CTA */}
        <Link
          to={card.to}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 12,
            background: card.accent,
            color: 'white',
            fontWeight: 800,
            fontSize: '.82rem',
            textDecoration: 'none',
            boxShadow: `0 4px 14px ${card.accent}40`,
            transition: 'all .2s',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '.88';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = '';
          }}
        >
          Explore →
        </Link>
      </div>
    </motion.div>
  );
}

export default function JourneyCards() {
  return (
    <section
      style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg,#FDFAF6 0%,#F5EFE6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle parchment texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A96E' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <div
            style={{
              display: 'inline-block',
              fontSize: '.72rem',
              fontWeight: 800,
              letterSpacing: '.5px',
              textTransform: 'uppercase',
              padding: '5px 16px',
              borderRadius: 100,
              background: '#F0E6D3',
              color: '#8B5E3C',
              marginBottom: 14,
              border: '1px solid #D4A96A',
            }}
          >
            ✝️ Journey Through Scripture
          </div>
          <h2
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1.8rem,4vw,2.8rem)',
              fontWeight: 800,
              color: '#3D2B1F',
              marginBottom: 12,
              lineHeight: 1.15,
            }}
          >
            Discover Scripture Explorer
          </h2>
          <p
            style={{
              color: '#7A6652',
              fontSize: '.95rem',
              maxWidth: 520,
              margin: '0 auto',
              lineHeight: 1.7,
              fontWeight: 500,
            }}
          >
            Five beautiful ways to experience God's Word — for every age, every season, every
            family.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {CARDS.map((card, i) => (
            <StickyCard key={card.title} card={card} index={i} total={CARDS.length} />
          ))}
        </div>

        {/* Bottom verse */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginTop: 52,
            padding: '24px 32px',
            background: 'rgba(255,255,255,.6)',
            borderRadius: 18,
            border: '1px solid #E8D5B7',
            backdropFilter: 'blur(8px)',
          }}
        >
          <p
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#5D4037',
              fontStyle: 'italic',
              marginBottom: 6,
            }}
          >
            "Your word is a lamp to my feet and a light to my path."
          </p>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#A0856A' }}>
            — Psalm 119:105
          </div>
        </motion.div>
      </div>
    </section>
  );
}
