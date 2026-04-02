import { Outlet, NavLink } from 'react-router-dom';

export default function GrowLayout() {
  return (
    <div style={{ padding: '16px 20px' }}>
      <h1>Grow Resources</h1>
      <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {['certification', 'spiritual-gifts', 'apologetics', 'worship'].map((path) => (
          <NavLink
            key={path}
            to={`/grow/${path}`}
            style={({ isActive }) => ({
              padding: '7px 10px',
              borderRadius: 8,
              background: isActive ? '#047857' : '#e2e8f0',
              color: isActive ? 'white' : '#1f2937',
              textDecoration: 'none',
              fontWeight: 700,
            })}
          >
            {path.replace('-', ' ')}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
