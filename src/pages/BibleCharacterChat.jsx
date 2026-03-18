import { useState, useRef, useEffect } from 'react'
import { generateAIContent } from '../lib/ai'

const CHARACTERS = [
  {
    id: 'david',
    name: 'King David',
    emoji: '👑',
    era: '~1000 BC',
    role: 'Shepherd, Warrior, King, Psalmist',
    color: '#F59E0B',
    bg: '#FFFBEB',
    intro: "Shalom! I am David, son of Jesse, shepherd of Bethlehem and king of Israel. I have known God's protection from my youth — from the fields to the palace, through triumph and heartbreak. What would you ask of me?",
    systemPrompt: `You are King David from the Bible, speaking in first person. You are warm, passionate, and deeply spiritual. You've experienced great triumph (killing Goliath, becoming king) and great failure (Bathsheba, Absalom). You wrote most of the Psalms. Speak with poetic, heartfelt language. Reference your real biblical experiences. Always tie answers back to God's faithfulness. Keep responses under 120 words. Reference specific Psalms or Bible passages when relevant. Never break character.`,
  },
  {
    id: 'moses',
    name: 'Moses',
    emoji: '🏔️',
    era: '~1300 BC',
    role: 'Prophet, Deliverer, Lawgiver',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    intro: "I am Moses, servant of the LORD. I was raised in Pharaoh's palace yet called by God from a burning bush to deliver my people from slavery. I have stood before the Almighty on holy ground. Ask what is on your heart.",
    systemPrompt: `You are Moses from the Bible, speaking in first person. You are humble yet authoritative, deeply aware of God's holiness. You've experienced the burning bush, the plagues, the Red Sea parting, receiving the Ten Commandments on Sinai. You led Israel 40 years in the wilderness. Speak with gravitas and wisdom. Reference your real biblical experiences. Keep responses under 120 words. Never break character.`,
  },
  {
    id: 'paul',
    name: 'Apostle Paul',
    emoji: '✉️',
    era: '~10 AD',
    role: 'Apostle, Missionary, Author',
    color: '#3B82F6',
    bg: '#EFF6FF',
    intro: "Grace and peace to you! I am Paul, formerly Saul of Tarsus — a Pharisee who persecuted the church until Christ appeared to me on the Damascus road and changed everything. I have traveled the world for the Gospel. What question burns in your heart?",
    systemPrompt: `You are the Apostle Paul from the Bible, speaking in first person. You are intellectually sharp, theologically deep, passionate for the Gospel. You wrote 13 letters of the New Testament. You've been shipwrecked, imprisoned, stoned, and yet count it all joy. Reference your real biblical letters and experiences (Damascus road, missionary journeys, prison epistles). Keep responses under 120 words. Occasionally quote your own letters (Philippians, Romans, etc.). Never break character.`,
  },
  {
    id: 'esther',
    name: 'Queen Esther',
    emoji: '👸',
    era: '~480 BC',
    role: 'Queen, Deliverer of Israel',
    color: '#EC4899',
    bg: '#FDF2F8',
    intro: "Shalom. I am Esther, daughter of Abihail, raised by my cousin Mordecai in Persia. God placed me in the palace for a reason that was revealed in the most frightening moment of my life. 'For such a time as this.' What would you like to know?",
    systemPrompt: `You are Queen Esther from the Bible, speaking in first person. You are courageous, gracious, and deeply faithful despite fear. You were an orphan raised by your cousin Mordecai, became Queen of Persia, and risked your life to save the Jewish people. Speak with thoughtful courage. Reference Mordecai, Haman, King Ahasuerus, the 3-day fast. Keep responses under 120 words. Never break character.`,
  },
  {
    id: 'mary',
    name: 'Mary of Nazareth',
    emoji: '🌸',
    era: '~1 BC',
    role: 'Mother of Jesus',
    color: '#14B8A6',
    bg: '#F0FDFA',
    intro: "Peace be with you. I am Mary, a servant girl from Nazareth. When the angel Gabriel appeared to me, I could not have imagined what God would do through my obedience. But I have treasured every moment in my heart. What would you ask?",
    systemPrompt: `You are Mary, mother of Jesus, speaking in first person. You are humble, gentle, deeply spiritual. You experienced the Annunciation, the birth of Jesus in Bethlehem, fleeing to Egypt, Jesus's childhood, the wedding at Cana, and the crucifixion. Speak with quiet strength and wonder. Reference the Magnificat (Luke 1). Keep responses under 120 words. Never break character.`,
  },
  {
    id: 'noah',
    name: 'Noah',
    emoji: '🚢',
    era: '~2500 BC',
    role: 'Righteous Man, Builder of the Ark',
    color: '#10B981',
    bg: '#ECFDF5',
    intro: "Greetings, friend. I am Noah. In a world that had turned from its Creator, God found me walking in righteousness — and gave me a task that seemed impossible. I built an ark. I trusted. And He was faithful beyond imagination.",
    systemPrompt: `You are Noah from the Bible, speaking in first person. You are steadfast, obedient, patient — you built the ark for 100+ years while others mocked you. You survived the great flood with your family and the animals. You saw the first rainbow as God's covenant. Speak with calm faith and wisdom. Reference your real biblical story. Keep responses under 120 words. Never break character.`,
  },
]

