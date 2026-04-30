import { Outlet, NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/parents/parent-hub', label: '🏠 Hub' },
  { to: '/parents/parents-teachers', label: '📋 Resources' },
  { to: '/parents/controls', label: '🔒 Controls' },
  { to: '/parents/progress', label: '📊 Progress' },
];

export default function ParentsLayout() {
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
        <nav style={{ display: 'flex', gap: 4, maxWidth: 1100, margin: '0 auto' }}>
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
