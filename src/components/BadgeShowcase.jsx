import React from 'react';

export default function BadgeShowcase({ badges = [] }) {
  if (!Array.isArray(badges) || badges.length === 0) {
    return (
      <div style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>
        No badges yet. Keep learning to unlock your first one!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: 2 }}>
      {badges.map((badge) => (
        <div
          key={badge.badge_id || badge.id || badge}
          style={{
            minWidth: 120,
            maxWidth: 120,
            background: 'var(--surface)',
            borderRadius: 14,
            border: '1px solid var(--border)',
            padding: 10,
            textAlign: 'center',
            boxShadow: '0 8px 18px rgba(0,0,0,.08)',
          }}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{badge.emoji || '🏅'}</div>
          <div style={{ fontWeight: 700, fontSize: '.8rem', marginBottom: 4 }}>
            {badge.name || badge.badge_id || 'Unknown'}
          </div>
          <div style={{ color: 'var(--ink3)', fontSize: '.68rem' }}>
            {badge.description || badge.earned_at?.slice(0, 10) || ''}
          </div>
        </div>
      ))}
    </div>
  );
}
