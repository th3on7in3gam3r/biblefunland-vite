import { useState } from 'react';
import { Link } from 'react-router-dom';

const BIBLE_LETTERS = [
  {
    letter: 'A',
    title: 'Adam',
    verse: 'Genesis 1:27',
    desc: 'The first person God created',
    emoji: '👨',
    color: '#FCD34D',
  },
  {
    letter: 'B',
    title: 'Bethlehem',
    verse: 'Matthew 2:1',
    desc: 'Where Jesus was born',
    emoji: '🌟',
    color: '#60A5FA',
  },
  {
    letter: 'C',
    title: 'Cross',
    verse: 'Matthew 27:32',
    desc: 'Where Jesus died for us',
    emoji: '✝️',
    color: '#F472B6',
  },
  {
    letter: 'D',
    title: 'David',
    verse: '1 Samuel 16:13',
    desc: 'A brave king who loved God',
    emoji: '👑',
    color: '#34D399',
  },
  {
    letter: 'E',
    title: 'Eden',
    verse: 'Genesis 2:8',
    desc: 'The beautiful garden God made',
    emoji: '🌳',
    color: '#FB923C',
  },
  {
    letter: 'F',
    title: 'Faith',
    verse: 'Hebrews 11:1',
    desc: "Believing in God even when we can't see",
    emoji: '💫',
    color: '#8B5CF6',
  },
  {
    letter: 'G',
    title: 'God',
    verse: 'John 3:16',
    desc: 'The one who loves us most',
    emoji: '💖',
    color: '#EC4899',
  },
  {
    letter: 'H',
    title: 'Heaven',
    verse: 'John 14:2',
    desc: "Where God lives and we'll go",
    emoji: '☁️',
    color: '#10B981',
  },
  {
    letter: 'J',
    title: 'Jesus',
    verse: 'John 1:1',
    desc: "God's son who loves us",
    emoji: '😇',
    color: '#FCD34D',
  },
  {
    letter: 'K',
    title: 'Kingdom',
    verse: 'Matthew 6:10',
    desc: "God's kingdom of love and peace",
    emoji: '👸',
    color: '#60A5FA',
  },
  {
    letter: 'L',
    title: 'Love',
    verse: '1 John 4:8',
    desc: 'God is love and loves us forever',
    emoji: '❤️',
    color: '#F472B6',
  },
  {
    letter: 'M',
    title: 'Mary',
    verse: 'Luke 1:26',
    desc: "Jesus' mother who trusted God",
    emoji: '👩',
    color: '#34D399',
  },
  {
    letter: 'N',
    title: 'Noah',
    verse: 'Genesis 6:8',
    desc: 'Built an ark and trusted God',
    emoji: '🚢',
    color: '#FB923C',
  },
  {
    letter: 'P',
    title: 'Prayer',
    verse: 'Matthew 6:6',
    desc: 'Talking to God anytime, anywhere',
    emoji: '🙏',
    color: '#8B5CF6',
  },
  {
    letter: 'S',
    title: 'Salvation',
    verse: 'John 3:16',
    desc: 'Jesus saves us and gives us new life',
    emoji: '🎁',
    color: '#EC4899',
  },
  {
    letter: 'T',
    title: 'Temple',
    verse: '1 Kings 6:1',
    desc: 'A special place to worship God',
    emoji: '⛪',
    color: '#10B981',
  },
];

export default function KidsLetters() {
  const [selected, setSelected] = useState(null);

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
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔤</div>
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(2rem,5vw,3rem)',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 8,
            }}
          >
            ABC Bible
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--ink3)', maxWidth: 500, margin: '0 auto' }}>
            Learn the alphabet with Bible words and stories!
          </p>
        </div>

        {/* Letter Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(80px,1fr))',
            gap: 10,
            marginBottom: 40,
          }}
        >
          {BIBLE_LETTERS.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              style={{
                padding: '16px 12px',
                borderRadius: 14,
                border: `2.5px solid ${item.color}`,
                background: selected === i ? `${item.color}22` : 'var(--surface)',
                cursor: 'pointer',
                transition: 'all .2s',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: item.color,
                }}
              >
                {item.letter}
              </div>
            </button>
          ))}
        </div>

        {/* Detail Card */}
        {selected !== null && (
          <div
            style={{
              borderRadius: 24,
              border: `2.5px solid ${BIBLE_LETTERS[selected].color}`,
              background: `linear-gradient(135deg,${BIBLE_LETTERS[selected].color}15,${BIBLE_LETTERS[selected].color}05)`,
              padding: '32px 28px',
              textAlign: 'center',
              animation: 'fadeIn .3s ease',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>
              {BIBLE_LETTERS[selected].emoji}
            </div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 8,
              }}
            >
              {BIBLE_LETTERS[selected].letter} is for {BIBLE_LETTERS[selected].title}
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--ink2)',
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              {BIBLE_LETTERS[selected].desc}
            </p>
            <div
              style={{ fontSize: '.9rem', color: 'var(--blue)', fontWeight: 700, marginBottom: 20 }}
            >
              📖 {BIBLE_LETTERS[selected].verse}
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: BIBLE_LETTERS[selected].color,
                color: 'white',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '.85rem',
              }}
            >
              Close
            </button>
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
