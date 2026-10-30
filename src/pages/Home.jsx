import { Link } from 'react-router-dom';
import { useKidsMode } from '../context/KidsModeContext';
import { useChildSwitcher } from '../context/ChildSwitcherContext';
import KidsDashboard from './KidsDashboard';
import StoryIcon from '../components/StoryIcon';
import { Chip, Sparkles } from '../components/StoryBits';
import { trackPulseEvent } from '../lib/pulse';
import '../styles/storybook.css';
import styles from './Home.module.css';

const img = (name) => `/home/${name}.webp`;

const STATS = [
  { icon: 'star', title: '80+ games', sub: 'Faith-filled and growing', chip: 'sun', filled: true },
  { icon: 'heart', title: '100% free', sub: 'Free for every family', chip: 'leaf', filled: true },
  { icon: 'gamepad', title: 'No subscriptions', sub: 'No paywalls, ever', chip: 'sky' },
  { icon: 'shield', title: 'Safe for kids', sub: 'PIN-protected Kids Mode', chip: 'grape' },
];

const GAMES = [
  {
    title: 'Scripture Runner',
    desc: 'An arcade-style dash through Scripture.',
    img: 'game-scripture-runner',
    alt: 'A boy running happily along a sunny hillside path',
    to: '/game/runner',
    tone: 'sun',
  },
  {
    title: 'David & Goliath',
    desc: "Step into one of the Bible's bravest stories.",
    img: 'game-david-goliath',
    alt: 'Young David with his sling facing the giant Goliath',
    to: '/game/david-goliath',
    tone: 'sky',
  },
  {
    title: 'Spin the Verse',
    desc: 'Spin the wheel and learn a new verse.',
    img: 'game-spin-the-verse',
    alt: 'Kids cheering around a rainbow prize wheel with an open Bible in the middle',
    to: '/game/spin-the-verse',
    tone: 'grape',
  },
  {
    title: 'Bible Trivia',
    desc: 'Test what you know, from Genesis to Revelation.',
    img: 'game-bible-trivia',
    alt: 'A smiling girl thinking, surrounded by colorful question marks and a light bulb',
    to: '/play/trivia',
    tone: 'leaf',
  },
];

const DEVOTIONAL_TOOLS = [
  {
    icon: 'bookHeart',
    label: 'Personalized family devotionals',
    chip: 'orange',
    to: '/ai/devotional',
  },
  { icon: 'chat', label: 'Chat with Bible characters', chip: 'sky', to: '/chat/characters' },
  { icon: 'palette', label: 'Scripture-inspired art', chip: 'grape', to: '/ai/miracle-art' },
  {
    icon: 'drama',
    label: 'Drama scripts for church and homeschool',
    chip: 'teal',
    to: '/ai/drama-scripts',
  },
  { icon: 'notebook', label: 'AI lesson plans and printables', chip: 'leaf', to: '/parents' },
  { icon: 'calendar', label: 'Reading plans for every age', chip: 'sun', to: '/devotional' },
];

const EXPLORE = [
  {
    title: 'Living Bible Map',
    desc: 'See where the stories happened.',
    img: 'explore-bible-map',
    alt: 'Watercolor parchment map of Bible lands with sea, rivers, hills and towns',
    to: '/explore/world',
    icon: 'mapPin',
    chip: 'sky',
  },
  {
    title: 'Interactive Timeline',
    desc: "Watch God's plan unfold from Creation to the early church.",
    img: 'explore-timeline',
    alt: 'An ancient walled city on a hill with a rainbow stepping-stone path leading toward it',
    to: '/explore/timeline',
    icon: 'clock',
    chip: 'grape',
  },
  {
    title: 'Family Tree',
    desc: 'Discover how people connect across generations.',
    img: 'explore-family-tree',
    alt: 'A big leafy tree holding round portraits of people from Bible times',
    to: '/family-tree',
    icon: 'users',
    chip: 'teal',
  },
];

const PARENT_FEATURES = [
  'Child profiles and progress tracking',
  'Parental controls and PIN-protected Kids Mode',
  'Safe time limits and age filters',
  'Weekly email digests',
  'Classroom tools, lesson plans and printables',
];

const COMMUNITY = [
  { icon: 'handHeart', label: 'Global prayer wall', chip: 'orange', to: '/prayer' },
  { icon: 'users', label: 'Family groups', chip: 'teal', to: '/community/family' },
  { icon: 'messageHeart', label: 'Chat rooms', chip: 'sky', to: '/community/chat' },
];

