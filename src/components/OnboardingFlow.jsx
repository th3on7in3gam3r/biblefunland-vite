import { useState } from 'react'
import { useOnboarding } from '../context/OnboardingContext'
import styles from './OnboardingFlow.module.css'

const BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  'Psalms', 'Proverbs', 'Isaiah', 'Jeremiah'
]

const INTERESTS = [
  '📖 Bible Study',
  '🙏 Prayer',
  '🎯 Challenges',
  '🎓 Learning',
  '⚡ Daily Devotions',
  '🎮 Games',
  '👨‍👩‍👧‍👦 Family Activities',
  '⭐ Achievements'
]

const AGE_GROUPS = [
  { value: 'child', label: '👶 Child (Under 10)' },
  { value: 'preteen', label: '👧 Preteen (10-12)' },
  { value: 'teen', label: '👦 Teen (13-17)' },
  { value: 'adult', label: '🧑 Adult (18+)' }
]

export default function OnboardingFlow() {
  const {
    onboardingStep,
    onboardingData,
    updateOnboardingData,
    nextStep,
    prevStep,
    completeOnboarding,
    skipOnboarding
  } = useOnboarding()

  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    if (!onboardingData.displayName || !onboardingData.ageGroup) {
      alert('Please fill in required fields')
      return
    }

    setLoading(true)
    const success = await completeOnboarding()
    setLoading(false)

    if (!success) {
      alert('Error saving preferences. Please try again.')
    }
  }

  return (
    <div className={styles.onboarding}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Welcome to BibleFunLand! 🌟</h1>
          <p>Let's get you set up in {4 - onboardingStep} step{onboardingStep !== 3 ? 's' : ''}</p>
          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: `${(onboardingStep + 1) * 25}%` }} />
          </div>
        </div>

        <div className={styles.content}>
          {/* Step 0: Welcome */}
          {onboardingStep === 0 && (
            <div className={styles.step}>
              <h2>👋 Welcome!</h2>
              <p>BibleFunLand is your adventure through Scripture with games, challenges, and fun learning experiences for the whole family.</p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <span>📚</span>
                  <span>Explore the Bible interactively</span>
                </div>
                <div className={styles.feature}>
                  <span>🎮</span>
                  <span>Play engaging games and quizzes</span>
                </div>
                <div className={styles.feature}>
                  <span>⭐</span>
                  <span>Earn badges and build streaks</span>
                </div>
                <div className={styles.feature}>
                  <span>👨‍👩‍👧‍👦</span>
                  <span>Connect with family and friends</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Profile Setup */}
          {onboardingStep === 1 && (
            <div className={styles.step}>
              <h2>👤 Tell Us About You</h2>
              <div className={styles.formGroup}>
                <label>What's your name?</label>
                <input
                  type="text"
                  placeholder="Enter your display name"
                  maxLength={30}
                  value={onboardingData.displayName}
                  onChange={(e) => updateOnboardingData('displayName', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Age Group (Required)</label>
                <div className={styles.ageGroups}>
                  {AGE_GROUPS.map(group => (
                    <button
                      key={group.value}
                      className={`${styles.ageButton} ${onboardingData.ageGroup === group.value ? styles.selected : ''}`}
                      onClick={() => updateOnboardingData('ageGroup', group.value)}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Favorite Books */}
          {onboardingStep === 2 && (
            <div className={styles.step}>
              <h2>📖 Favorite Books of the Bible</h2>
              <p className={styles.subtitle}>Select your 3-5 favorite books to personalize your experience</p>
              <div className={styles.bookGrid}>
                {BOOKS.map(book => (
                  <button
                    key={book}
                    className={`${styles.bookButton} ${onboardingData.favoriteBooks.includes(book) ? styles.selected : ''}`}
                    onClick={() => {
                      const updated = onboardingData.favoriteBooks.includes(book)
                        ? onboardingData.favoriteBooks.filter(b => b !== book)
                        : [...onboardingData.favoriteBooks, book].slice(-5) // Max 5
                      updateOnboardingData('favoriteBooks', updated)
                    }}
                  >
                    {book}
                  </button>
                ))}
              </div>
              <p className={styles.counter}>{onboardingData.favoriteBooks.length} selected</p>
            </div>
          )}

          {/* Step 3: Interests & Settings */}
          {onboardingStep === 3 && (
            <div className={styles.step}>
              <h2>🎯 What Interests You?</h2>
              <p className={styles.subtitle}>Choose what features you'd like to use</p>
              <div className={styles.interestGrid}>
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    className={`${styles.interestButton} ${onboardingData.interests.includes(interest) ? styles.selected : ''}`}
                    onClick={() => {
                      const updated = onboardingData.interests.includes(interest)
                        ? onboardingData.interests.filter(i => i !== interest)
                        : [...onboardingData.interests, interest]
                      updateOnboardingData('interests', updated)
                    }}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className={styles.toggleGroup}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={onboardingData.enableNotifications}
                    onChange={(e) => updateOnboardingData('enableNotifications', e.target.checked)}
                  />
                  <span>🔔 Enable notifications</span>
                </label>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={onboardingData.enableReminders}
                    onChange={(e) => updateOnboardingData('enableReminders', e.target.checked)}
                  />
                  <span>⏰ Enable reminders</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            onClick={skipOnboarding}
            className={styles.buttonSkip}
            disabled={loading}
          >
            Skip
          </button>

          {onboardingStep > 0 && (
            <button
              onClick={prevStep}
              className={styles.buttonSecondary}
              disabled={loading}
            >
              Back
            </button>
          )}

          {onboardingStep < 3 ? (
            <button
              onClick={nextStep}
              className={styles.buttonPrimary}
              disabled={loading}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className={styles.buttonPrimary}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
