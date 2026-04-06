import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBadges } from '../context/BadgeContext';
import { useKidsMode } from '../context/KidsModeContext';
import { execute, query } from '../lib/db';
import { LOCATIONS, ERAS, DAILY_QUESTS } from '../data/bibleMapLocations';

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeIcon(color, discovered, kidsMode) {
  const size = kidsMode ? 32 : 24;
  const inner = discovered
    ? `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 12px ${color}80;display:flex;align-items:center;justify-content:center;font-size:${kidsMode ? '14px' : '10px'}">✓</div>`
    : `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35);animation:mapPulse 2s ease-in-out infinite"></div>`;
  return L.divIcon({
    className: '',
    html: inner,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
}

function FlyTo({ loc }) {
  const map = useMap();
  useEffect(() => {
    if (loc) map.flyTo([loc.lat, loc.lng], 9, { duration: 1.2 });
  }, [loc, map]);
  return null;
}

// ── Mini Challenge ────────────────────────────────────────────────────────────
function MiniChallenge({ challenge, onComplete, kidsMode }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === challenge.answer;

  function submit() {
    if (selected === null) return;
    setSubmitted(true);
    if (correct) setTimeout(() => onComplete(challenge.points), 800);
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
      border: '2px solid #DDD6FE', borderRadius: 16,
      padding: kidsMode ? '18px 16px' : '14px 14px', marginTop: 14,
    }}>
      <div style={{
        fontFamily: "'Baloo 2',cursive", fontWeight: 800,
        fontSize: kidsMode ? '1rem' : '.88rem', color: '#4C1D95', marginBottom: 10,
      }}>
        🎯 {kidsMode ? 'Quick Question!' : 'Mini Challenge'} — earn {challenge.points} pts
      </div>
      <p style={{ fontSize: kidsMode ? '.9rem' : '.82rem', fontWeight: 600, color: '#1E1B4B', marginBottom: 10, lineHeight: 1.5 }}>
        {challenge.question}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {challenge.options.map((opt, i) => {
          let bg = 'white', border = '#DDD6FE', color = '#4C1D95';
          if (submitted) {
            if (i === challenge.answer) { bg = '#ECFDF5'; border = '#10B981'; color = '#065F46'; }
            else if (i === selected) { bg = '#FEF2F2'; border = '#EF4444'; color = '#991B1B'; }
          } else if (selected === i) { bg = '#EDE9FE'; border = '#8B5CF6'; }
          return (
            <button key={i} onClick={() => !submitted && setSelected(i)} style={{
              padding: kidsMode ? '10px 12px' : '8px 10px',
              borderRadius: 10, border: `1.5px solid ${border}`,
              background: bg, color, fontWeight: 600,
              fontSize: kidsMode ? '.88rem' : '.78rem',
              cursor: submitted ? 'default' : 'pointer',
              textAlign: 'left', fontFamily: 'Poppins,sans-serif',
              transition: 'all .15s',
            }}>
              {submitted && i === challenge.answer ? '✅ ' : submitted && i === selected ? '❌ ' : `${['A','B','C','D'][i]}. `}
              {opt}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button onClick={submit} disabled={selected === null} style={{
          width: '100%', padding: kidsMode ? '11px' : '9px',
          borderRadius: 10, border: 'none',
          background: selected !== null ? '#8B5CF6' : '#E5E7EB',
          color: selected !== null ? 'white' : '#9CA3AF',
          fontWeight: 800, fontSize: kidsMode ? '.9rem' : '.8rem',
          cursor: selected !== null ? 'pointer' : 'not-allowed',
          fontFamily: 'Poppins,sans-serif',
        }}>
          Submit Answer
        </button>
      ) : (
        <div style={{
          textAlign: 'center', padding: '8px',
          fontWeight: 800, fontSize: kidsMode ? '.95rem' : '.85rem',
          color: correct ? '#065F46' : '#991B1B',
        }}>
          {correct ? `🎉 Correct! +${challenge.points} points!` : '❌ Not quite — the correct answer is highlighted above.'}
        </div>
      )}
    </div>
  );
}

// ── Location Detail Panel ─────────────────────────────────────────────────────
function LocationPanel({ loc, discovered, onDiscover, onClose, kidsMode }) {
  const [challengeDone, setChallengeDone] = useState(discovered);
  const [points, setPoints] = useState(null);

  function handleComplete(pts) {
    setPoints(pts);
    setChallengeDone(true);
    onDiscover(loc.id, pts);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      {/* Era badges */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {loc.eras.map(eraId => {
          const era = ERAS.find(e => e.id === eraId);
          return era ? (
            <span key={eraId} style={{
              fontSize: '.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99,
              background: `${era.color}18`, color: era.color,
              border: `1px solid ${era.color}30`,
            }}>
              {era.emoji} {era.label}
            </span>
          ) : null;
        })}
        <span style={{
          fontSize: '.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
          background: 'var(--bg3)', color: 'var(--ink3)',
        }}>
          {loc.region}
        </span>
      </div>

      {/* Discovered stamp */}
      {discovered && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: '.68rem', fontWeight: 800, color: '#065F46',
          background: '#ECFDF5', border: '1px solid #6EE7B7',
          padding: '3px 10px', borderRadius: 99, marginBottom: 10,
        }}>
          ✅ Discovered!
        </div>
      )}

      <div style={{
        fontFamily: "'Baloo 2',cursive", fontWeight: 800,
        fontSize: kidsMode ? '1.5rem' : '1.3rem', color: 'var(--ink)', marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>{loc.emoji}</span> {loc.name}
      </div>

      <p style={{ fontSize: kidsMode ? '.9rem' : '.82rem', color: 'var(--ink2)', lineHeight: 1.7, marginBottom: 14 }}>
        {loc.desc}
      </p>

      {/* Stories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
        {loc.stories.map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg2)', borderRadius: 10, padding: '9px 11px',
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: kidsMode ? '.85rem' : '.78rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 1 }}>{s.title}</div>
              <div style={{ fontSize: '.68rem', color: '#3B82F6', fontWeight: 600 }}>{s.ref}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Verse */}
      <div style={{
        background: 'var(--green-bg)', borderLeft: `3px solid ${loc.color}`,
        borderRadius: '0 10px 10px 0', padding: '10px 12px',
        fontSize: kidsMode ? '.85rem' : '.76rem', color: 'var(--ink2)',
        fontStyle: 'italic', fontWeight: 500, marginBottom: 14, lineHeight: 1.6,
      }}>
        {loc.verse}
      </div>

      {/* Challenge */}
      {!challengeDone ? (
        <MiniChallenge challenge={loc.challenge} onComplete={handleComplete} kidsMode={kidsMode} />
      ) : (
        <div style={{
          background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)',
          border: '1.5px solid #6EE7B7', borderRadius: 14,
          padding: '14px', textAlign: 'center', marginTop: 14,
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🏅</div>
          <div style={{ fontWeight: 800, fontSize: kidsMode ? '.95rem' : '.85rem', color: '#065F46' }}>
            {points ? `+${points} points earned!` : 'Location discovered!'}
          </div>
          {kidsMode && <div style={{ fontSize: '.8rem', color: '#059669', marginTop: 4 }}>Amazing explorer! ✨</div>}
        </div>
      )}

      <button onClick={onClose} style={{
        width: '100%', marginTop: 14, padding: '9px',
        borderRadius: 10, border: '1.5px solid var(--border)',
        background: 'var(--surface)', color: 'var(--ink2)',
        fontWeight: 700, fontSize: '.82rem', cursor: 'pointer',
        fontFamily: 'Poppins,sans-serif',
      }}>
        ← All Locations
      </button>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LivingBibleMap() {
  const { user } = useAuth();
  const { awardBadge } = useBadges();
  const { kidsMode } = useKidsMode();

  const [activeEra, setActiveEra] = useState('all');
  const [activeId, setActiveId] = useState(null);
  const [discovered, setDiscovered] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('bfl_map_discovered') || '[]')); }
    catch { return new Set(); }
  });
  const [totalPoints, setTotalPoints] = useState(() =>
    parseInt(localStorage.getItem('bfl_map_points') || '0', 10)
  );
  const [showQuest, setShowQuest] = useState(false);
  const [celebrateId, setCelebrateId] = useState(null);

  // Pick today's quest deterministically
  const todayQuest = DAILY_QUESTS[new Date().getDay() % DAILY_QUESTS.length];

  const filteredLocations = activeEra === 'all'
    ? LOCATIONS
    : LOCATIONS.filter(l => l.eras.includes(activeEra));

  const activeLoc = activeId ? LOCATIONS.find(l => l.id === activeId) : null;

  function handleDiscover(locId, pts) {
    if (discovered.has(locId)) return;
    const next = new Set([...discovered, locId]);
    setDiscovered(next);
    localStorage.setItem('bfl_map_discovered', JSON.stringify([...next]));

    const newPoints = totalPoints + (pts || 0);
    setTotalPoints(newPoints);
    localStorage.setItem('bfl_map_points', String(newPoints));

    setCelebrateId(locId);
    setTimeout(() => setCelebrateId(null), 2500);

    // Badge checks
    if (next.size === 1) awardBadge('map_pin');
    if (next.size >= 5) awardBadge('map_explorer_5');
    if (next.size >= LOCATIONS.length) awardBadge('map_master');

    // Check quest completion
    const questLocs = LOCATIONS.filter(todayQuest.filter);
    const questDone = questLocs.every(l => next.has(l.id) || l.id === locId);
    if (questDone) awardBadge(todayQuest.badge);
  }

  const questLocs = LOCATIONS.filter(todayQuest.filter);
  const questProgress = questLocs.filter(l => discovered.has(l.id)).length;
  const questComplete = questProgress >= todayQuest.target;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#064E3B 0%,#065F46 40%,#1E1B4B 100%)',
        padding: kidsMode ? '48px 24px 36px' : '56px 24px 40px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {[['#10B981','5%','10%'],['#6366F1','88%','20%'],['#F59E0B','45%','80%']].map(([c,l,t],i) => (
          <div key={i} style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle,${c}18 0%,transparent 70%)`, left: l, top: t, pointerEvents: 'none' }} />
        ))}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: kidsMode ? '3.5rem' : '2.8rem', marginBottom: 10, filter: 'drop-shadow(0 4px 16px rgba(16,185,129,0.5))' }}>🗺️</div>
          <h1 style={{
            fontFamily: "'Baloo 2',cursive", fontWeight: 800,
            fontSize: kidsMode ? 'clamp(1.8rem,5vw,2.8rem)' : 'clamp(1.6rem,4vw,2.6rem)',
            background: 'linear-gradient(90deg,#6EE7B7,#A5B4FC,#FCD34D)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 8,
          }}>
            {kidsMode ? '🌟 Bible Explorer Quest! 🌟' : 'Living Bible Map'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: kidsMode ? '.95rem' : '.88rem', maxWidth: 480, margin: '0 auto 16px', lineHeight: 1.7 }}>
            {kidsMode
              ? 'Explore Bible lands, answer questions, and earn badges! How many places can you discover? 🏅'
              : 'Explore Bible lands across every era. Discover locations, complete challenges, and earn badges.'}
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              [`${discovered.size}/${LOCATIONS.length}`, 'Discovered'],
              [`${totalPoints}`, 'Points'],
              [questComplete ? '✅' : `${questProgress}/${todayQuest.target}`, "Today's Quest"],
            ].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.3rem', color: '#6EE7B7', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Era selector */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 20px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, maxWidth: 1200, margin: '0 auto', minWidth: 'max-content' }}>
          {ERAS.map(era => (
            <button key={era.id} onClick={() => setActiveEra(era.id)} style={{
              padding: kidsMode ? '9px 16px' : '7px 14px',
              borderRadius: 99, border: `2px solid ${activeEra === era.id ? era.color : 'var(--border)'}`,
              background: activeEra === era.id ? `${era.color}15` : 'var(--surface)',
              color: activeEra === era.id ? era.color : 'var(--ink3)',
              fontWeight: activeEra === era.id ? 800 : 600,
              fontSize: kidsMode ? '.85rem' : '.78rem',
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all .15s', fontFamily: 'Poppins,sans-serif',
              boxShadow: activeEra === era.id ? `0 3px 10px ${era.color}30` : 'none',
            }}>
              {era.emoji} {era.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Quest banner */}
      <div style={{
        background: questComplete ? 'linear-gradient(135deg,#ECFDF5,#D1FAE5)' : 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
        borderBottom: `2px solid ${questComplete ? '#6EE7B7' : '#FDE68A'}`,
        padding: '10px 20px', cursor: 'pointer',
      }} onClick={() => setShowQuest(s => !s)}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.2rem' }}>{questComplete ? '✅' : '🎯'}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 800, fontSize: '.85rem', color: questComplete ? '#065F46' : '#92400E' }}>
              Today's Quest: {todayQuest.title}
            </span>
            <span style={{ fontSize: '.78rem', color: questComplete ? '#059669' : '#B45309', marginLeft: 8 }}>
              {questComplete ? 'Completed! 🎉' : `${questProgress}/${todayQuest.target} — ${todayQuest.desc}`}
            </span>
          </div>
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: questComplete ? '#065F46' : '#D97706' }}>
            +{todayQuest.points} pts {showQuest ? '▲' : '▼'}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) clamp(280px,30%,360px)',
          gap: 20, alignItems: 'start',
        }}>

          {/* Map */}
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,.1)', height: kidsMode ? 480 : 540, position: 'relative' }}>
            <MapContainer center={[31.5, 35.5]} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {activeLoc && <FlyTo loc={activeLoc} />}
              {filteredLocations.map(l => (
                <Marker
                  key={l.id}
                  position={[l.lat, l.lng]}
                  icon={makeIcon(l.color, discovered.has(l.id), kidsMode)}
                  eventHandlers={{ click: () => setActiveId(l.id) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'Poppins,sans-serif', minWidth: 140 }}>
                      <div style={{ fontWeight: 800, fontSize: '.9rem', marginBottom: 2 }}>{l.emoji} {l.name}</div>
                      <div style={{ fontSize: '.7rem', color: l.color, fontWeight: 700, marginBottom: 4 }}>{l.region}</div>
                      {discovered.has(l.id) && <div style={{ fontSize: '.68rem', color: '#065F46', fontWeight: 700 }}>✅ Discovered</div>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Celebrate overlay */}
            <AnimatePresence>
              {celebrateId && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    background: 'linear-gradient(135deg,#065F46,#064E3B)',
                    border: '2px solid #6EE7B7', borderRadius: 20,
                    padding: '20px 28px', textAlign: 'center',
                    zIndex: 1000, pointerEvents: 'none',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{ fontSize: kidsMode ? '3rem' : '2.5rem', marginBottom: 6 }}>🏅</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: kidsMode ? '1.2rem' : '1rem', color: '#6EE7B7' }}>
                    Location Discovered!
                  </div>
                  {kidsMode && <div style={{ fontSize: '.85rem', color: '#34D399', marginTop: 4 }}>Amazing! ✨🌟</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side panel */}
          <div style={{
            background: 'var(--surface)', borderRadius: 20,
            border: '1.5px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,.08)',
            padding: 18, position: 'sticky', top: 80,
            maxHeight: kidsMode ? 480 : 540, overflowY: 'auto',
          }}>
            <AnimatePresence mode="wait">
              {activeLoc ? (
                <LocationPanel
                  key={activeLoc.id}
                  loc={activeLoc}
                  discovered={discovered.has(activeLoc.id)}
                  onDiscover={handleDiscover}
                  onClose={() => setActiveId(null)}
                  kidsMode={kidsMode}
                />
              ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Progress bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                        Your Progress
                      </span>
                      <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#10B981' }}>
                        {discovered.size}/{LOCATIONS.length}
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        background: 'linear-gradient(90deg,#10B981,#6366F1)',
                        width: `${(discovered.size / LOCATIONS.length) * 100}%`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
                    {filteredLocations.length} Location{filteredLocations.length !== 1 ? 's' : ''} {activeEra !== 'all' ? `in ${ERAS.find(e => e.id === activeEra)?.label}` : ''}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {filteredLocations.map(l => (
                      <button key={l.id} onClick={() => setActiveId(l.id)} style={{
                        fontSize: kidsMode ? '.85rem' : '.78rem', fontWeight: 600,
                        padding: kidsMode ? '11px 12px' : '9px 11px',
                        borderRadius: 10, border: `1.5px solid ${discovered.has(l.id) ? '#6EE7B7' : 'var(--border)'}`,
                        background: discovered.has(l.id) ? '#ECFDF510' : 'var(--bg2)',
                        color: 'var(--ink2)', cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'all .15s', fontFamily: 'Poppins,sans-serif',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = l.color; e.currentTarget.style.background = 'var(--surface)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = discovered.has(l.id) ? '#6EE7B7' : 'var(--border)'; e.currentTarget.style.background = discovered.has(l.id) ? '#ECFDF510' : 'var(--bg2)'; }}
                      >
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>{l.emoji}</span>
                        <span style={{ flex: 1 }}>{l.name}</span>
                        {discovered.has(l.id) && <span style={{ fontSize: '.7rem', color: '#10B981', fontWeight: 800 }}>✓</span>}
                        <span style={{ color: 'var(--ink3)', fontSize: '.68rem', marginLeft: 'auto' }}>{l.region}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mapPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.8} }
      `}</style>
    </div>
  );
}
