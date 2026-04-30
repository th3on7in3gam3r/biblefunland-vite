# Design Document: Parents & Teachers Profiles

## Overview

This feature extends BibleFunLand with a family-oriented layer on top of the existing Clerk auth and Turso/SQLite data stack. The work falls into four interconnected areas:

1. **Age & role profile fields** — age input with a one-time lock, automatic Kids Mode enforcement for under-13 users, and a three-value role selector (General / Parent / Teacher).
2. **Parents & Teachers content hub** — a new `/parents-teachers` route surfacing lesson plans, devotionals, activity ideas, and teaching resources, with role-aware filtering and a preview mode for unauthenticated visitors.
3. **Child profile management** — parents can create up to 6 child sub-profiles, view a per-child dashboard (streak, badges, quiz scores, recent activity), and delete profiles with PIN confirmation.
4. **Parental controls & family devotionals** — AI feature toggles, daily time limits, PIN management, family devotional assignment/tracking, and progress reports with a shareable summary.

All new UI follows the existing inline-style pattern (no Tailwind), uses Poppins / Baloo 2 fonts, and respects CSS variable theming. All new data operations go through `src/lib/db.js` → `src/lib/turso.js`. Server-side PIN enforcement and age-lock protection are added to the Express backend.

---

## Architecture

```mermaid
graph TD
    subgraph Frontend
        A[Profile.jsx] -->|age/role save| B[db.upsertProfile]
        A -->|child CRUD| C[db.upsertChildProfile / deleteChildProfile]
        D[ParentsTeachers.jsx] -->|resource fetch| E[Static resource data / server API]
        F[ChildDashboard.jsx] -->|activity query| G[db.getChildActivityStats]
        F -->|progress report| H[db.getProgressReport]
        I[ParentalControlsPanel.jsx] -->|save controls| J[db.upsertParentalControls]
        K[FamilyDevotionalSection.jsx] -->|assign/track| L[db.upsertFamilyPlan / updateFamilyProgress]
    end

    subgraph Contexts
        M[KidsModeContext] -->|enforces age < 13| A
        N[ParentalControlsContext] -->|time limit overlay| F
        O[ChildSwitcherContext] -->|active child session| F
    end

    subgraph Backend - Express
        P[/api/profiles/age-lock] -->|rejects age change if locked| Q[Turso DB]
        R[/api/profiles/role] -->|validates role enum| Q
        S[/api/children] -->|enforces max-6 rule| Q
        T[/api/parental-controls] -->|PIN-gated writes| Q
    end

    subgraph Database - Turso/SQLite
        Q --> U[profiles]
        Q --> V[child_profiles]
        Q --> W[child_activity]
        Q --> X[parental_controls]
        Q --> Y[family_plans + family_devotional_progress]
    end
```

The frontend calls `src/lib/db.js` for most reads and writes. Sensitive mutations (age-lock enforcement, role validation, child-count cap, PIN-gated parental control saves) are additionally enforced in Express route handlers so they cannot be bypassed by direct API calls.

---

## Components and Interfaces

### New Pages

| Component | Route | Purpose |
|---|---|---|
| `ParentsTeachers.jsx` | `/parents-teachers` | Content hub with role-aware resource cards |
| `ChildDashboard.jsx` | `/profile/child/:childId` | Per-child activity, progress report, controls |

### New / Modified Components

| Component | Location | Purpose |
|---|---|---|
| `AgeInput` | inside `Profile.jsx` | Age field with lock-after-save UX |
| `RoleSelector` | inside `Profile.jsx` | General / Parent / Teacher picker; hides parent/teacher for age < 13 |
| `ManageChildrenSection` | inside `Profile.jsx` | Child profile CRUD, max-6 guard |
| `ParentalControlsPanel` | `src/components/ParentalControlsPanel.jsx` | AI toggles, time limit, PIN change |
| `FamilyDevotionalSection` | `src/components/FamilyDevotionalSection.jsx` | Assign plans, track per-child progress |
| `ProgressReport` | `src/components/ProgressReport.jsx` | Filterable report + share action |
| `ResourceCard` | `src/components/ResourceCard.jsx` | Reusable card for content hub items |

### Modified Contexts

| Context | Change |
|---|---|
| `KidsModeContext` | Expose `enableKidsMode` publicly; enforce age < 13 lock on disable attempt |
| `ParentalControlsContext` | Scope controls to `activeChild.id` when a child session is active |
| `AuthContext` | Call `refreshProfile` after role/age save so downstream contexts react |

