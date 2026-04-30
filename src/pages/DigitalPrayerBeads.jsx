import { useState, useEffect, useRef } from 'react';

const BEADS = [
  {
    label: 'Gratitude',
    color: '#F59E0B',
    verse: '"Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus."',
    ref: '1 Thessalonians 5:18',
    prompt:
      'Breathe in... Name one thing you are grateful for today. Breathe out... Say "Thank you, Lord."',
    icon: '🙏',
  },
  {
    label: 'Confession',
    color: '#EF4444',
    verse: '"If we confess our sins, he is faithful and just and will forgive us our sins."',
    ref: '1 John 1:9',
    prompt:
      'Breathe in... Bring your failures to God honestly. Breathe out... Receive His complete forgiveness.',
    icon: '❤️‍🔥',
  },
  {
    label: 'Surrender',
    color: '#8B5CF6',
    verse: '"Trust in the Lord with all your heart and lean not on your own understanding."',
    ref: 'Proverbs 3:5',
    prompt:
      'Breathe in... Name the thing you are holding too tightly. Breathe out... Open your hands and release it to God.',
    icon: '🕊️',
  },
  {
    label: 'Peace',
    color: '#10B981',
    verse:
      '"Peace I leave with you; my peace I give you. I do not give to you as the world gives."',
    ref: 'John 14:27',
    prompt:
      'Breathe in deeply... Feel the peace that surpasses understanding. Breathe out slowly... Let anxiety leave with the breath.',
    icon: '☮️',
  },
  {
    label: 'Strength',
    color: '#3B82F6',
    verse: '"I can do all this through him who gives me strength."',
    ref: 'Philippians 4:13',
    prompt:
      'Breathe in... Feel the strength of Christ within you. Breathe out... Release your weakness into His capable hands.',
    icon: '💪',
  },
  {
    label: 'Others',
    color: '#EC4899',
    verse: '"Carry each other\'s burdens, and in this way you will fulfill the law of Christ."',
    ref: 'Galatians 6:2',
    prompt:
      'Breathe in... Bring someone you love to mind. Breathe out... Lift them up to God right now. Say their name.',
    icon: '🫶',
  },
  {
    label: 'Presence',
    color: '#F97316',
    verse: '"Where can I go from your Spirit? Where can I flee from your presence?"',
    ref: 'Psalm 139:7',
    prompt:
      'Breathe in... God is here. Right here. Right now. Breathe out... You are never alone, not for a single second.',
    icon: '✨',
  },
  {
    label: 'Future',
    color: '#14B8A6',
    verse: '"For I know the plans I have for you, declares the Lord — plans to prosper you."',
    ref: 'Jeremiah 29:11',
    prompt:
      "Breathe in... Your future is held by the most faithful Being in the universe. Breathe out... Release tomorrow's worries today.",
    icon: '🌟',
  },
  {
    label: 'Identity',
    color: '#6366F1',
    verse:
      '"You are a chosen people, a royal priesthood, a holy nation, God\'s special possession."',
    ref: '1 Peter 2:9',
    prompt:
      'Breathe in... You are chosen. You are royal. You are holy. Breathe out... Receive your true identity in Christ.',
    icon: '👑',
  },
  {
    label: 'Rest',
    color: '#A855F7',
    verse: '"Come to me, all you who are weary and burdened, and I will give you rest."',
    ref: 'Matthew 11:28',
    prompt:
      'Breathe in... Come as you are. Tired, weary, burdened — bring it all. Breathe out... This is the invitation: rest.',
    icon: '😌',
  },
];

const AMBIENTS = [
  { id: 'none', label: '🔇 Silence' },
  { id: 'bells', label: '🔔 Soft Bells' },
  { id: 'hum', label: '🎵 Gentle Hum' },
];

