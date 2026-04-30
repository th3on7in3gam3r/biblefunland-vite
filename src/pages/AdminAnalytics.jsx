import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { query } from '../lib/db';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const GA_CONFIGURED = GA_ID && GA_ID !== 'G-XXXXXXXXXX';

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = '#3B82F6' }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 18,
        border: '1.5px solid var(--border)',
        padding: '22px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: color + '18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontSize: '.75rem',
            fontWeight: 700,
            color: 'var(--ink3)',
            textTransform: 'uppercase',
            letterSpacing: '.04em',
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          fontFamily: "'Baloo 2',cursive",
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--ink)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: '.72rem', color: 'var(--ink3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Bar chart row ────────────────────────────────────────────────────────────
function BarRow({ label, value, max, color = '#3B82F6' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 4,
          fontSize: '.78rem',
          fontWeight: 600,
          color: 'var(--ink2)',
        }}
      >
        <span>{label}</span>
        <span style={{ color: 'var(--ink3)' }}>{value.toLocaleString()}</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            borderRadius: 99,
            background: color,
            width: `${pct}%`,
            transition: 'width .6s ease',
          }}
        />
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [users, activities, prayers, badges, streaks] = await Promise.all([
          query('SELECT COUNT(*) AS total FROM profiles', []),
          query(
            'SELECT activity_type, COUNT(*) AS cnt FROM child_activity GROUP BY activity_type ORDER BY cnt DESC LIMIT 10',
            []
          ),
          query('SELECT COUNT(*) AS total FROM prayer_requests', []),
          query(
            'SELECT badge_id, COUNT(*) AS cnt FROM badges GROUP BY badge_id ORDER BY cnt DESC LIMIT 8',
            []
          ),
          query(
            'SELECT streak, COUNT(*) AS cnt FROM streaks WHERE streak > 0 GROUP BY streak ORDER BY streak DESC LIMIT 5',
            []
          ),
        ]);

        setStats({
          totalUsers: users.data?.[0]?.total || 0,
          totalPrayers: prayers.data?.[0]?.total || 0,
          activities: activities.data || [],
          topBadges: badges.data || [],
          streakDist: streaks.data || [],
        });
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxActivity = stats ? Math.max(...stats.activities.map((a) => a.cnt), 1) : 1;
  const maxBadge = stats ? Math.max(...stats.topBadges.map((b) => b.cnt), 1) : 1;

  const ACTIVITY_LABELS = {
    quiz: '🎯 Trivia Quiz',
    reading: '📖 Bible Reading',
    prayer: '🙏 Prayer',
    devotional: '✝️ Devotional',
    flashcard: '🧠 Flashcards',
    game: '🎮 Game',
    story: '📚 Story',
    worship: '🎵 Worship',
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Header */}
      <div
        style={{ background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', padding: '48px 32px 36px' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link
            to="/admin"
            style={{
              fontSize: '.8rem',
              color: 'rgba(255,255,255,.4)',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            ← Admin
          </Link>
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1.8rem,4vw,2.8rem)',
              fontWeight: 800,
              color: 'white',
              marginBottom: 6,
            }}
          >
            📊 Analytics Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem' }}>
            Platform usage, feature engagement, and community stats
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* GA4 status banner — only show when GA4 is actually configured */}
        {GA_CONFIGURED && (
          <div
            style={{
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 28,
              background: 'var(--green-bg)',
              border: '1.5px solid var(--green)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '.82rem',
              fontWeight: 600,
              color: 'var(--green)',
            }}
          >
            ✅ GA4 connected — Measurement ID: {GA_ID}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink3)' }}>
            Loading stats...
          </div>
        ) : (
          <>
            {/* Top stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                gap: 14,
                marginBottom: 32,
              }}
            >
              <StatCard
                icon="👥"
                label="Total Users"
                value={stats.totalUsers.toLocaleString()}
                color="#3B82F6"
              />
              <StatCard
                icon="🙏"
                label="Prayers Posted"
                value={stats.totalPrayers.toLocaleString()}
                color="#10B981"
              />
              <StatCard
                icon="🎯"
                label="Activities Tracked"
                value={stats.activities.reduce((s, a) => s + a.cnt, 0).toLocaleString()}
                color="#8B5CF6"
              />
              <StatCard
                icon="🏆"
                label="Badges Earned"
                value={stats.topBadges.reduce((s, b) => s + b.cnt, 0).toLocaleString()}
                color="#F59E0B"
              />
            </div>

            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}
            >
              {/* Feature usage */}
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 18,
                  border: '1.5px solid var(--border)',
                  padding: '22px 20px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 18,
                  }}
                >
                  🎮 Feature Usage
                </div>
                {stats.activities.length === 0 ? (
                  <p style={{ color: 'var(--ink3)', fontSize: '.82rem' }}>No activity data yet.</p>
                ) : (
                  stats.activities.map((a) => (
                    <BarRow
                      key={a.activity_type}
                      label={ACTIVITY_LABELS[a.activity_type] || a.activity_type}
                      value={a.cnt}
                      max={maxActivity}
                      color="#3B82F6"
                    />
                  ))
                )}
              </div>

              {/* Top badges */}
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 18,
                  border: '1.5px solid var(--border)',
                  padding: '22px 20px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 18,
                  }}
                >
                  🏆 Top Badges Earned
                </div>
                {stats.topBadges.length === 0 ? (
                  <p style={{ color: 'var(--ink3)', fontSize: '.82rem' }}>No badge data yet.</p>
                ) : (
                  stats.topBadges.map((b) => (
                    <BarRow
                      key={b.badge_id}
                      label={b.badge_id}
                      value={b.cnt}
                      max={maxBadge}
                      color="#F59E0B"
                    />
                  ))
                )}
              </div>
            </div>

            {/* GA4 embed note */}
            {GA_CONFIGURED && (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 18,
                  border: '1.5px solid var(--border)',
                  padding: '24px 22px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 8,
                  }}
                >
                  📈 Google Analytics 4
                </div>
                <p
                  style={{
                    fontSize: '.82rem',
                    color: 'var(--ink3)',
                    lineHeight: 1.7,
                    marginBottom: 14,
                  }}
                >
                  Real-time visitors, traffic sources, page views, and conversion funnels are
                  available in your GA4 dashboard.
                </p>
                <a
                  href={`https://analytics.google.com/analytics/web/#/p${GA_ID.replace('G-', '')}/reports/reportinghub`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 18px',
                    borderRadius: 10,
                    background: 'var(--blue)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '.82rem',
                    textDecoration: 'none',
                  }}
                >
                  Open GA4 Dashboard →
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
