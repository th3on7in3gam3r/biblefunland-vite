import styles from './Timeline.module.css';

const TYPE_CONFIG = {
  milestone: { icon: '✨', label: 'Milestone', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.08)' },
  mentor: { icon: '👥', label: 'Mentor', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.08)' },
  verse: { icon: '📖', label: 'Scripture', color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)' },
  prayer: { icon: '🙏', label: 'Prayer Answer', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' },
};

function fmt(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const Timeline = ({ data, onEdit, onDelete }) => {
  const allEvents = [
    ...data.milestones.map((m) => ({
      type: 'milestone',
      date: m.milestone_date,
      title: m.title,
      desc: m.description,
      sub: m.category,
      item: m,
    })),
    ...data.mentors.map((m) => ({
      type: 'mentor',
      date: m.meeting_date,
      title: m.name,
      desc: m.how_they_shaped,
      sub: m.relationship,
      item: m,
    })),
    ...data.verses.map((v) => ({
      type: 'verse',
      date: v.season_date,
      title: v.reference,
      desc: `"${v.text}"`,
      sub: 'Comforting Scripture',
      item: v,
    })),
    ...data.prayers.map((p) => ({
      type: 'prayer',
      date: p.answer_date,
      title: 'Prayer Answered',
      desc: p.answer_text,
      sub: p.prayer_date
        ? `${Math.max(0, Math.floor((new Date(p.answer_date) - new Date(p.prayer_date)) / 86400000))} day wait`
        : '',
      item: p,
    })),
  ]
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const stats = [
    { label: 'Milestones', value: data.milestones.length, icon: '✨', color: '#8B5CF6' },
    { label: 'Mentors', value: data.mentors.length, icon: '👥', color: '#3B82F6' },
    { label: 'Verses', value: data.verses.length, icon: '📖', color: '#10B981' },
    { label: 'Prayers', value: data.prayers.length, icon: '🙏', color: '#F59E0B' },
  ];

  return (
    <div className={styles.layout}>
      {/* ── Journey Statistics Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.stickyPanel}>
          <h3 className={styles.panelTitle}>📊 Journey Stats</h3>
          <p className={styles.panelSub}>Mapping your spiritual walk</p>
          <div className={styles.statsList}>
            {stats.map((s, i) => (
              <StatRow key={i} {...s} />
            ))}
          </div>
        </div>

        <div className={styles.stickyPanel}>
          <h3 className={styles.panelTitle} style={{ fontSize: '1rem' }}>
            🔖 Legend
          </h3>
          <div className={styles.legendList}>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <div key={type} className={styles.legendItem}>
                <div className={styles.legendIcon} style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <span className={styles.legendLabel}>{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Timeline Events Feed ── */}
      <div className={styles.feedWrapper}>
        {allEvents.length === 0 ? (
          <div className={styles.emptyTimeline}>
            <div className={styles.journeyIcon}>🛤️</div>
            <h3 className={styles.emptyTitle}>Your sacred story begins here</h3>
            <p className={styles.emptyDesc}>
              Start recording milestones, mentors, and answered prayers to see your journey unfold.
            </p>
          </div>
        ) : (
          <div className={styles.feed}>
            {allEvents.map((event, i) => {
              const cfg = TYPE_CONFIG[event.type];
              return (
                <article
                  key={`${event.type}-${event.item.id}-${i}`}
                  className={styles.eventCard}
                  style={{ '--event-color': cfg.color, '--event-bg': cfg.bg }}
                >
                  <div className={styles.eventHeader}>
                    <div
                      className={styles.eventIcon}
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.icon}
                    </div>
                    <div className={styles.eventTitleGroup}>
                      <h4 className={styles.eventTitle}>{event.title}</h4>
                      <div className={styles.eventMeta}>
                        <span
                          className={styles.typeBadge}
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                        {event.sub && <span className={styles.eventDate}>• {event.sub}</span>}
                        <span className={styles.eventDate}>📅 {fmt(event.date)}</span>
                      </div>
                    </div>
                  </div>

                  {event.desc && <p className={styles.eventDesc}>{event.desc}</p>}

                  <div className={styles.actions}>
                    <button
                      onClick={() => onEdit(event.type, event.item)}
                      className={styles.btnEditTimeline}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onDelete(event.type, event.item.id)}
                      className={styles.btnDeleteTimeline}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const StatRow = ({ icon, label, value, color }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink2)' }}>{label}</span>
    </div>
    <span style={{ fontFamily: 'Baloo 2, cursive', fontWeight: 900, fontSize: '1.2rem', color }}>
      {value}
    </span>
  </div>
);

export default Timeline;
