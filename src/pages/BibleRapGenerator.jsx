import { useState } from 'react'
import { generateAIContent } from '../lib/ai'

const STYLES = [
  { id: 'rap',        label: '🎤 Scripture Rap',    icon: '🎤', desc: 'Hard-hitting bars rooted in the Word' },
  { id: 'gospel',     label: '🎵 Gospel Song',       icon: '🎵', desc: 'Soulful gospel with a call & response chorus' },
  { id: 'worship',    label: '🙌 Worship Song',      icon: '🙌', desc: 'Contemporary worship with bridge & chorus' },
  { id: 'spoken',     label: '📣 Spoken Word',       icon: '📣', desc: 'Poetic spoken word like spoken-word artists' },
  { id: 'kids',       label: '🌈 Kids Song',         icon: '🌈', desc: 'Fun, catchy song kids can memorize and sing' },
  { id: 'country',    label: '🤠 Country Gospel',    icon: '🤠', desc: 'Southern country gospel with storytelling' },
]

const QUICK_VERSES = [
  'John 3:16', 'Psalm 23', 'Philippians 4:13', 'Romans 8:28',
  'Jeremiah 29:11', 'Joshua 1:9', 'Isaiah 40:31', 'Proverbs 3:5-6',
]

const SYSTEM_PROMPTS = {
  rap: `You are a Christian hip-hop artist writing scripture-based rap. Write 2 verses + 1 chorus. Include the actual Bible verse. Use rhyme scheme AABB or ABAB. Keep it clean, powerful, and faithful to scripture. Format with labels: [Verse 1], [Chorus], [Verse 2]. No profanity. Make it fire.`,
  gospel: `You are writing a traditional gospel song. Write an intro, 2 verses, a chorus, and a bridge. Keep the call-and-response feel of black gospel music. Format with: [Intro], [Verse 1], [Chorus], [Verse 2], [Bridge]. Include the scripture reference.`,
  worship: `You are writing a contemporary Christian worship song in the style of Hillsong or Elevation. Write 2 verses, a pre-chorus, chorus, and bridge. Focus on intimacy with God. Format with: [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge]. Include scripture.`,
  spoken: `You are writing Christian spoken word poetry in the style of spoken word artists. No rhyme required but use rhythm, repetition, and imagery. 3 stanzas. Powerful, emotional, rooted in the Bible verse. No section labels, just flowing poetry.`,
  kids: `You are writing a fun children's Bible song that kids ages 4-10 can memorize. Use simple words, repetition, and a catchy chorus. Write 2 short verses and a chorus that repeats. Add a fun rhythm. Format: [Verse 1], [Chorus], [Verse 2], [Chorus again]. Keep it joyful!`,
  country: `You are writing a Southern country gospel song with storytelling. 2 verses with narrative storytelling, a gospel chorus, and a fiddle-feel to the rhythm. Format: [Verse 1], [Chorus], [Verse 2], [Chorus], [Outro]. Include the scripture.`,
}

