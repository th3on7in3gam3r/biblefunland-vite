import { useMemo } from 'react'
import { Outlet, useSearchParams, useMatch } from 'react-router-dom'
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

const EXPLORE_ITEMS = [
  {
    title: 'Bible Explorer',
    path: '/explore/bible',
    age: 'Family',
    topic: ['Old Testament', 'New Testament', 'Jesus'],
    type: 'Interactive',
    bibleRef: 'Hebrews 4:12',
    desc: 'Read, search & bookmark scripture across 100+ translations',
    difficulty: 2,
  },
  {
    title: 'Bible Map',
    path: '/explore/map',
    age: 'Family',
    topic: ['History', 'Geography'],
    type: 'Interactive',
    bibleRef: 'Joshua 1:3',
    desc: 'Interactive geography — trace the journeys of Moses, Paul & Jesus',
    difficulty: 2,
  },
  {
    title: 'Bible Timeline',
    path: '/explore/timeline',
    age: 'Family',
    topic: ['Old Testament', 'New Testament'],
    type: 'Interactive',
    bibleRef: 'Ecclesiastes 3:1',
    desc: 'From Creation to Revelation — 6,000 years of sacred history',
    difficulty: 2,
  },
  {
    title: 'Original Languages',
    path: '/explore/language-explorer',
    age: 'Tweens',
    topic: ['Hebrew', 'Greek', 'Bible Stories'],
    type: 'AI Tool',
    bibleRef: 'Proverbs 2:6',
    desc: 'Explore Hebrew & Greek roots of scripture with AI explanations',
    difficulty: 4,
  },
  {
    title: 'Cross Reference',
    path: '/explore/cross-reference',
    age: 'Family',
    topic: ['Scripture', 'Study'],
    type: 'Printable',
    bibleRef: '2 Timothy 3:16',
    desc: 'Find connected verses across the entire Bible instantly',
    difficulty: 3,
  },
  {
    title: 'Voice Bible Reader',
    path: '/explore/voice-reader',
    age: 'Family',
    topic: ['Scripture', 'Memory'],
    type: 'Interactive',
    bibleRef: 'Psalm 119:11',
    desc: 'Read scripture aloud — AI grades your accuracy word by word',
    difficulty: 2,
  },
]

function syncMultiParam(searchParams: URLSearchParams, key: string, values: string[]) {
  searchParams.delete(key)
  values.forEach((value) => searchParams.append(key, value))
}

function arrayFromParam(searchParams: URLSearchParams, key: string) {
  return searchParams.getAll(key).filter(Boolean)
}

