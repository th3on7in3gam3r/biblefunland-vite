const CATEGORY_EMOJI = { streaks: '🔥', badges: '🏆', trivia: '🎯' }

/**
 * LeaderboardRow — single ranked entry
 * Props:
 *   entry        LeaderboardEntry { rank, userId, displayName, avatarUrl, score, isLegendary }
 *   isCurrentUser boolean
 *   isPinned     boolean — renders a separator above the row
 *   category     'streaks' | 'badges' | 'trivia'
 */
export default function LeaderboardRow({ entry, isCurrentUser, isPinned, category }) {
  const emoji = CATEGORY_EMOJI[category] || '⭐'

  return (
    <>
      {isPinned && (
        <div style={{
          textAlign: 'center',
          fontSize: '.72rem',
          fontWeight: 700,
          color: 'var(--ink3)',
          padding: '8px 0 4px',
          letterSpacing: '.05em',
          textTransform: 'uppercase',
        }}>
          — Your Rank —
        </div>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        background: isCurrentUser ? 'var(--blue-bg, #EFF6FF)' : 'var(--surface)',
        border: `1.5px solid ${isCurrentUser ? 'var(--blue, #3B82F6)' : 'var(--border)'}`,
        marginBottom: 8,
      }}>
        {/* Rank */}
        <div style={{
          minWidth: 32,
          fontFamily: "'Baloo 2', cursive",
          fontWeight: 800,
          fontSize: '1rem',
          color: 'var(--ink3)',
          textAlign: 'center',
        }}>
          #{entry.rank}
        </div>

        {/* Avatar */}
        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', fontWeight: 800, color: '#fff', fontFamily: "'Baloo 2', cursive" }}>
          {entry.avatarUrl
            ? <img src={entry.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (entry.displayName?.[0] || '?').toUpperCase()}
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700,
            fontSize: '.9rem',
            color: 'var(--ink)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {entry.displayName}
            {entry.isLegendary && <span style={{ marginLeft: 4 }}>👑</span>}
            {isCurrentUser && <span style={{ marginLeft: 6, fontSize: '.7rem', fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-bg)', padding: '1px 6px', borderRadius: 99 }}>You</span>}
          </div>
        </div>

        {/* Score */}
        <div style={{
          fontFamily: "'Baloo 2', cursive",
          fontWeight: 800,
          fontSize: '1rem',
          color: 'var(--ink)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {emoji} {entry.score.toLocaleString()}
        </div>
      </div>
    </>
  )
}
