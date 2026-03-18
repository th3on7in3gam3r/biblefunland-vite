import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const VERSES = [
  { text: '"I know the plans I have for you, declares the Lord — plans to prosper you."', ref: 'Jeremiah 29:11' },
  { text: '"For the Son of Man came to seek and to save the lost."', ref: 'Luke 19:10' },
  { text: '"I am the way, the truth and the life."', ref: 'John 14:6' },
]

export default function NotFound() {
  const [verse] = useState(VERSES[Math.floor(Math.random() * VERSES.length)])
  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'Poppins,sans-serif', textAlign:'center', padding:32 }}>
      <div style={{ fontSize:'6rem', marginBottom:16, animation:'float 3s ease-in-out infinite' }}>🗺️</div>
      <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(3rem,8vw,6rem)', fontWeight:800, color:'var(--ink)', lineHeight:1, marginBottom:8 }}>404</div>
      <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:'1.4rem', fontWeight:800, color:'var(--ink)', marginBottom:10 }}>Page Not Found</div>
      <p style={{ fontSize:'.9rem', color:'var(--ink3)', fontWeight:500, maxWidth:400, lineHeight:1.7, marginBottom:24 }}>
        Even the wise men had to search — but they found what they were looking for. Let's get you back on the right path.
      </p>
      <div style={{ background:'var(--violet-bg)', borderLeft:'3px solid var(--violet)', borderRadius:'0 14px 14px 0', padding:'14px 20px', maxWidth:420, marginBottom:32, textAlign:'left', fontStyle:'italic', fontSize:'.88rem', color:'var(--ink2)', lineHeight:1.7 }}>
        {verse.text} <strong>— {verse.ref}</strong>
      </div>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
        <Link to="/" className="btn btn-blue">🏠 Go Home</Link>
        <Link to="/trivia" className="btn btn-outline">🎮 Play Trivia</Link>
        <Link to="/bible" className="btn btn-outline">📖 Bible Books</Link>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>
    </div>
  )
}
