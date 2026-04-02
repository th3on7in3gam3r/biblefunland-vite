import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFamilyProgress } from '../../lib/db';
import usePageMetadata from '../../hooks/usePageMetadata';

export default function ParentsProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageMetadata({
    title: 'Family Progress',
    description: 'Track your family learning progress and milestones in one view.',
  });

  useEffect(() => {
    if (!user) return;

    getFamilyProgress(user.id)
      .then(({ data }) => setProgress(data || []))
      .catch((err) => {
        console.error('[ParentsProgress] fetch error', err);
        setProgress([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div className="spinner" />
        <p>Loading family progress...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '20px' }}>
      <h1>Family Progress Dashboard</h1>
      <p>Visit this page anytime to review your household’s achievements and streaks.</p>

      {progress.length === 0 ? (
        <div style={{ marginTop: 20, color: '#6b7280' }}>
          No family progress data yet. Encourage your children to complete daily adventures and
          devotionals.
        </div>
      ) : (
        <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
          {progress.map((item) => (
            <div
              key={`${item.plan_id}-${item.child_id}-${item.day_number}`}
              style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 10 }}
            >
              <strong>{item.plan_id}</strong> — child {item.child_id}, day {item.day_number},
              status: {item.status}
              <div style={{ fontSize: '.85rem', color: '#4b5563' }}>
                {item.completed_at
                  ? `Completed ${new Date(item.completed_at).toLocaleDateString()}`
                  : 'Not completed'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
