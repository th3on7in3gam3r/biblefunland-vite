import { useState, useRef } from 'react'

const ERAS = [
  { id:'creation',    label:'Creation & Patriarchs', color:'#F59E0B', start:-4000, end:-1800 },
  { id:'egypt',       label:'Egypt & Exodus',         color:'#EF4444', start:-1800, end:-1400 },
  { id:'conquest',    label:'Conquest & Judges',       color:'#10B981', start:-1400, end:-1050 },
  { id:'kingdom',     label:'United Kingdom',          color:'#8B5CF6', start:-1050, end:-930  },
  { id:'divided',     label:'Divided Kingdom',         color:'#3B82F6', start:-930,  end:-586  },
  { id:'exile',       label:'Exile',                   color:'#6366F1', start:-586,  end:-538  },
  { id:'return',      label:'Return & Rebuilding',     color:'#14B8A6', start:-538,  end:-400  },
  { id:'intertestamental', label:'400 Years of Silence', color:'#9CA3AF', start:-400, end:-6  },
  { id:'jesus',       label:'Life of Jesus',           color:'#EC4899', start:-6,    end:30    },
  { id:'earlyChurch', label:'Early Church',            color:'#F97316', start:30,    end:100   },
]

const EVENTS = [
  { year:-4000, label:'Creation',           ref:'Gen 1-2',  era:'creation',    icon:'🌍', desc:'God creates the heavens and earth, light and darkness, sea and land, and finally man in His image.' },
  { year:-3900, label:'The Fall',           ref:'Gen 3',    era:'creation',    icon:'🍎', desc:'Adam and Eve sin. Death, shame, and separation enter the world — but God promises a Rescuer.' },
  { year:-2400, label:"Noah's Flood",       ref:'Gen 6-9',  era:'creation',    icon:'🌊', desc:'The earth is filled with violence. God sends a flood and saves Noah, his family, and two of every creature.' },
  { year:-2100, label:'Tower of Babel',     ref:'Gen 11',   era:'creation',    icon:'🏗️', desc:'Humanity unites in pride to build a tower to heaven. God scatters them by confusing their languages.' },
  { year:-2091, label:'Call of Abraham',    ref:'Gen 12',   era:'creation',    icon:'⭐', desc:"God calls Abram from Ur: 'Leave your country.' He promises to make him a great nation to bless all peoples." },
  { year:-2066, label:'Birth of Isaac',     ref:'Gen 21',   era:'creation',    icon:'👶', desc:'Sarah conceives at 90. Isaac is born as the miracle child of promise, through whom the covenant continues.' },
  { year:-2006, label:'Birth of Jacob',     ref:'Gen 25',   era:'creation',    icon:'👥', desc:"Jacob and Esau are born to Isaac. Jacob's 12 sons become the 12 tribes of Israel." },
  { year:-1898, label:'Joseph in Egypt',    ref:'Gen 37-50',era:'creation',    icon:'👑', desc:"Joseph is sold into slavery by his brothers, rises to second in command of Egypt, and saves the ancient world from famine." },
  { year:-1526, label:'Moses Born',         ref:'Exo 2',    era:'egypt',       icon:'🌿', desc:"Pharaoh orders Hebrew boys killed. Moses is placed in a basket on the Nile and raised in Pharaoh's palace." },
  { year:-1446, label:'The Exodus',         ref:'Exo 12-14',era:'egypt',       icon:'🔥', desc:'After 10 plagues, Pharaoh releases Israel. The Red Sea parts. 2 million people walk through on dry ground.' },
  { year:-1446, label:'Ten Commandments',   ref:'Exo 20',   era:'egypt',       icon:'📜', desc:'At Mount Sinai, God gives Moses the Law — the moral foundation for Israel and the world.' },
  { year:-1406, label:"Israel Enters Canaan",ref:'Jos 1-4', era:'conquest',    icon:'⚔️', desc:'After 40 years in the wilderness, Joshua leads Israel across the Jordan River into the Promised Land.' },
  { year:-1400, label:"Jericho Falls",      ref:'Jos 6',    era:'conquest',    icon:'🌆', desc:"The walls of Jericho collapse after Israel marches around them for 7 days and shouts." },
  { year:-1209, label:'Deborah Judges',     ref:'Jdg 4-5',  era:'conquest',    icon:'👸', desc:"Israel's only female judge leads the nation to victory over Jabin's army." },
  { year:-1100, label:'Samson',             ref:'Jdg 13-16',era:'conquest',    icon:'💪', desc:'Samson has superhuman strength but a tragic weakness. His story ends in sacrifice that destroys more Philistines than his life did.' },
  { year:-1050, label:'Samuel Anoints Saul',ref:'1 Sam 10', era:'kingdom',     icon:'👑', desc:"Israel demands a king. God gives them Saul — impressive on the outside, weak on the inside." },
  { year:-1025, label:'David Kills Goliath',ref:'1 Sam 17', era:'kingdom',     icon:'🏹', desc:"A shepherd boy with five stones and extraordinary faith defeats the champion warrior of the Philistines." },
  { year:-1010, label:'David Becomes King', ref:'2 Sam 5',  era:'kingdom',     icon:'🏰', desc:"David unites all 12 tribes and establishes Jerusalem as the capital. God promises David's throne will last forever." },
  { year:-966,  label:"Solomon's Temple",   ref:'1 Kgs 6',  era:'kingdom',     icon:'🕍', desc:"The most magnificent building on earth at its time — the Temple where God's glory dwells." },
  { year:-930,  label:'Kingdom Divides',    ref:'1 Kgs 12', era:'divided',     icon:'💔', desc:"After Solomon's death, 10 tribes rebel. Israel splits into North (Israel) and South (Judah) — never to fully reunite." },
  { year:-870,  label:'Elijah & the Drought',ref:'1 Kgs 17-18',era:'divided', icon:'⚡', desc:"Elijah confronts King Ahab and challenges 450 prophets of Baal on Mount Carmel. Fire falls from heaven." },
  { year:-760,  label:'Jonah in Nineveh',   ref:'Jon 1-4',  era:'divided',     icon:'🐋', desc:"God sends Jonah to Israel's enemy Nineveh. After a detour through a great fish, Jonah preaches and the entire city repents." },
  { year:-740,  label:'Isaiah Prophesies',  ref:'Isa 1-66', era:'divided',     icon:'📖', desc:"Isaiah sees the Lord in the Temple and is called as a prophet. His 66 chapters predict the Messiah in stunning detail." },
  { year:-722,  label:'Israel (North) Falls',ref:'2 Kgs 17',era:'divided',     icon:'😢', desc:"Assyria conquers the Northern Kingdom. The 10 tribes are scattered — the so-called 'lost tribes of Israel.'" },
  { year:-626,  label:'Jeremiah Called',    ref:'Jer 1',    era:'divided',     icon:'😭', desc:"God calls a young man who says 'I am only a child.' Jeremiah will preach for 40 years to a people who refuse to listen." },
  { year:-605,  label:'Daniel in Babylon',  ref:'Dan 1',    era:'divided',     icon:'🦁', desc:"The first deportation. Daniel and his friends are taken to Babylon and remain faithful to God in a foreign court." },
  { year:-586,  label:'Jerusalem Destroyed',ref:'2 Kgs 25', era:'exile',       icon:'🔥', desc:"After years of warning, Babylon destroys Jerusalem and the Temple. The people are taken into exile." },
  { year:-553,  label:'Fiery Furnace',      ref:'Dan 3',    era:'exile',       icon:'🔥', desc:"Shadrach, Meshach, and Abednego refuse to bow to a golden statue and are thrown into a furnace — and a fourth figure appears." },
  { year:-539,  label:"Cyrus's Decree",     ref:'Ezr 1',    era:'exile',       icon:'📋', desc:"Cyrus of Persia conquers Babylon and issues a decree allowing the Jews to return home — 70 years of exile fulfilled." },
  { year:-520,  label:'Temple Rebuilt',     ref:'Ezr 6',    era:'return',      icon:'🏗️', desc:"After opposition and delays, the Temple is completed and dedicated with great celebration." },
  { year:-458,  label:'Ezra Returns',       ref:'Ezr 7',    era:'return',      icon:'📜', desc:"Ezra leads a second group of exiles back to Jerusalem and leads a great spiritual revival." },
  { year:-444,  label:"Nehemiah's Wall",    ref:'Neh 6',    era:'return',      icon:'🧱', desc:"The walls of Jerusalem are rebuilt in just 52 days despite fierce opposition." },
  { year:-430,  label:'Malachi — Last OT Prophet', ref:'Mal 1', era:'return', icon:'📣', desc:"The last prophet speaks. Then 400 years of silence. Israel waits for the Messiah." },
  { year:-5,    label:'Birth of Jesus',     ref:'Luke 2',   era:'jesus',       icon:'⭐', desc:"The Creator of the universe is born in a stable in Bethlehem. Shepherds and wise men come to worship." },
  { year:12,    label:'Boy Jesus in Temple',ref:'Luke 2:41',era:'jesus',       icon:'📖', desc:"12-year-old Jesus amazes the teachers in the Temple. 'Did you not know I had to be in my Father\'s house?'" },
  { year:27,    label:'Jesus Baptized',     ref:'Matt 3',   era:'jesus',       icon:'🕊️', desc:"John baptizes Jesus. The Spirit descends like a dove. The Father speaks: 'This is my Son, whom I love.'" },
  { year:27,    label:'Sermon on the Mount',ref:'Matt 5-7', era:'jesus',       icon:'⛰️', desc:"The greatest sermon in history. The Beatitudes. The Lord's Prayer. Love your enemies. Build on the rock." },
  { year:29,    label:'Feeding 5,000',      ref:'John 6',   era:'jesus',       icon:'🐟', desc:"Five loaves and two fish feed 5,000 men. Twelve baskets of leftovers. Jesus is the bread of life." },
  { year:29,    label:'Lazarus Raised',     ref:'John 11',  era:'jesus',       icon:'🪨', desc:"'Take away the stone.' After 4 days dead, Lazarus walks out. 'I am the resurrection and the life.'" },
  { year:30,    label:'Triumphal Entry',    ref:'Matt 21',  era:'jesus',       icon:'🌿', desc:"Jesus rides into Jerusalem on a donkey. Crowds wave palms. The city shakes: 'Who is this?'" },
  { year:30,    label:'The Last Supper',    ref:'John 13-17',era:'jesus',      icon:'🍞', desc:"Jesus washes feet. Breaks bread. Pours wine. 'This is my body... this is my blood.' Then He prays for us." },
  { year:30,    label:'The Crucifixion',    ref:'John 19',  era:'jesus',       icon:'✝️', desc:"'It is finished.' The Son of God dies for the sins of the world. The Temple curtain tears from top to bottom." },
  { year:30,    label:'The Resurrection',   ref:'Matt 28',  era:'jesus',       icon:'🌟', desc:"The stone is rolled away. 'He is not here — He has risen!' History's axis point. Everything changes." },
  { year:30,    label:'Pentecost',          ref:'Acts 2',   era:'earlyChurch', icon:'🔥', desc:"The Holy Spirit falls. 3,000 are saved in one day. The Church is born. The mission begins." },
  { year:35,    label:'Paul Converted',     ref:'Acts 9',   era:'earlyChurch', icon:'⚡', desc:"Saul of Tarsus — chief persecutor of Christians — meets the risen Jesus on the road to Damascus." },
  { year:49,    label:'First Missionary Journey',ref:'Acts 13',era:'earlyChurch',icon:'🌍', desc:"Paul and Barnabas are sent out from Antioch. The Gospel moves from Jerusalem to the ends of the earth." },
  { year:64,    label:'Paul Martyred',      ref:'2 Tim 4',  era:'earlyChurch', icon:'⚔️', desc:"Paul is executed in Rome under Nero. His last words: 'I have fought the good fight. I have finished the race.'" },
  { year:70,    label:'Temple Destroyed',   ref:'Matt 24',  era:'earlyChurch', icon:'💔', desc:"Jesus predicted it. Rome fulfills it. The Temple is destroyed and not yet rebuilt — a wound that still bleeds." },
  { year:95,    label:'Revelation Written', ref:'Rev 1',    era:'earlyChurch', icon:'👁️', desc:"John receives visions on Patmos. The final book of the Bible. The last prayer: 'Come, Lord Jesus.'" },
]

