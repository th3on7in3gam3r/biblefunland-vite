import { useState } from 'react'
import { Link } from 'react-router-dom'

const BIBLE_NUMBERS = [
  { num: 1, title: 'One God', verse: 'Deuteronomy 6:4', desc: 'There is only one God who loves us', emoji: '☝️', color: '#FCD34D' },
  { num: 2, title: 'Two Tablets', verse: 'Exodus 20:1-17', desc: 'God gave Moses 2 tablets with His laws', emoji: '📜', color: '#60A5FA' },
  { num: 3, title: 'Three Days', verse: 'Matthew 12:40', desc: 'Jesus rose on the third day', emoji: '⛪', color: '#F472B6' },
  { num: 4, title: 'Four Gospels', verse: 'Matthew, Mark, Luke, John', desc: 'Four books tell Jesus\' story', emoji: '📖', color: '#34D399' },
  { num: 5, title: 'Five Loaves', verse: 'Matthew 14:17', desc: 'Jesus fed 5,000 with 5 loaves', emoji: '🍞', color: '#FB923C' },
  { num: 10, title: 'Ten Commandments', verse: 'Exodus 20', desc: 'God gave us 10 rules to follow', emoji: '⚡', color: '#8B5CF6' },
  { num: 12, title: 'Twelve Apostles', verse: 'Matthew 10:1-4', desc: 'Jesus chose 12 special helpers', emoji: '👥', color: '#EC4899' },
  { num: 40, title: 'Forty Days', verse: 'Matthew 4:2', desc: 'Jesus fasted for 40 days in the desert', emoji: '🏜️', color: '#10B981' },
]

export default function KidsNumbers() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ fontSize: '.8rem', color: 'var(--blue)', textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>← Back to Home</Link>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔢</div>
          <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Bible Numbers</h1>
          <p style={{ fontSize: '.95rem', color: 'var(--ink3)', maxWidth: 500, margin: '0 auto' }}>Learn special numbers from the Bible and what they mean!</p>
        </div>

        {/* Number Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 40 }}>
          {BIBLE_NUMBERS.map((item, i) => (
            <button key={i} onClick={() => setSelected(selected === i ? null : i)} style={{
              padding: '20px 16px',
              borderRadius: 16,
              border: `2.5px solid ${item.color}`,
              background: selected === i ? `${item.color}22` : 'var(--surface)',
              cursor: 'pointer',
              transition: 'all .2s',
              textAlign: 'center',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.8rem', fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.num}</div>
              <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ink2)' }}>{item.title}</div>
            </button>
          ))}
        </div>

        {/* Detail Card */}
        {selected !== null && (
          <div style={{
            borderRadius: 24,
            border: `2.5px solid ${BIBLE_NUMBERS[selected].color}`,
            background: `linear-gradient(135deg,${BIBLE_NUMBERS[selected].color}15,${BIBLE_NUMBERS[selected].color}05)`,
            padding: '32px 28px',
            textAlign: 'center',
            animation: 'fadeIn .3s ease',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>{BIBLE_NUMBERS[selected].emoji}</div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '2rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              {BIBLE_NUMBERS[selected].num} — {BIBLE_NUMBERS[selected].title}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink2)', fontWeight: 600, marginBottom: 12 }}>
              {BIBLE_NUMBERS[selected].desc}
            </p>
            <div style={{ fontSize: '.9rem', color: 'var(--blue)', fontWeight: 700, marginBottom: 20 }}>
              📖 {BIBLE_NUMBERS[selected].verse}
            </div>
            <button onClick={() => setSelected(null)} style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: 'none',
              background: BIBLE_NUMBERS[selected].color,
              color: 'white',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '.85rem',
            }}>
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
  )
}
