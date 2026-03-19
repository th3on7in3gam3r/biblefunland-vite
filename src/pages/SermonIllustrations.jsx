import { useState } from 'react'

const PASSAGE_SUGGESTIONS = ['John 3:16','Romans 8:28','Philippians 4:13','Psalm 23','Matthew 5:1-12','Ephesians 6:10-18','Genesis 1:1','Isaiah 53','Luke 15:11-32','Revelation 21:1-5']
const THEMES = ['Grace','Faith','Hope','Forgiveness','Prayer','Identity in Christ','The Cross','Resurrection','The Holy Spirit','Community','Generosity','Suffering','Courage','Love']
const TYPES  = ['Object Lesson','Story / Analogy','Historical Illustration','Science Illustration','Cultural Reference','Personal Challenge','Statistics & Data']

const SYSTEM = `You are a master sermon illustrator and communication coach with 30 years of preaching experience. Generate vivid, memorable sermon illustrations.

For each request, generate EXACTLY 4 illustrations in this format:

🎯 ILLUSTRATION 1: [Type] — [Catchy Title]
[2-3 paragraph illustration. Be specific, vivid, and concrete. Real details make illustrations memorable.]
💬 HOW TO USE: [One sentence on how to transition this into the text]
📖 CONNECTS TO: [One verse or truth this illustration specifically illuminates]

🎯 ILLUSTRATION 2: [Type] — [Catchy Title]
[etc.]

Rules:
- Each illustration should be a different TYPE (object lesson, story, analogy, historical, science, etc.)
- Make them culturally relevant and accessible to a mixed congregation
- Be specific — generic illustrations are forgettable
- The best illustrations make people say "I never thought about it that way"
- Do NOT use clichés (footprints in sand, eagle analogies, etc.)
- Length: each illustration should be 150-200 words
- End with a brief "Preacher's Note" after all 4 illustrations`

