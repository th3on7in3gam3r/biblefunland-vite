/**
 * BibleFunLand Podcast — episodes & host info
 *
 * audioUrl options:
 *   - Host on this site:  '/podcast/episode-1.mp3'  (drop files in public/podcast/)
 *   - External CDN:       'https://your-cdn.com/episode.mp3'
 */

export const PODCAST_HOST = {
  name: 'Jerless',
  title: 'Host & Creator of BibleFunLand',
  bio: 'Storyteller, developer, and founder of BibleFunLand — bringing Scripture to life for kids, families, and teachers through faith-filled adventures.',
  // Add a photo later: avatarUrl: '/podcast/jerless-host.jpg',
  avatarUrl: null,
};

export const PODCAST_SHOW = {
  title: 'BibleFunLand Podcast',
  tagline: 'Faith adventures and bedtime stories for families, kids, and teachers.',
  schedule: 'New episodes every Monday.',
};

export const EPISODES = [
  {
    id: 3,
    title: 'Topic #3: “The Flood & The Waiting”',
    description:
      'This episode hits deeper because it teaches patience and trust. It builds tension with perfect storytelling and sets up the rainbow promise beautifully — relatable for both kids and adults.',
    date: 'May 2026',
    duration: '—',
    season: 1,
    episode: 3,
    tags: ['The Flood', 'Patience', 'Trust', 'Family'],
    audioUrl: null,
    status: 'future',
    featured: false,
  },
  {
    id: 2,
    title: 'What Was Inside the Ark?',
    description:
      "Building directly from Episode 1, we step inside Noah's completed Ark! Discover the amazing dimensions, the fun and imaginative reality of sharing space with all those animals, and the profound lessons of order, obedience, and God's perfect provision.",
    date: 'April 2026',
    duration: '—',
    season: 1,
    episode: 2,
    tags: ["Noah's Ark", 'Animals', 'Obedience', "God's Provision"],
    audioUrl: 'https://nabthatslot.com/podcast/podcast-2-inside-noah-ark.mp3',
    status: 'released',
    featured: true,
  },
  {
    id: 1,
    title: 'Why Did God Choose Noah?',
    description:
      'Out of everyone in the whole world — why Noah? In this first episode we dig into Genesis 6, explore what made Noah stand out in a corrupt generation, and discover what it means to find favour with God. A question for kids, parents, and everyone in between.',
    date: 'March 2026',
    duration: '18:45',
    season: 1,
    episode: 1,
    tags: ['Genesis', 'Noah', 'Faith', 'Family'],
    audioUrl: 'https://nabthatslot.com/podcast/podcast-1-noah.mp3',
    status: 'released',
    featured: false,
  },
];
