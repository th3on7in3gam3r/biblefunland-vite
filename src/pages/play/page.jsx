import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStreak } from '../../context/StreakContext';
import usePageMetadata from '../../hooks/usePageMetadata';
import { trackPulseEvent } from '../../lib/pulse';
import {
  PLAY_FEATURES,
  PLAY_STATS,
  PLAY_AGE_OPTIONS,
  PLAY_CATEGORY_OPTIONS,
  PLAY_TYPE_OPTIONS,
  KIDS_LEARNING_LINKS,
  filterPlayFeatures,
  getFeaturedPlayFeatures,
} from '../../data/playFeatures';
import styles from './Play.module.css';

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
  if (field === 'category') return `${styles.pill} ${styles.pillActiveCategory}`;
  return `${styles.pill} ${styles.pillActiveType}`;
}

export default function PlayOverview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { streak } = useStreak();

  usePageMetadata({
    title: 'Play Hub — Free Bible Games & Activities for Kids',
    description:
      'Scripture trivia, David & Goliath, escape rooms, flashcards, printables, and daily challenges — free Bible games for kids and families.',
  });

  const ageFilter = arrayFromParam(searchParams, 'age');
  const categoryFilter = arrayFromParam(searchParams, 'category');
  const typeFilter = arrayFromParam(searchParams, 'type');

  const filteredGames = useMemo(
    () =>
      filterPlayFeatures(PLAY_FEATURES, {
        age: ageFilter,
        category: categoryFilter,
        type: typeFilter,
      }),
    [ageFilter, categoryFilter, typeFilter]
  );

  const featured = getFeaturedPlayFeatures(filteredGames);
  const hasFilters = ageFilter.length || categoryFilter.length || typeFilter.length;

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
    nextParams.delete('category');
    nextParams.delete('type');
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div
          className={styles.heroGlow}
          style={{
            width: 280,
            height: 280,
            background: 'radial-gradient(circle,#60A5FA30 0%,transparent 70%)',
            top: '5%',
            left: '8%',
          }}
        />
        <div
          className={styles.heroGlow}
          style={{
            width: 320,
            height: 320,
            background: 'radial-gradient(circle,#C084FC25 0%,transparent 70%)',
            top: '10%',
            right: '5%',
          }}
        />

        <div className={styles.heroInner}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Bible Games · Faith-Powered Fun
          </div>

          <h1 className={styles.title}>
            Play &amp; Learn <span className={styles.titleAccent}>God&apos;s Word</span>
          </h1>

          <p className={styles.subtitle}>
            Trivia, arcade games, escape rooms, flashcards, and printables — all rooted in
            Scripture. Completely free.
          </p>

          <div className={styles.heroActions}>
            <Link
              to="/play/trivia"
              className={styles.heroBtnPrimary}
              onClick={() => trackPulseEvent('game_started', { game: 'trivia', source: 'play_hub' })}
            >
              ❓ Play Trivia
            </Link>
            <Link
              to="/play/game/runner"
              className={styles.heroBtnGhost}
              onClick={() => trackPulseEvent('game_started', { game: 'ScriptureRunner', source: 'play_hub' })}
            >
              🏃 Scripture Runner
            </Link>
            <button
              type="button"
              className={styles.heroBtnGhost}
              onClick={() => scrollToSection('play-games')}
            >
              🎮 All Games ↓
            </button>
          </div>

          <div className={styles.stats}>
            {PLAY_STATS.map(({ n, label }) => (
              <div key={label}>
                <div className={styles.statNum}>{n}</div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {streak > 0 && (
        <div className={styles.streakBar}>
          <span>🔥</span>
          <span className={styles.streakText}>
            You&apos;re on a {streak}-day streak! Keep it going — play a game today.
          </span>
          <Link to="/play/trivia" className={styles.streakLink}>
            Play Now →
          </Link>
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.quickJump}>
          {PLAY_FEATURES.map((g) => (
            <button
              key={g.id}
              type="button"
              className={styles.quickPill}
              style={{ '--pill-color': g.color }}
              onClick={() => scrollToSection(g.id)}
            >
              {g.icon} {g.title}
            </button>
          ))}
        </div>

        {featured.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={`${styles.sectionEyebrow} ${styles.sectionEyebrowFeatured}`}>
                  ⭐ Featured
                </span>
                <h2 className={styles.sectionTitle}>Most Popular Right Now</h2>
              </div>
              <button
                type="button"
                className={styles.scrollLink}
                onClick={() => scrollToSection('play-games')}
              >
                See all games →
              </button>
            </div>

            <div className={styles.featuredGrid}>
              {featured.map((g) => (
                <Link
                  key={g.id}
                  to={g.to}
                  className={styles.card}
                  style={{ textDecoration: 'none' }}
                >
                  <article
                    className={styles.featuredCard}
                    style={{
                      borderColor: `${g.color}30`,
                      background: `linear-gradient(135deg,${g.color}12,${g.color}04)`,
                      boxShadow: `0 8px 32px ${g.color}15`,
                    }}
                  >
                    <span className={styles.hotBadge}>🔥 HOT</span>
                    <div
                      className={styles.cardBanner}
                      style={{ background: `linear-gradient(135deg,${g.color}20,transparent)` }}
                    >
                      <div className={styles.cardIcon}>{g.icon}</div>
                      <span
                        className={styles.cardTag}
                        style={{ background: g.color }}
                      >
                        {g.tag}
                      </span>
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{g.title}</h3>
                      <p className={styles.cardDesc}>{g.desc}</p>
                      <div className={styles.cardVerse} style={{ color: g.color }}>
                        📖 {g.verse}
                      </div>
                      <span
                        className={styles.cardCta}
                        style={{
                          background: g.color,
                          boxShadow: `0 4px 14px ${g.color}40`,
                        }}
                      >
                        ▶ Play Now
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={styles.filters} aria-label="Filter games">
          <div className={styles.filtersHeader}>
            <h2 className={styles.filtersTitle}>Find the right game</h2>
            <span className={styles.filtersCount}>
              {filteredGames.length} of {PLAY_FEATURES.length}
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
              {PLAY_AGE_OPTIONS.map((opt) => (
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
            <span className={styles.filterLabel}>🎮 Category</span>
            <div className={styles.pillRow}>
              {PLAY_CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={pillClass('category', categoryFilter.includes(cat))}
                  onClick={() => onToggle('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>🎯 Type</span>
            <div className={styles.pillRow}>
              {PLAY_TYPE_OPTIONS.map((type) => (
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

        <div id="play-games">
          <span className={`${styles.sectionEyebrow} ${styles.sectionEyebrowGames}`}>
            🎮 All Games
          </span>
          <h2 className={styles.sectionTitle}>Browse every Bible game &amp; activity</h2>

          <div className={styles.grid}>
            {filteredGames.length === 0 ? (
              <div className={styles.empty}>
                No games match your filters.{' '}
                <button type="button" className={styles.clearBtn} onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              filteredGames.map((g) => (
                <Link key={g.id} to={g.to} className={styles.card} id={g.id}>
                  <article className={styles.cardInner}>
                    <div
                      className={styles.cardBanner}
                      style={{
                        background: `linear-gradient(135deg,${g.color}18,${g.color}06)`,
                      }}
                    >
                      <div className={styles.cardIcon}>{g.icon}</div>
                      <span
                        className={styles.cardTag}
                        style={{ background: g.color }}
                      >
                        {g.tag}
                      </span>
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{g.title}</h3>
                      <p className={styles.cardDesc}>{g.desc}</p>
                      <div className={styles.cardVerse} style={{ color: g.color }}>
                        📖 {g.verse}
                      </div>
                      <span
                        className={styles.cardCta}
                        style={{
                          background: g.color,
                          boxShadow: `0 4px 14px ${g.color}35`,
                        }}
                      >
                        {g.type === 'Printable' ? '🖨️ View Sheets' : '▶ Play Now'}
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
            &ldquo;Your word is a lamp for my feet, a light on my path.&rdquo;
          </p>
          <div className={styles.bannerRef}>— Psalm 119:105</div>
          <Link to="/explore/bible" className={styles.bannerLink}>
            📖 Read the Bible →
          </Link>
        </section>

        <section className={styles.kidsCorner}>
          <div className={styles.kidsHeader}>
            <span style={{ fontSize: '2.5rem' }}>🐣</span>
            <div>
              <div className={styles.kidsTitle}>Little Learners Corner</div>
              <div className={styles.kidsSubtitle}>Ages 3–8 · Safe · Fun · Faith-filled</div>
            </div>
          </div>
          <div className={styles.kidsLinks}>
            {KIDS_LEARNING_LINKS.map(({ label, to }) => (
              <Link key={to} to={to} className={styles.kidsLink}>
                {label}
              </Link>
            ))}
          </div>
        </section>

        <div className={styles.bottomCta}>
          <div className={styles.bottomTitle}>
            Want more? Explore AI tools, Bible study, and community features.
          </div>
          <div className={styles.bottomLinks}>
            <Link to="/ai" className={styles.bottomLinkPrimary}>
              🤖 AI Tools →
            </Link>
            <Link to="/explore" className={styles.bottomLink}>
              🔍 Explore →
            </Link>
            <Link to="/grow" className={styles.bottomLink}>
              🌱 Grow →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
