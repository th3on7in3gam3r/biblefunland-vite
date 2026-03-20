import { useState, useEffect } from 'react'

const FAST_TYPES = ['Full Fast (water only)','Partial Fast (Daniel Fast)','Intermittent Fast','Media Fast','Sunrise to Sunset','3-Day Fast','7-Day Daniel Fast','Custom']
const MILESTONE_HOURS = [1,3,6,12,18,24,36,48,72]

function getLocal(k,f){ try{return JSON.parse(localStorage.getItem(k)??'null')??f}catch{return f} }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2) }

const ENCOURAGEMENTS = [
  [1,  'You\'ve started. The hardest step is the first one. "Draw near to God and He will draw near to you." — James 4:8'],
  [3,  'Three hours in. Your body is beginning to shift. Your spirit is being strengthened. Keep going.'],
  [6,  '"Is not this the kind of fasting I have chosen: to loose the chains of injustice?" — Isaiah 58:6. Six hours of chains loosening.'],
  [12, 'Halfway through your first full day. This is where the hunger becomes prayer. Every pang is a reminder.'],
  [18, '"In the morning, Lord, you hear my voice." — Psalm 5:3. You are 18 hours into seeking His face.'],
  [24, 'One full day. Jesus fasted 40. You have proven something to your spirit today. It obeys when you lead it.'],
  [36, 'Thirty-six hours. The physical is giving way to the spiritual. Many report breakthrough at this hour.'],
  [48, '"After fasting forty days and forty nights, he was hungry." — Matthew 4:2. Two days in, you understand this passage differently.'],
  [72, 'Three days. Daniel\'s prayer was answered on day three. Your answer may be forming right now.'],
]

