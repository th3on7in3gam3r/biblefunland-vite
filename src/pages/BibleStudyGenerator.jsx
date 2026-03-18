import { useState, useRef } from 'react'
import { generateAIContent } from '../lib/ai'

const TOPICS = ['The Life of Jesus','Forgiveness','Prayer','Faith vs. Fear','Identity in Christ','The Holy Spirit','Money & Generosity','Marriage & Relationships','Suffering & Hope','The Armor of God','Fruits of the Spirit','Grace & Works']
const BOOKS = ['Genesis','Psalms','Proverbs','Isaiah','Matthew','John','Romans','Ephesians','Philippians','James','Revelation']
const LENGTHS = ['4 weeks (small group standard)','8 weeks (deep dive)','6 weeks','3 weeks (intro)']

const SYSTEM = `You are a seasoned Bible teacher and small group curriculum writer with 20+ years of experience. Generate a complete, ready-to-use small group Bible study.

Format your output EXACTLY like this (use these exact headers):

📖 STUDY OVERVIEW
[2-3 sentence description of the study arc and what participants will gain]

✨ MEMORY VERSE
[One key verse for the entire study]

📅 WEEK 1: [Title]
Scripture: [passage reference]
Key Insight: [2-3 sentences on the main teaching point]
Discussion Questions:
1. [Opening/icebreaker — accessible to all]
2. [Observation — what does the text say?]
3. [Interpretation — what does it mean?]
4. [Application — what does this mean for my life?]
5. [Challenge question — harder, for mature groups]
Memory Verse: [verse for this week]
Application Challenge: [One specific, measurable action for the week]

[Repeat same format for each week]

📋 FACILITATOR NOTES
[2-3 practical tips for leading this study well]

📚 RECOMMENDED RESOURCES
[2-3 books or resources for deeper study]

Keep each week balanced: scripture + insight + questions + action. Make discussion questions open-ended, not yes/no. Write for a mixed-age adult small group.`

