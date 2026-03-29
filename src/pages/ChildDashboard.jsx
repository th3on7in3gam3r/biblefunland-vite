import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n/useT'
import * as db from '../lib/db'
import ParentalControlsPanel from '../components/ParentalControlsPanel'
import ProgressReport from '../components/ProgressReport'
import { requestQueue } from '../lib/requestQueue'
import { STICKERS } from './KidsDashboard'

// Avatar roster (same as Profile.jsx)
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

export default function ChildDashboard() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useT()

  // Data state
  const [child, setChild] = useState(null)
  const [stickers, setStickers] = useState(new Set())
  const [stats7d, setStats7d] = useState(null)
  const [stats30d, setStats30d] = useState(null)
  const [progressReport, setProgressReport] = useState(null)
  const [familyWinBanner, setFamilyWinBanner] = useState(false)
  const [missedDevotionalReminder, setMissedDevotionalReminder] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('overview')

  // Access control and data loading
  useEffect(() => {
    console.log('[ChildDashboard] useEffect triggered', { userId: user?.id, childId })
    
    if (!user?.id) {
      console.log('[ChildDashboard] No user, redirecting to profile')
      navigate('/profile')
      return
    }

    let cancelled = false

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get child profile directly - skip profile role check for now
        // The route is already protected by auth, so we know user is logged in
        console.log('[ChildDashboard] Fetching child profiles for user:', user.id)
        const { data: childProfiles } = await db.getChildProfiles(user.id, true)
        
        if (cancelled) return
        
        console.log('[ChildDashboard] Child profiles:', childProfiles)
        const childProfile = childProfiles?.find(c => c.id === childId)
        console.log('[ChildDashboard] Found child profile:', childProfile)

        if (!childProfile) {
          console.error('[ChildDashboard] Child profile not found')
          setError('Child profile not found')
          setLoading(false)
          return
        }

        if (cancelled) return

        setChild(childProfile)
        console.log('[ChildDashboard] Child set successfully')

        // Fetch activity stats for 7 days - bypass queue for immediate loading
        console.log('[ChildDashboard] Fetching 7-day stats')
        const stats7dRes = await db.getChildActivityStats(childId, 7)
        
        if (cancelled) return
        
        setStats7d(stats7dRes.data || [])
        console.log('[ChildDashboard] 7-day stats:', stats7dRes.data)

        // Fetch activity stats for 30 days - bypass queue
        console.log('[ChildDashboard] Fetching 30-day stats')
        const stats30dRes = await db.getChildActivityStats(childId, 30)
        
        if (cancelled) return
        
        setStats30d(stats30dRes.data || [])
        console.log('[ChildDashboard] 30-day stats:', stats30dRes.data)

        // Fetch stickers for parental view
        const badgesRes = await db.getBadges(childId)
        if (!cancelled && badgesRes.data) {
          setStickers(new Set(badgesRes.data.map(b => b.badge_id)))
        }

        // Fetch progress report - bypass queue
        console.log('[ChildDashboard] Fetching progress report')
        const reportRes = await db.getProgressReport(childId, '7d')
        
        if (cancelled) return
        
        setProgressReport(reportRes.data || {})
        console.log('[ChildDashboard] Progress report:', reportRes.data)

        // Check for Family Win banner
        await checkFamilyWin(childId)

        // Check for missed devotional reminder
        await checkMissedDevotional(childId)

        if (cancelled) return

        console.log('[ChildDashboard] Setting loading to false')
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('[ChildDashboard] Error fetching child dashboard data:', err)
        setError(err.message || 'Failed to load child dashboard')
        setLoading(false)
      }
    }

    loadData()
    
    return () => {
      cancelled = true
    }
  }, [user?.id, childId, navigate])

  const checkFamilyWin = async (childId) => {
    try {
      // Skip this check for now - requires plan_id not child_id
      // TODO: Implement proper family win detection
      console.log('[ChildDashboard] Skipping family win check')
    } catch (err) {
      console.warn('Error checking family win:', err)
    }
  }

  const checkMissedDevotional = async (childId) => {
    try {
      // Check if child has no completion record for 3+ consecutive days
      const { data: activities } = await db.getChildActivity(childId, 100)
      
      if (!activities || activities.length === 0) {
        setMissedDevotionalReminder(true)
        return
      }

      // Get last 3 days of activity
      const today = new Date()
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const recentActivities = activities.filter(a => {
        const actDate = new Date(a.completed_at)
        return actDate >= threeDaysAgo
      })

      // If no activities in last 3 days, show reminder
      if (recentActivities.length === 0) {
        setMissedDevotionalReminder(true)
      }
    } catch (err) {
      console.warn('Error checking missed devotional:', err)
    }
  }

  if (loading) {
    return (
      <div style={{ background:'var(--bg)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Poppins,sans-serif' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>⏳</div>
          <div style={{ fontSize:'.9rem', color:'var(--ink3)', fontWeight:600 }}>Loading child dashboard...</div>
        </div>
      </div>
    )
  }

  if (error || !child) {
    return (
      <div style={{ background:'var(--bg)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Poppins,sans-serif', padding:20 }}>
        <div style={{ textAlign:'center', maxWidth:400 }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>⚠️</div>
          <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.5rem', fontWeight:800, color:'var(--ink)', marginBottom:12 }}>Oops!</h1>
          <p style={{ fontSize:'.9rem', color:'var(--ink3)', fontWeight:500, marginBottom:24 }}>{error || 'Child profile not found'}</p>
          <button onClick={() => navigate('/profile')} style={{ padding:'11px 24px', borderRadius:12, border:'none', background:'var(--blue)', color:'white', fontFamily:'Poppins,sans-serif', fontSize:'.82rem', fontWeight:700, cursor:'pointer' }}>
            Back to Profile
          </button>
        </div>
      </div>
    )
  }

  const currentAvatar = AVATARS.find(a => a.id === child.avatar_url) || AVATARS[0]
  const streak = progressReport?.streak || 0
  const badgesEarned = progressReport?.badgesEarned || 0
  const quizzesCompleted = progressReport?.quizzesCompleted || 0
  const quizAccuracy = progressReport?.quizAccuracy || 0
  const activities = progressReport?.activities || []

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>

      {/* ══ FAMILY WIN BANNER ═════════════════════════════════════════════════ */}
      {familyWinBanner && (
        <div style={{ background:'linear-gradient(135deg,#10B981,#059669)', padding:'20px 16px', textAlign:'center', borderBottom:'2px solid #047857' }}>
          <div style={{ fontSize:'2rem', marginBottom:8 }}>🎉</div>
          <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.2rem', fontWeight:800, color:'white', marginBottom:4 }}>Family Win!</div>
          <div style={{ fontSize:'.82rem', color:'rgba(255,255,255,.9)', fontWeight:500 }}>All children completed today's devotional. Celebrate together! 🙏</div>
        </div>
      )}

      {/* ══ MISSED DEVOTIONAL REMINDER ════════════════════════════════════════ */}
      {missedDevotionalReminder && (
        <div style={{ background:'linear-gradient(135deg,#F59E0B,#D97706)', padding:'16px 16px', marginTop:0, textAlign:'center', borderBottom:'2px solid #B45309' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <div style={{ fontSize:'1.5rem' }}>⏰</div>
            <div>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'.95rem', fontWeight:800, color:'white' }}>Gentle Reminder</div>
              <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,.9)', fontWeight:500 }}>{child.display_name} hasn't completed devotional for 3+ days</div>
            </div>
          </div>
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div style={{ background:'linear-gradient(160deg,#0F0F1A 0%,#1E1B4B 55%,#0A1A14 100%)', paddingTop:'clamp(44px,8vw,64px)', paddingBottom:32, textAlign:'center', position:'relative', overflow:'hidden' }}>
        {/* Background glow */}
        <div style={{ position:'absolute', top:-80, left:'18%', width:320, height:320, borderRadius:'50%', background:`radial-gradient(circle,${currentAvatar.color}14,transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:10, right:'14%', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,.1),transparent 70%)', pointerEvents:'none' }} />

        {/* Avatar */}
        <div style={{ position:'relative', display:'inline-block', marginBottom:14 }}>
          <div style={{ width:'clamp(88px,14vw,108px)', height:'clamp(88px,14vw,108px)', borderRadius:'50%', background:`linear-gradient(135deg,${currentAvatar.color}44,${currentAvatar.color}11)`, border:`3px solid ${currentAvatar.color}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(2.8rem,5.5vw,3.6rem)', boxShadow:`0 0 0 6px ${currentAvatar.color}16,0 12px 40px rgba(0,0,0,.4)`, margin:'0 auto', transition:'all .3s' }}>
            {currentAvatar.emoji}
          </div>
          {streak >= 7 && <div style={{ position:'absolute', top:-4, right:-4, background:'linear-gradient(135deg,#F97316,#EF4444)', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.58rem', fontWeight:800, color:'white', border:'2px solid var(--bg)' }}>{streak}</div>}
        </div>

        {/* Name */}
        <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(1.5rem,4.5vw,2rem)', fontWeight:800, color:'white', marginBottom:3, letterSpacing:'-.4px' }}>{child.display_name}</div>
        <div style={{ fontSize:'.82rem', color:'rgba(255,255,255,.45)', fontWeight:500, marginBottom:3 }}>{currentAvatar.name} · {currentAvatar.desc}</div>
        {child.age && <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.22)', fontWeight:500, marginBottom:14 }}>Age {child.age}</div>}

        {/* Stat pills */}
        <div style={{ display:'flex', gap:7, justifyContent:'center', flexWrap:'wrap', padding:'0 16px', marginBottom:14 }}>
          {[['🔥',streak,'streak'],['🏆',badgesEarned,'badges'],['📝',quizzesCompleted,'quizzes'],['🎯',quizAccuracy+'%','accuracy']].map(([e,v,l])=>(
            <div key={l} style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:100, padding:'5px 12px', display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:'.82rem' }}>{e}</span>
              <span style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:'white', fontSize:'.82rem' }}>{v}</span>
              <span style={{ fontSize:'.6rem', color:'rgba(255,255,255,.3)', fontWeight:600 }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', justifyContent:'center', gap:0, marginTop:18, overflowX:'auto', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
          {[['overview','📊 Overview'],['activity','⚡ Activity'],['progress','📋 Progress'],['controls','🛡️ Controls']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ flexShrink:0, background:'none', border:'none', cursor:'pointer', color:tab===id?'white':'rgba(255,255,255,.38)', fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'.82rem', padding:'12px 18px', borderBottom:tab===id?'3px solid var(--blue)':'3px solid transparent', transition:'all .2s' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ══ TAB CONTENT ═══════════════════════════════════════════════════════ */}
      <div style={{ maxWidth:820, margin:'0 auto', padding:'clamp(20px,5vw,32px) 16px' }}>

        {/* ─ OVERVIEW ────────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* 7-Day Stats */}
            <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:24, boxShadow:'var(--sh)' }}>
              <div style={{ fontSize:'.68rem', fontWeight:800, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>📊 Last 7 Days</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
                {stats7d && stats7d.length > 0 ? (
                  stats7d.map((stat, i) => (
                    <div key={i} style={{ background:'var(--bg2)', borderRadius:16, padding:16, textAlign:'center' }}>
                      <div style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:600, marginBottom:8, textTransform:'uppercase' }}>{stat.activity_type}</div>
                      <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.8rem', fontWeight:800, color:'var(--blue)', marginBottom:4 }}>{stat.count}</div>
                      <div style={{ fontSize:'.65rem', color:'var(--ink3)', fontWeight:500 }}>{stat.total_duration || 0} min</div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn:'1/-1', textAlign:'center', padding:20, color:'var(--ink3)', fontSize:'.82rem', fontWeight:500 }}>No activity yet this week</div>
                )}
              </div>
            </div>

            {/* 30-Day Stats */}
            <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:24, boxShadow:'var(--sh)' }}>
              <div style={{ fontSize:'.68rem', fontWeight:800, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>📈 Last 30 Days</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
                {stats30d && stats30d.length > 0 ? (
                  stats30d.map((stat, i) => (
                    <div key={i} style={{ background:'var(--bg2)', borderRadius:16, padding:16, textAlign:'center' }}>
                      <div style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:600, marginBottom:8, textTransform:'uppercase' }}>{stat.activity_type}</div>
                      <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.8rem', fontWeight:800, color:'var(--green)', marginBottom:4 }}>{stat.count}</div>
                      <div style={{ fontSize:'.65rem', color:'var(--ink3)', fontWeight:500 }}>{stat.total_duration || 0} min</div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn:'1/-1', textAlign:'center', padding:20, color:'var(--ink3)', fontSize:'.82rem', fontWeight:500 }}>No activity yet this month</div>
                )}
              </div>
            </div>

            {/* Sticker Wall */}
            <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:24, boxShadow:'var(--sh)' }}>
              <div style={{ fontSize:'.68rem', fontWeight:800, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>🌟 Sticker Wall</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(70px, 1fr))', gap:10 }}>
                {STICKERS.map(s => {
                  const earned = stickers.has(s.id)
                  return (
                    <div key={s.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', opacity: earned ? 1 : 0.3, filter: earned ? 'none' : 'grayscale(1)' }}>
                      <div style={{ width:54, height:54, borderRadius:'50%', background: earned ? `${s.color}22` : 'var(--bg2)', border: earned ? `2px solid ${s.color}` : '2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', marginBottom:4 }}>
                        {earned ? s.emoji : '🔒'}
                      </div>
                      <div style={{ fontSize:'.55rem', fontWeight:700, textAlign:'center', lineHeight:1.1, color:earned ? 'var(--ink)' : 'var(--ink3)' }}>{s.name}</div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}

        {/* ─ ACTIVITY ────────────────────────────────────────────────────────── */}
        {tab === 'activity' && (
          <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:24, boxShadow:'var(--sh)' }}>
            <div style={{ fontSize:'.68rem', fontWeight:800, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>⚡ Recent Activity</div>
            {activities && activities.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {activities.map((activity, i) => (
                  <div key={i} style={{ background:'var(--bg2)', borderRadius:16, padding:16, display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ fontSize:'1.5rem' }}>
                      {activity.activity_type === 'quiz' ? '📝' : activity.activity_type === 'reading' ? '📖' : '⚡'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'.82rem', fontWeight:700, color:'var(--ink)', textTransform:'capitalize', marginBottom:4 }}>{activity.activity_type}</div>
                      <div style={{ fontSize:'.7rem', color:'var(--ink3)', fontWeight:500 }}>
                        {new Date(activity.completed_at).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                    {activity.score && <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.2rem', fontWeight:800, color:'var(--blue)' }}>{activity.score}%</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:32, color:'var(--ink3)', fontSize:'.82rem', fontWeight:500 }}>No recent activity</div>
            )}
          </div>
        )}

        {/* ─ PROGRESS ────────────────────────────────────────────────────────── */}
        {tab === 'progress' && (
          <ProgressReport childId={childId} childName={child.display_name} />
        )}

        {/* ─ CONTROLS ────────────────────────────────────────────────────────── */}
        {tab === 'controls' && (
          <div>
            <ParentalControlsPanel />
          </div>
        )}

      </div>

    </div>
  )
}
