import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useStreak } from '../context/StreakContext';
import { useKidsMode } from '../context/KidsModeContext';
import { useChildSwitcher } from '../context/ChildSwitcherContext';
import { useAuth } from '../context/AuthContext';
import { useAds } from '../context/AdsContext';
import KidsDashboard from './KidsDashboard';
import SeasonalBanner from '../components/SeasonalBanner';
import WeeklyChallenge from '../components/WeeklyChallenge';
import NewsletterSignup from '../components/NewsletterSignup';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import FloatingActionButton from '../components/FloatingActionButton';
import { useABTest } from '../hooks/useABTest';
import InviteFamily from '../components/InviteFamily';
import { getSeasonalMarketingHook } from '../lib/seasonal';
import JourneyCards from '../components/JourneyCards';
import { SkeletonQuickCard } from '../components/Skeleton';
import BibleFunLandJrBanner from '../components/BibleFunLandJrBanner';
import FaithAdventurePromo from '../components/FaithAdventurePromo';

// ── Reveal-on-scroll ──────────────────────────────────
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Data ──────────────────────────────────────────────
const DAILY_VERSES = [
  {
    text: 'For I know the plans I have for you, declares the Lord — plans to prosper you and not to harm you, plans to give you hope and a future.',
    ref: 'Jeremiah 29:11',
  },
  { text: 'I can do all this through him who gives me strength.', ref: 'Philippians 4:13' },
  {
    text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    ref: 'Joshua 1:9',
  },
  {
    text: 'Trust in the Lord with all your heart and lean not on your own understanding.',
    ref: 'Proverbs 3:5',
  },
  { text: 'The Lord is my shepherd, I lack nothing.', ref: 'Psalm 23:1' },
  {
    text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.',
    ref: 'Isaiah 40:31',
  },
  {
    text: 'And we know that in all things God works for the good of those who love him.',
    ref: 'Romans 8:28',
  },
];

const TILES = [
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'Track reading streaks, quiz scores, and faith milestones for every child',
    to: '/parents',
  },
  {
    icon: '📋',
    title: 'Lesson Plans & Resources',
    desc: 'Free Bible lesson plans, activity sheets, and printables for classrooms',
    to: '/parents',
  },
  {
    icon: '🔒',
    title: 'Child Profiles & Controls',
    desc: 'Safe profiles per child with age filters, time limits, and bedtime mode',
    to: '/parents',
  },
  {
    icon: '🎓',
    title: 'Certification & Milestones',
    desc: 'Kids earn real Bible certification badges as they grow in faith',
    to: '/grow/certification',
  },
];

const AGE_GROUPS = [
  {
    label: 'Preschool',
    age: '3–5',
    emoji: '🐣',
    color: '#F59E0B',
    bg: '#FFFBEB',
    routes: ['/kids/alphabet', '/kids/numbers', '/kids/shapes', '/kids/animals'],
  },
  {
    label: 'Elementary',
    age: '6–9',
    emoji: '📚',
    color: '#10B981',
    bg: '#ECFDF5',
    routes: ['/play/trivia', '/play/game/david-goliath', '/play/flashcards', '/kids-stories'],
  },
  {
    label: 'Tweens',
    age: '10–12',
    emoji: '🎮',
    color: '#3B82F6',
    bg: '#EFF6FF',
    routes: ['/play/trivia', '/play/game/escape-room', '/explore/bible', '/grow/certification'],
  },
  {
    label: 'Family',
    age: 'All Ages',
    emoji: '👨‍👩‍👧',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    routes: ['/ai/devotional', '/community/prayer', '/leaderboard', '/parents/parent-hub'],
  },
];

const FEATURED_GAMES = [
  {
    icon: '🏃',
    title: 'Scripture Runner',
    desc: 'Endless runner · Collect Fruits of the Spirit',
    to: '/play/game/runner',
    color: '#10B981',
    tag: 'Kids Fav',
    ageGroup: 'Elementary',
    topics: ['New Testament', 'Heroes', 'Faith'],
    itemType: 'Online Game',
  },
  {
    icon: '🎰',
    title: 'Spin the Verse',
    desc: 'Match 3 themes = jackpot devotional',
    to: '/play/game/spin-the-verse',
    color: '#8B5CF6',
    tag: 'Daily',
    ageGroup: 'Family',
    topics: ['New Testament', 'Jesus', 'Faith'],
    itemType: 'Online Game',
  },
  {
    icon: '❓',
    title: 'Scripture Trivia',
    desc: '3 difficulty levels · Timed rounds',
    to: '/play/trivia',
    color: '#3B82F6',
    tag: 'All Ages',
    ageGroup: 'Tweens',
    topics: ['Old Testament', 'New Testament', 'Heroes'],
    itemType: 'Online Game',
  },
  {
    icon: '🏹',
    title: 'David & Goliath',
    desc: 'Sling stones of faith · 5 levels',
    to: '/play/game/david-goliath',
    color: '#EC4899',
    tag: 'Action',
    ageGroup: 'Elementary',
    topics: ['Old Testament', 'Heroes'],
    itemType: 'Online Game',
  },
  {
    icon: '🧩',
    title: 'Parable Escape Room',
    desc: "Solve riddles from the whale & lion's den",
    to: '/game/escape-room',
    color: '#F97316',
    tag: 'Puzzle',
    ageGroup: 'Tweens',
    topics: ['Jesus', 'Parables'],
    itemType: 'Online Game',
  },
  {
    icon: '🖨️',
    title: 'Activity Sheets',
    desc: 'Printable word search, coloring & more',
    to: '/play/activity-sheets',
    color: '#14B8A6',
    tag: 'Print',
    ageGroup: 'Family',
    topics: ['General'],
    itemType: 'Printable',
  },
];

