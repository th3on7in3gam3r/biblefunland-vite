import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import usePageMetadata from '../hooks/usePageMetadata';
import styles from './BibleWordle.module.css';

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
  usePageMetadata({
    title: "Bible Wordle — Guess Today's 5-Letter Bible Word",
    description:
      'Play Bible Wordle free — guess the daily 5-letter Scripture word in 6 tries. Green, yellow, and grey tiles show how close you are.',
  });

  const [guesses, setGuesses] = useState([]); // [{word, states}]
  const [current, setCurrent] = useState('');
  const [phase, setPhase] = useState('playing'); // playing | won | lost
  const [shake, setShake] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [keyStates, setKeyStates] = useState({});
  const [shared, setShared] = useState(false);
  const [showInfo, setShowInfo] = useState(
    () => localStorage.getItem('bfl_wordle_help_collapsed') !== '1'
  );
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

  const toggleHelp = () => {
    setShowInfo((open) => {
      const next = !open;
      localStorage.setItem('bfl_wordle_help_collapsed', next ? '0' : '1');
      return next;
    });
  };

  const submitHint =
    phase === 'playing' && current.length > 0
      ? current.length < 5
        ? `Type ${5 - current.length} more letter${5 - current.length === 1 ? '' : 's'}, then press ENTER`
        : 'Ready! Press ENTER (or tap ENTER below) to submit your guess'
      : phase === 'playing' && guesses.length === 0
        ? 'Type any 5-letter word, then press ENTER to start'
        : null;

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
          className={`${styles.tile}${isCurrent && letter ? ` ${styles.tileActive}` : ''}`}
          style={{
            color: colors.color,
            background: colors.bg,
            border: `2px solid ${colors.border}`,
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
      <div key={r} className={styles.row}>
        {cells}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link to="/play" className={styles.back}>
            ← Play Hub
          </Link>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>📖 Bible Wordle</h1>
            <button
              type="button"
              onClick={toggleHelp}
              className={styles.helpBtn}
              aria-label={showInfo ? 'Hide how to play' : 'Show how to play'}
              aria-expanded={showInfo}
            >
              ?
            </button>
          </div>
          <p className={styles.subtitle}>
            Guess today&apos;s 5-letter Bible word · New puzzle every day at midnight
          </p>
          <div className={styles.stats}>
            {[
              ['🔥', streak, 'Day streak'],
              ['📅', guesses.length, 'Guesses today'],
              ['✝️', WORD_LIST.length, 'Words in pool'],
            ].map(([e, v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div className={styles.statValue}>
                  {e} {v}
                </div>
                <div className={styles.statLabel}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {showInfo && (
        <section className={styles.guide} aria-label="How to play Bible Wordle">
          <h2 className={styles.guideTitle}>📋 How to Play</h2>
          <ol className={styles.guideSteps}>
            <li>
              <strong>Type a 5-letter word</strong> using your keyboard or the on-screen keys below.
            </li>
            <li>
              <strong>Press ENTER</strong> to submit — letters stay white until you submit!
            </li>
            <li>
              <strong>Use the colored feedback</strong> to refine your next guess (up to 6 tries).
            </li>
            <li>
              <strong>Win</strong> when every tile turns green, or come back tomorrow for a new
              word.
            </li>
          </ol>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.swatchCorrect}`}>A</span>
              <span>
                <strong>Green</strong> — right letter, right spot
              </span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.swatchPresent}`}>A</span>
              <span>
                <strong>Yellow</strong> — right letter, wrong spot
              </span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.swatchAbsent}`}>A</span>
              <span>
                <strong>Grey</strong> — letter not in today&apos;s word
              </span>
            </div>
          </div>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: '0.76rem',
              color: 'var(--ink3)',
              lineHeight: 1.6,
            }}
          >
            Words are Bible-themed — names, places, and faith words like GRACE, FAITH, DAVID, and
            PSALM. Use <strong>⌫</strong> to delete a letter.
          </p>
        </section>
      )}

      {submitHint && (
        <p
          className={`${styles.submitHint}${
            current.length === 5 ? ` ${styles.submitHintReady}` : ''
          }`}
          role="status"
        >
          {submitHint}
        </p>
      )}

      <div className={styles.grid}>{rows}</div>

      {/* Win / Lose banner */}
      {phase !== 'playing' && (
        <div
          className={`${styles.resultBanner} ${
            phase === 'won' ? styles.resultBannerWon : styles.resultBannerLost
          }`}
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

      <div className={styles.keyboard}>
        {[ALPHABET.slice(0, 10), ALPHABET.slice(10, 19), ['⌫', ...ALPHABET.slice(19), 'ENTER']].map(
          (row, ri) => (
            <div key={ri} className={styles.keyRow}>
              {row.map((key) => {
                const state = keyStates[key];
                const colors = tileColor(state);
                const isWide = key === 'ENTER' || key === '⌫';
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onKey(key)}
                    className={`${styles.key} ${isWide ? styles.keyWide : styles.keyNormal}`}
                    style={{
                      background: state ? colors.bg : 'var(--bg3)',
                      color: state ? colors.color : 'var(--ink)',
                      boxShadow: state === 'correct' ? '0 0 8px rgba(22,163,74,.35)' : 'none',
                    }}
                    aria-label={key === '⌫' ? 'Backspace' : key === 'ENTER' ? 'Submit guess' : key}
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
        .${styles.tile} { animation-name: flip, shake; }
        @keyframes flip { 0%{transform:rotateX(0)} 50%{transform:rotateX(-90deg)} 100%{transform:rotateX(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
      `}</style>
    </div>
  );
}
