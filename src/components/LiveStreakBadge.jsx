import { useRealTime } from '../context/RealTimeContext';
import { useStreak } from '../context/StreakContext';

export default function LiveStreakBadge({ showLabel = true }) {
  const { liveStreak, kidsMode } = useRealTime();
  const { streak } = useStreak();
  const display = liveStreak ?? streak;

  if (kidsMode) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          borderRadius: 99,
          background: 'linear-gradient(135deg,#FCD34D,#F97316)',
          color: '#1A0A00',
          fontFamily: "'Baloo 2',cursive",
          fontWeight: 800,
          fontSize: '1rem',
          boxShadow: '0 4px 16px rgba(249,115,22,.3)',
        }}
      >
        🔥 {display} {showLabel && 'day streak!'}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 99,
        background: 'rgba(249,115,22,.1)',
        border: '1px solid rgba(249,115,22,.2)',
        color: '#F97316',
        fontWeight: 800,
        fontSize: '.78rem',
      }}
    >
      🔥 {display}
      {showLabel && ' day streak'}
    </div>
  );
}
