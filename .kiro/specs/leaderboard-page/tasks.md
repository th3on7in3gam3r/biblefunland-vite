# Implementation Plan: Leaderboard Page

## Overview

Implement the community leaderboard at `/leaderboard` — a server route with in-memory caching, a React page with podium + ranked list, trivia score tracking, and navigation integration across Nav, Footer, and App router.

## Tasks

- [x] 1. Create `server/routes/leaderboard.js` — GET `/api/leaderboard/:category`
  - [x] 1.1 Implement the route file with in-memory 5-minute cache (Map keyed by category)
    - Declare `const cache = new Map()` at module scope with `{ data, expiresAt }` entries
    - Validate `:category` against `['streaks', 'badges', 'trivia']`; return 400 with descriptive message on invalid
    - On cache hit (`Date.now() < expiresAt`) return cached `entries` immediately
    - On cache miss run the appropriate SQL query via `query()` from `../lib/turso`
    - Map raw rows to `LeaderboardEntry` shape: `{ rank, userId, displayName, avatarUrl, score, isLegendary? }`
    - Substitute null/empty/whitespace-only `display_name` with `"Anonymous"` before storing in cache
    - Store result in cache with `expiresAt = Date.now() + 300_000`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1_

  - [x] 1.2 Implement the three SQL queries (streaks, badges, trivia)
    - Streaks: `SELECT s.user_id, COALESCE(NULLIF(TRIM(p.display_name),''),'Anonymous') AS display_name, p.avatar_url, s.streak AS score FROM streaks s LEFT JOIN profiles p ON p.id = s.user_id ORDER BY s.streak DESC LIMIT 25`
    - Badges: GROUP BY `user_id`, COUNT badge_id, MAX legendary flag, JOIN profiles
    - Trivia: GROUP BY `child_id` WHERE `activity_type = 'quiz'`, LEFT JOIN child_profiles then profiles for display name fallback
    - _Requirements: 3.1, 4.1, 5.1_

  - [x] 1.3 Implement current-user rank support (`?userId=` query param)
    - After building the top-25 entries, check if `userId` appears in the list
    - If not found, run a second query to determine the user's rank (COUNT of users with higher score + 1) and their entry
    - Append as `currentUser` field in the response envelope: `{ entries: [...], currentUser?: {...} }`
    - The `currentUser` lookup is never cached — computed fresh per request
    - _Requirements: 8.5, 7.2_

  - [ ]* 1.4 Write property test for top-25 ordering invariant (Property 1)
    - **Property 1: Top-25 Ordering Invariant** — result length ≤ 25 and scores are non-increasing
    - **Validates: Requirements 3.1, 4.1, 5.1**
    - Use `fc.array(fc.record({ userId: fc.uuid(), score: fc.nat() }), { maxLength: 200 })`
    - Extract and test the `applyTopN` sorting logic in isolation

  - [ ]* 1.5 Write property test for anonymous substitution (Property 3)
    - **Property 3: Anonymous Substitution** — null, `''`, or whitespace-only display_name → `"Anonymous"`
    - **Validates: Requirements 3.4, 4.5, 5.4, 9.1**
    - Use `fc.oneof(fc.constant(null), fc.constant(''), fc.stringOf(fc.constant(' ')))`

  - [ ]* 1.6 Write property test for cache deduplication (Property 9)
    - **Property 9: Cache Prevents Duplicate DB Calls** — DB query called exactly once for N requests within TTL
    - **Validates: Requirements 8.4**
    - Mock the `query` function; call the handler 2–10 times; assert mock called once

  - [ ]* 1.7 Write property test for out-of-range userId in response (Property 10)
    - **Property 10: Out-of-Range UserId Included in API Response** — `currentUser` present when user rank > 25
    - **Validates: Requirements 8.5**

- [x] 2. Mount leaderboard route in `server/index.js`
  - Add `app.use('/api/leaderboard', require('./routes/leaderboard'))` after the existing `/api/db` line
  - No special rate limiter needed (reads only, already covered by `apiLimiter`)
  - _Requirements: 8.1_

- [x] 3. Create `src/components/LeaderboardRow.jsx`
  - [x] 3.1 Implement `LeaderboardRow` component
    - Props: `entry` (LeaderboardEntry), `isCurrentUser: boolean`, `isPinned: boolean`, `category: string`
    - Render rank number, avatar (emoji or `<img>`), display name, score with category emoji (🔥 streaks / 🏆 badges / 🎯 trivia)
    - Render 👑 crown adjacent to display name when `entry.isLegendary === true` (badges category)
    - Apply `rowHighlight` CSS class when `isCurrentUser` is true
    - When `isPinned` is true render a visual separator ("— Your Rank —") above the row
    - Truncate long display names with `text-overflow: ellipsis`; score is right-aligned and never truncated
    - _Requirements: 3.2, 3.3, 4.2, 4.3, 4.4, 5.2, 5.3, 7.1, 7.2_

  - [ ]* 3.2 Write property test for entry render completeness (Property 2)
    - **Property 2: Entry Render Completeness** — rendered output contains rank, avatar, display name, score, and category emoji
    - **Validates: Requirements 3.2, 3.3, 4.2, 4.3, 5.2, 5.3**
    - Use `fc.record({ rank: fc.integer({min:1}), displayName: fc.string(), avatarUrl: fc.string(), score: fc.integer({min:0}), isLegendary: fc.boolean() })`

  - [ ]* 3.3 Write property test for legendary crown indicator (Property 4)
    - **Property 4: Legendary Crown Indicator** — 👑 present iff `isLegendary === true`
    - **Validates: Requirements 4.4**
    - Use `fc.boolean()` for `isLegendary`

  - [ ]* 3.4 Write property test for current user highlight (Property 6)
    - **Property 6: Current User Row Highlighted** — exactly one row gets `isCurrentUser=true`, all others false
    - **Validates: Requirements 7.1**

  - [ ]* 3.5 Write property test for unauthenticated no highlight (Property 8)
    - **Property 8: Unauthenticated — No Highlight** — all rows receive `isCurrentUser=false` when `user=null`
    - **Validates: Requirements 7.3**

  - [ ]* 3.6 Write property test for no PII in rendered output (Property 11)
    - **Property 11: No PII in Rendered Output** — rendered HTML contains no `@` or raw UUID pattern
    - **Validates: Requirements 9.2**
    - Use `fc.record({ userId: fc.uuid(), displayName: fc.string(), ... })`

