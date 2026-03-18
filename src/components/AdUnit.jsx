// src/components/AdUnit.jsx
// ─────────────────────────────────────────────────────────
// All AdSense ad unit components
//
// SETUP:
//   1. Get your Publisher ID from AdSense dashboard (ca-pub-XXXXXXXXXX)
//   2. Add to .env: VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXX
//   3. Add ad slot IDs from AdSense dashboard for each unit type
//   4. Add the AdSense script to index.html (see bottom of this file)
//
// Usage:
//   <AdBanner />              — leaderboard 728x90 or responsive
//   <AdSidebar />             — rectangle 300x250
//   <AdInContent />           — in-article native ad
//   <AdStickyFooter />        — sticky bottom bar
//   <AdAfterGame score={...}/>— shown at game over screen
// ─────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { useAds } from '../context/AdsContext'

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXX'

// ── Ad slot IDs — replace with your real slot IDs from AdSense dashboard ──
const SLOTS = {
  banner:      '1234567890',   // Leaderboard / Responsive
  sidebar:     '0987654321',   // Medium Rectangle 300x250
  inContent:   '1122334455',   // In-article Native
  stickyFooter:'5544332211',   // Anchor / Sticky
  afterGame:   '9988776655',   // After-game interstitial area
}

// ── Ad placeholder for development (shows instead of real ads) ──
function AdPlaceholder({ label, width, height, style = {} }) {
  const isDev = import.meta.env.DEV
  if (!isDev) return null
  return (
    <div style={{
      background: 'repeating-linear-gradient(45deg,#f0f0f0,#f0f0f0 10px,#e8e8e8 10px,#e8e8e8 20px)',
      border: '2px dashed #ccc', borderRadius: 8,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 4, fontFamily: 'Poppins,sans-serif',
      width: width || '100%', height: height || 90,
      color: '#999', fontSize: '.72rem', fontWeight: 600,
      ...style,
    }}>
      <span style={{ fontSize: '1.2rem' }}>📣</span>
      <span>Ad Unit: {label}</span>
      <span style={{ fontSize: '.65rem', opacity: .7 }}>{CLIENT === 'ca-pub-XXXXXXXXXX' ? 'Set VITE_ADSENSE_CLIENT in .env' : CLIENT}</span>
    </div>
  )
}

// ── Core AdSense hook ──
function useAdsenseUnit(slotId) {
  const ref = useRef(null)
  const pushed = useRef(false)
  useEffect(() => {
    if (pushed.current || !ref.current || !window.adsbygoogle) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {}
  }, [])
  return ref
}

// ── 1. Banner Ad (Leaderboard / Responsive) ──
// Best placement: below Nav, above footer, between page sections
export function AdBanner({ className = '' }) {
  const { showAds } = useAds()
  const ref = useAdsenseUnit(SLOTS.banner)

  if (import.meta.env.DEV) return <AdPlaceholder label="Banner (728×90 / Responsive)" height={90} style={{ margin: '8px auto', maxWidth: 728 }} />
  if (!showAds) return null

  return (
    <div className={className} style={{ textAlign: 'center', overflow: 'hidden', padding: '8px 0' }}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT}
        data-ad-slot={SLOTS.banner}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// ── 2. Sidebar Rectangle (300×250) ──
// Best placement: Sidebar on Blog, BibleMap, Videos pages
export function AdSidebar({ className = '' }) {
  const { showAds } = useAds()
  const ref = useAdsenseUnit(SLOTS.sidebar)

  if (import.meta.env.DEV) return <AdPlaceholder label="Sidebar Rectangle (300×250)" width={300} height={250} />
  if (!showAds) return null

  return (
    <div className={className} style={{ width: 300, overflow: 'hidden' }}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '300px', height: '250px' }}
        data-ad-client={CLIENT}
        data-ad-slot={SLOTS.sidebar}
      />
    </div>
  )
}

// ── 3. In-Content Ad (Native / In-Article) ──
// Best placement: Between paragraphs in Blog, after 2nd game card
export function AdInContent({ className = '' }) {
  const { showAds } = useAds()
  const ref = useAdsenseUnit(SLOTS.inContent)

  if (import.meta.env.DEV) return <AdPlaceholder label="In-Content Native Ad" height={120} style={{ margin: '24px 0' }} />
  if (!showAds) return null

  return (
    <div className={className} style={{ textAlign: 'center', overflow: 'hidden', margin: '24px 0' }}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={CLIENT}
        data-ad-slot={SLOTS.inContent}
      />
    </div>
  )
}

