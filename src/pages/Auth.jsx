import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SignIn, SignUp } from '../lib/clerk'
import styles from './Auth.module.css'

export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'


  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') ?? '/'

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


        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          {mode === 'signin' ? (
            <SignIn 
              routing="hash" 
              signUpUrl="/auth?mode=signup"
              afterSignInUrl={redirect || '/'}
            />
          ) : (
            <SignUp 
              routing="hash" 
              signInUrl="/auth?mode=signin"
              afterSignUpUrl={redirect || '/'}
            />
          )}
        </div>

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
