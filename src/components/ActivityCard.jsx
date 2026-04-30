/**
 * ActivityCard — reusable template for games, activities, and AI-generated content.
 * Drop this anywhere to add new content cleanly.
 *
 * Props:
 *   icon        string   — emoji or image URL
 *   title       string   — activity name
 *   desc        string   — short description
 *   to          string   — route to navigate to
 *   color       string   — accent color (hex)
 *   tag         string   — badge label (e.g. "New", "Easter", "Kids Fav")
 *   tagColor    string   — badge color override
 *   ageRange    string   — e.g. "6-9" or "All Ages"
 *   bibleRef    string   — e.g. "John 3:16"
 *   isPrintable bool     — shows Print button instead of Play
 *   isNew       bool     — shows "NEW" badge
 *   isSeasonal  string   — season id if seasonal
 *   onShare     func     — optional share callback
 */
import { Link } from 'react-router-dom';
import { Analytics } from '../lib/analytics';

export default function ActivityCard({
  icon = '🎮',
  title,
  desc,
  to,
  color = '#3B82F6',
  tag,
  tagColor,
  ageRange,
  bibleRef,
  isPrintable = false,
  isNew = false,
  isSeasonal = null,
  onShare,
  style: extraStyle = {},
}) {
  const badgeColor = tagColor || color;

  function handleClick() {
    Analytics.gameStarted(title, tag || 'general');
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 20,
        border: '1.5px solid #E5E7EB',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all .25s',
        position: 'relative',
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = `0 16px 40px ${color}20`;
        e.currentTarget.style.borderColor = color + '55';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = '#E5E7EB';
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: 100,
          background: `linear-gradient(135deg,${color}18,${color}08)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          position: 'relative',
        }}
      >
        {typeof icon === 'string' && icon.startsWith('http') ? (
          <img
            src={icon}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          icon
        )}

        {/* Badges */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 4,
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          {isNew && (
            <span
              style={{
                fontSize: '.58rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 99,
                background: '#10B981',
                color: 'white',
              }}
            >
              NEW
            </span>
          )}
          {tag && (
            <span
              style={{
                fontSize: '.58rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 99,
                background: badgeColor,
                color: 'white',
              }}
            >
              {tag}
            </span>
          )}
          {isSeasonal && (
            <span
              style={{
                fontSize: '.58rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 99,
                background: '#F97316',
                color: 'white',
              }}
            >
              🎄 Seasonal
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}
      >
        <div
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: '.95rem',
            fontWeight: 800,
            color: '#1E1B4B',
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
        {desc && (
          <p style={{ fontSize: '.76rem', color: '#6B7280', lineHeight: 1.6, flex: 1, margin: 0 }}>
            {desc}
          </p>
        )}

        {/* Meta row */}
        {(ageRange || bibleRef) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {ageRange && (
              <span
                style={{
                  fontSize: '.62rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 99,
                  background: '#EFF6FF',
                  color: '#3B82F6',
                }}
              >
                👶 Ages {ageRange}
              </span>
            )}
            {bibleRef && (
              <span
                style={{
                  fontSize: '.62rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 99,
                  background: '#F5F3FF',
                  color: '#8B5CF6',
                }}
              >
                📖 {bibleRef}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Link
            to={to}
            onClick={handleClick}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '8px 0',
              borderRadius: 10,
              background: color,
              color: 'white',
              fontWeight: 800,
              fontSize: '.78rem',
              textDecoration: 'none',
            }}
          >
            {isPrintable ? '🖨️ Print' : '▶ Play Now'}
          </Link>
          {onShare && (
            <button
              onClick={onShare}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                background: '#F8FAFF',
                border: '1.5px solid #E5E7EB',
                cursor: 'pointer',
                fontSize: '.8rem',
              }}
              title="Share"
            >
              🔗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ActivityGrid — wraps ActivityCard in a responsive grid.
 * Pass an array of activity objects matching ActivityCard props.
 */
export function ActivityGrid({
  activities = [],
  columns = 'repeat(auto-fill,minmax(240px,1fr))',
  gap = 18,
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: columns, gap }}>
      {activities.map((a, i) => (
        <ActivityCard key={a.id || i} {...a} />
      ))}
    </div>
  );
}
