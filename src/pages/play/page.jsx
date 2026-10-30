import { Link, useSearchParams } from 'react-router-dom';
import { useStreak } from '../../context/StreakContext';
import usePageMetadata from '../../hooks/usePageMetadata';
import { trackPulseEvent } from '../../lib/pulse';
import StoryIcon from '../../components/StoryIcon';
import { Chip } from '../../components/StoryBits';
import {
  PLAY_FEATURES,
  PLAY_CATEGORY_OPTIONS,
  getFeaturedPlayFeatures,
} from '../../data/playFeatures';
import '../../styles/storybook.css';
import h from '../Home.module.css';
import s from './PlayHub.module.css';

// Play hub (route: /play). Games, categories and art come from data/playFeatures.js.

const STATS = [
  { n: String(PLAY_FEATURES.length), label: 'Games & tools' },
  { n: '3', label: 'Difficulty levels' },
  { n: String(PLAY_CATEGORY_OPTIONS.length), label: 'Categories' },
  { n: 'Free', label: 'to play' },
];

const LITTLE_LEARNERS = [
  { label: 'Bible Alphabet', to: '/kids/alphabet', icon: 'type', chip: 'orange' },
  { label: 'Bible Numbers', to: '/kids/numbers', icon: 'hash', chip: 'sky' },
  { label: 'Bible Animals', to: '/kids/animals', icon: 'pawPrint', chip: 'leaf' },
  { label: "God's Shapes", to: '/kids/shapes', icon: 'shapes', chip: 'grape' },
  { label: 'Kids Stories', to: '/kids-stories', icon: 'bookOpen', chip: 'sun' },
  { label: 'Coloring Pages', to: '/kids/coloring', icon: 'palette', chip: 'teal' },
];

const MORE = [
  {
    title: 'AI tools',
    desc: 'Devotionals, Bible character chat, songs and art.',
    to: '/devotional',
    icon: 'chat',
    tone: 'grape',
  },
  {
    title: 'Explore the Bible',
    desc: 'Maps, timelines and study tools.',
    to: '/explore',
    icon: 'compass',
    tone: 'sky',
  },
  {
    title: 'Grow in faith',
    desc: "Keep growing in God's Word every day.",
    to: '/grow',
    icon: 'heartHandshake',
    tone: 'leaf',
  },
];

const ctaLabel = (g) => (g.category === 'Printable' ? 'View sheets' : 'Play now');

