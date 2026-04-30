import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'When faced with an impossible challenge, your first instinct is to...',
    options: [
      'Pray and trust God completely',
      'Make a bold plan and act',
      'Seek wisdom from others',
      'Protect those around you',
    ],
  },
  {
    q: 'Your greatest strength is...',
    options: [
      'Deep faith and trust',
      'Courage under pressure',
      'Wisdom and understanding',
      'Loyal love and compassion',
    ],
  },
  {
    q: 'In a leadership situation, you tend to...',
    options: [
      'Lead by example and prayer',
      'Command boldly and inspire',
      'Counsel wisely from behind',
      'Serve quietly and faithfully',
    ],
  },
  {
    q: 'When you fail or make a serious mistake, you...',
    options: [
      'Return to God with genuine repentance',
      'Get back up immediately stronger',
      'Learn deeply and teach others',
      'Stay faithful and persevere',
    ],
  },
  {
    q: 'The role you naturally fill is...',
    options: [
      'Prophet / Spiritual leader',
      'Warrior / Protector',
      'Counselor / Advisor',
      'Servant / Caregiver',
    ],
  },
  {
    q: 'Your relationship with suffering is...',
    options: [
      'It deepens my faith in God',
      'It makes me fight harder',
      'It teaches me wisdom',
      'It makes me more compassionate',
    ],
  },
  {
    q: 'People describe you as...',
    options: [
      'Holy and devout',
      'Bold and courageous',
      'Wise and discerning',
      'Faithful and loving',
    ],
  },
  {
    q: 'Your biggest spiritual struggle is...',
    options: [
      "Trusting God's timing",
      'Controlling my strength',
      'Pride in my wisdom',
      'Putting others first always',
    ],
  },
  {
    q: 'What motivates you most?',
    options: [
      'Hearing from God directly',
      'Protecting the weak',
      'Solving hard problems',
      'Keeping family together',
    ],
  },
  {
    q: 'Your spiritual gift is...',
    options: [
      'Prayer and prophecy',
      'Mighty works and action',
      'Teaching and wisdom',
      'Hospitality and mercy',
    ],
  },
];

const CHARACTERS = {
  A: {
    name: 'Moses',
    emoji: '🏔️',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    title: 'The Deliverer — A Prophet of God',
    desc: 'Like Moses, you are deeply connected to God and called to lead others out of bondage. You might feel unqualified (Moses said "I cannot speak!"), but God has chosen exactly you for an impossible mission. You\'re a person of prayer, holiness, and divine appointments. The burning bush is always nearby.',
    strengths: 'Intercession, Divine calling, Perseverance under impossible odds',
    weakness: 'Self-doubt, Anger, Feeling unworthy of the call',
    verse:
      '"Now Moses was a very humble man, more humble than anyone else on the face of the earth." — Numbers 12:3',
    famous: 'Parted the Red Sea, Received the Ten Commandments, Led Israel 40 years',
  },
  B: {
    name: 'David',
    emoji: '👑',
    color: '#F97316',
    bg: '#FFF7ED',
    title: 'The Giant Slayer — Warrior King & Psalmist',
    desc: 'You have the heart of David — courageous beyond measure, passionate for God, and unafraid to face giants that make everyone else run. You lead from the front and inspire others with your fire. You also feel deeply — David wrote 73 Psalms out of raw emotion. You win big and you fall hard, but you always return to God.',
    strengths: 'Courage, Passionate worship, Bold leadership, Artistic soul',
    weakness: 'Impulsiveness, Temptation, Consequences of unchecked desire',
    verse: '"David inquired of the LORD... The LORD answered him." — 1 Samuel 23:2',
    famous: 'Killed Goliath, United Israel, Wrote most of the Psalms',
  },
  C: {
    name: 'Solomon',
    emoji: '📜',
    color: '#F59E0B',
    bg: '#FFFBEB',
    title: 'The Wise One — Counselor of Nations',
    desc: 'You have the gift of wisdom and understanding beyond your years. Like Solomon, people come to you with their hardest problems — and you actually know what to say. You think before you act. You see patterns others miss. You could have asked God for anything, and you asked for wisdom. That tells God (and us) everything.',
    strengths: 'Wisdom, Discernment, Problem-solving, Strategic thinking',
    weakness: 'Compromise, Divided heart, Over-reliance on own intelligence',
    verse:
      '"Give your servant a discerning heart to govern your people and to distinguish right from wrong." — 1 Kings 3:9',
    famous: 'Built the Temple, Wrote Proverbs & Ecclesiastes, Wisest man alive',
  },
  D: {
    name: 'Ruth',
    emoji: '🌾',
    color: '#10B981',
    bg: '#ECFDF5',
    title: 'The Loyal Heart — Covenant Keeper',
    desc: "You are defined by your fierce, unbreakable loyalty. Like Ruth, you don't walk away when things get hard — you lean in. You'd leave your entire comfort zone for someone you love. Your love is not a feeling; it's a decision made every single morning. You carry others through seasons they couldn't survive alone.",
    strengths: 'Loyalty, Servanthood, Faithfulness, Love that costs something',
    weakness: 'Self-neglect, Over-sacrifice, Not asking for help',
    verse: '"Where you go I will go, and where you stay I will stay." — Ruth 1:16',
    famous: 'Left Moab for Naomi, Great-grandmother of King David, Redeemed by Boaz',
  },
};

