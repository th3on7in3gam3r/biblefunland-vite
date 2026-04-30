import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useKidsMode } from '../context/KidsModeContext';
import { useAuth } from '../context/AuthContext';
import KidsCelebration from '../components/KidsCelebration';

// ── Bible data (KJV excerpts) ─────────────────────────────────────────────────
const BOOKS = [
  {
    id: 'john',
    name: 'John',
    emoji: '✝️',
    color: '#3B82F6',
    bg: 'linear-gradient(135deg,#1E3A5F,#1E1B4B)',
  },
  {
    id: 'psalms',
    name: 'Psalms',
    emoji: '🎵',
    color: '#8B5CF6',
    bg: 'linear-gradient(135deg,#2E1065,#1E1B4B)',
  },
  {
    id: 'genesis',
    name: 'Genesis',
    emoji: '🌍',
    color: '#10B981',
    bg: 'linear-gradient(135deg,#064E3B,#0F172A)',
  },
  {
    id: 'proverbs',
    name: 'Proverbs',
    emoji: '📜',
    color: '#F59E0B',
    bg: 'linear-gradient(135deg,#78350F,#0F172A)',
  },
  {
    id: 'matthew',
    name: 'Matthew',
    emoji: '⭐',
    color: '#EC4899',
    bg: 'linear-gradient(135deg,#831843,#0F172A)',
  },
  {
    id: 'romans',
    name: 'Romans',
    emoji: '🕊️',
    color: '#14B8A6',
    bg: 'linear-gradient(135deg,#065F46,#0F172A)',
  },
];

