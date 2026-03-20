import { useState, useRef, useEffect } from 'react'
import { generateAIContent } from '../lib/ai'

const SYSTEM_PROMPT = `You are a compassionate, scripture-grounded prayer companion. You pray WITH people, not at them.

Your role:
- Respond with deep empathy and genuine pastoral care
- Ask one focused question to understand their situation better before praying
- After understanding, pray a sincere, specific prayer for their exact situation
- Weave in relevant scripture naturally (quote the verse, give the reference)
- Keep responses warm, human, not robotic or overly formal
- Never give medical, legal, or financial advice — redirect to professionals when needed
- For crisis situations (suicidal thoughts, abuse), gently provide crisis resources
- Always speak in second person — "you" not "they"
- Pray in first person plural — "Lord, we come to you..."
- Keep each response under 250 words
- End responses with an invitation: a question, a verse to meditate on, or an offer to pray more

Tone: Like a wise, kind pastor who has walked through hard seasons themselves. Warm. Real. Unhurried.
Format: Conversational prose. Never use bullet points or headers. Never say "As an AI..."
`

const STARTERS = [
  "I'm feeling anxious and overwhelmed right now",
  "I need prayer for my family",
  "I'm going through a really hard season",
  "I need wisdom for a big decision",
  "I'm struggling with doubt in my faith",
  "Someone I love is sick",
  "I feel far from God lately",
  "I'm dealing with a broken relationship",
]

const PHASE_MESSAGES = {
  welcome: null,
  typing: 'The Spirit is present...',
  praying: 'Lifting this to God...',
}

export default function AIPrayerCompanion() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('welcome')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const userText = text || input.trim()
    if (!userText || loading) return

    setInput('')
    setPhase('typing')
    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const text = await generateAIContent({
        system: SYSTEM_PROMPT,
        messages: newMessages,
        max_tokens: 600
      })
      
      if (text) {
        setMessages([...newMessages, { role: 'assistant', content: text }])
        setPhase('conversation')
      } else {
        setMessages([...newMessages, { role: 'assistant', content: "I'm sorry — I couldn't connect with Heaven's gates right now. Please try again in a moment." }])
        setPhase('conversation')
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "Connection failed. Please check your internet and try again later." }])
    }
    setLoading(false)
  }

  function reset() {
    setMessages([])
    setPhase('welcome')
    setInput('')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1A0A2E,#0A1A14)', padding: '40px 36px 32px', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.7rem', fontWeight: 700, background: 'rgba(16,185,129,.15)', color: '#34D399', padding: '4px 14px', borderRadius: 100, marginBottom: 12, border: '1px solid rgba(16,185,129,.2)' }}>
          🕊️ Private · Nothing Saved · Just You and God
        </div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800, background: 'linear-gradient(90deg,#6EE7B7,#A5B4FC,#FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
          AI Prayer Companion
        </h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem', fontWeight: 500, maxWidth: 460, margin: '0 auto' }}>
          Share what's on your heart. Your companion will pray with you, offer scripture, and walk alongside you.
        </p>
      </div>



      {/* Chat area */}
      <div style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

        {/* Welcome state */}
        {phase === 'welcome' && messages.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: '4rem', marginBottom: 16, filter: 'drop-shadow(0 0 20px rgba(110,231,183,.3))' }}>🕊️</div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              What's on your heart today?
            </div>
            <p style={{ fontSize: '.86rem', color: 'var(--ink3)', fontWeight: 500, lineHeight: 1.7, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
              This is a safe, private space. Share freely. Nothing is stored. Your companion will pray with you and offer God's Word for your situation.
            </p>
            {/* Starter prompts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, maxWidth: 560, margin: '0 auto' }}>
              {STARTERS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  style={{ padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--ink2)', fontFamily: 'Poppins,sans-serif', fontSize: '.8rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'var(--green-bg)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink2)'; e.currentTarget.style.background = 'var(--surface)' }}>
                  🙏 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'msgIn .35s cubic-bezier(.34,1.56,.64,1)' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#064E3B,#065F46)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, marginRight: 10, marginTop: 4 }}>🕊️</div>
            )}
            <div style={{
              maxWidth: '78%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
              background: msg.role === 'user' ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : 'var(--surface)',
              color: msg.role === 'user' ? 'white' : 'var(--ink)',
              border: msg.role === 'assistant' ? '1.5px solid var(--border)' : 'none',
              fontSize: '.9rem', fontWeight: 500, lineHeight: 1.75,
              boxShadow: msg.role === 'user' ? '0 4px 16px rgba(59,130,246,.25)' : '0 2px 12px rgba(0,0,0,.06)',
            }}>
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
            {msg.role === 'user' && (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1E40AF,#4338CA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, marginLeft: 10, marginTop: 4 }}>🙏</div>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, animation: 'msgIn .35s ease' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#064E3B,#065F46)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🕊️</div>
            <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '20px 20px 20px 6px', padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', animation: `dotBounce .8s ${i * .15}s ease-in-out infinite` }} />
              ))}
              <span style={{ marginLeft: 8, fontSize: '.76rem', color: 'var(--ink3)', fontWeight: 500 }}>
                {PHASE_MESSAGES.typing}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '16px 24px', flexShrink: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10 }}>
          {messages.length > 0 && (
            <button onClick={reset} title="Start new prayer"
              style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--ink3)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink3)' }}>
              ✕
            </button>
          )}
          <textarea
            ref={inputRef}
            className="textarea-field"
            placeholder="Share what's on your heart..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            rows={2}
            style={{ flex: 1, resize: 'none', fontSize: '.9rem', lineHeight: 1.5, borderRadius: 14 }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: input.trim() && !loading ? 'linear-gradient(135deg,#064E3B,#0F9D58)' : 'var(--bg3)', color: input.trim() && !loading ? 'white' : 'var(--ink3)', cursor: input.trim() && !loading ? 'pointer' : 'default', fontSize: '1.1rem', flexShrink: 0, transition: 'all .2s', boxShadow: input.trim() && !loading ? '0 4px 14px rgba(6,78,59,.35)' : 'none' }}>
            🕊️
          </button>
        </div>
        <div style={{ maxWidth: 720, margin: '6px auto 0', fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 500, textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for new line · Nothing is saved or stored
        </div>
      </div>

      <style>{`
        @keyframes msgIn { from { opacity:0; transform:translateY(8px) scale(.97); } to { opacity:1; transform:none; } }
        @keyframes dotBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      `}</style>
    </div>
  )
}
