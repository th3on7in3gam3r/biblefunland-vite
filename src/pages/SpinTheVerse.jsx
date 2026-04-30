import { useState, useRef } from 'react';

const REELS = [
  { theme: 'Faith', emoji: '✝️', color: '#3B82F6' },
  { theme: 'Hope', emoji: '⭐', color: '#8B5CF6' },
  { theme: 'Love', emoji: '❤️', color: '#EC4899' },
  { theme: 'Strength', emoji: '💪', color: '#F97316' },
  { theme: 'Peace', emoji: '☮️', color: '#10B981' },
  { theme: 'Wisdom', emoji: '📜', color: '#F59E0B' },
  { theme: 'Grace', emoji: '🕊️', color: '#14B8A6' },
  { theme: 'Joy', emoji: '😊', color: '#A855F7' },
];

const WINNING_COMBOS = [
  {
    combo: ['Faith', 'Hope', 'Love'],
    verse:
      '"And now these three remain: faith, hope and love. But the greatest of these is love." — 1 Corinthians 13:13',
    devotional:
      'The divine trinity of virtues! Paul says these are the three things that outlast everything — including spiritual gifts and prophecy. Today, ask yourself: how are faith, hope, and love at work in your life right now?',
  },
  {
    combo: ['Strength', 'Strength', 'Strength'],
    verse: '"I can do all this through him who gives me strength." — Philippians 4:13',
    devotional:
      'Triple strength! Paul wrote this from prison — not from a place of abundance, but of absolute trust. Today you are strong not because of what you have, but because of Who lives in you.',
  },
  {
    combo: ['Peace', 'Peace', 'Peace'],
    verse:
      '"The Lord gives strength to his people; the Lord blesses his people with peace." — Psalm 29:11',
    devotional:
      'Perfect peace! The Hebrew word "Shalom" means far more than the absence of conflict — it means wholeness, completeness, and wellbeing. Receive that shalom today.',
  },
  {
    combo: ['Wisdom', 'Wisdom', 'Wisdom'],
    verse:
      '"If any of you lacks wisdom, you should ask God, who gives generously to all." — James 1:5',
    devotional:
      "Triple wisdom! This is one of the most practical promises in scripture. God doesn't give wisdom grudgingly — He gives it generously to anyone who asks in faith. What decision are you facing today?",
  },
  {
    combo: ['Grace', 'Grace', 'Grace'],
    verse:
      '"For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God." — Ephesians 2:8',
    devotional:
      "Grace upon grace upon grace! You didn't earn salvation and you don't need to. It was given — freely, completely, permanently. Rest in that today.",
  },
  {
    combo: ['Joy', 'Joy', 'Joy'],
    verse: '"The joy of the Lord is your strength." — Nehemiah 8:10',
    devotional:
      'Pure joy! This verse was spoken to a people weeping over their failures — and they were told that joy, not grief, would be their strength. Joy is not the absence of trouble; it is the presence of God.',
  },
];

const RANDOM_VERSES = [
  {
    verse: '"Trust in the Lord with all your heart." — Proverbs 3:5',
    devotional:
      "Complete trust — not partial, not when it's convenient, but with ALL your heart. What area of your life needs that full surrender today?",
  },
  {
    verse: '"For God so loved the world that he gave his one and only Son." — John 3:16',
    devotional:
      'The most famous verse in the Bible. Before you read it as a fact — read it as a personal declaration. God loved YOU so much He gave everything.',
  },
  {
    verse: '"Be still and know that I am God." — Psalm 46:10',
    devotional:
      'In a world that never stops moving, God invites you to stillness. Not laziness — but the kind of quiet confidence that comes from knowing who is in control.',
  },
  {
    verse: '"Cast all your anxiety on him because he cares for you." — 1 Peter 5:7',
    devotional:
      'Every worry, every fear, every "what if" — God says to throw it onto Him. Not because He\'ll fix it your way, but because He genuinely cares about you.',
  },
  {
    verse: '"He who began a good work in you will carry it on to completion." — Philippians 1:6',
    devotional:
      "God doesn't start things He doesn't finish. That includes you. No matter how incomplete you feel, the Author of your story isn't done writing.",
  },
];