export default function DigitalPrayerBeads() {
  const [active, setActive] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | breathing | done
  const [breathPhase, setBreathPhase] = useState('in'); // in | hold | out
  const [ambient, setAmbient] = useState('none');
  const [breathCount, setBreathCount] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);

  function selectBead(idx) {
    if (completed.includes(idx)) return;
    setActive(idx);
    setPhase('breathing');
    setBreathPhase('in');
    setBreathCount(0);
    playBreathCycle();
  }

  function playBreathCycle() {
    // in: 4s, hold: 2s, out: 6s
    clearTimeout(timerRef.current);
    setBreathPhase('in');
    timerRef.current = setTimeout(() => {
      setBreathPhase('hold');
      timerRef.current = setTimeout(() => {
        setBreathPhase('out');
        timerRef.current = setTimeout(() => {
          setBreathCount((c) => {
            const next = c + 1;
            if (next >= 2) {
              // Done with this bead
              setPhase('done');
            } else {
              playBreathCycle();
            }
            return next;
          });
        }, 6000);
      }, 2000);
    }, 4000);
  }

  function completeBead() {
    if (active === null) return;
    const newCompleted = [...completed, active];
    setCompleted(newCompleted);
    setActive(null);
    setPhase('idle');
    clearTimeout(timerRef.current);
    if (newCompleted.length === BEADS.length) setAllDone(true);
  }

  function reset() {
    setCompleted([]);
    setActive(null);
    setPhase('idle');
    setAllDone(false);
    setBreathCount(0);
    clearTimeout(timerRef.current);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const bead = active !== null ? BEADS[active] : null;

  // SVG rosary layout
  const cx = 300,
    cy = 200,
    r = 155;
  const beadPositions = BEADS.map((_, i) => {
    const angle = (i / BEADS.length) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1A0A2E,#0A1A0F)',
          padding: '52px 36px 36px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#C4B5FD,#FCD34D,#6EE7B7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          📿 Digital Prayer Beads
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.92rem', fontWeight: 500 }}>
          Meditate through scripture one breath at a time. Click each bead. Breathe. Pray.
        </p>
      </div>

      {allDone ? (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: 18 }}>🙏</div>
          <h2
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 10,
            }}
          >
            Meditation Complete
          </h2>
          <p
            style={{
              fontSize: '.9rem',
              color: 'var(--ink2)',
              lineHeight: 1.8,
              fontWeight: 500,
              marginBottom: 24,
            }}
          >
            You completed all 10 prayer beads — gratitude, confession, surrender, peace, strength,
            others, presence, future, identity, and rest. You've touched the whole heart of God
            today.
          </p>
          <div
            style={{
              background: 'var(--green-bg)',
              border: '1.5px solid var(--green)',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 24,
              fontSize: '.86rem',
              color: 'var(--ink2)',
              fontStyle: 'italic',
              fontWeight: 500,
            }}
          >
            "And the peace of God, which transcends all understanding, will guard your hearts and
            your minds in Christ Jesus." — Philippians 4:7
          </div>
          <button className="btn btn-violet" onClick={reset}>
            🔄 Begin Again
          </button>
        </div>
      ) : (
        <div
          style={{
            maxWidth: 860,
            margin: '0 auto',
            padding: '32px 20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 28,
            alignItems: 'start',
          }}
        >
          {/* Beads SVG */}
          <div>
            <svg viewBox="0 0 600 400" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {/* Connecting cord */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="rgba(139,92,246,.25)"
                strokeWidth="3"
                strokeDasharray="6,4"
              />
              {/* Center cross */}
              <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                fontSize="28"
                style={{ filter: 'drop-shadow(0 0 8px rgba(196,181,253,.6))' }}
              >
                ✝️
              </text>
              {/* Beads */}
              {BEADS.map((b, i) => {
                const pos = beadPositions[i];
                const isDone = completed.includes(i);
                const isActive = active === i;
                return (
                  <g
                    key={i}
                    onClick={() => !isDone && phase === 'idle' && selectBead(i)}
                    style={{ cursor: isDone ? 'default' : 'pointer' }}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isActive ? 22 : 16}
                      fill={isDone ? b.color : isActive ? b.color : 'rgba(30,30,50,.8)'}
                      stroke={isDone || isActive ? b.color : 'rgba(139,92,246,.3)'}
                      strokeWidth={isActive ? 3 : 2}
                      style={{
                        transition: 'all .3s',
                        filter: isActive
                          ? `drop-shadow(0 0 12px ${b.color})`
                          : isDone
                            ? `drop-shadow(0 0 4px ${b.color})`
                            : 'none',
                      }}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 5}
                      textAnchor="middle"
                      fontSize={isActive ? 14 : 10}
                      fill="white"
                    >
                      {b.icon}
                    </text>
                    {isDone && (
                      <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="11">
                        ✓
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            <div
              style={{
                textAlign: 'center',
                fontSize: '.8rem',
                color: 'var(--ink3)',
                fontWeight: 500,
                marginTop: -8,
              }}
            >
              {completed.length}/10 beads completed · Click a bead to begin
            </div>
          </div>

          {/* Active bead panel */}
          <div>
            {phase === 'idle' && !bead && (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 22,
                  border: '1.5px solid var(--border)',
                  padding: '32px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 14, opacity: 0.4 }}>📿</div>
                <h3
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 8,
                  }}
                >
                  Click any bead to begin
                </h3>
                <p
                  style={{
                    fontSize: '.84rem',
                    color: 'var(--ink3)',
                    fontWeight: 500,
                    lineHeight: 1.7,
                  }}
                >
                  Each bead takes 2-3 minutes. You can pause between beads or complete all 10 in one
                  session (~25 minutes).
                </p>
              </div>
            )}

            {bead && (phase === 'breathing' || phase === 'done') && (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 22,
                  border: `2px solid ${bead.color}44`,
                  boxShadow: `0 8px 32px ${bead.color}22`,
                }}
              >
                {/* Breath animation */}
                <div
                  style={{
                    background: `linear-gradient(135deg,${bead.color}22,${bead.color}08)`,
                    padding: '32px',
                    textAlign: 'center',
                    borderRadius: '20px 20px 0 0',
                  }}
                >
                  <div
                    style={{
                      fontSize: '3.5rem',
                      marginBottom: 12,
                      display: 'inline-block',
                      animation:
                        phase === 'breathing'
                          ? `${breathPhase === 'in' ? 'breatheIn' : breathPhase === 'out' ? 'breatheOut' : 'none'} 1s ease`
                          : 'none',
                    }}
                  >
                    {bead.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: bead.color,
                      marginBottom: 8,
                    }}
                  >
                    {bead.label}
                  </div>

                  {phase === 'breathing' && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          border: `3px solid ${bead.color}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          animation: `${breathPhase === 'in' ? 'expandCircle' : breathPhase === 'out' ? 'shrinkCircle' : 'none'} ${breathPhase === 'in' ? '4' : breathPhase === 'out' ? '6' : '0'}s ease forwards`,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Baloo 2',cursive",
                            fontSize: '.85rem',
                            fontWeight: 800,
                            color: bead.color,
                          }}
                        >
                          {breathPhase === 'in' ? 'IN' : breathPhase === 'hold' ? 'HOLD' : 'OUT'}
                        </div>
                      </div>
                      <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--ink3)' }}>
                        {breathPhase === 'in'
                          ? 'Breathe in for 4 counts'
                          : breathPhase === 'hold'
                            ? 'Hold for 2 counts'
                            : 'Breathe out for 6 counts'}
                      </div>
                    </div>
                  )}

                  {phase === 'done' && (
                    <div style={{ fontSize: '.88rem', color: 'var(--green)', fontWeight: 700 }}>
                      ✓ Breath complete
                    </div>
                  )}
                </div>

                <div style={{ padding: '22px 26px' }}>
                  <div
                    style={{
                      background: 'var(--violet-bg)',
                      borderLeft: `3px solid ${bead.color}`,
                      borderRadius: '0 12px 12px 0',
                      padding: '12px 14px',
                      marginBottom: 14,
                      fontSize: '.86rem',
                      color: 'var(--ink)',
                      fontStyle: 'italic',
                      fontWeight: 500,
                      lineHeight: 1.6,
                    }}
                  >
                    "{bead.verse}" — {bead.ref}
                  </div>
                  <p
                    style={{
                      fontSize: '.85rem',
                      color: 'var(--ink2)',
                      lineHeight: 1.75,
                      fontWeight: 500,
                      marginBottom: 18,
                    }}
                  >
                    {bead.prompt}
                  </p>

                  {phase === 'done' && (
                    <button
                      className="btn btn-green"
                      onClick={completeBead}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Next Bead →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes breatheIn{from{transform:scale(1)}to{transform:scale(1.15)}}
        @keyframes breatheOut{from{transform:scale(1.15)}to{transform:scale(0.9)}}
        @keyframes expandCircle{from{transform:scale(0.7);opacity:.5}to{transform:scale(1.3);opacity:1}}
        @keyframes shrinkCircle{from{transform:scale(1.3);opacity:1}to{transform:scale(0.7);opacity:.5}}
      `}</style>
    </div>
  );
}
