import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/newsletter/subscribers`)
      .then((r) => r.json())
      .then((d) => {
        setSubscribers(d.subscribers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = subscribers.filter((s) => s.email?.toLowerCase().includes(search.toLowerCase()));

  function copyEmails() {
    navigator.clipboard.writeText(filtered.map((s) => s.email).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Header */}
      <div
        style={{ background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', padding: '48px 32px 36px' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link
            to="/admin"
            style={{
              fontSize: '.8rem',
              color: 'rgba(255,255,255,.4)',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            ← Admin
          </Link>
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1.8rem,4vw,2.6rem)',
              fontWeight: 800,
              color: 'white',
              marginBottom: 6,
            }}
          >
            📧 Newsletter Subscribers
          </h1>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem' }}>
            Manage email subscribers and export lists
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {[
            ['📧', 'Total Subscribers', subscribers.length, '#3B82F6'],
            ['✅', 'Active', subscribers.filter((s) => s.active !== false).length, '#10B981'],
            [
              '📅',
              'This Month',
              subscribers.filter((s) => {
                const d = new Date(s.created_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length,
              '#8B5CF6',
            ],
          ].map(([icon, label, val, color]) => (
            <div
              key={label}
              style={{
                background: 'var(--surface)',
                borderRadius: 16,
                padding: '18px 20px',
                border: '1.5px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: color,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: color + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}
                >
                  {icon}
                </div>
                <div
                  style={{
                    fontSize: '.7rem',
                    fontWeight: 700,
                    color: 'var(--ink3)',
                    textTransform: 'uppercase',
                    letterSpacing: '.5px',
                  }}
                >
                  {label}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>

        {/* Search + export */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emails..."
            style={{
              flex: 1,
              minWidth: 200,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '.85rem',
            }}
          />
          <button
            onClick={copyEmails}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              background: 'var(--blue)',
              color: 'white',
              fontWeight: 700,
              fontSize: '.82rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {copied ? '✅ Copied!' : '📋 Copy All Emails'}
          </button>
        </div>

        {/* Table */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 18,
            border: '1.5px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
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
              Subscriber List
            </div>
            <span
              style={{
                fontSize: '.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 99,
                background: 'var(--blue-bg)',
                color: 'var(--blue)',
              }}
            >
              {filtered.length} shown
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink3)' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink3)' }}>
              {subscribers.length === 0
                ? '⚠️ No subscribers yet — or backend not running'
                : 'No results for that search'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Email', 'Subscribed', 'Status'].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontSize: '.68rem',
                          fontWeight: 700,
                          color: 'var(--ink3)',
                          letterSpacing: '.5px',
                          textTransform: 'uppercase',
                          padding: '10px 16px',
                          textAlign: 'left',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr
                      key={i}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '.82rem',
                          color: 'var(--ink)',
                          fontWeight: 600,
                        }}
                      >
                        {s.email}
                      </td>
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '.78rem',
                          color: 'var(--ink3)',
                        }}
                      >
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
                        <span
                          style={{
                            fontSize: '.68rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 99,
                            background: s.active === false ? 'var(--red-bg)' : 'var(--green-bg)',
                            color: s.active === false ? 'var(--red)' : 'var(--green)',
                          }}
                        >
                          {s.active === false ? 'Unsubscribed' : 'Active'}
                        </span>
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
  );
}
