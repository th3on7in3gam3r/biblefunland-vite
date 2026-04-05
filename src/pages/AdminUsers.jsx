import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { query } from '../lib/db'

const API = import.meta.env.VITE_API_URL || ''

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  function loadUsers() {
    query('SELECT * FROM profiles ORDER BY created_at DESC', [])
      .then(r => { setUsers(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  async function deleteUser(userId, displayName) {
    if (!confirm(`Delete "${displayName || userId}"?\n\nThis removes all their data from the database. Their Clerk login account will remain — delete that separately from the Clerk dashboard if needed.`)) return
    setDeleting(userId)
    try {
      const res = await fetch(`${API}/api/profiles/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setUsers(prev => prev.filter(u => u.user_id !== userId && u.id !== userId))
    } catch (err) {
      alert('Delete failed: ' + err.message)
    } finally {
      setDeleting(null)
    }
  }

  const roles = ['All', ...new Set(users.map(u => u.role || 'member').filter(Boolean))]

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.user_id?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'All' || (u.role || 'member') === roleFilter
    return matchSearch && matchRole
  })

  function copyEmail(email) {
    navigator.clipboard.writeText(email)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', padding: '48px 32px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link to="/admin" style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.4)', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>← Admin</Link>
          <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, color: 'white', marginBottom: 6 }}>
            👥 All Users
          </h1>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem' }}>
            {users.length} registered users from the profiles table
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or ID..."
            style={{ flex: 1, minWidth: 220, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: '.85rem' }}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: '.85rem', cursor: 'pointer' }}
          >
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderRadius: 10, background: 'var(--blue-bg)', color: 'var(--blue)', fontSize: '.82rem', fontWeight: 700 }}>
            {filtered.length} shown
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1.5px solid var(--border)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink3)' }}>Loading users...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink3)' }}>
              {users.length === 0 ? '⚠️ No users found — is the backend running?' : 'No results for that search'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.user_id || i}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      {/* User */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                            {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }} /> : '👤'}
                          </div>
                          <div>
                            <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)' }}>{u.display_name || 'No name'}</div>
                            <div style={{ fontSize: '.68rem', color: 'var(--ink3)', fontFamily: 'monospace' }}>{u.user_id?.slice(0, 16)}...</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '.82rem', color: 'var(--ink2)' }}>
                        {u.email || <span style={{ color: 'var(--ink3)', fontStyle: 'italic' }}>—</span>}
                      </td>

                      {/* Role */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{
                          fontSize: '.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                          background: u.role === 'admin' ? 'var(--red-bg)' : u.role === 'parent' ? 'var(--green-bg)' : u.role === 'teacher' ? 'var(--blue-bg)' : 'var(--bg3)',
                          color: u.role === 'admin' ? 'var(--red)' : u.role === 'parent' ? 'var(--green)' : u.role === 'teacher' ? 'var(--blue)' : 'var(--ink3)',
                        }}>
                          {u.role || 'member'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '.78rem', color: 'var(--ink3)', whiteSpace: 'nowrap' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {u.email && (
                            <button onClick={() => copyEmail(u.email)}
                              style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink3)', fontSize: '.7rem', fontWeight: 700, cursor: 'pointer' }}
                              title="Copy email">
                              📋
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(u.user_id || u.id, u.display_name)}
                            disabled={deleting === (u.user_id || u.id)}
                            style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--red)', background: 'var(--red-bg)', color: 'var(--red)', fontSize: '.7rem', fontWeight: 700, cursor: 'pointer', opacity: deleting === (u.user_id || u.id) ? .5 : 1 }}
                            title="Delete user from Turso"
                          >
                            {deleting === (u.user_id || u.id) ? '...' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
