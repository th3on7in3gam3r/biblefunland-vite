# Requirements Document

## Introduction

The Leaderboard Page is a public social feature at `/leaderboard` that surfaces existing user data — streaks, badges, and trivia scores — into ranked boards. The goal is to add social motivation for users and families by celebrating top performers across three categories: longest active streaks, most badges earned, and highest trivia scores. The page reads from existing database tables (`streaks`, `badges`, `child_activity`) and requires no new data collection.

## Glossary

- **Leaderboard**: A ranked list of users or child profiles sorted by a specific metric.
- **Streak**: A consecutive daily check-in count stored in the `streaks` table, keyed by `user_id`.
- **Badge**: An achievement record stored in the `badges` table, identified by `badge_id` and `user_id`.
- **Trivia_Score**: The count of trivia activities completed by a child, derived from the `child_activity` table where `activity_type = 'quiz'`.
- **Display_Name**: The public-facing name shown on the leaderboard, sourced from the `profiles` or `child_profiles` table.
- **Avatar**: The avatar identifier stored in `profiles.avatar_url` or `child_profiles.avatar_url`, rendered as an emoji or image.
- **Leaderboard_Page**: The React page component rendered at the `/leaderboard` route.
- **Leaderboard_API**: The server-side API endpoint that queries and aggregates leaderboard data.
- **Category**: One of three leaderboard tabs — Streaks, Badges, or Trivia Champions.
- **Rank**: A user's ordinal position (1st, 2nd, 3rd, etc.) within a leaderboard category.

---

## Requirements

### Requirement 1: Leaderboard Page Route

**User Story:** As a visitor, I want to navigate to `/leaderboard`, so that I can view the community rankings without needing to log in.

#### Acceptance Criteria

1. THE Leaderboard_Page SHALL be accessible at the `/leaderboard` route.
2. THE Leaderboard_Page SHALL be publicly accessible without authentication.
3. WHEN a user navigates to `/leaderboard`, THE Leaderboard_Page SHALL render within 3 seconds on a standard connection.
4. IF the Leaderboard_API returns an error, THEN THE Leaderboard_Page SHALL display a friendly error message and a retry button.

---

### Requirement 2: Three-Category Leaderboard Tabs

**User Story:** As a user, I want to switch between Streaks, Badges, and Trivia Champion categories, so that I can see rankings across different types of engagement.

#### Acceptance Criteria

1. THE Leaderboard_Page SHALL display three selectable tabs: "Top Streaks", "Most Badges", and "Trivia Champions".
2. WHEN a tab is selected, THE Leaderboard_Page SHALL display the ranked list for that category.
3. THE Leaderboard_Page SHALL default to the "Top Streaks" tab on initial load.
4. WHEN switching tabs, THE Leaderboard_Page SHALL show a loading indicator while fetching data for the newly selected category.

---

### Requirement 3: Top Streaks Leaderboard

**User Story:** As a user, I want to see who has the longest active reading streaks, so that I feel motivated to maintain my own streak.

#### Acceptance Criteria

1. THE Leaderboard_API SHALL query the `streaks` table and return the top 25 users ordered by `streak` descending.
2. THE Leaderboard_Page SHALL display each entry's Rank, Avatar, Display_Name, and streak count in days.
3. THE Leaderboard_Page SHALL display a flame emoji (🔥) alongside each streak count.
4. IF a user's `display_name` is empty or null, THEN THE Leaderboard_Page SHALL display "Anonymous" for that entry.

---

### Requirement 4: Most Badges Leaderboard

**User Story:** As a user, I want to see who has earned the most badges, so that I am inspired to explore more features and earn achievements.

#### Acceptance Criteria

1. THE Leaderboard_API SHALL query the `badges` table, group by `user_id`, and return the top 25 users ordered by badge count descending.
2. THE Leaderboard_Page SHALL display each entry's Rank, Avatar, Display_Name, and total badge count.
3. THE Leaderboard_Page SHALL display a trophy emoji (🏆) alongside each badge count.
4. IF a user has earned a legendary badge, THEN THE Leaderboard_Page SHALL display a gold crown indicator (👑) next to their Display_Name.
5. IF a user's `display_name` is empty or null, THEN THE Leaderboard_Page SHALL display "Anonymous" for that entry.

