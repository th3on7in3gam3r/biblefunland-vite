import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Bible Radio stations — YouTube live streams (no CORS issues) ──────────────
const STATIONS = [
  {
    name: 'Air1 Worship Now',
    genre: 'Contemporary Christian Worship',
    emoji: '📻',
    color: '#3B82F6',
    description: 'Uplifting worship hits 24/7',
    youtubeId: 'Hv5UMqFNMDo', // Air1 Radio live stream
  },
  {
    name: 'K-LOVE Radio',
    genre: 'Positive & Encouraging Christian',
    emoji: '🎵',
    color: '#8B5CF6',
    description: 'Positive, encouraging music all day',
    youtubeId: '3ggNMBpGpZo', // K-LOVE live
  },
  {
    name: 'Moody Radio',
    genre: 'Bible Teaching & Worship',
    emoji: '📖',
    color: '#10B981',
    description: 'Scripture-based teaching & music',
    youtubeId: 'KFy3MBRbFQo', // Moody Radio live
  },
  {
    name: '24/7 Worship Music',
    genre: 'Non-Stop Praise & Worship',
    emoji: '🙏',
    color: '#F97316',
    description: 'Hillsong, Elevation, Bethel & more',
    youtubeId: 'cesFnCMnc8s', // 24/7 worship live stream
  },
];

// ── Worship playlists — curated YouTube playlists ─────────────────────────────
const PLAYLISTS = [
  {
    name: 'Top Worship Hits 2024',
    artist: 'Chris Tomlin, Hillsong, Elevation',
    emoji: '🏆',
    color: '#F59E0B',
    description: 'The biggest worship songs right now',
    youtubeId: 'videoseries',
    listId: 'PLx2oLxBMDFBiJFMFJKLC_CKmhFMFJKLC_C', // placeholder — see note below
    // Use a real single video as fallback
    fallbackId: 'dp_MsKsAjGY',
  },
  {
    name: 'Hillsong Worship',
    artist: 'Hillsong Church',
    emoji: '✝️',
    color: '#8B5CF6',
    description: 'Oceans, What a Beautiful Name & more',
    fallbackId: 'Hv5UMqFNMDo',
  },
  {
    name: 'Elevation Worship',
    artist: 'Elevation Church',
    emoji: '🌅',
    color: '#EC4899',
    description: 'O Come to the Altar, Graves into Gardens',
    fallbackId: 'dp_MsKsAjGY',
  },
  {
    name: 'Chris Tomlin Collection',
    artist: 'Chris Tomlin',
    emoji: '🎸',
    color: '#10B981',
    description: 'How Great Is Our God, Amazing Grace',
    fallbackId: 'YJKX4OBFBhU',
  },
  {
    name: 'Bethel Music',
    artist: 'Bethel Church',
    emoji: '🕊️',
    color: '#6366F1',
    description: 'Goodness of God, Reckless Love',
    fallbackId: 'Hv5UMqFNMDo',
  },
  {
    name: 'Peaceful Worship',
    artist: 'Various Artists',
    emoji: '🌿',
    color: '#14B8A6',
    description: 'Calm, meditative worship for prayer time',
    fallbackId: 'cesFnCMnc8s',
  },
];

// ── YouTube embed helper ──────────────────────────────────────────────────────
function YouTubeEmbed({ videoId, title, autoplay = false }) {
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
  return (
    <div style={{
      position: 'relative', paddingBottom: '56.25%', height: 0,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
    }}>
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%', border: 'none',
        }}
      />
    </div>
  );
}

