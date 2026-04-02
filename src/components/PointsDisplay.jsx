import React from 'react';

export default function PointsDisplay({ points = 0, streak = 0, rank = null }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10,
        background: 'var(--surface)',
        borderRadius: 16,
        padding: '12px 12px',
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: '.7rem', color: 'var(--ink3)' }}>Points</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F59E0B' }}>
          {points.toLocaleString()}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '.7rem', color: 'var(--ink3)' }}>Streak</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34D399' }}>{streak}d</div>
      </div>
      <div>
        <div style={{ fontSize: '.7rem', color: 'var(--ink3)' }}>Rank</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60A5FA' }}>
          {rank === null ? '-' : `#${rank}`}
        </div>
      </div>
    </div>
  );
}
