import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useKidsMode } from '../context/KidsModeContext';
import ActivityCard from '../components/ActivityCard';

const ALL_CONTENT = [
  // Play & Learn
  {
    id: 'trivia',
    icon: '❓',
    title: 'Scripture Trivia',
    desc: 'Timed rounds · 3 difficulty levels',
    to: '/play/trivia',
    color: '#3B82F6',
    tag: 'Quiz',
    section: 'play',
    ageRange: '6-adult',
    bibleRef: 'Psalm 119:11',
    keywords: ['trivia', 'quiz', 'game'],
  },
  {
    id: 'runner',
    icon: '🏃',
    title: 'Scripture Runner',
    desc: 'Endless runner · Collect Fruits of the Spirit',
    to: '/play/game/runner',
    color: '#10B981',
    tag: 'Game',
    section: 'play',
    ageRange: '6-12',
    keywords: ['game', 'runner', 'kids'],
  },
  {
    id: 'david',
    icon: '🏹',
    title: 'David & Goliath',
    desc: 'Sling stones of faith · 5 levels',
    to: '/play/game/david-goliath',
    color: '#EC4899',
    tag: 'Game',
    section: 'play',
    ageRange: '6-12',
    bibleRef: '1 Sam 17',
    keywords: ['game', 'david', 'goliath'],
  },
  {
    id: 'escape',
    icon: '🧩',
    title: 'Parable Escape Room',
    desc: "Solve riddles from the whale & lion's den",
    to: '/play/game/escape-room',
    color: '#F97316',
    tag: 'Puzzle',
    section: 'play',
    ageRange: '8-adult',
    keywords: ['puzzle', 'escape', 'game'],
  },
  {
    id: 'spin',
    icon: '🎰',
    title: 'Spin the Verse',
    desc: 'Match 3 themes = jackpot devotional',
    to: '/play/game/spin-the-verse',
    color: '#8B5CF6',
    tag: 'Daily',
    section: 'play',
    ageRange: '8-adult',
    keywords: ['spin', 'verse', 'daily'],
  },
  {
    id: 'flashcards',
    icon: '🧠',
    title: 'Flashcards',
    desc: 'Memorize scripture with 3D flip cards',
    to: '/play/flashcards',
    color: '#6366F1',
    tag: 'Memory',
    section: 'play',
    ageRange: '6-adult',
    keywords: ['memory', 'flashcard', 'scripture'],
  },
  {
    id: 'activity-sheets',
    icon: '🖨️',
    title: 'Activity Sheets',
    desc: 'Printable word search, coloring & more',
    to: '/play/activity-sheets',
    color: '#14B8A6',
    tag: 'Print',
    section: 'play',
    ageRange: '3-12',
    isPrintable: true,
    keywords: ['print', 'activity', 'coloring'],
  },
  {
    id: 'wordle',
    icon: '🟩',
    title: 'Bible Wordle',
    desc: 'Guess the Bible word in 6 tries',
    to: '/play/wordle',
    color: '#10B981',
    tag: 'Daily',
    section: 'play',
    ageRange: '10-adult',
    keywords: ['wordle', 'word', 'daily'],
  },
  // Explore
  {
    id: 'bible',
    icon: '📖',
    title: 'Bible Explorer',
    desc: 'Read the Bible in 100+ translations',
    to: '/explore/bible',
    color: '#8B5CF6',
    tag: 'Bible',
    section: 'explore',
    ageRange: '6-adult',
    bibleRef: 'Heb 4:12',
    keywords: ['bible', 'read', 'kjv'],
  },
  {
    id: 'map',
    icon: '🗺️',
    title: 'Bible Map',
    desc: 'Explore the Holy Land interactively',
    to: '/explore/map',
    color: '#10B981',
    tag: 'Explore',
    section: 'explore',
    ageRange: '8-adult',
    keywords: ['map', 'holy land', 'geography'],
  },
  {
    id: 'timeline',
    icon: '📜',
    title: 'Bible Timeline',
    desc: 'From Creation to Revelation',
    to: '/explore/timeline',
    color: '#F59E0B',
    tag: 'History',
    section: 'explore',
    ageRange: '8-adult',
    keywords: ['timeline', 'history', 'creation'],
  },
  {
    id: 'family-tree',
    icon: '🌳',
    title: 'Bible Family Tree',
    desc: 'Trace lineage from Adam to Jesus',
    to: '/family-tree',
    color: '#10B981',
    tag: 'Genealogy',
    section: 'explore',
    ageRange: '10-adult',
    keywords: ['family', 'tree', 'genealogy'],
  },
  // AI
  {
    id: 'devotional',
    icon: '🙏',
    title: 'AI Devotional',
    desc: 'Personalized devotionals in seconds',
    to: '/ai/devotional',
    color: '#8B5CF6',
    tag: 'AI',
    section: 'ai',
    ageRange: '10-adult',
    keywords: ['devotional', 'ai', 'prayer'],
  },
  {
    id: 'rap',
    icon: '🎵',
    title: 'Bible Rap Generator',
    desc: 'Scripture raps, gospel songs & worship',
    to: '/ai/rap-generator',
    color: '#A855F7',
    tag: 'AI Fun',
    section: 'ai',
    ageRange: '8-adult',
    keywords: ['rap', 'music', 'ai', 'song'],
  },
  {
    id: 'chat',
    icon: '💬',
    title: 'Bible Character Chat',
    desc: 'Talk to Moses, David, Paul & more',
    to: '/ai/chat/characters',
    color: '#EC4899',
    tag: 'AI',
    section: 'ai',
    ageRange: '8-adult',
    keywords: ['chat', 'character', 'ai'],
  },
  // Grow
  {
    id: 'certification',
    icon: '🎓',
    title: 'Bible Certification',
    desc: 'Complete courses, earn certificates',
    to: '/grow/certification',
    color: '#F59E0B',
    tag: 'Grow',
    section: 'grow',
    ageRange: '10-adult',
    keywords: ['certification', 'course', 'certificate'],
  },
  {
    id: 'reading-plan',
    icon: '📅',
    title: 'Reading Plan',
    desc: 'Structured Bible reading schedules',
    to: '/grow/reading-plan',
    color: '#3B82F6',
    tag: 'Grow',
    section: 'grow',
    ageRange: '8-adult',
    keywords: ['reading', 'plan', 'bible'],
  },
  // Community
  {
    id: 'prayer',
    icon: '🙏',
    title: 'Prayer Wall',
    desc: 'Real-time community prayer',
    to: '/community/prayer',
    color: '#10B981',
    tag: 'Community',
    section: 'community',
    ageRange: 'All Ages',
    keywords: ['prayer', 'community', 'wall'],
  },
  {
    id: 'leaderboard',
    icon: '🏆',
    title: 'Leaderboard',
    desc: 'Top streaks, badges & trivia champs',
    to: '/community/leaderboard',
    color: '#F59E0B',
    tag: 'Community',
    section: 'community',
    ageRange: 'All Ages',
    keywords: ['leaderboard', 'streak', 'badges'],
  },
];