export default function PlayHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { streak } = useStreak();

  usePageMetadata({
    title: 'Play Hub — Free Bible Games & Activities for Kids',
    description:
      'Scripture trivia, David & Goliath, escape rooms, flashcards, printables, and daily challenges — free Bible games for kids and families.',
  });

  const requested = searchParams.get('category');
  const active = PLAY_CATEGORY_OPTIONS.includes(requested) ? requested : null;
  const games = active ? PLAY_FEATURES.filter((g) => g.category === active) : PLAY_FEATURES;
  const featured = getFeaturedPlayFeatures();

  function pickCategory(cat) {
    const next = new URLSearchParams(searchParams);
    next.delete('age');
    next.delete('type');
    if (cat) next.set('category', cat);
    else next.delete('category');
    setSearchParams(next, { replace: true, preventScrollReset: true });
    trackPulseEvent('play_filter', { category: cat || 'all' });
  }

  const onPlay = (g) => () => trackPulseEvent('play_game_click', { game: g.id, destination: g.to });

  return (
    <div className={h.page}>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className={s.hero}>
        <div className={`${h.container} ${s.heroCopy}`}>
          <span className={`${h.handNote} ${s.heroNote}`}>
            <span>
              Play
              <StoryIcon name="heart" filled className={h.noteHeart} />
            </span>
            <span>
              Learn
              <StoryIcon name="heart" filled className={h.noteHeart} />
            </span>
            <span>Grow</span>
          </span>
          <h1 className={`${h.heroTitle} ${s.heroTitle}`}>
            Free Bible games for kids and families
          </h1>
          <p className={s.heroBody}>
            Trivia, arcade games, escape rooms, flashcards, and printables, all rooted in Scripture.
            Pick a game and play your way through God&apos;s big story.
          </p>
          <div className={s.actions}>
            <Link
              to="/play/trivia"
              className={`${h.btn} ${h.btnPrimary} ${h.btnLg}`}
              onClick={() =>
                trackPulseEvent('cta_play_hero_trivia', { destination: '/play/trivia' })
              }
            >
              Play trivia
            </Link>
            <a href="#games" className={`${h.btn} ${h.btnSecondary} ${h.btnLg}`}>
              See all games
            </a>
          </div>
          <dl className={s.stats}>
            {STATS.map((st) => (
              <div key={st.label} className={s.stat}>
                <dt className={s.srOnly}>{st.label}</dt>
                <dd className={s.statN}>{st.n}</dd>
                <dd aria-hidden="true" className={s.statLabel}>
                  {st.label}
                </dd>
              </div>
            ))}
          </dl>
          {streak > 0 && (
            <Link to="/play/trivia" className={s.streak}>
              <StoryIcon name="flame" size={18} />
              You&apos;re on a {streak}-day streak! Play a game today to keep it going.
            </Link>
          )}
        </div>
        <div className={s.heroArt}>
          <img
            src="/home/play-hero-board-game-world.webp"
            alt="Storybook illustration of kids playing on a giant rainbow board-game path with Noah's ark, a prize wheel and David with his sling"
            width="1600"
            height="688"
            fetchpriority="high"
            className={s.heroImage}
          />
        </div>
      </section>

      {/* ── Most popular ─────────────────────────────── */}
      <section className={h.section}>
        <div className={h.container}>
          <div className={s.center}>
            <h2 className={h.h2}>Most popular right now</h2>
            <p className={`${h.lead} ${s.narrowLead}`}>
              The two games families play most. Jump straight in.
            </p>
          </div>
          <div className={s.featuredGrid}>
            {featured.map((g) => (
              <div key={g.id} className={`${h.card} ${s[`top_${g.tone}`]}`}>
                <div className={s.featuredMedia}>
                  <img src={g.image} alt={g.imageAlt} width="800" height="600" loading="lazy" />
                  <span className={s.popular}>
                    <StoryIcon name="flame" size={14} />
                    Popular · {g.tag}
                  </span>
                </div>
                <div className={s.featuredBody}>
                  <div>
                    <span className={`${h.handNote} ${s.verse}`}>{g.verse}</span>
                    <h3 className={`${h.h3} ${h.left} ${s.featuredTitle}`}>{g.title}</h3>
                    <p className={s.desc}>{g.desc}</p>
                  </div>
                  <Link
                    to={g.to}
                    aria-label={`Play ${g.title}`}
                    className={`${h.btn} ${h.btnPrimary} ${h.btnLg} ${s.noShrink}`}
                    onClick={onPlay(g)}
                  >
                    <StoryIcon name="play" size={16} filled />
                    Play now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse all ───────────────────────────────── */}
      <section className={`${h.section} ${s.finder}`} id="games">
        <div className={h.container}>
          <div className={s.center}>
            <h2 className={`${h.h2} ${s.finderTitle}`}>Browse every Bible game &amp; activity</h2>
            <p className={`${h.lead} ${s.narrowLead}`}>
              Arcade games, quizzes, puzzles, memory tools and printables. Filter by what your kids
              love most.
            </p>
          </div>
          <div className={s.tabs} role="group" aria-label="Filter games by category">
            <button
              type="button"
              aria-pressed={!active}
              className={`${s.tab} ${!active ? s.tabOn : ''}`}
              onClick={() => pickCategory(null)}
            >
              All games
            </button>
            {PLAY_CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={active === cat}
                className={`${s.tab} ${active === cat ? s.tabOn : ''}`}
                onClick={() => pickCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className={s.count} aria-live="polite">
            Showing {games.length} of {PLAY_FEATURES.length}
          </p>
          <div className={s.gameGrid}>
            {games.map((g) => (
              <div key={g.id} className={`${h.card} ${s[`top_${g.tone}`]}`}>
                <div className={s.gameMedia}>
                  <img src={g.image} alt={g.imageAlt} width="800" height="600" loading="lazy" />
                  <span className={s.badge}>{g.tag}</span>
                </div>
                <div className={s.gameBody}>
                  <span className={`${h.handNote} ${s.verse}`}>{g.verse}</span>
                  <h3 className={`${h.h3} ${h.left} ${s.gameTitle}`}>{g.title}</h3>
                  <p className={s.desc}>{g.desc}</p>
                  <div className={s.gameCta}>
                    <Link
                      to={g.to}
                      aria-label={`${ctaLabel(g)}: ${g.title}`}
                      className={`${h.btn} ${h.btnPrimary} ${h.btnMd}`}
                      onClick={onPlay(g)}
                    >
                      {ctaLabel(g)}
                      <StoryIcon name="arrowRight" size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verse band ───────────────────────────────── */}
      <section className={`${h.section} ${s.verseBand}`}>
        <div className={`${h.container} ${s.verseInner}`}>
          <Chip icon="bookOpen" tone="grape" size="lg" />
          <blockquote className={s.quote}>
            “Your word is a lamp for my feet, a light on my path.”
          </blockquote>
          <span className={`${h.handNote} ${h.underlined} ${s.quoteRef}`}>Psalm 119:105</span>
          <Link to="/explore/bible" className={`${h.btn} ${h.btnPrimary} ${h.btnLg} ${s.quoteBtn}`}>
            Read the Bible
          </Link>
        </div>
      </section>

      {/* ── Little learners ──────────────────────────── */}
      <section className={`${h.section} ${s.learners}`}>
        <div className={`${h.container} ${s.learnersGrid}`}>
          <img
            src="/home/play-little-learners.webp"
            alt="Two toddlers playing with a wooden Noah's ark, toy animals and shape blocks"
            width="1200"
            height="900"
            loading="lazy"
            className={s.learnersImg}
          />
          <div>
            <span className={`${h.handNote} ${h.underlined} ${s.learnersNote}`}>
              Ages 3–8 · Safe · Fun · Faith-filled
            </span>
            <h2 className={`${h.h2} ${h.left} ${s.learnersTitle}`}>Little Learners Corner</h2>
            <p className={`${h.lead} ${s.learnersLead}`}>
              Gentle first steps into God&apos;s Word for preschoolers and early readers: letters,
              numbers, animals, shapes, stories and coloring.
            </p>
            <div className={s.learnerLinks}>
              {LITTLE_LEARNERS.map((l) => (
                <Link key={l.to} to={l.to} className={s.learnerLink}>
                  <Chip icon={l.icon} tone={l.chip} />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Games kids love + parents ────────────────── */}
      <section className={h.section}>
        <div className={`${h.container} ${s.loveGrid}`}>
          <div>
            <h2 className={`${h.h2} ${h.left}`}>Bible games kids love</h2>
            <p className={s.loveBody}>
              Play Scripture Runner, David &amp; Goliath, Spin the Verse, Bible Trivia, Parable
              Escape Room, and dozens more arcade-style games rooted in Scripture. Each activity
              reinforces Bible stories, heroes, and themes from Genesis through Revelation while
              keeping kids motivated with streaks, badges, and friendly competition on the
              leaderboard.
            </p>
          </div>
          <div className={`${h.card} ${s.top_leaf} ${s.parentsCard}`}>
            <Chip icon="shield" tone="leaf" size="lg" />
            <h3 className={`${h.h3} ${h.left} ${s.parentsTitle}`}>
              Built for parents &amp; teachers
            </h3>
            <p className={s.desc}>
              The Parents &amp; Teachers Hub includes child profiles, parental controls,
              PIN-protected Kids Mode, progress tracking, weekly email digests, and classroom tools.
              Set safe time limits, filter content by age, and celebrate milestones as your family
              grows in faith together.
            </p>
            <Link to="/parents" className={`${h.btn} ${h.btnPrimary} ${h.btnMd} ${s.parentsBtn}`}>
              Visit the Parents &amp; Teachers Hub
            </Link>
          </div>
        </div>
      </section>

      {/* ── Want more? ───────────────────────────────── */}
      <section className={`${h.section} ${s.moreSection}`}>
        <div className={h.container}>
          <h2 className={h.h2}>Want more?</h2>
          <div className={s.moreGrid}>
            {MORE.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                className={`${h.card} ${s[`top_${m.tone}`]} ${s.moreCard}`}
              >
                <Chip icon={m.icon} tone={m.tone} size="lg" />
                <div className={s.moreText}>
                  <h3 className={`${h.h3} ${h.left}`}>{m.title}</h3>
                  <p className={s.desc}>{m.desc}</p>
                </div>
                <span className={h.arrow}>
                  <StoryIcon name="arrowRight" size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
