import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as db from '../lib/db';

export default function ChurchDashboard() {
  const { user, profile } = useAuth();
  const [church, setChurch] = useState(null);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('loading'); // 'loading' | 'setup' | 'dashboard' | 'error'
  const [setupName, setSetupName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.id) loadChurch();
    else if (!user) setView('loading'); // Waiting for auth
  }, [user]);

  async function loadChurch() {
    setView('loading');
    try {
      const { data: c, error } = await db.getChurchByPastor(user.id);

      if (error) {
        console.error('Church DB error:', error);
        // If it's a "no such table" error, we might still want to show setup but warn admin
        setView('setup');
        return;
      }

      if (c && c.id) {
        setChurch(c);
        const { data: m } = await db.getChurchMembers(c.id);
        setMembers(m || []);
        const s = await db.getChurchStats(c.id);
        setStats(s);
        setView('dashboard');
      } else {
        setView('setup');
      }
    } catch (err) {
      console.error('Catch Error loading church:', err);
      setView('setup'); // Default to setup if it's just "not found"
    }
  }

  async function handleCreateChurch() {
    if (!setupName.trim()) return;
    setCreating(true);
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await db.createChurch({
        pastor_id: user.id,
        name: setupName,
        invite_code: inviteCode,
      });
      await loadChurch();
    } catch (err) {
      alert('Failed to initialize church. Please check your connection.');
    } finally {
      setCreating(false);
    }
  }

  // ─── Render: Loading ─────────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexBasis: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          gap: 24,
        }}
      >
        <div style={{ fontSize: '4rem', animation: 'pulse 2s infinite' }}>⛪</div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, color: 'var(--ink)' }}>
            Connecting to Church Hub...
          </h2>
          <p style={{ color: 'var(--ink3)', fontWeight: 600 }}>
            Gathering your congregation's stats...
          </p>
        </div>
      </div>
    );
  }

  // ─── Render: Setup (The "Greetings") ─────────────────────────────────────────
  if (view === 'setup') {
    return (
      <div
        style={{
          background: 'var(--bg)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          style={{
            maxWidth: 540,
            width: '100%',
            background: 'var(--surface)',
            borderRadius: 40,
            border: '3px solid var(--border)',
            overflow: 'hidden',
            boxShadow: 'var(--sh-lg)',
            animation: 'slideUp 0.6s ease-out',
          }}
        >
          <div style={{ position: 'relative', height: 260 }}>
            <img
              src="/church-hub-hero.png"
              alt="Church Hub Hero"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(0deg, var(--surface), transparent)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                width: '100%',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  background: 'var(--blue)',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: 100,
                  fontSize: '.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Leader Initialization
              </span>
            </div>
          </div>
          <div style={{ padding: '0 40px 40px', textAlign: 'center', marginTop: -10 }}>
            <h1
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '2.8rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 8,
                lineHeight: 1.1,
              }}
            >
              Magical Church Setup
            </h1>
            <p
              style={{
                fontSize: '.95rem',
                color: 'var(--ink2)',
                marginBottom: 32,
                lineHeight: 1.6,
                maxWidth: 400,
                margin: '0 auto 28px',
              }}
            >
              Welcome, Leader! Initialize your congregational hub to track member progress,
              celebrate streaks, and foster community growth.
            </p>

            <div
              style={{
                background: 'var(--bg2)',
                padding: 28,
                borderRadius: 24,
                border: '2px solid var(--border)',
                marginBottom: 28,
                textAlign: 'left',
              }}
            >
              <label
                style={{
                  fontSize: '.75rem',
                  fontWeight: 800,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                Your Congregation Name
              </label>
              <input
                className="input-field"
                placeholder='e.g., "Grace Community Church"'
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                style={{
                  background: 'white',
                  border: '2px solid var(--blue)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  padding: '14px 20px',
                  borderRadius: 16,
                }}
              />
            </div>

            <button
              className="btn btn-blue btn-lg"
              onClick={handleCreateChurch}
              disabled={creating || !setupName.trim()}
              style={{
                width: '100%',
                padding: 22,
                fontSize: '1.2rem',
                borderRadius: 20,
                boxShadow: '0 8px 20px rgba(59,130,246,0.3)',
                opacity: creating || !setupName.trim() ? 0.6 : 1,
                cursor: creating || !setupName.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {creating ? '✨ Magical Initializing...' : '🚀 Launch My Church Hub'}
            </button>
            <p style={{ marginTop: 20, fontSize: '.75rem', color: 'var(--ink3)', fontWeight: 600 }}>
              You only need to do this once. Your families will join using your unique code!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Dashboard (The "Success") ──────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Premium Header Banner */}
      <div
        style={{
          position: 'relative',
          height: 460,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <img
          src="/church-hub-hero.png"
          alt="Church Hero"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(0deg, var(--bg) 0%, transparent 80%)',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 24px 60px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, marginBottom: 28 }}>
            <div
              style={{
                width: 100,
                height: 100,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: 28,
                border: '3px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                boxShadow: '0 16px 32px rgba(0,0,0,0.3)',
              }}
            >
              🏛️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    background: 'var(--blue)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 100,
                    fontSize: '.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Pastor Control Center
                </span>
                <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: '.7rem' }}>
                  ● LIVE
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: '3.8rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  textShadow: '0 2px 10px rgba(255,255,255,0.8)',
                  lineHeight: 1,
                }}
              >
                {church?.name}
              </h1>
              <p style={{ color: 'var(--ink2)', fontSize: '1.15rem', fontWeight: 600 }}>
                Real-time Congregational Insights & Growth
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              padding: '12px 28px',
              borderRadius: 24,
              border: '3px solid var(--blue)',
              boxShadow: '0 12px 30px rgba(59,130,246,0.2)',
            }}
          >
            <span
              style={{
                fontSize: '.8rem',
                fontWeight: 800,
                color: 'var(--ink3)',
                letterSpacing: 1.5,
              }}
            >
              SHARE INVITE CODE:
            </span>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: 'var(--blue)',
                letterSpacing: 4,
              }}
            >
              {church?.invite_code || '---'}
            </span>
            <button
              style={{
                background: 'var(--blue-bg)',
                border: 'none',
                color: 'var(--blue)',
                cursor: 'pointer',
                fontSize: '.9rem',
                marginLeft: 12,
                fontWeight: 800,
                padding: '6px 14px',
                borderRadius: 12,
              }}
              onClick={() => navigator.clipboard.writeText(church?.invite_code)}
            >
              📋 Copy Link
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '-40px auto 0', padding: '0 20px' }}>
        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div style={statCard}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue)' }}>
              {members.length}
            </div>
            <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink3)' }}>
              TOTAL MEMBERS
            </div>
          </div>
          <div style={statCard}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔥</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--red)' }}>
              {stats?.active_this_week || 0}
            </div>
            <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink3)' }}>
              ACTIVE THIS WEEK
            </div>
          </div>
          <div style={statCard}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏆</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--purple)' }}>
              {stats?.new_badges_this_week || 0}
            </div>
            <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink3)' }}>
              NEW BADGES EARNED
            </div>
          </div>
          <div style={statCard}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚡</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>
              {members.filter((m) => m.streak > 0).length}
            </div>
            <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink3)' }}>
              TOTAL STREAKS
            </div>
          </div>
        </div>

        {/* Member List */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '2px solid var(--border)',
            overflow: 'hidden',
            boxShadow: 'var(--sh)',
          }}
        >
          <div
            style={{
              padding: '20px 32px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '1.4rem', fontWeight: 800 }}>
              Congregation Leaderboard
            </h3>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ink3)' }}>
              Updated Real-time
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'var(--bg2)' }}>
                <th style={thStyle}>MEMBER</th>
                <th style={thStyle}>ROLE</th>
                <th style={thStyle}>STREAK</th>
                <th style={thStyle}>CHECK-INS</th>
                <th style={thStyle}>LAST ACTIVE</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ padding: 60, textAlign: 'center', color: 'var(--ink3)' }}
                  >
                    No members have joined yet. Share your invite code to get started!
                  </td>
                </tr>
              ) : (
                members.map((m, i) => (
                  <tr
                    key={m.id}
                    style={{ borderBottom: '1.5px solid var(--border)', transition: 'all .2s' }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.4rem' }}>👤</span>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                            {m.display_name || 'Anonymous User'}
                          </div>
                          <div style={{ fontSize: '.7rem', color: 'var(--ink3)' }}>
                            #Member_{i + 1}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: '.78rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 100,
                          background: 'var(--blue-bg)',
                          color: 'var(--blue)',
                        }}
                      >
                        {m.role || 'Member'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 800,
                          color: m.streak > 0 ? 'var(--red)' : 'var(--ink3)',
                        }}
                      >
                        🔥 {m.streak || 0}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700 }}>{m.checkin_count || 0}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '.8rem', color: 'var(--ink3)', fontWeight: 600 }}>
                        {m.last_checkin ? new Date(m.last_checkin).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const statCard = {
  background: 'var(--surface)',
  borderRadius: 24,
  border: '1.5px solid var(--border)',
  padding: '24px',
  textAlign: 'center',
  boxShadow: 'var(--sh)',
  transition: 'all .3s ease',
};

const thStyle = {
  padding: '16px 32px',
  fontSize: '.72rem',
  fontWeight: 800,
  color: 'var(--ink3)',
  textTransform: 'uppercase',
  letterSpacing: 1,
};
const tdStyle = { padding: '18px 32px', verticalAlign: 'middle' };
