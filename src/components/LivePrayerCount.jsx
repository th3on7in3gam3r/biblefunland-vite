import { useRealTime } from '../context/RealTimeContext';

export default function LivePrayerCount({ compact = false }) {
  const { prayers, kidsMode } = useRealTime();

  if (compact) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '.72rem',
          fontWeight: 700,
          color: '#10B981',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 6px #10B981',
            display: 'inline-block',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        {prayers.total.toLocaleString()} prayers
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </span>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 99,
        background: 'rgba(16,185,129,.1)',
        border: '1px solid rgba(16,185,129,.2)',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#10B981',
          boxShadow: '0 0 8px #10B981',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      <span style={{ fontSize: '.78rem', fontWeight: 800, color: '#10B981' }}>
        {prayers.live ? `${prayers.total.toLocaleString()} prayers live` : 'Prayer Wall'}
      </span>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}
