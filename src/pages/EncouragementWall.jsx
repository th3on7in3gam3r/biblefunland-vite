import { useState, useEffect } from 'react'

const DEMO_POSTS = [
  { id:1, struggle:'I feel like I am not good enough and God could never love me', responses:12, category:'Identity', time:'2 hours ago', answered:true },
  { id:2, struggle:'I\'m struggling with forgiveness. Someone hurt my family deeply and I can\'t let it go.', responses:8, category:'Forgiveness', time:'4 hours ago', answered:true },
  { id:3, struggle:'I pray but it feels like God isn\'t listening. I\'m going through the hardest season of my life.', responses:21, category:'Faith', time:'6 hours ago', answered:true },
  { id:4, struggle:'I\'m afraid of the future. I don\'t know what God wants for my life.', responses:6, category:'Purpose', time:'1 day ago', answered:false },
  { id:5, struggle:'I keep sinning in the same area over and over. I feel like a hypocrite calling myself a Christian.', responses:15, category:'Struggle', time:'1 day ago', answered:true },
  { id:6, struggle:'My faith feels dry. I used to feel God so clearly. Now I feel nothing.', responses:9, category:'Faith', time:'2 days ago', answered:false },
]

const ENCOURAGEMENTS = [
  '"You are loved with an everlasting love." — Jeremiah 31:3',
  '"God is close to the broken-hearted." — Psalm 34:18',
  '"His mercies are new every single morning." — Lamentations 3:23',
  '"You are fearfully and wonderfully made." — Psalm 139:14',
  '"Nothing can separate you from the love of God." — Romans 8:38',
  '"He who began a good work in you will carry it to completion." — Philippians 1:6',
  '"Cast your cares on Him, because He cares for you." — 1 Peter 5:7',
  '"The Lord is close to you right now, in this moment." — Psalm 145:18',
]

const CATS = ['Identity','Forgiveness','Faith','Purpose','Struggle','Grief','Family','General']

