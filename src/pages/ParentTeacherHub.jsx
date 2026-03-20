import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useParentalControls } from '../context/ParentalControlsContext'
import { useEmailDigest } from '../context/EmailDigestContext'
import { Link } from 'react-router-dom'
import * as db from '../lib/db'

const AI_FEATURES = [
  { id: 'trivia', name: 'Scripture Trivia', icon: '🎮' },
  { id: 'rap', name: 'Bible Rap Generator', icon: '🎤' },
  { id: 'art', name: 'Miracle Art AI', icon: '🎨' },
  { id: 'prayer', name: 'AI Prayer Companion', icon: '🙏' },
  { id: 'study', name: 'Bible Study Generator', icon: '📚' },
]

export default function ParentTeacherHub() {
  const { user, profile } = useAuth()
  const { controls, updateControls } = useParentalControls()
  const { sendWeeklyDigest } = useEmailDigest()
  const [activeTab, setActiveTab] = useState(profile?.role === 'Teacher' ? 'teacher' : 'parent')
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)

  useEffect(() => {
    loadResources()
  }, [activeTab])

  const loadResources = async () => {
    setLoading(true)
    try {
      // Generate AI-powered content based on role
      if (activeTab === 'teacher') {
        const teacherResources = await generateTeacherResources()
        setResources(teacherResources)
      } else if (activeTab === 'parent') {
        const parentResources = await generateParentResources()
        setResources(parentResources)
      }
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTeacherResources = async () => {
    // AI-generated lesson plans and resources for teachers
    return [
      {
        id: 'lesson-1',
        title: 'Fruit of the Spirit: Love',
        type: 'Lesson Plan',
        grade: 'K-2',
        icon: '🍎',
        description: 'Interactive lesson on God\'s love with activities and crafts',
        duration: '45 minutes',
        bibleVerse: 'Galatians 5:22-23',
        materials: ['Construction paper', 'Markers', 'Heart stickers', 'Bible'],
        aiGenerated: true,
        downloadUrl: '/api/download/lesson/fruit-love-k2'
      },
      {
        id: 'lesson-2',
        title: 'David and Goliath: Faith',
        type: 'Lesson Plan',
        grade: '3-5',
        icon: '🏹',
        description: 'Teaching faith through David\'s courage with interactive storytelling',
        duration: '60 minutes',
        bibleVerse: '1 Samuel 17',
        materials: ['Slingshot craft', 'Story cards', 'Discussion questions'],
        aiGenerated: true,
        downloadUrl: '/api/download/lesson/david-goliath-3-5'
      },
      {
        id: 'activity-1',
        title: 'Armor of God Craft',
        type: 'Activity',
        grade: 'All',
        icon: '🛡️',
        description: 'Hands-on craft to help children remember spiritual armor',
        duration: '30 minutes',
        bibleVerse: 'Ephesians 6:10-18',
        materials: ['Foam sheets', 'Elastic string', 'Markers', 'Scissors'],
        aiGenerated: true,
        downloadUrl: '/api/download/activity/armor-of-god'
      }
    ]
  }

  const generateParentResources = async () => {
    // AI-generated resources for parents
    return [
      {
        id: 'devotional-1',
        title: 'Family Prayer Time Guide',
        type: 'Devotional',
        age: 'All',
        icon: '🕯️',
        description: 'Structured guide for meaningful family prayer time',
        duration: '15 minutes daily',
        bibleVerse: 'Philippians 4:6',
        includes: ['Prayer prompts', 'Gratitude list', 'Praise ideas'],
        aiGenerated: true,
        downloadUrl: '/api/download/devotional/family-prayer'
      },
      {
        id: 'story-1',
        title: 'Bedtime Bible Stories: Courage',
        type: 'Stories',
        age: '4-8',
        icon: '🌙',
        description: 'Age-appropriate stories about biblical heroes showing courage',
        duration: '10 minutes',
        bibleVerse: 'Joshua 1:9',
        includes: ['3 stories', 'Discussion questions', 'Prayer'],
        aiGenerated: true,
        downloadUrl: '/api/download/stories/bedtime-courage'
      },
      {
        id: 'guide-1',
        title: 'Digital Faith Parenting',
        type: 'Guide',
        age: 'Parents',
        icon: '📱',
        description: 'Balancing screen time with spiritual growth in the digital age',
        duration: 'Read time: 20 minutes',
        bibleVerse: 'Proverbs 22:6',
        includes: ['Tips', 'App recommendations', 'Screen time schedule'],
        aiGenerated: true,
        downloadUrl: '/api/download/guide/digital-parenting'
      },
      {
        id: 'activity-1',
        title: 'Scripture Memory Cards Set',
        type: 'Activity',
        age: '6-12',
        icon: '🎴',
        description: 'Printable cards with verses and illustrations for memorization',
        duration: '5 minutes daily',
        bibleVerse: 'Various',
        includes: ['12 printable cards', 'Memory tips', 'Progress tracker'],
        aiGenerated: true,
        downloadUrl: '/api/download/activity/memory-cards'
      }
    ]
  }

  const toggleAI = (featureId) => {
    const current = controls.ai_toggles[featureId]
    updateControls({ ai_toggles: { ...controls.ai_toggles, [featureId]: current === false ? true : false } })
  }

  const sendTestDigest = async () => {
    if (!user?.email) return
    
    try {
      await sendWeeklyDigest(user.id, user.email)
      alert('✅ Weekly digest sent to your email!')
    } catch (error) {
      alert('❌ Failed to send digest. Please try again.')
    }
  }

  const createPlan = async () => {
    const title = document.getElementById('plan-title').value
    const days = parseInt(document.getElementById('plan-days').value)
    if (title && user?.id) {
      await db.upsertFamilyPlan(user.id, { title, total_days: days })
      window.location.reload()
    }
  }

  const tabStyle = (active, color) => ({
    padding: '12px 20px',
    borderRadius: 16,
    border: 'none',
    background: active ? color : 'transparent',
    color: active ? 'white' : 'var(--ink3)',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all .2s',
    fontSize: '.9rem'
  })

  const resourceCardStyle = (isTeacher) => ({
    background: 'var(--surface)',
    borderRadius: 20,
    border: '2px solid var(--border)',
    padding: 24,
    boxShadow: 'var(--sh)',
    transition: 'all .3s',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  })

  const iconBoxStyle = (isTeacher) => ({
    width: 60, height: 60, borderRadius: 16,
    background: isTeacher ? 'linear-gradient(135deg, #A855F7, #7C3AED)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem', marginBottom: 16
  })

  const badgeStyle = (isTeacher) => ({
    position: 'absolute', top: 16, right: 16,
    background: isTeacher ? '#A855F7' : '#3B82F6',
    color: 'white', padding: '4px 12px', borderRadius: 100,
    fontSize: '.7rem', fontWeight: 700
  })

  const titleStyle = {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '1.1rem', fontWeight: 800,
    color: 'var(--ink)', marginBottom: 8, lineHeight: 1.3
  }

  const footerStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '.8rem', color: 'var(--ink3)'
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', 
        padding: '72px 24px 48px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'50%', height:'150%', background:'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter:'blur(60px)', animation:'float 20s infinite alternate' }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'50%', height:'150%', background:'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter:'blur(60px)', animation:'float 15s infinite alternate-reverse' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontFamily: "'Baloo 2', cursive", 
            fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
            fontWeight: 800, 
            background: 'linear-gradient(90deg, #60A5FA, #A855F7, #f472b6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginBottom: 12
          }}>
            Parents & Teachers Hub 🏫
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', fontWeight: 500, maxWidth: 600, margin: '0 auto' }}>
            AI-powered resources to help you lead the next generation in faith.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Tab Switcher */}
        <div style={{ 
          display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40, background: 'var(--surface)', padding: 8, borderRadius: 20, border: '1.5px solid var(--border)', width: 'fit-content', margin: '0 auto 40px', flexWrap: 'wrap'
        }}>
          <button onClick={() => setActiveTab('parent')} style={tabStyle(activeTab === 'parent', 'var(--blue)')}>👨‍👩‍👧 Parents</button>
          <button onClick={() => setActiveTab('teacher')} style={tabStyle(activeTab === 'teacher', 'var(--violet)')}>🏫 Teachers</button>
          <button onClick={() => setActiveTab('family')} style={tabStyle(activeTab === 'family', 'var(--green)')}>📖 Family Plans</button>
          <button onClick={() => setActiveTab('controls')} style={tabStyle(activeTab === 'controls', 'var(--red)')}>🛡️ Controls</button>
          <button onClick={() => setActiveTab('digest')} style={tabStyle(activeTab === 'digest', 'var(--yellow)')}>📊 Email Digest</button>
        </div>

        {/* Content */}
        {activeTab === 'family' ? (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
             <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:28, boxShadow:'var(--sh)', marginBottom:32 }}>
                <h3 style={{ fontFamily:"'Baloo 2', cursive", fontSize:'1.3rem', fontWeight:800, color:'var(--ink)', marginBottom:20 }}>📖 Create Family Devotional Plan</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:12, flexWrap:'wrap' }}>
                  <input className="input-field" placeholder="Plan Title" style={{ fontSize:'.9rem' }} id="plan-title" />
                  <input className="input-field" type="number" placeholder="Days" style={{ fontSize:'.9rem' }} id="plan-days" defaultValue="7" />
                  <button className="btn btn-green" onClick={createPlan}>Create Plan</button>
                </div>
             </div>
             <FamilyPlansList parentId={user?.id} />
          </div>
        ) : activeTab === 'controls' ? (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:28, boxShadow:'var(--sh)' }}>
                <h3 style={{ fontFamily:"'Baloo 2', cursive", fontSize:'1.3rem', fontWeight:800, color:'var(--ink)', marginBottom:20 }}>🤖 AI Toggles</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {AI_FEATURES.map(f => (
                    <div key={f.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--bg2)', borderRadius:16, border:'1.5px solid var(--border)' }}>
                      <span style={{ fontSize:'.9rem', fontWeight:700 }}>{f.icon} {f.name}</span>
                      <button onClick={() => toggleAI(f.id)} style={toggleStyle(controls.ai_toggles[f.id] !== false)}>
                        <div style={thumbStyle(controls.ai_toggles[f.id] !== false)} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:28, boxShadow:'var(--sh)' }}>
                <h3 style={{ fontFamily:"'Baloo 2', cursive", fontSize:'1.3rem', fontWeight:800, color:'var(--ink)', marginBottom:20 }}>⏳ Time Limits</h3>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <input type="number" className="input-field" value={controls.daily_limit} onChange={e => updateControls({ daily_limit: parseInt(e.target.value) || 0 })} style={{ width:80, textAlign:'center' }} />
                  <span style={{ fontWeight:700 }}>minutes / day</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'digest' ? (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:32, boxShadow:'var(--sh)', textAlign:'center' }}>
              <div style={{ fontSize:'4rem', marginBottom:20 }}>📧</div>
              <h3 style={{ fontFamily:"'Baloo 2', cursive", fontSize:'1.5rem', fontWeight:800, color:'var(--ink)', marginBottom:16 }}>Weekly Email Digest</h3>
              <p style={{ color:'var(--ink3)', fontSize:'1rem', marginBottom:24, lineHeight:1.6 }}>
                Get a comprehensive weekly summary of your children's activities, progress, and achievements delivered straight to your inbox.
              </p>
              <div style={{ background:'var(--bg2)', borderRadius:16, padding:20, marginBottom:24, textAlign:'left' }}>
                <h4 style={{ fontWeight:700, color:'var(--ink)', marginBottom:12 }}>📊 What's included:</h4>
                <ul style={{ margin:0, paddingLeft:20, color:'var(--ink2)', lineHeight:1.8 }}>
                  <li>Activity summary and time spent</li>
                  <li>New badges and achievements</li>
                  <li>Scripture memory progress</li>
                  <li>Reading streak updates</li>
                  <li>Favorite activities and insights</li>
                </ul>
              </div>
              <button className="btn btn-blue btn-lg" onClick={sendTestDigest}>
                📧 Send Test Digest Now
              </button>
              <p style={{ fontSize:'.8rem', color:'var(--ink3)', marginTop:12 }}>
                Test digest will be sent to: {user?.email}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* AI Content Generator */}
            <div style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:24, marginBottom:32, boxShadow:'var(--sh)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <h3 style={{ fontFamily:"'Baloo 2', cursive", fontSize:'1.3rem', fontWeight:800, color:'var(--ink)' }}>
                  🤖 AI Content Generator
                </h3>
                <button 
                  className="btn btn-purple"
                  onClick={() => setShowGenerator(!showGenerator)}
                >
                  {showGenerator ? 'Hide' : 'Show'} Generator
                </button>
              </div>
              
              {showGenerator && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16 }}>
                  <input className="input-field" placeholder="Topic (e.g., Love, Faith)" id="ai-topic" />
                  <select className="input-field" id="ai-type">
                    <option value="">Select Type</option>
                    <option value="lesson-plan">Lesson Plan</option>
                    <option value="activity">Activity</option>
                    <option value="devotional">Devotional</option>
                    <option value="story">Story</option>
                  </select>
                  <select className="input-field" id="ai-age">
                    <option value="">Age Group</option>
                    <option value="3-5">Ages 3-5</option>
                    <option value="6-8">Ages 6-8</option>
                    <option value="9-12">Ages 9-12</option>
                    <option value="all">All Ages</option>
                  </select>
                  <button 
                    className="btn btn-green"
                    disabled={loading}
                  >
                    {loading ? '⏳ Generating...' : '🎨 Generate'}
                  </button>
                </div>
              )}
            </div>

            {/* Resources Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 20 }}>⏳</div>
                <p style={{ color: 'var(--ink3)' }}>Loading AI-generated resources...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {resources.map((item) => (
                  <div key={item.id} style={resourceCardStyle(activeTab === 'teacher')}>
                    {item.aiGenerated && (
                      <div style={{ position: 'absolute', top: 12, left: 12, background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', padding: '4px 8px', borderRadius: 8, fontSize: '.65rem', fontWeight: 700 }}>
                        ✨ AI Generated
                      </div>
                    )}
                    <div style={iconBoxStyle(activeTab === 'teacher')}>{item.icon}</div>
                    <div style={badgeStyle(activeTab === 'teacher')}>{item.type}</div>
                    <h3 style={titleStyle}>{item.title}</h3>
                    <p style={{ color: 'var(--ink2)', fontSize: '.9rem', marginBottom: 16, lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                    {item.duration && (
                      <div style={{ fontSize: '.8rem', color: 'var(--ink3)', marginBottom: 12 }}>
                        ⏱️ {item.duration}
                      </div>
                    )}
                    {item.bibleVerse && (
                      <div style={{ fontSize: '.8rem', color: 'var(--blue)', fontStyle: 'italic', marginBottom: 12 }}>
                        📖 {item.bibleVerse}
                      </div>
                    )}
                    <div style={footerStyle}>
                      <span>{item.grade ? `Grade: ${item.grade}` : `Age: ${item.age}`}</span>
                      {item.downloadUrl ? (
                        <a href={item.downloadUrl} className="btn btn-blue btn-sm" style={{ textDecoration: 'none' }}>
                          Download
                        </a>
                      ) : (
                        <span>View →</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {(activeTab === 'parent' || activeTab === 'teacher') && (
           <div style={{ marginTop: 64, padding: 40, borderRadius: 32, background: activeTab === 'teacher' ? 'var(--purple-bg)' : 'var(--blue-bg)', textAlign: 'center', border: '1.5px solid rgba(255,255,255,0.05)' }}>
             <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>Need something specific? 💡</h2>
             <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
               <Link to="/ai/study-generator" className="btn btn-blue">AI Study Generator →</Link>
               <Link to="/sermon-writer" className="btn btn-purple">AI Sermon Writer →</Link>
             </div>
           </div>
        )}
      </div>

      <style>{`
        @keyframes float { from { transform: translate(0,0); } to { transform: translate(20px, 40px); } }
        .resource-card:hover h3 { color: var(--blue); }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  )
}

function FamilyPlansList({ parentId }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])

  useEffect(() => {
    if (!parentId) return
    Promise.all([db.getFamilyPlans(parentId), db.getChildProfiles(parentId)]).then(([{ data: p }, { data: c }]) => {
      setPlans(p || []); setChildren(c || []); setLoading(false)
    })
  }, [parentId])

  if (loading) return <div style={{ color:'var(--ink3)' }}>Loading family journeys...</div>
  if (plans.length === 0) return <div style={{ textAlign:'center', padding:40, background:'var(--surface)', borderRadius:24, border:'1.5px dashed var(--border)' }}>No active family plans.</div>

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {plans.map(plan => (
        <div key={plan.id} style={{ background:'var(--surface)', borderRadius:24, border:'1.5px solid var(--border)', padding:24, boxShadow:'var(--sh)' }}>
          <h4 style={{ fontFamily:"'Baloo 2', cursive", fontSize:'1.2rem', fontWeight:800, color:'var(--ink)', marginBottom:16 }}>{plan.title}</h4>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {children.map(child => (
               <div key={child.id} style={{ background:'var(--bg2)', padding:'12px 16px', borderRadius:16, border:'1.5px solid var(--border)', flex:'1 1 200px' }}>
                  <div style={{ fontWeight:800, marginBottom:8 }}>{child.display_name}</div>
                  <div style={{ height:8, background:'var(--bg3)', borderRadius:100, overflow:'hidden', marginBottom:6 }}>
                    <div style={{ width:`${(child.streak / plan.total_days) * 100}%`, height:'100%', background:'var(--green)' }} />
                  </div>
                  <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--ink3)' }}>{child.streak} / {plan.total_days} days</div>
               </div>
            ))}
          </div>
          <div style={{ marginTop:20, padding:12, background:'var(--green-bg)', borderRadius:12, textAlign:'center', color:'var(--green)', fontWeight:800, fontSize:'.85rem' }}>🏆 Family Win Celebration Ready!</div>
        </div>
      ))}
    </div>
  )
}

// Helpers
const tabStyle = (active, color) => ({ padding: '10px 20px', borderRadius: 14, border: 'none', background: active ? color : 'transparent', color: active ? 'white' : 'var(--ink3)', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', transition: 'all 0.3s' })
const toggleStyle = (on) => ({ width:52, height:28, borderRadius:100, border:'none', background: on ? 'var(--green)' : 'var(--bg3)', position:'relative', cursor:'pointer', transition:'all .3s' })
const thumbStyle = (on) => ({ width:20, height:20, borderRadius:'50%', background:'white', position:'absolute', top:4, left: on ? 28 : 4, transition:'all .3s' })
const resourceCardStyle = (teacher) => ({ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', padding: 24, transition: 'all 0.3s', cursor: 'pointer', position: 'relative', overflow: 'hidden' })
const iconBoxStyle = (teacher) => ({ width: 60, height: 60, borderRadius: 18, background: teacher ? 'var(--purple-bg)' : 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 20 })
const badgeStyle = (teacher) => ({ fontSize: '.75rem', fontWeight: 800, color: teacher ? 'var(--purple)' : 'var(--blue)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 })
const titleStyle = { fontFamily: "'Baloo 2', cursive", fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.3 }
const footerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', fontSize: '.8rem', fontWeight: 600, color: 'var(--ink3)' }