const AI_TOOLS = [
  {
    icon: '🙏',
    title: 'AI Devotional',
    desc: 'Personalized devotionals in seconds',
    to: '/devotional',
    color: '#8B5CF6',
    ageGroup: 'Family',
    topics: ['Jesus', 'New Testament'],
    itemType: 'AI Tool',
  },
  {
    icon: '💬',
    title: 'Bible Character Chat',
    desc: 'Talk to Moses, David, Paul & more',
    to: '/chat/characters',
    color: '#EC4899',
    ageGroup: 'Tweens',
    topics: ['Heroes', 'Old Testament', 'New Testament'],
    itemType: 'AI Tool',
  },
  {
    icon: '🎵',
    title: 'Bible Rap Generator',
    desc: 'Scripture raps, gospel songs & worship',
    to: '/ai/rap-generator',
    color: '#A855F7',
    ageGroup: 'Tweens',
    topics: ['Jesus', 'New Testament'],
    itemType: 'AI Tool',
  },
  {
    icon: '🖼️',
    title: 'Miracle Art Generator',
    desc: 'Describe a Bible scene, get AI art prompts',
    to: '/ai/miracle-art',
    color: '#F97316',
    ageGroup: 'All Ages',
    topics: ['Jesus', 'Stories'],
    itemType: 'AI Tool',
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
  'General',
  'Stories',
];
const TYPE_OPTIONS = ['All', 'Online Game', 'Printable', 'AI Tool'];

const COMMUNITY = [
  {
    icon: '🙏',
    title: 'Prayer Wall',
    desc: 'Real-time community prayer',
    to: '/prayer',
    color: '#10B981',
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    desc: 'Top streaks, badges & trivia champs',
    to: '/leaderboard',
    color: '#F59E0B',
  },
  {
    icon: '💬',
    title: 'Chat Rooms',
    desc: '6 rooms — Family, Youth, Worship & more',
    to: '/community/chat',
    color: '#8B5CF6',
  },
  {
    icon: '⛪',
    title: 'Church Finder',
    desc: 'Find churches near you',
    to: '/church-finder',
    color: '#3B82F6',
  },
];

export default function Home() {
  useReveal();
  const { streak, checkedToday, checkIn } = useStreak();
  const { kidsMode } = useKidsMode();
  const { isChildSession } = useChildSwitcher();
  const { user } = useAuth();
  const { isProUser, isFamilyUser } = useAds();
  const [searchParams, setSearchParams] = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  // A/B tests
  const { variant: heroCta, trackConversion: trackHeroCta } = useABTest('hero_cta');
  const {
    variant: proMsg,
    label: proLabel,
    trackConversion: trackPro,
  } = useABTest('pro_messaging');

  // Seasonal marketing hook
  const seasonalHook = getSeasonalMarketingHook();

  // Animation variants — disabled when reduced motion preferred
  const fadeUp = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

  const stagger = prefersReducedMotion
    ? {}
    : { visible: { transition: { staggerChildren: 0.12 } } };

  const btnVariant = prefersReducedMotion
    ? {}
    : {
        hidden: { opacity: 0, scale: 0.85, y: 16 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: kidsMode ? 500 : 380,
            damping: kidsMode ? 18 : 22,
          },
        },
      };

  const [ageFilter, setAgeFilter] = useState(searchParams.get('age') || 'All');
  const [topicFilter, setTopicFilter] = useState(searchParams.get('topic') || 'All');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'All');
  const todayVerse = DAILY_VERSES[new Date().getDay()];

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (ageFilter && ageFilter !== 'All') params.set('age', ageFilter);
    else params.delete('age');

    if (topicFilter && topicFilter !== 'All') params.set('topic', topicFilter);
    else params.delete('topic');

    if (typeFilter && typeFilter !== 'All') params.set('type', typeFilter);
    else params.delete('type');

    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageFilter, topicFilter, typeFilter]);

  if (kidsMode || isChildSession) return <KidsDashboard />;

  const allItems = [...FEATURED_GAMES, ...AI_TOOLS];

  const filteredItems = allItems.filter((item) => {
    const ageOk = ageFilter === 'All' || item.ageGroup === ageFilter;
    const topicOk = topicFilter === 'All' || (item.topics && item.topics.includes(topicFilter));
    const typeOk = typeFilter === 'All' || item.itemType === typeFilter;
    return ageOk && topicOk && typeOk;
  });

  const filteredGames = filteredItems.filter((item) => item.itemType === 'Online Game');
  const filteredAiTools = filteredItems.filter((item) => item.itemType === 'AI Tool');

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* ══════════════════════════════════════════
          HERO — Epic Adventure Through God's Word
      ══════════════════════════════════════════ */}
      <section className="premium-hero">
        {/* Parallax landscape silhouette — desert dunes + olive trees */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(6,30,18,0.85) 100%)',
          pointerEvents: 'none', zIndex: 1,
        }} />
        {/* Dune silhouette layer */}
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 220, zIndex: 1, pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <path d="M0,180 C200,120 400,200 600,150 C800,100 1000,180 1200,140 C1320,115 1400,160 1440,145 L1440,220 L0,220 Z" fill="rgba(15,40,25,0.7)" />
          <path d="M0,200 C180,160 360,210 540,185 C720,160 900,200 1080,175 C1260,150 1380,195 1440,180 L1440,220 L0,220 Z" fill="rgba(10,28,18,0.9)" />
          {/* Olive tree silhouettes */}
          <g fill="rgba(20,50,30,0.8)">
            <ellipse cx="120" cy="175" rx="28" ry="40" />
            <rect x="117" y="175" width="6" height="30" />
            <ellipse cx="1320" cy="168" rx="32" ry="44" />
            <rect x="1317" y="168" width="6" height="35" />
            <ellipse cx="1360" cy="172" rx="22" ry="32" />
            <rect x="1357" y="172" width="5" height="25" />
          </g>
          {/* Distant Jerusalem skyline */}
          <g fill="rgba(30,60,45,0.5)">
            <rect x="680" y="148" width="12" height="30" />
            <rect x="695" y="140" width="18" height="38" />
            <rect x="716" y="152" width="10" height="26" />
            <rect x="728" y="144" width="14" height="34" />
            <polygon points="704,140 713,125 722,140" />
          </g>
        </svg>

        {/* Star field */}
        {!prefersReducedMotion && Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7 + Math.random() * 0.3, 0.3, 0.8, 0] }}
            transition={{ delay: i * 0.18, duration: 3 + Math.random() * 4, repeat: Infinity, repeatDelay: Math.random() * 3 }}
            style={{
              position: 'absolute',
              width: i % 5 === 0 ? 3 : 2,
              height: i % 5 === 0 ? 3 : 2,
              borderRadius: '50%',
              background: 'white',
              left: `${(i * 37 + 5) % 100}%`,
              top: `${(i * 23 + 3) % 55}%`,
              pointerEvents: 'none',
              zIndex: 1,
              boxShadow: i % 5 === 0 ? '0 0 6px 2px rgba(255,255,255,0.4)' : 'none',
            }}
          />
        ))}

        {/* Floating particles — doves & sparkles */}
        {!prefersReducedMotion && [
          { emoji: '🕊️', left: '8%', delay: 0, dur: 7 },
          { emoji: '✨', left: '22%', delay: 1.2, dur: 5 },
          { emoji: '🕊️', left: '78%', delay: 0.6, dur: 8 },
          { emoji: '⭐', left: '88%', delay: 2, dur: 6 },
          { emoji: '✨', left: '55%', delay: 3, dur: 5.5 },
        ].map((p, i) => (
          <motion.div
            key={`particle-${i}`}
            animate={{ y: [0, -60, -120], opacity: [0, 0.8, 0] }}
            transition={{ delay: p.delay, duration: p.dur, repeat: Infinity, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: '15%', left: p.left,
              fontSize: '1.4rem', pointerEvents: 'none', zIndex: 2,
            }}
          >
            {p.emoji}
          </motion.div>
        ))}

        {/* Animated color blobs */}
        {[
          ['#60A5FA', '12%', '8%'],
          ['#A78BFA', '82%', '15%'],
          ['#34D399', '8%', '65%'],
          ['#FCD34D', '78%', '70%'],
        ].map(([c, l, t], i) => (
          <motion.div
            key={i}
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            transition={{ delay: i * 0.2, duration: 1.2 }}
            style={{
              position: 'absolute',
              width: 320 + i * 80,
              height: 320 + i * 80,
              borderRadius: '50%',
              background: `radial-gradient(circle,${c}1A 0%,transparent 70%)`,
              left: l,
              top: t,
              pointerEvents: 'none',
              animation: `floatP ${7 + i * 2}s ease-in-out ${i * -1.5}s infinite`,
            }}
          />
        ))}

        {/* Open Bible with light rays — center bottom */}
        <div style={{
          position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, pointerEvents: 'none', opacity: 0.18,
        }}>
          <svg width="160" height="90" viewBox="0 0 160 90" aria-hidden="true">
            {/* Light rays */}
            {[0, 30, -30, 15, -15, 45, -45].map((angle, i) => (
              <line key={i} x1="80" y1="70" x2={80 + Math.sin(angle * Math.PI / 180) * 120} y2={70 - Math.cos(angle * Math.PI / 180) * 120}
                stroke="#FCD34D" strokeWidth={i === 0 ? 3 : 1.5} strokeOpacity={i === 0 ? 0.9 : 0.5} />
            ))}
            {/* Bible pages */}
            <path d="M20,70 Q80,50 80,70 Q80,50 140,70 L140,85 Q80,65 80,85 Q80,65 20,85 Z" fill="#FEF3C7" />
            <path d="M80,70 L80,85" stroke="#D97706" strokeWidth="1.5" />
          </svg>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="premium-hero__inner"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="premium-hero__badge">
            <span className="premium-hero__badge-dot" />
            60+ Features · AI-Powered · 100% Free
          </motion.div>

          {/* Title — staggered words */}
          <motion.h1 variants={stagger} className="premium-hero__title">
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              style={{ display: 'block' }}
            >
              An Epic Adventure
            </motion.span>
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              style={{ display: 'block' }}
            >
              Through{' '}
              <motion.span
                variants={
                  prefersReducedMotion
                    ? {}
                    : {
                        hidden: { opacity: 0, scale: 0.7, y: 20 },
                        visible: {
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: { type: 'spring', stiffness: 300, damping: 18, delay: 0.1 },
                        },
                      }
                }
                className="premium-hero__title-accent"
              >
                God's Word
              </motion.span>
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="premium-hero__subtitle">
            Interactive Bible games, AI devotionals, prayer, maps &amp; more — for kids &amp; families.{' '}
            <strong style={{ color: '#4ADE80', fontWeight: 800 }}>100% free, always.</strong>
          </motion.p>

          {/* Buttons */}
          <motion.div variants={stagger} className="premium-hero__actions">
            <motion.div
              variants={btnVariant}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -3 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            >
              <Link
                to="/play"
                onClick={() => trackHeroCta('click')}
                className="premium-cta-primary"
              >
                🚀 Start Your Free Journey →
              </Link>
            </motion.div>

            <motion.div
              variants={btnVariant}
              whileHover={prefersReducedMotion ? {} : { scale: 1.04, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            >
              <Link to="/devotional" className="premium-cta-secondary">
                🙏 Try AI Devotional
              </Link>
            </motion.div>

            {!isProUser && !isFamilyUser && (
              <motion.div
                variants={btnVariant}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -3 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/premium"
                  onClick={() => trackPro('click')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '16px 28px',
                    borderRadius: 18,
                    background: 'rgba(255,255,255,.08)',
                    color: 'rgba(255,255,255,.85)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textDecoration: 'none',
                    border: '1.5px solid rgba(255,255,255,.15)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {proLabel || '💎 Go Pro'}
                </Link>
              </motion.div>
            )}

            {!user && (
              <motion.div
                variants={btnVariant}
                whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/auth"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '16px 28px',
                    borderRadius: 18,
                    background: 'rgba(255,255,255,.06)',
                    color: 'rgba(255,255,255,.75)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textDecoration: 'none',
                    border: '1.5px solid rgba(255,255,255,.12)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  🔐 Sign In
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Feature pills */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}
          >
            {[
              { label: '🗺️ Bible Map', to: '/explore/world' },
              { label: '🏃 Scripture Runner', to: '/play/game/runner' },
              { label: '🎰 Spin the Verse', to: '/play/game/spin-the-verse' },
              { label: '🧩 Escape Room', to: '/game/escape-room' },
              { label: '🎓 Certification', to: '/grow/certification' },
              { label: '📿 Prayer Beads', to: '/prayer' },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.06, duration: 0.35 }}
              >
                <Link
                  to={p.to}
                  style={{
                    display: 'inline-block',
                    fontSize: '.7rem',
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: 100,
                    background: 'rgba(255,255,255,.07)',
                    color: 'rgba(255,255,255,.55)',
                    border: '1px solid rgba(255,255,255,.1)',
                    textDecoration: 'none',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {p.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              gap: 24,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 40,
              paddingTop: 32,
              borderTop: '1px solid rgba(255,255,255,.08)',
            }}
          >
            {[
              ['10K+', 'Families'],
              ['60+', 'Features'],
              ['100%', 'Free'],
              ['40+', 'Countries'],
            ].map(([n, l], i) => (
              <motion.div
                key={l}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
                style={{ textAlign: 'center' }}
              >
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.7rem',
                    fontWeight: 800,
                    color: 'white',
                    lineHeight: 1,
                  }}
                >
                  {n}
                </div>
                <div
                  style={{
                    fontSize: '.68rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,.4)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginTop: 3,
                  }}
                >
                  {l}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          DAILY MANNA GREETING
      ══════════════════════════════════════════ */}
      <DailyMannaGreeting />

      {/* ══════════════════════════════════════════
          QUICK START
      ══════════════════════════════════════════ */}
      <QuickStart todayVerse={todayVerse} />

      {/* ══════════════════════════════════════════
          SEASONAL HIGHLIGHT
      ══════════════════════════════════════════ */}
      <SeasonalHighlight />

      {/* ══════════════════════════════════════════
          TESTIMONIALS — What Families Are Saying
      ══════════════════════════════════════════ */}
      <TestimonialsCarousel />

      {/* ══════════════════════════════════════════
          FOR PARENTS & TEACHERS
      ══════════════════════════════════════════ */}
      <ParentsSection />

      {/* ══════════════════════════════════════════
          ADULT MINISTRIES & RESOURCES
      ══════════════════════════════════════════ */}
      <AdultMinistriesSection />

      {/* ══════════════════════════════════════════
          BIBLEFUNLAND JR. — FOR LITTLE ONES
      ══════════════════════════════════════════ */}
      <BibleFunLandJrBanner />

      {/* ══════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════ */}
      <section style={{ padding: '60px 24px', background: 'white' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <NewsletterSignup />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VERSE VERSE CTA
      ══════════════════════════════════════════ */}
      <VerseVerseCTA />

      {/* ══════════════════════════════════════════
          HOMESCHOOL HUB CTA
      ══════════════════════════════════════════ */}
      <HomeSchoolHubCTA />

      {/* ══════════════════════════════════════════
          PRO CTA
      ══════════════════════════════════════════ */}
      <ProCta user={user} isSubscriber={isProUser || isFamilyUser} />

      <style>{`
        @keyframes floatP{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-18px) rotate(3deg)}66%{transform:translateY(-8px) rotate(-2deg)}}
        .reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
        .reveal.in{opacity:1;transform:translateY(0)}
        @media(max-width:600px){
          .hero-btns{flex-direction:column;align-items:stretch}
          .hero-btns a{text-align:center;justify-content:center}
        }
      `}</style>
    </div>
  );
}


// ── Daily Manna Greeting ─────────────────────────────────────────────────────
function DailyMannaGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12
    ? { emoji: '🌅', label: 'Good Morning', verse: 'This is the day the Lord has made; let us rejoice and be glad in it.', ref: 'Psalm 118:24', color: '#F59E0B', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', textColor: '#78350F' }
    : hour < 17
    ? { emoji: '☀️', label: 'Good Afternoon', verse: 'I can do all this through him who gives me strength.', ref: 'Philippians 4:13', color: '#3B82F6', bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', textColor: '#1E3A8A' }
    : hour < 21
    ? { emoji: '🌇', label: 'Good Evening', verse: 'Trust in the Lord with all your heart and lean not on your own understanding.', ref: 'Proverbs 3:5', color: '#8B5CF6', bg: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', textColor: '#4C1D95' }
    : { emoji: '🌙', label: 'Good Night', verse: 'He grants sleep to those he loves.', ref: 'Psalm 127:2', color: '#6366F1', bg: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)', textColor: '#312E81' };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: greeting.bg,
        borderBottom: `2px solid ${greeting.color}22`,
        padding: '14px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.4rem' }}>{greeting.emoji}</span>
        <span style={{ fontWeight: 800, fontSize: '.88rem', color: greeting.textColor }}>
          {greeting.label}!
        </span>
        <span style={{ fontSize: '.82rem', color: greeting.textColor, opacity: 0.8, fontStyle: 'italic' }}>
          "{greeting.verse}" — <strong>{greeting.ref}</strong>
        </span>
      </div>
    </motion.div>
  );
}

// ── Quick Start ───────────────────────────────────────────────────────────────
function QuickStart({ todayVerse }) {
  const [ready, setReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t); }, []);

  function speakVerse(verse) {
    if (!verse || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speaking) { setSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(`${verse.text} — ${verse.ref}`);
    utt.rate = 0.88;
    utt.pitch = 1.05;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  }

  if (!ready) return (
    <section style={{ padding: '80px 24px 64px', background: '#FAFBFF' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[1,2,3,4,5].map(i => <SkeletonQuickCard key={i} />)}
        </div>
      </div>
    </section>
  );
  const QUICK_CARDS = [
    {
      icon: '🎮',
      title: 'Bible Letters Adventure',
      desc: 'NEW! Interactive spelling game with 52 Bible words, animations & rewards — kids love it!',
      to: 'https://letter.biblefunland.com',
      color: '#F59E0B',
      bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      label: 'Start Playing →',
      isExternal: true,
      tag: '🎉 NEW',
      featured: true,
      gradient: true,
    },
    {
      icon: '🎮',
      title: 'Play Games',
      desc: 'Bible trivia, runners, escape rooms & more — all ages welcome',
      to: '/play',
      color: '#3B82F6',
      bg: '#EFF6FF',
      label: 'Start Playing →',
    },
    {
      icon: '🙏',
      title: 'Try AI Devotional',
      desc: 'Get a personalized devotional in seconds, powered by AI',
      to: '/devotional',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      label: 'Get Devotional →',
    },
    {
      icon: '🌍',
      title: 'Living Bible Map',
      desc: 'Walk through 3D Bible lands — hover over the Sea of Galilee, Jerusalem & more',
      to: '/explore/world',
      color: '#C05C33',
      bg: '#FFF7ED',
      label: 'Explore Now →',
      tag: '🗺️ Interactive',
    },
    {
      icon: '📖',
      title: 'Verse of the Day',
      desc: todayVerse
        ? `"${todayVerse.text.slice(0, 72)}…" — ${todayVerse.ref}`
        : 'A fresh verse every day to inspire your walk with God',
      to: '/explore/bible',
      color: '#10B981',
      bg: '#ECFDF5',
      label: 'Read & Listen →',
      hasAudio: true,
      audioVerse: todayVerse,
    },
    {
      icon: '🕊️',
      title: 'Join Prayer Wall',
      desc: 'Thousands praying together right now — add your voice',
      to: '/prayer',
      color: '#F59E0B',
      bg: '#FFFBEB',
      label: 'Pray Now →',
    },
    {
      icon: '†',
      title: 'Verse Verse',
      desc: 'Scroll scripture by Strength, Comfort & Love — AI devotion, prayers, meditate & share every verse.',
      to: 'https://verse-verse.biblefunland.com',
      color: '#14B8A6',
      bg: 'linear-gradient(135deg, #0F172A 0%, #134E4A 50%, #312E81 100%)',
      label: 'Open Verse Verse →',
      isExternal: true,
      tag: '✨ NEW',
    },
    {
      icon: '✍️',
      title: 'Rhema Notes',
      desc: 'NEW! Transform your church sermons into AI-powered insights & growth plans.',
      to: 'https://rhemanotes.biblefunland.com',
      color: '#8B5CF6',
      bg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
      label: 'Try Sermon Scribe →',
      isExternal: true,
      tag: '✨ NEW',
    },
    {
      icon: '🏠',
      title: 'HomeSchool Hub',
      desc: 'Complete Bible curriculum, lesson plans & resources for your homeschool journey.',
      to: 'https://homeschool.biblefunland.com',
      color: '#065F46',
      bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
      label: 'Visit Hub →',
      isExternal: true,
      tag: '✨ Hub',
    },
    {
      icon: '🌱',
      title: 'Build Faithful Habits',
      desc: 'Track daily prayer, Bible reading, gratitude & more — build streaks and earn badges',
      to: '/grow/habits',
      color: '#10B981',
      bg: '#ECFDF5',
      label: 'Start Today →',
    },
    {
      icon: '⛪',
      title: 'Vesper Ministry',
      desc: 'NEW! The advanced ministry platform for sermon archives, team collaboration & growth.',
      to: 'https://vesper.biblefunland.com',
      color: '#3B82F6',
      bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
      label: 'Enter Platform →',
      isExternal: true,
      tag: '🔥 PRO',
    },
  ];

  return (
    <section style={{ 
      padding: '88px 24px 72px', 
      background: '#FAFBFF', 
      position: 'relative', 
      overflow: 'hidden',
      // Subtle papyrus/linen texture via repeating gradient
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(59,82,180,0.025) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(59,82,180,0.015) 40px)',
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(180deg, rgba(59,130,246,0.04) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        {/* Fancy Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ 
            textAlign: 'center', 
            marginBottom: 60,
            position: 'relative',
          }}
        >
          {/* Floating emojis */}
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              left: '10%',
              top: -20,
              fontSize: '2.5rem',
              opacity: 0.7,
            }}
          >
            🎮
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, -5, 0, 5, 0],
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            style={{
              position: 'absolute',
              right: '10%',
              top: -10,
              fontSize: '2.5rem',
              opacity: 0.7,
            }}
          >
            ✨
          </motion.div>

          <motion.div
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            style={{
              position: 'absolute',
              left: '25%',
              bottom: 20,
              fontSize: '2rem',
              opacity: 0.6,
            }}
          >
            📖
          </motion.div>

          <motion.div
            animate={{ 
              y: [0, -12, 0],
            }}
            transition={{ 
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            }}
            style={{
              position: 'absolute',
              right: '25%',
              bottom: 30,
              fontSize: '2rem',
              opacity: 0.6,
            }}
          >
            🙏
          </motion.div>

          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: 'inline-block', 
              fontSize: '.75rem', 
              fontWeight: 800,
              letterSpacing: '1.5px', 
              textTransform: 'uppercase',
              color: '#F59E0B', 
              background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
              padding: '6px 16px', 
              borderRadius: 100, 
              marginBottom: 20,
              border: '2px solid #F59E0B',
              boxShadow: '0 4px 12px rgba(245,158,11,0.2)',
            }}>
            ⚡ Quick Start
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
              fontWeight: 800, 
              color: '#1E1B4B', 
              marginBottom: 16,
              lineHeight: 1.05,
              letterSpacing: '-1px',
              textShadow: '0 2px 20px rgba(59,130,246,0.1)',
            }}>
            Jump Into <span style={{ 
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Bible Fun</span> 🎯
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ 
              color: '#6B7280', 
              fontSize: '1.15rem', 
              maxWidth: 600, 
              margin: '0 auto 24px',
              lineHeight: 1.7,
              fontWeight: 500,
            }}>
            Everything is <strong style={{ color: '#10B981', fontWeight: 800 }}>100% free</strong>. Pick what sounds fun and start your faith adventure today!
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              width: '120px',
              height: '4px',
              background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)',
              margin: '0 auto',
              borderRadius: '2px',
            }}
          />
        </motion.div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: 22,
        }}>
          {QUICK_CARDS.map((card, i) => {
            const CardWrapper = card.isExternal ? 'a' : Link;
            const linkProps = card.isExternal 
              ? { href: card.to, target: '_blank', rel: 'noopener noreferrer' }
              : { to: card.to };
            
            return (
              <CardWrapper key={i} {...linkProps} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: card.featured ? -10 : -6, 
                    scale: card.featured ? 1.02 : 1,
                    boxShadow: card.featured 
                      ? '0 25px 50px rgba(245,158,11,0.35)' 
                      : `0 18px 40px ${card.color}20` 
                  }}
                  animate={card.featured ? {
                    boxShadow: [
                      '0 8px 30px rgba(245,158,11,0.2)',
                      '0 12px 40px rgba(245,158,11,0.3)',
                      '0 8px 30px rgba(245,158,11,0.2)',
                    ]
                  } : {}}
                  transition={{
                    default: { delay: i * 0.07, duration: 0.45 },
                    boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  style={{
                    background: card.gradient ? card.bg : card.bg,
                    borderRadius: 20,
                    padding: '28px 22px',
                    border: card.featured 
                      ? '2px solid #F59E0B' 
                      : `1.5px solid ${card.color}28`,
                    display: 'flex', flexDirection: 'column', gap: 14,
                    height: '100%', cursor: 'pointer',
                    boxShadow: card.featured 
                      ? '0 8px 30px rgba(245,158,11,0.25)' 
                      : '0 2px 14px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Sparkle effect for featured card */}
                  {card.featured && (
                    <>
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        style={{
                          position: 'absolute',
                          top: -50,
                          right: -50,
                          width: 150,
                          height: 150,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)',
                          pointerEvents: 'none',
                        }}
                      />
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          fontSize: '1.2rem',
                          opacity: 0.6,
                        }}
                      >
                        ✨
                      </motion.div>
                    </>
                  )}
                  
                  {card.tag && (
                    <motion.div
                      animate={card.featured ? {
                        scale: [1, 1.05, 1],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontSize: '.65rem',
                        fontWeight: 800,
                        padding: '5px 12px',
                        borderRadius: 100,
                        background: card.featured 
                          ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                          : card.color,
                        color: 'white',
                        letterSpacing: '0.5px',
                        boxShadow: card.featured
                          ? '0 4px 12px rgba(245,158,11,0.5)'
                          : `0 2px 8px ${card.color}40`,
                      }}>
                      {card.tag}
                    </motion.div>
                  )}
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: card.featured 
                      ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                      : card.color,
                    display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', 
                    boxShadow: card.featured
                      ? '0 8px 20px rgba(245,158,11,0.5)'
                      : `0 6px 16px ${card.color}40`,
                    flexShrink: 0,
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      fontFamily: "'Baloo 2', cursive", fontSize: '1.15rem',
                      fontWeight: 800, 
                      color: card.featured ? '#92400E' : '#1E1B4B',
                      marginBottom: 6,
                    }}>
                      {card.title}
                    </div>
                    <p style={{ 
                      fontSize: '.84rem', 
                      color: card.featured ? '#78350F' : '#6B7280',
                      lineHeight: 1.65, 
                      margin: 0,
                      fontWeight: card.featured ? 600 : 400,
                    }}>
                      {card.desc}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'relative', zIndex: 1,
                  }}>
                    <div style={{
                      color: card.featured ? '#92400E' : card.color,
                      fontWeight: 800, 
                      fontSize: '.85rem',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                    }}>
                      {card.label}
                      {card.featured && <span style={{ fontSize: '1rem' }}>🎯</span>}
                    </div>
                    {card.hasAudio && card.audioVerse && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); speakVerse(card.audioVerse); }}
                        title={speaking ? 'Stop reading' : 'Listen to verse'}
                        aria-label={speaking ? 'Stop reading verse aloud' : 'Listen to verse aloud'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '5px 12px', borderRadius: 100,
                          background: speaking ? '#10B981' : 'rgba(16,185,129,0.12)',
                          border: '1.5px solid #10B981',
                          color: speaking ? 'white' : '#10B981',
                          fontWeight: 700, fontSize: '.72rem', cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {speaking ? '⏹ Stop' : '🔊 Listen'}
                      </button>
                    )}
                  </div>
                </motion.div>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Seasonal Highlight ────────────────────────────────────────────────────────
