import styles from '../pages/FaithMilestones.module.css';

const fmtDate = (d) => {
  if (!d) return 'Not set';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return d;
  }
};

export const MilestoneCard = ({ item }) => (
  <>
    <div className={styles.cardTypeBadge}>Milestone</div>
    <div className={styles.cardIcon}>✨</div>
    <h3>{item.title}</h3>
    <div className={styles.cardDate}>📅 {fmtDate(item.milestone_date)}</div>
    {item.photo_url && (
      <img src={item.photo_url} alt={item.title} className={styles.cardImg} loading="lazy" />
    )}
    <p className={styles.cardText}>{item.description}</p>
    {item.impact_story && (
      <div className={styles.verseDisplay}>
        <strong>Faith Impact:</strong> {item.impact_story}
      </div>
    )}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
      {item.category && <span className={styles.tabBadge}>{item.category}</span>}
      {item.tags?.split(',').map((t) => (
        <span key={t} style={{ fontSize: '0.65rem', color: 'var(--ink3)', fontWeight: 600 }}>
          #{t.trim()}
        </span>
      ))}
    </div>
  </>
);

export const MentorCard = ({ item }) => (
  <>
    <div className={styles.cardTypeBadge}>Mentor</div>
    <div className={styles.cardIcon}>👥</div>
    <h3>{item.name}</h3>
    <div className={styles.cardDate}>⭐ {item.relationship}</div>
    {item.photo_url && (
      <img src={item.photo_url} alt={item.name} className={styles.cardImg} loading="lazy" />
    )}
    <p className={styles.cardText}>{item.how_they_shaped}</p>
    <div className={styles.cardDate}>🤝 Met: {fmtDate(item.meeting_date)}</div>
    <div
      style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '0.7rem',
        color: item.still_connected ? 'var(--green)' : 'var(--ink3)',
        fontWeight: 700,
      }}
    >
      {item.still_connected ? '🟢 Still Connected' : '🔘 Former Mentor'}
    </div>
  </>
);

export const VerseCard = ({ item }) => (
  <>
    <div className={styles.cardTypeBadge}>Hard Season Verse</div>
    <div className={styles.cardIcon}>📖</div>
    <h3>{item.reference}</h3>
    <div className={styles.verseDisplay}>"{item.text}"</div>
    <p className={styles.cardText}>
      <strong>The Challenge:</strong> {item.what_was_hard}
      {item.how_it_helped && (
        <>
          <br />
          <br />
          <strong>Comfort:</strong> {item.how_it_helped}
        </>
      )}
    </p>
    <div className={styles.cardDate} style={{ marginTop: 'auto' }}>
      🗓️ {fmtDate(item.season_date)}
    </div>
  </>
);

export const PrayerCard = ({ item }) => {
  const days = Math.floor(
    (new Date(item.answer_date) - new Date(item.prayer_date)) / (1000 * 60 * 60 * 24)
  );
  return (
    <>
      <div className={styles.cardTypeBadge}>Answered Prayer</div>
      <div className={styles.cardIcon}>🙏</div>
      <h3>Prayer & Answer</h3>
      <div className={styles.cardDate}>⏱️ Waited {days} days</div>
      <p className={styles.cardText}>
        <strong>The Request:</strong> {item.prayer_text}
      </p>
      <div
        className={styles.verseDisplay}
        style={{ borderLeftColor: 'var(--blue)', color: 'var(--blue)' }}
      >
        <strong>The Miracle:</strong> {item.answer_text}
      </div>
      <div className={styles.cardDate} style={{ marginTop: 'auto' }}>
        📅 {fmtDate(item.prayer_date)} → {fmtDate(item.answer_date)}
      </div>
    </>
  );
};
