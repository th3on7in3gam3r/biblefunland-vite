import { useState, useEffect } from 'react'
import { SignIn, SignUp, useUser } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './Auth.module.css'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const { isSignedIn, isLoaded } = useUser()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate(redirect)
    }
  }, [isLoaded, isSignedIn, navigate, redirect])

  // Check URL for mode
  useEffect(() => {
    const urlMode = params.get('mode')
    if (urlMode === 'signup') setMode('signup')
  }, [params])

  if (!isLoaded) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>
          <div className={styles.loaderSpinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Background Elements */}
      <div className={styles.background}>
        <div className={styles.bgOrb1}></div>
        <div className={styles.bgOrb2}></div>
        <div className={styles.bgOrb3}></div>
        <div className={styles.bgGrid}></div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Panel - Branding */}
        <div className={styles.leftPanel}>
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>✝️</div>
              <div>
                <span className={styles.logoText}>Bible<span>Fun</span>Land</span>
                <div className={styles.logoTagline}>Faith • Fun • Family</div>
              </div>
            </div>
            <h1 className={styles.brandTitle}>
              Where Faith<br />Meets Fun
            </h1>
            <p className={styles.brandSubtitle}>
              Join thousands of families growing together in faith through interactive Bible learning, games, and adventures.
            </p>
          </div>

          {/* Features */}
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔥</div>
              <div className={styles.featureText}>
                <h3>Daily Streaks</h3>
                <p>Build consistent Bible reading habits with rewards</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🏆</div>
              <div className={styles.featureText}>
                <h3>Achievements</h3>
                <p>Earn badges and unlock exclusive content</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>👨‍👩‍👧‍👦</div>
              <div className={styles.featureText}>
                <h3>Family Accounts</h3>
                <p>Multiple profiles with parental controls</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🎮</div>
              <div className={styles.featureText}>
                <h3>80+ Features</h3>
                <p>Games, quizzes, devotionals, and more</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Families</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>1M+</span>
              <span className={styles.statLabel}>Verses Learned</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>98%</span>
              <span className={styles.statLabel}>Satisfaction</span>
            </div>
          </div>

          {/* Testimonial */}
          <div className={styles.testimonial}>
            <div className={styles.testimonialQuote}>"</div>
            <p className={styles.testimonialText}>
              BibleFunLand transformed our family devotions. My kids actually look forward to Bible time now!
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>👨‍👩‍👧</div>
              <div>
                <div className={styles.testimonialName}>Sarah M.</div>
                <div className={styles.testimonialRole}>Parent of 3</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className={styles.rightPanel}>
          <div className={styles.authCard}>
            {/* Mode Toggle */}
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeTab} ${mode === 'signin' ? styles.active : ''}`}
                onClick={() => setMode('signin')}
              >
                <span className={styles.modeIcon}>👋</span>
                <span>Welcome Back</span>
              </button>
              <button
                className={`${styles.modeTab} ${mode === 'signup' ? styles.active : ''}`}
                onClick={() => setMode('signup')}
              >
                <span className={styles.modeIcon}>✨</span>
                <span>Join Us</span>
              </button>
            </div>

            {/* Auth Header */}
            <div className={styles.authHeader}>
              <h2 className={styles.authTitle}>
                {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
              </h2>
              <p className={styles.authSubtitle}>
                {mode === 'signin' 
                  ? 'Welcome back! Continue your faith journey.'
                  : 'Start your adventure in faith-based learning today.'
                }
              </p>
            </div>

            {/* Clerk Form */}
            <div className={styles.formContainer}>
              {mode === 'signin' ? (
                <SignIn
                  routing="hash"
                  fallbackRedirectUrl={redirect}
                  signUpUrl="/auth?mode=signup"
                />
              ) : (
                <SignUp
                  routing="hash"
                  fallbackRedirectUrl={redirect}
                  signInUrl="/auth?mode=signin"
                />
              )}
            </div>

            {/* Benefits */}
            <div className={styles.benefitsSection}>
              <h3 className={styles.benefitsTitle}>✨ What you'll get</h3>
              <div className={styles.benefits}>
                <div className={styles.benefit}>
                  <span className={styles.benefitCheck}>✓</span>
                  <span>Personalized learning paths</span>
                </div>
                <div className={styles.benefit}>
                  <span className={styles.benefitCheck}>✓</span>
                  <span>Progress tracking & insights</span>
                </div>
                <div className={styles.benefit}>
                  <span className={styles.benefitCheck}>✓</span>
                  <span>Achievement system & rewards</span>
                </div>
                <div className={styles.benefit}>
                  <span className={styles.benefitCheck}>✓</span>
                  <span>Ad-free experience</span>
                </div>
              </div>
            </div>

            {/* Skip Link */}
            <button 
              className={styles.skipButton}
              onClick={() => navigate('/')}
            >
              Continue as guest →
            </button>

            {/* Footer */}
            <div className={styles.footer}>
              <p className={styles.terms}>
                By continuing, you agree to our{' '}
                <a href="/terms" className={styles.link}>Terms</a> and{' '}
                <a href="/privacy" className={styles.link}>Privacy Policy</a>
              </p>
              <div className={styles.security}>
                <span className={styles.securityIcon}>🔒</span>
                <span>Secured with enterprise-grade encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
