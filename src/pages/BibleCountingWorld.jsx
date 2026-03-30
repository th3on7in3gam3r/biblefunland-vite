import { useState } from 'react';

const PROBLEMS = [
  // Level 1: Counting 1-10
  {
    level: 1,
    story: 'God made the world in 6 days, then rested on day 7.',
    question: 'How many days did God work?',
    emoji: '☀️',
    count: 6,
    answer: 6,
    choices: [5, 6, 7, 8],
    fact: "God created EVERYTHING in just 6 days — that's amazing!",
    visual: '☀️'.repeat(6),
  },
  {
    level: 1,
    story: 'Noah took 2 of every animal on the ark. Here are some animals:',
    question: 'Count the doves with Noah!',
    emoji: '🕊️',
    count: 2,
    answer: 2,
    choices: [1, 2, 3, 4],
    fact: 'God told Noah to bring 2 of every creature — one male and one female!',
    visual: '🕊️🕊️',
  },
  {
    level: 1,
    story: 'Jesus chose special helpers called disciples.',
    question: 'Jesus chose 12 disciples. Can you count to 12?',
    emoji: '👤',
    count: 12,
    answer: 12,
    choices: [10, 11, 12, 13],
    fact: "The 12 disciples helped Jesus teach people about God's love!",
    visual: '👤'.repeat(12),
  },
  {
    level: 1,
    story: 'David picked up stones to fight Goliath.',
    question: 'David picked up 5 smooth stones. Count them!',
    emoji: '🪨',
    count: 5,
    answer: 5,
    choices: [3, 4, 5, 6],
    fact: 'David only needed 1 stone — God was with him!',
    visual: '🪨'.repeat(5),
  },
  {
    level: 1,
    story: 'Baby Moses was hidden in a basket by his mom.',
    question: 'How many babies are in the basket?',
    emoji: '👶',
    count: 1,
    answer: 1,
    choices: [1, 2, 3, 4],
    fact: 'God protected baby Moses and he grew up to lead Israel out of Egypt!',
    visual: '👶',
  },
  // Level 2: Addition up to 20
  {
    level: 2,
    story: 'Jesus had 5 loaves of bread and 2 fish. A boy shared his lunch!',
    question: 'How many things did the boy share? 5 loaves + 2 fish =',
    emoji: '🍞',
    count: 7,
    answer: 7,
    choices: [6, 7, 8, 9],
    fact: "Jesus used 5 + 2 = 7 things to feed 5,000 people. That's a miracle!",
    visual: '🍞🍞🍞🍞🍞🐟🐟',
  },
  {
    level: 2,
    story: 'The wise men brought 3 gifts to Jesus: gold, frankincense, and myrrh.',
    question: 'Balthazar had 3 boxes of gold and 4 bottles of perfume. How many gifts total?',
    emoji: '🎁',
    count: 7,
    answer: 7,
    choices: [5, 6, 7, 8],
    fact: '3 + 4 = 7 gifts. The wise men traveled a very long way to honor Jesus!',
    visual: '🎁'.repeat(7),
  },
  {
    level: 2,
    story: 'Daniel prayed 3 times every day, even when it was dangerous!',
    question: 'How many times did Daniel pray in 4 days? 3 + 3 + 3 + 3 =',
    emoji: '🙏',
    count: 12,
    answer: 12,
    choices: [10, 11, 12, 13],
    fact: "3 × 4 = 12 prayers! Daniel's faithfulness landed him in the lions' den — but God saved him!",
    visual: '🙏'.repeat(12),
  },
  {
    level: 2,
    story: 'Zacchaeus was a tax collector who climbed a tree to see Jesus!',
    question: 'There were 8 people in the crowd and 6 more came. How many total?',
    emoji: '🌳',
    count: 14,
    answer: 14,
    choices: [12, 13, 14, 15],
    fact: "8 + 6 = 14! Zacchaeus was SO small he couldn't see over the crowd!",
    visual: '👤'.repeat(14),
  },
  // Level 3: Story problems
  {
    level: 3,
    story: 'The shepherd left 99 sheep to find 1 lost sheep.',
    question: 'He started with 100 sheep. 99 were safe. How many were lost?',
    emoji: '🐑',
    count: 1,
    answer: 1,
    choices: [1, 2, 3, 4],
    fact: '100 - 99 = 1! Jesus said God searches for every single lost person — just like that shepherd!',
    visual: '🐑',
  },
  {
    level: 3,
    story: 'Elijah challenged 450 prophets of Baal on Mount Carmel.',
    question: 'God sent fire for Elijah. 450 + 1 = how many prophets were there in all?',
    emoji: '🔥',
    count: 451,
    answer: 451,
    choices: [449, 450, 451, 452],
    fact: "450 + 1 = 451! But with God on Elijah's side, 1 was more powerful than 450!",
    visual: '🔥',
  },
  {
    level: 3,
    story: 'Jesus fed 5,000 people! If each family had 5 members...',
    question: 'How many families were there if 5,000 ÷ 5 = ?',
    emoji: '👨‍👩‍👧‍👦',
    count: 1000,
    answer: 1000,
    choices: [500, 750, 1000, 1500],
    fact: '5,000 ÷ 5 = 1,000 families! And Jesus fed them ALL with just 5 loaves and 2 fish!',
    visual: '👨‍👩‍👧‍👦',
  },
];

const LEVEL_NAMES = {
  1: '⭐ Level 1: Count & Find',
  2: '⭐⭐ Level 2: Add It Up',
  3: '⭐⭐⭐ Level 3: Story Math',
};
const LEVEL_COLORS = { 1: '#10B981', 2: '#3B82F6', 3: '#8B5CF6' };

