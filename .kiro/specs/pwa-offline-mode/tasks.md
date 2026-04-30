# Implementation Tasks: PWA Offline Mode

## Overview

This document breaks down the PWA Offline Mode feature into concrete, actionable implementation tasks organized by phase. Each task includes acceptance criteria, dependencies, and estimated complexity.

---

## Phase 1: Service Worker Enhancement

### Task 1.1: Extend Service Worker with TTL Validation

**Description**: Enhance `public/sw-enhanced.js` to validate cache entry TTLs and implement cache invalidation logic.

**Acceptance Criteria**:
- [ ] Service Worker stores metadata (timestamp, TTL) with each cached response
- [ ] TTL validation checks if cached entry is expired before serving
- [ ] Expired entries trigger network fetch attempt
- [ ] Metadata stored in Cache Storage response headers or separate IndexedDB table
- [ ] Console logging shows cache hit/miss/expired status in dev mode

**Dependencies**: None (foundational task)

**Complexity**: Medium

**Files to Modify**:
- `public/sw-enhanced.js`

**Implementation Notes**:
- Use `Response.clone()` to add custom headers with metadata
- Store metadata in `cache_metadata` IndexedDB table for efficient queries
- Implement `validateCacheTTL(cacheEntry)` helper function

---

### Task 1.2: Implement Cache-First Strategy for Static Assets

**Description**: Configure Service Worker to use cache-first strategy for static assets with 30-day TTL.

**Acceptance Criteria**:
- [ ] Static assets (JS, CSS, fonts, images) served from cache if available
- [ ] Cache-first strategy: check cache first, fall back to network
- [ ] 30-day TTL enforced for static assets
- [ ] Old static assets (>30 days) deleted during Service Worker activation
- [ ] File extensions filtered: `.js`, `.css`, `.woff2`, `.png`, `.svg`, `.jpg`, `.jpeg`, `.gif`
- [ ] Network failures return 503 if no cached version exists

**Dependencies**: Task 1.1

**Complexity**: Medium

**Files to Modify**:
- `public/sw-enhanced.js`

**Implementation Notes**:
- Create `handleStaticAsset(request)` function
- Implement cache cleanup in `activate` event listener
- Use `cacheNames.keys()` to find old cache versions

---

### Task 1.3: Implement Cache-First Strategy for Core Content

**Description**: Configure Service Worker to cache core feature routes (trivia, flashcards, devotionals, stories) with 7-day TTL.

**Acceptance Criteria**:
- [ ] Core feature routes cached: `/trivia`, `/flashcards`, `/devotional`, `/stories`, `/promises`, `/wordle`, `/ai/prayer-companion`
- [ ] Cache-first strategy applied to these routes
- [ ] 7-day TTL enforced for core content
- [ ] Separate cache store for core content (distinct from static assets)
- [ ] Fallback page served if content not cached and network unavailable
- [ ] API responses from `/api/trivia`, `/api/flashcards`, etc. also cached with 7-day TTL

**Dependencies**: Task 1.1, Task 1.2

**Complexity**: Medium

**Files to Modify**:
- `public/sw-enhanced.js`

**Implementation Notes**:
- Create `handleCoreContent(request)` function
- Maintain separate cache stores: `static-cache`, `content-cache`, `api-cache`
- Implement route matching logic for core feature paths

---

### Task 1.4: Implement Network-First Strategy for API Responses

**Description**: Configure Service Worker to use network-first strategy for API requests with intelligent fallback.

**Acceptance Criteria**:
- [ ] API requests (`/api/*`) attempt network first
- [ ] Successful responses cached with appropriate TTL (24 hours for user data, 7 days for static)
- [ ] Network failures fall back to cached response if available
- [ ] Error responses (4xx, 5xx) not cached
- [ ] Offline API failures return JSON 503 response: `{ "error": "Offline", "message": "..." }`
- [ ] Cache metadata stored with each API response

**Dependencies**: Task 1.1

**Complexity**: Medium

**Files to Modify**:
- `public/sw-enhanced.js`