// ── 4. Sticky Footer Ad ──
// Best placement: Fixed bottom of every page, dismissible
export function AdStickyFooter() {
  const { showAds } = useAds()
  const ref = useAdsenseUnit(SLOTS.stickyFooter)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null
  if (import.meta.env.DEV) {
    return (
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: 'white', borderTop: '1px solid #e5e7eb', padding: '4px 0' }}>
        <AdPlaceholder label="Sticky Footer Ad (728×90)" height={60} style={{ margin: '0 auto', maxWidth: 728 }} />
        <button onClick={() => setDismissed(true)} style={{ position: 'absolute', top: 4, right: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: '.7rem', color: '#9ca3af' }}>✕</button>
      </div>
    )
  }
  if (!showAds) return null

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: 'var(--surface)', borderTop: '1px solid var(--border)', textAlign: 'center', padding: '2px 0' }}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT}
        data-ad-slot={SLOTS.stickyFooter}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <button
        onClick={() => setDismissed(true)}
        style={{ position: 'absolute', top: 4, right: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: '.68rem', color: 'var(--ink3)', fontFamily: 'Poppins,sans-serif' }}
        title="Close ad"
      >
        ✕
      </button>
    </div>
  )
}

// ── 5. After-Game Ad ──
// Shows on game over / win screens — users in a natural pause, high CTR
export function AdAfterGame({ score, className = '' }) {
  const { showAds } = useAds()
  const ref = useAdsenseUnit(SLOTS.afterGame)

  if (import.meta.env.DEV) {
    return (
      <div style={{ background: 'var(--bg2)', borderRadius: 14, padding: '16px 20px', border: '1px solid var(--border)', margin: '20px 0' }}>
        <div style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--ink3)', textAlign: 'center', marginBottom: 8 }}>Advertisement</div>
        <AdPlaceholder label="After-Game Ad (Responsive)" height={100} />
      </div>
    )
  }
  if (!showAds) return null

  return (
    <div className={className} style={{ margin: '20px 0' }}>
      <div style={{ fontSize: '.65rem', color: 'var(--ink3)', fontWeight: 500, textAlign: 'center', marginBottom: 4, fontFamily: 'Poppins,sans-serif' }}>
        Advertisement — <a href="/premium" style={{ color: 'var(--blue)', fontWeight: 700 }}>Go Pro to remove ads</a>
      </div>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT}
        data-ad-slot={SLOTS.afterGame}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Need useState for StickyFooter
import { useState } from 'react'

/*
  ── index.html AdSense Script ──
  Add this to your index.html <head> AFTER your cookie consent loads:

  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
    crossorigin="anonymous"
  ></script>

  Replace ca-pub-XXXXXXXXXX with your real publisher ID.

  ── Ad placement strategy for BibleFunLand ──

  HOME page:
  - AdBanner: between "Quick Access" and "Games" sections
  - AdInContent: between "Verse of Day" and CTA

  TRIVIA / DAVID & GOLIATH:
  - AdAfterGame: on results/win/lose screen

  BLOG:
  - AdInContent: after 3rd paragraph of each post
  - AdSidebar: in the right sidebar

  BIBLE MAP:
  - AdSidebar: below the location info panel

  VIDEOS:
  - AdBanner: between featured video and grid

  DEVOTIONAL:
  - AdInContent: below generated devotional result
  - (Don't put ads near the prayer/scripture — feels disrespectful)

  PRAYER WALL:
  - AdBanner: at top of page only, NOT between prayer cards

  FLASHCARDS:
  - AdBanner: between stat row and card (above game area)

  GLOBAL:
  - AdStickyFooter: on all pages except during active gameplay

  ── Revenue estimates (faith-based sites) ──
  RPM (revenue per 1000 impressions):
  - Blog/devotional pages: $6-15 RPM
  - Game pages: $3-8 RPM
  - Prayer wall: $4-10 RPM
  - Flashcards: $5-12 RPM

  At 10,000 monthly visitors:
  - ~25,000 pageviews
  - ~70,000 ad impressions
  - Estimated: $200-600/month
*/
