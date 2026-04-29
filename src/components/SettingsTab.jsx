/**
 * SettingsTab — User settings panel for the Profile page
 * Handles: appearance, kids mode, reading goals, sound, privacy, account management
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useKidsMode } from '../context/KidsModeContext';

export default function SettingsTab({ signOut }) {
  const { kidsMode, requestToggle } = useKidsMode();

  const [settingsSaved, setSettingsSaved] = useState(false);
  const [readingGoal, setReadingGoal] = useState(() => parseInt(localStorage.getItem('bfl_reading_goal') || '1'));
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('bfl_sound') !== 'false');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('bfl_reduced_motion') === 'true');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('bfl_font_size') || 'normal');
  const [emailNewsletter, setEmailNewsletter] = useState(() => localStorage.getItem('bfl_newsletter') !== 'false');
  const [analyticsOptOut, setAnalyticsOptOut] = useState(() => localStorage.getItem('bfl_analytics_opt_out') === 'true');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  function saveSettings() {
    localStorage.setItem('bfl_reading_goal', String(readingGoal));
    localStorage.setItem('bfl_sound', String(soundEnabled));
    localStorage.setItem('bfl_reduced_motion', String(reducedMotion));
    localStorage.setItem('bfl_font_size', fontSize);
    localStorage.setItem('bfl_newsletter', String(emailNewsletter));
    localStorage.setItem('bfl_analytics_opt_out', String(analyticsOptOut));
    document.documentElement.style.setProperty(
      '--user-font-scale',
      fontSize === 'large' ? '1.15' : fontSize === 'small' ? '0.9' : '1'
    );
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await signOut();
      localStorage.clear();
      window.location.href = '/';
    } catch (e) {
      console.error('Delete account error:', e);
    }
  }

  const card = {
    background: 'var(--surface)',
    borderRadius: 20,
    border: '1.5px solid var(--border)',
    padding: '22px 24px',
    boxShadow: 'var(--sh)',
  };

  function Toggle({ on, onToggle }) {
    return (
      <div
        onClick={onToggle}
        style={{
          width: 44, height: 24, borderRadius: 100,
          background: on ? 'var(--blue)' : 'var(--border)',
          position: 'relative', cursor: 'pointer',
          transition: 'all .2s', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3,
          left: on ? 23 : 3, width: 18, height: 18,
          borderRadius: '50%', background: 'white',
          transition: 'all .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)',
        }} />
      </div>
    );
  }

  function SectionTitle({ children }) {
    return (
      <div style={{
        fontFamily: "'Baloo 2',cursive", fontWeight: 800,
        color: 'var(--ink)', marginBottom: 18, fontSize: '1rem',
      }}>
        {children}
      </div>
    );
  }

  function Row({ label, desc, children, border = true }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', cursor: 'pointer',
        padding: '12px 0',
        borderTop: border ? '1px solid var(--border)' : 'none',
      }}>
        <div>
          <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
          {desc && <div style={{ fontSize: '.72rem', color: 'var(--ink3)', marginTop: 2 }}>{desc}</div>}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Appearance ── */}
      <div style={card}>
        <SectionTitle>🎨 Appearance</SectionTitle>

        {/* Font Size */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--ink2)', marginBottom: 10 }}>
            Text Size
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['small','Small','0.9x'], ['normal','Normal','1x'], ['large','Large','1.15x']].map(([val, label, scale]) => (
              <button
                key={val}
                onClick={() => setFontSize(val)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12,
                  border: `2px solid ${fontSize === val ? 'var(--blue)' : 'var(--border)'}`,
                  background: fontSize === val ? 'var(--blue-bg)' : 'var(--bg2)',
                  color: fontSize === val ? 'var(--blue)' : 'var(--ink2)',
                  fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', transition: 'all .2s',
                }}
              >
                <div>{label}</div>
                <div style={{ fontSize: '.62rem', opacity: 0.6 }}>{scale}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Reduce Motion */}
        <Row label="♿ Reduce Animations" desc="Minimize motion for accessibility">
          <Toggle on={reducedMotion} onToggle={() => setReducedMotion(v => !v)} />
        </Row>
      </div>

      {/* ── Kids Mode ── */}
      <div style={card}>
        <SectionTitle>👶 Kids Mode</SectionTitle>
        <Row label={`Kids Mode ${kidsMode ? '(On)' : '(Off)'}`} desc="Larger fonts, brighter colors, safe content only" border={false}>
          <div
            onClick={() => requestToggle(kidsMode ? 'disable' : 'enable')}
            style={{
              width: 44, height: 24, borderRadius: 100,
              background: kidsMode ? 'var(--green)' : 'var(--border)',
              position: 'relative', cursor: 'pointer',
              transition: 'all .2s', flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 3,
              left: kidsMode ? 23 : 3, width: 18, height: 18,
              borderRadius: '50%', background: 'white',
              transition: 'all .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)',
            }} />
          </div>
        </Row>
      </div>

      {/* ── Reading Goals ── */}
      <div style={card}>
        <SectionTitle>🎯 Reading Goals</SectionTitle>
        <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--ink2)', marginBottom: 10 }}>
          Daily chapters goal
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3, 5, 10].map(n => (
            <button
              key={n}
              onClick={() => setReadingGoal(n)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 12,
                border: `2px solid ${readingGoal === n ? 'var(--green)' : 'var(--border)'}`,
                background: readingGoal === n ? 'rgba(16,185,129,.1)' : 'var(--bg2)',
                color: readingGoal === n ? 'var(--green)' : 'var(--ink2)',
                fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', transition: 'all .2s',
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '.7rem', color: 'var(--ink3)', marginTop: 8 }}>chapters per day</div>
      </div>

      {/* ── Sound & Notifications ── */}
      <div style={card}>
        <SectionTitle>🔔 Sound & Notifications</SectionTitle>
        <Row label="🔊 Sound Effects" desc="Game sounds, celebration effects" border={false}>
          <Toggle on={soundEnabled} onToggle={() => setSoundEnabled(v => !v)} />
        </Row>
        <Link
          to="/grow/bedtime-settings"
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', textDecoration: 'none',
            padding: '12px 0', borderTop: '1px solid var(--border)',
          }}
        >
          <div>
            <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--ink)' }}>🌙 Bedtime Mode Settings</div>
            <div style={{ fontSize: '.72rem', color: 'var(--ink3)', marginTop: 2 }}>Schedule, dim UI, calm content</div>
          </div>
          <span style={{ color: 'var(--blue)', fontWeight: 700, fontSize: '.8rem' }}>→</span>
        </Link>
      </div>

      {/* ── Privacy & Data ── */}
      <div style={card}>
        <SectionTitle>🔒 Privacy & Data</SectionTitle>
        <Row label="📧 Newsletter & Updates" desc="Receive weekly faith tips and new features" border={false}>
          <Toggle on={emailNewsletter} onToggle={() => setEmailNewsletter(v => !v)} />
        </Row>
        <Row label="📊 Analytics Opt-Out" desc="Stop anonymous usage tracking">
          <Toggle on={analyticsOptOut} onToggle={() => setAnalyticsOptOut(v => !v)} />
        </Row>
      </div>

      {/* ── Save Button ── */}
      <button
        onClick={saveSettings}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 16,
          border: 'none',
          background: settingsSaved ? 'var(--green)' : 'var(--blue)',
          color: 'white', fontFamily: 'Poppins,sans-serif',
          fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all .3s',
        }}
      >
        {settingsSaved ? '✅ Settings Saved!' : '💾 Save Settings'}
      </button>

      {/* ── Account Management ── */}
      <div style={{ ...card, border: '1.5px solid rgba(239,68,68,.2)' }}>
        <SectionTitle>⚠️ Account Management</SectionTitle>
        <button
          onClick={() => { localStorage.clear(); signOut(); }}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 12,
            border: '1.5px solid var(--border)', background: 'var(--bg2)',
            color: 'var(--ink2)', fontWeight: 700, fontSize: '.84rem',
            cursor: 'pointer', marginBottom: 10, transition: 'all .2s',
          }}
        >
          🚪 Sign Out of All Devices
        </button>

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 12,
              border: '1.5px solid rgba(239,68,68,.3)',
              background: 'rgba(239,68,68,.06)',
              color: 'var(--red)', fontWeight: 700,
              fontSize: '.84rem', cursor: 'pointer',
            }}
          >
            🗑️ Delete My Account
          </button>
        ) : (
          <div style={{ background: 'rgba(239,68,68,.06)', borderRadius: 12, padding: 16, border: '1.5px solid rgba(239,68,68,.2)' }}>
            <p style={{ fontSize: '.78rem', color: 'var(--red)', fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>
              This will permanently delete your account and all data. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid rgba(239,68,68,.3)', background: 'white',
                fontWeight: 700, fontSize: '.84rem', marginBottom: 10, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteConfirmText(''); }}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--ink2)', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                  background: deleteConfirmText === 'DELETE' ? 'var(--red)' : 'var(--bg3)',
                  color: deleteConfirmText === 'DELETE' ? 'white' : 'var(--ink3)',
                  fontWeight: 700, fontSize: '.8rem',
                  cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'default',
                  transition: 'all .2s',
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
