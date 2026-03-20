# Implementation Plan: Parents & Teachers Profiles

## Overview

Implement the family-oriented profile layer on top of the existing Clerk auth and Turso/SQLite stack. Work proceeds in six incremental phases: backend enforcement routes → age/role profile fields → child profile management → parental controls panel → Parents & Teachers content hub → family devotionals and progress reports. Each phase wires into the previous one so there is no orphaned code.

## Tasks

- [ ] 1. Add Express backend enforcement routes
  - [ ] 1.1 Create `server/routes/profiles.js` with age-lock and role-validation endpoints
    - `POST /api/profiles/:userId/age` — sets age; rejects if `is_age_locked = 1` (403 `age_locked`)
    - `PATCH /api/profiles/:userId/role` — validates role enum `{General,Parent,Teacher}`; rejects Parent/Teacher if age < 13 (403 `role_restricted_by_age`)
    - All handlers read/write Turso via the same `query`/`execute` helpers used in `src/lib/turso.js`
    - Return `{ error: string, detail?: string }` shape on all failures
    - _Requirements: 1.6, 8.1, 8.6_

  - [ ] 1.2 Create `server/routes/children.js` with child CRUD endpoints
    - `GET /api/children/:parentId` — list child profiles
    - `POST /api/children/:parentId` — create child; enforce max-6 (409 `child_limit_reached`)
    - `DELETE /api/children/:parentId/:childId` — require `pin` in request body; cascade-delete activity; reject wrong PIN (403 `invalid_pin`)
    - _Requirements: 4.2, 4.3, 4.4, 4.8, 4.9_

  - [ ] 1.3 Create `server/routes/parentalControls.js` with PIN-gated controls endpoints
    - `GET /api/parental-controls/:parentId`
    - `PUT /api/parental-controls/:parentId` — require `pin` in body; validate `daily_limit` ∈ {0,15,30,45,60} (400 `invalid_daily_limit`)
    - `GET /api/progress/:childId?period=7d|30d|all` — assemble progress report by joining `child_activity`, `streaks`, `badges`
    - _Requirements: 5.2, 5.5, 5.7, 7.1, 7.3_

  - [ ] 1.4 Register new routes in `server/index.js`
    - Mount `profiles`, `children`, `parentalControls` routers after `express.json()`
    - _Requirements: 1.6, 4.3, 5.7_

- [ ] 2. Checkpoint — verify backend routes respond correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Extend `src/lib/db.js` with missing data helpers
  - [ ] 3.1 Add `getProgressReport(childId, period)` function
    - Joins `child_activity`, `streaks`, `badges` for the given child and period
    - Returns `{ streak, totalDaysRead, badgesEarned, quizzesCompleted, quizAccuracy, activities[] }`
    - Period filter: `7d` = last 7 days, `30d` = last 30 days, `all` = no date filter
    - _Requirements: 7.1, 7.3_

  - [ ]* 3.2 Write property test for `getProgressReport` time-period filter
    - **Property 22: Progress report contains all required fields and respects time filter**
    - **Validates: Requirements 7.1, 7.3**

  - [ ] 3.3 Add `deleteChildProfileCascade(childId, parentId)` that deletes profile + activity in a transaction
    - _Requirements: 4.8_

  - [ ]* 3.4 Write property test for child profile deletion cascade
    - **Property 13: Child profile deletion cascades activity data**
    - **Validates: Requirements 4.8**

- [ ] 4. Update `KidsModeContext` to expose `enableKidsMode` and enforce age-lock on disable
  - [ ] 4.1 Export `enableKidsMode` from `KidsModeContext` so external callers (Profile.jsx, ChildSwitcherContext) can activate Kids Mode without going through `requestToggle`
    - Add `enableKidsMode` to the context value object
    - _Requirements: 2.1, 2.2_

  - [ ] 4.2 Harden the `requestToggle('disable')` path: if `profile.age < 13`, show PIN modal and never deactivate without correct PIN
    - _Requirements: 2.4, 2.5_

  - [ ]* 4.3 Write property test for Kids Mode PIN gate for under-13 users
    - **Property 5: Kids Mode PIN gate for under-13 users**
    - **Validates: Requirements 2.4, 2.5**

  - [ ]* 4.4 Write property test for adult toggle freedom
    - **Property 6: Adult users can toggle Kids Mode freely**
    - **Validates: Requirements 2.6**

