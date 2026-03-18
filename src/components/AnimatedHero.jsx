import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStreak } from '../context/StreakContext'
import { useT } from '../i18n/useT'
import styles from './AnimatedHero.module.css'

// ── Bible words for particle storm ──
const BIBLE_WORDS = [
  'Grace','Faith','Hope','Love','Peace','Joy','Truth',
  'Light','Life','Word','Lord','Christ','Holy','Prayer',
  'Mercy','Blessed','Amen','Glory','Praise','Wisdom',
  'Strength','Courage','Trust','Salvation','Gospel',
  'יהוה','Agape','Logos','Shalom','Hallelujah',
]

// ── Star data ──
function makeStars(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.3 + 0.1,
    opacity: Math.random() * 0.8 + 0.2,
  }))
}

export default function AnimatedHero() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const { streak } = useStreak()
  const { t } = useT()

  // Which effect is showing
  const [effect, setEffect] = useState('particles') // particles | waves | starfield | video
  const [videoReady, setVideoReady] = useState(false)
  const [particles, setParticles] = useState([])

  // Init particles
  useEffect(() => {
    const ps = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      word: BIBLE_WORDS[Math.floor(Math.random() * BIBLE_WORDS.length)],
      x: Math.random() * 100,
      y: 110 + Math.random() * 60,
      size: Math.random() * 0.6 + 0.5,
      speed: Math.random() * 0.025 + 0.012,
      opacity: Math.random() * 0.7 + 0.2,
      color: ['#60A5FA','#C084FC','#F472B6','#34D399','#FCD34D','#FB923C'][Math.floor(Math.random()*6)],
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 0.015,
    }))
    setParticles(ps)
  }, [])

  // Animate particles
  useEffect(() => {
    if (effect !== 'particles') return
    let frame
    let ps = particles.map(p => ({ ...p }))
    function tick() {
      ps = ps.map(p => {
        let y = p.y - p.speed
        let x = p.x + p.drift
        if (y < -10) {
          y = 115 + Math.random() * 20
          x = Math.random() * 100
        }
        if (x < 0) x = 100
        if (x > 100) x = 0
        return { ...p, x, y }
      })
      setParticles([...ps])
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [effect])

  // Starfield canvas
  useEffect(() => {
    if (effect !== 'starfield') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.width = canvas.offsetWidth
    let H = canvas.height = canvas.offsetHeight
    const stars = makeStars(300)
    let speed = 0
    let targetSpeed = 2

    function draw() {
      ctx.fillStyle = 'rgba(5,5,18,0.18)'
      ctx.fillRect(0, 0, W, H)
      const cx = W / 2, cy = H / 2

      stars.forEach(s => {
        s.z -= s.speed * (1 + speed * 0.5)
        if (s.z <= 0) { s.z = 100; s.x = Math.random() * 100; s.y = Math.random() * 100 }
        const px = ((s.x - 50) / s.z) * W + cx
        const py = ((s.y - 50) / s.z * (H / W)) * W + cy
        const r = Math.max(0.2, (1 - s.z / 100) * 2.5)
        const op = Math.min(1, (1 - s.z / 100) * 1.4)
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${op})`
        ctx.fill()
      })

      // Cross glow at center
      const crossAlpha = 0.12 + Math.sin(Date.now() / 1200) * 0.06
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120)
      grd.addColorStop(0, `rgba(165,180,252,${crossAlpha + 0.1})`)
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, W, H)

      // Draw cross
      ctx.save()
      ctx.globalAlpha = 0.18 + Math.sin(Date.now() / 1000) * 0.06
      ctx.strokeStyle = '#A5B4FC'
      ctx.lineWidth = 3
      ctx.shadowColor = '#A5B4FC'
      ctx.shadowBlur = 20
      ctx.beginPath(); ctx.moveTo(cx, cy - 40); ctx.lineTo(cx, cy + 40); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx - 28, cy - 10); ctx.lineTo(cx + 28, cy - 10); ctx.stroke()
      ctx.restore()

      speed += (targetSpeed - speed) * 0.02
      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)

    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [effect])

  const EFFECTS = [
    { id: 'particles', label: '✨ Words' },
    { id: 'waves',     label: '🌊 Waves' },
    { id: 'starfield', label: '🌌 Stars' },
    { id: 'video',     label: '🎬 Video' },
  ]

  return (
    <section className={styles.hero}>

      {/* ── Effect layers ── */}

      {/* 1. Gradient waves (always underneath as base) */}
      <div className={`${styles.waveBg} ${effect === 'waves' ? styles.waveBgActive : ''}`}>
        <div className={styles.wave1} />
        <div className={styles.wave2} />
        <div className={styles.wave3} />
        <div className={styles.waveGlow} />
      </div>

      {/* 2. Starfield canvas */}
      {effect === 'starfield' && (
        <canvas ref={canvasRef} className={styles.starCanvas} />
      )}

      {/* 3. YouTube video background */}
      {effect === 'video' && (
        <div className={styles.videoBg}>
          <iframe
            className={styles.videoIframe}
            src="https://www.youtube.com/embed/WNKouRd5nLs?autoplay=1&mute=1&loop=1&playlist=WNKouRd5nLs&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
            title="Background worship video"
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
          <div className={styles.videoLabel}>
            🎬 Replace <code>WNKouRd5nLs</code> in <code>AnimatedHero.jsx</code> with your YouTube video ID
          </div>
        </div>
      )}

      {/* 4. Floating word particles */}
      {effect === 'particles' && (
        <div className={styles.particleLayer} aria-hidden="true">
          {particles.map(p => (
            <span
              key={p.id}
              className={styles.wordParticle}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: `${p.size}rem`,
                color: p.color,
                opacity: p.opacity,
                transform: `translateZ(0)`,
              }}
            >
              {p.word}
            </span>
          ))}
        </div>
      )}

      {/* Overlay gradient (always on top of effects) */}
      <div className={`${styles.overlay} ${effect === 'waves' ? styles.overlayLight : ''}`} />

      {/* ── Content ── */}
      <div className={styles.content}>
        {/* Effect switcher pills */}
        <div className={styles.effectSwitcher}>
          {EFFECTS.map(e => (
            <button
              key={e.id}
              className={`${styles.effectBtn} ${effect === e.id ? styles.effectBtnActive : ''}`}
              onClick={() => setEffect(e.id)}
            >
              {e.label}
            </button>
          ))}
        </div>

        <div className={styles.pill}>
          <span className={styles.pillDot}>✨</span>
          {t('hero.pill')}
        </div>

        <h1 className={styles.h1}>
          {t('hero.line1')}<br />
          <span className={styles.rainbow}>{t('hero.line2')}</span><br />
          {t('hero.line3')}
        </h1>

        <p className={styles.desc}>{t('hero.desc')}</p>

        <div className={styles.btns}>
          <Link to="/trivia" className={`btn btn-rainbow btn-lg ${styles.btnMain}`}>
            🎮 {t('hero.cta1')}
          </Link>
          <Link to="/devotional" className={`btn ${styles.btnAlt}`}>
            🙏 {t('hero.cta2')}
          </Link>
        </div>

        {streak > 0 && (
          <div className={styles.streakPill}>
            🔥 {streak} {t('hero.streak')}
          </div>
        )}
      </div>

      {/* Scroll hint */}
      <div className={styles.scroll}>
        <span>{t('hero.scroll')}</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  )
}