export default function SermonIllustrations() {
  const [mode,       setMode]       = useState('passage') // passage | theme
  const [passage,    setPassage]    = useState('')
  const [theme,      setTheme]      = useState('')
  const [types,      setTypes]      = useState([])
  const [audience,   setAudience]   = useState('general')
  const [apiKey,     setApiKey]     = useState(sessionStorage.getItem('bfl_key') || '')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [error,      setError]      = useState('')
  const [copied,     setCopied]     = useState(false)
  const [saved,      setSaved]      = useState(() => JSON.parse(localStorage.getItem('bfl_illustrations') || '[]'))

  async function generate() {
    const subject = mode === 'passage' ? passage : theme
    if (!subject.trim()) { setError('Enter a passage or theme.'); return }
    if (!apiKey)         { setError('Enter your API key.'); return }
    setError(''); setLoading(true); setResult(null)
    sessionStorage.setItem('bfl_key', apiKey)

    const typeNote = types.length > 0 ? `Preferred illustration types: ${types.join(', ')}.` : ''
    const audienceNote = { general:'Mixed congregation', youth:'Youth group (teens)', kids:'Children (ages 6-12)', mens:"Men's group", womens:"Women's group" }[audience]
    const prompt = `Generate 4 sermon illustrations for: "${subject}"\nAudience: ${audienceNote}\n${typeNote}\nMake them fresh, unexpected, and memorable.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:2500, system:SYSTEM, messages:[{ role:'user', content:prompt }] })
      })
      const data = await res.json()
      if (data.content?.[0]?.text) setResult(data.content[0].text)
      else setError(data.error?.message || 'Generation failed.')
    } catch { setError('Connection failed.') }
    setLoading(false)
  }

  function saveIllustration() {
    const entry = { id: Date.now(), subject: mode==='passage'?passage:theme, date: new Date().toLocaleDateString(), text: result }
    const newSaved = [entry, ...saved].slice(0, 20)
    setSaved(newSaved)
    localStorage.setItem('bfl_illustrations', JSON.stringify(newSaved))
  }

  function renderResult(text) {
    return text.split('\n').map((line, i) => {
      if (/^🎯/.test(line)) return <div key={i} style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1rem', fontWeight:800, color:'var(--orange)', margin:'22px 0 8px', paddingTop:i>0?16:0, borderTop:i>0?'1px solid var(--border)':'none' }}>{line}</div>
      if (/^💬/.test(line)) return <div key={i} style={{ fontSize:'.8rem', fontWeight:700, color:'var(--blue)', marginTop:10, padding:'8px 12px', background:'var(--blue-bg)', borderRadius:8 }}>{line}</div>
      if (/^📖/.test(line)) return <div key={i} style={{ fontSize:'.8rem', fontWeight:700, color:'var(--green)', marginTop:6 }}>{line}</div>
      if (/^Preacher/.test(line)) return <div key={i} style={{ fontSize:'.78rem', fontWeight:800, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:.5, marginTop:20, paddingTop:16, borderTop:'2px solid var(--border)' }}>{line}</div>
      if (!line.trim()) return <div key={i} style={{ height:6 }} />
      return <p key={i} style={{ fontSize:'.9rem', color:'var(--ink)', lineHeight:1.8, fontWeight:500, margin:'0 0 4px' }}>{line}</p>
    })
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0F0F1A,#1C0A00)', padding:'48px 36px 36px', textAlign:'center' }}>
        <div style={{ display:'inline-block', fontSize:'.7rem', fontWeight:700, background:'rgba(249,115,22,.15)', color:'#FB923C', padding:'4px 14px', borderRadius:100, marginBottom:12 }}>🎤 For Pastors, Teachers & Preachers</div>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, background:'linear-gradient(90deg,#FB923C,#FCD34D)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>Sermon Illustration Library</h1>
        <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.88rem', fontWeight:500 }}>AI generates 4 vivid, memorable illustrations for any passage or theme. Fresh every time.</p>
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'32px 20px' }}>
        <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:'28px 32px', marginBottom:20 }}>
          {/* Mode toggle */}
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            {[['passage','📖 By Passage'],['theme','✨ By Theme']].map(([id,label]) => (
              <button key={id} onClick={() => setMode(id)} style={{ flex:1, padding:11, borderRadius:12, border:`2px solid ${mode===id?'var(--orange)':'var(--border)'}`, background:mode===id?'var(--orange-bg)':'var(--surface)', color:mode===id?'var(--orange)':'var(--ink3)', fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'.86rem', cursor:'pointer', transition:'all .2s' }}>{label}</button>
            ))}
          </div>

          {mode==='passage' ? (
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:'.72rem', fontWeight:700, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:.5, display:'block', marginBottom:8 }}>Scripture Passage</label>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
                {PASSAGE_SUGGESTIONS.map(p => <button key={p} onClick={() => setPassage(p)} style={{ fontSize:'.7rem', fontWeight:700, padding:'5px 11px', borderRadius:100, border:`1.5px solid ${passage===p?'var(--orange)':'var(--border)'}`, background:passage===p?'var(--orange-bg)':'var(--surface)', color:passage===p?'var(--orange)':'var(--ink2)', cursor:'pointer' }}>{p}</button>)}
              </div>
              <input className="input-field" placeholder='Or type your own: "Luke 24:1-12", "The Prodigal Son"...' value={passage} onChange={e => setPassage(e.target.value)} />
            </div>
          ) : (
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:'.72rem', fontWeight:700, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:.5, display:'block', marginBottom:8 }}>Sermon Theme</label>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
                {THEMES.map(t => <button key={t} onClick={() => setTheme(t)} style={{ fontSize:'.7rem', fontWeight:700, padding:'5px 11px', borderRadius:100, border:`1.5px solid ${theme===t?'var(--orange)':'var(--border)'}`, background:theme===t?'var(--orange-bg)':'var(--surface)', color:theme===t?'var(--orange)':'var(--ink2)', cursor:'pointer' }}>{t}</button>)}
              </div>
              <input className="input-field" placeholder='Or type your own: "Trusting God in uncertainty"...' value={theme} onChange={e => setTheme(e.target.value)} />
            </div>
          )}

          {/* Audience */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:'.72rem', fontWeight:700, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:.5, display:'block', marginBottom:8 }}>Audience</label>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {[['general','🏛️ General'],['youth','🧑 Youth'],['kids','👶 Kids'],['mens',"👨 Men's"],['womens',"👩 Women's"]].map(([v,l]) => (
                <button key={v} onClick={() => setAudience(v)} style={{ fontSize:'.74rem', fontWeight:700, padding:'7px 14px', borderRadius:10, border:`1.5px solid ${audience===v?'var(--orange)':'var(--border)'}`, background:audience===v?'var(--orange-bg)':'var(--surface)', color:audience===v?'var(--orange)':'var(--ink3)', cursor:'pointer', transition:'all .2s' }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Illustration types */}
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:'.72rem', fontWeight:700, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:.5, display:'block', marginBottom:8 }}>Preferred Types (optional)</label>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {TYPES.map(t => <button key={t} onClick={() => setTypes(ts => ts.includes(t)?ts.filter(x=>x!==t):[...ts,t])} style={{ fontSize:'.68rem', fontWeight:700, padding:'5px 11px', borderRadius:100, border:`1.5px solid ${types.includes(t)?'var(--blue)':'var(--border)'}`, background:types.includes(t)?'var(--blue-bg)':'var(--surface)', color:types.includes(t)?'var(--blue)':'var(--ink2)', cursor:'pointer', transition:'all .2s' }}>{t}</button>)}
            </div>
          </div>

          <div style={{ display:'flex', gap:10, alignItems:'center', paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <span style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:600, whiteSpace:'nowrap' }}>🔑 API Key:</span>
            <input type="password" className="input-field" placeholder="sk-ant-api03-..." value={apiKey} onChange={e => { setApiKey(e.target.value); sessionStorage.setItem('bfl_key', e.target.value) }} style={{ flex:1, fontSize:'.78rem' }} />
            <button className="btn btn-orange" onClick={generate} disabled={loading} style={{ whiteSpace:'nowrap', flexShrink:0 }}>
              {loading ? '⏳ Writing...' : '🎤 Generate Illustrations'}
            </button>
          </div>
          {error && <div style={{ marginTop:12, background:'var(--red-bg)', color:'var(--red)', borderRadius:10, padding:'10px 14px', fontSize:'.82rem', fontWeight:600 }}>⚠️ {error}</div>}
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ fontSize:'3rem', marginBottom:10, animation:'float 2s ease-in-out infinite' }}>🎤</div>
            <p style={{ color:'var(--ink2)', fontWeight:600 }}>Crafting your illustrations...</p>
          </div>
        )}

        {result && !loading && (
          <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg,#1C0A00,#3D1500)', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1rem', fontWeight:800, color:'white' }}>
                🎤 Illustrations: {mode==='passage'?passage:theme} · {({general:'General',youth:'Youth',kids:'Kids',mens:"Men's",womens:"Women's"})[audience]}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={saveIllustration} style={{ background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.2)', color:'white', borderRadius:10, padding:'7px 14px', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:'.78rem', fontWeight:700 }}>💾 Save</button>
                <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),2000) }} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', color:'white', borderRadius:10, padding:'7px 14px', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:'.78rem', fontWeight:700 }}>{copied?'✅ Copied':'📋 Copy All'}</button>
                <button onClick={generate} style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.6)', borderRadius:10, padding:'7px 14px', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:'.78rem', fontWeight:700 }}>↺ Regenerate</button>
              </div>
            </div>
            <div style={{ padding:'28px 36px' }}>{renderResult(result)}</div>
          </div>
        )}

        {/* Saved library */}
        {saved.length > 0 && (
          <div style={{ marginTop:24 }}>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1rem', fontWeight:800, color:'var(--ink)', marginBottom:12 }}>💾 Saved Illustrations ({saved.length})</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {saved.map(s => (
                <div key={s.id} style={{ background:'var(--surface)', borderRadius:14, border:'1.5px solid var(--border)', padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div>
                    <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:700, color:'var(--ink)', fontSize:'.9rem' }}>{s.subject}</div>
                    <div style={{ fontSize:'.7rem', color:'var(--ink3)' }}>{s.date}</div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => setResult(s.text)} className="btn btn-outline btn-sm">View</button>
                    <button onClick={() => { setSaved(sv => { const n=sv.filter(x=>x.id!==s.id); localStorage.setItem('bfl_illustrations',JSON.stringify(n)); return n }) }} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:'.78rem', fontWeight:700 }}>✕</button>
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
