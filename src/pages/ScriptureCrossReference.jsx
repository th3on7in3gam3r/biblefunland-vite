import { useState, useEffect, useRef } from 'react'

// Cross-reference data — verse nodes and their connections
const NODES = [
  { id:'JHN.3.16',  label:'John 3:16',       text:'For God so loved the world...',           category:'Gospel',   color:'#EC4899' },
  { id:'GEN.3.15',  label:'Gen 3:15',         text:'He will crush your head...',              category:'Prophecy', color:'#F59E0B' },
  { id:'ISA.53.5',  label:'Isa 53:5',         text:'He was pierced for our transgressions...', category:'Prophecy', color:'#F59E0B' },
  { id:'ROM.5.8',   label:'Rom 5:8',          text:'While we were still sinners...',           category:'Epistle',  color:'#8B5CF6' },
  { id:'1JHN.4.9',  label:'1 John 4:9',       text:'He sent his one and only Son...',          category:'Epistle',  color:'#8B5CF6' },
  { id:'EPH.2.8',   label:'Eph 2:8',          text:'By grace through faith...',               category:'Epistle',  color:'#8B5CF6' },
  { id:'ROM.8.38',  label:'Rom 8:38-39',      text:'Nothing can separate us from God\'s love', category:'Epistle',  color:'#8B5CF6' },
  { id:'PSA.22.1',  label:'Ps 22:1',          text:'My God, why have you forsaken me...',      category:'Psalm',    color:'#3B82F6' },
  { id:'PSA.22.18', label:'Ps 22:18',         text:'They divide my garments...',               category:'Psalm',    color:'#3B82F6' },
  { id:'MIC.5.2',   label:'Mic 5:2',          text:'Out of Bethlehem will come a ruler...',    category:'Prophecy', color:'#F59E0B' },
  { id:'LUK.2.11',  label:'Luke 2:11',        text:'A Savior has been born to you...',         category:'Gospel',   color:'#EC4899' },
  { id:'HEB.11.1',  label:'Heb 11:1',         text:'Faith is the substance of things hoped for', category:'Epistle', color:'#8B5CF6' },
  { id:'ROM.1.17',  label:'Rom 1:17',         text:'The righteous shall live by faith',        category:'Epistle',  color:'#8B5CF6' },
  { id:'HAB.2.4',   label:'Hab 2:4',          text:'The righteous will live by his faithfulness', category:'Prophecy', color:'#F59E0B' },
  { id:'PSA.23.1',  label:'Ps 23:1',          text:'The Lord is my shepherd...',               category:'Psalm',    color:'#3B82F6' },
  { id:'JHN.10.11', label:'John 10:11',       text:'I am the good shepherd...',               category:'Gospel',   color:'#EC4899' },
  { id:'ISA.40.11', label:'Isa 40:11',        text:'He tends his flock like a shepherd...',    category:'Prophecy', color:'#F59E0B' },
  { id:'PHP.4.13',  label:'Phil 4:13',        text:'I can do all things through Christ...',    category:'Epistle',  color:'#8B5CF6' },
  { id:'JOS.1.9',   label:'Josh 1:9',         text:'Be strong and courageous...',              category:'History',  color:'#10B981' },
  { id:'ISA.41.10', label:'Isa 41:10',        text:'Do not fear, for I am with you...',        category:'Prophecy', color:'#F59E0B' },
]

const EDGES = [
  { from:'JHN.3.16', to:'GEN.3.15',  label:'Fulfills' },
  { from:'JHN.3.16', to:'ISA.53.5',  label:'Fulfills' },
  { from:'JHN.3.16', to:'ROM.5.8',   label:'Echoes'   },
  { from:'JHN.3.16', to:'1JHN.4.9',  label:'Parallels'},
  { from:'JHN.3.16', to:'EPH.2.8',   label:'Expands'  },
  { from:'JHN.3.16', to:'ROM.8.38',  label:'Confirms' },
  { from:'PSA.22.1', to:'PSA.22.18', label:'Same psalm'},
  { from:'PSA.22.1', to:'JHN.3.16',  label:'Leads to' },
  { from:'MIC.5.2',  to:'LUK.2.11',  label:'Fulfills' },
  { from:'HEB.11.1', to:'ROM.1.17',  label:'Defines'  },
  { from:'ROM.1.17', to:'HAB.2.4',   label:'Quotes'   },
  { from:'PSA.23.1', to:'JHN.10.11', label:'Fulfilled in'},
  { from:'ISA.40.11',to:'PSA.23.1',  label:'Echoes'   },
  { from:'ISA.40.11',to:'JHN.10.11', label:'Prophesies'},
  { from:'PHP.4.13', to:'ISA.41.10', label:'Built on' },
  { from:'JOS.1.9',  to:'ISA.41.10', label:'Parallels'},
  { from:'ISA.53.5', to:'ROM.5.8',   label:'Foundation for'},
  { from:'EPH.2.8',  to:'ROM.1.17',  label:'Expands'  },
]

