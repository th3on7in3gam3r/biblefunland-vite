import { useState, useEffect } from 'react'

export default function PushNotifications() {
  const [permission, setPermission] = useState(Notification?.permission || 'default')
  const [registered, setRegistered] = useState(false)
  const [time, setTime] = useState(localStorage.getItem('bfl_notif_time') || '08:00')

  useEffect(() => {
    setPermission(Notification?.permission || 'default')
    setRegistered(localStorage.getItem('bfl_notif_enabled') === 'true')
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
  }, [])

  async function enable() {
    if (!('Notification' in window)) { alert('Your browser does not support push notifications.'); return }
    const p = await Notification.requestPermission()
    setPermission(p)
    if (p === 'granted') {
      localStorage.setItem('bfl_notif_enabled', 'true')
      localStorage.setItem('bfl_notif_time', time)
      setRegistered(true)
      // Show test notification
      setTimeout(() => {
        new Notification('✅ BibleFunLand Notifications Enabled!', {
          body: '"The Lord is my shepherd; I shall not want." — Psalm 23:1\n\nYou\'ll receive your daily verse at ' + time,
          icon: '/cross.svg',
        })
      }, 1000)
    }
  }

  function disable() {
    localStorage.removeItem('bfl_notif_enabled')
    setRegistered(false)
  }

  function sendTest() {
    if (permission !== 'granted') { enable(); return }
    const day = Math.floor(Date.now() / 86400000)
    const VERSES = ['"For I know the plans I have for you."','"I can do all things through Christ."','"Be strong and courageous."','"Trust in the Lord with all your heart."']
    new Notification('☀️ BibleFunLand — Daily Verse', {
      body: VERSES[day % VERSES.length] + ' — Tap to read more',
      icon: '/cross.svg',
    })
  }

  const stateColor = { granted: 'var(--green)', denied: 'var(--red)', default: 'var(--orange)' }[permission] || 'var(--orange)'

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1.5px solid var(--border)', padding: 24, fontFamily: 'Poppins,sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: '2rem' }}>🔔</div>
        <div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'var(--ink)' }}>Daily Verse Notifications</div>
          <div style={{ fontSize: '.72rem', fontWeight: 600, color: stateColor }}>● {permission === 'granted' ? (registered ? 'Active' : 'Allowed but disabled') : permission === 'denied' ? 'Blocked (check browser settings)' : 'Not yet enabled'}</div>
        </div>
      </div>
      <p style={{ fontSize: '.8rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.65, marginBottom: 16 }}>
        Receive a beautiful scripture verse every morning at your chosen time — even when your browser is closed.
      </p>
      {permission !== 'denied' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ink3)', whiteSpace: 'nowrap' }}>Daily time:</label>
          <input type="time" value={time} onChange={e => { setTime(e.target.value); localStorage.setItem('bfl_notif_time', e.target.value) }} style={{ padding: '7px 11px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg2)', color: 'var(--ink)', fontFamily: 'Poppins,sans-serif', fontSize: '.82rem', outline: 'none' }}/>
        </div>
      )}
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        {!registered && permission !== 'denied' && (
          <button onClick={enable} style={{ fontSize: '.82rem', fontWeight: 700, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', color: 'white', border: 'none', cursor: 'pointer' }}>
            🔔 Enable Notifications
          </button>
        )}
        {registered && (
          <>
            <button onClick={sendTest} style={{ fontSize: '.82rem', fontWeight: 700, padding: '9px 18px', borderRadius: 10, background: 'var(--green-bg)', color: 'var(--green)', border: '1.5px solid var(--green)', cursor: 'pointer' }}>
              ▶ Send Test
            </button>
            <button onClick={disable} style={{ fontSize: '.82rem', fontWeight: 600, padding: '9px 16px', borderRadius: 10, background: 'var(--bg2)', color: 'var(--ink3)', border: '1.5px solid var(--border)', cursor: 'pointer' }}>
              Turn Off
            </button>
          </>
        )}
        {permission === 'denied' && (
          <p style={{ fontSize: '.78rem', color: 'var(--red)', fontWeight: 500 }}>Notifications are blocked. Go to your browser settings → Site Settings → Notifications to re-enable.</p>
        )}
      </div>
    </div>
  )
}