export default function BibleCountingWorld() {
  const [level, setLevel] = useState(1);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFact, setShowFact] = useState(false);

  const levelProbs = PROBLEMS.filter((p) => p.level === level);
  const problem = levelProbs[qIdx % levelProbs.length];
  const color = LEVEL_COLORS[level];
  const correct = selected === problem.answer;

  function choose(val) {
    if (selected !== null) return;
    setSelected(val);
    if (val === problem.answer) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else setStreak(0);
    setShowFact(true);
  }

  function next() {
    setQIdx((i) => (i + 1) % levelProbs.length);
    setSelected(null);
    setShowFact(false);
  }

  return (
    <div
      style={{
        background: 'linear-gradient(180deg,#EFF6FF 0%,#FAF5FF 100%)',
        minHeight: '100vh',
        fontFamily: 'Poppins,sans-serif',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)',
          padding: '28px 24px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>🔢</div>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.6rem,4vw,2.4rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 4,
          }}
        >
          Bible Counting World
        </h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.82rem', fontWeight: 600 }}>
          Math through Bible stories — count, add, and solve!
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
          {[
            ['🏆', score, 'Score'],
            ['🔥', streak, 'Streak'],
          ].map(([e, v, l]) => (
            <div
              key={l}
              style={{
                background: 'rgba(255,255,255,.15)',
                borderRadius: 100,
                padding: '4px 14px',
                fontSize: '.78rem',
                fontWeight: 800,
                color: 'white',
              }}
            >
              {e} {v} {l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px' }}>
        {/* Level picker */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 18,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {Object.entries(LEVEL_NAMES).map(([lv, label]) => (
            <button
              key={lv}
              onClick={() => {
                setLevel(parseInt(lv));
                setQIdx(0);
                setSelected(null);
                setShowFact(false);
              }}
              style={{
                fontSize: '.72rem',
                fontWeight: 800,
                padding: '7px 14px',
                borderRadius: 100,
                cursor: 'pointer',
                border: `2px solid ${level == lv ? LEVEL_COLORS[lv] : 'transparent'}`,
                background: level == lv ? LEVEL_COLORS[lv] + '18' : 'white',
                color: level == lv ? LEVEL_COLORS[lv] : '#6B7280',
                transition: 'all .2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Problem card */}
        <div
          style={{
            background: 'white',
            borderRadius: 28,
            padding: '28px 24px',
            boxShadow: `0 8px 40px ${color}18`,
            border: `2px solid ${color}22`,
            marginBottom: 14,
          }}
        >
          {/* Story */}
          <div
            style={{
              background: `${color}10`,
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 20,
              borderLeft: `4px solid ${color}`,
            }}
          >
            <div
              style={{
                fontSize: '.7rem',
                fontWeight: 800,
                color,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              📖 Bible Story
            </div>
            <p
              style={{
                fontSize: '.9rem',
                color: '#374151',
                fontWeight: 600,
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {problem.story}
            </p>
          </div>

          {/* Visual counting aid */}
          {problem.level <= 2 && (
            <div
              style={{
                textAlign: 'center',
                fontSize: problem.count > 7 ? '1.2rem' : '1.8rem',
                lineHeight: 1.6,
                marginBottom: 18,
                background: '#F9FAFB',
                borderRadius: 14,
                padding: '12px',
                letterSpacing: 4,
                wordBreak: 'break-all',
              }}
            >
              {problem.visual}
            </div>
          )}

          {/* Question */}
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1rem,3vw,1.25rem)',
              fontWeight: 800,
              color: '#1F2937',
              textAlign: 'center',
              marginBottom: 22,
              lineHeight: 1.4,
            }}
          >
            {problem.question}
          </div>

          {/* Choices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {problem.choices.map((choice) => {
              const isCorrect = choice === problem.answer;
              const isSelected = choice === selected;
              let bg = 'white',
                borderC = '#E5E7EB',
                textC = '#374151';
              if (selected !== null) {
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
                  disabled={selected !== null}
                  style={{
                    padding: '16px',
                    borderRadius: 18,
                    border: `3px solid ${borderC}`,
                    background: bg,
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: textC,
                    cursor: selected !== null ? 'default' : 'pointer',
                    transition: 'all .22s',
                    boxShadow: isSelected ? `0 4px 16px ${borderC}44` : 'none',
                  }}
                >
                  {isCorrect && selected !== null ? '✅ ' : isSelected && !isCorrect ? '❌ ' : ''}
                  {choice}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fact + Next */}
        {showFact && (
          <div
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '18px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,.08)',
              marginBottom: 14,
              animation: 'popIn .4s ease',
              border: `2px solid ${correct ? '#10B981' : '#EF4444'}22`,
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.1rem',
                fontWeight: 800,
                color: correct ? '#059669' : '#EF4444',
                marginBottom: 6,
              }}
            >
              {correct ? "🎉 That's right!" : '💪 The answer is ' + problem.answer}
            </div>
            <p
              style={{
                fontSize: '.88rem',
                color: '#374151',
                lineHeight: 1.7,
                fontWeight: 500,
                margin: '0 0 14px',
              }}
            >
              🌟 {problem.fact}
            </p>
            <button
              onClick={next}
              style={{
                background: color,
                color: 'white',
                border: 'none',
                borderRadius: 14,
                padding: '12px 24px',
                fontFamily: 'Poppins,sans-serif',
                fontWeight: 800,
                fontSize: '.88rem',
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${color}44`,
              }}
            >
              Next Problem →
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
