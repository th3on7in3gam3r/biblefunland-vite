// BibleFunLand Service Worker — Web Push Notifications
// =====================================================
const CACHE_NAME = 'bfl-v1'
const DAILY_VERSES = [
  { text: '"For I know the plans I have for you, declares the Lord."', ref: 'Jeremiah 29:11' },
  { text: '"I can do all things through Christ who strengthens me."', ref: 'Philippians 4:13' },
  { text: '"Be strong and courageous. Do not be afraid."', ref: 'Joshua 1:9' },
  { text: '"Trust in the Lord with all your heart."', ref: 'Proverbs 3:5' },
  { text: '"The Lord is my shepherd; I shall not want."', ref: 'Psalm 23:1' },
  { text: '"For God so loved the world that he gave his one and only Son."', ref: 'John 3:16' },
  { text: '"His mercies are new every morning; great is your faithfulness."', ref: 'Lamentations 3:23' },
]

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {}
  const day = Math.floor(Date.now() / 86400000)
  const verse = DAILY_VERSES[day % DAILY_VERSES.length]
  const options = {
    body: data.body || `${verse.text} — ${verse.ref}`,
    icon: '/cross.svg',
    badge: '/cross.svg',
    tag: 'daily-verse',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '📖 Read More' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }
  event.waitUntil(
    self.registration.showNotification(data.title || '☀️ BibleFunLand — Daily Verse', options)
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'dismiss') return
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      const url = event.notification.data?.url || '/'
      const client = clients.find(c => c.url === url && 'focus' in c)
      if (client) return client.focus()
      return self.clients.openWindow(url)
    })
  )
})
