import { useState, useEffect, useRef } from 'react';
const THEMES = [
  { bg1: '#1E1B4B', bg2: '#312E81', text: '#ffffff', accent: 'rgba(165,180,252,.8)' },
  { bg1: '#064E3B', bg2: '#065F46', text: '#ffffff', accent: 'rgba(110,231,183,.8)' },
  { bg1: '#7C2D12', bg2: '#9A3412', text: '#ffffff', accent: 'rgba(253,186,116,.8)' },
  { bg1: '#1C1917', bg2: '#292524', text: '#ffffff', accent: 'rgba(253,230,138,.8)' },
  { bg1: '#3B82F6', bg2: '#EC4899', text: '#ffffff', accent: 'rgba(255,255,255,.7)' },
  { bg1: '#F97316', bg2: '#EF4444', text: '#ffffff', accent: 'rgba(255,255,255,.7)' },
];
export default function ShareCards() {
  const [themeIdx, setThemeIdx] = useState(0);
  const [verse, setVerse] = useState(
    '"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."'
  );
  const [ref, setRef] = useState('John 3:16');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef();
  useEffect(() => renderCard(), [themeIdx, verse, ref]);
  function renderCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 540,
      H = 540;
    const theme = THEMES[themeIdx];
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.bg1);
    grad.addColorStop(1, theme.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.beginPath();
    ctx.arc(W - 60, 60, 120, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.04)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(60, H - 60, 90, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.04)';
    ctx.fill();
    ctx.font = 'bold 140px serif';
    ctx.fillStyle = 'rgba(255,255,255,.04)';
    ctx.textAlign = 'center';
    ctx.fillText('✝', W / 2, H / 2 + 50);
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = theme.accent;
    ctx.textAlign = 'left';
    ctx.fillText('✝ BibleFunLand', 32, 42);
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    const words = verse.replace(/^[""]/, '').replace(/[""]/, '').split(' ');
    const maxW = W - 100;
    let line = '';
    let y = 200;
    const fontSize = words.length > 20 ? 18 : words.length > 12 ? 21 : 24;
    ctx.font = `600 ${fontSize}px sans-serif`;
    words.forEach((w, i) => {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > maxW && i > 0) {
        ctx.fillText(line.trim(), W / 2, y);
        line = w + ' ';
        y += fontSize * 1.4;
      } else line = test;
    });
    if (line.trim()) ctx.fillText(line.trim(), W / 2, y);
    ctx.font = '700 19px sans-serif';
    ctx.fillStyle = theme.accent;
    ctx.fillText('— ' + ref, W / 2, y + 44);
    ctx.fillStyle = 'rgba(255,255,255,.15)';
    ctx.fillRect(W / 2 - 80, H - 54, 160, 1);
    ctx.font = '500 13px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.fillText('biblefunland.com', W / 2, H - 30);
  }
  function download() {
    const a = document.createElement('a');
    a.download = 'bibleverse.png';
    a.href = canvasRef.current.toDataURL('image/png');
    a.click();
  }
  function copyText() {
    navigator.clipboard.writeText(`${verse}\n— ${ref}\n\nShared from BibleFunLand.com`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareToTwitter() {
    const text = encodeURIComponent(`${verse}\n— ${ref}\n\n#BibleFunLand #Scripture`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }

  function shareToFacebook() {
    const url = encodeURIComponent('https://biblefunland.com');
    const quote = encodeURIComponent(`${verse} — ${ref}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
  }

  function shareToWhatsApp() {
    const text = encodeURIComponent(`${verse}\n— ${ref}\n\nShared from BibleFunLand.com`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  function shareToPinterest() {
    const media = canvasRef.current.toDataURL('image/png');
    const description = encodeURIComponent(`${verse} — ${ref} | BibleFunLand.com`);
    const url = encodeURIComponent('https://biblefunland.com');
    window.open(
      `https://pinterest.com/pin/create/button/?url=${url}&description=${description}`,
      '_blank'
    );
  }
  async function shareCard() {
    if (!navigator.share) {
      alert('Share not supported on this device');
      return;
    }
    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'verse.png', { type: 'image/png' });
        await navigator.share({
          title: 'Bible Verse',
          text: `${verse}\n— ${ref}`,
          files: [file],
        });
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share failed:', err);
    }
  }
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1C1B3A)',
          padding: '60px 36px 44px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,4.5vw,3.4rem)',
            fontWeight: 800,
            letterSpacing: -1,
            background: 'linear-gradient(90deg,#F472B6,#C084FC,#60A5FA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          Share Cards
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,.5)',
            fontSize: '.9rem',
            fontWeight: 500,
            maxWidth: 440,
            margin: '0 auto',
          }}
        >
          Create beautiful verse graphics to share on Instagram, Facebook, WhatsApp, and more.
        </p>
      </div>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '44px 24px' }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--sh)',
              padding: 28,
            }}
          >
            <div
              style={{
                fontSize: '.72rem',
                fontWeight: 700,
                color: 'var(--ink3)',
                letterSpacing: '.5px',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Verse
            </div>
            <textarea
              className="textarea-field"
              rows={3}
              value={verse}
              onChange={(e) => {
                setVerse(e.target.value);
              }}
              style={{ marginBottom: 10 }}
            />
            <input
              className="input-field"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              style={{ marginBottom: 22 }}
            />
            <div
              style={{
                fontSize: '.72rem',
                fontWeight: 700,
                color: 'var(--ink3)',
                letterSpacing: '.5px',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Background Theme
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 8,
                marginBottom: 22,
              }}
            >
              {THEMES.map((t, i) => (
                <div
                  key={i}
                  onClick={() => setThemeIdx(i)}
                  style={{
                    height: 40,
                    borderRadius: 9,
                    cursor: 'pointer',
                    background: `linear-gradient(135deg,${t.bg1},${t.bg2})`,
                    border: `2px solid ${i === themeIdx ? 'var(--blue)' : 'transparent'}`,
                    boxShadow: i === themeIdx ? '0 0 0 3px rgba(59,130,246,.2)' : 'none',
                    transition: 'all .2s',
                  }}
                />
              ))}
            </div>
            <button
              className="btn btn-blue btn-full"
              onClick={renderCard}
              style={{ justifyContent: 'center' }}
            >
              🎨 Update Card
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <canvas
              ref={canvasRef}
              width={540}
              height={540}
              style={{
                borderRadius: 16,
                maxWidth: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,.18)',
              }}
            />

            {/* Primary actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="btn"
                style={{
                  background: 'linear-gradient(135deg,#F472B6,#C084FC)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(196,132,252,.3)',
                }}
                onClick={download}
              >
                ⬇️ Download PNG
              </button>
              <button className="btn btn-outline" onClick={copyText}>
                {copied ? '✅ Copied!' : '📋 Copy Text'}
              </button>
              {navigator.share && (
                <button
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg,#10B981,#059669)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(16,185,129,.3)',
                  }}
                  onClick={shareCard}
                >
                  📤 Share
                </button>
              )}
            </div>

            {/* Social platform buttons */}
            <div
              style={{
                width: '100%',
                background: 'var(--surface)',
                borderRadius: 16,
                border: '1.5px solid var(--border)',
                padding: '16px 20px',
              }}
            >
              <div
                style={{
                  fontSize: '.68rem',
                  fontWeight: 800,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              >
                Share to Social
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  onClick={shareToTwitter}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #1DA1F2',
                    background: 'rgba(29,161,242,.08)',
                    color: '#1DA1F2',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 700,
                    fontSize: '.78rem',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(29,161,242,.18)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(29,161,242,.08)')}
                >
                  𝕏 Twitter / X
                </button>
                <button
                  onClick={shareToFacebook}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #1877F2',
                    background: 'rgba(24,119,242,.08)',
                    color: '#1877F2',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 700,
                    fontSize: '.78rem',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(24,119,242,.18)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(24,119,242,.08)')}
                >
                  📘 Facebook
                </button>
                <button
                  onClick={shareToWhatsApp}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #25D366',
                    background: 'rgba(37,211,102,.08)',
                    color: '#25D366',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 700,
                    fontSize: '.78rem',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(37,211,102,.18)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(37,211,102,.08)')}
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={shareToPinterest}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #E60023',
                    background: 'rgba(230,0,35,.08)',
                    color: '#E60023',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 700,
                    fontSize: '.78rem',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(230,0,35,.18)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(230,0,35,.08)')}
                >
                  📌 Pinterest
                </button>
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: '.68rem',
                  color: 'var(--ink3)',
                  textAlign: 'center',
                  fontWeight: 500,
                }}
              >
                💡 Download the image first, then attach it when posting to Instagram
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
