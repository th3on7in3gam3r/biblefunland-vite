import { useState } from 'react'

const MOODS = [
  { id:'worship',   label:'Worship & Praise',  icon:'🙌', color:'#F59E0B', desc:'Lift Him high', bg:'rgba(245,158,11,.1)' },
  { id:'prayer',    label:'Prayer & Quiet',     icon:'🙏', color:'#8B5CF6', desc:'Still before God', bg:'rgba(139,92,246,.1)' },
  { id:'study',     label:'Bible Study',        icon:'📖', color:'#3B82F6', desc:'Focus & clarity', bg:'rgba(59,130,246,.1)' },
  { id:'grief',     label:'Grief & Lament',     icon:'💔', color:'#6366F1', desc:'He sees your tears', bg:'rgba(99,102,241,.1)' },
  { id:'joy',       label:'Joy & Celebration',  icon:'🎉', color:'#10B981', desc:'Shout to the Lord', bg:'rgba(16,185,129,.1)' },
  { id:'anxiety',   label:'Anxiety & Rest',     icon:'🕊️', color:'#14B8A6', desc:'Peace that passes understanding', bg:'rgba(20,184,166,.1)' },
  { id:'goodfriday',label:'Good Friday',         icon:'✝️', color:'#EF4444', desc:'Remembering the cross', bg:'rgba(239,68,68,.1)' },
  { id:'christmas', label:'Christmas & Advent', icon:'⭐', color:'#FCD34D', desc:'Emmanuel, God with us', bg:'rgba(252,211,77,.1)' },
  { id:'morning',   label:'Morning Devotion',   icon:'🌅', color:'#F97316', desc:'New mercies every morning', bg:'rgba(249,115,22,.1)' },
  { id:'sleep',     label:'Sleep & Rest',        icon:'🌙', color:'#6366F1', desc:'He grants sleep to those He loves', bg:'rgba(99,102,241,.1)' },
]

