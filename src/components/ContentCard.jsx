import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Tooltip from './Tooltip';

// Map title keywords → gradient + emoji for the banner
const CARD_THEMES = {
  trivia: { bg: 'linear-gradient(135deg,#1E1B4B,#3B82F6)', emoji: '❓', accent: '#60A5FA' },
  runner: { bg: 'linear-gradient(135deg,#064E3B,#10B981)', emoji: '🏃', accent: '#34D399' },
  david: { bg: 'linear-gradient(135deg,#831843,#EC4899)', emoji: '🏹', accent: '#F9A8D4' },
  goliath: { bg: 'linear-gradient(135deg,#831843,#EC4899)', emoji: '🏹', accent: '#F9A8D4' },
  spin: { bg: 'linear-gradient(135deg,#2E1065,#8B5CF6)', emoji: '🎰', accent: '#C4B5FD' },
  escape: { bg: 'linear-gradient(135deg,#431407,#F97316)', emoji: '🧩', accent: '#FED7AA' },
  flashcard: { bg: 'linear-gradient(135deg,#1E1B4B,#6366F1)', emoji: '🧠', accent: '#A5B4FC' },
  activity: { bg: 'linear-gradient(135deg,#065F46,#14B8A6)', emoji: '🖨️', accent: '#99F6E4' },
  challenge: { bg: 'linear-gradient(135deg,#78350F,#F59E0B)', emoji: '📅', accent: '#FDE68A' },
  scripture: { bg: 'linear-gradient(135deg,#1E1B4B,#3B82F6)', emoji: '📖', accent: '#93C5FD' },
  // Explore items
  voice: { bg: 'linear-gradient(135deg,#0C4A6E,#0369A1)', emoji: '🎙️', accent: '#7DD3FC' },
  reader: { bg: 'linear-gradient(135deg,#0C4A6E,#0369A1)', emoji: '🎙️', accent: '#7DD3FC' },
  'bible map': { bg: 'linear-gradient(135deg,#1E3A5F,#3B82F6)', emoji: '🗺️', accent: '#93C5FD' },
  timeline: { bg: 'linear-gradient(135deg,#2E1065,#8B5CF6)', emoji: '📜', accent: '#C4B5FD' },
  language: { bg: 'linear-gradient(135deg,#78350F,#F59E0B)', emoji: '🔤', accent: '#FDE68A' },
  original: { bg: 'linear-gradient(135deg,#78350F,#F59E0B)', emoji: '🔤', accent: '#FDE68A' },
  cross: { bg: 'linear-gradient(135deg,#831843,#EC4899)', emoji: '🔗', accent: '#F9A8D4' },
  reference: { bg: 'linear-gradient(135deg,#831843,#EC4899)', emoji: '🔗', accent: '#F9A8D4' },
};

function getTheme(title = '') {
  const t = title.toLowerCase();
  for (const [key, theme] of Object.entries(CARD_THEMES)) {
    if (t.includes(key)) return theme;
  }
  return { bg: 'linear-gradient(135deg,#1E1B4B,#8B5CF6)', emoji: '✝️', accent: '#C4B5FD' };
}

function difficultyStars(difficulty = 0) {
  const max = 5;
  return [...Array(max)].map((_, idx) => (
    <span
      key={idx}
      role="img"
      aria-label={idx < difficulty ? 'filled star' : 'empty star'}
      style={{ color: idx < difficulty ? '#FBBF24' : '#D1D5DB', marginRight: 2, fontSize: '1rem' }}
    >
      ★
    </span>
  ));
}

