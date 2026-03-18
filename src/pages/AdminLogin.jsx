import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './AdminLogin.module.css'

// PIN is set in .env as VITE_ADMIN_PIN — never hardcode it
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? '1234'

export default function AdminLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // If already verified, go straight to admin
  useEffect(() => {
    if (sessionStorage.getItem('bfl_admin_verified') === 'true') {
      navigate('/admin', { replace: true })
    }
  }, [])

  function inputDigit(d) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) {
      setTimeout(() => verifyPin(next), 150)
    }
  }

  function backspace() {
    setPin(p => p.slice(0, -1))
    setError('')
  }

  function verifyPin(attempt) {
    if (attempt === ADMIN_PIN) {
      sessionStorage.setItem('bfl_admin_verified', 'true')
      navigate('/admin', { replace: true })
    } else {
      setShake(true)
      setError('Incorrect PIN. Please try again.')
      setTimeout(() => {
        setPin('')
        setShake(false)
        setError('')
      }, 1200)
    }
  }

  // Keyboard support
  useEffect(() => {
    function onKey(e) {
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key)
      if (e.key === 'Backspace') backspace()
      if (e.key === 'Escape') navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pin])

  return (
    <div className={styles.wrap}>
      <div className={`${styles.card} ${shake ? styles.shake : ''}`}>
        <span className={styles.icon}>🔐</span>
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.sub}>
          This area is restricted. Enter your 4-digit admin PIN to continue.
        </p>

        {/* PIN dots */}
        <div className={styles.dots}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`${styles.dot} ${i < pin.length ? styles.filled : ''} ${error ? styles.error : ''}`}
            />
          ))}
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        {/* Numpad */}
        <div className={styles.numpad}>
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button key={d} className={styles.key} onClick={() => inputDigit(d)}>{d}</button>
          ))}
          <button className={styles.key} style={{ visibility:'hidden' }} />
          <button className={styles.key} onClick={() => inputDigit('0')}>0</button>
          <button className={styles.key} onClick={backspace}>⌫</button>
        </div>

        <button className={styles.cancel} onClick={() => navigate(-1)}>
          ← Go back
        </button>
      </div>
    </div>
  )
}
