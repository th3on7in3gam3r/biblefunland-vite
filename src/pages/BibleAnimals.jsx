import { useState } from 'react'

const ANIMALS = [
  { name:'Dove',    emoji:'🕊️', color:'#93C5FD', silColor:'#C7D2FE', story:'Noah sent out a dove to check if the flood was ending. It came back with an olive leaf — good news!', ref:'Gen 8:11', choices:['Eagle','Dove','Sparrow','Owl'] },
  { name:'Lamb',    emoji:'🐑', color:'#F1F5F9', silColor:'#CBD5E1', story:'Jesus is called the Lamb of God! Lambs are gentle and innocent — just like Jesus.',                  ref:'John 1:29', choices:['Goat','Horse','Lamb','Sheep'] },
  { name:'Lion',    emoji:'🦁', color:'#FCD34D', silColor:'#F59E0B', story:'God shut the lions\' mouths when Daniel was thrown in their den. Daniel trusted God!',                  ref:'Dan 6',    choices:['Tiger','Bear','Lion','Leopard'] },
  { name:'Donkey',  emoji:'🫏', color:'#D4A978', silColor:'#A37B52', story:'Jesus rode a donkey into Jerusalem on Palm Sunday. People cheered and waved palm branches!',             ref:'Matt 21:7', choices:['Horse','Camel','Donkey','Mule'] },
  { name:'Whale',   emoji:'🐋', color:'#60A5FA', silColor:'#3B82F6', story:'A great fish swallowed Jonah! He was inside for 3 days until he prayed — then the fish spit him out.', ref:'Jon 1:17',  choices:['Shark','Dolphin','Whale','Fish'] },
  { name:'Eagle',   emoji:'🦅', color:'#92400E', silColor:'#78350F', story:'"They will soar on wings like eagles." — Isaiah 40:31. Eagles can fly very high!',                      ref:'Isa 40:31', choices:['Hawk','Vulture','Eagle','Falcon'] },
  { name:'Camel',   emoji:'🐪', color:'#D97706', silColor:'#B45309', story:'Camels carried the wise men to see baby Jesus! They can go without water for many days.',               ref:'Matt 2',   choices:['Horse','Camel','Elephant','Ox'] },
  { name:'Fish',    emoji:'🐟', color:'#34D399', silColor:'#059669', story:'Jesus fed 5,000 people with just 2 fish and 5 loaves of bread — a miracle!',                            ref:'John 6:9', choices:['Frog','Fish','Turtle','Crab'] },
  { name:'Snake',   emoji:'🐍', color:'#4ADE80', silColor:'#16A34A', story:'In the Garden of Eden, the serpent tricked Eve. But Jesus defeated the serpent forever!',                ref:'Gen 3',    choices:['Lizard','Worm','Snake','Eel'] },
  { name:'Raven',   emoji:'🦅', color:'#374151', silColor:'#1F2937', story:'God sent ravens to bring Elijah food in the wilderness! Two times a day they brought bread and meat.',   ref:'1 Kgs 17:6',choices:['Crow','Raven','Bat','Pigeon'] },
]

function AnimalSilhouette({ emoji, color, revealed }) {
  return (
    <div style={{ width: 160, height: 160, borderRadius: '50%', background: revealed ? 'rgba(255,255,255,.4)' : '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', filter: revealed ? 'none' : 'brightness(0)', transition: 'all .6s ease', boxShadow: revealed ? `0 0 40px ${color}66` : '0 8px 32px rgba(0,0,0,.3)', border: `4px solid ${revealed ? color : '#374151'}`, animation: revealed ? 'revealAnim .5s ease' : 'silhouettePulse 2s ease-in-out infinite' }}>
      {emoji}
    </div>
  )
}

