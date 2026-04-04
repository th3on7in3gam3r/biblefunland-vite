import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStreak } from '../context/StreakContext';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

const FAMILY_ROLES = [
  { id: 'Father',      emoji: '👨', label: 'Father' },
  { id: 'Mother',      emoji: '👩', label: 'Mother' },
  { id: 'Son',         emoji: '👦', label: 'Son' },
  { id: 'Daughter',    emoji: '👧', label: 'Daughter' },
  { id: 'Grandfather', emoji: '👴', label: 'Grandfather' },
  { id: 'Grandmother', emoji: '👵', label: 'Grandmother' },
  { id: 'Uncle',       emoji: '👨', label: 'Uncle' },
  { id: 'Aunt',        emoji: '👩', label: 'Aunt' },
  { id: 'Guardian',    emoji: '🧑', label: 'Guardian' },
];

export default function FamilyGroups() {
  const { user } = useAuth();
  const { streak } = useStreak();

  const [view, setView]               = useState('list');   // list | create | join | role | preview | group
  const [groups, setGroups]           = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [msg, setMsg]                 = useState({ text: '', type: '' });

  // Create form
  const [groupName, setGroupName]     = useState('');
  const [createRole, setCreateRole]   = useState('');

  // Join form
  const [joinCode, setJoinCode]       = useState('');
  const [joinPreview, setJoinPreview] = useState(null);  // the group found by code
  const [joinRole, setJoinRole]       = useState('');    // role chosen

  // ── Load user's groups ───────────────────────────────────────────────────────
  const loadGroups = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API}/api/family-groups/user/${user.id}`);
      const data = await res.json();
      if (data.groups) setGroups(data.groups);
    } catch {
      // ignore — show empty state
    }
  }, [user?.id]);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  function flash(text, type = 'success') {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  }

  // ── Create a new group ───────────────────────────────────────────────────────
  async function createGroup() {
    if (!groupName.trim() || !createRole) return;
    setLoading(true);
    try {
      const displayName = user?.firstName || user?.email?.split('@')[0] || 'Creator';
      const res = await fetch(`${API}/api/family-groups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          userId: user?.id,
          displayName,
          familyRole: createRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create group');

      flash(`✅ Family group created! Share code: ${data.group.code}`);
      setGroupName('');
      setCreateRole('');
      await loadGroups();
      // Find the newly created group and open it
      const refresh = await fetch(`${API}/api/family-groups/user/${user.id}`);
      const refreshData = await refresh.json();
      const found = (refreshData.groups || []).find((g) => g.code === data.group.code);
      if (found) { setActiveGroup(found); setView('group'); }
      else setView('list');
    } catch (err) {
      flash(`❌ ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1: look up group by code ────────────────────────────────────────────
  async function lookupCode() {
    if (joinCode.length < 4) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/family-groups/code/${joinCode}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Group not found');
      setJoinPreview(data.group);
      setView('role');  // go to role selection
    } catch (err) {
      flash(`❌ ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: join with chosen role ────────────────────────────────────────────
  async function joinGroup() {
    if (!joinRole || !joinPreview) return;
    setLoading(true);
    try {
      const displayName = user?.firstName || user?.email?.split('@')[0] || 'Family Member';
      const res = await fetch(`${API}/api/family-groups/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: joinPreview.code,
          userId: user?.id || null,
          displayName,
          familyRole: joinRole,
          streak: streak || 0,
          badges: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join group');

      flash(`🎉 You joined "${joinPreview.name}" as ${joinRole}!`);
      setJoinCode('');
      setJoinRole('');
      setJoinPreview(null);
      setActiveGroup(data.group);
      setView('group');
      loadGroups();
    } catch (err) {
      flash(`❌ ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  const g = activeGroup;

  // ── Shared card style ─────────────────────────────────────────────────────────
  const card = {
    background: 'var(--surface)',
    borderRadius: 24,
    border: '1.5px solid var(--border)',
    padding: 32,
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', padding: '56px 36px 36px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800,
          background: 'linear-gradient(90deg,#34D399,#60A5FA,#C084FC)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8,
        }}>
          Family Groups
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500 }}>
          Create a group, share streaks, pray together, compete on the family leaderboard.
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 20px' }}>
        {/* Auth nudge */}
        {!user && (
          <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow)', borderRadius: 14, padding: '12px 18px', fontSize: '.84rem', fontWeight: 500, marginBottom: 20 }}>
            💡 <Link to="/auth" style={{ color: 'var(--blue)', fontWeight: 700 }}>Sign in</Link> to create or join a group that syncs across devices.
          </div>
        )}

        {/* Flash message */}
        {msg.text && (
          <div style={{
            background: msg.type === 'error' ? 'var(--red-bg, #FEF2F2)' : 'var(--green-bg)',
            border: `1.5px solid ${msg.type === 'error' ? '#EF4444' : 'var(--green)'}`,
            borderRadius: 12, padding: '10px 16px', fontSize: '.83rem', fontWeight: 700,
            color: msg.type === 'error' ? '#EF4444' : 'var(--green)', marginBottom: 16,
          }}>
            {msg.text}
          </div>
        )}

        {/* ── LIST VIEW ──────────────────────────────────────────────────────── */}
        {view === 'list' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              <button className="btn btn-blue" onClick={() => setView('create')} style={{ flex: 1, justifyContent: 'center' }}>
                ➕ Create Family Group
              </button>
              <button className="btn btn-outline" onClick={() => setView('join')} style={{ flex: 1, justifyContent: 'center' }}>
                🔗 Join with Code
              </button>
            </div>

            {groups.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '52px 32px' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
                <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
                  No Groups Yet
                </h2>
                <p style={{ fontSize: '.87rem', color: 'var(--ink3)', fontWeight: 500 }}>
                  Create a family group and invite members with a simple code!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {groups.map((grp, i) => (
                  <div
                    key={grp.id || i}
                    onClick={() => { setActiveGroup(grp); setView('group'); }}
                    style={{ background: 'var(--surface)', borderRadius: 18, border: '1.5px solid var(--border)', padding: '20px 22px', cursor: 'pointer', transition: 'all .25s', display: 'flex', alignItems: 'center', gap: 14 }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                  >
                    <div style={{ fontSize: '2.5rem', width: 52, height: 52, background: 'var(--blue-bg)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      👨‍👩‍👧
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>{grp.name}</div>
                      <div style={{ fontSize: '.73rem', color: 'var(--ink3)', fontWeight: 500 }}>
                        {grp.members?.length || 0} members · Code: <strong style={{ color: 'var(--blue)', letterSpacing: 2 }}>{grp.code}</strong>
                      </div>
                    </div>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--blue)' }}>Open →</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE VIEW ────────────────────────────────────────────────────── */}
        {view === 'create' && (
          <div style={card}>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 20 }}>
              ➕ Create a Family Group
            </h2>

            <label style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
              Group Name
            </label>
            <input
              className="input-field"
              placeholder='e.g. "The Smith Family" or "Sunday School Squad"'
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{ marginBottom: 20 }}
              onKeyDown={(e) => e.key === 'Enter' && createGroup()}
            />

            <label style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              Your Role in the Family
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
              {FAMILY_ROLES.map(({ id, emoji, label }) => (
                <button
                  key={id}
                  onClick={() => setCreateRole(id)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 14,
                    border: `2px solid ${createRole === id ? 'var(--blue)' : 'var(--border)'}`,
                    background: createRole === id ? 'var(--blue-bg)' : 'var(--bg)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '.82rem',
                    color: createRole === id ? 'var(--blue)' : 'var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all .15s',
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{emoji}</span> {label}
                </button>
              ))}
            </div>

            <div style={{ background: 'var(--blue-bg)', borderRadius: 12, padding: '12px 16px', fontSize: '.8rem', color: 'var(--ink2)', fontWeight: 500, marginBottom: 20 }}>
              💡 After creating, you'll get a <strong>6-character invite code</strong> to share with family members.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-blue" onClick={createGroup} disabled={!groupName.trim() || !createRole || loading}>
                {loading ? 'Creating…' : 'Create Group →'}
              </button>
              <button className="btn btn-outline" onClick={() => { setView('list'); setGroupName(''); setCreateRole(''); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── JOIN — ENTER CODE ───────────────────────────────────────────────── */}
        {view === 'join' && (
          <div style={card}>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              🔗 Join a Family Group
            </h2>
            <p style={{ color: 'var(--ink3)', fontSize: '.85rem', marginBottom: 20 }}>
              Enter the invite code shared by the group creator.
            </p>

            <label style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
              Enter Invite Code
            </label>
            <input
              className="input-field"
              placeholder="e.g. ABC123"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              style={{ marginBottom: 20, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 3, fontSize: '1.2rem', textAlign: 'center' }}
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && lookupCode()}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-green" onClick={lookupCode} disabled={joinCode.length < 4 || loading}>
                {loading ? 'Looking up…' : 'Find Group →'}
              </button>
              <button className="btn btn-outline" onClick={() => { setView('list'); setJoinCode(''); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── JOIN — ROLE SELECTION (Step 2) ──────────────────────────────────── */}
        {view === 'role' && joinPreview && (
          <div style={card}>
            {/* Group preview */}
            <div style={{ background: 'var(--blue-bg)', borderRadius: 14, padding: '16px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: '2.5rem' }}>👨‍👩‍👧</div>
              <div>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink)' }}>
                  {joinPreview.name}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--ink3)' }}>
                  {joinPreview.members?.length || 0} member{joinPreview.members?.length !== 1 ? 's' : ''} · Code: <strong style={{ letterSpacing: 2 }}>{joinPreview.code}</strong>
                </div>
              </div>
            </div>

            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
              What is your role in this family?
            </h2>
            <p style={{ color: 'var(--ink3)', fontSize: '.82rem', marginBottom: 18 }}>
              This helps your family see how you relate to each other on the leaderboard.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
              {FAMILY_ROLES.map(({ id, emoji, label }) => (
                <button
                  key={id}
                  onClick={() => setJoinRole(id)}
                  style={{
                    padding: '14px 10px',
                    borderRadius: 14,
                    border: `2px solid ${joinRole === id ? '#10B981' : 'var(--border)'}`,
                    background: joinRole === id ? '#ECFDF5' : 'var(--bg)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '.82rem',
                    color: joinRole === id ? '#10B981' : 'var(--ink)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all .15s',
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{emoji}</span>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-green" onClick={joinGroup} disabled={!joinRole || loading}>
                {loading ? 'Joining…' : `✅ Join as ${joinRole || '…'}`}
              </button>
              <button className="btn btn-outline" onClick={() => { setView('join'); setJoinRole(''); }}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* ── GROUP VIEW ─────────────────────────────────────────────────────── */}
        {view === 'group' && g && (
          <div>
            <button className="btn btn-outline btn-sm" onClick={() => { setView('list'); loadGroups(); }} style={{ marginBottom: 20 }}>
              ← Back to Groups
            </button>

            <div style={{ ...card, marginBottom: 20 }}>
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ fontSize: '3rem', width: 64, height: 64, background: 'var(--blue-bg)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  👨‍👩‍👧
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>
                    {g.name}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--ink3)', fontWeight: 500, marginTop: 4 }}>
                    Invite Code: <strong style={{ color: 'var(--blue)', letterSpacing: 2, fontSize: '.9rem' }}>{g.code}</strong>
                    <button
                      onClick={() => { navigator.clipboard.writeText(g.code); flash('📋 Code copied!'); }}
                      style={{ marginLeft: 10, padding: '2px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '.7rem', fontWeight: 700, cursor: 'pointer', color: 'var(--ink3)' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 14 }}>
                🏆 Family Leaderboard
              </div>
              {(!g.members || g.members.length === 0) ? (
                <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>No members yet. Share the code above!</p>
              ) : (
                [...g.members]
                  .sort((a, b) => (b.streak || 0) - (a.streak || 0))
                  .map((m, i) => (
                    <div
                      key={m.id || i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 13,
                        background: i === 0 ? 'var(--yellow-bg)' : 'var(--bg2)',
                        border: `1.5px solid ${i === 0 ? 'rgba(245,158,11,.3)' : 'var(--border)'}`,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', fontWeight: 800, color: ['#FFD700', '#C0C0C0', '#CD7F32'][i] || 'var(--ink3)', width: 28, textAlign: 'center' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </div>
                      <div style={{ fontSize: '1.5rem' }}>{m.emoji || '👤'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--ink)' }}>
                          {m.display_name} {m.role === 'Admin' ? '👑' : ''}
                        </div>
                        <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}>
                          {m.family_role && <span style={{ marginRight: 8 }}>🏠 {m.family_role}</span>}
                          {m.badges || 0} badges
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--orange)' }}>
                        🔥 {m.streak || 0}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
