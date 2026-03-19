import { useState } from 'react'

const STORIES = ['Noah and the Ark','David and Goliath','The Birth of Jesus','Jonah and the Whale','The Good Samaritan','Daniel in the Lions Den','Moses and the Red Sea','The Prodigal Son','Joseph and his Brothers','Jesus Feeds 5000','The Creation Story','Zacchaeus in the Tree','The Fiery Furnace','Queen Esther','The Christmas Story','Palm Sunday','Easter Sunday']
const AGES   = [{ value:'4', label:'Ages 3–5', desc:'Very simple. Short sentences. Basic words.' }, { value:'7', label:'Ages 6–8', desc:'Simple story. Fun details. One big lesson.' }, { value:'10', label:'Ages 9–12', desc:'Richer story. Character depth. Application.' }]

const SYSTEM = `You are a master children's Bible storyteller. You write stories that are age-appropriate, engaging, and scripturally faithful.

When given a Bible story and age, follow this exact format:

📖 [Story Title]
For Ages [Age]

[Tell the story in vivid, age-appropriate language. Use short paragraphs. Be specific with details that bring it to life. Make it feel like an adventure. Use dialogue where appropriate. 3-4 paragraphs.]

🌟 What This Means for You
[2-3 sentences connecting the story to the child's everyday life. Very concrete. "Just like [character], you can..."]

🙏 Let's Pray Together
[A simple 3-4 sentence prayer the child can pray right now. Simple words. Conversational with God.]

❓ Think About It
1. [Simple question a child can answer]
2. [Question about the main character's choice]
3. [Application question: "What would you do if..."]

🎯 Fun Fact
[One surprising, true detail about the story — archaeological, historical, or cultural context that kids find cool]

Keep the entire response warm, exciting, and wonder-filled. Bible stories are adventures — tell them that way.`