export default function FastingTracker() {
  const [fasts,      setFasts]      = useState(()=>getLocal('bfl_fasts',[]))
  const [active,     setActive]     = useState(()=>getLocal('bfl_active_fast',null))
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState({type:'Full Fast (water only)',purpose:'',prayer:'',goal:24})
  const [now,        setNow]        = useState(Date.now())
  const [reflection, setReflection] = useState('')
  const [showEnd,    setShowEnd]    = useState(false)

  useEffect(()=>{ const t=setInterval(()=>setNow(Date.now()),30000); return ()=>clearInterval(t) },[])

  const elapsedMs   = active ? now - active.startTime : 0
  const elapsedHrs  = elapsedMs / 3600000
  const progressPct = active ? Math.min(100, (elapsedHrs / active.goal) * 100) : 0
  const nextMilestone = MILESTONE_HOURS.find(h => h > elapsedHrs) || null
  const encouragement = [...ENCOURAGEMENTS].reverse().find(([h])=>elapsedHrs>=h)

  function startFast() {
    const fast = { id:uid(), ...form, startTime:Date.now(), goal:parseInt(form.goal) }
    setActive(fast); localStorage.setItem('bfl_active_fast', JSON.stringify(fast))
    setShowForm(false)
  }

  function endFast() {
    const completed = { ...active, endTime:Date.now(), reflection, elapsedHrs:parseFloat(elapsedHrs.toFixed(1)) }
    const newFasts = [completed, ...fasts]
    setFasts(newFasts); localStorage.setItem('bfl_fasts', JSON.stringify(newFasts))
    setActive(null); localStorage.removeItem('bfl_active_fast')
    setReflection(''); setShowEnd(false)
  }

  function fmt(ms) {
    const h = Math.floor(ms/3600000), m = Math.floor((ms%3600000)/60000)
    return `${h}h ${m}m`
  }

  return (
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#0F0F1A,#0A1A14,#1A0A00)',padding:'48px 36px 36px',textAlign:'center'}}>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,background:'linear-gradient(90deg,#FCD34D,#6EE7B7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:8}}>🌿 Fasting Tracker</h1>
        <p style={{color:'rgba(255,255,255,.45)',fontSize:'.88rem',fontWeight:500}}>Log your fast, track your hours, receive scripture at every milestone, end with reflection.</p>
        {fasts.length>0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'.76rem',fontWeight:600,marginTop:10}}>{fasts.length} completed fast{fasts.length!==1?'s':''} · {fasts.reduce((n,f)=>n+(f.elapsedHrs||0),0).toFixed(0)} total hours</div>}
      </div>

      <div style={{maxWidth:720,margin:'0 auto',padding:'28px 20px'}}>

        {/* Active fast */}
        {active ? (
          <div style={{marginBottom:20}}>
            <div style={{background:'linear-gradient(135deg,rgba(16,185,129,.12),rgba(6,78,59,.06))',borderRadius:24,border:'1.5px solid rgba(16,185,129,.25)',padding:'28px 28px',marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div>
                  <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--ink)',fontSize:'1.1rem',marginBottom:4}}>{active.type}</div>
                  <div style={{fontSize:'.76rem',color:'var(--ink3)',fontWeight:500}}>Started {new Date(active.startTime).toLocaleString()}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--green-bg)',border:'1px solid rgba(16,185,129,.2)',borderRadius:100,padding:'6px 14px'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:'var(--green)',animation:'pulse 1.5s ease-in-out infinite'}} />
                  <span style={{fontSize:'.76rem',fontWeight:800,color:'var(--green)'}}>Active Fast</span>
                </div>
              </div>

              {/* Big timer */}
              <div style={{textAlign:'center',marginBottom:20}}>
                <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'3.5rem',fontWeight:800,color:'var(--green)',lineHeight:1}}>{fmt(elapsedMs)}</div>
                <div style={{fontSize:'.76rem',color:'var(--ink3)',fontWeight:600,marginTop:4}}>of {active.goal}h goal</div>
              </div>

              {/* Progress ring / bar */}
              <div style={{height:12,borderRadius:100,background:'var(--bg3)',overflow:'hidden',marginBottom:20}}>
                <div style={{height:'100%',borderRadius:100,background:'linear-gradient(90deg,#059669,#34D399)',width:`${progressPct}%`,transition:'width .5s',boxShadow:'0 0 10px rgba(16,185,129,.3)'}} />
              </div>

              {/* Encouragement */}
              {encouragement && (
                <div style={{borderLeft:'3px solid var(--green)',paddingLeft:14,marginBottom:20}}>
                  <div style={{fontSize:'.7rem',fontWeight:800,color:'var(--green)',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>🌿 At {encouragement[0]}h</div>
                  <p style={{fontSize:'.86rem',color:'var(--ink2)',fontStyle:'italic',fontWeight:500,lineHeight:1.7,margin:0}}>{encouragement[1]}</p>
                </div>
              )}

              {/* Prayer focus */}
              {active.prayer && (
                <div style={{background:'var(--bg2)',borderRadius:12,padding:'12px 14px',marginBottom:16}}>
                  <div style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>🙏 Prayer Focus</div>
                  <p style={{fontSize:'.86rem',color:'var(--ink2)',fontWeight:500,margin:0}}>{active.prayer}</p>
                </div>
              )}

              {/* Next milestone */}
              {nextMilestone && (
                <div style={{fontSize:'.76rem',color:'var(--ink3)',fontWeight:500,textAlign:'center',marginBottom:20}}>
                  Next milestone: <strong style={{color:'var(--green)'}}>{nextMilestone}h</strong> — {((nextMilestone-elapsedHrs)*60).toFixed(0)}min away
                </div>
              )}

              <button onClick={()=>setShowEnd(true)} style={{width:'100%',padding:14,borderRadius:14,border:'1.5px solid rgba(239,68,68,.3)',background:'var(--red-bg)',color:'var(--red)',fontFamily:'Poppins,sans-serif',fontWeight:700,fontSize:'.86rem',cursor:'pointer',transition:'all .2s'}}>
                🏁 End Fast &amp; Reflect
              </button>
            </div>

            {/* End reflection modal */}
            {showEnd && (
              <div style={{background:'var(--surface)',borderRadius:20,border:'1.5px solid var(--border)',padding:24,animation:'popIn .3s ease'}}>
                <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--ink)',fontSize:'1.1rem',marginBottom:14}}>🏁 Complete Your Fast</div>
                <div style={{background:'var(--green-bg)',borderRadius:12,padding:'12px 14px',marginBottom:16,textAlign:'center'}}>
                  <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--green)',fontSize:'1.3rem'}}>{fmt(elapsedMs)}</div>
                  <div style={{fontSize:'.72rem',color:'var(--green)',fontWeight:600}}>completed</div>
                </div>
                <label style={{fontSize:'.7rem',fontWeight:700,color:'var(--ink3)',display:'block',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>How did God meet you during this fast?</label>
                <textarea className="textarea-field" placeholder="Write your reflection... What did you sense? What scripture stood out? What changed?" value={reflection} onChange={e=>setReflection(e.target.value)} style={{height:100,marginBottom:14}} />
                <div style={{display:'flex',gap:10}}>
                  <button className="btn btn-green" onClick={endFast}>✅ Complete Fast</button>
                  <button className="btn btn-outline" onClick={()=>setShowEnd(false)}>Continue Fasting</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          !showForm && (
            <div style={{textAlign:'center',paddingBottom:20}}>
              <div style={{fontSize:'4rem',marginBottom:16,opacity:.6}}>🌿</div>
              <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--ink)',fontSize:'1.2rem',marginBottom:8}}>Start a Fast</div>
              <p style={{fontSize:'.86rem',color:'var(--ink3)',fontWeight:500,maxWidth:400,margin:'0 auto 20px'}}>Log your purpose, set your goal, and receive scripture encouragement at every milestone.</p>
              <button className="btn btn-green btn-lg" onClick={()=>setShowForm(true)}>🌿 Begin a Fast</button>
            </div>
          )
        )}

        {/* Start form */}
        {showForm && !active && (
          <div style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid var(--green)',padding:28,marginBottom:20}}>
            <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--ink)',fontSize:'1.1rem',marginBottom:18}}>🌿 Start Your Fast</div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:'.7rem',fontWeight:700,color:'var(--ink3)',display:'block',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Type of Fast</label>
              <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                {FAST_TYPES.map(t=><button key={t} onClick={()=>setForm(f=>({...f,type:t}))} style={{fontSize:'.7rem',fontWeight:700,padding:'6px 12px',borderRadius:100,cursor:'pointer',border:`1.5px solid ${form.type===t?'var(--green)':'var(--border)'}`,background:form.type===t?'var(--green-bg)':'var(--surface)',color:form.type===t?'var(--green)':'var(--ink2)',transition:'all .2s'}}>{t}</button>)}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 120px',gap:10,marginBottom:12}}>
              <div>
                <label style={{fontSize:'.7rem',fontWeight:700,color:'var(--ink3)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Purpose / Intention</label>
                <input className="input-field" placeholder="Why are you fasting? What are you seeking God for?" value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))} />
              </div>
              <div>
                <label style={{fontSize:'.7rem',fontWeight:700,color:'var(--ink3)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Goal (hours)</label>
                <input className="input-field" type="number" min={1} max={240} value={form.goal} onChange={e=>setForm(f=>({...f,goal:e.target.value}))} />
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:'.7rem',fontWeight:700,color:'var(--ink3)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Prayer Focus (optional)</label>
              <textarea className="textarea-field" placeholder="What specific prayer are you bringing to God during this fast?" value={form.prayer} onChange={e=>setForm(f=>({...f,prayer:e.target.value}))} style={{height:70}} />
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-green" onClick={startFast} disabled={!form.purpose.trim()}>🌿 Begin Fast</button>
              <button className="btn btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Past fasts */}
        {fasts.length>0&&(
          <div style={{marginTop:24}}>
            <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--ink)',marginBottom:14,fontSize:'1rem'}}>📜 Past Fasts ({fasts.length})</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {fasts.map(f=>(
                <div key={f.id} style={{background:'var(--surface)',borderRadius:16,border:'1.5px solid var(--border)',padding:'16px 18px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:8}}>
                    <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,color:'var(--ink)',fontSize:'.9rem'}}>{f.type}</div>
                    <div style={{fontSize:'.72rem',fontWeight:700,color:'var(--green)'}}>{f.elapsedHrs}h completed</div>
                  </div>
                  <div style={{fontSize:'.78rem',color:'var(--ink3)',fontWeight:500,marginBottom:f.reflection?8:0}}>{f.purpose}</div>
                  {f.reflection&&<div style={{fontSize:'.82rem',color:'var(--ink2)',fontStyle:'italic',borderLeft:'2px solid var(--green)',paddingLeft:10}}>{f.reflection}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.4)}}@keyframes popIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
