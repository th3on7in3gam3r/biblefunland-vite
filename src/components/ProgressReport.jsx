import { useState, useEffect, useRef } from 'react';
import { requestQueue } from '../lib/requestQueue';
import * as db from '../lib/db';

export default function ProgressReport({ childId, childName }) {
  const [period, setPeriod] = useState('7d');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef(null);

  // Fetch progress report when period changes
  useEffect(() => {
    if (!childId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await requestQueue.execute(
          `progress-report:${childId}:${period}`,
          () => db.getProgressReport(childId, period),
          { priority: 2, cacheable: true, ttl: 5 * 60 * 1000 }
        );

        if (result.error) {
          setError(result.error);
          setReport(null);
        } else {
          setReport(result.data || {});
        }
      } catch (err) {
        console.error('Error fetching progress report:', err);
        setError(err.message || 'Failed to load progress report');
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [childId, period]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(printRef.current.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopyToClipboard = async () => {
    if (!printRef.current) return;
    try {
      const text = printRef.current.innerText;
      await navigator.clipboard.writeText(text);
      alert('Report copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy report');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          border: '1.5px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--sh)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '.9rem', color: 'var(--ink3)', fontWeight: 600 }}>
          Loading progress report...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          border: '1.5px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--sh)',
        }}
      >
        <div style={{ fontSize: '.9rem', color: '#EF4444', fontWeight: 600 }}>⚠️ {error}</div>
      </div>
    );
  }

  const streak = report?.streak || 0;
  const totalDaysRead = report?.totalDaysRead || 0;
  const badgesEarned = report?.badgesEarned || 0;
  const quizzesCompleted = report?.quizzesCompleted || 0;
  const quizAccuracy = report?.quizAccuracy || 0;
  const activities = report?.activities || [];

  const periodLabel =
    period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'All Time';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ══ PERIOD SELECTOR ═══════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { value: '7d', label: '📅 Last 7 Days' },
          { value: '30d', label: '📊 Last 30 Days' },
          { value: 'all', label: '📈 All Time' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: period === opt.value ? '2px solid var(--blue)' : '1.5px solid var(--border)',
              background: period === opt.value ? 'var(--blue)' : 'var(--bg2)',
              color: period === opt.value ? 'white' : 'var(--ink)',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all .2s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ══ STAT CARDS ════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
          gap: 12,
        }}
      >
        {[
          { icon: '🔥', label: 'Streak', value: streak, unit: 'days' },
          { icon: '📖', label: 'Days Read', value: totalDaysRead, unit: 'days' },
          { icon: '🏆', label: 'Badges', value: badgesEarned, unit: 'earned' },
          { icon: '📝', label: 'Quizzes', value: quizzesCompleted, unit: 'completed' },
          { icon: '🎯', label: 'Accuracy', value: quizAccuracy, unit: '%' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1.5px solid var(--border)',
              padding: 16,
              textAlign: 'center',
              boxShadow: 'var(--sh)',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{stat.icon}</div>
            <div
              style={{
                fontSize: '.7rem',
                color: 'var(--ink3)',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--blue)',
                marginBottom: 4,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: '.65rem', color: 'var(--ink3)', fontWeight: 500 }}>
              {stat.unit}
            </div>
          </div>
        ))}
      </div>

      {/* ══ ACTIVITY TIMELINE ═════════════════════════════════════════════════ */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          border: '1.5px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--sh)',
        }}
      >
        <div
          style={{
            fontSize: '.68rem',
            fontWeight: 800,
            color: 'var(--ink3)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 16,
          }}
        >
          ⚡ Recent Activity ({periodLabel})
        </div>

        {activities && activities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activities.map((activity, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg2)',
                  borderRadius: 12,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderLeft: '3px solid var(--blue)',
                }}
              >
                <div style={{ fontSize: '1.3rem' }}>
                  {activity.activity_type === 'quiz'
                    ? '📝'
                    : activity.activity_type === 'reading'
                      ? '📖'
                      : '⚡'}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '.82rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      textTransform: 'capitalize',
                      marginBottom: 3,
                    }}
                  >
                    {activity.activity_type}
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}>
                    {new Date(activity.completed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                {activity.score && (
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: 'var(--green)',
                    }}
                  >
                    {activity.score}%
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: 24,
              color: 'var(--ink3)',
              fontSize: '.82rem',
              fontWeight: 500,
            }}
          >
            No activity recorded for this period
          </div>
        )}
      </div>

      {/* ══ SHARE REPORT ══════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={handlePrint}
          style={{
            flex: 1,
            minWidth: 140,
            padding: '12px 20px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--blue)',
            color: 'white',
            fontFamily: 'Poppins,sans-serif',
            fontSize: '.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all .2s',
          }}
        >
          🖨️ Print Report
        </button>
        <button
          onClick={handleCopyToClipboard}
          style={{
            flex: 1,
            minWidth: 140,
            padding: '12px 20px',
            borderRadius: 12,
            border: '1.5px solid var(--border)',
            background: 'var(--bg2)',
            color: 'var(--ink)',
            fontFamily: 'Poppins,sans-serif',
            fontSize: '.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all .2s',
          }}
        >
          📋 Copy to Clipboard
        </button>
      </div>

      {/* ══ PRINTABLE CONTENT (HIDDEN) ════════════════════════════════════════ */}
      <div
        ref={printRef}
        style={{
          display: 'none',
          padding: 40,
          fontFamily: 'Poppins,sans-serif',
          background: 'white',
          color: '#000',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            {childName}
          </div>
          <div style={{ fontSize: '.95rem', color: '#666', marginBottom: 4 }}>Progress Report</div>
          <div style={{ fontSize: '.85rem', color: '#999' }}>
            {periodLabel} •{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5,1fr)',
            gap: 20,
            marginBottom: 40,
          }}
        >
          {[
            { icon: '🔥', label: 'Streak', value: streak },
            { icon: '📖', label: 'Days Read', value: totalDaysRead },
            { icon: '🏆', label: 'Badges', value: badgesEarned },
            { icon: '📝', label: 'Quizzes', value: quizzesCompleted },
            { icon: '🎯', label: 'Accuracy', value: `${quizAccuracy}%` },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: '.75rem', color: '#666', fontWeight: 600, marginBottom: 6 }}>
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#3B82F6',
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {activities && activities.length > 0 && (
          <div>
            <div style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: 16, color: '#000' }}>
              Recent Activity
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activities.slice(0, 10).map((activity, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '.85rem',
                    paddingBottom: 8,
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                      {activity.activity_type}
                    </span>
                    {activity.score && (
                      <span style={{ marginLeft: 8, color: '#666' }}>Score: {activity.score}%</span>
                    )}
                  </div>
                  <div style={{ color: '#999' }}>
                    {new Date(activity.completed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: '1px solid #eee',
            fontSize: '.75rem',
            color: '#999',
            textAlign: 'center',
          }}
        >
          Generated on{' '}
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