export default function BibleCharacterChat() {
  const [selectedChar, setSelectedChar] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [askCount, setAskCount] = useState(0)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function selectChar(char) {
    setSelectedChar(char)
    setMessages([{ role: 'assistant', text: char.intro }])
    setInput('')
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    const history = messages
      .filter(m => m.role !== 'intro')
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }))

    try {
      const text = await generateAIContent(userMsg, selectedChar.systemPrompt)
      if (text) {
        setMessages(prev => [...prev, { role: 'assistant', text: text }])
        setAskCount(c => c + 1)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: `I cannot speak at this moment. Please try again later.` }])
      }
    } catch(err) {
      setMessages(prev => [...prev, { role: 'assistant', text: err.message || 'Connection failed. Please try again later.' }])
    }
    setLoading(false)
  }

  const QUICK_QUESTIONS = {
    david: ["What was it like to fight Goliath?", "How did you write the Psalms?", "What was your biggest mistake?", "What advice do you have for young people?"],
    moses: ["What happened at the burning bush?", "How did the Red Sea part?", "What was it like to receive the Ten Commandments?", "Why couldn't you enter the Promised Land?"],
    paul: ["What happened on the road to Damascus?", "What is the meaning of faith?", "How did you endure imprisonment?", "What did you mean by 'I can do all things'?"],
    esther: ["Were you afraid to approach the king?", "What was Mordecai's role?", "How did you fast before your moment?", "What does 'for such a time as this' mean?"],
    mary: ["What did the angel say to you?", "What was the night Jesus was born like?", "How did you feel at the cross?", "What was Jesus like as a child?"],
    noah: ["How long did you build the ark?", "Did people mock you?", "What was it like on the ark for 40 days?", "What did the rainbow mean to you?"],
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', padding: '56px 36px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.7rem', fontWeight: 700, background: 'rgba(139,92,246,.2)', color: '#C4B5FD', padding: '4px 12px', borderRadius: 100, marginBottom: 12 }}>🤖 Powered by Claude AI</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, background: 'linear-gradient(90deg,#A5B4FC,#F9A8D4,#FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
          Talk to Bible Characters
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500, maxWidth: 480, margin: '0 auto' }}>
          Ask Moses about the Red Sea. Ask David about Goliath. Ask Paul about faith. Have a real conversation with the heroes of scripture.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px' }}>

        {!selectedChar ? (
          /* ── Character Selection ── */
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>Who would you like to talk to?</h2>
              <p style={{ fontSize: '.87rem', color: 'var(--ink3)', fontWeight: 500 }}>Each character responds based on their real biblical story</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {CHARACTERS.map(c => (
                <div key={c.id} onClick={() => selectChar(c)} style={{ borderRadius: 22, padding: '26px 20px', cursor: 'pointer', border: `2px solid ${c.color}22`, background: c.bg, textAlign: 'center', transition: 'all .28s', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${c.color}30` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.04)' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 10 }}>{c.emoji}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 600, marginBottom: 6 }}>{c.era}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--ink2)', fontWeight: 500 }}>{c.role}</div>
                  <div style={{ marginTop: 14, fontSize: '.72rem', fontWeight: 700, padding: '5px 14px', borderRadius: 100, background: c.color, color: 'white', display: 'inline-block' }}>
                    Start Conversation →
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Chat Interface ── */
          <div>
            {/* Character header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'var(--surface)', borderRadius: '18px 18px 0 0', border: '1.5px solid var(--border)', borderBottom: 'none' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: selectedChar.bg, border: `2px solid ${selectedChar.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                {selectedChar.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>{selectedChar.name}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 500 }}>{selectedChar.role} · {selectedChar.era}</div>
              </div>
              <div style={{ display: 'flex', align: 'center', gap: 10 }}>
                <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink3)' }}>{askCount} questions asked</div>
                <button className="btn btn-outline btn-sm" onClick={() => setSelectedChar(null)}>← Characters</button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ height: 420, overflowY: 'auto', background: 'var(--bg2)', padding: '20px', border: '1.5px solid var(--border)', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: msg.role === 'assistant' ? selectedChar.bg : 'var(--blue-bg)', border: `1.5px solid ${msg.role === 'assistant' ? selectedChar.color : 'var(--blue)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                    {msg.role === 'assistant' ? selectedChar.emoji : '👤'}
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px', background: msg.role === 'user' ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : 'var(--surface)', color: msg.role === 'user' ? 'white' : 'var(--ink)', fontSize: '.87rem', fontWeight: 500, lineHeight: 1.65, border: msg.role === 'user' ? 'none' : '1.5px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: '85%' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: selectedChar.bg, border: `1.5px solid ${selectedChar.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{selectedChar.emoji}</div>
                  <div style={{ padding: '14px 20px', borderRadius: '4px 18px 18px 18px', background: 'var(--surface)', border: '1.5px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: selectedChar.color, animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            <div style={{ background: 'var(--surface)', padding: '12px 16px', borderLeft: '1.5px solid var(--border)', borderRight: '1.5px solid var(--border)', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {(QUICK_QUESTIONS[selectedChar.id] || []).map((q, i) => (
                <button key={i} onClick={() => { setInput(q); }} style={{ fontSize: '.72rem', fontWeight: 600, padding: '5px 12px', borderRadius: 100, border: `1.5px solid ${selectedChar.color}33`, background: selectedChar.bg, color: selectedChar.color, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}>
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ background: 'var(--surface)', borderRadius: '0 0 18px 18px', border: '1.5px solid var(--border)', borderTop: '1px solid var(--border)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 10 }}>
                <textarea
                  className="textarea-field"
                  rows={2}
                  placeholder={`Ask ${selectedChar.name} anything...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  style={{ flex: 1, resize: 'none', fontSize: '.87rem' }}
                />
                <button className="btn" style={{ background: `linear-gradient(135deg,${selectedChar.color},${selectedChar.color}cc)`, color: 'white', border: 'none', padding: '12px 18px', flexShrink: 0 }} onClick={sendMessage} disabled={loading}>
                  {loading ? '...' : '➤'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
                <span style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600, whiteSpace: 'nowrap' }}>✨ Conversing via BibleFunLand AI</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}
