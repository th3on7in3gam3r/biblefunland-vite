import { useState, useEffect } from 'react'
import { SignIn, SignUp, useUser } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './Auth.module.css'

const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: '#6366f1',
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    fontFamily: "'Poppins', system-ui, sans-serif",
    borderRadius: '12px',
    fontSize: '14px',
  },
  elements: {
    rootBox: { width: '100%', fontFamily: "'Poppins', system-ui, sans-serif" },
    card: { boxShadow: 'none', border: 'none', padding: 0, background: 'transparent', width: '100%' },
    headerTitle: { display: 'none' },
    headerSubtitle: { display: 'none' },
    socialButtonsBlockButton: { 
      borderRadius: '12px', 
      border: '2px solid #e5e7eb', 
      fontFamily: "'Poppins', sans-serif",
      height: '48px',
      fontSize: '14px',
      fontWeight: '600',
      backgroundColor: '#FFFFFF',
      color: '#1f2937',
      transition: 'all 0.2s ease',
      '&:hover': { backgroundColor: '#f9fafb', borderColor: '#6366f1', transform: 'translateY(-2px)' }
    },
    formButtonPrimary: { 
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
      borderRadius: '12px', 
      fontFamily: "'Poppins', sans-serif", 
      textTransform: 'none',
      height: '48px',
      fontSize: '15px',
      fontWeight: '700',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
      '&:hover': { 
        background: 'linear-gradient(135deg, #5558e3, #7c3aed)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)'
      }
    },
    formFieldInput: { 
      borderRadius: '12px', 
      border: '2px solid #e5e7eb', 
      fontFamily: "'Poppins', sans-serif",
      padding: '0 16px',
      backgroundColor: '#FFFFFF',
      fontSize: '14px',
      height: '48px',
      transition: 'all 0.2s ease',
      '&:focus': { 
        borderColor: '#6366f1', 
        boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)',
        transform: 'translateY(-1px)'
      }
    },
    footerActionText: { color: '#6b7280', fontWeight: '500', fontSize: '14px' },
    footerActionLink: { color: '#6366f1', fontWeight: '700', fontSize: '14px' },
    formFieldLabel: { 
      fontWeight: '600', 
      color: '#374151', 
      fontSize: '13px',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    dividerText: { color: '#9ca3af', fontSize: '13px', fontWeight: '600' },
    dividerLine: { backgroundColor: '#e5e7eb' }
  }
}

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
                  appearance={CLERK_APPEARANCE}
                />
              ) : (
                <SignUp
                  routing="hash"
                  fallbackRedirectUrl={redirect}
                  signInUrl="/auth?mode=signin"
                  appearance={CLERK_APPEARANCE}
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