function getSeasonData() {
  const now = new Date();
  const m = now.getMonth(); // 0-indexed
  const d = now.getDate();

  // Easter / Spring (mid-March → end of April)
  if ((m === 2 && d >= 15) || (m === 3 && d <= 30)) {
    return {
      id: 'easter',
      label: 'Easter Adventures',
      tagline: "He is Risen! 🐣 Celebrate with special Easter activities — new content added weekly.",
      emoji: '🐣',
      gradient: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #0F4C2A 100%)',
      accentColor: '#34D399',
      tagBg: 'rgba(52,211,153,0.15)',
      tagColor: '#34D399',
      cards: [
        { icon: '🏃', title: 'Resurrection Runner', desc: 'Easter edition of Scripture Runner — collect Easter eggs of faith!', to: '/play/game/runner', tag: '🐣 Easter Special' },
        { icon: '❓', title: 'Easter Trivia', desc: 'Test your knowledge of the resurrection story across 3 difficulty levels', to: '/play/trivia', tag: '🌟 All Ages' },
        { icon: '🙏', title: 'Easter Devotional', desc: 'AI-powered devotional on the resurrection — personalized for your family', to: '/devotional', tag: '✨ AI' },
      ],
      cta: { label: 'Explore All Easter Activities →', to: '/play' },
      fomo: '🔥 New Easter content added this week — don\'t miss it!',
    };
  }

  // Summer (May → mid-August)
  if ((m === 4) || (m === 5) || (m === 6) || (m === 7 && d <= 15)) {
    return {
      id: 'summer',
      label: 'Summer Bible Fun',
      tagline: '☀️ Keep the faith alive all summer — new games, challenges & printables every week.',
      emoji: '☀️',
      gradient: 'linear-gradient(135deg, #1E3A5F 0%, #1E1B4B 50%, #0F172A 100%)',
      accentColor: '#FCD34D',
      tagBg: 'rgba(252,211,77,0.15)',
      tagColor: '#FCD34D',
      cards: [
        { icon: '🏖️', title: 'Summer Scripture Challenge', desc: 'Read through the Psalms this summer — earn the Summer Scholar badge', to: '/grow', tag: '🏆 Challenge' },
        { icon: '🎮', title: 'Summer Games Marathon', desc: 'Play all 6 Bible games and unlock the Summer Champion badge', to: '/play', tag: '🎮 Games' },
        { icon: '🖨️', title: 'Summer Activity Sheets', desc: 'Free printable Bible coloring pages, word searches & crafts', to: '/play/activity-sheets', tag: '🖨️ Free Print' },
      ],
      cta: { label: 'See All Summer Activities →', to: '/play' },
      fomo: '☀️ Summer challenge ends August 15 — earn your badge before it\'s gone!',
    };
  }

  // Back to School (mid-Aug → mid-Sep)
  if ((m === 7 && d >= 15) || (m === 8 && d <= 15)) {
    return {
      id: 'back-to-school',
      label: 'Back to School',
      tagline: '📚 Start the school year with wisdom — Bible study tools for students & teachers.',
      emoji: '📚',
      gradient: 'linear-gradient(135deg, #1E3A5F 0%, #1E1B4B 50%, #0F172A 100%)',
      accentColor: '#60A5FA',
      tagBg: 'rgba(96,165,250,0.15)',
      tagColor: '#60A5FA',
      cards: [
        { icon: '🧠', title: 'Bible Flashcards', desc: 'Memorize key verses for the new school year — 200+ cards available', to: '/play/flashcards', tag: '📚 Study' },
        { icon: '🏫', title: 'Teacher Lesson Plans', desc: 'Free Bible lesson plans and activity sheets for classrooms', to: '/parents', tag: '🏫 Teachers' },
        { icon: '🙏', title: 'School Year Devotional', desc: 'AI devotional to start the school year with God\'s guidance', to: '/devotional', tag: '✨ AI' },
      ],
      cta: { label: 'Explore Back to School Resources →', to: '/parents' },
      fomo: '📚 New lesson plans added weekly for the school year!',
    };
  }

  // Thanksgiving (Nov 15–30)
  if (m === 10 && d >= 15) {
    return {
      id: 'thanksgiving',
      label: 'Thanksgiving Season',
      tagline: '🦃 Give thanks to the Lord — explore gratitude and praise in Scripture this season.',
      emoji: '🦃',
      gradient: 'linear-gradient(135deg, #78350F 0%, #92400E 50%, #0F172A 100%)',
      accentColor: '#F59E0B',
      tagBg: 'rgba(245,158,11,0.15)',
      tagColor: '#F59E0B',
      cards: [
        { icon: '🦃', title: 'Thanksgiving Trivia', desc: 'Bible verses about gratitude, praise, and giving thanks', to: '/play/trivia', tag: '🦃 Seasonal' },
        { icon: '🙏', title: 'Gratitude Devotional', desc: 'AI devotional on thankfulness and counting your blessings', to: '/devotional', tag: '✨ AI' },
        { icon: '🎵', title: 'Praise Rap Generator', desc: 'Create a thanksgiving scripture rap for your family', to: '/ai/rap-generator', tag: '🎵 AI Fun' },
      ],
      cta: { label: 'Explore Thanksgiving Activities →', to: '/play' },
      fomo: '🦃 Special Thanksgiving badge available this month only!',
    };
  }

  // Christmas (Dec)
  if (m === 11) {
    return {
      id: 'christmas',
      label: 'Christmas Season',
      tagline: '🎄 Celebrate the greatest gift — special Christmas games, stories & devotionals.',
      emoji: '🎄',
      gradient: 'linear-gradient(135deg, #7F1D1D 0%, #1E3A5F 50%, #0F172A 100%)',
      accentColor: '#EF4444',
      tagBg: 'rgba(239,68,68,0.15)',
      tagColor: '#EF4444',
      cards: [
        { icon: '⭐', title: 'Nativity Trivia', desc: 'How well do you know the Christmas story? 3 difficulty levels', to: '/play/trivia', tag: '🎄 Christmas' },
        { icon: '🎄', title: 'Christmas Devotional', desc: 'AI devotional on the birth of Jesus — perfect for family reading', to: '/devotional', tag: '✨ AI' },
        { icon: '🎵', title: 'Christmas Rap', desc: 'Generate a Christmas scripture rap for your family celebration', to: '/ai/rap-generator', tag: '🎵 AI Fun' },
      ],
      cta: { label: 'Explore All Christmas Activities →', to: '/play' },
      fomo: '🎄 Christmas content available December only — celebrate with us!',
    };
  }

  // Default: Spring / General
  return {
    id: 'spring',
    label: 'Spring Bible Fun',
    tagline: '🌸 Fresh content every week — games, devotionals, and challenges for the whole family.',
    emoji: '🌸',
    gradient: 'linear-gradient(135deg, #1E3A5F 0%, #312E81 50%, #0F172A 100%)',
    accentColor: '#A78BFA',
    tagBg: 'rgba(167,139,250,0.15)',
    tagColor: '#A78BFA',
    cards: [
      { icon: '🎮', title: 'Featured Games', desc: 'Scripture Runner, Trivia, David & Goliath — play them all free', to: '/play', tag: '🎮 Popular' },
      { icon: '🌍', title: 'Living Bible Map', desc: 'Explore 3D Bible lands — new locations added regularly', to: '/explore/world', tag: '🌍 Explore' },
      { icon: '🙏', title: 'Daily Devotional', desc: 'Fresh AI-powered devotionals every day for your family', to: '/devotional', tag: '✨ AI' },
    ],
    cta: { label: 'Explore All Activities →', to: '/play' },
    fomo: '🌸 New games and activities added every week — check back often!',
  };
}

