import { useState, useCallback } from 'react'
import { useBibleVerse } from '../hooks/useBibleVerse'

const POPULAR = ['love','faith','hope','fear','peace','strength','forgiveness','prayer','grace','salvation','joy','wisdom','truth','light','shepherd']
const BOOKS_OT = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi']
const BOOKS_NT = ['Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation']

// Fallback sample results for demo when no API key
const SAMPLE_RESULTS = {
  love: [
    { reference:'John 3:16', text:'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
    { reference:'1 Corinthians 13:4', text:'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.' },
    { reference:'Romans 8:38-39', text:'For I am convinced that neither death nor life... will be able to separate us from the love of God that is in Christ Jesus our Lord.' },
    { reference:'1 John 4:8', text:'Whoever does not love does not know God, because God is love.' },
    { reference:'John 15:13', text:'Greater love has no one than this: to lay down one\'s life for one\'s friends.' },
  ],
  faith: [
    { reference:'Hebrews 11:1', text:'Now faith is confidence in what we hope for and assurance about what we do not see.' },
    { reference:'Romans 1:17', text:'For in the gospel the righteousness of God is revealed — a righteousness that is by faith from first to last.' },
    { reference:'James 2:17', text:'In the same way, faith by itself, if it is not accompanied by action, is dead.' },
    { reference:'Ephesians 2:8', text:'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God.' },
  ],
  fear: [
    { reference:'Isaiah 41:10', text:'Do not fear, for I am with you; do not be dismayed, for I am your God.' },
    { reference:'Joshua 1:9', text:'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
    { reference:'Psalm 23:4', text:'Even though I walk through the darkest valley, I will fear no evil, for you are with me.' },
    { reference:'2 Timothy 1:7', text:'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.' },
  ],
}

export default function BibleSearch() {
  const [query, setQuery] = useState('')
  const [bookFilter, setBookFilter] = useState('All')
  const [testament, setTestament] = useState('All')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiKey] = useState(() => import.meta.env.VITE_BIBLE_API_KEY || '')
  const { searchBible } = useBibleVerse()

  async function search(q = query) {
    if (!q.trim()) return
    setLoading(true)
    setResults(null)
    try {
      if (apiKey) {
        const data = await searchBible(q)
        setResults(data?.verses || data?.data?.verses || [])
      } else {
        // Demo fallback
        await new Promise(r => setTimeout(r, 600))
        const key = q.toLowerCase().trim()
        const demo = SAMPLE_RESULTS[key] || [
          { reference:'Psalm 119:105', text:'Your word is a lamp for my feet, a light on my path.' },
          { reference:'2 Timothy 3:16', text:'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.' },
          { reference:'Proverbs 3:5-6', text:'Trust in the Lord with all your heart and lean not on your own understanding.' },
        ]
        setResults(demo.filter(r => bookFilter === 'All' || r.reference.startsWith(bookFilter)))
      }
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const displayBooks = testament === 'All' ? [...BOOKS_OT, ...BOOKS_NT] : testament === 'OT' ? BOOKS_OT : BOOKS_NT

  function highlight(text, q) {
    if (!q.trim()) return text
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} style={{ background:'rgba(252,211,77,.3)', color:'var(--ink)', borderRadius:3, padding:'0 2px' }}>{part}</mark> : part
    )
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0F0F1A,#0A1A0F)', padding:'48px 36px 36px', textAlign:'center' }}>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, background:'linear-gradient(90deg,#6EE7B7,#60A5FA,#A5B4FC)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>
          🔍 Bible Search
        </h1>
        <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.88rem', fontWeight:500 }}>
          Search any word, phrase, or topic across all 66 books of the Bible.
        </p>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 20px' }}>
        {/* Search bar */}
        <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:'20px 22px', marginBottom:16, boxShadow:'var(--sh)' }}>
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            <input className="input-field" placeholder='Search the Bible: "peace", "do not fear", "John 3:16"...' value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} style={{ flex:1, fontSize:'1rem', borderRadius:12 }} autoFocus />
            <button className="btn btn-green" onClick={() => search()} disabled={!query.trim() || loading} style={{ padding:'11px 22px', whiteSpace:'nowrap' }}>
              {loading ? '⏳' : '🔍 Search'}
            </button>
          </div>
          {/* Popular searches */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:'.68rem', fontWeight:700, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:.5 }}>Popular:</span>
            {POPULAR.map(w => <button key={w} onClick={() => { setQuery(w); search(w) }} style={{ fontSize:'.7rem', fontWeight:600, padding:'4px 10px', borderRadius:100, border:'1.5px solid var(--border)', background:'var(--bg2)', color:'var(--ink2)', cursor:'pointer', transition:'all .2s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--green)';e.currentTarget.style.color='var(--green)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--ink2)'}}>{w}</button>)}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', gap:7 }}>
            {['All','OT','NT'].map(t => <button key={t} onClick={() => setTestament(t)} style={{ fontSize:'.74rem', fontWeight:700, padding:'6px 14px', borderRadius:100, cursor:'pointer', border:`1.5px solid ${testament===t?'var(--blue)':'var(--border)'}`, background:testament===t?'var(--blue)':'var(--surface)', color:testament===t?'white':'var(--ink3)', transition:'all .2s' }}>{t === 'All' ? 'All Books' : t === 'OT' ? 'Old Testament' : 'New Testament'}</button>)}
          </div>
          <select className="input-field" value={bookFilter} onChange={e => setBookFilter(e.target.value)} style={{ flex:1, maxWidth:200, fontSize:'.82rem' }}>
            <option value="All">All Books</option>
            <optgroup label="Old Testament">{BOOKS_OT.map(b => <option key={b}>{b}</option>)}</optgroup>
            <optgroup label="New Testament">{BOOKS_NT.map(b => <option key={b}>{b}</option>)}</optgroup>
          </select>
          {results && <span style={{ fontSize:'.74rem', color:'var(--ink3)', fontWeight:600, marginLeft:'auto' }}>{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</span>}
        </div>

        {!apiKey && (
          <div style={{ background:'var(--orange-bg)', border:'1.5px solid var(--orange)', borderRadius:14, padding:'11px 16px', marginBottom:16, fontSize:'.78rem', color:'var(--ink2)', fontWeight:500 }}>
            ⚠️ <strong>API key not set.</strong> Showing demo results. Add <code>VITE_BIBLE_API_KEY</code> to .env for full Bible search via scripture.api.bible (free).
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <div style={{ fontSize:'3rem', marginBottom:10, animation:'spin 1s linear infinite', display:'inline-block' }}>📖</div>
            <p style={{ color:'var(--ink3)', fontWeight:600 }}>Searching Scripture...</p>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          results.length === 0 ? (
            <div style={{ background:'var(--surface)', borderRadius:20, border:'1.5px solid var(--border)', padding:40, textAlign:'center' }}>
              <div style={{ fontSize:'3rem', opacity:.3, marginBottom:12 }}>📭</div>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.1rem', fontWeight:800, color:'var(--ink)', marginBottom:8 }}>No results found</div>
              <p style={{ fontSize:'.84rem', color:'var(--ink3)' }}>Try a different word or phrase. Use simple keywords for best results.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {results.map((verse, i) => (
                <div key={i} style={{ background:'var(--surface)', borderRadius:18, border:'1.5px solid var(--border)', padding:'18px 22px', transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.08)';e.currentTarget.style.borderColor='var(--green)'}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor='var(--border)'}}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, gap:12 }}>
                    <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'.95rem', fontWeight:800, color:'var(--green)' }}>{verse.reference || verse.bookname}</div>
                    <button onClick={() => navigator.clipboard.writeText(`${verse.text || verse.verse} — ${verse.reference || verse.bookname}`)} style={{ background:'none', border:'none', color:'var(--ink3)', cursor:'pointer', fontSize:'.72rem', fontWeight:700, padding:'4px 10px', borderRadius:8, transition:'all .2s' }} onMouseEnter={e=>e.currentTarget.style.color='var(--blue)'} onMouseLeave={e=>e.currentTarget.style.color='var(--ink3)'}>
                      📋 Copy
                    </button>
                  </div>
                  <div style={{ fontSize:'.92rem', color:'var(--ink)', lineHeight:1.8, fontWeight:500 }}>
                    {highlight(verse.text || verse.verse || '', query)}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Empty state */}
        {!results && !loading && (
          <div style={{ textAlign:'center', paddingTop:40 }}>
            <div style={{ fontSize:'5rem', opacity:.15, marginBottom:16 }}>📖</div>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.3rem', fontWeight:800, color:'var(--ink)', marginBottom:8 }}>Search All 66 Books</div>
            <p style={{ fontSize:'.88rem', color:'var(--ink3)', maxWidth:400, margin:'0 auto' }}>Enter a word, phrase, or reference above. Results highlight your search term in context.</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
