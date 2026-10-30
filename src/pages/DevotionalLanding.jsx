import { Link } from 'react-router-dom';
import StoryIcon from '../components/StoryIcon';
import { Chip, Sparkles } from '../components/StoryBits';
import { PLAN_PRICES } from '../lib/membershipOffers';
import { trackPulseEvent } from '../lib/pulse';
import '../styles/storybook.css';
import h from './Home.module.css';
import s from './DevotionalLanding.module.css';

// Public landing page for the AI faith tools (route: /devotional).
// The tools themselves live under /ai/* behind the Pro gate.

const img = (name) => `/home/${name}.webp`;

const TOOLS = [
  {
    title: 'AI Devotional',
    desc: 'A family devotional, personalized every day.',
    cta: 'Start a devotional',
    to: '/ai/devotional',
    img: 'devotional-card-daily',
    alt: 'A smiling girl on her bed at sunrise with an open Bible and a journal',
    tone: 'orange',
    wide: true,
  },
  {
    title: 'Bible Character Chat',
    desc: 'Talk to Moses, David and more.',
    cta: 'Start chatting',
    to: '/ai/chat/characters',
    img: 'devotional-card-character-chat',
    alt: 'A curious boy sitting on a hillside listening to Moses beside the stone tablets',
    tone: 'sky',
    wide: true,
  },
  {
    title: 'Bible Rap Generator',
    desc: 'Scripture songs in seconds.',
    cta: 'Make a song',
    to: '/ai/rap-generator',
    img: 'devotional-card-rap',
    alt: 'Three kids singing and dancing in a backyard surrounded by colorful music notes',
    tone: 'grape',
  },
  {
    title: 'Miracle Art',
    desc: 'AI art prompts for Bible scenes.',
    cta: 'Create art',
    to: '/ai/miracle-art',
    img: 'devotional-card-miracle-art',
    alt: 'A boy painting Jonah and a friendly whale on an easel',
    tone: 'sun',
  },
  {
    title: 'Drama Scripts',
    desc: 'Scripts for church or homeschool performances.',
    cta: 'Find a script',
    to: '/ai/drama-scripts',
    img: 'devotional-card-drama',
    alt: 'Kids performing a nativity play on a small stage while parents watch',
    tone: 'leaf',
    last: true,
  },
];

const TEACHER_FEATURES = [
  'AI lesson plans',
  'Printable resources and activity sheets',
  'Reading plans for preschool through tweens',
];

const FREE_FEATURES = [
  { icon: 'gamepad', label: 'Bible games', chip: 'sky', to: '/play' },
  { icon: 'handHeart', label: 'Prayer wall', chip: 'orange', to: '/prayer' },
  { icon: 'bookOpen', label: 'Verse of the Day', chip: 'sun' },
];

const PRO_FEATURES = [
  'Unlimited AI devotionals & Bible chat',
  'Bible certification & reading plans',
  'Ad-free experience',
  'Parent progress reports & printable packs',
];

function CheckDot() {
  return (
    <span className={h.checkDot}>
      <StoryIcon name="check" size={16} strokeWidth={3} />
    </span>
  );
}

