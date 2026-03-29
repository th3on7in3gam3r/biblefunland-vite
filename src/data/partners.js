// ─── Approved Ministry Partners ───────────────────────────────────────────────
// To add a new partner: append an entry to this array and redeploy.
// slug must be URL-safe (lowercase, hyphens only).

export const PARTNERS = [
  {
    slug: 'anointed-worship-center',
    name: 'Anointed Worship Center',
    tagline: 'Where Everybody is Somebody',
    website: 'https://anointedworshipcenter.com',
    emoji: '⛪',
    welcomeMessage:
      "Welcome, Anointed Worship Center family! Your church has partnered with BibleFunLand to bring the Word of God alive for every member — from the youngest kids to seasoned believers. Explore Scripture trivia, daily devotionals, Bible maps, and more, all tailored for your faith journey.",
    featuredLinks: [
      { to: '/trivia',      label: '🎮 Scripture Trivia',   desc: 'Test your Bible knowledge' },
      { to: '/devotional',  label: '🙏 AI Devotional',      desc: 'Daily personalized devotionals' },
      { to: '/kids-stories',label: '📖 Kids Bible Stories', desc: 'Faith stories for little ones' },
      { to: '/prayer',      label: '🌍 Prayer Wall',        desc: 'Pray with the community' },
      { to: '/map',         label: '🗺️ Bible Map',          desc: 'Explore the Holy Land' },
      { to: '/flashcards',  label: '🧠 Flashcards',         desc: 'Memorize key verses' },
    ],
    location: 'United States',
    size: '200–500',
    tier: 'Kingdom Friend',
    since: '2026',
    active: true,
  },
]

// Helper to find a partner by slug
export function getPartnerBySlug(slug) {
  return PARTNERS.find(p => p.slug === slug && p.active) || null
}
