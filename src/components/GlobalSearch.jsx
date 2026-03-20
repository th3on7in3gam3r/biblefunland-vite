import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n/useT'
import styles from './GlobalSearch.module.css'

const SEARCH_DATA = [
  // Games
  { type: 'game', title: 'Scripture Trivia', desc: 'Test your Bible knowledge', icon: '❓', to: '/trivia', tags: ['quiz','trivia','game','bible','scripture'] },
  { type: 'game', title: 'David & Goliath', desc: 'Action game of faith', icon: '🏹', to: '/trivia', tags: ['david','goliath','action','game','battle'] },
  { type: 'game', title: "Jonah's Escape", desc: 'Underwater adventure', icon: '🐟', to: '/trivia', tags: ['jonah','whale','fish','puzzle'] },
  { type: 'game', title: "Noah's Voyage", desc: 'Gather all the animals', icon: '🚢', to: '/trivia', tags: ['noah','ark','flood','puzzle','animals'] },
  { type: 'game', title: 'Bible Checkers', desc: 'Strategy game', icon: '♟️', to: '/trivia', tags: ['checkers','strategy','game'] },

  // Pages
  { type: 'page', title: 'AI Devotional Generator', desc: 'Personalized daily devotionals', icon: '🙏', to: '/devotional', tags: ['devotional','prayer','ai','faith','daily'] },
  { type: 'page', title: 'Interactive Bible Map', desc: 'Explore the Holy Land', icon: '🗺️', to: '/map', tags: ['map','holy land','jerusalem','israel','places'] },
  { type: 'page', title: 'Memory Verse Flashcards', desc: 'Memorize scripture', icon: '🧠', to: '/flashcards', tags: ['memory','verse','flashcard','scripture','memorize'] },
  { type: 'page', title: 'Sermon Notes', desc: 'Take and save notes', icon: '📝', to: '/notes', tags: ['notes','sermon','church','pastor'] },
  { type: 'page', title: 'Prayer Wall', desc: 'Community prayer', icon: '🌍', to: '/prayer', tags: ['prayer','community','pray','request'] },
  { type: 'page', title: 'Share Cards', desc: 'Beautiful verse graphics', icon: '🔗', to: '/share', tags: ['share','verse','graphic','instagram','social'] },
  { type: 'page', title: 'Videos', desc: 'Bible videos & devotionals', icon: '🎬', to: '/videos', tags: ['video','watch','devotional','story'] },
  { type: 'page', title: 'Blog', desc: 'Faith articles & updates', icon: '✍️', to: '/blog', tags: ['blog','article','post','faith','family'] },
  { type: 'page', title: 'My Progress', desc: 'Streak, badges, calendar', icon: '📊', to: '/dashboard', tags: ['progress','streak','badge','dashboard'] },
  { type: 'page', title: 'Go Pro', desc: 'Upgrade your account', icon: '💎', to: '/premium', tags: ['pro','premium','upgrade','subscription'] },
  { type: 'page', title: 'Lumina Bible', desc: 'Read the Bible online', icon: '📖', to: '/lumina', tags: ['lumina','bible','read','scripture','book'] },

  // Bible Verses
  { type: 'verse', title: 'John 3:16', desc: '"For God so loved the world..."', icon: '📜', to: '/flashcards', tags: ['john','love','god','world','salvation','john 3'] },
  { type: 'verse', title: 'Philippians 4:13', desc: '"I can do all things through Christ..."', icon: '📜', to: '/flashcards', tags: ['philippians','strength','christ','all things'] },
  { type: 'verse', title: 'Jeremiah 29:11', desc: '"Plans to prosper you..."', icon: '📜', to: '/flashcards', tags: ['jeremiah','plans','hope','future','prosper'] },
  { type: 'verse', title: 'Psalm 23:1', desc: '"The Lord is my shepherd..."', icon: '📜', to: '/flashcards', tags: ['psalm','shepherd','lord','david'] },
  { type: 'verse', title: 'Romans 8:28', desc: '"All things work for good..."', icon: '📜', to: '/flashcards', tags: ['romans','good','love','purpose'] },
  { type: 'verse', title: 'Isaiah 40:31', desc: '"Those who hope in the Lord..."', icon: '📜', to: '/flashcards', tags: ['isaiah','hope','eagle','strength','renew'] },
  { type: 'verse', title: 'Proverbs 3:5-6', desc: '"Trust in the Lord..."', icon: '📜', to: '/flashcards', tags: ['proverbs','trust','heart','wisdom','paths'] },
  { type: 'verse', title: 'Joshua 1:9', desc: '"Be strong and courageous..."', icon: '📜', to: '/flashcards', tags: ['joshua','strong','courage','fear','god'] },

  // Blog
  { type: 'blog', title: 'Starting Each Day in the Word', desc: 'A simple 5-minute habit', icon: '🌅', to: '/blog', tags: ['devotional','morning','habit','family','word'] },
  { type: 'blog', title: '10 Verses to Memorize With Kids', desc: 'Plant scripture in their hearts', icon: '✝️', to: '/blog', tags: ['kids','memorize','verse','children','family'] },
  { type: 'blog', title: 'Why We Built BibleFunLand', desc: 'Our story and vision', icon: '🌈', to: '/blog', tags: ['about','story','vision','ministry','biblefunland'] },
]

