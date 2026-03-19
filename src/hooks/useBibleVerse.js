// src/hooks/useBibleVerse.js
// ─────────────────────────────────────────────────────────────────────
// Live Bible verse fetching via API.Bible (api.bible)
//
// SETUP:
//   1. Sign up free at https://scripture.api.bible
//   2. Create an app → copy API key
//   3. Add to .env: VITE_BIBLE_API_KEY=your_key_here
//   4. Free tier: 5,000 requests/day — more than enough
//
// USAGE:
//   const { verse, loading, error } = useBibleVerse('JHN.3.16', 'KJV')
//   const { verse, loading } = useBibleVerse('PHP.4.13')
//
// TRANSLATION IDs (most popular):
//   KJV  → 'de4e12af7f28f599-02'
//   NIV  → '06125adad2d5898a-01'  (requires license — use ESV instead)
//   ESV  → '9879dbb7cfe39e4d-04'
//   NLT  → '65eec8e0b60e656b-01'
//   NKJV → 'c315fa9f71d4af3a-02'
//
// REFERENCE FORMAT (OSIS):
//   'JHN.3.16'     → John 3:16
//   'PSA.23.1'     → Psalm 23:1
//   'PHP.4.13'     → Philippians 4:13
//   'JER.29.11'    → Jeremiah 29:11
//   'JOS.1.9'      → Joshua 1:9
// ─────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'

const API_KEY = import.meta.env.VITE_BIBLE_API_KEY
const BASE    = 'https://api.scripture.api.bible/v1'

export const TRANSLATIONS = {
  KJV:  { id: 'de4e12af7f28f599-02', name: 'King James Version',     abbr: 'KJV' },
  ESV:  { id: '9879dbb7cfe39e4d-04', name: 'English Standard Version', abbr: 'ESV' },
  NKJV: { id: 'c315fa9f71d4af3a-02', name: 'New King James Version', abbr: 'NKJV' },
  NLT:  { id: '65eec8e0b60e656b-01', name: 'New Living Translation',  abbr: 'NLT' },
}

// ── In-memory cache to avoid re-fetching ──
const cache = new Map()

// ── Fetch a single verse ──────────────────────────────────────────────
export function useBibleVerse(reference, translationKey = 'KJV') {
  const [verse, setVerse]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const translation = TRANSLATIONS[translationKey] || TRANSLATIONS.KJV
  const cacheKey = `${reference}-${translationKey}`

  useEffect(() => {
    if (!reference) { setLoading(false); return }
    if (!API_KEY || API_KEY === 'your_key_here') {
      // Graceful fallback: return a hardcoded verse so the site doesn't break
      setVerse(getFallbackVerse(reference))
      setLoading(false)
      return
    }

    if (cache.has(cacheKey)) {
      setVerse(cache.get(cacheKey))
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`${BASE}/bibles/${translation.id}/verses/${reference}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false`, {
      headers: { 'api-key': API_KEY }
    })
      .then(r => r.json())
      .then(data => {
        if (data.data) {
          const result = {
            text: data.data.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
            reference: data.data.reference,
            translation: translation.abbr,
          }
          cache.set(cacheKey, result)
          setVerse(result)
        } else {
          setError('Verse not found')
          setVerse(getFallbackVerse(reference))
        }
      })
      .catch(() => {
        setError('API unavailable')
        setVerse(getFallbackVerse(reference))
      })
      .finally(() => setLoading(false))
  }, [reference, translationKey])

  return { verse, loading, error }
}

// ── Fetch a full chapter ──────────────────────────────────────────────
export function useBibleChapter(chapterRef, translationKey = 'KJV') {
  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const translation = TRANSLATIONS[translationKey] || TRANSLATIONS.KJV
  const cacheKey = `chapter-${chapterRef}-${translationKey}`

  useEffect(() => {
    if (!chapterRef) return
    if (cache.has(cacheKey)) { setChapter(cache.get(cacheKey)); setLoading(false); return }
    if (!API_KEY || API_KEY === 'your_key_here') { setLoading(false); return }

    fetch(`${BASE}/bibles/${translation.id}/chapters/${chapterRef}?content-type=html&include-notes=false&include-titles=true`, {
      headers: { 'api-key': API_KEY }
    })
      .then(r => r.json())
      .then(data => {
        if (data.data) {
          cache.set(cacheKey, data.data)
          setChapter(data.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [chapterRef, translationKey])

  return { chapter, loading }
}

// ── Search the Bible ──────────────────────────────────────────────────
export async function searchBible(query, translationKey = 'KJV', limit = 10) {
  const translation = TRANSLATIONS[translationKey] || TRANSLATIONS.KJV
  if (!API_KEY || API_KEY === 'your_key_here') return []
  try {
    const res = await fetch(
      `${BASE}/bibles/${translation.id}/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      { headers: { 'api-key': API_KEY } }
    )
    const data = await res.json()
    return data.data?.verses?.map(v => ({
      reference: v.reference,
      text: v.text,
      id: v.id,
    })) ?? []
  } catch { return [] }
}

// ── Daily verse — rotates by day of year ─────────────────────────────
export function useDailyVerse(translationKey = 'KJV') {
  const DAILY_REFS = [
    'JHN.3.16','PHP.4.13','JER.29.11','JOS.1.9','PSA.23.1',
    'ISA.40.31','ROM.8.28','PRO.3.5','EPH.2.8','PSA.46.10',
    '1PE.5.7','GAL.5.22','HEB.11.1','ROM.8.38','PHP.4.7',
    'MAT.11.28','JHN.14.6','PSA.119.105','MAT.6.33','ROM.12.2',
    'PSA.139.14','2CO.5.17','ISA.43.2','MIC.6.8','LAM.3.23',
    'NEH.8.10','JHN.10.10','1JHN.4.19','PSA.91.11','DEU.31.8',
  ]
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const ref = DAILY_REFS[dayOfYear % DAILY_REFS.length]
  return useBibleVerse(ref, translationKey)
}

// ── Translation Switcher Component ────────────────────────────────────
export function TranslationSwitcher({ value, onChange, style = {} }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        fontFamily: 'Poppins,sans-serif', fontSize: '.72rem', fontWeight: 700,
        padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
        background: 'var(--surface)', color: 'var(--ink)',
        border: '1.5px solid var(--border)', ...style,
      }}
    >
      {Object.values(TRANSLATIONS).map(t => (
        <option key={t.abbr} value={t.abbr}>{t.abbr} — {t.name}</option>
      ))}
    </select>
  )
}

// ── Fallback verses (when API key not set) ────────────────────────────
function getFallbackVerse(reference) {
  const FALLBACKS = {
    'JHN.3.16': { text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', reference: 'John 3:16', translation: 'NIV' },
    'PHP.4.13': { text: 'I can do all this through him who gives me strength.', reference: 'Philippians 4:13', translation: 'NIV' },
    'JER.29.11': { text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', reference: 'Jeremiah 29:11', translation: 'NIV' },
    'JOS.1.9': { text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', reference: 'Joshua 1:9', translation: 'NIV' },
    'PSA.23.1': { text: 'The Lord is my shepherd, I lack nothing.', reference: 'Psalm 23:1', translation: 'NIV' },
    'ISA.40.31': { text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.', reference: 'Isaiah 40:31', translation: 'NIV' },
  }
  return FALLBACKS[reference] ?? {
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    reference: 'Proverbs 3:5-6',
    translation: 'NIV',
  }
}