- [ ] 5. Update `Profile.jsx` — age input with lock, role selector, auto Kids Mode
  - [ ] 5.1 Harden the `AgeInput` block: add client-side validation rejecting values outside [1, 120]; show inline error; disable input when `is_age_locked = 1`
    - Call the new `POST /api/profiles/:userId/age` endpoint on save (in addition to `db.upsertProfile`) so the backend enforces the lock
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 5.2 Write property test for age persistence round-trip
    - **Property 1: Age persistence round-trip**
    - **Validates: Requirements 1.1, 1.4**

  - [ ]* 5.3 Write property test for age validation rejection
    - **Property 2: Age validation rejects out-of-range values**
    - **Validates: Requirements 1.3**

  - [ ]* 5.4 Write property test for age lock immutability
    - **Property 3: Age lock is immutable**
    - **Validates: Requirements 1.5, 1.6**

  - [ ] 5.5 Update `RoleSelector` block: hide Parent/Teacher buttons when `profile.age < 13`; call `PATCH /api/profiles/:userId/role` on save
    - _Requirements: 8.1, 8.2, 8.5, 8.6_

  - [ ]* 5.6 Write property test for role enum validation
    - **Property 24: Role field accepts only valid values**
    - **Validates: Requirements 8.1**

  - [ ]* 5.7 Write property test for under-13 role restriction
    - **Property 26: Under-13 users cannot select Parent or Teacher role**
    - **Validates: Requirements 8.6**

  - [ ] 5.8 Wire auto Kids Mode: after a successful profile save where `age < 13`, call `enableKidsMode()` from `KidsModeContext`; persist Kids Mode state to profile via `db.upsertProfile`
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 5.9 Write property test for Kids Mode auto-activation
    - **Property 4: Kids Mode auto-activation for under-13**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [ ] 6. Checkpoint — verify profile save, age lock, role selector, and auto Kids Mode work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Add `ManageChildrenSection` inside `Profile.jsx`
  - [ ] 7.1 Render the "Manage Children" section only when `profile.role === 'Parent'`; hide for all other roles
    - _Requirements: 4.1, 8.3_

  - [ ]* 7.2 Write property test for parent section visibility
    - **Property 10: Parent role shows Manage Children section**
    - **Validates: Requirements 4.1, 8.3_**

  - [ ] 7.3 Implement child creation form: display name (required), age, avatar picker; submit calls `POST /api/children/:parentId`; show error banner if max-6 is reached
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 7.4 Write property test for child profile creation round-trip
    - **Property 11: Child profile creation round-trip**
    - **Validates: Requirements 4.2**

  - [ ]* 7.5 Write property test for max-6 child cap
    - **Property 12: Maximum 6 child profiles per parent**
    - **Validates: Requirements 4.3, 4.4**

  - [ ] 7.6 Implement child deletion with PIN modal: clicking delete opens a PIN entry modal; on correct PIN calls `DELETE /api/children/:parentId/:childId`; refreshes child list
    - _Requirements: 4.8, 4.9_

  - [ ]* 7.7 Write property test for PIN gate on sensitive actions
    - **Property 14: PIN required for sensitive parent actions**
    - **Validates: Requirements 4.9, 5.7**

  - [ ] 7.8 Auto-activate Kids Mode for newly created child profiles with age < 13 (set `kids_mode = true` on the child profile record via `db.upsertChildProfile`)
    - _Requirements: 4.5_

- [ ] 8. Create `src/components/ParentalControlsPanel.jsx`
  - [ ] 8.1 Build the panel UI: AI feature toggles (`bible_character_chat`, `ai_prayer_companion`), Kids-routes-only toggle, daily time limit selector (0/15/30/45/60 min), PIN change field
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.8_

  - [ ] 8.2 On save, open a PIN confirmation modal; on correct PIN call `PUT /api/parental-controls/:parentId`; show inline error on wrong PIN or invalid limit
    - _Requirements: 5.2, 5.7_

  - [ ]* 8.3 Write property test for parental controls persistence round-trip
    - **Property 15: Parental controls persistence round-trip**
    - **Validates: Requirements 5.2**

  - [ ]* 8.4 Write property test for daily limit accepted values
    - **Property 16: Daily time limit accepted values**
    - **Validates: Requirements 5.5**

  - [ ] 8.5 Wire `ParentalControlsContext` timer to `daily_limit` from the saved controls; ensure `TimeLimitOverlay` renders when `sessionTime >= daily_limit > 0`
    - _Requirements: 5.6_

  - [ ]* 8.6 Write property test for time limit overlay trigger
    - **Property 17: Time limit overlay triggers at limit**
    - **Validates: Requirements 5.6**