// ── Seasonal Countdown Timer ─────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ expired: true });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return timeLeft;
}

function SeasonalHighlight() {
  const season = getSeasonData();
  // Countdown for summer challenge — always ends Aug 15 of the current year
  const now = new Date();
  const summerDeadline = new Date(now.getFullYear(), 7, 15, 23, 59, 59).toISOString();
  const summerStart = new Date(now.getFullYear(), 4, 1); // May 1
  const summerEnd = new Date(now.getFullYear(), 7, 15);  // Aug 15
  const summerTotalDays = (summerEnd - summerStart) / (1000 * 60 * 60 * 24);
  const countdown = useCountdown(season.id === 'summer' ? summerDeadline : new Date(9999, 0, 1).toISOString());
  const summerProgress = season.id === 'summer'
    ? Math.min(100, Math.max(0, Math.round(((now - summerStart) / (1000 * 60 * 60 * 24)) / summerTotalDays * 100)))
    : 0;

  return (
    <section style={{
      padding: '80px 24px',
      background: season.gradient,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${season.accentColor}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '.72rem', fontWeight: 800, letterSpacing: '1px',
            textTransform: 'uppercase', color: season.tagColor,
            background: season.tagBg, border: `1px solid ${season.accentColor}30`,
            padding: '5px 14px', borderRadius: 100, marginBottom: 16,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: season.accentColor,
              boxShadow: `0 0 8px ${season.accentColor}`,
              display: 'inline-block',
            }} />
            This Season
          </span>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 800, color: 'white', marginBottom: 12,
            letterSpacing: '-0.5px',
          }}>
            {season.emoji} {season.label}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: '.95rem',
            maxWidth: 520, margin: '0 auto 16px', lineHeight: 1.7,
          }}>
            {season.tagline}
          </p>
          {/* FOMO pill */}
          <span style={{
            display: 'inline-block', fontSize: '.75rem', fontWeight: 700,
            color: season.accentColor, background: season.tagBg,
            border: `1px solid ${season.accentColor}30`,
            padding: '4px 14px', borderRadius: 100,
          }}>
            {season.fomo}
          </span>

          {/* Summer countdown timer */}
          {season.id === 'summer' && !countdown.expired && countdown.days !== undefined && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                ⏳ Challenge ends in
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { val: countdown.days, label: 'Days' },
                  { val: countdown.hours, label: 'Hours' },
                  { val: countdown.minutes, label: 'Mins' },
                  { val: countdown.seconds, label: 'Secs' },
                ].map(({ val, label }) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: `1.5px solid ${season.accentColor}40`,
                    borderRadius: 12,
                    padding: '10px 16px',
                    minWidth: 60,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.6rem', fontWeight: 800, color: season.accentColor, lineHeight: 1 }}>
                      {String(val).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div style={{ marginTop: 16, maxWidth: 400, margin: '16px auto 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                  <span>Summer Progress</span>
                  <span>{summerProgress}% complete</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${summerProgress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${season.accentColor}, #F97316)`, borderRadius: 99 }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 40,
        }}>
          {season.cards.map((card, i) => (
            <Link key={i} to={card.to} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6, boxShadow: `0 20px 48px rgba(0,0,0,0.35)` }}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 20,
                  padding: '28px 24px',
                  border: `1.5px solid rgba(255,255,255,0.12)`,
                  display: 'flex', flexDirection: 'column', gap: 14,
                  height: '100%', cursor: 'pointer',
                  transition: 'box-shadow 0.25s, transform 0.25s',
                }}
              >
                {/* Tag */}
                <span style={{
                  alignSelf: 'flex-start', fontSize: '.65rem', fontWeight: 800,
                  color: season.accentColor, background: season.tagBg,
                  border: `1px solid ${season.accentColor}30`,
                  padding: '3px 10px', borderRadius: 100,
                }}>
                  {card.tag}
                </span>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: `${season.accentColor}22`,
                  border: `1.5px solid ${season.accentColor}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem',
                }}>
                  {card.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive", fontSize: '1.1rem',
                    fontWeight: 800, color: 'white', marginBottom: 6,
                  }}>
                    {card.title}
                  </div>
                  <p style={{
                    fontSize: '.82rem', color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.65, margin: 0,
                  }}>
                    {card.desc}
                  </p>
                </div>
                <div style={{
                  color: season.accentColor, fontWeight: 800, fontSize: '.8rem',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  Play Now →
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to={season.cta.to} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 14,
            background: season.accentColor, color: '#0F172A',
            fontWeight: 800, fontSize: '.95rem', textDecoration: 'none',
            boxShadow: `0 8px 28px ${season.accentColor}50`,
            transition: 'opacity 0.2s',
          }}>
            {season.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Parents & Teachers ────────────────────────────────────────────────────────
function ParentsSection() {
  return (
    <section className="section-premium section-premium--mint">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 56, alignItems: 'center',
          marginBottom: 40,
        }}
        >
          {/* Left copy */}
          <div className="reveal">
            <span style={{
              display: 'inline-block', fontSize: '.72rem', fontWeight: 800,
              letterSpacing: '1px', textTransform: 'uppercase',
              color: '#10B981', background: '#D1FAE5',
              padding: '5px 14px', borderRadius: 100, marginBottom: 16,
            }}>
              For Parents & Teachers
            </span>
            <h2 style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800, color: '#064E3B', marginBottom: 14, lineHeight: 1.1,
              letterSpacing: '-0.5px',
            }}>
              Built with families in mind
            </h2>
            <p style={{
              color: '#065F46', fontSize: '.95rem', lineHeight: 1.8,
              marginBottom: 28, maxWidth: 400,
            }}>
              BibleFunLand gives parents and teachers the tools to guide kids through faith-based learning — safely, joyfully, and at their own pace.
            </p>
            <Link to="/parents" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 26px', borderRadius: 14,
              background: '#10B981', color: 'white',
              fontWeight: 800, fontSize: '.9rem', textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(16,185,129,.35)',
            }}>
              🏫 Go to Parents Hub →
            </Link>
          </div>

          {/* Right tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {TILES.map((t, i) => (
              <Link key={i} to={t.to} style={{ textDecoration: 'none' }}>
                <motion.div
                  className="reveal surface-elevated"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  style={{
                    padding: '20px 18px',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{t.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#064E3B', marginBottom: 5 }}>
                    {t.title}
                  </div>
                  <p style={{ fontSize: '.75rem', color: '#6B7280', lineHeight: 1.55, margin: 0 }}>
                    {t.desc}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        <div className="reveal">
          <FaithAdventurePromo />
        </div>
      </div>
    </section>
  );
}

// ── Pro CTA ───────────────────────────────────────────────────────────────────
function ProCta({ user, isSubscriber }) {
  if (isSubscriber) return null;
  return (
    <section style={{ padding: '72px 24px', background: 'linear-gradient(135deg,#0F0F1A,#1A0533,#0A1A0F)' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <div className="reveal" style={{
          background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(168,85,247,.08))',
          borderRadius: 32, border: '1.5px solid rgba(139,92,246,.2)',
          padding: '52px 40px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 14 }}>💎</div>
          <h2 style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.6rem,4vw,2.4rem)',
            fontWeight: 800, color: 'white', marginBottom: 10,
          }}>
            Unlock the Full Experience
          </h2>
          <p style={{
            fontSize: '.9rem', color: 'rgba(255,255,255,.5)',
            lineHeight: 1.75, maxWidth: 420, margin: '0 auto 32px',
          }}>
            Go Pro for unlimited AI tools, Bible certification, family progress tracking, and priority access to every new feature.
          </p>

          {/* Free vs Pro comparison table */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            maxWidth: 560, margin: '0 auto 32px', textAlign: 'left',
          }}>
            {/* Free column */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 16,
              border: '1.5px solid rgba(255,255,255,0.08)', padding: '20px 18px',
            }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
                🆓 Free
              </div>
              {[
                '✅ All Bible games',
                '✅ 5 AI devotionals/mo',
                '✅ Prayer Wall',
                '✅ Verse of the Day',
                '❌ Certification',
                '❌ Family profiles',
                '❌ Full Bible Map',
              ].map((item, i) => (
                <div key={i} style={{ fontSize: '.78rem', color: item.startsWith('✅') ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)', marginBottom: 7, fontWeight: 600 }}>
                  {item}
                </div>
              ))}
            </div>
            {/* Pro column */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.1))',
              borderRadius: 16, border: '1.5px solid rgba(139,92,246,0.35)', padding: '20px 18px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: -10, right: 12,
                background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
                color: 'white', fontSize: '.6rem', fontWeight: 800,
                padding: '3px 10px', borderRadius: 100, letterSpacing: 1,
              }}>
                BEST VALUE
              </div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: '#C4B5FD', marginBottom: 14 }}>
                💎 Pro — $3.99/mo
              </div>
              {[
                '✅ All Bible games',
                '✅ Unlimited AI tools',
                '✅ Prayer Wall',
                '✅ Verse of the Day',
                '✅ Full Certification',
                '✅ Family profiles',
                '✅ Complete Bible Map',
              ].map((item, i) => (
                <div key={i} style={{ fontSize: '.78rem', color: '#C4B5FD', marginBottom: 7, fontWeight: 600 }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/premium" style={{
              padding: '14px 32px', borderRadius: 14,
              background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
              color: 'white', fontWeight: 800, fontSize: '.9rem',
              textDecoration: 'none', boxShadow: '0 8px 28px rgba(139,92,246,.35)',
            }}>
              ✨ See Pro Plans — from $3.99/mo
            </Link>
            <Link to={user ? '/dashboard' : '/auth'} style={{
              padding: '14px 28px', borderRadius: 14,
              background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.7)',
              fontWeight: 700, fontSize: '.9rem', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,.12)',
            }}>
              {user ? '📊 My Dashboard' : '🔐 Free Account'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Adult Ministries Section ──────────────────────────────────────────────────
function AdultMinistriesSection() {
  const ADULT_RESOURCES = [
    {
      title: 'Verse Verse',
      desc: 'A cinematic, scrollable scripture feed — daily verses, AI Faith Companion, prayer wall & guided meditation.',
      to: 'https://verse-verse.biblefunland.com/',
      icon: '†',
      color: '#14B8A6',
      tag: 'NEW',
      bg: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(139, 92, 246, 0.08))',
    },
    {
      title: 'Rhema Notes',
      desc: 'Transform your church sermons into AI-powered insights, personal growth plans, and deep theological study tools.',
      to: 'https://rhemanotes.biblefunland.com/',
      icon: '✍️',
      color: '#8B5CF6',
      tag: 'Sermon Scribe',
      bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
    },
    {
      title: 'HomeSchool Hub',
      desc: 'The complete Bible-based curriculum and resource center for families dedicated to faith-led education.',
      to: 'https://homeschool.biblefunland.com/',
      icon: '🏠',
      color: '#10B981',
      tag: 'Curriculum',
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
    },
    {
      title: 'Vesper Ministry',
      desc: 'The premier platform for ministry leaders and families to archive, manage, and share their spiritual legacy.',
      to: 'https://vesper.biblefunland.com/',
      icon: '⛪',
      color: '#3B82F6',
      tag: 'Ministry Hub',
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
    }
  ];

  return (
    <section style={{ 
      padding: '100px 24px', 
      background: 'linear-gradient(180deg, #FAFBFF 0%, #F3F4F6 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{
            display: 'inline-block', fontSize: '.75rem', fontWeight: 800,
            letterSpacing: '2px', textTransform: 'uppercase',
            color: '#4F46E5', background: 'rgba(79, 70, 229, 0.1)',
            padding: '8px 20px', borderRadius: 100, marginBottom: 20,
            border: '1.5px solid rgba(79, 70, 229, 0.2)',
          }}>
            For Adults & Ministry Leaders
          </span>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800, color: '#1E1B4B', marginBottom: 20, lineHeight: 1.1,
          }}>
            Take Your Faith <span style={{ color: '#4F46E5' }}>To The Next Level</span> 🚀
          </h2>
          <p style={{
            fontSize: '1.1rem', color: '#4B5563',
            lineHeight: 1.7, maxWidth: 700, margin: '0 auto', fontWeight: 500,
          }}>
            Explore our ecosystem of advanced tools designed to empower parents, teachers, and ministry leaders in their spiritual journey.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {ADULT_RESOURCES.map((item, i) => (
            <a key={i} href={item.to} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                style={{
                  background: 'white',
                  borderRadius: 24,
                  padding: '40px 32px',
                  height: '100%',
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Decorative background circle */}
                <div style={{
                  position: 'absolute', top: -20, right: -20, width: 120, height: 120,
                  background: item.bg, borderRadius: '50%', zIndex: 0
                }} />

                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', color: 'white',
                  boxShadow: `0 10px 20px ${item.color}40`,
                  position: 'relative', zIndex: 1
                }}>
                  {item.icon}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{
                    fontSize: '.65rem', fontWeight: 800, color: item.color,
                    background: `${item.color}15`, padding: '4px 12px',
                    borderRadius: 100, textTransform: 'uppercase', letterSpacing: 0.5
                  }}>
                    {item.tag}
                  </span>
                  <h3 style={{
                    fontFamily: "'Baloo 2', cursive", fontSize: '1.6rem',
                    fontWeight: 800, color: '#1E1B4B', marginTop: 12, marginBottom: 8
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>

                <div style={{
                  marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8,
                  color: item.color, fontWeight: 700, fontSize: '.95rem'
                }}>
                  Visit Website <span style={{ fontSize: '1.2rem' }}>→</span>
                </div>
              </motion.div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Verse Verse CTA ───────────────────────────────────────────────────────────
const VERSE_VERSE_URL = 'https://verse-verse.biblefunland.com';

function VerseVerseCTA() {
  return (
    <section style={{ padding: '100px 24px', background: '#FAFBFF', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '20%', right: '-8%', width: '420px', height: '420px',
        background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '-6%', width: '360px', height: '360px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            background: 'linear-gradient(135deg, #0a0a1a 0%, #134E4A 45%, #312E81 100%)',
            borderRadius: 32,
            padding: '72px 40px',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(15,23,42,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset',
          }}
        >
          <motion.div
            animate={{ y: [0, -16, 0], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: 32, left: '8%', fontSize: '2.5rem', pointerEvents: 'none' }}
          >
            📖
          </motion.div>
          <motion.div
            animate={{ y: [0, 14, 0], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            style={{ position: 'absolute', bottom: 36, right: '8%', fontSize: '2.5rem', pointerEvents: 'none' }}
          >
            🙏
          </motion.div>

          <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <span style={{
              display: 'inline-block', fontSize: '.75rem', fontWeight: 800,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: '#5EEAD4', background: 'rgba(20,184,166,0.15)',
              padding: '8px 20px', borderRadius: 100, marginBottom: 24,
              border: '1.5px solid rgba(94,234,212,0.25)',
            }}>
              New from BibleFunLand
            </span>

            <p style={{
              fontSize: '.7rem', fontWeight: 800, letterSpacing: '0.35em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 12,
            }}>
              † Verse Verse
            </p>

            <h2 style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 800, color: 'white', marginBottom: 20, lineHeight: 1.15,
            }}>
              Scripture That <span style={{ color: '#5EEAD4' }}>Meets You</span> Where You Are
            </h2>

            <p style={{
              fontSize: '1.1rem', color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.7, marginBottom: 36, fontWeight: 500,
            }}>
              Swipe through Strength, Comfort & Love — save verses, join the prayer wall,
              meditate in cinematic scenes, and let the AI Faith Companion guide your heart.
            </p>

            <div style={{
              display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
              marginBottom: 40,
            }}>
              {['Scrollable Verses', 'AI Faith Companion', 'Prayer & Meditate'].map((f, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    padding: '8px 16px', borderRadius: 100, backdropFilter: 'blur(8px)',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>

            <motion.a
              href={VERSE_VERSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '18px 36px', borderRadius: 18,
                background: 'linear-gradient(135deg, #2DD4BF, #14B8A6)',
                color: '#042F2E', fontWeight: 800, fontSize: '1.05rem',
                textDecoration: 'none', boxShadow: '0 15px 35px rgba(20,184,166,0.35)',
              }}
            >
              † Open Verse Verse — Free
            </motion.a>
            <p style={{ marginTop: 20, fontSize: '.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
              NIV · ESV · KJV · Works offline · No app store required
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── HomeSchool Hub CTA ────────────────────────────────────────────────────────
function HomeSchoolHubCTA() {
  return (
    <section style={{ padding: '100px 24px', background: 'white', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
            borderRadius: 32,
            padding: '80px 40px',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(6,78,59,0.25)',
          }}
        >
          {/* Animated floating icons */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: 40, left: '10%', fontSize: '3rem', opacity: 0.2 }}
          >
            📚
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{ position: 'absolute', bottom: 40, right: '10%', fontSize: '3rem', opacity: 0.2 }}
          >
            ✏️
          </motion.div>

          <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <span style={{
              display: 'inline-block', fontSize: '.75rem', fontWeight: 800,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: '#34D399', background: 'rgba(52,211,153,0.1)',
              padding: '8px 20px', borderRadius: 100, marginBottom: 24,
              border: '1.5px solid rgba(52,211,153,0.2)',
            }}>
              Introducing the HomeSchool Hub
            </span>
            
            <h2 style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 800, color: 'white', marginBottom: 20, lineHeight: 1.1,
            }}>
              Your Complete Partner in <span style={{ color: '#34D399' }}>Bible-Based</span> Home Education
            </h2>
            
            <p style={{
              fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.7, marginBottom: 40, fontWeight: 500,
            }}>
              Take your homeschooling to the next level with our all-in-one resource center. 
              From daily lesson plans to interactive curriculum, we provide everything you 
              need to raise kids who love God and His Word.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.a
                href="https://homeschool.biblefunland.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '18px 36px', borderRadius: 18,
                  background: 'white', color: '#064E3B',
                  fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                }}
              >
                🏠 Visit HomeSchool Hub
              </motion.a>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '18px 32px', borderRadius: 18,
                  background: 'rgba(255,255,255,0.1)', color: 'white',
                  fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer'
                }}
              >
                ✨ Learn More
              </motion.div>
            </div>

            <div style={{ 
              marginTop: 48, 
              display: 'flex', 
              gap: 32, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              opacity: 0.8
            }}>
              {['Full Curriculum', 'Daily Plans', 'Printable Resources'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 600 }}>
                  <span style={{ color: '#34D399', fontSize: '1.2rem' }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