**Implementation Notes**:
- Create `handleAPIRequest(request)` function
- Implement TTL logic based on endpoint type (user-specific vs static)
- Return proper JSON error format for offline API failures

---

### Task 1.5: Implement LRU Cache Eviction

**Description**: Implement least-recently-used (LRU) eviction when cache exceeds 100MB.

**Acceptance Criteria**:
- [ ] Cache size monitored continuously
- [ ] When cache exceeds 100MB, LRU eviction triggered
- [ ] Least recently used entries removed first
- [ ] Cache size never exceeds 100MB
- [ ] Eviction logged in dev mode
- [ ] `cache_metadata` table tracks `lastAccessTime` for LRU calculation

**Dependencies**: Task 1.1

**Complexity**: High

**Files to Modify**:
- `public/sw-enhanced.js`
- `src/lib/cacheManager.js` (new file)

**Implementation Notes**:
- Create `evictLRUEntries()` function
- Query `cache_metadata` table ordered by `lastAccessTime`
- Update `lastAccessTime` on every cache hit

---

### Task 1.6: Implement Fallback Pages

**Description**: Create and serve fallback pages for unavailable offline content.

**Acceptance Criteria**:
- [ ] Fallback page created with friendly offline message
- [ ] Fallback page lists available offline content with links
- [ ] Fallback page includes "Retry" button
- [ ] Fallback page styled consistently with app design
- [ ] Fallback page pre-cached during Service Worker installation
- [ ] Served when page not cached and network unavailable

**Dependencies**: Task 1.2, Task 1.3

**Complexity**: Low

**Files to Modify**:
- `public/sw-enhanced.js`
- `public/offline-fallback.html` (new file)

**Implementation Notes**:
- Create simple HTML fallback page
- Include app logo and branding
- Add links to available offline content

---

### Task 1.7: Implement Service Worker Update Detection

**Description**: Detect Service Worker updates and prompt user to refresh.

**Acceptance Criteria**:
- [ ] Service Worker checks for updates periodically
- [ ] New version detected automatically
- [ ] User prompted to refresh for latest offline content
- [ ] Old caches deleted during activation of new version
- [ ] Update detection logged in console

**Dependencies**: Task 1.2

**Complexity**: Medium

**Files to Modify**:
- `public/sw-enhanced.js`
- `src/main.jsx` (for update prompt UI)

**Implementation Notes**:
- Use `registration.onupdatefound` event
- Implement `skipWaiting()` and `clients.claim()` for immediate activation
- Show toast/banner prompting user to refresh

---

## Phase 2: IndexedDB Sync Queue

### Task 2.1: Create IndexedDB Schema and Initialization

**Description**: Set up IndexedDB database with `sync_queue` and `cache_metadata` tables.

**Acceptance Criteria**:
- [ ] IndexedDB database created with name `biblefunland-offline`
- [ ] `sync_queue` table with schema: id, userId, actionType, timestamp, payload, status, retryCount, lastRetryTime, errorMessage, encryptionKey, createdAt, updatedAt
- [ ] Indexes created: userId, status, timestamp
- [ ] `cache_metadata` table with schema: cacheKey, url, strategy, ttl, createdAt, expiresAt, size, hitCount, lastAccessTime
- [ ] Database initialization handles version upgrades
- [ ] Error handling for quota exceeded and corruption

**Dependencies**: None

**Complexity**: Medium

**Files to Create**:
- `src/lib/indexedDB.js`

**Implementation Notes**:
- Use `indexedDB.open()` with version management
- Implement `onupgradeneeded` for schema creation
- Handle database errors gracefully

---

### Task 2.2: Implement SyncQueueManager

**Description**: Create manager class for sync queue operations.

**Acceptance Criteria**:
- [ ] `addToQueue(action)` adds action with unique ID
- [ ] `getQueue()` retrieves all pending actions
- [ ] `removeFromQueue(queueId)` removes action
- [ ] `updateQueueEntry(queueId, status)` updates status
- [ ] `clearQueue()` removes all entries
- [ ] `getFailedActions()` retrieves failed actions for retry
- [ ] All operations return Promises
- [ ] Error handling for IndexedDB failures

