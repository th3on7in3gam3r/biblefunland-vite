import { useState } from 'react';
import { Link } from 'react-router-dom';

const BIBLE_SHAPES = [
  {
    shape: 'Circle',
    emoji: '⭐',
    title: 'The Crown',
    verse: 'Revelation 4:4',
    desc: "God's throne is surrounded by a circle of 24 elders",
    color: '#FCD34D',
  },
  {
    shape: 'Cross',
    emoji: '✝️',
    title: "Jesus' Cross",
    verse: 'Matthew 27:32',
    desc: 'The cross where Jesus died for our sins',
    color: '#F472B6',
  },
  {
    shape: 'Triangle',
    emoji: '🔺',
    title: 'Trinity',
    verse: '1 John 5:7',
    desc: 'God the Father, Son, and Holy Spirit',
    color: '#60A5FA',
  },
  {
    shape: 'Square',
    emoji: '⬜',
    title: 'The City',
    verse: 'Revelation 21:16',
    desc: 'Heaven is described as a perfect square city',
    color: '#34D399',
  },
  {
    shape: 'Star',
    emoji: '⭐',
    title: 'Bethlehem Star',
    verse: 'Matthew 2:2',
    desc: 'The star that guided the wise men to Jesus',
    color: '#FB923C',
  },
  {
    shape: 'Heart',
    emoji: '❤️',
    title: "God's Love",
    verse: '1 John 4:8',
    desc: "God's heart is full of love for us",
    color: '#EC4899',
  },
  {
    shape: 'Dove',
    emoji: '🕊️',
    title: 'Holy Spirit',
    verse: 'Matthew 3:16',
    desc: "The Holy Spirit came as a dove at Jesus' baptism",
    color: '#8B5CF6',
  },
  {
    shape: 'Rainbow',
    emoji: '🌈',
    title: "God's Promise",
    verse: 'Genesis 9:13',
    desc: "The rainbow shows God's promise to never flood the earth again",
    color: '#10B981',
  },
];

export default function KidsShapes() {
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
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⭐</div>
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(2rem,5vw,3rem)',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 8,
            }}
          >
            Shape Quest
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--ink3)', maxWidth: 500, margin: '0 auto' }}>
            Find special shapes in Bible stories and learn what they mean!
          </p>
        </div>

        {/* Shape Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
            gap: 12,
            marginBottom: 40,
          }}
        >
          {BIBLE_SHAPES.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              style={{
                padding: '20px 16px',
                borderRadius: 16,
                border: `2.5px solid ${item.color}`,
                background: selected === i ? `${item.color}22` : 'var(--surface)',
                cursor: 'pointer',
                transition: 'all .2s',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink2)' }}>
                {item.shape}
              </div>
            </button>
          ))}
        </div>

        {/* Detail Card */}
        {selected !== null && (
          <div
            style={{
              borderRadius: 24,
              border: `2.5px solid ${BIBLE_SHAPES[selected].color}`,
              background: `linear-gradient(135deg,${BIBLE_SHAPES[selected].color}15,${BIBLE_SHAPES[selected].color}05)`,
              padding: '32px 28px',
              textAlign: 'center',
              animation: 'fadeIn .3s ease',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>{BIBLE_SHAPES[selected].emoji}</div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 8,
              }}
            >
              {BIBLE_SHAPES[selected].title}
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--ink2)',
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              {BIBLE_SHAPES[selected].desc}
            </p>
            <div
              style={{ fontSize: '.9rem', color: 'var(--blue)', fontWeight: 700, marginBottom: 20 }}
            >
              📖 {BIBLE_SHAPES[selected].verse}
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: BIBLE_SHAPES[selected].color,
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
