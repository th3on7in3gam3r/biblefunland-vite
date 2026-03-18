import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
export default function Admin(){
  const navigate=useNavigate()
  useEffect(()=>{if(sessionStorage.getItem('bfl_admin_verified')!=='true')navigate('/admin/login',{replace:true})},[])
  const[checkins]=useState(()=>(JSON.parse(localStorage.getItem('bfl_streak')||'{}').checkinCount||0))
  const[badges]=useState(()=>(JSON.parse(localStorage.getItem('bfl_state')||'{}').earnedBadges||[]).length)
  const GAMES=[['Scripture Trivia',92,'4.2K'],['Bible Checkers',74,'3.4K'],["Noah's Voyage",61,'2.8K'],['David & Goliath',52,'2.4K'],["Jonah's Escape",40,'1.8K']]
  const ACTIVITY=[{c:'var(--blue)',t:'New game played — Scripture Trivia',when:'Just now'},{c:'var(--green)',t:'Prayer request submitted',when:'2 min ago'},{c:'var(--violet)',t:'AI Devotional generated — "Hope"',when:'5 min ago'},{c:'var(--orange)',t:'Badge unlocked — Week Warrior',when:'12 min ago'},{c:'var(--pink)',t:'Share card downloaded',when:'18 min ago'},{c:'var(--teal)',t:'Daily check-in streak: 7 days',when:'1 hr ago'}]
  return(
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#1F2937,#111827)',padding:'44px 36px 32px'}}>
        <div style={{maxWidth:1140,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div><h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'2.2rem',fontWeight:800,color:'white',marginBottom:4}}>📊 Admin Dashboard</h1><p style={{fontSize:'.85rem',color:'rgba(255,255,255,.4)',fontWeight:500}}>Site analytics and user activity</p></div>
          <button onClick={()=>{sessionStorage.removeItem('bfl_admin_verified');navigate('/')}} className="btn btn-outline btn-sm" style={{color:'rgba(255,255,255,.5)',borderColor:'rgba(255,255,255,.2)'}}>🔒 Lock Admin</button>
        </div>
      </div>
      <div style={{maxWidth:1140,margin:'0 auto',padding:32}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {[['Total Page Views','12,847','↑ +18% this week','var(--blue)'],['Check-ins',checkins,'↑ Streak going','var(--green)'],['Prayer Requests','6','↑ Active community','var(--violet)'],['Badges Earned',badges,'↑ Players growing','var(--orange)']].map(([l,v,sub,c],i)=>(
            <div key={i} style={{background:'var(--surface)',borderRadius:16,padding:22,border:'1.5px solid var(--border)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:c}}/>
              <div style={{fontSize:'.72rem',fontWeight:700,color:'var(--ink3)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:8}}>{l}</div>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'2.1rem',fontWeight:800,color:'var(--ink)',lineHeight:1,marginBottom:4}}>{v}</div>
              <div style={{fontSize:'.72rem',fontWeight:700,color:'var(--green)'}}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
          {/* Bar chart */}
          <div style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid var(--border)',boxShadow:'var(--sh)',overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1rem',fontWeight:800,color:'var(--ink)'}}>🎮 Game Popularity</div>
              <div style={{fontSize:'.68rem',fontWeight:700,padding:'3px 10px',borderRadius:100,background:'var(--blue-bg)',color:'var(--blue)'}}>This Month</div>
            </div>
            <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:10}}>
              {GAMES.map(([name,pct,val],i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:'.75rem',fontWeight:600,color:'var(--ink2)',width:130,flexShrink:0}}>{name}</span>
                  <div style={{flex:1,height:8,borderRadius:100,background:'var(--bg3)',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:100,background:`linear-gradient(90deg,hsl(${220+i*30},80%,55%),hsl(${250+i*30},70%,60%))`,width:`${pct}%`,transition:'width 1s ease'}}/>
                  </div>
                  <span style={{fontSize:'.72rem',fontWeight:700,color:'var(--ink3)',width:36,textAlign:'right'}}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Activity feed */}
          <div style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid var(--border)',boxShadow:'var(--sh)',overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1rem',fontWeight:800,color:'var(--ink)'}}>⚡ Recent Activity</div>
              <div style={{fontSize:'.68rem',fontWeight:700,padding:'3px 10px',borderRadius:100,background:'var(--green-bg)',color:'var(--green)'}}>Live</div>
            </div>
            <div style={{padding:'0 20px'}}>
              {ACTIVITY.map((a,i)=>(
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'11px 0',borderBottom:i<ACTIVITY.length-1?'1px solid var(--border)':'none'}}>
                  <div style={{width:9,height:9,borderRadius:'50%',background:a.c,flexShrink:0,marginTop:5}}/>
                  <div><div style={{fontSize:'.8rem',color:'var(--ink2)',fontWeight:500,lineHeight:1.5}}>{a.t}</div><div style={{fontSize:'.68rem',color:'var(--ink3)',fontWeight:500}}>{a.when}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Table */}
        <div style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid var(--border)',boxShadow:'var(--sh)',overflow:'hidden'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)'}}><div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1rem',fontWeight:800,color:'var(--ink)'}}>📄 Top Content</div></div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Page','Views','Avg Time','Trend'].map(h=><th key={h} style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink3)',letterSpacing:'.5px',textTransform:'uppercase',padding:'8px 16px',textAlign:'left',borderBottom:'1px solid var(--border)'}}>{h}</th>)}</tr></thead>
              <tbody>
                {[['Scripture Trivia Game','4,218','6:42','+22%'],['AI Devotional Generator','3,105','4:18','+35%'],['Prayer Wall','2,890','3:55','+12%'],['Interactive Bible Map','2,340','5:21','+48%'],['Memory Flashcards','1,980','7:10','Steady']].map(([p,v,t,tr],i)=>(
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{fontSize:'.8rem',padding:'11px 16px',borderBottom:'1px solid var(--border)',color:'var(--ink2)',fontWeight:500}}>{p}</td>
                    <td style={{fontSize:'.8rem',padding:'11px 16px',borderBottom:'1px solid var(--border)',color:'var(--ink2)',fontWeight:500}}>{v}</td>
                    <td style={{fontSize:'.8rem',padding:'11px 16px',borderBottom:'1px solid var(--border)',color:'var(--ink2)',fontWeight:500}}>{t}</td>
                    <td style={{fontSize:'.8rem',padding:'11px 16px',borderBottom:'1px solid var(--border)',fontWeight:700,color:tr==='Steady'?'var(--orange)':'var(--green)'}}>{tr==='Steady'?'→ '+tr:'↑ '+tr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