export default function KidsBibleStories() {
  const [story,   setStory]   = useState('')
  const [age,     setAge]     = useState('7')
  const [apiKey,  setApiKey]  = useState(sessionStorage.getItem('bfl_key') || '')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')
  const [reading, setReading] = useState(false)

  async function generate() {
    if (!story.trim()) { setError('Choose a story first.'); return }
    if (!apiKey)       { setError('Enter your API key.'); return }
    setError(''); setLoading(true); setResult(null)
    sessionStorage.setItem('bfl_key', apiKey)
    const ageLabel = AGES.find(a => a.value === age)?.label || 'Ages 6-8'

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1500, system:SYSTEM, messages:[{ role:'user', content:`Story: "${story}"\nAge Group: ${ageLabel}\nMake it wonderful.` }] })
      })
      const data = await res.json()
      if (data.content?.[0]?.text) setResult(data.content[0].text)
      else setError(data.error?.message || 'Generation failed.')
    } catch { setError('Connection failed.') }
    setLoading(false)
  }

  function readAloud() {
    if (!result) return
    if (reading) { window.speechSynthesis.cancel(); setReading(false); return }
    const utterance = new SpeechSynthesisUtterance(result.replace(/[📖🌟🙏❓🎯]/g, ''))
    utterance.rate  = 0.88
    utterance.pitch = 1.05
    // Pick a friendly voice
    const voices = window.speechSynthesis.getVoices()
    const friendly = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Moira')) || voices[0]
    if (friendly) utterance.voice = friendly
    utterance.onend = () => setReading(false)
    window.speechSynthesis.speak(utterance)
    setReading(true)
  }

  function renderResult(text) {
    return text.split('\n').map((line, i) => {
      if (/^📖/.test(line))   return <div key={i} style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.5rem', fontWeight:800, color:'var(--ink)', marginBottom:4 }}>{line}</div>
      if (/^For Ages/.test(line)) return <div key={i} style={{ fontSize:'.76rem', fontWeight:700, color:'var(--green)', marginBottom:20, textTransform:'uppercase', letterSpacing:.5 }}>{line}</div>
      if (/^🌟|^🙏|^❓|^🎯/.test(line)) return <div key={i} style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.1rem', fontWeight:800, color:'var(--orange)', margin:'22px 0 8px', paddingTop:16, borderTop:'1px solid var(--border)' }}>{line}</div>
      if (/^\d\./.test(line.trim())) return <div key={i} style={{ fontSize:'.9rem', color:'var(--ink2)', fontWeight:500, lineHeight:1.7, paddingLeft:14, marginBottom:6 }}>{line}</div>
      if (!line.trim()) return <div key={i} style={{ height:8 }} />
      return <p key={i} style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.85, fontWeight:500, margin:'0 0 4px' }}>{line}</p>
    })
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0A1A14,#064E3B,#0F0A2E)', padding:'48px 36px 36px', textAlign:'center' }}>
        <div style={{ fontSize:'4rem', marginBottom:12 }}>👶</div>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, background:'linear-gradient(90deg,#6EE7B7,#FCD34D,#F9A8D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>Kids Bible Stories</h1>
        <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.88rem', fontWeight:500 }}>AI retells any Bible story for any age. Bedtime-ready. Pray together at the end.</p>
      </div>

      <div style={{ maxWidth:780, margin:'0 auto', padding:'32px 20px' }}>
        <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:'28px 32px', marginBottom:20 }}>
          {/* Age selector */}
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:'.72rem', fontWeight:700, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:.5, display:'block', marginBottom:10 }}>👶 Child's Age</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {AGES.map(a => (
                <div key={a.value} onClick={() => setAge(a.value)} style={{ padding:'14px', borderRadius:14, border:`2px solid ${age===a.value?'var(--green)':'var(--border)'}`, background:age===a.value?'var(--green-bg)':'var(--surface)', cursor:'pointer', transition:'all .2s', textAlign:'center' }}>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:age===a.value?'var(--green)':'var(--ink)', fontSize:'1rem', marginBottom:3 }}>{a.label}</div>
                  <div style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:500 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Story picker */}
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:'.72rem', fontWeight:700, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:.5, display:'block', marginBottom:10 }}>📖 Choose a Story</label>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
              {STORIES.map(s => <button key={s} onClick={() => setStory(s)} style={{ fontSize:'.7rem', fontWeight:700, padding:'6px 12px', borderRadius:100, border:`1.5px solid ${story===s?'var(--green)':'var(--border)'}`, background:story===s?'var(--green-bg)':'var(--surface)', color:story===s?'var(--green)':'var(--ink2)', cursor:'pointer', transition:'all .15s' }}>{s}</button>)}
            </div>
            <input className="input-field" placeholder='Or type any Bible story: "Ruth and Boaz", "The Tower of Babel"...' value={story} onChange={e => setStory(e.target.value)} />
          </div>

          <div style={{ display:'flex', gap:10, alignItems:'center', paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <span style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:600, whiteSpace:'nowrap' }}>🔑 API Key:</span>
            <input type="password" className="input-field" placeholder="sk-ant-api03-..." value={apiKey} onChange={e => { setApiKey(e.target.value); sessionStorage.setItem('bfl_key', e.target.value) }} style={{ flex:1, fontSize:'.78rem' }} />
            <button className="btn btn-green" onClick={generate} disabled={loading||!story.trim()} style={{ whiteSpace:'nowrap', flexShrink:0 }}>
              {loading ? '⏳ Telling...' : '📖 Tell the Story'}
            </button>
          </div>
          {error && <div style={{ marginTop:12, background:'var(--red-bg)', color:'var(--red)', borderRadius:10, padding:'10px 14px', fontSize:'.82rem', fontWeight:600 }}>⚠️ {error}</div>}
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <div style={{ fontSize:'4rem', animation:'bounce 1s ease-in-out infinite' }}>📖</div>
            <p style={{ color:'var(--ink2)', fontWeight:600, marginTop:12 }}>Once upon a time in a land far away...</p>
          </div>
        )}

        {result && !loading && (
          <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--green)', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg,#064E3B,#0F9D58)', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1rem', fontWeight:800, color:'white' }}>{story} · {AGES.find(a=>a.value===age)?.label}</div>
              <div style={{ display:'flex', gap:8 }}>
                {'speechSynthesis' in window && (
                  <button onClick={readAloud} style={{ background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.2)', color:'white', borderRadius:10, padding:'7px 14px', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:'.78rem', fontWeight:700 }}>
                    {reading ? '⏹ Stop Reading' : '🔊 Read Aloud'}
                  </button>
                )}
                <button onClick={() => { navigator.clipboard.writeText(result) }} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', color:'white', borderRadius:10, padding:'7px 14px', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:'.78rem', fontWeight:700 }}>📋 Copy</button>
                <button onClick={generate} style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)', borderRadius:10, padding:'7px 14px', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:'.78rem', fontWeight:700 }}>↺ New Version</button>
              </div>
            </div>
            <div style={{ padding:'28px 36px', lineHeight:1.8 }}>{renderResult(result)}</div>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}`}</style>
    </div>
  )
}
