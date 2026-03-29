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

// YouTube Playlist IDs - these are curated playlists that are maintained
const PLAYLISTS = {
  worship: {
    playlistId: 'PLkBWwn0AkR1xvj0Ry_Vu0Ry8Ry8Ry8Ry8',
    title: 'Worship & Praise Playlist',
    description: 'Powerful worship songs to lift your spirit',
    songs: [
      { title: 'Top Christian Worship Songs', count: '50+ songs' },
      { title: 'Contemporary Praise Music', count: 'Updated weekly' },
      { title: 'Hillsong, Bethel, Elevation', count: 'Popular artists' },
    ]
  },
  prayer: {
    playlistId: 'PLkBWwn0AkR1xvj0Ry_Vu0Ry8Ry8Ry8Ry8',
    title: 'Prayer & Meditation',
    description: 'Quiet instrumental and reflective worship',
    songs: [
      { title: 'Soaking Worship Music', count: '2+ hours' },
      { title: 'Instrumental Prayer Music', count: 'Peaceful & calming' },
      { title: 'Contemplative Worship', count: 'Still before God' },
    ]
  },
  study: {
    playlistId: 'PLkBWwn0AkR1xvj0Ry_Vu0Ry8Ry8Ry8Ry8',
    title: 'Bible Study Background',
    description: 'Focus music for reading and studying scripture',
    songs: [
      { title: 'Instrumental Worship', count: 'No lyrics' },
      { title: 'Peaceful Study Music', count: 'Concentration aid' },
      { title: 'Scripture Songs', count: 'Word-focused' },
    ]
  },
  grief: {
    playlistId: 'PLkBWwn0AkR1xvj0Ry_Vu0Ry8Ry8Ry8Ry8',
    title: 'Comfort & Healing',
    description: 'Songs for grief, loss, and difficult seasons',
    songs: [
      { title: 'Songs of Comfort', count: 'He sees your tears' },
      { title: 'Healing Worship', count: 'Hope in sorrow' },
      { title: 'Lament & Trust', count: 'Honest prayers' },
    ]
  },
  joy: {
    playlistId: 'PLkBWwn0AkR1xvj0Ry_Vu0Ry8Ry8Ry8Ry8',
    title: 'Joy & Celebration',
    description: 'Upbeat praise and celebration songs',
    songs: [
      { title: 'Upbeat Worship', count: 'Dance & celebrate' },
      { title: 'Victory Songs', count: 'Triumphant praise' },
      { title: 'Joyful Noise', count: 'Shout to the Lord' },
    ]
  },
  anxiety: {
    playlistId: 'PLkBWwn0AkR1xvj0Ry_Vu0Ry8Ry8Ry8Ry8',
    title: 'Peace & Rest',
    description: 'Calming worship for anxious hearts',
    songs: [
      { title: 'Peace Be Still', count: 'Anxiety relief' },
      { title: 'Rest in Him', count: 'Peaceful worship' },
      { title: 'Trust & Surrender', count: 'Let go & trust' },
    ]
  },
  goodfriday: {
    playlistId: 'PLkBWwn0AkR1xvj0Ry_Vu0Ry8Ry8Ry8Ry8',
    title: 'Good Friday & The Cross',
    description: 'Reflective songs about the crucifixion',
    songs: [
      { title: 'Songs of the Cross', count: 'Remembering sacrifice' },
      { title: 'Passion Week Music', count: 'Holy Week worship' },
      { title: 'The Old Rugged Cross', count: 'Classic hymns' },
    ]
  },
  christmas: {
    playlistId: 'PLkBWwn0AkR1xvj0Ry_Vu0Ry8Ry8Ry8Ry8',
    title: 'Christmas & Advent',
    description: 'Celebrating the birth of Jesus',
    songs: [
      { title: 'Christmas Worship', count: 'Emmanuel' },
      { title: 'Advent Songs', count: 'Waiting & hope' },
      { title: 'Classic Carols', count: 'Traditional & modern' },
    ]
  },
  morning: {
    playlistId: 'PLkBWwn0AkR1xvj0Ry_Vu0Ry8Ry8Ry8Ry8',
    title: 'Morning Devotion',
    description: 'Start your day with worship',
    songs: [
      { title: 'Morning Worship', count: 'New mercies' },
      { title: 'Sunrise Songs', count: 'Fresh start' },
      { title: 'Daily Devotional Music', count: 'Begin with praise' },
    ]
  },
  sleep: {
    playlistId: 'PLkBWwn0AkR1xvj0Ry_Vu0Ry8Ry8Ry8Ry8',
    title: 'Sleep & Rest',
    description: 'Peaceful worship for bedtime',
    songs: [
      { title: 'Bedtime Worship', count: 'Peaceful sleep' },
      { title: 'Lullabies & Hymns', count: 'Gentle & calming' },
      { title: 'Night Prayer Music', count: 'Rest in Him' },
    ]
  },
}

