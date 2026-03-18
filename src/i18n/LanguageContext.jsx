// src/i18n/LanguageContext.jsx
import { createContext, useContext, useState } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)

export const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
]

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('bfl_lang') || 'en'
  )

  function changeLanguage(code) {
    setLang(code)
    localStorage.setItem('bfl_lang', code)
  }

  function t(key) {
    return translations[lang]?.[key] ?? translations['en']?.[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
