import { useState, useEffect, useRef } from 'react';

// Realtime broadcast stub for local testing
const realtimeChannel = {
  channel: (name) => {
    const ch = {
      on: () => ch,
      subscribe: () => ch,
      send: () => {},
      unsubscribe: () => {},
    };
    return ch;
  },
};

const DEMO_PINS = [
  {
    id: 1,
    lat: 40.71,
    lng: -74.01,
    country: '🇺🇸',
    city: 'New York',
    prayer: 'Lord, heal my family',
    time: 2,
  },
  {
    id: 2,
    lat: -23.55,
    lng: -46.63,
    country: '🇧🇷',
    city: 'São Paulo',
    prayer: 'Obrigado Senhor por sua graça',
    time: 5,
  },
  {
    id: 3,
    lat: 51.51,
    lng: -0.13,
    country: '🇬🇧',
    city: 'London',
    prayer: 'Strength for our church community',
    time: 8,
  },
  {
    id: 4,
    lat: 1.35,
    lng: 103.82,
    country: '🇸🇬',
    city: 'Singapore',
    prayer: "Wisdom for our nation's leaders",
    time: 12,
  },
  {
    id: 5,
    lat: -33.87,
    lng: 151.21,
    country: '🇦🇺',
    city: 'Sydney',
    prayer: 'Revival fire across Australia!',
    time: 15,
  },
  {
    id: 6,
    lat: 9.06,
    lng: 7.5,
    country: '🇳🇬',
    city: 'Abuja',
    prayer: 'God bless Nigeria with peace',
    time: 3,
  },
  {
    id: 7,
    lat: 28.61,
    lng: 77.21,
    country: '🇮🇳',
    city: 'New Delhi',
    prayer: 'Protection for believers here',
    time: 6,
  },
  {
    id: 8,
    lat: -1.29,
    lng: 36.82,
    country: '🇰🇪',
    city: 'Nairobi',
    prayer: 'Harvest for the Kingdom in Africa',
    time: 9,
  },
  {
    id: 9,
    lat: 35.69,
    lng: 139.69,
    country: '🇯🇵',
    city: 'Tokyo',
    prayer: 'Open hearts in Japan to the Gospel',
    time: 18,
  },
  {
    id: 10,
    lat: 48.85,
    lng: 2.35,
    country: '🇫🇷',
    city: 'Paris',
    prayer: 'Revival across Europe',
    time: 22,
  },
];

const CATEGORIES = ['All', 'Healing', 'Praise', 'Family', 'Guidance', 'Salvation', 'General'];
const CATCOLORS = {
  Healing: '#10B981',
  Praise: '#F59E0B',
  Family: '#EC4899',
  Guidance: '#3B82F6',
  Salvation: '#8B5CF6',
  General: '#6366F1',
};

// Project lat/lng to SVG coordinates on simple world map
function latLngToXY(lat, lng, W = 800, H = 400) {
  const x = ((lng + 180) / 360) * W;
  const y = ((90 - lat) / 180) * H;
  return [x, y];
}

