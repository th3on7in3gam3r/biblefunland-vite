/**
 * BibleFunLand Podcast — episodes & host info
 *
 * Audio files live in public/podcast/ and are served by Vercel at:
 *   https://www.biblefunland.com/podcast/your-file.mp3
 */

export const PODCAST_SHOW = {
  title: 'Faith & Adventure',
  subtitle: 'Bible Stories for Kids',
  tagline:
    'Warm, faith-filled Bible stories for kids and families — brought to you by BibleFunLand.',
  schedule: 'New episodes every Monday.',
  hostsBannerUrl: '/hosts-duo.jpg',
};

export const PODCAST_HOSTS = {
  headline: 'Meet Your Hosts',
  names: 'Jerless & Sarah Mitchell',
  hosts: [
    {
      name: 'Jerless',
      role: 'Host · Creator of BibleFunLand',
    },
    {
      name: 'Sarah Mitchell',
      role: 'Co-Host · Faith & Adventure',
    },
  ],
  title: 'Faith & Adventure · BibleFunLand Podcast',
  bio: 'Jerless and Sarah Mitchell record from their studio with open Bibles and warm microphones — bringing Genesis to life with patience, wonder, and stories kids remember for car rides, bedtime, and Sunday school.',
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
    audioUrl: '/podcast/podcast-2-inside-noah-ark.mp3',
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
    audioUrl: '/podcast/podcast-1-noah.mp3',
    status: 'released',
    featured: false,
  },
];
