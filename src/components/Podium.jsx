import { motion } from 'framer-motion';

const MEDAL_CONFIG = [
  {
    rank: 1, medal: '🥇', label: '1st Place',
    color: '#F59E0B', glow: '#FCD34D',
    cardBg: 'linear-gradient(145deg,#FFFBEB,#FEF3C7,#FDE68A)',
    avatarBg: 'linear-gradient(135deg,#F59E0B,#D97706)',
    border: '#F59E0B',
    podiumBg: 'linear-gradient(180deg,#FDE68A,#FCD34D)',
    podiumH: 88,
    avatarSize: 92,
    cardPad: '18px 16px',
    nameFz: '1rem',
    scoreFz: '1.25rem',
    shadow: '0 12px 40px rgba(245,158,11,0.45)',
    glowAnim: true,
  },
  {
    rank: 2, medal: '🥈', label: '2nd',
    color: '#64748B', glow: '#94A3B8',
    cardBg: 'linear-gradient(145deg,#F8FAFC,#F1F5F9,#E2E8F0)',
    avatarBg: 'linear-gradient(135deg,#94A3B8,#64748B)',
    border: '#94A3B8',
    podiumBg: 'linear-gradient(180deg,#E2E8F0,#CBD5E1)',
    podiumH: 60,
    avatarSize: 72,
    cardPad: '12px 14px',
    nameFz: '.88rem',
    scoreFz: '1rem',
    shadow: '0 6px 20px rgba(100,116,139,0.25)',
    glowAnim: false,
  },
  {
    rank: 3, medal: '🥉', label: '3rd',
    color: '#B45309', glow: '#D97706',
    cardBg: 'linear-gradient(145deg,#FFFBEB,#FEF3C7,#FDE68A)',
    avatarBg: 'linear-gradient(135deg,#D97706,#B45309)',
    border: '#D97706',
    podiumBg: 'linear-gradient(180deg,#FDE68A,#FCD34D)',
    podiumH: 44,
    avatarSize: 68,
    cardPad: '12px 14px',
    nameFz: '.88rem',
    scoreFz: '1rem',
    shadow: '0 6px 20px rgba(180,83,9,0.2)',
    glowAnim: false,
  },
];

const CATEGORY_EMOJI = { streaks: '🔥', badges: '🏅', trivia: '🏆' };
const CATEGORY_UNIT  = { streaks: 'day streak', badges: 'badges', trivia: 'pts' };

// Rank-based avatar gradient so initials always look distinct
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#F59E0B,#D97706)',
  'linear-gradient(135deg,#94A3B8,#64748B)',
  'linear-gradient(135deg,#D97706,#B45309)',
];

