import { useState } from 'react'
const DEFAULT=[
  {id:1,name:'Sarah M.',category:'Healing',text:"Please pray for my mother's recovery from surgery. We believe God is the ultimate healer!",time:'2 hours ago',bg:'var(--green-bg)',emoji:'👩',count:14,prayed:false},
  {id:2,name:'Anonymous',category:'Guidance',text:"I'm at a crossroads in my career and need wisdom. Praying God would make the path clear.",time:'5 hours ago',bg:'var(--blue-bg)',emoji:'🙏',count:22,prayed:false},
  {id:3,name:'Pastor James',category:'Praise',text:'Praising God for answered prayer! My son accepted Jesus last Sunday at youth service! 🎉',time:'1 day ago',bg:'var(--orange-bg)',emoji:'👨',count:48,prayed:false},
  {id:4,name:'Grace F.',category:'Family',text:'Asking for prayers for unity in my family. We are going through a tough season but trust God.',time:'1 day ago',bg:'var(--pink-bg)',emoji:'👧',count:31,prayed:false},
  {id:5,name:'FaithWalker',category:'Salvation',text:"Please intercede for my neighbor who has been asking questions about faith.",time:'2 days ago',bg:'var(--violet-bg)',emoji:'🤲',count:19,prayed:false},
  {id:6,name:'JoyfulKid',category:'General',text:'Thank you for this website! Please pray I do well in my Bible memory contest at church!',time:'3 days ago',bg:'var(--yellow-bg)',emoji:'👦',count:37,prayed:false},
]
const CATS=['General','Healing','Family','Provision','Guidance','Salvation','Praise']
const CCOLORS={Healing:'var(--green)',Guidance:'var(--blue)',Praise:'var(--orange)',Family:'var(--pink)',Salvation:'var(--violet)',General:'var(--yellow)',Provision:'var(--teal)'}
const CBGS={Healing:'var(--green-bg)',Guidance:'var(--blue-bg)',Praise:'var(--orange-bg)',Family:'var(--pink-bg)',Salvation:'var(--violet-bg)',General:'var(--yellow-bg)',Provision:'var(--teal-bg)'}
export default function PrayerWall(){
  const[prayers,setPrayers]=useState(DEFAULT)
  const[form,setForm]=useState({name:'',category:'General',text:'',anon:false})
  const[submitted,setSubmitted]=useState(false)
  function pray(id){setPrayers(ps=>ps.map(p=>p.id===id?{...p,count:p.prayed?p.count-1:p.count+1,prayed:!p.prayed}:p))}
  function submit(){
    if(!form.text.trim()){alert('Please enter a prayer request.');return}
    const n={id:Date.now(),name:form.anon?'Anonymous':form.name||'Anonymous',category:form.category,text:form.text,time:'Just now',bg:CBGS[form.category]||'var(--green-bg)',emoji:'🙏',count:0,prayed:false}
    setPrayers(ps=>[n,...ps]);setForm({name:'',category:'General',text:'',anon:false});setSubmitted(true);setTimeout(()=>setSubmitted(false),3000)
  }
  return(
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#064E3B,#065F46,#0F766E)',padding:'60px 36px 44px',textAlign:'center'}}>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'clamp(2rem,4.5vw,3.4rem)',fontWeight:800,color:'white',letterSpacing:-1,marginBottom:8}}>Prayer Wall</h1>
        <p style={{color:'rgba(255,255,255,.6)',fontSize:'.9rem',fontWeight:500}}>Share your heart. Pray for others. Faith grows together.</p>
      </div>
      <div style={{maxWidth:1060,margin:'0 auto',padding:'44px 24px'}}>
        {/* Submit form */}
        <div style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid var(--border)',boxShadow:'0 8px 32px rgba(0,0,0,.08)',padding:32,marginBottom:36}}>
          <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.25rem',fontWeight:800,color:'var(--ink)',marginBottom:6}}>🙏 Submit a Prayer Request</div>
          <div style={{fontSize:'.84rem',color:'var(--ink2)',fontWeight:500,marginBottom:20}}>Share what's on your heart and let the community lift you up in prayer.</div>
          {submitted&&<div style={{background:'var(--green-bg)',color:'var(--green)',borderRadius:12,padding:'10px 14px',fontSize:'.82rem',fontWeight:700,marginBottom:14}}>✅ Your prayer request has been shared!</div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <input className="input-field" placeholder="Your name (optional)" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            <select className="input-field" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <textarea className="textarea-field" placeholder="Share your prayer request here..." value={form.text} onChange={e=>setForm(f=>({...f,text:e.target.value}))} style={{marginBottom:14,height:90}}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:'.8rem',color:'var(--ink2)',fontWeight:600,cursor:'pointer'}}>
              <input type="checkbox" checked={form.anon} onChange={e=>setForm(f=>({...f,anon:e.target.checked}))} style={{accentColor:'var(--green)'}}/>
              Post anonymously
            </label>
            <button className="btn btn-green" onClick={submit}>🙏 Submit Prayer Request</button>
          </div>
        </div>
        {/* Wall */}
        <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.25rem',fontWeight:800,color:'var(--ink)',marginBottom:20}}>🌍 Community Prayer Requests <span style={{fontFamily:'Poppins,sans-serif',fontSize:'.8rem',fontWeight:600,color:'var(--ink3)'}}>({prayers.length} requests)</span></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {prayers.map(p=>(
            <div key={p.id} style={{background:'var(--surface)',borderRadius:20,padding:20,border:'1.5px solid var(--border)',boxShadow:'var(--sh-sm)',transition:'all .25s'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:34,height:34,borderRadius:'50%',background:p.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>{p.emoji}</div>
                <div>
                  <div style={{fontSize:'.84rem',fontWeight:700,color:'var(--ink)'}}>{p.name}</div>
                  <div style={{fontSize:'.7rem',color:'var(--ink3)',fontWeight:500}}>{p.time}</div>
                </div>
                <div style={{marginLeft:'auto',fontSize:'.65rem',fontWeight:700,padding:'3px 9px',borderRadius:100,background:CBGS[p.category]||'var(--green-bg)',color:CCOLORS[p.category]||'var(--green)'}}>{p.category}</div>
              </div>
              <div style={{fontSize:'.83rem',color:'var(--ink2)',lineHeight:1.7,fontWeight:500,marginBottom:12}}>{p.text}</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <button onClick={()=>pray(p.id)} style={{display:'flex',alignItems:'center',gap:6,fontSize:'.78rem',fontWeight:700,padding:'7px 14px',borderRadius:9,border:`1.5px solid ${p.prayed?'var(--green)':'var(--border)'}`,background:p.prayed?'var(--green-bg)':'var(--surface)',color:p.prayed?'var(--green)':'var(--ink2)',cursor:'pointer',transition:'all .2s'}}>
                  🙏 {p.prayed?'Praying!':'Pray'}
                </button>
                <span style={{fontSize:'.75rem',color:'var(--ink3)',fontWeight:600}}>🙏 {p.count} praying</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
