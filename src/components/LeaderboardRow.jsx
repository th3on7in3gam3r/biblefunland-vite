const CATEGORY_EMOJI = { streaks: '🔥', badges: '🏅', trivia: '🏆' };
const RANK_COLORS = ['#F59E0B', '#94A3B8', '#CD7F32'];

export default function LeaderboardRow({ entry, isCurrentUser, isPinned, category, kidsMode, accentColor }) {
  const emoji = CATEGORY_EMOJI[category] || '⭐';
  const rankColor = entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : (isCurrentUser ? (accentColor || '#3B82F6') : 'var(--ink3)');
  const isTop3 = entry.rank <= 3;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: kidsMode ? '13px 16px' : '11px 14px',
        borderRadius: 14,
        background: isCurrentUser
          ? `linear-gradient(135deg, ${accentColor || '#3B82F6'}12, ${accentColor || '#3B82F6'}06)`
          : isTop3 ? `${rankColor}08` : 'var(--surface)',
        border: `1.5px solid ${isCurrentUser ? (accentColor || '#3B82F6') + '50' : isTop3 ? rankColor + '30' : 'var(--border)'}`,
        marginBottom: 8,
        transition: 'background 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar for current user */}
      {isCurrentUser && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: accentColor || '#3B82F6',
          borderRadius: '3px 0 0 3px',
        }} />
      )}

      {/* Rank */}
      <div style={{
        minWidth: 36,
        fontFamily: "'Baloo 2', cursive",
        fontWeight: 800,
        fontSize: kidsMode ? '1.1rem' : '.95rem',
        color: rankColor,
        textAlign: 'center',
        flexShrink: 0,
      }}>
        {isTop3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
      </div>

      {/* Avatar */}
      <div style={{
        width: kidsMode ? 42 : 38,
        height: kidsMode ? 42 : 38,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: kidsMode ? '1rem' : '.9rem',
        fontWeight: 800,
        color: '#fff',
        fontFamily: "'Baloo 2', cursive",
        border: isCurrentUser ? `2px solid ${accentColor || '#3B82F6'}` : '2px solid transparent',
        boxShadow: isCurrentUser ? `0 0 0 2px ${accentColor || '#3B82F6'}30` : 'none',
      }}>
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          (entry.displayName?.[0] || '?').toUpperCase()
        )}
      </div>

      {/* Name + tags */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700,
          fontSize: kidsMode ? '.95rem' : '.88rem',
          color: 'var(--ink)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          {entry.displayName}
          {entry.isLegendary && <span>👑</span>}
          {isCurrentUser && (
            <span style={{
              fontSize: '.65rem', fontWeight: 800,
              color: accentColor || '#3B82F6',
              background: `${accentColor || '#3B82F6'}18`,
              padding: '1px 7px', borderRadius: 99,
              border: `1px solid ${accentColor || '#3B82F6'}30`,
              flexShrink: 0,
            }}>
              You
            </span>
          )}
        </div>
      </div>

      {/* Score */}
      <div style={{
        fontFamily: "'Baloo 2', cursive",
        fontWeight: 800,
        fontSize: kidsMode ? '1.05rem' : '.95rem',
        color: isCurrentUser ? (accentColor || '#3B82F6') : 'var(--ink)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}>
        {emoji} {entry.score.toLocaleString()}
      </div>
    </div>
  );
}