**Dependencies**: Task 2.1

**Complexity**: Medium

**Files to Create**:
- `src/lib/syncQueueManager.js`

**Implementation Notes**:
- Use IndexedDB transactions for data consistency
- Implement retry count tracking
- Add timestamp for ordering

---

### Task 2.3: Implement Web Crypto Encryption for Sync Queue

**Description**: Encrypt sensitive sync queue data using Web Crypto API.

**Acceptance Criteria**:
- [ ] Encryption key derived from user ID + device fingerprint
- [ ] Sync queue payloads encrypted before storage
- [ ] Decryption on retrieval before sending to server
- [ ] AES-GCM algorithm used for authenticated encryption
- [ ] Encryption/decryption errors handled gracefully
- [ ] Encryption key stored securely (not in localStorage)

**Dependencies**: Task 2.2

**Complexity**: High

**Files to Create**:
- `src/lib/encryption.js`

**Implementation Notes**:
- Use `SubtleCrypto` API for encryption
- Derive key using `PBKDF2` with user ID + device fingerprint
- Store IV with encrypted data for decryption

---

### Task 2.4: Implement Sync Queue Retry Logic

**Description**: Implement automatic retry mechanism for failed sync queue actions.

**Acceptance Criteria**:
- [ ] Failed actions retry after 30 seconds
- [ ] Maximum 5 retries per action
- [ ] Retry count incremented on each failure
- [ ] Error message stored for debugging
- [ ] After 5 retries, action marked as failed
- [ ] User notified of failed actions with retry/discard options
- [ ] Exponential backoff implemented (30s, 60s, 120s, 240s, 480s)

**Dependencies**: Task 2.2

**Complexity**: Medium

**Files to Modify**:
- `src/lib/syncQueueManager.js`

**Implementation Notes**:
- Implement `retryFailedActions()` function
- Use `setTimeout` for retry scheduling
- Store retry timestamps in queue entry

---

## Phase 3: React Integration

### Task 3.1: Create OfflineContext

**Description**: Create React context for managing offline state and sync queue operations.

**Acceptance Criteria**:
- [ ] Context provides: isOnline, wasOffline, syncQueueCount, syncInProgress, lastSyncTime
- [ ] `clearOfflineData()` function clears caches and sync queue
- [ ] Context depends on AuthContext for user ID
- [ ] Connectivity status updated via `online`/`offline` events
- [ ] Sync queue status updated when actions added/removed
- [ ] Context accessible to all components

**Dependencies**: Task 2.2

**Complexity**: Medium

**Files to Create**:
- `src/context/OfflineContext.jsx`

**Implementation Notes**:
- Use `useEffect` to listen to `online`/`offline` events
- Integrate with AuthContext for user ID
- Provide sync queue operations via context

---

### Task 3.2: Create OfflineIndicator Component

**Description**: Build UI component displaying offline status and sync queue information.

**Acceptance Criteria**:
- [ ] Banner displays "You're offline — some features may be limited"
- [ ] Shows sync queue count: "3 actions pending sync"
- [ ] Animated sync indicator during synchronization
- [ ] "Learn More" link to offline mode help page
- [ ] Auto-dismisses when connectivity restored
- [ ] Persistent across all pages
- [ ] Styled with red/orange color for offline state
- [ ] Accessible with proper ARIA labels

**Dependencies**: Task 3.1

**Complexity**: Low

**Files to Create**:
- `src/components/OfflineIndicator.jsx`
- `src/components/OfflineIndicator.module.css`

**Implementation Notes**:
- Use OfflineContext to get connectivity status
- Implement smooth animations for appearance/disappearance
- Position fixed at top or bottom of screen

---

### Task 3.3: Create SyncQueueStatusIndicator Component

**Description**: Build detailed sync queue status component with retry/discard options.

**Acceptance Criteria**:
- [ ] Displays pending action count
- [ ] Shows individual action status (pending, syncing, failed)
- [ ] Manual retry button for failed actions
- [ ] Discard option for failed actions
- [ ] Progress indicator during sync
- [ ] Expandable/collapsible details
- [ ] Accessible with proper ARIA labels