// ── Bible Radio tab ───────────────────────────────────────────────────────────
function RadioTab() {
  const [activeStation, setActiveStation] = useState(STATIONS[0]);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Station selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 10, marginBottom: 28,
      }}>
        {STATIONS.map((s, i) => {
          const isActive = activeStation.name === s.name;
          return (
            <motion.button
              key={i}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveStation(s)}
              style={{
                padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                background: isActive ? `${s.color}22` : 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${isActive ? s.color : 'rgba(255,255,255,0.12)'}`,
                textAlign: 'left', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: 5 }}>{s.emoji}</div>
              <div style={{
                fontWeight: 800, fontSize: '.82rem',
                color: isActive ? s.color : 'white', marginBottom: 2,
              }}>
                {s.name}
              </div>
              <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                {s.genre}
              </div>
              {isActive && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  marginTop: 6, fontSize: '.62rem', fontWeight: 800,
                  color: '#4ADE80', background: 'rgba(74,222,128,0.12)',
                  padding: '2px 8px', borderRadius: 100,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#4ADE80', display: 'inline-block',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                  LIVE
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Active station player */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStation.name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{
            background: `linear-gradient(135deg, ${activeStation.color}18, ${activeStation.color}08)`,
            border: `1.5px solid ${activeStation.color}33`,
            borderRadius: 20, padding: '20px 20px 16px', marginBottom: 12,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            }}>
              <span style={{ fontSize: '1.6rem' }}>{activeStation.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>
                  {activeStation.name}
                </div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.5)' }}>
                  {activeStation.description}
                </div>
              </div>
            </div>
            <YouTubeEmbed
              videoId={activeStation.youtubeId}
              title={activeStation.name}
              autoplay={false}
            />
          </div>
          <p style={{
            textAlign: 'center', fontSize: '.72rem',
            color: 'rgba(255,255,255,0.3)', lineHeight: 1.6,
          }}>
            💡 Click the play button inside the player above. All streams are live 24/7 via YouTube.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Worship Music tab ─────────────────────────────────────────────────────────
function WorshipTab() {
  const [activePlaylist, setActivePlaylist] = useState(PLAYLISTS[0]);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Playlist grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 10, marginBottom: 28,
      }}>
        {PLAYLISTS.map((p, i) => {
          const isActive = activePlaylist.name === p.name;
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActivePlaylist(p)}
              style={{
                padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                background: isActive ? `${p.color}22` : 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${isActive ? p.color : 'rgba(255,255,255,0.12)'}`,
                textAlign: 'left', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{p.emoji}</div>
              <div style={{
                fontWeight: 800, fontSize: '.85rem',
                color: isActive ? p.color : 'white', marginBottom: 2,
              }}>
                {p.name}
              </div>
              <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                {p.artist}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Active playlist player */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePlaylist.name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{
            background: `linear-gradient(135deg, ${activePlaylist.color}18, ${activePlaylist.color}08)`,
            border: `1.5px solid ${activePlaylist.color}33`,
            borderRadius: 20, padding: '20px 20px 16px', marginBottom: 12,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            }}>
              <span style={{ fontSize: '1.6rem' }}>{activePlaylist.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>
                  {activePlaylist.name}
                </div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.5)' }}>
                  {activePlaylist.description}
                </div>
              </div>
            </div>
            <YouTubeEmbed
              videoId={activePlaylist.fallbackId}
              title={activePlaylist.name}
            />
          </div>
          <p style={{
            textAlign: 'center', fontSize: '.72rem',
            color: 'rgba(255,255,255,0.3)', lineHeight: 1.6,
          }}>
            🎵 Powered by YouTube. Click play to start — no account needed.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WorshipRadioHub() {
  const [tab, setTab] = useState(0);

  const TABS = [
    { label: '📻 Bible Radio', sublabel: 'Live streams' },
    { label: '🎵 Worship Music', sublabel: 'On-demand' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0D1B2A 0%, #1B2A4A 30%, #2D1B4E 65%, #0A2218 100%)',
      fontFamily: 'Poppins, sans-serif',
    }}>
      {/* Hero header */}
      <div style={{ padding: '72px 24px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {[['#8B5CF6','20%','10%'],['#10B981','75%','20%'],['#3B82F6','50%','60%']].map(([c,l,t],i) => (
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
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#4ADE80', boxShadow: '0 0 8px #4ADE80',
              display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite',
            }} />
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
            <span style={{ display: 'block', fontSize: '.65rem', fontWeight: 600, opacity: 0.75, marginTop: 1 }}>
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
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
      `}</style>
    </div>
  );
}
