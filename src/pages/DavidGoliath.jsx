import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// ─────────────────────────────────────────────
//  David & Goliath — Full Phaser.js Browser Game
//  Built with Phaser 3 via CDN (no npm needed)
//  Controls: Mouse/Touch to aim, Click/Tap to throw
// ─────────────────────────────────────────────

const GAME_CONFIG = {
  width: 800,
  height: 480,
  gravity: 400,
  stoneSpeed: 520,
  goliathHp: 5,
  levels: [
    { goliathX: 650, goliathSpeed: 0,   stoneSize: 12, label: 'Shepherd Boy',  color: '#10B981' },
    { goliathX: 620, goliathSpeed: 60,  stoneSize: 11, label: 'Young Warrior', color: '#3B82F6' },
    { goliathX: 590, goliathSpeed: 100, stoneSize: 10, label: 'Giant Slayer',  color: '#8B5CF6' },
    { goliathX: 560, goliathSpeed: 140, stoneSize: 9,  label: 'Champion',      color: '#F97316' },
    { goliathX: 530, goliathSpeed: 180, stoneSize: 8,  label: 'Legend',        color: '#EF4444' },
  ],
}

const BIBLE_FACTS = [
  '"David said to the Philistine, You come against me with sword and spear, but I come against you in the name of the LORD." — 1 Sam 17:45',
  '"The LORD who rescued me from the paw of the lion and the paw of the bear will rescue me from the hand of this Philistine." — 1 Sam 17:37',
  '"David ran quickly toward the battle line to meet Goliath. He reached into his bag and took out a stone." — 1 Sam 17:48-49',
  '"So David triumphed over the Philistine with a sling and a stone; without a sword in his hand." — 1 Sam 17:50',
  'Goliath stood about 9 feet 9 inches tall (6 cubits and a span). — 1 Samuel 17:4',
  'David chose 5 smooth stones from the stream — one was all he needed. — 1 Samuel 17:40',
  'David was a teenager when he defeated Goliath — the greatest warrior of his day.',
  '"Be strong and courageous. Do not be afraid; the LORD your God will be with you." — Joshua 1:9',
]

