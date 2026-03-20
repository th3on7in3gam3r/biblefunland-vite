import { useState } from 'react'
import { generateAIContent } from '../lib/ai'

const TOPICS = ['Communication','Forgiveness','Intimacy & Closeness','Financial Stewardship','Parenting Together','Praying Together','Weathering Hard Seasons','Love Languages','Building Trust','Serving Each Other','Spiritual Leadership','Family Vision']

const SYSTEM = `You are a gifted Christian marriage counselor and devotional writer. Create a couples devotional that both partners can do together.

Output in this EXACT format:

💑 COUPLES DEVOTIONAL
Topic: [Topic]

📖 TODAY'S PASSAGE
[Scripture reference + full text]

🌅 OPENING REFLECTION (read together aloud)
[3-4 sentences. Warm, honest. Something that acknowledges the real challenges of marriage alongside the beauty. Not syrupy.]

🔍 FOR HIM — Read this privately first (2 min)
[A question or reflection specifically from the husband/male perspective. Honest, not preachy. Gets him thinking before the conversation.]

🌸 FOR HER — Read this privately first (2 min)
[A question or reflection from the wife/female perspective. Different angle than his. Equally honest.]

💬 TALK TOGETHER (15 minutes)
1. [Discussion question 1 — start easy, observational]
2. [Discussion question 2 — personal application]
3. [Discussion question 3 — "what would our relationship look like if we fully applied this?"]

⚡ ONE THING THIS WEEK
[A specific, concrete action both partners commit to doing THIS WEEK. Not vague. Measurable. Fun when possible.]

🙏 PRAY TOGETHER
[A brief prayer written for them to read aloud together. Uses "we" throughout. Covers both their hearts.]

✝️ MEMORY VERSE FOR THIS WEEK
[One short, memorable verse from the passage or related to the topic]

💡 MARRIAGE WISDOM
[One profound, non-clichéd sentence about marriage that they'll want to write down]

Write with warmth, theological depth, and emotional intelligence. Be honest about marriage being hard work. Do not be preachy. Speak to real couples with real challenges.`

