import { useState } from 'react'

const ROOMS = [
  {
    id: 'jonah', title: "Jonah's Whale", emoji: '🐟',
    bg: 'linear-gradient(135deg,#0C4A6E,#0369A1,#075985)',
    scene: 'You are inside the great fish. It is dark and cold. The smell of the sea surrounds you. You have 3 days to find your way back to God.',
    intro: '"And Jonah was inside the fish three days and three nights." — Jonah 1:17',
    riddles: [
      { q: 'God told me to go to Nineveh. Instead I sailed toward... what city?', a: ['tarshish','tarshich'], hint: 'It starts with T. I was running from God.', verse: 'Jonah 1:3' },
      { q: 'A great storm arose at sea. The sailors discovered I was the cause. What did they do to stop the storm?', a: ['threw me overboard','threw jonah','cast me into the sea','tossed me over'], hint: 'They threw something — or rather, someone — into the sea.', verse: 'Jonah 1:15' },
      { q: 'Inside the fish, I prayed to the LORD. What is the name of my prayer that became scripture?', a: ['psalm','prayer of jonah','jonah 2','thanksgiving'], hint: 'It is recorded in Jonah chapter 2. Think worship.', verse: 'Jonah 2:1-9' },
      { q: 'God spoke to the fish. The fish obeyed and did what?', a: ['vomited me','spit me out','vomited jonah onto dry land','cast me on land'], hint: 'Not the most pleasant exit — but it worked.', verse: 'Jonah 2:10' },
      { q: 'After escaping the whale, where did God command me to go again?', a: ['nineveh','the great city','nineveh to preach'], hint: 'The same place I was originally told to go.', verse: 'Jonah 3:2' },
    ],
  },
  {
    id: 'daniel', title: "Daniel's Lion's Den", emoji: '🦁',
    bg: 'linear-gradient(135deg,#78350F,#92400E,#B45309)',
    scene: 'You are in the lion\'s den. It is pitch black. You can hear growling. The lions circle you. God has closed their mouths — if you have enough faith to trust Him.',
    intro: '"My God sent his angel, and he shut the mouths of the lions." — Daniel 6:22',
    riddles: [
      { q: 'The jealous officials tricked King Darius into signing a law that no one could pray to any god except him for how many days?', a: ['30','thirty','thirty days'], hint: 'It is a number between 29 and 31.', verse: 'Daniel 6:7' },
      { q: 'Despite the new law, Daniel prayed three times a day toward which city?', a: ['jerusalem','toward jerusalem'], hint: 'The holy city. The city of David.', verse: 'Daniel 6:10' },
      { q: 'What did King Darius place over the den\'s entrance after Daniel was thrown in?', a: ['stone','a stone','sealed with a stone'], hint: 'Heavy, immovable — but God is stronger.', verse: 'Daniel 6:17' },
      { q: 'King Darius rushed to the lion\'s den at dawn and called out to Daniel. What miracle had occurred?', a: ['not harmed','unharmed','no wound','lions mouths shut','god saved him'], hint: 'The lions were there but Daniel was completely fine.', verse: 'Daniel 6:22-23' },
      { q: 'After Daniel\'s rescue, King Darius wrote to every nation. What did he declare about the God of Daniel?', a: ['living god','he is the living god','god of daniel is living','he endures forever'], hint: '"He is the _____ God and he endures forever."', verse: 'Daniel 6:26' },
    ],
  },
  {
    id: 'moses', title: "The Burning Bush", emoji: '🔥',
    bg: 'linear-gradient(135deg,#064E3B,#065F46,#047857)',
    scene: 'You are on Mount Horeb — the mountain of God. A bush burns before you, yet it is not consumed. A voice calls your name from within the fire.',
    intro: '"Moses, Moses! Do not come any closer. Take off your sandals, for the place where you are standing is holy ground." — Exodus 3:4-5',
    riddles: [
      { q: 'Moses was tending the flock of his father-in-law. What was his father-in-law\'s name?', a: ['jethro','jethro the priest','reuel'], hint: 'He was a priest of Midian. His name starts with J.', verse: 'Exodus 3:1' },
      { q: 'God told Moses He had heard the cry of His people in what country?', a: ['egypt','in egypt'], hint: 'Where the pyramids are. Where Pharaoh ruled.', verse: 'Exodus 3:7' },
      { q: 'God told Moses to tell Pharaoh: "Let my people go." But Moses said "I cannot speak well." God said someone would speak for Moses. Who?', a: ['aaron','his brother aaron'], hint: 'His older brother. Also a future High Priest.', verse: 'Exodus 4:14-16' },
      { q: 'God revealed His sacred name to Moses. When asked "Who shall I say sent me?" God said His name was... (3 words)', a: ['i am that','i am who i am','i am','yahweh'], hint: '"I AM _____ I AM." Exodus 3:14', verse: 'Exodus 3:14' },
      { q: 'Moses performed a miraculous sign: he threw his staff on the ground and it became what animal?', a: ['snake','serpent','a snake','a serpent'], hint: 'A slithering creature. Moses ran from it at first.', verse: 'Exodus 4:3' },
    ],
  },
]

