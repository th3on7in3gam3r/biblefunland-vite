import { Link } from 'react-router-dom';
import { getCurrentSeason, getActiveChallenge } from '../lib/seasonal';

export default function SeasonalBanner() {
  const season = getCurrentSeason();
  const challenge = getActiveChallenge();

  if (!season) return null;

  return (
    <div
      style={{
        background: season.bg,
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative glow */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle,${season.color}20 0%,transparent 70%)`,
          top: '-20%',
          right: '10%',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 24,
          alignItems: 'center',
        }}
        className="seasonal-grid"
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '.7rem',
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              background: `${season.color}25`,
              color: season.color,
              border: `1px solid ${season.color}40`,
              padding: '4px 12px',
              borderRadius: 100,
              marginBottom: 14,
            }}
          >
            {season.emoji} {season.label} Season
          </div>
          <h2
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1.5rem,3.5vw,2.4rem)',
              fontWeight: 800,
              color: 'white',
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            {season.hero.title}
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,.6)',
              fontSize: '.9rem',
              marginBottom: 20,
              maxWidth: 480,
            }}
          >
            {season.hero.subtitle}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to={season.hero.cta1.to}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 22px',
                borderRadius: 12,
                background: season.color,
                color: 'white',
                fontWeight: 800,
                fontSize: '.85rem',
                textDecoration: 'none',
                boxShadow: `0 6px 20px ${season.color}40`,
              }}
            >
              {season.hero.cta1.label}
            </Link>
            <Link
              to={season.hero.cta2.to}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 12,
                background: 'rgba(255,255,255,.1)',
                color: 'white',
                fontWeight: 700,
                fontSize: '.85rem',
                textDecoration: 'none',
                border: '1.5px solid rgba(255,255,255,.2)',
              }}
            >
              {season.hero.cta2.label}
            </Link>
          </div>
        </div>

        {/* Weekly challenge card */}
        <div
          style={{
            background: 'rgba(255,255,255,.08)',
            borderRadius: 18,
            border: '1.5px solid rgba(255,255,255,.15)',
            padding: '20px 22px',
            minWidth: 260,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              fontSize: '.68rem',
              fontWeight: 800,
              color: season.color,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            🏆 {challenge.seasonal ? 'Seasonal Challenge' : 'Weekly Challenge'}
          </div>
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1rem',
              fontWeight: 800,
              color: 'white',
              marginBottom: 6,
            }}
          >
            {challenge.title}
          </div>
          <p
            style={{
              fontSize: '.75rem',
              color: 'rgba(255,255,255,.55)',
              lineHeight: 1.6,
              marginBottom: 14,
            }}
          >
            {challenge.desc}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '.72rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 99,
                background: `${season.color}25`,
                color: season.color,
              }}
            >
              +{challenge.points} pts
            </span>
            <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'rgba(255,255,255,.4)' }}>
              {challenge.badge ? `🏅 ${challenge.badge}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Featured seasonal content */}
      <div
        style={{
          maxWidth: 960,
          margin: '24px auto 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
          gap: 12,
        }}
      >
        {season.featured.map((f, i) => (
          <Link key={i} to={f.to} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: 'rgba(255,255,255,.07)',
                borderRadius: 14,
                border: '1.5px solid rgba(255,255,255,.12)',
                padding: '14px 16px',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,.07)';
                e.currentTarget.style.transform = '';
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{f.icon}</div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '.88rem',
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: 3,
                }}
              >
                {f.title}
              </div>
              <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>
                {f.desc}
              </div>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  fontSize: '.62rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 99,
                  background: `${season.color}30`,
                  color: season.color,
                }}
              >
                {f.tag}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <style>{`@media(max-width:640px){.seasonal-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
