import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT';
import { useKidsMode } from '../context/KidsModeContext';
import styles from './GlobalSearch.module.css';

const SEARCH_DATA = [
  // Games
  {
    type: 'game',
    title: 'Scripture Trivia',
    desc: 'Test your Bible knowledge',
    icon: '❓',
    to: '/play/trivia',
    tags: ['quiz', 'trivia', 'game', 'bible', 'scripture'],
    ageGroup: 'Tweens',
    topics: ['Old Testament', 'New Testament', 'Heroes'],
  },
  {
    type: 'game',
    title: 'David & Goliath',
    desc: 'Action game of faith',
    icon: '🏹',
    to: '/play/game/david-goliath',
    tags: ['david', 'goliath', 'action', 'game', 'battle'],
    ageGroup: 'Elementary',
    topics: ['Old Testament', 'Heroes'],
  },
  {
    type: 'game',
    title: "Jonah's Escape",
    desc: 'Underwater adventure',
    icon: '🐟',
    to: '/play/game/escape-room',
    tags: ['jonah', 'whale', 'fish', 'puzzle'],
    ageGroup: 'Elementary',
    topics: ['Old Testament', 'Adventure'],
  },
  {
    type: 'game',
    title: "Noah's Voyage",
    desc: 'Gather all the animals',
    icon: '🚢',
    to: '/play/game/runner',
    tags: ['noah', 'ark', 'flood', 'puzzle', 'animals'],
    ageGroup: 'Family',
    topics: ['Old Testament', 'Animals'],
  },
  {
    type: 'game',
    title: 'Bible Checkers',
    desc: 'Strategy game',
    icon: '♟️',
    to: '/play/trivia',
    tags: ['checkers', 'strategy', 'game'],
    ageGroup: 'Tweens',
    topics: ['Strategy', 'Game'],
  },

  // Kids Learning
  {
    type: 'game',
    title: 'Bible Alphabet',
    desc: 'Learn ABCs with Bible stories',
    icon: '🔤',
    to: '/kids/alphabet',
    tags: ['kids', 'alphabet', 'abc', 'letters', 'learning', 'preschool'],
  },
  {
    type: 'game',
    title: 'Bible Animals',
    desc: 'Discover animals in the Bible',
    icon: '🦁',
    to: '/kids/animals',
    tags: ['kids', 'animals', 'noah', 'ark', 'learning'],
  },
  {
    type: 'game',
    title: 'Counting World',
    desc: 'Learn numbers with Bible',
    icon: '🔢',
    to: '/kids/counting',
    tags: ['kids', 'counting', 'numbers', 'math', 'learning'],
  },
  {
    type: 'game',
    title: 'Bible Jigsaw',
    desc: 'Puzzle fun with Bible scenes',
    icon: '🧩',
    to: '/kids/jigsaw',
    tags: ['kids', 'puzzle', 'jigsaw', 'game', 'fun'],
  },
  {
    type: 'game',
    title: 'Word Builder',
    desc: 'Build words from Bible stories',
    icon: '📝',
    to: '/kids/word-builder',
    tags: ['kids', 'words', 'spelling', 'learning', 'vocabulary'],
  },
  {
    type: 'game',
    title: 'Creation Coloring',
    desc: 'Color the days of creation',
    icon: '🎨',
    to: '/kids/coloring',
    tags: ['kids', 'coloring', 'art', 'creation', 'creative'],
  },
  {
    type: 'game',
    title: "God's Shapes",
    desc: 'Learn shapes with Bible',
    icon: '⭐',
    to: '/kids/gods-shapes',
    tags: ['kids', 'shapes', 'geometry', 'learning', 'preschool'],
  },
  {
    type: 'game',
    title: 'Kids Dashboard',
    desc: 'Track your learning progress',
    icon: '📊',
    to: '/kids/dashboard',
    tags: ['kids', 'dashboard', 'progress', 'stats', 'achievements'],
  },
  {
    type: 'game',
    title: 'Verse Scramble',
    desc: 'Unscramble Bible verses',
    icon: '🔀',
    to: '/kids/verse-scramble',
    tags: ['kids', 'verse', 'scramble', 'puzzle', 'game'],
  },

  // Pages
  {
    type: 'page',
    title: 'AI Devotional Generator',
    desc: 'Personalized daily devotionals',
    icon: '🙏',
    to: '/ai/devotional',
    tags: ['devotional', 'prayer', 'ai', 'faith', 'daily'],
    ageGroup: 'Family',
    topics: ['Faith', 'Prayer'],
  },
  {
    type: 'page',
    title: 'Interactive Bible Map',
    desc: 'Explore the Holy Land',
    icon: '🗺️',
    to: '/explore/map',
    tags: ['map', 'holy land', 'jerusalem', 'israel', 'places'],
    ageGroup: 'Family',
    topics: ['History', 'Geography'],
  },
  {
    type: 'page',
    title: 'Memory Verse Flashcards',
    desc: 'Memorize scripture',
    icon: '🧠',
    to: '/play/flashcards',
    tags: ['memory', 'verse', 'flashcard', 'scripture', 'memorize'],
    ageGroup: 'Elementary',
    topics: ['Faith', 'Memory'],
  },
  {
    type: 'page',
    title: 'Sermon Notes',
    desc: 'Take and save notes',
    icon: '📝',
    to: '/notes',
    tags: ['notes', 'sermon', 'church', 'pastor'],
  },
  {
    type: 'page',
    title: 'Prayer Wall',
    desc: 'Community prayer',
    icon: '🌍',
    to: '/community/prayer',
    tags: ['prayer', 'community', 'pray', 'request'],
    ageGroup: 'Family',
    topics: ['Prayer', 'Community'],
  },
  {
    type: 'page',
    title: 'Share Cards',
    desc: 'Beautiful verse graphics',
    icon: '🔗',
    to: '/share',
    tags: ['share', 'verse', 'graphic', 'instagram', 'social'],
  },
  {
    type: 'page',
    title: 'Videos',
    desc: 'Bible videos & devotionals',
    icon: '🎬',
    to: '/videos',
    tags: ['video', 'watch', 'devotional', 'story'],
  },
  {
    type: 'page',
    title: 'Blog',
    desc: 'Faith articles & updates',
    icon: '✍️',
    to: '/blog',
    tags: ['blog', 'article', 'post', 'faith', 'family'],
  },
  {
    type: 'page',
    title: 'My Progress',
    desc: 'Streak, badges, calendar',
    icon: '📊',
    to: '/dashboard',
    tags: ['progress', 'streak', 'badge', 'dashboard'],
  },
  {
    type: 'page',
    title: 'Go Pro',
    desc: 'Upgrade your account',
    icon: '💎',
    to: '/premium',
    tags: ['pro', 'premium', 'upgrade', 'subscription'],
  },
  {
    type: 'page',
    title: 'Lumina Bible',
    desc: 'Read the Bible online',
    icon: '📖',
    to: '/lumina',
    tags: ['lumina', 'bible', 'read', 'scripture', 'book'],
  },

  // New & Partnership Features
  {
    type: 'page',
    title: 'Play Hub',
    desc: 'Play and learning games for families',
    icon: '🎮',
    to: '/play',
    tags: ['play', 'games', 'kids', 'fun', 'activities'],
    ageGroup: 'Family',
    topics: ['Games', 'Bible Stories'],
  },
  {
    type: 'page',
    title: 'Explore Hub',
    desc: 'Bible exploration tools and maps',
    icon: '🔎',
    to: '/explore',
    tags: ['explore', 'bible', 'maps', 'timeline'],
    ageGroup: 'Family',
    topics: ['History', 'Study'],
  },
  {
    type: 'page',
    title: 'AI Hub',
    desc: 'AI-driven Bible tools and creativity',
    icon: '🧠',
    to: '/ai',
    tags: ['ai', 'tool', 'devotional', 'chat'],
    ageGroup: 'Family',
    topics: ['AI Tool'],
  },
  {
    type: 'page',
    title: 'Grow Hub',
    desc: 'Growth paths and spiritual milestones',
    icon: '🌱',
    to: '/grow',
    tags: ['grow', 'faith', 'reading-plan', 'milestones'],
    ageGroup: 'Family',
    topics: ['Growth', 'Certification'],
  },
  {
    type: 'page',
    title: 'Community Hub',
    desc: 'Church groups, chat, and events',
    icon: '🌐',
    to: '/community',
    tags: ['community', 'prayer', 'events', 'groups'],
    ageGroup: 'Family',
    topics: ['Prayer', 'Fellowship'],
  },
  {
    type: 'page',
    title: 'Parents & Teachers Hub',
    desc: 'Control, resources, and teaching tools',
    icon: '🏫',
    to: '/parents',
    tags: ['parents', 'teachers', 'hub', 'resources'],
    ageGroup: 'Family',
    topics: ['Parenting', 'Teaching'],
  },
  {
    type: 'page',
    title: 'Ministry Partnerships',
    desc: 'Partner your church with BibleFunLand',
    icon: '⛪',
    to: '/partner',
    tags: ['church', 'partner', 'ministry', 'affiliate', 'collaboration'],
  },
  {
    type: 'page',
    title: 'Creator Affiliate',
    desc: 'Earn 20% by sharing BibleFunLand',
    icon: '🎓',
    to: '/creators',
    tags: ['creator', 'affiliate', 'earn', 'share', 'referral'],
  },
  {
    type: 'page',
    title: 'BibleFunLand Podcast',
    desc: 'Faith conversations for families — Episode 1: Why Did God Choose Noah?',
    icon: '🎙️',
    to: '/podcast',
    tags: ['podcast', 'audio', 'listen', 'noah', 'ark', 'family', 'episode', 'faith'],
  },
  {
    type: 'page',
    title: 'Bible Character Quiz',
    desc: 'Which Bible character are you?',
    icon: '🧬',
    to: '/quiz/character',
    tags: ['quiz', 'character', 'identity', 'moses', 'david', 'personality'],
  },
  {
    type: 'page',
    title: 'Voice Bible Reader',
    desc: 'Practice recitation with AI feedback',
    icon: '🗣️',
    to: '/voice-reader',
    tags: ['voice', 'read', 'practice', 'feedback', 'recitation'],
  },
  {
    type: 'page',
    title: 'Global Prayer Map',
    desc: 'Real-time prayers from around the world',
    icon: '🌍',
    to: '/prayer-map',
    tags: ['prayer', 'map', 'global', 'world', 'live'],
  },
  {
    type: 'page',
    title: 'AI Sermon Writer',
    desc: 'Complete sermon manuscripts',
    icon: '✍️',
    to: '/sermon-writer',
    tags: ['sermon', 'writer', 'ai', 'preach', 'pastor', 'manuscript', 'church'],
  },
  {
    type: 'page',
    title: "Couple's Devotional",
    desc: 'Marriage-focused devotionals',
    icon: '💑',
    to: '/couples-devotional',
    tags: ['couples', 'marriage', 'devotional', 'relationship', 'spouse', 'husband', 'wife'],
  },
  {
    type: 'page',
    title: 'Scripture Typing',
    desc: 'Type Bible verses to memorize',
    icon: '⌨️',
    to: '/scripture-typing',
    tags: ['typing', 'scripture', 'memorize', 'practice', 'verse', 'keyboard'],
  },
  {
    type: 'page',
    title: 'Fasting Tracker',
    desc: 'Track your fasting journey',
    icon: '🕊️',
    to: '/fasting',
    tags: ['fasting', 'fast', 'spiritual', 'discipline', 'prayer', 'tracker'],
  },
  {
    type: 'page',
    title: 'Bible Family Tree',
    desc: 'Explore biblical genealogy',
    icon: '🌳',
    to: '/grow/family-tree',
    tags: ['family', 'tree', 'genealogy', 'lineage', 'ancestors', 'biblical', 'history'],
    ageGroup: 'Family',
    topics: ['History'],
  },
  {
    type: 'page',
    title: 'Worship Discovery',
    desc: 'Find worship music by mood',
    icon: '🎵',
    to: '/grow/worship',
    tags: ['worship', 'music', 'praise', 'songs', 'mood', 'spotify', 'playlist'],
  },
  {
    type: 'page',
    title: 'Parent & Teacher Hub',
    desc: 'Resources for parents & teachers',
    icon: '🏫',
    to: '/parent-hub',
    tags: ['parent', 'teacher', 'hub', 'resources', 'family', 'classroom', 'kids'],
  },

  // New features added
  {
    type: 'page',
    title: 'Bible Explorer',
    desc: 'Read the Bible — chapters, verses, bookmarks, highlights',
    icon: '📖',
    to: '/explore/bible',
    tags: [
      'bible',
      'read',
      'chapter',
      'verse',
      'kjv',
      'niv',
      'translation',
      'scripture',
      'explorer',
    ],
  },
  {
    type: 'page',
    title: 'Interactive Bible Timeline',
    desc: 'Journey through 4,000 years of biblical history',
    icon: '⏳',
    to: '/timeline',
    tags: ['timeline', 'history', 'bible', 'events', 'creation', 'jesus', 'revelation'],
  },
  {
    type: 'page',
    title: 'Faith Milestones',
    desc: 'Track your spiritual growth and achievements',
    icon: '🏔️',
    to: '/grow/faith-milestones',
    tags: ['milestones', 'faith', 'growth', 'achievements', 'progress', 'spiritual'],
    ageGroup: 'Family',
    topics: ['Growth', 'Faith'],
  },
  {
    type: 'page',
    title: 'Hymn Explorer',
    desc: 'Discover the stories and music behind classic hymns',
    icon: '🎶',
    to: '/hymns',
    tags: ['hymns', 'music', 'worship', 'songs', 'history', 'church'],
  },
  {
    type: 'page',
    title: 'Spiritual Gifts Test',
    desc: 'Discover your unique spiritual gifts',
    icon: '🎁',
    to: '/spiritual-gifts',
    tags: ['spiritual', 'gifts', 'test', 'discovery', 'ministry', 'service'],
  },
  {
    type: 'page',
    title: 'Prayer Partner',
    desc: 'Connect with a digital prayer partner',
    icon: '🤝',
    to: '/community/prayer-partner',
    tags: ['prayer', 'partner', 'companion', 'faith', 'connection'],
    ageGroup: 'Family',
    topics: ['Prayer', 'Community'],
  },
  {
    type: 'page',
    title: 'Bible Apologetics',
    desc: 'Reasonable answers for your faith questions',
    icon: '🛡️',
    to: '/apologetics',
    tags: ['apologetics', 'defense', 'reason', 'faith', 'questions', 'answers'],
  },
  {
    type: 'page',
    title: 'Daily Bible Wordle',
    desc: 'Five letters, six tries, one Bible word',
    icon: '🔠',
    to: '/wordle',
    tags: ['wordle', 'game', 'puzzle', 'word', 'daily', 'bible'],
  },
  {
    type: 'page',
    title: 'Prophecy Fulfillment',
    desc: 'See how Jesus fulfilled Old Testament prophecies',
    icon: '📜',
    to: '/prophecy',
    tags: ['prophecy', 'fulfillment', 'jesus', 'messiah', 'old testament', 'new testament'],
  },
  {
    type: 'page',
    title: 'Sermon Illustrations',
    desc: 'Powerful stories for your next message',
    icon: '💡',
    to: '/sermon-illustrations',
    tags: ['sermon', 'illustrations', 'stories', 'teaching', 'pastor', 'preach'],
  },
  {
    type: 'page',
    title: 'Leaderboard',
    desc: 'Top streaks, badges, and trivia champions',
    icon: '🏆',
    to: '/leaderboard',
    tags: ['leaderboard', 'top', 'streak', 'badges', 'trivia', 'champions', 'ranking', 'score'],
  },
  {
    type: 'page',
    title: 'My Bookmarks',
    desc: 'Save and organize your favourite Bible verses',
    icon: '🔖',
    to: '/bookmarks',
    tags: [
      'bookmark',
      'verse',
      'save',
      'folder',
      'favorites',
      'morning prayer',
      'memorizing',
      'sermon prep',
    ],
  },
  {
    type: 'page',
    title: 'Church Finder',
    desc: 'Find churches near you by location or city',
    icon: '⛪',
    to: '/church-finder',
    tags: ['church', 'find', 'near me', 'location', 'denomination', 'worship', 'service', 'local'],
  },
  {
    type: 'page',
    title: 'Church Hub',
    desc: 'Exclusive pastoral tools and congregation management',
    icon: '⛪',
    to: '/church/dashboard',
    tags: ['church', 'pastor', 'super-user', 'leader', 'hub', 'dashboard', 'congregation'],
  },
  {
    type: 'page',
    title: 'Join Church / Request Access',
    desc: 'Connect with a church or request Pastor access',
    icon: '🤝',
    to: '/church/join',
    tags: ['church', 'join', 'joine', 'pastor', 'request', 'verification', 'access'],
  },
  {
    type: 'page',
    title: 'Church Calendar',
    desc: 'Local services and community events',
    icon: '📅',
    to: '/community/events',
    tags: ['calendar', 'events', 'church', 'worship', 'services'],
  },
  {
    type: 'page',
    title: 'Family Fellowship',
    desc: 'Connect with church families and groups',
    icon: '👨‍👩‍👧‍👦',
    to: '/community/family',
    tags: ['family', 'groups', 'fellowship', 'community', 'kids'],
  },
  {
    type: 'page',
    title: 'Fellowship Chat',
    desc: 'Safe discussion rooms for the community',
    icon: '💬',
    to: '/community/chat',
    tags: ['chat', 'community', 'fellowship', 'discussion'],
  },
  {
    type: 'page',
    title: 'Daily Faith Challenge',
    desc: 'Daily tasks to grow your faith',
    icon: '🔥',
    to: '/challenge',
    tags: ['challenge', 'daily', 'faith', 'growth', 'task'],
  },
  {
    type: 'page',
    title: 'Activity Sheets',
    desc: 'Printable Bible fun for kids',
    icon: '📄',
    to: '/play/activity-sheets',
    tags: ['print', 'activity', 'sheets', 'kids', 'learning'],
  },
  {
    type: 'page',
    title: 'Character Chat',
    desc: 'AI conversations with biblical heroes',
    icon: '🗣️',
    to: '/chat/characters',
    tags: ['chat', 'ai', 'characters', 'heroes', 'moses', 'noah', 'david'],
  },
  {
    type: 'page',
    title: 'Reading Plan',
    desc: 'Daily schedules to read through the Word',
    icon: '📅',
    to: '/grow/reading-plan',
    tags: ['plan', 'read', 'daily', 'schedule', 'bible', 'word'],
    ageGroup: 'Family',
    topics: ['Faith', 'Discipline'],
  },
  {
    type: 'page',
    title: 'Prayer Beads',
    desc: 'Focus your heart with digital prayer beads',
    icon: '📿',
    to: '/prayer-beads',
    tags: ['prayer', 'beads', 'focus', 'meditate', 'spirit'],
  },
  {
    type: 'page',
    title: 'Encouragement',
    desc: 'Uplifting messages from the community',
    icon: '☀️',
    to: '/encouragement',
    tags: ['encourage', 'support', 'message', 'wall', 'love'],
  },
  {
    type: 'page',
    title: 'Certification',
    desc: 'Earn your Bible studies certificate',
    icon: '🎓',
    to: '/grow/certification',
    tags: ['certify', 'learn', 'study', 'degree', 'bible'],
  },
  {
    type: 'page',
    title: 'Bedtime Stories',
    desc: 'Peaceful Bible stories for sleep',
    icon: '🛌',
    to: '/bedtime',
    tags: ['sleep', 'bedtime', 'stories', 'kids', 'peace'],
  },
  {
    type: 'page',
    title: 'Original Languages',
    desc: 'Hebrew & Greek scripture explorer',
    icon: '📜',
    to: '/language-explorer',
    tags: ['hebrew', 'greek', 'languages', 'original', 'bible', 'study'],
  },
  {
    type: 'page',
    title: 'Cross Reference',
    desc: 'Discover scriptures related to your study',
    icon: '🔗',
    to: '/cross-reference',
    tags: ['cross', 'reference', 'relate', 'scripture', 'study', 'bible'],
  },
  {
    type: 'page',
    title: 'Verse Wallpaper',
    desc: 'Create beautiful Bible wallpapers',
    icon: '🖼️',
    to: '/wallpaper',
    tags: ['wallpaper', 'art', 'verse', 'share', 'background'],
  },
  {
    type: 'page',
    title: 'Bible Rap Generator',
    desc: 'AI-generated scripture raps & songs',
    icon: '🎵',
    to: '/ai/rap-generator',
    tags: ['rap', 'music', 'ai', 'song', 'generator', 'scripture'],
  },

  // ── New features added since last update ─────────────────────────────────
  {
    type: 'page',
    title: 'Newsletter',
    desc: 'Free weekly printables + new game alerts',
    icon: '📧',
    to: '/newsletter',
    tags: ['newsletter', 'email', 'subscribe', 'printable', 'weekly', 'free'],
  },
  {
    type: 'page',
    title: 'Seasonal AI Content',
    desc: 'Easter, Christmas & seasonal Bible content generator',
    icon: '🎄',
    to: '/seasonal',
    tags: ['seasonal', 'easter', 'christmas', 'ai', 'holiday', 'content', 'badge'],
  },
  {
    type: 'page',
    title: 'Browse Everything',
    desc: 'Smart search across all games, tools & resources',
    icon: '🔍',
    to: '/browse',
    tags: ['browse', 'search', 'everything', 'all', 'filter', 'resources'],
  },
  {
    type: 'page',
    title: 'Bible Names Explorer',
    desc: 'Meanings and origins of every name in Scripture',
    icon: '🔤',
    to: '/names',
    tags: ['names', 'bible', 'meaning', 'origin', 'hebrew', 'greek', 'scripture'],
  },
  {
    type: 'page',
    title: 'Bible Search',
    desc: 'Search scripture by keyword, verse or topic',
    icon: '🔎',
    to: '/bible-search',
    tags: ['search', 'bible', 'keyword', 'verse', 'topic', 'scripture', 'find'],
  },
  {
    type: 'page',
    title: 'Bible Reader',
    desc: 'Read the Bible in multiple translations',
    icon: '📖',
    to: '/bible-reader',
    tags: ['read', 'bible', 'kjv', 'niv', 'esv', 'translation', 'chapter', 'verse'],
  },
  {
    type: 'page',
    title: 'Prayer Journal',
    desc: 'Write and track your personal prayers',
    icon: '📓',
    to: '/prayer-journal',
    tags: ['prayer', 'journal', 'write', 'personal', 'diary', 'faith', 'track'],
  },
  {
    type: 'page',
    title: 'Bible Promises',
    desc: "Discover God's promises throughout Scripture",
    icon: '🌈',
    to: '/grow/promises',
    tags: ['promises', 'god', 'bible', 'covenant', 'hope', 'faith', 'scripture'],
  },
  {
    type: 'page',
    title: 'Reading Stats',
    desc: 'Track your Bible reading progress and streaks',
    icon: '📊',
    to: '/reading-stats',
    tags: ['reading', 'stats', 'progress', 'streak', 'bible', 'track', 'habit'],
  },
  {
    type: 'page',
    title: 'Kids Bible Stories',
    desc: 'Illustrated Bible stories for young children',
    icon: '📚',
    to: '/kids-stories',
    tags: ['kids', 'stories', 'bible', 'children', 'illustrated', 'preschool', 'elementary'],
    ageGroup: 'Preschool',
  },
  {
    type: 'page',
    title: 'Invite Family & Friends',
    desc: 'Share BibleFunLand and earn 50 points per referral',
    icon: '🎁',
    to: '/',
    tags: ['invite', 'referral', 'share', 'family', 'friends', 'points', 'earn'],
  },
  {
    type: 'page',
    title: 'Bible Map (Interactive)',
    desc: 'Real GPS coordinates — Jerusalem, Bethlehem, Nazareth & more',
    icon: '🗺️',
    to: '/explore/map',
    tags: ['map', 'bible', 'jerusalem', 'bethlehem', 'nazareth', 'israel', 'geography', 'leaflet'],
  },
  {
    type: 'page',
    title: 'A/B Test Dashboard',
    desc: 'Admin — manage experiments and view conversion rates',
    icon: '🧪',
    to: '/admin/ab-tests',
    tags: ['admin', 'ab test', 'experiment', 'conversion', 'analytics'],
  },
  {
    type: 'page',
    title: 'Launch Checklist',
    desc: 'Admin — pre-launch verification checklist',
    icon: '🚀',
    to: '/admin/launch',
    tags: ['admin', 'launch', 'checklist', 'deploy', 'production'],
  },
  {
    type: 'page',
    title: 'Newsletter Subscribers',
    desc: 'Admin — manage email subscribers',
    icon: '📧',
    to: '/admin/newsletter',
    tags: ['admin', 'newsletter', 'subscribers', 'email', 'list'],
  },

  // Bible Verses
  {
    type: 'verse',
    title: 'John 3:16',
    desc: '"For God so loved the world..."',
    icon: '📜',
    to: '/flashcards',
    tags: ['john', 'love', 'god', 'world', 'salvation', 'john 3'],
  },
  {
    type: 'verse',
    title: 'Philippians 4:13',
    desc: '"I can do all things through Christ..."',
    icon: '📜',
    to: '/flashcards',
    tags: ['philippians', 'strength', 'christ', 'all things'],
  },
  {
    type: 'verse',
    title: 'Jeremiah 29:11',
    desc: '"Plans to prosper you..."',
    icon: '📜',
    to: '/flashcards',
    tags: ['jeremiah', 'plans', 'hope', 'future', 'prosper'],
  },
  {
    type: 'verse',
    title: 'Psalm 23:1',
    desc: '"The Lord is my shepherd..."',
    icon: '📜',
    to: '/flashcards',
    tags: ['psalm', 'shepherd', 'lord', 'david'],
  },
  {
    type: 'verse',
    title: 'Romans 8:28',
    desc: '"All things work for good..."',
    icon: '📜',
    to: '/flashcards',
    tags: ['romans', 'good', 'love', 'purpose'],
  },
  {
    type: 'verse',
    title: 'Isaiah 40:31',
    desc: '"Those who hope in the Lord..."',
    icon: '📜',
    to: '/flashcards',
    tags: ['isaiah', 'hope', 'eagle', 'strength', 'renew'],
  },
  {
    type: 'verse',
    title: 'Proverbs 3:5-6',
    desc: '"Trust in the Lord..."',
    icon: '📜',
    to: '/flashcards',
    tags: ['proverbs', 'trust', 'heart', 'wisdom', 'paths'],
  },
  {
    type: 'verse',
    title: 'Joshua 1:9',
    desc: '"Be strong and courageous..."',
    icon: '📜',
    to: '/flashcards',
    tags: ['joshua', 'strong', 'courage', 'fear', 'god'],
  },

  // Blog
  {
    type: 'blog',
    title: 'Starting Each Day in the Word',
    desc: 'A simple 5-minute habit',
    icon: '🌅',
    to: '/blog',
    tags: ['devotional', 'morning', 'habit', 'family', 'word'],
  },
  {
    type: 'blog',
    title: '10 Verses to Memorize With Kids',
    desc: 'Plant scripture in their hearts',
    icon: '✝️',
    to: '/blog',
    tags: ['kids', 'memorize', 'verse', 'children', 'family'],
  },
  {
    type: 'blog',
    title: 'Why We Built BibleFunLand',
    desc: 'Our story and vision',
    icon: '🌈',
    to: '/blog',
    tags: ['about', 'story', 'vision', 'ministry', 'biblefunland'],
  },
];

