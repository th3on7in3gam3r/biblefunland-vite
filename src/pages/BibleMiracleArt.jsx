import { useState } from 'react'
import { generateAIContent } from '../lib/ai'

const SCENES = [
  'Moses parting the Red Sea at midnight with a pillar of fire behind him',
  'Jesus walking on water toward a terrified disciple in a storm',
  'Daniel in the lion\'s den, praying peacefully while lions surround him',
  'The angel Gabriel appearing to Mary in golden light',
  'Noah\'s ark floating on the floodwaters above the clouds at sunset',
  'Elijah calling down fire from heaven on Mount Carmel',
  'Jesus healing the blind man at the gates of Jerusalem',
  'The resurrection — the stone rolled away from the empty tomb at dawn',
]

export default function BibleMiracleArt() {
  const [scene, setScene] = useState('')
  const [style, setStyle] = useState('renaissance')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const STYLES = [
    { id:'renaissance', label:'🖼️ Renaissance Oil Painting', desc:'Rich colors, dramatic lighting, classical mastery' },
    { id:'watercolor', label:'🎨 Watercolor', desc:'Soft, translucent, dreamlike beauty' },
    { id:'mosaic', label:'✨ Byzantine Mosaic', desc:'Ancient gold-flecked mosaic tiles like a cathedral' },
    { id:'illustration', label:'📖 Bible Illustration', desc:'Classic illustrated Bible book style' },
    { id:'sketch', label:'✏️ Pencil Sketch', desc:'Detailed graphite drawing with fine linework' },
    { id:'modern', label:'🎭 Contemporary Art', desc:'Bold modern Christian art with vivid colors' },
  ]

  const STYLE_PROMPTS = {
    renaissance: 'Create a detailed description of this scene as if it were a Renaissance oil painting by Rembrandt or Caravaggio. Dramatic chiaroscuro lighting, deep rich colors, photorealistic detail, divine light breaking through clouds. Describe every detail a painter would need to know to create this masterpiece.',
    watercolor: 'Describe this scene as a breathtaking watercolor painting. Soft translucent washes of color, flowing edges, luminous light effects. Peaceful, spiritual, gentle. Describe colors, light, composition in precise detail.',
    mosaic: 'Describe this Biblical scene as a Byzantine mosaic — gold backgrounds, stylized figures with halos, flat perspective, jewel-like tesserae colors of blue, gold, crimson, and emerald. Ancient and sacred feeling.',
    illustration: 'Describe this as a classic Bible illustration in the style of Gustave Doré — dramatic black and white engraving with detailed crosshatching, divine light rays, majestic figures. Every detail described for an artist.',
    sketch: 'Describe this as a detailed pencil sketch — fine linework, cross-hatching for shadows, careful anatomical detail. Black and white. Every shadow, texture, and figure described for an artist.',
    modern: 'Describe this Biblical scene as a modern contemporary Christian art piece — bold colors, expressive brushwork, dynamic composition, vibrant and life-giving. Describe as if commissioning a modern church mural.',
  }

  async function generate() {
    if (!scene.trim()) { setError('Please describe or select a Bible scene first.'); return }
    setError(''); setLoading(true); setResult(null)

    try {
      const systemPrompt = `You are a master art director specializing in Biblical artwork. When given a Bible scene and style, write a rich, detailed visual description that functions as:
1. A vivid painting description (colors, light, composition, figures, mood)
2. A prompt ready to copy into Midjourney, DALL-E, or Stable Diffusion
3. A reflection on the biblical meaning of the scene

Format your response with these three clearly labeled sections:
🎨 PAINTING DESCRIPTION (3-4 paragraphs of rich visual prose)
🤖 AI IMAGE PROMPT (one detailed technical prompt for image generators)
📖 BIBLICAL REFLECTION (2 paragraphs on the spiritual meaning)`

      const text = await generateAIContent(`Style: ${STYLE_PROMPTS[style]}\n\nScene: ${scene}`, systemPrompt)
      if (text) setResult(text)
      else setError('AI generation failed. Please try again.')
    } catch(err) { setError(err.message || 'Connection failed. Please try again.') }
    setLoading(false)
  }

  function copy() { navigator.clipboard.writeText(result || ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  function renderResult(text) {
    const parts = text.split(/(🎨 PAINTING DESCRIPTION|🤖 AI IMAGE PROMPT|📖 BIBLICAL REFLECTION)/)
    return parts.map((part, i) => {
      if (['🎨 PAINTING DESCRIPTION','🤖 AI IMAGE PROMPT','📖 BIBLICAL REFLECTION'].includes(part)) {
        return <div key={i} style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'var(--violet)', margin: '22px 0 8px' }}>{part}</div>
      }
      if (!part.trim()) return null
      return <p key={i} style={{ fontSize: '.9rem', color: 'var(--ink2)', lineHeight: 1.8, fontWeight: 500, marginBottom: 12 }}>{part.trim()}</p>
    })
  }

  const selectedStyle = STYLES.find(s => s.id === style)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#1A0A00,#2D1B00,#0A1A2E)', padding: '56px 36px 44px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.7rem', fontWeight: 700, background: 'rgba(245,158,11,.15)', color: '#FCD34D', padding: '4px 12px', borderRadius: 100, marginBottom: 12 }}>🖼️ AI Art Descriptions · Ready for Midjourney & DALL-E</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, background: 'linear-gradient(90deg,#FCD34D,#FB923C,#F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
          Bible Miracle Art Generator
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.92rem', fontWeight: 500, maxWidth: 480, margin: '0 auto' }}>
          Describe a Bible scene. Choose an art style. Get a rich painted description + a ready-to-use AI image prompt.
        </p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
        {/* Style picker */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {STYLES.map(s => (
            <div key={s.id} onClick={() => setStyle(s.id)} style={{ borderRadius: 16, padding: '14px 12px', cursor: 'pointer', border: `2px solid ${style === s.id ? 'var(--orange)' : 'var(--border)'}`, background: style === s.id ? 'var(--orange-bg)' : 'var(--surface)', textAlign: 'center', transition: 'all .2s' }}>
              <div style={{ fontSize: '.88rem', fontWeight: 800, color: style === s.id ? 'var(--orange)' : 'var(--ink)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 500 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ background: 'var(--surface)', borderRadius: 22, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 10 }}>Quick Scenes</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
            {SCENES.slice(0, 6).map((s, i) => (
              <button key={i} onClick={() => setScene(s)} style={{ fontSize: '.7rem', fontWeight: 600, padding: '5px 11px', borderRadius: 100, border: `1.5px solid ${scene === s ? 'var(--orange)' : 'var(--border)'}`, background: scene === s ? 'var(--orange-bg)' : 'var(--surface)', color: scene === s ? 'var(--orange)' : 'var(--ink2)', cursor: 'pointer' }}>
                {s.slice(0, 38)}...
              </button>
            ))}
          </div>
          <textarea className="textarea-field" rows={3} placeholder='Or describe your own scene — e.g. "Shadrach, Meshach and Abednego in the furnace with the fourth figure..."' value={scene} onChange={e => setScene(e.target.value)} style={{ marginBottom: 14 }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600, whiteSpace: 'nowrap' }}>✨ BibleFunLand AI is painting your scene</span>
            <button className="btn btn-orange" onClick={generate} disabled={loading} style={{ flexShrink: 0 }}>
              {loading ? '...' : '🎨 Generate Art'}
            </button>
          </div>
          {error && <div style={{ marginTop: 12, background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 10, padding: '9px 14px', fontSize: '.82rem', fontWeight: 600 }}>⚠️ {error}</div>}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 10, animation: 'float 2s ease-in-out infinite' }}>🎨</div>
            <p style={{ fontSize: '.9rem', color: 'var(--ink2)', fontWeight: 600 }}>Painting your Bible scene...</p>
            <p style={{ fontSize: '.78rem', color: 'var(--ink3)', fontWeight: 500, marginTop: 5 }}>Creating {selectedStyle?.label} description</p>
          </div>
        )}

        {result && !loading && (
          <div style={{ background: 'var(--surface)', borderRadius: 22, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,#78350F,#B45309)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🖼️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{selectedStyle?.label}</div>
                <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>{scene.slice(0, 60)}...</div>
              </div>
              <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.2)' }} onClick={copy}>
                {copied ? '✅ Copied!' : '📋 Copy All'}
              </button>
            </div>
            <div style={{ padding: '28px 32px' }}>
              {renderResult(result)}
              <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                <button className="btn btn-orange" onClick={generate}>✨ Regenerate</button>
                <button className="btn btn-outline" onClick={() => setResult(null)}>← New Scene</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  )
}
