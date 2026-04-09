import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEASONS, getCurrentSeason } from '../lib/seasonal';
import { useAuth } from '../context/AuthContext';

const CONTENT_TYPES = [
  {
    id: 'devotional',
    label: 'Devotional',
    emoji: '🙏',
    to: '/ai/devotional',
    desc: 'Personalized devotional for the season',
  },
  {
    id: 'rap',
    label: 'Scripture Rap',
    emoji: '🎵',
    to: '/ai/rap-generator',
    desc: 'Holiday-themed scripture rap or worship song',
  },
  {
    id: 'drama',
    label: 'Drama Script',
    emoji: '🎭',
    to: '/ai/drama-scripts',
    desc: 'Short drama script for church or school',
  },
  {
    id: 'trivia',
    label: 'Trivia Challenge',
    emoji: '❓',
    to: '/play/trivia',
    desc: 'Seasonal Bible trivia questions',
  },
];

export default function SeasonalAI() {
  const { user } = useAuth();
  const currentSeason = getCurrentSeason();
  const [selectedSeason, setSelectedSeason] = useState(currentSeason?.id || 'easter');
  const [selectedType, setSelectedType] = useState('devotional');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const season = SEASONS.find((s) => s.id === selectedSeason);

  async function generate() {
    if (!user) return;
    setGenerating(true);
    setResult(null);
    try {
      const type = CONTENT_TYPES.find((t) => t.id === selectedType);
      const prompt = `Create a ${type.label} themed for ${season.label}. Theme: ${season.aiTheme}. Make it engaging for families and children. Keep it Scripture-based and faith-centered.`;

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.id}` },
        body: JSON.stringify({ prompt, type: selectedType, season: selectedSeason }),
      });
      const data = await res.json();
      setResult(data.content || data.text || 'Content generated successfully!');
    } catch (err) {
      setResult('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1A0A2E)',
          padding: '52px 32px 40px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.8rem,4vw,3rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#FBBF24,#F97316,#EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          🎄 Seasonal AI Content
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem' }}>
          Generate holiday-themed devotionals, raps, drama scripts, and more
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Season selector */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: '.78rem',
              fontWeight: 700,
              color: 'var(--ink3)',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              marginBottom: 12,
            }}
          >
            Select Season
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {SEASONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSeason(s.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 99,
                  border: `2px solid ${selectedSeason === s.id ? s.color : 'var(--border)'}`,
                  background: selectedSeason === s.id ? `${s.color}15` : 'var(--surface)',
                  color: selectedSeason === s.id ? s.color : 'var(--ink2)',
                  fontWeight: 700,
                  fontSize: '.82rem',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content type selector */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: '.78rem',
              fontWeight: 700,
              color: 'var(--ink3)',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              marginBottom: 12,
            }}
          >
            Content Type
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
              gap: 10,
            }}
          >
            {CONTENT_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                style={{
                  padding: '14px 12px',
                  borderRadius: 14,
                  border: `2px solid ${selectedType === t.id ? season?.color || '#8B5CF6' : 'var(--border)'}`,
                  background:
                    selectedType === t.id ? `${season?.color || '#8B5CF6'}10` : 'var(--surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all .15s',
                }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{t.emoji}</div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '.88rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 3,
                  }}
                >
                  {t.label}
                </div>
                <div style={{ fontSize: '.7rem', color: 'var(--ink3)', lineHeight: 1.4 }}>
                  {t.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Season info */}
        {season && (
          <div
            style={{
              background: `${season.color}10`,
              borderRadius: 16,
              border: `1.5px solid ${season.color}25`,
              padding: '16px 18px',
              marginBottom: 24,
            }}
          >
            <div
              style={{ fontSize: '.72rem', fontWeight: 800, color: season.color, marginBottom: 4 }}
            >
              {season.emoji} {season.label} Theme
            </div>
            <div style={{ fontSize: '.82rem', color: 'var(--ink2)' }}>{season.aiTheme}</div>
          </div>
        )}

        {/* Generate button */}
        {user ? (
          <button
            onClick={generate}
            disabled={generating}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 14,
              background: generating
                ? 'var(--border)'
                : `linear-gradient(135deg,${season?.color || '#8B5CF6'},${season?.color || '#6366F1'})`,
              color: generating ? 'var(--ink3)' : 'white',
              fontWeight: 800,
              fontSize: '1rem',
              border: 'none',
              cursor: generating ? 'default' : 'pointer',
              marginBottom: 24,
              transition: 'all .2s',
            }}
          >
            {generating
              ? '✨ Generating...'
              : `✨ Generate ${season?.label} ${CONTENT_TYPES.find((t) => t.id === selectedType)?.label}`}
          </button>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              background: 'var(--surface)',
              borderRadius: 14,
              border: '1.5px solid var(--border)',
              marginBottom: 24,
            }}
          >
            <p style={{ color: 'var(--ink3)', marginBottom: 12, fontSize: '.85rem' }}>
              Sign in to generate seasonal AI content
            </p>
            <Link
              to="/auth"
              style={{
                display: 'inline-flex',
                padding: '10px 24px',
                borderRadius: 12,
                background: 'var(--blue)',
                color: 'white',
                fontWeight: 700,
                fontSize: '.85rem',
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1.5px solid var(--border)',
              padding: '20px 22px',
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '.9rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 12,
              }}
            >
              ✨ Generated {season?.label} {CONTENT_TYPES.find((t) => t.id === selectedType)?.label}
            </div>
            <div
              style={{
                fontSize: '.85rem',
                color: 'var(--ink2)',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
              }}
            >
              {result}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <Link
                to={
                  CONTENT_TYPES.find((t) => t.id === selectedType)?.to + `?theme=${selectedSeason}`
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  borderRadius: 10,
                  background: season?.color || 'var(--blue)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '.8rem',
                  textDecoration: 'none',
                }}
              >
                🔗 Open in {CONTENT_TYPES.find((t) => t.id === selectedType)?.label}
              </Link>
              <button
                onClick={() => navigator.clipboard?.writeText(result)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'var(--surface)',
                  color: 'var(--ink2)',
                  border: '1.5px solid var(--border)',
                  fontWeight: 700,
                  fontSize: '.8rem',
                  cursor: 'pointer',
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
