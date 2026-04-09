// Enhanced Service Worker for Offline PWA Caching
// Focus on kids content with intelligent caching strategies with TTL validation

const CACHE_NAME = 'biblefunland-kids-v6'
const KIDS_CONTENT_CACHE = 'biblefunland-kids-content-v6'
const STATIC_CACHE = 'biblefunland-static-v6'

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  STATIC: 30 * 24 * 60 * 60 * 1000,      // 30 days for static assets
  CONTENT: 7 * 24 * 60 * 60 * 1000,      // 7 days for core content
  API_USER: 24 * 60 * 60 * 1000,         // 24 hours for user-specific API data
  API_STATIC: 7 * 24 * 60 * 60 * 1000    // 7 days for static API content
}

// Core content routes that should be available offline (7-day TTL)
const CORE_CONTENT_ROUTES = [
  '/trivia',
  '/devotional',
  '/flashcards',
  '/stories',
  '/promises',
  '/wordle',
  '/ai/prayer-companion'
]

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

/**
 * TTL Validation and Metadata Management
 * Stores and validates cache entry metadata including timestamps and TTL
 */

// IndexedDB database name and store
const DB_NAME = 'biblefunland-offline'
const METADATA_STORE = 'cache_metadata'

/**
 * Initialize IndexedDB for cache metadata
 * @returns {Promise<IDBDatabase>}
 */
let dbPromise = null;
async function initMetadataDB() {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 8)
    
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    }
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        const store = db.createObjectStore(METADATA_STORE, { keyPath: 'cacheKey' })
        store.createIndex('expiresAt', 'expiresAt', { unique: false })
        store.createIndex('lastAccessTime', 'lastAccessTime', { unique: false })
      }
    }
  });
  return dbPromise;
}

async function storeMetadata(url, strategy, ttl) {
  try {
    const db = await initMetadataDB()
    const now = Date.now()
    const metadata = {
      cacheKey: url,
      url,
      strategy,
      ttl,
      createdAt: now,
      expiresAt: now + ttl,
      lastAccessTime: now,
      hitCount: 0
    }
    
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        return reject(new Error('Object store not found'));
      }
      const transaction = db.transaction([METADATA_STORE], 'readwrite')
      const store = transaction.objectStore(METADATA_STORE)
      const request = store.put(metadata)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.warn('⚠️ Failed to store metadata:', error)
  }
}

/**
 * Retrieve cache metadata
 * @param {string} url - Request URL
 * @returns {Promise<Object|null>}
 */
async function getMetadata(url) {
  try {
    const db = await initMetadataDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readonly')
      const store = transaction.objectStore(METADATA_STORE)
      const request = store.get(url)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  } catch (error) {
    console.warn('⚠️ Failed to retrieve metadata:', error)
    return null
  }
}

/**
 * Validate if cached entry is still valid based on TTL
 * @param {string} url - Request URL
 * @returns {Promise<boolean>}
 */
async function isCacheValid(url) {
  try {
    const metadata = await getMetadata(url)
    
    if (!metadata) {
      console.log(`⏰ No metadata found for ${url}`)
      return false
    }
    
    const now = Date.now()
    const isValid = now < metadata.expiresAt
    
    if (isValid) {
      console.log(`✅ Cache valid for ${url} (expires in ${Math.round((metadata.expiresAt - now) / 1000)}s)`)
      // Update last access time
      updateAccessTime(url)
    } else {
      console.log(`⏳ Cache expired for ${url}`)
    }
    
    return isValid
  } catch (error) {
    console.warn('⚠️ Error validating cache:', error)
    return false
  }
}

/**
 * Update last access time for LRU tracking
 * @param {string} url - Request URL
 * @returns {Promise<void>}
 */
async function updateAccessTime(url) {
  try {
    const db = await initMetadataDB()
    const metadata = await getMetadata(url)
    
    if (metadata) {
      metadata.lastAccessTime = Date.now()
      metadata.hitCount = (metadata.hitCount || 0) + 1
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([METADATA_STORE], 'readwrite')
        const store = transaction.objectStore(METADATA_STORE)
        const request = store.put(metadata)
        
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    }
  } catch (error) {
    console.warn('⚠️ Failed to update access time:', error)
  }
}

/**
 * Delete expired cache entries
 * @returns {Promise<number>} Number of entries deleted
 */
async function deleteExpiredEntries() {
  try {
    const db = await initMetadataDB()
    const now = Date.now()
    let deletedCount = 0
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readwrite')
      const store = transaction.objectStore(METADATA_STORE)
      const index = store.index('expiresAt')
      const range = IDBKeyRange.upperBound(now)
      const request = index.openCursor(range)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          store.delete(cursor.primaryKey)
          deletedCount++
          cursor.continue()
        } else {
          if (deletedCount > 0) {
            console.log(`🗑️ Deleted ${deletedCount} expired cache entries`)
          }
          resolve(deletedCount)
        }
      }
    })
  } catch (error) {
    console.warn('⚠️ Failed to delete expired entries:', error)
    return 0
  }
}

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

