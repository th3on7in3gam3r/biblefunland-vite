import { useState, useRef, useEffect } from 'react'

const STATIONS = [
  { name: 'Air1 Radio', genre: 'Contemporary Christian', url: 'https://maestro.emfcdn.com/stream_for/air1/web/aac', emoji: '📻', color: '#3B82F6' },
  { name: 'K-LOVE', genre: 'Christian Hits', url: 'https://maestro.emfcdn.com/stream_for/k-love/web/aac', emoji: '🎵', color: '#8B5CF6' },
  { name: 'Moody Radio', genre: 'Bible Teaching', url: 'https://primary.moodyradio.org/moody-chicago-mp3', emoji: '📖', color: '#10B981' },
  { name: 'Way FM', genre: 'Worship & Praise', url: 'https://ais-sa8.cdnstream1.com/3144_64.aac', emoji: '🙏', color: '#F97316' },
]

export default function BibleRadio() {
  const [station, setStation] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef(new Audio())

  useEffect(() => {
    const audio = audioRef.current
    audio.volume = volume
    return () => { audio.pause(); audio.src = '' }
  }, [])

  useEffect(() => { audioRef.current.volume = volume }, [volume])

  function selectStation(s) {
    const audio = audioRef.current
    audio.pause()
    audio.src = s.url
    setStation(s)
    setLoading(true)
    audio.play()
      .then(() => { setPlaying(true); setLoading(false) })
      .catch(() => setLoading(false))
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!station) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { setLoading(true); audio.play().then(() => { setPlaying(true); setLoading(false) }).catch(() => setLoading(false)) }
  }

  const cur = station || STATIONS[0]

  return (
    <div style={{ position: 'fixed', bottom: expanded ? 20 : 20, right: 20, zIndex: 340, fontFamily: 'Poppins,sans-serif' }}>
      {!expanded ? (
        <button onClick={() => setExpanded(true)} title="Open Bible Radio" style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', cursor: 'pointer', fontSize: '1.4rem', boxShadow: '0 6px 24px rgba(16,185,129,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          📻
          {playing && <span style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#EF4444', border: '2px solid white', animation: 'pulse 1.5s ease-in-out infinite' }}/>}
        </button>
      ) : (
        <div style={{ width: 280, background: 'var(--surface)', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,.2)', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#065F46,#047857)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: '1.2rem' }}>📻</span>
              <div>
                <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'white' }}>Bible Radio</div>
                <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>{playing ? '🔴 Live' : 'Select a station'}</div>
              </div>
            </div>
            <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: '.9rem' }}>▼</button>
          </div>
          <div style={{ padding: '12px 14px' }}>
            {station && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{station.emoji} {station.name}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 500, marginBottom: 10 }}>{station.genre}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={togglePlay} style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${station.color},${station.color}cc)`, color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${station.color}40` }}>
                    {loading ? '⏳' : playing ? '⏸' : '▶'}
                  </button>
                  <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => setVolume(parseFloat(e.target.value))} style={{ flex: 1, accentColor: station.color }} />
                  <span style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>🔊</span>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {STATIONS.map((s, i) => (
                <button key={i} onClick={() => selectStation(s)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 11, border: `1.5px solid ${station?.name === s.name ? s.color : 'var(--border)'}`, background: station?.name === s.name ? s.color + '11' : 'var(--bg2)', cursor: 'pointer', transition: 'all .2s', textAlign: 'left' }}>
                  <span style={{ fontSize: '1.1rem' }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, color: station?.name === s.name ? s.color : 'var(--ink)' }}>{s.name}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--ink3)', fontWeight: 500 }}>{s.genre}</div>
                  </div>
                  {station?.name === s.name && playing && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }}/>}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '.65rem', color: 'var(--ink3)', fontWeight: 500, marginTop: 10, lineHeight: 1.5, textAlign: 'center' }}>
              ⚠️ Stream availability depends on your location and the station's server.
            </p>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}`}</style>
    </div>
  )
}
