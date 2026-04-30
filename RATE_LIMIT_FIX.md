# Rate Limit Fix - Request Queuing & Smart Caching

## Problem
The app was experiencing 429 (Too Many Requests) errors from the Turso database backend due to a "thundering herd" of simultaneous requests when multiple contexts initialized at app startup.

## Solution
Implemented a comprehensive request management system with three key components:

### 1. Request Queue Manager (`src/lib/requestQueue.js`)
- **Concurrency Control**: Limits concurrent requests to 3 (configurable)
- **Request Queuing**: Queues requests and processes them in priority order
- **Exponential Backoff Retry**: Automatically retries failed requests with exponential backoff
- **Smart Caching**: Caches successful responses with configurable TTL (default 5 minutes)
- **Cache Invalidation**: Automatic expiry and manual clearing support

**Key Features:**
```javascript
requestQueue.execute(cacheKey, asyncFn, {
  cacheable: true,           // Cache the result
  ttl: 5 * 60 * 1000,       // 5 minute cache
  priority: 0                // Higher priority = earlier execution
})
```

### 2. Updated Turso API Layer (`src/lib/turso.js`)
- All database calls now route through the request queue
- Automatic retry logic for 429 errors
- Response caching to reduce redundant queries
- Error handling that doesn't cache failures

### 3. Context Initialization Staggering
Updated all major contexts to use request queuing with priority levels:

**Priority Levels (lower = higher priority):**
- **0**: AuthContext (profile) - Must load first
- **1**: ActivityDashboardContext (recent activities)
- **2**: ChildSwitcherContext (child profiles)
- **3**: ParentalControlsContext (controls)
- **4**: BadgeContext, ScriptureMemoryContext (user data)
- **5**: AdvancedAnalyticsContext (analytics)
- **6**: Memory verses, badges (secondary data)
- **7**: Helper functions (lowest priority)

## Updated Contexts

### AuthContext
- Profile loading uses priority 0 (highest)
- Profile refresh bypasses cache for fresh data

### ActivityDashboardContext
- Recent activities: priority 2, 2-min cache
- Activity stats: priority 1, 2-min cache
- Streak data: priority 3, 10-min cache

### AdvancedAnalyticsContext
- Learning patterns: priority 5, 10-min cache
- Progress insights: priority 5, 10-min cache
- Performance metrics: priority 5, 10-min cache
- Trends: priority 5, 10-min cache
- Helper functions: priority 7, 5-min cache

### BadgeContext
- Badge loading: priority 4, 10-min cache

### ScriptureMemoryContext
- Memory verses: priority 4, 10-min cache

### ChildSwitcherContext
- Child profiles: priority 2, 15-min cache

### ParentalControlsContext
- Parental controls: priority 3, 15-min cache

## Benefits

1. **Eliminates Rate Limiting**: Staggered requests prevent thundering herd
2. **Reduces Database Load**: Smart caching eliminates redundant queries
3. **Faster App Startup**: Prioritized loading ensures critical data loads first
4. **Better UX**: Automatic retries handle transient failures gracefully
5. **Configurable**: Easy to adjust concurrency, retry attempts, and cache TTLs

## Cache TTLs

- **Short (1-2 min)**: Activity data that changes frequently
- **Medium (5-10 min)**: User data, analytics, badges
- **Long (15-20 min)**: Profile, child profiles, parental controls

## Monitoring

Check request queue stats in browser console:
```javascript
import { requestQueue } from './lib/requestQueue'
console.log(requestQueue.getStats())
// { queueLength: 0, activeRequests: 0, cacheSize: 12 }
```

## Future Improvements

1. Add request queue metrics to admin dashboard
2. Implement adaptive concurrency based on response times
3. Add cache warming for critical data
4. Implement request deduplication for identical queries
5. Add circuit breaker pattern for failing endpoints
