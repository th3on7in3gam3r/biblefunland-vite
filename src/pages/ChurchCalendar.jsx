import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DEMO_EVENTS = [
  {
    id: 1,
    title: 'Sunday Worship Service',
    church: 'Grace Community Church',
    date: '2026-03-17',
    time: '10:00 AM',
    type: 'Worship',
    emoji: '⛪',
    city: 'Nashville, TN',
    desc: 'Come as you are! Weekly worship service open to all.',
    color: 'var(--blue)',
    bg: 'var(--blue-bg)',
  },
  {
    id: 2,
    title: 'Youth Night — David & Giants',
    church: 'Anointed Worship Center',
    date: '2026-03-18',
    time: '7:00 PM',
    type: 'Youth',
    emoji: '⚡',
    city: 'Boston, MA',
    desc: 'Bible study and fellowship for teens. Topic: Facing your Goliaths.',
    color: 'var(--orange)',
    bg: 'var(--orange-bg)',
  },
  {
    id: 3,
    title: 'VBS Planning Meeting',
    church: 'Cornerstone Baptist',
    date: '2026-03-20',
    time: '6:30 PM',
    type: 'Ministry',
    emoji: '🎨',
    city: 'Atlanta, GA',
    desc: 'Planning session for Vacation Bible School 2026.',
    color: 'var(--pink)',
    bg: 'var(--pink-bg)',
  },
  {
    id: 4,
    title: 'Bible Study — Book of Revelation',
    church: 'New Hope Fellowship',
    date: '2026-03-22',
    time: '9:00 AM',
    type: 'Study',
    emoji: '📖',
    city: 'Dallas, TX',
    desc: 'Deep dive into Revelation — all levels welcome!',
    color: 'var(--violet)',
    bg: 'var(--violet-bg)',
  },
  {
    id: 5,
    title: 'Prayer & Worship Night',
    church: 'Living Waters Church',
    date: '2026-03-25',
    time: '7:30 PM',
    type: 'Prayer',
    emoji: '🙏',
    city: 'Chicago, IL',
    desc: 'An evening dedicated entirely to prayer and worship.',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
  },
  {
    id: 6,
    title: 'Easter Sunday Service',
    church: 'City Church',
    date: '2026-04-05',
    time: '8:00 AM & 10:30 AM',
    type: 'Worship',
    emoji: '✝️',
    city: 'Los Angeles, CA',
    desc: 'Celebrate the resurrection! Two services available.',
    color: 'var(--teal)',
    bg: 'var(--teal-bg)',
  },
];

const TYPES = ['All', 'Worship', 'Youth', 'Study', 'Prayer', 'Ministry'];

function getEvents() {
  try {
    const saved = JSON.parse(localStorage.getItem('bfl_events') || '[]');
    return [...DEMO_EVENTS, ...saved];
  } catch {
    return DEMO_EVENTS;
  }
}
function saveEvent(e) {
  try {
    const saved = JSON.parse(localStorage.getItem('bfl_events') || '[]');
    localStorage.setItem('bfl_events', JSON.stringify([e, ...saved]));
  } catch {}
}