export default function EncouragementWall() {
  const [posts, setPosts] = useState(DEMO_POSTS)
  const [activePost, setActivePost] = useState(null)
  const [form, setForm] = useState({ struggle:'', category:'General' })
  const [showForm, setShowForm] = useState(false)
  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [responseSent, setResponseSent] = useState(false)
  const [encouraged, setEncouraged] = useState(new Set())

  function submitStruggle() {
    if (!form.struggle.trim()) return
    const post = { id: Date.now(), struggle: form.struggle, category: form.category, responses: 0, time: 'Just now', answered: false }
    setPosts(p => [post, ...p])
    setForm({ struggle:'', category:'General' })
    setShowForm(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  function sendEncouragement() {
    if (!response.trim() || !activePost) return
    setPosts(p => p.map(post => post.id === activePost.id ? { ...post, responses: post.responses + 1, answered: true } : post))
    setResponse('')
    setResponseSent(true)
    setEncouraged(e => new Set([...e, activePost.id]))
    setTimeout(() => { setResponseSent(false); setActivePost(null) }, 2500)
  }

  const randomEncouragement = ENCOURAGEMENTS[Math.floor(Date.now() / 1000) % ENCOURAGEMENTS.length]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1A1535,#0A1A15)', padding: '56px 36px 44px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.7rem', fontWeight: 700, background: 'rgba(165,180,252,.15)', color: '#A5B4FC', padding: '4px 12px', borderRadius: 100, marginBottom: 12 }}>🗣️ 100% Anonymous · Judgment-Free Zone</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, background: 'linear-gradient(90deg,#A5B4FC,#F9A8D4,#6EE7B7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
          Confession & Encouragement Wall
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500, maxWidth: 480, margin: '0 auto' }}>
          Share what you're struggling with anonymously. The community responds with only encouragement and scripture. No judgment. Ever.
        </p>
      </div>

      {/* Verse of comfort */}
      <div style={{ background: 'var(--violet-bg)', borderBottom: '1px solid var(--border)', padding: '14px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: '.84rem', color: 'var(--ink2)', fontStyle: 'italic', fontWeight: 500 }}>{randomEncouragement}</div>
      </div>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '36px 20px' }}>
        {submitted && (
          <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green)', borderRadius: 12, padding: '12px 18px', marginBottom: 18, fontSize: '.84rem', fontWeight: 700, color: 'var(--green)', animation: 'popIn .3s ease' }}>
            ✅ Your struggle has been shared. The community will lift you up. 🙏
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink)' }}>
            🗣️ {posts.length} struggles shared
          </div>
          <button className="btn btn-violet" onClick={() => setShowForm(f => !f)}>+ Share Your Struggle</button>
        </div>

        {showForm && (
          <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1.5px solid var(--violet)', padding: 28, marginBottom: 24, boxShadow: '0 0 0 4px rgba(139,92,246,.08)' }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>🤫 Share Anonymously</div>
            <p style={{ fontSize: '.84rem', color: 'var(--ink3)', fontWeight: 500, marginBottom: 16 }}>No name. No profile. Just you and a community that cares. Posts are moderated for safety.</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <select className="input-field" value={form.category} onChange={e => setForm(f => ({...f,category:e.target.value}))} style={{ width: 160, flexShrink: 0 }}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <textarea className="textarea-field" placeholder="What are you struggling with? Write freely — this is a safe space..." value={form.struggle} onChange={e => setForm(f => ({...f,struggle:e.target.value}))} style={{ height: 100, marginBottom: 14 }} />
            <div style={{ background: 'var(--orange-bg)', borderRadius: 10, padding: '9px 14px', fontSize: '.76rem', color: 'var(--ink2)', fontWeight: 500, marginBottom: 14 }}>
              ⚠️ Please do not include any personally identifying information. If you are in crisis, please contact 988 (Suicide & Crisis Lifeline) or your local emergency services.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-violet" onClick={submitStruggle} disabled={!form.struggle.trim()}>🗣️ Share Anonymously</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {posts.map(post => (
            <div key={post.id} style={{ background: 'var(--surface)', borderRadius: 18, border: '1.5px solid var(--border)', padding: '20px 22px', transition: 'all .25s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: 'var(--violet-bg)', color: 'var(--violet)' }}>{post.category}</span>
                <span style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 500, marginLeft: 'auto' }}>{post.time}</span>
              </div>
              <p style={{ fontSize: '.88rem', color: 'var(--ink2)', lineHeight: 1.7, fontWeight: 500, marginBottom: 14 }}>
                "{post.struggle.slice(0, 120)}{post.struggle.length > 120 ? '...' : ''}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', align: 'center', gap: 6 }}>
                  <span style={{ fontSize: '.76rem', fontWeight: 600, color: post.answered ? 'var(--green)' : 'var(--ink3)' }}>
                    {post.answered ? '✝️ ' : '🤲 '}{post.responses} {post.responses === 1 ? 'encouragement' : 'encouragements'}
                  </span>
                </div>
                {!encouraged.has(post.id) ? (
                  <button onClick={() => setActivePost(post)} style={{ fontSize: '.76rem', fontWeight: 700, padding: '6px 14px', borderRadius: 9, border: '1.5px solid var(--violet)', background: 'var(--violet-bg)', color: 'var(--violet)', cursor: 'pointer', transition: 'all .2s' }}>
                    💬 Encourage
                  </button>
                ) : (
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--green)' }}>✓ You encouraged</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Response modal */}
        {activePost && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && setActivePost(null)}>
            <div style={{ background: 'var(--surface)', borderRadius: 24, maxWidth: 500, width: '100%', padding: 32, boxShadow: '0 40px 100px rgba(0,0,0,.3)' }}>
              {responseSent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '4rem', marginBottom: 14 }}>✝️</div>
                  <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>Encouragement Sent!</h3>
                  <p style={{ fontSize: '.86rem', color: 'var(--ink2)', fontWeight: 500, marginTop: 8 }}>You lifted someone up today. God sees that. 🙏</p>
                </div>
              ) : (
                <>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 14 }}>💬 Write Encouragement</div>
                  <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: '.85rem', color: 'var(--ink2)', fontStyle: 'italic', lineHeight: 1.65 }}>
                    "{activePost.struggle}"
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Quick encouragement</div>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {ENCOURAGEMENTS.slice(0,4).map((e,i) => (
                        <button key={i} onClick={() => setResponse(e)} style={{ fontSize: '.72rem', fontWeight: 500, padding: '5px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg2)', color: 'var(--ink2)', cursor: 'pointer' }}>
                          {e.slice(0, 30)}...
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea className="textarea-field" placeholder="Write your encouragement, scripture, or prayer..." value={response} onChange={e => setResponse(e.target.value)} style={{ height: 90, marginBottom: 16 }} />
                  <div style={{ background: 'var(--blue-bg)', borderRadius: 10, padding: '8px 14px', fontSize: '.74rem', color: 'var(--ink2)', fontWeight: 500, marginBottom: 16 }}>
                    💡 Tip: Only encouragement and scripture are allowed here. This is a judgment-free zone. Share the love of Christ.
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-violet" onClick={sendEncouragement} disabled={!response.trim()}>✝️ Send Encouragement</button>
                    <button className="btn btn-outline" onClick={() => setActivePost(null)}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
