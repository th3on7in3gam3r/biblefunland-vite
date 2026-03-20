import { useState, useEffect } from 'react'
import styles from './PwaInstallBanner.module.css'

export default function PwaInstallBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show immediately if native prompt is available
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Fallback: show after 5 seconds if no native prompt
    const timer = setTimeout(() => {
      if (!deferredPrompt) setShow(true)
    }, 5000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [deferredPrompt])

  if (!show) return null

  async function handleInstall() {
    setInstalling(true)
    
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShow(false)
      }
    } else {
      // Fallback instructions
      const ua = navigator.userAgent.toLowerCase()
      let instructions = "To install: use your browser menu → 'Add to Home Screen' or 'Install App'"
      
      if (ua.includes('iphone') || ua.includes('ipad')) {
        instructions = "Tap Share → Add to Home Screen"
      } else if (ua.includes('android')) {
        instructions = "Tap Menu → Install App or Add to Home Screen"
      }
      
      alert(instructions)
    }
    
    setInstalling(false)
  }

  return (
    <div className={styles.banner}>
      {/* Background gradient */}
      <div className={styles.bgGradient} />
      
      {/* Content */}
      <div className={styles.content}>
        <div className={styles.icon}>📖</div>
        <div className={styles.text}>
          <h3 className={styles.title}>Get BibleFunLand on Your Device</h3>
          <p className={styles.subtitle}>Fast access, works offline, no app store needed</p>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.installBtn}
          onClick={handleInstall}
          disabled={installing}
          aria-label="Install app"
        >
          {installing ? (
            <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', animation: 'spin .7s linear infinite' }} />
          ) : (
            '📲 Install'
          )}
        </button>
        <button
          className={styles.closeBtn}
          onClick={() => setShow(false)}
          aria-label="Dismiss banner"
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