export default function BibleStudyGenerator() {
  const [mode, setMode] = useState('topic') // topic | book
  const [topic, setTopic] = useState('')
  const [book, setBook] = useState('')
  const [length, setLength] = useState('4 weeks (small group standard)')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const resultRef = useRef(null)

  const weeks = parseInt(length)

  async function generate() {
    const subject = mode === 'topic' ? topic : `the book of ${book}`
    if (!subject.trim()) { setError('Please enter a topic or select a book.'); return }
    setError(''); setLoading(true); setResult(null)

    const prompt = `Create a ${length} small group Bible study on: "${subject}". Make it practical, engaging, and deeply scriptural. Each week should build on the last.`

    try {
      const text = await generateAIContent(prompt, SYSTEM)
      if (text) { setResult(text); setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100) }
      else setError('AI generation failed. Please try again.')
    } catch(err) { setError(err.message || 'Connection failed. Please try again.') }
    setLoading(false)
  }

  function copy() { navigator.clipboard.writeText(result || ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  function renderResult(text) {
    return text.split('\n').map((line, i) => {
      if (/^📖|^✨|^📅|^📋|^📚/.test(line.trim())) return <div key={i} style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--violet)', margin: '24px 0 10px', paddingBottom: 8, borderBottom: '2px solid var(--border)' }}>{line}</div>
      if (/^Scripture:|^Key Insight:|^Memory Verse:|^Application Challenge:|^Facilitator Notes/.test(line.trim())) return <div key={i} style={{ fontSize: '.78rem', fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: .5, marginTop: 14, marginBottom: 4 }}>{line}</div>
      if (/^Discussion Questions:/.test(line.trim())) return <div key={i} style={{ fontSize: '.78rem', fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: .5, marginTop: 14, marginBottom: 4 }}>{line}</div>
      if (/^\d+\./.test(line.trim())) return <div key={i} style={{ fontSize: '.88rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.7, paddingLeft: 16, marginBottom: 6 }}>{line}</div>
      if (!line.trim()) return <div key={i} style={{ height: 8 }} />
      return <div key={i} style={{ fontSize: '.9rem', color: 'var(--ink)', lineHeight: 1.75, fontWeight: 500, marginBottom: 4 }}>{line}</div>
    })
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', padding: '52px 36px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', fontSize: '.7rem', fontWeight: 700, background: 'rgba(99,102,241,.2)', color: '#A5B4FC', padding: '4px 14px', borderRadius: 100, marginBottom: 12 }}>📖 Replace $200 Curriculum · Free for Every Small Group</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, background: 'linear-gradient(90deg,#A5B4FC,#FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>Bible Study Generator</h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem', fontWeight: 500 }}>AI builds a complete multi-week small group curriculum with discussion questions, application challenges, and facilitator notes.</p>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', padding: '28px 32px', marginBottom: 20 }}>
          {/* Mode */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            {[['topic','💡 By Topic'],['book','📖 By Book']].map(([id,label]) => (
              <button key={id} onClick={() => setMode(id)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: `2px solid ${mode === id ? 'var(--violet)' : 'var(--border)'}`, background: mode === id ? 'var(--violet-bg)' : 'var(--surface)', color: mode === id ? 'var(--violet)' : 'var(--ink3)', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.86rem', cursor: 'pointer', transition: 'all .2s' }}>{label}</button>
            ))}
          </div>

          {mode === 'topic' ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: .5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Topic or Theme</label>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
                {TOPICS.map(t => <button key={t} onClick={() => setTopic(t)} style={{ fontSize: '.7rem', fontWeight: 600, padding: '5px 11px', borderRadius: 100, border: `1.5px solid ${topic === t ? 'var(--violet)' : 'var(--border)'}`, background: topic === t ? 'var(--violet-bg)' : 'var(--surface)', color: topic === t ? 'var(--violet)' : 'var(--ink2)', cursor: 'pointer' }}>{t}</button>)}
              </div>
              <input className="input-field" placeholder='Or type your own: "Anxiety", "Parenting", "The Cross"...' value={topic} onChange={e => setTopic(e.target.value)} />
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: .5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Bible Book</label>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {BOOKS.map(b => <button key={b} onClick={() => setBook(b)} style={{ fontSize: '.7rem', fontWeight: 600, padding: '5px 11px', borderRadius: 100, border: `1.5px solid ${book === b ? 'var(--violet)' : 'var(--border)'}`, background: book === b ? 'var(--violet-bg)' : 'var(--surface)', color: book === b ? 'var(--violet)' : 'var(--ink2)', cursor: 'pointer' }}>{b}</button>)}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: .5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Study Length</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LENGTHS.map(l => <button key={l} onClick={() => setLength(l)} style={{ fontSize: '.74rem', fontWeight: 700, padding: '7px 14px', borderRadius: 10, border: `1.5px solid ${length === l ? 'var(--blue)' : 'var(--border)'}`, background: length === l ? 'var(--blue-bg)' : 'var(--surface)', color: length === l ? 'var(--blue)' : 'var(--ink3)', cursor: 'pointer', transition: 'all .2s' }}>{l}</button>)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ flex: 1, fontSize: '.78rem', color: 'var(--ink3)', fontWeight: 600 }}>✨ BibleFunLand AI is writing this for you.</div>
            <button className="btn btn-violet" onClick={generate} disabled={loading} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              {loading ? '⏳ Generating...' : '📖 Generate Study'}
            </button>
          </div>
          {error && <div style={{ marginTop: 12, background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: '.82rem', fontWeight: 600 }}>⚠️ {error}</div>}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 10, animation: 'float 2s ease-in-out infinite' }}>📖</div>
            <p style={{ fontSize: '.9rem', color: 'var(--ink2)', fontWeight: 600 }}>Writing your curriculum...</p>
            <p style={{ fontSize: '.78rem', color: 'var(--ink3)', marginTop: 5 }}>Building all {length} weeks with discussion questions</p>
          </div>
        )}

        {result && !loading && (
          <div ref={resultRef} style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,#1E1B4B,#2D1B69)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.05rem', fontWeight: 800, color: 'white' }}>
                📖 Your Study: {mode === 'topic' ? topic : `Book of ${book}`} · {length}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={copy} style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', color: 'white', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.78rem', fontWeight: 700 }}>{copied ? '✅ Copied!' : '📋 Copy All'}</button>
                <button onClick={generate} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.78rem', fontWeight: 700 }}>↺ Regenerate</button>
              </div>
            </div>
            <div style={{ padding: '28px 36px' }}>{renderResult(result)}</div>
          </div>
        )}
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  )
}
