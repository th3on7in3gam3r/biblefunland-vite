import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useStreak } from '../context/StreakContext';
import { useKidsMode } from '../context/KidsModeContext';
import { useChildSwitcher } from '../context/ChildSwitcherContext';
import { useAuth } from '../context/AuthContext';
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
    <div style={{ background: '#FAFBFF', fontFamily: 'Poppins,sans-serif', overflowX: 'hidden' }}>
      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '80px 24px 60px',
          textAlign: 'center',
          background: 'linear-gradient(135deg,#1E1B4B 0%,#312E81 30%,#0F172A 60%,#064E3B 100%)',
        }}
      >
        {/* Animated blobs */}
        {[
          ['#60A5FA', '15%', '10%'],
          ['#F472B6', '80%', '20%'],
          ['#34D399', '10%', '70%'],
          ['#FCD34D', '75%', '75%'],
        ].map(([c, l, t], i) => (
          <motion.div
            key={i}
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            transition={{ delay: i * 0.2, duration: 1.2 }}
            style={{
              position: 'absolute',
              width: 300 + i * 80,
              height: 300 + i * 80,
              borderRadius: '50%',
              background: `radial-gradient(circle,${c}22 0%,transparent 70%)`,
              left: l,
              top: t,
              pointerEvents: 'none',
              animation: `floatP ${6 + i * 2}s ease-in-out ${i * -1.5}s infinite`,
            }}
          />
        ))}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '.72rem',
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              background: 'rgba(99,102,241,.2)',
              color: '#A5B4FC',
              border: '1px solid rgba(99,102,241,.3)',
              padding: '6px 18px',
              borderRadius: 100,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#4ADE80',
                boxShadow: '0 0 8px #4ADE80',
                display: 'inline-block',
              }}
            />
            60+ Features · AI-Powered · 100% Free
          </motion.div>

          {/* Title — staggered words */}
          <motion.h1
            variants={stagger}
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(2.8rem,8vw,5.5rem)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.05,
              marginBottom: 20,
            }}
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              style={{ display: 'inline-block', marginRight: '0.25em' }}
            >
              Where
            </motion.span>
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              style={{ display: 'inline-block', marginRight: '0.25em' }}
            >
              Faith
            </motion.span>
            <br />
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
              style={{
                display: 'inline-block',
                background: 'linear-gradient(90deg,#60A5FA,#C084FC,#F472B6,#FCD34D,#34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Meets Fun
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: 'clamp(.95rem,2vw,1.15rem)',
              color: 'rgba(255,255,255,.6)',
              fontWeight: 500,
              lineHeight: 1.75,
              marginBottom: 40,
              maxWidth: 560,
              margin: '0 auto 40px',
            }}
          >
            Interactive Bible learning for kids &amp; families — games, AI devotionals, prayer, and
            so much more. Completely free.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={stagger}
            style={{
              display: 'flex',
              gap: 14,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 32,
            }}
          >
            <motion.div
              variants={btnVariant}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -3 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            >
              <Link
                to="/trivia"
                onClick={() => trackHeroCta('click')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 30px rgba(99,102,241,.5)',
                }}
              >
                {heroCta === 'ai_fun'
                  ? '✨ Try AI Fun'
                  : heroCta === 'streak'
                    ? '🔥 Start Your Streak'
                    : '🎮 Start Playing Games'}
              </Link>
            </motion.div>

            <motion.div
              variants={btnVariant}
              whileHover={prefersReducedMotion ? {} : { scale: 1.04, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            >
              <Link
                to="/devotional"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,.1)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  border: '1.5px solid rgba(255,255,255,.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                🙏 Try AI Devotional
              </Link>
            </motion.div>

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
                  padding: '14px 28px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg,#F59E0B,#F97316)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(245,158,11,.4)',
                }}
              >
                {proLabel || '💎 Go Pro'}
              </Link>
            </motion.div>

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
                    padding: '14px 28px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,.08)',
                    color: 'rgba(255,255,255,.85)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textDecoration: 'none',
                    border: '1.5px solid rgba(255,255,255,.18)',
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
            style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {[
              '🌍 Prayer Map',
              '📿 Prayer Beads',
              '🏃 Scripture Runner',
              '🎰 Spin the Verse',
              '🧩 Escape Room',
              '🎓 Certification',
            ].map((p, i) => (
              <motion.span
                key={i}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.06, duration: 0.35 }}
                style={{
                  fontSize: '.7rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: 100,
                  background: 'rgba(255,255,255,.07)',
                  color: 'rgba(255,255,255,.5)',
                  border: '1px solid rgba(255,255,255,.1)',
                }}
              >
                {p}
              </motion.span>
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
                    fontSize: '1.6rem',
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
          QUICK START
      ══════════════════════════════════════════ */}
      <QuickStart user={user} todayVerse={todayVerse} />

      {/* ══════════════════════════════════════════
          FOR PARENTS & TEACHERS
      ══════════════════════════════════════════ */}
      <ParentsSection />

      {/* ══════════════════════════════════════════
          NEWSLETTER + PRO CTA
      ══════════════════════════════════════════ */}
      <section style={{ padding: '60px 24px', background: 'white' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <NewsletterSignup />
        </div>
      </section>

      <ProCta user={user} />

      <style>{`
        @keyframes floatP{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-18px) rotate(3deg)}66%{transform:translateY(-8px) rotate(-2deg)}}
        .reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
        .reveal.in{opacity:1;transform:translateY(0)}
      `}</style>
    </div>
  );
}

