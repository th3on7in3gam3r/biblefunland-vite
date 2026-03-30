import { useState, useRef, useEffect } from 'react';

const VERSES = [
  {
    ref: 'John 3:16',
    text: 'For God so loved the world that he gave his one and only Son that whoever believes in him shall not perish but have eternal life',
  },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd I shall not want' },
  { ref: 'Philippians 4:13', text: 'I can do all this through him who gives me strength' },
  {
    ref: 'Jeremiah 29:11',
    text: 'For I know the plans I have for you declares the Lord plans to prosper you and not to harm you plans to give you hope and a future',
  },
  {
    ref: 'Joshua 1:9',
    text: 'Have I not commanded you be strong and courageous do not be afraid do not be discouraged for the Lord your God will be with you wherever you go',
  },
  {
    ref: 'Romans 8:28',
    text: 'And we know that in all things God works for the good of those who love him who have been called according to his purpose',
  },
  {
    ref: 'Proverbs 3:5-6',
    text: 'Trust in the Lord with all your heart and lean not on your own understanding in all your ways submit to him and he will make your paths straight',
  },
  {
    ref: 'Isaiah 40:31',
    text: 'But those who hope in the Lord will renew their strength they will soar on wings like eagles they will run and not grow weary they will walk and not be faint',
  },
];

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function compareWords(spoken, target) {
  const spokenWords = normalize(spoken).split(' ');
  const targetWords = normalize(target).split(' ');
  let correct = 0;
  targetWords.forEach((word, i) => {
    if (spokenWords[i] === word) correct++;
  });
  return Math.round((correct / targetWords.length) * 100);
}