export default function ExploreLayout() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { kidsMode = false } = useKidsMode() || {}
  const isIndex = useMatch('/explore')

  // Sub-routes (world, map, timeline, etc.) render full-page — no layout wrapper
  if (!isIndex) {
    return <Outlet />
  }

  const ageFilter = arrayFromParam(searchParams, 'age')
  const topicFilter = arrayFromParam(searchParams, 'topic')
  const typeFilter = arrayFromParam(searchParams, 'type')

  const filteredItems = useMemo(() => {
    return EXPLORE_ITEMS.filter((item) => {
      const hasAge = !ageFilter.length || ageFilter.includes(item.age)
      const hasType = !typeFilter.length || typeFilter.includes(item.type)
      const hasTopic =
        !topicFilter.length || topicFilter.some((topic) => item.topic.includes(topic))
      return hasAge && hasType && hasTopic
    })
  }, [ageFilter, topicFilter, typeFilter])

  if (!EXPLORE_ITEMS) {
    return <SectionError message="Unable to load Explore items" />
  }

  if (EXPLORE_ITEMS.length === 0) {
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
        <div style={{ display:'inline-block', fontSize:'.68rem', fontWeight:800, letterSpacing:'.5px', textTransform:'uppercase', padding:'4px 12px', borderRadius:100, background:'#ECFDF5', color:'#10B981', marginBottom:10 }}>🔍 Explore Hub</div>
        <h1 style={{ margin: 0, fontFamily:"'Baloo 2',cursive", color: '#064E3B', fontSize: '2rem', fontWeight:800 }}>Bible Study Tools</h1>
        <p style={{ margin: '6px 0 0', color: '#6B7280', fontSize:'.9rem' }}>
          Filter by age, topic and content type. Kids Mode: <strong style={{ color: kidsMode ? '#10B981' : '#6B7280' }}>{kidsMode ? 'On 🐣' : 'Off'}</strong>
        </p>
      </header>

      <section style={{
        background: kidsMode ? '#ECFDF5' : 'linear-gradient(135deg,#F0FDF4,#ECFDF5)',
        borderRadius: 18, border: '1.5px solid #A7F3D0',
        padding: '16px 18px', marginBottom: 24,
        boxShadow: '0 2px 12px rgba(16,185,129,.06)',
      }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', color: '#065f46', marginBottom: 8, fontSize:'.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.5px' }}>👶 Age Group</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {effectiveAgeOptions.map((opt) => (
                <button key={opt.value} onClick={() => onToggle('age', opt.value)}
                  style={{
                    borderRadius: 999, fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
                    border: ageFilter.includes(opt.value) ? '2px solid #10B981' : '1.5px solid #A7F3D0',
                    background: ageFilter.includes(opt.value) ? 'linear-gradient(135deg,#10B981,#34D399)' : 'white',
                    color: ageFilter.includes(opt.value) ? 'white' : '#065f46',
                    padding: kidsMode ? '10px 16px' : '6px 12px',
                    fontSize: kidsMode ? '1rem' : '.82rem',
                    boxShadow: ageFilter.includes(opt.value) ? '0 4px 12px rgba(16,185,129,.3)' : 'none',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', color: '#0f766e', marginBottom: 8, fontSize:'.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.5px' }}>📖 Bible Topic</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {effectiveTopicOptions.map((topic) => (
                <button key={topic} onClick={() => onToggle('topic', topic)}
                  style={{
                    borderRadius: 999, fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
                    border: topicFilter.includes(topic) ? '2px solid #0F766E' : '1.5px solid #99F6E4',
                    background: topicFilter.includes(topic) ? 'linear-gradient(135deg,#0F766E,#14B8A6)' : 'white',
                    color: topicFilter.includes(topic) ? 'white' : '#0f766e',
                    padding: kidsMode ? '10px 16px' : '6px 12px',
                    fontSize: kidsMode ? '1rem' : '.82rem',
                    boxShadow: topicFilter.includes(topic) ? '0 4px 12px rgba(15,118,110,.3)' : 'none',
                  }}>
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 220px' }}>
            <label style={{ display: 'block', color: '#7f1d1d', marginBottom: 8, fontSize:'.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.5px' }}>🎯 Content Type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TYPE_OPTIONS.map((type) => (
                <button key={type} onClick={() => onToggle('type', type)}
                  style={{
                    borderRadius: 999, fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
                    border: typeFilter.includes(type) ? '2px solid #EC4899' : '1.5px solid #FBCFE8',
                    background: typeFilter.includes(type) ? 'linear-gradient(135deg,#EC4899,#F472B6)' : 'white',
                    color: typeFilter.includes(type) ? 'white' : '#7f1d1d',
                    padding: kidsMode ? '10px 16px' : '6px 12px',
                    fontSize: kidsMode ? '1rem' : '.82rem',
                    boxShadow: typeFilter.includes(type) ? '0 4px 12px rgba(236,72,153,.3)' : 'none',
                  }}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button onClick={clearFilters}
            style={{ alignSelf: 'end', border: '1.5px solid #E5E7EB', background: 'white', color: '#6B7280', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
          >
            ✕ Clear
          </button>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 14, fontFamily:"'Baloo 2',cursive", color: '#064E3B', fontSize:'1.3rem', fontWeight:800, display:'flex', alignItems:'center', gap:8 }}>
          🔍 Filter Results
          <span style={{ fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:99, background:'#ECFDF5', color:'#10B981' }}>{filteredItems.length} found</span>
        </h2>
        <div style={{
          display: 'grid', gap: 14,
          gridTemplateColumns: kidsMode ? 'repeat(auto-fit,minmax(220px,1fr))' : 'repeat(auto-fit,minmax(280px,1fr))',
        }}>
          {filteredItems.map((item) => (
            <ContentCard
              key={item.path}
              title={item.title}
              description={item.desc || `Age: ${item.age}, topic: ${item.topic?.join(', ')}`}
              bibleRef={item.bibleRef}
              age={item.age}
              difficulty={item.difficulty || 2}
              isPrintable={item.printable || false}
              seasonal={item.seasonal || null}
              link={item.path}
              cta="Explore"
              tooltip={`Click to explore — opens ${item.title} ↓`}
            />
          ))}
        </div>
        {!filteredItems.length && (
          <div style={{ marginTop: 14, color: '#6b7280', textAlign: 'center', padding: 24 }}>No matching explore items.</div>
        )}
      </section>

      <RelatedItems items={filteredItems.slice(0, 4).map((item) => ({
        title: item.title,
        description: item.desc || `Age: ${item.age} · ${item.topic?.join(', ')}`,
        bibleRef: item.bibleRef,
        ageGroup: item.age,
        to: item.path,
        cta: 'Explore',
      }))} />

      <Outlet />
    </div>
  )
}
