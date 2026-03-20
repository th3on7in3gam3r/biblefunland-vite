import { useState, useEffect } from 'react'
import { useNotification } from '../context/NotificationContext'

export default function PushNotifications() {
  const { reminders, addReminder, removeReminder, updateReminder } = useNotification()
  const [permission, setPermission] = useState(Notification?.permission || 'default')
  const [registered, setRegistered] = useState(false)
  const [time, setTime] = useState(localStorage.getItem('bfl_notif_time') || '08:00')
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [newReminder, setNewReminder] = useState({
    type: 'devotion',
    title: '',
    description: '',
    time: '09:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  })

  useEffect(() => {
    setPermission(Notification?.permission || 'default')
    setRegistered(localStorage.getItem('bfl_notif_enabled') === 'true')
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
  }, [])

  // Schedule reminders
  useEffect(() => {
    const interval = setInterval(() => {
      reminders.forEach(reminder => {
        if (reminder.enabled) {
          const now = new Date()
          const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()]

          if (currentTime === reminder.time && reminder.days.includes(dayName)) {
            sendNotification(reminder.title, reminder.description)
          }
        }
      })
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [reminders])

  async function enable() {
    if (!('Notification' in window)) {
      alert('Your browser does not support push notifications.')
      return
    }
    const p = await Notification.requestPermission()
    setPermission(p)
    if (p === 'granted') {
      localStorage.setItem('bfl_notif_enabled', 'true')
      localStorage.setItem('bfl_notif_time', time)
      setRegistered(true)
      // Show test notification
      setTimeout(() => {
        sendNotification(
          '✅ BibleFunLand Notifications Enabled!',
          '"The Lord is my shepherd; I shall not want." — Psalm 23:1\n\nYou\'ll receive your daily verse at ' + time
        )
      }, 1000)
    }
  }

  function disable() {
    localStorage.removeItem('bfl_notif_enabled')
    setRegistered(false)
  }

  function sendNotification(title, body) {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/cross.svg',
        badge: '/cross.svg',
        tag: 'biblefunland',
      })
    }
  }

  function sendTest() {
    if (permission !== 'granted') {
      enable()
      return
    }
    const day = Math.floor(Date.now() / 86400000)
    const VERSES = [
      '"For I know the plans I have for you."',
      '"I can do all things through Christ."',
      '"Be strong and courageous."',
      '"Trust in the Lord with all your heart."'
    ]
    sendNotification('☀️ BibleFunLand — Daily Verse', VERSES[day % VERSES.length] + ' — Tap to read more')
  }

  function addNewReminder() {
    if (!newReminder.title || !newReminder.time) {
      alert('Please fill in title and time')
      return
    }
    addReminder(newReminder)
    setNewReminder({
      type: 'devotion',
      title: '',
      description: '',
      time: '09:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    })
    setShowReminderForm(false)
  }

  function toggleDay(day) {
    setNewReminder(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }))
  }

  const stateColor = { granted: 'var(--green)', denied: 'var(--red)', default: 'var(--orange)' }[permission] || 'var(--orange)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Daily Verse Notifications */}
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

      {/* Custom Reminders */}
      <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1.5px solid var(--border)', padding: 24, fontFamily: 'Poppins,sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: '2rem' }}>⏰</div>
            <div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'var(--ink)' }}>Custom Reminders</div>
              <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink3)' }}>● {reminders.length} reminder{reminders.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <button onClick={() => setShowReminderForm(!showReminderForm)} style={{ fontSize: '.82rem', fontWeight: 700, padding: '8px 14px', borderRadius: 8, background: 'var(--blue-bg)', color: 'var(--blue)', border: '1.5px solid var(--blue)', cursor: 'pointer' }}>
            {showReminderForm ? '✕ Cancel' : '+ Add Reminder'}
          </button>
        </div>

        {showReminderForm && (
          <div style={{ background: 'var(--bg2)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ink3)' }}>Title</label>
                <input type="text" placeholder="e.g., Morning Devotion" value={newReminder.title} onChange={e => setNewReminder({...newReminder, title: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'Poppins,sans-serif', fontSize: '.82rem', outline: 'none', marginTop: 4 }}/>
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ink3)' }}>Time</label>
                <input type="time" value={newReminder.time} onChange={e => setNewReminder({...newReminder, time: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'Poppins,sans-serif', fontSize: '.82rem', outline: 'none', marginTop: 4 }}/>
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ink3)', display: 'block', marginBottom: 8 }}>Days</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <button key={day} onClick={() => toggleDay(day)} style={{ padding: '6px', borderRadius: 6, background: newReminder.days.includes(day) ? 'var(--blue)' : 'var(--border)', color: newReminder.days.includes(day) ? 'white' : 'var(--ink3)', border: 'none', cursor: 'pointer', fontSize: '.7rem', fontWeight: 600 }}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={addNewReminder} style={{ fontSize: '.82rem', fontWeight: 700, padding: '10px', borderRadius: 8, background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', cursor: 'pointer', marginTop: 8 }}>
                ✓ Save Reminder
              </button>
            </div>
          </div>
        )}

        {reminders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reminders.map(reminder => (
              <div key={reminder.id} style={{ background: 'var(--bg2)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--ink)' }}>{reminder.title}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--ink3)', marginTop: 4 }}>{reminder.time} • {reminder.days.join(', ')}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="checkbox" checked={reminder.enabled} onChange={e => updateReminder(reminder.id, {enabled: e.target.checked})} style={{ cursor: 'pointer' }}/>
                  <button onClick={() => removeReminder(reminder.id)} style={{ fontSize: '.75rem', padding: '4px 8px', borderRadius: 4, background: 'var(--red-bg)', color: 'var(--red)', border: 'none', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '.8rem', color: 'var(--ink3)', textAlign: 'center', padding: '20px 0' }}>No reminders yet. Create one to get started!</p>
        )}
      </div>
    </div>
  )
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
