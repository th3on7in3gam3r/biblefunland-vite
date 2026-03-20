import { useState, useEffect, useContext, createContext } from 'react'
import { useAuth } from '../context/AuthContext'
import { useKidsMode } from './KidsModeContext'
import * as db from '../lib/db'

const ChildSwitcherContext = createContext(null)

export function ChildSwitcherProvider({ children }) {
  const { user, profile } = useAuth()
  const { kidsMode, enableKidsMode } = useKidsMode()
  const [childProfiles, setChildProfiles] = useState([])
  const [activeChild, setActiveChild] = useState(null)
  const [isChildSession, setIsChildSession] = useState(false)
  const [showSwitcher, setShowSwitcher] = useState(false)

  // Load children when parent logs in
  useEffect(() => {
    if (user?.id && profile?.role !== 'Child') {
      db.getChildProfiles(user.id).then(({ data }) => {
        setChildProfiles(data || [])
      }).catch((error) => {
        console.warn('Could not load child profiles:', error.message)
        setChildProfiles([]) // Set empty array on error
      })
    }
  }, [user?.id, profile?.role])

  // Switch to child session
  const switchToChild = (child) => {
    setActiveChild(child)
    setIsChildSession(true)
    enableKidsMode()
    setShowSwitcher(false)
    
    // Track session start
    db.addChildActivity(child.id, 'session_start', {
      parent_id: user.id,
      session_type: 'child_switch'
    }).catch((error) => {
      console.warn('Could not track child activity:', error.message)
    })
  }

  // Exit child session
  const exitChildSession = () => {
    if (activeChild) {
      // Track session end
      db.addChildActivity(activeChild.id, 'session_end', {
        parent_id: user.id,
        session_type: 'child_switch'
      }).catch((error) => {
        console.warn('Could not track child activity:', error.message)
      })
    }
    
    setActiveChild(null)
    setIsChildSession(false)
    setShowSwitcher(false)
  }

  return (
    <ChildSwitcherContext.Provider value={{
      childProfiles,
      activeChild,
      isChildSession,
      showSwitcher,
      setShowSwitcher,
      switchToChild,
      exitChildSession
    }}>
      {children}
      {showSwitcher && (
        <ChildSwitcherModal
          onClose={() => setShowSwitcher(false)}
          onSwitchChild={switchToChild}
          onExitSession={exitChildSession}
          children={childProfiles}
          activeChild={activeChild}
          isChildSession={isChildSession}
        />
      )}
    </ChildSwitcherContext.Provider>
  )
}

export const useChildSwitcher = () => {
  const ctx = useContext(ChildSwitcherContext)
  if (!ctx) throw new Error('useChildSwitcher must be inside ChildSwitcherProvider')
  return ctx
}

// ── Child Switcher Modal ──────────────────────────────────────────────────
function ChildSwitcherModal({ onClose, onSwitchChild, onExitSession, children, activeChild, isChildSession }) {
  const { profile } = useAuth()

  if (!['Parent', 'Teacher'].includes(profile?.role)) return null

  return (
    <div style={{ 
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1500,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 
    }}>
      <div style={{ 
        background: 'var(--surface)', borderRadius: 24, padding: 32, 
        maxWidth: 500, width: '100%', fontFamily: 'Poppins,sans-serif',
        boxShadow: '0 40px 100px rgba(0,0,0,.4)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
            👨‍👩‍👧‍👦 {isChildSession ? 'Child Session Active' : 'Select Child'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--ink3)' }}>✕</button>
        </div>

        {isChildSession && activeChild ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>
              {activeChild.avatar_url === 'david' ? '👑' : 
               activeChild.avatar_url === 'esther' ? '👸' :
               activeChild.avatar_url === 'moses' ? '🏔️' : '👤'}
            </div>
            <h4 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 8 }}>
              {activeChild.display_name}
            </h4>
            <p style={{ color: 'var(--ink3)', fontSize: '.9rem', marginBottom: 24 }}>
              Currently viewing as {activeChild.display_name}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={onExitSession}
                className="btn btn-red"
                style={{ flex: 1 }}
              >
                🚪 Exit Child Session
              </button>
              <button 
                onClick={onClose}
                className="btn btn-blue"
                style={{ flex: 1 }}
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div>
            {children.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: 16 }}>👶</div>
                <p style={{ color: 'var(--ink3)', marginBottom: 20 }}>
                  No child profiles yet. Add children in your Profile settings.
                </p>
                <button onClick={onClose} className="btn btn-blue">
                  Go to Profile
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => onSwitchChild(child)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16, padding: 16,
                      border: '2px solid var(--border)', borderRadius: 16,
                      background: 'var(--bg2)', cursor: 'pointer',
                      transition: 'all .2s', textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ fontSize: '2.5rem' }}>
                      {child.avatar_url === 'david' ? '👑' : 
                       child.avatar_url === 'esther' ? '👸' :
                       child.avatar_url === 'moses' ? '🏔️' :
                       child.avatar_url === 'mary' ? '🌸' : '👤'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>
                        {child.display_name}
                      </div>
                      <div style={{ fontSize: '.8rem', color: 'var(--ink3)' }}>
                        Age {child.age || '?'} • 🔥 {child.streak || 0} day streak
                      </div>
                    </div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--blue)' }}>→</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Child Switcher Button (for Nav) ─────────────────────────────────────────
export function ChildSwitcherButton() {
  const { profile } = useAuth()
  const { activeChild, isChildSession, showSwitcher, setShowSwitcher } = useChildSwitcher()

  if (!['Parent', 'Teacher'].includes(profile?.role)) return null

  return (
    <button
      onClick={() => setShowSwitcher(true)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 100,
        border: `2px solid ${isChildSession ? '#10B981' : 'var(--border)'}`,
        background: isChildSession ? 'rgba(16,185,129,.15)' : 'var(--surface)',
        color: isChildSession ? '#10B981' : 'var(--ink)',
        cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
        fontSize: '.8rem', fontWeight: 700, transition: 'all .2s',
      }}
    >
      {isChildSession && activeChild ? (
        <>
          <span style={{ fontSize: '1.2rem' }}>
            {activeChild.avatar_url === 'david' ? '👑' : 
             activeChild.avatar_url === 'esther' ? '👸' :
             activeChild.avatar_url === 'moses' ? '🏔️' : '👤'}
          </span>
          <span>{activeChild.display_name}</span>
          <span style={{ fontSize: '.7rem', opacity: 0.7 }}>🔄</span>
        </>
      ) : (
        <>
          <span>👨‍👩‍👧‍👦</span>
          <span>Switch Child</span>
        </>
      )}
    </button>
  )
}