const VERSES = {
  john: [
    {
      ref: 'John 3:16',
      text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    },
    {
      ref: 'John 3:17',
      text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
    },
    {
      ref: 'John 14:6',
      text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.',
    },
    {
      ref: 'John 14:27',
      text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
    },
    {
      ref: 'John 15:13',
      text: 'Greater love hath no man than this, that a man lay down his life for his friends.',
    },
  ],
  psalms: [
    { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' },
    {
      ref: 'Psalm 23:2',
      text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
    },
    {
      ref: 'Psalm 23:3',
      text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
    },
    { ref: 'Psalm 119:105', text: 'Thy word is a lamp unto my feet, and a light unto my path.' },
    { ref: 'Psalm 46:1', text: 'God is our refuge and strength, a very present help in trouble.' },
  ],
  genesis: [
    { ref: 'Genesis 1:1', text: 'In the beginning God created the heaven and the earth.' },
    {
      ref: 'Genesis 1:2',
      text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
    },
    { ref: 'Genesis 1:3', text: 'And God said, Let there be light: and there was light.' },
    {
      ref: 'Genesis 1:4',
      text: 'And God saw the light, that it was good: and God divided the light from the darkness.',
    },
    {
      ref: 'Genesis 1:31',
      text: 'And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day.',
    },
  ],
  proverbs: [
    {
      ref: 'Proverbs 3:5',
      text: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding.',
    },
    {
      ref: 'Proverbs 3:6',
      text: 'In all thy ways acknowledge him, and he shall direct thy paths.',
    },
    {
      ref: 'Proverbs 22:6',
      text: 'Train up a child in the way he should go: and when he is old, he will not depart from it.',
    },
    {
      ref: 'Proverbs 16:3',
      text: 'Commit thy works unto the Lord, and thy thoughts shall be established.',
    },
    {
      ref: 'Proverbs 4:7',
      text: 'Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding.',
    },
  ],
  matthew: [
    {
      ref: 'Matthew 5:3',
      text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.',
    },
    { ref: 'Matthew 5:4', text: 'Blessed are they that mourn: for they shall be comforted.' },
    { ref: 'Matthew 5:5', text: 'Blessed are the meek: for they shall inherit the earth.' },
    {
      ref: 'Matthew 6:9',
      text: 'After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.',
    },
    {
      ref: 'Matthew 28:19',
      text: 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.',
    },
  ],
  romans: [
    {
      ref: 'Romans 8:28',
      text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    },
    {
      ref: 'Romans 8:38',
      text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,',
    },
    {
      ref: 'Romans 8:39',
      text: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
    },
    {
      ref: 'Romans 12:2',
      text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.',
    },
    {
      ref: 'Romans 15:13',
      text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.',
    },
  ],
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VoiceBibleReader() {
  const { kidsMode } = useKidsMode();
  const { user } = useAuth();

  const [selectedBook, setSelectedBook] = useState('john');
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [supported, setSupported] = useState(true);

  const utteranceRef = useRef(null);
  const verseRefs = useRef([]);

  const book = BOOKS.find((b) => b.id === selectedBook);
  const verses = VERSES[selectedBook] || [];
  const currentVerse = verses[currentVerseIdx];

  useEffect(() => {
    if (!('speechSynthesis' in window)) setSupported(false);
    return () => window.speechSynthesis?.cancel();
  }, []);

  // Auto-scroll to current verse
  useEffect(() => {
    verseRefs.current[currentVerseIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentVerseIdx]);

  // Stop when book changes
  useEffect(() => {
    stop();
    setCurrentVerseIdx(0);
    setProgress(0);
  }, [selectedBook]);

  function speakVerse(idx) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const verse = verses[idx];
    if (!verse) {
      // Finished all verses
      setIsPlaying(false);
      setProgress(100);
      setCelebrate(true);
      return;
    }

    const utt = new SpeechSynthesisUtterance(verse.text);
    utt.rate = speed;
    utt.volume = volume;
    utt.pitch = kidsMode ? 1.1 : 1;

    utt.onstart = () => {
      setCurrentVerseIdx(idx);
      setProgress(Math.round((idx / verses.length) * 100));
    };
    utt.onend = () => {
      const next = idx + 1;
      if (next < verses.length) {
        speakVerse(next);
      } else {
        setIsPlaying(false);
        setProgress(100);
        setCelebrate(true);
      }
    };
    utt.onerror = () => setIsPlaying(false);

    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }

  function play() {
    if (!supported) return;
    setIsPlaying(true);
    speakVerse(currentVerseIdx);
  }

  function pause() {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  }

  function resume() {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }

  function togglePlay() {
    if (isPlaying) {
      pause();
    } else if (window.speechSynthesis.paused) {
      resume();
    } else {
      play();
    }
  }

  function goToVerse(idx) {
    stop();
    setCurrentVerseIdx(idx);
    setProgress(Math.round((idx / verses.length) * 100));
  }

  function copyVerse() {
    navigator.clipboard.writeText(`${currentVerse.ref} — "${currentVerse.text}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareVerse() {
    const text = `${currentVerse.ref} — "${currentVerse.text}" | BibleFunLand.com`;
    if (navigator.share) {
      navigator.share({ title: currentVerse.ref, text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const btnSize = kidsMode ? 100 : 80;
  const fontSize = kidsMode ? '1.2rem' : '1rem';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <KidsCelebration active={celebrate} onDone={() => setCelebrate(false)} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: book.bg,
          padding: '48px 24px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative rays */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <div
            key={deg}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 300,
              height: 2,
              background: 'rgba(255,255,255,.04)',
              transform: `rotate(${deg}deg)`,
              transformOrigin: 'left center',
              pointerEvents: 'none',
            }}
          />
        ))}
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link
            to="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '.78rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,.55)',
              textDecoration: 'none',
              marginBottom: 16,
            }}
          >
            ← Back to Explore
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{ fontSize: kidsMode ? '3rem' : '2.5rem' }}>{book.emoji}</div>
            <div>
              <h1
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: kidsMode ? 'clamp(1.8rem,5vw,2.8rem)' : 'clamp(1.5rem,4vw,2.4rem)',
                  fontWeight: 800,
                  color: 'white',
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                🎙️ Voice Bible Reader
              </h1>
              <p
                style={{
                  color: 'rgba(255,255,255,.55)',
                  fontSize: '.85rem',
                  margin: '4px 0 0',
                  fontWeight: 500,
                }}
              >
                Listen to God's Word read aloud
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* ── Book selector ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: '.72rem',
              fontWeight: 800,
              color: 'var(--ink3)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            📚 Choose a Book
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))',
              gap: 10,
            }}
          >
            {BOOKS.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBook(b.id)}
                style={{
                  padding: kidsMode ? '14px 10px' : '10px 8px',
                  borderRadius: 14,
                  border: `2.5px solid ${selectedBook === b.id ? b.color : 'var(--border)'}`,
                  background: selectedBook === b.id ? b.color + '18' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  textAlign: 'center',
                  boxShadow: selectedBook === b.id ? `0 4px 14px ${b.color}30` : 'none',
                }}
              >
                <div style={{ fontSize: kidsMode ? '1.8rem' : '1.4rem', marginBottom: 4 }}>
                  {b.emoji}
                </div>
                <div
                  style={{
                    fontSize: kidsMode ? '.82rem' : '.72rem',
                    fontWeight: 800,
                    color: selectedBook === b.id ? b.color : 'var(--ink2)',
                  }}
                >
                  {b.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Not supported warning ─────────────────────────────────────────── */}
        {!supported && (
          <div
            style={{
              background: 'var(--orange-bg)',
              border: '1.5px solid var(--orange)',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 20,
              fontSize: '.85rem',
              color: 'var(--ink2)',
              fontWeight: 500,
            }}
          >
            ⚠️ Your browser doesn't support text-to-speech. Try Chrome or Edge for the best
            experience.
          </div>
        )}

        {/* ── Player card ───────────────────────────────────────────────────── */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1.5px solid var(--border)',
            overflow: 'hidden',
            marginBottom: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,.08)',
          }}
        >
          {/* Progress bar */}
          <div style={{ height: 6, background: 'var(--border)', position: 'relative' }}>
            <div
              style={{
                height: '100%',
                background: `linear-gradient(90deg,${book.color},${book.color}cc)`,
                width: `${progress}%`,
                transition: 'width .5s ease',
                borderRadius: '0 3px 3px 0',
              }}
            />
          </div>

          {/* Verse display */}
          <div
            style={{
              padding: kidsMode ? '28px 24px' : '24px 22px',
              maxHeight: 320,
              overflowY: 'auto',
            }}
          >
            {verses.map((v, i) => (
              <div
                key={i}
                ref={(el) => (verseRefs.current[i] = el)}
                onClick={() => goToVerse(i)}
                style={{
                  padding: kidsMode ? '14px 16px' : '10px 14px',
                  borderRadius: 14,
                  marginBottom: 8,
                  cursor: 'pointer',
                  background: i === currentVerseIdx ? book.color + '18' : 'transparent',
                  border: `1.5px solid ${i === currentVerseIdx ? book.color + '44' : 'transparent'}`,
                  transition: 'all .25s',
                  boxShadow: i === currentVerseIdx ? `0 4px 14px ${book.color}20` : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: '.68rem',
                    fontWeight: 800,
                    color: i === currentVerseIdx ? book.color : 'var(--ink3)',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {v.ref}
                  {i === currentVerseIdx && isPlaying && (
                    <span
                      style={{
                        marginLeft: 8,
                        animation: 'pulse 1s ease-in-out infinite',
                        display: 'inline-block',
                      }}
                    >
                      🔊
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: kidsMode ? '1.05rem' : '.9rem',
                    color: i === currentVerseIdx ? 'var(--ink)' : 'var(--ink3)',
                    lineHeight: 1.7,
                    fontWeight: i === currentVerseIdx ? 600 : 400,
                  }}
                >
                  {v.text}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg2)',
            }}
          >
            {/* Main play button + prev/next */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: kidsMode ? 20 : 16,
                marginBottom: 20,
              }}
            >
              <button
                onClick={() => goToVerse(Math.max(0, currentVerseIdx - 1))}
                style={{
                  width: kidsMode ? 52 : 44,
                  height: kidsMode ? 52 : 44,
                  borderRadius: '50%',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  fontSize: kidsMode ? '1.3rem' : '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              >
                ⏮
              </button>

              {/* Big play/pause button */}
              <button
                onClick={togglePlay}
                disabled={!supported}
                style={{
                  width: btnSize,
                  height: btnSize,
                  borderRadius: '50%',
                  background: isPlaying
                    ? `linear-gradient(135deg,#EF4444,#DC2626)`
                    : `linear-gradient(135deg,${book.color},${book.color}cc)`,
                  border: 'none',
                  cursor: supported ? 'pointer' : 'not-allowed',
                  fontSize: kidsMode ? '2.8rem' : '2.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 28px ${isPlaying ? 'rgba(239,68,68,.4)' : book.color + '50'}`,
                  transition: 'all .25s',
                  color: 'white',
                  animation: isPlaying ? 'none' : 'breathe 2s ease-in-out infinite',
                }}
                onMouseEnter={(e) => {
                  if (supported) e.currentTarget.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              <button
                onClick={() => goToVerse(Math.min(verses.length - 1, currentVerseIdx + 1))}
                style={{
                  width: kidsMode ? 52 : 44,
                  height: kidsMode ? 52 : 44,
                  borderRadius: '50%',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  fontSize: kidsMode ? '1.3rem' : '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              >
                ⏭
              </button>

              <button
                onClick={stop}
                style={{
                  width: kidsMode ? 52 : 44,
                  height: kidsMode ? 52 : 44,
                  borderRadius: '50%',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  fontSize: kidsMode ? '1.3rem' : '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              >
                ⏹
              </button>
            </div>

            {/* Speed + Volume */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Speed */}
              {!kidsMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)' }}>
                    Speed
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSpeed(s);
                          if (isPlaying) {
                            stop();
                            setTimeout(play, 100);
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 7,
                          border: `1.5px solid ${speed === s ? book.color : 'var(--border)'}`,
                          background: speed === s ? book.color + '18' : 'var(--surface)',
                          color: speed === s ? book.color : 'var(--ink3)',
                          fontSize: '.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Volume */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)' }}>
                  🔊
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ width: kidsMode ? 120 : 90, accentColor: book.color }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Verse actions (parent/teacher mode) ──────────────────────────── */}
        {!kidsMode && currentVerse && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              onClick={copyVerse}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 11,
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--ink2)',
                fontWeight: 700,
                fontSize: '.8rem',
                cursor: 'pointer',
              }}
            >
              {copied ? '✅ Copied!' : '📋 Copy Verse'}
            </button>
            <button
              onClick={shareVerse}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 11,
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--ink2)',
                fontWeight: 700,
                fontSize: '.8rem',
                cursor: 'pointer',
              }}
            >
              📤 Share
            </button>
            <Link
              to="/play/flashcards"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 11,
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--ink2)',
                fontWeight: 700,
                fontSize: '.8rem',
                textDecoration: 'none',
              }}
            >
              🧠 Flashcards
            </Link>
          </div>
        )}

        {/* ── Kids mode tip ─────────────────────────────────────────────────── */}
        {kidsMode && (
          <div
            style={{
              background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
              borderRadius: 18,
              border: '2px solid #FDE68A',
              padding: '16px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>💡</div>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1rem',
                fontWeight: 800,
                color: '#92400E',
                marginBottom: 4,
              }}
            >
              Tip for Kids!
            </div>
            <div style={{ fontSize: '.82rem', color: '#B45309' }}>
              Tap the big ▶ button to hear the Bible read to you. Tap a verse to jump to it!
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes breathe{0%,100%{box-shadow:0 8px 28px ${book?.color || '#3B82F6'}50}50%{box-shadow:0 8px 40px ${book?.color || '#3B82F6'}80,0 0 0 8px ${book?.color || '#3B82F6'}18}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>
    </div>
  );
}
