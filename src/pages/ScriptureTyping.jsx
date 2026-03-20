import { useState, useEffect, useRef, useCallback } from 'react'
import { useBadges } from '../context/BadgeContext'

const VERSES = [
  { ref:'John 3:16',   text:'For God so loved the world that he gave his one and only Son that whoever believes in him shall not perish but have eternal life' },
  { ref:'Phil 4:13',  text:'I can do all this through him who gives me strength' },
  { ref:'Jer 29:11',  text:'For I know the plans I have for you declares the Lord plans to prosper you and not to harm you plans to give you hope and a future' },
  { ref:'Josh 1:9',   text:'Be strong and courageous Do not be afraid do not be discouraged for the Lord your God will be with you wherever you go' },
  { ref:'Rom 8:28',   text:'And we know that in all things God works for the good of those who love him who have been called according to his purpose' },
  { ref:'Ps 23:1-3',  text:'The Lord is my shepherd I lack nothing He makes me lie down in green pastures he leads me beside quiet waters he refreshes my soul' },
  { ref:'Isa 40:31',  text:'But those who hope in the Lord will renew their strength they will soar on wings like eagles they will run and not grow weary they will walk and not be faint' },
  { ref:'Prov 3:5-6', text:'Trust in the Lord with all your heart and lean not on your own understanding in all your ways submit to him and he will make your paths straight' },
  { ref:'Eph 2:8-9',  text:'For it is by grace you have been saved through faith and this is not from yourselves it is the gift of God not by works so that no one can boast' },
  { ref:'Matt 5:9',   text:'Blessed are the peacemakers for they will be called children of God' },
  { ref:'1 Pet 5:7',  text:'Cast all your anxiety on him because he cares for you' },
  { ref:'Heb 11:1',   text:'Now faith is confidence in what we hope for and assurance about what we do not see' },
  { ref:'Gal 5:22-23',text:'But the fruit of the Spirit is love joy peace forbearance kindness goodness faithfulness gentleness and self-control' },
  { ref:'Matt 11:28', text:'Come to me all you who are weary and burdened and I will give you rest' },
  { ref:'Rev 21:4',   text:'He will wipe every tear from their eyes There will be no more death or mourning or crying or pain for the old order of things has passed away' },
]

function getWPM(chars, ms) { return Math.round((chars / 5) / (ms / 60000)) }
function getAccuracy(typed, target) {
  if (!typed.length) return 100
  let correct = 0
  const min = Math.min(typed.length, target.length)
  for (let i = 0; i < min; i++) if (typed[i] === target[i]) correct++
  return Math.round((correct / target.length) * 100)
}

