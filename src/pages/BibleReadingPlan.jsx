import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBadges } from '../context/BadgeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// ── Reading Plans ──────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'psalms-week',
    title: '7-Day Psalms Journey',
    emoji: '🎵',
    color: '#3B82F6',
    desc: 'Start your faith journey with the most beloved book in the Bible.',
    days: 7,
    tags: ['Beginner', 'Devotional'],
    readings: [
      { day:1, passages:['Psalm 1','Psalm 2','Psalm 3'],       theme:'The Blessed Life',       note:'Psalm 1 sets up the entire Psalter: two roads, two destinations. Which are you walking?' },
      { day:2, passages:['Psalm 22','Psalm 23','Psalm 24'],    theme:'From Suffering to Triumph', note:'Psalm 22 prophesies the cross. Psalm 23 gives peace. Psalm 24 announces the King.' },
      { day:3, passages:['Psalm 46','Psalm 47','Psalm 48'],    theme:'God is Our Refuge',        note:'"Be still and know that I am God." What do you need to be still about today?' },
      { day:4, passages:['Psalm 51','Psalm 52','Psalm 53'],    theme:'Confession & Repentance',  note:'David wrote Psalm 51 after his greatest failure. What does genuine repentance look like?' },
      { day:5, passages:['Psalm 91','Psalm 92','Psalm 93'],    theme:'Divine Protection',        note:'"He who dwells in the shelter of the Most High will rest in the shadow of the Almighty."' },
      { day:6, passages:['Psalm 103','Psalm 104'],             theme:'Praise & Creation',        note:'Count your blessings as you read. How many can you name from today\'s passages?' },
      { day:7, passages:['Psalm 139','Psalm 145','Psalm 150'], theme:'Known & Loved by God',     note:'Psalm 139: God knows you completely and loves you completely. Let that sink in.' },
    ],
  },
  {
    id: 'life-of-jesus',
    title: '30-Day Life of Jesus',
    emoji: '✝️',
    color: '#10B981',
    desc: 'Walk through the life, death, and resurrection of Jesus in 30 days.',
    days: 30,
    tags: ['Intermediate', 'Gospel'],
    readings: [
      { day:1,  passages:['Luke 1:1-25'],       theme:'The Announcement',         note:'Luke opens with carefully researched history. The angel Gabriel appears to Zechariah. A miraculous birth is coming.' },
      { day:2,  passages:['Luke 1:26-56'],       theme:'Mary\'s Yes',              note:'"I am the Lord\'s servant. May your word to me be fulfilled." What does full surrender look like?' },
      { day:3,  passages:['Luke 2:1-20'],        theme:'The Birth of Jesus',       note:'The creator of the universe born in a stable. Why did God choose this?' },
      { day:4,  passages:['Luke 2:21-52'],       theme:'The Boy Jesus',            note:'Jesus at 12 in the Temple. "Did you not know I had to be in my Father\'s house?"' },
      { day:5,  passages:['Matthew 3','Luke 3:21-38'], theme:'Baptism & Identity', note:'The Father speaks over Jesus: "This is my Son, whom I love." Do you know you are loved like that?' },
      { day:6,  passages:['Luke 4:1-13'],        theme:'The Temptation',           note:'Jesus defeats the devil with scripture three times. What scriptures are your weapons?' },
      { day:7,  passages:['Luke 4:14-44'],       theme:'Ministry Begins',          note:'"The Spirit of the Lord is on me, because he has anointed me to proclaim good news to the poor."' },
      { day:8,  passages:['Matthew 5:1-48'],     theme:'Sermon on the Mount I',    note:'The Beatitudes: the radical upside-down Kingdom. Which one speaks most to you today?' },
      { day:9,  passages:['Matthew 6:1-34'],     theme:'Sermon on the Mount II',   note:'The Lord\'s Prayer. Do not worry. Seek first His Kingdom. What are you worried about?' },
      { day:10, passages:['Matthew 7:1-29'],     theme:'Sermon on the Mount III',  note:'"Ask, seek, knock." The house on the rock. Jesus finishes the greatest sermon in history.' },
      { day:11, passages:['Luke 7:1-50'],        theme:'Faith & Forgiveness',      note:'A centurion\'s great faith. A widow\'s son raised. A sinful woman forgiven. All in one chapter.' },
      { day:12, passages:['Matthew 13:1-52'],    theme:'Parables of the Kingdom',  note:'The Sower, the Mustard Seed, the Hidden Treasure. Which parable grabs your heart today?' },
      { day:13, passages:['Mark 4:35-5:43'],     theme:'Power Over All Things',    note:'Wind and waves obey. Demons flee. A woman healed. A girl raised. What can\'t Jesus do?' },
      { day:14, passages:['Luke 10:1-42'],       theme:'Mission & Mercy',          note:'The 72 sent out. The Good Samaritan. "Mary chose what is better." Which are you — Martha or Mary?' },
      { day:15, passages:['Luke 15:1-32'],       theme:'Three Parables of Loss',   note:'Lost sheep. Lost coin. Lost son. God searches, celebrates, and runs toward the returning prodigal.' },
      { day:16, passages:['John 11:1-53'],       theme:'I Am the Resurrection',    note:'"Jesus wept." Then He raised Lazarus. He is moved by our grief AND has power over death.' },
      { day:17, passages:['Luke 17:11-18:43'],   theme:'Faith, Persistence, Sight', note:'10 lepers, 1 returns. The persistent widow. Blind Bartimaeus cries out. Who do you identify with?' },
      { day:18, passages:['Luke 19:1-48'],       theme:'Palm Sunday Week Begins',  note:'Zacchaeus. The triumphal entry. Jesus weeps over Jerusalem. "If you had only known..."' },
      { day:19, passages:['Matthew 22:1-23:39'], theme:'Teaching in the Temple',   note:'The Great Commandment. Woe to the Pharisees. Religious form without heart is dangerous.' },
      { day:20, passages:['John 13:1-38'],       theme:'The Last Supper Begins',   note:'Jesus washes feet. "Love one another as I have loved you." This is His new commandment.' },
      { day:21, passages:['John 14:1-31'],       theme:'I Am the Way',            note:'"Do not let your hearts be troubled." "I am the way, the truth and the life." Jesus comforts us.' },
      { day:22, passages:['John 15:1-16:33'],    theme:'The Vine and the Spirit',  note:'"Remain in me." "I have told you these things so that in me you may have peace."' },
      { day:23, passages:['John 17:1-26'],       theme:'The High Priestly Prayer', note:'Jesus prays FOR YOU before His death: "I pray for those who will believe in me."' },
      { day:24, passages:['Luke 22:39-23:25'],   theme:'Gethsemane to Trial',     note:'"Not my will but yours." Betrayal, arrest, trial. Jesus suffered for you willingly.' },
      { day:25, passages:['Luke 23:26-56'],      theme:'The Cross',               note:'"Father, forgive them." "Today you will be with me in paradise." "It is finished."' },
      { day:26, passages:['Luke 24:1-35'],       theme:'The Empty Tomb',          note:'The stone is rolled away. "Why do you look for the living among the dead?"' },
      { day:27, passages:['Luke 24:36-53'],      theme:'Appearances & Ascension', note:'He opens their minds to understand scripture. Then He ascends. The mission is theirs now.' },
      { day:28, passages:['Acts 1:1-2:47'],      theme:'Pentecost',               note:'The Spirit falls. 3,000 are saved. The Church is born. This changes everything.' },
      { day:29, passages:['Revelation 1:1-20'],  theme:'The Risen Christ Revealed', note:'John sees Jesus in His glorified state. This is not the baby in a manger — this is the King of kings.' },
      { day:30, passages:['Revelation 21:1-22:21'], theme:'All Things New',       note:'"Behold, I make all things new." No more tears. No more death. Come, Lord Jesus.' },
    ],
  },
  {
    id: 'faith-foundations',
    title: '21-Day Faith Foundations',
    emoji: '🏛️',
    color: '#8B5CF6',
    desc: 'The core doctrines every believer should know — creation, sin, salvation, and eternity.',
    days: 21,
    tags: ['Intermediate', 'Theology'],
    readings: [
      { day:1,  passages:['Genesis 1:1-2:3'],           theme:'In the Beginning',        note:'God creates out of nothing. Every word, "it was good." What does it mean that you are made in His image?' },
      { day:2,  passages:['Genesis 3:1-24'],            theme:'The Fall',                note:'Sin enters. Shame, blame, hiding. But even here — God makes a covering and promises a Rescuer.' },
      { day:3,  passages:['Genesis 12:1-9','15:1-21'],  theme:'The Covenant',            note:'God calls one man to bless all nations. This is where the Bible\'s main story begins.' },
      { day:4,  passages:['Exodus 12:1-32'],            theme:'The Passover',            note:'The lamb\'s blood on the door. The Angel of Death passes over. This is the picture of the cross.' },
      { day:5,  passages:['Exodus 20:1-21'],            theme:'The Ten Commandments',    note:'God defines righteousness. Why do we need the Law? To show us we need a Saviour.' },
      { day:6,  passages:['Isaiah 53:1-12'],            theme:'The Suffering Servant',   note:'Written 700 years before Jesus — read it and see the cross on every line.' },
      { day:7,  passages:['John 3:1-21'],               theme:'Born Again',              note:'"For God so loved the world..." What does it mean to be born of the Spirit?' },
      { day:8,  passages:['Romans 3:21-31','5:1-11'],   theme:'Justified by Faith',      note:'We are declared righteous — not because of our goodness, but because of His.' },
      { day:9,  passages:['Romans 6:1-23'],             theme:'Dead to Sin, Alive in Christ', note:'Baptism as burial. Rising to new life. You are not a slave to sin anymore.' },
      { day:10, passages:['Romans 8:1-39'],             theme:'Life in the Spirit',      note:'The greatest chapter in Romans. Read slowly. "Nothing shall separate us from the love of God."' },
      { day:11, passages:['Ephesians 1:1-2:22'],        theme:'Every Spiritual Blessing', note:'You are chosen, adopted, redeemed, sealed. Count every blessing in Ephesians 1.' },
      { day:12, passages:['Hebrews 11:1-40'],           theme:'The Hall of Faith',        note:'By faith, by faith, by faith. What is faith? Trust that God\'s promises are as real as what you see.' },
      { day:13, passages:['1 Corinthians 15:1-58'],     theme:'The Resurrection',        note:'If Christ is not raised, our faith is useless. But He IS raised. "Death has been swallowed in victory!"' },
      { day:14, passages:['Galatians 5:1-26'],          theme:'Free in Christ',          note:'You are free. Don\'t go back to slavery. Walk by the Spirit and bear His fruit.' },
      { day:15, passages:['Philippians 2:1-18'],        theme:'The Mind of Christ',      note:'Jesus humbled Himself. He is our model. "Let this mind be in you which was also in Christ Jesus."' },
      { day:16, passages:['1 John 4:1-21'],             theme:'God Is Love',             note:'"We love because he first loved us." Love is not a feeling — it\'s the character of God given to us.' },
      { day:17, passages:['Revelation 4:1-5:14'],       theme:'Worship in Heaven',       note:'The 24 elders fall before the throne. The Lamb is worthy. All creation worships. Join in.' },
      { day:18, passages:['John 14:1-31'],              theme:'The Holy Spirit Promised', note:'"I will ask the Father and He will give you another Advocate." The Spirit lives IN you.' },
      { day:19, passages:['Matthew 28:16-20','Acts 1:1-11'], theme:'The Great Commission', note:'"Go and make disciples." This is still the mission. How are you participating?' },
      { day:20, passages:['Revelation 20:1-15'],        theme:'Final Judgment',          note:'Every book is opened. The dead are judged. Then death itself is defeated.' },
      { day:21, passages:['Revelation 21:1-22:21'],     theme:'The New Creation',        note:'All things new. God dwelling with His people. The river of life. "Come, Lord Jesus." — Amen.' },
    ],
  },
]