const TOTAL_YEARS = 4100
const MIN_YEAR = -4000
const TIMELINE_W = 4200

export default function BibleTimeline() {
  const [selected, setSelected] = useState(null)
  const [eraFilter, setEraFilter] = useState('All')
  const scrollRef = useRef(null)

  const filtered = eraFilter === 'All' ? EVENTS : EVENTS.filter(e => e.era === eraFilter)
  const selectedEvent = selected !== null ? EVENTS.find(e => e.year === selected && e.label === (filtered.find(ev => ev.year === selected)?.label)) || EVENTS.find(e => e.year === selected) : null

  function yearToX(year) { return ((year - MIN_YEAR) / TOTAL_YEARS) * TIMELINE_W + 40 }
  function getEra(year) { return ERAS.find(e => year >= e.start && year <= e.end) }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F0F1A,#1A0A2E)', padding: '48px 36px 36px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, background: 'linear-gradient(90deg,#FCD34D,#F97316,#EC4899,#A5B4FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
          🌍 Bible Timeline
        </h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem', fontWeight: 500 }}>
          From Creation to Revelation — 50 key events across 4,000 years of redemption history. Scroll to explore.
        </p>
      </div>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '24px 20px' }}>
        {/* Era filter */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
          <button onClick={() => setEraFilter('All')} style={{ fontSize: '.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: 100, cursor: 'pointer', border: `1.5px solid ${eraFilter === 'All' ? 'var(--blue)' : 'var(--border)'}`, background: eraFilter === 'All' ? 'var(--blue)' : 'var(--surface)', color: eraFilter === 'All' ? 'white' : 'var(--ink3)' }}>All</button>
          {ERAS.map(era => <button key={era.id} onClick={() => setEraFilter(eraFilter === era.id ? 'All' : era.id)} style={{ fontSize: '.7rem', fontWeight: 700, padding: '5px 11px', borderRadius: 100, cursor: 'pointer', border: `1.5px solid ${eraFilter === era.id ? era.color : 'var(--border)'}`, background: eraFilter === era.id ? era.color + '18' : 'var(--surface)', color: eraFilter === era.id ? era.color : 'var(--ink3)', transition: 'all .2s' }}>{era.label}</button>)}
        </div>

        {/* Scrollable timeline */}
        <div ref={scrollRef} style={{ background: '#0B1525', borderRadius: 20, border: '1.5px solid rgba(255,255,255,.08)', overflowX: 'auto', padding: '20px 0 16px' }}>
          <div style={{ width: TIMELINE_W + 80, position: 'relative', height: 200 }}>
            {/* Era bands */}
            {ERAS.map(era => (
              <div key={era.id} style={{ position: 'absolute', top: 0, left: yearToX(era.start), width: yearToX(era.end) - yearToX(era.start), height: '100%', background: era.color + '08', borderRight: `1px solid ${era.color}22` }}>
                <div style={{ position: 'absolute', top: 8, left: 8, fontSize: '.58rem', fontWeight: 800, color: era.color, textTransform: 'uppercase', letterSpacing: .5, whiteSpace: 'nowrap', opacity: .7 }}>{era.label}</div>
              </div>
            ))}

            {/* Center line */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'rgba(255,255,255,.1)', transform: 'translateY(-50%)' }} />

            {/* Year markers */}
            {[-4000,-3000,-2000,-1500,-1000,-500,0,50,100].map(year => (
              <div key={year} style={{ position: 'absolute', left: yearToX(year), top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.15)', margin: '0 auto' }} />
                <div style={{ fontSize: '.58rem', color: 'rgba(255,255,255,.3)', fontWeight: 600, whiteSpace: 'nowrap', marginTop: 2 }}>{year === 0 ? 'AD/BC' : year > 0 ? `AD ${year}` : `${Math.abs(year)} BC`}</div>
              </div>
            ))}

            {/* Events */}
            {EVENTS.filter(e => eraFilter === 'All' || e.era === eraFilter).map((event, i) => {
              const x = yearToX(event.year)
              const era = getEra(event.year)
              const isAbove = i % 2 === 0
              const isSelected = selected === event.year && selectedEvent?.label === event.label
              return (
                <div key={i} onClick={() => setSelected(isSelected ? null : event.year)} style={{ position: 'absolute', left: x, top: isAbove ? undefined : '50%', bottom: isAbove ? '50%' : undefined, transform: isAbove ? 'translateX(-50%)' : 'translateX(-50%)', cursor: 'pointer', zIndex: 2, paddingBottom: isAbove ? 8 : 0, paddingTop: isAbove ? 0 : 8 }}>
                  {/* Connector line */}
                  <div style={{ width: 1, height: 20, background: era?.color || '#6B7280', margin: '0 auto', opacity: isSelected ? 1 : 0.5 }} />
                  {/* Node */}
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: isSelected ? era?.color || '#6B7280' : '#1E293B', border: `2px solid ${era?.color || '#6B7280'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', margin: '0 auto', transition: 'all .2s', boxShadow: isSelected ? `0 0 16px ${era?.color}66` : 'none', transform: isSelected ? 'scale(1.2)' : 'scale(1)' }}>
                    {event.icon}
                  </div>
                  {/* Label */}
                  <div style={{ fontSize: '.56rem', fontWeight: 700, color: isSelected ? era?.color : 'rgba(255,255,255,.45)', textAlign: 'center', whiteSpace: 'nowrap', marginTop: 3, maxWidth: 70, lineHeight: 1.2 }}>
                    {event.label.length > 14 ? event.label.substring(0, 13) + '..' : event.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail card */}
        {selectedEvent && (
          <div style={{ background: 'var(--surface)', borderRadius: 20, border: `1.5px solid ${getEra(selectedEvent.year)?.color || 'var(--border)'}44`, padding: '22px 26px', marginTop: 16, display: 'flex', gap: 18, alignItems: 'flex-start', animation: 'popIn .3s cubic-bezier(.34,1.56,.64,1)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: (getEra(selectedEvent.year)?.color || '#6B7280') + '18', border: `2px solid ${(getEra(selectedEvent.year)?.color || '#6B7280')}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>{selectedEvent.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)' }}>{selectedEvent.label}</div>
                <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: (getEra(selectedEvent.year)?.color || '#6B7280') + '18', color: getEra(selectedEvent.year)?.color || '#6B7280' }}>
                  {selectedEvent.year > 0 ? `AD ${selectedEvent.year}` : `${Math.abs(selectedEvent.year)} BC`}
                </span>
                <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: 'var(--bg2)', color: 'var(--blue)' }}>{selectedEvent.ref}</span>
              </div>
              <p style={{ fontSize: '.88rem', color: 'var(--ink2)', lineHeight: 1.75, fontWeight: 500 }}>{selectedEvent.desc}</p>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
