import { Outlet, NavLink } from 'react-router-dom';

export default function AILayout() {
  return (
    <div style={{ padding: '16px 20px' }}>
      <h1>AI Tools</h1>
      <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {['devotional', 'chat/characters', 'rap-generator', 'miracle-art'].map((path) => (
          <NavLink
            key={path}
            to={`/ai/${path}`}
            style={({ isActive }) => ({
              padding: '7px 10px',
              borderRadius: 8,
              background: isActive ? '#0f766e' : '#e2e8f0',
              color: isActive ? 'white' : '#1f2937',
              textDecoration: 'none',
              fontWeight: 700,
            })}
          >
            {path.replace('/', ' ')}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
