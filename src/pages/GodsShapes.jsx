import { useState } from 'react';

const SHAPES = [
  {
    name: 'Circle',
    emoji: '☀️',
    color: '#FCD34D',
    border: '#D97706',
    question: 'What shape is the sun?',
    answer: 'Circle',
    choices: ['Circle', 'Square', 'Triangle', 'Star'],
    fact: 'God made the sun — a perfect circle — to give us light every day!',
    svg: <circle cx="100" cy="100" r="70" fill="#FCD34D" stroke="#D97706" strokeWidth="4" />,
  },
  {
    name: 'Crescent',
    emoji: '🌙',
    color: '#A5B4FC',
    border: '#4338CA',
    question: 'What shape is the moon?',
    answer: 'Crescent',
    choices: ['Circle', 'Crescent', 'Square', 'Oval'],
    fact: 'God made the moon to light up the night! It takes 28 days to go around the Earth.',
    svg: (
      <>
        <circle cx="110" cy="100" r="65" fill="#A5B4FC" stroke="#4338CA" strokeWidth="3" />
        <circle cx="130" cy="95" r="58" fill="#E0E7FF" stroke="none" />
      </>
    ),
  },
  {
    name: 'Oval',
    emoji: '🐟',
    color: '#34D399',
    border: '#059669',
    question: "What shape is a fish's body?",
    answer: 'Oval',
    choices: ['Circle', 'Rectangle', 'Oval', 'Triangle'],
    fact: 'God filled the seas with fish on Day 5 of creation — millions of kinds!',
    svg: (
      <>
        <ellipse
          cx="105"
          cy="100"
          rx="75"
          ry="50"
          fill="#34D399"
          stroke="#059669"
          strokeWidth="3"
        />
        <polygon points="180,100 205,75 205,125" fill="#059669" stroke="#047857" strokeWidth="2" />
      </>
    ),
  },
  {
    name: 'Triangle',
    emoji: '⛰️',
    color: '#9CA3AF',
    border: '#4B5563',
    question: 'What shape is a mountain?',
    answer: 'Triangle',
    choices: ['Circle', 'Triangle', 'Square', 'Oval'],
    fact: 'God made mountains on Day 3! Moses met God on Mount Sinai.',
    svg: <polygon points="100,25 180,175 20,175" fill="#9CA3AF" stroke="#4B5563" strokeWidth="3" />,
  },
  {
    name: 'Rectangle',
    emoji: '🚪',
    color: '#A78BFA',
    border: '#6D28D9',
    question: "What shape is the door of Noah's Ark?",
    answer: 'Rectangle',
    choices: ['Circle', 'Oval', 'Triangle', 'Rectangle'],
    fact: "Noah's Ark had a big door — God told Noah exactly how to build it!",
    svg: (
      <rect
        x="30"
        y="30"
        width="140"
        height="140"
        rx="8"
        fill="#A78BFA"
        stroke="#6D28D9"
        strokeWidth="3"
      />
    ),
  },
  {
    name: 'Star',
    emoji: '⭐',
    color: '#FCD34D',
    border: '#D97706',
    question: 'What shape did the wise men follow to find Jesus?',
    answer: 'Star',
    choices: ['Moon', 'Sun', 'Star', 'Cloud'],
    fact: 'A special star guided the wise men to baby Jesus in Bethlehem!',
    svg: (
      <polygon
        points="100,15 118,65 170,65 128,95 142,145 100,115 58,145 72,95 30,65 82,65"
        fill="#FCD34D"
        stroke="#D97706"
        strokeWidth="2"
      />
    ),
  },
  {
    name: 'Heart',
    emoji: '❤️',
    color: '#F472B6',
    border: '#BE185D',
    question: "What shape shows God's love for us?",
    answer: 'Heart',
    choices: ['Circle', 'Heart', 'Star', 'Triangle'],
    fact: '"For God so loved the world" — God\'s love for us is bigger than any heart shape!',
    svg: (
      <path
        d="M100,145 Q30,95 30,60 A35,35 0 0,1 100,50 A35,35 0 0,1 170,60 Q170,95 100,145Z"
        fill="#F472B6"
        stroke="#BE185D"
        strokeWidth="2"
      />
    ),
  },
  {
    name: 'Cross',
    emoji: '✝️',
    color: '#6366F1',
    border: '#4338CA',
    question: 'What shape reminds us Jesus loves us?',
    answer: 'Cross',
    choices: ['Plus', 'Circle', 'Cross', 'Square'],
    fact: 'The cross reminds us that Jesus died and rose again so we can know God!',
    svg: (
      <>
        <rect
          x="75"
          y="20"
          width="50"
          height="160"
          rx="8"
          fill="#6366F1"
          stroke="#4338CA"
          strokeWidth="2"
        />
        <rect
          x="20"
          y="75"
          width="160"
          height="50"
          rx="8"
          fill="#6366F1"
          stroke="#4338CA"
          strokeWidth="2"
        />
      </>
    ),
  },
];

