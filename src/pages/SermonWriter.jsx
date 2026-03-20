import { useState, useRef } from 'react'
import { generateAIContent } from '../lib/ai'

const TONES     = ['Expository','Topical','Narrative','Evangelistic','Prophetic','Pastoral','Conversational']
const AUDIENCES = ['General Congregation','Youth Group','Men\'s Ministry','Women\'s Ministry','Children\'s Church','Seminary Students','New Believers']
const LENGTHS   = [{ id:'short', label:'Short (15–20 min)', desc:'~1,500 words' },{ id:'medium', label:'Standard (30–35 min)', desc:'~2,800 words' },{ id:'long', label:'Full (45–50 min)', desc:'~4,000 words' }]

const SYSTEM = `You are a masterclass-level sermon writer with 30+ years of pastoral experience across Baptist, Pentecostal, and non-denominational traditions. You write sermons that are scripturally faithful, culturally relevant, emotionally resonant, and immediately usable.

Generate a complete, ready-to-preach sermon manuscript in this EXACT format:

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERMON TITLE: [Compelling, memorable title]
PASSAGE: [Main scripture reference]
THEME: [One-sentence core message]
ESTIMATED TIME: [X minutes]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 OPENING HOOK (2-3 minutes)
[A gripping story, startling statistic, or cultural moment that earns attention in the first 60 seconds. No "turn with me to..." openers.]

📖 SCRIPTURE READING
[Full text of the main passage, formatted for reading aloud]

🔑 BACKGROUND & CONTEXT (2-3 minutes)
[Historical, cultural, or literary context that unlocks the passage. What did THIS mean to THEM then?]

POINT 1: [Bold memorable title]
[Expound the text. 3-4 paragraphs. Include: what the text says, what it means, why it matters. End with a real-world application story.]

TRANSITION: [Natural bridge sentence to point 2]

POINT 2: [Bold memorable title]
[Same structure. Different illustration style from Point 1.]

TRANSITION: [Bridge to Point 3]

POINT 3: [Bold memorable title]
[Same structure. End with a personal challenge question for the congregation.]

💥 CLIMAX & ALTAR CALL (3-5 minutes)
[Build to the highest emotional and spiritual moment. Land the main point with power. Issue a specific call to action or response.]

🙏 CLOSING PRAYER
[A pastoral prayer that covers everyone in the room — saved and unsaved.]

📌 PREACHER'S NOTES
- Key phrase to memorize:
- Illustration backup (if main one doesn't land):
- Worship song to play after:
- Follow-up Scripture for discussion:

Rules: Write the FULL manuscript, not an outline. Every transition should be natural. Every illustration should be vivid and specific. Every point should build on the last. The whole sermon should feel like one coherent journey.`

