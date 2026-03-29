import { useState } from 'react'
import { useParentalControls } from '../context/ParentalControlsContext'
import { useAuth } from '../context/AuthContext'

export default function ParentalControlsPanel() {
  const { user } = useAuth()
  const { controls, updateControls } = useParentalControls()

  // Local form state
  const [formData, setFormData] = useState({
    ai_toggles: controls.ai_toggles || {},
    daily_limit: controls.daily_limit || 0,
    new_pin: ''
  })

  // Modal state
  const [showPinModal, setShowPinModal] = useState(false)
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [pinShake, setPinShake] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Show/hide toggle for PIN field
  const [showNewPin, setShowNewPin] = useState(false)

  const handleToggle = (featureId) => {
    setFormData(prev => ({
      ...prev,
      ai_toggles: {
        ...prev.ai_toggles,
        [featureId]: !prev.ai_toggles[featureId]
      }
    }))
  }

  const handleLimitChange = (e) => {
    const val = parseInt(e.target.value)
    setFormData(prev => ({ ...prev, daily_limit: val }))
  }

  const handlePinChange = (e) => {
    setFormData(prev => ({ ...prev, new_pin: e.target.value }))
  }

  const handleSave = () => {
    // Validate daily_limit
    const validLimits = [0, 15, 30, 45, 60]
    if (!validLimits.includes(formData.daily_limit)) {
      setSaveError('Daily limit must be 0, 15, 30, 45, or 60 minutes')
      return
    }

    // Open PIN confirmation modal
    setConfirmPin('')
    setPinError(false)
    setShowPinModal(true)
  }

  const handleConfirmPin = async () => {
    if (!user?.id) return

    setSaving(true)
    setSaveError(null)

    try {
      const payload = {
        pin: confirmPin,
        ai_toggles: formData.ai_toggles,
        daily_limit: formData.daily_limit
      }

      // If new PIN is provided, include it
      if (formData.new_pin) {
        payload.new_pin = formData.new_pin
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parental-controls/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'invalid_pin') {
          setPinError(true)
          setPinShake(true)
          setConfirmPin('')
          setTimeout(() => {
            setPinShake(false)
            setPinError(false)
          }, 600)
          setSaving(false)
          return
        }
        throw new Error(err.error || 'Failed to save controls')
      }

      // Update context
      await updateControls({
        ai_toggles: formData.ai_toggles,
        daily_limit: formData.daily_limit,
        parent_pin: formData.new_pin || controls.parent_pin
      })

      // Close modal and reset
      setShowPinModal(false)
      setConfirmPin('')
      setFormData(prev => ({ ...prev, new_pin: '' }))
      setShowNewPin(false)
    } catch (err) {
      setSaveError(err.message || 'Failed to save parental controls')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', padding: 24, boxShadow: 'var(--sh)' }}>
      <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>🛡️ Parental Controls</div>

      {/* Default PIN Warning */}
      {controls.parent_pin === '4318' && (
        <div style={{ background: 'rgba(245,158,11,.1)', border: '1.5px solid rgba(245,158,11,.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'start', gap: 10 }}>
          <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</div>
          <div>
            <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#F59E0B', marginBottom: 4 }}>Using Default PIN</div>
            <div style={{ fontSize: '.75rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.5 }}>
              You're currently using the default PIN (4318). For better security, please set a custom PIN below.
            </div>
          </div>
        </div>
      )}

      {/* AI Feature Toggles */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>AI Features</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'bible_character_chat', label: '💬 Bible Character Chat', desc: 'Chat with biblical characters' },
            { id: 'ai_prayer_companion', label: '🙏 AI Prayer Companion', desc: 'AI-powered prayer guidance' }
          ].map(feature => (
            <div key={feature.id} onClick={() => handleToggle(feature.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', transition: 'all .2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid var(--border)', background: formData.ai_toggles[feature.id] ? 'var(--blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}>
                {formData.ai_toggles[feature.id] && <span style={{ color: 'white', fontSize: '.8rem', fontWeight: 800 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)' }}>{feature.label}</div>
                <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}>{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Time Limit */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>⏱️ Daily Time Limit</label>
        <select value={formData.daily_limit} onChange={handleLimitChange} style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg2)', color: 'var(--ink)', fontFamily: 'Poppins,sans-serif', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' }}>
          <option value={0}>No limit</option>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>60 minutes</option>
        </select>
        <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500, marginTop: 6 }}>Set a daily screen time limit for this child</div>
      </div>

      {/* PIN Change Field */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>🔐 Change Parent PIN (Optional)</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type={showNewPin ? 'text' : 'password'}
            placeholder="Leave blank to keep current PIN"
            value={formData.new_pin}
            onChange={handlePinChange}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg2)', color: 'var(--ink)', fontFamily: 'Poppins,sans-serif', fontSize: '.82rem', fontWeight: 600 }}
          />
          <button
            onClick={() => setShowNewPin(!showNewPin)}
            style={{ padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg2)', color: 'var(--ink3)', fontFamily: 'Poppins,sans-serif', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink3)'}
          >
            {showNewPin ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500, marginTop: 6 }}>4-digit PIN required for sensitive actions</div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '11px 20px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--blue)',
            color: 'white',
            fontFamily: 'Poppins,sans-serif',
            fontSize: '.82rem',
            fontWeight: 700,
            cursor: saving ? 'default' : 'pointer',
            transition: 'all .2s',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? '⏳ Saving...' : '💾 Save Controls'}
        </button>
        {saveError && <div style={{ fontSize: '.76rem', color: 'var(--red)', fontWeight: 600 }}>⚠️ {saveError}</div>}
      </div>

      {/* PIN Confirmation Modal */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 24, padding: '36px 32px', maxWidth: 360, width: '100%', textAlign: 'center', fontFamily: 'Poppins,sans-serif', boxShadow: '0 40px 100px rgba(0,0,0,.4)', animation: pinShake ? 'shake .4s ease' : 'none' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
            <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>Confirm with PIN</h3>
            <p style={{ fontSize: '.82rem', color: 'var(--ink3)', fontWeight: 500, marginBottom: 22, lineHeight: 1.6 }}>
              Enter your 4-digit parent PIN to save these parental controls.
            </p>

            {/* PIN Display */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: 48, height: 56, borderRadius: 12, border: `2.5px solid ${pinError ? 'var(--red)' : confirmPin.length > i ? 'var(--blue)' : 'var(--border)'}`, background: confirmPin.length > i ? 'var(--blue-bg)' : 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', transition: 'all .2s' }}>
                  {confirmPin.length > i ? '●' : ''}
                </div>
              ))}
            </div>

            {/* PIN Pad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, maxWidth: 220, margin: '0 auto 20px' }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (k === '⌫') setConfirmPin(v => v.slice(0, -1))
                    else if (k === '') return
                    else if (confirmPin.length < 4) setConfirmPin(v => v + k)
                  }}
                  style={{
                    height: 52,
                    borderRadius: 12,
                    border: '1.5px solid var(--border)',
                    background: k === '' ? 'transparent' : 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: k === '' ? 'default' : 'pointer',
                    fontFamily: 'Poppins,sans-serif',
                    transition: 'all .15s'
                  }}
                  onMouseEnter={e => { if (k) e.currentTarget.style.background = 'var(--blue-bg)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = k === '' ? 'transparent' : 'var(--surface)' }}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setShowPinModal(false)
                  setConfirmPin('')
                  setPinError(false)
                }}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--ink2)',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '.86rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPin}
                disabled={confirmPin.length < 4 || saving}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: confirmPin.length === 4 && !saving ? 'var(--blue)' : 'var(--bg3)',
                  color: confirmPin.length === 4 && !saving ? 'white' : 'var(--ink3)',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '.86rem',
                  cursor: confirmPin.length === 4 && !saving ? 'pointer' : 'default',
                  transition: 'all .2s'
                }}
              >
                {saving ? '⏳ Saving...' : 'Confirm'}
              </button>
            </div>

            {pinError && <div style={{ fontSize: '.78rem', color: 'var(--red)', fontWeight: 700, marginTop: 10 }}>❌ Wrong PIN. Try again.</div>}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
      `}</style>
    </div>
  )
}
