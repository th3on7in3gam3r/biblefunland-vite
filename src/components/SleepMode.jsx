import { useState, useEffect, useRef } from 'react'

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

export default function SleepMode({ onClose }) {
  const [active, setActive] = useState(false)
  const [verse, setVerse] = useState(0)
  const [sound, setSound] = useState(null)
  const [volume, setVolume] = useState(0.4)
  const [fontSize, setFontSize] = useState(24)
  const audioCtxRef = useRef(null)
  const nodesRef = useRef([])

  // Rotate verse every 30s
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setVerse(v => (v + 1) % VERSES.length), 30000)
    return () => clearInterval(t)
  }, [active])

  // Ambient sound via Web Audio API
  function playSound(type) {
    stopSound()
    const ctx = new AudioContext()
    audioCtxRef.current = ctx

    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    if (type === 'brown') {
      // Brown noise (rain)
      let last = 0
      for (let i = 0; i < bufferSize; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; data[i] = last * 3.5 }
    } else if (type === 'pink') {
      // Pink noise (fire)
      let b = [0,0,0,0,0,0,0]
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1
        b[0]=0.99886*b[0]+w*0.0555179;b[1]=0.99332*b[1]+w*0.0750759;b[2]=0.96900*b[2]+w*0.1538520;b[3]=0.86650*b[3]+w*0.3104856;b[4]=0.55000*b[4]+w*0.5329522;b[5]=-0.7616*b[5]-w*0.0168980
        data[i] = (b[0]+b[1]+b[2]+b[3]+b[4]+b[5]+b[6]+w*0.5362)*0.11;b[6]=w*0.115926
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

  if (!active) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins,sans-serif' }}>
        <div style={{ background: '#0D1117', borderRadius: 28, padding: '44px 40px', maxWidth: 480, width: '90%', textAlign: 'center', border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🌙</div>
          <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.8rem', fontWeight: 800, color: '#E2E8F0', marginBottom: 10 }}>Sleep & Focus Mode</h2>
          <p style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.45)', fontWeight: 500, lineHeight: 1.7, marginBottom: 28 }}>
            A calm, distraction-free mode for late-night devotionals and meditation. Gentle scripture rotation, ambient sounds, and warm amber tones.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => setActive(true)} style={{ padding: '13px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#1E3A5F,#2D1B69)', color: '#A5B4FC', border: '1px solid rgba(165,180,252,.3)', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.9rem', fontWeight: 700 }}>
              🌙 Enter Sleep Mode
            </button>
            <button onClick={onClose} style={{ padding: '13px 22px', borderRadius: 14, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.9rem' }}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  const v = VERSES[verse]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, #1A1204 0%, #0A0A0A 100%)', zIndex: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', cursor: 'none' }}>
      {/* Exit */}
      <button onClick={() => { stopSound(); setActive(false); onClose?.() }} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,.06)', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: '.8rem', padding: '7px 14px', borderRadius: 8, fontFamily: 'Poppins,sans-serif' }}>Exit ✕</button>

      {/* Cross glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', fontSize: '5rem', opacity: .06, userSelect: 'none' }}>✝</div>

      {/* Verse */}
      <div style={{ maxWidth: 600, textAlign: 'center', padding: '0 32px', marginBottom: 48 }}>
        <p style={{ fontSize: fontSize, color: '#C9A96E', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16, transition: 'all 1s ease', textShadow: '0 0 30px rgba(201,169,110,.3)' }}>
          {v.text}
        </p>
        <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: '.78rem', color: 'rgba(201,169,110,.5)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>
          {v.ref}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {SOUNDS.map(s => (
            <button key={s.id} onClick={() => toggleSound(s)} style={{ padding: '8px 16px', borderRadius: 100, border: `1px solid ${sound === s.id ? 'rgba(201,169,110,.6)' : 'rgba(255,255,255,.1)'}`, background: sound === s.id ? 'rgba(201,169,110,.12)' : 'rgba(255,255,255,.04)', color: sound === s.id ? '#C9A96E' : 'rgba(255,255,255,.35)', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.72rem', fontWeight: 600 }}>
              {s.label}
            </button>
          ))}
        </div>
        {sound && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', fontFamily: 'Poppins,sans-serif' }}>🔈</span>
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => setVolume(parseFloat(e.target.value))} style={{ width: 120, accentColor: '#C9A96E' }}/>
            <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', fontFamily: 'Poppins,sans-serif' }}>🔊</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {[16,20,24,30].map(s => (
            <button key={s} onClick={() => setFontSize(s)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${fontSize === s ? 'rgba(201,169,110,.6)' : 'rgba(255,255,255,.1)'}`, background: 'transparent', color: fontSize === s ? '#C9A96E' : 'rgba(255,255,255,.3)', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.72rem' }}>
              A{['',' ','  ','   '][([16,20,24,30]).indexOf(s)]}
            </button>
          ))}
        </div>
      </div>
      <style>{`*{cursor:none}`}</style>
    </div>
  )
}
