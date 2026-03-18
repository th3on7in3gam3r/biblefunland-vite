import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../context/StreakContext'
import { Link } from 'react-router-dom'

function makeCode() { return Math.random().toString(36).substring(2,8).toUpperCase() }

function getGroups() { try { return JSON.parse(localStorage.getItem('bfl_groups') || '[]') } catch { return [] } }
function saveGroups(g) { localStorage.setItem('bfl_groups', JSON.stringify(g)) }

const DEMO_MEMBERS = [
  { name: 'Dad', emoji: '👨', streak: 14, badges: 5, role: 'Admin' },
  { name: 'Mom', emoji: '👩', streak: 21, badges: 7, role: 'Member' },
  { name: 'Sarah', emoji: '👧', streak: 8, badges: 3, role: 'Member' },
  { name: 'Jake', emoji: '👦', streak: 3, badges: 1, role: 'Member' },
]

export default function FamilyGroups() {
  const { user } = useAuth()
  const { streak } = useStreak()
  const [groups, setGroups] = useState(getGroups)
  const [view, setView] = useState('list') // list | create | join | group
  const [activeGroup, setActiveGroup] = useState(null)
  const [groupName, setGroupName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [msg, setMsg] = useState('')

  function createGroup() {
    if (!groupName.trim()) return
    const g = { id: Date.now(), name: groupName.trim(), code: makeCode(), createdBy: user?.email || 'You', members: [{ name: user?.email?.split('@')[0] || 'You', emoji: '👑', streak, badges: 0, role: 'Admin' }], prayers: [], createdAt: new Date().toISOString() }
    const updated = [...groups, g]
    setGroups(updated); saveGroups(updated)
    setActiveGroup(g); setView('group'); setGroupName('')
  }

  function joinGroup() {
    const demo = { id: Date.now(), name: 'The Johnson Family', code: joinCode.trim().toUpperCase(), createdBy: 'FamilyAdmin', members: DEMO_MEMBERS, prayers: ['Pray for our family vacation!', 'Thanksgiving for Sarah\'s healing'], createdAt: new Date().toISOString() }
    const updated = [...groups, demo]
    setGroups(updated); saveGroups(updated)
    setActiveGroup(demo); setView('group'); setMsg('Joined successfully! 🎉')
    setTimeout(() => setMsg(''), 3000)
  }

  const g = activeGroup

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', padding: '56px 36px 36px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, background: 'linear-gradient(90deg,#34D399,#60A5FA,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>Family Groups</h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500 }}>Create a group, share streaks, pray together, compete on the family leaderboard.</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 20px' }}>
        {!user && <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow)', borderRadius: 14, padding: '12px 18px', fontSize: '.84rem', fontWeight: 500, marginBottom: 20 }}>💡 <Link to="/auth" style={{ color: 'var(--blue)', fontWeight: 700 }}>Sign in</Link> to create or join a group that syncs across devices.</div>}
        {msg && <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green)', borderRadius: 12, padding: '10px 16px', fontSize: '.83rem', fontWeight: 700, color: 'var(--green)', marginBottom: 16 }}>{msg}</div>}

        {view === 'list' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              <button className="btn btn-blue" onClick={() => setView('create')} style={{ flex: 1, justifyContent: 'center' }}>➕ Create Family Group</button>
              <button className="btn btn-outline" onClick={() => setView('join')} style={{ flex: 1, justifyContent: 'center' }}>🔗 Join with Code</button>
            </div>
            {groups.length === 0 ? (
              <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', padding: '52px 32px', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
                <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>No Groups Yet</h2>
                <p style={{ fontSize: '.87rem', color: 'var(--ink3)', fontWeight: 500 }}>Create a family group and invite members with a simple code!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {groups.map((grp, i) => (
                  <div key={i} onClick={() => { setActiveGroup(grp); setView('group') }} style={{ background: 'var(--surface)', borderRadius: 18, border: '1.5px solid var(--border)', padding: '20px 22px', cursor: 'pointer', transition: 'all .25s', display: 'flex', alignItems: 'center', gap: 14 }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}>
                    <div style={{ fontSize: '2.5rem', width: 52, height: 52, background: 'var(--blue-bg)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>👨‍👩‍👧</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>{grp.name}</div>
                      <div style={{ fontSize: '.73rem', color: 'var(--ink3)', fontWeight: 500 }}>{grp.members.length} members · Code: <strong>{grp.code}</strong></div>
                    </div>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--blue)' }}>Open →</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'create' && (
          <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', padding: 32 }}>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 20 }}>➕ Create a Family Group</h2>
            <label style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Group Name</label>
            <input className="input-field" placeholder='e.g. "The Smith Family" or "Sunday School Squad"' value={groupName} onChange={e => setGroupName(e.target.value)} style={{ marginBottom: 18 }} onKeyDown={e => e.key === 'Enter' && createGroup()} />
            <div style={{ background: 'var(--blue-bg)', borderRadius: 12, padding: '12px 16px', fontSize: '.8rem', color: 'var(--ink2)', fontWeight: 500, marginBottom: 20 }}>
              💡 After creating, you'll get a <strong>6-character invite code</strong> to share with family members.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-blue" onClick={createGroup} disabled={!groupName.trim()}>Create Group →</button>
              <button className="btn btn-outline" onClick={() => setView('list')}>Cancel</button>
            </div>
          </div>
        )}

        {view === 'join' && (
          <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', padding: 32 }}>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 20 }}>🔗 Join a Group</h2>
            <label style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Enter Invite Code</label>
            <input className="input-field" placeholder="e.g. ABC123" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} style={{ marginBottom: 18, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 3 }} maxLength={6} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-green" onClick={joinGroup} disabled={joinCode.length < 4}>Join Group →</button>
              <button className="btn btn-outline" onClick={() => setView('list')}>Cancel</button>
            </div>
          </div>
        )}

        {view === 'group' && g && (
          <div>
            <button className="btn btn-outline btn-sm" onClick={() => setView('list')} style={{ marginBottom: 20 }}>← Back to Groups</button>
            <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', padding: 28, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ fontSize: '3rem', width: 64, height: 64, background: 'var(--blue-bg)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👨‍👩‍👧</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>{g.name}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--ink3)', fontWeight: 500 }}>Invite Code: <strong style={{ color: 'var(--blue)', letterSpacing: 2 }}>{g.code}</strong> · Share with family!</div>
                </div>
              </div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 14 }}>🏆 Family Leaderboard</div>
              {g.members.sort((a,b) => b.streak - a.streak).map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 13, background: i === 0 ? 'var(--yellow-bg)' : 'var(--bg2)', border: `1.5px solid ${i === 0 ? 'rgba(245,158,11,.3)' : 'var(--border)'}`, marginBottom: 8 }}>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', fontWeight: 800, color: ['#FFD700','#C0C0C0','#CD7F32','var(--ink3)'][i] || 'var(--ink3)', width: 28, textAlign: 'center' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
                  <div style={{ fontSize: '1.5rem' }}>{m.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--ink)' }}>{m.name} {m.role === 'Admin' ? '👑' : ''}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}>{m.badges} badges</div>
                  </div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--orange)' }}>🔥 {m.streak}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
