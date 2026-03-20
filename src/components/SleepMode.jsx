import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useBedtimeMode } from '../context/BedtimeModeContext'

const VERSES = [
  { text: '"He grants sleep to those he loves."', ref: 'Psalm 127:2' },
  { text: '"In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety."', ref: 'Psalm 4:8' },
  { text: '"When you lie down, you will not be afraid; when you lie down, your sleep will be sweet."', ref: 'Proverbs 3:24' },
  { text: '"I lie down and sleep; I wake again, because the Lord sustains me."', ref: 'Psalm 3:5' },
  { text: '"Cast all your anxiety on him because he cares for you."', ref: '1 Peter 5:7' },
  { text: '"Come to me, all you who are weary and burdened, and I will give you rest."', ref: 'Matthew 11:28' },
]

const SOUNDS = [
  { id: 'rain', label: '🌧️ Rain', freq: 'brown' },
  { id: 'fire', label: '🔥 Fireplace', freq: 'pink' },
  { id: 'ocean', label: '🌊 Ocean Waves', freq: 'white' },
  { id: 'night', label: '🌙 Night Crickets', freq: 'white' },
]

const MODES = {
  SCRIPTURE: 'scripture',
  STORY: 'story',
  ACTIVITIES: 'activities',
}

const S = {
  backdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
  card: {
    background: '#0D1117',
    borderRadius: 24,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 480,
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
    position: 'relative',
    margin: 'auto',
  },
  closeBtn: {
    position: 'absolute',
    top: 14, right: 14,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    padding: '5px 10px',
    borderRadius: 8,
    fontFamily: 'Poppins,sans-serif',
    lineHeight: 1,
  },
  moon: { fontSize: '3.2rem', marginBottom: 16 },
  title: {
    fontFamily: "'Baloo 2',cursive",
    fontSize: '1.85rem',
    fontWeight: 800,
    color: '#E2E8F0',
    margin: '0 0 12px',
    lineHeight: 1.2,
  },
  desc: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.7,
    margin: '0 0 32px',
  },
  btnRow: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  enterBtn: {
    padding: '12px 26px',
    borderRadius: 14,
    background: 'linear-gradient(135deg,#1E3A5F,#2D1B69)',
    color: '#A5B4FC',
    border: '1px solid rgba(165,180,252,0.3)',
    cursor: 'pointer',
    fontFamily: 'Poppins,sans-serif',
    fontSize: '0.88rem',
    fontWeight: 700,
  },
  cancelBtn: {
    padding: '12px 20px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.45)',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    fontFamily: 'Poppins,sans-serif',
    fontSize: '0.88rem',
  },
}

