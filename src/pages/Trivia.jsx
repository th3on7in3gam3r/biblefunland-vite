import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addChildActivity } from '../lib/db';
import usePageMetadata from '../hooks/usePageMetadata';
import { getCache, setCache } from '../lib/cache';
import { Analytics } from '../lib/analytics';
import { useRealTime } from '../context/RealTimeContext';
import KidsCelebration from '../components/KidsCelebration';
import ShareGameCard from '../components/ShareGameCard';

const QUESTIONS = {
  beginner: [
    {
      q: 'Who was the first man God created?',
      a: ['Adam', 'Noah', 'Moses', 'Abraham'],
      correct: 0,
      verse: 'Genesis 2:7 — God formed man of dust from the ground.',
    },
    {
      q: 'How many days did it take God to create the world?',
      a: ['6 days', '7 days', '10 days', '3 days'],
      correct: 0,
      verse: 'Genesis 1 — God created the world in 6 days and rested on the 7th.',
    },
    {
      q: 'What did Jesus turn water into at the wedding in Cana?',
      a: ['Wine', 'Milk', 'Juice', 'Oil'],
      correct: 0,
      verse: 'John 2:9 — Jesus turned water into wine.',
    },
    {
      q: 'Who built the Ark?',
      a: ['Noah', 'Moses', 'David', 'Abraham'],
      correct: 0,
      verse: 'Genesis 6:14 — God told Noah to build an ark.',
    },
    {
      q: 'How many disciples did Jesus have?',
      a: ['10', '12', '7', '15'],
      correct: 1,
      verse: 'Matthew 10:1 — Jesus called his twelve disciples.',
    },
    {
      q: 'What city was Jesus born in?',
      a: ['Jerusalem', 'Nazareth', 'Bethlehem', 'Jericho'],
      correct: 2,
      verse: 'Luke 2:4-7 — Jesus was born in Bethlehem.',
    },
    {
      q: 'Who was swallowed by a great fish?',
      a: ['Moses', 'Elijah', 'Jonah', 'Daniel'],
      correct: 2,
      verse: 'Jonah 1:17 — The Lord provided a great fish to swallow Jonah.',
    },
    {
      q: 'What is the first book of the Bible?',
      a: ['Psalms', 'Exodus', 'Genesis', 'Matthew'],
      correct: 2,
      verse: 'Genesis 1:1 — In the beginning God created the heavens and the earth.',
    },
    {
      q: "Who was Jesus's earthly mother?",
      a: ['Martha', 'Mary', 'Sarah', 'Ruth'],
      correct: 1,
      verse: 'Luke 1:30-31 — The angel said to Mary she would bear a son.',
    },
    {
      q: 'What did Jesus use to feed 5,000 people?',
      a: ['Bread and meat', '5 loaves and 2 fish', 'Manna', 'Fruit and bread'],
      correct: 1,
      verse: 'John 6:9 — A boy had five loaves and two fish.',
    },
  ],
  intermediate: [
    {
      q: 'Which king asked God for wisdom?',
      a: ['David', 'Saul', 'Solomon', 'Hezekiah'],
      correct: 2,
      verse: '1 Kings 3:9 — Solomon asked for a discerning heart.',
    },
    {
      q: 'How many chapters are in Psalms?',
      a: ['100', '120', '150', '180'],
      correct: 2,
      verse: 'The book of Psalms contains 150 individual psalms.',
    },
    {
      q: 'Who baptized Jesus?',
      a: ['Peter', 'Paul', 'John the Baptist', 'Philip'],
      correct: 2,
      verse: 'Matthew 3:13 — Jesus was baptized by John in the Jordan.',
    },
    {
      q: "What was Paul's name before his conversion?",
      a: ['Simon', 'Saul', 'Samuel', 'Silas'],
      correct: 1,
      verse: 'Acts 7:58 — Before his conversion, Paul was known as Saul.',
    },
    {
      q: 'In which river was Jesus baptized?',
      a: ['Nile', 'Euphrates', 'Jordan', 'Tigris'],
      correct: 2,
      verse: 'Matthew 3:13 — Jesus came to the Jordan River.',
    },
    {
      q: 'Who wrote most of the Psalms?',
      a: ['Moses', 'David', 'Solomon', 'Asaph'],
      correct: 1,
      verse: 'Many psalms carry the heading "A Psalm of David."',
    },
    {
      q: "What was Abraham's first son's name?",
      a: ['Jacob', 'Isaac', 'Ishmael', 'Esau'],
      correct: 2,
      verse: 'Genesis 16:15 — Hagar bore Abram a son, named Ishmael.',
    },
    {
      q: 'How many books are in the New Testament?',
      a: ['22', '25', '27', '30'],
      correct: 2,
      verse: 'The New Testament contains 27 books.',
    },
    {
      q: 'What did Zacchaeus climb to see Jesus?',
      a: ['A wall', 'A tree', 'A rooftop', 'A hill'],
      correct: 1,
      verse: 'Luke 19:4 — Zacchaeus climbed a sycamore-fig tree.',
    },
    {
      q: 'Which disciple denied Jesus three times?',
      a: ['John', 'Thomas', 'Judas', 'Peter'],
      correct: 3,
      verse: 'Luke 22:61 — Peter denied Jesus three times before the rooster crowed.',
    },
  ],
  hard: [
    {
      q: 'In which city were Paul and Silas imprisoned and sang hymns at midnight?',
      a: ['Corinth', 'Philippi', 'Ephesus', 'Rome'],
      correct: 1,
      verse: 'Acts 16:25 — Paul and Silas prayed and sang in the Philippian jail.',
    },
    {
      q: 'Which judge of Israel had 70 sons?',
      a: ['Samson', 'Gideon', 'Jephthah', 'Othniel'],
      correct: 1,
      verse: 'Judges 8:30 — Gideon had seventy sons.',
    },
    {
      q: "What was the name of Moses's wife?",
      a: ['Zipporah', 'Miriam', 'Deborah', 'Rahab'],
      correct: 0,
      verse: 'Numbers 12:1 — Moses had married a Cushite woman (Zipporah).',
    },
    {
      q: 'How many years did Israel wander in the wilderness?',
      a: ['30', '40', '50', '20'],
      correct: 1,
      verse: 'Numbers 32:13 — Israel wandered forty years in the wilderness.',
    },
    {
      q: 'Which prophet was taken to heaven in a chariot of fire?',
      a: ['Elisha', 'Enoch', 'Elijah', 'Isaiah'],
      correct: 2,
      verse: '2 Kings 2:11 — Elijah went up to heaven in a whirlwind.',
    },
    {
      q: "What was Abraham's nephew's name who lived in Sodom?",
      a: ['Lot', 'Laban', 'Lamech', 'Lemuel'],
      correct: 0,
      verse: 'Genesis 13:12 — Lot pitched his tents near Sodom.',
    },
    {
      q: 'How many gates does New Jerusalem have in Revelation?',
      a: ['10', '12', '16', '8'],
      correct: 1,
      verse: 'Revelation 21:12 — The city had twelve gates.',
    },
    {
      q: 'Which tribe was the apostle Paul from?',
      a: ['Judah', 'Levi', 'Benjamin', 'Dan'],
      correct: 2,
      verse: 'Philippians 3:5 — Paul was of the tribe of Benjamin.',
    },
    {
      q: 'Who was the first Christian martyr?',
      a: ['James', 'Peter', 'Paul', 'Stephen'],
      correct: 3,
      verse: 'Acts 7:60 — Stephen died praying for those who stoned him.',
    },
    {
      q: "What does 'Immanuel' mean?",
      a: ['God saves', 'God is with us', 'The Anointed One', 'God is King'],
      correct: 1,
      verse: 'Matthew 1:23 — Immanuel means God with us.',
    },
  ],
};