export default function CouplesDevotional() {
  const [topic,   setTopic]   = useState('')
  const [custom,  setCustom]  = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')
  const [reading, setReading] = useState(false)

  async function generate(t) {
    const subject = t || custom || topic
    if (!subject.trim()) { setError('Choose or type a topic first.'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const text = await generateAIContent({
        system: SYSTEM,
        messages: [{role:'user',content:`Create a couples devotional on: "${subject}"`}],
        max_tokens: 2000
      })
      if (text) setResult(text)
      else setError('Generation failed. Please try again.')
    } catch (err) { setError(err.message || 'Connection failed.') }
    setLoading(false)
  }

  function readAloud() {
    if (!result) return
    if (reading) { window.speechSynthesis.cancel(); setReading(false); return }
    const u = new SpeechSynthesisUtterance(result.replace(/[💑📖🌅🔍🌸💬⚡🙏✝️💡]/g,''))
    u.rate=.88; u.onend=()=>setReading(false)
    window.speechSynthesis.speak(u); setReading(true)
  }

  function renderResult(text) {
    return text.split('\n').map((line,i)=>{
      if (/^💑/.test(line))   return <div key={i} style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.4rem',fontWeight:800,color:'var(--ink)',marginBottom:4}}>{line}</div>
      if (/^Topic:/.test(line)) return <div key={i} style={{fontSize:'.76rem',fontWeight:700,color:'var(--pink)',textTransform:'uppercase',letterSpacing:.5,marginBottom:20}}>{line}</div>
      if (/^📖|^🌅|^🔍|^🌸|^💬|^⚡|^🙏|^✝️|^💡/.test(line)) return <div key={i} style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.05rem',fontWeight:800,color:getLineColor(line),margin:'22px 0 10px',paddingTop:16,borderTop:'1px solid var(--border)'}}>{line}</div>
      if (/^\d\./.test(line.trim())) return <div key={i} style={{fontSize:'.9rem',color:'var(--ink2)',fontWeight:500,lineHeight:1.75,paddingLeft:14,marginBottom:6}}>{line}</div>
      if (!line.trim()) return <div key={i} style={{height:8}} />
      return <p key={i} style={{fontSize:'.9rem',color:'var(--ink)',lineHeight:1.85,fontWeight:500,margin:'0 0 4px'}}>{line}</p>
    })
  }

  function getLineColor(line) {
    if (/^🔍/.test(line)) return 'var(--blue)'
    if (/^🌸/.test(line)) return 'var(--pink)'
    if (/^💬/.test(line)) return 'var(--violet)'
    if (/^⚡/.test(line)) return 'var(--orange)'
    if (/^🙏/.test(line)) return 'var(--green)'
    if (/^💡/.test(line)) return 'var(--yellow)'
    return 'var(--ink)'
  }

  return (
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#1A0010,#0F0F1A,#1A0010)',padding:'48px 36px 36px',textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:12}}>💑</div>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,background:'linear-gradient(90deg,#F9A8D4,#FCD34D,#F9A8D4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:8}}>Couple's Devotional</h1>
        <p style={{color:'rgba(255,255,255,.45)',fontSize:'.88rem',fontWeight:500,maxWidth:500,margin:'0 auto'}}>A devotional built for two. His reflection. Her reflection. A conversation. A prayer. Together.</p>
      </div>

      <div style={{maxWidth:760,margin:'0 auto',padding:'32px 20px'}}>
        <div style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid var(--border)',padding:'28px 32px',marginBottom:20,boxShadow:'var(--sh)'}}>
          <label style={{fontSize:'.7rem',fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:12}}>Choose a Topic</label>
          <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:14}}>
            {TOPICS.map(t=><button key={t} onClick={()=>{setTopic(t);setCustom('');generate(t)}} style={{fontSize:'.72rem',fontWeight:700,padding:'7px 13px',borderRadius:100,border:`1.5px solid ${topic===t?'var(--pink)':'var(--border)'}`,background:topic===t?'var(--pink-bg)':'var(--surface)',color:topic===t?'var(--pink)':'var(--ink2)',cursor:'pointer',transition:'all .2s'}}>{t}</button>)}
          </div>
          <div style={{display:'flex',gap:10}}>
            <input className="input-field" placeholder='Or type your own: "Dealing with in-laws", "When we disagree about money"...' value={custom} onChange={e=>{setCustom(e.target.value);setTopic('')}} onKeyDown={e=>e.key==='Enter'&&generate()} />
            <button className="btn btn-outline btn-sm" onClick={()=>generate()} disabled={!custom.trim()||loading} style={{whiteSpace:'nowrap'}}>Go →</button>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center',marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
            <span style={{fontSize:'.7rem',color:'var(--ink3)',fontWeight:600}}>✨ Powered by secure AI proxy. Premium generation active.</span>
          </div>
          {error&&<div style={{marginTop:12,background:'var(--red-bg)',color:'var(--red)',borderRadius:10,padding:'10px 14px',fontSize:'.82rem',fontWeight:600}}>⚠️ {error}</div>}
        </div>

        {loading&&<div style={{textAlign:'center',padding:'48px 0'}}><div style={{fontSize:'3rem',marginBottom:10,animation:'heartBeat 1s ease-in-out infinite'}}>💑</div><p style={{color:'var(--ink2)',fontWeight:600}}>Writing your devotional for two...</p></div>}

        {result&&!loading&&(
          <div style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid rgba(236,72,153,.2)',overflow:'hidden'}}>
            <div style={{background:'linear-gradient(135deg,#1A0010,#2D0020)',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'.95rem',fontWeight:800,color:'white'}}>💑 {topic||custom} Devotional</div>
              <div style={{display:'flex',gap:8}}>
                {'speechSynthesis' in window&&<button onClick={readAloud} style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',color:'white',borderRadius:10,padding:'7px 13px',cursor:'pointer',fontFamily:'Poppins,sans-serif',fontSize:'.76rem',fontWeight:700}}>{reading?'⏹ Stop':'🔊 Read Aloud'}</button>}
                <button onClick={()=>navigator.clipboard.writeText(result)} style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',color:'white',borderRadius:10,padding:'7px 13px',cursor:'pointer',fontFamily:'Poppins,sans-serif',fontSize:'.76rem',fontWeight:700}}>📋 Copy</button>
                <button onClick={()=>generate(topic||custom)} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.6)',borderRadius:10,padding:'7px 13px',cursor:'pointer',fontFamily:'Poppins,sans-serif',fontSize:'.76rem',fontWeight:700}}>↺ New</button>
              </div>
            </div>
            <div style={{padding:'28px 36px'}}>{renderResult(result)}</div>
          </div>
        )}
      </div>
      <style>{`@keyframes heartBeat{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>
    </div>
  )
}
