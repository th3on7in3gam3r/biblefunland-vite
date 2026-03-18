import { useState, useEffect } from 'react'
import styles from './CookieConsent.module.css'

// ─────────────────────────────────────────────────────────
// CookieConsent — GDPR & CCPA compliant
// Controls: analytics (GA) and ads (AdSense)
// Google requires this before loading any tracking scripts
// ─────────────────────────────────────────────────────────

const CONSENT_KEY = 'bfl_cookie_consent'

export function getCookieConsent() {
  try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null') } catch { return null }
}

export function setCookieConsent(prefs) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...prefs, timestamp: Date.now() }))
}

export default function CookieConsent({ onConsent }) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState({ analytics: true, ads: true })

  useEffect(() => {
    const saved = getCookieConsent()
    if (!saved) {
      // Show after 800ms so page loads first
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    } else {
      onConsent?.(saved)
    }
  }, [])

  function acceptAll() {
    const consent = { analytics: true, ads: true, essential: true }
    setCookieConsent(consent)
    setVisible(false)
    onConsent?.(consent)
    loadScripts(consent)
  }

  function acceptSelected() {
    const consent = { ...prefs, essential: true }
    setCookieConsent(consent)
    setVisible(false)
    onConsent?.(consent)
    loadScripts(consent)
  }

  function rejectAll() {
    const consent = { analytics: false, ads: false, essential: true }
    setCookieConsent(consent)
    setVisible(false)
    onConsent?.(consent)
  }

  function loadScripts(consent) {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID
    if (consent.analytics && gaId) {
      // Load Google Analytics
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      document.head.appendChild(script)
      window.dataLayer = window.dataLayer || []
      function gtag() { window.dataLayer.push(arguments) }
      window.gtag = gtag
      gtag('js', new Date())
      gtag('config', gaId, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      })
    }

    if (consent.ads) {
      // AdSense will auto-initialize from the script in index.html
      // This just signals consent to the existing AdSense script
      if (window.adsbygoogle) {
        try {
          window.adsbygoogle.requestNonPersonalizedAds = 0
        } catch {}
      }
    } else {
      // Non-personalized ads
      if (window.adsbygoogle) {
        try {
          window.adsbygoogle.requestNonPersonalizedAds = 1
        } catch {}
      }
    }
  }

  if (!visible) return null

  return (
    <div className={styles.overlay}>
      <div className={`${styles.banner} ${expanded ? styles.expanded : ''}`}>
        {/* Compact view */}
        {!expanded && (
          <div className={styles.compact}>
            <div className={styles.compactLeft}>
              <span className={styles.cookieIcon}>🍪</span>
              <div>
                <div className={styles.compactTitle}>We use cookies</div>
                <div className={styles.compactSub}>
                  We use cookies for analytics and ads to keep BibleFunLand free.{' '}
                  <button className={styles.learnMore} onClick={() => setExpanded(true)}>
                    Learn more
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.compactBtns}>
              <button className={styles.btnReject} onClick={rejectAll}>Reject All</button>
              <button className={styles.btnCustomize} onClick={() => setExpanded(true)}>Customize</button>
              <button className={styles.btnAccept} onClick={acceptAll}>Accept All</button>
            </div>
          </div>
        )}

        {/* Expanded preferences */}
        {expanded && (
          <div className={styles.expandedWrap}>
            <div className={styles.expandedHeader}>
              <span className={styles.cookieIcon}>🍪</span>
              <h3 className={styles.expandedTitle}>Cookie Preferences</h3>
              <button className={styles.closeBtn} onClick={() => setExpanded(false)}>✕</button>
            </div>
            <p className={styles.expandedDesc}>
              We use cookies to improve your experience and keep BibleFunLand free for everyone.
              Choose which cookies you're comfortable with below.
            </p>

            {/* Essential */}
            <div className={styles.prefRow}>
              <div className={styles.prefInfo}>
                <div className={styles.prefName}>Essential Cookies <span className={styles.required}>Always On</span></div>
                <div className={styles.prefDesc}>Required for login, dark mode, language, and site functionality. Cannot be disabled.</div>
              </div>
              <div className={`${styles.toggle} ${styles.toggleOn} ${styles.toggleDisabled}`} />
            </div>

            {/* Analytics */}
            <div className={styles.prefRow}>
              <div className={styles.prefInfo}>
                <div className={styles.prefName}>Analytics Cookies</div>
                <div className={styles.prefDesc}>Google Analytics helps us understand which features are popular so we can improve the site. IP addresses are anonymized.</div>
              </div>
              <button
                className={`${styles.toggle} ${prefs.analytics ? styles.toggleOn : ''}`}
                onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                aria-label="Toggle analytics cookies"
              />
            </div>

            {/* Ads */}
            <div className={styles.prefRow}>
              <div className={styles.prefInfo}>
                <div className={styles.prefName}>Advertising Cookies</div>
                <div className={styles.prefDesc}>Google AdSense uses cookies to show relevant ads. Declining means you'll still see ads, but they won't be personalized to your interests.</div>
              </div>
              <button
                className={`${styles.toggle} ${prefs.ads ? styles.toggleOn : ''}`}
                onClick={() => setPrefs(p => ({ ...p, ads: !p.ads }))}
                aria-label="Toggle advertising cookies"
              />
            </div>

            <div className={styles.expandedBtns}>
              <button className={styles.btnReject} onClick={rejectAll}>Reject All</button>
              <button className={styles.btnCustomize} onClick={acceptSelected}>Save My Choices</button>
              <button className={styles.btnAccept} onClick={acceptAll}>Accept All</button>
            </div>

            <p className={styles.legal}>
              See our{' '}
              <a href="/privacy" className={styles.legalLink}>Privacy Policy</a> and{' '}
              <a href="/terms" className={styles.legalLink}>Terms of Service</a> for details.
              You can change your preferences at any time.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
