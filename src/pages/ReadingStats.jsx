import { useState, useEffect } from 'react'

const BOOKS_OT = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi']
const BOOKS_NT = ['Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation']
const CHAPTERS = { Genesis:50,Exodus:40,Leviticus:27,Numbers:36,Deuteronomy:34,Joshua:24,Judges:21,Ruth:4,'1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,'1 Chronicles':29,'2 Chronicles':36,Ezra:10,Nehemiah:13,Esther:10,Job:42,Psalms:150,Proverbs:31,Ecclesiastes:12,'Song of Solomon':8,Isaiah:66,Jeremiah:52,Lamentations:5,Ezekiel:48,Daniel:12,Hosea:14,Joel:3,Amos:9,Obadiah:1,Jonah:4,Micah:7,Nahum:3,Habakkuk:3,Zephaniah:3,Haggai:2,Zechariah:14,Malachi:4,Matthew:28,Mark:16,Luke:24,John:21,Acts:28,Romans:16,'1 Corinthians':16,'2 Corinthians':13,Galatians:6,Ephesians:6,Philippians:4,Colossians:4,'1 Thessalonians':5,'2 Thessalonians':3,'1 Timothy':6,'2 Timothy':4,Titus:3,Philemon:1,Hebrews:13,James:5,'1 Peter':5,'2 Peter':3,'1 John':5,'2 John':1,'3 John':1,Jude:1,Revelation:22 }
const TOTAL_CHAPTERS = Object.values(CHAPTERS).reduce((a,b)=>a+b,0) // 1189

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getReadData() {
  try { return JSON.parse(localStorage.getItem('bfl_read_books') || '{}') } catch { return {} }
}

function getStreakData() {
  try { return JSON.parse(localStorage.getItem('bfl_reading_log') || '[]') } catch { return [] }
}

function buildHeatmap(log) {
  const map = {}
  log.forEach(d => { map[d] = (map[d] || 0) + 1 })
  return map
}

function last365() {
  const dates = []
  for (let i = 364; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export default function ReadingStats() {
  const [readBooks,  setReadBooks]  = useState(getReadData)
  const [log,        setLog]        = useState(getStreakData)
  const [tab,        setTab]        = useState('overview') // overview | books | heatmap
  const [logToday,   setLogToday]   = useState(false)

  const readData = buildHeatmap(log)
  const dates365 = last365()

  // Stats
  const chaptersRead  = Object.entries(readBooks).reduce((n,[book, chs]) => n + (Array.isArray(chs) ? chs.length : 0), 0)
  const booksComplete = Object.entries(readBooks).filter(([book, chs]) => Array.isArray(chs) && chs.length >= (CHAPTERS[book]||1)).length
  const pctComplete   = Math.round((chaptersRead / TOTAL_CHAPTERS) * 100)
  const daysActive    = Object.keys(readData).length
  const currentStreak = (() => {
    let s = 0; const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      if (readData[d.toISOString().split('T')[0]]) s++; else break
    }
    return s
  })()
  const longestStreak = (() => {
    let max = 0, cur = 0
    dates365.forEach(d => { if (readData[d]) { cur++; max = Math.max(max, cur) } else cur = 0 })
    return max
  })()

  // Most active day of week
  const dayCount = Array(7).fill(0)
  log.forEach(d => { dayCount[new Date(d).getDay()]++ })
  const bestDay = DAYS[dayCount.indexOf(Math.max(...dayCount))]

  function markToday() {
    const today = new Date().toISOString().split('T')[0]
    const newLog = [...new Set([...log, today])]
    setLog(newLog)
    localStorage.setItem('bfl_reading_log', JSON.stringify(newLog))
    setLogToday(true)
  }

  function toggleChapter(book, ch) {
    setReadBooks(rb => {
      const current = rb[book] || []
      const updated  = current.includes(ch) ? current.filter(c=>c!==ch) : [...current, ch]
      const next = { ...rb, [book]: updated }
      localStorage.setItem('bfl_read_books', JSON.stringify(next))
      return next
    })
    markToday()
  }

  const heatColor = (count) => {
    if (!count) return 'var(--bg3)'
    if (count >= 4) return '#064E3B'
    if (count >= 3) return '#065F46'
    if (count >= 2) return '#059669'
    return '#34D399'
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0F0F1A,#0A1A14)', padding:'48px 36px 36px', textAlign:'center' }}>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, background:'linear-gradient(90deg,#6EE7B7,#60A5FA,#FCD34D)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>📊 Reading Stats</h1>
        <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.88rem', fontWeight:500 }}>Your Bible reading journey, visualized. Every chapter counts.</p>
      </div>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'28px 20px' }}>
        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
          {[
            ['📖', chaptersRead, 'Chapters Read', 'var(--blue)'],
            ['✅', booksComplete, 'Books Complete', 'var(--green)'],
            ['🔥', currentStreak, 'Day Streak', 'var(--orange)'],
            ['⚡', longestStreak, 'Best Streak', 'var(--violet)'],
            ['📅', daysActive, 'Active Days', 'var(--blue)'],
            ['🌍', pctComplete + '%', 'Bible Complete', 'var(--yellow)'],
            ['🏆', bestDay, 'Best Day', 'var(--green)'],
          ].map(([e, v, l, c]) => (
            <div key={l} style={{ background:'var(--surface)', borderRadius:16, border:'1.5px solid var(--border)', padding:'18px 16px', textAlign:'center' }}>
              <div style={{ fontSize:'1.6rem', marginBottom:4 }}>{e}</div>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:'1.3rem', color:c }}>{v}</div>
              <div style={{ fontSize:'.68rem', color:'var(--ink3)', fontWeight:600, textTransform:'uppercase', letterSpacing:.5 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ background:'var(--surface)', borderRadius:18, border:'1.5px solid var(--border)', padding:'20px 24px', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', fontSize:'.95rem' }}>📖 Bible Completion</div>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--green)', fontSize:'.95rem' }}>{chaptersRead} / {TOTAL_CHAPTERS} chapters</div>
          </div>
          <div style={{ height:16, borderRadius:100, background:'var(--bg3)', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:100, background:'linear-gradient(90deg,#064E3B,#34D399)', width:`${pctComplete}%`, transition:'width .5s', boxShadow:'0 0 12px rgba(52,211,153,.3)' }} />
          </div>
          <div style={{ fontSize:'.72rem', color:'var(--ink3)', fontWeight:500, marginTop:8 }}>{1189 - chaptersRead} chapters remaining to complete the entire Bible</div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {[['overview','📊 Overview'],['heatmap','🗓 Heatmap'],['books','📚 Books']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ fontSize:'.8rem', fontWeight:700, padding:'9px 18px', borderRadius:12, border:`1.5px solid ${tab===id?'var(--green)':'var(--border)'}`, background:tab===id?'var(--green-bg)':'var(--surface)', color:tab===id?'var(--green)':'var(--ink3)', cursor:'pointer', transition:'all .2s' }}>{label}</button>
          ))}
          <button onClick={markToday} disabled={logToday} className="btn btn-green btn-sm" style={{ marginLeft:'auto' }}>
            {logToday ? '✅ Today Logged' : '+ Log Today'}
          </button>
        </div>

        {/* Heatmap */}
        {tab==='heatmap' && (
          <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:'24px', overflowX:'auto' }}>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', marginBottom:16 }}>📅 Reading Activity — Last 365 Days</div>
            <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
              {dates365.map(d => {
                const count = readData[d] || 0
                const date  = new Date(d)
                return (
                  <div key={d} title={`${d}: ${count} session${count!==1?'s':''}`} style={{ width:14, height:14, borderRadius:3, background:heatColor(count), cursor:'default', transition:'transform .1s' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.4)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} />
                )
              })}
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:12 }}>
              <span style={{ fontSize:'.68rem', color:'var(--ink3)', fontWeight:500 }}>Less</span>
              {['var(--bg3)','#34D399','#059669','#065F46','#064E3B'].map((c,i) => <div key={i} style={{ width:12, height:12, borderRadius:2, background:c }} />)}
              <span style={{ fontSize:'.68rem', color:'var(--ink3)', fontWeight:500 }}>More</span>
            </div>
          </div>
        )}

        {/* Overview */}
        {tab==='overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* OT vs NT */}
            <div style={{ background:'var(--surface)', borderRadius:18, border:'1.5px solid var(--border)', padding:'20px' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', marginBottom:14 }}>OT vs NT Progress</div>
              {[['Old Testament',BOOKS_OT,'var(--yellow)'],['New Testament',BOOKS_NT,'var(--blue)']].map(([label,books,color]) => {
                const total = books.reduce((n,b)=>n+(CHAPTERS[b]||0),0)
                const read  = books.reduce((n,b)=>n+((readBooks[b]||[]).length),0)
                const pct   = Math.round((read/total)*100)
                return (
                  <div key={label} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.78rem', fontWeight:700, color:'var(--ink2)', marginBottom:5 }}>
                      <span>{label}</span><span style={{ color }}>{pct}%</span>
                    </div>
                    <div style={{ height:10, borderRadius:100, background:'var(--bg3)', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:100, background:color, width:`${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Day of week */}
            <div style={{ background:'var(--surface)', borderRadius:18, border:'1.5px solid var(--border)', padding:'20px' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', marginBottom:14 }}>Most Active Day</div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:80 }}>
                {DAYS.map((day, i) => {
                  const max = Math.max(...dayCount, 1)
                  const h   = Math.round((dayCount[i] / max) * 70)
                  return (
                    <div key={day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{ width:'100%', height:h, borderRadius:'6px 6px 0 0', background: dayCount[i]===Math.max(...dayCount)?'var(--green)':'var(--bg3)', minHeight:4 }} />
                      <div style={{ fontSize:'.62rem', fontWeight:700, color:'var(--ink3)' }}>{day}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Books tracker */}
        {tab==='books' && (
          <div>
            {[['📜 Old Testament', BOOKS_OT],['✝️ New Testament', BOOKS_NT]].map(([label, books]) => (
              <div key={label} style={{ marginBottom:24 }}>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.05rem', fontWeight:800, color:'var(--ink)', marginBottom:12 }}>{label}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
                  {books.map(book => {
                    const total   = CHAPTERS[book] || 1
                    const readChs = (readBooks[book] || []).length
                    const pct     = Math.round((readChs/total)*100)
                    const done    = readChs >= total
                    return (
                      <div key={book} style={{ background:'var(--surface)', borderRadius:12, border:`1.5px solid ${done?'var(--green)':'var(--border)'}`, padding:'12px 14px', transition:'all .2s' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <span style={{ fontSize:'.82rem', fontWeight:700, color: done?'var(--green)':'var(--ink)' }}>{done && '✅ '}{book}</span>
                          <span style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:600 }}>{readChs}/{total}</span>
                        </div>
                        <div style={{ height:5, borderRadius:100, background:'var(--bg3)', overflow:'hidden', marginBottom:8 }}>
                          <div style={{ height:'100%', borderRadius:100, background:done?'var(--green)':'var(--blue)', width:`${pct}%` }} />
                        </div>
                        {/* Chapter dots */}
                        <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                          {Array.from({length:total},(_,i)=>i+1).map(ch => (
                            <div key={ch} onClick={() => toggleChapter(book, ch)} title={`Chapter ${ch}`}
                              style={{ width:14, height:14, borderRadius:3, background:(readBooks[book]||[]).includes(ch)?'var(--green)':'var(--bg3)', cursor:'pointer', transition:'all .15s', fontSize:'.5rem', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800 }}
                              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.3)'}
                              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