const CATEGORY_COLORS = { Gospel:'#EC4899', Prophecy:'#F59E0B', Epistle:'#8B5CF6', Psalm:'#3B82F6', History:'#10B981' }
const EDGE_COLORS = { 'Fulfills':'#10B981','Echoes':'#3B82F6','Parallels':'#8B5CF6','Expands':'#F59E0B','Confirms':'#10B981','Leads to':'#EC4899','Same psalm':'#94A3B8','Defines':'#F97316','Quotes':'#F97316','Foundation for':'#10B981','Built on':'#8B5CF6','Prophesies':'#F59E0B','Fulfilled in':'#10B981' }

export default function ScriptureCrossReference() {
  const svgRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [positions, setPositions] = useState({})
  const [dragging, setDragging] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [filter, setFilter] = useState('All')

  const W = 800, H = 560

  // Initial positions — arranged in a rough circle with some clusters
  useEffect(() => {
    const pos = {}
    NODES.forEach((n, i) => {
      const angle = (i / NODES.length) * 2 * Math.PI
      const r = 180 + Math.random() * 60
      pos[n.id] = { x: W / 2 + r * Math.cos(angle), y: H / 2 + r * Math.sin(angle) }
    })
    // Cluster JHN.3.16 in center
    pos['JHN.3.16'] = { x: W / 2, y: H / 2 }
    setPositions(pos)
  }, [])

  function onNodeMouseDown(e, id) {
    const pos = positions[id]
    setDragging(id)
    setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y })
    e.preventDefault()
  }

  function onMouseMove(e) {
    if (!dragging) return
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const scaleX = W / rect.width
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleX
    setPositions(p => ({ ...p, [dragging]: { x: Math.max(40, Math.min(W - 40, x)), y: Math.max(30, Math.min(H - 30, y)) } }))
  }

  function onMouseUp() { setDragging(null) }

  const selectedNode = selected ? NODES.find(n => n.id === selected) : null
  const connectedEdges = selected ? EDGES.filter(e => e.from === selected || e.to === selected) : []
  const connectedIds = new Set(connectedEdges.flatMap(e => [e.from, e.to]))

  const filteredEdges = filter === 'All' ? EDGES : EDGES.filter(e => {
    const fromNode = NODES.find(n => n.id === e.from)
    const toNode = NODES.find(n => n.id === e.to)
    return fromNode?.category === filter || toNode?.category === filter
  })

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#0D1B2A)', padding: '48px 36px 36px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, background: 'linear-gradient(90deg,#60A5FA,#C084FC,#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
          Scripture Cross-Reference Web
        </h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem', fontWeight: 500 }}>
          See how Bible verses connect to each other. Click any verse to explore its web of meaning. Drag nodes to rearrange.
        </p>
      </div>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '24px 20px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--ink3)' }}>Filter:</span>
          {['All','Gospel','Prophecy','Epistle','Psalm','History'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ fontSize: '.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: 100, cursor: 'pointer', border: `1.5px solid ${filter === f ? CATEGORY_COLORS[f] || 'var(--blue)' : 'var(--border)'}`, background: filter === f ? (CATEGORY_COLORS[f] || 'var(--blue)') + '18' : 'var(--surface)', color: filter === f ? CATEGORY_COLORS[f] || 'var(--blue)' : 'var(--ink3)', transition: 'all .2s' }}>{f}</button>
          ))}
          {selected && <button onClick={() => setSelected(null)} style={{ marginLeft: 'auto', fontSize: '.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: 100, background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--ink3)', cursor: 'pointer' }}>Clear selection ✕</button>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr clamp(220px,28%,280px)', gap: 16, alignItems: 'start' }}>
          {/* SVG Graph */}
          <div style={{ background: '#0B1525', borderRadius: 22, border: '1.5px solid rgba(255,255,255,.08)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', cursor: dragging ? 'grabbing' : 'default', display: 'block' }}
              onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,.25)" />
                </marker>
              </defs>

              {/* Edges */}
              {filteredEdges.map((e, i) => {
                const from = positions[e.from]
                const to = positions[e.to]
                if (!from || !to) return null
                const isHighlighted = selected && (e.from === selected || e.to === selected)
                const edgeColor = EDGE_COLORS[e.label] || '#6B7280'
                const midX = (from.x + to.x) / 2
                const midY = (from.y + to.y) / 2
                return (
                  <g key={i}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={isHighlighted ? edgeColor : 'rgba(255,255,255,.1)'}
                      strokeWidth={isHighlighted ? 2.5 : 1}
                      strokeDasharray={isHighlighted ? 'none' : '4,4'}
                      markerEnd="url(#arrow)"
                    />
                    {isHighlighted && (
                      <text x={midX} y={midY - 5} textAnchor="middle" fill={edgeColor} fontSize="9" fontFamily="Poppins,sans-serif" fontWeight="700">{e.label}</text>
                    )}
                  </g>
                )
              })}

              {/* Nodes */}
              {NODES.map(node => {
                const pos = positions[node.id]
                if (!pos) return null
                const isSelected = selected === node.id
                const isConnected = connectedIds.has(node.id)
                const isDimmed = selected && !isSelected && !isConnected
                return (
                  <g key={node.id} onMouseDown={e => onNodeMouseDown(e, node.id)} onClick={() => setSelected(selected === node.id ? null : node.id)}
                    style={{ cursor: 'pointer', opacity: isDimmed ? 0.3 : 1, transition: 'opacity .2s' }}>
                    {isSelected && <circle cx={pos.x} cy={pos.y} r="28" fill={node.color + '22'} style={{ animation: 'pulseRing 2s ease-in-out infinite' }} />}
                    <circle cx={pos.x} cy={pos.y} r={isSelected ? 22 : 16}
                      fill={isSelected ? node.color : isConnected ? node.color + 'cc' : '#1E293B'}
                      stroke={node.color}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      style={{ filter: isSelected ? `drop-shadow(0 0 12px ${node.color})` : 'none', transition: 'all .2s' }}
                    />
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize={isSelected ? "8" : "7"} fontFamily="Poppins,sans-serif" fontWeight="700">
                      {node.label.length > 10 ? node.label.substring(0, 9) + '..' : node.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Detail panel */}
          <div>
            {selectedNode ? (
              <div style={{ background: 'var(--surface)', borderRadius: 20, border: `1.5px solid ${selectedNode.color}44`, overflow: 'hidden' }}>
                <div style={{ background: `linear-gradient(135deg,${selectedNode.color}22,${selectedNode.color}08)`, padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: selectedNode.color, marginBottom: 6 }}>{selectedNode.category}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>{selectedNode.label}</div>
                  <div style={{ fontSize: '.84rem', color: 'var(--ink2)', fontStyle: 'italic', fontWeight: 500 }}>"{selectedNode.text}"</div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>Connected to {connectedEdges.length} verse{connectedEdges.length !== 1 ? 's' : ''}</div>
                  {connectedEdges.map((e, i) => {
                    const otherId = e.from === selected ? e.to : e.from
                    const other = NODES.find(n => n.id === otherId)
                    const isOutgoing = e.from === selected
                    const edgeColor = EDGE_COLORS[e.label] || '#6B7280'
                    return other ? (
                      <div key={i} onClick={() => setSelected(otherId)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 10, marginBottom: 6, background: 'var(--bg2)', cursor: 'pointer', border: '1px solid var(--border)', transition: 'all .2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = other.color}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: other.color, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--ink)' }}>{other.label}</div>
                          <div style={{ fontSize: '.62rem', color: edgeColor, fontWeight: 700 }}>{isOutgoing ? '→' : '←'} {e.label}</div>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1.5px solid var(--border)', padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: .3 }}>🕸️</div>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>Explore the Web</div>
                <div style={{ fontSize: '.78rem', color: 'var(--ink3)', fontWeight: 500, lineHeight: 1.65 }}>Click any verse node to see how it connects to the rest of Scripture. Drag nodes to rearrange.</div>
                {/* Legend */}
                <div style={{ marginTop: 20, textAlign: 'left' }}>
                  <div style={{ fontSize: '.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--ink3)', marginBottom: 8 }}>Categories</div>
                  {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: '.74rem', fontWeight: 600, color: 'var(--ink2)' }}>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes pulseRing{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.2;transform:scale(1.1)}}`}</style>
    </div>
  )
}