### New Express Routes

```
POST /api/profiles/:userId/age          — set age (rejected if already locked)
PATCH /api/profiles/:userId/role        — update role (validates enum; blocks parent/teacher if age < 13)
GET  /api/children/:parentId            — list child profiles
POST /api/children/:parentId            — create child (enforces max-6)
DELETE /api/children/:parentId/:childId — delete child + cascade activity (PIN required in body)
GET  /api/parental-controls/:parentId   — read controls
PUT  /api/parental-controls/:parentId   — save controls (PIN required in body)
GET  /api/progress/:childId             — progress report (accepts ?period=7d|30d|all)
```

---

## Data Models

### `profiles` table (existing — additions highlighted)

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age           INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role          TEXT DEFAULT 'General';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_age_locked INTEGER DEFAULT 0;
```

These columns already exist in `schema.sql`. No migration needed for new deployments; existing deployments may need the `ALTER TABLE` statements.

### `child_profiles` table (existing)

```sql
-- Already exists. No changes needed.
-- id, parent_id, display_name, avatar_url, age, streak, badges_count, quiz_score, created_at, updated_at
```

### `parental_controls` table (existing)

```sql
-- Already exists. No changes needed.
-- parent_id, ai_toggles (JSON), daily_limit, parent_pin, updated_at
```

The `ai_toggles` JSON object shape:
```json
{
  "bible_character_chat": true,
  "ai_prayer_companion": true,
  "restrict_to_kids_routes": false
}
```

### `family_plans` table (existing — minor extension)

```sql
-- Add description column if not present
ALTER TABLE family_plans ADD COLUMN IF NOT EXISTS description TEXT;
```

### `family_devotional_progress` table (existing — schema fix)

The current schema uses `plan_id` + `child_id` + `day_number` as PK but the `db.js` functions reference a `parent_id` column that does not exist in the table. The design resolves this by using `family_plans.parent_id` for parent-scoped queries and keeping `family_devotional_progress` keyed on `(plan_id, child_id, day_number)`.

### New: `progress_snapshots` view (virtual, computed at query time)

No new table. Progress reports are assembled by joining `child_activity`, `child_profiles`, `streaks`, and `badges` at query time in `db.getProgressReport`.

```js
// Proposed db.js function signature
getProgressReport(childId, period) // period: '7d' | '30d' | 'all'
// Returns: { streak, totalDaysRead, badgesEarned, quizzesCompleted, quizAccuracy, activities[] }
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Age persistence round-trip

*For any* valid age value in [1, 120], saving it to a user profile and then reading that profile back should return the same age value with `is_age_locked` set to 1.

**Validates: Requirements 1.1, 1.4**

---

### Property 2: Age validation rejects out-of-range values

*For any* integer outside the range [1, 120] (including 0, negative numbers, and values > 120), the age submission should be rejected and the profile should remain unchanged.

**Validates: Requirements 1.3**

---

### Property 3: Age lock is immutable

*For any* profile where `is_age_locked` is 1, any subsequent call to update the age field (whether via the UI save path or a direct API call) should leave the age value unchanged and return an error.

**Validates: Requirements 1.5, 1.6**

---

### Property 4: Kids Mode auto-activation for under-13

*For any* user profile with age < 13, after the profile is saved, Kids Mode should be active and the manual Kids Mode toggle should not be rendered.

**Validates: Requirements 2.1, 2.2, 2.3**

---

### Property 5: Kids Mode PIN gate for under-13 users

*For any* user with age < 13, an attempt to disable Kids Mode without supplying the correct PIN should leave Kids Mode active and display the PIN modal.

**Validates: Requirements 2.4, 2.5**

---

### Property 6: Adult users can toggle Kids Mode freely

*For any* user with age >= 13, toggling Kids Mode on and then off (or off then on) should succeed without requiring a PIN.

**Validates: Requirements 2.6**

---

### Property 7: Content hub resource cards contain required fields

*For any* resource card rendered in the Content Hub, the rendered output should include a title, description, age-range tag, and an action link or download reference.

**Validates: Requirements 3.3**

---

### Property 8: Content hub role-based filtering

*For any* authenticated user with a given role (parent or teacher), the Content Hub should display resources tagged for that role prominently, and resources tagged for the other role should not appear in the primary section.