export default function DavidGoliath() {
  const mountRef = useRef(null)
  const gameRef = useRef(null)
  const [gameState, setGameState] = useState('menu') // menu | playing | win | lose
  const [level, setLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('dg_high') || '0'))
  const [fact, setFact] = useState(BIBLE_FACTS[0])
  const [shotsLeft, setShotsLeft] = useState(5)
  const [goliathHp, setGoliathHp] = useState(GAME_CONFIG.goliathHp)
  const [hits, setHits] = useState(0)

  // Rotate bible facts
  useEffect(() => {
    const t = setInterval(() => {
      setFact(BIBLE_FACTS[Math.floor(Math.random() * BIBLE_FACTS.length)])
    }, 6000)
    return () => clearInterval(t)
  }, [])

  function startGame(lvl = 0) {
    setLevel(lvl)
    setScore(0)
    setShotsLeft(5)
    setGoliathHp(GAME_CONFIG.goliathHp)
    setHits(0)
    setGameState('playing')
    if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null }
    initPhaser(lvl)
  }

  function initPhaser(lvl) {
    // Load Phaser from CDN
    if (!window.Phaser) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.60.0/phaser.min.js'
      script.onload = () => createGame(lvl)
      document.head.appendChild(script)
    } else {
      createGame(lvl)
    }
  }

  function createGame(lvl) {
    const P = window.Phaser
    const cfg = GAME_CONFIG.levels[lvl]
    let stones = [], goliath, david, ground
    let canThrow = true, stonesThrown = 0
    let goliathHpLocal = GAME_CONFIG.goliathHp
    let scoreLocal = 0
    let shotsLocal = 5
    let dirX = 1

    const config = {
      type: P.AUTO,
      width: GAME_CONFIG.width,
      height: GAME_CONFIG.height,
      parent: mountRef.current,
      backgroundColor: '#87CEEB',
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: GAME_CONFIG.gravity }, debug: false },
      },
      scene: {
        preload() {
          // We'll draw everything with graphics — no image assets needed
        },
        create() {
          const scene = this

          // ── Sky gradient ──
          const sky = scene.add.graphics()
          sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xFFF8E1, 0xFFF8E1, 1)
          sky.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height)

          // ── Ground ──
          ground = scene.physics.add.staticGroup()
          const groundGraphic = scene.add.graphics()
          groundGraphic.fillStyle(0x8B6914, 1)
          groundGraphic.fillRect(0, GAME_CONFIG.height - 60, GAME_CONFIG.width, 60)
          groundGraphic.fillStyle(0x5D8A3C, 1)
          groundGraphic.fillRect(0, GAME_CONFIG.height - 65, GAME_CONFIG.width, 12)
          const groundBody = scene.add.rectangle(GAME_CONFIG.width / 2, GAME_CONFIG.height - 30, GAME_CONFIG.width, 60)
          scene.physics.add.existing(groundBody, true)
          ground.add(groundBody)

          // ── Background hills ──
          const hills = scene.add.graphics()
          hills.fillStyle(0x6AAF3D, 0.6)
          hills.fillEllipse(150, GAME_CONFIG.height - 60, 280, 120)
          hills.fillEllipse(400, GAME_CONFIG.height - 55, 200, 90)
          hills.fillEllipse(650, GAME_CONFIG.height - 60, 260, 110)

          // ── Clouds ──
          const clouds = scene.add.graphics()
          clouds.fillStyle(0xFFFFFF, 0.85)
          ;[[100,60,70,35],[280,40,80,30],[550,70,90,38],[720,50,65,28]].forEach(([x,y,w,h]) => {
            clouds.fillEllipse(x, y, w, h)
            clouds.fillEllipse(x+20, y-8, w*0.7, h*0.8)
            clouds.fillEllipse(x-15, y+5, w*0.6, h*0.7)
          })

          // ── David (left side) ──
          david = scene.add.graphics()
          drawDavid(david, 80, GAME_CONFIG.height - 65)

          // ── Goliath (right side) ──
          goliath = scene.add.graphics()
          drawGoliath(goliath, cfg.goliathX, GAME_CONFIG.height - 65, goliathHpLocal)

          // ── HP hearts ──
          scene.hpText = scene.add.text(GAME_CONFIG.width / 2, 14, getHpString(goliathHpLocal), {
            fontSize: '18px', fill: '#EF4444', fontFamily: 'Poppins,sans-serif', fontStyle: 'bold',
          }).setOrigin(0.5, 0)

          // ── Shots counter ──
          scene.shotsText = scene.add.text(14, 14, `🪨 x${shotsLocal}`, {
            fontSize: '18px', fill: '#1F2937', fontFamily: 'Poppins,sans-serif', fontStyle: 'bold',
          })

          // ── Score ──
          scene.scoreText = scene.add.text(GAME_CONFIG.width - 14, 14, `Score: ${scoreLocal}`, {
            fontSize: '16px', fill: '#1F2937', fontFamily: 'Poppins,sans-serif',
          }).setOrigin(1, 0)

          // ── Aim line ──
          scene.aimLine = scene.add.graphics()

          // ── Stones group ──
          const stonesGroup = scene.physics.add.group()
          stones = stonesGroup

          // ── Goliath movement ──
          if (cfg.goliathSpeed > 0) {
            scene.goliathTween = scene.tweens.add({
              targets: goliath,
              x: `+=${dirX * 70}`,
              duration: 1200,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            })
          }

          // ── Input: mouse / touch aim ──
          scene.input.on('pointermove', (ptr) => {
            if (!canThrow || stonesThrown >= 5) return
            scene.aimLine.clear()
            scene.aimLine.lineStyle(2, 0xFFFFFF, 0.4)
            // Draw trajectory arc
            const dx = ptr.x - 80
            const dy = ptr.y - (GAME_CONFIG.height - 90)
            const angle = Math.atan2(dy, dx)
            const vx = Math.cos(angle) * GAME_CONFIG.stoneSpeed
            const vy = Math.sin(angle) * GAME_CONFIG.stoneSpeed
            for (let t = 0; t < 0.8; t += 0.04) {
              const px = 80 + vx * t
              const py = (GAME_CONFIG.height - 90) + vy * t + 0.5 * GAME_CONFIG.gravity * t * t
              if (px > 0 && px < GAME_CONFIG.width && py < GAME_CONFIG.height) {
                scene.aimLine.fillStyle(0xFFFFFF, 0.5 - t * 0.5)
                scene.aimLine.fillCircle(px, py, 2.5)
              }
            }
          })

          scene.input.on('pointerdown', (ptr) => {
            if (!canThrow || stonesThrown >= shotsLocal) return
            canThrow = false
            scene.aimLine.clear()

            const dx = ptr.x - 80
            const dy = ptr.y - (GAME_CONFIG.height - 90)
            const angle = Math.atan2(dy, dx)

            // Draw stone
            const stone = scene.add.graphics()
            stone.fillStyle(0x9CA3AF, 1)
            stone.fillCircle(0, 0, cfg.stoneSize)
            stone.fillStyle(0xD1D5DB, 1)
            stone.fillCircle(-3, -3, cfg.stoneSize * 0.4)
            scene.physics.add.existing(stone)
            stone.body.setVelocity(
              Math.cos(angle) * GAME_CONFIG.stoneSpeed,
              Math.sin(angle) * GAME_CONFIG.stoneSpeed,
            )
            stone.x = 80
            stone.y = GAME_CONFIG.height - 90
            stonesGroup.add(stone)
            stonesThrown++
            shotsLocal--
            setShotsLeft(shotsLocal)
            scene.shotsText.setText(`🪨 x${shotsLocal}`)

            // Check hit — overlap with goliath bounds
            scene.time.addEvent({
              delay: 50,
              repeat: 40,
              callback: () => {
                if (!stone.active) return
                const gx = goliath.x + cfg.goliathX - 80
                const gy = goliath.y + GAME_CONFIG.height - 65 - 80
                const dist = Math.hypot(stone.x - gx, stone.y - gy - 20)
                if (dist < 50) {
                  // HIT!
                  stone.destroy()
                  goliathHpLocal--
                  scoreLocal += 100 + lvl * 50
                  setHits(h => h + 1)
                  setGoliathHp(goliathHpLocal)
                  setScore(scoreLocal)
                  scene.hpText.setText(getHpString(goliathHpLocal))
                  scene.scoreText.setText(`Score: ${scoreLocal}`)

                  // Flash goliath red
                  scene.tweens.add({ targets: goliath, alpha: 0.2, duration: 80, yoyo: true, repeat: 3 })

                  // Show hit text
                  const hitTxt = scene.add.text(gx, gy - 30, '💥 HIT!', {
                    fontSize: '20px', fill: '#EF4444', fontFamily: 'Baloo 2,cursive', fontStyle: 'bold',
                  }).setOrigin(0.5)
                  scene.tweens.add({ targets: hitTxt, y: gy - 70, alpha: 0, duration: 900, onComplete: () => hitTxt.destroy() })

                  if (goliathHpLocal <= 0) {
                    // VICTORY!
                    if (cfg.goliathSpeed > 0) scene.goliathTween?.stop()
                    scene.tweens.add({ targets: goliath, y: 80, alpha: 0, duration: 600, ease: 'Power2' })
                    const win = scene.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 40,
                      '🏆 GIANT SLAIN!', { fontSize: '40px', fill: '#F59E0B', fontFamily: 'Baloo 2,cursive', fontStyle: 'bold' }
                    ).setOrigin(0.5)
                    scene.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 14,
                      `Score: ${scoreLocal}`, { fontSize: '22px', fill: '#1F2937', fontFamily: 'Poppins,sans-serif' }
                    ).setOrigin(0.5)
                    const newHigh = Math.max(highScore, scoreLocal)
                    localStorage.setItem('dg_high', newHigh)
                    setHighScore(newHigh)
                    scene.time.delayedCall(1800, () => setGameState('win'))
                  }
                }

                // Ground hit
                if (stone.y > GAME_CONFIG.height - 65) {
                  stone.destroy()
                  canThrow = true
                  if (shotsLocal <= 0 && goliathHpLocal > 0) {
                    scene.time.delayedCall(600, () => setGameState('lose'))
                  }
                }
              },
            })

            // Re-enable throw after stone lands
            scene.time.delayedCall(2000, () => {
              canThrow = true
              if (shotsLocal <= 0 && goliathHpLocal > 0) {
                setGameState('lose')
              }
            })
          })
        },
        update() {},
      },
    }

    gameRef.current = new P.Game(config)
  }

  function drawDavid(g, x, y) {
    g.x = 0; g.y = 0
    // Body
    g.fillStyle(0x1E40AF, 1)
    g.fillRect(x - 12, y - 48, 24, 36)
    // Head
    g.fillStyle(0xFBBF24, 1)
    g.fillCircle(x, y - 58, 16)
    // Hair
    g.fillStyle(0x92400E, 1)
    g.fillRect(x - 16, y - 72, 32, 12)
    // Sling arm
    g.lineStyle(3, 0x6B7280, 1)
    g.strokeRect(x + 6, y - 44, 3, 20)
    // Legs
    g.fillStyle(0x92400E, 1)
    g.fillRect(x - 10, y - 12, 9, 16)
    g.fillRect(x + 1, y - 12, 9, 16)
    // Label
    g.fillStyle(0xFFFFFF, 0)
  }

  function drawGoliath(g, x, y, hp) {
    g.clear()
    const alpha = hp / GAME_CONFIG.goliathHp
    // Armor
    g.fillStyle(0x6B7280, 1)
    g.fillRect(x - 22, y - 90, 44, 70)
    // Body overlay color based on hp
    g.fillStyle(hp > 3 ? 0xDC2626 : hp > 1 ? 0xF97316 : 0xFEF2F2, 0.3)
    g.fillRect(x - 22, y - 90, 44, 70)
    // Head
    g.fillStyle(0xB45309, 1)
    g.fillCircle(x, y - 105, 24)
    // Helmet
    g.fillStyle(0x374151, 1)
    g.fillRect(x - 24, y - 125, 48, 20)
    // Spear
    g.lineStyle(5, 0x78350F, 1)
    g.lineBetween(x + 20, y - 140, x + 20, y + 5)
    g.fillStyle(0x9CA3AF, 1)
    g.fillTriangle(x + 12, y - 140, x + 28, y - 140, x + 20, y - 160)
    // Shield
    g.fillStyle(0x1E3A5F, 1)
    g.fillRoundedRect(x - 44, y - 90, 22, 50, 6)
    // HP indicator bar
    g.fillStyle(0xEF4444, 1)
    g.fillRect(x - 22, y - 98, 44 * (hp / GAME_CONFIG.goliathHp), 5)
    g.lineStyle(1, 0x6B7280, 1)
    g.strokeRect(x - 22, y - 98, 44, 5)
    // Legs
    g.fillStyle(0x374151, 1)
    g.fillRect(x - 18, y - 20, 14, 24)
    g.fillRect(x + 4, y - 20, 14, 24)
  }

  function getHpString(hp) {
    return '❤️'.repeat(hp) + '🖤'.repeat(GAME_CONFIG.goliathHp - hp)
  }

  function cleanup() {
    if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null }
    setGameState('menu')
  }

  useEffect(() => () => { gameRef.current?.destroy(true) }, [])

  const lvlCfg = GAME_CONFIG.levels[level]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1E1B4B,#312E81)', padding: '52px 36px 36px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, background: 'linear-gradient(90deg,#FCD34D,#FB923C,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
          🏹 David vs Goliath
        </h1>
        <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.9rem', fontWeight: 500 }}>
          Aim with your mouse · Click to throw · Defeat the giant in the name of the LORD!
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px' }}>

        {/* ── MENU ── */}
        {gameState === 'menu' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: '5rem', marginBottom: 12 }}>🏹</div>
              <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Choose Your Level</h2>
              {highScore > 0 && <div style={{ fontSize: '.85rem', color: 'var(--ink3)', fontWeight: 600 }}>🏆 High Score: {highScore}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 28 }}>
              {GAME_CONFIG.levels.map((l, i) => (
                <div key={i} onClick={() => startGame(i)} style={{ borderRadius: 18, padding: '18px 10px', textAlign: 'center', cursor: 'pointer', border: `2px solid ${l.color}`, background: 'var(--surface)', transition: 'all .25s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = l.color + '22' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{'🪨'.repeat(i + 1)}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '.85rem', fontWeight: 800, color: l.color }}>{l.label}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 500, marginTop: 3 }}>Level {i + 1}</div>
                </div>
              ))}
            </div>
            {/* Bible fact */}
            <div style={{ background: 'var(--violet-bg)', borderLeft: '3px solid var(--violet)', borderRadius: '0 14px 14px 0', padding: '16px 20px', fontSize: '.85rem', color: 'var(--ink2)', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.7 }}>
              {fact}
            </div>
          </div>
        )}

        {/* ── PLAYING ── */}
        {gameState === 'playing' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: lvlCfg.color + '22', color: lvlCfg.color, padding: '3px 10px', borderRadius: 100, fontSize: '.78rem', border: `1px solid ${lvlCfg.color}` }}>{lvlCfg.label}</span>
                🏹 {shotsLeft} shots left
              </div>
              <button className="btn btn-outline btn-sm" onClick={cleanup}>✕ Quit</button>
            </div>
            <div ref={mountRef} style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.2)', cursor: 'crosshair', border: '2px solid var(--border)' }} />
            <div style={{ background: 'var(--violet-bg)', borderRadius: 12, padding: '12px 16px', marginTop: 12, fontSize: '.8rem', color: 'var(--ink2)', fontStyle: 'italic', lineHeight: 1.6 }}>
              {fact}
            </div>
          </div>
        )}

        {/* ── WIN ── */}
        {gameState === 'win' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '5rem', marginBottom: 16, animation: 'bounce 1s ease infinite' }}>🏆</div>
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '2.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Giant Slain!</h2>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '3.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#F97316,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 6 }}>
              {score}
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--ink3)', fontWeight: 600, marginBottom: 24 }}>
              🏆 High Score: {Math.max(highScore, score)} · {hits} direct hits
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green)', borderRadius: 14, padding: '14px 18px', fontSize: '.85rem', color: 'var(--ink2)', fontStyle: 'italic', fontWeight: 500, marginBottom: 24 }}>
              "David triumphed over the Philistine with a sling and a stone; without a sword in his hand." — 1 Samuel 17:50
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {level < GAME_CONFIG.levels.length - 1 && (
                <button className="btn btn-blue" onClick={() => startGame(level + 1)}>Next Level →</button>
              )}
              <button className="btn btn-outline" onClick={() => startGame(level)}>Play Again</button>
              <button className="btn btn-outline" onClick={cleanup}>Menu</button>
            </div>
          </div>
        )}

        {/* ── LOSE ── */}
        {gameState === 'lose' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 14 }}>💪</div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '2rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Keep Trusting God!</h2>
            <div style={{ fontSize: '.88rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.7, marginBottom: 20, maxWidth: 480, margin: '0 auto 20px' }}>
              David didn't give up — and neither should you! Try again with faith.
            </div>
            <div style={{ background: 'var(--orange-bg)', border: '1.5px solid var(--orange)', borderRadius: 14, padding: '14px 18px', fontSize: '.85rem', color: 'var(--ink2)', fontStyle: 'italic', fontWeight: 500, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
              "Be strong and courageous. Do not be afraid; the LORD your God will be with you." — Joshua 1:9
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-orange" onClick={() => startGame(level)}>Try Again</button>
              <button className="btn btn-outline" onClick={cleanup}>Choose Level</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
