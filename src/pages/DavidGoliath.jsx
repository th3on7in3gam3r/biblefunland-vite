import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import styles from './DavidGoliath.module.css';

const GAME_CONFIG = {
  width: 800,
  height: 480,
  gravity: 420,
  stoneSpeed: 540,
  goliathHp: 5,
  davidX: 88,
  davidY: 395,
  levels: [
    { goliathX: 660, goliathSpeed: 0, stoneSize: 11, label: 'Shepherd Boy', color: '#10B981' },
    { goliathX: 630, goliathSpeed: 55, stoneSize: 10, label: 'Young Warrior', color: '#3B82F6' },
    { goliathX: 600, goliathSpeed: 95, stoneSize: 10, label: 'Giant Slayer', color: '#8B5CF6' },
    { goliathX: 570, goliathSpeed: 130, stoneSize: 9, label: 'Champion', color: '#F97316' },
    { goliathX: 540, goliathSpeed: 170, stoneSize: 9, label: 'Legend', color: '#EF4444' },
  ],
};

const BIBLE_FACTS = [
  '"David said to the Philistine, You come against me with sword and spear, but I come against you in the name of the LORD." — 1 Sam 17:45',
  '"The LORD who rescued me from the paw of the lion and the paw of the bear will rescue me from the hand of this Philistine." — 1 Sam 17:37',
  '"David ran quickly toward the battle line to meet Goliath. He reached into his bag and took out a stone." — 1 Sam 17:48-49',
  '"So David triumphed over the Philistine with a sling and a stone; without a sword in his hand." — 1 Sam 17:50',
  'Goliath stood about 9 feet 9 inches tall (6 cubits and a span). — 1 Samuel 17:4',
  'David chose 5 smooth stones from the stream — one was all he needed. — 1 Samuel 17:40',
  'David was a teenager when he defeated Goliath — the greatest warrior of his day.',
  '"Be strong and courageous. Do not be afraid; the LORD your God will be with you." — Joshua 1:9',
];

function drawDavid(g, x, y, slingAngle = -0.35) {
  g.clear();
  g.fillStyle(0x000000, 0.18);
  g.fillEllipse(x + 2, y + 6, 34, 10);

  g.fillStyle(0x92400e, 1);
  g.fillRect(x - 11, y - 10, 10, 18);
  g.fillRect(x + 1, y - 10, 10, 18);

  g.fillStyle(0x1e3a8a, 1);
  g.fillRoundedRect(x - 14, y - 48, 28, 38, 6);
  g.fillStyle(0x2563eb, 0.35);
  g.fillRect(x - 14, y - 48, 28, 10);

  g.fillStyle(0xfbbf24, 1);
  g.fillCircle(x, y - 58, 15);
  g.fillStyle(0x92400e, 1);
  g.fillEllipse(x, y - 68, 18, 10);

  const handX = x + 10;
  const handY = y - 42;
  g.lineStyle(3, 0x78350f, 1);
  g.lineBetween(handX, handY, handX + Math.cos(slingAngle) * 28, handY + Math.sin(slingAngle) * 28);
  g.fillStyle(0x6b7280, 1);
  g.fillCircle(handX + Math.cos(slingAngle) * 28, handY + Math.sin(slingAngle) * 28, 5);
}