export default function Home() {
  const { kidsMode } = useKidsMode();
  const { isChildSession } = useChildSwitcher();

  if (kidsMode || isChildSession) return <KidsDashboard />;

  const track = (name, destination) => () => trackPulseEvent(name, { destination });

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>
            Free Bible games &amp; devotionals for kids and families
          </h1>
          <p className={styles.heroBody}>
            A free, interactive Bible learning platform for children, parents, Sunday school
            teachers, and homeschool families. Make God&apos;s Word engaging, memorable, and fun.
          </p>
          <div className={styles.heroActions}>
            <Link
              to="/play"
              className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
              onClick={track('cta_hero_start_journey', '/play')}
            >
              Play free Bible games
            </Link>
            <Link
              to="/devotional"
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLg}`}
              onClick={track('cta_hero_try_devotional', '/devotional')}
            >
              Try AI devotionals
            </Link>
          </div>
          <span className={`${styles.handNote} ${styles.heroNote}`}>
            <span>
              Games
              <StoryIcon name="heart" filled className={styles.noteHeart} />
            </span>
            <span>
              Faith
              <StoryIcon name="heart" filled className={styles.noteHeart} />
            </span>
            <span>Family</span>
          </span>
        </div>
        <div className={styles.heroArt}>
          <img
            src={img('hero-noahs-ark')}
            alt="Storybook illustration of Noah's ark on the waves under a rainbow, with an elephant, lion, giraffe, monkey and zebra looking out"
            width="1400"
            height="1050"
            fetchpriority="high"
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────────── */}
      <section className={styles.trust} aria-label="Why families love BibleFunLand">
        <div className={styles.container}>
          <div className={styles.trustGrid}>
            {STATS.map((s) => (
              <div key={s.title} className={styles.trustItem}>
                <Chip icon={s.icon} tone={s.chip} size="lg" filled={s.filled} />
                <div>
                  <p className={styles.trustTitle}>{s.title}</p>
                  <p className={styles.trustSub}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Games ────────────────────────────────────── */}
      <section className={styles.section} id="games">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <Sparkles />
            <h2 className={styles.h2}>Bible games kids love</h2>
            <p className={styles.lead}>
              Arcade-style games rooted in Scripture that bring Bible stories, heroes, and themes to
              life from Genesis through Revelation.
            </p>
          </div>
          <div className={styles.gameGrid}>
            {GAMES.map((g) => (
              <div
                key={g.title}
                className={`${styles.card} ${styles.gameCard} ${styles[`top_${g.tone}`]}`}
              >
                <img
                  src={img(g.img)}
                  alt={g.alt}
                  width="900"
                  height="675"
                  loading="lazy"
                  className={styles.gameImg}
                />
                <div className={styles.gameBody}>
                  <h3 className={styles.h3}>{g.title}</h3>
                  <p className={styles.gameDesc}>{g.desc}</p>
                  <Link
                    to={g.to}
                    aria-label={`Play ${g.title}`}
                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                  >
                    Play now
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.more}>
            <p>
              Plus Parable Escape Room and dozens more, with streaks, badges, and a friendly
              leaderboard.
            </p>
            <Link to="/play" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnMd}`}>
              See all 80+ games
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI devotionals ───────────────────────────── */}
      <section className={`${styles.split} ${styles.devotionals}`} id="devotionals">
        <div className={styles.splitCopy}>
          <h2 className={`${styles.h2} ${styles.left}`}>AI devotionals for every curious heart</h2>
          <p className={styles.splitBody}>
            Generate personalized family devotionals, chat with Bible characters, and create
            scripture-inspired art. Parents and teachers save time with lesson plans, printables,
            and reading plans for every age from preschool through tweens.
          </p>
          <div className={styles.tools}>
            {DEVOTIONAL_TOOLS.map((t) => (
              <Link key={t.label} to={t.to} className={styles.tool}>
                <Chip icon={t.icon} tone={t.chip} size="sm" />
                <span>{t.label}</span>
              </Link>
            ))}
          </div>
          <Link
            to="/devotional"
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnMd} ${styles.splitCta}`}
            onClick={track('cta_home_devotional', '/devotional')}
          >
            Try AI devotionals
          </Link>
        </div>
        <div className={styles.splitArt}>
          <img
            src={img('devotional-open-bible')}
            alt="Watercolor open Bible on a wooden table with sunrise light, leafy plants and a mug"
            width="1400"
            height="788"
            loading="lazy"
            className={`${styles.fadeImg} ${styles.fadeDevotional}`}
          />
          <span className={`${styles.handNote} ${styles.noteBigQuestions}`}>
            Big questions, bright answers
          </span>
        </div>
      </section>

      {/* ── Explore ──────────────────────────────────── */}
      <section className={styles.section} id="explore">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <Sparkles />
            <h2 className={styles.h2}>Explore the Bible</h2>
            <p className={styles.lead}>
              Kids and grown-ups can picture where stories happened, how people connect, and how
              God&apos;s plan unfolds.
            </p>
          </div>
          <div className={styles.exploreGrid}>
            {EXPLORE.map((e) => (
              <Link key={e.title} to={e.to} className={`${styles.card} ${styles.exploreCard}`}>
                <img
                  src={img(e.img)}
                  alt={e.alt}
                  width="900"
                  height="598"
                  loading="lazy"
                  className={styles.exploreImg}
                />
                <div className={styles.exploreBody}>
                  <Chip icon={e.icon} tone={e.chip} />
                  <div className={styles.exploreText}>
                    <h3 className={`${styles.h3} ${styles.left} ${styles.h3Sm}`}>{e.title}</h3>
                    <p>{e.desc}</p>
                  </div>
                  <span className={styles.arrow}>
                    <StoryIcon name="arrowRight" size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className={styles.alsoInside}>
            Also inside: a <Link to="/explore/voice-reader">voice Bible reader</Link> and a{' '}
            <Link to="/explore/bible">book-by-book explorer</Link>.
          </p>
        </div>
      </section>

      {/* ── Parents & teachers ───────────────────────── */}
      <section className={`${styles.split} ${styles.parents}`} id="parents">
        <div className={styles.splitCopy}>
          <h2 className={`${styles.h2} ${styles.left}`}>
            For parents, teachers and homeschool families
          </h2>
          <p className={styles.splitBody}>
            The Parents &amp; Teachers Hub helps you set safe limits, follow each child&apos;s
            progress, and celebrate milestones as your family grows in faith together.
          </p>
          <ul className={styles.checks}>
            {PARENT_FEATURES.map((f) => (
              <li key={f}>
                <span className={styles.checkDot}>
                  <StoryIcon name="check" size={16} strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/parents"
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnMd} ${styles.splitCta}`}
          >
            Visit the Parents &amp; Teachers Hub
          </Link>
        </div>
        <div className={styles.splitArt}>
          <img
            src={img('parents-family-tablet')}
            alt="A mother and her two children smiling at a tablet showing a rainbow"
            width="1400"
            height="1050"
            loading="lazy"
            className={`${styles.fadeImg} ${styles.fadeParents}`}
          />
          <span className={`${styles.handNote} ${styles.underlined} ${styles.noteGrowing}`}>
            Growing in faith together
          </span>
        </div>
      </section>

      {/* ── Podcast + community ──────────────────────── */}
      <section className={`${styles.section} ${styles.podcastBand}`} id="podcast">
        <div className={styles.container}>
          <div className={styles.podcastGrid}>
            <div>
              <h2 className={`${styles.h2} ${styles.left}`}>Faith &amp; Adventure podcast</h2>
              <p className={styles.podcastBody}>
                Bible stories kids remember, perfect for car rides, bedtime, and Sunday school prep.
              </p>
              <Link
                to="/podcast"
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnMd}`}
                onClick={track('cta_home_podcast', '/podcast')}
              >
                Listen to the podcast
              </Link>
            </div>
            <div className={styles.podcastArt}>
              <img
                src={img('podcast-mic-headphones')}
                alt="Watercolor microphone and purple headphones with music notes"
                width="900"
                height="675"
                loading="lazy"
              />
              <span className={`${styles.handNote} ${styles.noteStories}`}>
                Stories kids remember
              </span>
            </div>
          </div>

          <div className={`${styles.card} ${styles.community}`}>
            <h3 className={`${styles.h3} ${styles.left} ${styles.communityTitle}`}>
              Pray and grow together with families around the world
            </h3>
            <div className={styles.communityItems}>
              {COMMUNITY.map((c) => (
                <Link key={c.label} to={c.to} className={styles.communityItem}>
                  <Chip icon={c.icon} tone={c.chip} />
                  <span>{c.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
