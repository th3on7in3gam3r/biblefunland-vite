import { useState, useEffect } from 'react'

// 30 days of challenges, cycling daily
const CHALLENGES = [
  { type:'scramble', q:'Unscramble: SEOMS', a:'MOSES', hint:'Led Israel out of Egypt', verse:'Exodus 14:21', points:100 },
  { type:'riddle', q:'I have 66 books, two testaments, and the greatest story ever told. What am I?', a:'THE BIBLE', hint:'You hold it in your hands', verse:'2 Timothy 3:16', points:80 },
  { type:'fill', q:'Fill in the blank: "For God so ___ the world"', a:'LOVED', hint:'John 3:16', verse:'John 3:16', points:90 },
  { type:'scramble', q:'Unscramble: AIVDD', a:'DAVID', hint:'Killed Goliath, wrote Psalms', verse:'1 Samuel 17:50', points:100 },
  { type:'riddle', q:'I was swallowed by a great fish for 3 days and nights. Who am I?', a:'JONAH', hint:'Book of the Bible', verse:'Jonah 1:17', points:80 },
  { type:'fill', q:'Fill in the blank: "The Lord is my ___; I shall not want"', a:'SHEPHERD', hint:'Psalm 23', verse:'Psalm 23:1', points:90 },
  { type:'scramble', q:'Unscramble: REAMYLJ', a:'JEREMIAH', hint:'The weeping prophet', verse:'Jeremiah 29:11', points:120 },
  { type:'riddle', q:'I built a giant boat and saved two of every animal. Who am I?', a:'NOAH', hint:'Genesis 6', verse:'Genesis 6:22', points:80 },
  { type:'fill', q:'Fill in the blank: "I can do all things through ___ who strengthens me"', a:'CHRIST', hint:'Philippians 4:13', verse:'Philippians 4:13', points:90 },
  { type:'scramble', q:'Unscramble: ASLPU', a:'PAULS', hint:'Wrote many New Testament letters', verse:'Philippians 1:1', points:80 },
  { type:'riddle', q:'I was thrown into a lions den but God shut the lions mouths. Who am I?', a:'DANIEL', hint:'Book of the Bible', verse:'Daniel 6:22', points:80 },
  { type:'fill', q:'Fill in the blank: "Trust in the Lord with all your ___"', a:'HEART', hint:'Proverbs 3:5', verse:'Proverbs 3:5', points:90 },
  { type:'scramble', q:'Unscramble: RESTEH', a:'ESTHER', hint:'Courageous queen of Persia', verse:'Esther 4:14', points:100 },
  { type:'riddle', q:'I am the first book of the Bible. I describe the creation of the world. What am I?', a:'GENESIS', hint:'In the beginning...', verse:'Genesis 1:1', points:80 },
  { type:'fill', q:'Fill in the blank: "Be strong and ___; do not be afraid"', a:'COURAGEOUS', hint:'Joshua 1:9', verse:'Joshua 1:9', points:100 },
  { type:'scramble', q:'Unscramble: MAAAHBR', a:'ABRAHAM', hint:'Father of many nations', verse:'Genesis 12:1', points:110 },
  { type:'riddle', q:'I was a shepherd boy, the smallest of my brothers, yet God chose me as king. Who am I?', a:'DAVID', hint:'1 Samuel 16', verse:'1 Samuel 16:7', points:80 },
  { type:'fill', q:'Fill in the blank: "For I know the ___ I have for you, declares the Lord"', a:'PLANS', hint:'Jeremiah 29:11', verse:'Jeremiah 29:11', points:90 },
  { type:'scramble', q:'Unscramble: LMOSONO', a:'SOLOMON', hint:'The wisest king', verse:'1 Kings 3:12', points:110 },
  { type:'riddle', q:'I was raised in a palace but led my people out of slavery. Who am I?', a:'MOSES', hint:'Book of Exodus', verse:'Exodus 3:10', points:80 },
  { type:'fill', q:'Fill in the blank: "The Lord is my light and my ___"', a:'SALVATION', hint:'Psalm 27:1', verse:'Psalm 27:1', points:100 },
  { type:'scramble', q:'Unscramble: BAAAHIS', a:'ISAIAH', hint:'Major prophet, foretold Jesus', verse:'Isaiah 9:6', points:110 },
  { type:'riddle', q:'I am the last book of the Bible. I describe the end of the age. What am I?', a:'REVELATION', hint:'Apocalypse', verse:'Revelation 22:13', points:100 },
  { type:'fill', q:'Fill in the blank: "In the beginning God created the ___ and the earth"', a:'HEAVENS', hint:'Genesis 1:1', verse:'Genesis 1:1', points:80 },
  { type:'scramble', q:'Unscramble: HTRU', a:'RUTH', hint:'Loyal daughter-in-law, great-grandmother of David', verse:'Ruth 1:16', points:80 },
  { type:'riddle', q:'I wrote most of the Psalms and was called a man after Gods own heart. Who am I?', a:'DAVID', hint:'2 Samuel', verse:'Acts 13:22', points:80 },
  { type:'fill', q:'Fill in the blank: "For all have sinned and fall short of the ___ of God"', a:'GLORY', hint:'Romans 3:23', verse:'Romans 3:23', points:90 },
  { type:'scramble', q:'Unscramble: BTAHESLE', a:'BETHLEHEM', hint:'City where Jesus was born', verse:'Luke 2:4', points:120 },
  { type:'riddle', q:'I climbed a tree to see Jesus passing by and he invited himself to my house. Who am I?', a:'ZACCHAEUS', hint:'Luke 19', verse:'Luke 19:5', points:100 },
  { type:'fill', q:'Fill in the blank: "The wages of sin is ___, but the gift of God is eternal life"', a:'DEATH', hint:'Romans 6:23', verse:'Romans 6:23', points:90 },
]

