# Design Document: PWA Offline Mode

## Overview

The PWA Offline Mode feature enables BibleFunLand to function seamlessly when users lack internet connectivity. The system implements a multi-layered caching strategy with intelligent fallbacks, a persistent sync queue for offline actions, and clear user feedback about connectivity status. This design prioritizes core educational content (trivia, flashcards, devotionals, Bible stories) for offline availability while maintaining data integrity and security.

The architecture consists of three main components:
1. **Service Worker Layer**: Manages caching strategies, request interception, and offline detection
2. **Sync Queue Layer**: Persists user actions taken offline using IndexedDB with encryption
3. **UI Layer**: Provides offline indicators, sync status feedback, and disabled state management

---

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ OfflineContext (Connectivity Status)                     │   │
│  │ - isOnline: boolean                                      │   │
│  │ - offlineIndicator: visible/hidden                       │   │
│  │ - syncQueueStatus: pending count                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▲                                    │
│                              │ (state updates)                    │
└──────────────────────────────┼────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
        ┌───────────▼──────────┐  ┌──────▼──────────────┐
        │  Service Worker      │  │  IndexedDB          │
        │  (sw-enhanced.js)    │  │  (Sync_Queue)       │
        │                      │  │                     │
        │ • Cache Management   │  │ • Offline Actions   │
        │ • Request Routing    │  │ • Encrypted Data    │
        │ • TTL Validation     │  │ • Retry Logic       │
        │ • Fallback Pages     │  │                     │
        └──────────┬───────────┘  └─────────────────────┘
                   │
        ┌──────────┴──────────────────────┐
        │                                  │
   ┌────▼─────────┐          ┌────────────▼────┐
   │ Browser Cache│          │ Network Layer    │
   │              │          │                  │
   │ • Static     │          │ • API Endpoints  │
   │ • Content    │          │ • Sync Endpoint  │
   │ • API Data   │          │                  │
   └──────────────┘          └──────────────────┘
```

### Caching Strategy Matrix

| Content Type | Strategy | TTL | Priority | Cache Store |
|---|---|---|---|---|
| Static Assets (JS, CSS, fonts) | Cache-First | 30 days | High | static-cache |
| Core Content (trivia, flashcards, devotionals, stories) | Cache-First | 7 days | High | content-cache |
| API Responses (user-specific) | Network-First | 24 hours | Medium | api-cache |
| API Responses (static content) | Network-First | 7 days | Medium | api-cache |
| Other Pages | Network-First | N/A | Low | general-cache |

### Request Flow Diagram

```
User Request
    │
    ├─ Is GET request?
    │  └─ No → Pass through (no caching)
    │
    ├─ Is Static Asset?
    │  └─ Yes → Cache-First Strategy
    │     ├─ Check cache
    │     ├─ If hit & not expired → Return cached
    │     └─ If miss/expired → Fetch network, cache, return
    │
    ├─ Is Core Content Route?
    │  └─ Yes → Cache-First Strategy
    │     ├─ Check cache
    │     ├─ If hit & not expired → Return cached
    │     └─ If miss/expired → Fetch network, cache, return
    │
    ├─ Is API Request?
    │  └─ Yes → Network-First Strategy
    │     ├─ Try network
    │     ├─ If success → Cache, return
    │     └─ If fail → Check cache, return cached or 503
    │
    └─ Other → Network with cache fallback
