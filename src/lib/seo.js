/**
 * seo.js — Dynamic meta tag management for BibleFunLand
 * Since this is a Vite SPA, we update document.head directly.
 * Call useSEO() in any page component.
 */

const BASE = {
  siteName: 'BibleFunLand',
  url: 'https://biblefunland.com',
  image: 'https://biblefunland.com/og-image.png',
  twitterHandle: '@biblefunland',
};

export const PAGE_META = {
  home: {
    title: 'BibleFunLand — Free Bible Games for Kids & Families | AI Devotionals',
    description:
      '80+ free Bible games for kids ages 3-12, AI devotionals for families, scripture memory tools, prayer wall, and Sunday school resources. Interactive Bible learning — completely free.',
    keywords:
      'free bible games for kids, bible games for kids 6-9, bible games for kids 3-5, christian games for kids, bible trivia for kids, AI bible devotional for families, printable bible activity sheets, sunday school resources free, family devotionals online, kids bible app free, scripture memory games, christian homeschool resources',
    ageRange: '3-12',
  },
  play: {
    title: 'Play & Learn — Free Bible Games & Printable Activity Sheets | BibleFunLand',
    description:
      'Scripture Runner, David & Goliath, Spin the Verse, Bible Trivia and more. Free Bible games for kids ages 3-12. Printable Bible activity sheets for Sunday school and homeschool.',
    keywords:
      'free bible games for kids, printable bible activity sheets, scripture trivia game, christian games for kids 6-9, sunday school games free, bible games for elementary kids, kids bible games online, bible activity sheets printable free',
    ageRange: '3-12',
    bibleRef: 'Psalm 119:105',
  },
  explore: {
    title: 'Bible Explorer — Interactive Maps, Timeline & Family Tree | BibleFunLand',
    description:
      'Explore the Bible with interactive maps, timeline from Creation to Revelation, Bible family tree, and voice reader. Perfect for kids ages 6-12 and families.',
    keywords:
      'interactive bible map for kids, bible timeline for kids, bible family tree, voice bible reader, bible explorer for kids, bible geography for kids, bible history for children',
    ageRange: '6-adult',
    bibleRef: 'Joshua 1:8',
  },
  ai: {
    title: 'AI Bible Tools — Devotionals, Rap Generator & Character Chat | BibleFunLand',
    description:
      'AI-powered Bible devotionals for families, scripture rap generator for kids, Bible character chat, and miracle art. Faith-based AI tools — free for families.',
    keywords:
      'AI bible devotional for families, bible devotional generator free, bible character chat AI, bible rap generator for kids, AI christian tools for families, faith AI for kids, personalized bible devotional',
    ageRange: '8-adult',
    bibleRef: 'Proverbs 2:6',
  },
  grow: {
    title: 'Grow in Faith — Bible Certification, Reading Plans & Milestones | BibleFunLand',
    description:
      'Bible certification courses, reading plans, faith milestones tracker, spiritual gifts test, and apologetics Q&A. Grow deeper in your faith with structured learning.',
    keywords:
      'bible certification for kids, bible reading plan for families, faith milestones tracker, spiritual gifts test free, christian apologetics for kids, bible study plan free, scripture memory league',
    ageRange: '10-adult',
    bibleRef: '2 Peter 3:18',
  },
  community: {
    title: 'Community & Prayer — Prayer Wall, Leaderboard & Family Groups | BibleFunLand',
    description:
      'Join the BibleFunLand community. Post prayer requests, join family groups, compete on the leaderboard, and connect with believers worldwide.',
    keywords:
      'christian prayer wall online, bible leaderboard for kids, family bible groups online, christian community for kids, prayer app for families free, online prayer community',
    ageRange: '6-adult',
    bibleRef: 'Matthew 18:20',
  },
  parents: {
    title: 'Parents & Teachers Hub — Child Profiles, Lesson Plans & Controls | BibleFunLand',
    description:
      'Manage child profiles, track progress, set parental controls, generate AI lesson plans, and get weekly email digests. Built for Christian parents and Sunday school teachers.',
    keywords:
      'christian parental controls app, bible lesson plans for sunday school, child bible progress tracking, sunday school teacher resources free, christian homeschool tools, bible curriculum for kids, parental controls christian app',
    ageRange: 'Parents & Teachers',
    bibleRef: 'Proverbs 22:6',
  },
  trivia: {
    title: 'Scripture Trivia — Free Bible Quiz Game for Kids Ages 6-12 | BibleFunLand',
    description:
      'Test your Bible knowledge with timed trivia rounds. 3 difficulty levels — Beginner, Intermediate, and Scholar. Perfect for kids ages 6-12, Sunday school, and family game night.',
    keywords:
      'bible trivia for kids, free bible quiz game, scripture quiz for kids, christian trivia game online, bible knowledge test for kids, sunday school quiz game, bible trivia questions for kids 6-12, family bible game night',
    ageRange: '6-adult',
    bibleRef: 'Psalm 119:11',
  },
  leaderboard: {
    title: 'Leaderboard — Top Bible Streaks, Badges & Trivia Champions | BibleFunLand',
    description:
      'See the top Bible learners on BibleFunLand. Compete for top streaks, most badges, and trivia champion status. Family-friendly competition rooted in Scripture.',
    keywords:
      'bible leaderboard for kids, christian gamification, bible streak tracker, bible badges for kids, scripture trivia champion, bible learning rewards',
    ageRange: '6-adult',
  },
  podcast: {
    title: 'BibleFunLand Podcast — Faith Conversations for Families',
    description:
      'The BibleFunLand Podcast. Faith conversations for families, kids, parents, and teachers. Episode 1: Why Did God Choose Noah?',
    keywords:
      'christian podcast for families, bible podcast for kids, faith podcast free, christian family podcast, bible stories podcast for children',
    ageRange: 'All Ages',
  },
};

/**
 * Set page meta tags dynamically
 * @param {object} meta - { title, description, keywords, image, ageRange, bibleRef }
 */
export function setPageMeta(meta) {
  const title = meta.title || `${BASE.siteName} — Bible Learning for Families`;
  const description =
    meta.description ||
    'Interactive Bible learning for kids and families. Free games, AI devotionals, and more.';
  const image = meta.image || BASE.image;
  const url = meta.url || window.location.href;

  // Title
  document.title = title;

  // Standard meta
  setMeta('description', description);
  if (meta.keywords) setMeta('keywords', meta.keywords);
  if (meta.ageRange) setMeta('age-range', meta.ageRange);

  // Open Graph
  setOG('og:title', title);
  setOG('og:description', description);
  setOG('og:image', image);
  setOG('og:url', url);
  setOG('og:site_name', BASE.siteName);
  setOG('og:type', 'website');

  // Twitter
  setOG('twitter:card', 'summary_large_image');
  setOG('twitter:title', title);
  setOG('twitter:description', description);
  setOG('twitter:image', image);
  setOG('twitter:site', BASE.twitterHandle);

  // Bible reference (custom)
  if (meta.bibleRef) setMeta('bible-reference', meta.bibleRef);
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOG(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
