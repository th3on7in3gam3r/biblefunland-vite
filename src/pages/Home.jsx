import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStreak } from '../context/StreakContext'
import { AdBanner, AdInContent } from '../components/AdUnit'
import { useKidsMode } from '../context/KidsModeContext'

// ── Reveal-on-scroll hook ──────────────────────────────
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

// ── Rotating verse of the day ──────────────────────────
const DAILY_VERSES = [
  { text: 'For I know the plans I have for you, declares the Lord — plans to prosper you and not to harm you, plans to give you hope and a future.', ref: 'Jeremiah 29:11' },
  { text: 'I can do all this through him who gives me strength.', ref: 'Philippians 4:13' },
  { text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', ref: 'Joshua 1:9' },
  { text: 'Trust in the Lord with all your heart and lean not on your own understanding.', ref: 'Proverbs 3:5' },
  { text: 'The Lord is my shepherd, I lack nothing.', ref: 'Psalm 23:1' },
  { text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.', ref: 'Isaiah 40:31' },
  { text: 'And we know that in all things God works for the good of those who love him.', ref: 'Romans 8:28' },
]

// ── Data ──────────────────────────────────────────────
const NEW_FEATURES = [
  { icon: '🎵', label: 'NEW', title: 'Bible Rap Generator', desc: 'AI writes a scripture rap, gospel song, or worship track in your chosen style', to: '/ai/rap-generator', color: '#A855F7', glow: 'rgba(168,85,247,.3)' },
  { icon: '🧬', label: 'NEW', title: 'What Bible Character Are You?', desc: '10 deep questions reveal your biblical identity — Moses, David, Ruth, or Solomon', to: '/quiz/character', color: '#F97316', glow: 'rgba(249,115,22,.3)' },
  { icon: '🎙️', label: 'NEW', title: 'Voice Bible Reader', desc: 'Read a verse aloud. Your browser grades your accuracy word-by-word', to: '/voice-reader', color: '#3B82F6', glow: 'rgba(59,130,246,.3)' },
  { icon: '🌍', label: 'NEW', title: 'Global Prayer Map', desc: 'See real-time prayer pins lighting up from every nation on earth', to: '/prayer-map', color: '#10B981', glow: 'rgba(16,185,129,.3)' },
]

const GAMES = [
  { icon: '❓', title: 'Scripture Trivia', desc: 'Timed rounds · 3 difficulty levels · 30 questions', to: '/trivia', color: '#3B82F6', chips: ['Quiz', 'All Ages'] },
  { icon: '🏹', title: 'David & Goliath', desc: 'Sling stones of faith · 5 levels · Phaser.js engine', to: '/game/david-goliath', color: '#EC4899', chips: ['Action', 'Kids Fav'] },
  { icon: '🏃', title: 'Scripture Runner', desc: 'Jump over sin · Collect Fruits of the Spirit · Endless runner', to: '/game/runner', color: '#10B981', chips: ['Endless', 'Fun'] },
  { icon: '🧩', title: 'Parable Escape Room', desc: "Solve riddles to escape the whale, lion's den & burning bush", to: '/game/escape-room', color: '#F97316', chips: ['Riddles', 'Story'] },
  { icon: '🎰', title: 'Spin the Verse', desc: 'Match 3 themes = jackpot devotional. Every spin gets a verse!', to: '/game/spin-the-verse', color: '#8B5CF6', chips: ['Daily', 'Devotion'] },
  { icon: '📅', title: 'Daily Challenge', desc: 'New scramble, riddle, or fill-in-the-blank every 24 hours', to: '/challenge', color: '#14B8A6', chips: ['Daily', 'Streak'] },
]

const AI_TOOLS = [
  { icon: '🙏', title: 'AI Devotional', desc: 'Type a verse or topic — Claude writes a full personalized devotional', to: '/devotional', color: '#8B5CF6' },
  { icon: '💑', title: "Couple's Devotional", desc: 'AI-generated devotions specifically for relationships and marriage growth', to: '/couples-devotional', color: '#EC4899' },
  { icon: '💬', title: 'Bible Character Chat', desc: 'Have a real conversation with David, Moses, Paul, Esther, Mary, or Noah', to: '/chat/characters', color: '#EC4899' },
  { icon: '🎵', title: 'Bible Rap Generator', desc: 'Rap, gospel, spoken word, worship song — all based on your verse', to: '/ai/rap-generator', color: '#A855F7' },
  { icon: '🖼️', title: 'Miracle Art Generator', desc: 'Describe a Bible scene — get a painting description + Midjourney prompt', to: '/ai/miracle-art', color: '#F97316' },
]

const SOUL_TOOLS = [
  { icon: '📿', title: 'Digital Prayer Beads', desc: 'Guided breathing meditation through 10 scriptures. Peaceful and powerful.', to: '/prayer-beads', color: '#6366F1' },
  { icon: '⏳', title: 'Fasting Tracker', desc: 'Plan and track your spiritual fasts with scripture reminders and health tips', to: '/fasting', color: '#F59E0B' },
  { icon: '🎸', title: 'Worship Discovery', desc: 'Find new vertical music based on your current spiritual mood or theme', to: '/worship', color: '#8B5CF6' },
  { icon: '🗣️', title: 'Encouragement Wall', desc: 'Share struggles anonymously. Receive only scripture and kindness in return.', to: '/encouragement', color: '#EC4899' },
  { icon: '🎓', title: 'Bible Certification', desc: 'Complete courses, pass quizzes, earn real printable certificates for your shelf.', to: '/certification', color: '#F59E0B' },
  { icon: '🌍', title: 'Global Prayer Map', desc: 'A live world map showing prayers from every nation in real time.', to: '/prayer-map', color: '#10B981' },
]

const LEARNING_TOOLS = [
  { icon: '🌳', title: 'Bible Family Tree', desc: 'Trace the lineage from Adam to Jesus in an interactive massive visual tree', to: '/family-tree', color: '#10B981' },
  { icon: '⌨️', title: 'Scripture Typing', desc: 'Memorize verses by typing them out. Great for muscle memory and accuracy.', to: '/scripture-typing', color: '#6366F1' },
  { icon: '🗺️', title: 'Interactive Bible Map', desc: 'Explore 7 key biblical locations with rich story context', to: '/map', color: '#10B981' },
  { icon: '🧠', title: 'Memory Flashcards', desc: '10 key scriptures with 3D flip cards and Known/Review tracking', to: '/flashcards', color: '#3B82F6' },
  { icon: '🎙️', title: 'Voice Bible Reader', desc: 'Practice scripture recitation and get instant word-by-word feedback', to: '/voice-reader', color: '#3B82F6' },
  { icon: '📝', title: 'Sermon Notes', desc: 'Rich text editor with auto-save and sidebar history', to: '/notes', color: '#F97316' },
  { icon: '🔗', title: 'Verse Share Cards', desc: 'Canvas-based verse graphics in 6 beautiful themes to download', to: '/share', color: '#EC4899' },
  { icon: '🖨️', title: 'Activity Sheets', desc: 'Printable word search, coloring, crossword, maze & more', to: '/activity-sheets', color: '#14B8A6' },
]

const COMMUNITY = [
  { icon: '🙏', title: 'Prayer Wall', desc: 'Realtime community prayer with live sync', to: '/prayer', color: '#10B981' },
  { icon: '💬', title: 'Chat Rooms', desc: '6 rooms by topic — Family, Youth, Worship, Testimony & more', to: '/community/chat', color: '#8B5CF6' },
  { icon: '👨‍👩‍👧', title: 'Family Groups', desc: 'Create or join a family group with invite codes & leaderboards', to: '/community/family', color: '#EC4899' },
  { icon: '⛪', title: 'Church Calendar', desc: 'Post and discover local church events near you', to: '/community/events', color: '#F59E0B' },
]

const STATS = [
  { n: '30+', l: 'Features', color: '#60A5FA' },
  { n: '12',  l: 'Bible Games', color: '#C084FC' },
  { n: 'AI',  l: 'Powered Tools', color: '#F472B6' },
  { n: '🆓',  l: 'Always Free', color: '#4ADE80' },
]

// ── Components ────────────────────────────────────────

function SectionPill({ color, bg, children }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.72rem', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, background: bg, color, marginBottom: 12 }}>
      {children}
    </div>
  )
}

function SectionHeader({ pill, pillColor, pillBg, title, sub }) {
  return (
    <div className="reveal" style={{ textAlign: 'center', marginBottom: 36 }}>
      <SectionPill color={pillColor} bg={pillBg}>{pill}</SectionPill>
      <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.6rem,3.5vw,2.6rem)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2, marginBottom: sub ? 10 : 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: '.9rem', color: 'var(--ink3)', fontWeight: 500, maxWidth: 520, margin: '0 auto' }}>{sub}</p>}
    </div>
  )
}