export default function GodsShapes() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showFact, setShowFact] = useState(false);

  const shape = SHAPES[idx];
  const correct = selected === shape.answer;

  function choose(ans) {
    if (selected) return;
    setSelected(ans);
    if (ans === shape.answer) setScore((s) => s + 1);
    setShowFact(true);
  }

  function next() {
    setIdx((i) => (i + 1) % SHAPES.length);
    setSelected(null);
    setShowFact(false);
  }

  return (
    <div
      style={{
        background: 'linear-gradient(180deg,#FFF7ED 0%,#FDF4FF 100%)',
        minHeight: '100vh',
        fontFamily: 'Poppins,sans-serif',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg,#D97706,#9333EA)',
          padding: '28px 24px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>🔷</div>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.6rem,4vw,2.4rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 4,
          }}
        >
          God's Shapes
        </h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.82rem', fontWeight: 600 }}>
          Shapes from God's amazing creation!
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
          <div
            style={{
              background: 'rgba(255,255,255,.2)',
              borderRadius: 100,
              padding: '4px 16px',
              fontSize: '.8rem',
              fontWeight: 800,
              color: 'white',
            }}
          >
            🏆 Score: {score} / {SHAPES.length}
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,.15)',
              borderRadius: 100,
              padding: '4px 16px',
              fontSize: '.78rem',
              fontWeight: 800,
              color: 'white',
            }}
          >
            {idx + 1} / {SHAPES.length}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px' }}>
        {/* Shape card */}
        <div
          style={{
            background: 'white',
            borderRadius: 28,
            padding: '28px 24px',
            boxShadow: '0 8px 40px rgba(0,0,0,.12)',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {/* SVG shape */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.15))' }}
            >
              {shape.svg}
            </svg>
          </div>

          {/* Question */}
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1rem,3vw,1.25rem)',
              fontWeight: 800,
              color: '#1F2937',
              marginBottom: 20,
              lineHeight: 1.4,
            }}
          >
            {shape.emoji} {shape.question}
          </div>

          {/* Choices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {shape.choices.map((choice) => {
              const isCorrect = choice === shape.answer;
              const isSelected = choice === selected;
              let bg = '#F9FAFB',
                borderC = '#E5E7EB',
                textC = '#374151';
              if (selected) {
                if (isCorrect) {
                  bg = '#ECFDF5';
                  borderC = '#059669';
                  textC = '#059669';
                } else if (isSelected) {
                  bg = '#FEF2F2';
                  borderC = '#EF4444';
                  textC = '#EF4444';
                }
              }
              return (
                <button
                  key={choice}
                  onClick={() => choose(choice)}
                  disabled={!!selected}
                  style={{
                    padding: '14px',
                    borderRadius: 16,
                    border: `3px solid ${borderC}`,
                    background: bg,
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: textC,
                    cursor: selected ? 'default' : 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.background = shape.color + '18';
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.background = '#F9FAFB';
                  }}
                >
                  {isCorrect && selected ? '✅ ' : isSelected && !isCorrect ? '❌ ' : ''}
                  {choice}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fact */}
        {showFact && (
          <div
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '18px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,.08)',
              marginBottom: 14,
              animation: 'popIn .4s ease',
              border: `2px solid ${correct ? '#10B981' : '#F59E0B'}22`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.2rem',
                fontWeight: 800,
                color: correct ? '#059669' : '#D97706',
                marginBottom: 8,
              }}
            >
              {correct ? "🎉 That's right!" : `💡 It\'s a ${shape.answer}!`}
            </div>
            <div
              style={{
                fontSize: '.86rem',
                color: '#374151',
                lineHeight: 1.7,
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              🌟 {shape.fact}
            </div>
            <button
              onClick={next}
              style={{
                background: 'linear-gradient(135deg,#D97706,#9333EA)',
                color: 'white',
                border: 'none',
                borderRadius: 14,
                padding: '12px 28px',
                fontFamily: 'Poppins,sans-serif',
                fontWeight: 800,
                fontSize: '.9rem',
                cursor: 'pointer',
              }}
            >
              Next Shape ✨
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
