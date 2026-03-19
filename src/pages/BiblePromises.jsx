import { useState } from 'react'

const SITUATIONS = [
  {
    id:'anxiety', label:'Anxiety & Worry', icon:'😰', color:'#8B5CF6',
    desc:'When fear is louder than faith.',
    verses:[
      { ref:'Phil 4:6-7',  text:'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',       why:'Paul wrote this from prison. If he found peace there, it's available anywhere.' },
      { ref:'Matt 6:34',   text:'Do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.',                              why:'Jesus gives permission to live in today. The future is not yours to carry yet.' },
      { ref:'1 Pet 5:7',   text:'Cast all your anxiety on him because he cares for you.',                                                                                  why:'Not some of it. Cast ALL of it. He specifically chose the word "all."' },
      { ref:'Isa 41:10',   text:'Do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.',                              why:'God doesn\'t say "stop being afraid." He says "I\'m already here."' },
      { ref:'Ps 94:19',    text:'When anxiety was great within me, your consolation brought me joy.',                                                                      why:'The Psalmist felt exactly what you feel. And found what you can find.' },
    ]
  },
  {
    id:'grief', label:'Grief & Loss', icon:'💔', color:'#6366F1',
    desc:'When the weight of loss feels unbearable.',
    verses:[
      { ref:'Ps 34:18',    text:'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',                                                       why:'Not distant. Not silent. Specifically close to the most broken.' },
      { ref:'John 11:35',  text:'Jesus wept.',                                                                                                                             why:'The Son of God cried at a funeral. Your grief is not weakness — it\'s love.' },
      { ref:'Rev 21:4',    text:'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.',                                     why:'This isn\'t a vague promise. It\'s a specific, complete reversal of every grief.' },
      { ref:'Ps 23:4',     text:'Even though I walk through the darkest valley, I will fear no evil, for you are with me.',                                                why:'Through — not around. God doesn\'t promise to skip the valley. He walks through it with you.' },
      { ref:'2 Cor 1:3-4', text:'The Father of compassion and the God of all comfort, who comforts us in all our troubles.',                                               why:'He is literally named "the God of all comfort." This is His specialty.' },
    ]
  },
  {
    id:'loneliness', label:'Loneliness', icon:'🌑', color:'#3B82F6',
    desc:'When no one seems to understand.',
    verses:[
      { ref:'Ps 139:7-8',  text:'Where can I go from your Spirit? Where can I flee from your presence? If I go up to the heavens, you are there.',                        why:'There is literally no location, no emotion, no state of being where you are alone.' },
      { ref:'Heb 13:5',    text:'Never will I leave you; never will I forsake you.',                                                                                       why:'In the original Greek, this uses five negatives. God could not make this promise stronger.' },
      { ref:'Isa 43:2',    text:'When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you.',               why:'The presence of difficulty doesn\'t mean absence of God.' },
      { ref:'John 14:18',  text:'I will not leave you as orphans; I will come to you.',                                                                                    why:'Jesus said this the night before He died — His last concern was that His people wouldn\'t feel abandoned.' },
      { ref:'Deut 31:6',   text:'Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you.',                           why:'The command to be courageous is grounded in a fact: He goes WITH you.' },
    ]
  },
  {
    id:'fear', label:'Fear & Uncertainty', icon:'🌩️', color:'#F59E0B',
    desc:'When the unknown feels overwhelming.',
    verses:[
      { ref:'Josh 1:9',    text:'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',             why:'God said this to Joshua before the most terrifying task of his life. He says it to you now.' },
      { ref:'2 Tim 1:7',   text:'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',                                        why:'Fear is not from God. The Spirit inside you is the antidote.' },
      { ref:'Ps 56:3',     text:'When I am afraid, I put my trust in you.',                                                                                                why:'David didn\'t deny the fear. He told it where to go.' },
      { ref:'Isa 26:3',    text:'You will keep in perfect peace those whose minds are steadfast, because they trust in you.',                                               why:'"Perfect peace" — not partial. The Hebrew is "shalom shalom" — double peace.' },
      { ref:'Rom 8:15',    text:'The Spirit you received does not make you a slave, so that you live in fear again; rather, the Spirit you received brought about your adoption to sonship.',
                                                                                                                                                                           why:'Fear is slavery. You\'ve been freed from it at the cross.' },
    ]
  },
  {
    id:'provision', label:'Financial Stress', icon:'💸', color:'#10B981',
    desc:'When money is the source of the anxiety.',
    verses:[
      { ref:'Phil 4:19',   text:'And my God will meet all your needs according to the riches of his glory in Christ Jesus.',                                               why:'ALL your needs. Not your wants — but your needs will not go unmet.' },
      { ref:'Matt 6:26',   text:'Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?', why:'God feeds birds. You are worth infinitely more than a bird to Him.' },
      { ref:'Luke 12:32',  text:'Do not be afraid, little flock, for your Father has been pleased to give you the kingdom.',                                               why:'He\'s not withholding. He\'s pleased to give.' },
      { ref:'Ps 37:25',    text:'I was young and now I am old, yet I have never seen the righteous forsaken or their children begging bread.',                              why:'David lived 70+ years and never once saw God abandon someone who trusted Him.' },
      { ref:'Deut 8:18',   text:'Remember the Lord your God, for it is he who gives you the ability to produce wealth.',                                                   why:'Every gift, every ability, every opportunity — traced back to Him.' },
    ]
  },
  {
    id:'forgiveness', label:'Guilt & Forgiveness', icon:'🕊️', color:'#EC4899',
    desc:'When shame says you\'ve gone too far.',
    verses:[
      { ref:'1 John 1:9',  text:'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.',                   why:'Not some sins. ALL unrighteousness. The word "purify" means made completely clean.' },
      { ref:'Ps 103:12',   text:'As far as the east is from the west, so far has he removed our transgressions from us.',                                                  why:'East and west never meet. Your sin is removed by that distance.' },
      { ref:'Isa 43:25',   text:'I, even I, am he who blots out your transgressions, for my own sake, and remembers your sins no more.',                                   why:'God is not watching the replay. He specifically chooses not to remember.' },
      { ref:'Rom 8:1',     text:'Therefore, there is now no condemnation for those who are in Christ Jesus.',                                                              why:'No. Condemnation. None. The verdict is final.' },
      { ref:'Lam 3:22-23', text:'Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning.',                     why:'Every morning is a fresh start. Not a carry-forward of yesterday\'s failure.' },
    ]
  },
  {
    id:'healing', label:'Sickness & Healing', icon:'🏥', color:'#14B8A6',
    desc:'When the body is broken and faith is tested.',
    verses:[
      { ref:'Ps 103:2-3',  text:'Praise the Lord, my soul, and forget not all his benefits — who forgives all your sins and heals all your diseases.',                    why:'Healing is listed alongside forgiveness as a core part of who God is.' },
      { ref:'Isa 53:5',    text:'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.', why:'Healing — spiritual and physical — is part of what the cross accomplished.' },
      { ref:'Jer 17:14',   text:'Heal me, Lord, and I will be healed; save me and I will be saved, for you are the one I praise.',                                        why:'The most honest prayer for healing in all of Scripture.' },
      { ref:'Jas 5:14-15', text:'Is anyone among you sick? Let them call the elders of the church to pray over them... and the prayer offered in faith will make the sick person well.', why:'James gives a practical instruction — healing prayer is something the church does together.' },
      { ref:'2 Cor 12:9',  text:'My grace is sufficient for you, for my power is made perfect in weakness.',                                                               why:'When healing doesn\'t come the way we ask, His grace meets us in the weakness itself.' },
    ]
  },
  {
    id:'strength', label:'Weakness & Exhaustion', icon:'⚡', color:'#F97316',
    desc:'When you have nothing left to give.',
    verses:[
      { ref:'Isa 40:31',   text:'Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary.',            why:'The renewal is not self-generated. It comes from hoping in Him — a posture, not an effort.' },
      { ref:'Phil 4:13',   text:'I can do all this through him who gives me strength.',                                                                                    why:'The "all this" Paul meant was enduring hardship, hunger, and suffering — not just tasks.' },
      { ref:'Matt 11:28',  text:'Come to me, all you who are weary and burdened, and I will give you rest.',                                                               why:'Jesus specifically calls the exhausted. Not the capable. The weary.' },
      { ref:'2 Cor 4:16',  text:'Therefore we do not lose heart. Though outwardly we are wasting away, yet inwardly we are being renewed day by day.',                    why:'The outward deterioration is real. The inward renewal is also real. Both truths at once.' },
      { ref:'Ps 46:1',     text:'God is our refuge and strength, an ever-present help in trouble.',                                                                        why:'"Ever-present" — not sometimes present when you pray hard enough. Already there.' },
    ]
  },
  {
    id:'relationships', label:'Broken Relationships', icon:'🤝', color:'#6366F1',
    desc:'When someone has hurt you or drifted away.',
    verses:[
      { ref:'Matt 5:44',   text:'But I tell you, love your enemies and pray for those who persecute you.',                                                                 why:'This is the hardest instruction Jesus ever gave — and also the most freeing.' },
      { ref:'Col 3:13',    text:'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.',            why:'The standard of forgiveness is what you\'ve already been given — which is infinite.' },
      { ref:'Rom 12:18',   text:'If it is possible, as far as it depends on you, live at peace with everyone.',                                                            why:'Paul acknowledges peace isn\'t always achievable. Only do what depends on you.' },
      { ref:'Prov 17:17',  text:'A friend loves at all times, and a brother is born for a time of adversity.',                                                             why:'Real friendship is defined in the hard times, not the easy ones.' },
      { ref:'1 Cor 13:7',  text:'Love bears all things, believes all things, hopes all things, endures all things.',                                                       why:'Love is not a feeling — it\'s a verb with four dimensions of action.' },
    ]
  },
  {
    id:'purpose', label:'Purpose & Direction', icon:'🧭', color:'#FCD34D',
    desc:'When you don\'t know what you\'re called to.',
    verses:[
      { ref:'Jer 29:11',   text:'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', why:'God has plans for you — not vague intentions, but specific plans already prepared.' },
      { ref:'Eph 2:10',    text:'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.',                     why:'The works were prepared before you were born. You\'re not searching for purpose — you\'re stepping into it.' },
      { ref:'Prov 3:5-6',  text:'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', why:'The path becomes straight when you stop demanding to see the whole map.' },
      { ref:'Ps 37:4',     text:'Take delight in the Lord, and he will give you the desires of your heart.',                                                               why:'He doesn\'t just fulfill desires — He forms them when you delight in Him.' },
      { ref:'Rom 8:28',    text:'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',             why:'"All things" includes the detours, the failures, and the seasons of confusion.' },
    ]
  },
  {
    id:'addiction', label:'Addiction & Temptation', icon:'⛓️', color:'#EF4444',
    desc:'When a habit feels stronger than your will.',
    verses:[
      { ref:'1 Cor 10:13', text:'God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out.',    why:'A way out is always there. Always. Your job is to take it when you see it.' },
      { ref:'John 8:36',   text:'So if the Son sets you free, you will be free indeed.',                                                                                   why:'"Free indeed" — not partially free. Not free except for this one thing. Free indeed.' },
      { ref:'Phil 4:13',   text:'I can do all this through him who gives me strength.',                                                                                    why:'Including this. Especially this.' },
      { ref:'Gal 5:1',     text:'It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery.',    why:'Freedom is both a gift already given and a daily choice to stand in.' },
      { ref:'2 Pet 2:9',   text:'The Lord knows how to rescue the godly from trials.',                                                                                     why:'This is His specialty. He has done it before. He knows how.' },
    ]
  },
  {
    id:'identity', label:'Identity & Self-Worth', icon:'🪞', color:'#A5B4FC',
    desc:'When you question your value or who you are.',
    verses:[
      { ref:'Ps 139:14',   text:'I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.',                              why:'Fearfully = with awe. Wonderfully = set apart. This is God\'s description of you.' },
      { ref:'Eph 1:4',     text:'He chose us in him before the creation of the world to be holy and blameless in his sight.',                                              why:'Before the universe existed, He specifically chose you. This is not an afterthought.' },
      { ref:'1 John 3:1',  text:'See what great love the Father has lavished on us, that we should be called children of God! And that is what we are!',                  why:'Not servants. Not employees. Children. Lavished — not measured.' },
      { ref:'Gal 3:26',    text:'So in Christ Jesus you are all children of God through faith.',                                                                           why:'Your identity is "child of God." Everything else is a role. This is who you are.' },
      { ref:'Zeph 3:17',   text:'The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.', why:'God sings over you. He delights in you. Not tolerates — delights.' },
    ]
  },
]

export default function BiblePromises() {
  const [selected, setSelected] = useState(null)
  const [copied, setCopied]     = useState(null)
  const [search, setSearch]     = useState('')

  const filtered = SITUATIONS.filter(s =>
    !search || s.label.toLowerCase().includes(search.toLowerCase()) ||
    s.verses.some(v => v.text.toLowerCase().includes(search.toLowerCase()))
  )

  const situation = selected ? SITUATIONS.find(s => s.id === selected) : null

  function copyVerse(verse) {
    navigator.clipboard.writeText(`"${verse.text}" — ${verse.ref}`)
    setCopied(verse.ref)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0F0F1A,#1E1B4B,#0A1A0F)', padding:'48px 36px 36px', textAlign:'center' }}>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, background:'linear-gradient(90deg,#FCD34D,#A5B4FC,#6EE7B7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8 }}>
          📖 Bible Promises
        </h1>
        <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.88rem', fontWeight:500, maxWidth:480, margin:'0 auto' }}>
          Whatever you're facing — God has a word for it. {SITUATIONS.length} life situations. {SITUATIONS.reduce((n,s)=>n+s.verses.length,0)} carefully chosen promises.
        </p>
      </div>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'28px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns: selected ? '280px 1fr' : '1fr', gap:20, alignItems:'start' }}>
          {/* Situation grid / list */}
          <div>
            <input className="input-field" placeholder="Search situations or verses..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom:14 }} />
            <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr' : 'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
              {filtered.map(s => (
                <div key={s.id} onClick={() => setSelected(selected === s.id ? null : s.id)}
                  style={{ background:'var(--surface)', borderRadius:16, border:`1.5px solid ${selected===s.id?s.color:'var(--border)'}`, padding:'16px 18px', cursor:'pointer', transition:'all .2s', background: selected===s.id ? s.color+'12' : 'var(--surface)' }}
                  onMouseEnter={e=>{ if(selected!==s.id){ e.currentTarget.style.borderColor=s.color; e.currentTarget.style.boxShadow=`0 4px 16px ${s.color}22` }}}
                  onMouseLeave={e=>{ if(selected!==s.id){ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }}}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize: selected ? '1.4rem' : '1.8rem' }}>{s.icon}</span>
                    <div>
                      <div style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color: selected===s.id ? s.color : 'var(--ink)', fontSize: selected ? '.88rem' : '.95rem', lineHeight:1.2 }}>{s.label}</div>
                      {!selected && <div style={{ fontSize:'.72rem', color:'var(--ink3)', fontWeight:500, marginTop:3 }}>{s.desc}</div>}
                      <div style={{ fontSize:'.66rem', color:s.color, fontWeight:700, marginTop: selected?2:4 }}>{s.verses.length} promises</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verse detail */}
          {situation && (
            <div style={{ animation:'slideIn .3s ease' }}>
              <div style={{ background:'var(--surface)', borderRadius:22, border:`1.5px solid ${situation.color}44`, overflow:'hidden', marginBottom:16 }}>
                <div style={{ background:`linear-gradient(135deg,${situation.color}22,${situation.color}08)`, padding:'24px 28px', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:8 }}>{situation.icon}</div>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.5rem', fontWeight:800, color:'var(--ink)', marginBottom:4 }}>{situation.label}</div>
                  <div style={{ fontSize:'.86rem', color:'var(--ink3)', fontWeight:500 }}>{situation.desc}</div>
                </div>
                <div style={{ padding:'20px 28px', display:'flex', flexDirection:'column', gap:14 }}>
                  {situation.verses.map((verse, i) => (
                    <div key={i} style={{ background:'var(--bg2)', borderRadius:14, padding:'18px 20px', border:'1px solid var(--border)', transition:'all .2s' }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=situation.color}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <span style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, color:situation.color, fontSize:'.95rem' }}>{verse.ref}</span>
                        <button onClick={() => copyVerse(verse)} style={{ background:'none', border:'none', color: copied===verse.ref?'var(--green)':'var(--ink3)', cursor:'pointer', fontSize:'.72rem', fontWeight:700, fontFamily:'Poppins,sans-serif', padding:'4px 10px', borderRadius:8, transition:'all .2s' }}>
                          {copied===verse.ref ? '✅ Copied' : '📋 Copy'}
                        </button>
                      </div>
                      <p style={{ fontSize:'.92rem', color:'var(--ink)', lineHeight:1.8, fontWeight:500, fontStyle:'italic', marginBottom:10 }}>"{verse.text}"</p>
                      <div style={{ borderLeft:`3px solid ${situation.color}`, paddingLeft:12, fontSize:'.8rem', color:'var(--ink3)', fontWeight:500, lineHeight:1.65 }}>
                        💡 {verse.why}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-outline" onClick={() => setSelected(null)} style={{ width:'100%', justifyContent:'center' }}>← Back to all situations</button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
