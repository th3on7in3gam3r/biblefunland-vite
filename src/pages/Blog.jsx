import { useState } from 'react'
const POSTS=[
  {id:1,cat:'Devotional',catC:'var(--blue)',catBg:'var(--blue-bg)',title:'Starting Each Day in the Word: A Simple Habit That Changes Everything',excerpt:"How does a 5-minute morning devotional transform your entire day? Sarah shares her family's journey from chaotic mornings to Spirit-filled ones.",thumb:'🌅',thumbBg:'linear-gradient(135deg,#DBEAFE,#EDE9FE)',author:'Sarah Mitchell',avatar:'👩',date:'March 10, 2025',read:'6 min',featured:true},
  {id:2,cat:'Games Update',catC:'var(--pink)',catBg:'var(--pink-bg)',title:'3 Brand New Bible Games Coming This Spring!',excerpt:'Sneak peek at three incredible new games dropping soon — from the plagues of Egypt to the walls of Jericho.',thumb:'🎮',thumbBg:'linear-gradient(135deg,#FDF2F8,#F5F3FF)',author:'Team BibleFunLand',avatar:'👨',date:'March 8, 2025',read:'3 min'},
  {id:3,cat:'Faith Corner',catC:'var(--green)',catBg:'var(--green-bg)',title:'10 Verses to Memorize With Your Kids This Month',excerpt:"Plant these powerful scriptures in the hearts of your little ones — they'll carry them for a lifetime.",thumb:'✝️',thumbBg:'linear-gradient(135deg,#ECFDF5,#FFFBEB)',author:'Pastor Lisa',avatar:'👩',date:'March 5, 2025',read:'4 min'},
  {id:4,cat:'Ministry',catC:'var(--orange)',catBg:'var(--orange-bg)',title:'Why We Built BibleFunLand — Our Story',excerpt:'The dream of making the Bible the most exciting book in every household started with one family and a big vision for the Kingdom.',thumb:'🌈',thumbBg:'linear-gradient(135deg,#FFF7ED,#FFFBEB)',author:'Jerless',avatar:'👨',date:'Feb 28, 2025',read:'5 min'},
  {id:5,cat:'Kids & Family',catC:'var(--teal)',catBg:'var(--teal-bg)',title:"Teaching Kids to Pray — A Parent's Practical Guide",excerpt:"Prayer doesn't have to be formal or complicated. Here's how to help your children develop a natural, joyful prayer life.",thumb:'🙏',thumbBg:'linear-gradient(135deg,#F0FDFA,#EFF6FF)',author:'Sarah Mitchell',avatar:'👩',date:'Feb 22, 2025',read:'7 min'},
  {id:6,cat:'Devotional',catC:'var(--violet)',catBg:'var(--violet-bg)',title:'Reading the Bible in 90 Days — Week One Recap',excerpt:"We're one week into our 90-day community reading plan and the stories from participants have been absolutely incredible.",thumb:'📖',thumbBg:'linear-gradient(135deg,#EDE9FE,#FDF2F8)',author:'Pastor James',avatar:'👴',date:'Feb 17, 2025',read:'4 min'},
  {id:7,cat:'Ministry',catC:'var(--red)',catBg:'var(--red-bg)',title:'How BibleFunLand is Helping Youth Ministries',excerpt:'Churches and youth leaders are using our games and devotionals to engage teens in new and powerful ways.',thumb:'⛪',thumbBg:'linear-gradient(135deg,#FEF2F2,#FFF7ED)',author:'Team BFL',avatar:'👩',date:'Feb 12, 2025',read:'3 min'},
]
const CATS=['All Posts','Devotional','Games Update','Faith Corner','Kids & Family','Ministry']
export default function Blog(){
  const[cat,setCat]=useState('All Posts')
  const[email,setEmail]=useState('')
  const[subDone,setSubDone]=useState(false)
  const visible=cat==='All Posts'?POSTS:POSTS.filter(p=>p.cat===cat)
  const featured=visible.find(p=>p.featured)
  const rest=visible.filter(p=>!p.featured)
  function subscribe(){if(!email||!email.includes('@')){alert('Please enter a valid email!');return}setSubDone(true);setEmail('')}
  return(
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,var(--orange-bg),var(--pink-bg),var(--blue-bg))',padding:'60px 36px 44px',textAlign:'center',borderBottom:'1px solid var(--border)'}}>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'clamp(2rem,4.5vw,3.4rem)',fontWeight:800,color:'var(--ink)',letterSpacing:-1,marginBottom:8}}>Stories of <span style={{background:'linear-gradient(90deg,#F97316,#EC4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Faith & Fun</span></h1>
        <p style={{fontSize:'.95rem',color:'var(--ink2)',fontWeight:500,maxWidth:440,margin:'0 auto 22px'}}>Devotionals, game updates, ministry resources, and stories from the BibleFunLand family.</p>
        <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
          {CATS.map(c=><button key={c} onClick={()=>setCat(c)} style={{fontSize:'.78rem',fontWeight:700,padding:'7px 16px',borderRadius:100,cursor:'pointer',border:`1.5px solid ${cat===c?'var(--ink)':'var(--border)'}`,background:cat===c?'var(--ink)':'white',color:cat===c?'white':'var(--ink2)',transition:'all .2s'}}>{c}</button>)}
        </div>
      </div>
      <div style={{maxWidth:1160,margin:'0 auto',padding:'52px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:24,marginBottom:24}}>
          {/* Featured */}
          {featured&&(
            <div style={{background:'var(--surface)',borderRadius:24,overflow:'hidden',border:'1.5px solid var(--border)',boxShadow:'var(--sh)',cursor:'pointer',transition:'all .28s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,.12)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='var(--sh)'}}>
              <div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',background:featured.thumbBg,fontSize:'6rem'}}>{featured.thumb}</div>
              <div style={{padding:'22px 24px'}}>
                <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
                  <div style={{fontSize:'.63rem',fontWeight:700,padding:'2px 9px',borderRadius:100,background:featured.catBg,color:featured.catC}}>{featured.cat}</div>
                  <div style={{fontSize:'.63rem',fontWeight:700,padding:'2px 9px',borderRadius:100,background:'var(--orange-bg)',color:'var(--orange)'}}>Featured</div>
                </div>
                <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.45rem',fontWeight:800,color:'var(--ink)',lineHeight:1.35,marginBottom:8}}>{featured.title}</div>
                <div style={{fontSize:'.82rem',color:'var(--ink3)',lineHeight:1.7,fontWeight:500,marginBottom:14}}>{featured.excerpt}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:featured.catBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.95rem'}}>{featured.avatar}</div>
                    <div><div style={{fontSize:'.76rem',fontWeight:700,color:'var(--ink2)'}}>{featured.author}</div><div style={{fontSize:'.7rem',color:'var(--ink3)',fontWeight:500}}>{featured.date} · {featured.read} read</div></div>
                  </div>
                  <button className="btn btn-outline btn-sm">Read More →</button>
                </div>
              </div>
            </div>
          )}
          {/* Sidebar */}
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <div style={{background:'var(--surface)',borderRadius:20,padding:22,border:'1.5px solid var(--border)'}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'.95rem',fontWeight:800,color:'var(--ink)',marginBottom:6}}>📬 Newsletter</div>
              <p style={{fontSize:'.8rem',color:'var(--ink2)',fontWeight:500,lineHeight:1.6,marginBottom:12}}>Weekly devotionals and game updates straight to your inbox!</p>
              {subDone?<div style={{background:'var(--green-bg)',color:'var(--green)',borderRadius:10,padding:'10px',fontSize:'.8rem',fontWeight:700,textAlign:'center'}}>✅ Subscribed! Check your inbox 🙏</div>:(
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  <input className="input-field" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&subscribe()}/>
                  <button className="btn btn-blue btn-full" onClick={subscribe} style={{justifyContent:'center'}}>Subscribe Free ✦</button>
                </div>
              )}
            </div>
            <div style={{background:'var(--surface)',borderRadius:20,padding:22,border:'1.5px solid var(--border)'}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'.95rem',fontWeight:800,color:'var(--ink)',marginBottom:14}}>🔖 Topics</div>
              <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                {['Prayer','Kids','Family','Games','Devotional','Scripture','Worship','Ministry','Youth'].map(t=>(
                  <button key={t} style={{fontSize:'.73rem',fontWeight:700,padding:'4px 11px',borderRadius:100,background:'var(--bg2)',color:'var(--ink2)',border:'none',cursor:'pointer',transition:'all .2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='var(--blue-bg)';e.currentTarget.style.color='var(--blue)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='var(--bg2)';e.currentTarget.style.color='var(--ink2)'}}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Post grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          {rest.map(p=>(
            <div key={p.id} style={{background:'var(--surface)',borderRadius:20,overflow:'hidden',border:'1.5px solid var(--border)',cursor:'pointer',transition:'all .28s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,.12)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='none'}}>
              <div style={{height:160,display:'flex',alignItems:'center',justifyContent:'center',background:p.thumbBg,fontSize:'4rem'}}>{p.thumb}</div>
              <div style={{padding:'18px 20px'}}>
                <div style={{fontSize:'.63rem',fontWeight:700,padding:'2px 9px',borderRadius:100,background:p.catBg,color:p.catC,display:'inline-block',marginBottom:8}}>{p.cat}</div>
                <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1rem',fontWeight:800,color:'var(--ink)',lineHeight:1.35,marginBottom:7}}>{p.title}</div>
                <div style={{fontSize:'.78rem',color:'var(--ink3)',lineHeight:1.65,fontWeight:500,marginBottom:12}}>{p.excerpt}</div>
                <div style={{display:'flex',alignItems:'center',gap:7,fontSize:'.72rem',color:'var(--ink3)',fontWeight:600}}>
                  <span>{p.avatar}</span><span>{p.author} · {p.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
