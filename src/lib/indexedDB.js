/**
 * IndexedDB initialization and management for offline sync queue and cache metadata
 * Handles database schema creation, version upgrades, and error handling
 */

const DB_NAME = 'biblefunland-offline'
const DB_VERSION = 6 // Increment to force recreation/fix schema issues

// Store names
const SYNC_QUEUE_STORE = 'sync_queue'
const CACHE_METADATA_STORE = 'cache_metadata'
const PENDING_ACTIONS_STORE = 'pending_actions'

/**
 * Initialize IndexedDB database with required stores and indexes
 * @returns {Promise<IDBDatabase>} The initialized database instance
 */
export async function initializeDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('❌ IndexedDB initialization failed:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      const db = request.result
      console.log('✅ IndexedDB initialized successfully')
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      console.log('🔧 IndexedDB: Upgrading schema to version', DB_VERSION)

      // Create sync_queue store if it doesn't exist
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncQueueStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' })
        
        // Create indexes for efficient querying
        syncQueueStore.createIndex('userId', 'userId', { unique: false })
        syncQueueStore.createIndex('status', 'status', { unique: false })
        syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false })
        
        console.log('📦 Created sync_queue store with indexes')
      }

      // Create cache_metadata store if it doesn't exist
      if (!db.objectStoreNames.contains(CACHE_METADATA_STORE)) {
        const cacheMetadataStore = db.createObjectStore(CACHE_METADATA_STORE, { keyPath: 'cacheKey' })
        
        // Create indexes for efficient querying
        cacheMetadataStore.createIndex('url', 'url', { unique: false })
        cacheMetadataStore.createIndex('expiresAt', 'expiresAt', { unique: false })
        cacheMetadataStore.createIndex('lastAccessTime', 'lastAccessTime', { unique: false })
        
        console.log('📦 Created cache_metadata store with indexes')
      }

      // Create pending_actions store if it doesn't exist
      if (!db.objectStoreNames.contains(PENDING_ACTIONS_STORE)) {
        const pendingActionsStore = db.createObjectStore(PENDING_ACTIONS_STORE, { keyPath: 'id', autoIncrement: true })
        
        // Create indexes for efficient querying
        pendingActionsStore.createIndex('status', 'status', { unique: false })
        pendingActionsStore.createIndex('timestamp', 'timestamp', { unique: false })
        
        console.log('📦 Created pending_actions store with indexes')
      }
    }
  })
}

/**
 * Get the IndexedDB database instance
 * @returns {Promise<IDBDatabase>} The database instance
 */
let dbInstance = null

export async function getDB() {
  if (!dbInstance) {
    dbInstance = await initializeDB()
  }
  return dbInstance
}

/**
 * Clear all data from a specific store
 * @param {string} storeName - Name of the store to clear
 * @returns {Promise<void>}
 */
export async function clearStore(storeName) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        console.warn(`⚠️ Store ${storeName} not found, nothing to clear`)
        return resolve()
      }
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        console.log(`🗑️ Cleared ${storeName}`)
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Clear all offline data (both sync queue and cache metadata)
 * @returns {Promise<void>}
 */
export async function clearAllOfflineData() {
  try {
    await clearStore(SYNC_QUEUE_STORE)
    await clearStore(CACHE_METADATA_STORE)
    console.log('✅ All offline data cleared')
  } catch (error) {
    console.error('❌ Error clearing offline data:', error)
    throw error
  }
}

/**
 * Get all records from a store
 * @param {string} storeName - Name of the store
 * @returns {Promise<Array>} Array of records
 */
export async function getAllFromStore(storeName) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        return resolve([])
      }
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Get records from a store by index
 * @param {string} storeName - Name of the store
 * @param {string} indexName - Name of the index
 * @param {*} value - Value to query
 * @returns {Promise<Array>} Array of matching records
 */
export async function getFromStoreByIndex(storeName, indexName, value) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        console.warn(`⚠️ Store ${storeName} not found`)
        return resolve([])
      }
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Add a record to a store
 * @param {string} storeName - Name of the store
 * @param {Object} data - Data to add
 * @returns {Promise<*>} The key of the added record
 */
export async function addToStore(storeName, data) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Update a record in a store
 * @param {string} storeName - Name of the store
 * @param {Object} data - Data to update (must include key)
 * @returns {Promise<*>} The key of the updated record
 */
export async function updateInStore(storeName, data) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Delete a record from a store
 * @param {string} storeName - Name of the store
 * @param {*} key - Key of the record to delete
 * @returns {Promise<void>}
 */
export async function deleteFromStore(storeName, key) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Get a single record from a store by key
 * @param {string} storeName - Name of the store
 * @param {*} key - Key of the record
 * @returns {Promise<Object|undefined>} The record or undefined if not found
 */
export async function getFromStore(storeName, key) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        return resolve(undefined)
      }
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    } catch (e) {
      reject(e)
    }
  })
}

export const STORES = {
  SYNC_QUEUE: SYNC_QUEUE_STORE,
  CACHE_METADATA: CACHE_METADATA_STORE,
  PENDING_ACTIONS: PENDING_ACTIONS_STORE
}
