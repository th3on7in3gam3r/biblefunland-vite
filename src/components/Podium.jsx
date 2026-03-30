const MEDALS = ['🥇', '🥈', '🥉'];
const CATEGORY_EMOJI = { streaks: '🔥', badges: '🏆', trivia: '🎯' };

function PodiumCard({ entry, category, size = 80 }) {
  const emoji = CATEGORY_EMOJI[category] || '⭐';
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{MEDALS[entry.rank - 1]}</div>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.35,
          fontWeight: 800,
          color: '#fff',
          fontFamily: "'Baloo 2', cursive",
          margin: '0 auto 8px',
          border: '3px solid var(--border)',
        }}
      >
        {entry.avatarUrl ? (
          <img
            src={entry.avatarUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          (entry.displayName?.[0] || '?').toUpperCase()
        )}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: '.82rem',
          color: 'var(--ink)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: size + 20,
          margin: '0 auto 2px',
        }}
      >
        {entry.displayName}
        {entry.isLegendary && ' 👑'}
      </div>
      <div
        style={{
          fontFamily: "'Baloo 2', cursive",
          fontWeight: 800,
          fontSize: '.9rem',
          color: 'var(--ink2)',
        }}
      >
        {emoji} {entry.score.toLocaleString()}
      </div>
    </div>
  );
}

/**
 * Podium — top 3 entries displayed as a podium
 * Desktop: 2nd | 1st | 3rd
 * Mobile (<640px): stacked 1st → 2nd → 3rd
 */
export default function Podium({ entries, category }) {
  if (!entries || entries.length === 0) return null;

  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  return (
    <>
      {/* Desktop layout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 16,
          padding: '24px 16px 16px',
        }}
        className="podium-desktop"
      >
        {second && <PodiumCard entry={second} category={category} size={80} />}
        {first && <PodiumCard entry={first} category={category} size={96} />}
        {third && <PodiumCard entry={third} category={category} size={80} />}
      </div>

      <style>{`
        .podium-desktop { display: flex !important; }
        .podium-mobile  { display: none !important; }
        @media (max-width: 639px) {
          .podium-desktop { display: none !important; }
          .podium-mobile  { display: flex !important; }
        }
      `}</style>

      {/* Mobile layout */}
      <div
        style={{
          display: 'none',
          flexDirection: 'column',
          gap: 12,
          padding: '16px',
        }}
        className="podium-mobile"
      >
        {[first, second, third].filter(Boolean).map((e) => (
          <PodiumCard key={e.userId} entry={e} category={category} size={72} />
        ))}
      </div>
    </>
  );
}
