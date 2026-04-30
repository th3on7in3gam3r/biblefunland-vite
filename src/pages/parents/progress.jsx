import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getFamilyProgress,
  getChildProfiles,
  getProgressReport,
  getActivityHistory,
  getBadges,
} from '../../lib/db';
import usePageMetadata from '../../hooks/usePageMetadata';

// ─── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent, sub }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1.5px solid var(--border)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxShadow: 'var(--sh)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accent,
          borderRadius: '20px 20px 0 0',
        }}
      />
      <div style={{ fontSize: '1.8rem' }}>{icon}</div>
      <div
        style={{
          fontFamily: "'Baloo 2', cursive",
          fontSize: 'clamp(1.6rem, 3vw, 2rem)',
          fontWeight: 800,
          color: 'var(--ink)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink3)' }}>{label}</div>
      {sub && (
        <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 500 }}>{sub}</div>
      )}
    </div>
  );
}

// ─── Period Pill ─────────────────────────────────────────────────────────────────
function PeriodPill({ period, activePeriod, onClick }) {
  const labels = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', all: 'All Time' };
  const active = period === activePeriod;
  return (
    <button
      onClick={() => onClick(period)}
      style={{
        padding: '8px 18px',
        borderRadius: 100,
        border: 'none',
        background: active ? 'var(--blue)' : 'var(--bg2)',
        color: active ? 'white' : 'var(--ink3)',
        fontWeight: 700,
        fontSize: '.8rem',
        cursor: 'pointer',
        transition: 'all .2s',
      }}
    >
      {labels[period]}
    </button>
  );
}

// ─── Activity Type helpers ───────────────────────────────────────────────────────
const ACTIVITY_META = {
  quiz: { icon: '🎮', label: 'Trivia', color: '#6366f1' },
  devotional: { icon: '🙏', label: 'Devotional', color: '#10B981' },
  story: { icon: '📖', label: 'Story', color: '#F59E0B' },
  game: { icon: '🕹️', label: 'Game', color: '#EC4899' },
  reading: { icon: '📚', label: 'Reading', color: '#3B82F6' },
  flashcard: { icon: '🃏', label: 'Flashcards', color: '#8B5CF6' },
  craft: { icon: '✂️', label: 'Craft', color: '#F97316' },
  prayer: { icon: '🙏', label: 'Prayer', color: '#14B8A6' },
};
function activityMeta(type) {
  return ACTIVITY_META[type] || { icon: '⭐', label: type || 'Activity', color: '#6B7280' };
}

