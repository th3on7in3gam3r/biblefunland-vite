import { useState } from 'react'
const LOCATIONS={
  jerusalem:{name:'Jerusalem',region:'Judea',rc:'var(--red)',rb:'var(--red-bg)',desc:"The holiest city in the Bible — capital of David's kingdom, site of Solomon's Temple, and the city where Jesus was crucified and rose from the dead.",stories:[{icon:'⚔️',title:'David captures the city',ref:'2 Samuel 5:6-7'},{icon:'🏛️',title:"Solomon's Temple built",ref:'1 Kings 6'},{icon:'✝️',title:'Jesus crucified & risen',ref:'Matthew 27-28'},{icon:'🕊️',title:'Pentecost — birth of the Church',ref:'Acts 2'}],verse:'"Pray for the peace of Jerusalem." — Psalm 122:6'},
  bethlehem:{name:'Bethlehem',region:'Judea',rc:'var(--violet)',rb:'var(--violet-bg)',desc:'A small town south of Jerusalem with an outsized role in history. David was born here, and centuries later, the Messiah entered the world in a humble manger.',stories:[{icon:'👑',title:'King David born here',ref:'1 Samuel 16:1-13'},{icon:'👶',title:'Jesus born in a manger',ref:'Luke 2:1-7'},{icon:'🌟',title:'Wise men follow the star',ref:'Matthew 2:1-12'},{icon:'📖',title:'Ruth & Boaz love story',ref:'Ruth 4'}],verse:'"But you, Bethlehem… out of you will come… one who will be ruler over Israel." — Micah 5:2'},
  nazareth:{name:'Nazareth',region:'Galilee',rc:'var(--blue)',rb:'var(--blue-bg)',desc:'A small village in Galilee where Jesus grew up. This is where the angel Gabriel appeared to Mary, and where Jesus lived for most of his 30 years.',stories:[{icon:'👼',title:'Angel Gabriel visits Mary',ref:'Luke 1:26-38'},{icon:'👦',title:'Jesus grows up here',ref:'Luke 2:51-52'},{icon:'📜',title:'Jesus reads Isaiah in synagogue',ref:'Luke 4:16-21'},{icon:'😮',title:'Hometown rejects Jesus',ref:'Mark 6:1-6'}],verse:'"Jesus of Nazareth… a man accredited by God… by miracles, wonders and signs." — Acts 2:22'},
  capernaum:{name:'Capernaum',region:'Galilee',rc:'var(--teal)',rb:'var(--teal-bg)',desc:"Jesus' base of operations during his Galilean ministry. He performed more miracles here than anywhere else — healing Peter's mother-in-law, the paralyzed man, and more.",stories:[{icon:'🏠',title:"Peter's home — Jesus' base",ref:'Matthew 4:13'},{icon:'🦯',title:'Paralyzed man healed',ref:'Mark 2:1-12'},{icon:'⚕️',title:"Centurion's servant healed",ref:'Matthew 8:5-13'},{icon:'🎣',title:'Matthew called from tax booth',ref:'Matthew 9:9'}],verse:'"And leaving Nazareth, he came and settled in Capernaum by the sea." — Matthew 4:13'},
  jericho:{name:'Jericho',region:'Jordan Valley',rc:'var(--orange)',rb:'var(--orange-bg)',desc:"One of the world's oldest cities and a key site in both Testaments. The walls famously fell after Israel marched around them seven times.",stories:[{icon:'📯',title:'Walls fall after 7 days',ref:'Joshua 6'},{icon:'🌹',title:'Rahab hides the spies',ref:'Joshua 2'},{icon:'🌳',title:'Zacchaeus in the tree',ref:'Luke 19:1-10'},{icon:'🩹',title:'Good Samaritan parable road',ref:'Luke 10:25-37'}],verse:'"So the wall fell down flat. Then the people went up… and they took the city." — Joshua 6:20'},
  sinai:{name:'Mt. Sinai',region:'Sinai Peninsula',rc:'var(--yellow)',rb:'var(--yellow-bg)',desc:'The sacred mountain where Moses encountered God in the burning bush and later received the Ten Commandments. Also called Horeb.',stories:[{icon:'🔥',title:'Burning bush — God calls Moses',ref:'Exodus 3:1-6'},{icon:'📜',title:'Ten Commandments given',ref:'Exodus 20'},{icon:'🌩️',title:'God descends in thunder & lightning',ref:'Exodus 19:16-25'},{icon:'🙏',title:"Elijah hears God's still small voice",ref:'1 Kings 19:9-13'}],verse:'"Moses said, I will now turn aside to see this great sight, why the bush does not burn." — Exodus 3:3'},
  babylon:{name:'Babylon',region:'Mesopotamia',rc:'var(--red)',rb:'var(--red-bg)',desc:"The great empire where the Jews were exiled for 70 years. It was here that Daniel interpreted dreams, three friends survived the furnace, and God's people longed for home.",stories:[{icon:'🏛️',title:"Daniel interprets king's dream",ref:'Daniel 2'},{icon:'🔥',title:'Shadrach, Meshach & Abednego',ref:'Daniel 3'},{icon:'🦁',title:'Daniel in the lion\'s den',ref:'Daniel 6'},{icon:'😢',title:'Jewish exiles by the rivers',ref:'Psalm 137'}],verse:'"By the rivers of Babylon we sat and wept when we remembered Zion." — Psalm 137:1'},
}
export default function BibleMap(){
  const[active,setActive]=useState(null)
  const loc=active?LOCATIONS[active]:null
  function click(id){setActive(id)}
  const markerStyle=(id,cx,cy,fill)=>({cursor:'pointer',onClick:()=>click(id),id:`loc-${id}`})
  return(
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#064E3B,#065F46,#047857)',padding:'60px 36px 44px',textAlign:'center'}}>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'clamp(2rem,4.5vw,3.4rem)',fontWeight:800,color:'white',letterSpacing:-1,marginBottom:8}}>Interactive Bible Map</h1>
        <p style={{color:'rgba(255,255,255,.6)',fontSize:'.9rem',fontWeight:500}}>Click any location to explore Bible stories, history, and key scriptures.</p>
      </div>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'44px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr clamp(240px,30%,340px)',gap:24,alignItems:'start'}}>
          {/* Map SVG */}
          <div style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid var(--border)',boxShadow:'0 8px 32px rgba(0,0,0,.08)',overflow:'hidden'}}>
            <svg viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'auto',display:'block',background:'linear-gradient(180deg,#87CEEB 0%,#E0F4FF 30%,#C8E6C9 45%,#A5D6A7 60%,#81C784 75%,#B8860B 100%)'}}>
              <ellipse cx="120" cy="280" rx="115" ry="160" fill="#4FC3F7" opacity=".55"/>
              <text x="60" y="285" fontSize="11" fill="#0277BD" fontWeight="700" fontFamily="Poppins,sans-serif">Mediterranean</text>
              <text x="78" y="300" fontSize="11" fill="#0277BD" fontWeight="700" fontFamily="Poppins,sans-serif">Sea</text>
              <ellipse cx="340" cy="450" rx="28" ry="50" fill="#4FC3F7" opacity=".7"/>
              <text x="355" y="455" fontSize="9" fill="#0277BD" fontWeight="700" fontFamily="Poppins,sans-serif">Dead Sea</text>
              <ellipse cx="350" cy="290" rx="22" ry="30" fill="#4FC3F7" opacity=".7"/>
              <path d="M350 320 Q345 370 340 420" stroke="#4FC3F7" strokeWidth="4" fill="none" opacity=".8"/>
              <path d="M235 180 Q280 160 330 175 Q380 185 420 210 Q460 240 460 290 Q460 340 430 380 Q410 420 390 460 Q370 500 360 540 Q350 580 340 610 Q320 640 300 650 Q280 645 270 620 Q255 590 245 555 Q230 515 220 480 Q205 440 200 400 Q195 360 200 320 Q205 270 220 230 Q228 200 235 180Z" fill="#8BC34A" opacity=".8"/>
              <rect x="200" y="600" width="200" height="80" rx="8" fill="#DEB887" opacity=".6"/>
              <text x="280" y="645" fontSize="12" fill="#8B4513" fontWeight="700" fontFamily="Poppins,sans-serif" textAnchor="middle">Egypt</text>
              {/* Location markers */}
              {[
                ['jerusalem',308,420,'#E53935'],
                ['bethlehem',305,445,'#7B1FA2'],
                ['nazareth',310,300,'#1565C0'],
                ['capernaum',348,275,'#00695C'],
                ['jericho',345,400,'#E65100'],
                ['sinai',265,590,'#827717'],
                ['babylon',520,300,'#BF360C'],
              ].map(([id,cx,cy,fill])=>(
                <g key={id} onClick={()=>click(id)} style={{cursor:'pointer'}}>
                  <circle cx={cx} cy={cy} r={active===id?12:9} fill={active===id?'#FFD060':fill} style={{transition:'r .2s'}}/>
                  <circle cx={cx} cy={cy} r={active===id?12:9} fill="none" stroke="white" strokeWidth="2" opacity=".6"/>
                </g>
              ))}
              {/* Labels */}
              <text x="322" y="424" fontSize="11" fill="#111" fontWeight="800" fontFamily="Poppins,sans-serif">Jerusalem</text>
              <text x="320" y="449" fontSize="10" fill="#111" fontWeight="700" fontFamily="Poppins,sans-serif">Bethlehem</text>
              <text x="324" y="304" fontSize="10" fill="#111" fontWeight="700" fontFamily="Poppins,sans-serif">Nazareth</text>
              <text x="362" y="279" fontSize="10" fill="#111" fontWeight="700" fontFamily="Poppins,sans-serif">Capernaum</text>
              <text x="358" y="404" fontSize="10" fill="#111" fontWeight="700" fontFamily="Poppins,sans-serif">Jericho</text>
              <text x="280" y="594" fontSize="10" fill="#111" fontWeight="700" fontFamily="Poppins,sans-serif">Mt. Sinai</text>
              <text x="470" y="295" fontSize="10" fill="#111" fontWeight="700" fontFamily="Poppins,sans-serif">Babylon →</text>
              <rect x="10" y="10" width="150" height="30" rx="8" fill="white" opacity=".85"/>
              <text x="85" y="30" fontSize="12" fill="#333" fontWeight="800" textAnchor="middle" fontFamily="Poppins,sans-serif">The Holy Land</text>
            </svg>
            <div style={{padding:'12px 18px',borderTop:'1px solid var(--border)',fontSize:'.78rem',color:'var(--ink3)',fontWeight:500,textAlign:'center'}}>
              👆 Click any pin on the map to explore that location
            </div>
          </div>
          {/* Info panel */}
          <div style={{background:'var(--surface)',borderRadius:24,border:'1.5px solid var(--border)',boxShadow:'0 8px 32px rgba(0,0,0,.08)',padding:26,position:'sticky',top:80}}>
            {!loc?(
              <div style={{textAlign:'center',padding:'40px 16px',color:'var(--ink3)'}}>
                <div style={{fontSize:'3rem',marginBottom:12,opacity:.4}}>🗺️</div>
                <p style={{fontSize:'.84rem',fontWeight:500,lineHeight:1.6}}>Click any location on the map to explore its Bible stories, history, and key scriptures.</p>
                <div style={{marginTop:20,display:'flex',flexDirection:'column',gap:8}}>
                  {Object.entries(LOCATIONS).map(([id,l])=>(
                    <button key={id} onClick={()=>click(id)} style={{fontSize:'.78rem',fontWeight:600,padding:'8px 14px',borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg2)',color:'var(--ink2)',cursor:'pointer',textAlign:'left',transition:'all .2s'}}>
                      📍 {l.name} <span style={{color:l.rc,fontSize:'.7rem'}}>— {l.region}</span>
                    </button>
                  ))}
                </div>
              </div>
            ):(
              <div>
                <div style={{display:'inline-block',fontSize:'.65rem',fontWeight:700,padding:'3px 10px',borderRadius:100,background:loc.rb,color:loc.rc,marginBottom:10}}>{loc.region}</div>
                <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.5rem',fontWeight:800,color:'var(--ink)',marginBottom:8}}>{loc.name}</div>
                <div style={{fontSize:'.83rem',color:'var(--ink2)',lineHeight:1.7,fontWeight:500,marginBottom:16}}>{loc.desc}</div>
                <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
                  {loc.stories.map((s,i)=>(
                    <div key={i} style={{background:'var(--bg2)',borderRadius:14,padding:'11px 13px',display:'flex',alignItems:'flex-start',gap:9}}>
                      <span style={{fontSize:'1.2rem',flexShrink:0}}>{s.icon}</span>
                      <div>
                        <div style={{fontSize:'.8rem',fontWeight:700,color:'var(--ink)',marginBottom:2}}>{s.title}</div>
                        <div style={{fontSize:'.7rem',color:'var(--blue)',fontWeight:600}}>{s.ref}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{background:'var(--green-bg)',borderLeft:'3px solid var(--green)',borderRadius:'0 12px 12px 0',padding:'11px 13px',fontSize:'.78rem',color:'var(--ink2)',fontStyle:'italic',fontWeight:500}}>{loc.verse}</div>
                <button onClick={()=>setActive(null)} className="btn btn-outline btn-sm" style={{marginTop:16,width:'100%',justifyContent:'center'}}>← Back to Map</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