export default function ScriptureTyping() {
  const [verseIdx,  setVerseIdx]  = useState(() => Math.floor(Math.random() * VERSES.length))
  const [typed,     setTyped]     = useState('')
  const [phase,     setPhase]     = useState('idle') // idle | typing | done
  const [startTime, setStartTime] = useState(null)
  const [elapsed,   setElapsed]   = useState(0)
  const [wpm,       setWpm]       = useState(0)
  const [accuracy,  setAccuracy]  = useState(100)
  const [bestWpm,   setBestWpm]   = useState(() => parseInt(localStorage.getItem('bfl_typing_best')||'0'))
  const [streak,    setStreak]    = useState(0)
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const { awardBadge } = useBadges()
  const verse = VERSES[verseIdx]

  useEffect(() => {
    if (phase==='typing') {
      timerRef.current = setInterval(() => setElapsed(Date.now()-startTime), 100)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [phase, startTime])

  const handleInput = useCallback((e) => {
    const val = e.target.value
    if (phase==='idle' && val.length===1) { setPhase('typing'); setStartTime(Date.now()) }
    setTyped(val)
    const acc = getAccuracy(val, verse.text)
    setAccuracy(acc)
    const ms = Date.now() - (startTime||Date.now())
    if (val.length>5) setWpm(getWPM(val.length, ms))

    if (val === verse.text) {
      const finalMs   = Date.now() - startTime
      const finalWpm  = getWPM(val.length, finalMs)
      const finalAcc  = getAccuracy(val, verse.text)
      setWpm(finalWpm); setAccuracy(finalAcc); setPhase('done')
      const newStreak = streak + 1
      setStreak(newStreak)
      if (finalWpm > bestWpm) { setBestWpm(finalWpm); localStorage.setItem('bfl_typing_best', finalWpm) }
      if (finalAcc >= 95) awardBadge('flashcard_all')
    }
  }, [phase, verse.text, startTime, streak, bestWpm, awardBadge])

  function nextVerse() {
    setVerseIdx(i => (i+1) % VERSES.length)
    setTyped(''); setPhase('idle'); setElapsed(0); setWpm(0); setAccuracy(100)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function restart() {
    setTyped(''); setPhase('idle'); setElapsed(0); setWpm(0); setAccuracy(100)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Render character-by-character with color feedback
  const chars = verse.text.split('')
  const renderedText = chars.map((ch, i) => {
    let color = 'rgba(255,255,255,.25)'
    let bg    = 'transparent'
    if (i < typed.length) {
      color = typed[i]===ch ? '#34D399' : '#EF4444'
      bg    = typed[i]===ch ? 'rgba(52,211,153,.08)' : 'rgba(239,68,68,.1)'
    }
    const isCursor = i===typed.length
    return (
      <span key={i} style={{ color, background:bg, borderBottom:isCursor?'2px solid #60A5FA':'none', transition:'color .08s', fontFamily:'Georgia,serif', fontSize:'clamp(1rem,2.5vw,1.3rem)', lineHeight:1.9, letterSpacing:'.3px' }}>
        {ch}
      </span>
    )
  })

  const progressPct = Math.round((typed.length / verse.text.length) * 100)

  return (
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#0F0F1A,#0A1A14)',padding:'48px 36px 36px',textAlign:'center'}}>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,background:'linear-gradient(90deg,#34D399,#60A5FA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:8}}>⌨️ Scripture Typing</h1>
        <p style={{color:'rgba(255,255,255,.45)',fontSize:'.88rem',fontWeight:500}}>Type the verse exactly as shown. Speed and accuracy tracked. The best way to memorize.</p>
        <div style={{display:'flex',gap:16,justifyContent:'center',marginTop:16}}>
          {[['⚡',wpm,'WPM'],['🎯',accuracy+'%','Accuracy'],['🏆',bestWpm,'Best WPM'],['🔥',streak,'Verses']].map(([e,v,l])=>(
            <div key={l} style={{textAlign:'center'}}><div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'white',fontSize:'1.1rem'}}>{e} {v}</div><div style={{fontSize:'.6rem',color:'rgba(255,255,255,.3)',fontWeight:600,textTransform:'uppercase'}}>{l}</div></div>
          ))}
        </div>
      </div>

      <div style={{maxWidth:820,margin:'0 auto',padding:'28px 20px'}}>
        {/* Verse selector */}
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          {VERSES.map((v,i)=>(
            <button key={i} onClick={()=>{setVerseIdx(i);restart()}} style={{fontSize:'.68rem',fontWeight:700,padding:'5px 10px',borderRadius:100,cursor:'pointer',border:`1.5px solid ${verseIdx===i?'var(--green)':'var(--border)'}`,background:verseIdx===i?'var(--green-bg)':'var(--surface)',color:verseIdx===i?'var(--green)':'var(--ink3)',transition:'all .2s'}}>{v.ref}</button>
          ))}
        </div>

        {/* Main typing area */}
        <div style={{background:'#0B1525',borderRadius:24,border:'1.5px solid rgba(255,255,255,.08)',padding:'32px 36px',marginBottom:16,boxShadow:'0 20px 60px rgba(0,0,0,.3)',position:'relative'}}>
          {/* Reference */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'rgba(255,255,255,.5)',fontSize:'.9rem'}}>{verse.ref}</div>
            <div style={{display:'flex',gap:8}}>
              <div style={{fontSize:'.72rem',fontWeight:700,color:accuracy>=95?'#34D399':accuracy>=80?'#F59E0B':'#EF4444'}}>🎯 {accuracy}%</div>
              <div style={{fontSize:'.72rem',fontWeight:700,color:'rgba(255,255,255,.4)'}}>{Math.round(elapsed/1000)}s</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{height:3,borderRadius:100,background:'rgba(255,255,255,.06)',overflow:'hidden',marginBottom:20}}>
            <div style={{height:'100%',borderRadius:100,background:'linear-gradient(90deg,#34D399,#60A5FA)',width:`${progressPct}%`,transition:'width .1s'}} />
          </div>

          {/* Rendered verse */}
          <div style={{lineHeight:1.9,marginBottom:24,userSelect:'none'}} onClick={()=>inputRef.current?.focus()}>
            {renderedText}
            {typed.length===0&&phase==='idle'&&<span style={{color:'rgba(255,255,255,.2)',fontFamily:'Georgia,serif',fontSize:'clamp(1rem,2.5vw,1.3rem)',fontStyle:'italic'}}> ← click here and start typing</span>}
          </div>

          {/* Hidden input */}
          <input ref={inputRef} value={typed} onChange={handleInput}
            style={{position:'absolute',opacity:0,width:1,height:1,top:0,left:0,pointerEvents:'none'}}
            disabled={phase==='done'} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} />

          {/* Tap to type on mobile */}
          <button onClick={()=>inputRef.current?.focus()} style={{width:'100%',padding:'14px',borderRadius:14,border:'1.5px dashed rgba(255,255,255,.12)',background:'transparent',color:'rgba(255,255,255,.3)',cursor:'pointer',fontFamily:'Poppins,sans-serif',fontSize:'.8rem',fontWeight:600,transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(96,165,250,.4)';e.currentTarget.style.color='rgba(96,165,250,.6)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.12)';e.currentTarget.style.color='rgba(255,255,255,.3)'}}>
            {phase==='done' ? '✅ Verse complete!' : phase==='typing' ? '⌨️ Keep going...' : '⌨️ Click here to start typing'}
          </button>
        </div>

        {/* Done banner */}
        {phase==='done' && (
          <div style={{background:'var(--surface)',borderRadius:20,border:'1.5px solid var(--green)',padding:'24px',textAlign:'center',marginBottom:16,animation:'popIn .4s cubic-bezier(.34,1.56,.64,1)'}}>
            <div style={{fontSize:'3rem',marginBottom:10}}>🎉</div>
            <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.4rem',fontWeight:800,color:'var(--green)',marginBottom:8}}>Verse Complete!</div>
            <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:20}}>
              {[['⚡',wpm,'WPM'],['🎯',accuracy+'%','Accuracy'],['⏱',Math.round(elapsed/1000)+'s','Time']].map(([e,v,l])=>(
                <div key={l} style={{background:'var(--bg2)',borderRadius:12,padding:'12px 18px',textAlign:'center'}}>
                  <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--green)',fontSize:'1.3rem'}}>{e} {v}</div>
                  <div style={{fontSize:'.66rem',color:'var(--ink3)',fontWeight:600,textTransform:'uppercase'}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              <button className="btn btn-green" onClick={nextVerse}>Next Verse →</button>
              <button className="btn btn-outline" onClick={restart}>↺ Retype This</button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div style={{background:'var(--surface)',borderRadius:16,border:'1.5px solid var(--border)',padding:'16px 20px',display:'flex',gap:14,flexWrap:'wrap'}}>
          {[['⌨️','Type exactly as shown — punctuation included'],['🎯','Aim for 95%+ accuracy for a badge'],['🔄','Green = correct · Red = needs fixing'],['📖','Research shows typing = 3× better memorization than reading']].map(([e,t])=>(
            <div key={t} style={{display:'flex',gap:8,alignItems:'flex-start',flex:'1 1 200px'}}>
              <span style={{fontSize:'1rem',flexShrink:0}}>{e}</span>
              <span style={{fontSize:'.76rem',color:'var(--ink3)',fontWeight:500,lineHeight:1.55}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
