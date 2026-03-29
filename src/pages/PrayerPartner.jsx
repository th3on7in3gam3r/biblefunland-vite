import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MOCK_PARTNERS = [
  { id: 'p1', name: 'Sarah M.', location: 'Texas, USA', frequency: 'Daily', focus: 'Family & Marriage', requests: [{ id: 1, text: 'Praying for my husband as he interviews for a new job this week. We really need this door to open.', prayed: false }], avatar: '👩' },
  { id: 'p2', name: 'David K.', location: 'London, UK', frequency: 'Weekly', focus: 'Healing & Health', requests: [{ id: 1, text: 'My mother is undergoing surgery on Tuesday. Praying for peace for her and wisdom for the doctors.', prayed: false }], avatar: '👨' },
  { id: 'p3', name: 'Elena R.', location: 'Bogotá, Colombia', frequency: 'Daily', focus: 'Spiritual Growth', requests: [{ id: 1, text: 'I feel like I am in a spiritual dry season. Please pray that God would reignite my passion for His Word.', prayed: false }], avatar: '👩🏽' },
  { id: 'p4', name: 'Marcus J.', location: 'Atlanta, USA', frequency: 'Weekly', focus: 'Guidance & Decisions', requests: [{ id: 1, text: 'Trying to discern if I should go back to school or stay in my current career. Need clear direction.', prayed: false }], avatar: '👨🏾' },
]

