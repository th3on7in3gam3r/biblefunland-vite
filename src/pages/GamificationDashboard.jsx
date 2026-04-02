import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PointsDisplay from '../components/PointsDisplay';
import ProgressBar from '../components/ProgressBar';
import BadgeShowcase from '../components/BadgeShowcase';
import { useBadges } from '../context/BadgeContext';
import { API_URL as API } from '../lib/api-config';

export default function GamificationDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { badges: earnedBadges } = useBadges();

  useEffect(() => {
    if (!user?.id) return;

    fetch(`${API}/api/gamification/user/${user.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.error('[GamificationDashboard] fetch failed', err);
        setError('Could not load gamification details.');
      });
  }, [user]);

  const progress = data?.progress || { points: 0, total_score: 0, last_activity: null };
  const streak = data?.streak || 0;
  const rank = data?.rank ?? null;
  const earned = data?.badges || [];

  const badgeDetails = useMemo(() => {
    return earned.map((item) => {
      const maybe = typeof item === 'object' ? item : { badge_id: item };
      return {
        badge_id: maybe.badge_id || maybe.id || maybe,
        name: maybe.badge_id || 'Unknown',
        emoji: '🏅',
        description: typeof item === 'object' ? item.earned_at?.slice(0, 10) : '',
      };
    });
  }, [earned]);

  const earnedCount = earnedBadges?.size || 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '20px 16px 40px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>🏆 Gamification Dashboard</h1>
      <p style={{ color: 'var(--ink3)', marginBottom: 20 }}>
        Track your points, streaks, and badges across family challenges and learning paths.
      </p>

      {user ? (
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 16 }}>
          <PointsDisplay points={progress.points || 0} streak={streak} rank={rank} />

          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Weekly progress</h2>
              <span style={{ color: 'var(--ink3)', fontSize: '.75rem' }}>
                Last updated:{' '}
                {progress.last_activity ? new Date(progress.last_activity).toLocaleString() : 'N/A'}
              </span>
            </div>

            <ProgressBar
              value={progress.total_score || 0}
              max={1000}
              label="Total score toward next tier"
              accent="#10B981"
            />
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 16 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>Badges ({earnedCount})</h2>
            <BadgeShowcase badges={badgeDetails} />
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 16 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>Actions</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
                gap: 10,
              }}
            >
              <button
                onClick={async () => {
                  if (!user.id) return;
                  try {
                    await fetch(`${API}/api/gamification/points/earn`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user.id, points: 20, reason: 'daily-check-in' }),
                    });
                    window.location.reload();
                  } catch (err) {
                    if (import.meta.env.DEV) console.error('🏆 Gamification Error:', err);
                  }
                }}
              >
                +20 Points
              </button>
              <button
                onClick={async () => {
                  if (!user.id) return;
                  try {
                    await fetch(`${API}/api/gamification/streaks/update`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user.id }),
                    });
                    window.location.reload();
                  } catch (err) {
                    if (import.meta.env.DEV) console.error('🔥 Streak Error:', err);
                  }
                }}
              >
                Update Streak
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--ink3)' }}>Sign in to see your gamification stats.</div>
      )}

      {error && <div style={{ marginTop: 16, color: '#DC2626' }}>{error}</div>}
    </div>
  );
}
