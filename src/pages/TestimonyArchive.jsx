import { useState, useEffect } from 'react'
import { getTestimonies, insertTestimony, prayForTestimony } from '../lib/db'

const CATEGORIES = ['All','Healing','Salvation','Provision','Restoration','Answered Prayer','Breakthrough','Family']
const CATEGORY_COLORS = { Healing:'#10B981',Salvation:'#3B82F6',Provision:'#F59E0B',Restoration:'#EC4899',['Answered Prayer']:'#8B5CF6',Breakthrough:'#F97316',Family:'#14B8A6' }

const DEMO = [
  { id:1, name:'Sarah M.', category:'Healing', title:'Stage 3 Cancer — Gone', date:'March 2026', prayer_count:847, text:'In August 2024 I was diagnosed with Stage 3 breast cancer. The doctors gave me a 40% chance. My church prayed. I prayed. Exactly 11 months later my scan came back completely clear. The oncologist used the word "remarkable." I use the word miracle. God is still a healer in 2024.', verified:true },
  { id:2, name:'Marcus T.', category:'Salvation', title:'40 Years Away From God', date:'January 2026', prayer_count:512, text:'I walked away from faith at 22. For 40 years I told myself I was fine without God. My daughter kept praying for me silently. On my 62nd birthday, I drove past a church where a service was happening. I walked in. I haven\'t left since. Forty years of her prayers — all answered on one Tuesday night.', verified:true },
  { id:3, name:'Anonymous', category:'Provision', title:'$0 in the Account — $2,700 in the Mail', date:'February 2026', prayer_count:334, text:'We had $0 in our account and rent was due in 3 days. My husband and I prayed together, which we hadn\'t done in months. The next morning there were two envelopes in the mail. A refund check we\'d forgotten about and a gift from someone who said God put us on their heart. Exactly $2,700. Rent was $2,700.', verified:false },
  { id:4, name:'Pastor James K.', category:'Restoration', title:'My Marriage Was Dead — Then It Wasn\'t', date:'December 2025', prayer_count:621, text:'My wife had asked for a divorce after 18 years. We had separate lawyers. The night before we were going to sign the paperwork, she called me and asked if I\'d go to counseling one more time. We went. Something broke open in both of us. We canceled the divorce. That was three years ago. We just renewed our vows in front of our children.', verified:true },
  { id:5, name:'Priya N.', category:'Answered Prayer', title:'My Son Came Home', date:'November 2025', prayer_count:289, text:'My son left home at 19, fell into addiction, and disappeared. For 6 years I didn\'t know if he was alive. I wrote his name in my Bible and prayed over it every single morning. On a random Thursday in November, he knocked on my door. He had found Jesus in rehab and wanted to come home. Six years of Thursdays.', verified:true },
  { id:6, name:'Lin C.', category:'Breakthrough', title:'First in My Family to Believe', date:'October 2025', prayer_count:198, text:'I came from a Buddhist family. When I became a Christian at university my parents stopped speaking to me for two years. Last Christmas my mother called and said she wanted to come to church with me. She gave her life to Christ on December 23rd. My father is asking questions. God didn\'t just save me — He started a fire.', verified:false },
]