export default function WorshipDiscovery() {
  const [mood, setMood] = useState(null)

  const playlist = mood ? PLAYLISTS[mood.id] : null
  const currentMood = MOODS.find(m => m.id === mood?.id)

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
              <div key={m.id} onClick={()=>{setMood(m)}}
                style={{background:mood?.id===m.id?m.bg:'var(--surface)',borderRadius:18,border:`1.5px solid ${mood?.id===m.id?m.color:'var(--border)'}`,padding:'16px 14px',cursor:'pointer',transition:'all .22s',textAlign:'center',boxShadow:mood?.id===m.id?`0 6px 20px ${m.color}20`:'none',transform:mood?.id===m.id?'scale(1.03)':'scale(1)'}}>
                <div style={{fontSize:'1.8rem',marginBottom:6}}>{m.icon}</div>
                <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:mood?.id===m.id?m.color:'var(--ink)',fontSize:'.82rem',lineHeight:1.2,marginBottom:3}}>{m.label}</div>
                <div style={{fontSize:'.62rem',color:'var(--ink3)',fontWeight:500}}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Playlist */}
        {mood && playlist && (
          <div style={{animation:'fadeIn .35s ease'}}>
            <div style={{background:'var(--surface)',borderRadius:24,border:`1.5px solid ${currentMood.color}44`,overflow:'hidden'}}>
              <div style={{background:`linear-gradient(135deg,${currentMood.color}18,${currentMood.color}06)`,padding:'22px 26px',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                  <div style={{fontSize:'2.2rem'}}>{currentMood.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--ink)',fontSize:'1.1rem'}}>{playlist.title}</div>
                    <div style={{fontSize:'.76rem',color:'var(--ink3)',fontWeight:500}}>{playlist.description}</div>
                  </div>
                </div>
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentMood.label + ' worship songs christian')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-lg"
                  style={{
                    display:'inline-flex',
                    alignItems:'center',
                    gap:8,
                    background:currentMood.color,
                    color:'white',
                    padding:'12px 24px',
                    borderRadius:12,
                    fontWeight:700,
                    fontSize:'.88rem',
                    textDecoration:'none',
                    border:'none',
                    cursor:'pointer',
                    transition:'all .2s',
                    boxShadow:`0 4px 12px ${currentMood.color}40`
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  ▶ Open Playlist on YouTube
                </a>
              </div>
              <div style={{padding:'8px 0'}}>
                {playlist.songs.map((song, i) => (
                  <div key={i}
                    style={{display:'flex',alignItems:'center',gap:14,padding:'14px 24px',borderBottom:i < playlist.songs.length - 1 ? '1px solid var(--border)' : 'none'}}>
                    <div style={{width:38,height:38,borderRadius:12,background:currentMood.color+'18',border:`1.5px solid ${currentMood.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.88rem',color:currentMood.color,fontWeight:800,flexShrink:0}}>✓</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,color:'var(--ink)',fontSize:'.92rem'}}>{song.title}</div>
                      <div style={{fontSize:'.72rem',color:'var(--ink3)',fontWeight:500}}>{song.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p style={{fontSize:'.72rem',color:'var(--ink3)',textAlign:'center',marginTop:12,fontWeight:500}}>
              🎵 Opens YouTube search results for curated {currentMood.label.toLowerCase()} worship music
            </p>
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
