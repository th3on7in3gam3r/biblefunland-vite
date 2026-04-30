import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

const FOLDER_ICONS = {
  Favorites: '⭐',
  'Morning Prayer': '🌅',
  Memorizing: '🧠',
  'Sermon Prep': '📋',
};
const FOLDER_COLORS = {
  Favorites: '#F59E0B',
  'Morning Prayer': '#3B82F6',
  Memorizing: '#8B5CF6',
  'Sermon Prep': '#10B981',
};

function authHeaders(userId) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${userId}` };
}

// ─── Single bookmark card ─────────────────────────────────────────────────────
function BookmarkCard({ bm, onDelete, onEdit, folder }) {
  const color = FOLDER_COLORS[folder] || '#3B82F6';
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(bm.note || '');
  const [selectedFolder, setSelectedFolder] = useState(bm.folder || 'Favorites');

  async function saveEdit() {
    await onEdit(bm.id, note, selectedFolder);
    setEditing(false);
  }

  return (
    <div
      style={{
        borderRadius: 16,
        background: 'var(--surface)',
        border: `1.5px solid ${color}22`,
        padding: '18px 18px',
        marginBottom: 10,
        transition: 'all .2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color + '55';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = color + '22';
        e.currentTarget.style.transform = '';
      }}
    >
      {/* Verse ref + actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: '.72rem', fontWeight: 800, color, letterSpacing: '.03em' }}>
          {bm.verse_ref}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => setEditing((e) => !e)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '.8rem',
              color: 'var(--ink3)',
              padding: '2px 4px',
            }}
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(bm.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '.8rem',
              color: 'var(--ink3)',
              padding: '2px 4px',
            }}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Verse text */}
      <p
        style={{
          fontSize: '.88rem',
          color: 'var(--ink)',
          lineHeight: 1.7,
          fontStyle: 'italic',
          marginBottom: bm.note ? 10 : 0,
        }}
      >
        "{bm.verse_text}"
      </p>

      {/* Note */}
      {bm.note && !editing && (
        <div
          style={{
            fontSize: '.75rem',
            color: 'var(--ink3)',
            background: 'var(--bg2)',
            borderRadius: 8,
            padding: '7px 10px',
            borderLeft: `3px solid ${color}`,
            marginTop: 8,
          }}
        >
          📝 {bm.note}
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div style={{ marginTop: 10 }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a personal note..."
            rows={2}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1.5px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--ink)',
              fontSize: '.82rem',
              resize: 'vertical',
              boxSizing: 'border-box',
              marginBottom: 8,
            }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              style={{
                padding: '5px 8px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '.78rem',
                cursor: 'pointer',
              }}
            >
              {Object.keys(FOLDER_ICONS).map((f) => (
                <option key={f} value={f}>
                  {FOLDER_ICONS[f]} {f}
                </option>
              ))}
            </select>
            <button
              onClick={saveEdit}
              style={{
                padding: '5px 14px',
                borderRadius: 8,
                background: 'var(--blue)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '.78rem',
                fontWeight: 700,
              }}
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: '5px 10px',
                borderRadius: 8,
                background: 'none',
                color: 'var(--ink3)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: '.78rem',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Folder section ───────────────────────────────────────────────────────────
function FolderSection({ folder, bookmarks, onDelete, onEdit }) {
  const [open, setOpen] = useState(true);
  const icon = FOLDER_ICONS[folder] || '📁';
  const color = FOLDER_COLORS[folder] || '#3B82F6';

  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '10px 0',
          marginBottom: open ? 12 : 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: color + '18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            border: `1.5px solid ${color}30`,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--ink)',
            }}
          >
            {folder}
          </div>
          <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>
            {bookmarks.length} verse{bookmarks.length !== 1 ? 's' : ''}
          </div>
        </div>
        <span style={{ color: 'var(--ink3)', fontSize: '.8rem' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open &&
        bookmarks.map((bm) => (
          <BookmarkCard key={bm.id} bm={bm} folder={folder} onDelete={onDelete} onEdit={onEdit} />
        ))}
    </div>
  );
}

// ─── Add bookmark modal ───────────────────────────────────────────────────────
function AddModal({ onClose, onSave }) {
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [note, setNote] = useState('');
  const [folder, setFolder] = useState('Favorites');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!verseRef.trim() || !verseText.trim()) return;
    setSaving(true);
    await onSave({ verseRef: verseRef.trim(), verseText: verseText.trim(), note, folder });
    setSaving(false);
    onClose();
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.6)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 20,
          padding: '28px 24px',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,.3)',
        }}
      >
        <div
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--ink)',
            marginBottom: 20,
          }}
        >
          🔖 Add Bookmark
        </div>

        <label
          style={{
            fontSize: '.78rem',
            fontWeight: 700,
            color: 'var(--ink3)',
            display: 'block',
            marginBottom: 4,
          }}
        >
          Verse Reference *
        </label>
        <input
          value={verseRef}
          onChange={(e) => setVerseRef(e.target.value)}
          placeholder="e.g. John 3:16"
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontSize: '14px',
            marginBottom: 14,
            boxSizing: 'border-box',
          }}
        />

        <label
          style={{
            fontSize: '.78rem',
            fontWeight: 700,
            color: 'var(--ink3)',
            display: 'block',
            marginBottom: 4,
          }}
        >
          Verse Text *
        </label>
        <textarea
          value={verseText}
          onChange={(e) => setVerseText(e.target.value)}
          placeholder="For God so loved the world..."
          rows={3}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontSize: '14px',
            marginBottom: 14,
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />

        <label
          style={{
            fontSize: '.78rem',
            fontWeight: 700,
            color: 'var(--ink3)',
            display: 'block',
            marginBottom: 4,
          }}
        >
          Folder
        </label>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            fontSize: '14px',
            marginBottom: 14,
            cursor: 'pointer',
          }}
        >
          {Object.keys(FOLDER_ICONS).map((f) => (
            <option key={f} value={f}>
              {FOLDER_ICONS[f]} {f}
            </option>
          ))}
        </select>

        <label
          style={{
            fontSize: '.78rem',
            fontWeight: 700,
            color: 'var(--ink3)',
            display: 'block',
            marginBottom: 4,
          }}
        >
          Personal Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What does this verse mean to you?"
          rows={2}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontSize: '14px',
            marginBottom: 20,
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={saving || !verseRef || !verseText}
            style={{
              flex: 1,
              padding: '11px 0',
              borderRadius: 12,
              background: 'var(--blue)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '.9rem',
            }}
          >
            {saving ? 'Saving...' : '🔖 Save Bookmark'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '11px 18px',
              borderRadius: 12,
              background: 'none',
              color: 'var(--ink3)',
              border: '1.5px solid var(--border)',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Bookmarks() {
  const { user } = useAuth();
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFolder, setActiveFolder] = useState('All');

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/bookmarks`, { headers: authHeaders(user.id) });
      const json = await res.json();
      setGrouped(json.grouped || {});
    } catch (err) {
      console.error('Bookmarks load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(data) {
    await fetch(`${API}/bookmarks`, {
      method: 'POST',
      headers: authHeaders(user.id),
      body: JSON.stringify(data),
    });
    await load();
  }

  async function handleDelete(id) {
    await fetch(`${API}/bookmarks/${id}`, { method: 'DELETE', headers: authHeaders(user.id) });
    await load();
  }

  async function handleEdit(id, note, folder) {
    await fetch(`${API}/bookmarks/${id}`, {
      method: 'PUT',
      headers: authHeaders(user.id),
      body: JSON.stringify({ note, folder }),
    });
    await load();
  }

  async function handleShare() {
    setSharing(true);
    try {
      const res = await fetch(`${API}/bookmarks/share`, {
        method: 'POST',
        headers: authHeaders(user.id),
        body: JSON.stringify({ displayName: user?.fullName || 'Anonymous', isPublic: true }),
      });
      const json = await res.json();
      setShareToken(json.token);
    } finally {
      setSharing(false);
    }
  }

  function copyShareLink() {
    const url = `${window.location.origin}/bookmarks/shared/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const totalCount = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);
  const folders = Object.keys(grouped).filter((f) => grouped[f].length > 0);
  const visibleFolders =
    activeFolder === 'All' ? folders : folders.filter((f) => f === activeFolder);

  if (!user) {
    return (
      <div
        style={{
          background: 'var(--bg)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
        }}
      >
        <div style={{ fontSize: '3rem' }}>🔖</div>
        <h2
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--ink)',
          }}
        >
          Sign in to view your bookmarks
        </h2>
        <Link to="/auth" className="btn btn-blue">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
          padding: '52px 32px 40px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.8rem,4vw,3rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#FBBF24,#F59E0B,#F97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          🔖 My Bookmarks
        </h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem' }}>
          {totalCount} verse{totalCount !== 1 ? 's' : ''} saved across {folders.length} folder
          {folders.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 16px 80px' }}>
        {/* Actions bar */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 24,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setShowAdd(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: 12,
              background: 'var(--blue)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '.85rem',
            }}
          >
            + Add Bookmark
          </button>

          {/* Share button */}
          {!shareToken ? (
            <button
              onClick={handleShare}
              disabled={sharing || totalCount === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 12,
                background: 'var(--surface)',
                color: 'var(--ink)',
                border: '1.5px solid var(--border)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '.85rem',
              }}
            >
              {sharing ? '...' : '🔗 Share Collection'}
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 12,
                background: 'var(--green-bg)',
                border: '1.5px solid var(--green)',
                flex: 1,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: '.75rem',
                  color: 'var(--green)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                🔗 Share link:
              </span>
              <span
                style={{
                  fontSize: '.72rem',
                  color: 'var(--ink2)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {window.location.origin}/bookmarks/shared/{shareToken}
              </span>
              <button
                onClick={copyShareLink}
                style={{
                  background: 'var(--green)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '.72rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* Folder filter tabs */}
        {folders.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              marginBottom: 24,
              paddingBottom: 4,
            }}
          >
            {['All', ...folders].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFolder(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 99,
                  border: `1.5px solid ${activeFolder === f ? 'var(--blue)' : 'var(--border)'}`,
                  background: activeFolder === f ? 'var(--blue-bg)' : 'var(--surface)',
                  color: activeFolder === f ? 'var(--blue)' : 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all .2s',
                }}
              >
                {f === 'All'
                  ? `All (${totalCount})`
                  : `${FOLDER_ICONS[f] || '📁'} ${f} (${grouped[f]?.length || 0})`}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink3)' }}>
            Loading bookmarks...
          </div>
        )}

        {!loading && totalCount === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔖</div>
            <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No bookmarks yet</p>
            <p style={{ fontSize: '.82rem' }}>
              Add your first verse or bookmark from the Bible Explorer
            </p>
          </div>
        )}

        {!loading &&
          visibleFolders.map((folder) => (
            <FolderSection
              key={folder}
              folder={folder}
              bookmarks={grouped[folder] || []}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link
            to="/explore/bible"
            style={{
              color: 'var(--ink3)',
              fontSize: '.82rem',
              textDecoration: 'none',
              marginRight: 20,
            }}
          >
            📖 Bible Explorer
          </Link>
          <Link to="/" style={{ color: 'var(--ink3)', fontSize: '.82rem', textDecoration: 'none' }}>
            ← Home
          </Link>
        </div>
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSave={handleSave} />}
    </div>
  );
}
