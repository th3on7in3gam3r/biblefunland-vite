import { useState } from 'react'

const ALPHABET = [
  { letter:'A', word:'Angel',      emoji:'👼', color:'#60A5FA', story:'Angels are God\'s special helpers! They bring messages from heaven. An angel told Mary she would be Jesus\'s mom.' },
  { letter:'B', word:'Bethlehem',  emoji:'⭐', color:'#FCD34D', story:'Bethlehem is the tiny town where Jesus was born! A special star shone over it to show the wise men the way.' },
  { letter:'C', word:'Cross',      emoji:'✝️', color:'#A78BFA', story:'The cross reminds us that Jesus loves us SO much! He died on the cross and rose again so we can be with God.' },
  { letter:'D', word:'Dove',       emoji:'🕊️', color:'#67E8F9', story:'When Noah sent out a dove, it came back with an olive leaf — that meant the flood was ending. Peace at last!' },
  { letter:'E', word:'Egypt',      emoji:'🏺', color:'#F59E0B', story:'Baby Moses floated in a basket on the Nile River in Egypt. God protected him and he grew up to lead Israel!' },
  { letter:'F', word:'Fish',       emoji:'🐟', color:'#34D399', story:'A boy shared 5 loaves and 2 fish with Jesus — and Jesus fed 5,000 people! That\'s a miracle!' },
  { letter:'G', word:'Goliath',    emoji:'⚔️', color:'#EF4444', story:'Goliath was a GIANT soldier! But young David wasn\'t afraid — he trusted God and defeated Goliath with one small stone!' },
  { letter:'H', word:'Holy Spirit',emoji:'🔥', color:'#F97316', story:'On the day of Pentecost, the Holy Spirit came like fire! The Holy Spirit helps us, guides us, and lives inside us.' },
  { letter:'I', word:'Isaac',      emoji:'😊', color:'#F472B6', story:'God promised Abraham and Sarah a son even though they were very old. Isaac was that miracle baby — his name means laughter!' },
  { letter:'J', word:'Jesus',      emoji:'❤️', color:'#EC4899', story:'Jesus is God\'s Son — He came to earth as a baby and grew up to show us God\'s love. He died and rose again!' },
  { letter:'K', word:'King David', emoji:'👑', color:'#FCD34D', story:'David started as a shepherd boy who played the harp. God chose him to be king because David had a heart for God!' },
  { letter:'L', word:'Lamb',       emoji:'🐑', color:'#E2E8F0', story:'Jesus is called the Lamb of God! A lamb is gentle and kind — just like Jesus. Shepherds care for their sheep.' },
  { letter:'M', word:'Moses',      emoji:'🏔️', color:'#86EFAC', story:'Moses heard God\'s voice from a BURNING BUSH! God sent Moses to lead His people out of Egypt to freedom.' },
  { letter:'N', word:'Noah',       emoji:'🚢', color:'#93C5FD', story:'God told Noah to build a giant boat called an ark. Noah trusted God and saved his family and the animals!' },
  { letter:'O', word:'Olive',      emoji:'🌿', color:'#4ADE80', story:'The dove brought Noah an olive leaf — that was great news! The flood was ending. The olive tree is a sign of peace.' },
  { letter:'P', word:'Prayer',     emoji:'🙏', color:'#C084FC', story:'Prayer is talking to God! We can pray anytime, anywhere — God always listens. Jesus taught us to pray!' },
  { letter:'Q', word:'Queen Esther',emoji:'👸', color:'#F9A8D4', story:'Queen Esther was BRAVE! She risked her life to save her people. She said "If I die, I die" — and God saved her!' },
  { letter:'R', word:'Rainbow',    emoji:'🌈', color:'#F472B6', story:'After the great flood, God put a rainbow in the sky as a promise — He would never flood the whole earth again!' },
  { letter:'S', word:'Star',       emoji:'⭐', color:'#FCD34D', story:'A bright star appeared in the sky when Jesus was born! Wise men from far away followed it all the way to Bethlehem.' },
  { letter:'T', word:'Temple',     emoji:'🏛️', color:'#A78BFA', story:'King Solomon built a beautiful Temple for God in Jerusalem! It took 7 years and was the most magnificent building ever.' },
  { letter:'U', word:'Unto Us',    emoji:'🎁', color:'#60A5FA', story:'"Unto us a child is born, unto us a son is given!" — Isaiah 53:6. This was a promise of Jesus 700 years before He came!' },
  { letter:'V', word:'Vine',       emoji:'🍇', color:'#A855F7', story:'Jesus said "I am the vine, you are the branches." When we stay close to Jesus, we grow and bear lots of good fruit!' },
  { letter:'W', word:'Whale',      emoji:'🐋', color:'#3B82F6', story:'God sent a HUGE fish to swallow Jonah! Jonah spent 3 days inside. Then he prayed, and the fish spit him out — safe!' },
  { letter:'X', word:'Xmas Star',  emoji:'🌟', color:'#FCD34D', story:'"Xmas" is short for Christmas — the X comes from the Greek letter Chi (Χ), the first letter of Christ\'s name in Greek!' },
  { letter:'Y', word:'Yahweh',     emoji:'✨', color:'#F59E0B', story:'Yahweh is one of God\'s special names in Hebrew — it means "I AM." When Moses asked God\'s name, God said "I AM WHO I AM!"' },
  { letter:'Z', word:'Zacchaeus',  emoji:'🌳', color:'#34D399', story:'Zacchaeus was too small to see Jesus over the crowd, so he climbed a tree! Jesus saw him, had dinner with him, and changed his life!' },
]

