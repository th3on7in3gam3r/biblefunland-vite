import { Link, useSearchParams } from 'react-router-dom';
import { useKidsMode } from '../../context/KidsModeContext';
import usePageMetadata from '../../hooks/usePageMetadata';
import { trackPulseEvent } from '../../lib/pulse';
import StoryIcon from '../../components/StoryIcon';
import { Chip } from '../../components/StoryBits';
import {
  EXPLORE_FEATURES,
  EXPLORE_AGE_OPTIONS,
  EXPLORE_TOPIC_OPTIONS,
  EXPLORE_TYPE_OPTIONS,
  filterExploreFeatures,
} from '../../data/exploreFeatures';
import '../../styles/storybook.css';
import h from '../Home.module.css';
import p from '../play/PlayHub.module.css';
import s from './ExploreHub.module.css';

// Explore hub (route: /explore). Tools, filters and art come from data/exploreFeatures.js.

const STATS = [
  { n: String(EXPLORE_FEATURES.length), label: 'Study tools' },
  { n: '100+', label: 'Translations' },
  { n: '90+', label: 'Timeline events' },
  { n: '3,000+', label: 'Bible names' },
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
    title: 'Play games',
    desc: '80+ Bible games kids love.',
    to: '/play',
    icon: 'gamepad',
    tone: 'orange',
  },
  {
    title: 'Grow in faith',
    desc: "Keep growing in God's Word every day.",
    to: '/grow',
    icon: 'heartHandshake',
    tone: 'leaf',
  },
];

const ageTag = (age) =>
  age === 'Family' ? 'All ages' : EXPLORE_AGE_OPTIONS.find((o) => o.value === age)?.value || age;