export default function ContentCard({
  thumbnail,
  title,
  description,
  bibleRef,
  age,
  link,
  cta,
  difficulty = 0,
  isPrintable = false,
  seasonal = null,
  proOnly = false,
  tooltip = null,
}) {
  const theme = getTheme(title);

  const badgeColor = age?.toLowerCase()?.includes('tween')
    ? '#10B981'
    : age?.toLowerCase()?.includes('family')
      ? '#8B5CF6'
      : age?.toLowerCase()?.includes('elementary')
        ? '#F59E0B'
        : age?.toLowerCase()?.includes('preschool')
          ? '#EC4899'
          : '#3B82F6';

  return (
    <article
      style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1.5px solid var(--border)',
        overflow: 'hidden',
        transition: 'all .25s',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 12px rgba(0,0,0,.06)',
      }}
      aria-label={`${title} content card`}
      tabIndex={0}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.12)';
        e.currentTarget.style.borderColor = theme.accent + '88';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* ── Rich banner (replaces broken backgroundImage) ── */}
      <div
        style={{
          height: 130,
          background: theme.bg,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.06)',
            top: -30,
            right: -30,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.04)',
            bottom: -20,
            left: -20,
          }}
        />
        {/* Cross watermark */}
        <div
          style={{
            position: 'absolute',
            fontSize: '5rem',
            opacity: 0.06,
            userSelect: 'none',
            fontFamily: 'serif',
          }}
        >
          ✝
        </div>
        {/* Main emoji */}
        <div
          style={{
            fontSize: '3.5rem',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))',
          }}
        >
          {theme.emoji}
        </div>
        {/* Age badge top-left */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 12,
            fontSize: '.6rem',
            fontWeight: 800,
            padding: '3px 9px',
            borderRadius: 99,
            background: 'rgba(255,255,255,.15)',
            color: 'white',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,.2)',
          }}
        >
          📍 {age || 'All Ages'}
        </div>
        {/* Pro badge */}
        {proOnly && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 12,
              fontSize: '.6rem',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: 99,
              background: 'linear-gradient(135deg,#F59E0B,#F97316)',
              color: 'white',
            }}
          >
            💎 Pro
          </div>
        )}
        {/* Seasonal ribbon */}
        {seasonal && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,.35)',
              padding: '4px 12px',
              fontSize: '.65rem',
              fontWeight: 700,
              color: theme.accent,
              textAlign: 'center',
            }}
          >
            {seasonal}
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Bible ref chip */}
        {bibleRef && (
          <div
            style={{
              fontSize: '.65rem',
              fontWeight: 700,
              color: theme.accent.replace('var(--', '').replace(')', '') || '#8B5CF6',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: badgeColor,
                display: 'inline-block',
              }}
            />
            📖 {bibleRef}
          </div>
        )}

        <h3
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: '1rem',
            fontWeight: 800,
            color: 'var(--ink)',
            margin: '0 0 6px',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '.78rem',
            color: 'var(--ink3)',
            lineHeight: 1.6,
            margin: '0 0 10px',
            flex: 1,
          }}
        >
          {description}
        </p>

        {/* Difficulty stars */}
        {difficulty > 0 && (
          <div style={{ marginBottom: 12 }} aria-label={`Difficulty: ${difficulty} of 5`}>
            {difficultyStars(difficulty)}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Tooltip text={tooltip || `Click to play ${title} ↓`} position="top">
            <Link
              to={link}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 0',
                borderRadius: 12,
                background: `linear-gradient(135deg,${badgeColor},${badgeColor}cc)`,
                color: 'white',
                fontWeight: 800,
                fontSize: '.85rem',
                textDecoration: 'none',
                boxShadow: `0 4px 14px ${badgeColor}40`,
                transition: 'all .2s',
                width: '100%',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '.88')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              aria-label={`Play ${title}`}
            >
              ▶ {cta || 'Play'}
            </Link>
          </Tooltip>
          {isPrintable && (
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                padding: '8px 0',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--ink2)',
                fontWeight: 700,
                fontSize: '.82rem',
                cursor: 'pointer',
              }}
              aria-label={`Print ${title}`}
            >
              🖨️ Print
            </button>
          )}
          <Link
            to={link}
            style={{
              fontSize: '.72rem',
              color: 'var(--ink3)',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            Learn more →
          </Link>
        </div>
      </div>
    </article>
  );
}

ContentCard.propTypes = {
  thumbnail: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  bibleRef: PropTypes.string,
  age: PropTypes.string,
  link: PropTypes.string.isRequired,
  cta: PropTypes.string,
  difficulty: PropTypes.number,
  isPrintable: PropTypes.bool,
  seasonal: PropTypes.string,
  proOnly: PropTypes.bool,
  tooltip: PropTypes.string,
};