const KIDS_HIDDEN = ['devotional', 'rap', 'certification', 'family-tree'];

const SECTIONS = [
  { id: 'all', label: 'All', emoji: '⚡' },
  { id: 'play', label: 'Play & Learn', emoji: '🎮' },
  { id: 'explore', label: 'Bible Explorer', emoji: '📖' },
  { id: 'ai', label: 'AI Fun', emoji: '🤖' },
  { id: 'grow', label: 'Grow', emoji: '🌱' },
  { id: 'community', label: 'Community', emoji: '🤝' },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { kidsMode } = useKidsMode();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const section = searchParams.get('section') || 'all';

  const filtered = useMemo(() => {
    let list = ALL_CONTENT;
    if (kidsMode) list = list.filter((c) => !KIDS_HIDDEN.includes(c.id));
    if (section !== 'all') list = list.filter((c) => c.section === section);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q) ||
          c.keywords?.some((k) => k.includes(q))
      );
    }
    return list;
  }, [query, section, kidsMode]);

  function setSection(s) {
    const p = new URLSearchParams(searchParams);
    if (s === 'all') p.delete('section');
    else p.set('section', s);
    setSearchParams(p);
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg,#1E1B4B,#0F172A)',
          padding: '48px 32px 36px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.8rem,4vw,2.8rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 8,
          }}
        >
          ⚡ Browse Everything
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', marginBottom: 24 }}>
          Search and filter all {ALL_CONTENT.length}+ features
        </p>
        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, tools, activities..."
            style={{
              width: '100%',
              padding: '12px 14px 12px 40px',
              borderRadius: 14,
              border: '1.5px solid rgba(255,255,255,.15)',
              background: 'rgba(255,255,255,.08)',
              color: 'white',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px' }}>
        {/* Section tabs */}
        <div
          style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 28, paddingBottom: 4 }}
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                padding: '7px 16px',
                borderRadius: 99,
                border: `1.5px solid ${section === s.id ? 'var(--blue)' : 'var(--border)'}`,
                background: section === s.id ? 'var(--blue-bg)' : 'var(--surface)',
                color: section === s.id ? 'var(--blue)' : 'var(--ink2)',
                fontWeight: 700,
                fontSize: '.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all .15s',
              }}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div
          style={{ fontSize: '.82rem', color: 'var(--ink3)', fontWeight: 600, marginBottom: 18 }}
        >
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {query && ` for "${query}"`}
          {kidsMode && ' · Kids Mode active'}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
              gap: 18,
            }}
          >
            {filtered.map((a) => (
              <ActivityCard key={a.id} {...a} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 600 }}>No results for "{query}"</p>
            <button
              onClick={() => setQuery('')}
              style={{
                marginTop: 12,
                padding: '8px 20px',
                borderRadius: 10,
                background: 'var(--blue)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '.82rem',
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