export default function VoiceBibleReader() {
  const [verseIdx, setVerseIdx] = useState(0);
  const [phase, setPhase] = useState('ready'); // ready | listening | done
  const [transcript, setTranscript] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [wordResults, setWordResults] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(() =>
    parseInt(localStorage.getItem('bfl_voice_best') || '0')
  );
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const verse = VERSES[verseIdx];

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;
    setPhase('listening');
    setTranscript('');
    setAccuracy(null);
    setWordResults([]);

    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setTranscript(spoken);
      const score = compareWords(spoken, verse.text);
      setAccuracy(score);
      setAttempts((a) => a + 1);
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem('bfl_voice_best', score);
      }
      // Word-by-word comparison
      const spokenNorm = normalize(spoken).split(' ');
      const targetNorm = normalize(verse.text).split(' ');
      const results = targetNorm.map((word, i) => ({
        word: verse.text.split(' ')[i] || word,
        correct: spokenNorm[i] === word,
        spoken: spokenNorm[i] || null,
      }));
      setWordResults(results);
      setPhase('done');
    };

    recognition.onerror = (e) => {
      setPhase('ready');
      if (e.error !== 'aborted')
        alert('Microphone error: ' + e.error + '. Please allow microphone access.');
    };

    recognition.onend = () => {
      if (phase === 'listening') setPhase('ready');
    };

    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setPhase('ready');
  }

  function nextVerse() {
    setVerseIdx((i) => (i + 1) % VERSES.length);
    setPhase('ready');
    setTranscript('');
    setAccuracy(null);
    setWordResults([]);
  }

  function getGrade(score) {
    if (score >= 95)
      return {
        grade: 'A+',
        label: 'Perfect! 🏆',
        color: 'var(--green)',
        bg: 'var(--green-bg)',
        msg: 'Flawless recitation! You know this verse by heart.',
      };
    if (score >= 85)
      return {
        grade: 'A',
        label: 'Excellent! ⭐',
        color: 'var(--green)',
        bg: 'var(--green-bg)',
        msg: 'Nearly perfect — just a few small differences.',
      };
    if (score >= 70)
      return {
        grade: 'B',
        label: 'Good Job! 📖',
        color: 'var(--blue)',
        bg: 'var(--blue-bg)',
        msg: 'Solid reading! Try again to get closer to the original.',
      };
    if (score >= 50)
      return {
        grade: 'C',
        label: 'Keep Practicing! 💪',
        color: 'var(--orange)',
        bg: 'var(--orange-bg)',
        msg: 'Good effort! Read the verse again and try one more time.',
      };
    return {
      grade: 'D',
      label: 'Keep Trying! 🌱',
      color: 'var(--red)',
      bg: 'var(--red-bg)',
      msg: "No worries — scripture memory takes practice. You've got this!",
    };
  }

  const grade = accuracy !== null ? getGrade(accuracy) : null;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0C4A6E,#0369A1)',
          padding: '56px 36px 44px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '.7rem',
            fontWeight: 700,
            background: 'rgba(255,255,255,.12)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 100,
            marginBottom: 12,
          }}
        >
          🎙️ Uses Your Browser Microphone
        </div>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 8,
          }}
        >
          Voice Bible Reader
        </h1>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.92rem', fontWeight: 500 }}>
          Read the verse aloud — your browser listens and grades your accuracy word by word.
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
        {!supported && (
          <div
            style={{
              background: 'var(--orange-bg)',
              border: '1.5px solid var(--orange)',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 24,
              fontSize: '.88rem',
              color: 'var(--ink2)',
              fontWeight: 500,
            }}
          >
            ⚠️ Your browser doesn't support the Web Speech API. Try Chrome or Edge on desktop for
            the best experience.
          </div>
        )}

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
            ['🎯', accuracy !== null ? accuracy + '%' : '--', 'Last Score', 'var(--blue)'],
            ['🏆', bestScore + '%', 'Best Score', 'var(--yellow)'],
            ['📖', attempts, 'Attempts', 'var(--violet)'],
          ].map(([e, v, l, c], i) => (
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
              <div style={{ fontSize: '1.6rem', marginBottom: 5 }}>{e}</div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: c,
                  lineHeight: 1,
                }}
              >
                {v}
              </div>
              <div
                style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--ink3)', marginTop: 3 }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>

        {/* Verse card */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--sh)',
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: '20px 28px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--blue)',
              }}
            >
              📖 {verse.ref}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {VERSES.map((_, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setVerseIdx(i);
                    setPhase('ready');
                    setTranscript('');
                    setAccuracy(null);
                    setWordResults([]);
                  }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: i === verseIdx ? 'var(--blue)' : 'var(--bg3)',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ padding: '28px 32px' }}>
            {/* Show word-by-word result if done */}
            {phase === 'done' && wordResults.length > 0 ? (
              <div style={{ fontSize: '1.05rem', lineHeight: 2, fontWeight: 500 }}>
                {wordResults.map((w, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      marginRight: 5,
                      borderRadius: 5,
                      padding: '0 4px',
                      background: w.correct ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: w.correct ? 'var(--green)' : 'var(--red)',
                      fontWeight: w.correct ? 600 : 700,
                      textDecoration: w.correct ? 'none' : 'underline',
                      position: 'relative',
                    }}
                    title={!w.correct && w.spoken ? `You said: "${w.spoken}"` : ''}
                  >
                    {w.word}
                  </span>
                ))}
              </div>
            ) : (
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                }}
              >
                "{verse.text}."
              </div>
            )}
          </div>

          {/* Mic button */}
          <div
            style={{
              padding: '20px 28px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'center',
              gap: 14,
              alignItems: 'center',
            }}
          >
            {phase !== 'listening' ? (
              <button
                onClick={startListening}
                disabled={!supported}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#0369A1,#0EA5E9)',
                  border: 'none',
                  color: 'white',
                  fontSize: '2rem',
                  cursor: supported ? 'pointer' : 'not-allowed',
                  boxShadow: '0 6px 24px rgba(3,105,161,.35)',
                  transition: 'all .25s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  if (supported) e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                🎙️
              </button>
            ) : (
              <button
                onClick={stopListening}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: 'var(--red)',
                  border: 'none',
                  color: 'white',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  animation: 'pulse 1s ease-in-out infinite',
                  boxShadow: '0 0 0 0 var(--red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⏹️
              </button>
            )}
            <div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '.95rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 3,
                }}
              >
                {phase === 'ready' && 'Tap the mic and read the verse aloud'}
                {phase === 'listening' && '🔴 Listening... read clearly and slowly'}
                {phase === 'done' && 'Tap to try again!'}
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--ink3)', fontWeight: 500 }}>
                {phase === 'listening'
                  ? 'Speak at a normal pace. Tap ⏹️ when done.'
                  : 'Speak naturally. Green = correct, Red = missed.'}
              </div>
            </div>
          </div>
        </div>

        {/* Grade result */}
        {grade && (
          <div
            style={{
              background: grade.bg,
              border: `1.5px solid ${grade.color}44`,
              borderRadius: 20,
              padding: '22px 26px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '3rem',
                fontWeight: 800,
                color: grade.color,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {grade.grade}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 4,
                }}
              >
                {grade.label} — {accuracy}% Accuracy
              </div>
              <div style={{ fontSize: '.84rem', color: 'var(--ink2)', fontWeight: 500 }}>
                {grade.msg}
              </div>
            </div>
          </div>
        )}

        {transcript && (
          <div
            style={{
              background: 'var(--bg2)',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 20,
              fontSize: '.85rem',
              color: 'var(--ink2)',
              fontWeight: 500,
              border: '1.5px solid var(--border)',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--ink3)' }}>You said: </span>"{transcript}"
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {phase === 'done' && (
            <button className="btn btn-blue" onClick={startListening}>
              🔄 Try Again
            </button>
          )}
          <button className="btn btn-outline" onClick={nextVerse}>
            → Next Verse
          </button>
          <a href="/flashcards" className="btn btn-outline">
            🧠 Flashcards
          </a>
        </div>
      </div>
      <style>{`@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}70%{box-shadow:0 0 0 14px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}`}</style>
    </div>
  );
}
