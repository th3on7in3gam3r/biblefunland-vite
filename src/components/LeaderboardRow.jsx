const CATEGORY_EMOJI = { streaks: '🔥', badges: '🏅', trivia: '🏆' };
const CATEGORY_UNIT  = { streaks: 'day streak', badges: 'badges', trivia: 'pts' };
const RANK_COLORS    = ['#F59E0B', '#64748B', '#B45309'];

// Deterministic avatar color from name
const AVATAR_COLORS = [
  'linear-gradient(135deg,#6366F1,#8B5CF6)',
  'linear-gradient(135deg,#3B82F6,#06B6D4)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)',
  'linear-gradient(135deg,#14B8A6,#3B82F6)',
];

function avatarGradient(name) {
  if (!name) return AVATAR_COLORS[0];
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export default function LeaderboardRow({ entry, isCurrentUser, category, kidsMode, accentColor }) {
  const emoji = CATEGORY_EMOJI[category] || '⭐';
  const unit  = CATEGORY_UNIT[category]  || '';
  const isTop3 = entry.rank <= 3;
  const rankColor = isTop3
    ? RANK_COLORS[entry.rank - 1]
    : isCurrentUser ? (accentColor || '#3B82F6') : 'var(--ink3)';

  const rowBg = isCurrentUser
    ? `linear-gradient(135deg, ${accentColor || '#3B82F6'}10, ${accentColor || '#3B82F6'}05)`
    : isTop3
      ? `${RANK_COLORS[entry.rank - 1]}07`
      : 'var(--surface)';

  const rowBorder = isCurrentUser
    ? `${accentColor || '#3B82F6'}45`
    : isTop3
      ? `${RANK_COLORS[entry.rank - 1]}28`
      : 'var(--border)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: kidsMode ? '14px 16px' : '11px 14px',
      borderRadius: 14,
      background: rowBg,
      border: `1.5px solid ${rowBorder}`,
      marginBottom: 8,
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.2s',
    }}>
      {/* Current user accent bar */}
      {isCurrentUser && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: accentColor || '#3B82F6',
          borderRadius: '3px 0 0 3px',
        }} />
      )}

      {/* Rank */}
      <div style={{
        minWidth: 38, textAlign: 'center', flexShrink: 0,
        fontFamily: "'Baloo 2', cursive", fontWeight: 800,
        fontSize: kidsMode ? '1.15rem' : '1rem',
        color: rankColor,
        lineHeight: 1,
      }}>
        {isTop3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
      </div>

      {/* Avatar */}
      <div style={{
        width: kidsMode ? 44 : 40, height: kidsMode ? 44 : 40,
        borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        background: entry.avatarUrl ? 'transparent' : avatarGradient(entry.displayName),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: kidsMode ? '1.05rem' : '.92rem',
        fontWeight: 800, color: '#fff',
        fontFamily: "'Baloo 2', cursive",
        border: isCurrentUser
          ? `2.5px solid ${accentColor || '#3B82F6'}`
          : `2px solid ${isTop3 ? RANK_COLORS[entry.rank - 1] + '50' : 'transparent'}`,
        boxShadow: isCurrentUser ? `0 0 0 2px ${accentColor || '#3B82F6'}25` : 'none',
      }}>
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          (entry.displayName?.[0] || '?').toUpperCase()
        )}
      </div>

      {/* Name + stat label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontWeight: 700,
          fontSize: kidsMode ? '.95rem' : '.88rem',
          color: 'var(--ink)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 2,
        }}>
          {entry.displayName || 'Anonymous'}
          {entry.isLegendary && <span style={{ fontSize: '.85em' }}>👑</span>}
          {isCurrentUser && (
            <span style={{
              fontSize: '.62rem', fontWeight: 800, flexShrink: 0,
              color: accentColor || '#3B82F6',
              background: `${accentColor || '#3B82F6'}18`,
              padding: '1px 7px', borderRadius: 99,
              border: `1px solid ${accentColor || '#3B82F6'}30`,
            }}>
              You
            </span>
          )}
        </div>
        {/* Stat label below name */}
        <div style={{
          fontSize: kidsMode ? '.72rem' : '.68rem',
          color: 'var(--ink3)', fontWeight: 600,
        }}>
          {emoji} {entry.score.toLocaleString()} {unit}
        </div>
      </div>

      {/* Score badge (right side) */}
      <div style={{
        fontFamily: "'Baloo 2', cursive", fontWeight: 800,
        fontSize: kidsMode ? '1.05rem' : '.95rem',
        color: isCurrentUser ? (accentColor || '#3B82F6') : rankColor !== 'var(--ink3)' ? rankColor : 'var(--ink)',
        whiteSpace: 'nowrap', flexShrink: 0,
        background: isCurrentUser ? `${accentColor || '#3B82F6'}12` : isTop3 ? `${rankColor}12` : 'var(--bg2)',
        padding: '4px 10px', borderRadius: 99,
        border: `1px solid ${isCurrentUser ? `${accentColor || '#3B82F6'}25` : isTop3 ? `${rankColor}25` : 'var(--border)'}`,
      }}>
        {emoji} {entry.score.toLocaleString()}
      </div>
    </div>
  );
}
