import { motion } from 'framer-motion';

/**
 * Option 2 — Full-width BibleFunLand Jr. banner section
 * Drop this between <ParentsSection /> and <NewsletterSignup /> in Home.jsx
 */
export default function BibleFunLandJrBanner() {
  return (
    <section
      style={{
        padding: '72px 24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #c8f7e8 0%, #e8f7ff 35%, #fff8e8 65%, #ffe8f5 100%)',
      }}
    >
      {/* Cloud blobs */}
      <div style={{ position: 'absolute', top: -40, left: -60, width: 300, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -30, right: -40, width: 360, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Floating sparkles */}
      {[
        { emoji: '⭐', left: '5%',  top: '15%', delay: 0 },
        { emoji: '💛', left: '92%', top: '12%', delay: 0.4 },
        { emoji: '💗', left: '8%',  top: '75%', delay: 1.0 },
        { emoji: '✨', left: '88%', top: '70%', delay: 0.7 },
        { emoji: '🌈', left: '50%', top: '5%',  delay: 0.5 },
      ].map((s, i) => (
        <motion.span
          key={i}
          style={{ position: 'absolute', left: s.left, top: s.top, fontSize: '1.6rem', pointerEvents: 'none', userSelect: 'none' }}
          animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }}
          transition={{ duration: 3.5 + i * 0.3, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        >
          {s.emoji}
        </motion.span>
      ))}

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, textAlign: 'center' }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(110,207,176,0.2)', border: '2px solid #6ECFB0',
              color: '#1A6B50', fontWeight: 800, fontSize: '.72rem',
              letterSpacing: 1.5, textTransform: 'uppercase',
              padding: '6px 18px', borderRadius: 100,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6ECFB0', boxShadow: '0 0 8px #6ECFB0', display: 'inline-block' }} />
            New · For Little Ones
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}
          >
            <motion.img
              src="https://jr.biblefunland.com/logo.png"
              alt="BibleFunLand Jr."
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 'min(480px, 85vw)',
                height: 'auto',
                filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.14))',
              }}
            />
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
              fontWeight: 800,
              color: '#1A2E4A',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Have little ones?{' '}
            <span style={{ color: '#FF6B9D' }}>Meet BibleFunLand Jr.!</span>{' '}
            <motion.span
              style={{ display: 'inline-block' }}
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              💛
            </motion.span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: '1.1rem', color: 'rgba(26,46,74,0.65)', fontWeight: 600, maxWidth: 520, lineHeight: 1.7, margin: 0 }}
          >
            Bible stories, games, songs &amp; prayers — designed specifically for toddlers &amp; preschoolers ages 2–7.
            Joyful, safe, and 100% ad-free.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}
          >
            {['📖 12 Bible Stories', '🎮 8 Fun Games', '🎵 Songs & Prayers', '🎨 Coloring Pages', '🚫 No Ads'].map((p) => (
              <span key={p} style={{
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
                border: '2px solid rgba(255,255,255,0.9)',
                color: '#1A2E4A', fontWeight: 700, fontSize: '.8rem',
                padding: '6px 14px', borderRadius: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                {p}
              </span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <motion.a
              href="https://jr.biblefunland.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.07, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 50,
                background: '#6ECFB0', color: 'white',
                fontWeight: 800, fontSize: '1rem', textDecoration: 'none',
                boxShadow: '0 8px 0 #3aaa84',
              }}
            >
              🦁 Visit BibleFunLand Jr.
            </motion.a>
            <motion.a
              href="https://jr.biblefunland.com/stories"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 50,
                background: 'rgba(255,255,255,0.85)', color: '#1A2E4A',
                fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                border: '2px solid rgba(110,207,176,0.5)',
                backdropFilter: 'blur(8px)',
              }}
            >
              📖 See Stories →
            </motion.a>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65 }}
            style={{ fontSize: '.8rem', color: 'rgba(26,46,74,0.45)', fontWeight: 700, margin: 0 }}
          >
            🔒 COPPA Safe · ✝️ Scripture-Based · 👨‍👩‍👧 Parent-Controlled
          </motion.p>
        </div>
      </div>
    </section>
  );
}