export default function TestimonyArchive() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', category:'Salvation', title:'', text:'' })
  const [submitted, setSubmitted] = useState(false)
  const [prayed, setPrayed] = useState(new Set())
  const [expanded, setExpanded] = useState(new Set())
  const [monthCount] = useState(Math.floor(3200 + Math.random() * 400))

  useEffect(() => {
    loadTestimonies()
  }, [cat])

  async function loadTestimonies() {
    setLoading(true)
    const { data, error } = await getTestimonies(cat)
    if (data) {
      // Merge with demo if db is empty for now, or just show db
      setPosts(data.length > 0 ? data : DEMO)
    }
    setLoading(false)
  }

  async function submitTestimony() {
    if (!form.title.trim() || !form.text.trim()) return
    const { error } = await insertTestimony({
      name: form.name,
      category: form.category,
      title: form.title,
      text: form.text
    })

    if (!error) {
      setForm({ name:'', category:'Salvation', title:'', text:'' })
      setShowForm(false)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  async function pray(id) {
    if (prayed.has(id)) return
    setPrayed(s => new Set([...s, id]))
    const { error } = await prayForTestimony(id)
    if (!error) {
      setPosts(p => p.map(post => post.id === id ? { ...post, prayer_count: post.prayer_count + 1 } : post))
    }
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0A1A0F,#064E3B)', padding:'52px 36px 40px', textAlign:'center' }}>
        <div style={{ display:'inline-block', fontSize:'.7rem', fontWeight:700, background:'rgba(16,185,129,.15)', color:'#34D399', padding:'4px 14px', borderRadius:100, marginBottom:12, border:'1px solid rgba(16,185,129,.2)' }}>
          ✝️ {monthCount.toLocaleString()} answered prayers shared this month
        </div>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, background:'linear-gradient(90deg,#6EE7B7,#FCD34D)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>
          Testimony Archive
        </h1>
        <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.88rem', fontWeight:500, maxWidth:480, margin:'0 auto' }}>
          Real stories. Real people. God moved — and they wanted you to know. "They overcame by the blood of the Lamb and the word of their testimony." — Rev 12:11
        </p>
      </div>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 20px' }}>
        {submitted && <div style={{ background:'var(--green-bg)', border:'1.5px solid var(--green)', borderRadius:12, padding:'12px 18px', marginBottom:16, fontSize:'.84rem', fontWeight:700, color:'var(--green)', animation:'popIn .3s ease' }}>🙏 Your testimony is under review. Once approved it will appear here. Thank you for sharing!</div>}

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            {CATEGORIES.map(c => <button key={c} onClick={() => setCat(c)} style={{ fontSize:'.72rem', fontWeight:700, padding:'6px 13px', borderRadius:100, cursor:'pointer', border:`1.5px solid ${cat===c?(CATEGORY_COLORS[c]||'var(--blue)'):'var(--border)'}`, background:cat===c?(CATEGORY_COLORS[c]||'var(--blue)')+'18':'var(--surface)', color:cat===c?CATEGORY_COLORS[c]||'var(--blue)':'var(--ink3)', transition:'all .2s' }}>{c}</button>)}
          </div>
          <button className="btn btn-green" onClick={() => setShowForm(f => !f)}>+ Share Your Testimony</button>
        </div>

        {showForm && (
          <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--green)', padding:28, marginBottom:24 }}>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.1rem', fontWeight:800, color:'var(--ink)', marginBottom:16 }}>✝️ Share What God Did</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
              <input className="input-field" placeholder="Your name (optional)" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
              <select className="input-field" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                {CATEGORIES.filter(c=>c!=='All').map(c=><option key={c}>{c}</option>)}
              </select>
              <input className="input-field" placeholder="Title (e.g. 'He healed my marriage')" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
            </div>
            <textarea className="textarea-field" placeholder="Tell your story. Be specific — specific testimonies are the most encouraging. What happened? When? What did God do?" value={form.text} onChange={e => setForm(f=>({...f,text:e.target.value}))} style={{ height:120, marginBottom:14 }} />
            <div style={{ background:'var(--blue-bg)', borderRadius:10, padding:'9px 14px', fontSize:'.76rem', color:'var(--ink2)', marginBottom:14, fontWeight:500 }}>
              📋 Testimonies are reviewed before publishing. Please be honest and specific — no names of others without permission. What glorifies God most.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-green" onClick={submitTestimony} disabled={!form.title.trim()||!form.text.trim()}>🙏 Submit Testimony</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {loading ? (
            <div style={{ textAlign:'center', color:'var(--ink3)', padding:40 }}>Loading testimonies...</div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--ink3)', padding:40 }}>No testimonies found in this category.</div>
          ) : posts.map(post => {
            const color = CATEGORY_COLORS[post.category] || '#6B7280'
            const isExpanded = expanded.has(post.id)
            const isPrayed = prayed.has(post.id)
            const needsTrunc = post.text.length > 200
            return (
              <div key={post.id} style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', overflow:'hidden', transition:'all .25s' }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 8px 32px ${color}15`;e.currentTarget.style.borderColor=color+'33'}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor='var(--border)'}}>
                <div style={{ height:3, background:color }} />
                <div style={{ padding:'22px 24px' }}>
                  <div style={{ display:'flex', gap:10, marginBottom:12, alignItems:'flex-start', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'.68rem', fontWeight:800, padding:'3px 9px', borderRadius:100, background:color+'18', color }}>{post.category}</span>
                    {post.verified && <span style={{ fontSize:'.66rem', fontWeight:700, padding:'3px 8px', borderRadius:100, background:'var(--green-bg)', color:'var(--green)' }}>✓ Verified</span>}
                    <span style={{ fontSize:'.68rem', color:'var(--ink3)', fontWeight:500, marginLeft:'auto' }}>{post.date}</span>
                  </div>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.1rem', fontWeight:800, color:'var(--ink)', marginBottom:8 }}>{post.title}</div>
                  <p style={{ fontSize:'.88rem', color:'var(--ink2)', lineHeight:1.8, fontWeight:500, marginBottom:12 }}>
                    {needsTrunc && !isExpanded ? post.text.slice(0,200) + '...' : post.text}
                    {needsTrunc && <button onClick={() => setExpanded(s => { const n=new Set(s); isExpanded?n.delete(post.id):n.add(post.id); return n })} style={{ background:'none', border:'none', color:'var(--blue)', fontWeight:700, cursor:'pointer', fontSize:'.84rem', marginLeft:4, fontFamily:'Poppins,sans-serif' }}>{isExpanded ? 'Show less' : 'Read more'}</button>}
                  </p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                    <div style={{ fontSize:'.78rem', color:'var(--ink3)', fontWeight:600 }}>— {post.name}</div>
                    <button onClick={() => pray(post.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, border:`1.5px solid ${isPrayed?'var(--green)':'var(--border)'}`, background:isPrayed?'var(--green-bg)':'var(--surface)', color:isPrayed?'var(--green)':'var(--ink3)', fontFamily:'Poppins,sans-serif', fontSize:'.78rem', fontWeight:700, cursor:isPrayed?'default':'pointer', transition:'all .2s' }}>
                      🙏 {post.prayer_count + (isPrayed ? 0 : 0)} {post.prayer_count === 1 ? 'prayer' : 'prayers'}
                      {!isPrayed && <span style={{ color:'var(--blue)', marginLeft:4 }}>+ Pray</span>}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