**Dependencies**: Task 3.1

**Complexity**: Medium

**Files to Create**:
- `src/components/SyncQueueStatusIndicator.jsx`
- `src/components/SyncQueueStatusIndicator.module.css`

**Implementation Notes**:
- Display in settings page or dedicated offline page
- Show action type and timestamp for each queued action
- Implement manual sync trigger

---

### Task 3.4: Register Service Worker in main.jsx

**Description**: Add Service Worker registration to application startup.

**Acceptance Criteria**:
- [ ] Service Worker registered from `public/sw-enhanced.js` in `src/main.jsx`
- [ ] Registration occurs after DOM ready, before React render
- [ ] Browser support check: log warning if Service Workers not supported
- [ ] Success message logged to console on registration
- [ ] Error message logged with failure reason
- [ ] Scope set to `/`
- [ ] Update detection implemented

**Dependencies**: Task 1.7

**Complexity**: Low

**Files to Modify**:
- `src/main.jsx`

**Implementation Notes**:
- Register after `document.readyState === 'complete'`
- Handle registration errors gracefully
- Store registration in window for access by other code

---

### Task 3.5: Integrate OfflineContext into App.jsx

**Description**: Add OfflineContext provider and components to main App.

**Acceptance Criteria**:
- [ ] OfflineContext provider wraps entire app
- [ ] OfflineIndicator component rendered in App
- [ ] Offline state accessible to all components
- [ ] Sync queue operations available globally
- [ ] AuthContext integration working

**Dependencies**: Task 3.1, Task 3.2

**Complexity**: Low

**Files to Modify**:
- `src/App.jsx`

**Implementation Notes**:
- Wrap App content with OfflineContext.Provider
- Place OfflineIndicator near top of component tree
- Ensure AuthContext is parent of OfflineContext

---

### Task 3.6: Disable Offline-Incompatible Features

**Description**: Gray out or disable UI controls for features requiring internet while offline.

**Acceptance Criteria**:
- [ ] Multiplayer game features disabled offline
- [ ] Live prayer wall disabled offline
- [ ] Real-time features disabled offline
- [ ] Disabled controls show tooltip explaining why
- [ ] Disabled state checked via OfflineContext
- [ ] User can still access cached content

**Dependencies**: Task 3.1

**Complexity**: Medium

**Files to Modify**:
- `src/components/` (various feature components)
- `src/pages/` (various feature pages)

**Implementation Notes**:
- Create `useOffline()` hook for easy access to offline status
- Implement conditional rendering based on `isOnline`
- Add helpful tooltips for disabled features

---

### Task 3.7: Implement Offline Action Queueing

**Description**: Queue user actions (prayers, notes, progress) when offline.

**Acceptance Criteria**:
- [ ] Prayer submissions queued when offline
- [ ] Note saves queued when offline
- [ ] Progress updates queued when offline
- [ ] Quiz results queued when offline
- [ ] User sees "Saved locally — will sync when online" message
- [ ] Actions encrypted before storage
- [ ] Queued actions synced when online

**Dependencies**: Task 2.2, Task 2.3, Task 3.1

**Complexity**: High

**Files to Modify**:
- `src/pages/AIPrayerCompanion.jsx` (or prayer-related components)
- `src/pages/BibleCharacterQuiz.jsx` (or quiz components)
- Other feature pages that need offline support

**Implementation Notes**:
- Check `isOnline` before making API calls
- If offline, add to sync queue instead
- Show confirmation message to user
- Implement sync on reconnection

---

## Phase 4: Developer Tools

### Task 4.1: Implement Console Commands for Testing

**Description**: Create developer console commands for offline testing and debugging.

**Acceptance Criteria**:
- [ ] `window.simulateOffline(true/false)` toggles offline simulation
- [ ] `window.debugCache()` displays cache contents
- [ ] `window.debugSyncQueue()` displays sync queue contents
- [ ] `window.resetOfflineState()` clears all offline data
- [ ] `window.triggerSync()` manually triggers sync
- [ ] `window.getCacheStatus()` returns cache metadata
- [ ] Commands only available in development mode
- [ ] Commands logged to console

