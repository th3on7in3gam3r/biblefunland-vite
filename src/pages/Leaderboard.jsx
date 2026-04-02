import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/Skeleton';
import Podium from '../components/Podium';
import LeaderboardRow from '../components/LeaderboardRow';
import { useRealTime } from '../context/RealTimeContext';

const TABS = [
  { id: 'streaks', label: '🔥 Top Streaks' },
  { id: 'badges', label: '🏆 Most Badges' },
  { id: 'trivia', label: '🎯 Trivia Champions' },
];

import API_URL from '../lib/api-config';

async function fetchLeaderboard(category, userId) {
  try {
    const url = `${API_URL}/api/leaderboard/${category}${userId ? `?userId=${userId}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
       console.warn(`[Leaderboard API] ${res.status} error`);
       return { entries: [], currentUser: null, success: false };
    }
    return await res.json();
  } catch (err) {
    console.error('[Leaderboard API] Fetch error:', err.message);
    return { entries: [], currentUser: null, success: false };
  }
}

export default function Leaderboard() {
  const { user } = useAuth();
  const { leaderboard, refresh } = useRealTime();
  const [activeTab, setActiveTab] = useState('streaks');
  const [data, setData] = useState({ entries: [], currentUser: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // Sync live leaderboard streaks into local state when available
  useEffect(() => {
    if (leaderboard?.live && activeTab === 'streaks' && leaderboard.streaks?.length) {
      setData((prev) => ({ ...prev, entries: leaderboard.streaks }));
      setLoading(false);
    }
  }, [leaderboard, activeTab]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLeaderboard(activeTab, user?.id);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, user?.id, retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
    // Trigger RealTime context refresh for leaderboard too
    refresh('leaderboard');
  }, [load]);

  const topThree = data.entries.slice(0, 3);
  const rest = data.entries.slice(3);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
          padding: '60px 36px 44px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 'clamp(2rem,4.5vw,3.2rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#FBBF24,#F59E0B,#D97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          🏆 Leaderboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500 }}>
          Top streaks, badges, and trivia champions across the community
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ marginBottom: 10, color: '#6b7280', fontSize: '.8rem' }}>
          {leaderboard?.live ? '🟢 Live' : 'Refreshing'} · last updated{' '}
          {new Date().toLocaleTimeString()}
        </div>
        {/* Tab strip */}
        <div
          style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 28, paddingBottom: 4 }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px',
                borderRadius: 99,
                border: `2px solid ${activeTab === tab.id ? 'var(--blue)' : 'var(--border)'}`,
                background: activeTab === tab.id ? 'var(--blue-bg)' : 'var(--surface)',
                color: activeTab === tab.id ? 'var(--blue)' : 'var(--ink)',
                fontWeight: 700,
                fontSize: '.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all .2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && <PageLoader />}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: 'var(--red)', marginBottom: 16 }}>{error}</p>
            <button className="btn btn-blue" onClick={() => setRetryKey((k) => k + 1)}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data.entries.length === 0 && (
          <div
            style={{ textAlign: 'center', padding: 60, color: 'var(--ink3)', fontSize: '.95rem' }}
          >
            No entries yet — be the first! 🌟
          </div>
        )}

        {!loading && !error && data.entries.length > 0 && (
          <>
            <Podium entries={topThree} category={activeTab} />

            {rest.length > 0 && (
              <div style={{ marginTop: 16 }}>
                {rest.map((entry) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    category={activeTab}
                    isCurrentUser={entry.userId === user?.id}
                    isPinned={false}
                  />
                ))}
              </div>
            )}

            {/* Pinned current user if outside top 25 */}
            {data.currentUser && (
              <LeaderboardRow
                entry={data.currentUser}
                category={activeTab}
                isCurrentUser={true}
                isPinned={true}
              />
            )}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/" style={{ color: 'var(--ink3)', fontSize: '.85rem', textDecoration: 'none' }}>
            ← Home
          </Link>
        </div>
      </div>
    </div>
  );
}
