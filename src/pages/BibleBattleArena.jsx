import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useBadges } from '../context/BadgeContext'

const QUESTIONS = [
  { q:'How many days did Jesus fast in the wilderness?', options:['30','40','50','7'], correct:1 },
  { q:'Who was the first king of Israel?', options:['David','Solomon','Saul','Gideon'], correct:2 },
  { q:'Which disciple walked on water with Jesus?', options:['John','James','Peter','Andrew'], correct:2 },
  { q:'How many books are in the Old Testament?', options:['27','39','66','44'], correct:1 },
  { q:'What city was Jesus born in?', options:['Jerusalem','Nazareth','Bethlehem','Jericho'], correct:2 },
  { q:'Who built the Temple in Jerusalem?', options:['David','Solomon','Rehoboam','Zerubbabel'], correct:1 },
  { q:'How many fruits of the Spirit are listed in Galatians 5?', options:['7','8','9','10'], correct:2 },
  { q:'What is the shortest verse in the Bible?', options:['John 11:35','John 3:16','Ps 117:2','Rev 1:1'], correct:0 },
  { q:'Which prophet was swallowed by a great fish?', options:['Elijah','Elisha','Jonah','Nahum'], correct:2 },
  { q:'How many disciples did Jesus choose?', options:['10','11','12','13'], correct:2 },
  { q:'What does the name "Jesus" mean?', options:['God saves','God loves','God reigns','God heals'], correct:0 },
  { q:'Who wrote most of the Psalms?', options:['Solomon','Moses','David','Asaph'], correct:2 },
  { q:'In which book does the burning bush appear?', options:['Genesis','Leviticus','Numbers','Exodus'], correct:3 },
  { q:'How many plagues did God send on Egypt?', options:['7','8','10','12'], correct:2 },
  { q:'What was Paul\'s name before his conversion?', options:['Barnabas','Saul','Simon','Stephen'], correct:1 },
]

function genCode() { return Math.random().toString(36).substring(2, 7).toUpperCase() }

