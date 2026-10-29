import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useKidsMode } from '../context/KidsModeContext';
import { useChildSwitcher } from '../context/ChildSwitcherContext';
import KidsDashboard from './KidsDashboard';
import { trackPulseEvent } from '../lib/pulse';
import styles from './Home.module.css';

// Storybook illustrations (generated for the redesign).
// TODO: copy these into /public/home/ and point IMG at local paths.
const CDN = 'https://cdn.ploy.ai/79cd5e36-0ac2-4e32-a53d-6a80df28cf48/user';
const IMG = {
  hero: `${CDN}/ai-hero-noahs-ark-261029150101.webp`,
  runner: `${CDN}/ai-game-scripture-runner-261029150108.webp`,
  david: `${CDN}/ai-game-david-goliath-261029150111.webp`,
  spin: `${CDN}/ai-game-spin-the-verse-261029150117.webp`,
  trivia: `${CDN}/ai-game-bible-trivia-261029150114.webp`,
  bible: `${CDN}/ai-devotional-open-bible-261029150116.webp`,
  family: `${CDN}/ai-parents-family-tablet-261029150128.webp`,
  podcast: `${CDN}/ai-podcast-mic-headphones-261029150132.webp`,
};

const STATS = [
  { value: '80+', label: 'Bible games', sub: 'From Genesis to Revelation', tone: 'sun' },
  { value: '100%', label: 'Free to play', sub: 'No subscriptions needed', tone: 'leaf' },
  { value: '🛡️', label: 'Safe for kids', sub: 'PIN-protected Kids Mode', tone: 'sky' },
];

const GAMES = [
  {
    title: 'Scripture Runner',
    desc: 'Dash, jump and collect verses in an arcade run through the Bible.',
    img: IMG.runner,
    alt: 'A boy running happily along a sunny hillside path',
    to: '/game/runner',
    tone: 'sun',
  },
  {
    title: 'David & Goliath',
    desc: 'Step into one of the bravest stories ever told — sling at the ready.',
    img: IMG.david,
    alt: 'Young David with his sling facing the giant Goliath',
    to: '/game/david-goliath',
    tone: 'coral',
  },
  {
    title: 'Spin the Verse',
    desc: 'Give the wheel a whirl and learn a brand-new memory verse.',
    img: IMG.spin,
    alt: 'Kids cheering around a rainbow prize wheel with an open Bible',
    to: '/game/spin-the-verse',
    tone: 'grape',
  },
  {
    title: 'Bible Trivia',
    desc: 'Test what you know with quizzes for every age and every book.',
    img: IMG.trivia,
    alt: 'A smiling girl thinking, surrounded by colorful question marks',
    to: '/play/trivia',
    tone: 'sky',
  },
];

const DEVOTIONAL_FEATURES = [
  'Personalized devotionals for your whole family',
  'Chat with Bible characters like Moses and Ruth',
  'Scripture-inspired miracle art',
  'Drama scripts for Sunday school and VBS',
  'Lesson plans and printables in minutes',
  'Reading plans from preschool to tweens',
];

const EXPLORE = [
  {
    title: 'Living Bible Map',
    desc: 'Travel the lands of the Bible, from Eden to Rome.',
    to: '/explore/world',
    icon: '🗺️',
    tone: 'sky',
  },
  {
    title: 'Interactive Timeline',
    desc: 'See how every story fits into God’s big story.',
    to: '/explore/timeline',
    icon: '📜',
    tone: 'sun',
  },
  {
    title: 'Family Tree',
    desc: 'Meet the families from Adam all the way to Jesus.',
    to: '/family-tree',
    icon: '🌳',
    tone: 'leaf',
  },
];

const PARENT_FEATURES = [
  'Child profiles with progress tracking',
  'Parental controls and PIN-protected Kids Mode',
  'Time limits and age-appropriate filters',
  'Weekly email digests of what your kids learned',
  'Classroom tools for teachers and homeschoolers',
];

const COMMUNITY = [
  {
    icon: '🙏',
    title: 'Global prayer wall',
    desc: 'Share requests and pray for families everywhere.',
    to: '/prayer',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Family groups',
    desc: 'Grow together with friends from church and home.',
    to: '/community/family',
  },
  {
    icon: '💬',
    title: 'Chat rooms',
    desc: 'Moderated, kid-safe spaces to talk faith.',
    to: '/community/chat',
  },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(`.${styles.reveal}`);
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add(styles.in));
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.in);
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function Check() {
  return (
    <svg className={styles.check} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" />
      <path d="M5.5 10.5l3 3 6-7" />
    </svg>
  );
}

