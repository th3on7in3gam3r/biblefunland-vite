import { useState, useEffect, useRef } from 'react'

// ── Word data by difficulty ────────────────────────────────────────────────────
const LEVELS = {
  easy: [
    { word:'ARK',   hint:'Noah built this big boat',         emoji:'🚢', fact:'Noah\'s ark was bigger than a football field!' },
    { word:'GOD',   hint:'He made everything',               emoji:'✨', fact:'God has always existed — He never had a beginning!' },
    { word:'JOY',   hint:'A happy feeling from God',         emoji:'😊', fact:'The Bible says "the joy of the Lord is your strength!"' },
    { word:'SIN',   hint:'Doing something wrong',            emoji:'💔', fact:'Jesus came to forgive all our sins!' },
    { word:'DAY',   hint:'God made light on Day 1',          emoji:'☀️', fact:'On the very first day, God created light!' },
    { word:'SEA',   hint:'God parted the Red one for Moses', emoji:'🌊', fact:'Moses held out his staff and the sea split in two!' },
    { word:'SKY',   hint:'God made this on Day 2',           emoji:'🌤️', fact:'The sky is held up by God\'s mighty power!' },
  ],
  medium: [
    { word:'DOVE',  hint:'This bird brought good news to Noah', emoji:'🕊️', fact:'The dove came back with an olive branch — the flood was over!' },
    { word:'LAMB',  hint:'Jesus is called this',              emoji:'🐑', fact:'"Behold the Lamb of God who takes away the sin of the world!"' },
    { word:'PRAY',  hint:'Talking to God',                    emoji:'🙏', fact:'God says to pray without ceasing — anytime, anywhere!' },
    { word:'FISH',  hint:'Jesus fed 5,000 people with two',   emoji:'🐟', fact:'Two small fish + 5 loaves of bread fed 5,000 people!' },
    { word:'STAR',  hint:'The wise men followed one',         emoji:'⭐', fact:'A special star in the sky led wise men to baby Jesus!' },
    { word:'HARP',  hint:'David played this instrument',      emoji:'🎵', fact:'David played his harp to calm King Saul!' },
    { word:'LION',  hint:'Daniel was put in a den of these', emoji:'🦁', fact:'God shut the lions\' mouths and Daniel was safe!' },
  ],
  hard: [
    { word:'ANGEL',  hint:'God\'s messengers from heaven',    emoji:'👼', fact:'Angels are powerful beings who carry God\'s messages!' },
    { word:'FAITH',  hint:'Trusting God even when you can\'t see', emoji:'🌟', fact:'"Faith is being sure of what we hope for." — Hebrews 11:1' },
    { word:'GRACE',  hint:'God\'s free gift we don\'t deserve', emoji:'🎁', fact:'"By grace you have been saved through faith!" — Ephesians 2:8' },
    { word:'PEACE',  hint:'The feeling God gives your heart', emoji:'🕊️', fact:'God\'s peace is so big it\'s beyond what our minds can understand!' },
    { word:'CROSS',  hint:'Jesus died on this for us',        emoji:'✝️', fact:'Jesus rose from the dead 3 days after the cross!' },
    { word:'BREAD',  hint:'Jesus called himself the bread of life', emoji:'🍞', fact:'Jesus fed 5,000 people with just 5 loaves of bread!' },
    { word:'PSALM',  hint:'A special song or poem in the Bible', emoji:'🎶', fact:'There are 150 Psalms — David wrote most of them!' },
  ]
}

const LEVEL_NAMES = { easy:'⭐ Easy (3 letters)', medium:'⭐⭐ Medium (4 letters)', hard:'⭐⭐⭐ Hard (5 letters)' }
const LEVEL_COLORS = { easy:'#10B981', medium:'#F59E0B', hard:'#EC4899' }

function shuffle(arr) { return [...arr].sort(() => Math.random() - .5) }