export default function BibleBattleArena() {
  const [phase, setPhase] = useState('menu')
  const [mode, setMode] = useState(null) // 'host' | 'join'
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [score, setScore] = useState({ me: 0, them: 0 })
  const [round, setRound] = useState(0)
  const [question, setQuestion] = useState(null)
  const [myAnswer, setMyAnswer] = useState(null)
  const [theirAnswer, setTheirAnswer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(8)
  const [roundResult, setRoundResult] = useState(null)
  const [waitingForOpponent, setWaitingForOpponent] = useState(false)
  const [opponentJoined, setOpponentJoined] = useState(false)
  const channelRef = useRef(null)
  const timerRef = useRef(null)
  const isHost = mode === 'host'
  const { awardBadge } = useBadges()
  const TOTAL_ROUNDS = 10

  function createRoom() {
    const code = genCode()
    setRoomCode(code)
    setMode('host')
    setPhase('lobby')
    setWaitingForOpponent(true)

    channelRef.current = supabase.channel(`battle-${code}`)
      .on('broadcast', { event: 'join' }, () => {
        setOpponentJoined(true)
        setWaitingForOpponent(false)
        setTimeout(startGame, 1500)
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        setTheirAnswer(payload.answer)
      })
      .subscribe()
  }

  function joinRoom() {
    if (!joinCode.trim()) return
    const code = joinCode.toUpperCase()
    setRoomCode(code)
    setMode('join')
    setPhase('lobby')

    channelRef.current = supabase.channel(`battle-${code}`)
      .on('broadcast', { event: 'question' }, ({ payload }) => {
        setQuestion(payload.question)
        setMyAnswer(null); setTheirAnswer(null); setRoundResult(null)
        setTimeLeft(8)
        setPhase('playing')
      })
      .on('broadcast', { event: 'result' }, ({ payload }) => {
        setScore(payload.score)
        setRoundResult(payload.result)
        setRound(payload.round)
        if (payload.round >= TOTAL_ROUNDS) setTimeout(() => setPhase('done'), 2000)
      })
      .subscribe()

    channelRef.current.send({ type: 'broadcast', event: 'join', payload: {} })
    setOpponentJoined(true)
  }

  function startGame() {
    setPhase('playing')
    setRound(0)
    sendQuestion(0)
  }

  function sendQuestion(roundNum) {
    if (!isHost) return
    const q = QUESTIONS[roundNum % QUESTIONS.length]
    setQuestion(q)
    setMyAnswer(null); setTheirAnswer(null); setRoundResult(null)
    setTimeLeft(8)
    channelRef.current?.send({ type: 'broadcast', event: 'question', payload: { question: q } })
  }

  function answerQuestion(idx) {
    if (myAnswer !== null) return
    setMyAnswer(idx)
    channelRef.current?.send({ type: 'broadcast', event: 'answer', payload: { answer: idx } })

    if (isHost) {
      // Host resolves round
      setTimeout(() => resolveRound(idx), 3000)
    }
  }

  function resolveRound(hostAnswer) {
    const opponentAns = theirAnswer
    const correct = question?.correct
    const hostCorrect = hostAnswer === correct
    const opponentCorrect = opponentAns === correct
    const newScore = { ...score }
    let result = 'tie'
    if (hostCorrect && !opponentCorrect) { newScore.me += 1; result = 'host' }
    else if (opponentCorrect && !hostCorrect) { newScore.them += 1; result = 'opponent' }
    else if (hostCorrect && opponentCorrect) { newScore.me += 0.5; newScore.them += 0.5; result = 'both' }
    setScore(newScore)
    setRoundResult(result)
    const nextRound = round + 1
    channelRef.current?.send({ type: 'broadcast', event: 'result', payload: { score: newScore, result, round: nextRound } })
    setRound(nextRound)
    if (nextRound >= TOTAL_ROUNDS) { setPhase('done'); return }
    setTimeout(() => sendQuestion(nextRound), 2500)
  }

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || myAnswer !== null) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); answerQuestion(-1); return 0 } return t - 1 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, question, myAnswer])

  useEffect(() => () => { channelRef.current?.unsubscribe(); clearInterval(timerRef.current) }, [])

  const myWon = score.me > score.them
  const tied = score.me === score.them

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0F0F1A,#1C0A00)', padding:'48px 36px 36px', textAlign:'center' }}>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, background:'linear-gradient(90deg,#FCD34D,#F97316,#EF4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>
          ⚔️ Bible Battle Arena
        </h1>
        <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.88rem', fontWeight:500 }}>1v1 live Bible trivia. Share your room code. First to answer correctly wins the point. 10 rounds.</p>
      </div>

      <div style={{ maxWidth:680, margin:'0 auto', padding:'32px 20px' }}>

        {phase === 'menu' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:'var(--surface)', borderRadius:22, border:'1.5px solid var(--border)', padding:28, textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:14 }}>🛡️</div>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.2rem', fontWeight:800, color:'var(--ink)', marginBottom:8 }}>Host a Battle</div>
              <p style={{ fontSize:'.82rem', color:'var(--ink3)', fontWeight:500, marginBottom:20 }}>Create a room, share the code with a friend</p>
              <button className="btn btn-orange" onClick={createRoom} style={{ width:'100%', justifyContent:'center' }}>⚔️ Create Room</button>
            </div>
            <div style={{ background:'var(--surface)', borderRadius:22, border:'1.5px solid var(--border)', padding:28, textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:14 }}>🗡️</div>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.2rem', fontWeight:800, color:'var(--ink)', marginBottom:8 }}>Join a Battle</div>
              <p style={{ fontSize:'.82rem', color:'var(--ink3)', fontWeight:500, marginBottom:12 }}>Enter the room code your friend shared</p>
              <input className="input-field" placeholder="Room code (e.g. A1B2C)" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} style={{ marginBottom:10, textAlign:'center', fontWeight:800, letterSpacing:3, fontSize:'1.1rem' }} maxLength={5} />
              <button className="btn btn-blue" onClick={joinRoom} disabled={joinCode.length < 4} style={{ width:'100%', justifyContent:'center' }}>⚔️ Join Battle</button>
            </div>
          </div>
        )}

        {phase === 'lobby' && (
          <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:40, textAlign:'center' }}>
            {isHost ? (
              <>
                <div style={{ fontSize:'3rem', marginBottom:16 }}>🔗</div>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.5rem', fontWeight:800, color:'var(--ink)', marginBottom:8 }}>Your Room Code</div>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'4rem', fontWeight:800, color:'var(--orange)', letterSpacing:8, marginBottom:16 }}>{roomCode}</div>
                <p style={{ fontSize:'.86rem', color:'var(--ink3)', fontWeight:500, marginBottom:20 }}>Share this code with a friend. The battle starts when they join.</p>
                {waitingForOpponent ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, color:'var(--ink3)', fontSize:'.86rem', fontWeight:500 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:'var(--orange)', animation:'pulse 1.2s ease-in-out infinite' }} />
                    Waiting for opponent to join...
                  </div>
                ) : (
                  <div style={{ color:'var(--green)', fontFamily:"'Baloo 2',cursive", fontWeight:800 }}>✅ Opponent joined! Starting in 1.5s...</div>
                )}
              </>
            ) : (
              <div style={{ color:'var(--green)', fontFamily:"'Baloo 2',cursive", fontSize:'1.3rem', fontWeight:800 }}>
                ✅ Joined room {roomCode}! Waiting for battle to start...
              </div>
            )}
          </div>
        )}

        {phase === 'playing' && question && (
          <div>
            {/* Score bar */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ background:'var(--surface)', borderRadius:12, padding:'8px 16px', fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--blue)', fontSize:'1rem', border:'1.5px solid var(--border)' }}>You: {score.me}</div>
              <div style={{ flex:1, height:8, borderRadius:100, background:'var(--bg3)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:100, background:'linear-gradient(90deg,#F97316,#EF4444)', width:`${(round/TOTAL_ROUNDS)*100}%` }} />
              </div>
              <div style={{ background:'var(--surface)', borderRadius:12, padding:'8px 16px', fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--red)', fontSize:'1rem', border:'1.5px solid var(--border)' }}>Them: {score.them}</div>
            </div>

            <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', overflow:'hidden' }}>
              <div style={{ background:'linear-gradient(135deg,#1C0A00,#3D1500)', padding:'22px 28px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                  <span style={{ fontSize:'.72rem', fontWeight:700, color:'rgba(255,200,100,.6)', textTransform:'uppercase', letterSpacing:1 }}>Round {round + 1} of {TOTAL_ROUNDS}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ height:6, width:64, borderRadius:100, background:'rgba(255,255,255,.15)', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:100, background:timeLeft<=3?'#EF4444':'#F97316', width:`${(timeLeft/8)*100}%`, transition:'width 1s linear' }} />
                    </div>
                    <span style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:timeLeft<=3?'#FCA5A5':'white', fontSize:'1rem' }}>{timeLeft}s</span>
                  </div>
                </div>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.2rem', fontWeight:700, color:'white', lineHeight:1.5 }}>{question.q}</div>
              </div>
              <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {question.options.map((opt, i) => {
                  const answered = myAnswer !== null
                  const isMyAnswer = myAnswer === i
                  const isCorrect = i === question.correct
                  const show = answered || roundResult
                  let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--ink2)'
                  if (show && isCorrect) { bg = 'var(--green-bg)'; border = 'var(--green)'; color = 'var(--green)' }
                  else if (show && isMyAnswer && !isCorrect) { bg = 'var(--red-bg)'; border = 'var(--red)'; color = 'var(--red)' }
                  return (
                    <button key={i} onClick={() => answerQuestion(i)} disabled={answered} style={{ padding:'14px', borderRadius:14, textAlign:'left', cursor:answered?'default':'pointer', border:`2px solid ${border}`, background:bg, color, fontFamily:'Poppins,sans-serif', fontSize:'.88rem', fontWeight:isMyAnswer||isCorrect?700:500, transition:'all .25s' }}>
                      <span style={{ fontWeight:800, marginRight:6 }}>{['A','B','C','D'][i]}.</span>{opt}
                    </button>
                  )
                })}
              </div>
              {roundResult && (
                <div style={{ padding:'12px 24px 20px', textAlign:'center', fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:'1.1rem', color: roundResult==='host'&&isHost||roundResult==='opponent'&&!isHost ? 'var(--green)' : roundResult==='both' ? 'var(--yellow)' : 'var(--red)' }}>
                  {roundResult==='both' ? '⚡ Both correct!' : roundResult==='host'&&isHost||roundResult==='opponent'&&!isHost ? '✅ You got the point!' : roundResult==='host'&&!isHost||roundResult==='opponent'&&isHost ? '❌ Opponent got it' : "⏰ Nobody scored"}
                </div>
              )}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background: myAnswer!==null ? 'var(--green)' : 'var(--orange)', animation:'pulse 1s ease-in-out infinite' }} />
              <span style={{ fontSize:'.76rem', color:'var(--ink3)', fontWeight:600 }}>{myAnswer!==null ? 'You answered' : 'Waiting for your answer...'}</span>
              {theirAnswer !== null && <span style={{ marginLeft:'auto', fontSize:'.76rem', color:'var(--green)', fontWeight:600 }}>⚡ Opponent answered</span>}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:40, textAlign:'center' }}>
            <div style={{ fontSize:'4rem', marginBottom:16 }}>{myWon ? '🏆' : tied ? '🤝' : '😔'}</div>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'2rem', fontWeight:800, color:myWon?'var(--green)':tied?'var(--yellow)':'var(--red)', marginBottom:10 }}>
              {myWon ? 'Victory!' : tied ? "It's a Tie!" : 'Defeated!'}
            </div>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.6rem', fontWeight:800, color:'var(--ink)', marginBottom:24 }}>
              {score.me} — {score.them}
            </div>
            <div style={{ background:'var(--violet-bg)', borderLeft:'3px solid var(--violet)', borderRadius:'0 14px 14px 0', padding:'12px 16px', marginBottom:24, fontSize:'.84rem', color:'var(--ink2)', fontStyle:'italic' }}>
              "Fight the good fight of the faith." — 1 Timothy 6:12
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button className="btn btn-orange" onClick={() => { setPhase('menu'); setScore({me:0,them:0}); setRound(0); channelRef.current?.unsubscribe() }}>⚔️ Play Again</button>
              <a href="/trivia" className="btn btn-outline">Practice Solo →</a>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}`}</style>
    </div>
  )
}
