import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const API =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

const WORSHIP_STYLES = [
  { id: 'all', label: 'All Styles', emoji: '⛪' },
  { id: 'contemporary', label: 'Contemporary', emoji: '🎸' },
  { id: 'traditional', label: 'Traditional', emoji: '🎹' },
  { id: 'charismatic', label: 'Charismatic', emoji: '🔥' },
  { id: 'baptist', label: 'Baptist', emoji: '💧' },
  { id: 'catholic', label: 'Catholic', emoji: '✝️' },
  { id: 'pentecostal', label: 'Pentecostal', emoji: '🕊️' },
  { id: 'nondenominational', label: 'Non-Denom', emoji: '🙏' },
];

const RADIUS_OPTIONS = [
  { value: 3000, label: '3 km' },
  { value: 8000, label: '8 km' },
  { value: 16000, label: '16 km' },
  { value: 32000, label: '32 km' },
];

function StarRating({ rating }) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: '#F59E0B', fontSize: '.75rem' }}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span style={{ color: 'var(--ink3)', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

function ChurchCard({ church, onSelect, selected }) {
  return (
    <div
      onClick={() => onSelect(church)}
      style={{
        borderRadius: 16,
        background: 'var(--surface)',
        border: `1.5px solid ${selected ? 'var(--blue)' : 'var(--border)'}`,
        padding: '16px',
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'all .2s',
        boxShadow: selected ? '0 0 0 3px rgba(59,130,246,.15)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = 'rgba(59,130,246,.4)';
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Photo or icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            overflow: 'hidden',
            flexShrink: 0,
            background: 'linear-gradient(135deg,#1E1B4B,#0D1B2A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
          }}
        >
          {church.photo ? (
            <img
              src={church.photo}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            '⛪'
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontWeight: 800,
              fontSize: '.95rem',
              color: 'var(--ink)',
              marginBottom: 3,
              lineHeight: 1.3,
            }}
          >
            {church.name}
          </div>
          <div
            style={{
              fontSize: '.72rem',
              color: 'var(--ink3)',
              marginBottom: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            📍 {church.address}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <StarRating rating={church.rating} />
            {church.openNow !== null && (
              <span
                style={{
                  fontSize: '.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 99,
                  background: church.openNow ? 'var(--green-bg)' : 'var(--red-bg)',
                  color: church.openNow ? 'var(--green)' : 'var(--red)',
                }}
              >
                {church.openNow ? '● Open' : '● Closed'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChurchDetail({ church, details, loading }) {
  if (!church)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: 40,
          color: 'var(--ink3)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⛪</div>
        <p style={{ fontWeight: 600, fontSize: '.9rem' }}>Select a church to see details</p>
      </div>
    );

  return (
    <div style={{ padding: '20px' }}>
      {church.photo && (
        <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, height: 160 }}>
          <img
            src={church.photo}
            alt={church.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <h2
        style={{
          fontFamily: "'Baloo 2',cursive",
          fontSize: '1.2rem',
          fontWeight: 800,
          color: 'var(--ink)',
          marginBottom: 6,
        }}
      >
        {church.name}
      </h2>
      <p style={{ fontSize: '.78rem', color: 'var(--ink3)', marginBottom: 12 }}>
        📍 {church.address}
      </p>
      <StarRating rating={church.rating} />
      {church.userRatingsTotal > 0 && (
        <span style={{ fontSize: '.68rem', color: 'var(--ink3)', marginLeft: 6 }}>
          ({church.userRatingsTotal} reviews)
        </span>
      )}

      {loading && (
        <div style={{ color: 'var(--ink3)', fontSize: '.82rem', marginTop: 16 }}>
          Loading details...
        </div>
      )}

      {details && (
        <div style={{ marginTop: 16 }}>
          {details.formatted_phone_number && (
            <div style={{ fontSize: '.82rem', color: 'var(--ink2)', marginBottom: 8 }}>
              📞{' '}
              <a
                href={`tel:${details.formatted_phone_number}`}
                style={{ color: 'var(--blue)', textDecoration: 'none' }}
              >
                {details.formatted_phone_number}
              </a>
            </div>
          )}
          {details.website && (
            <div style={{ fontSize: '.82rem', marginBottom: 8 }}>
              🌐{' '}
              <a
                href={details.website}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--blue)', textDecoration: 'none', wordBreak: 'break-all' }}
              >
                {details.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {details.opening_hours?.weekday_text && (
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  fontSize: '.72rem',
                  fontWeight: 700,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: '.05em',
                  marginBottom: 6,
                }}
              >
                Hours
              </div>
              {details.opening_hours.weekday_text.map((line, i) => (
                <div key={i} style={{ fontSize: '.75rem', color: 'var(--ink2)', marginBottom: 3 }}>
                  {line}
                </div>
              ))}
            </div>
          )}
          {details.editorial_summary?.overview && (
            <div
              style={{
                marginTop: 12,
                fontSize: '.78rem',
                color: 'var(--ink3)',
                lineHeight: 1.65,
                fontStyle: 'italic',
              }}
            >
              "{details.editorial_summary.overview}"
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {details.url && (
              <a
                href={details.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: 'var(--blue)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '.78rem',
                }}
              >
                🗺️ Google Maps
              </a>
            )}
            {details.website && (
              <a
                href={details.website}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  border: '1.5px solid var(--border)',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '.78rem',
                }}
              >
                🌐 Website
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChurchFinder() {
  const [cityInput, setCityInput] = useState('');
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [style, setStyle] = useState('all');
  const [radius, setRadius] = useState(8000);
  const [locationUsed, setLocationUsed] = useState('');

  async function searchByCity(e) {
    e?.preventDefault();
    if (!cityInput.trim()) return;
    setLoading(true);
    setError(null);
    setChurches([]);
    setSelectedChurch(null);
    setDetails(null);

    try {
      // Geocode city
      const geoRes = await fetch(
        `${API}/churches/geocode?address=${encodeURIComponent(cityInput)}`
      );
      const geoData = await geoRes.json();
      if (geoData.setup) {
        setSetupRequired(true);
        setLoading(false);
        return;
      }
      if (!geoRes.ok) throw new Error(geoData.error || 'Location not found');

      await doSearch(geoData.lat, geoData.lng, geoData.formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function searchByLocation() {
    if (!navigator.geolocation) return setError('Geolocation not supported');
    setLoading(true);
    setError(null);
    setChurches([]);
    setSelectedChurch(null);
    setDetails(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await doSearch(pos.coords.latitude, pos.coords.longitude, 'Your Location');
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location access denied');
        setLoading(false);
      }
    );
  }

  async function doSearch(lat, lng, label) {
    const keyword = style === 'all' ? 'church' : `${style} church`;
    const res = await fetch(
      `${API}/churches/search?lat=${lat}&lng=${lng}&radius=${radius}&query=${encodeURIComponent(keyword)}`
    );
    const data = await res.json();
    if (data.setup) {
      setSetupRequired(true);
      return;
    }
    if (!res.ok) throw new Error(data.error || 'Search failed');
    setChurches(data.churches || []);
    setLocationUsed(label);
  }

  const handleSelectChurch = useCallback(async (church) => {
    setSelectedChurch(church);
    setDetails(null);
    setDetailsLoading(true);
    try {
      const res = await fetch(`${API}/churches/details/${church.id}`);
      const data = await res.json();
      if (res.ok) setDetails(data.details);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#071A10,#0D1B2A)',
          padding: '52px 32px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(2rem,4.5vw,3.2rem)',
              fontWeight: 800,
              background: 'linear-gradient(90deg,#34D399,#60A5FA,#C084FC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 8,
            }}
          >
            ⛪ Church Finder
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,.45)',
              fontSize: '.9rem',
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            Find a church home near you — search by city or use your location
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 80px' }}>
        {/* Setup required banner */}
        {setupRequired && (
          <div
            style={{
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 24,
              background: 'var(--red-bg)',
              border: '1.5px solid var(--red)',
              fontSize: '.85rem',
              color: 'var(--red)',
              fontWeight: 600,
            }}
          >
            ⚠️ Google Places API key not configured. Add <code>GOOGLE_PLACES_API_KEY</code> to your
            server <code>.env</code> file.
            <a
              href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--red)', marginLeft: 8, textDecoration: 'underline' }}
            >
              Get a key →
            </a>
          </div>
        )}

        {/* Search bar */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 20,
            border: '1.5px solid var(--border)',
            padding: '20px 20px',
            marginBottom: 20,
          }}
        >
          <form
            onSubmit={searchByCity}
            style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1rem',
                  pointerEvents: 'none',
                }}
              >
                🔍
              </span>
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Enter city, postcode, or address..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                background: 'linear-gradient(135deg,#10B981,#34D399)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '.88rem',
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={searchByLocation}
              disabled={loading}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background: 'var(--bg)',
                color: 'var(--ink)',
                border: '1.5px solid var(--border)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '.82rem',
                whiteSpace: 'nowrap',
              }}
            >
              📍 Use My Location
            </button>
          </form>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '.72rem',
                fontWeight: 700,
                color: 'var(--ink3)',
                textTransform: 'uppercase',
                letterSpacing: '.04em',
              }}
            >
              Style:
            </span>
            {WORSHIP_STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 99,
                  border: `1.5px solid ${style === s.id ? 'var(--blue)' : 'var(--border)'}`,
                  background: style === s.id ? 'var(--blue-bg)' : 'transparent',
                  color: style === s.id ? 'var(--blue)' : 'var(--ink2)',
                  fontWeight: 700,
                  fontSize: '.72rem',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                {s.emoji} {s.label}
              </button>
            ))}
            <span
              style={{
                fontSize: '.72rem',
                fontWeight: 700,
                color: 'var(--ink3)',
                textTransform: 'uppercase',
                letterSpacing: '.04em',
                marginLeft: 8,
              }}
            >
              Radius:
            </span>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '.78rem',
                cursor: 'pointer',
              }}
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            style={{
              color: 'var(--red)',
              fontSize: '.85rem',
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'var(--red-bg)',
              border: '1px solid var(--red)',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {churches.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              alignItems: 'start',
            }}
          >
            {/* Left: list */}
            <div>
              <div
                style={{
                  fontSize: '.72rem',
                  fontWeight: 700,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: '.05em',
                  marginBottom: 12,
                }}
              >
                {churches.length} churches near {locationUsed}
              </div>
              <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
                {churches.map((c) => (
                  <ChurchCard
                    key={c.id}
                    church={c}
                    onSelect={handleSelectChurch}
                    selected={selectedChurch?.id === c.id}
                  />
                ))}
              </div>
            </div>

            {/* Right: detail panel */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                minHeight: 300,
                position: 'sticky',
                top: 20,
              }}
            >
              <ChurchDetail church={selectedChurch} details={details} loading={detailsLoading} />
            </div>
          </div>
        )}

        {!loading && churches.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⛪</div>
            <p style={{ fontWeight: 600, fontSize: '.95rem', marginBottom: 6 }}>
              Find your church home
            </p>
            <p style={{ fontSize: '.82rem' }}>
              Search by city or allow location access to find churches near you
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/" style={{ color: 'var(--ink3)', fontSize: '.82rem', textDecoration: 'none' }}>
            ← Home
          </Link>
        </div>
      </div>
    </div>
  );
}
