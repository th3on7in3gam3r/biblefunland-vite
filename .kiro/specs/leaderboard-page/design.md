# Design Document: Leaderboard Page

## Overview

The Leaderboard Page is a publicly accessible social feature at `/leaderboard` that surfaces existing user data — streaks, badges, and trivia scores — into three ranked boards. It adds social motivation by celebrating top performers across the community.

Key clarifications incorporated:
- "Trivia Champions" mixes ALL users (not just child profiles). Because the Trivia page currently does **not** write to `child_activity`, this feature adds that tracking on quiz completion.
- The nav link appears in the **More dropdown** (desktop), the **"Community & Prayer"** section of the mobile drawer, and the **Features column** of the Footer.

---

## Architecture

```
Browser                     Express Server              Turso (libsql)
──────────────────────────  ──────────────────────────  ──────────────
Leaderboard.jsx
  ├─ fetch /api/leaderboard/:category?userId=…
  │                         leaderboard.js route
  │                           ├─ check in-memory cache (5 min TTL)
  │                           ├─ query streaks / badges / child_activity
  │                           ├─ JOIN profiles / child_profiles
  │                           ├─ if userId provided → fetch rank outside top 25
  │                           └─ return JSON array
  ├─ Podium (top 3)
  └─ LeaderboardRow list (4–25 + pinned current user)

Trivia.jsx (modified)
  └─ on quiz completion → POST /api/db/execute (addChildActivity)
```

### Caching Strategy

A simple in-memory Map on the server holds cached responses keyed by category. Each entry stores `{ data, expiresAt }`. On every request the handler checks `Date.now() < expiresAt`; if stale it re-queries and refreshes the entry. TTL is 5 minutes (300 000 ms). This is intentionally simple — no Redis dependency — and is sufficient for a leaderboard that doesn't need real-time accuracy.

```
cache = Map {
  'streaks' → { data: [...], expiresAt: timestamp },
  'badges'  → { data: [...], expiresAt: timestamp },
  'trivia'  → { data: [...], expiresAt: timestamp },
}
```

The current-user pinned entry is **never cached** — it is appended after the cache lookup so each authenticated request gets a fresh rank for the requesting user.

---

## Components and Interfaces

### `src/pages/Leaderboard.jsx`

Top-level page component. Owns tab state, fetch lifecycle, and current-user detection.

```
props: none (reads useAuth() internally)

state:
  activeTab: 'streaks' | 'badges' | 'trivia'   // default 'streaks'
  data: LeaderboardEntry[]
  loading: boolean
  error: string | null
  pinnedUser: LeaderboardEntry | null            // current user if outside top 25

effects:
  useEffect on activeTab → fetch /api/leaderboard/:activeTab?userId=…
```

### `src/components/Podium.jsx`

Renders the top-3 entries in a visual podium layout. 2nd place is on the left, 1st in the center (taller), 3rd on the right — classic Olympic podium order.

```
props:
  entries: LeaderboardEntry[]   // first 3 items of the ranked list
  category: 'streaks' | 'badges' | 'trivia'
```

Responsive: on mobile the three columns stack into a single centered column ordered 1st → 2nd → 3rd.

### `src/components/LeaderboardRow.jsx`

Renders a single ranked entry in the list (ranks 4–25, plus the pinned current-user row).

```
props:
  entry: LeaderboardEntry
  isCurrentUser: boolean        // triggers highlight styling
  isPinned: boolean             // renders separator + "Your rank" label
  category: 'streaks' | 'badges' | 'trivia'
```

### API Client Helper (inline in Leaderboard.jsx)

