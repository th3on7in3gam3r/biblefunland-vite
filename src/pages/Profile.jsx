import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../context/StreakContext'
import { useT } from '../i18n/useT'
import { Link } from 'react-router-dom'
import * as db from '../lib/db'

const AVATARS = [
  { id: 'david',    emoji: '👑', name: 'David',   desc: 'Warrior King' },
  { id: 'esther',   emoji: '👸', name: 'Esther',  desc: 'Courageous Queen' },
  { id: 'moses',    emoji: '🏔️', name: 'Moses',   desc: 'The Deliverer' },
  { id: 'mary',     emoji: '🌸', name: 'Mary',    desc: 'Mother of Jesus' },
  { id: 'paul',     emoji: '✉️', name: 'Paul',    desc: 'The Apostle' },
  { id: 'noah',     emoji: '🚢', name: 'Noah',    desc: 'Man of Faith' },
  { id: 'daniel',   emoji: '🦁', name: 'Daniel',  desc: 'Lion of God' },
  { id: 'ruth',     emoji: '🌾', name: 'Ruth',    desc: 'Loyal & Faithful' },
  { id: 'peter',    emoji: '🎣', name: 'Peter',   desc: 'Rock of the Church' },
  { id: 'elijah',   emoji: '🔥', name: 'Elijah',  desc: 'Prophet of Fire' },
  { id: 'joseph',   emoji: '🌈', name: 'Joseph',  desc: 'Dreamer & Leader' },
  { id: 'deborah',  emoji: '⚔️', name: 'Deborah', desc: 'Judge of Israel' },
]

const BADGE_DATA = [
  { id: 'streak-3',  name: 'On Fire',       emoji: '🔥', color: '#F97316' },
  { id: 'streak-7',  name: 'Week Warrior',  emoji: '⚡', color: '#F59E0B' },
  { id: 'streak-30', name: 'Month Master',  emoji: '👑', color: '#8B5CF6' },
  { id: 'first-game',name: 'First Victory', emoji: '🎮', color: '#3B82F6' },
  { id: 'prayer-warrior', name: 'Prayer Warrior', emoji: '🙏', color: '#6366F1' },
  { id: 'ai-seeker', name: 'Seeker',        emoji: '🎙️', color: '#A855F7' },
]

function getLocalProfile() {
  try { return JSON.parse(localStorage.getItem('bfl_profile') || '{}') } catch { return {} }
}
function saveLocalProfile(p) { localStorage.setItem('bfl_profile', JSON.stringify(p)) }

