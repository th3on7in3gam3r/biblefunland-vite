// Enhanced Service Worker for Offline PWA Caching
// Focus on kids content with intelligent caching strategies

const CACHE_NAME = 'biblefunland-kids-v1'
const KIDS_CONTENT_CACHE = 'biblefunland-kids-content-v1'
const STATIC_CACHE = 'biblefunland-static-v1'

// Kids content that should be available offline
const KIDS_CONTENT_ROUTES = [
  '/',
  '/trivia',
  '/devotional',
  '/map',
  '/flashcards',
  '/game/david-goliath',
  '/game/runner',
  '/game/escape-room',
  '/game/spin-the-verse',
  '/challenge',
  '/ai/prayer-companion',
  '/wordle',
  '/promises',
  '/kids-stories'
]

// Static assets needed for kids content
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Critical CSS and JS files will be cached dynamically
]

// Bible stories and devotionals for offline access
const OFFLINE_BIBLE_CONTENT = {
  stories: [
    {
      id: 'david-goliath',
      title: "David and Goliath",
      content: "David was a young shepherd boy who trusted in God. When the giant Goliath threatened the Israelite army, David bravely faced him with just a sling and five smooth stones, knowing God would help him defeat the giant.",
      verse: "1 Samuel 17:45",
      moral: "With God's help, we can face any challenge.",
      age_group: "6-12"
    },
    {
      id: 'daniel-lions',
      title: "Daniel in the Lions' Den",
      content: "Daniel was faithful to God even when the king made it illegal to pray. When he was thrown into a den of hungry lions, God sent an angel to protect him all night long.",
      verse: "Daniel 6:22",
      moral: "God protects those who trust in Him.",
      age_group: "4-10"
    },
    {
      id: 'moses-basket',
      title: "Baby Moses in the Basket",
      content: "When baby Moses was in danger, his mother made a special basket and placed him in the river. God guided the basket safely to the princess who would care for Moses.",
      verse: "Exodus 2:10",
      moral: "God has a special plan for each of us.",
      age_group: "3-8"
    }
  ],
  verses: [
    {
      reference: "John 3:16",
      text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      category: "salvation"
    },
    {
      reference: "Psalm 23:1",
      text: "The Lord is my shepherd; I shall not want.",
      category: "trust"
    },
    {
      reference: "Philippians 4:13",
      text: "I can do all this through him who gives me strength.",
      category: "strength"
    }
  ]
}

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching essential files')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== KIDS_CONTENT_CACHE && 
                cacheName !== STATIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete')
        return self.clients.claim()
      })
  )
})

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Handle different types of requests
  if (isKidsContentRoute(url.pathname)) {
    // Kids content - cache first, then network
    event.respondWith(handleKidsContent(request))
  } else if (isStaticAsset(request.url)) {
    // Static assets - cache first
    event.respondWith(handleStaticAsset(request))
  } else if (isAPIRequest(url.pathname)) {
    // API requests - network first, cache fallback
    event.respondWith(handleAPIRequest(request))
  } else {
    // Other requests - network with cache fallback
    event.respondWith(handleGeneralRequest(request))
  }
})

// Handle kids content with offline fallback
async function handleKidsContent(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Try network
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Cache the response for offline use
      const cache = await caches.open(KIDS_CONTENT_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    // Return offline content if network fails
    return getOfflineContent(request)
  } catch (error) {
    console.log('📴 Service Worker: Network failed, returning offline content')
    return getOfflineContent(request)
  }
}

// Handle static assets
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 })
  }
}

// Handle API requests with cache fallback
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Try cached API response
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline API response
    return getOfflineAPIResponse(request)
  }
}