const PLAYLISTS = {
  worship: [
    { title:'Goodness of God', artist:'CeCe Winans', id:'1Ckab0G5ZEajN2vNPBV4aQ_video' },
    { title:'Way Maker', artist:'Sinach', ytId:'iKMjx8YQUD4' },
    { title:'King of Kings', artist:'Hillsong Worship', ytId:'co-alttBe6o' },
    { title:'Oceans (Where Feet May Fail)', artist:'Hillsong United', ytId:'dy9nwe9i0M4' },
    { title:'What A Beautiful Name', artist:'Hillsong Worship', ytId:'nQWFzMvCfLE' },
    { title:'Great Are You Lord', artist:'All Sons & Daughters', ytId:'WDFf2FrWP5w' },
  ],
  prayer: [
    { title:'Still', artist:'Hillsong Worship', ytId:'tTJHRGM6OJc' },
    { title:'Abide With Me', artist:'Indelible Grace', ytId:'XdbLuiQKBBU' },
    { title:'Be Thou My Vision', artist:'Audrey Assad', ytId:'S5YVbFw9e9Q' },
    { title:'Holy Spirit', artist:'Francesca Battistelli', ytId:'MKGpiT8JKxg' },
    { title:'Breathe', artist:'Michael W. Smith', ytId:'C6gHwBEAMHM' },
    { title:'Lead Me To The Cross', artist:'Hillsong United', ytId:'0YwGNT2v2JI' },
  ],
  study: [
    { title:'Ancient Words', artist:'Lynn DeShazo', ytId:'HHl-7MKM5jg' },
    { title:'Open My Eyes Lord', artist:'Jesse Manibusan', ytId:'pXMRl9Yyqtk' },
    { title:'Speak O Lord', artist:'Keith & Kristyn Getty', ytId:'8GxlEeVs0mo' },
    { title:'Lord I Need You', artist:'Matt Maher', ytId:'LuvfMDhTyMA' },
    { title:'Give Me Jesus', artist:'Jeremy Camp', ytId:'Bex2j8vMtns' },
    { title:'More of You', artist:'Colton Dixon', ytId:'wqPDZSjgVsI' },
  ],
  grief: [
    { title:'Even If', artist:'MercyMe', ytId:'G6V4ZG6pLHU' },
    { title:'It Is Well', artist:'Kristene DiMarco', ytId:'6mVcS6oKaAk' },
    { title:'You Never Let Go', artist:'Matt Redman', ytId:'dWMFoJaF7lU' },
    { title:'Held', artist:'Natalie Grant', ytId:'dkDCsH_xcRU' },
    { title:'Scars In Heaven', artist:'Casting Crowns', ytId:'XhAoNVlRpqE' },
    { title:'Through All Of It', artist:'Colton Dixon', ytId:'wBb4M8rKV64' },
  ],
  joy: [
    { title:'Happy Day', artist:'Tim Hughes', ytId:'dlZvvOq5DAo' },
    { title:'Dancing Generation', artist:'Matt Redman', ytId:'Rc6xXp3jkFk' },
    { title:'Joy', artist:'for KING & COUNTRY', ytId:'iKfKzFHrcZk' },
    { title:'Oh Happy Day', artist:'Edwin Hawkins Singers', ytId:'3pkxFUKdMV8' },
    { title:'Shake Heaven', artist:'William McDowell', ytId:'nxMW7jTR7ZQ' },
    { title:'Alive', artist:'Hillsong Young & Free', ytId:'8XMFvnJxh84' },
  ],
  anxiety: [
    { title:'Peace Be Still', artist:'Hope Darst', ytId:'MIZoUz2qMnU' },
    { title:'Prince of Peace', artist:'Hillsong United', ytId:'hYbhq_IpHoQ' },
    { title:'Rest', artist:'Christy Nockels', ytId:'G5jbpHsXGoo' },
    { title:'Fear Is A Liar', artist:'Zach Williams', ytId:'P3MO1RhOjLI' },
    { title:'No Longer Slaves', artist:'Bethel Music', ytId:'kRgEFnHNTgc' },
    { title:'Eye Of The Storm', artist:'Ryan Stevenson', ytId:'6hAu5PbEedM' },
  ],
  goodfriday: [
    { title:'O Sacred Head Now Wounded', artist:'Fernando Ortega', ytId:'7qQRY_LW6n4' },
    { title:'Were You There', artist:'Mahalia Jackson', ytId:'ixZuEgWfGh0' },
    { title:'How Deep The Father\'s Love For Us', artist:'Stuart Townend', ytId:'b3zfZ-7j2SQ' },
    { title:'At The Cross', artist:'Hillsong Worship', ytId:'c3Ry3M7_RqQ' },
    { title:'The Power of The Cross', artist:'Keith & Kristyn Getty', ytId:'M0ZmRJh9lZU' },
    { title:'Thank You', artist:'Don Moen', ytId:'GXiEjhJK4_E' },
  ],
  christmas: [
    { title:'O Holy Night', artist:'Josh Groban', ytId:'J6PsmhZHHkI' },
    { title:'Mary Did You Know', artist:'Pentatonix', ytId:'ifCWN5pSGq0' },
    { title:'Hallelujah (Christmas Version)', artist:'Cloverton', ytId:'1k4kq3EKjL4' },
    { title:'Emmanuel', artist:'Chris Tomlin', ytId:'F4DSrjFGXA8' },
    { title:'Breath of Heaven', artist:'Amy Grant', ytId:'lG-8YxjSHBU' },
    { title:'Joy To The World', artist:'Hillsong Worship', ytId:'K4bFvFRgkVc' },
  ],
  morning: [
    { title:'Great Is Thy Faithfulness', artist:'Thomas Chisholm', ytId:'KtXGHIXRnQE' },
    { title:'New Every Morning', artist:'Third Day', ytId:'jRGPqO6H2Hw' },
    { title:'Morning by Morning', artist:'Maverick City Music', ytId:'1AbP1WFnkDk' },
    { title:'Good Morning', artist:'Mandisa', ytId:'9UVfhq7Tkxs' },
    { title:'Rise', artist:'Danny Gokey', ytId:'3GFDFklFwuk' },
    { title:'You Are My Strength', artist:'Hillsong Worship', ytId:'gFTgYe9ZPGU' },
  ],
  sleep: [
    { title:'Lullaby (Goodnight My Angel)', artist:'Billy Joel (worship cover)', ytId:'9_fXYY3XKUQ' },
    { title:'He Will Hold Me Fast', artist:'Selah', ytId:'v2Bvt0nnTak' },
    { title:'In Christ Alone', artist:'Adrienne Liesching', ytId:'UEznWbhO0Ow' },
    { title:'Be Still My Soul', artist:'Kari Jobe', ytId:'e7KIX-SqLn8' },
    { title:'Psalm 23', artist:'Stuart Townend', ytId:'2XeNJxJi-T0' },
    { title:'You Are Good', artist:'Brian Johnson', ytId:'R4TvR9bZxE4' },
  ],
}