export default function BibleWordBuilder() {
  const [level,     setLevel]     = useState('easy')
  const [wordIdx,   setWordIdx]   = useState(0)
  const [tiles,     setTiles]     = useState([])
  const [slots,     setSlots]     = useState([])
  const [done,      setDone]      = useState(false)
  const [score,     setScore]     = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [dragTile,  setDragTile]  = useState(null)
  const [stars,     setStars]     = useState([])

  const words = LEVELS[level]
  const entry = words[wordIdx % words.length]
  const color = LEVEL_COLORS[level]

  // Initialize puzzle when word changes
  useEffect(() => {
    const letters = entry.word.split('')
    setSlots(letters.map(l => ({ letter: l, filled: null })))
    setTiles(shuffle(letters.map((l, i) => ({ id: `t${i}`, letter: l, used: false }))))
    setDone(false)
    setCelebrating(false)
  }, [wordIdx, level])

  function placeTile(tileId, slotIdx) {
    const tile = tiles.find(t => t.id === tileId)
    if (!tile || tile.used) return
    const slot = slots[slotIdx]
    if (slot.filled) return // slot already filled

    const newSlots = slots.map((s, i) => i === slotIdx ? { ...s, filled: tileId } : s)
    const newTiles = tiles.map(t => t.id === tileId ? { ...t, used: true } : t)
    setSlots(newSlots)
    setTiles(newTiles)

    // Check completion
    const allFilled = newSlots.every(s => s.filled)
    if (allFilled) {
      const correct = newSlots.every((s, i) => {
        const t = newTiles.find(t => t.id === s.filled)
        return t?.letter === entry.word[i]
      })
      if (correct) {
        setDone(true)
        setCelebrating(true)
        setScore(s => s + 1)
        setStars(Array.from({ length: 12 }, (_, i) => ({
          x: 20 + Math.random() * 60, y: Math.random() * 80,
          color: ['#FCD34D','#F472B6','#60A5FA','#34D399','#FB923C'][i % 5],
          size: 8 + Math.random() * 14,
          delay: Math.random() * .5
        })))
      }
    }
  }

  function removeTile(slotIdx) {
    const slot = slots[slotIdx]
    if (!slot.filled) return
    const newSlots = slots.map((s, i) => i === slotIdx ? { ...s, filled: null } : s)
    const newTiles = tiles.map(t => t.id === slot.filled ? { ...t, used: false } : t)
    setSlots(newSlots)
    setTiles(newTiles)
  }

  function nextWord() {
    setWordIdx(i => (i + 1) % words.length)
    setCelebrating(false)
  }

  function reset() {
    const letters = entry.word.split('')
    setSlots(letters.map(l => ({ letter: l, filled: null })))
    setTiles(shuffle(letters.map((l, i) => ({ id: `t${i}${Date.now()}`, letter: l, used: false }))))
    setDone(false)
    setCelebrating(false)
  }

  const getSlotLetter = (slot) => slot.filled ? tiles.find(t => t.id === slot.filled)?.letter : null

  return (
    <div style={{ background: 'linear-gradient(180deg,#EEF2FF 0%,#FDF4FF 100%)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1E1B4B,#2D1B69)', padding: '28px 24px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>📖</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: 'white', marginBottom: 4 }}>Bible Word Builder</h1>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.82rem', fontWeight: 600 }}>Spell Bible words with letter tiles!</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
          <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 100, padding: '4px 14px', fontSize: '.78rem', fontWeight: 800, color: '#FCD34D' }}>🏆 Score: {score}</div>
          <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 100, padding: '4px 14px', fontSize: '.78rem', fontWeight: 800, color: '#A5B4FC' }}>Word {wordIdx % words.length + 1}/{words.length}</div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
        {/* Level selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
          {Object.entries(LEVEL_NAMES).map(([lv, label]) => (
            <button key={lv} onClick={() => { setLevel(lv); setWordIdx(0) }}
              style={{ fontSize: '.72rem', fontWeight: 800, padding: '7px 14px', borderRadius: 100, cursor: 'pointer', border: `2px solid ${level === lv ? LEVEL_COLORS[lv] : 'transparent'}`, background: level === lv ? LEVEL_COLORS[lv] + '18' : 'white', color: level === lv ? LEVEL_COLORS[lv] : '#6B7280', transition: 'all .2s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Main puzzle card */}
        <div style={{ background: 'white', borderRadius: 28, padding: '28px 24px', boxShadow: '0 8px 40px rgba(99,102,241,.15)', border: `2px solid ${color}22`, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          {/* Confetti stars */}
          {celebrating && stars.map((s, i) => (
            <div key={i} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, color: s.color, animation: `starPop .6s ${s.delay}s ease both`, pointerEvents: 'none', zIndex: 10 }}>⭐</div>
          ))}

          {/* Word emoji + hint */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: '4rem', marginBottom: 8, animation: done ? 'bounce 0.5s ease infinite' : 'none' }}>{entry.emoji}</div>
            <div style={{ fontSize: '.92rem', fontWeight: 700, color: '#4B5563', background: '#F3F4F6', borderRadius: 100, padding: '6px 18px', display: 'inline-block' }}>
              💡 {entry.hint}
            </div>
          </div>

          {/* Slots */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
            {slots.map((slot, i) => {
              const letter = getSlotLetter(slot)
              const isCorrect = done && letter === slot.letter
              return (
                <div key={i} onClick={() => !done && removeTile(i)}
                  style={{ width: 60, height: 70, borderRadius: 16, border: `3px solid ${letter ? (done && isCorrect ? '#10B981' : color) : '#D1D5DB'}`, background: letter ? (done && isCorrect ? '#ECFDF5' : color + '14') : '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: done && isCorrect ? '#059669' : color, cursor: letter && !done ? 'pointer' : 'default', transition: 'all .2s', boxShadow: letter ? `0 4px 12px ${color}28` : 'none', animation: isCorrect ? 'popIn .4s ease' : 'none' }}>
                  {letter || ''}
                  {!letter && <div style={{ width: 30, height: 3, background: '#D1D5DB', borderRadius: 100 }} />}
                </div>
              )
            })}
          </div>

          {/* Tile bank */}
          {!done && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {tiles.map(tile => (
                <div key={tile.id}
                  style={{ width: 56, height: 64, borderRadius: 14, border: `3px solid ${tile.used ? '#E5E7EB' : color}`, background: tile.used ? '#F9FAFB' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: tile.used ? '#D1D5DB' : '#1F2937', cursor: tile.used ? 'default' : 'pointer', transition: 'all .18s', boxShadow: tile.used ? 'none' : `0 4px 12px ${color}22`, transform: tile.used ? 'scale(.95)' : 'scale(1)' }}
                  onClick={() => {
                    if (tile.used || done) return
                    const emptySlot = slots.findIndex(s => !s.filled)
                    if (emptySlot !== -1) placeTile(tile.id, emptySlot)
                  }}
                  onMouseEnter={e => { if (!tile.used) e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)' }}
                  onMouseLeave={e => { if (!tile.used) e.currentTarget.style.transform = 'scale(1)' }}>
                  {tile.letter}
                </div>
              ))}
            </div>
          )}

          {/* Success state */}
          {done && (
            <div style={{ textAlign: 'center', animation: 'popIn .4s ease' }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginBottom: 6 }}>🎉 You spelled {entry.word}!</div>
              <div style={{ fontSize: '.84rem', color: '#374151', fontWeight: 500, lineHeight: 1.65, background: '#F0FDF4', borderRadius: 14, padding: '12px 16px', marginBottom: 16 }}>
                🌟 {entry.fact}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={nextWord} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 14, padding: '12px 24px', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.88rem', cursor: 'pointer' }}>Next Word ✨</button>
                <button onClick={reset} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 14, padding: '12px 20px', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>↺ Try Again</button>
              </div>
            </div>
          )}

          {!done && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button onClick={reset} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.76rem', fontWeight: 600 }}>↺ Shuffle tiles</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes starPop { from{opacity:0;transform:scale(0) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes popIn { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  )
}