function PodiumCard({ entry, rank, category, kidsMode }) {
  const cfg = MEDAL_CONFIG[rank - 1];
  const emoji = CATEGORY_EMOJI[category] || '⭐';
  const unit = CATEGORY_UNIT[category] || '';
  const sz = kidsMode ? cfg.avatarSize + 12 : cfg.avatarSize;
  const isFirst = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: isFirst ? 30 : 20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: (rank - 1) * 0.1, duration: 0.5, type: 'spring', stiffness: 240, damping: 22 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: isFirst ? 1.2 : 1 }}
    >
      {/* Medal emoji */}
      <motion.div
        animate={cfg.glowAnim && !kidsMode ? { scale: [1, 1.12, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        style={{
          fontSize: isFirst ? (kidsMode ? '2.8rem' : '2.2rem') : (kidsMode ? '2rem' : '1.6rem'),
          marginBottom: 8,
          filter: `drop-shadow(0 3px 10px ${cfg.glow}90)`,
          lineHeight: 1,
        }}
      >
        {cfg.medal}
      </motion.div>

      {/* Avatar */}
      <div style={{
        width: sz, height: sz, borderRadius: '50%',
        overflow: 'hidden', flexShrink: 0,
        background: AVATAR_GRADIENTS[rank - 1],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: sz * 0.38, fontWeight: 800, color: '#fff',
        fontFamily: "'Baloo 2', cursive",
        border: `${isFirst ? 4 : 3}px solid ${cfg.color}`,
        boxShadow: isFirst
          ? `0 0 0 4px ${cfg.color}30, 0 0 24px ${cfg.color}50, 0 10px 30px ${cfg.color}40`
          : `0 0 0 3px ${cfg.color}25, 0 6px 16px ${cfg.color}30`,
        marginBottom: 12,
        position: 'relative',
      }}>
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          (entry.displayName?.[0] || '?').toUpperCase()
        )}
        {/* Crown for 1st */}
        {isFirst && (
          <div style={{
            position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
            fontSize: kidsMode ? '1.4rem' : '1.1rem', lineHeight: 1,
            filter: 'drop-shadow(0 2px 6px rgba(245,158,11,0.7))',
          }}>
            👑
          </div>
        )}
      </div>

      {/* Info card */}
      <div style={{
        background: cfg.cardBg,
        border: `2px solid ${cfg.color}${isFirst ? '60' : '35'}`,
        borderRadius: isFirst ? 18 : 14,
        padding: kidsMode ? '16px 14px' : cfg.cardPad,
        textAlign: 'center',
        width: '100%',
        boxShadow: cfg.shadow,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle shine on 1st */}
        {isFirst && (
          <div style={{
            position: 'absolute', top: 0, left: '-40%', width: '80%', height: '100%',
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Name */}
        <div style={{
          fontWeight: 800, fontSize: kidsMode ? '1rem' : cfg.nameFz,
          color: '#1E1B4B',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          {entry.displayName || 'Anonymous'}
          {entry.isLegendary && <span style={{ fontSize: '.9em' }}>👑</span>}
        </div>

        {/* Score */}
        <div style={{
          fontFamily: "'Baloo 2', cursive", fontWeight: 800,
          fontSize: kidsMode ? '1.2rem' : cfg.scoreFz,
          color: cfg.color, lineHeight: 1.2,
        }}>
          {emoji} {entry.score.toLocaleString()}
        </div>

        {/* Unit label */}
        <div style={{
          fontSize: kidsMode ? '.72rem' : '.65rem', fontWeight: 600,
          color: '#6B7280', marginTop: 2,
        }}>
          {unit}
        </div>

        {/* Kids mode sparkles on 1st */}
        {isFirst && kidsMode && (
          <div style={{ fontSize: '.9rem', marginTop: 4, letterSpacing: 2 }}>✨🌟✨</div>
        )}
      </div>

      {/* Podium block */}
      <div style={{
        width: '78%', height: cfg.podiumH,
        background: cfg.podiumBg,
        border: `1.5px solid ${cfg.color}40`,
        borderRadius: '0 0 10px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 0,
        boxShadow: `inset 0 -4px 8px rgba(0,0,0,0.08)`,
      }}>
        <span style={{
          fontFamily: "'Baloo 2', cursive", fontWeight: 800,
          fontSize: isFirst ? '1.15rem' : '1rem',
          color: isFirst ? '#92400E' : cfg.color,
        }}>
          {cfg.label}
        </span>
      </div>
    </motion.div>
  );
}

export default function Podium({ entries, category, kidsMode }) {
  if (!entries || entries.length === 0) return null;
  const [first, second, third] = entries;

  return (
    <>
      {/* Desktop: 2nd | 1st | 3rd */}
      <div className="podium-desktop" style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        gap: 10, padding: '20px 4px 28px',
      }}>
        {second && <PodiumCard entry={second} rank={2} category={category} kidsMode={kidsMode} />}
        {first  && <PodiumCard entry={first}  rank={1} category={category} kidsMode={kidsMode} />}
        {third  && <PodiumCard entry={third}  rank={3} category={category} kidsMode={kidsMode} />}
      </div>

      {/* Mobile: 1st → 2nd → 3rd stacked */}
      <div className="podium-mobile" style={{ display: 'none', flexDirection: 'column', gap: 14, padding: '8px 0 20px' }}>
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
