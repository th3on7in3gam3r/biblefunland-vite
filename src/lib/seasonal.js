/**
 * seasonal.js — Seasonal content system for BibleFunLand
 * Detects current season, returns themed content, badges, and weekly challenges.
 */

// ── Season definitions ────────────────────────────────────────────────────────
export const SEASONS = [
  {
    id: 'easter',
    label: 'Easter',
    emoji: '🐣',
    color: '#10B981',
    bg: 'linear-gradient(135deg,#064E3B,#065F46,#0F172A)',
    // Month 2 (March) day 15 – Month 3 (April) day 30
    check: (m, d) => (m === 2 && d >= 15) || (m === 3 && d <= 30),
    badge: { id: 'resurrection-runner', label: 'Resurrection Runner', emoji: '🐣', points: 150 },
    hero: {
      title: 'He Is Risen! 🐣',
      subtitle: 'Celebrate Easter with special games, devotionals, and challenges',
      cta1: { label: '🎮 Easter Games', to: '/play?season=easter' },
      cta2: { label: '🙏 Easter Devotional', to: '/ai/devotional?theme=easter' },
    },
    featured: [
      {
        icon: '🏃',
        title: 'Resurrection Runner',
        desc: 'Special Easter edition of Scripture Runner',
        to: '/play/game/runner',
        tag: 'Easter Special',
      },
      {
        icon: '🐣',
        title: 'Easter Trivia',
        desc: 'Test your knowledge of the resurrection story',
        to: '/play/trivia',
        tag: 'Easter',
      },
      {
        icon: '🙏',
        title: 'Easter Devotional',
        desc: 'AI-powered devotional on the resurrection',
        to: '/ai/devotional?theme=easter',
        tag: 'AI',
      },
    ],
    aiTheme: 'Easter and the Resurrection of Jesus Christ',
    weeklyChallenge: {
      title: 'Resurrection Week Challenge',
      desc: 'Read one resurrection account each day (Matthew 28, Mark 16, Luke 24, John 20)',
      points: 200,
      badge: 'resurrection-runner',
    },
  },
  {
    id: 'christmas',
    label: 'Christmas',
    emoji: '🎄',
    color: '#EF4444',
    bg: 'linear-gradient(135deg,#7F1D1D,#1E3A5F,#0F172A)',
    check: (m, d) => (m === 11 && d >= 1) || (m === 11 && d <= 31),
    badge: { id: 'nativity-star', label: 'Nativity Star', emoji: '⭐', points: 150 },
    hero: {
      title: 'The Greatest Gift 🎄',
      subtitle: 'Celebrate the birth of Jesus with Christmas games, stories, and devotionals',
      cta1: { label: '🎮 Christmas Games', to: '/play?season=christmas' },
      cta2: { label: '📖 Nativity Story', to: '/explore/bible' },
    },
    featured: [
      {
        icon: '⭐',
        title: 'Nativity Trivia',
        desc: 'How well do you know the Christmas story?',
        to: '/play/trivia',
        tag: 'Christmas',
      },
      {
        icon: '🎄',
        title: 'Christmas Devotional',
        desc: 'AI devotional on the birth of Jesus',
        to: '/ai/devotional?theme=christmas',
        tag: 'AI',
      },
      {
        icon: '🎵',
        title: 'Christmas Rap',
        desc: 'Generate a Christmas scripture rap',
        to: '/ai/rap-generator?theme=christmas',
        tag: 'AI Fun',
      },
    ],
    aiTheme: 'The Birth of Jesus Christ and the Christmas story',
    weeklyChallenge: {
      title: 'Advent Challenge',
      desc: 'Read one prophecy about Jesus each day this week (Isaiah 9:6, Micah 5:2, Isaiah 7:14)',
      points: 200,
      badge: 'nativity-star',
    },
  },
  {
    id: 'back-to-school',
    label: 'Back to School',
    emoji: '📚',
    color: '#3B82F6',
    bg: 'linear-gradient(135deg,#1E3A5F,#1E1B4B,#0F172A)',
    check: (m, d) => (m === 7 && d >= 15) || (m === 8 && d <= 15),
    badge: { id: 'wisdom-seeker', label: 'Wisdom Seeker', emoji: '📚', points: 100 },
    hero: {
      title: 'Start the Year with Wisdom 📚',
      subtitle: 'Back to school season — build Bible knowledge with games and challenges',
      cta1: { label: '🎮 Learning Games', to: '/play?season=back-to-school' },
      cta2: { label: '📖 Reading Plan', to: '/grow/reading-plan' },
    },
    featured: [
      {
        icon: '📚',
        title: 'Bible Flashcards',
        desc: 'Memorize key verses for the new school year',
        to: '/play/flashcards',
        tag: 'Study',
      },
      {
        icon: '🧠',
        title: 'Scripture Typing',
        desc: 'Type Bible verses to memorize them',
        to: '/grow/scripture-typing',
        tag: 'Study',
      },
      {
        icon: '🙏',
        title: 'School Year Devotional',
        desc: 'AI devotional for students starting a new year',
        to: '/ai/devotional?theme=back-to-school',
        tag: 'AI',
      },
    ],
    aiTheme: 'Wisdom, learning, and starting a new school year with God',
    weeklyChallenge: {
      title: 'Wisdom Week',
      desc: 'Memorize Proverbs 3:5-6 and complete 3 flashcard sessions this week',
      points: 150,
      badge: 'wisdom-seeker',
    },
  },
  {
    id: 'thanksgiving',
    label: 'Thanksgiving',
    emoji: '🦃',
    color: '#F59E0B',
    bg: 'linear-gradient(135deg,#78350F,#1C1305,#0F172A)',
    check: (m, d) => m === 10 && d >= 15 && d <= 30,
    badge: { id: 'grateful-heart', label: 'Grateful Heart', emoji: '🦃', points: 100 },
    hero: {
      title: 'Give Thanks to the Lord 🦃',
      subtitle: 'Thanksgiving season — explore gratitude and praise in Scripture',
      cta1: { label: '🙏 Gratitude Devotional', to: '/ai/devotional?theme=thanksgiving' },
      cta2: { label: '📖 Psalms of Praise', to: '/explore/bible' },
    },
    featured: [
      {
        icon: '🦃',
        title: 'Thanksgiving Trivia',
        desc: 'Bible verses about gratitude and praise',
        to: '/play/trivia',
        tag: 'Thanksgiving',
      },
      {
        icon: '🙏',
        title: 'Gratitude Devotional',
        desc: 'AI devotional on thankfulness',
        to: '/ai/devotional?theme=thanksgiving',
        tag: 'AI',
      },
      {
        icon: '🎵',
        title: 'Praise Rap',
        desc: 'Generate a thanksgiving scripture rap',
        to: '/ai/rap-generator?theme=thanksgiving',
        tag: 'AI Fun',
      },
    ],
    aiTheme: 'Gratitude, thanksgiving, and praise in the Bible',
    weeklyChallenge: {
      title: 'Gratitude Challenge',
      desc: 'Write 3 things you are grateful for each day and find a Bible verse for each',
      points: 100,
      badge: 'grateful-heart',
    },
  },
];