function drawGoliath(g, hp) {
  g.clear();
  const maxHp = GAME_CONFIG.goliathHp;
  const hurt = hp < maxHp;

  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(4, 8, 52, 12);

  g.fillStyle(0x374151, 1);
  g.fillRect(-18, -18, 14, 24);
  g.fillRect(4, -18, 14, 24);

  g.fillStyle(0x6b7280, 1);
  g.fillRoundedRect(-24, -92, 48, 74, 8);
  g.fillStyle(hurt ? 0xdc2626 : 0x991b1b, 0.35);
  g.fillRoundedRect(-24, -92, 48, 74, 8);

  g.fillStyle(0xb45309, 1);
  g.fillCircle(0, -108, 22);
  g.fillStyle(0x374151, 1);
  g.fillRoundedRect(-26, -132, 52, 22, 6);
  g.fillStyle(0xfbbf24, 0.8);
  g.fillRect(-8, -128, 16, 6);

  g.lineStyle(4, 0x78350f, 1);
  g.lineBetween(22, -145, 22, 6);
  g.fillStyle(0xd1d5db, 1);
  g.fillTriangle(14, -145, 30, -145, 22, -168);

  g.fillStyle(0x1e3a5f, 1);
  g.fillRoundedRect(-48, -88, 24, 54, 8);
  g.fillStyle(0x60a5fa, 0.25);
  g.fillRoundedRect(-44, -84, 16, 20, 4);

  g.fillStyle(0x111827, 0.35);
  g.fillRect(-24, -100, 48, 6);
  g.fillStyle(0xef4444, 1);
  g.fillRect(-24, -100, 48 * (hp / maxHp), 6);
}

function getHpString(hp) {
  return '❤️'.repeat(hp) + '🖤'.repeat(GAME_CONFIG.goliathHp - hp);
}

function buildSceneCallbacks(refs) {
  return {
    onShotsChange: (n) => refs.setShotsLeft(n),
    onScoreChange: (n) => refs.setScore(n),
    onHpChange: (n) => refs.setGoliathHp(n),
    onHit: () => refs.setHits((h) => h + 1),
    onWin: (finalScore) => {
      refs.destroyGame();
      const newHigh = Math.max(refs.highScore, finalScore);
      localStorage.setItem('dg_high', String(newHigh));
      refs.setHighScore(newHigh);
      refs.setScore(finalScore);
      refs.setGameState('win');
    },
    onLose: () => {
      refs.destroyGame();
      refs.setGameState('lose');
    },
  };
}