export default function BibleReadingPlan() {
  const { user } = useAuth()
  const { awardBadge } = useBadges()
  const [activePlan, setActivePlan] = useState(null)
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bfl_reading_progress') || '{}') } catch { return {} }
  })
  const [view, setView] = useState('home') // home | reading
  const [activeDay, setActiveDay] = useState(null)

  function saveProgress(planId, day, checked) {
    const key = `${planId}-day${day}`
    const newProg = { ...progress, [key]: checked }
    setProgress(newProg)
    localStorage.setItem('bfl_reading_progress', JSON.stringify(newProg))

    // Check for plan completion
    const plan = PLANS.find(p => p.id === planId)
    if (plan) {
      const completedDays = plan.readings.filter(r => newProg[`${planId}-day${r.day}`]).length
      if (completedDays === 1) awardBadge('reading_plan')
      if (completedDays === plan.readings.length) awardBadge('reading_finish')
    }
  }

  function isChecked(planId, day) { return !!progress[`${planId}-day${day}`] }
  function getPlanProgress(planId) {
    const plan = PLANS.find(p => p.id === planId)
    if (!plan) return 0
    const done = plan.readings.filter(r => isChecked(planId, r.day)).length
    return Math.round((done / plan.readings.length) * 100)
  }

  function openPlan(plan) { setActivePlan(plan); setActiveDay(plan.readings[0]); setView('reading') }

  if (view === 'reading' && activePlan && activeDay) {
    const prog = getPlanProgress(activePlan.id)
    const dayIdx = activePlan.readings.findIndex(r => r.day === activeDay.day)
    return (
      <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
        <div style={{ background:`linear-gradient(135deg,${activePlan.color}22,${activePlan.color}08)`, borderBottom:'1px solid var(--border)', padding:'40px 36px 28px' }}>
          <button onClick={() => setView('home')} style={{ fontSize:'.8rem', fontWeight:700, color:'var(--blue)', background:'none', border:'none', cursor:'pointer', marginBottom:16, fontFamily:'Poppins,sans-serif', display:'flex', alignItems:'center', gap:5 }}>← All Plans</button>
          <div style={{ maxWidth:820, margin:'0 auto', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', justifyContent:'space-between' }}>
            <div>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <span style={{ fontSize:'1.4rem' }}>{activePlan.emoji}</span>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.3rem', fontWeight:800, color:'var(--ink)' }}>{activePlan.title}</div>
              </div>
              <div style={{ fontSize:'.8rem', color:'var(--ink3)', fontWeight:500 }}>Day {activeDay.day} of {activePlan.days} · {prog}% complete</div>
            </div>
            <div style={{ height:8, flex:'0 0 200px', borderRadius:100, background:'var(--bg3)', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:100, background:activePlan.color, width:`${prog}%`, transition:'width .4s ease' }} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth:820, margin:'0 auto', padding:'32px 24px', display:'grid', gridTemplateColumns:'280px 1fr', gap:24, alignItems:'start' }}>
          {/* Day list */}
          <div style={{ background:'var(--surface)', borderRadius:18, border:'1.5px solid var(--border)', overflow:'hidden' }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', fontFamily:"'Baloo 2',cursive", fontSize:'.9rem', fontWeight:800, color:'var(--ink)' }}>
              📅 {activePlan.days}-Day Plan
            </div>
            <div style={{ maxHeight:440, overflowY:'auto' }}>
              {activePlan.readings.map(r => {
                const done = isChecked(activePlan.id, r.day)
                const isActive = r.day === activeDay.day
                return (
                  <div key={r.day} onClick={() => setActiveDay(r)} style={{ padding:'12px 16px', cursor:'pointer', background: isActive ? `${activePlan.color}12` : 'transparent', borderLeft: isActive ? `3px solid ${activePlan.color}` : '3px solid transparent', display:'flex', alignItems:'center', gap:10, transition:'all .2s' }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background: done ? activePlan.color : 'var(--bg3)', border:`2px solid ${done ? activePlan.color : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'.68rem', color: done ? 'white' : 'var(--ink3)', fontWeight:800 }}>
                      {done ? '✓' : r.day}
                    </div>
                    <div>
                      <div style={{ fontSize:'.78rem', fontWeight:700, color: isActive ? activePlan.color : 'var(--ink)', lineHeight:1.2 }}>{r.theme}</div>
                      <div style={{ fontSize:'.65rem', color:'var(--ink3)', fontWeight:500 }}>{r.passages.join(', ')}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reading content */}
          <div>
            <div style={{ background:'var(--surface)', borderRadius:22, border:'1.5px solid var(--border)', overflow:'hidden', marginBottom:16 }}>
              <div style={{ background:`linear-gradient(135deg,${activePlan.color}18,${activePlan.color}08)`, padding:'24px 28px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:'.7rem', fontWeight:800, textTransform:'uppercase', letterSpacing:1, color:activePlan.color, marginBottom:8 }}>Day {activeDay.day} · {activePlan.emoji}</div>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.5rem', fontWeight:800, color:'var(--ink)', marginBottom:6 }}>{activeDay.theme}</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {activeDay.passages.map((p,i) => <span key={i} style={{ fontSize:'.76rem', fontWeight:700, padding:'4px 12px', borderRadius:100, background:`${activePlan.color}18`, color:activePlan.color, border:`1px solid ${activePlan.color}30` }}>{p}</span>)}
                </div>
              </div>
              <div style={{ padding:'24px 28px' }}>
                <div style={{ background:'var(--violet-bg)', borderLeft:`3px solid ${activePlan.color}`, borderRadius:'0 12px 12px 0', padding:'14px 18px', fontSize:'.88rem', color:'var(--ink2)', fontStyle:'italic', fontWeight:500, lineHeight:1.7, marginBottom:20 }}>
                  💭 {activeDay.note}
                </div>
                <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', paddingTop:16, borderTop:'1px solid var(--border)' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', flex:1 }}>
                    <input type="checkbox" checked={isChecked(activePlan.id, activeDay.day)} onChange={e => saveProgress(activePlan.id, activeDay.day, e.target.checked)} style={{ width:20, height:20, accentColor:activePlan.color, cursor:'pointer' }} />
                    <span style={{ fontSize:'.86rem', fontWeight:700, color:'var(--ink)' }}>Mark Day {activeDay.day} as Complete</span>
                  </label>
                  {dayIdx < activePlan.readings.length - 1 && (
                    <button className="btn btn-sm" style={{ background:`linear-gradient(135deg,${activePlan.color},${activePlan.color}bb)`, color:'white', border:'none' }}
                      onClick={() => { saveProgress(activePlan.id, activeDay.day, true); setActiveDay(activePlan.readings[dayIdx + 1]) }}>
                      Next Day →
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <a href="/devotional" className="btn btn-outline btn-sm">🙏 Get AI Devotional</a>
              <a href="/prayer-beads" className="btn btn-outline btn-sm">📿 Meditate</a>
              <a href="/notes" className="btn btn-outline btn-sm">📝 Take Notes</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0F0F1A,#0D1B2A)', padding:'56px 36px 44px', textAlign:'center' }}>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, background:'linear-gradient(90deg,#60A5FA,#34D399,#FCD34D)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>
          📅 Bible Reading Plans
        </h1>
        <p style={{ color:'rgba(255,255,255,.5)', fontSize:'.92rem', fontWeight:500 }}>
          Structured daily reading with devotional notes. Check off each day. Build the habit.
        </p>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
          {PLANS.map(plan => {
            const prog = getPlanProgress(plan.id)
            return (
              <div key={plan.id} style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', overflow:'hidden', boxShadow:'var(--sh)', transition:'all .28s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow=`0 20px 60px ${plan.color}18`}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='var(--sh)'}}>
                <div style={{ background:`linear-gradient(135deg,${plan.color}20,${plan.color}08)`, padding:'28px 24px', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:'2.8rem', marginBottom:12 }}>{plan.emoji}</div>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.2rem', fontWeight:800, color:'var(--ink)', marginBottom:6 }}>{plan.title}</div>
                  <div style={{ fontSize:'.82rem', color:'var(--ink3)', fontWeight:500, lineHeight:1.6, marginBottom:12 }}>{plan.desc}</div>
                  <div style={{ display:'flex', gap:7 }}>
                    <span style={{ fontSize:'.68rem', fontWeight:700, padding:'3px 9px', borderRadius:100, background:`${plan.color}18`, color:plan.color }}>{plan.days} Days</span>
                    {plan.tags.map(t => <span key={t} style={{ fontSize:'.68rem', fontWeight:700, padding:'3px 9px', borderRadius:100, background:'var(--bg2)', color:'var(--ink3)' }}>{t}</span>)}
                  </div>
                </div>
                <div style={{ padding:'20px 24px' }}>
                  {prog > 0 && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.74rem', fontWeight:700, color:'var(--ink3)', marginBottom:6 }}>
                        <span>Progress</span><span style={{ color:plan.color }}>{prog}%</span>
                      </div>
                      <div style={{ height:6, borderRadius:100, background:'var(--bg3)', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:100, background:plan.color, width:`${prog}%`, transition:'width .4s' }} />
                      </div>
                    </div>
                  )}
                  <button onClick={() => openPlan(plan)} style={{ width:'100%', padding:'12px 0', borderRadius:14, border:'none', background:`linear-gradient(135deg,${plan.color},${plan.color}bb)`, color:'white', fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'.86rem', cursor:'pointer', transition:'all .2s', boxShadow:`0 4px 16px ${plan.color}30` }}>
                    {prog === 0 ? '📅 Start Plan' : prog === 100 ? '✅ Completed! Read Again' : `▶ Continue — Day ${Math.ceil(prog/100*plan.days)}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