export default function SpinTheVerse() {
  const [spinning, setSpinning] = useState(false);
  const [reelValues, setReelValues] = useState([null, null, null]);
  const [result, setResult] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | spinning | result
  const timerRef = useRef(null);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setPhase('spinning');
    setResult(null);
    setReelValues([null, null, null]);
    setSpinCount((c) => c + 1);

    // Animate each reel with staggered stops
    const chosen = [
      REELS[Math.floor(Math.random() * REELS.length)],
      REELS[Math.floor(Math.random() * REELS.length)],
      REELS[Math.floor(Math.random() * REELS.length)],
    ];

    // Rapid cycling animation
    let interval = setInterval(() => {
      setReelValues([
        REELS[Math.floor(Math.random() * REELS.length)],
        REELS[Math.floor(Math.random() * REELS.length)],
        REELS[Math.floor(Math.random() * REELS.length)],
      ]);
    }, 80);

    // Stop reel 1
    setTimeout(() => setReelValues((v) => [chosen[0], v[1] || REELS[0], v[2] || REELS[0]]), 1000);
    // Stop reel 2
    setTimeout(() => setReelValues((v) => [chosen[0], chosen[1], v[2] || REELS[0]]), 1600);
    // Stop reel 3
    setTimeout(() => {
      clearInterval(interval);
      setReelValues([chosen[0], chosen[1], chosen[2]]);
      setSpinning(false);

      // Check for win
      const combo = [chosen[0].theme, chosen[1].theme, chosen[2].theme];
      let win = WINNING_COMBOS.find((w) => w.combo.every((c, i) => c === combo[i]));

      if (!win && chosen[0].theme === chosen[1].theme && chosen[1].theme === chosen[2].theme) {
        // Generic triple match
        win = {
          verse: `"The Lord is good to all; he has compassion on all he has made." — Psalm 145:9`,
          devotional: `Triple ${chosen[0].theme}! A special blessing today — God's compassion covers every corner of your life.`,
        };
      }

      if (win) setTotalWins((w) => w + 1);

      const finalResult = win || RANDOM_VERSES[Math.floor(Math.random() * RANDOM_VERSES.length)];
      setTimeout(() => {
        setResult(finalResult);
        setPhase('result');
      }, 200);
    }, 2200);
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1A0533,#0A1A2E)',
          padding: '52px 36px 40px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#FCD34D,#F472B6,#60A5FA,#34D399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          🎰 Spin the Verse
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.92rem', fontWeight: 500 }}>
          Match 3 themes = jackpot devotional! Every spin gets a verse. The Word never fails.
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {[
            ['🎰', spinCount, 'Total Spins', 'var(--violet)'],
            ['🏆', totalWins, 'Jackpots', 'var(--yellow)'],
            ['📖', spinCount, 'Verses Read', 'var(--blue)'],
          ].map(([e, v, l, c], i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                borderRadius: 16,
                padding: 18,
                border: '1.5px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 5 }}>{e}</div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: c,
                }}
              >
                {v}
              </div>
              <div
                style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--ink3)', marginTop: 3 }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>

        {/* Slot machine */}
        <div
          style={{
            background: 'linear-gradient(135deg,#1C1B3A,#2D1B69)',
            borderRadius: 28,
            padding: '36px 32px',
            boxShadow: '0 30px 80px rgba(99,102,241,.25), inset 0 1px 0 rgba(255,255,255,.08)',
            marginBottom: 24,
            border: '2px solid rgba(139,92,246,.3)',
          }}
        >
          {/* Machine top lights */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: c,
                  boxShadow: `0 0 8px ${c}`,
                  animation: spinning
                    ? `blink ${0.3 + i * 0.1}s ease-in-out infinite alternate`
                    : 'none',
                }}
              />
            ))}
          </div>

          {/* Reels */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 14,
              marginBottom: 28,
            }}
          >
            {[0, 1, 2].map((i) => {
              const reel = reelValues[i];
              return (
                <div
                  key={i}
                  style={{
                    background: 'rgba(0,0,0,.4)',
                    borderRadius: 18,
                    border: '2px solid rgba(255,255,255,.08)',
                    height: 130,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Highlight line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: 2,
                      background: 'rgba(139,92,246,.4)',
                    }}
                  />
                  {reel ? (
                    <>
                      <div
                        style={{
                          fontSize: '3rem',
                          animation: spinning ? 'reelSpin .1s ease-in-out infinite' : 'none',
                        }}
                      >
                        {reel.emoji}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Baloo 2',cursive",
                          fontSize: '.88rem',
                          fontWeight: 800,
                          color: reel.color,
                        }}
                      >
                        {reel.theme}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        fontSize: '2.5rem',
                        opacity: 0.3,
                        animation: 'reelSpin .15s linear infinite',
                      }}
                    >
                      🎰
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Spin button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={spin}
              disabled={spinning}
              style={{
                width: 140,
                height: 64,
                borderRadius: 18,
                background: spinning
                  ? 'rgba(255,255,255,.1)'
                  : 'linear-gradient(135deg,#F97316,#EF4444)',
                border: 'none',
                color: 'white',
                cursor: spinning ? 'not-allowed' : 'pointer',
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.3rem',
                fontWeight: 800,
                boxShadow: spinning ? 'none' : '0 8px 28px rgba(239,68,68,.45)',
                transition: 'all .25s',
                letterSpacing: 0.5,
              }}
            >
              {spinning ? '⏳ ...' : '🎰 SPIN!'}
            </button>
            <div
              style={{
                fontSize: '.72rem',
                color: 'rgba(255,255,255,.35)',
                marginTop: 8,
                fontWeight: 500,
              }}
            >
              Every spin gives a scripture verse 📖
            </div>
          </div>
        </div>

        {/* Result */}
        {result && phase === 'result' && (
          <div style={{ animation: 'popIn .4s cubic-bezier(.34,1.56,.64,1)' }}>
            {result.isWin !== false && WINNING_COMBOS.some((w) => w.verse === result.verse) && (
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: 'var(--yellow)',
                    animation: 'glow 1s ease-in-out infinite alternate',
                  }}
                >
                  🏆 JACKPOT! Match! 🏆
                </div>
              </div>
            )}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 24,
                border: '1.5px solid var(--border)',
                boxShadow: 'var(--sh)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg,#1E1B4B,#2D1B69)',
                  padding: '22px 28px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#A5B4FC',
                    marginBottom: 6,
                  }}
                >
                  📖 Your Verse
                </div>
                <div
                  style={{
                    fontSize: '.92rem',
                    color: 'white',
                    fontStyle: 'italic',
                    lineHeight: 1.7,
                    fontWeight: 500,
                  }}
                >
                  {result.verse}
                </div>
              </div>
              <div style={{ padding: '22px 28px' }}>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '.88rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 8,
                  }}
                >
                  ✍️ Reflection
                </div>
                <p
                  style={{
                    fontSize: '.87rem',
                    color: 'var(--ink2)',
                    lineHeight: 1.8,
                    fontWeight: 500,
                    marginBottom: 20,
                  }}
                >
                  {result.devotional}
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-violet" onClick={spin}>
                    🎰 Spin Again
                  </button>
                  <a href="/share" className="btn btn-outline">
                    🔗 Share This Verse
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes blink{0%{opacity:.3}100%{opacity:1}}
        @keyframes reelSpin{0%{transform:translateY(-4px)}100%{transform:translateY(4px)}}
        @keyframes popIn{from{opacity:0;transform:scale(.9) translateY(10px)}to{opacity:1;transform:none}}
        @keyframes glow{0%{text-shadow:0 0 10px #FCD34D}100%{text-shadow:0 0 30px #FCD34D,0 0 60px #F59E0B}}
      `}</style>
    </div>
  );
}