function getTodayChallenge() {
  const day = Math.floor(Date.now() / 86400000)
  return CHALLENGES[day % CHALLENGES.length]
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

export default function DailyChallenge() {
  const challenge = getTodayChallenge()
  const todayKey = getTodayKey()

  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState(() => {
    const saved = localStorage.getItem('bfl_challenge_' + todayKey)
    return saved ? JSON.parse(saved) : null // null | { correct, answer, points }
  })
  const [wrong, setWrong] = useState(false)
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('bfl_challenge_streak') || '0'))
  const [totalPoints, setTotalPoints] = useState(() => parseInt(localStorage.getItem('bfl_challenge_pts') || '0'))
  const [showHint, setShowHint] = useState(false)

  const typeLabels = { scramble: '🔤 Word Scramble', riddle: '🤔 Bible Riddle', fill: '✏️ Fill in the Blank' }
  const typeColors = { scramble: 'var(--blue)', riddle: 'var(--violet)', fill: 'var(--orange)' }
  const typeBgs = { scramble: 'var(--blue-bg)', riddle: 'var(--violet-bg)', fill: 'var(--orange-bg)' }

  function submit() {
    const clean = answer.trim().toUpperCase().replace(/[^A-Z]/g, '')
    const correct = clean === challenge.a.replace(/[^A-Z]/g, '').toUpperCase()
    if (correct) {
      const result = { correct: true, answer: clean, points: challenge.points - (showHint ? 20 : 0) }
      setStatus(result)
      localStorage.setItem('bfl_challenge_' + todayKey, JSON.stringify(result))
      const newStreak = streak + 1
      const newPts = totalPoints + result.points
      setStreak(newStreak)
      setTotalPoints(newPts)
      localStorage.setItem('bfl_challenge_streak', newStreak)
      localStorage.setItem('bfl_challenge_pts', newPts)
    } else {
      setWrong(true)
      setTimeout(() => setWrong(false), 800)
    }
  }

  function skip() {
    const result = { correct: false, answer: '', points: 0, skipped: true }
    setStatus(result)
    localStorage.setItem('bfl_challenge_' + todayKey, JSON.stringify(result))
  }

  // Countdown to next challenge
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const msLeft = tomorrow - now
  const hLeft = Math.floor(msLeft / 3600000)
  const mLeft = Math.floor((msLeft % 3600000) / 60000)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', padding: '56px 36px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.7rem', fontWeight: 700, background: 'rgba(245,158,11,.15)', color: '#FCD34D', padding: '4px 12px', borderRadius: 100, marginBottom: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B', animation: 'pulse 1.5s ease-in-out infinite' }}/>
          New challenge every day at midnight
        </div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, background: 'linear-gradient(90deg,#FCD34D,#FB923C,#F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>Daily Bible Challenge</h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500 }}>A fresh puzzle every day. Complete it to keep your streak!</p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 20px' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
          {[['🔥', streak, 'Challenge Streak', 'linear-gradient(135deg,#F97316,#EF4444)'], ['⭐', totalPoints, 'Total Points', 'var(--yellow)'], ['📅', `${hLeft}h ${mLeft}m`, 'Next Challenge', 'var(--blue)']].map(([e, v, l, c], i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: 16, padding: '18px', border: '1.5px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>{e}</div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, background: c, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 3 }}>{v}</div>
              <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--ink3)' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Challenge card */}
        <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,.08)', overflow: 'hidden' }}>
          {/* Type badge */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: typeBgs[challenge.type], color: typeColors[challenge.type] }}>
              {typeLabels[challenge.type]}
            </div>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--yellow)', background: 'var(--yellow-bg)', padding: '4px 12px', borderRadius: 100 }}>
              ⭐ {challenge.points - (showHint ? 20 : 0)} pts
            </div>
          </div>

          <div style={{ padding: '28px 28px 24px' }}>
            {/* Question */}
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.4, marginBottom: 20 }}>
              {challenge.q}
            </div>

            {/* Hint */}
            {showHint && (
              <div style={{ background: 'var(--orange-bg)', borderLeft: '3px solid var(--orange)', borderRadius: '0 12px 12px 0', padding: '11px 14px', fontSize: '.82rem', color: 'var(--ink2)', fontWeight: 500, marginBottom: 16 }}>
                💡 Hint: {challenge.hint} <span style={{ color: 'var(--orange)', fontWeight: 700 }}>(−20 pts)</span>
              </div>
            )}

            {/* Answer / Result */}
            {!status ? (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <input
                    className="input-field"
                    placeholder="Type your answer..."
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    style={{ flex: 1, fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', animation: wrong ? 'shake .4s ease' : 'none', border: wrong ? '2px solid var(--red)' : undefined }}
                  />
                  <button className="btn btn-blue" onClick={submit} style={{ flexShrink: 0 }}>Submit</button>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {!showHint && <button className="btn btn-outline btn-sm" onClick={() => setShowHint(true)}>💡 Show Hint (-20 pts)</button>}
                  <button className="btn btn-outline btn-sm" onClick={skip} style={{ marginLeft: 'auto', color: 'var(--ink3)' }}>Skip today</button>
                </div>
              </div>
            ) : status.correct ? (
              <div>
                <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green)', borderRadius: 14, padding: '20px', textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎉</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>Correct! +{status.points} pts</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--green)', fontWeight: 700 }}>Answer: {challenge.a}</div>
                </div>
                <div style={{ background: 'var(--violet-bg)', borderLeft: '3px solid var(--violet)', borderRadius: '0 12px 12px 0', padding: '12px 16px', fontSize: '.83rem', color: 'var(--ink2)', fontStyle: 'italic', fontWeight: 500 }}>
                  📖 {challenge.verse}
                </div>
                <div style={{ marginTop: 16, textAlign: 'center', fontSize: '.82rem', color: 'var(--ink3)', fontWeight: 500 }}>
                  Next challenge in <strong style={{ color: 'var(--blue)' }}>{hLeft}h {mLeft}m</strong>
                </div>
              </div>
            ) : status.skipped ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '.85rem', color: 'var(--ink3)', fontWeight: 500, marginBottom: 8 }}>
                  Today's answer was: <strong style={{ color: 'var(--ink)' }}>{challenge.a}</strong>
                </div>
                <div style={{ background: 'var(--violet-bg)', borderLeft: '3px solid var(--violet)', borderRadius: '0 12px 12px 0', padding: '11px 14px', fontSize: '.82rem', color: 'var(--ink2)', fontStyle: 'italic', fontWeight: 500 }}>
                  📖 {challenge.verse}
                </div>
                <div style={{ marginTop: 12, fontSize: '.8rem', color: 'var(--ink3)', fontWeight: 500 }}>Come back tomorrow! Next in <strong style={{ color: 'var(--blue)' }}>{hLeft}h {mLeft}m</strong></div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  )
}