// ── Evergreen weekly challenge (fallback when no season active) ────────────────
export const WEEKLY_CHALLENGE = {
  title: '📅 Weekly Bible Challenge',
  desc: 'Complete 5 trivia rounds, read 3 Bible chapters, and pray for 2 people this week',
  points: 100,
  badge: 'weekly-warrior',
  refreshDay: 1, // Monday
};

// ── Get current season ────────────────────────────────────────────────────────
export function getCurrentSeason(date = new Date()) {
  const m = date.getMonth(); // 0-11
  const d = date.getDate();
  return SEASONS.find((s) => s.check(m, d)) || null;
}

// ── Get week number (for weekly challenge rotation) ───────────────────────────
export function getWeekNumber(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - start) / 86400000 + start.getDay() + 1) / 7);
}

// ── Get active challenge (seasonal or weekly) ─────────────────────────────────
export function getActiveChallenge(date = new Date()) {
  const season = getCurrentSeason(date);
  if (season) return { ...season.weeklyChallenge, seasonal: true, season: season.id };
  const week = getWeekNumber(date);
  return { ...WEEKLY_CHALLENGE, week, seasonal: false };
}

// ── Seasonal marketing hook for homepage auto-promotion ───────────────────────
// Returns a banner config if a seasonal campaign is active, null otherwise.
export function getSeasonalMarketingHook(date = new Date()) {
  const season = getCurrentSeason(date);
  if (!season) return null;
  return {
    id: season.id,
    label: season.label,
    emoji: season.emoji,
    color: season.color,
    badge: season.badge,
    headline: `${season.emoji} ${season.label} Campaign`,
    subline: `Earn the ${season.badge.label} badge — complete the ${season.weeklyChallenge.title}`,
    cta: { label: `Start ${season.label} Challenge`, to: season.hero.cta1.to },
    points: season.badge.points,
    bg: season.bg,
  };
}
