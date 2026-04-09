import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/api-config';
import styles from './FaithMilestones.module.css';
import Timeline from '../components/Timeline';
import FormModal from '../components/FormModal';
import {
  MilestoneCard,
  MentorCard,
  VerseCard,
  PrayerCard,
} from '../components/FaithMilestoneCards';

const TABS = [
  { id: 'timeline', label: 'Timeline', icon: '🗓️' },
  { id: 'milestones', label: 'Milestones', icon: '✨' },
  { id: 'mentors', label: 'Mentors', icon: '👥' },
  { id: 'verses', label: 'Hard Seasons', icon: '📖' },
  { id: 'prayers', label: 'Prayers', icon: '🙏' },
];

const SINGULAR = {
  milestones: 'milestone',
  mentors: 'mentor',
  verses: 'verse',
  prayers: 'prayer',
};

const EMPTY_MESSAGES = {
  milestones: {
    icon: '✨',
    title: 'Start Your Record',
    text: 'No milestones yet. Add your first sacred moment!',
  },
  mentors: {
    icon: '👥',
    title: 'Honor Your Mentors',
    text: 'No mentors recorded. Add the people who shaped your faith!',
  },
  verses: {
    icon: '📖',
    title: 'Scripture Strength',
    text: 'No verses recorded. Add the scriptures God gave you in hard seasons!',
  },
  prayers: {
    icon: '🙏',
    title: 'Miracle Journal',
    text: 'No answered prayers recorded yet. Add the prayers God has answered!',
  },
};

const today = () => new Date().toISOString().split('T')[0];