**Validates: Requirements 3.4, 3.5**

---

### Property 9: Kids Mode filters Content Hub resources

*For any* resource set, when Kids Mode is active, only resources tagged as age-appropriate should be included in the rendered list.

**Validates: Requirements 3.8**

---

### Property 10: Parent role shows Manage Children section

*For any* authenticated user with role = 'parent', the profile page should render the "Manage Children" section; for any user with role ≠ 'parent', it should not.

**Validates: Requirements 4.1, 8.3**

---

### Property 11: Child profile creation round-trip

*For any* valid child profile data (display name, age, avatar), creating the profile and then reading it back should return a record with matching fields and the correct `parent_id`.

**Validates: Requirements 4.2**

---

### Property 12: Maximum 6 child profiles per parent

*For any* parent account, the count of child profiles associated with that account should never exceed 6. Attempting to create a 7th profile should be rejected with an error.

**Validates: Requirements 4.3, 4.4**

---

### Property 13: Child profile deletion cascades activity data

*For any* child profile that has associated activity records, deleting the profile should result in both the profile record and all its activity records being absent from the database.

**Validates: Requirements 4.8**

---

### Property 14: PIN required for sensitive parent actions

*For any* sensitive action (child profile deletion, parental controls save), the action should not be executed unless the correct PIN is supplied; supplying an incorrect PIN should leave the data unchanged.

**Validates: Requirements 4.9, 5.7**

---

### Property 15: Parental controls persistence round-trip

*For any* valid parental controls configuration (ai_toggles object, daily_limit in {0,15,30,45,60}, parent_pin), saving and then reading back the controls should return an equivalent configuration.

**Validates: Requirements 5.2**

---

### Property 16: Daily time limit accepted values

*For any* daily_limit value not in {0, 15, 30, 45, 60}, the parental controls save should be rejected and the existing limit should remain unchanged.

**Validates: Requirements 5.5**

---

### Property 17: Time limit overlay triggers at limit

*For any* child session where `sessionTime >= daily_limit > 0`, the time-limit overlay should be displayed and further navigation should be blocked.

**Validates: Requirements 5.6**

---

### Property 18: Family devotional assignment round-trip

*For any* valid devotional plan assignment (plan identifier, start date, one or more child IDs), saving the assignment and reading it back should return a record with matching plan ID, start date, and child references.

**Validates: Requirements 6.2**

---

### Property 19: Devotional day completion is recorded

*For any* child profile and any day number within an assigned plan, marking that day as complete and then reading the progress should show that day as completed with a non-null `completed_at` timestamp.

**Validates: Requirements 6.3**

---

### Property 20: Devotional progress percentage is correct

*For any* family devotional plan with N total days and K completed days (0 ≤ K ≤ N), the computed progress percentage should equal floor(K / N * 100).

**Validates: Requirements 6.4**

---

### Property 21: Family Win triggers when all children complete a day

*For any* devotional plan assigned to a set of child profiles, when every child in the set has a completion record for the same day number, the family-win flag for that day should be true.

**Validates: Requirements 6.5**

---

### Property 22: Progress report contains all required fields and respects time filter

*For any* child profile and any time period filter (7d, 30d, all), the generated progress report should contain streak, total days read, badges earned, quizzes completed, and quiz accuracy, and all activity records in the report should fall within the selected time window.

**Validates: Requirements 7.1, 7.3**

---

### Property 23: Share report contains no PII beyond display name

*For any* generated share report, the output should not contain email addresses, user IDs, parent names, or any field other than the child's display name as personally identifying information.

**Validates: Requirements 7.6**

---

### Property 24: Role field accepts only valid values

*For any* role value not in {'General', 'Parent', 'Teacher'}, the profile save should be rejected and the existing role should remain unchanged.

**Validates: Requirements 8.1**

---

### Property 25: Role change persists correctly

*For any* valid role value, changing a user's role and saving should result in the profile record reflecting the new role when read back.

**Validates: Requirements 8.5**

---

### Property 26: Under-13 users cannot select Parent or Teacher role

*For any* user profile with age < 13, the role selector should only offer 'General'; attempting to save a role of 'Parent' or 'Teacher' for such a user should be rejected.

**Validates: Requirements 8.6**

---

## Error Handling