// Install event - cache essential files with resilient approach
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching essential files')
        // Use resilient approach - continue even if some files fail
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`⚠️ Failed to cache ${url}:`, err.message)
            })
          )
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation error:', error)
      })
  )
})

/**
 * Clean up old static assets (>30 days old)
 * @returns {Promise<number>} Number of entries deleted
 */
async function cleanupOldStaticAssets() {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const requests = await cache.keys()
    const now = Date.now()
    let deletedCount = 0

    for (const request of requests) {
      const metadata = await getMetadata(request.url)
      
      // Delete if metadata not found or expired
      if (!metadata || metadata.expiresAt < now) {
        await cache.delete(request)
        deletedCount++
        console.log(`🗑️ Deleted old static asset: ${request.url}`)
      }
    }

    return deletedCount
  } catch (error) {
    console.warn('⚠️ Error cleaning up old static assets:', error)
    return 0
  }
}

// Activate event - clean up old caches and expired metadata
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating')
  
  event.waitUntil(
    Promise.all([
      // Clean up old cache stores
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
        }),
      // Clean up expired metadata entries
      deleteExpiredEntries(),
      // Clean up old static assets (>30 days)
      cleanupOldStaticAssets()
    ])
      .then(() => {
        console.log('✅ Service Worker: Activation complete')
        return self.clients.claim()
      })
  )
})

// Helper functions - MUST be defined before fetch event listener
function isCoreContentRoute(pathname) {
  return CORE_CONTENT_ROUTES.some(route => pathname.startsWith(route))
}

function isKidsContentRoute(pathname) {
  return KIDS_CONTENT_ROUTES.some(route => pathname.startsWith(route))
}

function isStaticAsset(url) {
  // Only cache specific static asset extensions
  const staticExtensions = ['.js', '.css', '.woff2', '.png', '.svg', '.jpg', '.jpeg', '.gif']
  return staticExtensions.some(ext => url.includes(ext))
}

function isAPIRequest(pathname) {
  return pathname.startsWith('/api/')
}

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip external domains — never cache Amazon CDN, Clerk, Google, etc.
  if (url.origin !== self.location.origin) return

  // Skip Vite dev server internals — never cache these, always fetch fresh
  if (
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.includes('?t=') ||
    url.pathname.includes('?v=') ||
    url.search.includes('t=') ||
    url.search.includes('v=')
  ) return
  
  // Handle different types of requests
  if (isCoreContentRoute(url.pathname)) {
    // Core content - cache first with TTL validation
    event.respondWith(handleCoreContent(request))
  } else if (isKidsContentRoute(url.pathname)) {
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

// Handle kids content with offline fallback and TTL validation
async function handleKidsContent(request) {
  try {
    const url = request.url
    
    // Check if cached version is still valid
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      const isValid = await isCacheValid(url)
      if (isValid) {
        console.log(`📦 Serving cached kids content: ${url}`)
        return cachedResponse
      } else {
        console.log(`⏳ Cached content expired, fetching fresh: ${url}`)
      }
    }
    
    // Try network
    const networkResponse = await fetch(request)
    if (networkResponse.status === 200) {
      // Cache the response for offline use with TTL
      // Cache.put only supports 200 responses (no 206 Partial Content)
      const cache = await caches.open(KIDS_CONTENT_CACHE)
      cache.put(request, networkResponse.clone())
      await storeMetadata(url, 'cache-first', CACHE_TTL.CONTENT)
      console.log(`✅ Cached kids content: ${url}`)
      return networkResponse
    } else if (networkResponse.status === 206) {
      console.log(`📡 Partial content (206) for ${url}, skipping cache`)
      return networkResponse
    }
    
    // Return offline content if network fails
    return getOfflineContent(request)
  } catch (error) {
    console.log('📴 Service Worker: Network failed, returning offline content')
    return getOfflineContent(request)
  }
}

// Handle core content (trivia, flashcards, devotionals, stories) with TTL validation
async function handleCoreContent(request) {
  try {
    const url = request.url
    
    // Check if cached version is still valid
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      const isValid = await isCacheValid(url)
      if (isValid) {
        console.log(`📦 Serving cached core content: ${url}`)
        return cachedResponse
      } else {
        console.log(`⏳ Core content cache expired, fetching fresh: ${url}`)
      }
    }
    
    // Try network
    try {
      const networkResponse = await fetch(request)
      if (networkResponse.status === 200) {
        // Cache the response for offline use with 7-day TTL
        const cache = await caches.open(KIDS_CONTENT_CACHE)
        cache.put(request, networkResponse.clone())
        await storeMetadata(url, 'cache-first', CACHE_TTL.CONTENT)
        console.log(`✅ Cached core content: ${url}`)
        return networkResponse
      } else if (networkResponse.status === 206) {
        return networkResponse
      }
    } catch (networkError) {
      console.log(`⚠️ Network fetch failed for core content: ${url}`)
    }
    
    // Return fallback page if network fails and no cache
    return getOfflineFallbackPage(request)
  } catch (error) {
    console.log('📴 Service Worker: Error handling core content, returning fallback')
    return getOfflineFallbackPage(request)
  }
}

