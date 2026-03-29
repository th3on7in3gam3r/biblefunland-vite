import { useState, useCallback } from 'react'

// Each puzzle is an SVG scene broken into draggable pieces
const PUZZLES = [
  {
    title:"Noah's Ark",
    emoji:'🚢',
    color:'#3B82F6',
    verse:'"Noah did everything just as God commanded." — Genesis 6:22',
    fact:'Noah spent 100 years building the ark! He trusted God even when it seemed impossible.',
    pieces:[
      { id:'sky',     label:'🌤️ Sky',     x:0,   y:0,   w:400, h:120, fill:'#BAE6FD', shape:'rect' },
      { id:'water',   label:'🌊 Water',   x:0,   y:220, w:400, h:80,  fill:'#0EA5E9', shape:'rect' },
      { id:'hull',    label:'🚢 Hull',    x:50,  y:180, w:300, h:55,  fill:'#92400E', shape:'rect', rx:8 },
      { id:'deck',    label:'🪵 Deck',    x:30,  y:140, w:340, h:45,  fill:'#A16207', shape:'rect', rx:6 },
      { id:'cabin',   label:'🏠 Cabin',   x:130, y:80,  w:140, h:65,  fill:'#78350F', shape:'rect', rx:4 },
      { id:'rainbow', label:'🌈 Rainbow', x:0,   y:0,   w:400, h:300, fill:'none',    shape:'rainbow' },
      { id:'dove',    label:'🕊️ Dove',    x:290, y:50,  w:60,  h:40,  fill:'white',   shape:'ellipse' },
      { id:'animals', label:'🦒 Animals', x:80,  y:150, w:240, h:35,  fill:'#FCD34D', shape:'rect', rx:4 },
    ]
  },
  {
    title:'Baby Moses',
    emoji:'👶',
    color:'#10B981',
    verse:'"She placed the child in it and put it among the reeds." — Exodus 2:3',
    fact:'Baby Moses floated safely because God was watching over him the whole time!',
    pieces:[
      { id:'river',   label:'🌊 Nile River', x:0,  y:150, w:400, h:150, fill:'#0EA5E9', shape:'rect' },
      { id:'reeds1',  label:'🌾 Reeds',      x:10, y:140, w:30,  h:80,  fill:'#4ADE80', shape:'rect', rx:4 },
      { id:'reeds2',  label:'🌾 More Reeds', x:360,y:140, w:30,  h:80,  fill:'#4ADE80', shape:'rect', rx:4 },
      { id:'sky2',    label:'☀️ Sky',        x:0,  y:0,   w:400, h:155, fill:'#BAE6FD', shape:'rect' },
      { id:'sun2',    label:'☀️ Sun',        x:320,y:20,  w:60,  h:60,  fill:'#FCD34D', shape:'ellipse' },
      { id:'basket',  label:'🧺 Basket',     x:150,y:180, w:100, h:70,  fill:'#D97706', shape:'rect', rx:12 },
      { id:'baby',    label:'👶 Baby Moses', x:162,y:192, w:76,  h:50,  fill:'#FBBF24', shape:'ellipse' },
      { id:'princess',label:'👸 Princess',   x:270,y:120, w:50,  h:100, fill:'#EC4899', shape:'rect', rx:6 },
    ]
  },
  {
    title:'Jesus with Children',
    emoji:'❤️',
    color:'#EC4899',
    verse:'"Let the little children come to me." — Matthew 19:14',
    fact:'Jesus stopped what He was doing just to welcome children. He loves kids so much!',
    pieces:[
      { id:'bg3',     label:'🌿 Garden',    x:0,  y:0,   w:400, h:300, fill:'#FEF3C7', shape:'rect' },
      { id:'tree3',   label:'🌳 Tree',      x:20, y:40,  w:80,  h:160, fill:'#22C55E', shape:'ellipse' },
      { id:'jesus3',  label:'🙏 Jesus',     x:160,y:60,  w:80,  h:180, fill:'#FDE68A', shape:'rect', rx:8 },
      { id:'child1',  label:'👧 Child 1',   x:80, y:120, w:60,  h:130, fill:'#F472B6', shape:'rect', rx:6 },
      { id:'child2',  label:'👦 Child 2',   x:270,y:130, w:55,  h:120, fill:'#60A5FA', shape:'rect', rx:6 },
      { id:'child3',  label:'👶 Child 3',   x:190,y:200, w:40,  h:80,  fill:'#A78BFA', shape:'rect', rx:6 },
      { id:'sky3',    label:'☀️ Sky',       x:0,  y:0,   w:400, h:100, fill:'#BAE6FD', shape:'rect' },
      { id:'sun3',    label:'☀️ Sun',       x:330,y:20,  w:55,  h:55,  fill:'#FCD34D', shape:'ellipse' },
    ]
  },
]

