import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') ?? '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        navigate('/' + redirect, { replace: true })
      }
    }
    setLoading(false)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>✝️</div>
          <span className={styles.logoText}>Bible<span>Fun</span>Land</span>
        </div>

        <h1 className={styles.title}>
          {mode === 'signin' ? 'Welcome back! 🙏' : 'Join BibleFunLand ✨'}
        </h1>
        <p className={styles.sub}>
          {mode === 'signin'
            ? 'Sign in to sync your streak, badges, and notes across devices.'
            : 'Create a free account to save your progress everywhere.'}
        </p>

        {/* Perks row */}
        <div className={styles.perks}>
          <div className={styles.perk}><span>🔥</span> Streak synced everywhere</div>
          <div className={styles.perk}><span>🏆</span> Badges saved to your account</div>
          <div className={styles.perk}><span>📝</span> Sermon notes on all devices</div>
        </div>

        {error && <div className={styles.errorBox}>⚠️ {error}</div>}
        {success && <div className={styles.successBox}>✅ {success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={mode === 'signup' ? 8 : 1}
            />
          </div>

          <button
            type="submit"
            className={`btn btn-blue btn-full ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading
              ? <span className={styles.btnSpinner} />
              : mode === 'signin' ? '🔑 Sign In' : '🚀 Create Account'}
          </button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        {/* Mode switcher */}
        <p className={styles.switchText}>
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <button className={styles.switchBtn} onClick={() => { setMode('signup'); setError(''); }}>
                Sign up free
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button className={styles.switchBtn} onClick={() => { setMode('signin'); setError(''); }}>
                Sign in
              </button>
            </>
          )}
        </p>

        <p className={styles.skipText}>
          <button className={styles.skipBtn} onClick={() => navigate('/')}>
            Continue without account →
          </button>
        </p>

        <p className={styles.fine}>
          By signing up you agree to our{' '}
          <a href="/terms" className={styles.link}>Terms</a> and{' '}
          <a href="/privacy" className={styles.link}>Privacy Policy</a>.
          Your data is stored securely in Supabase.
        </p>
      </div>
    </div>
  )
}