export default function BibleRapGenerator() {
  const [style, setStyle] = useState('rap')
  const [verse, setVerse] = useState('')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function generate() {
    if (!verse.trim() && !topic.trim()) { setError('Enter a Bible verse or topic first!'); return }
    setError(''); setLoading(true); setResult(null)
    const prompt = verse.trim()
      ? `Write a ${style} based on this Bible verse: "${verse}"`
      : `Write a ${style} about this Christian topic: "${topic}"`
    try {
      const text = await generateAIContent({
        system: SYSTEM_PROMPTS[style],
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 900
      })
      if (text) setResult(text)
      else setError('Generation failed. Please try again.')
    } catch (err) { setError(err.message || 'Connection failed.') }
    setLoading(false)
  }

  function copy() { navigator.clipboard.writeText(result || ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const selectedStyle = STYLES.find(s => s.id === style)

  function renderResult(text) {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      const isSection = /^\[(Verse|Chorus|Bridge|Pre-Chorus|Intro|Outro|Hook)\s*\d*\]/i.test(line.trim())
      if (isSection) return (
        <div key={i} style={{ fontFamily: "'Baloo 2',cursive", fontSize: '.82rem', fontWeight: 800, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 6 }}>{line}</div>
      )
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />
      return <div key={i} style={{ fontSize: '.92rem', color: 'var(--ink)', lineHeight: 1.75, fontWeight: 500 }}>{line}</div>
    })
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1A0533,#0F0F1A)', padding: '56px 36px 44px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.7rem', fontWeight: 700, background: 'rgba(139,92,246,.2)', color: '#C4B5FD', padding: '4px 12px', borderRadius: 100, marginBottom: 12 }}>🎵 AI-Powered · Never Done Before</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, background: 'linear-gradient(90deg,#C084FC,#F472B6,#FCD34D,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
          Bible Song & Rap Generator
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.92rem', fontWeight: 500, maxWidth: 480, margin: '0 auto' }}>
          Type any Bible verse or topic — AI writes a full scripture rap, worship song, spoken word, or kids song in seconds.
        </p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
          {STYLES.map(s => (
            <div key={s.id} onClick={() => setStyle(s.id)} style={{ borderRadius: 18, padding: '16px 14px', cursor: 'pointer', border: `2px solid ${style === s.id ? 'var(--violet)' : 'var(--border)'}`, background: style === s.id ? 'var(--violet-bg)' : 'var(--surface)', textAlign: 'center', transition: 'all .2s' }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '.9rem', fontWeight: 800, color: style === s.id ? 'var(--violet)' : 'var(--ink)', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 500 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', padding: 32, marginBottom: 22 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8 }}>Bible Verse or Topic</div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {QUICK_VERSES.map(v => (
              <button key={v} onClick={() => setVerse(v)} style={{ fontSize: '.7rem', fontWeight: 700, padding: '4px 11px', borderRadius: 100, border: `1.5px solid ${verse === v ? 'var(--violet)' : 'var(--border)'}`, background: verse === v ? 'var(--violet-bg)' : 'var(--surface)', color: verse === v ? 'var(--violet)' : 'var(--ink2)', cursor: 'pointer' }}>
                {v}
              </button>
            ))}
          </div>

          <input className="input-field" placeholder='Bible verse e.g. "Philippians 4:13"...' value={verse} onChange={e => { setVerse(e.target.value); setTopic('') }} style={{ marginBottom: 10 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '.75rem', color: 'var(--ink3)', fontWeight: 600 }}>or write a topic</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <input className="input-field" placeholder="Topic e.g. 'overcoming fear', 'God's love', 'forgiveness'..." value={topic} onChange={e => { setTopic(e.target.value); setVerse('') }} style={{ marginBottom: 16 }} />

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <div style={{ flex: 1, fontSize: '.78rem', color: 'var(--ink3)', fontWeight: 500 }}>
              ✨ AI transforms God's Word into music and poetry for you.
            </div>
            <button className="btn btn-violet" onClick={generate} disabled={loading} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              {loading ? '...' : `✨ Generate ${selectedStyle?.icon}`}
            </button>
          </div>

          {error && <div style={{ marginTop: 12, background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 10, padding: '9px 14px', fontSize: '.82rem', fontWeight: 600 }}>⚠️ {error}</div>}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'bounce 1s ease-in-out infinite' }}>{selectedStyle?.icon}</div>
            <p style={{ fontSize: '.9rem', color: 'var(--ink2)', fontWeight: 600, marginBottom: 6 }}>Writing your {selectedStyle?.label}...</p>
            <p style={{ fontSize: '.78rem', color: 'var(--ink3)', fontWeight: 500 }}>The Spirit is moving 🕊️</p>
          </div>
        )}

        {result && !loading && (
          <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,#4C1D95,#6D28D9)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{selectedStyle?.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>Your {selectedStyle?.label}</div>
                <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>
                  Based on: {verse || topic}
                </div>
              </div>
              <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.2)', flexShrink: 0 }} onClick={copy}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div style={{ padding: '28px 32px' }}>
              {renderResult(result)}
            </div>
            <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-violet" onClick={generate}>✨ Regenerate</button>
              <button className="btn btn-outline" onClick={() => setResult(null)}>← New Song</button>
              <a href="/share" className="btn btn-outline">🔗 Make Share Card</a>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  )
}
