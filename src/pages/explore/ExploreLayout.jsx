import { Outlet, NavLink } from 'react-router-dom';

export default function ExploreLayout() {
  return (
    <div style={{ padding: '16px 20px' }}>
      <h1>Explore Bible</h1>
      <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {['bible', 'map', 'timeline', 'language-explorer', 'cross-reference'].map((path) => (
          <NavLink
            key={path}
            to={`/explore/${path}`}
            style={({ isActive }) => ({
              padding: '7px 10px',
              borderRadius: 8,
              background: isActive ? '#2c5282' : '#e2e8f0',
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