export default function PrayerPartner() {
  const { user } = useAuth()
  const [view, setView] = useState('intro') // intro, setup, matching, dashboard
  
  // Setup Form State
  const [focusArea, setFocusArea] = useState('')
  const [frequency, setFrequency] = useState('')
  const [matchData, setMatchData] = useState(null)
  
  // Dashboard State
  const [myRequests, setMyRequests] = useState([])
  const [newRequest, setNewRequest] = useState('')
  const [prayedEffect, setPrayedEffect] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('prayer_partner_match')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setMatchData(data.match)
        setMyRequests(data.myRequests || [])
        setView('dashboard')
      } catch(e) {}
    }
  }, [])

  function startSetup() {
    setView('setup')
  }

  function handleMatch() {
    if (!focusArea || !frequency) return
    setView('matching')

    setTimeout(() => {
      // Find a mock partner that closely resembles the frequency or just pick one
      const match = MOCK_PARTNERS.find(p => p.frequency === frequency) || MOCK_PARTNERS[Math.floor(Math.random() * MOCK_PARTNERS.length)]
      const newMatchData = { match: JSON.parse(JSON.stringify(match)), myRequests: [] } // deep copy
      
      setMatchData(newMatchData.match)
      localStorage.setItem('prayer_partner_match', JSON.stringify(newMatchData))
      setView('dashboard')
      window.scrollTo(0, 0)
    }, 4000) // 4 seconds of "searching" for realism
  }

  function handleDisconnect() {
    localStorage.removeItem('prayer_partner_match')
    setMatchData(null)
    setMyRequests([])
    setShowDisconnectConfirm(false)
    setView('intro')
  }

  function addRequest(e) {
    e.preventDefault()
    if (!newRequest.trim()) return
    const rq = { id: Date.now(), text: newRequest, prayedByPartner: false }
    const updated = [rq, ...myRequests]
    setMyRequests(updated)
    setNewRequest('')
    
    // Save to local storage
    const saved = JSON.parse(localStorage.getItem('prayer_partner_match'))
    saved.myRequests = updated
    localStorage.setItem('prayer_partner_match', JSON.stringify(saved))
  }

  function deleteRequest(id) {
    const updated = myRequests.filter(r => r.id !== id)
    setMyRequests(updated)
    const saved = JSON.parse(localStorage.getItem('prayer_partner_match'))
    saved.myRequests = updated
    localStorage.setItem('prayer_partner_match', JSON.stringify(saved))
  }

  function markPrayed(reqId) {
    const updatedMatch = { ...matchData }
    const req = updatedMatch.requests.find(r => r.id === reqId)
    if (req) {
      req.prayed = true
      setMatchData(updatedMatch)
      
      const saved = JSON.parse(localStorage.getItem('prayer_partner_match'))
      saved.match = updatedMatch
      localStorage.setItem('prayer_partner_match', JSON.stringify(saved))

      // Trigger animation
      setPrayedEffect(true)
      setTimeout(() => setPrayedEffect(false), 2000)
    }
  }

  // ── Render ──
  if (view === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1A1A2E)', padding: '80px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>🤝</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
             Prayer Partner Matching
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            "For where two or three gather in my name, there am I with them." (Matt 18:20). <br/><br/>
            Don't walk through life alone. Share your burdens and intercede for a fellow believer in a private, dedicated 1-on-1 prayer partnership.
          </p>
          <button 
            onClick={startSetup} 
            className="btn" 
            style={{ background: 'linear-gradient(135deg, var(--blue), #A855F7)', border: 'none', color: 'white', fontSize: '1.2rem', padding: '16px 40px', borderRadius: 100, fontWeight: 800, boxShadow: '0 10px 30px rgba(59,130,246,0.3)', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            Find a Prayer Partner
          </button>
        </div>
      </div>
    )
  }

  if (view === 'setup') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Poppins, sans-serif', padding: '60px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'var(--surface)', padding: 40, borderRadius: 24, border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Set Your Preferences</h2>
          <p style={{ color: 'var(--ink3)', marginBottom: 30 }}>Tell us what you're looking for so we can match you with someone on a similar journey.</p>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '.9rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>Primary Prayer Focus</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Family & Marriage', 'Healing & Health', 'Spiritual Growth', 'Guidance & Decisions', 'Financial Peace'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFocusArea(f)}
                  style={{ padding: '10px 16px', borderRadius: 100, border: `2px solid ${focusArea === f ? 'var(--blue)' : 'var(--border)'}`, background: focusArea === f ? 'var(--blue-bg)' : 'transparent', color: focusArea === f ? 'var(--blue)' : 'var(--ink)', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <label style={{ display: 'block', fontSize: '.9rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>How often can you pray for them?</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Daily', 'Weekly'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFrequency(f)}
                  style={{ padding: '10px 16px', borderRadius: 100, border: `2px solid ${frequency === f ? 'var(--blue)' : 'var(--border)'}`, background: frequency === f ? 'var(--blue-bg)' : 'transparent', color: frequency === f ? 'var(--blue)' : 'var(--ink)', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleMatch}
            disabled={!focusArea || !frequency}
            style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: (!focusArea || !frequency) ? 'var(--bg3)' : 'var(--blue)', color: (!focusArea || !frequency) ? 'var(--ink3)' : 'white', fontSize: '1.1rem', fontWeight: 800, cursor: (!focusArea || !frequency) ? 'not-allowed' : 'pointer', transition: 'background .2s' }}
          >
            Find My Match
          </button>
        </div>
      </div>
    )
  }

  if (view === 'matching') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', textAlign: 'center', padding: 20 }}>
         <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 30 }}>
            {/* Pulsing rings */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid var(--blue)', opacity: 0, animation: 'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid var(--blue)', opacity: 0, animation: 'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1s' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
              🔍
            </div>
         </div>
         <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)' }}>Finding your prayer partner...</h2>
         <p style={{ color: 'var(--ink3)', marginTop: 8 }}>Matching your preferences across the global network.</p>

         <style>{`
           @keyframes pulseRing {
             0% { transform: scale(1); opacity: 0.8; }
             100% { transform: scale(1.8); opacity: 0; }
           }
         `}</style>
      </div>
    )
  }

  if (view === 'dashboard' && matchData) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Poppins, sans-serif' }}>
        {/* Confetti / Prayed Effect */}
        {prayedEffect && (
           <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', backdropFilter: 'blur(2px)' }}>
             <div style={{ fontSize: '6rem', animation: 'flyUp 2s ease-out forwards' }}>🙏</div>
           </div>
        )}

        {/* Dashboard Header */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--green)', marginBottom: 12 }}>✓ Active Partnership</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 10 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
            <div style={{ fontSize: '1.5rem', color: 'var(--blue)' }}>—</div>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--blue-bg)', border: '2px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{matchData.avatar}</div>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink)' }}>You & {matchData.name}</h1>
          <p style={{ color: 'var(--ink3)', fontSize: '1rem' }}>{matchData.location} • Praying {matchData.frequency}</p>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'start' }}>
          
          {/* Partner's Needs */}
          <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)', padding: 32, boxShadow: 'var(--sh)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--blue)' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 20 }}>{matchData.name}'s Prayer Needs</h2>
            
            {matchData.requests.map(req => (
              <div key={req.id} style={{ background: req.prayed ? 'var(--green-bg)' : 'var(--bg)', border: `1px solid ${req.prayed ? 'var(--green)' : 'var(--border)'}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--ink)', marginBottom: 20, fontStyle: 'italic' }}>"{req.text}"</p>
                {req.prayed ? (
                   <div style={{ color: 'var(--green)', fontWeight: 800, fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                     <span style={{ fontSize: '1.2rem' }}>✓</span> You prayed for this today
                   </div>
                ) : (
                  <button 
                    onClick={() => markPrayed(req.id)}
                    style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'var(--blue)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2563EB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--blue)'}
                  >
                    🙏 I Prayed For This
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* My Needs */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 20 }}>Share With {matchData.name}</h2>
            <form onSubmit={addRequest} style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 30 }}>
              <textarea 
                placeholder="What can your partner pray for?"
                value={newRequest}
                onChange={e => setNewRequest(e.target.value)}
                style={{ width: '100%', height: 120, padding: 20, background: 'transparent', border: 'none', color: 'var(--ink)', fontSize: '1rem', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ background: 'var(--bg2)', padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={!newRequest.trim()} style={{ padding: '8px 20px', borderRadius: 100, background: newRequest.trim() ? 'var(--ink)' : 'var(--bg3)', color: newRequest.trim() ? 'var(--bg)' : 'var(--ink3)', border: 'none', fontWeight: 700, cursor: newRequest.trim() ? 'pointer' : 'not-allowed' }}>
                  Post Request
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {myRequests.map(req => (
                 <div key={req.id} style={{ padding: 20, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
                   <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.5, marginBottom: 16 }}>{req.text}</p>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '.8rem', color: req.prayedByPartner ? 'var(--green)' : 'var(--ink3)' }}>
                       {req.prayedByPartner ? `🙏 ${matchData.name} prayed for this` : '⏳ Waiting for partner...'}
                     </span>
                     <button onClick={() => deleteRequest(req.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '.8rem', cursor: 'pointer', padding: 4 }}>Delete</button>
                   </div>
                 </div>
              ))}
              {myRequests.length === 0 && (
                 <p style={{ color: 'var(--ink3)', fontSize: '.9rem', textAlign: 'center' }}>You haven't shared any requests yet.</p>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', paddingBottom: 60 }}>
          {!showDisconnectConfirm ? (
            <button onClick={() => setShowDisconnectConfirm(true)} style={{ background: 'none', border: 'none', color: 'var(--ink3)', textDecoration: 'underline', cursor: 'pointer' }}>
               End this Partnership
            </button>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 20, borderRadius: 12, display: 'inline-block' }}>
               <p style={{ color: 'var(--ink)', fontWeight: 700, marginBottom: 12 }}>Are you sure you want to gracefully end this partnership?</p>
               <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                 <button onClick={() => setShowDisconnectConfirm(false)} className="btn btn-outline btn-sm">Cancel</button>
                 <button onClick={handleDisconnect} className="btn btn-sm" style={{ background: 'var(--red)', color: 'white', border: 'none' }}>Yes, End It</button>
               </div>
            </div>
          )}
        </div>

        <style>{`
           @keyframes flyUp {
             0% { transform: translateY(100px) scale(0.5); opacity: 0; }
             20% { opacity: 1; transform: translateY(0) scale(1.2); }
             80% { opacity: 1; transform: translateY(-50px) scale(1.2); }
             100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
           }
        `}</style>
      </div>
    )
  }

  return null
}
