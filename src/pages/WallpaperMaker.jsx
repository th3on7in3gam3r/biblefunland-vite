import { useState, useRef, useEffect } from 'react'

const VERSES = [
  { ref:'Jer 29:11', text:'For I know the plans I have for you, declares the Lord — plans to prosper you and not to harm you, plans to give you hope and a future.' },
  { ref:'Phil 4:13', text:'I can do all this through him who gives me strength.' },
  { ref:'Ps 23:1',   text:'The Lord is my shepherd, I shall not want.' },
  { ref:'Josh 1:9',  text:'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
  { ref:'Rom 8:38',  text:'Neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers — nothing will be able to separate us from the love of God.' },
  { ref:'Isa 40:31', text:'Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
  { ref:'Prov 3:5',  text:'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
]

const BACKGROUNDS = [
  { id:'space',      label:'Deep Space',      draw:(ctx,W,H) => { const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0F0F1A');g.addColorStop(.5,'#1A0A2E');g.addColorStop(1,'#0A1A2E');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(let i=0;i<200;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*.8+.2})`;ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*2,0,Math.PI*2);ctx.fill()} } },
  { id:'sunrise',    label:'Sunrise',         draw:(ctx,W,H) => { const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0F172A');g.addColorStop(.4,'#7C3AED');g.addColorStop(.7,'#DB2777');g.addColorStop(1,'#F97316');ctx.fillStyle=g;ctx.fillRect(0,0,W,H) } },
  { id:'forest',     label:'Forest Mist',     draw:(ctx,W,H) => { const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#052e16');g.addColorStop(.5,'#14532d');g.addColorStop(1,'#166534');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,.03)';for(let i=0;i<8;i++){ctx.fillRect(0,H*.5+i*30,W,20)} } },
  { id:'ocean',      label:'Ocean Deep',      draw:(ctx,W,H) => { const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c4a6e');g.addColorStop(.6,'#0369a1');g.addColorStop(1,'#0284c7');ctx.fillStyle=g;ctx.fillRect(0,0,W,H) } },
  { id:'gold',       label:'Gold Radiance',   draw:(ctx,W,H) => { const g=ctx.createRadialGradient(W/2,H*.3,0,W/2,H*.3,W);g.addColorStop(0,'#78350f');g.addColorStop(.5,'#92400e');g.addColorStop(1,'#1c1917');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(252,211,77,.08)';const rg=ctx.createRadialGradient(W/2,H*.25,0,W/2,H*.25,300);rg.addColorStop(0,'rgba(252,211,77,.25)');rg.addColorStop(1,'transparent');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H) } },
  { id:'violet',     label:'Royal Violet',    draw:(ctx,W,H) => { const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#1e1b4b');g.addColorStop(.5,'#312e81');g.addColorStop(1,'#0f172a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H) } },
  { id:'linen',      label:'Light Linen',     draw:(ctx,W,H) => { ctx.fillStyle='#fefce8';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(0,0,0,.03)';for(let i=0;i<H;i+=4){ctx.fillRect(0,i,W,2)} } },
  { id:'charcoal',   label:'Charcoal',        draw:(ctx,W,H) => { const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#111827');g.addColorStop(1,'#1f2937');ctx.fillStyle=g;ctx.fillRect(0,0,W,H) } },
]

const FONTS = [
  { id:'baloo',    label:'Baloo (Playful)',   font:"'Baloo 2'" },
  { id:'poppins',  label:'Poppins (Modern)',  font:"'Poppins'" },
  { id:'serif',    label:'Georgia (Classic)', font:'Georgia' },
]

export default function WallpaperMaker() {
  const [verseIdx, setVerseIdx] = useState(0)
  const [customVerse, setCustomVerse] = useState('')
  const [customRef, setCustomRef] = useState('')
  const [bgId, setBgId] = useState('space')
  const [fontId, setFontId] = useState('poppins')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const canvasRef = useRef(null)

  const W = 540, H = 960   // portrait 9:16
  const verse = customVerse || VERSES[verseIdx].text
  const ref = customRef || VERSES[verseIdx].ref
  const bg = BACKGROUNDS.find(b => b.id === bgId)
  const font = FONTS.find(f => f.id === fontId)

  useEffect(() => { render() }, [verseIdx, customVerse, customRef, bgId, fontId, textColor])

  function render() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    bg?.draw(ctx, W, H)

    // Cross at top
    ctx.font = '48px serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = textColor
    ctx.globalAlpha = 0.6
    ctx.fillText('✝', W / 2, 80)
    ctx.globalAlpha = 1

    // Decorative line
    ctx.strokeStyle = textColor
    ctx.globalAlpha = 0.2
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(W * 0.2, 105); ctx.lineTo(W * 0.8, 105); ctx.stroke()
    ctx.globalAlpha = 1

    // Verse text (word-wrapped)
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    const fontSize = verse.length > 120 ? 20 : verse.length > 80 ? 23 : 26
    ctx.font = `600 ${fontSize}px ${font?.font || 'Poppins'}, sans-serif`
    const maxWidth = W - 80
    const words = verse.split(' ')
    const lines = []
    let current = ''
    for (const word of words) {
      const test = current ? current + ' ' + word : word
      if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word } else current = test
    }
    if (current) lines.push(current)
    const lineHeight = fontSize * 1.55
    const totalH = lines.length * lineHeight
    let y = H / 2 - totalH / 2
    ctx.globalAlpha = 0.95
    for (const line of lines) { ctx.fillText(line, W / 2, y); y += lineHeight }
    ctx.globalAlpha = 1

    // Decorative line below
    ctx.strokeStyle = textColor
    ctx.globalAlpha = 0.2
    ctx.beginPath(); ctx.moveTo(W * 0.25, H / 2 + totalH / 2 + 18); ctx.lineTo(W * 0.75, H / 2 + totalH / 2 + 18); ctx.stroke()
    ctx.globalAlpha = 1

    // Reference
    ctx.font = `700 ${fontSize - 4}px ${font?.font || 'Poppins'}, sans-serif`
    ctx.fillStyle = textColor
    ctx.globalAlpha = 0.7
    ctx.fillText(ref, W / 2, H / 2 + totalH / 2 + 40)
    ctx.globalAlpha = 1

    // BibleFunLand watermark
    ctx.font = '12px Poppins, sans-serif'
    ctx.fillStyle = textColor
    ctx.globalAlpha = 0.25
    ctx.fillText('BibleFunLand.com', W / 2, H - 30)
    ctx.globalAlpha = 1
  }

  function download() {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `scripture-wallpaper-${ref.replace(/\s/g, '-')}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1A0533)', padding: '48px 36px 36px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, background: 'linear-gradient(90deg,#C084FC,#F472B6,#FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
          🎨 Scripture Wallpaper Maker
        </h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem', fontWeight: 500 }}>
          Create a phone lock screen wallpaper with your favorite Bible verse. Download at full resolution — free.
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Controls */}
        <div>
          {/* Verse picker */}
          <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1.5px solid var(--border)', padding: '22px', marginBottom: 16 }}>
            <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>Choose a Verse</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
              {VERSES.map((v, i) => <button key={i} onClick={() => { setVerseIdx(i); setCustomVerse(''); setCustomRef('') }} style={{ fontSize: '.7rem', fontWeight: 700, padding: '5px 11px', borderRadius: 100, border: `1.5px solid ${verseIdx === i && !customVerse ? 'var(--violet)' : 'var(--border)'}`, background: verseIdx === i && !customVerse ? 'var(--violet-bg)' : 'var(--surface)', color: verseIdx === i && !customVerse ? 'var(--violet)' : 'var(--ink2)', cursor: 'pointer' }}>{v.ref}</button>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8 }}>
              <input className="input-field" placeholder="Or type your own verse text..." value={customVerse} onChange={e => setCustomVerse(e.target.value)} />
              <input className="input-field" placeholder="Reference" value={customRef} onChange={e => setCustomRef(e.target.value)} />
            </div>
          </div>

          {/* Background */}
          <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1.5px solid var(--border)', padding: '22px', marginBottom: 16 }}>
            <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>Background Style</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {BACKGROUNDS.map(b => <button key={b.id} onClick={() => setBgId(b.id)} style={{ padding: '9px 6px', borderRadius: 10, border: `2px solid ${bgId === b.id ? 'var(--violet)' : 'var(--border)'}`, background: bgId === b.id ? 'var(--violet-bg)' : 'var(--bg2)', color: bgId === b.id ? 'var(--violet)' : 'var(--ink3)', fontFamily: 'Poppins,sans-serif', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>{b.label}</button>)}
            </div>
          </div>

          {/* Font + Color */}
          <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1.5px solid var(--border)', padding: '22px', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>Font Style</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {FONTS.map(f => <button key={f.id} onClick={() => setFontId(f.id)} style={{ padding: '9px 12px', borderRadius: 10, border: `2px solid ${fontId === f.id ? 'var(--blue)' : 'var(--border)'}`, background: fontId === f.id ? 'var(--blue-bg)' : 'var(--bg2)', color: fontId === f.id ? 'var(--blue)' : 'var(--ink3)', fontFamily: `${f.font}, sans-serif`, fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}>{f.label}</button>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>Text Color</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['#FFFFFF','#FCD34D','#A5B4FC','#6EE7B7','#F9A8D4','#1F2937'].map(c => <button key={c} onClick={() => setTextColor(c)} style={{ width: 36, height: 36, borderRadius: '50%', background: c, border: `3px solid ${textColor === c ? 'var(--blue)' : 'transparent'}`, cursor: 'pointer', transition: 'all .2s', boxShadow: textColor === c ? '0 0 0 2px var(--bg),0 0 0 4px var(--blue)' : 'none' }} />)}
              </div>
            </div>
          </div>

          <button onClick={download} style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,#7C3AED,#DB2777)', color: 'white', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 28px rgba(124,58,237,.35)', transition: 'all .2s' }}>
            ⬇️ Download Wallpaper (1080×1920)
          </button>
          <p style={{ fontSize: '.7rem', color: 'var(--ink3)', textAlign: 'center', marginTop: 8, fontWeight: 500 }}>Portrait format · Phone lock screen ready · Free to use</p>
        </div>

        {/* Preview */}
        <div style={{ position: 'sticky', top: 80, textAlign: 'center' }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Live Preview</div>
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.35), 0 0 0 2px rgba(255,255,255,.08)', display: 'inline-block', border: '3px solid rgba(255,255,255,.1)' }}>
            <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', width: '100%', maxWidth: 270, height: 'auto' }} />
          </div>
          <p style={{ fontSize: '.68rem', color: 'var(--ink3)', marginTop: 8 }}>540×960 preview · Downloads at 1080×1920</p>
        </div>
      </div>
    </div>
  )
}