function Squiggle() {
  return (
    <svg
      className={styles.squiggle}
      viewBox="0 0 220 14"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M2 9c18-8 34-8 52 0s34 8 52 0 34-8 52 0 34 8 60-2" />
    </svg>
  );
}

export default function Home() {
  const { kidsMode } = useKidsMode();
  const { isChildSession } = useChildSwitcher();
  useReveal();

  if (kidsMode || isChildSession) return <KidsDashboard />;

  const track = (name, destination) => () => trackPulseEvent(name, { destination });

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.tags}>
            <span className={`${styles.tag} ${styles.toneSun}`}>Games</span>
            <span className={`${styles.tag} ${styles.toneGrape}`}>Faith</span>
            <span className={`${styles.tag} ${styles.toneLeaf}`}>Family</span>
          </div>
          <h1 className={styles.heroTitle}>
            Free Bible games &amp; devotionals for{' '}
            <span className={styles.highlight}>
              kids and families
              <Squiggle />
            </span>
          </h1>
          <p className={styles.lead}>
            BibleFunLand is a free, interactive place to learn God’s Word — made for children,
            parents, Sunday school teachers and homeschool families. Play 80+ games, grow with
            devotionals, print activities and hide Scripture in your heart.
          </p>
          <div className={styles.ctaRow}>
            <Link
              to="/play"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={track('cta_hero_start_journey', '/play')}
            >
              🎮 Play free Bible games
            </Link>
            <Link
              to="/devotional"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={track('cta_hero_try_devotional', '/devotional')}
            >
              ✨ Try AI devotionals
            </Link>
          </div>
        </div>
        <figure className={styles.heroArt}>
          <img
            src={IMG.hero}
            alt="Storybook illustration of Noah's ark on the waves under a rainbow, with animals looking out"
            width="1200"
            height="900"
            fetchpriority="high"
          />
        </figure>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className={styles.stats} aria-label="BibleFunLand at a glance">
        {STATS.map((s) => (
          <div key={s.label} className={`${styles.stat} ${styles[`tone${cap(s.tone)}`]}`}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statSub}>{s.sub}</span>
          </div>
        ))}
      </section>

      {/* ── Games ────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.reveal}`} id="games">
        <header className={styles.sectionHead}>
          <span className={styles.eyebrow}>Play</span>
          <h2>Bible games kids love</h2>
          <p>
            Arcade-style adventures that bring Bible stories and heroes to life — from Genesis to
            Revelation.
          </p>
        </header>
        <div className={styles.gameGrid}>
          {GAMES.map((g) => (
            <article key={g.title} className={`${styles.gameCard} ${styles[`tone${cap(g.tone)}`]}`}>
              <Link to={g.to} className={styles.gameImg} tabIndex={-1} aria-hidden="true">
                <img src={g.img} alt={g.alt} loading="lazy" width="600" height="450" />
              </Link>
              <div className={styles.gameBody}>
                <h3>{g.title}</h3>
                <p>{g.desc}</p>
                <Link to={g.to} className={styles.playBtn}>
                  Play now <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.moreRow}>
          <p>
            Plus Parable Escape Room and dozens more — with streaks, badges and a family
            leaderboard.
          </p>
          <Link to="/play" className={`${styles.btn} ${styles.btnInk}`}>
            See all 80+ games
          </Link>
        </div>
      </section>

      {/* ── AI devotionals ───────────────────────────── */}
      <section className={`${styles.section} ${styles.split} ${styles.reveal}`} id="devotionals">
        <div className={styles.splitCopy}>
          <span className={styles.eyebrow}>Grow</span>
          <h2>AI devotionals for every curious heart</h2>
          <p>
            Short, warm devotionals written for your family’s ages and questions — plus creative
            tools that make Bible time the best part of the day.
          </p>
          <ul className={styles.checkList}>
            {DEVOTIONAL_FEATURES.map((f) => (
              <li key={f}>
                <Check />
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/devotional"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={track('cta_home_devotional', '/devotional')}
          >
            ✨ Try AI devotionals
          </Link>
        </div>
        <figure className={`${styles.splitArt} ${styles.tiltRight}`}>
          <img
            src={IMG.bible}
            alt="Watercolor open Bible on a wooden table with sunrise light"
            loading="lazy"
            width="900"
            height="700"
          />
          <figcaption className={styles.sticker}>Today’s devotional · 5 min</figcaption>
        </figure>
      </section>

      {/* ── Explore ──────────────────────────────────── */}
      <section className={`${styles.section} ${styles.reveal}`} id="explore">
        <header className={styles.sectionHead}>
          <span className={styles.eyebrow}>Discover</span>
          <h2>Explore the Bible</h2>
          <p>Maps, timelines and family trees that turn reading into an adventure.</p>
        </header>
        <div className={styles.exploreGrid}>
          {EXPLORE.map((e) => (
            <Link
              key={e.title}
              to={e.to}
              className={`${styles.exploreCard} ${styles[`tone${cap(e.tone)}`]}`}
            >
              <span className={styles.exploreIcon} aria-hidden="true">
                {e.icon}
              </span>
              <h3>{e.title}</h3>
              <p>{e.desc}</p>
              <span className={styles.exploreGo}>Explore →</span>
            </Link>
          ))}
        </div>
        <p className={styles.footnote}>
          Also inside: a <Link to="/explore/voice-reader">voice Bible reader</Link> and a{' '}
          <Link to="/explore/bible">book-by-book explorer</Link>.
        </p>
      </section>

      {/* ── Parents & Teachers ───────────────────────── */}
      <section
        className={`${styles.section} ${styles.split} ${styles.splitReverse} ${styles.reveal}`}
        id="parents"
      >
        <figure className={`${styles.splitArt} ${styles.tiltLeft}`}>
          <img
            src={IMG.family}
            alt="A mother and her two children smiling at a tablet showing a rainbow"
            loading="lazy"
            width="900"
            height="700"
          />
          <figcaption className={styles.sticker}>Built with parents, for parents</figcaption>
        </figure>
        <div className={styles.splitCopy}>
          <span className={styles.eyebrow}>For grown-ups</span>
          <h2>For parents, teachers and homeschool families</h2>
          <p>Peace of mind for you, joyful learning for them.</p>
          <ul className={styles.checkList}>
            {PARENT_FEATURES.map((f) => (
              <li key={f}>
                <Check />
                {f}
              </li>
            ))}
          </ul>
          <Link to="/parents" className={`${styles.btn} ${styles.btnInk}`}>
            Visit the Parents &amp; Teachers Hub
          </Link>
        </div>
      </section>

      {/* ── Podcast ──────────────────────────────────── */}
      <section className={`${styles.podcast} ${styles.reveal}`} id="podcast">
        <div className={styles.podcastCopy}>
          <span className={styles.eyebrowLight}>Listen</span>
          <h2>Faith &amp; Adventure podcast</h2>
          <p>
            Bible stories told with heart — perfect for car rides, bedtime and Sunday school prep.
          </p>
          <Link
            to="/podcast"
            className={`${styles.btn} ${styles.btnSun}`}
            onClick={track('cta_home_podcast', '/podcast')}
          >
            🎧 Listen to the podcast
          </Link>
        </div>
        <figure className={styles.podcastArt}>
          <img
            src={IMG.podcast}
            alt="Watercolor microphone and purple headphones with music notes"
            loading="lazy"
            width="700"
            height="700"
          />
        </figure>
      </section>

      {/* ── Community ────────────────────────────────── */}
      <section className={`${styles.section} ${styles.reveal}`} id="community">
        <header className={styles.sectionHead}>
          <span className={styles.eyebrow}>Together</span>
          <h2>Pray and grow together with families around the world</h2>
        </header>
        <div className={styles.communityGrid}>
          {COMMUNITY.map((c) => (
            <Link key={c.title} to={c.to} className={styles.communityCard}>
              <span className={styles.communityIcon} aria-hidden="true">
                {c.icon}
              </span>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────── */}
      <section className={`${styles.closing} ${styles.reveal}`}>
        <h2>Ready for some Bible fun?</h2>
        <p>Jump in free — no credit card, no subscription.</p>
        <div className={styles.ctaRow}>
          <Link
            to="/play"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={track('cta_home_closing_play', '/play')}
          >
            🎮 Play free
          </Link>
          <Link
            to="/auth"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={track('cta_home_closing_signup', '/auth')}
          >
            Create a family account
          </Link>
        </div>
      </section>
    </div>
  );
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
