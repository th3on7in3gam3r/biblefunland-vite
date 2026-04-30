/**
 * KidsCelebration — lightweight confetti burst for kids mode wins
 * No external deps. Pure CSS + JS animation.
 */
import { useEffect, useRef } from 'react';

const COLORS = ['#FBBF24', '#F97316', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'];
const EMOJIS = ['🎉', '⭐', '🌟', '✨', '🎊', '🏆'];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function KidsCelebration({ active, onDone }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: randomBetween(0, canvas.width),
      y: randomBetween(-100, -10),
      vx: randomBetween(-2, 2),
      vy: randomBetween(3, 7),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      emoji: Math.random() > 0.6 ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : null,
      size: randomBetween(8, 18),
      rotation: randomBetween(0, Math.PI * 2),
      rotSpeed: randomBetween(-0.1, 0.1),
      alpha: 1,
    }));

    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.rotation += p.rotSpeed;
        if (frame > 60) p.alpha -= 0.015;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.emoji) {
          ctx.font = `${p.size * 1.4}px serif`;
          ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        ctx.restore();
      }
      if (alive) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        onDone?.();
      }
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    />
  );
}
