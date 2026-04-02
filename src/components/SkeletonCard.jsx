import React from 'react';

export default function SkeletonCard() {
  return (
    <section className="skeleton-card" aria-hidden="true" style={{ minHeight: 220 }}>
      <div
        style={{
          width: '100%',
          height: 140,
          background: 'rgba(255,255,255,0.35)',
          borderRadius: 12,
        }}
      />
      <div
        style={{
          marginTop: 10,
          height: 16,
          background: 'rgba(255,255,255,0.35)',
          borderRadius: 8,
          width: '80%',
        }}
      />
      <div
        style={{
          marginTop: 8,
          height: 12,
          background: 'rgba(255,255,255,0.32)',
          borderRadius: 8,
          width: '60%',
        }}
      />
      <div
        style={{
          marginTop: 8,
          height: 12,
          background: 'rgba(255,255,255,0.32)',
          borderRadius: 8,
          width: '70%',
        }}
      />
    </section>
  );
}
