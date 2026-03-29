import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { QUESTIONS, GIFT_PROFILES } from '../data/spiritualGifts'

const OPTIONS = [
  { value: 1, label: 'Strongly Disagree', color: '#e11d48' }, // dark rose
  { value: 2, label: 'Disagree', color: '#fb7185' }, // rose
  { value: 3, label: 'Neutral', color: '#94a3b8' }, // slate
  { value: 4, label: 'Agree', color: '#34d399' }, // emerald
  { value: 5, label: 'Strongly Agree', color: '#059669' }, // dark emerald
]

export default function SpiritualGiftsTest() {
  const { user } = useAuth()
  const [view, setView] = useState('intro') // intro, test, loading, results
  const [currentStep, setCurrentStep] = useState(0) // 0 to 20
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)

  // Try to load cached results on mount
  useEffect(() => {
    const cached = localStorage.getItem('s_gifts_results')
    if (cached) {
      try {
        setResults(JSON.parse(cached))
        setView('results')
      } catch (e) {}
    }
  }, [])

  function startTest() {
    setAnswers({})
    setCurrentStep(0)
    setView('test')
  }

  function handleSelect(value) {
    const q = QUESTIONS[currentStep]
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(c => c + 1)
      } else {
        calculateResults(newAnswers)
      }
    }, 400) // slight delay for visual feedback
  }

  function calculateResults(finalAnswers) {
    setView('loading')
    
    // Sum scores per gift category
    const scores = {}
    Object.keys(GIFT_PROFILES).forEach(k => scores[k] = 0)
    
    QUESTIONS.forEach(q => {
      if (finalAnswers[q.id]) {
        scores[q.gift] += finalAnswers[q.id]
      }
    })

    // Sort descending by score. Total possible per gift is 15 (3 questions * 5 max).
    const sorted = Object.keys(scores)
      .map(k => ({ giftId: k, score: scores[k], percent: Math.round((scores[k] / 15) * 100) }))
      .sort((a, b) => b.score - a.score)

    setTimeout(() => {
      setResults(sorted)
      localStorage.setItem('s_gifts_results', JSON.stringify(sorted))
      setView('results')
      window.scrollTo(0,0)
    }, 1500) // fake processing time for dramatic effect
  }

  // ── Render Intro ──
  if (view === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1A1A2E)', padding: '80px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>🧬</div>
          <h1 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
             Discover Your Design
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            "Now concerning spiritual gifts, brothers, I do not want you to be uninformed." (1 Cor 12:1). 
            Take this free, 21-question assessment to uncover how God has uniquely equipped you to serve the church and the world.
          </p>
          <button 
            onClick={startTest} 
            className="btn" 
            style={{ background: 'linear-gradient(135deg,var(--blue),#A855F7)', border: 'none', color: 'white', fontSize: '1.2rem', padding: '16px 40px', borderRadius: 100, fontWeight: 800, boxShadow: '0 10px 30px rgba(59,130,246,0.3)', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            Start Assessment →
          </button>
          {!user && (
             <p style={{ marginTop: 20, fontSize: '.85rem', color: 'rgba(255,255,255,.4)' }}>
               No account required. Takes about 3 minutes.
             </p>
          )}
        </div>
      </div>
    )
  }

  // ── Render Loading ──
  if (view === 'loading') {
     return (
       <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
         <div style={{ fontSize: '3rem', animation: 'spin 2s linear infinite' }}>⏳</div>
         <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '1.8rem', color: 'var(--ink)' }}>Analyzing Your Profile...</h2>
         <p style={{ color: 'var(--ink3)' }}>Mapping your answers to biblical giftings.</p>
         <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
       </div>
     )
  }

  // ── Render Test ──
  if (view === 'test') {
    const q = QUESTIONS[currentStep]
    const progress = ((currentStep) / QUESTIONS.length) * 100

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'Poppins, sans-serif' }}>
        {/* Progress Bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '20px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 700, color: 'var(--ink3)', marginBottom: 8 }}>
               <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
               <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 10, background: 'var(--bg3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--blue)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
           <div style={{ maxWidth: 700, width: '100%', textAlign: 'center' }}>
             <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--ink)', lineHeight: 1.4, marginBottom: 50 }}>
               "{q.text}"
             </h2>

             <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(10px, 3vw, 20px)', flexWrap: 'wrap' }}>
               {OPTIONS.map((opt) => {
                 const isSelected = answers[q.id] === opt.value
                 const size = opt.value === 1 || opt.value === 5 ? 70 : opt.value === 2 || opt.value === 4 ? 60 : 50
                 
                 return (
                   <div key={opt.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => handleSelect(opt.value)}>
                     <div 
                       style={{ 
                         width: size, height: size, borderRadius: '50%', 
                         border: `3px solid ${opt.color}`,
                         background: isSelected ? opt.color : 'transparent',
                         transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                         transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                       }}
                       onMouseEnter={e => !isSelected && (e.currentTarget.style.background = `${opt.color}22`)}
                       onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                     />
                     <span style={{ fontSize: '.75rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--ink)' : 'var(--ink3)', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', maxWidth: 80, transition: 'color 0.2s' }}>
                       {opt.label}
                     </span>
                   </div>
                 )
               })}
             </div>
             
             {/* Back Button (only show if not on first question) */}
             {currentStep > 0 && (
               <button 
                 onClick={() => setCurrentStep(c => c - 1)}
                 style={{ marginTop: 60, background: 'none', border: 'none', color: 'var(--ink3)', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem' }}
                 onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                 onMouseLeave={e => e.currentTarget.style.color = 'var(--ink3)'}
               >
                 ← Previous Question
               </button>
             )}
           </div>
        </div>
      </div>
    )
  }

  // ── Render Results ──
  if (view === 'results' && results) {
    const topGift = GIFT_PROFILES[results[0].giftId]
    const secondGift = GIFT_PROFILES[results[1].giftId]
    const thirdGift = GIFT_PROFILES[results[2].giftId]

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Poppins, sans-serif', paddingBottom: 100 }}>
        {/* Results Header */}
        <div style={{ background: `linear-gradient(135deg, ${topGift.color}15, ${topGift.color}05)`, padding: '60px 20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
           <p style={{ fontSize: '.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--ink3)', marginBottom: 12 }}>Your Primary Spiritual Gift</p>
           <div style={{ fontSize: '5rem', marginBottom: 10, filter: `drop-shadow(0 10px 20px ${topGift.color}40)` }}>{topGift.icon}</div>
           <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 900, color: topGift.color, marginBottom: 16 }}>
             {topGift.name}
           </h1>
           <p style={{ maxWidth: 700, margin: '0 auto', fontSize: '1.2rem', lineHeight: 1.7, color: 'var(--ink)', fontFamily: "'Merriweather', serif" }}>
             {topGift.description}
           </p>

           <div style={{ marginTop: 40, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
             <button onClick={startTest} className="btn btn-outline" style={{ borderRadius: 100 }}>Retake Assessment</button>
             {!user && <Link to="/auth" className="btn btn-blue" style={{ borderRadius: 100 }}>Sign in to Save Profile</Link>}
             <button onClick={() => navigator.clipboard.writeText(`I just took the BibleFunLand Spiritual Gifts test and got '${topGift.name}'! Take it here: ${window.location.href}`)} className="btn btn-outline" style={{ borderRadius: 100 }}>🔗 Share Result</button>
           </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: 40, alignItems: 'start' }}>
          
          {/* Left Column: Full Chart */}
          <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)', padding: 32, boxShadow: 'var(--sh)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
               Your Full Gift Profile
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {results.map((r, idx) => {
                 const g = GIFT_PROFILES[r.giftId]
                 const isTop = idx === 0
                 return (
                   <div key={r.giftId}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: isTop ? 800 : 600, color: isTop ? g.color : 'var(--ink)', marginBottom: 6 }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{g.icon} {g.name}</span>
                       <span>{r.percent}% Match</span>
                     </div>
                     <div style={{ height: 10, borderRadius: 10, background: 'var(--bg3)', overflow: 'hidden' }}>
                       <div style={{ height: '100%', width: `${r.percent}%`, background: isTop ? g.color : 'var(--ink3)', borderRadius: 10 }} />
                     </div>
                   </div>
                 )
              })}
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--ink3)', marginTop: 24, fontStyle: 'italic', lineHeight: 1.5 }}>
              *Scores are based out of 100%. Most people possess a blend of 2-3 primary gifts that work together beautifully.
            </p>
          </div>

          {/* Right Column: Deep Dives into Top 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            {[topGift, secondGift, thirdGift].map((g, i) => (
              <div key={g.id} style={{ borderLeft: `4px solid ${g.color}`, paddingLeft: 24 }}>
                <div style={{ fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 4 }}>
                   {i === 0 ? 'Primary Gift' : i === 1 ? 'Secondary Gift' : 'Tertiary Gift'}
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                   {g.icon} {g.name}
                </h3>
                {i > 0 && <p style={{ fontSize: '.95rem', color: 'var(--ink2)', lineHeight: 1.6, marginBottom: 16 }}>{g.description}</p>}
                
                <h4 style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>📜 Biblical Basis</h4>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                  {g.scriptures.map(s => <span key={s} style={{ fontSize: '.75rem', fontWeight: 700, padding: '4px 10px', background: 'var(--bg2)', color: 'var(--ink)', borderRadius: 100 }}>{s}</span>)}
                </div>

                <h4 style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>🎯 Actionable Next Steps</h4>
                <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--blue)', fontSize: '.95rem', lineHeight: 1.6, marginBottom: 20 }}>
                  {g.actionSteps.map((s, idx) => (
                    <li key={idx}><span style={{ color: 'var(--ink2)' }}>{s}</span></li>
                  ))}
                </ul>

                <h4 style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>⛪ Suggested Ministries</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {g.ministries.map(m => <span key={m} style={{ fontSize: '.75rem', fontWeight: 700, padding: '4px 10px', background: `${g.color}15`, color: g.color, borderRadius: 100, border: `1px solid ${g.color}30` }}>{m}</span>)}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    )
  }

  return null
}
