import { useState, useEffect } from 'react'

const CATEGORIES = ['All','Personal','Family','Health','Work','Relationships','World','Church','Finances','Gratitude']
const CAT_COLORS  = { Personal:'#8B5CF6',Family:'#EC4899',Health:'#10B981',Work:'#3B82F6',Relationships:'#F59E0B',World:'#14B8A6',Church:'#6366F1',Finances:'#F97316',Gratitude:'#FCD34D' }

const SAMPLE = [
  { id:'s1', title:'Healing for Mom', category:'Family', verse:'Jer 17:14', verseText:'Heal me, Lord, and I will be healed; save me and I will be saved.', text:"Lord, please heal my mom. She's been fighting this for months. I trust you.", answered:false, answeredNote:'', date:'2026-02-14', tags:['healing','family'] },
  { id:'s2', title:'New Job',          category:'Work',   verse:'Jer 29:11', verseText:'For I know the plans I have for you...', text:'God I need provision. I\'ve sent 20 applications. I trust your timing.', answered:true,  answeredNote:'Got the call on March 3rd. He provided exactly what I needed.', date:'2026-01-08', tags:['provision','work'] },
]

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export default function PrayerJournal() {
  const [entries,    setEntries]    = useState(() => { try { return JSON.parse(localStorage.getItem('bfl_prayer_journal') || 'null') || SAMPLE } catch { return SAMPLE } })
  const [filter,     setFilter]     = useState('All')
  const [showForm,   setShowForm]   = useState(false)
  const [editId,     setEditId]     = useState(null)
  const [expanded,   setExpanded]   = useState(null)
  const [search,     setSearch]     = useState('')
  const [view,       setView]       = useState('all') // all | active | answered
  const [form,       setForm]       = useState({ title:'', category:'Personal', verse:'', verseText:'', text:'', tags:'' })
  const [answering,  setAnswering]  = useState(null)
  const [answerNote, setAnswerNote] = useState('')

  useEffect(() => { localStorage.setItem('bfl_prayer_journal', JSON.stringify(entries)) }, [entries])

  const filtered = entries
    .filter(e => view === 'all' || (view === 'answered' ? e.answered : !e.answered))
    .filter(e => filter === 'All' || e.category === filter)
    .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.text.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const answeredCount = entries.filter(e => e.answered).length
  const activeCount   = entries.filter(e => !e.answered).length

  function save() {
    if (!form.title.trim() || !form.text.trim()) return
    if (editId) {
      setEntries(es => es.map(e => e.id === editId ? { ...e, ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) } : e))
    } else {
      setEntries(es => [{ id: uid(), ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), answered:false, answeredNote:'', date: new Date().toISOString().split('T')[0] }, ...es])
    }
    setForm({ title:'', category:'Personal', verse:'', verseText:'', text:'', tags:'' })
    setShowForm(false)
    setEditId(null)
  }

  function markAnswered(id) {
    setEntries(es => es.map(e => e.id === id ? { ...e, answered:true, answeredNote:answerNote, answeredDate: new Date().toISOString().split('T')[0] } : e))
    setAnswering(null)
    setAnswerNote('')
  }

  function deleteEntry(id) { if (confirm('Delete this prayer?')) setEntries(es => es.filter(e => e.id !== id)) }

  function startEdit(entry) {
    setForm({ title:entry.title, category:entry.category, verse:entry.verse||'', verseText:entry.verseText||'', text:entry.text, tags:(entry.tags||[]).join(', ') })
    setEditId(entry.id)
    setShowForm(true)
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0A1A0F,#064E3B,#0F172A)', padding:'48px 36px 36px', textAlign:'center' }}>
        <div style={{ display:'inline-block', fontSize:'.7rem', fontWeight:700, background:'rgba(16,185,129,.15)', color:'#34D399', padding:'4px 14px', borderRadius:100, marginBottom:12, border:'1px solid rgba(16,185,129,.2)' }}>
          🔒 Private · Saved on your device · Never shared
        </div>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800, background:'linear-gradient(90deg,#6EE7B7,#A5B4FC)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>Prayer Journal</h1>
        <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.88rem', fontWeight:500 }}>Your private space with God. Log prayers, link scripture, mark answered.</p>

        <div style={{ display:'flex', gap:20, justifyContent:'center', marginTop:16 }}>
          {[['🙏', entries.length, 'Total Prayers'],['✅', answeredCount, 'Answered'],['⏳', activeCount, 'Active']].map(([e,v,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:'1.4rem', color:'white' }}>{e} {v}</div>
              <div style={{ fontSize:'.65rem', color:'rgba(255,255,255,.35)', fontWeight:600, textTransform:'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:820, margin:'0 auto', padding:'28px 20px' }}>
        {/* Controls */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
          <input className="input-field" placeholder="Search prayers..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex:1, minWidth:180 }} />
          <div style={{ display:'flex', gap:6 }}>
            {[['all','All'],['active','Active'],['answered','Answered ✅']].map(([v,l]) => (
              <button key={v} onClick={() => setView(v)} style={{ fontSize:'.72rem', fontWeight:700, padding:'7px 13px', borderRadius:10, border:`1.5px solid ${view===v?'var(--green)':'var(--border)'}`, background:view===v?'var(--green-bg)':'var(--surface)', color:view===v?'var(--green)':'var(--ink3)', cursor:'pointer' }}>{l}</button>
            ))}
          </div>
          <button className="btn btn-green" onClick={() => { setShowForm(true); setEditId(null); setForm({ title:'', category:'Personal', verse:'', verseText:'', text:'', tags:'' }) }}>+ New Prayer</button>
        </div>

        {/* Category filter */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
          {CATEGORIES.map(c => {
            const color = CAT_COLORS[c] || 'var(--blue)'
            return <button key={c} onClick={() => setFilter(c)} style={{ fontSize:'.7rem', fontWeight:700, padding:'5px 11px', borderRadius:100, cursor:'pointer', border:`1.5px solid ${filter===c?color:'var(--border)'}`, background:filter===c?color+'18':'var(--surface)', color:filter===c?color:'var(--ink3)', transition:'all .2s' }}>{c}</button>
          })}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--green)', padding:26, marginBottom:20 }}>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.1rem', fontWeight:800, color:'var(--ink)', marginBottom:16 }}>
              {editId ? '✏️ Edit Prayer' : '🙏 New Prayer Entry'}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <input className="input-field" placeholder="Prayer title..." value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
              <select className="input-field" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                {CATEGORIES.filter(c=>c!=='All').map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:10, marginBottom:10 }}>
              <input className="input-field" placeholder="Verse ref (e.g. Phil 4:6)" value={form.verse} onChange={e => setForm(f=>({...f,verse:e.target.value}))} />
              <input className="input-field" placeholder="Verse text (optional)" value={form.verseText} onChange={e => setForm(f=>({...f,verseText:e.target.value}))} />
            </div>
            <textarea className="textarea-field" placeholder="Write your prayer..." value={form.text} onChange={e => setForm(f=>({...f,text:e.target.value}))} style={{ height:100, marginBottom:10 }} />
            <input className="input-field" placeholder="Tags (comma separated): healing, family, work..." value={form.tags} onChange={e => setForm(f=>({...f,tags:e.target.value}))} style={{ marginBottom:14 }} />
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-green" onClick={save} disabled={!form.title.trim()||!form.text.trim()}>{editId ? 'Save Changes' : '🙏 Log Prayer'}</button>
              <button className="btn btn-outline" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Answer modal */}
        {answering && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
            <div style={{ background:'var(--surface)', borderRadius:22, border:'1.5px solid var(--green)', padding:28, maxWidth:480, width:'100%' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.2rem', fontWeight:800, color:'var(--ink)', marginBottom:8 }}>✅ Mark as Answered</div>
              <p style={{ fontSize:'.86rem', color:'var(--ink3)', marginBottom:16 }}>How did God answer this prayer? (Optional but encouraged — your future self will treasure this.)</p>
              <textarea className="textarea-field" placeholder="Write how God answered..." value={answerNote} onChange={e => setAnswerNote(e.target.value)} style={{ height:80, marginBottom:14 }} />
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-green" onClick={() => markAnswered(answering)}>✅ Mark Answered</button>
                <button className="btn btn-outline" onClick={() => setAnswering(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Entries */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--ink3)' }}>
            <div style={{ fontSize:'3rem', opacity:.2, marginBottom:12 }}>📓</div>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.1rem', fontWeight:800, color:'var(--ink)', marginBottom:6 }}>No prayers yet</div>
            <p style={{ fontSize:'.84rem' }}>Start your journal — log your first prayer above.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map(entry => {
              const color = CAT_COLORS[entry.category] || 'var(--blue)'
              const isExpanded = expanded === entry.id
              return (
                <div key={entry.id} style={{ background:'var(--surface)', borderRadius:18, border:`1.5px solid ${entry.answered?'rgba(16,185,129,.3)':'var(--border)'}`, overflow:'hidden', transition:'all .2s' }}>
                  <div style={{ height:3, background: entry.answered ? 'var(--green)' : color }} />
                  <div style={{ padding:'18px 20px' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:4 }}>
                          <span style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1rem', fontWeight:800, color:'var(--ink)' }}>{entry.title}</span>
                          {entry.answered && <span style={{ fontSize:'.66rem', fontWeight:800, padding:'2px 8px', borderRadius:100, background:'var(--green-bg)', color:'var(--green)' }}>✅ Answered</span>}
                          <span style={{ fontSize:'.66rem', fontWeight:700, padding:'2px 8px', borderRadius:100, background:color+'18', color }}>{entry.category}</span>
                        </div>
                        <div style={{ fontSize:'.72rem', color:'var(--ink3)', fontWeight:500 }}>{new Date(entry.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
                      </div>
                      <button onClick={() => setExpanded(isExpanded ? null : entry.id)} style={{ background:'none', border:'none', color:'var(--ink3)', cursor:'pointer', fontSize:'1.1rem', padding:4 }}>{isExpanded?'▲':'▼'}</button>
                    </div>

                    {entry.verse && (
                      <div style={{ background:'var(--bg2)', borderLeft:`3px solid ${color}`, borderRadius:'0 8px 8px 0', padding:'8px 12px', marginBottom:10, fontSize:'.8rem' }}>
                        <span style={{ fontWeight:700, color, marginRight:6 }}>{entry.verse}</span>
                        <span style={{ color:'var(--ink3)', fontStyle:'italic' }}>{entry.verseText}</span>
                      </div>
                    )}

                    <p style={{ fontSize:'.88rem', color:'var(--ink2)', lineHeight:1.75, fontWeight:500, margin:'0 0 10px' }}>
                      {isExpanded ? entry.text : entry.text.slice(0,120) + (entry.text.length>120?'...':'')}
                    </p>

                    {isExpanded && entry.answered && entry.answeredNote && (
                      <div style={{ background:'var(--green-bg)', border:'1px solid rgba(16,185,129,.2)', borderRadius:10, padding:'10px 14px', marginBottom:10 }}>
                        <div style={{ fontSize:'.7rem', fontWeight:800, color:'var(--green)', marginBottom:4 }}>✅ How God answered — {entry.answeredDate}</div>
                        <p style={{ fontSize:'.84rem', color:'var(--ink2)', fontStyle:'italic', margin:0 }}>{entry.answeredNote}</p>
                      </div>
                    )}

                    {isExpanded && (entry.tags||[]).length > 0 && (
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                        {entry.tags.map(t => <span key={t} style={{ fontSize:'.66rem', padding:'2px 8px', borderRadius:100, background:'var(--bg3)', color:'var(--ink3)', fontWeight:600 }}>#{t}</span>)}
                      </div>
                    )}

                    {isExpanded && (
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {!entry.answered && <button className="btn btn-green btn-sm" onClick={() => { setAnswering(entry.id) }}>✅ Mark Answered</button>}
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(entry)}>✏️ Edit</button>
                        <button onClick={() => deleteEntry(entry.id)} style={{ padding:'6px 12px', borderRadius:8, border:'1.5px solid var(--red)', background:'var(--red-bg)', color:'var(--red)', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:'.72rem', fontWeight:700 }}>🗑️ Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
