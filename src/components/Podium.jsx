import { motion } from 'framer-motion';

const MEDAL_CONFIG = [
  { medal: '🥇', color: '#F59E0B', glow: '#FCD34D', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', border: '#F59E0B', label: '1st', height: 80 },
  { medal: '🥈', color: '#94A3B8', glow: '#CBD5E1', bg: 'linear-gradient(135deg,#F1F5F9,#E2E8F0)', border: '#94A3B8', label: '2nd', height: 56 },
  { medal: '🥉', color: '#CD7F32', glow: '#D97706', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', border: '#CD7F32', label: '3rd', height: 44 },
];

const CATEGORY_EMOJI = { streaks: '🔥', badges: '🏅', trivia: '🏆' };
const CATEGORY_UNIT  = { streaks: 'day streak', badges: 'badges', trivia: 'pts' };

function PodiumCard({ entry, rank, category, kidsMode }) {
  const cfg = MEDAL_CONFIG[rank - 1];
  const emoji = CATEGORY_EMOJI[category] || '⭐';
  const unit = CATEGORY_UNIT[category] || '';
  const avatarSize = rank === 1 ? (kidsMode ? 88 : 80) : (kidsMode ? 72 : 64);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (rank - 1) * 0.1, duration: 0.45, type: 'spring', stiffness: 260, damping: 20 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: rank === 1 ? 1.15 : 1,
      }}
    >
      {/* Medal */}
      <div style={{ fontSize: rank === 1 ? '2rem' : '1.5rem', marginBottom: 6, filter: `drop-shadow(0 2px 8px ${cfg.glow}80)` }}>
        {cfg.medal}
      </div>

      {/* Avatar */}
      <div style={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: avatarSize * 0.38,
        fontWeight: 800,
        color: '#fff',
        fontFamily: "'Baloo 2', cursive",
        border: `3px solid ${cfg.color}`,
        boxShadow: `0 0 0 3px ${cfg.color}30, 0 8px 24px ${cfg.color}40`,
        marginBottom: 10,
        flexShrink: 0,
      }}>
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          (entry.displayName?.[0] || '?').toUpperCase()
        )}
      </div>

      {/* Card */}
      <div style={{
        background: cfg.bg,
        border: `2px solid ${cfg.color}40`,
        borderRadius: 16,
        padding: rank === 1 ? '14px 16px' : '10px 14px',
        textAlign: 'center',
        width: '100%',
        boxShadow: rank === 1 ? `0 8px 24px ${cfg.color}30` : `0 4px 12px ${cfg.color}18`,
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: rank === 1 ? '.9rem' : '.8rem',
          color: '#1E1B4B',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginBottom: 4,
        }}>
          {entry.displayName}
          {entry.isLegendary && ' 👑'}
        </div>
        <div style={{
          fontFamily: "'Baloo 2', cursive",
          fontWeight: 800,
          fontSize: rank === 1 ? '1.1rem' : '.95rem',
          color: cfg.color,
        }}>
          {emoji} {entry.score.toLocaleString()}
          {kidsMode && <span style={{ fontSize: '.65rem', fontWeight: 600, color: '#6B7280', marginLeft: 3 }}>{unit}</span>}
        </div>
      </div>

      {/* Podium block */}
      <div style={{
        width: '80%',
        height: cfg.height,
        background: `linear-gradient(180deg, ${cfg.color}30, ${cfg.color}15)`,
        border: `1.5px solid ${cfg.color}30`,
        borderRadius: '0 0 8px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
      }}>
        <span style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: '1.1rem', color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
    </motion.div>
  );
}

export default function Podium({ entries, category, kidsMode }) {
  if (!entries || entries.length === 0) return null;

  const [first, second, third] = entries;

  // Desktop: 2nd | 1st | 3rd  (podium order)
  // Mobile: 1st → 2nd → 3rd  (stacked)
  return (
    <>
      <div className="podium-desktop" style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 12,
        padding: '8px 8px 24px',
      }}>
        {second && <PodiumCard entry={second} rank={2} category={category} kidsMode={kidsMode} />}
        {first  && <PodiumCard entry={first}  rank={1} category={category} kidsMode={kidsMode} />}
        {third  && <PodiumCard entry={third}  rank={3} category={category} kidsMode={kidsMode} />}
      </div>

      <div className="podium-mobile" style={{ display: 'none', flexDirection: 'column', gap: 12, padding: '8px 0 16px' }}>
        {[first, second, third].filter(Boolean).map((e, i) => (
          <PodiumCard key={e.userId} entry={e} rank={i + 1} category={category} kidsMode={kidsMode} />
        ))}
      </div>

      <style>{`
        .podium-desktop { display: flex !important; }
        .podium-mobile  { display: none !important; }
        @media (max-width: 560px) {
          .podium-desktop { display: none !important; }
          .podium-mobile  { display: flex !important; }
        }
      `}</style>
    </>
  );
}