export default function ChurchCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState(getEvents);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    church: '',
    date: '',
    time: '',
    type: 'Worship',
    city: '',
    desc: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const visible = filter === 'All' ? events : events.filter((e) => e.type === filter);
  const typeColors = {
    Worship: 'var(--blue)',
    Youth: 'var(--orange)',
    Study: 'var(--violet)',
    Prayer: 'var(--green)',
    Ministry: 'var(--pink)',
  };
  const typeBgs = {
    Worship: 'var(--blue-bg)',
    Youth: 'var(--orange-bg)',
    Study: 'var(--violet-bg)',
    Prayer: 'var(--green-bg)',
    Ministry: 'var(--pink-bg)',
  };

  function submit() {
    if (!form.title || !form.date) return;
    const e = {
      ...form,
      id: Date.now(),
      emoji: '⛪',
      color: typeColors[form.type] || 'var(--blue)',
      bg: typeBgs[form.type] || 'var(--blue-bg)',
    };
    saveEvent(e);
    setEvents(getEvents);
    setForm({ title: '', church: '', date: '', time: '', type: 'Worship', city: '', desc: '' });
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#065F46,#047857)',
          padding: '56px 36px 36px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            color: 'white',
            letterSpacing: -1,
            marginBottom: 8,
          }}
        >
          📅 Church Event Calendar
        </h1>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem', fontWeight: 500 }}>
          Find and post local church events — services, Bible studies, youth nights, and more.
        </p>
      </div>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '36px 20px' }}>
        {submitted && (
          <div
            style={{
              background: 'var(--green-bg)',
              border: '1.5px solid var(--green)',
              borderRadius: 12,
              padding: '10px 16px',
              fontSize: '.83rem',
              fontWeight: 700,
              color: 'var(--green)',
              marginBottom: 16,
            }}
          >
            ✅ Event posted successfully!
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  fontSize: '.76rem',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 100,
                  cursor: 'pointer',
                  border: `1.5px solid ${filter === t ? 'var(--green)' : 'var(--border)'}`,
                  background: filter === t ? 'var(--green)' : 'var(--surface)',
                  color: filter === t ? 'white' : 'var(--ink2)',
                  transition: 'all .2s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="btn btn-green" onClick={() => setShowForm((f) => !f)}>
            ➕ Post an Event
          </button>
        </div>

        {showForm && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1.5px solid var(--border)',
              padding: 28,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 18,
              }}
            >
              Post a Church Event
            </div>
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}
            >
              {[
                ['title', 'Event Title *', ''],
                ['church', 'Church / Organization', ''],
                ['date', 'Date *', 'date'],
                ['time', 'Time', ''],
                ['city', 'City, State', ''],
              ].map(([k, ph, type]) => (
                <input
                  key={k}
                  className="input-field"
                  type={type || 'text'}
                  placeholder={ph}
                  value={form[k]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                />
              ))}
              <select
                className="input-field"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {['Worship', 'Youth', 'Study', 'Prayer', 'Ministry'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <textarea
              className="textarea-field"
              placeholder="Event description..."
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              style={{ marginBottom: 14, height: 70 }}
            />
            <div style={{ display: 'flex', gap: 11 }}>
              <button
                className="btn btn-green"
                onClick={submit}
                disabled={!form.title || !form.date}
              >
                Post Event →
              </button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
          {visible.map((e, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: `1.5px solid ${e.color}33`,
                boxShadow: '0 2px 12px rgba(0,0,0,.04)',
                padding: '20px 22px',
                transition: 'all .28s',
              }}
              onMouseEnter={(el) => {
                el.currentTarget.style.transform = 'translateY(-3px)';
                el.currentTarget.style.boxShadow = `0 12px 36px ${e.color}22`;
              }}
              onMouseLeave={(el) => {
                el.currentTarget.style.transform = '';
                el.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.04)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: e.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                  }}
                >
                  {e.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      marginBottom: 2,
                    }}
                  >
                    {e.title}
                  </div>
                  <div style={{ fontSize: '.75rem', color: e.color, fontWeight: 700 }}>
                    {e.church}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '.63rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 100,
                    background: e.bg,
                    color: e.color,
                    flexShrink: 0,
                  }}
                >
                  {e.type}
                </div>
              </div>
              {e.desc && (
                <div
                  style={{
                    fontSize: '.8rem',
                    color: 'var(--ink2)',
                    lineHeight: 1.65,
                    fontWeight: 500,
                    marginBottom: 12,
                  }}
                >
                  {e.desc}
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: '.75rem',
                  color: 'var(--ink3)',
                  fontWeight: 600,
                }}
              >
                <span>
                  📅{' '}
                  {new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {e.time && <span>⏰ {e.time}</span>}
                {e.city && <span>📍 {e.city}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
