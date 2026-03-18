import { useState, useEffect, useRef } from 'react'
import { useBadges } from '../context/BadgeContext'

const VERSES = [
  { ref:'John 3:16',    text:'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { ref:'Phil 4:13',   text:'I can do all this through him who gives me strength.' },
  { ref:'Jer 29:11',   text:'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
  { ref:'Josh 1:9',    text:'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
  { ref:'Ps 23:1',     text:'The Lord is my shepherd, I lack nothing.' },
  { ref:'Isa 40:31',   text:'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
  { ref:'Rom 8:28',    text:'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { ref:'Prov 3:5-6',  text:'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { ref:'Matt 11:28',  text:'Come to me, all you who are weary and burdened, and I will give you rest.' },
  { ref:'1 Pet 5:7',   text:'Cast all your anxiety on him because he cares for you.' },
]

function pickMissingWord(text) {
  const words = text.split(' ')
  // Pick a meaningful word (not short articles)
  const eligible = words.map((w,i)=>({w:w.replace(/[^a-zA-Z]/g,''),i})).filter(({w})=>w.length>3)
  const pick = eligible[Math.floor(Math.random() * eligible.length)]
  const blanked = words.map((w,i) => i === pick.i ? '___' : w).join(' ')
  return { display: blanked, answer: pick.w.toLowerCase(), wordIndex: pick.i }
}

const LEADERBOARD = [
  { rank:1, name:'FaithChampion23', score:2840, streak:12, badge:'🥇' },
  { rank:2, name:'GraceRunner',     score:2650, streak:8,  badge:'🥈' },
  { rank:3, name:'ScriptureKing',   score:2410, streak:15, badge:'🥉' },
  { rank:4, name:'PsalmSinger',     score:2100, streak:5,  badge:'🏅' },
  { rank:5, name:'WordWarrior',     score:1980, streak:3,  badge:'🏅' },
]

export default function ScriptureMemoryLeague() {
  const [phase, setPhase] = useState('menu') // menu | playing | done
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [current, setCurrent] = useState(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong'
  const [timeLeft, setTimeLeft] = useState(10)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [usedIdxs, setUsedIdxs] = useState([])
  const timerRef = useRef(null)
  const inputRef = useRef(null)
  const { awardBadge } = useBadges()
  const [hiScore] = useState(() => parseInt(localStorage.getItem('bfl_league_hs') || '0'))

  const ROUNDS = 10

  function nextVerse() {
    const remaining = VERSES.map((_,i) => i).filter(i => !usedIdxs.includes(i))
    if (remaining.length === 0 || round >= ROUNDS) { finishGame(); return }
    const idx = remaining[Math.floor(Math.random() * remaining.length)]
    const verse = VERSES[idx]
    const { display, answer } = pickMissingWord(verse.text)
    setCurrent({ verse, display, answer })
    setUsedIdxs(u => [...u, idx])
    setFeedback(null)
    setInput('')
    setTimeLeft(10)
    inputRef.current?.focus()
  }

  function startGame() {
    setScore(0); setRound(0); setStreak(0); setMaxStreak(0); setUsedIdxs([])
    setPhase('playing')
    const idx = Math.floor(Math.random() * VERSES.length)
    const verse = VERSES[idx]
    const { display, answer } = pickMissingWord(verse.text)
    setCurrent({ verse, display, answer })
    setUsedIdxs([idx])
    setTimeLeft(10)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  useEffect(() => {
    if (phase !== 'playing' || feedback !== null) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, round, feedback])

  function handleTimeout() {
    setFeedback('timeout')
    setStreak(0)
    setTimeout(advance, 1500)
  }

  function submit() {
    if (!input.trim() || feedback !== null) return
    clearInterval(timerRef.current)
    const clean = input.trim().toLowerCase().replace(/[^a-z]/g,'')
    const correct = clean === current.answer
    const pts = correct ? Math.max(10, timeLeft * 15) + (streak * 5) : 0
    if (correct) {
      setScore(s => s + pts)
      const newStreak = streak + 1
      setStreak(newStreak)
      setMaxStreak(m => Math.max(m, newStreak))
      setFeedback('correct')
    } else {
      setStreak(0)
      setFeedback('wrong')
    }
    setTimeout(advance, 1800)
  }

  function advance() {
    setRound(r => {
      const next = r + 1
      if (next >= ROUNDS) { finishGame(); return next }
      nextVerse()
      return next
    })
  }

  function finishGame() {
    clearInterval(timerRef.current)
    setPhase('done')
    const hs = Math.max(score, hiScore)
    localStorage.setItem('bfl_league_hs', hs)
    if (maxStreak >= 5) awardBadge('flashcard_all')
  }

  const progress = (round / ROUNDS) * 100

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0F0F1A,#1C1645)', padding:'48px 36px 36px', textAlign:'center' }}>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, background:'linear-gradient(90deg,#FCD34D,#F97316,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>
          🧠 Scripture Memory League
        </h1>
        <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.88rem', fontWeight:500 }}>Fill in the missing word. Score by speed. Climb the leaderboard. Weekly reset every Monday.</p>
      </div>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'32px 20px' }}>

        {phase === 'menu' && (
          <div>
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
              {[['🏆',`${hiScore}pts`,'Your Best Score','var(--yellow)'],['📅','Weekly','Resets Monday','var(--blue)'],['⚡',ROUNDS,'Rounds per game','var(--green)']].map(([e,v,l,c],i)=>(
                <div key={i} style={{ background:'var(--surface)', borderRadius:16, padding:18, border:'1.5px solid var(--border)', textAlign:'center' }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:4 }}>{e}</div>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.4rem', fontWeight:800, color:c }}>{v}</div>
                  <div style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:600 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:28, marginBottom:20 }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.1rem', fontWeight:800, color:'var(--ink)', marginBottom:16 }}>🏆 Weekly Leaderboard</div>
              {LEADERBOARD.map(p => (
                <div key={p.rank} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:p.rank < 5?'1px solid var(--border)':'none' }}>
                  <div style={{ fontSize:'1.2rem', width:28, textAlign:'center' }}>{p.badge}</div>
                  <div style={{ flex:1, fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', fontSize:'.9rem' }}>{p.name}</div>
                  <div style={{ fontSize:'.72rem', color:'var(--ink3)', fontWeight:600 }}>🔥 {p.streak} streak</div>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--yellow)', fontSize:'1rem' }}>{p.score.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <button onClick={startGame} style={{ width:'100%', padding:15, borderRadius:16, border:'none', background:'linear-gradient(135deg,#1C1645,#2D1B69)', color:'white', fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1rem', cursor:'pointer', boxShadow:'0 8px 28px rgba(99,102,241,.35)', transition:'all .2s' }}>
              🧠 Start This Week's League →
            </button>
          </div>
        )}

        {phase === 'playing' && current && (
          <div>
            {/* Progress & score */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
              <div style={{ flex:1, height:8, borderRadius:100, background:'var(--bg3)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:100, background:'linear-gradient(90deg,#6366F1,#EC4899)', width:`${progress}%`, transition:'width .4s' }} />
              </div>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--yellow)', fontSize:'1.1rem' }}>{score}</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.8rem', fontWeight:700, color:'var(--orange)' }}>🔥 {streak}</div>
            </div>

            <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', overflow:'hidden', marginBottom:16 }}>
              <div style={{ background:'linear-gradient(135deg,#1E1B4B,#2D1B69)', padding:'22px 28px' }}>
                {/* Timer */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <div style={{ fontSize:'.72rem', fontWeight:700, color:'rgba(165,180,252,.6)', textTransform:'uppercase', letterSpacing:1 }}>Round {round + 1} of {ROUNDS}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ height:6, width:80, borderRadius:100, background:'rgba(255,255,255,.15)', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:100, background:timeLeft <= 3 ? '#EF4444' : '#10B981', width:`${(timeLeft / 10) * 100}%`, transition:'width 1s linear' }} />
                    </div>
                    <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.1rem', fontWeight:800, color:timeLeft <= 3 ? '#FCA5A5' : 'white' }}>{timeLeft}s</div>
                  </div>
                </div>
                <div style={{ fontSize:'.72rem', fontWeight:700, color:'rgba(165,180,252,.7)', marginBottom:8 }}>{current.verse.ref}</div>
                <div style={{ fontSize:'1.05rem', color:'white', lineHeight:1.75, fontWeight:500 }}>
                  {current.display.split(' ').map((word, i) => word === '___' ? (
                    <span key={i} style={{ display:'inline-block', borderBottom:'2.5px solid #A5B4FC', minWidth:70, padding:'0 4px', color:'#A5B4FC', fontWeight:800, letterSpacing:2, textAlign:'center', margin:'0 3px' }}>___</span>
                  ) : <span key={i}>{word} </span>)}
                </div>
              </div>
              <div style={{ padding:'20px 28px' }}>
                {feedback === null ? (
                  <div style={{ display:'flex', gap:10 }}>
                    <input ref={inputRef} className="input-field" placeholder="Type the missing word..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} style={{ flex:1, fontSize:'1rem' }} autoComplete="off" />
                    <button className="btn btn-violet" onClick={submit}>Submit →</button>
                  </div>
                ) : (
                  <div style={{ textAlign:'center', padding:'12px 0', animation:'popIn .3s ease' }}>
                    {feedback === 'correct' && <div style={{ color:'var(--green)', fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:'1.2rem' }}>✅ Correct! +{Math.max(10, timeLeft * 15) + streak * 5} pts</div>}
                    {feedback === 'wrong' && <div style={{ color:'var(--red)', fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:'1.1rem' }}>❌ The word was: <span style={{ color:'var(--orange)' }}>{current.answer}</span></div>}
                    {feedback === 'timeout' && <div style={{ color:'var(--orange)', fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:'1.1rem' }}>⏰ Time's up! The word was: <span style={{ color:'white' }}>{current.answer}</span></div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:36, textAlign:'center' }}>
            <div style={{ fontSize:'4rem', marginBottom:16 }}>🏆</div>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'2.5rem', fontWeight:800, color:'var(--yellow)', marginBottom:6 }}>{score.toLocaleString()}</div>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.2rem', fontWeight:800, color:'var(--ink)', marginBottom:16 }}>
              {score > hiScore ? '🎉 New Personal Best!' : 'Game Complete!'}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, maxWidth:400, margin:'0 auto 28px' }}>
              {[['⚡','Max Streak',`${maxStreak} 🔥`,'var(--orange)'],['✅','Rounds',`${round}/${ROUNDS}`,'var(--blue)'],['🏆','Best',`${Math.max(score,hiScore)}pts`,'var(--yellow)']].map(([e,l,v,c],i)=>(
                <div key={i} style={{ background:'var(--bg2)', borderRadius:14, padding:'12px 8px' }}>
                  <div style={{ fontSize:'1.2rem' }}>{e}</div>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:c, fontSize:'1rem' }}>{v}</div>
                  <div style={{ fontSize:'.68rem', color:'var(--ink3)', fontWeight:600 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button className="btn btn-violet" onClick={startGame}>🔄 Play Again</button>
              <button className="btn btn-outline" onClick={() => setPhase('menu')}>← Leaderboard</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