- [ ] 9. Create `src/pages/ChildDashboard.jsx` at route `/profile/child/:childId`
  - [ ] 9.1 Fetch child profile, activity stats (7-day and 30-day), streak, badges via `db.getChildActivityStats` and `db.getProgressReport`; render streak, badges earned, quiz scores, recent activity list
    - _Requirements: 4.6, 4.7_

  - [ ] 9.2 Embed `ParentalControlsPanel` inside the dashboard, accessible only to the parent who owns the child profile
    - _Requirements: 5.1_

  - [ ] 9.3 Add a "Family Win" banner: query `family_devotional_progress` for the current plan; if all assigned children completed the same day, show the celebration banner on next parent login
    - _Requirements: 6.5_

  - [ ] 9.4 Add a missed-devotional reminder indicator: if any child has no completion record for 3+ consecutive days, show a gentle reminder badge on the dashboard
    - _Requirements: 6.6_

  - [ ] 9.5 Register the route in `src/App.jsx` inside the `<PrivateRoute>` block: `<Route path="/profile/child/:childId" element={<SP c={ChildDashboard}/>}/>`
    - _Requirements: 4.6_

- [ ] 10. Create `src/components/ProgressReport.jsx`
  - [ ] 10.1 Build the report component: period selector (7d / 30d / all), stat cards (streak, days read, badges, quizzes, accuracy), activity timeline list
    - Calls `GET /api/progress/:childId?period=...` and renders the response
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 10.2 Write property test for progress report fields and time filter
    - **Property 22: Progress report contains all required fields and respects time filter**
    - **Validates: Requirements 7.1, 7.3**

  - [ ] 10.3 Implement "Share Report" action: generate a static printable `<div>` containing only the child's display name and stats (no email, no user ID); trigger `window.print()` or copy-to-clipboard
    - _Requirements: 7.5, 7.6_

  - [ ]* 10.4 Write property test for share report PII scrubbing
    - **Property 23: Share report contains no PII beyond display name**
    - **Validates: Requirements 7.6**

  - [ ] 10.5 Embed `ProgressReport` inside `ChildDashboard.jsx`
    - _Requirements: 7.2_

- [ ] 11. Checkpoint — verify child dashboard, parental controls, and progress report work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Create `src/pages/ParentsTeachers.jsx` at route `/parents-teachers`
  - [ ] 12.1 Build the page shell: hero section, category tabs (Lesson Plans, Devotionals, Activity Ideas, Teaching Resources), role-aware welcome message
    - Route already registered in `App.jsx` as `/parent-hub` pointing to `ParentTeacherHub` — update the route path to `/parents-teachers` or add an alias
    - _Requirements: 3.1, 3.2_

  - [ ] 12.2 Create `src/components/ResourceCard.jsx`: renders title, description, age-range tag, and action link/download button; accepts a `resource` prop
    - _Requirements: 3.3_

  - [ ]* 12.3 Write property test for resource card required fields
    - **Property 7: Content hub resource cards contain required fields**
    - **Validates: Requirements 3.3**

  - [ ] 12.4 Implement role-based filtering: when `profile.role === 'Teacher'` surface teacher resources first; when `profile.role === 'Parent'` surface parent resources first; unauthenticated users see a limited preview set
    - _Requirements: 3.4, 3.5, 3.6, 3.7_

  - [ ]* 12.5 Write property test for role-based content filtering
    - **Property 8: Content hub role-based filtering**
    - **Validates: Requirements 3.4, 3.5**

  - [ ] 12.6 Apply Kids Mode filter: when `kidsMode` is active, only render resources tagged `ageAppropriate: true`
    - _Requirements: 3.8_

  - [ ]* 12.7 Write property test for Kids Mode content filter
    - **Property 9: Kids Mode filters Content Hub resources**
    - **Validates: Requirements 3.8**

  - [ ] 12.8 Add unauthenticated gate: clicking a full resource when not signed in shows a sign-in prompt modal linking to `/auth`
    - _Requirements: 3.6, 3.7_

- [ ] 13. Create `src/components/FamilyDevotionalSection.jsx`
  - [ ] 13.1 Build the assignment UI: plan selector (predefined list), start date picker, child multi-select (from `childProfiles`); submit calls `db.upsertFamilyPlan` then `db.updateFamilyProgress` for each selected child
    - _Requirements: 6.1, 6.2_

  - [ ]* 13.2 Write property test for family devotional assignment round-trip
    - **Property 18: Family devotional assignment round-trip**
    - **Validates: Requirements 6.2**

  - [ ] 13.3 Implement day-completion toggle: each child's day card has a "Mark Complete" button; calls `db.updateFamilyProgress(planId, childId, day, 'completed')`
    - _Requirements: 6.3_

  - [ ]* 13.4 Write property test for devotional day completion recording
    - **Property 19: Devotional day completion is recorded**
    - **Validates: Requirements 6.3**

  - [ ] 13.5 Compute and display progress percentage: `floor(completedDays / totalDays * 100)`; render a progress bar per child
    - _Requirements: 6.4_

  - [ ]* 13.6 Write property test for devotional progress percentage
    - **Property 20: Devotional progress percentage is correct**
    - **Validates: Requirements 6.4**

  - [ ]* 13.7 Write property test for Family Win trigger
    - **Property 21: Family Win triggers when all children complete a day**
    - **Validates: Requirements 6.5**

  - [ ] 13.8 Embed `FamilyDevotionalSection` inside the `/parents-teachers` page under the "Devotionals" tab (visible to authenticated Parent users only)
    - _Requirements: 6.1_

