/**
 * contentRegistry.js — No-code content update workflow
 *
 * Add new games, AI tools, or features here without touching page components.
 * Components read from this registry to auto-populate grids, Browse page, etc.
 *
 * To add a new game: add an entry to GAMES array below.
 * To add a new AI tool: add to AI_TOOLS.
 * To feature something on the homepage: set featured: true.
 * To mark as seasonal: set season: 'easter' | 'christmas' | 'back-to-school' | 'thanksgiving'
 */

export const GAMES = [
  {
    id: 'scripture-runner',
    icon: '🏃',
    title: 'Scripture Runner',
    desc: 'Endless runner · Collect Fruits of the Spirit',
    to: '/play/game/runner',
    color: '#10B981',
    tag: 'Kids Fav',
    ageGroup: 'Elementary',
    ageMin: 6,
    ageMax: 12,
    topics: ['New Testament', 'Heroes', 'Faith'],
    itemType: 'Online Game',
    featured: true,
    kidsModeSafe: true,
    season: null,
  },
  {
    id: 'spin-the-verse',
    icon: '🎰',
    title: 'Spin the Verse',
    desc: 'Match 3 themes = jackpot devotional',
    to: '/play/game/spin-the-verse',
    color: '#8B5CF6',
    tag: 'Daily',
    ageGroup: 'Family',
    ageMin: 8,
    ageMax: 99,
    topics: ['New Testament', 'Jesus', 'Faith'],
    itemType: 'Online Game',
    featured: true,
    kidsModeSafe: true,
    season: null,
  },
  {
    id: 'scripture-trivia',
    icon: '❓',
    title: 'Scripture Trivia',
    desc: '3 difficulty levels · Timed rounds',
    to: '/play/trivia',
    color: '#3B82F6',
    tag: 'All Ages',
    ageGroup: 'Tweens',
    ageMin: 6,
    ageMax: 99,
    topics: ['Old Testament', 'New Testament', 'Heroes'],
    itemType: 'Online Game',
    featured: true,
    kidsModeSafe: true,
    season: null,
  },
  {
    id: 'david-goliath',
    icon: '🏹',
    title: 'David & Goliath',
    desc: 'Sling stones of faith · 5 levels',
    to: '/play/game/david-goliath',
    color: '#EC4899',
    tag: 'Action',
    ageGroup: 'Elementary',
    ageMin: 6,
    ageMax: 12,
    topics: ['Old Testament', 'Heroes'],
    itemType: 'Online Game',
    featured: true,
    kidsModeSafe: true,
    season: null,
  },
  {
    id: 'parable-escape-room',
    icon: '🧩',
    title: 'Parable Escape Room',
    desc: "Solve riddles from the whale & lion's den",
    to: '/play/game/escape-room',
    color: '#F97316',
    tag: 'Puzzle',
    ageGroup: 'Tweens',
    ageMin: 9,
    ageMax: 99,
    topics: ['Jesus', 'Parables'],
    itemType: 'Online Game',
    featured: true,
    kidsModeSafe: false,
    season: null,
  },
  {
    id: 'activity-sheets',
    icon: '🖨️',
    title: 'Activity Sheets',
    desc: 'Printable word search, coloring & more',
    to: '/play/activity-sheets',
    color: '#14B8A6',
    tag: 'Print',
    ageGroup: 'Family',
    ageMin: 3,
    ageMax: 12,
    topics: ['General'],
    itemType: 'Printable',
    featured: true,
    kidsModeSafe: true,
    season: null,
  },
];

export const AI_TOOLS = [
  {
    id: 'ai-devotional',
    icon: '🙏',
    title: 'AI Devotional',
    desc: 'Personalized devotionals in seconds',
    to: '/ai/devotional',
    color: '#8B5CF6',
    ageGroup: 'Family',
    ageMin: 10,
    ageMax: 99,
    topics: ['Jesus', 'New Testament'],
    itemType: 'AI Tool',
    featured: true,
    kidsModeSafe: false,
    season: null,
  },
  {
    id: 'bible-character-chat',
    icon: '💬',
    title: 'Bible Character Chat',
    desc: 'Talk to Moses, David, Paul & more',
    to: '/ai/chat/characters',
    color: '#EC4899',
    ageGroup: 'Tweens',
    ageMin: 10,
    ageMax: 99,
    topics: ['Heroes', 'Old Testament', 'New Testament'],
    itemType: 'AI Tool',
    featured: true,
    kidsModeSafe: false,
    season: null,
  },
  {
    id: 'bible-rap-generator',
    icon: '🎵',
    title: 'Bible Rap Generator',
    desc: 'Scripture raps, gospel songs & worship',
    to: '/ai/rap-generator',
    color: '#A855F7',
    ageGroup: 'Tweens',
    ageMin: 10,
    ageMax: 99,
    topics: ['Jesus', 'New Testament'],
    itemType: 'AI Tool',
    featured: true,
    kidsModeSafe: false,
    season: null,
  },
  {
    id: 'miracle-art',
    icon: '🖼️',
    title: 'Miracle Art Generator',
    desc: 'Describe a Bible scene, get AI art prompts',
    to: '/ai/miracle-art',
    color: '#F97316',
    ageGroup: 'All Ages',
    ageMin: 8,
    ageMax: 99,
    topics: ['Jesus', 'Stories'],
    itemType: 'AI Tool',
    featured: true,
    kidsModeSafe: false,
    season: null,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Get all content items (games + AI tools) */
export function getAllContent() {
  return [...GAMES, ...AI_TOOLS];
}

/** Filter by age, topic, type, season, kidsMode */
export function filterContent({
  age = null,
  topic = null,
  type = null,
  season = null,
  kidsMode = false,
} = {}) {
  return getAllContent().filter((item) => {
    if (kidsMode && !item.kidsModeSafe) return false;
    if (age && item.ageMin > age) return false;
    if (topic && topic !== 'All' && !item.topics.includes(topic)) return false;
    if (type && type !== 'All' && item.itemType !== type) return false;
    if (season && item.season !== season) return false;
    return true;
  });
}

/** Get featured items for homepage */
export function getFeaturedContent(kidsMode = false) {
  return getAllContent().filter((item) => item.featured && (!kidsMode || item.kidsModeSafe));
}

/** Get seasonal content */
export function getSeasonalContent(seasonId) {
  return getAllContent().filter((item) => item.season === seasonId);
}
