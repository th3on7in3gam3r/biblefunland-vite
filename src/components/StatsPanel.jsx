import styles from './StatsPanel.module.css';

const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));

const countBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const k = item[key];
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

const StatsPanel = ({ data }) => {
  const { milestones = [], mentors = [], verses = [], prayers = [] } = data;

  const totalItems = milestones.length + mentors.length + verses.length + prayers.length;
  const milestoneCategories = countBy(milestones, 'category');
  const mentorRelationships = countBy(mentors, 'relationship');
  const stillConnected = mentors.filter((m) => m.still_connected).length;

  const prayerDays = prayers.map((p) => daysBetween(p.prayer_date, p.answer_date));

  const prayerStats = prayerDays.reduce(
    (acc, days) => {
      if (days <= 7) acc.week++;
      else if (days <= 30) acc.month++;
      else acc.later++;
      return acc;
    },
    { week: 0, month: 0, later: 0 }
  );

  const avgDaysToAnswer =
    prayerDays.length > 0
      ? Math.round(prayerDays.reduce((sum, d) => sum + d, 0) / prayerDays.length)
      : 0;

  const recentActivity = [...milestones, ...prayers]
    .map((item) => ({
      ...item,
      date: item.milestone_date || item.answer_date,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const categories = [
    { key: 'salvation', label: 'Salvation', icon: '✝️', color: '#10b981' },
    { key: 'baptism', label: 'Baptism', icon: '💧', color: '#3b82f6' },
    { key: 'rededication', label: 'Rededication', icon: '🔄', color: '#8b5cf6' },
    { key: 'ministry', label: 'Ministry', icon: '🎭', color: '#f59e0b' },
  ];

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h2>📊 Journey Stats</h2>
        <p className={styles.subtitle}>Your faith at a glance</p>
      </div>

      <div className={styles.totalCard}>
        <span className={styles.totalNumber}>{totalItems}</span>
        <span className={styles.totalLabel}>Total Memories</span>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✨</span>
          <span className={styles.statValue}>{milestones.length}</span>
          <span className={styles.statLabel}>Milestones</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>👥</span>
          <span className={styles.statValue}>{mentors.length}</span>
          <span className={styles.statLabel}>Mentors</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📖</span>
          <span className={styles.statValue}>{verses.length}</span>
          <span className={styles.statLabel}>Verses</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🙏</span>
          <span className={styles.statValue}>{prayers.length}</span>
          <span className={styles.statLabel}>Answered</span>
        </div>
      </div>

      {milestones.length > 0 && (
        <div className={styles.section}>
          <h3>Milestone Breakdown</h3>
          <div className={styles.categoryList}>
            {categories.map((cat) => {
              const count = milestoneCategories[cat.key] || 0;
              if (count === 0) return null;
              const pct = Math.round((count / milestones.length) * 100);
              return (
                <div key={cat.key} className={styles.categoryItem}>
                  <div className={styles.categoryHeader}>
                    <span>
                      {cat.icon} {cat.label}
                    </span>
                    <span className={styles.categoryCount}>{count}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mentors.length > 0 && (
        <div className={styles.section}>
          <h3>Mentor Connections</h3>
          <div className={styles.connectionStats}>
            <div className={styles.connectionItem}>
              <span className={styles.connectionIcon}>💚</span>
              <span>{stillConnected} still connected</span>
            </div>
            {Object.entries(mentorRelationships).map(([rel, count]) => (
              <div key={rel} className={styles.connectionItem}>
                <span>
                  {rel}: {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {prayers.length > 0 && (
        <div className={styles.section}>
          <h3>Prayer Insights</h3>
          <div className={styles.prayerStats}>
            <div className={styles.prayerStat}>
              <span className={styles.prayerStatValue}>{avgDaysToAnswer}</span>
              <span className={styles.prayerStatLabel}>Avg days to answer</span>
            </div>
            <div className={styles.prayerBreakdown}>
              <div className={styles.prayerBreakdownItem}>
                <span className={styles.dot} style={{ background: '#10b981' }} />
                <span>Within a week: {prayerStats.week}</span>
              </div>
              <div className={styles.prayerBreakdownItem}>
                <span className={styles.dot} style={{ background: '#3b82f6' }} />
                <span>Within a month: {prayerStats.month}</span>
              </div>
              <div className={styles.prayerBreakdownItem}>
                <span className={styles.dot} style={{ background: '#8b5cf6' }} />
                <span>Longer: {prayerStats.later}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {verses.length > 0 && (
        <div className={styles.section}>
          <h3>Scripture Highlights</h3>
          <p className={styles.verseCount}>
            {verses.length} verses carried you through difficult seasons
          </p>
        </div>
      )}

      {recentActivity.length > 0 && (
        <div className={styles.section}>
          <h3>Recent Activity</h3>
          <div className={styles.recentList}>
            {recentActivity.map((item, i) => (
              <div key={i} className={styles.recentItem}>
                <span className={styles.recentIcon}>{item.milestone_date ? '✨' : '🙏'}</span>
                <span className={styles.recentText}>{item.title || 'Prayer Answered'}</span>
                <span className={styles.recentDate}>
                  {new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalItems === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🌱</span>
          <p>Start your journey by adding milestones, mentors, verses, or prayers</p>
        </div>
      )}
    </aside>
  );
};

export default StatsPanel;