export default function Trivia() {
  usePageMetadata({
    title: 'Scripture Trivia',
    description:
      'Engage kids and families with Bible trivia across beginner, intermediate, and hard categories.',
    image:
      'https://images.unsplash.com/photo-1485547156047-7d9062b3ddd5?auto=format&fit=crop&w=1200&q=80',
  });

  const { user } = useAuth();
  const { showPoints, kidsMode } = useRealTime();
  const [celebrate, setCelebrate] = useState(false);
  const [phase, setPhase] = useState('lobby');
  const [difficulty, setDiff] = useState('intermediate');

  useEffect(() => {
    const cached = getCache('trivia_questions');
    if (!cached) {
      setCache('trivia_questions', QUESTIONS, 1000 * 60 * 60 * 24);
    }
  }, []);
  const [questions, setQs] = useState([]);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(15);
  const [hint, setHint] = useState('');
  const [tid, setTid] = useState(null);

  function start() {
    Analytics.triviaStarted(difficulty);
    const qs = [...QUESTIONS[difficulty]].sort(() => Math.random() - 0.5).slice(0, 10);
    setQs(qs);
    setQi(0);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setSelected(null);
    setHint('');
    setPhase('game');
    tick(qs, 0);
  }
  function tick(qs, idx) {
    clearInterval(tid);
    setTimer(15);
    let t = 15;
    const id = setInterval(() => {
      t--;
      setTimer(t);
      if (t <= 0) {
        clearInterval(id);
        answer(-1, qs, idx);
      }
    }, 1000);
    setTid(id);
  }
  function answer(i, qs, idx) {
    clearInterval(tid);
    const q = qs[idx];
    setSelected(i);
    setHint(q.verse);
    if (i === q.correct) {
      setScore((s) => s + 100);
      setCorrect((c) => c + 1);
      showPoints(100, kidsMode ? '🎉 Correct!' : 'Correct!');
      if (kidsMode) setCelebrate(true);
    } else setWrong((w) => w + 1);
    setTimeout(() => {
      const n = idx + 1;
      if (n >= qs.length) {
        Analytics.triviaFinished(score, correct);
        if (user?.id) {
          addChildActivity(user.id, 'quiz', { score, correct, difficulty }, 0).catch((err) =>
            console.warn('Activity tracking failed:', err)
          );
        }
        setPhase('results');
      } else {
        setQi(n);
        setSelected(null);
        setHint('');
        tick(qs, n);
      }
    }, 1800);
  }

  const letters = ['A', 'B', 'C', 'D'];
  const q = questions[qi];
  const pct = questions.length ? Math.round(((qi + 1) / questions.length) * 100) : 0;
  const rPct = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <KidsCelebration active={celebrate} onDone={() => setCelebrate(false)} />
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
          padding: '60px 36px 44px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,4.5vw,3.4rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#60A5FA,#C084FC,#F472B6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          Scripture Trivia
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500 }}>
          Test your Bible knowledge with timed questions across all skill levels!
        </p>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '44px 24px' }}>
        {phase === 'lobby' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 8,
                }}
              >
                How well do you know your Bible?
              </h2>
              <p style={{ color: 'var(--ink3)', fontSize: '.88rem', fontWeight: 500 }}>
                Choose difficulty then start your 10-question challenge!
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 14,
                marginBottom: 28,
              }}
            >
              {[
                ['beginner', '🌱', 'Beginner', 'Great for kids & new believers'],
                ['intermediate', '📖', 'Intermediate', 'For regular Bible readers'],
                ['hard', '🎓', 'Scholar', 'Deep Bible knowledge required'],
              ].map(([d, icon, name, sub]) => (
                <div
                  key={d}
                  onClick={() => setDiff(d)}
                  style={{
                    borderRadius: 18,
                    padding: '20px 14px',
                    cursor: 'pointer',
                    border: `2px solid ${d === difficulty ? 'var(--blue)' : 'var(--border)'}`,
                    background: d === difficulty ? 'var(--blue-bg)' : 'var(--surface)',
                    textAlign: 'center',
                    transition: 'all .2s',
                  }}
                >
                  <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>{icon}</div>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      marginBottom: 3,
                    }}
                  >
                    {name}
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 500 }}>
                    {sub}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-blue btn-lg" onClick={start}>
                🎮 Start Game →
              </button>
            </div>
          </div>
        )}

        {phase === 'game' && q && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div style={{ flex: 1, maxWidth: 300 }}>
                <div
                  style={{
                    fontSize: '.72rem',
                    fontWeight: 700,
                    color: 'var(--ink3)',
                    marginBottom: 5,
                  }}
                >
                  Question {qi + 1} of {questions.length}
                </div>
                <div
                  style={{
                    height: 7,
                    borderRadius: 100,
                    background: 'var(--bg3)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 100,
                      background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)',
                      width: `${pct}%`,
                      transition: 'width .5s ease',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                }}
              >
                Score: {score}
              </div>
              <div
                style={{
                  fontSize: '.88rem',
                  fontWeight: 800,
                  color: timer <= 5 ? 'var(--red)' : 'var(--orange)',
                }}
              >
                ⏱️ {timer}s
              </div>
            </div>
            <div
              style={{
                background: 'var(--bg2)',
                borderRadius: 16,
                padding: 22,
                border: '1.5px solid var(--border)',
                marginBottom: 20,
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1.4,
              }}
            >
              {q.q}
            </div>
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 18 }}
            >
              {q.a.map((ans, i) => {
                let bg = 'var(--surface)',
                  border = 'var(--border)',
                  color = 'var(--ink)';
                if (selected !== null) {
                  if (i === q.correct) {
                    bg = 'var(--green-bg)';
                    border = 'var(--green)';
                    color = 'var(--green)';
                  } else if (i === selected) {
                    bg = 'var(--red-bg)';
                    border = 'var(--red)';
                    color = 'var(--red)';
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => selected === null && answer(i, questions, qi)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 14,
                      border: `2px solid ${border}`,
                      background: bg,
                      cursor: selected === null ? 'pointer' : 'default',
                      fontSize: '.87rem',
                      fontWeight: 600,
                      color,
                      textAlign: 'left',
                      transition: 'all .2s',
                      pointerEvents: selected !== null ? 'none' : 'auto',
                    }}
                  >
                    {letters[i]}. {ans}
                  </button>
                );
              })}
            </div>
            {hint && (
              <div
                style={{
                  background: 'var(--violet-bg)',
                  borderLeft: '3px solid var(--violet)',
                  borderRadius: '0 12px 12px 0',
                  padding: '11px 14px',
                  fontSize: '.8rem',
                  color: 'var(--ink2)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  marginBottom: 18,
                }}
              >
                📖 {hint}
              </div>
            )}
          </div>
        )}

        {phase === 'results' && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1.5px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,.08)',
              padding: 32,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '5rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg,#F97316,#EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {rPct}%
            </div>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 10,
              }}
            >
              {rPct >= 90
                ? 'Bible Scholar! 🎓'
                : rPct >= 70
                  ? 'Well Done! 📖'
                  : rPct >= 50
                    ? 'Good Effort! 🌱'
                    : 'Keep Going! 💪'}
            </div>
            <div
              style={{
                fontSize: '.9rem',
                color: 'var(--ink2)',
                fontWeight: 500,
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              {rPct >= 70
                ? 'Great job! You know your Bible well. Keep studying!'
                : "Every question is a chance to learn something new about God's Word. Try again!"}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 12,
                marginBottom: 28,
              }}
            >
              {[
                [correct, 'CORRECT', 'var(--green)'],
                [wrong, 'WRONG', 'var(--red)'],
                [score, 'SCORE', 'var(--blue)'],
              ].map(([n, l, c], i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg2)',
                    borderRadius: 14,
                    padding: 16,
                    border: '1.5px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: c,
                    }}
                  >
                    {n}
                  </div>
                  <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--ink3)' }}>
                    {l}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-blue" onClick={start}>
                🔄 Play Again
              </button>
              <Link to="/" className="btn btn-outline">
                🏠 Home
              </Link>
            </div>
            <div style={{ marginTop: 20 }}>
              <ShareGameCard
                game={{ title: 'Scripture Trivia', to: '/play/trivia', emoji: '❓' }}
                score={score}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
