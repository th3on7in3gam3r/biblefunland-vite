import { useState } from 'react'

const PROPHECIES = [
  {
    id:'bethlehem', category:'Birth & Early Life', color:'#F59E0B',
    prophecy:{ ref:'Micah 5:2', text:'But you, Bethlehem Ephrathah, though you are small among the clans of Judah, out of you will come for me one who will be ruler over Israel.', date:'~700 BC' },
    fulfillment:{ ref:'Luke 2:4-7', text:'Joseph also went up from Galilee, out of the city of Nazareth, into Judea, to the city of David, which is called Bethlehem… and she brought forth her firstborn Son.' },
    gap:'~700 years',
    note:'Bethlehem was a tiny village of perhaps 300 people. There were thousands of cities in Israel. The probability of guessing the birthplace correctly is astronomically small.',
    probability:'1 in 100,000+'
  },
  {
    id:'virgin', category:'Birth & Early Life', color:'#F59E0B',
    prophecy:{ ref:'Isaiah 7:14', text:'Therefore the Lord himself will give you a sign: The virgin will conceive and give birth to a son, and will call him Immanuel.', date:'~700 BC' },
    fulfillment:{ ref:'Matthew 1:22-23', text:'All this took place to fulfill what the Lord had said through the prophet: "The virgin will conceive and give birth to a son."' },
    gap:'~700 years',
    note:'Isaiah\'s prophecy used the Hebrew word "almah" meaning young woman/virgin. The Greek translation (Septuagint) uses "parthenos" — unambiguously virgin. Written 700 years before the birth of Christ.',
    probability:'1 in 1,000,000+'
  },
  {
    id:'egypt', category:'Birth & Early Life', color:'#F59E0B',
    prophecy:{ ref:'Hosea 11:1', text:'When Israel was a child, I loved him, and out of Egypt I called my son.', date:'~750 BC' },
    fulfillment:{ ref:'Matthew 2:14-15', text:'So he got up, took the child and his mother during the night and left for Egypt, where he stayed until the death of Herod.' },
    gap:'~750 years',
    note:'Originally about the Exodus, Matthew sees a deeper fulfillment: Jesus recapitulates Israel\'s story — exile in Egypt, call out, wilderness testing. He is the true Israel.',
    probability:'Pattern fulfillment'
  },
  {
    id:'triumphal', category:'Ministry', color:'#8B5CF6',
    prophecy:{ ref:'Zechariah 9:9', text:'Rejoice greatly, Daughter Zion! Shout, Daughter Jerusalem! See, your king comes to you, righteous and victorious, lowly and riding on a donkey.', date:'~520 BC' },
    fulfillment:{ ref:'John 12:13-15', text:'They took palm branches and went out to meet him, shouting, "Hosanna!" Blessed is he who comes in the name of the Lord! Blessed is the king of Israel!"' },
    gap:'~520 years',
    note:'Kings rode horses into battle and donkeys in times of peace. Zechariah specifies a donkey — a king coming not to conquer by force but in humility and peace. Jesus did this publicly in front of thousands.',
    probability:'1 in 100+'
  },
  {
    id:'betrayal', category:'Passion & Death', color:'#EF4444',
    prophecy:{ ref:'Zechariah 11:12-13', text:'So they paid me thirty pieces of silver. And the Lord said to me, "Throw it to the potter" — the handsome price at which they valued me! So I took the thirty pieces of silver and threw them to the potter at the house of the Lord.', date:'~520 BC' },
    fulfillment:{ ref:'Matthew 26:15, 27:5-7', text:'They counted out for him thirty pieces of silver… Judas threw the money into the temple and left. The chief priests… decided to use the money to buy the potter\'s field.' },
    gap:'~520 years',
    note:'Three specific details fulfilled simultaneously: 30 silver pieces (the price of a slave — insultingly low for a king), thrown into the Temple, used to buy a potter\'s field. The odds of all three coinciding are extraordinary.',
    probability:'1 in 100,000+'
  },
  {
    id:'silent', category:'Passion & Death', color:'#EF4444',
    prophecy:{ ref:'Isaiah 53:7', text:'He was oppressed and afflicted, yet he did not open his mouth; he was led like a lamb to the slaughter, and as a sheep before its shearers is silent, so he did not open his mouth.', date:'~700 BC' },
    fulfillment:{ ref:'Matthew 27:12-14', text:'When he was accused by the chief priests and the elders, he gave no answer. Then Pilate asked him, "Don\'t you hear the testimony they are bringing against you?" But Jesus made no reply, not even to a single charge.' },
    gap:'~700 years',
    note:'Roman defendants ALWAYS spoke in their own defense. Jesus\' silence was so unusual that Pilate was "greatly amazed." Isaiah predicted this specific, highly improbable behavior 700 years in advance.',
    probability:'1 in 1,000+'
  },
  {
    id:'hands', category:'Passion & Death', color:'#EF4444',
    prophecy:{ ref:'Psalm 22:16', text:'Dogs surround me, a pack of villains encircles me; they pierce my hands and my feet.', date:'~1000 BC' },
    fulfillment:{ ref:'John 20:25-27', text:'Unless I see the nail marks in his hands and put my finger where the nails were… Jesus said, "Put your finger here; see my hands."' },
    gap:'~1000 years',
    note:'Crucifixion was not invented until centuries AFTER David wrote Psalm 22. Rome hadn\'t been founded yet. David described a method of execution that didn\'t exist in his culture — but would exist in Jesus\'s.',
    probability:'1 in 1,000,000+'
  },
  {
    id:'lots', category:'Passion & Death', color:'#EF4444',
    prophecy:{ ref:'Psalm 22:18', text:'They divide my clothes among them and cast lots for my garment.', date:'~1000 BC' },
    fulfillment:{ ref:'John 19:23-24', text:'"Let\'s not tear it," they said to one another. "Let\'s decide by lot who will get it."… So this is what the soldiers did.' },
    gap:'~1000 years',
    note:'The soldiers divided most of his clothes but cast lots for the seamless robe — exactly matching the two-part structure of the Psalm (divide / cast lots). This specific detail was recorded independently by eyewitness John.',
    probability:'1 in 10,000+'
  },
  {
    id:'bones', category:'Passion & Death', color:'#EF4444',
    prophecy:{ ref:'Psalm 34:20', text:'He protects all his bones; not one of them will be broken.', date:'~1000 BC' },
    fulfillment:{ ref:'John 19:33-36', text:'But when they came to Jesus and found that he was already dead, they did not break his legs… These things happened so that the scripture would be fulfilled: "Not one of his bones will be broken."' },
    gap:'~1000 years',
    note:'It was Roman practice to break the legs of crucifixion victims to speed death. The soldiers broke both thieves\' legs. Jesus had already died — so they didn\'t break His. A circumstantial coincidence? John says otherwise.',
    probability:'1 in 100+'
  },
  {
    id:'resurrection', category:'Resurrection & Glory', color:'#10B981',
    prophecy:{ ref:'Psalm 16:10', text:'Because you will not abandon me to the realm of the dead, nor will you let your faithful one see decay.', date:'~1000 BC' },
    fulfillment:{ ref:'Acts 2:31-32', text:'Seeing what was to come, he spoke of the resurrection of the Messiah, that he was not abandoned to the realm of the dead, nor did his body see decay. God has raised this Jesus to life.' },
    gap:'~1000 years',
    note:'Peter uses this exact Psalm in his Pentecost sermon to prove the resurrection. David himself died and decayed — so this Psalm points beyond David to someone else. Peter argues there is only one candidate.',
    probability:'Pattern fulfillment'
  },
  {
    id:'ascension', category:'Resurrection & Glory', color:'#10B981',
    prophecy:{ ref:'Psalm 110:1', text:'The Lord says to my lord: "Sit at my right hand until I make your enemies a footstool for your feet."', date:'~1000 BC' },
    fulfillment:{ ref:'Acts 7:55-56', text:'Stephen, full of the Holy Spirit, looked up to heaven and saw the glory of God, and Jesus standing at the right hand of God.' },
    gap:'~1000 years',
    note:'Jesus quotes this Psalm himself (Matt 22:44) to stump the Pharisees. It is the most-quoted Old Testament verse in the New Testament — used 33 times. Early Christians saw its fulfillment as decisive proof.',
    probability:'Pattern fulfillment'
  },
  {
    id:'elijah', category:'Forerunner', color:'#3B82F6',
    prophecy:{ ref:'Malachi 4:5', text:'See, I will send the prophet Elijah to you before that great and dreadful day of the Lord comes.', date:'~430 BC' },
    fulfillment:{ ref:'Matthew 11:13-14', text:'"For all the Prophets and the Law prophesied until John. And if you are willing to accept it, he is the Elijah who was to come."' },
    gap:'~430 years',
    note:'Malachi was the last Old Testament prophet. After him — 400 years of silence. Then John the Baptist arrives in the spirit and power of Elijah, wearing similar clothes, living in the wilderness, calling people to repentance.',
    probability:'Pattern fulfillment'
  },
]

