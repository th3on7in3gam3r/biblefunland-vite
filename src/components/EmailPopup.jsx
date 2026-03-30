import { useState, useEffect } from 'react';

export default function EmailPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('bfl_email_shown')) return;
    const timer = setTimeout(() => setOpen(true), 9000);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setOpen(false);
    sessionStorage.setItem('bfl_email_shown', '1');
  }

  function submit() {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email!');
      return;
    }
    setDone(true);
    sessionStorage.setItem('bfl_email_shown', '1');
    setTimeout(close, 2000);
  }

  if (!open) return null;

  const overlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.62)',
    zIndex: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: 'Poppins, sans-serif',
  };
  const card = {
    background: 'var(--surface, #fff)',
    borderRadius: 36,
    maxWidth: 480,
    width: '100%',
    overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,.3)',
    position: 'relative',
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && close()}>
      <div style={card}>
        {/* Top gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg,#3B82F6,#8B5CF6,#EC4899)',
            padding: '40px 36px 32px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={close}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '.9rem',
            }}
          >
            ✕
          </button>
          <div
            style={{
              fontSize: '3.5rem',
              marginBottom: 12,
              display: 'block',
              animation: 'floatA 3s ease-in-out infinite',
            }}
          >
            🎁
          </div>
          <h2
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: '1.7rem',
              fontWeight: 800,
              color: 'white',
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Free 7-Day Bible
            <br />
            Adventure Guide!
          </h2>
          <p
            style={{
              fontSize: '.85rem',
              color: 'rgba(255,255,255,.8)',
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            Join thousands of families — get our free guide packed with games, devotionals & memory
            verse challenges.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 32px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
              <p
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--ink,#0F0F1A)',
                }}
              >
                You're in! Check your inbox 🙏
              </p>
            </div>
          ) : (
            <>
              {/* Perks */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 7,
                  marginBottom: 20,
                  background: 'var(--bg2,#F8F9FF)',
                  borderRadius: 14,
                  padding: '14px 18px',
                }}
              >
                {[
                  '📖 7 daily Bible reading plans',
                  '🎮 Exclusive game tips & bonus content',
                  '🙏 Family devotional templates',
                  '🏆 Printable badge & achievement sheets',
                ].map((p) => (
                  <div
                    key={p}
                    style={{
                      fontSize: '.8rem',
                      fontWeight: 600,
                      color: 'var(--ink2,#3A3A5C)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {p}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  style={{
                    flex: 1,
                    fontSize: '.85rem',
                    padding: '11px 15px',
                    borderRadius: 11,
                    border: '1.5px solid var(--border,rgba(0,0,0,.07))',
                    background: 'var(--bg2,#F8F9FF)',
                    color: 'var(--ink,#0F0F1A)',
                    fontFamily: 'Poppins, sans-serif',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={submit}
                  style={{
                    fontSize: '.82rem',
                    fontWeight: 700,
                    padding: '11px 18px',
                    borderRadius: 11,
                    background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Get Free Guide →
                </button>
              </div>
              <p
                style={{
                  textAlign: 'center',
                  fontSize: '.74rem',
                  color: 'var(--ink3,#8888AA)',
                  cursor: 'pointer',
                }}
                onClick={close}
              >
                No thanks, I'll pass
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
