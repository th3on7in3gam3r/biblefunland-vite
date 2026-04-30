import React from 'react';

export default function ProgressBar({ value, max = 100, label, accent = '#F59E0B' }) {
  const percent = Math.min(100, Math.round(((Number(value) || 0) / Number(max || 100)) * 100));

  return (
    <div style={{ width: '100%', marginTop: 8 }}>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontSize: '.78rem',
            color: 'var(--ink3)',
          }}
        >
          <span>{label}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: 12,
          borderRadius: 999,
          background: 'rgba(90, 100, 150, 0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${accent} 0%, #FCD34D 70%)`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <div style={{ marginTop: 4, fontSize: '.68rem', color: 'var(--ink2)' }}>
        {Number(value) || 0}/{max}
      </div>
    </div>
  );
}