const CATEGORIES = ['All', 'Birth & Early Life', 'Ministry', 'Passion & Death', 'Resurrection & Glory', 'Forerunner']
const CAT_COLORS = { 'Birth & Early Life':'#F59E0B', 'Ministry':'#8B5CF6', 'Passion & Death':'#EF4444', 'Resurrection & Glory':'#10B981', 'Forerunner':'#3B82F6' }

export default function ProphecyFulfillment() {
  const [selected,  setSelected]  = useState(null)
  const [category,  setCategory]  = useState('All')
  const [showStats, setShowStats] = useState(false)

  const filtered = category === 'All' ? PROPHECIES : PROPHECIES.filter(p => p.category === category)
  const detail   = selected ? PROPHECIES.find(p => p.id === selected) : null

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0F0F1A,#1A0533,#0A1A0F)', padding:'48px 36px 36px', textAlign:'center' }}>
        <div style={{ display:'inline-block', fontSize:'.7rem', fontWeight:700, background:'rgba(252,211,77,.12)', color:'#FCD34D', padding:'4px 14px', borderRadius:100, marginBottom:12, border:'1px solid rgba(252,211,77,.2)' }}>
          🔍 48 OT Prophecies · 12 Major Fulfillments · Centuries Apart
        </div>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, background:'linear-gradient(90deg,#FCD34D,#F97316,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>
          🔮 Prophecy Fulfillment
        </h1>
        <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.88rem', fontWeight:500, maxWidth:500, margin:'0 auto' }}>
          Old Testament prophecies written centuries before Christ — fulfilled with mathematical precision. The case for the Messiah.
        </p>
        <button onClick={() => setShowStats(s=>!s)} style={{ marginTop:14, background:'rgba(252,211,77,.15)', border:'1px solid rgba(252,211,77,.25)', color:'#FCD34D', borderRadius:10, padding:'7px 16px', cursor:'pointer', fontSize:'.76rem', fontWeight:700, fontFamily:'Poppins,sans-serif' }}>
          {showStats ? '▲ Hide' : '📊 The Mathematical Case'}
        </button>
        {showStats && (
          <div style={{ maxWidth:600, margin:'16px auto 0', background:'rgba(252,211,77,.08)', borderRadius:16, padding:'20px 24px', border:'1px solid rgba(252,211,77,.15)', textAlign:'left' }}>
            <p style={{ color:'rgba(255,255,255,.75)', fontSize:'.86rem', lineHeight:1.8, margin:'0 0 10px' }}>
              Mathematician Peter Stoner calculated that the probability of ONE person fulfilling just 8 of these prophecies by chance is 1 in 10<sup>17</sup> — that's 1 in 100,000,000,000,000,000.
            </p>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:'.8rem', lineHeight:1.7, margin:0 }}>
              Illustration: Fill the state of Texas 2 feet deep with silver dollars. Mark one. Blindfold a person and ask them to pick the marked coin on the first try. That's the probability. And Stoner examined 48 prophecies, not 8.
            </p>
          </div>
        )}
      </div>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'28px 20px' }}>
        {/* Category filter */}
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:20 }}>
          {CATEGORIES.map(c => {
            const color = CAT_COLORS[c] || 'var(--blue)'
            return <button key={c} onClick={() => setCategory(c)} style={{ fontSize:'.72rem', fontWeight:700, padding:'6px 13px', borderRadius:100, cursor:'pointer', border:`1.5px solid ${category===c?color:'var(--border)'}`, background:category===c?color+'18':'var(--surface)', color:category===c?color:'var(--ink3)', transition:'all .2s' }}>{c}</button>
          })}
        </div>

        <div style={{ display:'grid', gridTemplateColumns: detail ? '1fr 1.3fr' : '1fr', gap:16, alignItems:'start' }}>
          {/* List */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelected(selected===p.id?null:p.id)}
                style={{ borderRadius:16, border:`1.5px solid ${selected===p.id?p.color:'var(--border)'}`, padding:'16px 18px', cursor:'pointer', transition:'all .22s', background:selected===p.id?p.color+'10':'var(--surface)' }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ flexShrink:0, marginTop:2 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:p.color }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:selected===p.id?p.color:'var(--ink)', fontSize:'.9rem' }}>{p.prophecy.ref}</span>
                      <span style={{ fontSize:'.62rem', fontWeight:700, padding:'2px 7px', borderRadius:100, background:p.color+'18', color:p.color }}>{p.category}</span>
                    </div>
                    <div style={{ fontSize:'.78rem', color:'var(--ink3)', fontWeight:500 }}>Fulfilled in → <strong style={{ color:selected===p.id?p.color:'var(--ink2)' }}>{p.fulfillment.ref}</strong></div>
                    <div style={{ fontSize:'.72rem', color:'var(--ink3)', fontWeight:500, marginTop:3 }}>Gap: {p.gap}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {detail && (
            <div style={{ background:'var(--surface)', borderRadius:22, border:`1.5px solid ${detail.color}44`, overflow:'hidden', position:'sticky', top:80, animation:'slideIn .3s ease' }}>
              <div style={{ background:`linear-gradient(135deg,${detail.color}22,${detail.color}06)`, padding:'24px 28px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                  <span style={{ fontSize:'.66rem', fontWeight:800, padding:'3px 9px', borderRadius:100, background:detail.color+'25', color:detail.color, textTransform:'uppercase', letterSpacing:.5 }}>{detail.category}</span>
                  <span style={{ fontSize:'.66rem', fontWeight:700, padding:'3px 9px', borderRadius:100, background:'var(--bg2)', color:'var(--ink3)' }}>Gap: {detail.gap}</span>
                  {detail.probability !== 'Pattern fulfillment' && <span style={{ fontSize:'.66rem', fontWeight:700, padding:'3px 9px', borderRadius:100, background:'var(--yellow-bg)', color:'var(--yellow)' }}>Probability: {detail.probability}</span>}
                </div>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.2rem', fontWeight:800, color:'var(--ink)', marginBottom:4 }}>The Prophecy</div>
                <div style={{ fontSize:'.74rem', fontWeight:800, color:detail.color, marginBottom:8 }}>{detail.prophecy.ref} · Written {detail.prophecy.date}</div>
                <p style={{ fontSize:'.9rem', color:'var(--ink2)', fontStyle:'italic', lineHeight:1.75, fontWeight:500, borderLeft:`3px solid ${detail.color}`, paddingLeft:12 }}>"{detail.prophecy.text}"</p>
              </div>
              <div style={{ padding:'20px 28px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.1rem', fontWeight:800, color:'var(--ink)', marginBottom:4 }}>The Fulfillment</div>
                <div style={{ fontSize:'.74rem', fontWeight:800, color:'var(--green)', marginBottom:8 }}>{detail.fulfillment.ref}</div>
                <p style={{ fontSize:'.9rem', color:'var(--ink2)', fontStyle:'italic', lineHeight:1.75, fontWeight:500, borderLeft:'3px solid var(--green)', paddingLeft:12 }}>"{detail.fulfillment.text}"</p>
              </div>
              <div style={{ padding:'18px 28px', background:'var(--bg2)' }}>
                <div style={{ fontSize:'.72rem', fontWeight:800, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>💡 Why This Matters</div>
                <p style={{ fontSize:'.86rem', color:'var(--ink2)', lineHeight:1.75, fontWeight:500, margin:0 }}>{detail.note}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