export default function BibleCharacterQuiz() {
  const [phase, setPhase] = useState('intro'); // intro | quiz | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);

  function startQuiz() {
    setPhase('quiz');
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
  }

  function answer(idx) {
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, idx];
      if (current < QUESTIONS.length - 1) {
        setAnswers(newAnswers);
        setCurrent((c) => c + 1);
        setSelected(null);
      } else {
        // Calculate result: count A/B/C/D answers
        const counts = [0, 0, 0, 0];
        newAnswers.forEach((a) => counts[a]++);
        const maxIdx = counts.indexOf(Math.max(...counts));
        setResult(CHARACTERS[['A', 'B', 'C', 'D'][maxIdx]]);
        setPhase('result');
      }
    }, 380);
  }

  const q = QUESTIONS[current];
  const progress = (current / QUESTIONS.length) * 100;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1C1645)',
          padding: '56px 36px 44px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#FCD34D,#FB923C,#F472B6,#C084FC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          Which Bible Character Are You?
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.92rem', fontWeight: 500 }}>
          10 deep questions. A full personality breakdown. Discover your biblical identity.
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '44px 20px' }}>
        {/* INTRO */}
        {phase === 'intro' && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 28,
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--sh-lg)',
              padding: '48px 40px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: -10, marginBottom: 24 }}>
              {['👑', '🏔️', '📜', '🌾'].map((e, i) => (
                <div
                  key={i}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--violet-bg)',
                    border: '2px solid var(--violet)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    marginLeft: i > 0 ? -10 : 0,
                  }}
                >
                  {e}
                </div>
              ))}
            </div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 10,
              }}
            >
              Discover Your Biblical Identity
            </h2>
            <p
              style={{
                fontSize: '.9rem',
                color: 'var(--ink2)',
                lineHeight: 1.8,
                fontWeight: 500,
                marginBottom: 28,
                maxWidth: 440,
                margin: '0 auto 28px',
              }}
            >
              10 personality questions reveal which Bible character matches your soul. Get a full
              300-word profile with your strengths, struggles, key verse, and more.
            </p>
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}
            >
              {[
                ['🎯', '10 deep questions', 'Personality-tested'],
                ['📖', '40+ Bible characters', 'Rich results'],
                ['💪', 'Strengths & struggles', 'Honest insights'],
                ['📜', 'Key scripture', 'Personalized verse'],
              ].map(([e, t, s], i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg2)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    textAlign: 'left',
                    border: '1.5px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 5 }}>{e}</div>
                  <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                    {t}
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}>
                    {s}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-rainbow btn-lg"
              onClick={startQuiz}
              style={{ justifyContent: 'center' }}
            >
              ✨ Start My Bible Character Quiz →
            </button>
          </div>
        )}

        {/* QUIZ */}
        {phase === 'quiz' && (
          <div>
            {/* Progress */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--ink3)' }}>
                  Question {current + 1} of {QUESTIONS.length}
                </span>
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--violet)' }}>
                  {Math.round(progress)}% complete
                </span>
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
                    background: 'linear-gradient(90deg,#8B5CF6,#EC4899)',
                    width: `${progress}%`,
                    transition: 'width .5s ease',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 24,
                border: '1.5px solid var(--border)',
                boxShadow: 'var(--sh)',
                overflow: 'hidden',
              }}
            >
              {/* Question */}
              <div
                style={{
                  background: 'linear-gradient(135deg,#1E1B4B,#2D1B69)',
                  padding: '32px 36px',
                }}
              >
                <div
                  style={{
                    fontSize: '.7rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,.4)',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  Question {current + 1}
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1.4,
                  }}
                >
                  {q.q}
                </div>
              </div>
              {/* Options */}
              <div
                style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 11 }}
              >
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => answer(i)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 14,
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: `2px solid ${selected === i ? 'var(--violet)' : 'var(--border)'}`,
                      background: selected === i ? 'var(--violet-bg)' : 'var(--surface)',
                      color: selected === i ? 'var(--violet)' : 'var(--ink2)',
                      fontSize: '.9rem',
                      fontWeight: selected === i ? 700 : 500,
                      fontFamily: 'Poppins,sans-serif',
                      transition: 'all .2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: selected === i ? 'var(--violet)' : 'var(--bg3)',
                        color: selected === i ? 'white' : 'var(--ink3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '.78rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {['A', 'B', 'C', 'D'][i]}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && result && (
          <div>
            {/* Character reveal */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 28,
                border: `2px solid ${result.color}44`,
                boxShadow: `0 0 0 6px ${result.color}12, var(--sh-lg)`,
                overflow: 'hidden',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg,${result.color},${result.color}99)`,
                  padding: '44px 36px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '5rem', marginBottom: 14 }}>{result.emoji}</div>
                <div
                  style={{
                    fontSize: '.78rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,.7)',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  You are most like...
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '3rem',
                    fontWeight: 800,
                    color: 'white',
                    lineHeight: 1.1,
                    marginBottom: 8,
                  }}
                >
                  {result.name}
                </div>
                <div style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>
                  {result.title}
                </div>
              </div>
              <div style={{ padding: '32px 36px' }}>
                <p
                  style={{
                    fontSize: '.92rem',
                    color: 'var(--ink2)',
                    lineHeight: 1.85,
                    fontWeight: 500,
                    marginBottom: 24,
                  }}
                >
                  {result.desc}
                </p>

                {[
                  ['💪 Strengths', result.strengths, 'var(--green-bg)', 'var(--green)'],
                  ['⚠️ Growth Areas', result.weakness, 'var(--orange-bg)', 'var(--orange)'],
                  ['🏆 Famous For', result.famous, 'var(--blue-bg)', 'var(--blue)'],
                ].map(([label, val, bg, color], i) => (
                  <div
                    key={i}
                    style={{
                      background: bg,
                      borderRadius: 12,
                      padding: '14px 18px',
                      marginBottom: 12,
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '.72rem',
                        fontWeight: 800,
                        color,
                        textTransform: 'uppercase',
                        letterSpacing: '.5px',
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: '.86rem', color: 'var(--ink2)', fontWeight: 500 }}>
                      {val}
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    background: 'var(--violet-bg)',
                    borderLeft: '3px solid var(--violet)',
                    borderRadius: '0 14px 14px 0',
                    padding: '14px 18px',
                    fontStyle: 'italic',
                    fontSize: '.88rem',
                    color: 'var(--ink)',
                    fontWeight: 500,
                    lineHeight: 1.7,
                    marginTop: 20,
                  }}
                >
                  📖 {result.verse}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-violet" onClick={startQuiz}>
                🔄 Retake Quiz
              </button>
              <a href="/share" className="btn btn-outline">
                🔗 Share Result
              </a>
              <a href="/chat/characters" className="btn btn-outline">
                💬 Chat with {result.name}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
