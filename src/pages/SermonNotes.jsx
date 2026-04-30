import { useState, useEffect } from 'react';
function getNotes() {
  try {
    return JSON.parse(localStorage.getItem('bfl_notes') || '[]');
  } catch {
    return [];
  }
}
function saveNotes(n) {
  localStorage.setItem('bfl_notes', JSON.stringify(n));
}
export default function SermonNotes() {
  const [notes, setNotes] = useState(getNotes);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({
    title: '',
    speaker: '',
    date: '',
    scripture: '',
    content: '',
  });
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    if (notes.length && !current) {
      load(notes[0].id);
    }
  }, []);
  function load(id) {
    const n = notes.find((x) => x.id === id);
    if (n) {
      setCurrent(id);
      setForm({
        title: n.title || '',
        speaker: n.speaker || '',
        date: n.date || '',
        scripture: n.scripture || '',
        content: n.content || '',
      });
      setSaved(true);
    }
  }
  function newNote() {
    const id = 'n' + Date.now();
    const n = {
      id,
      title: 'New Note',
      speaker: '',
      date: new Date().toISOString().split('T')[0],
      scripture: '',
      content: '',
    };
    const updated = [n, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setCurrent(id);
    setForm({ title: 'New Note', speaker: '', date: n.date, scripture: '', content: '' });
    setSaved(true);
  }
  function save() {
    if (!current) return;
    const updated = notes.map((n) => (n.id === current ? { ...n, ...form } : n));
    setNotes(updated);
    saveNotes(updated);
    setSaved(true);
  }
  function del() {
    if (!current || !window.confirm('Delete this note?')) return;
    const updated = notes.filter((n) => n.id !== current);
    setNotes(updated);
    saveNotes(updated);
    if (updated.length) load(updated[0].id);
    else {
      setCurrent(null);
      setForm({ title: '', speaker: '', date: '', scripture: '', content: '' });
    }
  }
  function change(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#1C1917,#292524,#44403C)',
          padding: '60px 36px 44px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,4.5vw,3.4rem)',
            fontWeight: 800,
            letterSpacing: -1,
            background: 'linear-gradient(90deg,#FCD34D,#FB923C)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          Sermon Notes
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500 }}>
          Take notes tied to scripture. Saved automatically to your browser.
        </p>
      </div>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: 22,
            alignItems: 'start',
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1.5px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 18px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                }}
              >
                📝 My Notes
              </div>
              <button
                onClick={newNote}
                style={{
                  fontSize: '.72rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: 8,
                  background: 'var(--blue-bg)',
                  color: 'var(--blue)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                + New
              </button>
            </div>
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {notes.length === 0 && (
                <div
                  style={{
                    padding: 20,
                    textAlign: 'center',
                    fontSize: '.8rem',
                    color: 'var(--ink3)',
                  }}
                >
                  No notes yet. Click + New!
                </div>
              )}
              {notes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => load(n.id)}
                  style={{
                    padding: '13px 16px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: n.id === current ? 'var(--bg2)' : 'transparent',
                    transition: 'background .15s',
                  }}
                >
                  <div
                    style={{
                      fontSize: '.83rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      marginBottom: 3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {n.title || 'Untitled'}
                  </div>
                  <div style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 500 }}>
                    {n.date || 'No date'}
                    {n.scripture ? ` · ${n.scripture}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Editor */}
          {current ? (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 24,
                border: '1.5px solid var(--border)',
                boxShadow: '0 8px 32px rgba(0,0,0,.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 18px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                {['Bold', 'Italic', '• List'].map((t) => (
                  <button
                    key={t}
                    style={{
                      fontSize: '.75rem',
                      fontWeight: 700,
                      padding: '5px 11px',
                      borderRadius: 8,
                      border: '1.5px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--ink2)',
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '.72rem',
                      fontWeight: 600,
                      color: saved ? 'var(--green)' : 'var(--orange)',
                    }}
                  >
                    {saved ? '✓ Saved' : '● Unsaved'}
                  </span>
                  <button onClick={save} className="btn btn-green btn-sm">
                    💾 Save
                  </button>
                  <button
                    onClick={del}
                    className="btn btn-sm"
                    style={{
                      background: 'var(--red-bg)',
                      color: 'var(--red)',
                      border: '1.5px solid var(--red)',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <input
                  value={form.title}
                  onChange={(e) => change('title', e.target.value)}
                  placeholder="Sermon Title..."
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    marginBottom: 12,
                  }}
                />
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  {[
                    ['speaker', 'Speaker', '👤'],
                    ['date', 'Date', '📅', { type: 'date' }],
                    ['scripture', 'Scripture Reference', '📖'],
                  ].map(([k, ph, icon, extra]) => (
                    <input
                      key={k}
                      {...extra}
                      value={form[k]}
                      onChange={(e) => change(k, e.target.value)}
                      placeholder={`${icon} ${ph}`}
                      className="input-field"
                      style={{ flex: 1, minWidth: 140, fontSize: '.8rem' }}
                    />
                  ))}
                </div>
                <textarea
                  value={form.content}
                  onChange={(e) => change('content', e.target.value)}
                  placeholder="Start typing your notes here...&#10;&#10;Use formatting tools above, or just write freely.&#10;Your notes auto-save when you click 💾 Save."
                  className="textarea-field"
                  style={{ minHeight: 320, fontSize: '.88rem', lineHeight: 1.8 }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 24,
                border: '1.5px solid var(--border)',
                padding: 60,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📝</div>
              <h3
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 8,
                }}
              >
                No note selected
              </h3>
              <p
                style={{
                  fontSize: '.85rem',
                  color: 'var(--ink3)',
                  fontWeight: 500,
                  marginBottom: 24,
                }}
              >
                Click + New to create your first sermon note.
              </p>
              <button onClick={newNote} className="btn btn-blue">
                + Create First Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