export default function ParableEscapeRoom() {
  const [roomIdx, setRoomIdx] = useState(null)
  const [ridgleIdx, setRidgleIdx] = useState(0)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle') // idle | correct | wrong | hint
  const [showHint, setShowHint] = useState(false)
  const [escaped, setEscaped] = useState(false)
  const [wrongCount, setWrongCount] = useState(0)
  const [solvedRooms, setSolvedRooms] = useState([])
  const [timeStart] = useState(Date.now())

  const room = roomIdx !== null ? ROOMS[roomIdx] : null
  const riddle = room ? room.riddles[ridgleIdx] : null
  const progress = room ? Math.round((ridgleIdx / room.riddles.length) * 100) : 0

  function checkAnswer() {
    if (!riddle || !input.trim()) return
    const clean = input.trim().toLowerCase().replace(/[^a-z\s]/g,'')
    const correct = riddle.a.some(ans => clean.includes(ans.toLowerCase()))
    if (correct) {
      setStatus('correct')
      setTimeout(() => {
        if (ridgleIdx < room.riddles.length - 1) {
          setRidgleIdx(r => r + 1)
          setInput('')
          setStatus('idle')
          setShowHint(false)
          setWrongCount(0)
        } else {
          setEscaped(true)
          setSolvedRooms(r => [...r, room.id])
        }
      }, 1000)
    } else {
      setWrongCount(w => w + 1)
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 1200)
    }
  }

  if (roomIdx === null) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
        <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1A0A00)', padding: '56px 36px 44px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, background: 'linear-gradient(90deg,#FCD34D,#FB923C,#F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
            Parable Escape Room
          </h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.92rem', fontWeight: 500 }}>
            Solve 5 Bible riddles to escape each room. Answer wrong 3 times and you get a hint. Beat all 3 rooms!
          </p>
        </div>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '44px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {ROOMS.map((r, i) => {
              const solved = solvedRooms.includes(r.id)
              return (
                <div key={r.id} onClick={() => { setRoomIdx(i); setRidgleIdx(0); setInput(''); setStatus('idle'); setEscaped(false); setWrongCount(0); setShowHint(false) }}
                  style={{ borderRadius: 24, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${solved ? 'var(--green)' : 'var(--border)'}`, transition: 'all .28s', boxShadow: solved ? '0 0 0 4px rgba(16,185,129,.15)' : 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = solved ? '0 0 0 4px rgba(16,185,129,.15)' : 'none' }}>
                  <div style={{ background: r.bg, padding: '36px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 10 }}>{r.emoji}</div>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>{r.title}</div>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: '18px 20px' }}>
                    <div style={{ fontSize: '.82rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.6, marginBottom: 12 }}>{r.scene.slice(0, 90)}...</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink3)' }}>5 riddles to escape</span>
                      {solved && <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--green)' }}>✓ Escaped!</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (escaped) {
    const elapsed = Math.round((Date.now() - timeStart) / 1000)
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins,sans-serif', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 560 }}>
          <div style={{ fontSize: '6rem', marginBottom: 20, animation: 'bounce 1s ease-in-out infinite' }}>🎉</div>
          <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '2.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>You Escaped!</h1>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.2rem', fontWeight: 800, color: 'var(--violet)', marginBottom: 20 }}>{room.title}</div>
          <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, fontSize: '.88rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.7 }}>
            Completed in <strong>{Math.floor(elapsed/60)}m {elapsed%60}s</strong> with all 5 riddles solved! 🏆
          </div>
          <div style={{ background: 'var(--violet-bg)', borderLeft: '3px solid var(--violet)', borderRadius: '0 14px 14px 0', padding: '14px 18px', fontSize: '.88rem', color: 'var(--ink)', fontStyle: 'italic', fontWeight: 500, marginBottom: 24 }}>
            {room.intro}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-violet" onClick={() => setRoomIdx(null)}>← All Rooms</button>
            {roomIdx < ROOMS.length - 1 && (
              <button className="btn btn-green" onClick={() => { setRoomIdx(roomIdx + 1); setRidgleIdx(0); setInput(''); setStatus('idle'); setEscaped(false); setWrongCount(0); setShowHint(false) }}>
                Next Room →
              </button>
            )}
          </div>
        </div>
        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Room header */}
      <div style={{ background: room.bg, padding: '44px 36px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 10 }}>{room.emoji}</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800, color: 'white', marginBottom: 8 }}>{room.title}</h1>
        <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.88rem', fontWeight: 500, maxWidth: 480, margin: '0 auto' }}>{room.scene}</p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 20px' }}>
        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.76rem', fontWeight: 700, color: 'var(--ink3)', marginBottom: 7 }}>
            <span>Riddle {ridgleIdx + 1} of {room.riddles.length}</span>
            <span>{progress}% escaped</span>
          </div>
          <div style={{ height: 8, borderRadius: 100, background: 'var(--bg3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg,#F59E0B,#10B981)', width: `${progress}%`, transition: 'width .5s ease' }} />
          </div>
        </div>

        {/* Riddle card */}
        <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ background: '#1F1F2E', padding: '26px 30px' }}>
            <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>🔐 Escape Riddle {ridgleIdx + 1}</div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.2rem', fontWeight: 700, color: 'white', lineHeight: 1.5 }}>{riddle.q}</div>
            <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', marginTop: 8, fontWeight: 500 }}>📖 {riddle.verse}</div>
          </div>
          <div style={{ padding: '24px 28px' }}>
            {showHint && (
              <div style={{ background: 'var(--yellow-bg)', borderLeft: '3px solid var(--yellow)', borderRadius: '0 12px 12px 0', padding: '11px 14px', fontSize: '.83rem', color: 'var(--ink2)', fontWeight: 500, marginBottom: 16 }}>
                💡 Hint: {riddle.hint}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="input-field"
                placeholder="Type your answer..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                style={{
                  flex: 1, fontSize: '1rem',
                  border: `2px solid ${status === 'correct' ? 'var(--green)' : status === 'wrong' ? 'var(--red)' : 'var(--border)'}`,
                  background: status === 'correct' ? 'var(--green-bg)' : status === 'wrong' ? 'var(--red-bg)' : 'var(--bg2)',
                  animation: status === 'wrong' ? 'shake .4s ease' : 'none',
                }}
              />
              <button className="btn btn-orange" onClick={checkAnswer} style={{ flexShrink: 0 }}>
                {status === 'correct' ? '✅' : '→ Submit'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {wrongCount >= 2 && !showHint && (
                <button className="btn btn-outline btn-sm" onClick={() => setShowHint(true)}>💡 Show Hint</button>
              )}
              <button className="btn btn-outline btn-sm" onClick={() => setRoomIdx(null)}>← Exit Room</button>
            </div>
            {wrongCount > 0 && !showHint && wrongCount < 2 && (
              <div style={{ fontSize: '.76rem', color: 'var(--red)', fontWeight: 500, marginTop: 8 }}>
                Wrong answer. {2 - wrongCount} more attempt{wrongCount === 1 ? '' : 's'} before hint unlocks.
              </div>
            )}
          </div>
        </div>

        {/* Bible verse card */}
        <div style={{ background: 'var(--violet-bg)', borderLeft: '3px solid var(--violet)', borderRadius: '0 14px 14px 0', padding: '13px 16px', fontSize: '.82rem', color: 'var(--ink2)', fontStyle: 'italic', fontWeight: 500 }}>
          {room.intro}
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  )
}