```

---

## Components and Interfaces

### 1. OfflineContext (React Context)

**Purpose**: Provides connectivity status and sync queue state to all components.

**Interface**:
```javascript
{
  isOnline: boolean,                    // Current connectivity status
  wasOffline: boolean,                  // True if user was offline in this session
  syncQueueCount: number,               // Number of pending sync actions
  syncInProgress: boolean,              // True while syncing
  lastSyncTime: timestamp | null,       // When last sync completed
  clearOfflineData: () => Promise<void> // Manual cache/queue clear
}
```

**Location**: `src/context/OfflineContext.jsx`

### 2. OfflineIndicator Component

**Purpose**: Displays connectivity status and sync queue information to users.

**Features**:
- Banner showing "You're offline — some features may be limited"
- Sync queue status: "3 actions pending sync"
- Animated sync indicator during synchronization
- "Learn More" link to offline mode help page
- Auto-dismiss when connectivity restored

**Location**: `src/components/OfflineIndicator.jsx`

### 3. SyncQueueStatusIndicator Component

**Purpose**: Shows detailed sync queue status and allows manual retry/discard.

**Features**:
- Displays pending action count
- Shows individual action status (pending, syncing, failed)
- Manual retry button for failed actions
- Discard option for failed actions
- Progress indicator during sync

**Location**: `src/components/SyncQueueStatusIndicator.jsx`

### 4. Service Worker (sw-enhanced.js)

**Purpose**: Manages all caching, request routing, and offline fallbacks.

**Key Functions**:
- `handleStaticAsset(request)`: Cache-first for static assets
- `handleCoreContent(request)`: Cache-first for core features
- `handleAPIRequest(request)`: Network-first for API calls
- `validateCacheTTL(cacheEntry)`: Check if cached entry is expired
- `getOfflineContent(request)`: Return fallback pages
- `syncQueueOnReconnect()`: Trigger sync when online

**Location**: `public/sw-enhanced.js`

### 5. Sync Queue Manager

**Purpose**: Manages offline action queue in IndexedDB.

**Interface**:
```javascript
{
  addToQueue(action): Promise<queueId>,
  getQueue(): Promise<QueueEntry[]>,
  removeFromQueue(queueId): Promise<void>,
  updateQueueEntry(queueId, status): Promise<void>,
  clearQueue(): Promise<void>,
  syncQueue(): Promise<SyncResult>
}
```

**Location**: `src/lib/syncQueue.js`

### 6. Cache Status API Endpoint

**Purpose**: Provides cache metadata for debugging and monitoring.

**Endpoint**: `GET /api/cache-status`

**Response**:
```javascript
{
  cacheSize: number,           // Total cache size in bytes
  cacheCount: number,          // Number of cached entries
  caches: {
    static: { size, count, ttl },
    content: { size, count, ttl },
    api: { size, count, ttl }
  },
  syncQueueCount: number,
  lastSync: timestamp | null
}
```

**Location**: `server/routes/cache.js`

### 7. Developer Console Commands

**Purpose**: Enable testing and debugging of offline functionality.

**Commands**:
```javascript
window.simulateOffline(true/false)    // Toggle offline simulation
window.debugCache()                   // View cache contents
window.debugSyncQueue()               // View sync queue
window.resetOfflineState()            // Clear all offline data
window.triggerSync()                  // Manually trigger sync
window.getCacheStatus()               // Get cache metadata
```

**Location**: `src/lib/devTools.js`

---

## Data Models

### Sync_Queue Entry (IndexedDB)

**Table**: `sync_queue`

**Schema**:
```javascript
{
  id: string,                    // UUID, primary key
  userId: string,                // User ID from AuthContext
  actionType: string,            // 'prayer', 'note', 'progress', 'quiz_result'
  timestamp: number,             // When action was taken (ms since epoch)
  payload: object,               // Action-specific data (encrypted)
  status: 'pending' | 'syncing' | 'failed' | 'completed',
  retryCount: number,            // Number of sync attempts
  lastRetryTime: number | null,  // When last retry occurred
  errorMessage: string | null,   // Error from last failed sync
  encryptionKey: string,         // Reference to encryption key used
  createdAt: number,
  updatedAt: number
}
```

**Indexes**:
- `userId` (for querying user's pending actions)
- `status` (for finding pending/failed actions)
- `timestamp` (for ordering)

### Cache Entry Metadata

**Stored in Cache Storage with metadata header**:
```javascript
{
  url: string,
  timestamp: number,             // When cached
  ttl: number,                   // TTL in milliseconds
  strategy: 'cache-first' | 'network-first',
  contentType: string,
  size: number,
  expiresAt: number              // timestamp + ttl
}
```

### Offline Action Types

**Prayer**:
```javascript
{
  type: 'prayer',
  content: string,
  category: string,              // 'personal', 'family', 'thanksgiving'
  timestamp: number
}
```

**Note**:
```javascript
{
  type: 'note',
  content: string,
  relatedTo: string,             // 'verse', 'story', 'devotional'
  relatedId: string
}
```

**Progress Update**:
```javascript
{
  type: 'progress',
  featureType: string,           // 'trivia', 'flashcards', 'wordle'
  score: number,
  timestamp: number
}
```

**Quiz Result**:
```javascript
{
  type: 'quiz_result',
  quizId: string,
  answers: object,
  score: number,
  timestamp: number
}
```

### Cache Metadata (IndexedDB)

**Table**: `cache_metadata`

**Schema**:
```javascript
{
  cacheKey: string,              // Primary key
  url: string,
  strategy: string,
  ttl: number,
  createdAt: number,
  expiresAt: number,
  size: number,
  hitCount: number,              // For LRU eviction
  lastAccessTime: number
}
```

---

## API Design

### Cache Status Endpoint

**Endpoint**: `GET /api/cache-status`

**Authentication**: Required (user must be logged in)

**Response**:
```javascript
{
  success: true,
  data: {
    totalCacheSize: 52428800,      // 50MB in bytes
    cacheCount: 1250,
    caches: {
      static: {
        size: 10485760,            // 10MB
        count: 150,
        ttl: 2592000000,           // 30 days
        oldestEntry: 1704067200000
      },
      content: {
        size: 30720000,            // 30MB
        count: 850,
        ttl: 604800000,            // 7 days
        oldestEntry: 1704153600000
      },
      api: {
        size: 11223040,            // ~10.7MB
        count: 250,
        ttl: 86400000,             // 24 hours
        oldestEntry: 1704240000000
      }
    },
    syncQueueCount: 3,
    syncQueueSize: 15360,          // ~15KB
    lastSyncTime: 1704326400000,
    lastSyncStatus: 'success',
    offlineContentAvailable: {
      trivia: 125,
      flashcards: 48,
      devotionals: 32,
      stories: 18
    }
  }
}
```

### Sync Endpoint

**Endpoint**: `POST /api/sync-queue`

**Authentication**: Required

**Request Body**:
```javascript
{
  actions: [
    {
      id: string,
      actionType: string,
      payload: object,
      timestamp: number
    }
  ]
}
```

**Response**:
```javascript
{
  success: true,
  data: {
    synced: [
      { id: string, status: 'success' }
    ],
    failed: [
      { id: string, status: 'failed', error: string }
    ],
    syncTime: number              // ms taken
  }
}
```

### Offline Content Endpoints

**Endpoints for pre-caching**:
- `GET /api/trivia/offline` - Returns 100+ trivia questions
- `GET /api/flashcards/offline` - Returns 50+ flashcard sets
- `GET /api/devotionals/offline` - Returns 30+ devotionals
- `GET /api/stories/offline` - Returns 20+ Bible stories

**Response Format**:
```javascript
{
  success: true,
  data: [
    { id, title, content, ... }
  ],
  cacheHint: {
    ttl: 604800000,              // 7 days
    strategy: 'cache-first'
  }
}
```

---

## Implementation Approach

### Phase 1: Service Worker Enhancement

1. **Extend sw-enhanced.js** with:
   - TTL validation logic for cache entries
   - Metadata storage in Cache Storage headers
   - LRU eviction when cache exceeds 100MB
   - Fallback page serving
   - Cache status tracking

2. **Implement cache strategies**:
   - Cache-first for static assets (30-day TTL)
   - Cache-first for core content (7-day TTL)
   - Network-first for API responses (24-hour/7-day TTL)

3. **Add offline detection**:
   - Monitor `navigator.onLine`
   - Listen to `online`/`offline` events
   - Communicate status to React via postMessage

### Phase 2: IndexedDB Sync Queue

1. **Create IndexedDB schema**:
   - `sync_queue` table with indexes
   - `cache_metadata` table for tracking

2. **Implement SyncQueueManager**:
   - Add/remove/update queue entries
   - Encrypt sensitive data using Web Crypto API
   - Implement retry logic (5 retries, 30-second intervals)

3. **Encryption**:
   - Use Web Crypto API (AES-GCM)
   - Store encryption keys securely
   - Encrypt only sensitive fields (content, payload)

### Phase 3: React Integration

1. **Create OfflineContext**:
   - Track connectivity status
   - Expose sync queue operations
   - Provide cache management functions

2. **Build UI Components**:
   - OfflineIndicator banner
   - SyncQueueStatusIndicator
   - Disabled state management for offline features

3. **Service Worker Registration**:
   - Register in `src/main.jsx` after DOM ready
   - Handle registration errors gracefully
   - Detect and prompt for updates

### Phase 4: Developer Tools

1. **Console Commands**:
   - Offline simulation
   - Cache inspection
   - Queue inspection
   - Manual sync trigger

2. **Logging**:
   - Cache operations in dev mode
   - Network request routing
   - Sync attempts and results

### Phase 5: Testing & Monitoring

1. **Test Suite**:
   - Service Worker registration
   - Cache strategies and TTL
   - Offline detection
   - Sync queue operations
   - Fallback pages

2. **Analytics**:
   - Track offline usage patterns
   - Monitor sync success/failure rates
   - Cache hit/miss ratios

---

## Technology Choices and Rationale

### Service Worker API
- **Why**: Standard browser API for background request interception and caching
- **Rationale**: Native support, no external dependencies, works across all modern browsers
- **Scope**: `/` to intercept all application requests

### Cache Storage API
- **Why**: Persistent, quota-managed storage for HTTP responses
- **Rationale**: Designed specifically for PWA caching, survives browser restarts, separate from localStorage
- **Quota**: Typically 50% of available disk space (100MB limit enforced in code)

### IndexedDB
- **Why**: Persistent, structured storage for sync queue and metadata
- **Rationale**: Supports complex queries, transactions, and large data volumes
- **Encryption**: Web Crypto API for sensitive data

### Web Crypto API
- **Why**: Native encryption without external libraries
- **Rationale**: AES-GCM provides authenticated encryption, no npm dependencies
- **Key Management**: Keys derived from user ID + device fingerprint

### Background Sync API
- **Why**: Automatic sync when connectivity restored, even if app closed
- **Rationale**: Provides best UX for offline actions, fallback to manual sync if unavailable
- **Fallback**: Manual sync on app open if Background Sync not supported

### React Context
- **Why**: State management for offline status and sync queue
- **Rationale**: Lightweight, no external dependencies, integrates with existing AuthContext
- **Scope**: Global availability to all components

---

## Integration Points with Existing Code

### AuthContext Integration

**Current**: `src/context/AuthContext.jsx` manages user authentication

**Integration**:
- OfflineContext depends on AuthContext for user ID
- Clear sync queue on logout
- Prevent caching of user-specific data after logout
- Use user ID for sync queue encryption

**Code Location**: `src/context/OfflineContext.jsx`

### Service Worker Registration

**Current**: No Service Worker registration in `src/main.jsx`

**Integration**:
- Add registration after DOM ready, before React render
- Handle registration errors gracefully
- Detect updates and prompt user to refresh
- Store registration status in OfflineContext

**Code Location**: `src/main.jsx` (add registration logic)

### Existing sw.js and sw-enhanced.js

**Current**: 
- `public/sw.js` handles push notifications
- `public/sw-enhanced.js` has basic offline caching

**Integration**:
- Merge push notification logic from sw.js into sw-enhanced.js
- Enhance caching strategies with TTL validation
- Add sync queue synchronization
- Implement LRU eviction

**Code Location**: `public/sw-enhanced.js` (enhanced version)

### API Endpoints

**Current**: Various endpoints in `server/routes/`

**Integration**:
- Add `GET /api/cache-status` endpoint
- Add `POST /api/sync-queue` endpoint
- Add offline content endpoints (`/api/trivia/offline`, etc.)
- Ensure all endpoints return appropriate cache headers

**Code Location**: `server/routes/cache.js` (new file)

### UI Components

**Current**: Various components in `src/components/`

**Integration**:
- Add OfflineIndicator to App.jsx or Nav.jsx
- Add SyncQueueStatusIndicator to settings page
- Disable offline-incompatible features in components
- Use OfflineContext to check connectivity

**Code Location**: `src/components/OfflineIndicator.jsx`, `src/components/SyncQueueStatusIndicator.jsx`

---

## Error Handling

### Service Worker Errors

| Error | Handling |
|---|---|
| Cache quota exceeded | Implement LRU eviction, log warning |
| Network timeout | Return cached response or fallback page |
| Invalid cache entry | Delete entry, retry network request |
| Corrupted IndexedDB | Clear database, reinitialize |

### Sync Queue Errors

| Error | Handling |
|---|---|
| Network unavailable | Retry after 30 seconds (max 5 retries) |
| Server error (5xx) | Retry with exponential backoff |
| Client error (4xx) | Log error, mark as failed, show to user |
| Encryption/decryption failure | Log error, mark as failed, don't retry |
| IndexedDB quota exceeded | Clear old entries, retry |

### User-Facing Errors

| Scenario | Message |
|---|---|
| Offline, no cached content | "This content isn't available offline. Check back when you're online." |
| Sync failed after retries | "Couldn't sync your changes. Try again or discard." |
| Cache cleared | "Offline content has been cleared. New content will be cached when online." |
| Encryption error | "There was a problem saving your offline data. Please try again." |

---

## Testing Strategy

### Unit Testing

**Service Worker Caching**:
- Test cache-first strategy with TTL validation
- Test network-first strategy with fallback
- Test LRU eviction when cache exceeds 100MB
- Test fallback page serving

**Sync Queue**:
- Test adding/removing queue entries
- Test encryption/decryption
- Test retry logic with exponential backoff
- Test IndexedDB operations

**Offline Detection**:
- Test online/offline event handling
- Test OfflineContext state updates
- Test UI component rendering based on status

**API Endpoints**:
- Test cache status endpoint response format
- Test sync endpoint with multiple actions
- Test offline content endpoints

### Property-Based Testing

Property-based tests will verify universal correctness properties across many generated inputs (see Correctness Properties section below).

### Integration Testing

**End-to-End Scenarios**:
1. User goes offline → offline indicator appears → user can access cached content
2. User takes action offline → action queued → user goes online → action syncs
3. User clears cache → all offline data removed → new content cached on next online access
4. Service Worker updates → old caches deleted → new version active

### Manual Testing Checklist

- [ ] Service Worker registers on app load
- [ ] Static assets load from cache when offline
- [ ] Core content (trivia, devotionals) available offline
- [ ] Offline indicator appears/disappears correctly
- [ ] Sync queue persists across page reloads
- [ ] Sync queue syncs when connectivity restored
- [ ] Cache size stays under 100MB
- [ ] Fallback pages display for unavailable content
- [ ] Developer console commands work
- [ ] Cache clears on logout
- [ ] Encryption/decryption works correctly

### Performance Benchmarks

- Service Worker registration: < 5 seconds
- Cached content response time: < 100ms
- Sync queue sync time: < 5 seconds for 10 actions
- Cache size: < 100MB
- IndexedDB query time: < 50ms

---

## Security and Privacy Considerations

### Data Protection

1. **No PII Caching**: Exclude email, phone, full names from cache
2. **HTTPS-Only**: Only cache responses from HTTPS requests
3. **Encryption**: Encrypt sync queue entries using Web Crypto API
4. **Token Security**: Never cache authentication tokens or session credentials

### User Privacy

1. **Logout Handling**: Clear all user-specific cached data on logout
2. **Data Deletion**: Provide option to clear all offline data
3. **Analytics**: Queue analytics events offline, send when online
4. **Consent**: Inform users about offline caching in onboarding

### Validation

1. **Cache Validation**: Verify cached responses haven't been tampered with
2. **Sync Validation**: Validate sync queue entries before sending to server
3. **Encryption Validation**: Verify encryption keys and decrypt successfully

---

## Monitoring and Analytics

### Metrics to Track

1. **Service Worker Adoption**:
   - % of users with Service Worker registered
   - % of users with offline content cached

2. **Offline Usage**:
   - Frequency of offline mode usage
   - Average offline session duration
   - Most accessed offline content

3. **Sync Queue Performance**:
   - Sync success rate
   - Average sync time
   - Retry rate
   - Failed action types

4. **Cache Performance**:
   - Cache hit rate
   - Cache miss rate
   - Average cache size per user
   - LRU eviction frequency

5. **Error Tracking**:
   - Service Worker errors
   - IndexedDB errors
   - Encryption errors
   - Network errors

### Analytics Events

- `offline_mode_enabled`: When user goes offline
- `offline_mode_disabled`: When user comes back online
- `sync_queue_action_added`: When action queued
- `sync_queue_action_synced`: When action successfully synced
- `sync_queue_action_failed`: When sync fails
- `cache_cleared`: When user clears cache
- `offline_content_accessed`: When user accesses cached content



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Service Worker Registration Timing

*For any* application initialization, the Service Worker registration must complete before React renders the first component, ensuring offline functionality is available from the start.

**Validates: Requirements 1.2**

### Property 2: Service Worker Update Detection

*For any* deployed Service Worker update, the application must detect the update and prompt the user to refresh, ensuring users get the latest offline content.

**Validates: Requirements 1.7**

### Property 3: Static Asset Cache-First Strategy

*For any* static asset request (JS, CSS, fonts, images), if the asset exists in cache and is less than 30 days old, the Service Worker must serve it from cache without making a network request.

**Validates: Requirements 2.2, 2.3**

### Property 4: Static Asset Cache Miss Handling

*For any* static asset request that is not in cache, the Service Worker must fetch from the network, cache the response, and return it to the client.

**Validates: Requirements 2.4**

### Property 5: Static Asset Network Failure Handling

*For any* static asset request where the network fetch fails and no cached version exists, the Service Worker must return a 503 Service Unavailable response.

**Validates: Requirements 2.5**

### Property 6: Static Asset Type Filtering

*For any* request to a resource, only resources with extensions `.js`, `.css`, `.woff2`, `.png`, `.svg`, `.jpg`, `.jpeg`, `.gif` should be cached as static assets.

**Validates: Requirements 2.6**

### Property 7: Old Cache Cleanup on Activation

*For any* Service Worker activation, all cached static assets older than 30 days must be deleted to prevent unbounded cache growth.

**Validates: Requirements 2.7**

### Property 8: Core Content Cache-First Strategy

*For any* request to a core feature route (`/trivia`, `/flashcards`, `/devotional`, `/stories`, `/promises`, `/wordle`, `/ai/prayer-companion`), if cached content exists, it must be served from cache without a network request.

**Validates: Requirements 3.1, 3.2**

### Property 9: Core Content TTL Assignment

*For any* core feature content fetched from the network, the response must be cached with a 7-day TTL.

**Validates: Requirements 3.3**

### Property 10: Core Content Offline Fallback

*For any* request to core feature content where no cached version exists and the network is unavailable, the Service Worker must serve a fallback page indicating the content is not available offline.

**Validates: Requirements 3.4**

### Property 11: API Response Network-First Strategy

*For any* API request to `/api/*` endpoints, the Service Worker must attempt to fetch from the network first, cache successful responses, and fall back to cached data only if the network fails.

**Validates: Requirements 4.1**

### Property 12: API Response TTL Assignment

*For any* successful API response, it must be cached with a 24-hour TTL for user-specific data and 7-day TTL for static content.

**Validates: Requirements 4.2**

### Property 13: API Error Response Exclusion

*For any* API response with status codes 4xx or 5xx, the response must not be cached.

**Validates: Requirements 4.6**

### Property 14: API Response Metadata Storage

*For any* cached API response, metadata including cache timestamp and TTL must be stored for later validation.

**Validates: Requirements 4.7**

### Property 15: Offline Detection via Standard APIs

*For any* application instance, connectivity status must be detected using `navigator.onLine` API and `online`/`offline` window events.

**Validates: Requirements 5.1**

### Property 16: Offline Indicator Display on Transition

*For any* transition from online to offline mode, the Offline_Indicator must be displayed in the UI.

**Validates: Requirements 5.2**

### Property 17: Offline Indicator Removal on Reconnection

*For any* transition from offline to online mode, the Offline_Indicator must be removed and a confirmation message displayed.

**Validates: Requirements 5.4**

### Property 18: Offline Feature Disabling

*For any* feature that requires network connectivity (multiplayer games, live prayer wall), while in offline mode, the UI controls must be disabled or grayed out.

**Validates: Requirements 5.5**

### Property 19: Offline Indicator Persistence

*For any* page navigation while offline, the Offline_Indicator must remain visible and persistent across all routes.

**Validates: Requirements 5.7**

### Property 20: Connectivity Status in Context

*For any* component in the application, the current connectivity status must be accessible via OfflineContext.

**Validates: Requirements 5.8**

### Property 21: Offline Action Queueing

*For any* user action taken in offline mode that requires server synchronization (prayer, note, progress), the action must be added to the Sync_Queue in IndexedDB.

**Validates: Requirements 6.1**

### Property 22: Sync Queue Entry Structure

*For any* entry in the Sync_Queue, it must include: action type, timestamp, user ID, action payload, and a unique queue ID.

**Validates: Requirements 6.2**

### Property 23: Automatic Sync on Reconnection

*For any* transition from offline to online mode, the application must automatically attempt to synchronize all queued actions to the server.

**Validates: Requirements 6.4**

### Property 24: Successful Sync Removal

*For any* queued action that is successfully synchronized, the action must be removed from the Sync_Queue and a success notification displayed.

**Validates: Requirements 6.5**

### Property 25: Sync Retry Logic

*For any* queued action that fails to synchronize, the action must be retained in the Sync_Queue and retried after 30 seconds, up to a maximum of 5 retries.

**Validates: Requirements 6.6**

### Property 26: Max Retry Error Handling

*For any* queued action that fails after 5 retries, an error notification must be displayed to the user with options to manually retry or discard.

**Validates: Requirements 6.7**

### Property 27: TTL-Based Cache Invalidation

*For any* cached entry, if its TTL has expired, the Service Worker must attempt to fetch fresh content from the network on the next request.

**Validates: Requirements 7.1, 7.2**

### Property 28: Cache Update on Fresh Fetch

*For any* successful network fetch of expired cached content, the cache must be updated with the fresh content and returned to the client.

**Validates: Requirements 7.3**

### Property 29: Stale Cache Fallback

*For any* network fetch failure for expired cached content, if the expired cached entry exists, it must be returned with a warning header indicating the data may be stale.

**Validates: Requirements 7.4**

### Property 30: Old Cache Deletion on Update

*For any* new Service Worker version deployment, all caches from the previous version must be deleted during the activation phase.

**Validates: Requirements 7.6**

### Property 31: Fallback Page for Unavailable Content

*For any* request to a page that is not cached and the network is unavailable, the Service Worker must serve a fallback page instead of an error.

**Validates: Requirements 8.1**

### Property 32: Offline API Error Response Format

*For any* API request that fails while offline with no cached response, the Service Worker must return a JSON response with status 503 and the message: `{ "error": "Offline", "message": "This feature requires an internet connection" }`.

**Validates: Requirements 8.6**

### Property 33: Fallback Page Pre-Caching

*For any* Service Worker installation, the fallback page must be pre-cached to ensure it is always available.

**Validates: Requirements 8.7**

### Property 34: Cache Prioritization

*For any* caching operation, content must be prioritized in order: (1) Core_Features pages, (2) API responses for trivia/flashcards/devotionals, (3) static assets, (4) other pages.

**Validates: Requirements 9.1**

### Property 35: LRU Eviction at Size Limit

*For any* cache operation where the total cache size exceeds 100MB, the Service Worker must implement LRU eviction to remove the least recently used entries until the cache is under 100MB.

**Validates: Requirements 9.2, 12.1, 12.2**

### Property 36: Minimum Offline Content Caching

*For any* application instance, the Service Worker must cache at least 100 trivia questions, 50 flashcard sets, 30 devotionals, and 20 Bible stories for offline access.

**Validates: Requirements 9.3**

### Property 37: Cache Status API Response

*For any* request to `/api/cache-status`, the endpoint must return the current cache size, number of cached items, and TTL information in the specified format.

**Validates: Requirements 9.5**

### Property 38: Background Sync Implementation

*For any* application instance where the Background Sync API is available, the Service Worker must use it to sync queued actions even if the application tab is closed.

**Validates: Requirements 10.2**

### Property 39: Background Sync Fallback

*For any* application instance where the Background Sync API is not available, the application must fall back to synchronizing queued actions when the application is next opened or when connectivity is restored.

**Validates: Requirements 10.4**

### Property 40: Successful Sync Completion

*For any* successful synchronization of all queued actions, the application must display a success notification and clear the Sync_Queue.

**Validates: Requirements 10.6**

### Property 41: Offline Simulation Behavior

*For any* offline mode simulation via `window.simulateOffline(true)`, the application must behave as if `navigator.onLine` is `false` and all network requests fail.

**Validates: Requirements 11.2**

### Property 42: Cache Size Limit Enforcement

*For any* caching operation, the total cache size must never exceed 100MB.

**Validates: Requirements 12.1**

### Property 43: Cached Content Response Time

*For any* request to cached content, the Service Worker must respond within 100ms.

**Validates: Requirements 12.5**

### Property 44: PII Exclusion from Cache

*For any* cached response, personally identifiable information (email addresses, phone numbers, full names) must not be cached.

**Validates: Requirements 13.1**

### Property 45: Authentication Token Exclusion

*For any* cached response, authentication tokens and session credentials must not be cached.

**Validates: Requirements 13.2**

### Property 46: User Data Clearing on Logout

*For any* user logout, all cached user-specific data must be cleared from the Sync_Queue and cache stores.

**Validates: Requirements 13.3**

### Property 47: HTTPS-Only Caching

*For any* HTTP response, it must not be cached; only HTTPS responses should be cached.

**Validates: Requirements 13.4**

### Property 48: Sync Queue Encryption

*For any* entry stored in the Sync_Queue in IndexedDB, it must be encrypted using the Web Crypto API before storage.

**Validates: Requirements 13.5**

### Property 49: Cached Response Validation

*For any* cached API response, the Service Worker must validate that the response has not been tampered with.

**Validates: Requirements 13.7**

### Property 50: Offline Feature Messaging

*For any* attempt to use a feature that requires internet connectivity while offline, the application must display a helpful message explaining why the feature is unavailable.

**Validates: Requirements 14.3**

### Property 51: Analytics Event Queueing Offline

*For any* analytics event generated while in offline mode, the event must be queued and sent when connectivity is restored, not sent immediately.

**Validates: Requirements 15.5**

### Property 52: Cache Hit/Miss Logging

*For any* cache operation in development mode, the Service Worker must log cache hit/miss rates for analysis and optimization.

**Validates: Requirements 15.6**

