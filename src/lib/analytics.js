/**
 * analytics.js — GA4 initializer + custom event tracker
 * Tracks every meaningful user action across BibleFunLand.
 * All tracking is no-op when GA4 is not configured.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

function gtag(...args) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

/** Initialize GA4 — call once on app load */
export function initAnalytics() {
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return
  gtag('config', GA_ID, {
    anonymize_ip: true,
    send_page_view: false, // we send manually via trackPage
  })
}

/** Track a page view — call on route change */
export function trackPage(path) {
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return
  gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    send_to: GA_ID,
  })
}

/**
 * Track a custom event.
 * @param {string} eventName  — snake_case event name
 * @param {object} params     — additional dimensions
 */
export function trackEvent(eventName, params = {}) {
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return
  gtag('event', eventName, { ...params, send_to: GA_ID })
}

// ─── Pre-built event helpers ──────────────────────────────────────────────────

export const Analytics = {
  // Games
  gameStarted:    (game, difficulty) => trackEvent('game_started',    { game, difficulty }),
  gameCompleted:  (game, score)      => trackEvent('game_completed',  { game, score }),

  // Trivia
  triviaStarted:  (difficulty)       => trackEvent('trivia_started',  { difficulty }),
  triviaFinished: (score, correct)   => trackEvent('trivia_finished', { score, correct }),

  // Bible
  bibleChapterRead: (book, chapter, translation) => trackEvent('bible_chapter_read', { book, chapter, translation }),
  bibleBookmarked:  (verseRef)       => trackEvent('bible_bookmarked', { verse_ref: verseRef }),
  bibleHighlighted: (verseRef)       => trackEvent('bible_highlighted', { verse_ref: verseRef }),
  bibleSearched:    (query)          => trackEvent('bible_searched',   { query }),

  // Prayer
  prayerSubmitted:  ()               => trackEvent('prayer_submitted'),
  prayerPrayed:     ()               => trackEvent('prayer_prayed_for'),

  // Devotional
  devotionalGenerated: (topic)       => trackEvent('devotional_generated', { topic }),

  // Badges & Streaks
  badgeEarned:    (badgeId)          => trackEvent('badge_earned',    { badge_id: badgeId }),
  streakCheckin:  (streak)           => trackEvent('streak_checkin',  { streak_count: streak }),

  // Podcast
  podcastPlayed:  (episode)          => trackEvent('podcast_played',  { episode }),

  // Auth
  signedUp:       ()                 => trackEvent('sign_up'),
  signedIn:       ()                 => trackEvent('login'),

  // Feature usage
  featureUsed:    (feature)          => trackEvent('feature_used',    { feature }),

  // Share
  shareCard:      (verse)            => trackEvent('share_card',      { verse }),
}