| Scenario | Frontend behavior | Backend behavior |
|---|---|---|
| Age out of range (< 1 or > 120) | Inline validation error, form not submitted | 400 with `{ error: 'age_out_of_range' }` |
| Age update on locked profile | Input is disabled; direct API call rejected | 403 with `{ error: 'age_locked' }` |
| Child count exceeds 6 | Error banner in Manage Children section | 409 with `{ error: 'child_limit_reached' }` |
| Wrong PIN on sensitive action | PIN modal shakes, error message shown | 403 with `{ error: 'invalid_pin' }` |
| Invalid role value | Role selector only shows valid options | 400 with `{ error: 'invalid_role' }` |
| Under-13 role escalation attempt | Parent/Teacher buttons hidden | 403 with `{ error: 'role_restricted_by_age' }` |
| Invalid daily_limit value | UI only offers preset values (15/30/45/60) | 400 with `{ error: 'invalid_daily_limit' }` |
| Child profile not found | 404 page or redirect to `/profile` | 404 with `{ error: 'child_not_found' }` |
| DB write failure | Toast error message, no state mutation | 500 with `{ error: 'db_error', detail: ... }` |

All API errors follow the shape `{ error: string, detail?: string }`. The frontend checks for `error` in the response and surfaces it via the existing inline error pattern used in `Profile.jsx`.

---

## Testing Strategy

### Unit Tests

Focus on specific examples, edge cases, and pure logic:

- Age validation function: boundary values (0, 1, 120, 121, -1)
- Progress percentage calculation: K=0, K=N, K=N/2, non-integer result
- Time period filter: records exactly at the boundary (day 7, day 30)
- Share report PII scrubber: verify no email/ID fields leak through
- Role enum guard: each invalid value, each valid value
- PIN comparison: correct PIN, wrong PIN, empty PIN

### Property-Based Tests

Use [fast-check](https://github.com/dubzzz/fast-check) (already compatible with Vite/Vitest). Each property test runs a minimum of 100 iterations.

Each test is tagged with a comment in the format:
`// Feature: parents-teachers-profiles, Property N: <property text>`

| Property | Test description | Generator inputs |
|---|---|---|
| P1 | Age round-trip | `fc.integer({ min: 1, max: 120 })` |
| P2 | Age rejection | `fc.oneof(fc.integer({ max: 0 }), fc.integer({ min: 121 }))` |
| P3 | Age lock immutability | Profile with `is_age_locked=1`, random new age |
| P4 | Kids Mode auto-on | `fc.integer({ min: 1, max: 12 })` for age |
| P5 | Kids Mode PIN gate | Under-13 profile, random wrong PIN string |
| P6 | Adult toggle free | `fc.integer({ min: 13, max: 120 })` for age |
| P7 | Resource card fields | Random resource objects with required fields |
| P8 | Role-based filtering | Random resource list, role in {parent, teacher} |
| P9 | Kids Mode content filter | Random resource list with mixed age tags |
| P10 | Parent section visibility | Random role value |
| P11 | Child profile round-trip | Random display name, age in [1,17], avatar |
| P12 | Max-6 child cap | Sequence of 7+ create calls |
| P13 | Delete cascade | Child with N random activity records |
| P14 | PIN gate | Random action, correct vs. incorrect PIN |
| P15 | Controls round-trip | Random ai_toggles object, valid limit, 4-digit PIN |
| P16 | Daily limit validation | Random integer not in {0,15,30,45,60} |
| P17 | Time limit overlay | `sessionTime >= daily_limit`, random values |
| P18 | Devotional assignment round-trip | Random plan ID, date, 1–6 child IDs |
| P19 | Day completion recorded | Random child ID, day number in [1,365] |
| P20 | Progress percentage | `fc.integer({ min: 0, max: 100 })` for K, N |
| P21 | Family Win trigger | Random set of children, all complete same day |
| P22 | Progress report fields + filter | Random child activity data, random period |
| P23 | Share report PII | Random child profile with all fields populated |
| P24 | Role enum validation | `fc.string()` filtered to exclude valid values |
| P25 | Role change round-trip | Random valid role value |
| P26 | Under-13 role restriction | Age in [1,12], role in {Parent, Teacher} |

Property tests live in `src/__tests__/parents-teachers-profiles.property.test.js`.
Unit tests live in `src/__tests__/parents-teachers-profiles.unit.test.js`.