export default function Profile() {
  const { user } = useAuth()
  const { streak } = useStreak()
  const { t } = useT()

  const [profile, setProfile] = useState(() => ({
    avatar: 'david',
    displayName: '',
    bio: '',
    ...getLocalProfile(),
  }))
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState('profile') // profile | badges | stats

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  async function loadProfile() {
    setLoading(true)
    try {
      const { data, error } = await db.getProfile(user.id)
      if (data) {
        setProfile({
          avatar: data.avatar_url || 'david',
          displayName: data.display_name || '',
          bio: data.bio || '',
        })
        saveLocalProfile({
          avatar: data.avatar_url || 'david',
          displayName: data.display_name || '',
          bio: data.bio || '',
        })
      }
    } catch (e) { console.error('Error loading profile:', e) }
    setLoading(false)
  }

  const notes = JSON.parse(localStorage.getItem('bfl_notes') || '[]')
  const earnedBadges = JSON.parse(localStorage.getItem('bfl_state') || '{}').earnedBadges || []
  const currentAvatar = AVATARS.find(a => a.id === profile.avatar) || AVATARS[0]
  const readDays = JSON.parse(localStorage.getItem('bfl_streak') || '{}').readDays || []

  async function save() {
    saveLocalProfile(profile)
    
    if (user?.id) {
      setLoading(true)
      try {
        await db.upsertProfile(user.id, {
          display_name: profile.displayName,
          avatar_url: profile.avatar,
          bio: profile.bio
        })
      } catch (e) { console.error('Error saving profile to cloud:', e) }
      setLoading(false)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const s = {
    page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' },
    hero: { 
      background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', 
      padding: 'clamp(40px, 8vw, 60px) 24px 0', 
      textAlign: 'center' 
    },
    avatarBig: { width: 'clamp(80px, 15vw, 100px)', height: 'clamp(80px, 15vw, 100px)', borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', margin: '0 auto 14px', boxShadow: '0 8px 32px rgba(99,102,241,.4)', border: '4px solid rgba(255,255,255,.15)' },
    heroName: { fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.5rem, 5vw, 1.8rem)', fontWeight: 800, color: 'white', marginBottom: 4 },
    heroSub: { fontSize: '.84rem', color: 'rgba(255,255,255,.5)', fontWeight: 500, marginBottom: 24 },
    tabs: { display: 'flex', gap: 2, justifyContent: 'center', marginTop: 0, overflowX: 'auto', paddingBottom: 10 },
    tab: (active) => ({ flexShrink: 0, fontFamily: 'Poppins,sans-serif', fontSize: '.84rem', fontWeight: 700, padding: '12px 20px', border: 'none', background: 'none', color: active ? 'white' : 'rgba(255,255,255,.45)', cursor: 'pointer', borderBottom: active ? '3px solid var(--blue)' : '3px solid transparent', transition: 'all .2s' }),
    shell: { maxWidth: 800, margin: '0 auto', padding: 'clamp(20px, 6vw, 36px) 16px' },
    card: { background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', padding: 'clamp(20px, 5vw, 32px)', marginBottom: 20 },
    label: { fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 12, display: 'block' },
    avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: 10, marginBottom: 24 },
    avatarItem: (active) => ({ borderRadius: 16, padding: '12px 8px', cursor: 'pointer', border: `2px solid ${active ? 'var(--blue)' : 'var(--border)'}`, background: active ? 'var(--blue-bg)' : 'var(--surface)', textAlign: 'center', transition: 'all .2s' }),
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14 },
    stat: { background: 'var(--bg2)', borderRadius: 16, padding: 18, textAlign: 'center', border: '1.5px solid var(--border)' },
  }

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.avatarBig}>{currentAvatar.emoji}</div>
        <div style={s.heroName}>{profile.displayName || user?.email?.split('@')[0] || 'Bible Explorer'}</div>
        <div style={s.heroSub}>{currentAvatar.name} · {currentAvatar.desc}</div>
        <div style={s.tabs}>
          {[['profile','👤 Profile'],['badges','🏆 Badges'],['stats','📊 Stats']].map(([id,label])=>(
            <button key={id} style={s.tab(tab===id)} onClick={()=>setTab(id)}>{label}</button>
          ))}
        </div>
      </div>

      <div style={s.shell}>
        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div>
            <div style={s.card}>
              <label style={s.label}>{t('profile.avatar')}</label>
              <div style={s.avatarGrid}>
                {AVATARS.map(a => (
                  <div key={a.id} style={s.avatarItem(profile.avatar === a.id)} onClick={() => setProfile(p => ({ ...p, avatar: a.id }))}>
                    <div style={{ fontSize: '2rem', marginBottom: 4 }}>{a.emoji}</div>
                    <div style={{ fontSize: '.62rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>{a.name}</div>
                  </div>
                ))}
              </div>

              <label style={s.label}>{t('profile.displayName')}</label>
              <input
                className="input-field"
                placeholder={user?.email?.split('@')[0] || 'Enter your name...'}
                value={profile.displayName}
                onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
                style={{ marginBottom: 16 }}
              />

              <label style={s.label}>Bio</label>
              <textarea
                className="textarea-field"
                placeholder="Share a little about your faith journey..."
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                style={{ marginBottom: 20, height: 80 }}
              />

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button className="btn btn-blue" onClick={save} disabled={loading}>
                  {loading ? '⏳ Syncing...' : (saved ? t('profile.saved') : t('profile.save'))}
                </button>
                {!user && (
                  <p style={{ fontSize: '.8rem', color: 'var(--ink3)', fontWeight: 500 }}>
                    <Link to="/auth" style={{ color: 'var(--blue)', fontWeight: 700 }}>Sign in</Link> to sync your profile across devices
                  </p>
                )}
                {user && !loading && !saved && (
                  <span style={{ fontSize: '.72rem', color: 'var(--green)', fontWeight: 600 }}>✨ Cloud Sync Active</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {tab === 'badges' && (
          <div style={s.card}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 20 }}>
              🏆 {earnedBadges.length} / {BADGE_DATA.length} Badges Earned
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {BADGE_DATA.map(b => {
                const earned = earnedBadges.includes(b.id) || (b.id === 'streak-3' && streak >= 3) || (b.id === 'streak-7' && streak >= 7) || (b.id === 'streak-30' && streak >= 30)
                return (
                  <div key={b.id} style={{ borderRadius: 18, padding: '22px 16px', textAlign: 'center', border: `2px solid ${earned ? b.color : 'var(--border)'}`, background: earned ? 'var(--surface)' : 'var(--bg2)', filter: earned ? 'none' : 'grayscale(.9)', opacity: earned ? 1 : .4, transition: 'all .25s', boxShadow: earned ? `0 4px 20px ${b.color}25` : 'none' }}>
                    <div style={{ fontSize: '2.8rem', marginBottom: 10 }}>{b.emoji}</div>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '.95rem', fontWeight: 800, color: earned ? b.color : 'var(--ink)', marginBottom: 4 }}>{b.name}</div>
                    {earned && <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--green)', background: 'var(--green-bg)', padding: '2px 8px', borderRadius: 100, display: 'inline-block' }}>✓ Earned</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === 'stats' && (
          <div style={s.card}>
            <div style={s.statGrid}>
              {[
                ['🔥', streak, t('profile.streak'), 'linear-gradient(135deg,#F97316,#EF4444)'],
                ['📅', readDays.length, 'Total Days Read', 'var(--green)'],
                ['🏆', earnedBadges.length, t('profile.badges'), 'var(--yellow)'],
                ['📝', notes.length, t('profile.notes'), 'var(--blue)'],
              ].map(([emoji, val, label, color], i) => (
                <div key={i} style={s.stat}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>{emoji}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '2.4rem', fontWeight: 800, lineHeight: 1, background: color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 }}>{val}</div>
                  <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink3)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