// ─── Main Component ──────────────────────────────────────────────────────────────
export default function ParentsProgress() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [report, setReport] = useState(null);
  const [devotionalProgress, setDevotionalProgress] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  usePageMetadata({
    title: 'Family Progress',
    description: 'Track your family learning progress and milestones in one view.',
  });

  // Load children on mount
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      getChildProfiles(user.id).catch(() => ({ data: [] })),
      getFamilyProgress(user.id).catch(() => ({ data: [] })),
      getActivityHistory(user.id, 50).catch(() => ({ data: [] })),
      getBadges(user.id).catch(() => ({ data: [] })),
    ])
      .then(([childRes, devRes, actRes, badgeRes]) => {
        const kids = childRes.data || [];
        setChildren(kids);
        setDevotionalProgress(devRes.data || []);
        setActivityHistory(actRes.data || []);
        setBadges(badgeRes.data || []);
        if (kids.length > 0) setSelectedChild(kids[0]);
      })
      .catch((err) => {
        console.error('[ParentsProgress] init error', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Load child-specific report when child or period changes
  useEffect(() => {
    if (!selectedChild) return;
    setReportLoading(true);

    getProgressReport(selectedChild.id, period)
      .then((res) => setReport(res.data || res))
      .catch((err) => {
        console.error('[ParentsProgress] report error', err);
        setReport(null);
      })
      .finally(() => setReportLoading(false));
  }, [selectedChild, period]);

  // Computed stats
  const completedDays = useMemo(
    () => devotionalProgress.filter((d) => d.status === 'completed').length,
    [devotionalProgress]
  );
  const totalDays = devotionalProgress.length;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // ─── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: '4px solid var(--border)',
            borderTopColor: 'var(--blue)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: 'var(--ink3)', fontWeight: 600 }}>Loading family progress…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          padding: '64px 24px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            left: '-8%',
            width: '40%',
            height: '160%',
            background: 'radial-gradient(circle, rgba(59,130,246,.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            right: '-8%',
            width: '40%',
            height: '160%',
            background: 'radial-gradient(circle, rgba(16,185,129,.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #60A5FA, #34D399, #A78BFA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 8,
            }}
          >
            📊 Family Progress
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,.55)',
              fontSize: '1rem',
              fontWeight: 500,
              maxWidth: 520,
              margin: '0 auto',
            }}
          >
            Track your family's learning journey, milestones, and achievements.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* ── Summary Stat Cards ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: 36,
          }}
        >
          <StatCard
            icon="👶"
            label="Children"
            value={children.length}
            accent="linear-gradient(90deg,#3B82F6,#60A5FA)"
            sub="Registered profiles"
          />
          <StatCard
            icon="🔥"
            label="Streak"
            value={`${report?.streak || 0}d`}
            accent="linear-gradient(90deg,#F59E0B,#FBBF24)"
            sub="Current streak"
          />
          <StatCard
            icon="🏅"
            label="Badges"
            value={badges.length}
            accent="linear-gradient(90deg,#8B5CF6,#A78BFA)"
            sub="Earned total"
          />
          <StatCard
            icon="📖"
            label="Devotional"
            value={`${completionRate}%`}
            accent="linear-gradient(90deg,#10B981,#34D399)"
            sub={`${completedDays}/${totalDays} days`}
          />
        </div>

        {/* ── Child Selector ─────────────────────────────────────────────────── */}
        {children.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h3
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 12,
              }}
            >
              Select Child
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {children.map((child) => {
                const active = selectedChild?.id === child.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 14,
                      border: active
                        ? '2px solid var(--blue)'
                        : '1.5px solid var(--border)',
                      background: active ? 'var(--blue)' : 'var(--surface)',
                      color: active ? 'white' : 'var(--ink)',
                      fontWeight: 700,
                      fontSize: '.88rem',
                      cursor: 'pointer',
                      transition: 'all .2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>
                      {child.avatar_url === 'girl' ? '👧' : '👦'}
                    </span>
                    {child.display_name}
                    {child.age && (
                      <span
                        style={{
                          fontSize: '.72rem',
                          opacity: active ? 0.8 : 0.5,
                          fontWeight: 500,
                        }}
                      >
                        age {child.age}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Period Filter ───────────────────────────────────────────────────── */}
        {selectedChild && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
            <PeriodPill period="7d" activePeriod={period} onClick={setPeriod} />
            <PeriodPill period="30d" activePeriod={period} onClick={setPeriod} />
            <PeriodPill period="all" activePeriod={period} onClick={setPeriod} />
          </div>
        )}

        {/* ── Child Report ────────────────────────────────────────────────────── */}
        {selectedChild && (
          <div style={{ marginBottom: 40 }}>
            <h3
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 16,
              }}
            >
              {selectedChild.display_name}'s Report
            </h3>

            {reportLoading ? (
              <div
                style={{
                  padding: 40,
                  textAlign: 'center',
                  color: 'var(--ink3)',
                  background: 'var(--surface)',
                  borderRadius: 20,
                  border: '1.5px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    border: '3px solid var(--border)',
                    borderTopColor: 'var(--blue)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 12px',
                  }}
                />
                Loading report…
              </div>
            ) : report ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 14,
                }}
              >
                <StatCard
                  icon="🔥"
                  label="Current Streak"
                  value={`${report.streak || 0}`}
                  accent="linear-gradient(90deg,#F59E0B,#F97316)"
                />
                <StatCard
                  icon="⭐"
                  label="Activities"
                  value={report.totalDaysRead || 0}
                  accent="linear-gradient(90deg,#3B82F6,#6366f1)"
                />
                <StatCard
                  icon="🎮"
                  label="Quizzes Done"
                  value={report.quizzesCompleted || 0}
                  accent="linear-gradient(90deg,#EC4899,#F43F5E)"
                />
                <StatCard
                  icon="🏅"
                  label="Badges Earned"
                  value={report.badgesEarned || 0}
                  accent="linear-gradient(90deg,#8B5CF6,#A855F7)"
                />
              </div>
            ) : (
              <div
                style={{
                  padding: 32,
                  textAlign: 'center',
                  color: 'var(--ink3)',
                  background: 'var(--surface)',
                  borderRadius: 20,
                  border: '1.5px solid var(--border)',
                  fontSize: '.9rem',
                }}
              >
                No report data available for this period.
              </div>
            )}
          </div>
        )}

        {/* ── Recent Activity Timeline ────────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <h3
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 16,
            }}
          >
            📋 Recent Activity
          </h3>

          {activityHistory.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                color: 'var(--ink3)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>No activity recorded yet</div>
              <div style={{ fontSize: '.85rem' }}>
                When your children use BibleFunLand, their activities will appear here.
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              {activityHistory.slice(0, 15).map((item, i) => {
                const meta = activityMeta(item.activity_type);
                return (
                  <div
                    key={item.id || i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 20px',
                      borderBottom:
                        i < Math.min(activityHistory.length, 15) - 1
                          ? '1px solid var(--border)'
                          : 'none',
                      transition: 'background .15s',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: `${meta.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        flexShrink: 0,
                      }}
                    >
                      {meta.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '.88rem',
                          color: 'var(--ink)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {meta.label}
                      </div>
                      {item.child_name && (
                        <div style={{ fontSize: '.76rem', color: 'var(--ink3)' }}>
                          {item.child_name}
                        </div>
                      )}
                    </div>
                    {item.duration > 0 && (
                      <div
                        style={{
                          fontSize: '.75rem',
                          fontWeight: 600,
                          color: meta.color,
                          background: `${meta.color}12`,
                          padding: '4px 10px',
                          borderRadius: 8,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.duration}m
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: '.72rem',
                        color: 'var(--ink3)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.completed_at
                        ? new Date(item.completed_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Devotional Progress ─────────────────────────────────────────────── */}
        {devotionalProgress.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h3
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 16,
              }}
            >
              📖 Devotional Progress
            </h3>

            {/* Completion bar */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                padding: 24,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  fontSize: '.85rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ color: 'var(--ink)' }}>Overall Completion</span>
                <span style={{ color: 'var(--blue)' }}>{completionRate}%</span>
              </div>
              <div
                style={{
                  height: 10,
                  background: 'var(--bg2)',
                  borderRadius: 100,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${completionRate}%`,
                    background: 'linear-gradient(90deg, #10B981, #34D399)',
                    borderRadius: 100,
                    transition: 'width .6s ease-out',
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: '.78rem',
                  color: 'var(--ink3)',
                  fontWeight: 500,
                }}
              >
                {completedDays} of {totalDays} days completed
              </div>
            </div>

            {/* Day cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}
            >
              {devotionalProgress.map((item, i) => {
                const isComplete = item.status === 'completed';
                return (
                  <div
                    key={`${item.plan_id}-${item.child_id}-${item.day_number}-${i}`}
                    style={{
                      padding: '16px 18px',
                      background: 'var(--surface)',
                      border: `1.5px solid ${isComplete ? '#10B98133' : 'var(--border)'}`,
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      transition: 'all .2s',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: isComplete
                          ? 'linear-gradient(135deg,#10B981,#059669)'
                          : 'var(--bg2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        color: isComplete ? 'white' : 'var(--ink3)',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {isComplete ? '✓' : item.day_number}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '.85rem',
                          color: 'var(--ink)',
                        }}
                      >
                        Day {item.day_number}
                      </div>
                      <div style={{ fontSize: '.74rem', color: 'var(--ink3)' }}>
                        {isComplete && item.completed_at
                          ? `Completed ${new Date(item.completed_at).toLocaleDateString()}`
                          : item.status === 'in_progress'
                            ? 'In progress'
                            : 'Not started'}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: '.7rem',
                        fontWeight: 700,
                        background: isComplete ? '#10B98118' : '#F59E0B18',
                        color: isComplete ? '#059669' : '#D97706',
                      }}
                    >
                      {isComplete ? 'Done' : item.status === 'in_progress' ? 'Active' : 'Pending'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Badges Showcase ─────────────────────────────────────────────────── */}
        {badges.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h3
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 16,
              }}
            >
              🏅 Badges Earned
            </h3>
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              {badges.map((b, i) => (
                <div
                  key={b.id || i}
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 16,
                    padding: '16px 20px',
                    textAlign: 'center',
                    minWidth: 100,
                    boxShadow: 'var(--sh)',
                  }}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{b.icon || '🏆'}</div>
                  <div
                    style={{
                      fontSize: '.78rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                    }}
                  >
                    {b.badge_id || 'Badge'}
                  </div>
                  {b.earned_at && (
                    <div style={{ fontSize: '.66rem', color: 'var(--ink3)', marginTop: 2 }}>
                      {new Date(b.earned_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty State (no children) ───────────────────────────────────────── */}
        {children.length === 0 && devotionalProgress.length === 0 && activityHistory.length === 0 && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1.5px solid var(--border)',
              padding: '48px 32px',
              textAlign: 'center',
              boxShadow: 'var(--sh)',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📊</div>
            <h2
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 8,
              }}
            >
              No Progress Data Yet
            </h2>
            <p
              style={{
                color: 'var(--ink3)',
                fontSize: '.92rem',
                maxWidth: 420,
                margin: '0 auto 24px',
                lineHeight: 1.6,
              }}
            >
              Once your children start completing devotionals, trivia games, and activities on
              BibleFunLand, their progress will appear here automatically.
            </p>
            <div
              style={{
                display: 'inline-flex',
                gap: 10,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <a
                href="/parents/controls"
                style={{
                  padding: '11px 22px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '.88rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(59,130,246,.25)',
                }}
              >
                🔒 Set Up Controls
              </a>
              <a
                href="/parents/parent-hub"
                style={{
                  padding: '11px 22px',
                  borderRadius: 12,
                  background: 'var(--bg2)',
                  color: 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '.88rem',
                  textDecoration: 'none',
                  border: '1.5px solid var(--border)',
                }}
              >
                🏠 Back to Hub
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