```js
async function fetchLeaderboard(category, userId) {
  const params = userId ? `?userId=${userId}` : ''
  const res = await fetch(`${API_URL}/api/leaderboard/${category}${params}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()  // { entries: LeaderboardEntry[], currentUser?: LeaderboardEntry }
}
```

---

## Data Models

### `LeaderboardEntry` (API response shape)

```ts
{
  rank: number           // 1-based ordinal
  userId: string         // user_id or child_id (never exposed in UI)
  displayName: string    // "Anonymous" if null/empty
  avatarUrl: string      // emoji key or image URL
  score: number          // streak days | badge count | quiz count
  isLegendary?: boolean  // badges category only — has a 'legendary' badge_id
}
```

### API Response Envelope

```ts
{
  entries: LeaderboardEntry[]          // top 25
  currentUser?: LeaderboardEntry       // only present when userId param provided and user exists
}
```

### Database Queries (server-side)

**Streaks** — joins `streaks` with `profiles`:
```sql
SELECT
  s.user_id,
  COALESCE(NULLIF(TRIM(p.display_name), ''), 'Anonymous') AS display_name,
  p.avatar_url,
  s.streak AS score
FROM streaks s
LEFT JOIN profiles p ON p.id = s.user_id
ORDER BY s.streak DESC
LIMIT 25
```

**Badges** — groups `badges`, joins `profiles`:
```sql
SELECT
  b.user_id,
  COALESCE(NULLIF(TRIM(p.display_name), ''), 'Anonymous') AS display_name,
  p.avatar_url,
  COUNT(b.badge_id) AS score,
  MAX(CASE WHEN b.badge_id LIKE '%legendary%' THEN 1 ELSE 0 END) AS is_legendary
FROM badges b
LEFT JOIN profiles p ON p.id = b.user_id
GROUP BY b.user_id
ORDER BY score DESC
LIMIT 25
```

**Trivia** — groups `child_activity` (quiz type), joins `profiles` first then `child_profiles` as fallback. Because the clarification states Trivia Champions should mix ALL users, the query unions both tables:
```sql
SELECT
  ca.child_id AS user_id,
  COALESCE(
    NULLIF(TRIM(cp.display_name), ''),
    NULLIF(TRIM(p.display_name), ''),
    'Anonymous'
  ) AS display_name,
  COALESCE(cp.avatar_url, p.avatar_url) AS avatar_url,
  COUNT(*) AS score
FROM child_activity ca
LEFT JOIN child_profiles cp ON cp.id = ca.child_id
LEFT JOIN profiles p ON p.id = ca.child_id
WHERE ca.activity_type = 'quiz'
GROUP BY ca.child_id
ORDER BY score DESC
LIMIT 25
```

### Trivia Score Write (Trivia.jsx modification)

When `phase` transitions to `'results'`, call `addChildActivity` from `src/lib/db.js`:

```js
// In the answer() function, when n >= qs.length (quiz complete):
import { addChildActivity } from '../lib/db'
import { useAuth } from '../context/AuthContext'

// Inside component:
const { user } = useAuth()

// After setPhase('results'):
if (user?.id) {
  addChildActivity(user.id, 'quiz', { score, correct, difficulty }, 0)
    .catch(err => console.warn('Activity tracking failed:', err))
}
```

`addChildActivity` already handles the case where the `child_activity` table doesn't exist (returns `{ success: false }` silently). The `child_id` column accepts both child profile IDs and regular user IDs — the trivia leaderboard query joins both `child_profiles` and `profiles` to resolve display names.

---

## Navigation Integration

### Desktop — More Dropdown (`Nav.jsx`)

Add to `MORE_LINKS` array:
```js
{ to: '/leaderboard', label: '🏆 Leaderboard' },
```
Position: after the existing Prayer Wall entry (community-adjacent).

### Mobile Drawer — Community & Prayer section (`Nav.jsx`)

Add to the `'Community & Prayer'` section in `DRAWER_SECTIONS`:
```js
{ to: '/leaderboard', label: '🏆 Leaderboard' },
```

### Footer — Features column (`Footer.jsx`)

Add after the Prayer Wall entry:
```jsx
<li><Link to="/leaderboard">🏆 Leaderboard</Link></li>
```

### App Router (`App.jsx`)

Add lazy import and route:
```js
const Leaderboard = lazy_(() => import('./pages/Leaderboard'))
// ...
<Route path="/leaderboard" element={<SP c={Leaderboard}/>}/>
```

---

## Current User Highlight & Pinned Rank

When a user is authenticated, their `user.id` is passed as `?userId=…` to the API. The server:

1. Runs the normal top-25 query.
2. Checks if the user appears in the result set.
3. If **not** in top 25, runs a second query to find their rank and entry, then appends it to the response as `currentUser`.

The frontend:
- Highlights any row where `entry.userId === user.id` with a distinct background (CSS class `rowHighlight`).
- If `currentUser` is present and not already in the top-25 list, renders a `LeaderboardRow` with `isPinned={true}` below a visual separator ("— Your Rank —").

---

## Mobile-Responsive Layout

### Podium

```
Desktop (≥ 640px):
  [2nd]  [1st]  [3rd]
  (80px) (96px) (80px) avatar sizes

