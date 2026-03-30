import { useState, useEffect } from 'react';

const VERSES = [
  {
    ref: 'John 3:16a',
    words: ['God', 'loved', 'the', 'world'],
    full: 'God loved the world.',
    color: '#EC4899',
    emoji: '❤️',
    fact: 'God loves EVERYONE in the whole world — including YOU!',
  },
  {
    ref: 'Ps 118:24',
    words: ['This', 'is', 'the', 'day', 'the', 'Lord', 'made'],
    full: 'This is the day the Lord made!',
    color: '#F59E0B',
    emoji: '☀️',
    fact: 'Every single day is a gift from God. Today is special!',
  },
  {
    ref: 'John 11:35',
    words: ['Jesus', 'wept'],
    full: 'Jesus wept.',
    color: '#60A5FA',
    emoji: '💧',
    fact: 'Jesus cried when his friend Lazarus died. He cares about our sadness too!',
  },
  {
    ref: 'Ps 23:1',
    words: ['The', 'Lord', 'is', 'my', 'shepherd'],
    full: 'The Lord is my shepherd.',
    color: '#10B981',
    emoji: '🐑',
    fact: 'A shepherd loves and takes care of sheep. God takes care of us like that!',
  },
  {
    ref: 'Phil 4:4',
    words: ['Rejoice', 'in', 'the', 'Lord', 'always'],
    full: 'Rejoice in the Lord always!',
    color: '#A855F7',
    emoji: '🎉',
    fact: 'Rejoice means be happy and celebrate! God gives us so many reasons to be joyful.',
  },
  {
    ref: '1 John 4:8',
    words: ['God', 'is', 'love'],
    full: 'God is love.',
    color: '#F472B6',
    emoji: '💗',
    fact: "God doesn't just have love — He IS love! His whole nature is love for us.",
  },
  {
    ref: 'Ps 56:3',
    words: ['When', 'I', 'am', 'afraid', 'I', 'trust', 'in', 'God'],
    full: 'When I am afraid I trust in God.',
    color: '#6366F1',
    emoji: '🦁',
    fact: 'Even David got scared sometimes! But he knew God was always with him.',
  },
  {
    ref: 'Matt 5:9',
    words: ['Blessed', 'are', 'the', 'peacemakers'],
    full: 'Blessed are the peacemakers!',
    color: '#14B8A6',
    emoji: '🕊️',
    fact: 'Jesus said people who make peace are special — God calls them His children!',
  },
  {
    ref: 'Deut 31:6',
    words: ['Be', 'strong', 'and', 'courageous'],
    full: 'Be strong and courageous!',
    color: '#F97316',
    emoji: '💪',
    fact: 'God told Joshua to be brave. God tells us the same thing — He is with us!',
  },
  {
    ref: 'Prov 17:17',
    words: ['A', 'friend', 'loves', 'at', 'all', 'times'],
    full: 'A friend loves at all times.',
    color: '#34D399',
    emoji: '🤝',
    fact: "God wants us to be good friends — kind and loving, even when it's hard!",
  },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function VerseScrambleKids() {
  const [idx, setIdx] = useState(0);
  const [bank, setBank] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState([]);
  const [shaking, setShaking] = useState(false);

  const verse = VERSES[idx];

  useEffect(() => {
    reset();
  }, [idx]);

  function reset() {
    setBank(shuffle(verse.words.map((w, i) => ({ id: i, word: w }))));
    setAnswer([]);
    setDone(false);
    setStars([]);
  }

  function addWord(item) {
    if (done) return;
    const newAnswer = [...answer, item];
    const newBank = bank.filter((b) => b.id !== item.id);
    setAnswer(newAnswer);
    setBank(newBank);

    // Check if all words placed
    if (newAnswer.length === verse.words.length) {
      const correct = newAnswer.map((w) => w.word).join(' ') === verse.words.join(' ');
      if (correct) {
        setDone(true);
        setScore((s) => s + 1);
        setStars(
          Array.from({ length: 15 }, (_, i) => ({
            x: 10 + Math.random() * 80,
            y: Math.random() * 70,
            color: ['#FCD34D', '#F472B6', '#60A5FA', '#34D399', '#FB923C'][i % 5],
            delay: Math.random() * 0.5,
          }))
        );
      } else {
        // Wrong order — shake and reset
        setShaking(true);
        setTimeout(() => {
          setShaking(false);
          reset();
        }, 600);
      }
    }
  }

  function removeWord(item) {
    if (done) return;
    setAnswer(answer.filter((a) => a.id !== item.id));
    setBank([...bank, item]);
  }

  function next() {
    setIdx((i) => (i + 1) % VERSES.length);
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
          background: `linear-gradient(135deg,${verse.color},${verse.color}bb)`,
          padding: '28px 24px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>💬</div>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.6rem,4vw,2.4rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 4,
          }}
        >
          Verse Scramble!
        </h1>
        <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '.82rem', fontWeight: 600 }}>
          Put the words in the right order to build the verse!
        </p>
        <div
          style={{
            background: 'rgba(255,255,255,.2)',
            borderRadius: 100,
            padding: '4px 16px',
            fontSize: '.78rem',
            fontWeight: 800,
            color: 'white',
            display: 'inline-block',
            marginTop: 10,
          }}
        >
          🏆 Score: {score}
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 14px' }}>
        <div
          style={{
            background: 'white',
            borderRadius: 28,
            padding: '24px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,.1)',
            marginBottom: 14,
            position: 'relative',
            overflow: 'hidden',
            border: `2px solid ${verse.color}22`,
            animation: shaking ? 'shake .5s ease' : 'none',
          }}
        >
          {/* Confetti */}
          {stars.map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${s.x}%`,
                top: `${s.y}%`,
                fontSize: '1.2rem',
                color: s.color,
                animation: `starPop .6s ${s.delay}s ease both`,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              ⭐
            </div>
          ))}

          {/* Reference + emoji */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: '3rem', marginBottom: 6 }}>{verse.emoji}</div>
            <div
              style={{
                fontSize: '.76rem',
                fontWeight: 800,
                color: verse.color,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              📖 {verse.ref}
            </div>
          </div>

          {/* Answer slots */}
          <div
            style={{
              minHeight: 80,
              background: `${verse.color}08`,
              border: `2.5px dashed ${verse.color}44`,
              borderRadius: 18,
              padding: '14px 10px',
              marginBottom: 18,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {answer.length === 0 && (
              <div
                style={{ color: verse.color, fontWeight: 700, fontSize: '.82rem', opacity: 0.5 }}
              >
                Tap words below to put them here! 👇
              </div>
            )}
            {answer.map((item) => (
              <button
                key={item.id}
                onClick={() => removeWord(item)}
                style={{
                  background: verse.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  padding: '9px 14px',
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: done ? 'default' : 'pointer',
                  boxShadow: `0 4px 12px ${verse.color}44`,
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  if (!done) e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {item.word}
              </button>
            ))}
          </div>

          {/* Word bank */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {bank.map((item) => (
              <button
                key={item.id}
                onClick={() => addWord(item)}
                style={{
                  background: 'white',
                  color: '#374151',
                  border: `2.5px solid ${verse.color}66`,
                  borderRadius: 12,
                  padding: '9px 14px',
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all .2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = verse.color + '18';
                  e.currentTarget.style.borderColor = verse.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = verse.color + '66';
                }}
              >
                {item.word}
              </button>
            ))}
          </div>

          {/* Success */}
          {done && (
            <div style={{ textAlign: 'center', marginTop: 20, animation: 'popIn .4s ease' }}>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#059669',
                  marginBottom: 8,
                }}
              >
                🎉 Perfect!
              </div>
              <div
                style={{
                  background: '#ECFDF5',
                  borderRadius: 14,
                  padding: '12px 16px',
                  fontSize: '.84rem',
                  color: '#374151',
                  fontWeight: 500,
                  lineHeight: 1.65,
                  marginBottom: 16,
                }}
              >
                🌟 {verse.fact}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={next}
                  style={{
                    background: verse.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: 14,
                    padding: '12px 24px',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 800,
                    fontSize: '.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Next Verse ✨
                </button>
                <button
                  onClick={reset}
                  style={{
                    background: '#F3F4F6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: 14,
                    padding: '12px 18px',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 700,
                    fontSize: '.88rem',
                    cursor: 'pointer',
                  }}
                >
                  ↺ Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Verse picker */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
          {VERSES.map((v, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                fontSize: '.7rem',
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: 100,
                cursor: 'pointer',
                border: `1.5px solid ${idx === i ? v.color : '#E5E7EB'}`,
                background: idx === i ? v.color + '18' : 'white',
                color: idx === i ? v.color : '#6B7280',
              }}
            >
              {v.emoji}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes starPop{from{opacity:0;transform:scale(0) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
      `}</style>
    </div>
  );
}