function createGameInstance(mountEl, lvl, callbacks) {
  const cfg = GAME_CONFIG.levels[lvl];
  let goliathContainer;
  let goliathGfx;
  let davidGfx;
  let stonesGroup;
  let onStoneHit;
  let goliathHpLocal = GAME_CONFIG.goliathHp;
  let scoreLocal = 0;
  let shotsLocal = 5;
  let stonesThrown = 0;
  let canThrow = true;
  let gameOver = false;

  const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent: mountEl,
    backgroundColor: '#1a2744',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: GAME_CONFIG.gravity }, debug: false },
    },
    scene: {
      create() {
        const scene = this;

        scene.cameras.main.setBackgroundColor('#1a2744');

        const sky = scene.add.graphics();
        sky.fillGradientStyle(0x1e3a5f, 0x1e3a5f, 0xf59e0b, 0xfbbf24, 1);
        sky.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height * 0.72);
        sky.fillGradientStyle(0xfbbf24, 0xfbbf24, 0xfde68a, 0xfde68a, 1);
        sky.fillRect(0, GAME_CONFIG.height * 0.45, GAME_CONFIG.width, GAME_CONFIG.height * 0.27);

        const sun = scene.add.circle(GAME_CONFIG.width - 90, 72, 42, 0xfde68a, 0.95);
        scene.add.circle(GAME_CONFIG.width - 90, 72, 56, 0xfbbf24, 0.18);

        const mountains = scene.add.graphics();
        mountains.fillStyle(0x334155, 0.55);
        mountains.fillTriangle(0, 340, 180, 180, 360, 340);
        mountains.fillStyle(0x475569, 0.45);
        mountains.fillTriangle(220, 340, 420, 200, 620, 340);
        mountains.fillStyle(0x334155, 0.5);
        mountains.fillTriangle(500, 340, 700, 170, 800, 340);

        const hills = scene.add.graphics();
        hills.fillStyle(0x4d7c0f, 0.75);
        hills.fillEllipse(140, 392, 300, 110);
        hills.fillStyle(0x65a30d, 0.65);
        hills.fillEllipse(420, 398, 240, 95);
        hills.fillStyle(0x4d7c0f, 0.7);
        hills.fillEllipse(680, 390, 280, 105);

        const ground = scene.add.graphics();
        ground.fillStyle(0x78350f, 1);
        ground.fillRect(0, GAME_CONFIG.height - 52, GAME_CONFIG.width, 52);
        ground.fillStyle(0x65a30d, 1);
        ground.fillRect(0, GAME_CONFIG.height - 58, GAME_CONFIG.width, 14);

        const groundBody = scene.add.rectangle(
          GAME_CONFIG.width / 2,
          GAME_CONFIG.height - 26,
          GAME_CONFIG.width,
          52
        );
        scene.physics.add.existing(groundBody, true);

        const clouds = [
          { x: 90, y: 58, s: 1 },
          { x: 310, y: 42, s: 0.85 },
          { x: 560, y: 68, s: 1.1 },
          { x: 710, y: 48, s: 0.9 },
        ];
        clouds.forEach(({ x, y, s }, i) => {
          const c = scene.add.graphics();
          c.fillStyle(0xffffff, 0.82);
          c.fillEllipse(0, 0, 70 * s, 34 * s);
          c.fillEllipse(18 * s, -8 * s, 52 * s, 28 * s);
          c.fillEllipse(-14 * s, 4 * s, 44 * s, 24 * s);
          c.x = x;
          c.y = y;
          scene.tweens.add({
            targets: c,
            x: x + 18,
            duration: 4000 + i * 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        });

        davidGfx = scene.add.graphics();
        drawDavid(davidGfx, GAME_CONFIG.davidX, GAME_CONFIG.davidY);

        goliathContainer = scene.add.container(cfg.goliathX, GAME_CONFIG.davidY - 8);
        goliathGfx = scene.add.graphics();
        drawGoliath(goliathGfx, goliathHpLocal);
        goliathContainer.add(goliathGfx);

        if (cfg.goliathSpeed > 0) {
          scene.tweens.add({
            targets: goliathContainer,
            x: cfg.goliathX + 55,
            duration: 1400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        }

        const hudBg = scene.add.graphics();
        hudBg.fillStyle(0x0f172a, 0.55);
        hudBg.fillRoundedRect(8, 8, GAME_CONFIG.width - 16, 42, 12);
        hudBg.lineStyle(1, 0xffffff, 0.12);
        hudBg.strokeRoundedRect(8, 8, GAME_CONFIG.width - 16, 42, 12);

        scene.hpText = scene.add
          .text(GAME_CONFIG.width / 2, 18, getHpString(goliathHpLocal), {
            fontSize: '17px',
            fill: '#FCA5A5',
            fontFamily: 'Poppins, sans-serif',
            fontStyle: 'bold',
          })
          .setOrigin(0.5, 0);

        scene.shotsText = scene.add.text(22, 18, `🪨 ×${shotsLocal}`, {
          fontSize: '16px',
          fill: '#FDE68A',
          fontFamily: 'Poppins, sans-serif',
          fontStyle: 'bold',
        });

        scene.scoreText = scene.add
          .text(GAME_CONFIG.width - 22, 18, `Score ${scoreLocal}`, {
            fontSize: '15px',
            fill: '#E2E8F0',
            fontFamily: 'Poppins, sans-serif',
            fontStyle: 'bold',
          })
          .setOrigin(1, 0);

        scene.aimLine = scene.add.graphics();
        scene.aimGlow = scene.add.graphics();

        stonesGroup = scene.physics.add.group();

        const finishRound = (won) => {
          if (gameOver) return;
          gameOver = true;
          scene.input.enabled = false;
          if (won) {
            scene.time.delayedCall(1200, () => callbacks.onWin(scoreLocal));
          } else {
            scene.time.delayedCall(800, () => callbacks.onLose());
          }
        };

        onStoneHit = (stone) => {
          if (!stone.active || stone.getData('hit')) return;
          stone.setData('hit', true);
          stone.destroy();

          goliathHpLocal = Math.max(0, goliathHpLocal - 1);
          scoreLocal += 120 + lvl * 60;
          stonesThrown = Math.min(stonesThrown, shotsLocal + 1);
          callbacks.onHit();
          callbacks.onHpChange(goliathHpLocal);
          callbacks.onScoreChange(scoreLocal);
          drawGoliath(goliathGfx, goliathHpLocal);
          scene.hpText.setText(getHpString(goliathHpLocal));
          scene.scoreText.setText(`Score ${scoreLocal}`);

          scene.cameras.main.shake(120, 0.008);
          scene.tweens.add({
            targets: goliathContainer,
            alpha: 0.35,
            duration: 70,
            yoyo: true,
            repeat: 2,
          });

          const burst = scene.add.particles(
            goliathContainer.x,
            goliathContainer.y - 60,
            'stoneParticle',
            {
              speed: { min: 60, max: 180 },
              scale: { start: 0.5, end: 0 },
              lifespan: 420,
              quantity: 10,
              tint: [0xfbbf24, 0xf97316, 0xef4444],
            }
          );
          scene.time.delayedCall(450, () => burst.destroy());

          const hitTxt = scene.add
            .text(goliathContainer.x, goliathContainer.y - 90, '💥 HIT!', {
              fontSize: '22px',
              fill: '#FDE68A',
              fontFamily: 'Baloo 2, cursive',
              fontStyle: 'bold',
              stroke: '#7c2d12',
              strokeThickness: 3,
            })
            .setOrigin(0.5);
          scene.tweens.add({
            targets: hitTxt,
            y: hitTxt.y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => hitTxt.destroy(),
          });

          if (goliathHpLocal <= 0) {
            scene.tweens.add({
              targets: goliathContainer,
              y: 60,
              angle: 90,
              alpha: 0,
              duration: 700,
              ease: 'Power2',
            });
            const winTxt = scene.add
              .text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 30, '🏆 GIANT SLAIN!', {
                fontSize: '38px',
                fill: '#FCD34D',
                fontFamily: 'Baloo 2, cursive',
                fontStyle: 'bold',
                stroke: '#78350f',
                strokeThickness: 4,
              })
              .setOrigin(0.5)
              .setAlpha(0)
              .setScale(0.6);
            scene.tweens.add({
              targets: winTxt,
              alpha: 1,
              scale: 1,
              duration: 450,
              ease: 'Back.easeOut',
            });
            finishRound(true);
          } else {
            canThrow = true;
          }
        };

        scene.physics.add.collider(stonesGroup, groundBody, (stone) => {
          if (!stone.active || stone.getData('hit')) return;
          stone.destroy();
          canThrow = true;
          if (shotsLocal <= 0 && goliathHpLocal > 0) {
            finishRound(false);
          }
        });

        const throwOrigin = { x: GAME_CONFIG.davidX + 8, y: GAME_CONFIG.davidY - 44 };

        scene.input.on('pointermove', (ptr) => {
          if (!canThrow || gameOver || shotsLocal <= 0) return;

          const dx = ptr.x - throwOrigin.x;
          const dy = ptr.y - throwOrigin.y;
          const angle = Math.atan2(dy, dx);
          drawDavid(davidGfx, GAME_CONFIG.davidX, GAME_CONFIG.davidY, angle);

          scene.aimLine.clear();
          scene.aimGlow.clear();

          const vx = Math.cos(angle) * GAME_CONFIG.stoneSpeed;
          const vy = Math.sin(angle) * GAME_CONFIG.stoneSpeed;

          for (let t = 0; t <= 0.85; t += 0.035) {
            const px = throwOrigin.x + vx * t;
            const py = throwOrigin.y + vy * t + 0.5 * GAME_CONFIG.gravity * t * t;
            if (px < 0 || px > GAME_CONFIG.width || py > GAME_CONFIG.height - 58) break;
            const alpha = 0.75 - t * 0.7;
            scene.aimGlow.fillStyle(0xfbbf24, alpha * 0.35);
            scene.aimGlow.fillCircle(px, py, 5);
            scene.aimLine.fillStyle(0xffffff, alpha);
            scene.aimLine.fillCircle(px, py, 2.5);
          }
        });

        scene.input.on('pointerdown', (ptr) => {
          if (!canThrow || gameOver || shotsLocal <= 0) return;

          const dx = ptr.x - throwOrigin.x;
          const dy = ptr.y - throwOrigin.y;
          let angle = Math.atan2(dy, dx);
          angle = Phaser.Math.Clamp(angle, -Math.PI + 0.15, -0.05);

          canThrow = false;
          scene.aimLine.clear();
          scene.aimGlow.clear();

          const stone = scene.add.circle(throwOrigin.x, throwOrigin.y, cfg.stoneSize, 0x9ca3af);
          stone.setStrokeStyle(2, 0xe5e7eb, 0.9);
          scene.physics.add.existing(stone);
          stone.body.setCircle(cfg.stoneSize);
          stone.body.setBounce(0.15);
          stone.body.setVelocity(
            Math.cos(angle) * GAME_CONFIG.stoneSpeed,
            Math.sin(angle) * GAME_CONFIG.stoneSpeed
          );
          stonesGroup.add(stone);
          stonesThrown++;
          shotsLocal--;
          callbacks.onShotsChange(shotsLocal);
          scene.shotsText.setText(`🪨 ×${shotsLocal}`);

          scene.tweens.add({
            targets: davidGfx,
            x: -4,
            duration: 80,
            yoyo: true,
            repeat: 1,
          });

          scene.time.delayedCall(2200, () => {
            if (gameOver) return;
            if (stone.active) stone.destroy();
            canThrow = true;
            if (shotsLocal <= 0 && goliathHpLocal > 0) {
              finishRound(false);
            }
          });
        });
      },
      update() {
        if (gameOver || !stonesGroup || !goliathContainer || !onStoneHit) return;
        stonesGroup.getChildren().forEach((stone) => {
          if (!stone.active || stone.getData('hit')) return;
          const gx = goliathContainer.x;
          const gy = goliathContainer.y - 52;
          if (Phaser.Math.Distance.Between(stone.x, stone.y, gx, gy) < 44) {
            onStoneHit(stone);
          }
        });
      },
      preload() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('stoneParticle', 8, 8);
        g.destroy();
      },
    },
  };

  return new Phaser.Game(config);
}

