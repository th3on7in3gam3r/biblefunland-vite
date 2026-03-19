import { useState, useEffect } from 'react'
import { useAuth }   from '../context/AuthContext'
import { useStreak } from '../context/StreakContext'
import { useBadges, BADGE_DEFS, RARITY_COLORS } from '../context/BadgeContext'
import { useT }      from '../i18n/useT'
import { Link }      from 'react-router-dom'
import * as db       from '../lib/db'

// ── Avatar roster ─────────────────────────────────────────────────────────────
const AVATARS = [
  { id:'david',   emoji:'👑', name:'David',   desc:'Warrior King',       color:'#8B5CF6' },
  { id:'esther',  emoji:'👸', name:'Esther',  desc:'Courageous Queen',   color:'#EC4899' },
  { id:'moses',   emoji:'🏔️', name:'Moses',   desc:'The Deliverer',      color:'#F59E0B' },
  { id:'mary',    emoji:'🌸', name:'Mary',    desc:'Mother of Jesus',    color:'#F472B6' },
  { id:'paul',    emoji:'✉️', name:'Paul',    desc:'The Apostle',        color:'#3B82F6' },
  { id:'noah',    emoji:'🚢', name:'Noah',    desc:'Man of Faith',       color:'#14B8A6' },
  { id:'daniel',  emoji:'🦁', name:'Daniel',  desc:'Lion of God',        color:'#F97316' },
  { id:'ruth',    emoji:'🌾', name:'Ruth',    desc:'Loyal & Faithful',   color:'#10B981' },
  { id:'peter',   emoji:'🎣', name:'Peter',   desc:'Rock of the Church', color:'#6366F1' },
  { id:'elijah',  emoji:'🔥', name:'Elijah',  desc:'Prophet of Fire',    color:'#EF4444' },
  { id:'joseph',  emoji:'🌈', name:'Joseph',  desc:'Dreamer & Leader',   color:'#A855F7' },
  { id:'deborah', emoji:'⚔️', name:'Deborah', desc:'Judge of Israel',    color:'#06B6D4' },
]

const BADGE_CATEGORIES = ['Streak','Games','AI','Community','Learning','Soul']
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAYS_FULL  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}
function saveLocal(key, val) { localStorage.setItem(key, JSON.stringify(val)) }

function last30() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })
}

function calcLongestStreak(days) {
  if (!days?.length) return 0
  const sorted = [...days].sort()
  let max = 1, cur = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000
    if (diff === 1) { cur++; if (cur > max) max = cur } else cur = 1
  }
  return max
}

function getMemberSince(user) {
  const raw = user?.createdAt || user?.created_at
  if (raw) return new Date(raw).toLocaleDateString('en-US', { month:'long', year:'numeric' })
  return 'BibleFunLand member'
}

