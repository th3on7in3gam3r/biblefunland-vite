/**
 * ChildDashboard — Full featured child profile dashboard
 * Shows activity stats, achievements, and quick-access tools
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

const AVATAR_MAP = {
  david:   { emoji: '👑', color: '#8B5CF6', name: 'David' },
  esther:  { emoji: '👸', color: '#EC4899', name: 'Esther' },
  moses:   { emoji: '🏔️', color: '#F59E0B', name: 'Moses' },
  mary:    { emoji: '🌸', color: '#F472B6', name: 'Mary' },
  daniel:  { emoji: '🦁', color: '#EF4444', name: 'Daniel' },
  paul:    { emoji: '✍️', color: '#3B82F6', name: 'Paul' },
  noah:    { emoji: '🚢', color: '#06B6D4', name: 'Noah' },
  ruth:    { emoji: '🌾', color: '#84CC16', name: 'Ruth' },
};

const QUICK_LINKS = [
  { to: '/play',      emoji: '🎮', label: 'Play Games',    color: '#8B5CF6' },
  { to: '/explore',   emoji: '📖', label: 'Explore Bible', color: '#3B82F6' },
  { to: '/ai-fun',    emoji: '✨', label: 'AI Fun',        color: '#F59E0B' },
  { to: '/grow',      emoji: '🌱', label: 'Daily Grow',    color: '#10B981' },
];

export default function ChildDashboard() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) { navigate('/auth'); return; }

    async function load() {
      try {
        setLoading(true);
        // Fetch all children for this parent and find the matching one
        const res = await fetch(`${API}/api/children/${user.id}`);
        if (!res.ok) throw new Error('Failed to load child profile');
        const { data } = await res.json();
        const found = (data || []).find((c) => c.id === childId);
        if (!found) throw new Error('Child profile not found');
        setChild(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, navigate, childId]);

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }}>✨</div>
        <p style={{ color: 'var(--ink3)', fontWeight: 600 }}>Loading child dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ fontSize: '3rem' }}>😕</div>
        <h2 style={{ color: 'var(--ink)', fontFamily: "'Baloo 2', cursive" }}>Oops! Something went wrong</h2>
        <p style={{ color: 'var(--ink3)' }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', borderRadius: 12, background: 'var(--blue)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  const avatar = AVATAR_MAP[child?.avatar_url] || AVATAR_MAP.david;
  const age = child?.age ? `${child.age} years old` : null;
  const joinedDate = child?.created_at ? new Date(child.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 60px', minHeight: '80vh' }}>
      {/* Hero Card */}
      <div style={{
        background: `linear-gradient(135deg, ${avatar.color}22, ${avatar.color}44)`,
        border: `2px solid ${avatar.color}55`,
        borderRadius: 24,
        padding: '32px 28px',
        marginBottom: 24,
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 90, height: 90,
          background: `linear-gradient(135deg, ${avatar.color}, ${avatar.color}99)`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem',
          flexShrink: 0,
          boxShadow: `0 8px 24px ${avatar.color}44`,
        }}>
          {avatar.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '1.8rem', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>
            {child?.display_name || 'Child'}
          </div>
          <div style={{ color: 'var(--ink3)', fontSize: '.85rem', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {age && <span>🎂 {age}</span>}
            {joinedDate && <span>📅 Joined {joinedDate}</span>}
            <span>⚔️ {avatar.name}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/parents')}
            style={{ padding: '9px 18px', borderRadius: 12, background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--ink)', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' }}
          >
            ⚙️ Manage
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, color: 'var(--ink)', marginBottom: 14, fontSize: '1.1rem' }}>
          🚀 Jump Right In
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {QUICK_LINKS.map(({ to, emoji, label, color }) => (
            <Link
              key={to}
              to={to}
              style={{
                background: `linear-gradient(135deg, ${color}15, ${color}25)`,
                border: `1.5px solid ${color}40`,
                borderRadius: 16,
                padding: '18px 14px',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{emoji}</div>
              <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '.85rem' }}>{label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { emoji: '🙏', title: "Today's Verse", body: 'Open the Bible to discover a verse for today!', to: '/explore', cta: 'Read Now' },
          { emoji: '🎯', title: 'Daily Challenge', body: 'Complete activities to grow your streak and earn badges!', to: '/play', cta: 'Play Now' },
          { emoji: '🏅', title: 'Your Badges', body: 'See all the badges you have earned so far on your journey!', to: '/profile', cta: 'View All' },
        ].map(({ emoji, title, body, to, cta }) => (
          <div key={title} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 18, padding: '20px 18px' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{emoji}</div>
            <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '.95rem', marginBottom: 6, fontFamily: "'Baloo 2', cursive" }}>{title}</div>
            <p style={{ color: 'var(--ink3)', fontSize: '.78rem', lineHeight: 1.5, marginBottom: 14 }}>{body}</p>
            <Link to={to} style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 10, background: 'var(--blue)', color: 'white', fontWeight: 700, fontSize: '.78rem', textDecoration: 'none' }}>
              {cta} →
            </Link>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button
          onClick={() => navigate('/parents')}
          style={{ padding: '10px 28px', borderRadius: 12, background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--ink)', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem' }}
        >
          ← Back to Parent Dashboard
        </button>
      </div>
    </div>
  );
}
