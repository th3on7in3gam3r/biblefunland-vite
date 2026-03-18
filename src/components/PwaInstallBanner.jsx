import { useState, useEffect, useCallback } from 'react'

export default function PwaInstallBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isDismissed, setIsDismissed] = useState(() => localStorage.getItem('bfl_pwa_dismissed') === 'true')

  useEffect(() => {
    if (isDismissed) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Wait 3 seconds before showing the prompt
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // For testing/desktop demo, show after 5s if not already shown
    const demoTimer = setTimeout(() => {
      if (!isDismissed) setShow(true)
    }, 5000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(demoTimer)
    }
  }, [isDismissed])

  const dismiss = useCallback(() => {
    setShow(false)
    setIsDismissed(true)
    localStorage.setItem('bfl_pwa_dismissed', 'true')
  }, [])

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        dismiss()
      }
    } else {
      // Fallback for iOS or others where beforeinstallprompt isn't supported
      alert("To install BibleFunLand:\n\n1. Tap the Share button 📤\n2. Scroll down and tap 'Add to Home Screen' ➕")
      dismiss()
    }
  }

  if (!show || isDismissed) return null

  return (
    <div style={{
      position: 'fixed',
      top: '76px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: 'calc(100% - 40px)',
      maxWidth: '480px',
      background: 'rgba(15, 15, 26, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '24px',
      border: '1.5px solid rgba(255, 255, 255, 0.1)',
      borderTop: '1.5px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.2)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      animation: 'pwaSlideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <style>{`
        @keyframes pwaSlideDown {
          from { opacity: 0; transform: translate(-50%, -40px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          flexShrink: 0,
          boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
        }}>📖</div>
        <div>
          <div style={{ fontSize: '.95rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 1, letterSpacing: '-0.3px' }}>BibleFunLand App</div>
          <div style={{ fontSize: '.75rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, lineHeight: 1.3 }}>Ready to install on your home screen!</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={install}
          style={{
            fontSize: '.85rem',
            fontWeight: 800,
            padding: '10px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Install
        </button>
        <button
          onClick={dismiss}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
        >
          ×
        </button>
      </div>
    </div>
  )
}