**Dependencies**: Task 1.1, Task 2.2

**Complexity**: Low

**Files to Create**:
- `src/lib/devTools.js`

**Implementation Notes**:
- Attach functions to `window` object in development
- Implement offline simulation by overriding `navigator.onLine`
- Query IndexedDB and Cache Storage for debugging

---

### Task 4.2: Implement Service Worker Logging

**Description**: Add comprehensive logging to Service Worker for debugging.

**Acceptance Criteria**:
- [ ] Cache operations logged (put, match, delete)
- [ ] Network request routing logged
- [ ] TTL validation logged
- [ ] Fallback page serving logged
- [ ] Sync queue operations logged
- [ ] Logging only in development mode
- [ ] Console output includes timestamps and operation details

**Dependencies**: Task 1.1

**Complexity**: Low

**Files to Modify**:
- `public/sw-enhanced.js`

**Implementation Notes**:
- Use `console.log()` with descriptive messages
- Include request URL, cache status, TTL info
- Prefix logs with `[SW]` for easy filtering

---

## Phase 5: Testing & Monitoring

### Task 5.1: Create Unit Tests for Service Worker

**Description**: Write unit tests for Service Worker caching strategies and TTL validation.

**Acceptance Criteria**:
- [ ] Tests for cache-first strategy with TTL validation
- [ ] Tests for network-first strategy with fallback
- [ ] Tests for LRU eviction when cache exceeds 100MB
- [ ] Tests for fallback page serving
- [ ] Tests for error response exclusion from cache
- [ ] Tests for metadata storage and retrieval
- [ ] Minimum 10 test cases
- [ ] All tests passing

**Dependencies**: Task 1.1 through Task 1.6

**Complexity**: High

**Files to Create**:
- `src/__tests__/serviceWorker.test.js`

**Implementation Notes**:
- Use Jest or Vitest for testing
- Mock Cache Storage API
- Mock network requests
- Test both success and failure scenarios

---

### Task 5.2: Create Unit Tests for Sync Queue

**Description**: Write unit tests for sync queue operations and retry logic.

**Acceptance Criteria**:
- [ ] Tests for adding/removing queue entries
- [ ] Tests for encryption/decryption
- [ ] Tests for retry logic with exponential backoff
- [ ] Tests for IndexedDB operations
- [ ] Tests for failed action handling
- [ ] Tests for queue clearing
- [ ] Minimum 10 test cases
- [ ] All tests passing

**Dependencies**: Task 2.1 through Task 2.4

**Complexity**: High

**Files to Create**:
- `src/__tests__/syncQueue.test.js`

**Implementation Notes**:
- Mock IndexedDB API
- Mock Web Crypto API
- Test transaction handling
- Test error scenarios

---

### Task 5.3: Create Integration Tests

**Description**: Write end-to-end tests for offline scenarios.

**Acceptance Criteria**:
- [ ] Test: User goes offline → offline indicator appears → cached content accessible
- [ ] Test: User takes action offline → action queued → user goes online → action syncs
- [ ] Test: User clears cache → all offline data removed → new content cached
- [ ] Test: Service Worker updates → old caches deleted → new version active
- [ ] Test: Sync queue persists across page reloads
- [ ] Test: Encryption/decryption works correctly
- [ ] Minimum 6 integration test cases
- [ ] All tests passing

**Dependencies**: All Phase 1-4 tasks

**Complexity**: High

**Files to Create**:
- `src/__tests__/offline.integration.test.js`

**Implementation Notes**:
- Use Cypress or Playwright for E2E testing
- Simulate offline mode using dev tools
- Test across multiple page navigations
- Verify data persistence

---

### Task 5.4: Create Cache Status API Endpoint

**Description**: Implement backend endpoint for cache status and monitoring.

**Acceptance Criteria**:
- [ ] `GET /api/cache-status` endpoint created
- [ ] Returns cache size, count, and TTL information
- [ ] Returns sync queue count and status
- [ ] Returns offline content availability (trivia, flashcards, devotionals, stories counts)
- [ ] Authentication required
- [ ] Response format matches design specification
- [ ] Error handling for database failures