// Handle general requests
async function handleGeneralRequest(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

// Get offline content for kids routes
async function getOfflineContent(request) {
  const url = new URL(request.url)
  const path = url.pathname
  
  if (path.includes('/trivia')) {
    return new Response(getOfflineTrivia(), {
      headers: { 'Content-Type': 'text/html' }
    })
  } else if (path.includes('/devotional')) {
    return new Response(getOfflineDevotional(), {
      headers: { 'Content-Type': 'text/html' }
    })
  } else if (path.includes('/stories')) {
    return new Response(JSON.stringify(OFFLINE_BIBLE_CONTENT.stories), {
      headers: { 'Content-Type': 'application/json' }
    })
  } else {
    return new Response(getOfflineHomePage(), {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Get offline API responses
async function getOfflineAPIResponse(request) {
  const url = new URL(request.url)
  
  if (url.pathname.includes('/api/stories')) {
    return new Response(JSON.stringify(OFFLINE_BIBLE_CONTENT.stories), {
      headers: { 'Content-Type': 'application/json' }
    })
  } else if (url.pathname.includes('/api/verses')) {
    return new Response(JSON.stringify(OFFLINE_BIBLE_CONTENT.verses), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response('Offline', { status: 503 })
}

// Helper functions
function isKidsContentRoute(pathname) {
  return KIDS_CONTENT_ROUTES.some(route => pathname.startsWith(route))
}

function isStaticAsset(url) {
  return url.includes('/static/') || 
         url.includes('/assets/') || 
         url.includes('.css') || 
         url.includes('.js') || 
         url.includes('.png') || 
         url.includes('.jpg') || 
         url.includes('.svg')
}

function isAPIRequest(pathname) {
  return pathname.startsWith('/api/')
}

// Offline content generators
function getOfflineTrivia() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bible Trivia - Offline</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f0f8ff; }
        .question { font-size: 18px; margin: 20px 0; }
        .options { display: grid; gap: 10px; }
        button { padding: 15px; border: none; border-radius: 8px; background: #4CAF50; color: white; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>🎮 Bible Trivia (Offline Mode)</h1>
      <div class="question">Who built the ark?</div>
      <div class="options">
        <button>Noah</button>
        <button>Moses</button>
        <button>Abraham</button>
        <button>David</button>
      </div>
      <p><small>You're currently offline. Some features may be limited.</small></p>
    </body>
    </html>
  `
}

function getOfflineDevotional() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Daily Devotional - Offline</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5dc; }
        .devotional { max-width: 600px; margin: 0 auto; }
        .verse { font-style: italic; color: #666; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="devotional">
        <h1>🙏 Daily Devotional (Offline Mode)</h1>
        <h2>Trust in God</h2>
        <div class="verse">"Trust in the Lord with all your heart and lean not on your own understanding." - Proverbs 3:5</div>
        <p>God loves you and has a wonderful plan for your life. Even when things are difficult, you can trust that He is watching over you.</p>
        <p><strong>Prayer:</strong> Dear God, help me to trust you today. Amen.</p>
        <p><small>You're currently offline. Today's devotional is available for offline reading.</small></p>
      </div>
    </body>
    </html>
  `
}

function getOfflineHomePage() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>BibleFunLand - Offline</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; }
        .offline-notice { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px; }
      </style>
    </head>
    <body>
      <h1>✝️ BibleFunLand</h1>
      <div class="offline-notice">
        <h2>📴 You're currently offline</h2>
        <p>Some content is still available for offline use!</p>
        <a href="/trivia" style="color: white; text-decoration: underline;">🎮 Play Trivia</a> | 
        <a href="/devotional" style="color: white; text-decoration: underline;">🙏 Read Devotional</a>
      </div>
      <p>Your connection will be restored automatically.</p>
    </body>
    </html>
  `
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Sync offline data when connection is restored
  console.log('🔄 Service Worker: Background sync started')
  // Implementation would sync cached data to server
}

// Push notifications for offline content updates
self.addEventListener('push', (event) => {
  const options = {
    body: 'New Bible content is available for offline reading!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'content-update'
  }
  
  event.waitUntil(
    self.registration.showNotification('BibleFunLand Update', options)
  )
})
