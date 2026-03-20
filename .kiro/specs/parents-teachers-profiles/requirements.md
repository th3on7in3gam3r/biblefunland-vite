# Requirements Document

## Introduction

This feature adds a dedicated Parents & Sunday School Teachers content hub, age-based automatic Kids Mode activation, locked age profiles, and parent-managed child profiles with monitoring capabilities to BibleFunLand. It extends the existing KidsModeContext and Supabase-backed auth/profile system to support family-oriented use cases in a faith-based context.

---

## Glossary

- **App**: The BibleFunLand React/Vite web application
- **Parent_User**: An authenticated adult user (age 18+) who manages child profiles
- **Child_Profile**: A sub-profile created and owned by a Parent_User, representing a child under 13
- **Teacher_User**: An authenticated adult user who has self-identified as a Sunday school teacher
- **Profile_Service**: The Supabase-backed service responsible for reading and writing user profile data
- **Kids_Mode**: The existing content-filtering and UI-transformation mode defined in KidsModeContext
- **Age_Lock**: The system behavior that prevents a user's age from being changed after initial entry
- **Content_Hub**: The dedicated page surfacing lesson plans, devotionals, activity ideas, and teaching resources for parents and teachers
- **Child_Dashboard**: The monitoring view available to a Parent_User showing a child's activity, progress, and usage
- **Parental_Controls**: Settings managed by a Parent_User that restrict or configure a Child_Profile's experience
- **Family_Devotional**: A shared devotional session or reading plan that a Parent_User assigns to one or more Child_Profiles
- **PIN**: The 4-digit numeric code used to authenticate parental actions, consistent with the existing KidsModeContext PIN system
- **Progress_Report**: A summary of a Child_Profile's reading streaks, quiz scores, badges, and activity over a time period

---

## Requirements

### Requirement 1: Age Input on User Profile

**User Story:** As a user setting up my profile, I want to enter my age once, so that the App can tailor the experience appropriately and automatically.

#### Acceptance Criteria

1. THE Profile_Service SHALL provide an `age` field on the user profile record stored in Supabase.
2. WHEN a user accesses the profile page and no age has been set, THE App SHALL display an age input field prompting the user to enter their age.
3. WHEN a user submits an age value less than 1 or greater than 120, THE App SHALL display a validation error and reject the submission.
4. WHEN a user successfully submits a valid age, THE Profile_Service SHALL persist the age value and set an `age_locked` flag to `true` on the profile record.
5. WHILE `age_locked` is `true` on a profile, THE App SHALL display the age as read-only and SHALL NOT render an editable age input field.
6. IF a user attempts to modify the age field via a direct API call after `age_locked` is `true`, THEN THE Profile_Service SHALL reject the update and return an error response.

---

### Requirement 2: Automatic Kids Mode Activation by Age

**User Story:** As a parent, I want Kids Mode to turn on automatically when my child enters their age, so that I don't have to manually configure it.

#### Acceptance Criteria

1. WHEN a user's profile age is set to a value less than 13, THE App SHALL automatically activate Kids_Mode for that user's session.
2. WHEN Kids_Mode is automatically activated due to age, THE App SHALL persist the Kids_Mode state to the user's Supabase profile so it is restored on subsequent logins.
3. WHILE a user's profile age is less than 13, THE App SHALL NOT render the manual Kids_Mode toggle control for that user.
4. WHILE a user's profile age is less than 13, THE App SHALL prevent Kids_Mode from being deactivated without a valid parent PIN.
5. IF a user whose age is less than 13 attempts to disable Kids_Mode without providing a valid PIN, THEN THE App SHALL display the PIN entry modal and SHALL NOT deactivate Kids_Mode.
6. WHEN a user's profile age is 13 or greater, THE App SHALL allow the user to manually toggle Kids_Mode on or off without PIN restriction.

---

### Requirement 3: Parents & Sunday School Teachers Content Hub

**User Story:** As a parent or Sunday school teacher, I want a dedicated content hub, so that I can find lesson plans, devotionals, activity ideas, and teaching resources in one place.

#### Acceptance Criteria

1. THE App SHALL provide a Content_Hub page accessible at the route `/parents-teachers`.
2. THE Content_Hub SHALL display content organized into at least the following categories: Lesson Plans, Devotionals, Activity Ideas, and Teaching Resources.
3. WHEN a user visits the Content_Hub, THE App SHALL render content cards for each category with a title, description, age-range tag, and a link or downloadable resource.
4. WHEN a user selects the "Sunday School Teacher" role on their profile, THE App SHALL surface teacher-specific resources (e.g., classroom discussion guides, memory verse activities) prominently in the Content_Hub.
5. WHEN a user selects the "Parent" role on their profile, THE App SHALL surface parent-specific resources (e.g., family devotionals, bedtime Bible stories, parenting devotionals) prominently in the Content_Hub.
6. THE Content_Hub SHALL be accessible to unauthenticated users in a preview mode showing a limited set of resources.
7. WHEN an unauthenticated user attempts to access a full resource in the Content_Hub, THE App SHALL prompt the user to sign in or create an account.
8. WHERE Kids_Mode is active, THE Content_Hub SHALL filter displayed resources to age-appropriate content only.

---

### Requirement 4: Parent Child Profile Management

**User Story:** As a parent, I want to create and manage child profiles, so that I can give each child a personalized, safe experience and monitor their activity.

#### Acceptance Criteria