export default function BibleAlphabet() {
  const [selected, setSelected]   = useState(0)
  const [completed, setCompleted] = useState(new Set([0]))
  const [animating, setAnimating] = useState(false)
  const entry = ALPHABET[selected]

  function go(idx) {
    if (idx === selected) return
    setAnimating(true)
    setTimeout(() => {
      setSelected(idx)
      setCompleted(s => new Set([...s, idx]))
      setAnimating(false)
    }, 200)
  }

  return (
    <div style={{ background: 'linear-gradient(180deg,#FFF7ED 0%,#F0FDF4 100%)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#059669,#D97706)', padding: '24px 24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 4 }}>🔤</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 800, color: 'white', marginBottom: 4 }}>Bible Alphabet</h1>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.8rem', fontWeight: 600 }}>A is for Angel — all the way to Z for Zacchaeus!</p>
        <div style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.6)', marginTop: 8 }}>✅ {completed.size} / 26 letters discovered</div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 14px' }}>
        {/* Alphabet grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(46px,1fr))', gap: 6, marginBottom: 18 }}>
          {ALPHABET.map((a, i) => (
            <button key={a.letter} onClick={() => go(i)}
              style={{ aspectRatio: 1, borderRadius: 12, border: `2.5px solid ${selected === i ? a.color : completed.has(i) ? a.color + '66' : '#E5E7EB'}`, background: selected === i ? a.color : completed.has(i) ? a.color + '18' : 'white', color: selected === i ? 'white' : completed.has(i) ? a.color : '#6B7280', fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', transition: 'all .18s', boxShadow: selected === i ? `0 4px 14px ${a.color}44` : 'none', transform: selected === i ? 'scale(1.1)' : 'scale(1)' }}>
              {a.letter}
            </button>
          ))}
        </div>

        {/* Letter card */}
        <div style={{ background: 'white', borderRadius: 28, padding: '28px 24px', boxShadow: '0 8px 32px rgba(0,0,0,.1)', border: `3px solid ${entry.color}`, opacity: animating ? 0 : 1, transform: animating ? 'scale(.96)' : 'scale(1)', transition: 'all .2s', textAlign: 'center' }}>
          {/* Giant letter */}
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(5rem,18vw,9rem)', fontWeight: 800, color: entry.color, lineHeight: 1, marginBottom: 8, textShadow: `0 4px 20px ${entry.color}44`, letterSpacing: '-4px' }}>
            {entry.letter}
          </div>

          {/* Emoji */}
          <div style={{ fontSize: 'clamp(3rem,8vw,4.5rem)', marginBottom: 14, filter: `drop-shadow(0 4px 12px ${entry.color}44)` }}>
            {entry.emoji}
          </div>

          {/* Word */}
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.5rem,5vw,2.5rem)', fontWeight: 800, color: '#1F2937', marginBottom: 12, letterSpacing: '2px' }}>
            {entry.word.toUpperCase()}
          </div>

          {/* Tracing animation hint */}
          <div style={{ fontSize: '.72rem', fontWeight: 700, color: entry.color, background: entry.color + '14', borderRadius: 100, padding: '5px 16px', display: 'inline-block', marginBottom: 14 }}>
            ✏️ Trace the letter {entry.letter} with your finger!
          </div>

          {/* Story */}
          <div style={{ background: entry.color + '10', borderRadius: 18, padding: '16px 18px', borderLeft: `4px solid ${entry.color}` }}>
            <p style={{ fontSize: 'clamp(.82rem,2.5vw,.96rem)', color: '#374151', lineHeight: 1.75, fontWeight: 600, margin: 0 }}>{entry.story}</p>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18 }}>
            <button onClick={() => go((selected - 1 + 26) % 26)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 14, padding: '11px 22px', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.88rem', cursor: 'pointer', color: '#374151' }}>← {ALPHABET[(selected - 1 + 26) % 26].letter}</button>
            <button onClick={() => go((selected + 1) % 26)} style={{ background: entry.color, border: 'none', borderRadius: 14, padding: '11px 22px', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.88rem', cursor: 'pointer', color: 'white', boxShadow: `0 4px 14px ${entry.color}44` }}>{ALPHABET[(selected + 1) % 26].letter} →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
