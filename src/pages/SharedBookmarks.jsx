import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

const FOLDER_ICONS = {
  Favorites: '⭐',
  'Morning Prayer': '🌅',
  Memorizing: '🧠',
  'Sermon Prep': '📋',
};
const FOLDER_COLORS = {
  Favorites: '#F59E0B',
  'Morning Prayer': '#3B82F6',
  Memorizing: '#8B5CF6',
  'Sermon Prep': '#10B981',
};

export default function SharedBookmarks() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/bookmarks/shared/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setData)
      .catch(() => setError('This collection is private or does not exist.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ink3)',
        }}
      >
        Loading...
      </div>
    );

  if (error)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
        }}
      >
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <p style={{ color: 'var(--ink2)', fontWeight: 600 }}>{error}</p>
        <Link to="/" className="btn btn-blue">
          Go Home
        </Link>
      </div>
    );

  const folders = Object.keys(data.grouped).filter((f) => data.grouped[f].length > 0);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
          padding: '52px 32px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔖</div>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.6rem,4vw,2.6rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 8,
          }}
        >
          {data.displayName}'s Bookmarks
        </h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem' }}>
          {data.total} verse{data.total !== 1 ? 's' : ''} saved · Shared via BibleFunLand
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px 80px' }}>
        {folders.map((folder) => {
          const color = FOLDER_COLORS[folder] || '#3B82F6';
          const icon = FOLDER_ICONS[folder] || '📁';
          return (
            <div key={folder} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: color + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    border: `1.5px solid ${color}30`,
                  }}
                >
                  {icon}
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontWeight: 800,
                    fontSize: '.95rem',
                    color: 'var(--ink)',
                  }}
                >
                  {folder}
                </div>
                <div style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 600 }}>
                  {data.grouped[folder].length} verses
                </div>
              </div>
              {data.grouped[folder].map((bm) => (
                <div
                  key={bm.id}
                  style={{
                    borderRadius: 14,
                    background: 'var(--surface)',
                    border: `1.5px solid ${color}20`,
                    padding: '16px 16px',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: '.72rem', fontWeight: 800, color, marginBottom: 6 }}>
                    {bm.verse_ref}
                  </div>
                  <p
                    style={{
                      fontSize: '.88rem',
                      color: 'var(--ink)',
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                      marginBottom: bm.note ? 8 : 0,
                    }}
                  >
                    "{bm.verse_text}"
                  </p>
                  {bm.note && (
                    <div
                      style={{
                        fontSize: '.74rem',
                        color: 'var(--ink3)',
                        background: 'var(--bg2)',
                        borderRadius: 8,
                        padding: '6px 10px',
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      📝 {bm.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        <div
          style={{
            textAlign: 'center',
            marginTop: 32,
            padding: '20px',
            borderRadius: 16,
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
          }}
        >
          <p style={{ fontSize: '.82rem', color: 'var(--ink3)', marginBottom: 12 }}>
            Want to save your own verse bookmarks?
          </p>
          <Link
            to="/auth"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 20px',
              borderRadius: 12,
              background: 'var(--blue)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '.85rem',
            }}
          >
            Join BibleFunLand — Free
          </Link>
        </div>
      </div>
    </div>
  );
}