export default function WorshipDiscovery() {
  const [mood,    setMood]    = useState(null)
  const [playing, setPlaying] = useState(null)

  const playlist = mood ? (PLAYLISTS[mood.id]||[]) : []
  const currentMood = MOODS.find(m=>m.id===mood?.id)

  return (
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#0F0F1A,#1A0A2E',padding:'48px 36px 36px',textAlign:'center'}}>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,background:'linear-gradient(90deg,#FCD34D,#F9A8D4,#6EE7B7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:8}}>🎵 Worship Discovery</h1>
        <p style={{color:'rgba(255,255,255,.45)',fontSize:'.88rem',fontWeight:500}}>Curated Christian playlists for every season of the soul. Pick your mood — let worship find you.</p>
      </div>

      <div style={{maxWidth:960,margin:'0 auto',padding:'28px 20px'}}>
        {/* Mood grid */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:1,marginBottom:14}}>How Is Your Heart Today?</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
            {MOODS.map(m=>(
              <div key={m.id} onClick={()=>{setMood(m);setPlaying(null)}}
                style={{background:mood?.id===m.id?m.bg:'var(--surface)',borderRadius:18,border:`1.5px solid ${mood?.id===m.id?m.color:'var(--border)'}`,padding:'16px 14px',cursor:'pointer',transition:'all .22s',textAlign:'center',boxShadow:mood?.id===m.id?`0 6px 20px ${m.color}20`:'none',transform:mood?.id===m.id?'scale(1.03)':'scale(1)'}}>
                <div style={{fontSize:'1.8rem',marginBottom:6}}>{m.icon}</div>
                <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:mood?.id===m.id?m.color:'var(--ink)',fontSize:'.82rem',lineHeight:1.2,marginBottom:3}}>{m.label}</div>
                <div style={{fontSize:'.62rem',color:'var(--ink3)',fontWeight:500}}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Playlist */}
        {mood && (
          <div style={{animation:'fadeIn .35s ease'}}>
            <div style={{background:'var(--surface)',borderRadius:24,border:`1.5px solid ${currentMood.color}44`,overflow:'hidden'}}>
              <div style={{background:`linear-gradient(135deg,${currentMood.color}18,${currentMood.color}06)`,padding:'22px 26px',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{fontSize:'2.2rem'}}>{currentMood.icon}</div>
                  <div>
                    <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--ink)',fontSize:'1.1rem'}}>{currentMood.label}</div>
                    <div style={{fontSize:'.76rem',color:'var(--ink3)',fontWeight:500}}>{playlist.length} songs · Click any song to open on YouTube</div>
                  </div>
                </div>
              </div>
              <div style={{padding:'8px 0'}}>
                {playlist.map((song,i)=>(
                  <a key={i} href={`https://www.youtube.com/watch?v=${song.ytId}`} target="_blank" rel="noopener noreferrer"
                    style={{display:'flex',alignItems:'center',gap:14,padding:'14px 24px',borderBottom:'1px solid var(--border)',textDecoration:'none',transition:'all .2s',cursor:'pointer'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='var(--bg2)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
                    <div style={{width:38,height:38,borderRadius:12,background:currentMood.color+'18',border:`1.5px solid ${currentMood.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.88rem',color:currentMood.color,fontWeight:800,flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,color:'var(--ink)',fontSize:'.92rem'}}>{song.title}</div>
                      <div style={{fontSize:'.72rem',color:'var(--ink3)',fontWeight:500}}>{song.artist}</div>
                    </div>
                    <div style={{fontSize:'.7rem',fontWeight:700,color:currentMood.color,padding:'4px 10px',borderRadius:100,background:currentMood.color+'12',border:`1px solid ${currentMood.color}33`,whiteSpace:'nowrap'}}>▶ YouTube</div>
                  </a>
                ))}
              </div>
            </div>
            <p style={{fontSize:'.72rem',color:'var(--ink3)',textAlign:'center',marginTop:12,fontWeight:500}}>Links open on YouTube. BibleFunLand does not host audio files.</p>
          </div>
        )}

        {!mood && (
          <div style={{textAlign:'center',padding:'32px 0',color:'var(--ink3)'}}>
            <div style={{fontSize:'3rem',opacity:.2,marginBottom:12}}>🎵</div>
            <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--ink)',fontSize:'1.1rem',marginBottom:6}}>Choose a mood above</div>
            <p style={{fontSize:'.84rem'}}>The right song meets you right where you are.</p>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