1. WHEN a user with the "Parent" role accesses the profile page, THE App SHALL display a "Manage Children" section.
2. WHEN a Parent_User creates a Child_Profile, THE Profile_Service SHALL store the child's display name, age, and a reference to the Parent_User's account in Supabase.
3. THE Profile_Service SHALL enforce that a single Parent_User account can have a maximum of 6 Child_Profiles.
4. IF a Parent_User attempts to create more than 6 Child_Profiles, THEN THE App SHALL display an error message and SHALL NOT create the additional profile.
5. WHEN a Child_Profile is created with an age less than 13, THE App SHALL automatically set Kids_Mode to active for that Child_Profile.
6. WHEN a Parent_User selects a Child_Profile to view, THE App SHALL display the Child_Dashboard showing the child's reading streak, badges earned, quiz scores, and recent activity.
7. THE Child_Dashboard SHALL display activity data for the current week and the past 30 days.
8. WHEN a Parent_User deletes a Child_Profile, THE Profile_Service SHALL remove the child's profile and all associated activity data from Supabase.
9. WHEN a Parent_User deletes a Child_Profile, THE App SHALL require PIN confirmation before executing the deletion.

---

### Requirement 5: Parental Controls

**User Story:** As a parent, I want to configure controls on my child's profile, so that I can ensure a safe and focused faith experience.

#### Acceptance Criteria

1. THE App SHALL provide a Parental_Controls settings panel accessible from the Child_Dashboard.
2. WHEN a Parent_User configures Parental_Controls, THE Profile_Service SHALL persist the settings to the Child_Profile record in Supabase.
3. THE Parental_Controls panel SHALL include a toggle to restrict the child to Kids_Allowed_Routes only (as defined in KidsModeContext).
4. THE Parental_Controls panel SHALL include a toggle to enable or disable access to the AI features (BibleCharacterChat, AIPrayerCompanion).
5. THE Parental_Controls panel SHALL include a daily usage time limit setting, accepting values of 15, 30, 45, or 60 minutes.
6. WHEN a Child_Profile's daily usage time limit is reached, THE App SHALL display a friendly "Time's up — come back tomorrow!" message and restrict further navigation for that session.
7. WHEN a Parent_User changes any Parental_Controls setting, THE App SHALL require PIN confirmation before saving.
8. THE Parental_Controls panel SHALL include a field for the Parent_User to set or change the PIN used for Kids_Mode and parental actions.

---

### Requirement 6: Family Devotional Tracking

**User Story:** As a parent, I want to assign and track family devotionals, so that I can encourage consistent faith habits across my household.

#### Acceptance Criteria

1. THE App SHALL provide a Family_Devotional section within the Content_Hub accessible to Parent_Users.
2. WHEN a Parent_User assigns a Family_Devotional to one or more Child_Profiles, THE Profile_Service SHALL store the assignment with a start date and the selected devotional plan identifier.
3. WHEN a Child_Profile completes a day of an assigned Family_Devotional, THE App SHALL record the completion in Supabase and update the Child_Dashboard.
4. THE Child_Dashboard SHALL display the current Family_Devotional progress as a percentage of days completed out of total days in the plan.
5. WHEN all assigned Child_Profiles complete the same devotional day, THE App SHALL display a "Family Win" celebration notification to the Parent_User on their next login.
6. IF a Child_Profile has not completed a devotional day within 3 consecutive days, THEN THE App SHALL display a gentle reminder indicator on the Child_Dashboard for the Parent_User.

---

### Requirement 7: Progress Reports

**User Story:** As a parent or teacher, I want to view progress reports for children, so that I can celebrate growth and identify areas needing encouragement.

#### Acceptance Criteria

1. THE App SHALL generate a Progress_Report for each Child_Profile covering reading streak, total days read, badges earned, quizzes completed, and quiz accuracy percentage.
2. WHEN a Parent_User requests a Progress_Report, THE App SHALL render the report within the Child_Dashboard.
3. THE Progress_Report SHALL support filtering by time period: Last 7 Days, Last 30 Days, and All Time.
4. WHEN a Teacher_User accesses the Content_Hub, THE App SHALL provide an option to view aggregated (anonymized) progress data for children linked to the teacher's account.
5. THE App SHALL provide a "Share Report" action that generates a printable or shareable summary of a Child_Profile's Progress_Report.
6. WHEN the "Share Report" action is triggered, THE App SHALL generate a static summary view suitable for printing or saving as an image, containing no personally identifiable information beyond the child's display name.

---

### Requirement 8: Role Selection on Profile

**User Story:** As a user, I want to identify my role (Parent, Teacher, or General User), so that the App can surface the most relevant content and features for me.

#### Acceptance Criteria

1. THE Profile_Service SHALL store a `role` field on the user profile record with allowed values: `general`, `parent`, `teacher`.
2. WHEN a user accesses the profile page for the first time, THE App SHALL prompt the user to select a role.
3. WHEN a user selects the `parent` role, THE App SHALL display the "Manage Children" section and Family_Devotional features.
4. WHEN a user selects the `teacher` role, THE App SHALL surface teacher-specific resources in the Content_Hub and enable the aggregated progress view.
5. WHEN a user changes their role, THE Profile_Service SHALL update the role field and THE App SHALL re-render role-specific UI sections accordingly.
6. IF a user's profile age is less than 13, THEN THE App SHALL restrict the available roles to `general` only and SHALL NOT display the `parent` or `teacher` role options.