Mobile (< 640px):
  [1st]
  [2nd]
  [3rd]
  stacked, full-width cards
```

### Ranked List

Standard vertical list on all breakpoints. Avatar + name truncate with `text-overflow: ellipsis` on narrow screens. Score value is right-aligned and never truncated.

### Tab Bar

Horizontal scrollable tab strip on mobile so all three tabs are reachable without wrapping.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| API returns non-200 | Show inline error message + "Retry" button that re-triggers the fetch |
| Network offline | Same error UI; OfflineIndicator (existing component) handles global banner |
| Invalid `:category` param | Server returns `400 { error: "Invalid category. Use: streaks, badges, trivia" }` |
| Empty leaderboard (no data) | Show "No entries yet — be the first!" empty state per tab |
| `display_name` null/empty | Server substitutes "Anonymous" before returning |
| `addChildActivity` fails in Trivia | Silent catch — score write is best-effort, never blocks the results screen |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Top-25 Ordering Invariant

*For any* set of records in the streaks, badges, or trivia category, the API response must contain at most 25 entries and they must be ordered by score descending (highest first).

**Validates: Requirements 3.1, 4.1, 5.1**

### Property 2: Entry Render Completeness

*For any* leaderboard entry (with any combination of rank, avatarUrl, displayName, and score), the rendered `LeaderboardRow` output must contain the rank number, the avatar, the display name, the score value, and the category-appropriate emoji (🔥 for streaks, 🏆 for badges, 🎯 for trivia).

**Validates: Requirements 3.2, 3.3, 4.2, 4.3, 5.2, 5.3**

### Property 3: Anonymous Substitution

*For any* leaderboard entry where `display_name` is null, an empty string, or a string composed entirely of whitespace, both the API response and the rendered UI must show the string "Anonymous" in place of the display name.

**Validates: Requirements 3.4, 4.5, 5.4, 9.1**

### Property 4: Legendary Crown Indicator

*For any* badges leaderboard entry where `is_legendary` is true, the rendered `LeaderboardRow` must include the 👑 crown indicator adjacent to the display name. For any entry where `is_legendary` is false or absent, the crown must not appear.

**Validates: Requirements 4.4**

### Property 5: Podium Receives Top-3

*For any* leaderboard data array of length N, the `Podium` component must receive exactly `min(N, 3)` entries, and those entries must be the first three items of the ranked list. When N < 3, only the available positions are rendered and no empty podium slots appear.

**Validates: Requirements 6.1, 6.4**

### Property 6: Current User Row Highlighted

*For any* authenticated user whose `userId` matches an entry in the leaderboard list, that entry's `LeaderboardRow` must receive `isCurrentUser={true}` and all other rows must receive `isCurrentUser={false}`.

**Validates: Requirements 7.1**

### Property 7: Out-of-Range User Pinned

*For any* authenticated user whose `userId` does not appear in the top-25 entries, the page must render an additional `LeaderboardRow` with `isPinned={true}` below the main list, showing the user's actual rank and score as returned by the API's `currentUser` field.

**Validates: Requirements 7.2**

### Property 8: Unauthenticated — No Highlight

*For any* render of the leaderboard page where no user is authenticated, every `LeaderboardRow` must receive `isCurrentUser={false}` and no pinned row must be rendered.

**Validates: Requirements 7.3**

### Property 9: Cache Prevents Duplicate DB Calls

*For any* sequence of two or more API requests for the same category within the 5-minute TTL window, the underlying database query function must be called exactly once (subsequent requests are served from cache).

**Validates: Requirements 8.4**

### Property 10: Out-of-Range UserId Included in API Response

*For any* valid category request that includes a `userId` query parameter where that user's rank is greater than 25, the API response must include a `currentUser` field containing the user's rank, displayName, avatarUrl, and score.

**Validates: Requirements 8.5**

### Property 11: No PII in Rendered Output

*For any* leaderboard entry (regardless of what fields the raw API response contains), the rendered HTML must not contain any string matching an email address pattern (`@`) or a raw UUID pattern, ensuring user IDs and emails are never exposed in the UI.

**Validates: Requirements 9.2**

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:
- Unit tests catch concrete bugs at specific examples and integration points.
- Property tests verify universal invariants across many generated inputs.

### Unit Tests (specific examples & integration)

- Route renders at `/leaderboard` without authentication (Req 1.1, 1.2)
- Default tab is "Top Streaks" on mount (Req 2.3)
- Loading indicator appears while fetch is in-flight (Req 2.4)
- Error message + retry button shown when API returns 500 (Req 1.4)
- All three tab labels present in the DOM (Req 2.1)
- Nav contains a link to `/leaderboard` (Req 10.1)
- Leaderboard page contains a link to `/` (Req 10.2)
- API returns 400 for invalid category (Req 8.3)
- Trivia.jsx calls `addChildActivity` on quiz completion when user is authenticated

### Property-Based Tests

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (TypeScript/JavaScript)

Each property test runs a minimum of **100 iterations**.

Each test is tagged with a comment in the format:
`// Feature: leaderboard-page, Property N: <property text>`