- [x] 4. Create `src/components/Podium.jsx`
  - [x] 4.1 Implement `Podium` component
    - Props: `entries: LeaderboardEntry[]` (first 3), `category: string`
    - Desktop layout: 2nd left (80px avatar), 1st center taller (96px avatar), 3rd right (80px avatar)
    - Mobile layout (`< 640px`): stacked full-width cards ordered 1st → 2nd → 3rd
    - Display 🥇 🥈 🥉 medal icons for positions 1, 2, 3 respectively
    - Render only available positions when `entries.length < 3` — no empty slots
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 4.2 Write property test for podium receives top-3 (Property 5)
    - **Property 5: Podium Receives Top-3** — Podium receives exactly `min(N, 3)` entries, always the first three of the ranked list
    - **Validates: Requirements 6.1, 6.4**
    - Use `fc.array(fc.record({...}), { minLength: 0, maxLength: 25 })`

- [x] 5. Create `src/pages/Leaderboard.jsx`
  - [x] 5.1 Implement page shell with tab state and fetch logic
    - Import `useAuth` from `../context/AuthContext`
    - State: `activeTab` (default `'streaks'`), `data`, `loading`, `error`, `pinnedUser`
    - `useEffect` on `activeTab` → call `fetchLeaderboard(activeTab, user?.id)` and update state
    - Show `<PageLoader/>` (from `../components/Skeleton`) while loading
    - Show inline error message + "Retry" button on fetch failure (re-triggers the effect)
    - Show "No entries yet — be the first!" empty state when `data.entries` is empty
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 2.4_

  - [x] 5.2 Implement tab switcher UI
    - Horizontal scrollable tab strip with three buttons: "Top Streaks", "Most Badges", "Trivia Champions"
    - Active tab visually distinguished; clicking a tab sets `activeTab` and triggers fetch
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 5.3 Wire `Podium` and `LeaderboardRow` list into the page
    - Pass `data.entries.slice(0, 3)` to `<Podium>`
    - Render `LeaderboardRow` for entries at index 3–24 (ranks 4–25)
    - Set `isCurrentUser={entry.userId === user?.id}` on each row
    - If `data.currentUser` exists and is not already in the top-25 list, render a pinned `<LeaderboardRow isPinned={true}>` below the list
    - Include a "← Home" link for Req 10.2
    - _Requirements: 6.1, 7.1, 7.2, 7.3, 10.2_

  - [ ]* 5.4 Write property test for out-of-range user pinned row (Property 7)
    - **Property 7: Out-of-Range User Pinned** — pinned row rendered with `isPinned=true` when `currentUser` not in top-25
    - **Validates: Requirements 7.2**

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Add trivia score tracking to `src/pages/Trivia.jsx`
  - [x] 7.1 Import `addChildActivity` from `../lib/db` and `useAuth` from `../context/AuthContext`
    - Add `const { user } = useAuth()` inside the component
    - _Requirements: 5.1_

  - [x] 7.2 Call `addChildActivity` when quiz completes
    - In the `answer()` function, inside the `setTimeout` callback where `setPhase('results')` is called, add:
      ```js
      if (user?.id) {
        addChildActivity(user.id, 'quiz', { score, correct, difficulty }, 0)
          .catch(err => console.warn('Activity tracking failed:', err))
      }
      ```
    - The call is fire-and-forget — never block the results screen
    - _Requirements: 5.1_

- [x] 8. Add `/leaderboard` route to `src/App.jsx`
  - Add lazy import: `const Leaderboard = lazy_(() => import('./pages/Leaderboard'))`
  - Add route in the Community section: `<Route path="/leaderboard" element={<SP c={Leaderboard}/>}/>`
  - _Requirements: 1.1, 1.2_

- [x] 9. Update `src/components/Nav.jsx` — add leaderboard link
  - [x] 9.1 Add to `MORE_LINKS` array (after the Prayer Wall entry):
    ```js
    { to: '/leaderboard', label: '🏆 Leaderboard' },
    ```
    - _Requirements: 10.1_

  - [x] 9.2 Add to `DRAWER_SECTIONS` "Community & Prayer" items array:
    ```js
    { to: '/leaderboard', label: '🏆 Leaderboard' },
    ```
    - _Requirements: 10.1_

- [x] 10. Update `src/components/Footer.jsx` — add leaderboard link
  - In the Features column `<ul>`, add after the Prayer Wall `<li>`:
    ```jsx
    <li><Link to="/leaderboard">🏆 Leaderboard</Link></li>
    ```
  - _Requirements: 10.1_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with a minimum of 100 iterations each
- The `currentUser` pinned entry is never cached — always computed fresh per authenticated request
- `addChildActivity` in Trivia is best-effort; failures are silently caught and never block the UI
- The leaderboard route requires no auth middleware — it is publicly accessible