export default function SermonWriter() {
  const [passage,   setPassage]   = useState('')
  const [topic,     setTopic]     = useState('')
  const [mode,      setMode]      = useState('passage')
  const [tone,      setTone]      = useState('Expository')
  const [audience,  setAudience]  = useState('General Congregation')
  const [length,    setLength]    = useState('medium')
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState('')
  const [copied,    setCopied]    = useState(false)
  const [saved,     setSaved]     = useState(()=>JSON.parse(localStorage.getItem('bfl_sermons')||'[]'))
  const resultRef = useRef(null)

  async function generate() {
    const subject = mode==='passage' ? passage : topic
    if (!subject.trim()) { setError('Enter a passage or topic.'); return }
    setError(''); setLoading(true); setResult(null)
    const len = LENGTHS.find(l=>l.id===length)
    const prompt = `Write a complete ${len.label} ${tone} sermon for ${audience} on: "${subject}". Make it powerful, practical, and immediately usable this Sunday.`
    try {
      const text = await generateAIContent({
        system: SYSTEM,
        messages: [{role:'user',content:prompt}],
        max_tokens: 4096
      })
      if (text) {
        setResult(text)
        setTimeout(()=>resultRef.current?.scrollIntoView({behavior:'smooth'}),100)
      } else {
        setError('Generation failed. Please try again.')
      }
    } catch (err) { setError(err.message || 'Connection failed.') }
    setLoading(false)
  }

  function saveSermon() {
    const entry = { id:Date.now(), subject:mode==='passage'?passage:topic, tone, date:new Date().toLocaleDateString(), text:result }
    const n = [entry,...saved].slice(0,15)
    setSaved(n); localStorage.setItem('bfl_sermons',JSON.stringify(n))
  }

  function renderResult(text) {
    return text.split('\n').map((line,i) => {
      if (/^━+$/.test(line.trim())) return <hr key={i} style={{border:'none',borderTop:'1px solid var(--border)',margin:'16px 0'}} />
      if (/^(SERMON TITLE|PASSAGE|THEME|ESTIMATED TIME):/.test(line)) return <div key={i} style={{fontSize:'.78rem',fontWeight:700,color:'var(--blue)',textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{line}</div>
      if (/^🎯|^📖|^🔑|^💥|^🙏|^📌/.test(line)) return <div key={i} style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.05rem',fontWeight:800,color:'var(--orange)',margin:'22px 0 10px',paddingTop:16,borderTop:'1px solid var(--border)'}}>{line}</div>
      if (/^POINT [123]:|^TRANSITION:/.test(line)) return <div key={i} style={{fontFamily:"'Baloo 2',cursive",fontSize:'1rem',fontWeight:800,color:'var(--violet)',margin:'18px 0 8px'}}>{line}</div>
      if (/^-/.test(line.trim())) return <div key={i} style={{fontSize:'.84rem',color:'var(--ink2)',paddingLeft:14,marginBottom:5,fontWeight:500}}>{line}</div>
      if (!line.trim()) return <div key={i} style={{height:8}} />
      return <p key={i} style={{fontSize:'.9rem',color:'var(--ink)',lineHeight:1.85,fontWeight:500,margin:'0 0 4px'}}>{line}</p>
    })
  }

  return (
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#0F0F1A,#1C0A00)',padding:'48px 36px 36px',textAlign:'center'}}>
        <div style={{display:'inline-block',fontSize:'.7rem',fontWeight:700,background:'rgba(249,115,22,.15)',color:'#FB923C',padding:'4px 14px',borderRadius:100,marginBottom:12}}>✍️ Full Manuscript · Ready to Preach Sunday</div>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,background:'linear-gradient(90deg,#FB923C,#FCD34D)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:8}}>AI Sermon Writer</h1>
        <p style={{color:'rgba(255,255,255,.45)',fontSize:'.88rem',fontWeight:500}}>Complete sermon manuscripts — title, three points, illustrations, altar call, preacher's notes. Ready to preach.</p>
      </div>
      <div style={{maxWidth:880,margin:'0 auto',padding:'32px 20px'}}>
        <div style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid var(--border)',padding:'28px 32px',marginBottom:20,boxShadow:'var(--sh)'}}>
          <div style={{display:'flex',gap:10,marginBottom:20}}>
            {[['passage','📖 By Passage'],['topic','✨ By Topic']].map(([id,l])=>(
              <button key={id} onClick={()=>setMode(id)} style={{flex:1,padding:11,borderRadius:12,border:`2px solid ${mode===id?'var(--orange)':'var(--border)'}`,background:mode===id?'var(--orange-bg)':'var(--surface)',color:mode===id?'var(--orange)':'var(--ink3)',fontFamily:'Poppins,sans-serif',fontWeight:700,fontSize:'.86rem',cursor:'pointer',transition:'all .2s'}}>{l}</button>
            ))}
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:'.7rem',fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:8}}>{mode==='passage'?'Scripture Passage':'Sermon Topic or Theme'}</label>
            <input className="input-field" placeholder={mode==='passage'?'e.g. Romans 8:28-39, The Prodigal Son, Psalm 23...':'e.g. Overcoming Fear, The Power of Prayer, Identity in Christ...'} value={mode==='passage'?passage:topic} onChange={e=>mode==='passage'?setPassage(e.target.value):setTopic(e.target.value)} style={{fontSize:'.95rem'}} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
            <div>
              <label style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:8}}>Sermon Style</label>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {TONES.map(t=><button key={t} onClick={()=>setTone(t)} style={{padding:'7px 10px',borderRadius:9,border:`1.5px solid ${tone===t?'var(--orange)':'var(--border)'}`,background:tone===t?'var(--orange-bg)':'var(--surface)',color:tone===t?'var(--orange)':'var(--ink2)',fontFamily:'Poppins,sans-serif',fontSize:'.72rem',fontWeight:700,cursor:'pointer',textAlign:'left',transition:'all .2s'}}>{t}</button>)}
              </div>
            </div>
            <div>
              <label style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:8}}>Audience</label>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {AUDIENCES.map(a=><button key={a} onClick={()=>setAudience(a)} style={{padding:'7px 10px',borderRadius:9,border:`1.5px solid ${audience===a?'var(--blue)':'var(--border)'}`,background:audience===a?'var(--blue-bg)':'var(--surface)',color:audience===a?'var(--blue)':'var(--ink2)',fontFamily:'Poppins,sans-serif',fontSize:'.72rem',fontWeight:700,cursor:'pointer',textAlign:'left',transition:'all .2s'}}>{a}</button>)}
              </div>
            </div>
            <div>
              <label style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:8}}>Length</label>
              {LENGTHS.map(l=>(
                <div key={l.id} onClick={()=>setLength(l.id)} style={{padding:'12px',borderRadius:12,border:`2px solid ${length===l.id?'var(--green)':'var(--border)'}`,background:length===l.id?'var(--green-bg)':'var(--surface)',marginBottom:8,cursor:'pointer',transition:'all .2s'}}>
                  <div style={{fontSize:'.78rem',fontWeight:700,color:length===l.id?'var(--green)':'var(--ink)'}}>{l.label}</div>
                  <div style={{fontSize:'.66rem',color:'var(--ink3)',fontWeight:500}}>{l.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center',paddingTop:16,borderTop:'1px solid var(--border)'}}>
            <span style={{fontSize:'.7rem',color:'var(--ink3)',fontWeight:600}}>✨ Powered by secure AI proxy. No local API keys required.</span>
            <button className="btn btn-orange" onClick={generate} disabled={loading} style={{marginLeft:'auto',whiteSpace:'nowrap',flexShrink:0}}>
              {loading?'⏳ Writing...':'✍️ Write Sermon'}
            </button>
          </div>
          {error&&<div style={{marginTop:12,background:'var(--red-bg)',color:'var(--red)',borderRadius:10,padding:'10px 14px',fontSize:'.82rem',fontWeight:600}}>⚠️ {error}</div>}
        </div>

        {loading&&<div style={{textAlign:'center',padding:'48px 0'}}><div style={{fontSize:'3rem',marginBottom:10,animation:'float 2s ease-in-out infinite'}}>✍️</div><p style={{color:'var(--ink2)',fontWeight:600}}>Writing your sermon manuscript...</p><p style={{fontSize:'.78rem',color:'var(--ink3)',marginTop:5}}>This takes ~20–30 seconds for a full manuscript</p></div>}

        {result&&!loading&&(
          <div ref={resultRef} style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid var(--border)',overflow:'hidden'}}>
            <div style={{background:'linear-gradient(135deg,#1C0A00,#3D1500)',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1rem',fontWeight:800,color:'white'}}>✍️ {mode==='passage'?passage:topic} · {tone} · {audience}</div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={saveSermon} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.2)',color:'white',borderRadius:10,padding:'7px 14px',cursor:'pointer',fontFamily:'Poppins,sans-serif',fontSize:'.78rem',fontWeight:700}}>💾 Save</button>
                <button onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',color:'white',borderRadius:10,padding:'7px 14px',cursor:'pointer',fontFamily:'Poppins,sans-serif',fontSize:'.78rem',fontWeight:700}}>{copied?'✅ Copied':'📋 Copy'}</button>
                <button onClick={generate} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.6)',borderRadius:10,padding:'7px 14px',cursor:'pointer',fontFamily:'Poppins,sans-serif',fontSize:'.78rem',fontWeight:700}}>↺ Rewrite</button>
              </div>
            </div>
            <div style={{padding:'28px 36px'}}>{renderResult(result)}</div>
          </div>
        )}

        {saved.length>0&&(
          <div style={{marginTop:24}}>
            <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1rem',fontWeight:800,color:'var(--ink)',marginBottom:12}}>💾 Saved Sermons ({saved.length})</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {saved.map(s=>(
                <div key={s.id} style={{background:'var(--surface)',borderRadius:14,border:'1.5px solid var(--border)',padding:'13px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                  <div><div style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,color:'var(--ink)',fontSize:'.9rem'}}>{s.subject}</div><div style={{fontSize:'.68rem',color:'var(--ink3)'}}>{s.tone} · {s.date}</div></div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setResult(s.text)} className="btn btn-outline btn-sm">View</button>
                    <button onClick={()=>{const n=saved.filter(x=>x.id!==s.id);setSaved(n);localStorage.setItem('bfl_sermons',JSON.stringify(n))}} style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:'.78rem',fontWeight:700}}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  )
}