const AGE_OPTIONS = ['All', 'Preschool', 'Elementary', 'Tweens', 'Family'];
const TOPIC_OPTIONS = [
  'All',
  'Old Testament',
  'New Testament',
  'Jesus',
  'Heroes',
  'Parables',
  'Faith',
  'Stories',
  'General',
];
const TYPE_OPTIONS = ['All', 'Online Game', 'Printable', 'AI Tool', 'Page', 'Verse', 'Blog'];
const POPULAR_ITEM_TITLES = [
  'Scripture Trivia',
  'AI Devotional',
  'Activity Sheets',
  'Bible Rap Generator',
  'Scripture Runner',
];

const TYPE_COLORS = {
  game: { bg: 'var(--blue-bg)', color: 'var(--blue)', label: 'Game' },
  page: { bg: 'var(--violet-bg)', color: 'var(--violet)', label: 'Page' },
  verse: { bg: 'var(--green-bg)', color: 'var(--green)', label: 'Verse' },
  blog: { bg: 'var(--orange-bg)', color: 'var(--orange)', label: 'Blog' },
};

const NORMALIZED_SEARCH_DATA = SEARCH_DATA.map((item) => ({
  ...item,
  ageGroup: item.ageGroup || 'Family',
  topics: item.topics || ['General'],
  itemType:
    item.itemType ||
    (item.type === 'game'
      ? 'Online Game'
      : item.type === 'page' && item.to?.startsWith('/ai/')
        ? 'AI Tool'
        : item.type === 'page'
          ? 'Page'
          : item.type === 'verse'
            ? 'Verse'
            : item.type === 'blog'
              ? 'Blog'
              : 'Other'),
}));

