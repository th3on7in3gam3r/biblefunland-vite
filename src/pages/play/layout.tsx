// @ts-nocheck
import { useMemo } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { useKidsMode } from '../../context/KidsModeContext'
import SectionLoading from '../../components/SectionLoading'
import SectionError from '../../components/SectionError'
import ContentCard from '../../components/ContentCard'
import RelatedItems from '../../components/RelatedItems'

const AGE_OPTIONS = [
  { value: 'Preschool', label: 'Preschool (3-5)' },
  { value: 'Elementary', label: 'Elementary (6-9)' },
  { value: 'Tweens', label: 'Tweens (10-12)' },
  { value: 'Family', label: 'Family' },
]

const TOPIC_OPTIONS = [
  'Old Testament',
  'New Testament',
  'Jesus',
  'Heroes',
  'Parables',
  'Faith',
  'Prayer',
  'Bible Stories',
]

const TYPE_OPTIONS = ['Online Game', 'Printable', 'AI Tool', 'Interactive']

const PLAY_ITEMS = [
  {
    title: 'Scripture Trivia',
    path: '/play/trivia',
    age: 'Tweens',
    topic: ['Old Testament', 'New Testament', 'Heroes'],
    type: 'Online Game',
    thumbnail: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="230"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E1B4B"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient></defs><rect width="400" height="230" fill="url(#g)"/><text x="200" y="100" text-anchor="middle" font-size="64">❓</text><text x="200" y="155" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="white">Scripture Trivia</text><text x="200" y="178" text-anchor="middle" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.6)">Test Your Bible Knowledge</text></svg>')}`,
  },
  {
    title: 'Flashcards',
    path: '/play/flashcards',
    age: 'Elementary',
    topic: ['Memory', 'Faith'],
    type: 'Interactive',
    thumbnail: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="230"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#312E81"/><stop offset="100%" stop-color="#6366F1"/></linearGradient></defs><rect width="400" height="230" fill="url(#g)"/><text x="200" y="100" text-anchor="middle" font-size="64">🧠</text><text x="200" y="155" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="white">Flashcards</text><text x="200" y="178" text-anchor="middle" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.6)">Memorize Scripture</text></svg>')}`,
  },
  {
    title: 'Activity Sheets',
    path: '/play/activity-sheets',
    age: 'Family',
    topic: ['Bible Stories', 'Faith'],
    type: 'Printable',
    thumbnail: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="230"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#065F46"/><stop offset="100%" stop-color="#14B8A6"/></linearGradient></defs><rect width="400" height="230" fill="url(#g)"/><text x="200" y="100" text-anchor="middle" font-size="64">🖨️</text><text x="200" y="155" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="white">Activity Sheets</text><text x="200" y="178" text-anchor="middle" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.6)">Printable Fun for Families</text></svg>')}`,
  },
  {
    title: 'David & Goliath Game',
    path: '/play/game/david-goliath',
    age: 'Elementary',
    topic: ['Old Testament', 'Heroes'],
    type: 'Online Game',
    thumbnail: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="230"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#831843"/><stop offset="100%" stop-color="#EC4899"/></linearGradient></defs><rect width="400" height="230" fill="url(#g)"/><text x="200" y="100" text-anchor="middle" font-size="64">🏹</text><text x="200" y="155" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="white">David &amp; Goliath</text><text x="200" y="178" text-anchor="middle" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.6)">Sling Stones of Faith</text></svg>')}`,
  },
  {
    title: 'Scripture Runner',
    path: '/play/game/runner',
    age: 'Elementary',
    topic: ['New Testament', 'Faith'],
    type: 'Online Game',
    thumbnail: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="230"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#064E3B"/><stop offset="100%" stop-color="#10B981"/></linearGradient></defs><rect width="400" height="230" fill="url(#g)"/><text x="200" y="100" text-anchor="middle" font-size="64">🏃</text><text x="200" y="155" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="white">Scripture Runner</text><text x="200" y="178" text-anchor="middle" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.6)">Collect Fruits of the Spirit</text></svg>')}`,
  },
]

function syncMultiParam(searchParams: URLSearchParams, key: string, values: string[]) {
  searchParams.delete(key)
  values.forEach((value) => searchParams.append(key, value))
}

function arrayFromParam(searchParams: URLSearchParams, key: string) {
  return searchParams.getAll(key).filter(Boolean)
}

export default function PlayLayout() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { kidsMode = false } = useKidsMode() || {}

  const ageFilter = arrayFromParam(searchParams, 'age')
  const topicFilter = arrayFromParam(searchParams, 'topic')
  const typeFilter = arrayFromParam(searchParams, 'type')

  const filteredItems = useMemo(() => {
    return PLAY_ITEMS.filter((item) => {
      const hasAge = !ageFilter.length || ageFilter.includes(item.age)
      const hasType = !typeFilter.length || typeFilter.includes(item.type)
      const hasTopic =
        !topicFilter.length || topicFilter.some((topic) => item.topic.includes(topic))
      return hasAge && hasType && hasTopic
    })
  }, [ageFilter, topicFilter, typeFilter])

  if (!PLAY_ITEMS) {
    return <SectionError message="Unable to load Play items" />
  }

  if (PLAY_ITEMS.length === 0) {
    return <SectionLoading />
  }

  const effectiveAgeOptions = kidsMode
    ? AGE_OPTIONS.filter((opt) => opt.value !== 'Family')
    : AGE_OPTIONS

  const effectiveTopicOptions = kidsMode
    ? TOPIC_OPTIONS.filter((t) => ['Old Testament', 'New Testament', 'Jesus', 'Heroes', 'Faith'].includes(t))
    : TOPIC_OPTIONS

  const onToggle = (field: 'age' | 'topic' | 'type', value: string) => {
    const existing = arrayFromParam(searchParams, field)
    const next = existing.includes(value)
      ? existing.filter((v) => v !== value)
      : [...existing, value]

    const nextParams = new URLSearchParams(searchParams.toString())
    syncMultiParam(nextParams, field, next)
    setSearchParams(nextParams, { replace: true })
  }

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete('age')
    nextParams.delete('topic')
    nextParams.delete('type')
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div style={{ padding: 18, minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Poppins,sans-serif' }}>
      <header style={{ marginBottom: 18 }}>
        <div style={{ display:'inline-block', fontSize:'.68rem', fontWeight:800, letterSpacing:'.5px', textTransform:'uppercase', padding:'4px 12px', borderRadius:100, background:'#EFF6FF', color:'#3B82F6', marginBottom:10 }}>🎮 Play Hub</div>
        <h1 style={{ margin: 0, fontFamily:"'Baloo 2',cursive", color: '#1E1B4B', fontSize: '2rem', fontWeight:800 }}>Games &amp; Activities</h1>
        <p style={{ margin: '6px 0 0', color: '#6B7280', fontSize:'.9rem' }}>
          Filter by age, topic and content type. Kids Mode: <strong style={{ color: kidsMode ? '#10B981' : '#6B7280' }}>{kidsMode ? 'On 🐣' : 'Off'}</strong>
        </p>
      </header>

      <section
        style={{
          background: kidsMode ? '#fff7ed' : 'linear-gradient(135deg,#F8FAFF,#EFF6FF)',
          borderRadius: 18,
          border: '1.5px solid #E0E7FF',
          padding: '16px 18px',
          marginBottom: 24,
          boxShadow: '0 2px 12px rgba(59,130,246,.06)',
        }}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', color: '#1e3a8a', marginBottom: 8, fontSize:'.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.5px' }}>👶 Age Group</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {effectiveAgeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onToggle('age', option.value)}
                  style={{
                    borderRadius: 999,
                    border: ageFilter.includes(option.value) ? '2px solid #3B82F6' : '1.5px solid #BFDBFE',
                    background: ageFilter.includes(option.value) ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : 'white',
                    color: ageFilter.includes(option.value) ? 'white' : '#1e3a8a',
                    padding: kidsMode ? '10px 16px' : '6px 12px',
                    fontSize: kidsMode ? '1rem' : '.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all .2s',
                    boxShadow: ageFilter.includes(option.value) ? '0 4px 12px rgba(59,130,246,.3)' : 'none',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', color: '#065f46', marginBottom: 8, fontSize:'.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.5px' }}>📖 Bible Topic</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {effectiveTopicOptions.map((topic) => (
                <button
                  key={topic}
                  onClick={() => onToggle('topic', topic)}
                  style={{
                    borderRadius: 999,
                    border: topicFilter.includes(topic) ? '2px solid #10B981' : '1.5px solid #A7F3D0',
                    background: topicFilter.includes(topic) ? 'linear-gradient(135deg,#10B981,#34D399)' : 'white',
                    color: topicFilter.includes(topic) ? 'white' : '#065f46',
                    padding: kidsMode ? '10px 16px' : '6px 12px',
                    fontSize: kidsMode ? '1rem' : '.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all .2s',
                    boxShadow: topicFilter.includes(topic) ? '0 4px 12px rgba(16,185,129,.3)' : 'none',
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 220px' }}>
            <label style={{ display: 'block', color: '#831843', marginBottom: 8, fontSize:'.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.5px' }}>🎯 Content Type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  onClick={() => onToggle('type', type)}
                  style={{
                    borderRadius: 999,
                    border: typeFilter.includes(type) ? '2px solid #EC4899' : '1.5px solid #FBCFE8',
                    background: typeFilter.includes(type) ? 'linear-gradient(135deg,#EC4899,#F472B6)' : 'white',
                    color: typeFilter.includes(type) ? 'white' : '#831843',
                    padding: kidsMode ? '10px 16px' : '6px 12px',
                    fontSize: kidsMode ? '1rem' : '.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all .2s',
                    boxShadow: typeFilter.includes(type) ? '0 4px 12px rgba(236,72,153,.3)' : 'none',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={clearFilters}
            style={{
              alignSelf: 'end',
              border: '1.5px solid #E5E7EB',
              background: 'white',
              color: '#6B7280',
              borderRadius: 10,
              padding: '8px 14px',
              fontWeight: 700,
              fontSize: '.82rem',
              cursor: 'pointer',
              transition: 'all .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#374151' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#6B7280' }}
          >
            ✕ Clear
          </button>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 14, fontFamily:"'Baloo 2',cursive", color: '#1E1B4B', fontSize:'1.3rem', fontWeight:800, display:'flex', alignItems:'center', gap:8 }}>
          🎯 Filter Results
          <span style={{ fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:99, background:'#EFF6FF', color:'#3B82F6' }}>{filteredItems.length} found</span>
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: kidsMode ? 'repeat(auto-fit,minmax(180px,1fr))' : 'repeat(auto-fit,minmax(240px,1fr))',
            gap: 12,
          }}
        >
          {filteredItems.map((item) => (
            <ContentCard
              key={item.path}
              thumbnail={item.thumbnail || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="230" viewBox="0 0 400 230"%3E%3Crect width="400" height="230" fill="%23EFF6FF"/%3E%3Ctext x="200" y="120" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%233B82F6"%3E🎮 Play%3C/text%3E%3C/svg%3E'}
              title={item.title}
              description={item.desc || `Age: ${item.age}, topic: ${item.topic?.join(', ')}`}
              bibleRef={item.bibleRef}
              age={item.age}
              difficulty={item.difficulty || 3}
              isPrintable={item.printable || false}
              seasonal={item.seasonal || null}
              link={item.path}
              cta="Play"
              tooltip={`Click to play — opens ${item.title} ↓`}
            />
          ))}

          {!filteredItems.length && (
            <div style={{ gridColumn: '1/-1', color: '#6b7280', textAlign: 'center', padding: 18 }}>
              No items match your filters.
            </div>
          )}
        </div>
      </section>

      <RelatedItems items={filteredItems.slice(0, 4).map((item) => ({
        title: item.title,
        description: item.desc || `Age: ${item.age} · ${item.topic?.join(', ')}`,
        thumbnail: item.thumbnail || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="230" viewBox="0 0 400 230"%3E%3Crect width="400" height="230" fill="%23F5F3FF"/%3E%3Ctext x="200" y="120" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%238B5CF6"%3E✨ Related%3C/text%3E%3C/svg%3E',
        bibleRef: item.bibleRef,
        ageGroup: item.age,
        to: item.path,
        cta: 'Play',
      }))} />

      <div style={{ marginTop: 14 }}>
        <Outlet />
      </div>
    </div>
  )
}
