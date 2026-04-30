---
inclusion: manual
---

# Rate Limiting & Request Queue System

## Overview
This project uses a request queue system to prevent rate limiting errors (429 Too Many Requests) from the Turso database backend.

## How It Works

### Request Queue Flow
1. Request enters queue with priority level
2. Queue processes up to 3 concurrent requests
3. If request fails with 429, retry with exponential backoff
4. Successful responses are cached
5. Subsequent identical requests return cached data

### Priority System
Contexts initialize in priority order to prevent thundering herd:

```
AuthContext (0) 
  ↓
ChildSwitcherContext (2)
  ↓
ParentalControlsContext (3)
  ↓
ActivityDashboardContext (1-3)
  ↓
BadgeContext, ScriptureMemoryContext (4)
  ↓
AdvancedAnalyticsContext (5-7)
```

## Using the Request Queue

### In Contexts
```javascript
import { requestQueue } from '../lib/requestQueue'

// In useEffect or async function
const result = await requestQueue.execute(
  'unique-cache-key',
  () => db.getChildActivity(userId, 50),
  { 
    priority: 2,           // Higher priority = earlier execution
    cacheable: true,       // Cache the result
    ttl: 2 * 60 * 1000    // 5 minute cache
  }
)
```

### Cache Keys
Use descriptive cache keys that include the operation and parameters:
- `profile:${userId}` - User profile
- `child-profiles:${userId}` - Child profiles for parent
- `activity-stats-week:${userId}` - Weekly activity stats
- `badges:${userId}` - User badges

### Priority Guidelines
- **0-1**: Critical data (auth, profiles)
- **2-3**: Parent/child relationship data
- **4-5**: User activity and analytics
- **6-7**: Secondary/helper data

## Cache TTLs

| Data Type | TTL | Reason |
|-----------|-----|--------|
| Profile | 20 min | Rarely changes |
| Child profiles | 15 min | Rarely changes |
| Parental controls | 15 min | Rarely changes |
| Memory verses | 10 min | Moderate changes |
| Badges | 10 min | Moderate changes |
| Learning patterns | 10 min | Moderate changes |
| Activity stats | 2-5 min | Frequently updated |
| Recent activities | 2 min | Real-time data |

## Troubleshooting

### Still Getting 429 Errors?
1. Check if concurrency limit is too high (default: 3)
2. Verify cache TTLs aren't too short
3. Check if new contexts are bypassing the queue
4. Monitor queue stats: `requestQueue.getStats()`

### Cache Not Working?
1. Verify `cacheable: true` is set
2. Check cache key is consistent
3. Ensure TTL is long enough
4. Clear cache if needed: `requestQueue.clearCache()`

### Performance Issues?
1. Increase concurrency limit (currently 3)
2. Increase cache TTLs for stable data
3. Add more priority levels for better ordering
4. Profile with `requestQueue.getStats()`

## Adding New Contexts

When adding a new context that makes database calls:

1. Import requestQueue:
```javascript
import { requestQueue } from '../lib/requestQueue'
```

2. Wrap database calls:
```javascript
const result = await requestQueue.execute(
  `context-data:${userId}`,
  () => db.getData(userId),
  { priority: 5, cacheable: true, ttl: 10 * 60 * 1000 }
)
```

3. Choose appropriate priority based on dependency order

4. Set cache TTL based on data volatility

## Monitoring

### Browser Console
```javascript
import { requestQueue } from './lib/requestQueue'

// Check queue status
console.log(requestQueue.getStats())

// Clear cache if needed
requestQueue.clearCache()

// Clear specific cache entry
requestQueue.clearCache('profile:user123')
```

### Metrics to Watch
- `queueLength`: Number of pending requests
- `activeRequests`: Currently executing requests
- `cacheSize`: Number of cached entries

## Best Practices

1. **Always use cache keys** - Enables deduplication
2. **Set appropriate TTLs** - Balance freshness vs. load
3. **Use priorities** - Ensure critical data loads first
4. **Handle errors gracefully** - Queue handles retries, but UI should show loading states
5. **Monitor cache size** - Large caches can cause memory issues
6. **Test with slow networks** - Verify retry logic works

## Related Files
- `src/lib/requestQueue.js` - Queue implementation
- `src/lib/turso.js` - Database API layer
- `src/context/*.jsx` - Updated contexts using queue
