import { Outlet, NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/community/prayer', label: '🙏 Prayer Wall' },
  { to: '/community/leaderboard', label: '🏆 Leaderboard' },
  { to: '/community/chat', label: '💬 Chat' },
  { to: '/community/family', label: '👨‍👩‍👧 Family' },
  { to: '/community/events', label: '⛪ Events' },
  { to: '/community/prayer-partner', label: '🤝 Partners' },
];

export default function CommunityLayout() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Sub-nav strip */}
      <div
        style={{
          background: 'linear-gradient(135deg,#064E3B,#065F46)',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          padding: '0 24px',
          overflowX: 'auto',
        }}
      >
        <nav style={{ display: 'flex', gap: 4, maxWidth: 1100, margin: '0 auto', padding: '0' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                padding: '12px 16px',
                fontSize: '.8rem',
                fontWeight: 700,
                color: isActive ? 'white' : 'rgba(255,255,255,.55)',
                textDecoration: 'none',
                borderBottom: isActive ? '2px solid #34D399' : '2px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all .2s',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
