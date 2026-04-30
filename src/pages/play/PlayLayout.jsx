import { Outlet, NavLink } from 'react-router-dom';

export default function PlayLayout() {
  return (
    <div style={{ padding: '16px 20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>Games Arcade</h1>
      <p style={{ color: '#4b5563', marginBottom: 18 }}>
        Explore Bible games, trivia, flashcards, activity sheets and more.
      </p>
      <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          'trivia',
          'flashcards',
          'activity-sheets',
          'game/david-goliath',
          'game/runner',
          'game/escape-room',
        ].map((path) => (
          <NavLink
            key={path}
            to={`/play/${path}`}
            style={({ isActive }) => ({
              padding: '8px 12px',
              borderRadius: 8,
              background: isActive ? '#312e81' : '#e5e7eb',
              color: isActive ? 'white' : '#111827',
              textDecoration: 'none',
              fontWeight: 700,
            })}
          >
            {path.replace('game/', '').replace('-', ' ')}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
