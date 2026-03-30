import { useState } from 'react';
const CARDS = [
  {
    ref: 'John 3:16',
    book: 'The Gospel of John',
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
  },
  {
    ref: 'Philippians 4:13',
    book: "Paul's Letter to Philippians",
    text: 'I can do all this through him who gives me strength.',
  },
  {
    ref: 'Jeremiah 29:11',
    book: 'The Book of Jeremiah',
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
  },
  {
    ref: 'Romans 8:28',
    book: "Paul's Letter to Romans",
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
  },
  {
    ref: 'Proverbs 3:5-6',
    book: 'The Book of Proverbs',
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
  },
  {
    ref: 'Isaiah 40:31',
    book: 'The Book of Isaiah',
    text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
  },
  {
    ref: 'Matthew 6:33',
    book: 'The Gospel of Matthew',
    text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
  },
  { ref: 'Psalm 23:1', book: 'The Psalms', text: 'The Lord is my shepherd, I lack nothing.' },
  {
    ref: 'Romans 12:2',
    book: "Paul's Letter to Romans",
    text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.',
  },
  {
    ref: 'Joshua 1:9',
    book: 'The Book of Joshua',
    text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
  },
];
export default function Flashcards() {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState(Array(CARDS.length).fill(null));
  function flip() {
    setFlipped((f) => !f);
  }
  function mark(s) {
    const n = [...status];
    n[idx] = s;
    setStatus(n);
    setTimeout(() => {
      setFlipped(false);
      setTimeout(() => setIdx((i) => (i + 1) % CARDS.length), 50);
    }, 300);
  }
  function nav(d) {
    setFlipped(false);
    setTimeout(() => setIdx((i) => (i + d + CARDS.length) % CARDS.length), 150);
  }
  const known = status.filter((s) => s === 'know').length;
  const review = status.filter((s) => s === 'review').length;
  const card = CARDS[idx];
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <style>{`.fc-card{transition:transform .6s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d;}.fc-card.flipped{transform:rotateY(180deg)}.fc-front,.fc-back{backface-visibility:hidden;-webkit-backface-visibility:hidden;}.fc-back{transform:rotateY(180deg);}`}</style>
      <div
        style={{
          background: 'linear-gradient(135deg,#0C4A6E,#0369A1)',
          padding: '60px 36px 44px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,4.5vw,3.4rem)',
            fontWeight: 800,
            color: 'white',
            letterSpacing: -1,
            marginBottom: 8,
          }}
        >
          Memory Verse Flashcards
        </h1>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem', fontWeight: 500 }}>
          Flip cards, mark what you know, and let spaced repetition build your scripture memory.
        </p>
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '44px 24px' }}>
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
            [known, 'Known', 'var(--green)'],
            [review, 'Reviewing', 'var(--orange)'],
            [CARDS.length, 'Total', 'var(--blue)'],
          ].map(([n, l, c], i) => (
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
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: c,
                }}
              >
                {n}
              </div>
              <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--ink3)' }}>{l}</div>
            </div>
          ))}
        </div>
        {/* Card */}
        <div style={{ perspective: 1000, marginBottom: 24, cursor: 'pointer' }} onClick={flip}>
          <div
            className={`fc-card${flipped ? ' flipped' : ''}`}
            style={{ position: 'relative', height: 260 }}
          >
            <div
              className="fc-front"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 28,
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: 'linear-gradient(135deg,#1E1B4B,#312E81)',
                boxShadow: '0 20px 60px rgba(0,0,0,.18)',
                border: '1.5px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontSize: '.65rem',
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: 'rgba(255,255,255,.5)',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
              >
                Reference — tap to reveal verse
              </div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: 8,
                }}
              >
                {card.ref}
              </div>
              <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.55)', fontWeight: 500 }}>
                {card.book}
              </div>
              <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)', marginTop: 16 }}>
                👆 Tap to flip
              </div>
            </div>
            <div
              className="fc-back"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 28,
                padding: 36,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: 'var(--surface)',
                boxShadow: '0 20px 60px rgba(0,0,0,.12)',
                border: '1.5px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontSize: '.65rem',
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
              >
                Full Verse
              </div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                "{card.text}"
              </div>
              <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--blue)' }}>
                {card.ref}
              </div>
            </div>
          </div>
        </div>
        {/* Controls */}
        {flipped && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
            <button
              onClick={() => mark('review')}
              className="btn btn-outline"
              style={{ borderColor: 'var(--orange)', color: 'var(--orange)' }}
            >
              🔄 Need Review
            </button>
            <button
              onClick={() => mark('know')}
              className="btn btn-outline"
              style={{ borderColor: 'var(--green)', color: 'var(--green)' }}
            >
              ✅ I Know This!
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button
            onClick={() => nav(-1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              cursor: 'pointer',
              fontSize: '.9rem',
              color: 'var(--ink2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .2s',
            }}
          >
            ‹
          </button>
          <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink3)' }}>
            {idx + 1} / {CARDS.length}
          </span>
          <button
            onClick={() => nav(1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              cursor: 'pointer',
              fontSize: '.9rem',
              color: 'var(--ink2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .2s',
            }}
          >
            ›
          </button>
        </div>
        {/* Reset */}
        {status.some((s) => s !== null) && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setStatus(Array(CARDS.length).fill(null))}
            >
              ↺ Reset Progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