const MODAL_CONFIGS = {
  milestone: {
    icon: '✨',
    label: 'Milestone',
    endpoint: 'milestones',
    fields: [
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        defaultValue: 'salvation',
        options: [
          { value: 'salvation', label: '🕊️ Salvation' },
          { value: 'baptism', label: '💧 Baptism' },
          { value: 'rededication', label: '🔄 Rededication' },
          { value: 'ministry', label: '🙌 Ministry Highlight' },
        ],
      },
      { name: 'title', label: 'Title *', required: true, placeholder: 'Give this moment a title' },
      {
        name: 'milestone_date',
        label: 'Date *',
        type: 'date',
        required: true,
        defaultValue: today(),
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'What happened on this day?',
      },
      {
        name: 'impact_story',
        label: 'Impact Story',
        type: 'textarea',
        placeholder: 'How did this moment change your faith?',
      },
      { name: 'photo_url', label: 'Photo URL', type: 'url', placeholder: 'https://...' },
      { name: 'tags', label: 'Tags', placeholder: 'e.g., family, church' },
      {
        name: 'is_public',
        label: 'Share with the community',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },
  mentor: {
    icon: '👥',
    label: 'Mentor',
    endpoint: 'mentors',
    fields: [
      { name: 'name', label: 'Name *', required: true, placeholder: "Mentor's name" },
      {
        name: 'relationship',
        label: 'Relationship',
        type: 'select',
        defaultValue: 'pastor',
        options: [
          { value: 'pastor', label: '🙏 Pastor' },
          { value: 'parent', label: '👨‍👩‍👧 Parent' },
          { value: 'teacher', label: '🏫 Teacher' },
          { value: 'friend', label: '🤝 Friend' },
          { value: 'counselor', label: '🗣️ Counselor' },
          { value: 'other', label: '➕ Other' },
        ],
      },
      {
        name: 'how_they_shaped',
        label: 'How They Shaped You',
        type: 'textarea',
        placeholder: 'Their influence in your life',
      },
      { name: 'meeting_date', label: 'When You Met Them', type: 'date', defaultValue: today() },
      { name: 'photo_url', label: 'Photo URL', type: 'url', placeholder: 'https://...' },
      { name: 'contact_info', label: 'Contact Info', placeholder: 'Optional phone or email' },
      {
        name: 'still_connected',
        label: 'Still in touch with this mentor',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },
  verse: {
    icon: '📖',
    label: 'Verse',
    endpoint: 'verses',
    fields: [
      {
        name: 'reference',
        label: 'Scripture Reference *',
        required: true,
        placeholder: 'e.g., John 3:16',
      },
      {
        name: 'text',
        label: 'Full Verse Text *',
        type: 'textarea',
        required: true,
        placeholder: 'The full text of the verse',
      },
      {
        name: 'what_was_hard',
        label: 'What Was the Difficulty? *',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the season',
      },
      {
        name: 'how_it_helped',
        label: 'How Did It Help?',
        type: 'textarea',
        placeholder: 'How did this scripture give you strength?',
      },
      {
        name: 'season_date',
        label: 'When Was This? *',
        type: 'date',
        required: true,
        defaultValue: today(),
      },
      {
        name: 'still_meaningful',
        label: 'This verse is still meaningful',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },
  prayer: {
    icon: '🙏',
    label: 'Answered Prayer',
    endpoint: 'prayers',
    fields: [
      {
        name: 'prayer_text',
        label: 'What Did You Pray For? *',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your request',
      },
      {
        name: 'answer_text',
        label: 'How Did God Answer? *',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the answer',
      },
      {
        name: 'prayer_date',
        label: 'When Did You Pray? *',
        type: 'date',
        required: true,
        defaultValue: today(),
      },
      {
        name: 'answer_date',
        label: 'When Was It Answered? *',
        type: 'date',
        required: true,
        defaultValue: today(),
      },
      {
        name: 'impact_story',
        label: 'Impact on Your Faith',
        type: 'textarea',
        placeholder: 'Strength of faith',
      },
      {
        name: 'photos',
        label: 'Photo URLs (comma-separated)',
        type: 'textarea',
        placeholder: 'https://...',
      },
      {
        name: 'is_public',
        label: 'Share with the community',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },
};

const FaithMilestones = () => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState({ milestones: [], mentors: [], verses: [], prayers: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [showModal, setShowModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/faith-milestones/summary`, {
        headers: { 'x-user-id': user.id },
      });
      if (!response.ok) throw new Error('Failed to load data');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      if (import.meta.env.DEV) console.error('✨ FaithMilestones Load Error:', err);
      // Don't show error for network issues — just show empty state
      setData({ milestones: [], mentors: [], verses: [], prayers: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this sacred memory?')) return;
    const endpoint =
      type === 'milestone'
        ? 'milestones'
        : type === 'mentor'
          ? 'mentors'
          : type === 'verse'
            ? 'verses'
            : 'prayers';
    try {
      const response = await fetch(`${API_URL}/api/faith-milestones/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      });
      if (!response.ok) throw new Error('Delete failed');
      loadData();
    } catch (err) {
      if (import.meta.env.DEV) console.error('✨ FaithMilestones Delete Error:', err);
    }
  };

  const handleOpenModal = (type, item = null) => {
    setEditingItem(item);
    setShowModal(type);
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setEditingItem(null);
  };

  if (authLoading) return <FullLoading />;
  if (!user) return <AuthPrompt />;

  const modalConfig = showModal ? MODAL_CONFIGS[showModal] : null;

  return (
    <div className={styles.container}>
      {/* ── Hero Section ── */}
      <section className={styles.hero}>
        <h1>Faith Milestones</h1>
        <p>
          A personal record of your spiritual journey, answered prayers, and the mentors who shaped
          your walk with God.
        </p>
      </section>

      {/* ── Quick Stats Bar ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🛤️</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {data.milestones.length +
                data.mentors.length +
                data.verses.length +
                data.prayers.length}
            </span>
            <span className={styles.statLabel}>Total Memories</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✨</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{data.milestones.length}</span>
            <span className={styles.statLabel}>Milestones</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🙏</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{data.prayers.length}</span>
            <span className={styles.statLabel}>Answers</span>
          </div>
        </div>
      </div>

      <div className={styles.mainWrapper}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* ── Modern Tabs ── */}
        <div className={styles.tabsContainer}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabItem} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i>{tab.icon}</i>
              <span>{tab.label}</span>
              {tab.id !== 'timeline' && (
                <span className={styles.tabBadge}>{data[tab.id]?.length || 0}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content View ── */}
        <div className={styles.viewContainer}>
          {loading && !data.milestones.length ? (
            <LoadingView />
          ) : activeTab === 'timeline' ? (
            <Timeline data={data} onEdit={handleOpenModal} onDelete={handleDelete} />
          ) : (
            <GridView
              type={activeTab}
              data={data[activeTab]}
              onAdd={() => handleOpenModal(SINGULAR[activeTab])}
              onEdit={(item) => handleOpenModal(SINGULAR[activeTab], item)}
              onDelete={(id) => handleDelete(SINGULAR[activeTab], id)}
            />
          )}
        </div>
      </div>

      {modalConfig && (
        <FormModal
          icon={modalConfig.icon}
          label={modalConfig.label}
          endpoint={modalConfig.endpoint}
          fields={modalConfig.fields}
          onClose={handleCloseModal}
          onSave={loadData}
          item={editingItem}
          userId={user.id}
        />
      )}
    </div>
  );
};

// ── View Helper Components ──

const GridView = ({ type, data, onAdd, onEdit, onDelete }) => {
  const empty = EMPTY_MESSAGES[type];
  const singular = SINGULAR[type];
  const capitalizedSingular = singular.charAt(0).toUpperCase() + singular.slice(1);

  return (
    <div className={styles.viewHeaderWrapper}>
      <div className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>{TABS.find((t) => t.id === type)?.label} Collection</h2>
        <button className={styles.fabAdd} onClick={onAdd}>
          <span>+</span> Add {capitalizedSingular}
        </button>
      </div>

      {data.length === 0 ? (
        <div className={styles.emptyView}>
          <span className={styles.emptyIcon}>{empty.icon}</span>
          <h4>{empty.title}</h4>
          <p>{empty.text}</p>
          <button className={styles.fabAdd} style={{ margin: '20px auto' }} onClick={onAdd}>
            Record Your First {capitalizedSingular}
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {data.map((item) => (
            <EnhancedCard
              key={item.id}
              type={type}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CARD_RENDERERS = {
  milestones: MilestoneCard,
  mentors: MentorCard,
  verses: VerseCard,
  prayers: PrayerCard,
};

const EnhancedCard = ({ type, item, onEdit, onDelete }) => {
  const Renderer = CARD_RENDERERS[type];
  if (!Renderer) return null;

  return (
    <article className={styles.card}>
      <Renderer item={item} />
      <div className={styles.cardFooter}>
        <button className={styles.btnEdit} onClick={() => onEdit(item)}>
          ✏️ Edit
        </button>
        <button className={styles.btnDelete} onClick={() => onDelete(item.id)}>
          🗑️ Delete
        </button>
      </div>
    </article>
  );
};

// ── Status Screens ──

const LoadingView = () => (
  <div className={styles.emptyView} style={{ border: 'none' }}>
    <div
      style={{
        width: 40,
        height: 40,
        border: '3px solid var(--blue)',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px',
      }}
    />
    <p>Journeying back through your memories...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const FullLoading = () => (
  <div
    className={styles.container}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <LoadingView />
  </div>
);

const AuthPrompt = () => (
  <div className={styles.container}>
    <section className={styles.hero}>
      <h1>Faith Milestones</h1>
      <p>Please sign in to access your sacred journal.</p>
    </section>
    <div className={styles.mainWrapper}>
      <div className={styles.emptyView}>
        <span className={styles.emptyIcon}>🔒</span>
        <h4>Access Restricted</h4>
        <p>You must be signed in to view and record your spiritual journey.</p>
      </div>
    </div>
  </div>
);

export default FaithMilestones;