export default function Home() {
  useReveal()
  const { streak, checkedToday, checkIn } = useStreak()
  const { kidsMode } = useKidsMode()
  const todayVerse = DAILY_VERSES[new Date().getDay()]
  const [heroParticles] = useState(() =>
    Array.from({ length: 22 }, (_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 3 + Math.random() * 8,
      color: ['#60A5FA','#F472B6','#34D399','#FCD34D','#C084FC','#FB923C'][i % 6],
      dur: 5 + Math.random() * 7,
      delay: Math.random() * -8,
      opacity: 0.3 + Math.random() * 0.35,
    }))
  )

  return (
    <div style={{ background: 'var(--bg)', fontFamily: 'Poppins,sans-serif', overflowX: 'hidden' }}>

      {/* ═══════════════════════════════════════════════
      {/* ═══════════════════════════════════════════════
          HERO — switches between Adult + Kids Mode
      ═══════════════════════════════════════════════ */}
      {kidsMode ? (
        /* ── KIDS HERO ─────────────────────────────── */
        <section style={{ position:'relative', minHeight:'92vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'80px 24px 60px', textAlign:'center', background:'linear-gradient(180deg,#1A4FD6 0%,#2563EB 40%,#7C3AED 100%)' }}>
          {/* Clouds */}
          {[{l:'5%',t:'12%',s:180},{l:'70%',t:'8%',s:140},{l:'40%',t:'18%',s:200},{l:'15%',t:'55%',s:120},{l:'78%',t:'50%',s:160}].map((c,i)=>(
            <div key={i} style={{ position:'absolute', left:c.l, top:c.t, width:c.s, height:c.s*0.45, borderRadius:'50%', background:'rgba(255,255,255,.15)', animation:`cloud ${8+i*1.5}s ease-in-out ${i*-2}s infinite alternate`, pointerEvents:'none', zIndex:0 }} />
          ))}
          {/* Stars */}
          {Array.from({length:20},(_,i)=>({l:Math.random()*100,t:Math.random()*70,s:4+Math.random()*8})).map((s,i)=>(
            <div key={i} style={{ position:'absolute', left:`${s.l}%`, top:`${s.t}%`, width:s.s, height:s.s, borderRadius:'50%', background:'white', opacity:.6+Math.random()*.4, animation:`twinkle ${2+Math.random()*3}s ease-in-out ${Math.random()*-4}s infinite`, pointerEvents:'none', zIndex:0 }} />
          ))}
          {/* Rainbow arc */}
          <div style={{ position:'absolute', bottom:-80, left:'50%', transform:'translateX(-50%)', width:700, height:350, borderRadius:'50% 50% 0 0', background:'transparent', border:'28px solid transparent', borderImage:'linear-gradient(90deg,#EF4444,#F97316,#FCD34D,#22C55E,#3B82F6,#8B5CF6) 1', opacity:.35, pointerEvents:'none', zIndex:0 }} />
          {/* Floating animals */}
          {[['🦁','8%','65%','bobL'],['🐑','86%','60%','bobR'],['🐋','3%','25%','bobL'],['🦅','88%','18%','bobR'],['🐟','50%','80%','bobL'],['🕊️','45%','10%','bobR']].map(([e,l,t,a],i)=>(
            <div key={i} style={{ position:'absolute', left:l, top:t, fontSize:'2.2rem', animation:`${a} ${3+i*.5}s ease-in-out ${i*-.7}s infinite`, pointerEvents:'none', zIndex:1, filter:'drop-shadow(0 4px 8px rgba(0,0,0,.2))' }}>{e}</div>
          ))}
          {/* Content */}
          <div style={{ position:'relative', zIndex:2, maxWidth:700 }}>
            <div style={{ fontSize:'clamp(3.5rem,10vw,6rem)', marginBottom:12, animation:'bounceIn .7s ease both', filter:'drop-shadow(0 6px 20px rgba(0,0,0,.2))' }}>✝️</div>
            <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2.2rem,7vw,4.5rem)', fontWeight:800, color:'white', lineHeight:1.05, marginBottom:16, textShadow:'0 4px 20px rgba(0,0,0,.3)', animation:'fadeUp .7s .1s ease both' }}>
              Bible Fun<br />
              <span style={{ background:'linear-gradient(90deg,#FCD34D,#FDE68A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>for Kids! 🎉</span>
            </h1>
            <p style={{ fontSize:'clamp(1rem,3vw,1.3rem)', color:'rgba(255,255,255,.9)', fontWeight:700, lineHeight:1.6, marginBottom:36, textShadow:'0 2px 8px rgba(0,0,0,.2)', animation:'fadeUp .7s .2s ease both' }}>
              Games · Stories · Puzzles · Prayer 🙏<br/>All about God's amazing Word!
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:36, animation:'fadeUp .7s .3s ease both' }}>
              <Link to="/trivia" className="btn btn-lg" style={{ background:'#FCD34D', color:'#0A0A0A', border:'none', boxShadow:'0 8px 28px rgba(252,211,77,.4)', fontWeight:800, fontSize:'1rem', borderRadius:20 }}>🎮 Play Trivia!</Link>
              <Link to="/kids-stories" className="btn btn-lg" style={{ background:'white', color:'#3B82F6', border:'none', boxShadow:'0 8px 28px rgba(255,255,255,.3)', fontWeight:800, fontSize:'1rem', borderRadius:20 }}>📖 Bible Stories</Link>
              <Link to="/game/runner" className="btn btn-lg" style={{ background:'rgba(255,255,255,.15)', color:'white', border:'2px solid rgba(255,255,255,.4)', fontWeight:800, fontSize:'1rem', borderRadius:20 }}>🏃 Scripture Runner</Link>
            </div>
            {/* Fun feature pills */}
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', animation:'fadeUp .7s .4s ease both' }}>
              {['🎨 Activity Sheets','🧩 Escape Room','🏹 David & Goliath','🎰 Spin the Verse','🏆 Earn Badges','🌈 Prayer Beads'].map((pill,i)=>(
                <span key={i} style={{ fontSize:'.82rem', fontWeight:800, padding:'7px 16px', borderRadius:100, background:'rgba(255,255,255,.18)', color:'white', border:'1.5px solid rgba(255,255,255,.3)' }}>{pill}</span>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes cloud{from{transform:translateX(0) scale(1)}to{transform:translateX(18px) scale(1.04)}}
            @keyframes twinkle{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
            @keyframes bobL{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-14px) rotate(3deg)}}
            @keyframes bobR{0%,100%{transform:translateY(0) rotate(3deg)}50%{transform:translateY(-14px) rotate(-3deg)}}
            @keyframes bounceIn{0%{transform:scale(0) rotate(-15deg)}70%{transform:scale(1.2) rotate(5deg)}100%{transform:scale(1) rotate(0deg)}}
          `}</style>
        </section>
      ) : (
        /* ── ADULT HERO ─────────────────────────────── */
        <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '80px 24px 60px', textAlign: 'center' }}>
          {/* Deep gradient bg */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#0F0F1A 0%,#0D1B2A 35%,#1A0A2E 70%,#0D1F14 100%)', zIndex: 0 }} />
          {/* Mesh blobs */}
          <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,.14) 0%,transparent 70%)', top: '-20%', left: '-15%', zIndex: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,.1) 0%,transparent 70%)', bottom: '-10%', right: '-10%', zIndex: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)', top: '40%', left: '60%', zIndex: 0, pointerEvents: 'none' }} />
          {/* Floating particles */}
          {heroParticles.map((p, i) => (
            <div key={i} style={{ position: 'absolute', left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, borderRadius: '50%', background: p.color, opacity: p.opacity, animation: `floatP ${p.dur}s ease-in-out ${p.delay}s infinite`, zIndex: 0, pointerEvents: 'none' }} />
          ))}
          {/* Grid overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)', backgroundSize: '60px 60px', zIndex: 0, pointerEvents: 'none' }} />
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.72rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', background: 'rgba(99,102,241,.18)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,.25)', padding: '6px 18px', borderRadius: 100, marginBottom: 28, animation: 'fadeDown .6s ease both' }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80', animation: 'glow 2s ease-in-out infinite' }} />
              60+ Features · AI-Powered · 100% Free · Always Growing
            </div>
            <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2.4rem,7vw,5.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 22, animation: 'fadeUp .7s .1s ease both' }}>
              Where Faith<br />
              <span style={{ background: 'linear-gradient(90deg,#60A5FA,#C084FC,#F472B6,#FCD34D,#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200%', animation: 'gradShift 4s linear infinite' }}>
                Meets Fun
              </span>
            </h1>
            <p style={{ fontSize: 'clamp(.9rem,2vw,1.1rem)', color: 'rgba(255,255,255,.55)', fontWeight: 500, lineHeight: 1.75, marginBottom: 36, maxWidth: 580, margin: '0 auto 36px', animation: 'fadeUp .7s .2s ease both' }}>
              Bible games, AI devotionals, voice reading, global prayer map, escape rooms, certification, and so much more — all completely free for families who love God's Word.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48, animation: 'fadeUp .7s .3s ease both' }}>
              <Link to="/trivia" className="btn btn-lg" style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', color: 'white', border: 'none', boxShadow: '0 8px 30px rgba(99,102,241,.4)', fontWeight: 800, letterSpacing: .3 }}>🎮 Play Bible Trivia</Link>
              <Link to="/quiz/character" className="btn btn-lg" style={{ background: 'rgba(255,255,255,.08)', color: 'white', border: '1.5px solid rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', fontWeight: 700 }}>🧬 What Character Are You?</Link>
              <Link to="/ai/rap-generator" className="btn btn-lg" style={{ background: 'rgba(168,85,247,.15)', color: '#C084FC', border: '1.5px solid rgba(168,85,247,.25)', fontWeight: 700 }}>🎵 Bible Rap Generator</Link>
            </div>
            {/* Hero feature pills */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp .7s .4s ease both' }}>
              {['🌍 Global Prayer Map','📿 Prayer Beads','🏃 Scripture Runner','🎰 Spin the Verse','🧩 Escape Room','🎓 Certification'].map((pill, i) => (
                <span key={i} style={{ fontSize: '.7rem', fontWeight: 700, padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.1)' }}>{pill}</span>
              ))}
            </div>
          </div>
          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'fadeUp 1s .8s ease both' }}>
            <span style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.25)' }}>Scroll</span>
            <div style={{ width: 1.5, height: 40, background: 'linear-gradient(180deg,rgba(255,255,255,.3),transparent)', animation: 'scrollLine 2s ease-in-out infinite' }} />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════ */}
      <div style={{ background: 'linear-gradient(90deg,#0F0F1A,#1A0A2E,#0D1B2A)', borderTop: '1px solid rgba(255,255,255,.07)', borderBottom: '1px solid rgba(255,255,255,.07)', padding: '22px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }} className="home-grid-4">
          {STATS.map((s, i) => (
            <div key={i} className="reveal" style={{ textAlign: 'center', transitionDelay: `${i * .07}s` }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.n}</div>
              <div style={{ fontSize: '.68rem', fontWeight: 600, color: 'rgba(255,255,255,.35)', letterSpacing: .5, textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          STREAK + VERSE — Side by side
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20, alignItems: 'stretch' }} className="home-grid-streak">
          {/* Streak card */}
          <div className="reveal" style={{ background: 'linear-gradient(135deg,#1C1305,#2D1E00)', borderRadius: 24, border: '1.5px solid rgba(249,115,22,.2)', padding: '32px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 1px rgba(249,115,22,.05), 0 20px 60px rgba(249,115,22,.08)' }}>
            <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: 8, filter: 'drop-shadow(0 0 16px rgba(251,191,36,.5))', animation: streak > 0 ? 'flame 1.5s ease-in-out infinite' : 'none' }}>🔥</div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '4rem', fontWeight: 800, color: '#FCD34D', lineHeight: 1, marginBottom: 4, textShadow: '0 0 30px rgba(252,211,77,.3)' }}>{streak}</div>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'rgba(252,211,77,.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>Day Streak</div>
            <button onClick={checkIn} disabled={checkedToday} style={{ width: '100%', padding: '12px 0', borderRadius: 14, border: 'none', background: checkedToday ? 'rgba(255,255,255,.07)' : 'linear-gradient(135deg,#F97316,#FBBF24)', color: checkedToday ? 'rgba(255,255,255,.35)' : 'white', fontFamily: 'Poppins,sans-serif', fontSize: '.86rem', fontWeight: 800, cursor: checkedToday ? 'default' : 'pointer', transition: 'all .2s', boxShadow: checkedToday ? 'none' : '0 4px 20px rgba(249,115,22,.35)' }}>
              {checkedToday ? '✅ Checked In Today!' : '✅ Check In Today'}
            </button>
          </div>

          {/* Verse of the Day */}
          <div className="reveal" style={{ background: 'linear-gradient(135deg,#0D1B2A,#1E1B4B)', borderRadius: 24, border: '1.5px solid rgba(99,102,241,.2)', padding: '32px 36px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(99,102,241,.05), 0 20px 60px rgba(99,102,241,.08)' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '9rem', opacity: .04, lineHeight: 1, userSelect: 'none', fontFamily: 'Georgia,serif' }}>"</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.68rem', fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', background: 'rgba(252,211,77,.12)', color: '#FCD34D', border: '1px solid rgba(252,211,77,.2)', padding: '4px 12px', borderRadius: 100, marginBottom: 18 }}>☀️ Verse of the Day</div>
            <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1rem,2.2vw,1.3rem)', fontWeight: 700, color: 'white', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 16 }}>
              "{todayVerse.text}"
            </p>
            <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'rgba(165,180,252,.7)' }}>— {todayVerse.ref}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
              <Link to="/share" style={{ fontSize: '.76rem', fontWeight: 700, padding: '7px 16px', borderRadius: 10, background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.1)', textDecoration: 'none', transition: 'all .2s' }}>🔗 Share Card</Link>
              <Link to="/devotional" style={{ fontSize: '.76rem', fontWeight: 700, padding: '7px 16px', borderRadius: 10, background: 'rgba(99,102,241,.2)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,.2)', textDecoration: 'none', transition: 'all .2s' }}>🙏 Get Devotional</Link>
              <Link to="/prayer-beads" style={{ fontSize: '.76rem', fontWeight: 700, padding: '7px 16px', borderRadius: 10, background: 'rgba(168,85,247,.15)', color: '#C084FC', border: '1px solid rgba(168,85,247,.2)', textDecoration: 'none', transition: 'all .2s' }}>📿 Meditate</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NEVER DONE BEFORE — SPOTLIGHT
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', background: 'linear-gradient(180deg,#0A0A16 0%,#0D0D1A 100%)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeader
            pill="✨ Never Done Before on a Bible Site"
            pillColor="#A5B4FC"
            pillBg="rgba(165,180,252,.12)"
            title="Features That Have Never Existed"
            sub="We built things no Christian website has ever shipped. These are genuinely new."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }} className="home-grid-2">
            {NEW_FEATURES.map((f, i) => (
              <Link key={i} to={f.to} className="reveal" style={{ textDecoration: 'none', display: 'block', transitionDelay: `${i * .07}s` }}>
                <div style={{ borderRadius: 22, border: `1.5px solid ${f.color}33`, background: `linear-gradient(135deg,${f.color}10,${f.color}05,transparent)`, padding: '28px 26px', height: '100%', transition: 'all .3s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 60px ${f.glow}`; e.currentTarget.style.borderColor = f.color + '66'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = f.color + '33'; e.currentTarget.style.transform = '' }}>
                  <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '.6rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', background: f.color, color: 'white', padding: '3px 9px', borderRadius: 100 }}>{f.label}</div>
                  <div style={{ fontSize: '2.8rem', marginBottom: 14, filter: `drop-shadow(0 0 12px ${f.color}66)` }}>{f.icon}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.15rem', fontWeight: 800, color: 'white', marginBottom: 8, lineHeight: 1.3 }}>{f.title}</div>
                  <div style={{ fontSize: '.84rem', color: 'rgba(255,255,255,.45)', fontWeight: 500, lineHeight: 1.65 }}>{f.desc}</div>
                  <div style={{ marginTop: 18, fontSize: '.76rem', fontWeight: 800, color: f.color }}>Try it now →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AdSense: Between Never Done Before and Games */}
      <div style={{ padding: '0 24px', maxWidth: 960, margin: '0 auto' }}>
        <AdBanner />
      </div>

      {/* ═══════════════════════════════════════════════
          GAMES ARCADE
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeader
            pill="🎮 Games Arcade"
            pillColor="#60A5FA"
            pillBg="rgba(96,165,250,.12)"
            title="Play Your Way Through Scripture"
            sub="6 fully-built games — from action to puzzle to endless runner. All rooted in the Bible."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="home-grid-3">
            {GAMES.map((g, i) => (
              <Link key={i} to={g.to} className="reveal" style={{ textDecoration: 'none', display: 'block', transitionDelay: `${i * .06}s` }}>
                <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1.5px solid var(--border)', padding: '22px 20px', height: '100%', transition: 'all .28s', cursor: 'pointer', borderTop: `3px solid ${g.color}` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${g.color}18` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>{g.icon}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>{g.title}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--ink3)', fontWeight: 500, lineHeight: 1.6, marginBottom: 12 }}>{g.desc}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {g.chips.map(c => (
                      <span key={c} style={{ fontSize: '.62rem', fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: g.color + '15', color: g.color, border: `1px solid ${g.color}30` }}>{c}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/challenge" style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--blue)', textDecoration: 'none' }}>
              ⚔️ Bible Battle Arena coming soon — multiplayer head-to-head trivia →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          AI TOOLS
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', background: 'linear-gradient(180deg,#0A0A16,#0F0A1A)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeader
            pill="🤖 AI-Powered"
            pillColor="#C084FC"
            pillBg="rgba(192,132,252,.12)"
            title="Scripture Comes Alive with AI"
            sub="Claude AI writes devotionals, creates songs, generates art descriptions, and talks with you as your favorite Bible characters."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }} className="home-grid-2">
            {AI_TOOLS.map((t, i) => (
              <Link key={i} to={t.to} className="reveal" style={{ textDecoration: 'none', transitionDelay: `${i * .07}s` }}>
                <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '22px 24px', borderRadius: 20, background: 'rgba(255,255,255,.03)', border: '1.5px solid rgba(255,255,255,.07)', transition: 'all .28s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${t.color}08`; e.currentTarget.style.borderColor = t.color + '44'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.transform = '' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: t.color + '18', border: `1.5px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: 5 }}>{t.title}</div>
                    <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.4)', fontWeight: 500, lineHeight: 1.6 }}>{t.desc}</div>
                    <div style={{ marginTop: 10, fontSize: '.72rem', fontWeight: 700, color: t.color }}>Open →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SOUL EXPERIENCES
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeader
            pill="✨ Soul-Touching Experiences"
            pillColor="#34D399"
            pillBg="rgba(52,211,153,.1)"
            title="For the Quiet Moments With God"
            sub="Features designed to move you — breathe, confess, certify, and see the global church praying together."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }} className="home-grid-2">
            {SOUL_TOOLS.map((t, i) => (
              <Link key={i} to={t.to} className="reveal" style={{ textDecoration: 'none', transitionDelay: `${i * .07}s` }}>
                <div style={{ borderRadius: 22, border: `1.5px solid ${t.color}22`, background: `linear-gradient(135deg,${t.color}08,transparent)`, padding: '26px 24px', transition: 'all .28s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 40px ${t.color}18`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = t.color + '44' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = t.color + '22' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{t.icon}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 7 }}>{t.title}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--ink3)', lineHeight: 1.65, fontWeight: 500, marginBottom: 14 }}>{t.desc}</div>
                  <div style={{ fontSize: '.72rem', fontWeight: 800, color: t.color }}>Explore →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AdSense: In-content between sections */}
      <div style={{ padding: '0 24px', maxWidth: 960, margin: '0 auto' }}>
        <AdInContent />
      </div>

      {/* ═══════════════════════════════════════════════
          LEARNING TOOLS
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeader
            pill="📚 Learning Tools"
            pillColor="#60A5FA"
            pillBg="rgba(96,165,250,.1)"
            title="Study Smarter. Remember Longer."
            sub="Maps, flashcards, voice reading, notes, share cards, and printables — everything you need to go deeper."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="home-grid-3">
            {LEARNING_TOOLS.map((t, i) => (
              <Link key={i} to={t.to} className="reveal" style={{ textDecoration: 'none', transitionDelay: `${i * .06}s` }}>
                <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1.5px solid var(--border)', padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'all .25s', borderLeft: `3px solid ${t.color}` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.boxShadow = `0 6px 24px ${t.color}15` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: t.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '.9rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>{t.title}</div>
                    <div style={{ fontSize: '.76rem', color: 'var(--ink3)', fontWeight: 500, lineHeight: 1.55 }}>{t.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PARENTS & TEACHERS HUB
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', background: 'linear-gradient(180deg,#0A1A0F,#0D1B2A)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeader
            pill="🏫 For Parents & Teachers"
            pillColor="#34D399"
            pillBg="rgba(52,211,153,.12)"
            title="Raise the Next Generation in Faith"
            sub="Tools built specifically for parents and educators to guide children through scripture."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, alignItems: 'stretch' }} className="home-hub-grid">
            {/* Big CTA card */}
            <Link to="/parent-hub" className="reveal home-hub-span" style={{ textDecoration: 'none', gridRow: 'span 2' }}>
              <div style={{ height: '100%', borderRadius: 24, border: '1.5px solid rgba(52,211,153,.25)', background: 'linear-gradient(135deg,rgba(52,211,153,.1),rgba(16,185,129,.05),transparent)', padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all .3s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 60px rgba(52,211,153,.15)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}>
                <div>
                  <div style={{ fontSize: '3.5rem', marginBottom: 18, filter: 'drop-shadow(0 0 16px rgba(52,211,153,.4))' }}>🏫</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: 12, lineHeight: 1.3 }}>Parents & Teachers Hub</div>
                  <p style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.75, marginBottom: 24 }}>
                    Lesson plans, reading schedules, child progress tracking, family challenges, classroom tools, and AI-powered devotionals — all in one place.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    {['📋 Lesson Plans','👶 Child Profiles','📊 Progress Tracking','🤖 AI Devotionals','🏆 Family Challenges','📅 Reading Plans'].map((tag, i) => (
                      <span key={i} style={{ fontSize: '.7rem', fontWeight: 700, padding: '5px 12px', borderRadius: 100, background: 'rgba(52,211,153,.12)', color: '#34D399', border: '1px solid rgba(52,211,153,.2)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#10B981,#34D399)', color: 'white', fontWeight: 800, fontSize: '.88rem', width: 'fit-content' }}>
                  Open the Hub →
                </div>
              </div>
            </Link>
            {/* Feature mini-cards */}
            {[
              { icon: '📋', title: 'Lesson Plan Generator', desc: 'AI creates age-appropriate Bible lessons in seconds', to: '/parent-hub', color: '#60A5FA' },
              { icon: '👶', title: 'Child Progress Tracking', desc: 'Monitor reading streaks, quiz scores, and badges per child', to: '/parent-hub', color: '#F472B6' },
              { icon: '🏆', title: 'Family Challenges', desc: 'Weekly scripture challenges the whole family completes together', to: '/parent-hub', color: '#FCD34D' },
              { icon: '📅', title: 'Classroom Reading Plans', desc: 'Assign and track Bible reading plans for your students', to: '/parent-hub', color: '#C084FC' },
            ].map((f, i) => (
              <Link key={i} to={f.to} className="reveal" style={{ textDecoration: 'none', transitionDelay: `${i * .07}s` }}>
                <div style={{ borderRadius: 18, border: `1.5px solid ${f.color}22`, background: `linear-gradient(135deg,${f.color}08,transparent)`, padding: '22px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'all .25s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '44'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = f.color + '22'; e.currentTarget.style.transform = '' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '.95rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.4)', lineHeight: 1.55 }}>{f.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          COMMUNITY
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeader
            pill="🤝 Community"
            pillColor="#10B981"
            pillBg="rgba(16,185,129,.1)"
            title="You're Not Alone in This"
            sub="Real-time prayer, family groups, church events, and rooms where the body of Christ connects."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }} className="home-grid-4">
            {COMMUNITY.map((c, i) => (
              <Link key={i} to={c.to} className="reveal" style={{ textDecoration: 'none', transitionDelay: `${i * .07}s` }}>
                <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1.5px solid var(--border)', padding: '24px 18px', textAlign: 'center', transition: 'all .28s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = c.color + '55'; e.currentTarget.style.boxShadow = `0 12px 32px ${c.color}15` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{c.icon}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '.9rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>{c.title}</div>
                  <div style={{ fontSize: '.74rem', color: 'var(--ink3)', fontWeight: 500, lineHeight: 1.55 }}>{c.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          QUICK ACCESS GRID — all 30 in a dense grid
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeader
            pill="⚡ Everything"
            pillColor="#A855F7"
            pillBg="rgba(168,85,247,.1)"
            title="Every Feature, Right Here"
          />
          <div className="reveal home-grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
            {[
              { e:'🎮',n:'Trivia',to:'/trivia' },
              { e:'🙏',n:'Devotional',to:'/devotional' },
              { e:'💑',n:'Couple Devos',to:'/couples-devotional' },
              { e:'🎸',n:'Worship',to:'/worship' },
              { e:'🌳',n:'Family Tree',to:'/family-tree' },
              { e:'⏳',n:'Fasting',to:'/fasting' },
              { e:'⌨️',n:'Typing',to:'/scripture-typing' },
              { e:'🗺️',n:'Bible Map',to:'/map' },
              { e:'🧠',n:'Flashcards',to:'/flashcards' },
              { e:'📝',n:'Sermon Notes',to:'/notes' },
              { e:'🏹',n:'David & Goliath',to:'/game/david-goliath' },
              { e:'🏃',n:'Runner',to:'/game/runner' },
              { e:'🧩',n:'Escape Room',to:'/game/escape-room' },
              { e:'🎰',n:'Spin Verse',to:'/game/spin-the-verse' },
              { e:'📅',n:'Daily Challenge',to:'/challenge' },
              { e:'💬',n:'Chat w/ Moses',to:'/chat/characters' },
              { e:'🎵',n:'Bible Rap',to:'/ai/rap-generator' },
              { e:'🖼️',n:'Miracle Art',to:'/ai/miracle-art' },
              { e:'🧬',n:'What Character?',to:'/quiz/character' },
              { e:'🎙️',n:'Voice Reader',to:'/voice-reader' },
              { e:'🌍',n:'Prayer Map',to:'/prayer-map' },
              { e:'📿',n:'Prayer Beads',to:'/prayer-beads' },
              { e:'🗣️',n:'Encourage Wall',to:'/encouragement' },
              { e:'🎓',n:'Certification',to:'/certification' },
              { e:'🔗',n:'Share Cards',to:'/share' },
              { e:'🎥',n:'Videos',to:'/videos' },
              { e:'📰',n:'Blog',to:'/blog' },
              { e:'🙏',n:'Prayer Wall',to:'/prayer' },
              { e:'👨‍👩‍👧',n:'Family Groups',to:'/community/family' },
              { e:'⛪',n:'Church Events',to:'/community/events' },
              { e:'💬',n:'Chat Rooms',to:'/community/chat' },
              { e:'🖨️',n:'Activity Sheets',to:'/activity-sheets' },
              { e:'📊',n:'Dashboard',to:'/dashboard' },
              { e:'👤',n:'My Profile',to:'/profile' },
              { e:'🏫',n:'Parent Hub',to:'/parent-hub' },
              { e:'💎',n:'Go Pro',to:'/premium' },
            ].map((item, i) => (
              <Link key={i} to={item.to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '14px 8px', borderRadius: 14, background: 'var(--surface)', border: '1.5px solid var(--border)', transition: 'all .2s', textAlign: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.background = 'var(--violet-bg)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}>
                <span style={{ fontSize: '1.5rem' }}>{item.e}</span>
                <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--ink3)', lineHeight: 1.3 }}>{item.n}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PRO CTA
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '72px 24px', background: 'linear-gradient(135deg,#0F0F1A,#1A0533,#0A1A0F)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(168,85,247,.08))', borderRadius: 32, border: '1.5px solid rgba(139,92,246,.2)', padding: '52px 44px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, fontSize: '10rem', opacity: .04 }}>💎</div>
            <div style={{ fontSize: '3rem', marginBottom: 14 }}>💎</div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.6rem,4vw,2.6rem)', fontWeight: 800, color: 'white', marginBottom: 10 }}>Go Pro — Remove Ads Forever</h2>
            <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.5)', fontWeight: 500, lineHeight: 1.75, marginBottom: 28, maxWidth: 460, margin: '0 auto 28px' }}>
              Ad-free experience, priority AI access, exclusive games, family dashboard, and full Bible certification courses. From $3.99/month.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/premium" style={{ padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', color: 'white', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.9rem', textDecoration: 'none', boxShadow: '0 8px 28px rgba(139,92,246,.35)', transition: 'all .2s' }}>
                ✨ See Pro Plans
              </Link>
              <Link to="/auth" style={{ padding: '14px 28px', borderRadius: 14, background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.7)', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.9rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,.12)', transition: 'all .2s' }}>
                🔐 Free Account
              </Link>
            </div>
            <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.25)', marginTop: 18, fontWeight: 500 }}>
              30+ features always free · Pro removes ads & unlocks premium tools
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes floatP {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33%      { transform: translateY(-18px) rotate(3deg); }
          66%      { transform: translateY(-8px) rotate(-2deg); }
        }
        @keyframes gradShift {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 6px #4ADE80; }
          50%      { box-shadow: 0 0 16px #4ADE80, 0 0 30px #4ADE80; }
        }
        @keyframes flame {
          0%,100% { transform: scale(1) rotate(-2deg); }
          50%      { transform: scale(1.08) rotate(2deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollLine {
          0%,100% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          30%      { opacity: 1; transform: scaleY(1); transform-origin: top; }
          70%      { opacity: 1; transform: scaleY(1); transform-origin: bottom; }
        }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity .55s ease, transform .55s ease; }
        .reveal.in { opacity: 1; transform: none; }
        @media (max-width: 768px) {
          .home-grid-3  { grid-template-columns: repeat(2,1fr) !important; }
          .home-grid-4  { grid-template-columns: repeat(2,1fr) !important; }
          .home-grid-5  { grid-template-columns: repeat(3,1fr) !important; }
          .home-grid-2  { grid-template-columns: 1fr !important; }
          .home-grid-streak { grid-template-columns: 1fr !important; }
          .home-hub-grid { grid-template-columns: 1fr !important; }
          .home-hub-grid .hub-span { grid-row: auto !important; }
        }
        @media (max-width: 480px) {
          .home-grid-3  { grid-template-columns: 1fr !important; }
          .home-grid-5  { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  )
}
