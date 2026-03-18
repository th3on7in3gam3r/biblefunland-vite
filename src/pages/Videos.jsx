import { useState } from 'react'
const VIDS=[
  {id:1,title:"The Story of Noah's Ark",desc:"The incredible story of Noah's obedience and God's faithfulness.",thumb:'🚢',bg:'linear-gradient(135deg,#EFF6FF,#EDE9FE)',cat:'Bible Story',views:'12.4K',dur:'8:32',yt:'WNKouRd5nLs',featured:true},
  {id:2,title:'David & Goliath — The Full Story',desc:'The epic battle of faith that changed history.',thumb:'🏹',bg:'linear-gradient(135deg,#FDF2F8,#F5F3FF)',cat:'Bible Story',views:'8.7K',dur:'6:14',yt:'3AYoSpGAOHI'},
  {id:3,title:'Morning Devotional — Jeremiah 29:11',desc:"Start your day grounded in God's promise.",thumb:'🌅',bg:'linear-gradient(135deg,#FFFBEB,#FFF7ED)',cat:'Devotional',views:'5.3K',dur:'5:02',yt:'2H_Ls49TKPA'},
  {id:4,title:"Jonah & the Whale — Kids Edition",desc:'A fun, colorful retelling for young believers!',thumb:'🐟',bg:'linear-gradient(135deg,#ECFDF5,#F0FDFA)',cat:'Kids',views:'14.2K',dur:'4:45',yt:'9S9ZenL2fgA'},
  {id:5,title:'Worship Together — Top 5 Family Songs',desc:'Sing along with five uplifting worship songs.',thumb:'🎵',bg:'linear-gradient(135deg,#EFF6FF,#EDE9FE)',cat:'Worship',views:'22.1K',dur:'12:30',yt:'VUROGlegNtU'},
  {id:6,title:'The Creation Story — 7 Days Illustrated',desc:'A breathtaking journey through Genesis 1.',thumb:'🌍',bg:'linear-gradient(135deg,#F0FDFA,#ECFDF5)',cat:'Bible Story',views:'9.8K',dur:'7:18',yt:'WNKouRd5nLs'},
  {id:7,title:'How to Memorize Scripture — 3 Easy Methods',desc:'Fun and effective techniques for all ages.',thumb:'📝',bg:'linear-gradient(135deg,#FEF2F2,#FDF2F8)',cat:'Devotional',views:'6.1K',dur:'9:55',yt:'3AYoSpGAOHI'},
]
const FILTERS=['All','Bible Story','Devotional','Kids','Worship']
export default function Videos(){
  const[filter,setFilter]=useState('All')
  const[modal,setModal]=useState(null)
  const visible=filter==='All'?VIDS:VIDS.filter(v=>v.cat===filter)
  const featured=VIDS.find(v=>v.featured)
  return(
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      {modal&&(
        <div onClick={e=>e.target===e.currentTarget&&setModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:'#0F0F1A',borderRadius:24,overflow:'hidden',width:'100%',maxWidth:860,boxShadow:'0 40px 120px rgba(0,0,0,.5)',position:'relative'}}>
            <button onClick={()=>setModal(null)} style={{position:'absolute',top:12,right:12,zIndex:10,width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.12)',color:'white',border:'none',cursor:'pointer',fontSize:'1rem'}}>✕</button>
            <div style={{aspectRatio:'16/9',background:'#000'}}>
              <iframe src={`https://www.youtube.com/embed/${modal.yt}?autoplay=1`} allowFullScreen style={{width:'100%',height:'100%',border:'none',display:'block'}} title={modal.title}/>
            </div>
            <div style={{padding:'20px 24px'}}><div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.15rem',fontWeight:800,color:'white',marginBottom:5}}>{modal.title}</div><div style={{fontSize:'.82rem',color:'rgba(255,255,255,.5)',fontWeight:500}}>{modal.desc}</div></div>
          </div>
        </div>
      )}
      <div style={{background:'var(--ink)',padding:'60px 36px 44px',textAlign:'center'}}>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'clamp(2rem,4.5vw,3.4rem)',fontWeight:800,letterSpacing:-1,background:'linear-gradient(90deg,#60A5FA,#C084FC,#F472B6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:8}}>Bible Videos</h1>
        <p style={{color:'rgba(255,255,255,.5)',fontSize:'.9rem',fontWeight:500}}>Inspiring stories, tutorials, and devotionals — new content every week!</p>
      </div>
      <div style={{maxWidth:1060,margin:'0 auto',padding:'44px 24px'}}>
        {/* Featured */}
        {featured&&(
          <div style={{marginBottom:44}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'var(--red-bg)',color:'var(--red)',fontSize:'.7rem',fontWeight:700,padding:'4px 12px',borderRadius:100,marginBottom:16}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:'var(--red)',animation:'pulse 1.5s ease-in-out infinite'}}/>Featured This Week
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}`}</style>
            <h2 style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.6rem',fontWeight:800,color:'var(--ink)',marginBottom:6}}>{featured.title}</h2>
            <p style={{fontSize:'.88rem',color:'var(--ink2)',fontWeight:500,marginBottom:18,maxWidth:680}}>{featured.desc}</p>
            <div style={{borderRadius:24,overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,.15)',aspectRatio:'16/9',background:'#0A0A1A',border:'1.5px solid var(--border)',maxWidth:800}}>
              <iframe src={`https://www.youtube.com/embed/${featured.yt}?rel=0&modestbranding=1`} title={featured.title} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{width:'100%',height:'100%',border:'none',display:'block'}}/>
            </div>
          </div>
        )}
        {/* Grid */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,flexWrap:'wrap',gap:12}}>
          <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.3rem',fontWeight:800,color:'var(--ink)'}}>More Videos</div>
          <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
            {FILTERS.map(f=><button key={f} onClick={()=>setFilter(f)} style={{fontSize:'.76rem',fontWeight:700,padding:'6px 14px',borderRadius:100,cursor:'pointer',border:`1.5px solid ${filter===f?'var(--blue)':'var(--border)'}`,background:filter===f?'var(--blue)':'var(--surface)',color:filter===f?'white':'var(--ink2)',transition:'all .2s'}}>{f}</button>)}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18}}>
          {visible.filter(v=>!v.featured).map(v=>(
            <div key={v.id} onClick={()=>setModal(v)} style={{borderRadius:20,background:'var(--surface)',overflow:'hidden',cursor:'pointer',border:'1.5px solid var(--border)',transition:'all .28s',boxShadow:'none'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,.12)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='none'}}>
              <div style={{aspectRatio:'16/9',display:'flex',alignItems:'center',justifyContent:'center',background:v.bg,position:'relative',fontSize:'3.2rem'}}>
                {v.thumb}
                <div style={{position:'absolute',width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,.92)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',boxShadow:'0 4px 18px rgba(0,0,0,.2)',opacity:0,transition:'opacity .25s'}} className="vc-play">▶</div>
                <div style={{position:'absolute',bottom:8,right:8,background:'rgba(0,0,0,.75)',color:'white',fontSize:'.65rem',fontWeight:700,padding:'3px 7px',borderRadius:5}}>{v.dur}</div>
              </div>
              <div style={{padding:16}}>
                <div style={{fontSize:'.63rem',fontWeight:700,padding:'2px 9px',borderRadius:100,background:'var(--blue-bg)',color:'var(--blue)',display:'inline-block',marginBottom:7}}>{v.cat}</div>
                <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'.92rem',fontWeight:800,color:'var(--ink)',lineHeight:1.35,marginBottom:5}}>{v.title}</div>
                <div style={{fontSize:'.7rem',color:'var(--ink3)',fontWeight:600}}>👁️ {v.views} · ⏱️ {v.dur}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