// ── Quick Start Section ───────────────────────────────────────────────────────
function QuickStart({ user, todayVerse }) {
  const QUICK_CARDS = [
    {
      icon: '🎮',
      title: 'Start Playing Games',
      desc: 'Fun Bible games for all ages — trivia, runners, escape rooms & more',
      to: '/play',
      color: '#3B82F6',
      bg: '#EFF6FF',
    },
    {
      icon: '🙏',
      title: 'Try AI Devotional',
      desc: 'Get a personalized devotional in seconds, powered by AI',
      to: '/devotional',
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
    {
      icon: '🌍',
      title: 'Explore Virtual Bible World',
      desc: 'Walk through 3D Bible lands and immerse yourself in Scripture',
      to: '/explore/world',
      color: '#C05C33',
      bg: '#FFF7ED',
    },
    {
      icon: '📖',
      title: 'Verse of the Day',
      desc: todayVerse ? `"${todayVerse.text.slice(0, 80)}…" — ${todayVerse.ref}` : 'A fresh verse every day to inspire your walk',
      to: '/explore/bible',
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      icon: '🌍',
      title: 'Quick Prayer',
      desc: 'Join thousands praying together on the live Prayer Wall',
      to: '/prayer',
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
  ];

  return (
    <section style={{ padding: '80px 24px 60px', background: '#FAFBFF' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block', fontSize: '.72rem', fontWeight: 800,
            letterSpacing: '1px', textTransform: 'uppercase',
            color: '#3B82F6', background: '#EFF6FF',
            padding: '5px 14px', borderRadius: 100, marginBottom: 12,
          }}>
            Get Started
          </span>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800, color: '#1E1B4B', marginBottom: 10,
          }}>
            Where would you like to begin?
          </h2>
          <p style={{ color: '#6B7280', fontSize: '.95rem', maxWidth: 480, margin: '0 auto' }}>
            Everything is free. Pick what sounds fun and dive in.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {QUICK_CARDS.map((card, i) => (
            <Link key={card.to + i} to={card.to} style={{ textDecoration: 'none' }}>
              <motion.div
                className="reveal"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6, boxShadow: `0 16px 40px ${card.color}22` }}
                style={{
                  background: card.bg,
                  borderRadius: 20,
                  padding: '28px 24px',
                  border: `1.5px solid ${card.color}18`,
                  display: 'flex', flexDirection: 'column', gap: 12,
                  height: '100%', cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: card.color, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', boxShadow: `0 6px 16px ${card.color}44`,
                }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive", fontSize: '1.15rem',
                    fontWeight: 800, color: '#1E1B4B', marginBottom: 6,
                  }}>
                    {card.title}
                  </div>
                  <p style={{ fontSize: '.83rem', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                    {card.desc}
                  </p>
                </div>
                <div style={{
                  marginTop: 'auto', color: card.color,
                  fontWeight: 800, fontSize: '.8rem',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  Go →
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Parents & Teachers Section ────────────────────────────────────────────────
function ParentsSection() {
  const PARENT_FEATURES = [
    { icon: '👶', title: 'Child Profiles', desc: 'Create safe profiles for each child with age-appropriate content', to: '/parents' },
    { icon: '📊', title: 'Progress Reports', desc: 'Track reading streaks, quiz scores, and faith milestones', to: '/parents' },
    { icon: '🔒', title: 'Parental Controls', desc: 'Set time limits, content filters, and bedtime mode', to: '/parents' },
    { icon: '🏫', title: 'Teacher Tools', desc: 'Classroom management, activity sheets, and lesson plans', to: '/parents' },
  ];

  return (
    <section style={{ padding: '72px 24px', background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
          {/* Left: copy */}
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
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontWeight: 800, color: '#064E3B', marginBottom: 14, lineHeight: 1.15,
            }}>
              Built with families in mind
            </h2>
            <p style={{ color: '#065F46', fontSize: '.95rem', lineHeight: 1.75, marginBottom: 28, maxWidth: 420 }}>
              BibleFunLand gives parents and teachers the tools to guide kids through faith-based learning — safely, joyfully, and at their own pace.
            </p>
            <Link to="/parents" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 14,
              background: '#10B981', color: 'white',
              fontWeight: 800, fontSize: '.9rem', textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(16,185,129,.35)',
            }}>
              🏫 Go to Parents Hub →
            </Link>
          </div>

          {/* Right: feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {PARENT_FEATURES.map((f, i) => (
              <Link key={i} to={f.to} style={{ textDecoration: 'none' }}>
                <motion.div
                  className="reveal"
                  whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(16,185,129,.15)' }}
                  style={{
                    background: 'white', borderRadius: 16, padding: '20px 18px',
                    border: '1.5px solid #D1FAE5', cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#064E3B', marginBottom: 4 }}>{f.title}</div>
                  <p style={{ fontSize: '.75rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pro CTA ───────────────────────────────────────────────────────────────────
function ProCta({ user }) {
  return (
    <section style={{ padding: '72px 24px', background: 'linear-gradient(135deg,#0F0F1A,#1A0533,#0A1A0F)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
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
            Go Pro — Remove Ads Forever
          </h2>
          <p style={{
            fontSize: '.9rem', color: 'rgba(255,255,255,.5)',
            lineHeight: 1.75, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px',
          }}>
            Ad-free experience, priority AI access, exclusive games, family dashboard, and full Bible certification. From $3.99/month.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/premium" style={{
              padding: '14px 32px', borderRadius: 14,
              background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
              color: 'white', fontWeight: 800, fontSize: '.9rem',
              textDecoration: 'none', boxShadow: '0 8px 28px rgba(139,92,246,.35)',
            }}>
              ✨ See Pro Plans
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
