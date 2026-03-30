import { useState, useEffect, useRef, useCallback } from 'react';

const FRUITS = ['❤️', '😊', '☮️', '😌', '🫶', '🌟', '🤲', '💝'];
const FRUIT_NAMES = [
  'Love',
  'Joy',
  'Peace',
  'Patience',
  'Kindness',
  'Goodness',
  'Gentleness',
  'Self-Control',
];
const OBSTACLES = ['😈', '💀', '🕳️', '⛓️'];
const OBSTACLE_LABELS = ['Temptation', 'Doubt', 'Pit', 'Bondage'];

const W = 800,
  H = 300;
const GROUND_Y = H - 60;
const PLAYER_W = 40,
  PLAYER_H = 50;
const GRAVITY = 0.7,
  JUMP_V = -14,
  GAME_SPEED = 5;

export default function ScriptureRunner() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    player: { x: 80, y: GROUND_Y - PLAYER_H, vy: 0, onGround: true },
    obstacles: [],
    fruits: [],
    particles: [],
    score: 0,
    speed: GAME_SPEED,
    frame: 0,
    collected: [],
    running: false,
    dead: false,
    bgX: 0,
    cloudX: 0,
  });
  const animRef = useRef(null);
  const [phase, setPhase] = useState('menu'); // menu | playing | dead
  const [score, setScore] = useState(0);
  const [collected, setCollected] = useState([]);
  const [highScore] = useState(() => parseInt(localStorage.getItem('bfl_runner_hs') || '0'));
  const [deathLabel, setDeathLabel] = useState('');

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.player.onGround && s.running) {
      s.player.vy = JUMP_V;
      s.player.onGround = false;
    }
  }, []);

  function startGame() {
    const s = stateRef.current;
    s.player = { x: 80, y: GROUND_Y - PLAYER_H, vy: 0, onGround: true };
    s.obstacles = [];
    s.fruits = [];
    s.particles = [];
    s.score = 0;
    s.speed = GAME_SPEED;
    s.frame = 0;
    s.collected = [];
    s.running = true;
    s.dead = false;
    s.bgX = 0;
    s.cloudX = 0;
    setPhase('playing');
    setScore(0);
    setCollected([]);
    loop();
  }

  function loop() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    if (!s.running) return;

    s.frame++;
    s.score++;
    s.speed = GAME_SPEED + Math.floor(s.frame / 300) * 0.5;
    s.bgX = (s.bgX - s.speed * 0.3) % W;
    s.cloudX = (s.cloudX - s.speed * 0.15) % W;

    // Spawn obstacles
    if (s.frame % 90 === 0 && Math.random() > 0.3) {
      s.obstacles.push({
        x: W,
        y: GROUND_Y - 44,
        w: 40,
        h: 44,
        type: Math.floor(Math.random() * OBSTACLES.length),
        passed: false,
      });
    }
    // Spawn fruits
    if (s.frame % 70 === 0 && Math.random() > 0.4) {
      s.fruits.push({
        x: W,
        y: GROUND_Y - PLAYER_H - 20 - Math.random() * 60,
        type: Math.floor(Math.random() * FRUITS.length),
        collected: false,
      });
    }

    // Physics
    s.player.vy += GRAVITY;
    s.player.y += s.player.vy;
    if (s.player.y >= GROUND_Y - PLAYER_H) {
      s.player.y = GROUND_Y - PLAYER_H;
      s.player.vy = 0;
      s.player.onGround = true;
    }

    // Move obstacles
    s.obstacles = s.obstacles.filter((o) => o.x > -50);
    s.obstacles.forEach((o) => {
      o.x -= s.speed;
    });

    // Move fruits
    s.fruits = s.fruits.filter((f) => f.x > -50);
    s.fruits.forEach((f) => {
      f.x -= s.speed;
    });

    // Collision detection - obstacles
    s.obstacles.forEach((o) => {
      const px = s.player.x + 8,
        py = s.player.y + 6;
      const pw = PLAYER_W - 16,
        ph = PLAYER_H - 8;
      if (px < o.x + o.w - 4 && px + pw > o.x + 4 && py < o.y + o.h && py + ph > o.y) {
        s.running = false;
        s.dead = true;
        const hs = Math.max(s.score, parseInt(localStorage.getItem('bfl_runner_hs') || '0'));
        localStorage.setItem('bfl_runner_hs', hs);
        setDeathLabel(OBSTACLE_LABELS[o.type]);
        setPhase('dead');
        setScore(s.score);
        setCollected([...s.collected]);
        return;
      }
    });

    // Collision detection - fruits
    s.fruits.forEach((f) => {
      if (f.collected) return;
      if (Math.abs(s.player.x - f.x) < 30 && Math.abs(s.player.y - f.y) < 30) {
        f.collected = true;
        s.score += 50;
        if (!s.collected.includes(f.type)) s.collected.push(f.type);
        // Particles
        for (let i = 0; i < 6; i++) {
          s.particles.push({
            x: f.x,
            y: f.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            color: '#FCD34D',
          });
        }
        setScore(s.score);
        setCollected([...s.collected]);
      }
    });

    // Particles
    s.particles = s.particles.filter((p) => p.life > 0);
    s.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.08;
    });

    // Draw
    ctx.clearRect(0, 0, W, H);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#87CEEB');
    sky.addColorStop(1, '#E0F4FF');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.8)'[
      ([s.cloudX + 80, 50],
      [s.cloudX + 280, 40],
      [s.cloudX + 500, 60],
      [s.cloudX + 700, 45],
      [s.cloudX + 900, 55])
    ].forEach(([cx, cy]) => {
      const x = ((cx % W) + W) % W;
      ctx.beginPath();
      ctx.ellipse(x, cy, 50, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - 20, cy + 5, 30, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 20, cy + 5, 35, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ground
    ctx.fillStyle = '#5D8A3C';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(0, GROUND_Y + 14, W, H - GROUND_Y);
    // Grass pattern
    for (let x = ((s.bgX * 2) % 60) - 60; x < W; x += 60) {
      ctx.fillStyle = '#4A7A2C';
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x + 8, GROUND_Y - 10);
      ctx.lineTo(x + 16, GROUND_Y);
      ctx.fill();
    }

    // Player (David figure)
    const px = s.player.x,
      py = s.player.y;
    // Body
    ctx.fillStyle = '#1E40AF';
    ctx.fillRoundedRect?.(px + 6, py + 18, 28, 28, 4);
    if (!ctx.fillRoundedRect) {
      ctx.fillStyle = '#1E40AF';
      ctx.fillRect(px + 6, py + 18, 28, 28);
    }
    // Head
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(px + 20, py + 12, 13, 0, Math.PI * 2);
    ctx.fill();
    // Sling (when running)
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 28, py + 18);
    ctx.lineTo(px + 38, py + 8);
    ctx.stroke();
    // Legs (animated walk)
    const legAngle = Math.sin(s.frame * 0.2) * 15;
    ctx.fillStyle = '#92400E';
    ctx.fillRect(px + 8, py + 45, 10, 16);
    ctx.fillRect(px + 22, py + 45, 10, 16);

    // Fruits
    s.fruits
      .filter((f) => !f.collected)
      .forEach((f) => {
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText(FRUITS[f.type], f.x, f.y + 10);
        ctx.font = '10px Poppins,sans-serif';
        ctx.fillStyle = '#1F2937';
        ctx.fillText(FRUIT_NAMES[f.type], f.x, f.y + 26);
      });

    // Obstacles
    s.obstacles.forEach((o) => {
      ctx.font = '32px serif';
      ctx.textAlign = 'center';
      ctx.fillText(OBSTACLES[o.type], o.x + 20, o.y + 36);
      ctx.font = '10px Poppins,sans-serif';
      ctx.fillStyle = '#991B1B';
      ctx.fillText(OBSTACLE_LABELS[o.type], o.x + 20, o.y + 52);
    });

    // Particles
    s.particles.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨', p.x, p.y);
    });
    ctx.globalAlpha = 1;

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, 36);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Poppins,sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${s.score}`, 14, 24);
    ctx.textAlign = 'center';
    ctx.fillText(`Fruits: ${s.collected.length}/8`, W / 2, 24);
    ctx.textAlign = 'right';
    ctx.fillText(`Speed: ${s.speed.toFixed(1)}x`, W - 14, 24);

    animRef.current = requestAnimationFrame(loop);
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(animRef.current);
    };
  }, [jump]);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#064E3B,#065F46)',
          padding: '52px 36px 36px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#34D399,#FCD34D,#60A5FA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          Scripture Runner
        </h1>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem', fontWeight: 500 }}>
          Jump over sin. Collect the Fruits of the Spirit. Run the race of faith!
        </p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px' }}>
        {phase === 'menu' && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 24,
                padding: '40px 32px',
                border: '1.5px solid var(--border)',
                boxShadow: 'var(--sh)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏃</div>
              <h2
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 10,
                }}
              >
                Run the Race of Faith
              </h2>
              <p
                style={{
                  fontSize: '.9rem',
                  color: 'var(--ink2)',
                  lineHeight: 1.8,
                  marginBottom: 20,
                }}
              >
                Collect all 8 Fruits of the Spirit (Galatians 5:22-23)
                <br />
                Jump over: Temptation, Doubt, Pit, and Bondage
                <br />
                🖥️ <strong>Space/↑</strong> to jump · 📱 Tap canvas to jump
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginBottom: 20,
                }}
              >
                {FRUITS.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{f}</span>
                    <span style={{ fontSize: '.6rem', fontWeight: 600, color: 'var(--ink3)' }}>
                      {FRUIT_NAMES[i]}
                    </span>
                  </div>
                ))}
              </div>
              {highScore > 0 && (
                <div
                  style={{
                    fontSize: '.84rem',
                    fontWeight: 700,
                    color: 'var(--yellow)',
                    marginBottom: 16,
                  }}
                >
                  🏆 Your best: {highScore}
                </div>
              )}
              <button className="btn btn-green btn-lg" onClick={startGame}>
                🏃 Start Running!
              </button>
            </div>
          </div>
        )}

        {(phase === 'playing' || phase === 'dead') && (
          <div>
            {/* Score bar */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  padding: '8px 16px',
                  border: '1.5px solid var(--border)',
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: 'var(--ink)',
                  fontSize: '.95rem',
                }}
              >
                Score: {score}
              </div>
              <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                {FRUITS.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '1.3rem',
                      opacity: collected.includes(i) ? 1 : 0.25,
                      filter: collected.includes(i) ? 'none' : 'grayscale(1)',
                      title: FRUIT_NAMES[i],
                    }}
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              style={{
                borderRadius: 16,
                boxShadow: '0 20px 60px rgba(0,0,0,.18)',
                display: 'block',
                width: '100%',
                cursor: 'pointer',
                border: '2px solid var(--border)',
              }}
              onClick={jump}
            />

            {phase === 'dead' && (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 20,
                  border: '1.5px solid var(--border)',
                  padding: '28px',
                  marginTop: 16,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>💪</div>
                <h3
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 6,
                  }}
                >
                  Stumbled on {deathLabel}!
                </h3>
                <p
                  style={{
                    fontSize: '.85rem',
                    color: 'var(--ink2)',
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Final Score: <strong>{score}</strong> · Fruits Collected:{' '}
                  <strong>{collected.length}/8</strong>
                </p>
                <div
                  style={{
                    background: 'var(--violet-bg)',
                    borderLeft: '3px solid var(--violet)',
                    borderRadius: '0 12px 12px 0',
                    padding: '11px 14px',
                    fontSize: '.82rem',
                    color: 'var(--ink2)',
                    fontStyle: 'italic',
                    marginBottom: 20,
                    textAlign: 'left',
                  }}
                >
                  "Let us run with perseverance the race marked out for us." — Hebrews 12:1
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="btn btn-green" onClick={startGame}>
                    🏃 Run Again!
                  </button>
                  <button className="btn btn-outline" onClick={() => setPhase('menu')}>
                    Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
