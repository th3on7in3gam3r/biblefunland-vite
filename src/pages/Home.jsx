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
          DISCOVER SCRIPTURE EXPLORER
      ══════════════════════════════════════════ */}
      <section 
        style={{ 
          padding: '100px 24px', 
          background: '#FFFBF0', // earth-cream
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ 
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#82917F', // earth-sage
              marginBottom: 12
            }}>
              Unfold the Word
            </span>
            <h2 style={{ 
              fontFamily: "'Baloo 2', cursive",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#4D3A2B', // earth-brown
              lineHeight: 1.1
            }}>
              Discover Scripture Explorer
            </h2>
          </div>

          <div 
            style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 32,
              position: 'relative'
            }}
          >
            {[
              {
                title: 'Virtual Bible World',
                desc: 'Immerse yourself in 3D Bible lands and stories',
                icon: '🌍',
                bg: '#F5F1E6', // earth-beige
                accent: '#C05C33', // terracotta
                to: '/explore/world'
              },
              {
                title: 'Voice Bible Reader',
                desc: "Listen to God's Word beautifully narrated",
                icon: '🎙️',
                bg: '#F1F3FA', // light mist
                accent: '#9EB7C2', // misty blue
                to: '/explore/voice-reader'
              },
              {
                title: 'Bible Timeline',
                desc: 'Explore the full story of Scripture through history',
                icon: '📜',
                bg: '#FFF7ED', // warm cream
                accent: '#D4AF37', // gold
                to: '/explore/timeline'
              },
              {
                title: 'Prayer Wall',
                desc: 'Share prayers and lift each other up (moderated for families)',
                icon: '🌍',
                bg: '#ECFDF5', // sage light
                accent: '#82917F', // sage
                to: '/prayer'
              },
              {
                title: 'Kids Mode',
                desc: 'Safe, joyful, faith-building adventures for children',
                icon: '🎨',
                bg: '#FFFBEB', // joy light
                accent: '#FBBF24', // joy gold
                to: '/kids'
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.03, 
                  y: -8,
                  boxShadow: `0 20px 40px -10px ${card.accent}33`
                }}
                style={{
                  background: card.bg,
                  borderRadius: 24,
                  padding: 40,
                  border: `1.5px solid ${card.accent}15`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  cursor: 'pointer',
                  position: 'sticky',
                  top: 100 + (i * 20), // staggered sticky effect
                  zIndex: i,
                  height: '100%',
                  minHeight: 280,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  transition: 'background 0.3s'
                }}
              >
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: 20,
                  background: card.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  boxShadow: `0 8px 16px ${card.accent}44`
                }}>
                  {card.icon}
                </div>
                <div>
                  <h3 style={{ 
                    fontFamily: "'Baloo 2', cursive", 
                    fontSize: '1.5rem', 
                    color: '#4D3A2B',
                    marginBottom: 8
                  }}>
                    {card.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.95rem', 
                    color: '#6D5A4B',
                    lineHeight: 1.6,
                    fontWeight: 500
                  }}>
                    {card.desc}
                  </p>
                </div>
                <Link 
                  to={card.to} 
                  style={{ 
                    marginTop: 'auto',
                    color: card.accent,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  Explore Now <span>→</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Decorative background element */}
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          fontSize: '20rem',
          opacity: 0.03,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0
        }}>
          🕊️
        </div>
      </section>

      {/* ══════════════════════════════════════════
          JOURNEY CARDS
      ══════════════════════════════════════════ */}
      <JourneyCards />

      {/* ══════════════════════════════════════════
          FILTERS
      ══════════════════════════════════════════ */}
      <section style={{ padding: '60px 24px', background: 'white' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '.72rem',
                fontWeight: 800,
                letterSpacing: '.5px',
                textTransform: 'uppercase',
                padding: '5px 14px',
                borderRadius: 100,
                background: '#EFF6FF',
                color: '#3B82F6',
                marginBottom: 12,
              }}
            >
              🧰 Filter Resources
            </div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: 'clamp(1.6rem,3.5vw,2.4rem)',
                fontWeight: 800,
                color: '#1E1B4B',
                marginBottom: 8,
              }}
            >
              Show games, sheets, and AI tools by category
            </h2>
            <p style={{ color: '#6B7280', fontSize: '.9rem' }}>
              Use filters to find the exact learning resource you want
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              style={{
                minWidth: 160,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #D1D5DB',
                fontSize: '.9rem',
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
                minWidth: 180,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #D1D5DB',
                fontSize: '.9rem',
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
                minWidth: 170,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #D1D5DB',
                fontSize: '.9rem',
              }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
              gap: 16,
            }}
          >
            {AGE_GROUPS.map((ag) => {
              const active = ageFilter === ag.label;
              return (
                <button
                  key={ag.label}
                  onClick={() => setAgeFilter(active ? 'All' : ag.label)}
                  style={{
                    padding: '25px 18px',
                    borderRadius: 18,
                    border: `2.5px solid ${active ? ag.color : '#E5E7EB'}`,
                    background: active ? ag.bg : 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all .2s',
                    boxShadow: active ? `0 8px 24px ${ag.color}30` : '0 2px 8px rgba(0,0,0,.04)',
                  }}
                >
                  <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>{ag.emoji}</div>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: ag.color,
                      marginBottom: 4,
                    }}
                  >
                    {ag.label}
                  </div>
                  <div style={{ fontSize: '.75rem', color: '#9CA3AF', fontWeight: 600 }}>
                    Ages {ag.age}
                  </div>
                </button>
              );
            })}
          </div>

          {(ageFilter !== 'All' || topicFilter !== 'All' || typeFilter !== 'All') && (
            <div
              style={{ textAlign: 'center', marginTop: 18, color: '#4B5563', fontSize: '.83rem' }}
            >
              Showing: {ageFilter}, {topicFilter}, {typeFilter}.
              <button
                onClick={() => {
                  setAgeFilter('All');
                  setTopicFilter('All');
                  setTypeFilter('All');
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#3B82F6',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginLeft: 6,
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STREAK + VERSE
      ══════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 60px', background: 'white' }}>
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1.6fr',
            gap: 20,
            alignItems: 'stretch',
          }}
          className="home-grid-streak"
        >
          {/* Streak */}
          <div
            className="reveal"
            style={{
              background: 'linear-gradient(135deg,#1C1305,#2D1E00)',
              borderRadius: 24,
              border: '1.5px solid rgba(249,115,22,.2)',
              padding: '32px 28px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '3.5rem',
                lineHeight: 1,
                marginBottom: 8,
                filter: 'drop-shadow(0 0 16px rgba(251,191,36,.5))',
                animation: streak > 0 ? 'flame 1.5s ease-in-out infinite' : 'none',
              }}
            >
              🔥
            </div>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '4rem',
                fontWeight: 800,
                color: '#FCD34D',
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {streak}
            </div>
            <div
              style={{
                fontSize: '.78rem',
                fontWeight: 700,
                color: 'rgba(252,211,77,.6)',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Day Streak
            </div>
            <button
              onClick={checkIn}
              disabled={checkedToday}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 14,
                border: 'none',
                background: checkedToday
                  ? 'rgba(255,255,255,.07)'
                  : 'linear-gradient(135deg,#F97316,#FBBF24)',
                color: checkedToday ? 'rgba(255,255,255,.35)' : 'white',
                fontFamily: 'Poppins,sans-serif',
                fontSize: '.86rem',
                fontWeight: 800,
                cursor: checkedToday ? 'default' : 'pointer',
                transition: 'all .2s',
              }}
            >
              {checkedToday ? '✅ Checked In Today!' : '✅ Check In Today'}
            </button>
            {!user && (
              <Link
                to="/auth"
                style={{
                  marginTop: 10,
                  fontSize: '.72rem',
                  color: 'rgba(252,211,77,.5)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                🔐 Sign in to save your streak
              </Link>
            )}
          </div>
          {/* Verse of the Day */}
          <div
            className="reveal"
            style={{
              background: 'linear-gradient(135deg,#0D1B2A,#1E1B4B)',
              borderRadius: 24,
              border: '1.5px solid rgba(99,102,241,.2)',
              padding: '32px 36px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                fontSize: '9rem',
                opacity: 0.04,
                lineHeight: 1,
                userSelect: 'none',
                fontFamily: 'Georgia,serif',
              }}
            >
              "
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '.68rem',
                fontWeight: 800,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                background: 'rgba(252,211,77,.12)',
                color: '#FCD34D',
                border: '1px solid rgba(252,211,77,.2)',
                padding: '4px 12px',
                borderRadius: 100,
                marginBottom: 18,
              }}
            >
              ☀️ Verse of the Day
            </div>
            <p
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: 'clamp(1rem,2.2vw,1.3rem)',
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.6,
                fontStyle: 'italic',
                marginBottom: 16,
              }}
            >
              "{todayVerse.text}"
            </p>
            <div
              style={{
                fontSize: '.84rem',
                fontWeight: 700,
                color: 'rgba(165,180,252,.7)',
                marginBottom: 20,
              }}
            >
              — {todayVerse.ref}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                to="/voice-reader"
                style={{
                  fontSize: '.76rem',
                  fontWeight: 700,
                  padding: '7px 16px',
                  borderRadius: 10,
                  background: 'rgba(99,102,241,.2)',
                  color: '#A5B4FC',
                  border: '1px solid rgba(99,102,241,.2)',
                  textDecoration: 'none',
                }}
              >
                🎙️ Read Aloud
              </Link>
              <Link
                to="/share"
                style={{
                  fontSize: '.76rem',
                  fontWeight: 700,
                  padding: '7px 16px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,.07)',
                  color: 'rgba(255,255,255,.7)',
                  border: '1px solid rgba(255,255,255,.1)',
                  textDecoration: 'none',
                }}
              >
                🔗 Share Card
              </Link>
              <Link
                to="/devotional"
                style={{
                  fontSize: '.76rem',
                  fontWeight: 700,
                  padding: '7px 16px',
                  borderRadius: 10,
                  background: 'rgba(168,85,247,.15)',
                  color: '#C084FC',
                  border: '1px solid rgba(168,85,247,.2)',
                  textDecoration: 'none',
                }}
              >
                🙏 Get Devotional
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SeasonalBanner season="easter" />

      {/* ══════════════════════════════════════════
          WEEKLY CHALLENGE
      ══════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 40px', background: 'white' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <WeeklyChallenge />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED PLAY & LEARN
      ══════════════════════════════════════════ */}
      <section style={{ padding: '60px 24px', background: '#F8FAFF' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '.72rem',
                fontWeight: 800,
                letterSpacing: '.5px',
                textTransform: 'uppercase',
                padding: '5px 14px',
                borderRadius: 100,
                background: '#EFF6FF',
                color: '#3B82F6',
                marginBottom: 12,
              }}
            >
              🎮 Play &amp; Learn
            </div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: 'clamp(1.6rem,3.5vw,2.4rem)',
                fontWeight: 800,
                color: '#1E1B4B',
                marginBottom: 8,
              }}
            >
              Featured Games &amp; Activities
            </h2>
            <p style={{ color: '#6B7280', fontSize: '.9rem' }}>
              Jump in and start learning God's Word through play
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
              gap: 18,
            }}
          >
            {filteredGames.length === 0 && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '26px',
                  color: '#6B7280',
                  textAlign: 'center',
                }}
              >
                No games found for selected filters.
              </div>
            )}
            {filteredGames.map((g, i) => (
              <div
                key={i}
                className="reveal"
                style={{
                  background: 'white',
                  borderRadius: 20,
                  border: '1.5px solid #E5E7EB',
                  overflow: 'hidden',
                  transition: 'all .25s',
                  transitionDelay: `${i * 0.05}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px ${g.color}20`;
                  e.currentTarget.style.borderColor = g.color + '55';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <div
                  style={{
                    height: 100,
                    background: `linear-gradient(135deg,${g.color}18,${g.color}08)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    position: 'relative',
                  }}
                >
                  {g.icon}
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontSize: '.62rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 99,
                      background: g.color,
                      color: 'white',
                    }}
                  >
                    {g.tag}
                  </span>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#1E1B4B',
                      marginBottom: 4,
                    }}
                  >
                    {g.title}
                  </div>
                  <p
                    style={{
                      fontSize: '.78rem',
                      color: '#6B7280',
                      lineHeight: 1.6,
                      marginBottom: 14,
                    }}
                  >
                    {g.desc}
                  </p>
                  <Link
                    to={g.to}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 18px',
                      borderRadius: 10,
                      background: g.color,
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '.8rem',
                      textDecoration: 'none',
                      transition: 'all .2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '.85')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    {g.tag === 'Print' ? '🖨️ Print' : '▶ Play Now'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link
              to="/trivia"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                borderRadius: 14,
                background: '#1E1B4B',
                color: 'white',
                fontWeight: 700,
                fontSize: '.88rem',
                textDecoration: 'none',
              }}
            >
              See All Games →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          AI FUN SPOTLIGHT
      ══════════════════════════════════════════ */}
      <section
        style={{
          padding: '60px 24px',
          background: 'linear-gradient(135deg,#1E1B4B,#312E81,#1E1B4B)',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '.72rem',
                fontWeight: 800,
                letterSpacing: '.5px',
                textTransform: 'uppercase',
                padding: '5px 14px',
                borderRadius: 100,
                background: 'rgba(168,85,247,.2)',
                color: '#C084FC',
                marginBottom: 12,
              }}
            >
              🤖 AI Fun
            </div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: 'clamp(1.6rem,3.5vw,2.4rem)',
                fontWeight: 800,
                color: 'white',
                marginBottom: 8,
              }}
            >
              Powered by AI, Grounded in Scripture
            </h2>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem' }}>
              Experience the Bible like never before
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
              gap: 16,
            }}
          >
            {filteredAiTools.length === 0 && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '22px',
                  color: '#6B7280',
                  textAlign: 'center',
                }}
              >
                No AI tools match your filters.
              </div>
            )}
            {filteredAiTools.map((t, i) => (
              <Link
                key={i}
                to={t.to}
                className="reveal"
                style={{ textDecoration: 'none', transitionDelay: `${i * 0.06}s` }}
              >
                <div
                  style={{
                    borderRadius: 20,
                    border: `1.5px solid ${t.color}33`,
                    background: `linear-gradient(135deg,${t.color}12,${t.color}06)`,
                    padding: '28px 22px',
                    transition: 'all .25s',
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 16px 40px ${t.color}25`;
                    e.currentTarget.style.borderColor = t.color + '66';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = t.color + '33';
                  }}
                >
                  <div style={{ fontSize: '2.4rem', marginBottom: 14 }}>{t.icon}</div>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'white',
                      marginBottom: 8,
                    }}
                  >
                    {t.title}
                  </div>
                  <p
                    style={{
                      fontSize: '.78rem',
                      color: 'rgba(255,255,255,.5)',
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}
                  >
                    {t.desc}
                  </p>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: t.color }}>
                    Try it free →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOR PARENTS & TEACHERS
      ══════════════════════════════════════════ */}
      <section style={{ padding: '60px 24px', background: 'white' }}>
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
            alignItems: 'center',
          }}
          className="home-grid-2"
        >
          <div className="reveal">
            <div
              style={{
                display: 'inline-block',
                fontSize: '.72rem',
                fontWeight: 800,
                letterSpacing: '.5px',
                textTransform: 'uppercase',
                padding: '5px 14px',
                borderRadius: 100,
                background: '#ECFDF5',
                color: '#10B981',
                marginBottom: 16,
              }}
            >
              🏫 For Parents &amp; Teachers
            </div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: 'clamp(1.6rem,3.5vw,2.4rem)',
                fontWeight: 800,
                color: '#1E1B4B',
                marginBottom: 14,
                lineHeight: 1.2,
              }}
            >
              Raise the Next Generation in Faith
            </h2>
            <p style={{ color: '#6B7280', lineHeight: 1.75, marginBottom: 24, fontSize: '.9rem' }}>
              Track your child's progress, assign reading plans, set parental controls, generate AI
              lesson plans, and get weekly email digests — all in one hub.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {[
                '👶 Child Profiles',
                '📊 Progress Tracking',
                '📋 Lesson Plans',
                '🔒 PIN Controls',
                '🏆 Challenges',
                '📧 Email Digest',
              ].map((tag, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '.68rem',
                    fontWeight: 700,
                    padding: '4px 11px',
                    borderRadius: 100,
                    background: '#ECFDF5',
                    color: '#10B981',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              to="/parent-hub"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 28px',
                borderRadius: 14,
                background: 'linear-gradient(135deg,#10B981,#34D399)',
                color: 'white',
                fontWeight: 800,
                fontSize: '.9rem',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(16,185,129,.3)',
              }}
            >
              Open the Hub →
            </Link>
          </div>
          <div
            className="reveal"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            {[
              {
                icon: '📋',
                title: 'Lesson Plans',
                desc: 'AI-generated age-appropriate lessons',
                color: '#3B82F6',
              },
              {
                icon: '👶',
                title: 'Child Profiles',
                desc: 'Track streaks, badges & quiz scores',
                color: '#EC4899',
              },
              {
                icon: '🏆',
                title: 'Family Challenges',
                desc: 'Weekly scripture challenges together',
                color: '#F59E0B',
              },
              {
                icon: '🎓',
                title: 'Classroom Tools',
                desc: 'Assign & monitor reading plans',
                color: '#8B5CF6',
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 16,
                  border: `1.5px solid ${f.color}20`,
                  background: `linear-gradient(135deg,${f.color}08,transparent)`,
                  padding: '18px 16px',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = f.color + '44';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = f.color + '20';
                  e.currentTarget.style.transform = '';
                }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{f.icon}</div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '.88rem',
                    fontWeight: 800,
                    color: '#1E1B4B',
                    marginBottom: 4,
                  }}
                >
                  {f.title}
                </div>
                <div style={{ fontSize: '.72rem', color: '#9CA3AF', lineHeight: 1.5 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMMUNITY HIGHLIGHTS
      ══════════════════════════════════════════ */}
      <section style={{ padding: '60px 24px', background: '#F8FAFF' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '.72rem',
                fontWeight: 800,
                letterSpacing: '.5px',
                textTransform: 'uppercase',
                padding: '5px 14px',
                borderRadius: 100,
                background: '#ECFDF5',
                color: '#10B981',
                marginBottom: 12,
              }}
            >
              🤝 Community
            </div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: 'clamp(1.6rem,3.5vw,2.4rem)',
                fontWeight: 800,
                color: '#1E1B4B',
                marginBottom: 8,
              }}
            >
              You're Not Alone in This
            </h2>
            <p style={{ color: '#6B7280', fontSize: '.9rem' }}>
              Real-time prayer, leaderboards, family groups, and church events
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))',
              gap: 16,
            }}
          >
            {COMMUNITY.map((c, i) => (
              <Link
                key={i}
                to={c.to}
                className="reveal"
                style={{ textDecoration: 'none', transitionDelay: `${i * 0.06}s` }}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: 20,
                    border: '1.5px solid #E5E7EB',
                    padding: '24px 18px',
                    textAlign: 'center',
                    transition: 'all .25s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = c.color + '55';
                    e.currentTarget.style.boxShadow = `0 12px 32px ${c.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{c.icon}</div>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '.95rem',
                      fontWeight: 800,
                      color: '#1E1B4B',
                      marginBottom: 6,
                    }}
                  >
                    {c.title}
                  </div>
                  <div style={{ fontSize: '.75rem', color: '#9CA3AF', lineHeight: 1.55 }}>
                    {c.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <TestimonialsCarousel />

      {/* ══════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 60px', background: 'white' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <NewsletterSignup />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SEASONAL MARKETING HOOK
      ══════════════════════════════════════════ */}
      {seasonalHook && (
        <section style={{ padding: '0 24px 40px', background: 'white' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div
              className="reveal"
              style={{
                background: seasonalHook.bg,
                borderRadius: 20,
                padding: '28px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '.7rem',
                    fontWeight: 800,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.5)',
                    marginBottom: 6,
                  }}
                >
                  {seasonalHook.headline}
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: 4,
                  }}
                >
                  {seasonalHook.subline}
                </div>
                <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)' }}>
                  Earn {seasonalHook.points} points + {seasonalHook.badge.emoji}{' '}
                  {seasonalHook.badge.label} badge
                </div>
              </div>
              <Link
                to={seasonalHook.cta.to}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,.15)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '.88rem',
                  textDecoration: 'none',
                  border: '1.5px solid rgba(255,255,255,.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                {seasonalHook.cta.label} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          INVITE FAMILY
      ══════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 60px', background: 'white' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <InviteFamily />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRO CTA
      ══════════════════════════════════════════ */}
      <section
        style={{
          padding: '72px 24px',
          background: 'linear-gradient(135deg,#0F0F1A,#1A0533,#0A1A0F)',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div
            className="reveal"
            style={{
              background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(168,85,247,.08))',
              borderRadius: 32,
              border: '1.5px solid rgba(139,92,246,.2)',
              padding: '52px 44px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                fontSize: '10rem',
                opacity: 0.04,
              }}
            >
              💎
            </div>
            <div style={{ fontSize: '3rem', marginBottom: 14 }}>💎</div>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: 'clamp(1.6rem,4vw,2.6rem)',
                fontWeight: 800,
                color: 'white',
                marginBottom: 10,
              }}
            >
              Go Pro — Remove Ads Forever
            </h2>
            <p
              style={{
                fontSize: '.9rem',
                color: 'rgba(255,255,255,.5)',
                fontWeight: 500,
                lineHeight: 1.75,
                marginBottom: 28,
                maxWidth: 460,
                margin: '0 auto 28px',
              }}
            >
              Ad-free experience, priority AI access, exclusive games, family dashboard, and full
              Bible certification courses. From $3.99/month.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/premium"
                style={{
                  padding: '14px 32px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
                  color: 'white',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 800,
                  fontSize: '.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 28px rgba(139,92,246,.35)',
                }}
              >
                ✨ See Pro Plans
              </Link>
              {user ? (
                <Link
                  to="/dashboard"
                  style={{
                    padding: '14px 28px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,.07)',
                    color: 'rgba(255,255,255,.7)',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 700,
                    fontSize: '.9rem',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,.12)',
                  }}
                >
                  📊 My Dashboard
                </Link>
              ) : (
                <Link
                  to="/auth"
                  style={{
                    padding: '14px 28px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,.07)',
                    color: 'rgba(255,255,255,.7)',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 700,
                    fontSize: '.9rem',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,.12)',
                  }}
                >
                  🔐 Sign In / Free Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes floatP{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-18px) rotate(3deg)}66%{transform:translateY(-8px) rotate(-2deg)}}
        @keyframes flame{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.08) rotate(2deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 6px #4ADE80}50%{box-shadow:0 0 16px #4ADE80,0 0 30px #4ADE80}}
        .reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
        .reveal.in{opacity:1;transform:translateY(0)}
        @media(max-width:640px){
          .home-grid-streak{grid-template-columns:1fr!important}
          .home-grid-2{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}
