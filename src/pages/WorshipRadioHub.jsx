import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusic, TRACKS } from '../context/MusicContext';

// ── Live radio stations ───────────────────────────────────────────────────────
const STATIONS = [
  {
    name: 'Air1 Radio',
    genre: 'Contemporary Christian Worship',
    url: 'https://maestro.emfcdn.com/stream_for/air1/web/aac',
    emoji: '📻',
    color: '#3B82F6',
    description: 'Uplifting worship hits 24/7',
  },
  {
    name: 'K-LOVE',
    genre: 'Christian Hits',
    url: 'https://maestro.emfcdn.com/stream_for/k-love/web/aac',
    emoji: '🎵',
    color: '#8B5CF6',
    description: 'Positive, encouraging music',
  },
  {
    name: 'Moody Radio',
    genre: 'Bible Teaching & Music',
    url: 'https://primary.moodyradio.org/moody-chicago-mp3',
    emoji: '📖',
    color: '#10B981',
    description: 'Scripture-based teaching & worship',
  },
  {
    name: 'Way FM',
    genre: 'Worship & Praise',
    url: 'https://ais-sa8.cdnstream1.com/3144_64.aac',
    emoji: '🙏',
    color: '#F97316',
    description: 'Praise music all day long',
  },
];

// ── Equalizer animation ───────────────────────────────────────────────────────
function EqBars({ color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ height: ['4px', '14px', '6px', '12px', '4px'] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          style={{ width: 3, background: color, borderRadius: 2, display: 'block' }}
        />
      ))}
    </span>
  );
}

