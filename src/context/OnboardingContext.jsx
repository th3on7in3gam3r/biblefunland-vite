import { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

const OnboardingContext = createContext(null)

export function OnboardingProvider({ children }) {
  const { user } = useAuth()
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState({
    displayName: '',
    ageGroup: '',
    favoriteBooks: [],
    interests: [],
    enableNotifications: true,
    enableReminders: true,
  })

  // Check if user needs onboarding (first time user)
  const checkOnboarding = useCallback(() => {
    if (!user) {
      setIsOnboarding(false)
      return
    }

    // Check if onboarding was completed (stored in localStorage)
    const completed = localStorage.getItem(`onboarding_${user.id}`)
    if (!completed) {
      setIsOnboarding(true)
      setOnboardingStep(0)
    }
  }, [user])

  // Initialize onboarding check on user login
  useState(() => {
    checkOnboarding()
  }, [checkOnboarding])

  const updateOnboardingData = (key, value) => {
    setOnboardingData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const nextStep = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(prev => prev - 1)
    }
  }

  const completeOnboarding = async () => {
    if (!user) return

    try {
      // Save onboarding completion flag
      localStorage.setItem(`onboarding_${user.id}`, 'true')
      localStorage.setItem(`onboarding_data_${user.id}`, JSON.stringify(onboardingData))

      // TODO: Save preferences to database via API
      // await db.saveUserPreferences(user.id, onboardingData)

      setIsOnboarding(false)
      setOnboardingStep(0)
      return true
    } catch (error) {
      console.error('Error completing onboarding:', error)
      return false
    }
  }

  const skipOnboarding = () => {
    if (!user) return
    localStorage.setItem(`onboarding_${user.id}`, 'true')
    setIsOnboarding(false)
  }

  const resetOnboarding = () => {
    if (!user) return
    localStorage.removeItem(`onboarding_${user.id}`)
    localStorage.removeItem(`onboarding_data_${user.id}`)
    setIsOnboarding(true)
    setOnboardingStep(0)
  }

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        onboardingStep,
        onboardingData,
        updateOnboardingData,
        nextStep,
        prevStep,
        completeOnboarding,
        skipOnboarding,
        resetOnboarding,
        checkOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider')
  return ctx
}