**Dependencies**: Task 2.1

**Complexity**: Medium

**Files to Create**:
- `server/routes/cache.js`

**Implementation Notes**:
- Query IndexedDB from backend (if applicable) or track in separate database
- Implement caching of status endpoint response
- Add rate limiting to prevent abuse

---

### Task 5.5: Create Sync Endpoint

**Description**: Implement backend endpoint for syncing offline actions.

**Acceptance Criteria**:
- [ ] `POST /api/sync-queue` endpoint created
- [ ] Accepts array of offline actions
- [ ] Validates and processes each action
- [ ] Returns success/failure status for each action
- [ ] Handles encryption/decryption of payloads
- [ ] Stores synced data in appropriate database tables
- [ ] Authentication required
- [ ] Error handling for invalid actions

**Dependencies**: Task 2.3

**Complexity**: High

**Files to Create**:
- `server/routes/sync.js`

**Implementation Notes**:
- Implement action type handlers (prayer, note, progress, quiz_result)
- Validate action payloads
- Handle duplicate actions (idempotency)
- Log sync attempts for monitoring

---

### Task 5.6: Create Offline Content Endpoints

**Description**: Implement endpoints for pre-caching offline content.

**Acceptance Criteria**:
- [ ] `GET /api/trivia/offline` returns 100+ trivia questions
- [ ] `GET /api/flashcards/offline` returns 50+ flashcard sets
- [ ] `GET /api/devotionals/offline` returns 30+ devotionals
- [ ] `GET /api/stories/offline` returns 20+ Bible stories
- [ ] Responses include cache hints (TTL, strategy)
- [ ] Responses optimized for offline caching
- [ ] No authentication required (public content)
- [ ] Pagination or chunking for large datasets

**Dependencies**: None (backend task)

**Complexity**: Medium

**Files to Modify**:
- `server/routes/trivia.js`
- `server/routes/flashcards.js`
- `server/routes/devotionals.js`
- `server/routes/stories.js`

**Implementation Notes**:
- Create `/offline` variants of existing endpoints
- Return complete datasets for offline availability
- Include cache headers for Service Worker

---

### Task 5.7: Implement Analytics for Offline Usage

**Description**: Track and report offline mode usage metrics.

**Acceptance Criteria**:
- [ ] Track % of users with Service Worker registered
- [ ] Track % of users with offline content cached
- [ ] Track frequency of offline mode usage
- [ ] Track average offline session duration
- [ ] Track sync queue success/failure rates
- [ ] Track cache hit/miss ratios
- [ ] Analytics events queued offline, sent when online
- [ ] Dashboard or reports showing metrics

**Dependencies**: Task 3.1, Task 5.4

**Complexity**: Medium

**Files to Create**:
- `src/lib/offlineAnalytics.js`

**Implementation Notes**:
- Queue analytics events in IndexedDB when offline
- Send events to analytics service when online
- Track events: offline_mode_enabled, offline_mode_disabled, sync_queue_action_added, sync_queue_action_synced, sync_queue_action_failed, cache_cleared, offline_content_accessed

---

### Task 5.8: Create Manual Testing Checklist

**Description**: Document manual testing procedures for offline functionality.

**Acceptance Criteria**:
- [ ] Checklist created with 20+ test cases
- [ ] Tests cover all major features
- [ ] Tests include offline scenarios
- [ ] Tests include sync scenarios
- [ ] Tests include error scenarios
- [ ] Tests include performance checks
- [ ] Checklist includes steps to reproduce each test
- [ ] Checklist includes expected results

**Dependencies**: All Phase 1-4 tasks

**Complexity**: Low

**Files to Create**:
- `OFFLINE_TESTING.md`

**Implementation Notes**:
- Document steps for simulating offline mode
- Include browser DevTools instructions
- Include console command examples
- Include expected behavior for each scenario

---

## Task Dependencies Graph