export default function SleepMode({ onClose, onEnter }) {
  const { getBedtimeStory, getCalmingActivities, bedtimeSettings } = useBedtimeMode()
  const [active, setActive] = useState(false)
  const [mode, setMode] = useState(MODES.SCRIPTURE)
  const [verse, setVerse] = useState(0)
  const [sound, setSound] = useState(null)
  const [volume, setVolume] = useState(0.4)
  const [fontSize, setFontSize] = useState(22)
  const audioCtxRef = useRef(null)
  const nodesRef = useRef([])
  
  const story = getBedtimeStory()
  const activities = getCalmingActivities()

  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setVerse(v => (v + 1) % VERSES.length), 30000)
    return () => clearInterval(t)
  }, [active])

  function playSound(type) {
    stopSound()
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    if (type === 'brown') {
      let last = 0
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1
        last = (last + 0.02 * w) / 1.02
        data[i] = last * 3.5
      }
    } else if (type === 'pink') {
      let b = [0,0,0,0,0,0,0]
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1
        b[0]=0.99886*b[0]+w*0.0555179; b[1]=0.99332*b[1]+w*0.0750759
        b[2]=0.96900*b[2]+w*0.1538520; b[3]=0.86650*b[3]+w*0.3104856
        b[4]=0.55000*b[4]+w*0.5329522; b[5]=-0.7616*b[5]-w*0.0168980
        data[i] = (b[0]+b[1]+b[2]+b[3]+b[4]+b[5]+b[6]+w*0.5362)*0.11
        b[6] = w * 0.115926
      }
    } else {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = ctx.createGain()
    gain.gain.value = volume
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    nodesRef.current = [source, gain]
  }

  function stopSound() {
    try { nodesRef.current.forEach(n => n.stop?.()) } catch {}
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    nodesRef.current = []
  }

  function toggleSound(s) {
    if (sound === s.id) { stopSound(); setSound(null) }
    else { playSound(s.freq); setSound(s.id) }
  }

  useEffect(() => {
    if (nodesRef.current[1]) nodesRef.current[1].gain.value = volume
  }, [volume])

  useEffect(() => () => stopSound(), [])

  // ── Intro modal ──────────────────────────────────────────────────────────────
  if (!active) {
    return createPortal(
      <div style={S.backdrop}>
        <div style={S.card}>
          <button style={S.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          <div style={S.moon}>🌙</div>
          <h2 style={S.title}>Sleep &amp; Focus Mode</h2>
          <p style={S.desc}>
            A calm, distraction-free space for late-night devotionals and meditation.
            Gentle scripture rotation, ambient sounds, and warm amber tones.
          </p>
          <div style={S.btnRow}>
            <button
              style={S.enterBtn}
              onClick={() => {
                setActive(true)
                if (onEnter) onEnter()
              }}
            >
              🌙 Enter Sleep Mode
            </button>
            <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // ── Active sleep screen ──────────────────────────────────────────────────────
  const v = VERSES[verse]
  
  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(ellipse at center, #1A1204 0%, #0A0A0A 100%)',
      zIndex: 99999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia,serif',
      padding: '20px',
      overflowY: 'auto',
    }}>
      {/* Exit button */}
      <button
        onClick={() => { stopSound(); setActive(false); onClose?.() }}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,0.06)', border: 'none',
          color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
          fontSize: '0.8rem', padding: '7px 14px', borderRadius: 8,
          fontFamily: 'Poppins,sans-serif',
        }}
      >
        Exit ✕
      </button>

      {/* Mode tabs */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8, background: 'rgba(0,0,0,0.3)',
        padding: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button
          onClick={() => setMode(MODES.SCRIPTURE)}
          style={{
            padding: '6px 14px', borderRadius: 8, border: 'none',
            background: mode === MODES.SCRIPTURE ? 'rgba(201,169,110,0.2)' : 'transparent',
            color: mode === MODES.SCRIPTURE ? '#C9A96E' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
            fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          📖 Scripture
        </button>
        {bedtimeSettings.showBedtimeStory && (
          <button
            onClick={() => setMode(MODES.STORY)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: mode === MODES.STORY ? 'rgba(201,169,110,0.2)' : 'transparent',
              color: mode === MODES.STORY ? '#C9A96E' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
              fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            🌙 Story
          </button>
        )}
        <button
          onClick={() => setMode(MODES.ACTIVITIES)}
          style={{
            padding: '6px 14px', borderRadius: 8, border: 'none',
            background: mode === MODES.ACTIVITIES ? 'rgba(201,169,110,0.2)' : 'transparent',
            color: mode === MODES.ACTIVITIES ? '#C9A96E' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
            fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          🙏 Activities
        </button>
      </div>

      {/* Faint cross */}
      <div style={{
        position: 'absolute', top: '18%', left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '5rem', opacity: 0.05, userSelect: 'none', pointerEvents: 'none',
      }}>✝</div>

      {/* Content area */}
      <div style={{ maxWidth: 680, width: '100%', textAlign: 'center', marginTop: 60, marginBottom: 44 }}>
        {mode === MODES.SCRIPTURE && (
          <div>
            <p style={{
              fontSize: fontSize, color: '#C9A96E', lineHeight: 1.75,
              fontStyle: 'italic', marginBottom: 14,
              transition: 'opacity 1s ease',
              textShadow: '0 0 30px rgba(201,169,110,0.3)',
            }}>
              {v.text}
            </p>
            <div style={{
              fontFamily: 'Poppins,sans-serif', fontSize: '0.75rem',
              color: 'rgba(201,169,110,0.5)', fontWeight: 600,
              letterSpacing: 2, textTransform: 'uppercase',
            }}>
              {v.ref}
            </div>
          </div>
        )}

        {mode === MODES.STORY && (
          <div style={{ textAlign: 'left', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h3 style={{
                fontFamily: "'Baloo 2',cursive", fontSize: '1.6rem',
                color: '#C9A96E', marginBottom: 8, fontWeight: 700,
              }}>
                {story.title}
              </h3>
              <div style={{
                fontFamily: 'Poppins,sans-serif', fontSize: '0.75rem',
                color: 'rgba(201,169,110,0.5)', fontWeight: 600,
                letterSpacing: 2, textTransform: 'uppercase',
              }}>
                {story.verse}
              </div>
            </div>
            <p style={{
              fontSize: '1.05rem', color: 'rgba(201,169,110,0.85)',
              lineHeight: 1.8, marginBottom: 20,
            }}>
              {story.content}
            </p>
            <div style={{
              background: 'rgba(201,169,110,0.08)', padding: 20,
              borderRadius: 12, border: '1px solid rgba(201,169,110,0.15)',
            }}>
              <div style={{
                fontFamily: 'Poppins,sans-serif', fontSize: '0.8rem',
                color: 'rgba(201,169,110,0.6)', fontWeight: 600,
                marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1,
              }}>
                💡 Lesson
              </div>
              <p style={{ fontSize: '0.95rem', color: 'rgba(201,169,110,0.8)', marginBottom: 16 }}>
                {story.moral}
              </p>
              <div style={{
                fontFamily: 'Poppins,sans-serif', fontSize: '0.8rem',
                color: 'rgba(201,169,110,0.6)', fontWeight: 600,
                marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1,
              }}>
                🙏 Prayer
              </div>
              <p style={{ fontSize: '0.95rem', color: 'rgba(201,169,110,0.8)', fontStyle: 'italic' }}>
                {story.prayer}
              </p>
            </div>
          </div>
        )}

        {mode === MODES.ACTIVITIES && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 20px' }}>
            <h3 style={{
              fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem',
              color: '#C9A96E', marginBottom: 12, fontWeight: 700,
            }}>
              Calming Activities
            </h3>
            {activities.map(activity => (
              <div
                key={activity.id}
                style={{
                  background: 'rgba(201,169,110,0.08)',
                  border: '1px solid rgba(201,169,110,0.15)',
                  borderRadius: 12, padding: 16,
                  display: 'flex', alignItems: 'center', gap: 14,
                  textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,169,110,0.08)'}
              >
                <div style={{ fontSize: '2rem' }}>{activity.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'Poppins,sans-serif', fontSize: '1rem',
                    color: '#C9A96E', fontWeight: 600, marginBottom: 4,
                  }}>
                    {activity.title}
                  </div>
                  <div style={{
                    fontFamily: 'Poppins,sans-serif', fontSize: '0.75rem',
                    color: 'rgba(201,169,110,0.5)',
                  }}>
                    {activity.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {/* Sound buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {SOUNDS.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSound(s)}
              style={{
                padding: '8px 16px', borderRadius: 100,
                border: `1px solid ${sound === s.id ? 'rgba(201,169,110,0.6)' : 'rgba(255,255,255,0.1)'}`,
                background: sound === s.id ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.04)',
                color: sound === s.id ? '#C9A96E' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
                fontSize: '0.72rem', fontWeight: 600,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Volume slider */}
        {sound && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins,sans-serif' }}>🔈</span>
            <input
              type="range" min={0} max={1} step={0.05} value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ width: 120, accentColor: '#C9A96E' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins,sans-serif' }}>🔊</span>
          </div>
        )}

        {/* Font size */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[16, 20, 24, 30].map((s, i) => (
            <button
              key={s}
              onClick={() => setFontSize(s)}
              style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid ${fontSize === s ? 'rgba(201,169,110,0.6)' : 'rgba(255,255,255,0.1)'}`,
                background: 'transparent',
                color: fontSize === s ? '#C9A96E' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
                fontSize: `${0.65 + i * 0.08}rem`,
              }}
            >
              A
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