// ── Bible Radio tab ───────────────────────────────────────────────────────────
function RadioTab() {
  const [activeStation, setActiveStation] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = 0.8;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  function selectStation(s) {
    const audio = audioRef.current;
    setError(null);
    audio.pause();
    audio.src = s.url;
    setActiveStation(s);
    setLoading(true);
    audio.play()
      .then(() => { setPlaying(true); setLoading(false); })
      .catch((e) => { setLoading(false); setError(e.message); setPlaying(false); });
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!activeStation) { selectStation(STATIONS[0]); return; }
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      audio.play()
        .then(() => { setPlaying(true); setLoading(false); })
        .catch((e) => { setLoading(false); setError(e.message); });
    }
  }

  const cur = activeStation || STATIONS[0];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Now playing hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: `linear-gradient(135deg, ${cur.color}22, ${cur.color}11)`,
          border: `1.5px solid ${cur.color}44`,
          borderRadius: 24,
          padding: '32px 28px',
          marginBottom: 24,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 300, height: 300, borderRadius: '50%',
          background: `radial-gradient(circle, ${cur.color}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>{cur.emoji}</div>
        <h3 style={{
          fontFamily: "'Baloo 2', cursive", fontSize: '1.6rem',
          fontWeight: 800, color: 'white', marginBottom: 4,
        }}>
          {cur.name}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '.9rem', marginBottom: 20 }}>
          {cur.genre}
        </p>

        {/* Status */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,0,0,0.25)', borderRadius: 100,
          padding: '6px 16px', marginBottom: 20, fontSize: '.82rem', fontWeight: 700,
          color: playing ? '#4ADE80' : 'rgba(255,255,255,0.5)',
        }}>
          {playing ? (
            <><EqBars color="#4ADE80" /> 🔴 LIVE — Playing now</>
          ) : loading ? (
            <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Connecting...</>
          ) : (
            '⏸ Paused — tap to play'
          )}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '10px 16px', marginBottom: 16,
            fontSize: '.8rem', color: '#FCA5A5',
          }}>
            ⚠️ Stream unavailable — try another station
          </div>
        )}

        {/* Big play button */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={togglePlay}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `linear-gradient(135deg, ${cur.color}, ${cur.color}cc)`,
            border: 'none', cursor: 'pointer', fontSize: '1.8rem',
            boxShadow: `0 8px 28px ${cur.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
          }}
          aria-label={playing ? 'Pause radio' : 'Play radio'}
        >
          {loading ? '⏳' : playing ? '⏸' : '▶'}
        </motion.button>
      </motion.div>

      {/* Station list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        {STATIONS.map((s, i) => {
          const isActive = activeStation?.name === s.name;
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3, boxShadow: `0 12px 32px ${s.color}30` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectStation(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 16, cursor: 'pointer',
                background: isActive ? `${s.color}18` : 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${isActive ? s.color : 'rgba(255,255,255,0.12)'}`,
                textAlign: 'left', transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: `${s.color}22`, border: `1.5px solid ${s.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem',
              }}>
                {s.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '.92rem', color: isActive ? s.color : 'white', marginBottom: 2 }}>
                  {s.name}
                </div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  {s.description}
                </div>
              </div>
              {isActive && playing && <EqBars color={s.color} />}
              {isActive && !playing && (
                <span style={{ fontSize: '.7rem', color: s.color, fontWeight: 700 }}>SELECTED</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <p style={{
        textAlign: 'center', marginTop: 20,
        fontSize: '.75rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6,
      }}>
        ⚠️ Stream availability depends on your location and the station's server.
        All streams are owned by their respective broadcasters.
      </p>
    </div>
  );
}

// ── Worship Music tab ─────────────────────────────────────────────────────────
function WorshipTab() {
  const {
    tracks, trackIndex, setTrackIndex,
    isPlaying, togglePlay, play,
    currentTime, duration, seek,
    volume, setVolume, formatTime,
    currentTrack, nextTrack, prevTrack,
  } = useMusic();

  const progress = duration ? (currentTime / duration) * 100 : 0;

  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    seek(Math.max(0, Math.min(100, pct)));
  }

  function selectTrack(i) {
    setTrackIndex(i);
    setTimeout(() => play(), 80);
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Now playing card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15))',
          border: '1.5px solid rgba(139,92,246,0.35)',
          borderRadius: 24, padding: '32px 28px',
          marginBottom: 24, textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎵</div>
        <h3 style={{
          fontFamily: "'Baloo 2', cursive", fontSize: '1.5rem',
          fontWeight: 800, color: 'white', marginBottom: 4,
        }}>
          {currentTrack.title}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '.9rem', marginBottom: 24 }}>
          {currentTrack.artist}
        </p>

        {/* Progress bar */}
        <div
          onClick={handleSeek}
          style={{
            height: 6, background: 'rgba(255,255,255,0.12)',
            borderRadius: 99, cursor: 'pointer', marginBottom: 8,
            position: 'relative', overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, #8B5CF6, #6366F1)',
              width: `${progress}%`,
            }}
          />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '.72rem', color: 'rgba(255,255,255,0.4)',
          fontWeight: 600, marginBottom: 20,
        }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration) || currentTrack.duration}</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={prevTrack}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '1.4rem', cursor: 'pointer' }}
            aria-label="Previous track"
          >⏮</motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            onClick={togglePlay}
            style={{
              width: 68, height: 68, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              border: 'none', cursor: 'pointer', fontSize: '1.6rem',
              boxShadow: '0 8px 28px rgba(139,92,246,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={nextTrack}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '1.4rem', cursor: 'pointer' }}
            aria-label="Next track"
          >⏭</motion.button>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <span style={{ fontSize: '.9rem' }}>🔈</span>
          <input
            type="range" min={0} max={1} step={0.05} value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: 120, accentColor: '#8B5CF6' }}
            aria-label="Volume"
          />
          <span style={{ fontSize: '.9rem' }}>🔊</span>
        </div>
      </motion.div>

      {/* Track list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tracks.map((t, i) => {
          const isActive = i === trackIndex;
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectTrack(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
                background: isActive ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${isActive ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                textAlign: 'left', transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: isActive ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.85rem', fontWeight: 800,
                color: isActive ? '#C4B5FD' : 'rgba(255,255,255,0.4)',
              }}>
                {isActive && isPlaying ? <EqBars color="#C4B5FD" /> : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', color: isActive ? '#C4B5FD' : 'white', marginBottom: 2 }}>
                  {t.title}
                </div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  {t.artist}
                </div>
              </div>
              <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                {t.duration}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p style={{
        textAlign: 'center', marginTop: 20,
        fontSize: '.75rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6,
      }}>
        🎵 Worship tracks are placeholder files. Add your MP3s to <code style={{ color: 'rgba(255,255,255,0.4)' }}>/public/music/</code> to enable playback.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WorshipRadioHub() {
  const [tab, setTab] = useState(0);

  const TABS = [
    { label: '📻 Bible Radio', sublabel: 'Live streams' },
    { label: '🎵 Worship Music', sublabel: 'On-demand playlist' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0D1B2A 0%, #1B2A4A 30%, #2D1B4E 65%, #0A2218 100%)',
      fontFamily: 'Poppins, sans-serif',
    }}>
      {/* Hero header */}
      <div style={{
        padding: '72px 24px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        {[['#8B5CF6', '20%', '10%'], ['#10B981', '75%', '20%'], ['#3B82F6', '50%', '60%']].map(([c, l, t], i) => (
          <div key={i} style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: `radial-gradient(circle, ${c}14 0%, transparent 70%)`,
            left: l, top: t, pointerEvents: 'none',
          }} />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 100, padding: '5px 16px', marginBottom: 20,
            fontSize: '.72rem', fontWeight: 800, letterSpacing: 1,
            textTransform: 'uppercase', color: '#C4B5FD',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80', display: 'inline-block' }} />
            Live & On-Demand
          </div>

          <h1 style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 800, color: 'white', lineHeight: 1.05,
            marginBottom: 14, letterSpacing: '-1px',
          }}>
            🎵 Worship &amp; Bible Radio
          </h1>
          <p style={{
            fontSize: 'clamp(.95rem, 2vw, 1.1rem)',
            color: 'rgba(255,255,255,0.6)', fontWeight: 500,
            lineHeight: 1.75, maxWidth: 560, margin: '0 auto',
          }}>
            Listen to Scripture, worship, and uplifting music —{' '}
            <strong style={{ color: '#4ADE80' }}>100% free, always ad-free.</strong>
          </p>
        </motion.div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '0 24px 40px', flexWrap: 'wrap' }}>
        {TABS.map((t, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab(i)}
            style={{
              padding: '12px 28px', borderRadius: 100, cursor: 'pointer',
              fontWeight: 800, fontSize: '.95rem', border: 'none',
              background: tab === i
                ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                : 'rgba(255,255,255,0.1)',
              color: tab === i ? 'white' : 'rgba(255,255,255,0.65)',
              boxShadow: tab === i ? '0 6px 24px rgba(245,158,11,0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
            <span style={{
              display: 'block', fontSize: '.65rem', fontWeight: 600,
              opacity: 0.75, marginTop: 1,
            }}>
              {t.sublabel}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '0 24px 80px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {tab === 0 ? <RadioTab /> : <WorshipTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