export default function DevotionalLanding() {
  const track = (name, destination) => () => trackPulseEvent(name, { destination });

  return (
    <div className={h.page}>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className={s.hero}>
        <div className={`${h.container} ${s.heroCopy}`}>
          <span className={`${h.handNote} ${s.heroNote}`}>
            <span>
              Pray
              <StoryIcon name="heart" filled className={h.noteHeart} />
            </span>
            <span>
              Read
              <StoryIcon name="heart" filled className={h.noteHeart} />
            </span>
            <span>Grow</span>
          </span>
          <h1 className={`${h.heroTitle} ${s.heroTitle}`}>
            AI devotionals and faith tools for the whole family
          </h1>
          <p className={s.heroBody}>
            Generate personalized family devotionals, chat with Bible characters, create
            scripture-inspired art, and explore drama scripts for church or homeschool performances.
          </p>
          <div className={s.actions}>
            <Link
              to="/ai/devotional"
              className={`${h.btn} ${h.btnPrimary} ${h.btnLg}`}
              onClick={track('cta_devotional_hero_start', '/ai/devotional')}
            >
              Start your devotional
            </Link>
            <Link
              to="/premium"
              className={`${h.btn} ${h.btnSecondary} ${h.btnLg}`}
              onClick={track('cta_devotional_hero_plans', '/premium')}
            >
              Compare plans
            </Link>
          </div>
        </div>
        <div className={s.heroArt}>
          <img
            src={img('devotional-hero-family-sunrise')}
            alt="Storybook illustration of a family and their dog reading a big Bible together on a window seat at sunrise"
            width="1600"
            height="688"
            fetchpriority="high"
            className={s.heroImage}
          />
        </div>
      </section>

      {/* ── Five tools ───────────────────────────────── */}
      <section className={h.section} id="tools">
        <div className={h.container}>
          <div className={h.sectionHead}>
            <Sparkles />
            <h2 className={h.h2}>Five ways to grow in God&apos;s Word</h2>
            <p className={h.lead}>
              Faith-based AI tools that turn Bible time into conversations, songs, art, and plays
              your kids will remember.
            </p>
          </div>
          <div className={s.toolGrid}>
            {TOOLS.map((t) => (
              <div
                key={t.title}
                className={`${h.card} ${s.toolCard} ${s[`top_${t.tone}`]} ${t.wide ? s.wide : s.narrow} ${t.last ? s.lastCard : ''}`}
              >
                <img
                  src={img(t.img)}
                  alt={t.alt}
                  width="800"
                  height="600"
                  loading="lazy"
                  className={t.wide ? s.toolImgWide : s.toolImg}
                />
                <div className={t.wide ? s.toolBodyWide : s.toolBody}>
                  <div className={s.toolText}>
                    <h3 className={`${h.h3} ${h.left}`}>{t.title}</h3>
                    <p>{t.desc}</p>
                  </div>
                  <Link
                    to={t.to}
                    className={`${h.btn} ${h.btnPrimary} ${s.toolBtn}`}
                    onClick={track('cta_devotional_tool', t.to)}
                  >
                    {t.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Teacher resources ────────────────────────── */}
      <section className={s.teachers}>
        <div className={s.teachersGrid}>
          <div className={s.teachersArt}>
            <img
              src={img('devotional-teachers-table')}
              alt="A Sunday school teacher coloring printable pages with four young children around a table with an open Bible"
              width="1400"
              height="1050"
              loading="lazy"
              className={s.teachersImage}
            />
            <span className={`${h.handNote} ${h.underlined} ${s.noteSunday}`}>
              Ready for Sunday!
            </span>
          </div>
          <div className={s.teachersCopy}>
            <h2 className={`${h.h2} ${h.left} ${s.maxH2}`}>
              Save time on Sunday school and homeschool prep
            </h2>
            <p className={h.splitBody}>
              Parents and teachers can save time with AI lesson plans, printable resources, and
              reading plans tailored to every age group from preschool through tweens.
            </p>
            <ul className={h.checks}>
              {TEACHER_FEATURES.map((f) => (
                <li key={f}>
                  <CheckDot />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/parents" className={`${h.btn} ${h.btnPrimary} ${h.btnMd} ${h.splitCta}`}>
              Visit the Parents &amp; Teachers Hub
            </Link>
          </div>
        </div>
      </section>

      {/* ── Free vs Pro ──────────────────────────────── */}
      <section className={`${h.section} ${s.plans}`} id="plans">
        <div className={h.container}>
          <div className={h.sectionHead}>
            <h2 className={h.h2}>Start free, go further with Pro</h2>
            <p className={h.lead}>
              Sign in to try the AI tools. Upgrade to Pro when your family is ready for more.
            </p>
          </div>
          <div className={s.planGrid}>
            <div className={`${h.card} ${s.planCard} ${s.noLift}`}>
              <h3 className={`${h.h3} ${h.left} ${s.planTitle}`}>Always free</h3>
              <p className={s.planSub}>Explore while you decide.</p>
              <ul className={s.freeList}>
                {FREE_FEATURES.map((f) => (
                  <li key={f.label}>
                    {f.to ? (
                      <Link to={f.to}>
                        <Chip icon={f.icon} tone={f.chip} />
                        <span>{f.label}</span>
                      </Link>
                    ) : (
                      <span className={s.freeItem}>
                        <Chip icon={f.icon} tone={f.chip} />
                        <span>{f.label}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <div className={s.planCta}>
                <Link to="/play" className={`${h.btn} ${h.btnSecondary} ${h.btnMd}`}>
                  Play free Bible games
                </Link>
              </div>
            </div>

            <div className={`${h.card} ${s.planCard} ${s.top_grape} ${s.noLift}`}>
              <h3 className={`${h.h3} ${h.left} ${s.planTitle}`}>What you get with Pro</h3>
              <p className={s.planSub}>Unlock the full set of faith-building AI tools.</p>
              <ul className={s.proList}>
                {PRO_FEATURES.map((f) => (
                  <li key={f}>
                    <CheckDot />
                    {f}
                  </li>
                ))}
              </ul>
              <p className={s.familyNote}>
                Family from {PLAN_PRICES.family.monthly}/mo: 5 seats, shared prayer journal &amp;
                early access
              </p>
              <div className={s.planCta}>
                <Link
                  to="/premium"
                  className={`${h.btn} ${h.btnPrimary} ${h.btnMd}`}
                  onClick={() =>
                    trackPulseEvent('pricing_viewed', { source: 'devotional_landing' })
                  }
                >
                  Compare Free, Pro &amp; Family plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing ──────────────────────────────────── */}
      <section className={h.section}>
        <div className={`${h.container} ${s.closing}`}>
          <span className={`${h.handNote} ${h.underlined} ${s.closingNote}`}>
            Big questions, bright answers
          </span>
          <div className={s.closingHead}>
            <Sparkles />
            <h2 className={`${h.h2} ${s.maxH2}`}>Make God&apos;s Word part of every day</h2>
          </div>
          <p className={`${h.lead} ${s.closingLead}`}>
            Open a devotional together tonight, or start with a free Bible game.
          </p>
          <div className={s.actions}>
            <Link
              to="/ai/devotional"
              className={`${h.btn} ${h.btnPrimary} ${h.btnLg}`}
              onClick={track('cta_devotional_closing_start', '/ai/devotional')}
            >
              Start your devotional
            </Link>
            <Link to="/play" className={`${h.btn} ${h.btnSecondary} ${h.btnLg}`}>
              Play free Bible games
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