export default function DavidGoliath() {
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const callbacksRef = useRef({});
  const [gameState, setGameState] = useState('menu');
  const [pendingLevel, setPendingLevel] = useState(null);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('dg_high') || '0', 10)
  );
  const [fact, setFact] = useState(BIBLE_FACTS[0]);
  const [shotsLeft, setShotsLeft] = useState(5);
  const [goliathHp, setGoliathHp] = useState(GAME_CONFIG.goliathHp);
  const [hits, setHits] = useState(0);

  function destroyGame() {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
  }

  callbacksRef.current = buildSceneCallbacks({
    setShotsLeft,
    setScore,
    setGoliathHp,
    setHits,
    setHighScore,
    setGameState,
    highScore,
    destroyGame,
  });

  useEffect(() => {
    const t = setInterval(() => {
      setFact(BIBLE_FACTS[Math.floor(Math.random() * BIBLE_FACTS.length)]);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  function startGame(lvl = 0) {
    destroyGame();
    setLevel(lvl);
    setScore(0);
    setShotsLeft(5);
    setGoliathHp(GAME_CONFIG.goliathHp);
    setHits(0);
    setGameState('playing');
    setPendingLevel(lvl);
  }

  function cleanup() {
    destroyGame();
    setGameState('menu');
    setPendingLevel(null);
  }

  useEffect(() => {
    if (gameState !== 'playing' || pendingLevel === null || !mountRef.current) return;

    gameRef.current = createGameInstance(
      mountRef.current,
      pendingLevel,
      callbacksRef.current
    );
    setPendingLevel(null);
  }, [gameState, pendingLevel]);

  useEffect(
    () => () => {
      destroyGame();
    },
    []
  );

  const lvlCfg = GAME_CONFIG.levels[level];

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroBadge}>Arcade · 1 Samuel 17</div>
        <h1 className={styles.title}>David vs Goliath</h1>
        <p className={styles.subtitle}>
          Aim with your mouse or finger, pull back, and release faith. Five stones. One giant. Glory
          to God.
        </p>
      </header>

      <div className={styles.shell}>
        {gameState === 'menu' && (
          <div>
            <div className={styles.menuHeader}>
              <div className={styles.menuIcon}>🏹</div>
              <h2 className={styles.menuTitle}>Choose Your Level</h2>
              {highScore > 0 && (
                <div className={styles.highScore}>🏆 High Score: {highScore.toLocaleString()}</div>
              )}
            </div>

            <div className={styles.levelGrid}>
              {GAME_CONFIG.levels.map((l, i) => (
                <button
                  key={l.label}
                  type="button"
                  className={styles.levelCard}
                  style={{ '--level-color': l.color }}
                  onClick={() => startGame(i)}
                >
                  <div className={styles.levelStones}>{'🪨'.repeat(Math.min(i + 1, 3))}</div>
                  <div className={styles.levelLabel}>{l.label}</div>
                  <div className={styles.levelNum}>Level {i + 1}</div>
                </button>
              ))}
            </div>

            <div className={styles.factCard}>{fact}</div>
          </div>
        )}

        {gameState === 'playing' && (
          <div>
            <div className={styles.playBar}>
              <div className={styles.playMeta}>
                <span
                  className={styles.levelPill}
                  style={{ color: lvlCfg.color, background: `${lvlCfg.color}18` }}
                >
                  {lvlCfg.label}
                </span>
                <span className={styles.statPill}>🪨 {shotsLeft} stones</span>
                <span className={styles.statPill}>{getHpString(goliathHp)}</span>
                <span className={styles.statPill}>Score {score}</span>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={cleanup}>
                ✕ Quit
              </button>
            </div>

            <div className={styles.gameFrame}>
              <div ref={mountRef} className={styles.gameMount} />
            </div>

            <p className={styles.hint}>Move to aim · Click or tap to sling · Hit Goliath 5 times to win</p>
            <div className={styles.factCard} style={{ marginTop: 12 }}>
              {fact}
            </div>
          </div>
        )}

        {gameState === 'win' && (
          <div className={styles.resultCard}>
            <div className={`${styles.resultEmoji} ${styles.bounce}`}>🏆</div>
            <h2 className={styles.resultTitle}>Giant Slain!</h2>
            <div className={styles.resultScore}>{score.toLocaleString()}</div>
            <div className={styles.resultMeta}>
              🏆 High Score: {Math.max(highScore, score).toLocaleString()} · {hits} direct hits
            </div>
            <div className={`${styles.verseBox} ${styles.verseWin}`}>
              "David triumphed over the Philistine with a sling and a stone; without a sword in his
              hand." — 1 Samuel 17:50
            </div>
            <div className={styles.actions}>
              {level < GAME_CONFIG.levels.length - 1 && (
                <button type="button" className="btn btn-blue" onClick={() => startGame(level + 1)}>
                  Next Level →
                </button>
              )}
              <button type="button" className="btn btn-outline" onClick={() => startGame(level)}>
                Play Again
              </button>
              <button type="button" className="btn btn-outline" onClick={cleanup}>
                Menu
              </button>
            </div>
          </div>
        )}

        {gameState === 'lose' && (
          <div className={styles.resultCard}>
            <div className={styles.resultEmoji}>💪</div>
            <h2 className={styles.resultTitle}>Keep Trusting God!</h2>
            <p className={styles.resultMeta}>
              David didn't give up — and neither should you. Line up your shot and try again.
            </p>
            <div className={`${styles.verseBox} ${styles.verseLose}`}>
              "Be strong and courageous. Do not be afraid; the LORD your God will be with you." —
              Joshua 1:9
            </div>
            <div className={styles.actions}>
              <button type="button" className="btn btn-orange" onClick={() => startGame(level)}>
                Try Again
              </button>
              <button type="button" className="btn btn-outline" onClick={cleanup}>
                Choose Level
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
