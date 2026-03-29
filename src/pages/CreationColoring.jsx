import { useState, useRef, useEffect } from 'react'

const COLORS = [
  '#000000','#FFFFFF','#EF4444','#F97316','#FCD34D','#22C55E','#3B82F6','#8B5CF6',
  '#EC4899','#14B8A6','#A78BFA','#FDE68A','#86EFAC','#93C5FD','#F9A8D4','#6EE7B7',
  '#0EA5E9','#E11D48','#D97706','#16A34A','#7C3AED','#374151','#9CA3AF','#F3F4F6',
]

const DAYS = [
  {
    day: 1, title: 'Day 1: Light!', verse: '"Let there be light!" — Genesis 1:3',
    emoji: '☀️', bg: '#FFF9C4',
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect id="sky-left" x="0" y="0" width="200" height="300" fill="#1A1A2E" stroke="#333" stroke-width="1"/>
      <rect id="sky-right" x="200" y="0" width="200" height="300" fill="#FFF9C4" stroke="#333" stroke-width="1"/>
      <line x1="200" y1="0" x2="200" y2="300" stroke="#555" stroke-width="2"/>
      <circle id="sun" cx="300" cy="120" r="50" fill="#FCD34D" stroke="#E5A000" stroke-width="2"/>
      <line id="ray1" x1="300" y1="55" x2="300" y2="30" stroke="#E5A000" stroke-width="3" stroke-linecap="round"/>
      <line id="ray2" x1="347" y1="73" x2="365" y2="55" stroke="#E5A000" stroke-width="3" stroke-linecap="round"/>
      <line id="ray3" x1="365" y1="120" x2="390" y2="120" stroke="#E5A000" stroke-width="3" stroke-linecap="round"/>
      <line id="ray4" x1="347" y1="167" x2="365" y2="185" stroke="#E5A000" stroke-width="3" stroke-linecap="round"/>
      <line id="ray5" x1="253" y1="73" x2="235" y2="55" stroke="#E5A000" stroke-width="3" stroke-linecap="round"/>
      <text x="100" y="150" text-anchor="middle" font-size="22" fill="#A0AEC0" font-family="Georgia">Darkness</text>
      <text x="300" y="230" text-anchor="middle" font-size="18" fill="#D97706" font-family="Georgia">Light!</text>
    </svg>`
  },
  {
    day: 2, title: 'Day 2: Sky & Water!', verse: '"God called the expanse Sky." — Genesis 1:8',
    emoji: '☁️', bg: '#E0F2FE',
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect id="sky" x="0" y="0" width="400" height="180" fill="#BAE6FD" stroke="#7DD3FC" stroke-width="1"/>
      <rect id="water" x="0" y="180" width="400" height="120" fill="#0EA5E9" stroke="#0284C7" stroke-width="1"/>
      <ellipse id="cloud1" cx="100" cy="70" rx="70" ry="40" fill="white" stroke="#CBD5E1" stroke-width="2"/>
      <ellipse id="cloud1b" cx="140" cy="60" rx="50" ry="35" fill="white" stroke="#CBD5E1" stroke-width="2"/>
      <ellipse id="cloud2" cx="300" cy="90" rx="60" ry="35" fill="white" stroke="#CBD5E1" stroke-width="2"/>
      <ellipse id="cloud2b" cx="330" cy="80" rx="45" ry="30" fill="white" stroke="#CBD5E1" stroke-width="2"/>
      <ellipse id="wave1" cx="100" cy="195" rx="80" ry="18" fill="#38BDF8" stroke="#0EA5E9" stroke-width="1"/>
      <ellipse id="wave2" cx="280" cy="210" rx="90" ry="18" fill="#38BDF8" stroke="#0EA5E9" stroke-width="1"/>
      <text x="200" y="140" text-anchor="middle" font-size="16" fill="#1E40AF" font-family="Georgia">Heaven / Sky</text>
      <text x="200" y="250" text-anchor="middle" font-size="16" fill="white" font-family="Georgia">Waters Below</text>
    </svg>`
  },
  {
    day: 3, title: 'Day 3: Land & Plants!', verse: '"Let dry ground appear!" — Genesis 1:9',
    emoji: '🌱', bg: '#F0FDF4',
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect id="bg-sky" x="0" y="0" width="400" height="180" fill="#BAE6FD" stroke="none"/>
      <rect id="bg-ground" x="0" y="180" width="400" height="120" fill="#92400E" stroke="none"/>
      <ellipse id="hill1" cx="200" cy="180" rx="200" ry="60" fill="#86EFAC" stroke="#4ADE80" stroke-width="2"/>
      <rect id="tree-trunk1" x="90" y="120" width="20" height="60" fill="#92400E" stroke="#78350F" stroke-width="1"/>
      <ellipse id="tree-top1" cx="100" cy="110" rx="40" ry="50" fill="#22C55E" stroke="#16A34A" stroke-width="2"/>
      <rect id="tree-trunk2" x="270" y="130" width="18" height="50" fill="#92400E" stroke="#78350F" stroke-width="1"/>
      <ellipse id="tree-top2" cx="279" cy="120" rx="35" ry="42" fill="#16A34A" stroke="#15803D" stroke-width="2"/>
      <circle id="flower1" cx="160" cy="170" r="12" fill="#F472B6" stroke="#DB2777" stroke-width="2"/>
      <circle id="flower2" cx="240" cy="165" r="10" fill="#FCD34D" stroke="#D97706" stroke-width="2"/>
      <ellipse id="sun-d3" cx="330" cy="55" rx="35" ry="35" fill="#FCD34D" stroke="#E5A000" stroke-width="2"/>
      <text x="200" y="270" text-anchor="middle" font-size="14" fill="white" font-family="Georgia">God made land, trees &amp; flowers!</text>
    </svg>`
  },
  {
    day: 4, title: 'Day 4: Sun, Moon & Stars!', verse: '"He made the stars also." — Genesis 1:16',
    emoji: '⭐', bg: '#1E1B4B',
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect id="night-sky" x="0" y="0" width="400" height="300" fill="#1E1B4B" stroke="none"/>
      <circle id="moon" cx="100" cy="80" r="45" fill="#FDE68A" stroke="#F59E0B" stroke-width="2"/>
      <circle id="moon-shadow" cx="118" cy="72" r="38" fill="#312E81" stroke="none"/>
      <circle id="sun-d4" cx="310" cy="100" r="55" fill="#FCD34D" stroke="#E5A000" stroke-width="3"/>
      <line id="sr1" x1="310" y1="28" x2="310" y2="8" stroke="#E5A000" stroke-width="3" stroke-linecap="round"/>
      <line id="sr2" x1="358" y1="52" x2="374" y2="36" stroke="#E5A000" stroke-width="3" stroke-linecap="round"/>
      <line id="sr3" x1="373" y1="100" x2="393" y2="100" stroke="#E5A000" stroke-width="3" stroke-linecap="round"/>
      <polygon id="star1" points="200,20 204,32 216,32 207,40 210,52 200,45 190,52 193,40 184,32 196,32" fill="#FCD34D" stroke="#E5A000" stroke-width="1"/>
      <polygon id="star2" points="50,160 53,170 63,170 55,176 58,186 50,180 42,186 45,176 37,170 47,170" fill="#FCD34D" stroke="#E5A000" stroke-width="1"/>
      <polygon id="star3" points="180,230 183,240 193,240 185,246 188,256 180,250 172,256 175,246 167,240 177,240" fill="#A5B4FC" stroke="#818CF8" stroke-width="1"/>
      <circle id="s1" cx="30" cy="40" r="3" fill="white"/><circle id="s2" cx="150" cy="180" r="2" fill="white"/>
      <circle id="s3" cx="250" cy="250" r="3" fill="white"/><circle id="s4" cx="360" cy="230" r="2" fill="white"/>
      <circle id="s5" cx="80" cy="220" r="2" fill="white"/><circle id="s6" cx="340" cy="30" r="3" fill="white"/>
      <text x="200" y="280" text-anchor="middle" font-size="13" fill="#A5B4FC" font-family="Georgia">Sun, Moon &amp; Stars to mark seasons!</text>
    </svg>`
  },
  {
    day: 5, title: 'Day 5: Fish & Birds!', verse: '"Let the waters teem with creatures!" — Genesis 1:20',
    emoji: '🐟', bg: '#E0F2FE',
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect id="sky-d5" x="0" y="0" width="400" height="130" fill="#BAE6FD" stroke="none"/>
      <rect id="water-d5" x="0" y="130" width="400" height="170" fill="#0EA5E9" stroke="none"/>
      <ellipse id="bird1" cx="100" cy="50" rx="30" ry="12" fill="white" stroke="#CBD5E1" stroke-width="1.5"/>
      <path id="bwing1a" d="M85,46 Q70,30 55,46" fill="none" stroke="#CBD5E1" stroke-width="2"/>
      <path id="bwing1b" d="M115,46 Q130,30 145,46" fill="none" stroke="#CBD5E1" stroke-width="2"/>
      <ellipse id="bird2" cx="280" cy="70" rx="25" ry="10" fill="white" stroke="#CBD5E1" stroke-width="1.5"/>
      <path id="bwing2a" d="M267,67 Q254,52 241,67" fill="none" stroke="#CBD5E1" stroke-width="2"/>
      <path id="bwing2b" d="M293,67 Q306,52 319,67" fill="none" stroke="#CBD5E1" stroke-width="2"/>
      <ellipse id="fish1" cx="120" cy="180" rx="35" ry="18" fill="#34D399" stroke="#059669" stroke-width="2"/>
      <polygon id="tail1" points="155,180 175,165 175,195" fill="#059669" stroke="#047857" stroke-width="1"/>
      <circle id="eye1" cx="100" cy="176" r="5" fill="white" stroke="#374151" stroke-width="1.5"/>
      <ellipse id="fish2" cx="280" cy="230" rx="30" ry="15" fill="#F472B6" stroke="#DB2777" stroke-width="2"/>
      <polygon id="tail2" points="310,230 328,218 328,242" fill="#DB2777" stroke="#BE185D" stroke-width="1"/>
      <circle id="eye2" cx="263" cy="227" r="4" fill="white" stroke="#374151" stroke-width="1.5"/>
      <ellipse id="fish3" cx="200" cy="200" rx="28" ry="13" fill="#FCD34D" stroke="#D97706" stroke-width="2"/>
      <polygon id="tail3" points="228,200 244,190 244,210" fill="#D97706" stroke="#B45309" stroke-width="1"/>
      <text x="200" y="278" text-anchor="middle" font-size="13" fill="white" font-family="Georgia">God filled the sky and sea with life!</text>
    </svg>`
  },
  {
    day: 6, title: 'Day 6: Animals & People!', verse: '"God created mankind in his own image." — Gen 1:27',
    emoji: '🦁', bg: '#FFF7ED',
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect id="bg-d6" x="0" y="0" width="400" height="300" fill="#FEF3C7" stroke="none"/>
      <ellipse id="ground-d6" cx="200" cy="270" rx="210" ry="60" fill="#86EFAC" stroke="#4ADE80" stroke-width="1"/>
      <ellipse id="lion-body" cx="80" cy="220" rx="45" ry="30" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
      <circle id="lion-head" cx="115" cy="205" r="28" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
      <circle id="lion-mane" cx="115" cy="205" r="34" fill="#D97706" stroke="#B45309" stroke-width="1" opacity="0.7"/>
      <circle id="lion-face" cx="115" cy="205" r="22" fill="#FCD34D" stroke="#D97706" stroke-width="1"/>
      <ellipse id="elephant-body" cx="300" cy="225" rx="55" ry="38" fill="#9CA3AF" stroke="#6B7280" stroke-width="2"/>
      <circle id="elephant-head" cx="340" cy="200" r="32" fill="#9CA3AF" stroke="#6B7280" stroke-width="2"/>
      <ellipse id="elephant-ear" cx="365" cy="198" rx="15" ry="22" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="1"/>
      <path id="trunk" d="M330,220 Q318,240 322,255" fill="none" stroke="#6B7280" stroke-width="6" stroke-linecap="round"/>
      <rect id="person-body" x="185" y="180" width="30" height="50" rx="5" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
      <circle id="person-head" cx="200" cy="165" r="20" fill="#FDE68A" stroke="#D97706" stroke-width="2"/>
      <text x="200" y="290" text-anchor="middle" font-size="13" fill="#374151" font-family="Georgia">People made in God's image!</text>
    </svg>`
  },
  {
    day: 7, title: 'Day 7: God Rested!', verse: '"God rested from all his work." — Genesis 2:3',
    emoji: '🌈', bg: '#F5F3FF',
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect id="bg-d7" x="0" y="0" width="400" height="300" fill="#E0F2FE" stroke="none"/>
      <path id="rainbow1" d="M0,200 Q200,20 400,200" fill="none" stroke="#EF4444" stroke-width="18" opacity="0.8"/>
      <path id="rainbow2" d="M20,210 Q200,50 380,210" fill="none" stroke="#F97316" stroke-width="16" opacity="0.8"/>
      <path id="rainbow3" d="M40,220 Q200,80 360,220" fill="none" stroke="#FCD34D" stroke-width="14" opacity="0.8"/>
      <path id="rainbow4" d="M60,228 Q200,108 340,228" fill="none" stroke="#22C55E" stroke-width="12" opacity="0.8"/>
      <path id="rainbow5" d="M78,235 Q200,132 322,235" fill="none" stroke="#3B82F6" stroke-width="10" opacity="0.8"/>
      <path id="rainbow6" d="M95,240 Q200,154 305,240" fill="none" stroke="#8B5CF6" stroke-width="8" opacity="0.8"/>
      <circle id="sun-d7" cx="200" cy="60" r="35" fill="#FCD34D" stroke="#E5A000" stroke-width="3"/>
      <ellipse id="cloud-d7a" cx="200" cy="40" rx="55" ry="28" fill="white" stroke="#CBD5E1" stroke-width="1.5" opacity="0.9"/>
      <ellipse id="cloud-d7b" cx="240" cy="35" rx="40" ry="24" fill="white" stroke="#CBD5E1" stroke-width="1.5" opacity="0.9"/>
      <text x="200" y="275" text-anchor="middle" font-size="15" fill="#374151" font-family="Georgia" font-weight="bold">God blessed Day 7 — the Sabbath!</text>
    </svg>`
  }
]

export default function CreationColoring() {
  const [dayIdx,    setDayIdx]    = useState(0)
  const [activeColor, setActiveColor] = useState('#FCD34D')
  const [fills,     setFills]     = useState({})
  const [completed, setCompleted] = useState(new Set())
  const svgRef = useRef(null)

  const day = DAYS[dayIdx]

  useEffect(() => { setFills({}) }, [dayIdx])

  function handleSvgClick(e) {
    const target = e.target
    if (target.tagName === 'svg' || target.tagName === 'text') return
    const id = target.id || target.closest('[id]')?.id
    if (!id) return
    const newFills = { ...fills, [id]: activeColor }
    setFills(newFills)
    // Count filled non-text elements
    const allIds = [...svgRef.current.querySelectorAll('[id]:not(text)')].map(el => el.id)
    const filledCount = allIds.filter(i => newFills[i]).length
    if (filledCount >= Math.floor(allIds.length * 0.6)) {
      setCompleted(s => new Set([...s, dayIdx]))
    }
  }

  // Apply fills to SVG after render
  useEffect(() => {
    if (!svgRef.current) return
    Object.entries(fills).forEach(([id, color]) => {
      const el = svgRef.current.querySelector(`#${id}`)
      if (el) el.setAttribute('fill', color)
    })
  }, [fills])

  function download() {
    const svg  = svgRef.current.querySelector('svg')
    if (!svg) return
    const data = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([data], { type: 'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `creation-day-${day.day}.svg`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ background: '#FFF8F0', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#064E3B,#065F46)', padding: '24px 24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 4 }}>🎨</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 800, color: 'white', marginBottom: 4 }}>Creation Coloring Book</h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.8rem', fontWeight: 600 }}>Color the 7 Days of Creation — tap a color, tap the picture!</p>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 14px' }}>
        {/* Day selector */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {DAYS.map((d, i) => (
            <button key={i} onClick={() => setDayIdx(i)}
              style={{ flexShrink: 0, fontSize: '.72rem', fontWeight: 800, padding: '7px 12px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${dayIdx === i ? '#064E3B' : '#D1D5DB'}`, background: dayIdx === i ? '#064E3B' : 'white', color: dayIdx === i ? 'white' : '#374151', display: 'flex', alignItems: 'center', gap: 4, transition: 'all .2s', whiteSpace: 'nowrap' }}>
              {d.emoji} Day {d.day} {completed.has(i) ? '✅' : ''}
            </button>
          ))}
        </div>

        {/* Day title */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.1rem,3vw,1.5rem)', fontWeight: 800, color: '#1F2937', marginBottom: 4 }}>{day.emoji} {day.title}</div>
          <div style={{ fontSize: '.78rem', color: '#059669', fontWeight: 700, fontStyle: 'italic' }}>{day.verse}</div>
        </div>

        {/* Color palette */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14, background: 'white', borderRadius: 16, padding: '12px', boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}>
          {COLORS.map(c => (
            <div key={c} onClick={() => setActiveColor(c)}
              style={{ width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer', border: activeColor === c ? '3px solid #1F2937' : '2px solid #E5E7EB', boxShadow: activeColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none', transition: 'all .15s' }} />
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: activeColor, border: '2px solid #D1D5DB' }} />
            <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#374151' }}>Selected</span>
          </div>
        </div>

        {/* SVG canvas */}
        <div ref={svgRef} onClick={handleSvgClick}
          style={{ background: 'white', borderRadius: 22, padding: 8, boxShadow: '0 8px 32px rgba(0,0,0,.1)', marginBottom: 14, cursor: 'crosshair' }}
          dangerouslySetInnerHTML={{ __html: day.svg }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setFills({})} style={{ background: '#F3F4F6', border: 'none', borderRadius: 12, padding: '10px 18px', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', color: '#374151' }}>🗑️ Clear</button>
          <button onClick={download} style={{ background: '#059669', border: 'none', borderRadius: 12, padding: '10px 18px', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', color: 'white' }}>⬇️ Save Picture</button>
          <button onClick={() => setDayIdx(i => (i + 1) % DAYS.length)} style={{ background: '#1D4ED8', border: 'none', borderRadius: 12, padding: '10px 18px', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', color: 'white' }}>Next Day ✨</button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '.7rem', color: '#9CA3AF', marginTop: 10, fontWeight: 500 }}>Tap any part of the picture to color it! 🎨</p>
      </div>
    </div>
  )
}
