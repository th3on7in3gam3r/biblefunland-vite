import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useKidsMode } from '../../context/KidsModeContext';
import usePageMetadata from '../../hooks/usePageMetadata';
import {
  EXPLORE_FEATURES,
  EXPLORE_STATS,
  EXPLORE_AGE_OPTIONS,
  EXPLORE_TOPIC_OPTIONS,
  EXPLORE_TYPE_OPTIONS,
  filterExploreFeatures,
} from '../../data/exploreFeatures';
import styles from './Explore.module.css';

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function syncMultiParam(searchParams, key, values) {
  searchParams.delete(key);
  values.forEach((value) => searchParams.append(key, value));
}

function arrayFromParam(searchParams, key) {
  return searchParams.getAll(key).filter(Boolean);
}

function pillClass(field, active) {
  if (!active) return styles.pill;
  if (field === 'age') return `${styles.pill} ${styles.pillActiveAge}`;
  if (field === 'topic') return `${styles.pill} ${styles.pillActiveTopic}`;
  return `${styles.pill} ${styles.pillActiveType}`;
}

export default function ExploreOverview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { kidsMode = false } = useKidsMode() || {};

  usePageMetadata({
    title: 'Explore Hub — Bible Maps, Timeline & Study Tools',
    description:
      'Free Bible maps, timeline, cross-references, original language studies, and scripture readers for kids and families.',
  });

  const ageFilter = arrayFromParam(searchParams, 'age');
  const topicFilter = arrayFromParam(searchParams, 'topic');
  const typeFilter = arrayFromParam(searchParams, 'type');

  const filteredFeatures = useMemo(
    () =>
      filterExploreFeatures(EXPLORE_FEATURES, {
        age: ageFilter,
        topic: topicFilter,
        type: typeFilter,
      }),
    [ageFilter, topicFilter, typeFilter]
  );

  const effectiveAgeOptions = kidsMode
    ? EXPLORE_AGE_OPTIONS.filter((opt) => opt.value !== 'Family')
    : EXPLORE_AGE_OPTIONS;

  const onToggle = (field, value) => {
    const existing = arrayFromParam(searchParams, field);
    const next = existing.includes(value)
      ? existing.filter((v) => v !== value)
      : [...existing, value];

    const nextParams = new URLSearchParams(searchParams.toString());
    syncMultiParam(nextParams, field, next);
    setSearchParams(nextParams, { replace: true });
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('age');
    nextParams.delete('topic');
    nextParams.delete('type');
    setSearchParams(nextParams, { replace: true });
  };

  const hasFilters = ageFilter.length || topicFilter.length || typeFilter.length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div
          className={styles.heroGlow}
          style={{
            width: 280,
            height: 280,
            background: 'radial-gradient(circle,#34D39930 0%,transparent 70%)',
            top: '5%',
            left: '8%',
          }}
        />
        <div
          className={styles.heroGlow}
          style={{
            width: 320,
            height: 320,
            background: 'radial-gradient(circle,#D4A85325 0%,transparent 70%)',
            top: '10%',
            right: '5%',
          }}
        />

        <div className={styles.heroInner}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Bible Study · History · Geography
          </div>

          <h1 className={styles.title}>
            Explore <span className={styles.titleAccent}>God&apos;s Word</span>
          </h1>

          <p className={styles.subtitle}>
            Maps, timelines, original languages, cross-references, and scripture tools — all free,
            all rooted in the Bible.
          </p>

          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.heroBtnPrimary}
              onClick={() => scrollToSection('bible-explorer')}
            >
              📖 Bible Explorer ↓
            </button>
            <button
              type="button"
              className={styles.heroBtnGhost}
              onClick={() => scrollToSection('living-bible-map')}
            >
              🗺️ Living Map ↓
            </button>
            <button
              type="button"
              className={styles.heroBtnGhost}
              onClick={() => scrollToSection('voice-bible-reader')}
            >
              🎙️ Voice Reader ↓
            </button>
          </div>

          <div className={styles.stats}>
            {EXPLORE_STATS.map(({ n, label }) => (
              <div key={label}>
                <div className={styles.statNum}>{n}</div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.body}>
        <div className={styles.quickJump}>
          {EXPLORE_FEATURES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={styles.quickPill}
              style={{ '--pill-color': f.color }}
              onClick={() => scrollToSection(f.id)}
            >
              {f.icon} {f.title}
            </button>
          ))}
        </div>

        <section className={styles.filters} aria-label="Filter study tools">
          <div className={styles.filtersHeader}>
            <h2 className={styles.filtersTitle}>Find the right tool</h2>
            <span className={styles.filtersCount}>
              {filteredFeatures.length} of {EXPLORE_FEATURES.length}
            </span>
            {hasFilters && (
              <button type="button" className={styles.clearBtn} onClick={clearFilters}>
                ✕ Clear filters
              </button>
            )}
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>👶 Age group</span>
            <div className={styles.pillRow}>
              {effectiveAgeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={pillClass('age', ageFilter.includes(opt.value))}
                  onClick={() => onToggle('age', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>📖 Topic</span>
            <div className={styles.pillRow}>
              {EXPLORE_TOPIC_OPTIONS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className={pillClass('topic', topicFilter.includes(topic))}
                  onClick={() => onToggle('topic', topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>🎯 Tool type</span>
            <div className={styles.pillRow}>
              {EXPLORE_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={pillClass('type', typeFilter.includes(type))}
                  onClick={() => onToggle('type', type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div id="explore-tools">
          <span className={styles.sectionEyebrow}>🔍 Study Tools</span>
          <h2 className={styles.sectionTitle}>Everything you need to explore Scripture</h2>

          <div className={styles.grid}>
            {filteredFeatures.length === 0 ? (
              <div className={styles.empty}>
                No tools match your filters.{' '}
                <button type="button" className={styles.clearBtn} onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              filteredFeatures.map((f) => (
                <Link key={f.id} to={f.to} className={styles.card} id={f.id}>
                  <article
                    className={styles.cardInner}
                    style={{ '--card-color': f.color }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${f.color}55`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(15, 20, 40, 0.06)';
                    }}
                  >
                    <div
                      className={styles.cardBanner}
                      style={{
                        background: `linear-gradient(135deg,${f.color}dd,${f.color}88)`,
                      }}
                    >
                      <div className={styles.cardBannerGlow} />
                      <div className={styles.cardBannerCross}>✝</div>
                      <div className={styles.cardIcon}>{f.icon}</div>
                      <span className={styles.cardTag}>{f.tag}</span>
                      <div className={styles.cardDetail}>{f.detail}</div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardVerse} style={{ color: f.color }}>
                        📖 {f.verse}
                      </div>
                      <h3 className={styles.cardTitle}>{f.title}</h3>
                      <p className={styles.cardDesc}>{f.desc}</p>
                      <div className={styles.cardMeta}>
                        <span className={styles.metaChip}>{f.age}</span>
                        <span className={styles.metaChip}>{f.type}</span>
                        {f.topic.slice(0, 2).map((t) => (
                          <span key={t} className={styles.metaChip}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <span
                        className={styles.cardCta}
                        style={{
                          background: `linear-gradient(135deg,${f.color},${f.color}cc)`,
                        }}
                      >
                        Open tool →
                      </span>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        </div>

        <section className={styles.banner}>
          <p className={styles.bannerQuote}>
            &ldquo;For the word of God is alive and active. Sharper than any double-edged
            sword.&rdquo;
          </p>
          <div className={styles.bannerRef}>— Hebrews 4:12</div>
          <Link to="/explore/bible" className={styles.bannerLink}>
            📖 Start Reading →
          </Link>
        </section>

        <div className={styles.bottomCta}>
          <div className={styles.bottomTitle}>Ready to go deeper?</div>
          <div className={styles.bottomLinks}>
            <Link to="/ai" className={styles.bottomLinkPrimary}>
              🤖 AI Tools →
            </Link>
            <Link to="/play" className={styles.bottomLink}>
              🎮 Play Games →
            </Link>
            <Link to="/grow" className={styles.bottomLink}>
              🌱 Grow in Faith →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