// Handle static assets with TTL validation
async function handleStaticAsset(request) {
  const url = request.url
  
  // Check if cached version is still valid
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    const isValid = await isCacheValid(url)
    if (isValid) {
      console.log(`📦 Serving cached static asset: ${url}`)
      return cachedResponse
    } else {
      console.log(`⏳ Static asset cache expired, fetching fresh: ${url}`)
    }
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
      await storeMetadata(url, 'cache-first', CACHE_TTL.STATIC)
      console.log(`✅ Cached static asset: ${url}`)
    }
    return networkResponse
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 })
  }
}

// Handle API requests with cache fallback and TTL validation
async function handleAPIRequest(request) {
  const url = request.url
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.status === 200) {
      // Cache successful API responses with appropriate TTL
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
      
      // Determine TTL based on endpoint type
      const ttl = url.includes('/api/user') ? CACHE_TTL.API_USER : CACHE_TTL.API_STATIC
      await storeMetadata(url, 'network-first', ttl)
      console.log(`✅ Cached API response: ${url}`)
    }
    return networkResponse
  } catch (error) {
    // Try cached API response
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      const isValid = await isCacheValid(url)
      if (isValid || !isValid) {
        // Return cached response even if expired (stale-while-revalidate)
        console.log(`📦 Serving ${isValid ? 'valid' : 'stale'} cached API response: ${url}`)
        return cachedResponse
      }
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

// Get offline fallback page for unavailable core content
async function getOfflineFallbackPage(request) {
  const url = new URL(request.url)
  const path = url.pathname
  
  // Determine which content type is being requested
  let contentType = 'Unknown'
  if (path.includes('/trivia')) contentType = 'Trivia'
  else if (path.includes('/flashcards')) contentType = 'Flashcards'
  else if (path.includes('/devotional')) contentType = 'Devotional'
  else if (path.includes('/stories')) contentType = 'Bible Stories'
  else if (path.includes('/promises')) contentType = 'God\'s Promises'
  else if (path.includes('/wordle')) contentType = 'Bible Wordle'
  else if (path.includes('/prayer-companion')) contentType = 'Prayer Companion'
  
  return new Response(getOfflineFallback(contentType), {
    headers: { 'Content-Type': 'text/html' },
    status: 200
  })
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

// Offline fallback page generator
function getOfflineFallback(contentType) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Content Not Available - BibleFunLand</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Baloo 2', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          padding: 40px;
          text-align: center;
        }
        
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        h1 {
          color: #333;
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .content-type {
          color: #667eea;
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 20px;
        }
        
        p {
          color: #666;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        
        .offline-notice {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          text-align: left;
          color: #856404;
          font-size: 14px;
        }
        
        .available-content {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }
        
        .available-content h3 {
          color: #333;
          font-size: 16px;
          margin-bottom: 12px;
        }
        
        .content-links {
          display: grid;
          gap: 10px;
        }
        
        .content-link {
          display: block;
          padding: 12px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          text-decoration: none;
          color: #667eea;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .content-link:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }
        
        .buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 20px;
        }
        
        button {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-retry {
          background: #667eea;
          color: white;
        }
        
        .btn-retry:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .btn-home {
          background: #f0f0f0;
          color: #333;
        }
        
        .btn-home:hover {
          background: #e0e0e0;
          transform: translateY(-2px);
        }
        
        .tips {
          background: #e7f3ff;
          border-left: 4px solid #2196F3;
          padding: 15px;
          margin-top: 20px;
          border-radius: 4px;
          text-align: left;
          color: #0c5aa0;
          font-size: 14px;
        }
        
        .tips strong {
          display: block;
          margin-bottom: 8px;
        }
        
        .tips ul {
          margin-left: 20px;
          margin-top: 8px;
        }
        
        .tips li {
          margin-bottom: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📴</div>
        <h1>Content Not Available</h1>
        <div class="content-type">\${contentType}</div>
        
        <p>This content requires an internet connection to load.</p>
        
        <div class="offline-notice">
          <strong>You're currently offline</strong><br>
          Check your internet connection and try again.
        </div>
        
        <div class="available-content">
          <h3>✅ Available Offline:</h3>
          <div class="content-links">
            <a href="/trivia" class="content-link">🎮 Bible Trivia</a>
            <a href="/devotional" class="content-link">🙏 Daily Devotional</a>
            <a href="/stories" class="content-link">📖 Bible Stories</a>
            <a href="/" class="content-link">🏠 Home</a>
          </div>
        </div>
        
        <div class="buttons">
          <button class="btn-retry" onclick="location.reload()">🔄 Retry</button>
          <button class="btn-home" onclick="location.href='/'">🏠 Home</button>
        </div>
        
        <div class="tips">
          <strong>💡 Tips:</strong>
          <ul>
            <li>Check your WiFi or mobile connection</li>
            <li>Try moving closer to your router</li>
            <li>Restart your device if connection persists</li>
            <li>Some content is available offline - explore it!</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `
}

// Offline content generators
function getOfflineTrivia() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