export default function Profile() {
  const { user }   = useAuth()
  const { streak, readDays, checkinCount, checkedToday, checkIn } = useStreak()
  const { earned, hasBadge } = useBadges()
  const { t } = useT()

  // ── Profile form ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(() => ({
    avatar:       'david',
    displayName:  '',
    bio:          '',
    favoriteVerse:'',
    ...getLocal('bfl_profile', {}),
  }))
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  // ── UI state ─────────────────────────────────────────────────────────────
  const [tab,          setTab]          = useState('profile')
  const [badgeCat,     setBadgeCat]     = useState('All')
  const [badgeRarity,  setBadgeRarity]  = useState('All')
  const [shareOpen,    setShareOpen]    = useState(false)
  const [isPro,        setIsPro]        = useState(false)

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentAvatar  = AVATARS.find(a => a.id === profile.avatar) || AVATARS[0]
  const earnedCount    = earned.size
  const totalBadges    = Object.keys(BADGE_DEFS).length
  const displayName    = profile.displayName || user?.email?.split('@')[0] || 'Bible Explorer'
  const dates30        = last30()
  const heatmap        = Object.fromEntries((readDays||[]).map(d => [d, true]))
  const longestStreak  = calcLongestStreak(readDays)
  const notes          = getLocal('bfl_notes', [])
  const chaptersRead   = (() => {
    try { const rb = getLocal('bfl_read_books', {}); return Object.values(rb).reduce((n,c) => n+(Array.isArray(c)?c.length:0), 0) }
    catch { return 0 }
  })()
  const pctBible = Math.min(100, Math.round((chaptersRead / 1189) * 100))
  const dayCount = Array(7).fill(0)
  ;(readDays||[]).forEach(d => { dayCount[new Date(d).getDay()]++ })
  const bestDayIdx = dayCount.indexOf(Math.max(...dayCount))

  // ── Load Turso profile + subscription ────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    db.getProfile(user.id).then(({ data }) => {
      if (data) {
        const p = { avatar: data.avatar_url||'david', displayName: data.display_name||'', bio: data.bio||'', favoriteVerse: data.favorite_verse||'' }
        setProfile(p); saveLocal('bfl_profile', p)
      }
    }).catch(() => {})
    db.getSubscription(user.id).then(({ data }) => {
      if (data?.status === 'active') setIsPro(true)
    }).catch(() => {})
  }, [user?.id])

  async function save() {
    saveLocal('bfl_profile', profile)
    if (user?.id) {
      setSaving(true)
      await db.upsertProfile(user.id, { display_name: profile.displayName, avatar_url: profile.avatar, bio: profile.bio, favorite_verse: profile.favoriteVerse }).catch(() => {})
      setSaving(false)
    }
    setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  function copyShareCard() {
    const txt = `✝️ ${displayName} on BibleFunLand\n🔥 ${streak} day streak · 🏆 ${earnedCount}/${totalBadges} badges · 📖 ${chaptersRead} chapters read${profile.favoriteVerse ? `\n\n"${profile.favoriteVerse}"` : ''}\n\n🌐 biblefunland.com`
    navigator.clipboard.writeText(txt)
    setShareOpen(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  // ── Filtered badges ────────────────────────────────────────────────────
  const filteredBadges = Object.entries(BADGE_DEFS).filter(([id, b]) =>
    (badgeCat === 'All' || b.category === badgeCat) &&
    (badgeRarity === 'All' || b.rarity === badgeRarity)
  )

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div style={{ background:'linear-gradient(160deg,#0F0F1A 0%,#1E1B4B 55%,#0A1A14 100%)', paddingTop:'clamp(44px,8vw,64px)', paddingBottom:0, textAlign:'center', position:'relative', overflow:'hidden' }}>
        {/* Background glow */}
        <div style={{ position:'absolute', top:-80, left:'18%', width:320, height:320, borderRadius:'50%', background:`radial-gradient(circle,${currentAvatar.color}14,transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:10, right:'14%', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,.1),transparent 70%)', pointerEvents:'none' }} />

        {/* Avatar */}
        <div style={{ position:'relative', display:'inline-block', marginBottom:14 }}>
          <div style={{ width:'clamp(88px,14vw,108px)', height:'clamp(88px,14vw,108px)', borderRadius:'50%', background:`linear-gradient(135deg,${currentAvatar.color}44,${currentAvatar.color}11)`, border:`3px solid ${currentAvatar.color}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(2.8rem,5.5vw,3.6rem)', boxShadow:`0 0 0 6px ${currentAvatar.color}16,0 12px 40px rgba(0,0,0,.4)`, margin:'0 auto', transition:'all .3s' }}>
            {currentAvatar.emoji}
          </div>
          {isPro && <div style={{ position:'absolute', bottom:2, right:2, background:'linear-gradient(135deg,#F59E0B,#F97316)', borderRadius:'50%', width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', border:'2px solid var(--bg)', boxShadow:'0 2px 8px rgba(0,0,0,.3)' }}>💎</div>}
          {streak >= 7 && <div style={{ position:'absolute', top:-4, right:-4, background:'linear-gradient(135deg,#F97316,#EF4444)', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.58rem', fontWeight:800, color:'white', border:'2px solid var(--bg)' }}>{streak}</div>}
        </div>

        {/* Name */}
        <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(1.5rem,4.5vw,2rem)', fontWeight:800, color:'white', marginBottom:3, letterSpacing:'-.4px' }}>{displayName}</div>
        <div style={{ fontSize:'.82rem', color:'rgba(255,255,255,.45)', fontWeight:500, marginBottom:3 }}>{currentAvatar.name} · {currentAvatar.desc}</div>
        {user && <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.22)', fontWeight:500, marginBottom:14 }}>{getMemberSince(user)}{isPro && <span style={{ color:'#F59E0B', fontWeight:700 }}> · 💎 Pro</span>}</div>}

        {/* Stat pills */}
        <div style={{ display:'flex', gap:7, justifyContent:'center', flexWrap:'wrap', padding:'0 16px', marginBottom:14 }}>
          {[['🔥',streak,'streak'],['🏆',`${earnedCount}/${totalBadges}`,'badges'],['📖',chaptersRead,'chapters'],['📅',readDays?.length||0,'days']].map(([e,v,l])=>(
            <div key={l} style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:100, padding:'5px 12px', display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:'.82rem' }}>{e}</span>
              <span style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'white', fontSize:'.82rem' }}>{v}</span>
              <span style={{ fontSize:'.6rem', color:'rgba(255,255,255,.3)', fontWeight:600 }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Share button */}
        <div style={{ marginBottom:0, padding:'0 16px 0', position:'relative', display:'inline-block' }}>
          <button onClick={() => setShareOpen(s=>!s)} style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', color:'rgba(255,255,255,.65)', borderRadius:100, padding:'6px 16px', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:'.72rem', fontWeight:700, transition:'all .2s' }}>
            📤 Share Profile
          </button>
          {shareOpen && <>
            <div style={{ position:'fixed', inset:0, zIndex:98 }} onClick={()=>setShareOpen(false)} />
            <div style={{ position:'absolute', top:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)', zIndex:99, background:'var(--surface)', borderRadius:16, border:'1.5px solid var(--border)', padding:'16px 20px', width:300, textAlign:'left', boxShadow:'var(--sh-lg)' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', fontSize:'.9rem', marginBottom:10 }}>📤 Share Your Profile</div>
              <div style={{ background:'var(--bg2)', borderRadius:10, padding:'10px 12px', marginBottom:12, fontSize:'.74rem', color:'var(--ink2)', lineHeight:1.75, fontWeight:500 }}>
                ✝️ <strong>{displayName}</strong><br/>
                🔥 {streak} streak · 🏆 {earnedCount}/{totalBadges} badges<br/>
                📖 {chaptersRead} chapters read
              </div>
              <button className="btn btn-blue btn-full btn-sm" onClick={copyShareCard}>📋 Copy to Clipboard</button>
            </div>
          </>}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', justifyContent:'center', gap:0, marginTop:18, overflowX:'auto', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
          {[['profile','👤 Profile'],['badges','🏆 Badges'],['stats','📊 Stats'],['activity','⚡ Activity']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ flexShrink:0, background:'none', border:'none', cursor:'pointer', color:tab===id?'white':'rgba(255,255,255,.38)', fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'.82rem', padding:'12px 18px', borderBottom:tab===id?'3px solid var(--blue)':'3px solid transparent', transition:'all .2s' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ══ TAB CONTENT ═══════════════════════════════════════════════════════ */}
      <div style={{ maxWidth:820, margin:'0 auto', padding:'clamp(20px,5vw,32px) 16px' }}>

        {/* ─ PROFILE ─────────────────────────────────────────────────────── */}
        {tab==='profile' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Avatar picker */}
            <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:24, boxShadow:'var(--sh)' }}>
              <div style={{ fontSize:'.68rem', fontWeight:800, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>Choose Your Character</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))', gap:9 }}>
                {AVATARS.map(a => {
                  const active = profile.avatar === a.id
                  return (
                    <div key={a.id} onClick={()=>setProfile(p=>({...p,avatar:a.id}))}
                      style={{ borderRadius:16, padding:'12px 8px', cursor:'pointer', textAlign:'center', transition:'all .22s', border:`2px solid ${active?a.color:'var(--border)'}`, background:active?a.color+'14':'var(--surface)', boxShadow:active?`0 4px 16px ${a.color}28`:'none', transform:active?'scale(1.05)':'scale(1)' }}
                      onMouseEnter={e=>{ if(!active) e.currentTarget.style.borderColor=a.color+'55' }}
                      onMouseLeave={e=>{ if(!active) e.currentTarget.style.borderColor='var(--border)' }}>
                      <div style={{ fontSize:'2rem', marginBottom:3 }}>{a.emoji}</div>
                      <div style={{ fontSize:'.58rem', fontWeight:700, color:active?a.color:'var(--ink)', lineHeight:1.2 }}>{a.name}</div>
                      {active && <div style={{ fontSize:'.5rem', color:a.color, fontWeight:500, marginTop:1 }}>{a.desc}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Info fields */}
            <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:24, boxShadow:'var(--sh)' }}>
              <div style={{ fontSize:'.68rem', fontWeight:800, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>Profile Info</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:'.68rem', fontWeight:700, color:'var(--ink3)', display:'block', marginBottom:6 }}>Display Name</label>
                  <input className="input-field" placeholder={user?.email?.split('@')[0]||'Your name...'} value={profile.displayName} onChange={e=>setProfile(p=>({...p,displayName:e.target.value}))} />
                </div>
                <div>
                  <label style={{ fontSize:'.68rem', fontWeight:700, color:'var(--ink3)', display:'block', marginBottom:6 }}>Favorite Verse</label>
                  <input className="input-field" placeholder="e.g. Jer 29:11 or Phil 4:13..." value={profile.favoriteVerse} onChange={e=>setProfile(p=>({...p,favoriteVerse:e.target.value}))} />
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:'.68rem', fontWeight:700, color:'var(--ink3)', display:'block', marginBottom:6 }}>Bio — share your faith journey</label>
                <textarea className="textarea-field" placeholder="Share where you are in your faith journey..." value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} style={{ height:80 }} />
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', paddingTop:16, borderTop:'1px solid var(--border)' }}>
                <button className="btn btn-blue" onClick={save} disabled={saving}>
                  {saving?'⏳ Saving...':saved?'✅ Saved!':'💾 Save Profile'}
                </button>
                {!user && <p style={{ fontSize:'.76rem', color:'var(--ink3)', fontWeight:500, margin:0 }}><Link to="/auth" style={{ color:'var(--blue)', fontWeight:700 }}>Sign in</Link> to sync across devices</p>}
                {user && !saving && <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.7rem', fontWeight:600, color:'var(--green)' }}><div style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s ease-in-out infinite' }} /> Cloud Sync Active</div>}
              </div>
            </div>

            {/* Account card */}
            {user && (
              <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:'20px 24px', boxShadow:'var(--sh)' }}>
                <div style={{ fontSize:'.68rem', fontWeight:800, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>Account</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ fontSize:'.82rem', fontWeight:600, color:'var(--ink2)' }}>{user.email}</div>
                    <div style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:500, marginTop:2 }}>{getMemberSince(user)}</div>
                  </div>
                  {isPro
                    ? <div style={{ background:'linear-gradient(135deg,rgba(245,158,11,.15),rgba(249,115,22,.1))', border:'1px solid rgba(245,158,11,.3)', borderRadius:100, padding:'6px 14px', fontSize:'.72rem', fontWeight:800, color:'#F59E0B' }}>💎 Pro Member</div>
                    : <Link to="/premium" className="btn btn-orange btn-sm">💎 Upgrade to Pro</Link>
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─ BADGES ──────────────────────────────────────────────────────── */}
        {tab==='badges' && (
          <div>
            {/* Progress */}
            <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:'20px 24px', marginBottom:16, boxShadow:'var(--sh)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', fontSize:'1rem' }}>🏆 Badge Collection</div>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--yellow)', fontSize:'1rem' }}>{earnedCount} / {totalBadges}</div>
              </div>
              <div style={{ height:10, borderRadius:100, background:'var(--bg3)', overflow:'hidden', marginBottom:10 }}>
                <div style={{ height:'100%', borderRadius:100, background:'linear-gradient(90deg,#F59E0B,#F97316)', width:`${(earnedCount/totalBadges)*100}%`, transition:'width .6s ease', boxShadow:'0 0 10px rgba(245,158,11,.4)' }} />
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {Object.entries(RARITY_COLORS).map(([rarity, rc]) => {
                  const total   = Object.values(BADGE_DEFS).filter(b=>b.rarity===rarity).length
                  const got     = Object.entries(BADGE_DEFS).filter(([id,b])=>b.rarity===rarity && earned.has(id)).length
                  return <div key={rarity} style={{ fontSize:'.66rem', fontWeight:700, padding:'3px 9px', borderRadius:100, background:rc.bg, color:rc.color, border:`1px solid ${rc.color}33` }}>{rarity.charAt(0).toUpperCase()+rarity.slice(1)}: {got}/{total}</div>
                })}
              </div>
            </div>

            {/* Filters */}
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:14 }}>
              {['All',...BADGE_CATEGORIES].map(c=>(
                <button key={c} onClick={()=>setBadgeCat(c)} style={{ fontSize:'.7rem', fontWeight:700, padding:'5px 11px', borderRadius:100, cursor:'pointer', border:`1.5px solid ${badgeCat===c?'var(--blue)':'var(--border)'}`, background:badgeCat===c?'var(--blue-bg)':'var(--surface)', color:badgeCat===c?'var(--blue)':'var(--ink3)', transition:'all .2s' }}>{c}</button>
              ))}
              {['All','common','uncommon','rare','legendary'].map(r=>{
                const rc = RARITY_COLORS[r]
                return <button key={r} onClick={()=>setBadgeRarity(r)} style={{ fontSize:'.68rem', fontWeight:700, padding:'5px 10px', borderRadius:100, cursor:'pointer', border:`1.5px solid ${badgeRarity===r?(rc?.color||'var(--blue)'):'var(--border)'}`, background:badgeRarity===r?(rc?.bg||'var(--blue-bg)'):'var(--surface)', color:badgeRarity===r?(rc?.color||'var(--blue)'):'var(--ink3)', transition:'all .2s', textTransform:'capitalize' }}>{r}</button>
              })}
            </div>

            {/* Grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(138px,1fr))', gap:11 }}>
              {filteredBadges.map(([id,badge])=>{
                const isEarned = earned.has(id)
                const rc       = RARITY_COLORS[badge.rarity]
                return (
                  <div key={id} style={{ borderRadius:18, padding:'18px 12px', textAlign:'center', border:`2px solid ${isEarned?rc.color:'var(--border)'}`, background:isEarned?'var(--surface)':'var(--bg2)', filter:isEarned?'none':'grayscale(.85)', opacity:isEarned?1:.4, transition:'all .25s', boxShadow:isEarned?`0 4px 20px ${rc.color}20`:'none', position:'relative', overflow:'hidden' }}>
                    {isEarned && badge.rarity==='legendary' && <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(245,158,11,.06),transparent,rgba(245,158,11,.06))', pointerEvents:'none' }} />}
                    <div style={{ fontSize:'2.2rem', marginBottom:7, filter:isEarned?`drop-shadow(0 2px 8px ${rc.color}44)`:'none' }}>{badge.emoji}</div>
                    <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'.8rem', fontWeight:800, color:isEarned?rc.color:'var(--ink)', marginBottom:3, lineHeight:1.2 }}>{badge.name}</div>
                    <div style={{ fontSize:'.58rem', color:'var(--ink3)', fontWeight:500, lineHeight:1.4, marginBottom:6 }}>{badge.desc}</div>
                    <div style={{ fontSize:'.56rem', fontWeight:800, padding:'2px 7px', borderRadius:100, background:rc.bg, color:rc.color, display:'inline-block', textTransform:'uppercase', letterSpacing:.5 }}>{badge.rarity}</div>
                    {isEarned && <div style={{ fontSize:'.58rem', fontWeight:700, color:'var(--green)', marginTop:5 }}>✓ Earned</div>}
                  </div>
                )
              })}
            </div>

            {filteredBadges.length===0 && (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--ink3)' }}>
                <div style={{ fontSize:'2rem', opacity:.2, marginBottom:8 }}>🏆</div>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)' }}>No badges match this filter</div>
              </div>
            )}
          </div>
        )}

        {/* ─ STATS ────────────────────────────────────────────────────────── */}
        {tab==='stats' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Stat grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(148px,1fr))', gap:11 }}>
              {[
                ['🔥', streak,                'Current Streak',   'linear-gradient(135deg,#F97316,#EF4444)'],
                ['⚡', longestStreak,          'Longest Streak',   'var(--violet)'],
                ['📅', readDays?.length||0,   'Total Days Read',  'var(--green)'],
                ['✅', checkinCount||0,        'Total Check-ins',  'var(--blue)'],
                ['🏆', earnedCount,            'Badges Earned',    'var(--yellow)'],
                ['📖', chaptersRead,           'Chapters Read',    'var(--teal)'],
                ['📝', notes.length,           'Sermon Notes',     '#A855F7'],
                ['📈', pctBible+'%',           'Bible Complete',   'var(--green)'],
              ].map(([e,v,l,c],i)=>(
                <div key={i} style={{ background:'var(--surface)', borderRadius:18, padding:'18px 14px', border:'1.5px solid var(--border)', textAlign:'center', boxShadow:'var(--sh-sm)' }}>
                  <div style={{ fontSize:'1.4rem', marginBottom:5 }}>{e}</div>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'2rem', fontWeight:800, lineHeight:1, marginBottom:4, background:c, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{v}</div>
                  <div style={{ fontSize:'.62rem', fontWeight:600, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:.5 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Heatmap — 30 days */}
            <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:'22px 24px', boxShadow:'var(--sh)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', fontSize:'.95rem' }}>📅 Last 30 Days</div>
                <div style={{ fontSize:'.72rem', color:'var(--ink3)', fontWeight:600 }}>{dates30.filter(d=>heatmap[d]).length} / 30 read</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(10,1fr)', gap:5 }}>
                {dates30.map(d=>{
                  const read    = heatmap[d]
                  const isToday = d===new Date().toISOString().split('T')[0]
                  return (
                    <div key={d} title={d} style={{ aspectRatio:1, borderRadius:6, background:read?'linear-gradient(135deg,#059669,#34D399)':'var(--bg3)', border:isToday?'2px solid var(--blue)':'2px solid transparent', boxShadow:read?'0 2px 8px rgba(16,185,129,.25)':'none', transition:'transform .15s', cursor:'default' }}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.25)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} />
                  )
                })}
              </div>
              <div style={{ display:'flex', gap:12, marginTop:10, fontSize:'.66rem', color:'var(--ink3)', fontWeight:600 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:11, height:11, borderRadius:3, background:'linear-gradient(135deg,#059669,#34D399)' }} /> Read</div>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:11, height:11, borderRadius:3, background:'var(--bg3)' }} /> Missed</div>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:11, height:11, borderRadius:3, border:'2px solid var(--blue)' }} /> Today</div>
              </div>
            </div>

            {/* Bible progress */}
            <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:'22px 24px', boxShadow:'var(--sh)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', fontSize:'.95rem' }}>📖 Bible Progress</div>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--green)', fontSize:'.95rem' }}>{chaptersRead} / 1,189</div>
              </div>
              <div style={{ height:13, borderRadius:100, background:'var(--bg3)', overflow:'hidden', marginBottom:7 }}>
                <div style={{ height:'100%', borderRadius:100, background:'linear-gradient(90deg,#059669,#34D399)', width:`${pctBible}%`, transition:'width .6s', boxShadow:'0 0 10px rgba(16,185,129,.3)' }} />
              </div>
              <div style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:500 }}>{pctBible}% complete · {1189-chaptersRead} chapters to go</div>
              <Link to="/reading-stats" style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:12, fontSize:'.76rem', fontWeight:700, color:'var(--blue)', textDecoration:'none' }}>
                View Full Reading Stats →
              </Link>
            </div>

            {/* Day-of-week bars */}
            <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:'22px 24px', boxShadow:'var(--sh)' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', marginBottom:14, fontSize:'.95rem' }}>📊 When You Read Most</div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:70 }}>
                {DAYS_SHORT.map((day,i)=>{
                  const max    = Math.max(...dayCount,1)
                  const h      = Math.round((dayCount[i]/max)*60)
                  const isTop  = dayCount[i]===Math.max(...dayCount) && dayCount[i]>0
                  return (
                    <div key={day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{ width:'100%', height:h||4, borderRadius:'5px 5px 0 0', background:isTop?'var(--green)':'var(--bg3)', minHeight:4, transition:'all .3s', boxShadow:isTop?'0 0 8px rgba(16,185,129,.3)':'none' }} />
                      <div style={{ fontSize:'.58rem', fontWeight:isTop?800:600, color:isTop?'var(--green)':'var(--ink3)' }}>{day}</div>
                    </div>
                  )
                })}
              </div>
              {Math.max(...dayCount)>0 && <div style={{ marginTop:10, fontSize:'.72rem', color:'var(--ink3)', fontWeight:500 }}>Most active on <strong style={{ color:'var(--green)' }}>{DAYS_FULL[bestDayIdx]}s</strong></div>}
            </div>

            {/* Check-in CTA */}
            {!checkedToday
              ? <button className="btn btn-green btn-full btn-lg" onClick={checkIn}>✅ Mark Today as Read — Keep Your Streak!</button>
              : <div style={{ textAlign:'center', padding:16, background:'var(--green-bg)', borderRadius:16, border:'1.5px solid rgba(16,185,129,.2)', fontSize:'.88rem', fontWeight:700, color:'var(--green)' }}>✅ Checked in today! See you tomorrow 🔥</div>
            }
          </div>
        )}

        {/* ─ ACTIVITY ────────────────────────────────────────────────────── */}
        {tab==='activity' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Streak milestones */}
            <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:'22px 24px', boxShadow:'var(--sh)' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', marginBottom:16, fontSize:'.95rem' }}>🏅 Streak Milestones</div>
              {[
                [1,   '🌱','First Step',     'Started your Bible reading journey'],
                [3,   '🔥','3-Day Streak',   'Building a consistent habit'],
                [7,   '💪','One Full Week',   'A week in the Word'],
                [14,  '📖','Two Weeks',       'Halfway to a monthly habit'],
                [30,  '🏆','Monthly Faithful','30 days — a true disciple'],
                [60,  '🌟','Two Months',      'Consistency becoming character'],
                [100, '👑','Century Saint',   '100 days — extraordinary faithfulness'],
                [365, '✝️','Year of Grace',   'A full year walking with God'],
              ].map(([target,emoji,title,desc])=>{
                const reached = streak>=target
                return (
                  <div key={target} style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:reached?'var(--green-bg)':'var(--bg2)', border:`2px solid ${reached?'var(--green)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0, filter:reached?'none':'grayscale(.8)', opacity:reached?1:.4 }}>{emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:reached?'var(--ink)':'var(--ink3)', fontSize:'.86rem' }}>{title}</div>
                      <div style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:500 }}>{desc}</div>
                    </div>
                    <div style={{ fontSize:'.7rem', fontWeight:700, color:reached?'var(--green)':'var(--ink3)', flexShrink:0 }}>{reached?'✅ Reached':`${target} days`}</div>
                  </div>
                )
              })}
            </div>

            {/* Earned badges list */}
            <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:'22px 24px', boxShadow:'var(--sh)' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', marginBottom:16, fontSize:'.95rem' }}>🏆 Earned Badges ({earnedCount})</div>
              {earnedCount===0 ? (
                <div style={{ textAlign:'center', padding:'24px 0', color:'var(--ink3)' }}>
                  <div style={{ fontSize:'2rem', opacity:.2, marginBottom:8 }}>🏆</div>
                  <p style={{ fontSize:'.84rem', marginBottom:12 }}>No badges yet — start playing to earn your first!</p>
                  <Link to="/trivia" className="btn btn-blue btn-sm" style={{ display:'inline-flex' }}>Start with Bible Trivia →</Link>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                  {[...earned].filter(id=>BADGE_DEFS[id]).map(id=>{
                    const badge=BADGE_DEFS[id], rc=RARITY_COLORS[badge.rarity]
                    return (
                      <div key={id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                        <div style={{ width:38, height:38, borderRadius:10, background:rc.bg, border:`1.5px solid ${rc.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>{badge.emoji}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', fontSize:'.86rem' }}>{badge.name}</div>
                          <div style={{ fontSize:'.68rem', color:'var(--ink3)', fontWeight:500 }}>{badge.desc}</div>
                        </div>
                        <div style={{ fontSize:'.58rem', fontWeight:800, padding:'2px 8px', borderRadius:100, background:rc.bg, color:rc.color, textTransform:'uppercase', letterSpacing:.5 }}>{badge.rarity}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Favorite verse display */}
            {profile.favoriteVerse && (
              <div style={{ background:'linear-gradient(135deg,rgba(16,185,129,.08),rgba(99,102,241,.06))', borderRadius:20, border:'1.5px solid rgba(16,185,129,.2)', padding:'22px 24px' }}>
                <div style={{ fontSize:'.68rem', fontWeight:800, color:'var(--green)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>✝️ Favorite Verse</div>
                <p style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.05rem', fontWeight:700, color:'var(--ink)', fontStyle:'italic', lineHeight:1.6, margin:0 }}>"{profile.favoriteVerse}"</p>
              </div>
            )}

            {/* Quick links to earn more */}
            <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:'22px 24px', boxShadow:'var(--sh)' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'var(--ink)', marginBottom:14, fontSize:'.95rem' }}>🚀 Earn More Badges</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:9 }}>
                {[
                  ['/trivia',          '🎮','Bible Trivia'],
                  ['/devotional',      '🙏','AI Devotional'],
                  ['/game/runner',     '🏃','Scripture Runner'],
                  ['/prayer',          '🌍','Prayer Wall'],
                  ['/certification',   '🎓','Certification'],
                  ['/flashcards',      '🧠','Flashcards'],
                  ['/game/battle-arena','⚔️','Battle Arena'],
                  ['/wordle',          '🟩','Bible Wordle'],
                ].map(([to,emoji,label])=>(
                  <Link key={to} to={to} style={{ display:'flex', alignItems:'center', gap:9, padding:'11px 14px', borderRadius:12, border:'1.5px solid var(--border)', background:'var(--bg2)', transition:'all .2s', color:'var(--ink2)', fontWeight:600, fontSize:'.8rem', textDecoration:'none' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--blue)'; e.currentTarget.style.color='var(--blue)' }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--ink2)' }}>
                    <span style={{ fontSize:'1.1rem' }}>{emoji}</span>{label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
      `}</style>
    </div>
  )
}