export default function BibleAnimals() {
  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState(null)
  const [score,    setScore]    = useState(0)
  const [streak,   setStreak]   = useState(0)
  const [hint,     setHint]     = useState(false)
  const [revealed, setRevealed] = useState(false)

  const animal  = ANIMALS[idx]
  const correct = selected === animal.name

  function choose(ans) {
    if (selected) return
    setSelected(ans)
    setRevealed(true)
    if (ans === animal.name) { setScore(s => s + (hint ? 0 : 1)); setStreak(s => s + 1) }
    else setStreak(0)
  }

  function next() {
    setIdx(i => (i + 1) % ANIMALS.length)
    setSelected(null); setHint(false); setRevealed(false)
  }

  return (
    <div style={{ background: 'linear-gradient(180deg,#F0FDF4 0%,#EFF6FF 100%)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#065F46,#1D4ED8)', padding: '28px 24px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>🎯</div>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: 'white', marginBottom: 4 }}>Name That Bible Animal!</h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.82rem', fontWeight: 600 }}>Can you guess the animal from the shadow? 🔍</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
          {[['🏆', score, 'Score'], ['🔥', streak, 'Streak'], [idx + 1 + '/' + ANIMALS.length, '', 'Animal']].map(([e, v, l]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 100, padding: '4px 14px', fontSize: '.76rem', fontWeight: 800, color: 'white' }}>{e} {v} {l}</div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ background: 'white', borderRadius: 28, padding: '28px 20px', boxShadow: '0 8px 40px rgba(0,0,0,.12)', marginBottom: 14 }}>
          {/* Silhouette */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <AnimalSilhouette emoji={animal.emoji} color={animal.color} revealed={revealed} />
          </div>

          {/* Clue */}
          {hint && !selected && (
            <div style={{ background: '#FFFBEB', border: '2px solid #FCD34D', borderRadius: 14, padding: '10px 16px', marginBottom: 16, fontSize: '.84rem', color: '#92400E', fontWeight: 600, textAlign: 'center', animation: 'popIn .3s ease' }}>
              💡 Hint: {animal.story.split('.')[0]}.
            </div>
          )}

          {/* Question */}
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(.95rem,3vw,1.2rem)', fontWeight: 800, color: '#1F2937', textAlign: 'center', marginBottom: 20 }}>
            🔍 What Bible animal is this?
          </div>

          {/* Choices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {animal.choices.map(choice => {
              const isCorrect  = choice === animal.name
              const isSelected = choice === selected
              let bg = '#F9FAFB', borderC = '#E5E7EB', textC = '#374151'
              if (selected) {
                if (isCorrect)       { bg = '#ECFDF5'; borderC = '#059669'; textC = '#059669' }
                else if (isSelected) { bg = '#FEF2F2'; borderC = '#EF4444'; textC = '#EF4444' }
              }
              return (
                <button key={choice} onClick={() => choose(choice)} disabled={!!selected}
                  style={{ padding: '14px', borderRadius: 16, border: `3px solid ${borderC}`, background: bg, fontFamily: "'Baloo 2',cursive", fontSize: '1.05rem', fontWeight: 800, color: textC, cursor: selected ? 'default' : 'pointer', transition: 'all .2s' }}>
                  {isCorrect && selected ? '✅ ' : isSelected && !isCorrect ? '❌ ' : ''}{choice}
                </button>
              )
            })}
          </div>

          {!selected && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setHint(true)} style={{ background: '#FFFBEB', border: '2px solid #FCD34D', borderRadius: 12, padding: '8px 18px', color: '#92400E', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}>
                💡 Show Hint
              </button>
            </div>
          )}
        </div>

        {/* Result */}
        {selected && (
          <div style={{ background: 'white', borderRadius: 20, padding: '18px 20px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', animation: 'popIn .4s ease', border: `2px solid ${correct ? '#10B981' : '#F59E0B'}22` }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.2rem', fontWeight: 800, color: correct ? '#059669' : '#D97706', marginBottom: 6, textAlign: 'center' }}>
              {correct ? '🎉 You got it!' : `🐾 It\'s a ${animal.name}!`}
            </div>
            <div style={{ fontSize: '.82rem', color: '#374151', fontWeight: 500, lineHeight: 1.7, marginBottom: 6 }}>{animal.story}</div>
            <div style={{ fontSize: '.7rem', color: '#6366F1', fontWeight: 700, marginBottom: 14 }}>📖 {animal.ref}</div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={next} style={{ background: 'linear-gradient(135deg,#065F46,#1D4ED8)', color: 'white', border: 'none', borderRadius: 14, padding: '12px 28px', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer' }}>
                Next Animal 🎯
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
        @keyframes silhouettePulse{0%,100%{filter:brightness(0) drop-shadow(0 0 8px rgba(0,0,0,.5))}50%{filter:brightness(0) drop-shadow(0 0 20px rgba(0,0,0,.3))}}
        @keyframes revealAnim{from{filter:brightness(0) scale(.9)}to{filter:brightness(1) scale(1)}}
      `}</style>
    </div>
  )
}