export default function ExploreHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { kidsMode = false } = useKidsMode() || {};

  usePageMetadata({
    title: 'Explore Hub — Bible Maps, Timeline & Study Tools',
    description:
      'Free Bible maps, timeline, cross-references, original language studies, and scripture readers for kids and families.',
  });

  const filters = {
    age: searchParams.getAll('age').filter(Boolean),
    topic: searchParams.getAll('topic').filter(Boolean),
    type: searchParams.getAll('type').filter(Boolean),
  };
  const tools = filterExploreFeatures(EXPLORE_FEATURES, filters);
  const hasFilters = filters.age.length + filters.topic.length + filters.type.length > 0;

  const ageOptions = kidsMode
    ? EXPLORE_AGE_OPTIONS.filter((o) => o.value !== 'Family')
    : EXPLORE_AGE_OPTIONS;

  const groups = [
    { field: 'age', label: 'Age group', options: ageOptions },
    {
      field: 'topic',
      label: 'Topic',
      options: EXPLORE_TOPIC_OPTIONS.map((t) => ({ value: t, label: t })),
    },
    {
      field: 'type',
      label: 'Tool type',
      options: EXPLORE_TYPE_OPTIONS.map((t) => ({ value: t, label: t })),
    },
  ];

  function toggle(field, value) {
    const next = new URLSearchParams(searchParams);
    const current = next.getAll(field);
    next.delete(field);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updated.forEach((v) => next.append(field, v));
    setSearchParams(next, { replace: true, preventScrollReset: true });
    trackPulseEvent('explore_filter', { field, value });
  }

  function clearAll() {
    const next = new URLSearchParams(searchParams);
    ['age', 'topic', 'type'].forEach((f) => next.delete(f));
    setSearchParams(next, { replace: true, preventScrollReset: true });
  }

  return (
    <div className={h.page}>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className={p.hero}>
        <div className={`${h.container} ${p.heroCopy}`}>
          <span className={`${h.handNote} ${p.heroNote}`}>
            <span>
              Read
              <StoryIcon name="heart" filled className={h.noteHeart} />
            </span>
            <span>
              Wonder
              <StoryIcon name="heart" filled className={h.noteHeart} />
            </span>
            <span>Discover</span>
          </span>
          <h1 className={`${h.heroTitle} ${p.heroTitle}`}>Explore God&apos;s Word</h1>
          <p className={p.heroBody}>
            Maps, timelines, original languages, cross-references, and scripture tools, all rooted
            in the Bible. Pick a tool and start your own adventure through Scripture.
          </p>
          <div className={p.actions}>
            <Link
              to="/explore/bible"
              className={`${h.btn} ${h.btnPrimary} ${h.btnLg}`}
              onClick={() =>
                trackPulseEvent('cta_explore_hero_read', { destination: '/explore/bible' })
              }
            >
              Start reading
            </Link>
            <a href="#tools" className={`${h.btn} ${h.btnSecondary} ${h.btnLg}`}>
              Find a tool
            </a>
          </div>
          <dl className={p.stats}>
            {STATS.map((st) => (
              <div key={st.label} className={p.stat}>
                <dt className={p.srOnly}>{st.label}</dt>
                <dd className={p.statN}>{st.n}</dd>
                <dd aria-hidden="true" className={p.statLabel}>
                  {st.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={p.heroArt}>
          <img
            src="/home/explore-hero-kids-map.webp"
            alt="Storybook illustration of three kids and a puppy exploring a big painted map of Bible lands with a magnifying glass and compass"
            width="1600"
            height="688"
            fetchpriority="high"
            className={p.heroImage}
          />
        </div>
      </section>

      {/* ── Tool finder ──────────────────────────────── */}
      <section className={`${h.section} ${s.finder}`} id="tools">
        <div className={h.container}>
          <div className={p.center}>
            <h2 className={`${h.h2} ${p.finderTitle}`}>Find the right tool for your family</h2>
            <p className={`${h.lead} ${p.narrowLead}`}>
              Filter by age, topic or type, then open a tool and start exploring.
            </p>
          </div>

          <div className={s.filters}>
            {groups.map((g) => (
              <div key={g.field} role="group" aria-label={g.label}>
                <p className={s.groupLabel}>{g.label}</p>
                <div className={s.chips}>
                  {g.options.map((o) => {
                    const on = filters[g.field].includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={on}
                        className={`${s.chip} ${on ? s.chipOn : ''}`}
                        onClick={() => toggle(g.field, o.value)}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className={s.countRow}>
            <p aria-live="polite">
              Showing {tools.length} of {EXPLORE_FEATURES.length} tools
            </p>
            {hasFilters && (
              <button type="button" className={s.clear} onClick={clearAll}>
                Clear filters
              </button>
            )}
          </div>

          {tools.length === 0 ? (
            <div className={s.empty}>
              <p>No tools match those filters yet.</p>
              <button
                type="button"
                className={`${h.btn} ${h.btnSecondary} ${h.btnMd}`}
                onClick={clearAll}
              >
                Show all tools
              </button>
            </div>
          ) : (
            <div className={`${p.gameGrid} ${s.toolGrid}`}>
              {tools.map((t) => (
                <div key={t.id} className={`${h.card} ${p[`top_${t.tone}`]}`}>
                  <div className={p.gameMedia}>
                    <img src={t.image} alt={t.imageAlt} width="800" height="600" loading="lazy" />
                    <span className={`${p.badge} ${s.meta}`}>{t.detail}</span>
                  </div>
                  <div className={p.gameBody}>
                    <span className={`${h.handNote} ${p.verse}`}>{t.verse}</span>
                    <h3 className={`${h.h3} ${h.left} ${p.gameTitle}`}>{t.title}</h3>
                    <p className={p.desc}>{t.desc}</p>
                    <ul className={s.tags} aria-label="Tags">
                      {[ageTag(t.age), t.type, ...t.topic].map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    <div className={p.gameCta}>
                      <Link
                        to={t.to}
                        aria-label={`Open ${t.title}`}
                        className={`${h.btn} ${h.btnPrimary} ${h.btnMd}`}
                        onClick={() =>
                          trackPulseEvent('explore_tool_click', { tool: t.id, destination: t.to })
                        }
                      >
                        Open tool
                        <StoryIcon name="arrowRight" size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Verse band ───────────────────────────────── */}
      <section className={`${h.section} ${p.verseBand}`}>
        <div className={`${h.container} ${p.verseInner}`}>
          <Chip icon="bookOpen" tone="grape" size="lg" />
          <blockquote className={p.quote}>
            “For the word of God is alive and active. Sharper than any double-edged sword.”
          </blockquote>
          <span className={`${h.handNote} ${h.underlined} ${p.quoteRef}`}>Hebrews 4:12</span>
          <Link to="/explore/bible" className={`${h.btn} ${h.btnPrimary} ${h.btnLg} ${p.quoteBtn}`}>
            Start reading
          </Link>
        </div>
      </section>

      {/* ── Go deeper ────────────────────────────────── */}
      <section className={h.section}>
        <div className={h.container}>
          <h2 className={h.h2}>Ready to go deeper?</h2>
          <div className={p.moreGrid}>
            {MORE.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                className={`${h.card} ${p[`top_${m.tone}`]} ${p.moreCard}`}
              >
                <Chip icon={m.icon} tone={m.tone} size="lg" />
                <div className={p.moreText}>
                  <h3 className={`${h.h3} ${h.left}`}>{m.title}</h3>
                  <p className={p.desc}>{m.desc}</p>
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