const TYPE_COLORS = {
  game:  { bg: 'var(--blue-bg)',   color: 'var(--blue)',   label: 'Game' },
  page:  { bg: 'var(--violet-bg)', color: 'var(--violet)', label: 'Page' },
  verse: { bg: 'var(--green-bg)',  color: 'var(--green)',  label: 'Verse' },
  blog:  { bg: 'var(--orange-bg)', color: 'var(--orange)', label: 'Blog' },
}

// Debounce hook for search
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('globalSearchHistory') || '[]')
    } catch {
      return []
    }
  })
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { t } = useT()
  const debouncedQuery = useDebounce(query, 200)

  // CMD+K / CTRL+K to open, CTRL+/ to open
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if ((e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setHighlighted(0)
    }
  }, [open])

  function close() {
    setOpen(false)
    setQuery('')
  }

  function addToHistory(item) {
    const updated = [
      { ...item, timestamp: Date.now() },
      ...recentSearches.filter(s => s.title !== item.title)
    ].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('globalSearchHistory', JSON.stringify(updated))
  }

  // Memoized search results with debounce
  const results = useMemo(() => {
    if (debouncedQuery.length < 2) {
      return SEARCH_DATA.slice(0, 8)
    }
    const q = debouncedQuery.toLowerCase()
    return SEARCH_DATA.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.tags.some(tag => tag.includes(q))
    ).slice(0, 10)
  }, [debouncedQuery])

  function go(item) {
    addToHistory(item)
    navigate(item.to)
    close()
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && results[highlighted]) go(results[highlighted])
  }

  // Group results by type
  const grouped = {}
  results.forEach(r => {
    if (!grouped[r.type]) grouped[r.type] = []
    grouped[r.type].push(r)
  })

  return (
    <>
      {/* Trigger button in nav */}
      <button
        className={styles.trigger}
        onClick={() => setOpen(true)}
        title={t('search.hint')}
        aria-label="Open search"
      >
        <span className={styles.triggerIcon}>🔍</span>
        <span className={styles.triggerText}>{t('search.placeholder')}</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </button>

      {/* Modal */}
      {open && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && close()}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Search">

            {/* Input */}
            <div className={styles.inputRow}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                ref={inputRef}
                className={styles.input}
                value={query}
                onChange={e => { setQuery(e.target.value); setHighlighted(0) }}
                onKeyDown={onKeyDown}
                placeholder={t('search.placeholder')}
                autoComplete="off"
              />
              {query && (
                <button className={styles.clearBtn} onClick={() => setQuery('')}>✕</button>
              )}
            </div>

            {/* Results */}
            <div className={styles.results}>
              {results.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <p>{t('search.noResults')} "<strong>{query}</strong>"</p>
                  <p className={styles.emptySub}>{t('search.tryAnother')}</p>
                </div>
              ) : (
                Object.entries(grouped).map(([type, items]) => {
                  const meta = TYPE_COLORS[type] || TYPE_COLORS.page
                  const label = { game: t('search.games'), page: t('search.pages'), verse: t('search.verses'), blog: t('search.blog') }[type]
                  return (
                    <div key={type}>
                      <div className={styles.groupLabel}>{label}</div>
                      {items.map((item, i) => {
                        const globalIdx = results.indexOf(item)
                        return (
                          <button
                            key={i}
                            className={`${styles.result} ${globalIdx === highlighted ? styles.resultActive : ''}`}
                            onClick={() => go(item)}
                            onMouseEnter={() => setHighlighted(globalIdx)}
                          >
                            <span className={styles.resultIcon}>{item.icon}</span>
                            <span className={styles.resultBody}>
                              <span className={styles.resultTitle}>{item.title}</span>
                              <span className={styles.resultDesc}>{item.desc}</span>
                            </span>
                            <span
                              className={styles.resultType}
                              style={{ background: meta.bg, color: meta.color }}
                            >
                              {meta.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
              <span>⌘K / Ctrl+K</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