```
Phase 1: Service Worker Enhancement
├── Task 1.1: TTL Validation (foundational)
├── Task 1.2: Cache-First Static Assets (depends on 1.1)
├── Task 1.3: Cache-First Core Content (depends on 1.1, 1.2)
├── Task 1.4: Network-First API (depends on 1.1)
├── Task 1.5: LRU Eviction (depends on 1.1)
├── Task 1.6: Fallback Pages (depends on 1.2, 1.3)
└── Task 1.7: Update Detection (depends on 1.2)

Phase 2: IndexedDB Sync Queue
├── Task 2.1: IndexedDB Schema (foundational)
├── Task 2.2: SyncQueueManager (depends on 2.1)
├── Task 2.3: Encryption (depends on 2.2)
└── Task 2.4: Retry Logic (depends on 2.2)

Phase 3: React Integration
├── Task 3.1: OfflineContext (depends on 2.2)
├── Task 3.2: OfflineIndicator (depends on 3.1)
├── Task 3.3: SyncQueueStatusIndicator (depends on 3.1)
├── Task 3.4: Service Worker Registration (depends on 1.7)
├── Task 3.5: App Integration (depends on 3.1, 3.2)
├── Task 3.6: Disable Offline Features (depends on 3.1)
└── Task 3.7: Offline Action Queueing (depends on 2.2, 2.3, 3.1)

Phase 4: Developer Tools
├── Task 4.1: Console Commands (depends on 1.1, 2.2)
└── Task 4.2: Service Worker Logging (depends on 1.1)

Phase 5: Testing & Monitoring
├── Task 5.1: Service Worker Tests (depends on 1.1-1.6)
├── Task 5.2: Sync Queue Tests (depends on 2.1-2.4)
├── Task 5.3: Integration Tests (depends on all Phase 1-4)
├── Task 5.4: Cache Status Endpoint (depends on 2.1)
├── Task 5.5: Sync Endpoint (depends on 2.3)
├── Task 5.6: Offline Content Endpoints (independent)
├── Task 5.7: Analytics (depends on 3.1, 5.4)
└── Task 5.8: Testing Checklist (depends on all)
```

---

## Recommended Implementation Order

**Week 1: Foundation**
1. Task 1.1 - TTL Validation
2. Task 2.1 - IndexedDB Schema
3. Task 3.4 - Service Worker Registration

**Week 2: Caching Strategies**
4. Task 1.2 - Cache-First Static Assets
5. Task 1.3 - Cache-First Core Content
6. Task 1.4 - Network-First API

**Week 3: Sync Queue**
7. Task 2.2 - SyncQueueManager
8. Task 2.3 - Encryption
9. Task 2.4 - Retry Logic

**Week 4: React Integration**
10. Task 3.1 - OfflineContext
11. Task 3.2 - OfflineIndicator
12. Task 3.5 - App Integration

**Week 5: Advanced Features**
13. Task 1.5 - LRU Eviction
14. Task 1.6 - Fallback Pages
15. Task 3.7 - Offline Action Queueing

**Week 6: Developer Tools & Testing**
16. Task 4.1 - Console Commands
17. Task 5.1 - Service Worker Tests
18. Task 5.2 - Sync Queue Tests

**Week 7: Backend & Monitoring**
19. Task 5.4 - Cache Status Endpoint
20. Task 5.5 - Sync Endpoint
21. Task 5.7 - Analytics

**Week 8: Polish & Documentation**
22. Task 1.7 - Update Detection
23. Task 3.3 - SyncQueueStatusIndicator
24. Task 5.8 - Testing Checklist

---

## Success Criteria

All tasks completed when:
- [ ] All 24 tasks have acceptance criteria met
- [ ] All unit tests passing (Tasks 5.1, 5.2)
- [ ] All integration tests passing (Task 5.3)
- [ ] Manual testing checklist completed (Task 5.8)
- [ ] No console errors or warnings in dev mode
- [ ] Service Worker registered and active
- [ ] Offline mode functional with cached content accessible
- [ ] Sync queue working with successful action synchronization
- [ ] Analytics tracking offline usage
- [ ] Documentation complete and up-to-date