| Test | Property | fast-check Arbitraries |
|---|---|---|
| Top-25 ordering | P1 | `fc.array(fc.record({ userId: fc.uuid(), score: fc.integer() }), { minLength: 0, maxLength: 200 })` |
| Entry render completeness | P2 | `fc.record({ rank: fc.integer({min:1}), displayName: fc.string(), avatarUrl: fc.string(), score: fc.integer({min:0}), isLegendary: fc.boolean() })` |
| Anonymous substitution | P3 | `fc.oneof(fc.constant(null), fc.constant(''), fc.stringOf(fc.constant(' ')))` for displayName |
| Legendary crown | P4 | `fc.boolean()` for is_legendary field |
| Podium top-3 | P5 | `fc.array(fc.record({...}), { minLength: 0, maxLength: 25 })` |
| Current user highlight | P6 | `fc.array(fc.record({userId: fc.uuid(), ...}), {minLength:1, maxLength:25})` + pick random index as currentUserId |
| Out-of-range pinned | P7 | Generate list of 25 entries with UUIDs that don't include a separate currentUserId |
| Unauthenticated no highlight | P8 | `fc.array(fc.record({...}), {minLength:0, maxLength:25})` rendered with `user=null` |
| Cache deduplication | P9 | Mock DB query function, call handler 2–10 times, assert mock called once |
| Out-of-range userId in response | P10 | Generate DB rows where userId not in top 25, assert `currentUser` present |
| No PII in render | P11 | `fc.record({ userId: fc.uuid(), email: fc.emailAddress(), displayName: fc.string(), ... })` |

### Property Test Configuration

```js
// Example — Property 1
// Feature: leaderboard-page, Property 1: top-25 ordering invariant
fc.assert(
  fc.property(
    fc.array(fc.record({ userId: fc.uuid(), score: fc.nat() }), { maxLength: 200 }),
    (rows) => {
      const result = applyTopN(rows, 25)
      if (result.length > 25) return false
      for (let i = 1; i < result.length; i++) {
        if (result[i].score > result[i - 1].score) return false
      }
      return true
    }
  ),
  { numRuns: 100 }
)
```
