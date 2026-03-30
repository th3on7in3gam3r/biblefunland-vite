import { useState, useEffect, useCallback } from 'react';

// ── Daily word pool — all 5-letter Bible words ──────────────────────────────
const WORDS = [
  'GRACE',
  'FAITH',
  'PEACE',
  'MERCY',
  'CROSS',
  'LIGHT',
  'TRUST',
  'GLORY',
  'SHEEP',
  'BREAD',
  'WATER',
  'BLOOD',
  'SWORD',
  'ANGEL',
  'SERVE',
  'BLESS',
  'PSALM',
  'CROWN',
  'OLIVE',
  'STONE',
  'FLESH',
  'PRAYS',
  'FEAST',
  'JUDGE',
  'GRAIN',
  'FRUIT',
  'TRIBE',
  'ALTAR',
  'TITHE',
  'ELIJAH',
  'SINAI',
  'EGYPT',
  'DAVID',
  'MOSES',
  'AARON',
  'JUDAH',
  'PETER',
  'JAMES',
  'JONAH',
  'SARAH',
  'ESTHER',
  'PILATE',
  'HEROD',
  'LYDIA',
  'TITUS',
  'PAULS',
  'LOVER',
  'KNEEL',
  'RISEN',
  'ABIDE',
].map((w) => w.slice(0, 5).toUpperCase());

// Deduplicate and ensure exactly 5 letters
const WORD_LIST = [...new Set(WORDS)].filter((w) => w.length === 5);

// Pick today's word deterministically from date
function todaysWord() {
  const start = new Date('2025-01-01');
  const today = new Date();
  const diff = Math.floor((today - start) / 86400000);
  return WORD_LIST[diff % WORD_LIST.length];
}

const TARGET = todaysWord();
const MAX_ROWS = 6;
const COLS = 5;

const ALPHABET = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');

function tileColor(state) {
  if (state === 'correct') return { bg: '#16a34a', border: '#16a34a', color: 'white' };
  if (state === 'present') return { bg: '#ca8a04', border: '#ca8a04', color: 'white' };
  if (state === 'absent') return { bg: '#374151', border: '#374151', color: 'white' };
  return { bg: 'transparent', border: 'var(--border)', color: 'var(--ink)' };
}

function evalGuess(guess, target) {
  const result = Array(5).fill('absent');
  const pool = target.split('');
  // First pass — correct
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      pool[i] = null;
    }
  }
  // Second pass — present
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue;
    const idx = pool.indexOf(guess[i]);
    if (idx !== -1) {
      result[i] = 'present';
      pool[idx] = null;
    }
  }
  return result;
}