// Debounce hook for search
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [ageFilter, setAgeFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('globalSearchHistory') || '[]');
    } catch {
      return [];
    }
  });
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useT();
  const { kidsMode } = useKidsMode();
  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    if (kidsMode) {
      setAgeFilter('Preschool');
      setTopicFilter('Stories');
      setTypeFilter('Online Game');
    } else {
      setAgeFilter('All');
      setTopicFilter('All');
      setTypeFilter('All');
    }
  }, [kidsMode]);

  // CMD+K / CTRL+K to open, CTRL+/ to open
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setHighlighted(0);
    }
  }, [open]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  function addToHistory(item) {
    const updated = [
      { ...item, timestamp: Date.now() },
      ...recentSearches.filter((s) => s.title !== item.title),
    ].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('globalSearchHistory', JSON.stringify(updated));
  }

  // Memoized search results with debounce + filters
  const results = useMemo(() => {
    const applyFilters = (item) => {
      const kidsAllowed =
        !kidsMode ||
        !item.ageGroup ||
        ['Preschool', 'Elementary', 'Tweens', 'Family'].includes(item.ageGroup);
      const ageOk =
        (ageFilter === 'All' || !item.ageGroup || item.ageGroup === ageFilter) && kidsAllowed;
      const topicOk = topicFilter === 'All' || !item.topics || item.topics.includes(topicFilter);
      const typeOk = typeFilter === 'All' || !item.itemType || item.itemType === typeFilter;
      return ageOk && topicOk && typeOk;
    };

    const filteredByPreferences = NORMALIZED_SEARCH_DATA.filter(applyFilters);

    if (debouncedQuery.length < 2) {
      const popular = filteredByPreferences.filter((item) =>
        POPULAR_ITEM_TITLES.includes(item.title)
      );
      return popular.length > 0 ? popular : filteredByPreferences.slice(0, 8);
    }

    const q = debouncedQuery.toLowerCase();
    return filteredByPreferences
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.includes(q))
      )
      .slice(0, 10);
  }, [debouncedQuery, ageFilter, topicFilter, typeFilter]);

  function go(item) {
    addToHistory(item);
    navigate(item.to);
    close();
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    }
    if (e.key === 'Enter' && results[highlighted]) go(results[highlighted]);
  }

  // Group results by type
  const grouped = {};
  results.forEach((r) => {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  });

  return (
    <>
      {/* Trigger button in nav */}
      <button
        className={styles.trigger}
        onClick={() => setOpen(true)}
        title={t('search.hint')}
        aria-label="Open search"
      >
        <span className={styles.triggerIcon}>🔍</span>
        <span className={styles.triggerText}>{t('search.placeholder')}</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </button>

      {/* Modal */}
      {open && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && close()}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Search">
            {/* Input */}
            <div className={styles.inputRow}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                ref={inputRef}
                className={styles.input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlighted(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={t('search.placeholder')}
                autoComplete="off"
              />
              {query && (
                <button className={styles.clearBtn} onClick={() => setQuery('')}>
                  ✕
                </button>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                padding: '10px 20px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                style={{
                  minWidth: 140,
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                }}
              >
                {AGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                style={{
                  minWidth: 170,
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                }}
              >
                {TOPIC_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  minWidth: 150,
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                }}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setAgeFilter('All');
                  setTopicFilter('All');
                  setTypeFilter('All');
                }}
                style={{
                  color: 'var(--blue)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '7px 10px',
                  background: 'var(--bg)',
                }}
              >
                Reset
              </button>
            </div>

            {/* Results */}
            <div className={styles.results}>
              {results.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <p>
                    {t('search.noResults')} "<strong>{query}</strong>"
                  </p>
                  <p className={styles.emptySub}>{t('search.tryAnother')}</p>
                </div>
              ) : (
                Object.entries(grouped).map(([type, items]) => {
                  const meta = TYPE_COLORS[type] || TYPE_COLORS.page;
                  const label = {
                    game: t('search.games'),
                    page: t('search.pages'),
                    verse: t('search.verses'),
                    blog: t('search.blog'),
                  }[type];
                  return (
                    <div key={type}>
                      <div className={styles.groupLabel}>{label}</div>
                      {items.map((item, i) => {
                        const globalIdx = results.indexOf(item);
                        return (
                          <button
                            key={i}
                            className={`${styles.result} ${globalIdx === highlighted ? styles.resultActive : ''}`}
                            onClick={() => go(item)}
                            onMouseEnter={() => setHighlighted(globalIdx)}
                          >
                            <span className={styles.resultIcon}>{item.icon}</span>
                            <span className={styles.resultBody}>
                              <span className={styles.resultTitle}>{item.title}</span>
                              <span className={styles.resultDesc}>{item.desc}</span>
                            </span>
                            <span
                              className={styles.resultType}
                              style={{ background: meta.bg, color: meta.color }}
                            >
                              {meta.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
              <span>⌘K / Ctrl+K</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
