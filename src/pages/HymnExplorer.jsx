import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HYMNS } from '../data/hymns';

export default function HymnExplorer() {
  const [activeHymnId, setActiveHymnId] = useState(null);
  const [search, setSearch] = useState('');

  const activeHymn = HYMNS.find((h) => h.id === activeHymnId);
  const filteredHymns = HYMNS.filter(
    (h) =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.author.toLowerCase().includes(search.toLowerCase()) ||
      h.theme.toLowerCase().includes(search.toLowerCase())
  );

  // ── Detail View ──
  if (activeHymn) {
    return (
      <div
        style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg,#1E1B4B,#0F0F1A)',
            padding: '50px 20px 60px',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <button
              onClick={() => setActiveHymnId(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--blue)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 24,
                padding: 0,
              }}
            >
              ← Back to Hymns
            </button>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              <span
                style={{
                  fontSize: '.75rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: 100,
                  background: 'rgba(255,255,255,.1)',
                  color: 'rgba(255,255,255,.8)',
                }}
              >
                {activeHymn.year}
              </span>
              <span
                style={{
                  fontSize: '.75rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: 100,
                  background: 'rgba(59,130,246,.2)',
                  color: '#60A5FA',
                  border: '1px solid rgba(59,130,246,.3)',
                }}
              >
                {activeHymn.theme}
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              {activeHymn.title}
            </h1>
            <p
              style={{
                fontSize: '1.2rem',
                color: 'var(--ink3)',
                fontWeight: 500,
                fontStyle: 'italic',
              }}
            >
              Words by {activeHymn.author}
            </p>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            maxWidth: 840,
            margin: '-30px auto 0',
            padding: '0 20px 80px',
            position: 'relative',
            zIndex: 3,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1px solid var(--border)',
              padding: '36px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              marginBottom: 40,
            }}
          >
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--blue)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>📜</span> The Story Behind the Song
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                color: 'var(--ink)',
                fontFamily: "'Merriweather', serif",
              }}
            >
              {activeHymn.story}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 40,
              alignItems: 'start',
            }}
          >
            {/* Verses Column */}
            <div>
              <h2
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  borderBottom: '2px solid var(--border)',
                  paddingBottom: 16,
                  marginBottom: 30,
                }}
              >
                Lyrics & Meaning
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                {activeHymn.verses.map((v, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20 }}>
                    <div
                      style={{
                        fontSize: '1.6rem',
                        fontWeight: 800,
                        color: 'var(--blue)',
                        opacity: 0.3,
                        marginTop: -4,
                      }}
                    >
                      {v.number}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: '1.1rem',
                          lineHeight: 1.8,
                          color: 'var(--ink)',
                          fontWeight: 600,
                          fontFamily: "'Merriweather', serif",
                          whiteSpace: 'pre-line',
                          marginBottom: 16,
                        }}
                      >
                        {v.text}
                      </p>
                      <div
                        style={{
                          background: 'var(--blue-bg)',
                          padding: '16px 20px',
                          borderRadius: 12,
                          borderLeft: '3px solid var(--blue)',
                          fontSize: '.9rem',
                          lineHeight: 1.6,
                          color: 'var(--ink2)',
                          fontStyle: 'italic',
                        }}
                      >
                        {v.context}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Media Column */}
            <div style={{ position: 'sticky', top: 100 }}>
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 20,
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>🎵</span> Original Tune Context
                </h3>
                {activeHymn.videoUrl ? (
                  <div
                    style={{
                      position: 'relative',
                      paddingBottom: '56.25%',
                      height: 0,
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: '#000',
                    }}
                  >
                    <iframe
                      src={activeHymn.videoUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      background: 'var(--bg2)',
                      borderRadius: 12,
                      color: 'var(--ink3)',
                      fontSize: '.9rem',
                    }}
                  >
                    No audio context available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid View ──
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1A0A2E,#0D1B2A)',
          padding: '60px 36px 44px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#FCD34D,#F97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 16,
            fontStyle: 'italic',
          }}
        >
          Hymn Explorer
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,.6)',
            fontSize: '1rem',
            fontWeight: 500,
            maxWidth: 600,
            margin: '0 auto',
          }}
        >
          Discover the profound testimonies, deep theology, and historical context hidden behind the
          most famous songs of the faith.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto 50px' }}>
          <span
            style={{
              position: 'absolute',
              left: 18,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.2rem',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search hymns, authors, or themes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px 16px 50px',
              borderRadius: 100,
              border: '2px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color .2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--orange)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {filteredHymns.map((hymn) => (
            <div
              key={hymn.id}
              onClick={() => setActiveHymnId(hymn.id)}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                padding: 30,
                cursor: 'pointer',
                transition: 'all .3s ease',
                boxShadow: 'var(--sh)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--orange)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(249,115,22,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--sh)';
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -40,
                  right: -20,
                  fontSize: '8rem',
                  opacity: 0.03,
                  pointerEvents: 'none',
                }}
              >
                🎵
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: '.65rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 100,
                    background: 'rgba(249,115,22,.1)',
                    color: 'var(--orange)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {hymn.theme}
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                {hymn.title}
              </h2>
              <div
                style={{
                  fontSize: '.85rem',
                  color: 'var(--ink2)',
                  fontWeight: 500,
                  marginBottom: 20,
                }}
              >
                {hymn.author} • {hymn.year}
              </div>
              <p
                style={{
                  fontSize: '.9rem',
                  color: 'var(--ink3)',
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {hymn.story}
              </p>
            </div>
          ))}
          {filteredHymns.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: 60,
                color: 'var(--ink3)',
                fontSize: '1.1rem',
              }}
            >
              No hymns found matching "{search}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