function shareText(guesses, won) {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const header = `📖 Bible Wordle · ${date}\n${won ? guesses.length : 'X'}/${MAX_ROWS}\n\n`;
  const grid = guesses
    .map(({ states }) =>
      states.map((s) => (s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬛')).join('')
    )
    .join('\n');
  return header + grid + '\n\nbiblefunland.com/wordle';
}

export default function BibleWordle() {
  const [guesses, setGuesses] = useState([]); // [{word, states}]
  const [current, setCurrent] = useState('');
  const [phase, setPhase] = useState('playing'); // playing | won | lost
  const [shake, setShake] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [keyStates, setKeyStates] = useState({});
  const [shared, setShared] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [streak, setStreak] = useState(() =>
    parseInt(localStorage.getItem('bfl_wordle_streak') || '0')
  );

  // Load saved game for today
  useEffect(() => {
    const saved = localStorage.getItem('bfl_wordle_' + TARGET);
    if (saved) {
      const { guesses: g, phase: p } = JSON.parse(saved);
      setGuesses(g);
      setPhase(p);
      // Rebuild key states
      const ks = {};
      g.forEach(({ word, states }) => {
        states.forEach((s, i) => {
          const k = word[i];
          if (!ks[k] || s === 'correct' || (s === 'present' && ks[k] !== 'correct')) ks[k] = s;
        });
      });
      setKeyStates(ks);
    }
  }, []);

  const saveGame = useCallback((g, p) => {
    localStorage.setItem('bfl_wordle_' + TARGET, JSON.stringify({ guesses: g, phase: p }));
  }, []);

  const submit = useCallback(() => {
    if (current.length < 5) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    const states = evalGuess(current, TARGET);
    const newGuess = { word: current, states };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    setReveal(true);
    setTimeout(() => setReveal(false), 600);

    // Update key states
    setKeyStates((ks) => {
      const next = { ...ks };
      states.forEach((s, i) => {
        const k = current[i];
        if (!next[k] || s === 'correct' || (s === 'present' && next[k] !== 'correct')) next[k] = s;
      });
      return next;
    });

    const won = states.every((s) => s === 'correct');
    const lost = !won && newGuesses.length >= MAX_ROWS;
    const newPhase = won ? 'won' : lost ? 'lost' : 'playing';
    setPhase(newPhase);
    saveGame(newGuesses, newPhase);

    if (won) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('bfl_wordle_streak', newStreak);
    }
    setCurrent('');
  }, [current, guesses, saveGame, streak]);

  const onKey = useCallback(
    (key) => {
      if (phase !== 'playing') return;
      if (key === 'ENTER') {
        submit();
        return;
      }
      if (key === '⌫' || key === 'BACKSPACE') {
        setCurrent((c) => c.slice(0, -1));
        return;
      }
      if (/^[A-Z]$/.test(key) && current.length < 5) setCurrent((c) => c + key);
    },
    [phase, current, submit]
  );

  useEffect(() => {
    const handler = (e) => onKey(e.key.toUpperCase());
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKey]);

  function doShare() {
    const text = shareText(guesses, phase === 'won');
    navigator.clipboard.writeText(text);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  // Build display grid
  const rows = [];
  for (let r = 0; r < MAX_ROWS; r++) {
    const guess = guesses[r];
    const isCurrent = r === guesses.length && phase === 'playing';
    const cells = [];
    for (let c = 0; c < COLS; c++) {
      let letter = '',
        state = '';
      if (guess) {
        letter = guess.word[c];
        state = guess.states[c];
      } else if (isCurrent) letter = current[c] || '';
      const colors = tileColor(state);
      const isReveal = guess && reveal && r === guesses.length - 1;
      cells.push(
        <div
          key={c}
          style={{
            width: 52,
            height: 52,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Baloo 2',cursive",
            fontWeight: 800,
            fontSize: '1.5rem',
            color: colors.color,
            background: colors.bg,
            border: `2px solid ${colors.border}`,
            transition: 'all .1s',
            transform: isCurrent && letter ? 'scale(1.06)' : 'scale(1)',
            animation: isReveal
              ? `flip .5s ${c * 0.1}s ease both`
              : shake && isCurrent
                ? 'shake .4s ease'
                : 'none',
            boxShadow: state === 'correct' ? '0 0 12px rgba(22,163,74,.4)' : 'none',
          }}
        >
          {letter}
        </div>
      );
    }
    rows.push(
      <div key={r} style={{ display: 'flex', gap: 6 }}>
        {cells}
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg)',
        minHeight: '100vh',
        fontFamily: 'Poppins,sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Header */}
      <div
        style={{
          width: '100%',
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
          padding: '28px 24px 20px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            marginBottom: 6,
          }}
        >
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1.6rem,4vw,2.4rem)',
              fontWeight: 800,
              color: 'white',
              margin: 0,
            }}
          >
            📖 Bible Wordle
          </h1>
          <button
            onClick={() => setShowInfo((i) => !i)}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: '.9rem',
              fontWeight: 800,
            }}
          >
            ?
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.8rem', margin: 0 }}>
          Guess today's 5-letter Bible word · Resets at midnight
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
          {[
            ['🔥', streak, 'Streak'],
            ['📅', guesses.length, 'Guesses'],
            ['✝️', WORD_LIST.length, 'Words'],
          ].map(([e, v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: 'white',
                  fontSize: '1.1rem',
                }}
              >
                {e} {v}
              </div>
              <div
                style={{
                  fontSize: '.6rem',
                  color: 'rgba(255,255,255,.35)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to play */}
      {showInfo && (
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 14,
            padding: '16px 20px',
            margin: '12px 0 0',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 10,
            }}
          >
            How to Play
          </div>
          <div
            style={{ fontSize: '.82rem', color: 'var(--ink2)', lineHeight: 1.8, fontWeight: 500 }}
          >
            Guess the 5-letter Bible word in 6 tries.
            <br />
            <span style={{ color: '#16a34a', fontWeight: 700 }}>🟩 Green</span> — right letter,
            right spot
            <br />
            <span style={{ color: '#ca8a04', fontWeight: 700 }}>🟨 Yellow</span> — right letter,
            wrong spot
            <br />
            <span
              style={{
                color: '#374151',
                fontWeight: 700,
                background: '#374151',
                padding: '0 3px',
                borderRadius: 3,
              }}
            >
              ⬛ Grey
            </span>{' '}
            — letter not in the word
            <br />
            <br />
            All words are from the Bible — names, places, themes.
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ padding: '24px 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows}
      </div>

      {/* Win / Lose banner */}
      {phase !== 'playing' && (
        <div
          style={{
            maxWidth: 360,
            width: '90%',
            background: 'var(--surface)',
            borderRadius: 20,
            border: `1.5px solid ${phase === 'won' ? 'var(--green)' : 'var(--red)'}`,
            padding: '20px 24px',
            textAlign: 'center',
            marginBottom: 16,
            animation: 'popIn .4s cubic-bezier(.34,1.56,.64,1)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{phase === 'won' ? '🎉' : '😔'}</div>
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 4,
            }}
          >
            {phase === 'won' ? `Got it in ${guesses.length}!` : 'Better luck tomorrow'}
          </div>
          <div
            style={{ fontSize: '.88rem', color: 'var(--ink3)', fontWeight: 500, marginBottom: 16 }}
          >
            The word was <strong style={{ color: 'var(--green)' }}>{TARGET}</strong>
          </div>
          <button
            onClick={doShare}
            style={{
              padding: '11px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg,#1E1B4B,#4338CA)',
              color: 'white',
              fontFamily: 'Poppins,sans-serif',
              fontWeight: 800,
              fontSize: '.88rem',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {shared ? '✅ Copied to clipboard!' : '📤 Share Result'}
          </button>
        </div>
      )}

      {/* Keyboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 28 }}>
        {[ALPHABET.slice(0, 10), ALPHABET.slice(10, 19), ['⌫', ...ALPHABET.slice(19), 'ENTER']].map(
          (row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
              {row.map((key) => {
                const state = keyStates[key];
                const colors = tileColor(state);
                const isWide = key === 'ENTER' || key === '⌫';
                return (
                  <button
                    key={key}
                    onClick={() => onKey(key)}
                    style={{
                      width: isWide ? 52 : 36,
                      height: 44,
                      borderRadius: 8,
                      border: 'none',
                      background: state ? colors.bg : 'var(--bg3)',
                      color: state ? colors.color : 'var(--ink)',
                      fontFamily: "'Baloo 2',cursive",
                      fontWeight: 800,
                      fontSize: isWide ? '.6rem' : '.9rem',
                      cursor: 'pointer',
                      transition: 'all .15s',
                      boxShadow: state === 'correct' ? '0 0 8px rgba(22,163,74,.35)' : 'none',
                    }}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>

      <style>{`
        @keyframes flip { 0%{transform:rotateX(0)} 50%{transform:rotateX(-90deg)} 100%{transform:rotateX(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes popIn { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