- [ ] 14. Wire teacher aggregated progress view
  - [ ] 14.1 When `profile.role === 'Teacher'`, render an "Aggregated Progress" section in the Content Hub that calls `GET /api/progress/:childId` for each linked child and displays anonymized averages (no names, only stats)
    - _Requirements: 7.4_

- [ ] 15. Write property-based test file
  - [ ] 15.1 Create `src/__tests__/parents-teachers-profiles.property.test.js` using fast-check and Vitest
    - Scaffold the file with imports: `import * as fc from 'fast-check'` and `import { describe, it, expect } from 'vitest'`
    - Each test tagged with `// Feature: parents-teachers-profiles, Property N: <text>`
    - _Requirements: all_

  - [ ]* 15.2 Implement property tests P1–P6 (age and Kids Mode properties)
    - P1: age round-trip — `fc.integer({ min: 1, max: 120 })`
    - P2: age rejection — `fc.oneof(fc.integer({ max: 0 }), fc.integer({ min: 121 }))`
    - P3: age lock immutability — locked profile + random new age
    - P4: Kids Mode auto-on — `fc.integer({ min: 1, max: 12 })`
    - P5: Kids Mode PIN gate — under-13 profile + random wrong PIN
    - P6: adult toggle free — `fc.integer({ min: 13, max: 120 })`
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5, 1.6, 2.1–2.6**

  - [ ]* 15.3 Implement property tests P10–P14 (child profile and PIN properties)
    - P10: parent section visibility — random role value
    - P11: child profile round-trip — random display name, age in [1,17], avatar
    - P12: max-6 cap — sequence of 7+ create calls
    - P13: delete cascade — child with N random activity records
    - P14: PIN gate — correct vs. incorrect PIN
    - **Validates: Requirements 4.1–4.4, 4.8, 4.9, 8.3**

  - [ ]* 15.4 Implement property tests P15–P17 (parental controls properties)
    - P15: controls round-trip — random ai_toggles, valid limit, 4-digit PIN
    - P16: daily limit validation — random integer not in {0,15,30,45,60}
    - P17: time limit overlay — `sessionTime >= daily_limit`
    - **Validates: Requirements 5.2, 5.5, 5.6**

  - [ ]* 15.5 Implement property tests P18–P26 (devotional, report, role properties)
    - P18: devotional assignment round-trip
    - P19: day completion recorded
    - P20: progress percentage — `fc.integer({ min: 0, max: 100 })` for K and N
    - P21: Family Win trigger
    - P22: progress report fields + filter
    - P23: share report PII scrubbing
    - P24: role enum validation — `fc.string()` filtered to exclude valid values
    - P25: role change round-trip
    - P26: under-13 role restriction
    - **Validates: Requirements 6.2–6.5, 7.1, 7.3, 7.6, 8.1, 8.5, 8.6**

- [ ] 16. Write unit test file
  - [ ] 16.1 Create `src/__tests__/parents-teachers-profiles.unit.test.js`
    - Age validation boundary values: 0, 1, 120, 121, -1
    - Progress percentage: K=0, K=N, K=N/2, non-integer result
    - Time period filter: records exactly at day-7 and day-30 boundaries
    - Share report PII scrubber: verify no email/ID fields in output
    - Role enum guard: each invalid value, each valid value
    - PIN comparison: correct PIN, wrong PIN, empty PIN
    - _Requirements: 1.3, 6.4, 7.3, 7.6, 8.1, 5.7_

- [ ] 17. Final checkpoint — all tests pass, all routes registered, all components wired
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests live in `src/__tests__/parents-teachers-profiles.property.test.js`
- Unit tests live in `src/__tests__/parents-teachers-profiles.unit.test.js`
- Run tests with: `npx vitest --run src/__tests__/parents-teachers-profiles`
- The `/parent-hub` route in `App.jsx` already points to `ParentTeacherHub` — task 12.1 addresses reconciling this with the spec's `/parents-teachers` route