---

### Requirement 5: Trivia Champions Leaderboard

**User Story:** As a user, I want to see who has completed the most trivia quizzes, so that I am motivated to play more and improve my Bible knowledge.

#### Acceptance Criteria

1. THE Leaderboard_API SHALL query the `child_activity` table where `activity_type = 'quiz'`, group by `child_id`, and return the top 25 child profiles ordered by quiz count descending.
2. THE Leaderboard_Page SHALL display each entry's Rank, Avatar, Display_Name, and total quizzes completed.
3. THE Leaderboard_Page SHALL display a target emoji (🎯) alongside each quiz count.
4. IF a user's `display_name` is empty or null, THEN THE Leaderboard_Page SHALL display "Anonymous" for that entry.

---

### Requirement 6: Top 3 Podium Display

**User Story:** As a user, I want the top 3 ranked entries to be visually highlighted, so that top performers feel celebrated and others are motivated to reach the top.

#### Acceptance Criteria

1. THE Leaderboard_Page SHALL render the 1st, 2nd, and 3rd place entries in a distinct podium layout above the ranked list.
2. THE Leaderboard_Page SHALL display 🥇, 🥈, and 🥉 medal icons for 1st, 2nd, and 3rd place respectively.
3. THE Leaderboard_Page SHALL visually distinguish the 1st place entry with a larger display size than 2nd and 3rd.
4. IF fewer than 3 entries exist for a category, THEN THE Leaderboard_Page SHALL render only the available podium positions.

---

### Requirement 7: Current User Highlight

**User Story:** As a logged-in user, I want my own entry to be highlighted on the leaderboard, so that I can quickly find my rank and feel personally connected to the community.

#### Acceptance Criteria

1. WHILE a user is authenticated, THE Leaderboard_Page SHALL visually highlight the row matching the current user's `user_id`.
2. WHILE a user is authenticated and their rank is outside the top 25, THE Leaderboard_Page SHALL display the current user's entry pinned at the bottom of the list with their actual rank.
3. WHILE a user is not authenticated, THE Leaderboard_Page SHALL display the leaderboard without any user-specific highlighting.

---

### Requirement 8: Leaderboard Data API Endpoint

**User Story:** As a developer, I want a dedicated API endpoint for leaderboard data, so that the page can efficiently fetch aggregated rankings without overloading the client.

#### Acceptance Criteria

1. THE Leaderboard_API SHALL expose a GET endpoint at `/api/leaderboard/:category` where `:category` is one of `streaks`, `badges`, or `trivia`.
2. WHEN a valid category is requested, THE Leaderboard_API SHALL return a JSON array of up to 25 ranked entries within 2 seconds.
3. IF an invalid category is requested, THEN THE Leaderboard_API SHALL return a 400 status code with a descriptive error message.
4. THE Leaderboard_API SHALL apply a server-side cache with a TTL of 5 minutes to reduce database load.
5. WHEN the authenticated user's `user_id` is provided as a query parameter, THE Leaderboard_API SHALL include the current user's rank and entry in the response even if outside the top 25.

---

### Requirement 9: Privacy — Display Name Opt-Out

**User Story:** As a user, I want my name to appear as "Anonymous" on the leaderboard if I have not set a display name, so that my privacy is protected by default.

#### Acceptance Criteria

1. THE Leaderboard_API SHALL substitute null or empty `display_name` values with the string "Anonymous" before returning leaderboard data.
2. THE Leaderboard_Page SHALL never display a user's email address or internal user ID.

---

### Requirement 10: Navigation Link to Leaderboard

**User Story:** As a user, I want to find the leaderboard easily from the main navigation or home page, so that I can access it without knowing the direct URL.

#### Acceptance Criteria

1. THE Nav SHALL include a link to `/leaderboard` visible to all users (authenticated and unauthenticated).
2. THE Leaderboard_Page SHALL include a link back to the home page.
