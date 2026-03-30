import { useState } from 'react';
import { Link } from 'react-router-dom';

const BIBLE_PUZZLES = [
  {
    type: 'Match',
    title: 'Match the Animal',
    emoji: '🦁',
    items: [
      { q: 'Which animal did Jonah meet?', a: 'Whale', options: ['Whale', 'Lion', 'Snake'] },
      {
        q: 'What animal did Noah bring two of?',
        a: 'All of them!',
        options: ['Elephant', 'All of them!', 'Just birds'],
      },
      {
        q: 'What animal did Jesus ride into Jerusalem?',
        a: 'Donkey',
        options: ['Horse', 'Donkey', 'Camel'],
      },
    ],
    color: '#FCD34D',
  },
  {
    type: 'Sort',
    title: 'Sort the Fruits of the Spirit',
    emoji: '🍎',
    items: [
      { q: 'Which is a Fruit of the Spirit?', a: 'Love', options: ['Love', 'Anger', 'Sadness'] },
      { q: 'Which is a Fruit of the Spirit?', a: 'Joy', options: ['Fear', 'Joy', 'Worry'] },
      { q: 'Which is a Fruit of the Spirit?', a: 'Peace', options: ['War', 'Peace', 'Confusion'] },
    ],
    color: '#34D399',
  },
  {
    type: 'Fill',
    title: 'Fill in the Blanks',
    emoji: '✏️',
    items: [
      { q: 'Jesus said, "I am the ___"', a: 'Light', options: ['Light', 'Dark', 'Star'] },
      { q: 'God is ___', a: 'Love', options: ['Love', 'Angry', 'Tired'] },
      { q: 'The Bible says, "God loves ___"', a: 'You', options: ['You', 'Nobody', 'Only some'] },
    ],
    color: '#60A5FA',
  },
  {
    type: 'Sequence',
    title: 'Put in Order',
    emoji: '1️⃣',
    items: [
      {
        q: 'What happened first?',
        a: 'Adam and Eve',
        options: ["Noah's Ark", 'Adam and Eve', 'Jesus born'],
      },
      {
        q: 'What happened after Jesus was born?',
        a: 'He grew up',
        options: ['He died', 'He grew up', 'He went to heaven'],
      },
      {
        q: 'What happened after Jesus died?',
        a: 'He rose again',
        options: ['He stayed dead', 'He rose again', 'He went to sleep'],
      },
    ],
    color: '#F472B6',
  },
];

export default function KidsPuzzles() {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (answer) => {
    if (!answered) {
      setAnswered(true);
      if (answer === BIBLE_PUZZLES[selectedPuzzle].items[currentQuestion].a) {
        setScore(score + 1);
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < BIBLE_PUZZLES[selectedPuzzle].items.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswered(false);
    } else {
      setSelectedPuzzle(null);
      setCurrentQuestion(0);
      setScore(0);
      setAnswered(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link
            to="/"
            style={{
              fontSize: '.8rem',
              color: 'var(--blue)',
              textDecoration: 'none',
              marginBottom: 16,
              display: 'inline-block',
            }}
          >
            ← Back to Home
          </Link>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🧩</div>
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(2rem,5vw,3rem)',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 8,
            }}
          >
            Bible Puzzles
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--ink3)', maxWidth: 500, margin: '0 auto' }}>
            Match, sort, fill in, and solve faith-based puzzles!
          </p>
        </div>

        {selectedPuzzle === null ? (
          /* Puzzle Selection */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
              gap: 14,
            }}
          >
            {BIBLE_PUZZLES.map((puzzle, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedPuzzle(i);
                  setCurrentQuestion(0);
                  setScore(0);
                  setAnswered(false);
                }}
                style={{
                  padding: '24px 20px',
                  borderRadius: 18,
                  border: `2.5px solid ${puzzle.color}`,
                  background: `${puzzle.color}08`,
                  cursor: 'pointer',
                  transition: 'all .2s',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${puzzle.color}22`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${puzzle.color}08`;
                  e.currentTarget.style.transform = '';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{puzzle.emoji}</div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 6,
                  }}
                >
                  {puzzle.title}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--ink3)' }}>
                  {puzzle.items.length} questions
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Quiz */
          <div
            style={{
              borderRadius: 24,
              border: `2.5px solid ${BIBLE_PUZZLES[selectedPuzzle].color}`,
              background: `linear-gradient(135deg,${BIBLE_PUZZLES[selectedPuzzle].color}15,${BIBLE_PUZZLES[selectedPuzzle].color}05)`,
              padding: '40px 32px',
              textAlign: 'center',
              animation: 'fadeIn .3s ease',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>
              {BIBLE_PUZZLES[selectedPuzzle].emoji}
            </div>
            <div
              style={{
                fontSize: '.85rem',
                fontWeight: 700,
                color: 'var(--ink3)',
                marginBottom: 20,
              }}
            >
              Question {currentQuestion + 1} of {BIBLE_PUZZLES[selectedPuzzle].items.length}
            </div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 28,
              }}
            >
              {BIBLE_PUZZLES[selectedPuzzle].items[currentQuestion].q}
            </h2>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {BIBLE_PUZZLES[selectedPuzzle].items[currentQuestion].options.map((option, i) => {
                const isCorrect = option === BIBLE_PUZZLES[selectedPuzzle].items[currentQuestion].a;
                const isSelected =
                  answered && option === BIBLE_PUZZLES[selectedPuzzle].items[currentQuestion].a;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option)}
                    disabled={answered}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 14,
                      border: `2px solid ${BIBLE_PUZZLES[selectedPuzzle].color}`,
                      background: isSelected
                        ? `${BIBLE_PUZZLES[selectedPuzzle].color}`
                        : 'var(--surface)',
                      color: isSelected ? 'white' : 'var(--ink)',
                      fontWeight: 700,
                      cursor: answered ? 'default' : 'pointer',
                      transition: 'all .2s',
                      opacity: answered && !isCorrect ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) =>
                      !answered &&
                      (e.currentTarget.style.background = `${BIBLE_PUZZLES[selectedPuzzle].color}22`)
                    }
                    onMouseLeave={(e) =>
                      !answered && (e.currentTarget.style.background = 'var(--surface)')
                    }
                  >
                    {option} {isSelected && '✅'}
                  </button>
                );
              })}
            </div>

            {answered && (
              <button
                onClick={nextQuestion}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  border: 'none',
                  background: BIBLE_PUZZLES[selectedPuzzle].color,
                  color: 'white',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '.9rem',
                }}
              >
                {currentQuestion < BIBLE_PUZZLES[selectedPuzzle].items.length - 1
                  ? 'Next Question →'
                  : 'Done! 🎉'}
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