export default function BibleJigsaw() {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [placed,    setPlaced]    = useState(new Set())
  const [dragging,  setDragging]  = useState(null)
  const [completed, setCompleted] = useState(new Set())
  const [showFact,  setShowFact]  = useState(false)

  const puzzle = PUZZLES[puzzleIdx]
  const isComplete = placed.size === puzzle.pieces.length

  function placePiece(id) {
    const newPlaced = new Set([...placed, id])
    setPlaced(newPlaced)
    if (newPlaced.size === puzzle.pieces.length) {
      setCompleted(s => new Set([...s, puzzleIdx]))
      setTimeout(() => setShowFact(true), 400)
    }
  }

  function resetPuzzle() {
    setPlaced(new Set())
    setShowFact(false)
  }

  function nextPuzzle() {
    setPuzzleIdx(i => (i + 1) % PUZZLES.length)
    setPlaced(new Set())
    setShowFact(false)
  }

  function renderShape(p, isPlaced) {
    const fill   = isPlaced ? p.fill : '#E5E7EB'
    const opacity = isPlaced ? 1 : 0.4
    switch (p.shape) {
      case 'ellipse': return <ellipse cx={p.x + p.w/2} cy={p.y + p.h/2} rx={p.w/2} ry={p.h/2} fill={fill} opacity={opacity} />
      case 'rainbow':
        if (!isPlaced) return null
        return <>
          <path d="M0,200 Q200,0 400,200" fill="none" stroke="#EF4444" strokeWidth="12" opacity={0.6}/>
          <path d="M20,215 Q200,30 380,215" fill="none" stroke="#FCD34D" strokeWidth="10" opacity={0.6}/>
          <path d="M40,228 Q200,58 360,228" fill="none" stroke="#22C55E" strokeWidth="8" opacity={0.6}/>
          <path d="M58,238 Q200,84 342,238" fill="none" stroke="#3B82F6" strokeWidth="6" opacity={0.6}/>
        </>
      default: return <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx||0} fill={fill} opacity={opacity} />
    }
  }

  return (
    <div style={{ background: 'linear-gradient(180deg,#EFF6FF 0%,#FDF4FF 100%)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: `linear-gradient(135deg,${puzzle.color},${puzzle.color}bb)`, padding: '28px 24px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>🧩</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: 'white', marginBottom: 4 }}>Bible Jigsaw!</h1>
        <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '.82rem', fontWeight: 600 }}>Tap the pieces to add them to the picture!</p>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 14px' }}>
        {/* Puzzle selector */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
          {PUZZLES.map((p, i) => (
            <button key={i} onClick={() => { setPuzzleIdx(i); setPlaced(new Set()); setShowFact(false) }}
              style={{ fontSize: '.8rem', fontWeight: 800, padding: '7px 14px', borderRadius: 100, cursor: 'pointer', border: `2px solid ${puzzleIdx === i ? p.color : '#E5E7EB'}`, background: puzzleIdx === i ? p.color + '18' : 'white', color: puzzleIdx === i ? p.color : '#6B7280', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 5 }}>
              {p.emoji} {p.title} {completed.has(i) ? '✅' : ''}
            </button>
          ))}
        </div>

        {/* Puzzle canvas */}
        <div style={{ background: 'white', borderRadius: 22, padding: 12, boxShadow: `0 8px 32px ${puzzle.color}22`, marginBottom: 14, border: `2px solid ${puzzle.color}33` }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, color: '#1F2937', textAlign: 'center', marginBottom: 10, fontSize: '1rem' }}>{puzzle.emoji} {puzzle.title}</div>
          <svg viewBox="0 0 400 300" style={{ width: '100%', borderRadius: 14, background: '#F9FAFB', display: 'block' }}>
            {puzzle.pieces.map(p => (
              <g key={p.id}>{renderShape(p, placed.has(p.id))}</g>
            ))}
            {isComplete && <text x="200" y="290" textAnchor="middle" fontSize="13" fill="#059669" fontFamily="Georgia" fontWeight="bold">✅ {puzzle.title} complete!</text>}
          </svg>
        </div>

        {/* Piece bank */}
        {!isComplete && (
          <div style={{ background: 'white', borderRadius: 20, padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', marginBottom: 14 }}>
            <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 12, textAlign: 'center' }}>
              Tap a piece to add it! ({placed.size}/{puzzle.pieces.length} placed)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 8 }}>
              {puzzle.pieces.map(p => (
                <button key={p.id} onClick={() => placePiece(p.id)} disabled={placed.has(p.id)}
                  style={{ padding: '10px 8px', borderRadius: 14, border: `2px solid ${placed.has(p.id) ? '#D1FAE5' : puzzle.color + '66'}`, background: placed.has(p.id) ? '#ECFDF5' : 'white', cursor: placed.has(p.id) ? 'default' : 'pointer', opacity: placed.has(p.id) ? .5 : 1, transition: 'all .2s', fontFamily: 'Poppins,sans-serif', fontSize: '.7rem', fontWeight: 700, color: placed.has(p.id) ? '#059669' : '#374151', textAlign: 'center', lineHeight: 1.4 }}
                  onMouseEnter={e => { if (!placed.has(p.id)) e.currentTarget.style.background = puzzle.color + '14' }}
                  onMouseLeave={e => { if (!placed.has(p.id)) e.currentTarget.style.background = 'white' }}>
                  {placed.has(p.id) ? '✅' : p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Completion / fact */}
        {showFact && (
          <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 8px 28px rgba(0,0,0,.1)', border: `2px solid ${puzzle.color}44`, animation: 'popIn .5s cubic-bezier(.34,1.56,.64,1)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 10 }}>🎉</div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', fontWeight: 800, color: puzzle.color, marginBottom: 8 }}>Puzzle Complete!</div>
            <div style={{ fontSize: '.76rem', fontWeight: 700, color: '#6B7280', fontStyle: 'italic', marginBottom: 8 }}>{puzzle.verse}</div>
            <div style={{ fontSize: '.86rem', color: '#374151', lineHeight: 1.7, marginBottom: 18 }}>🌟 {puzzle.fact}</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={nextPuzzle} style={{ background: puzzle.color, color: 'white', border: 'none', borderRadius: 14, padding: '12px 24px', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.88rem', cursor: 'pointer' }}>Next Puzzle ✨</button>
              <button onClick={resetPuzzle} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 14, padding: '12px 18px', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>↺ Again</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
