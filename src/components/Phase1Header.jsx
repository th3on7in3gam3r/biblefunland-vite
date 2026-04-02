import { Link } from 'react-router-dom';

export default function Phase1Header() {
  return (
    <header
      style={{
        background: 'linear-gradient(90deg, #4f46e5, #3b82f6)',
        color: 'white',
        padding: '16px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link
          to="/"
          style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', textDecoration: 'none' }}
        >
          BibleFunLand
        </Link>
        <nav style={{ display: 'flex', gap: 12, fontWeight: 600 }}>
          <Link to="/play" style={{ color: 'white', textDecoration: 'none' }}>
            Play
          </Link>
          <Link to="/explore" style={{ color: 'white', textDecoration: 'none' }}>
            Explore
          </Link>
          <Link to="/ai" style={{ color: 'white', textDecoration: 'none' }}>
            AI
          </Link>
          <Link to="/grow" style={{ color: 'white', textDecoration: 'none' }}>
            Grow
          </Link>
          <Link to="/community" style={{ color: 'white', textDecoration: 'none' }}>
            Community
          </Link>
          <Link to="/parents" style={{ color: 'white', textDecoration: 'none' }}>
            Parents
          </Link>
        </nav>
      </div>
    </header>
  );
}