export default function GlobalPrayerMap() {
  const [pins, setPins] = useState(DEMO_PINS);
  const [hoveredPin, setHoveredPin] = useState(null);
  const [form, setForm] = useState({ country: '', city: '', prayer: '', category: 'General' });
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState('All');
  const [liveCount, setLiveCount] = useState(0);
  const [prayCount, setPrayCount] = useState(0);
  const channelRef = useRef(null);

  useEffect(() => {
    // Try realtime broadcast
    try {
      channelRef.current = realtimeChannel
        .channel('prayer-map')
        .on('broadcast', { event: 'new-pin' }, ({ payload }) => {
          setPins((prev) => [payload, ...prev].slice(0, 50));
          setLiveCount((c) => c + 1);
          setTimeout(() => setLiveCount((c) => Math.max(0, c - 1)), 5000);
        })
        .subscribe();
    } catch {}

    // Simulate new prayer pins appearing
    const interval = setInterval(() => {
      const demo = DEMO_PINS[Math.floor(Math.random() * DEMO_PINS.length)];
      const newPin = { ...demo, id: Date.now(), time: 0 };
      setPins((prev) => [newPin, ...prev.slice(0, 49)]);
      setLiveCount((c) => c + 1);
      setTimeout(() => setLiveCount((c) => Math.max(0, c - 1)), 4000);
    }, 12000);

    return () => {
      clearInterval(interval);
      channelRef.current?.unsubscribe();
    };
  }, []);

  function submitPrayer() {
    if (!form.prayer.trim() || !form.city.trim()) return;
    const pin = {
      id: Date.now(),
      lat: 20 + Math.random() * 40,
      lng: -100 + Math.random() * 200,
      country: form.country || '🌍',
      city: form.city,
      prayer: form.prayer,
      category: form.category,
      time: 0,
    };
    setPins((prev) => [pin, ...prev]);
    try {
      realtimeChannel
        .channel('prayer-map')
        .send({ type: 'broadcast', event: 'new-pin', payload: pin });
    } catch {}
    setForm({ country: '', city: '', prayer: '', category: 'General' });
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  const W = 800,
    H = 400;
  const filteredPins =
    filter === 'All' ? pins : pins.filter((p) => (p.category || 'General') === filter);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#064E3B)',
          padding: '56px 36px 44px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '.7rem',
            fontWeight: 700,
            background: 'rgba(16,185,129,.15)',
            color: '#34D399',
            padding: '4px 12px',
            borderRadius: 100,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#34D399',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          Real-time · {pins.length} prayers · Global Church
        </div>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 8,
          }}
        >
          🌍 Global Prayer Map
        </h1>
        <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.92rem', fontWeight: 500 }}>
          See prayers lighting up from around the world in real time. The Church prays together.
        </p>
      </div>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 20px' }}>
        {submitted && (
          <div
            style={{
              background: 'var(--green-bg)',
              border: '1.5px solid var(--green)',
              borderRadius: 12,
              padding: '10px 18px',
              marginBottom: 16,
              fontSize: '.84rem',
              fontWeight: 700,
              color: 'var(--green)',
              animation: 'popIn .3s ease',
            }}
          >
            ✅ Your prayer is now live on the global map! 🌍
          </div>
        )}

        {liveCount > 0 && (
          <div
            style={{
              background: 'var(--green-bg)',
              border: '1.5px solid rgba(16,185,129,.3)',
              borderRadius: 12,
              padding: '8px 16px',
              marginBottom: 12,
              fontSize: '.8rem',
              fontWeight: 700,
              color: 'var(--green)',
              animation: 'popIn .3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--green)',
                animation: 'pulse 1s ease-in-out infinite',
              }}
            />
            New prayer just added! 🙏
          </div>
        )}

        {/* SVG World Map */}
        <div
          style={{
            background: '#0B1E3D',
            borderRadius: 24,
            border: '1.5px solid rgba(255,255,255,.08)',
            overflow: 'hidden',
            marginBottom: 24,
            position: 'relative',
          }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            {/* Simple world map background shapes */}
            <rect width={W} height={H} fill="#0B1E3D" />
            {/* Ocean */}
            <rect width={W} height={H} fill="#0D2137" rx="0" />
            {/* Continents - simplified shapes */}
            {/* North America */}
            <path
              d="M120 80 L180 70 L220 90 L240 130 L210 180 L190 200 L160 210 L130 200 L100 170 L90 130 Z"
              fill="#1A3A2A"
              opacity=".8"
            />
            {/* South America */}
            <path
              d="M160 220 L190 215 L210 240 L220 280 L200 320 L180 340 L160 330 L145 300 L140 260 Z"
              fill="#1A3A2A"
              opacity=".8"
            />
            {/* Europe */}
            <path
              d="M350 70 L400 65 L420 80 L415 110 L390 120 L365 115 L345 100 Z"
              fill="#1A3A2A"
              opacity=".8"
            />
            {/* Africa */}
            <path
              d="M360 130 L400 120 L430 140 L440 190 L430 250 L410 280 L385 285 L360 270 L345 230 L340 180 Z"
              fill="#1A3A2A"
              opacity=".8"
            />
            {/* Asia */}
            <path
              d="M430 60 L560 50 L620 70 L650 100 L640 150 L600 170 L550 165 L500 170 L460 160 L440 130 L420 100 Z"
              fill="#1A3A2A"
              opacity=".8"
            />
            {/* Australia */}
            <path
              d="M580 250 L630 240 L660 260 L665 295 L640 315 L605 315 L575 295 L565 270 Z"
              fill="#1A3A2A"
              opacity=".8"
            />
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="0"
                y1={i * 80}
                x2={W}
                y2={i * 80}
                stroke="rgba(255,255,255,.04)"
                strokeWidth="1"
              />
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <line
                key={i}
                x1={i * 80}
                y1="0"
                x2={i * 80}
                y2={H}
                stroke="rgba(255,255,255,.04)"
                strokeWidth="1"
              />
            ))}
            {/* Equator */}
            <line
              x1="0"
              y1={H / 2}
              x2={W}
              y2={H / 2}
              stroke="rgba(255,255,255,.08)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            {/* Prayer pins */}
            {filteredPins.map((pin, idx) => {
              const [x, y] = latLngToXY(pin.lat, pin.lng, W, H);
              const color = CATCOLORS[pin.category || 'General'] || '#6366F1';
              const isNew = pin.time === 0;
              return (
                <g
                  key={pin.id}
                  onMouseEnter={() => setHoveredPin(pin)}
                  onMouseLeave={() => setHoveredPin(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {isNew && (
                    <circle
                      cx={x}
                      cy={y}
                      r="14"
                      fill={color}
                      opacity=".2"
                      style={{ animation: 'ripple 1.5s ease-out' }}
                    />
                  )}
                  <circle cx={x} cy={y} r="6" fill={color} opacity=".9" />
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity=".5"
                    style={{ animation: 'pingRing 2s ease-out infinite' }}
                  />
                  <circle cx={x} cy={y} r="3" fill="white" opacity=".9" />
                </g>
              );
            })}
            {/* Hover tooltip */}
            {hoveredPin &&
              (() => {
                const [x, y] = latLngToXY(hoveredPin.lat, hoveredPin.lng, W, H);
                const fx = Math.min(x, W - 180);
                const fy = Math.max(y - 90, 10);
                return (
                  <g>
                    <rect
                      x={fx}
                      y={fy}
                      width="170"
                      height="72"
                      rx="8"
                      fill="#0F172A"
                      stroke="rgba(255,255,255,.15)"
                      strokeWidth="1"
                    />
                    <text
                      x={fx + 10}
                      y={fy + 18}
                      fill="#94A3B8"
                      fontSize="10"
                      fontFamily="Poppins,sans-serif"
                    >
                      {hoveredPin.country} {hoveredPin.city}
                    </text>
                    <foreignObject x={fx + 8} y={fy + 24} width="154" height="42">
                      <div
                        style={{
                          fontSize: '10px',
                          color: 'white',
                          lineHeight: 1.4,
                          fontFamily: 'Poppins,sans-serif',
                          fontWeight: 500,
                          overflow: 'hidden',
                        }}
                      >
                        {hoveredPin.prayer.slice(0, 80)}
                        {hoveredPin.prayer.length > 80 ? '...' : ''}
                      </div>
                    </foreignObject>
                  </g>
                );
              })()}
          </svg>
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 14,
              fontSize: '.65rem',
              color: 'rgba(255,255,255,.25)',
              fontFamily: 'Poppins,sans-serif',
            }}
          >
            Hover a pin to read the prayer
          </div>
        </div>

        {/* Controls row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  fontSize: '.72rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: 100,
                  cursor: 'pointer',
                  border: `1.5px solid ${filter === cat ? 'var(--green)' : 'var(--border)'}`,
                  background: filter === cat ? 'var(--green)' : 'var(--surface)',
                  color: filter === cat ? 'white' : 'var(--ink2)',
                  transition: 'all .2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="btn btn-green" onClick={() => setShowForm((f) => !f)}>
            🌍 Add Your Prayer Pin
          </button>
        </div>

        {/* Submit form */}
        {showForm && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1.5px solid var(--border)',
              padding: 26,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 16,
              }}
            >
              📍 Add Your Prayer to the World Map
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <input
                className="input-field"
                placeholder="Country flag emoji 🇺🇸"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
              <input
                className="input-field"
                placeholder="Your city *"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <textarea
              className="textarea-field"
              placeholder="Your prayer request (shown to the world when they hover your pin)..."
              value={form.prayer}
              onChange={(e) => setForm((f) => ({ ...f, prayer: e.target.value }))}
              style={{ height: 70, marginBottom: 14 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-green"
                onClick={submitPrayer}
                disabled={!form.prayer.trim() || !form.city.trim()}
              >
                🌍 Place My Pin on the Map
              </button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Prayer cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {filteredPins.slice(0, 9).map((pin, i) => {
            const color = CATCOLORS[pin.category || 'General'] || '#6366F1';
            return (
              <div
                key={pin.id}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 16,
                  padding: '16px 18px',
                  border: `1.5px solid ${color}22`,
                  boxShadow: '0 2px 10px rgba(0,0,0,.05)',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 6px 24px ${color}22`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,.05)';
                  e.currentTarget.style.transform = '';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--ink)' }}>
                    {pin.country} {pin.city}
                  </span>
                  <span style={{ fontSize: '.62rem', color: 'var(--ink3)', marginLeft: 'auto' }}>
                    {pin.time === 0 ? 'Just now' : pin.time + 'm ago'}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '.82rem',
                    color: 'var(--ink2)',
                    lineHeight: 1.6,
                    fontWeight: 500,
                    marginBottom: 10,
                  }}
                >
                  {pin.prayer.slice(0, 100)}
                  {pin.prayer.length > 100 ? '...' : ''}
                </p>
                <button
                  onClick={() => setPrayCount((c) => c + 1)}
                  style={{
                    fontSize: '.72rem',
                    fontWeight: 700,
                    padding: '5px 11px',
                    borderRadius: 8,
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--ink2)',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--green-bg)';
                    e.currentTarget.style.borderColor = 'var(--green)';
                    e.currentTarget.style.color = 'var(--green)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--ink2)';
                  }}
                >
                  🙏 Pray
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes ripple{0%{r:6;opacity:.4}100%{r:20;opacity:0}}
        @keyframes pingRing{0%{r:6;opacity:.6}100%{r:18;opacity:0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  );
}
