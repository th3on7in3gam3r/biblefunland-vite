# Requirements Document

## Introduction

The Bible Module is a full-featured Bible reading and exploration experience within BibleFunLand. It replaces the existing `BibleBookExplorer` page at `/bible` with a rich, interactive module that lets users read scripture by book/chapter/verse, search across translations, bookmark and highlight passages, take notes, and track their reading progress — all powered by the API.Bible REST API. The module is designed for all ages (kids and adults), integrates with the existing auth system, and persists user data via the Turso (SQLite) backend.

## Glossary

- **Bible_Module**: The full Bible reading and exploration feature accessible at `/bible`
- **API_Client**: The frontend service that communicates with `https://rest.api.bible` using API key `I8LpaQ_H2CEc1BTNLIXj8`
- **Bible_Backend**: The Express server routes under `server/` that proxy API.Bible requests and persist user data via Turso
- **Reader**: The main reading view that displays chapter text verse by verse
- **Navigator**: The UI component for selecting Bible, book, chapter, and verse
- **Translation**: A specific Bible version (e.g., KJV, NIV, ESV) available from API.Bible
- **Bookmark**: A saved reference to a specific verse or passage
- **Highlight**: A color-coded visual mark applied to one or more verses
- **Note**: A user-written annotation attached to a specific verse or passage
- **Reading_Plan**: A structured schedule for reading through the Bible (existing feature at `/reading-plan`)
- **Verse_Reference**: A canonical reference string in the format `Book Chapter:Verse` (e.g., `John 3:16`)
- **Search_Engine**: The component that queries API.Bible full-text search and displays results
- **User**: An authenticated user identified via `useAuth()` from `AuthContext`
- **Guest**: An unauthenticated visitor who can read but cannot save bookmarks, highlights, or notes

---

## Requirements

### Requirement 1: Bible Translation Selection

**User Story:** As a user, I want to choose from multiple Bible translations, so that I can read scripture in the version I prefer.

#### Acceptance Criteria

1. THE Bible_Module SHALL fetch the list of available Bible translations from the API_Client on initial load.
2. WHEN a user selects a translation, THE Bible_Module SHALL reload the current chapter in the selected translation.
3. THE Bible_Module SHALL persist the user's last-selected translation in localStorage so it is restored on next visit.
4. IF the API_Client fails to fetch translations, THEN THE Bible_Module SHALL display a fallback list of at least 3 common translations (KJV, WEB, ASV) and show an error notice.
5. THE Bible_Module SHALL display the full translation name and abbreviation in the selector.

---

### Requirement 2: Book, Chapter, and Verse Navigation

**User Story:** As a user, I want to navigate to any book, chapter, and verse in the Bible, so that I can read any passage I choose.

#### Acceptance Criteria

1. THE Navigator SHALL display all 66 canonical Bible books grouped by Old Testament and New Testament.
2. WHEN a user selects a book, THE Navigator SHALL display the available chapters for that book.
3. WHEN a user selects a chapter, THE Reader SHALL fetch and display the full chapter text from the API_Client.
4. THE Reader SHALL support previous/next chapter navigation buttons so users can move sequentially through the Bible.
5. WHEN a user selects a specific verse reference from search results or a bookmark, THE Reader SHALL scroll to and highlight that verse within the chapter view.
6. THE Navigator SHALL support a URL-based deep link format (`/bible/:bibleId/:bookId/:chapter`) so specific passages can be shared or bookmarked in the browser.
7. IF a requested chapter does not exist (e.g., chapter number out of range), THEN THE Bible_Module SHALL display a descriptive error message and return the user to the book selector.

---

### Requirement 3: Chapter Text Display (Reader)

**User Story:** As a user, I want to read Bible chapters in a clean, readable format, so that I can focus on the scripture without distraction.

#### Acceptance Criteria

1. THE Reader SHALL display verse numbers inline with verse text.
2. THE Reader SHALL render chapter headings and section headings returned by the API_Client.
3. THE Reader SHALL support at least three font size options (small, medium, large) that the user can toggle.
4. THE Reader SHALL support a light mode and a dark mode display, consistent with the app's existing `ThemeContext`.
5. WHILE a chapter is loading, THE Reader SHALL display a skeleton loading state.
6. THE Reader SHALL display the book name, chapter number, and translation abbreviation as a persistent header while reading.
7. WHERE the app is in Kids Mode (via `KidsModeContext`), THE Reader SHALL increase the default font size to large and apply a child-friendly font.

---

### Requirement 4: Verse-Level Interaction (Highlight, Bookmark, Note)

**User Story:** As a user, I want to interact with individual verses by highlighting, bookmarking, and annotating them, so that I can study and remember important passages.

#### Acceptance Criteria

1. WHEN a user taps or clicks a verse, THE Reader SHALL display an action menu with options: Highlight, Bookmark, Add Note, Copy, and Share.
2. WHEN a User selects Highlight, THE Reader SHALL allow the user to choose from at least 4 highlight colors and apply the color to the selected verse(s).
3. WHEN a User selects Bookmark, THE Reader SHALL save the verse reference and text to the user's bookmark list via the Bible_Backend.
4. WHEN a User selects Add Note, THE Reader SHALL open an inline text input and save the note text linked to the verse reference via the Bible_Backend.
5. THE Reader SHALL visually display existing highlights and note indicators on verses when a chapter is loaded.
6. IF a Guest attempts to save a highlight, bookmark, or note, THEN THE Bible_Module SHALL prompt the user to sign in or create an account.
7. WHEN a User deletes a highlight or bookmark, THE Bible_Backend SHALL remove the record from the Turso database and THE Reader SHALL update the display immediately.

---

### Requirement 5: Bookmarks Management

**User Story:** As a user, I want to view and manage all my saved bookmarks in one place, so that I can quickly return to important passages.

#### Acceptance Criteria

1. THE Bible_Module SHALL provide a Bookmarks panel accessible from the main Bible UI.
2. THE Bible_Module SHALL fetch all bookmarks for the authenticated User from the Bible_Backend and display them grouped by book.
3. WHEN a user clicks a bookmark, THE Reader SHALL navigate to the corresponding chapter and scroll to the bookmarked verse.
4. THE Bible_Module SHALL allow users to delete individual bookmarks from the Bookmarks panel.
5. THE Bible_Module SHALL display the verse text preview alongside each bookmark entry.

---

### Requirement 6: Notes Management

**User Story:** As a user, I want to view and edit all my verse notes in one place, so that I can review my study annotations.

#### Acceptance Criteria

1. THE Bible_Module SHALL provide a Notes panel accessible from the main Bible UI.
2. THE Bible_Module SHALL fetch all notes for the authenticated User from the Bible_Backend and display them with the associated verse reference and text.
3. WHEN a user clicks a note entry, THE Reader SHALL navigate to the corresponding verse.
4. THE Bible_Module SHALL allow users to edit and delete notes from the Notes panel.
5. THE Bible_Backend SHALL store note content, verse reference, Bible ID, and timestamp for each note.

---

### Requirement 7: Full-Text Search

**User Story:** As a user, I want to search for words or phrases across the entire Bible, so that I can find specific passages quickly.

#### Acceptance Criteria

1. THE Search_Engine SHALL accept a text query and send it to the API_Client for full-text search against the selected translation.
2. WHEN search results are returned, THE Search_Engine SHALL display each result with the verse reference, a text snippet with the matching term highlighted, and a link to navigate to that verse.
3. THE Search_Engine SHALL display the total number of results found.
4. WHEN a user clicks a search result, THE Reader SHALL navigate to the corresponding chapter and scroll to the matching verse.
5. IF the search query returns no results, THEN THE Search_Engine SHALL display a "No results found" message with a suggestion to try a different translation.
6. THE Search_Engine SHALL debounce user input by 400ms before sending a search request to avoid excessive API calls.
7. IF the API_Client returns a search error, THEN THE Search_Engine SHALL display a descriptive error message.

---

### Requirement 8: Reading History and Progress Tracking

**User Story:** As a user, I want the app to remember which chapters I have read, so that I can track my progress through the Bible.

#### Acceptance Criteria

1. WHEN a User finishes reading a chapter (scrolls to the bottom or navigates away), THE Bible_Backend SHALL record the chapter as read with a timestamp.
2. THE Bible_Module SHALL display a visual progress indicator showing how many chapters of the current book have been read.
3. THE Bible_Module SHALL provide a "Continue Reading" shortcut that navigates to the last chapter the User was reading.
4. THE Bible_Backend SHALL expose an endpoint that returns the User's reading history, including total chapters read and last-read reference.
5. THE Bible_Module SHALL integrate with the existing `ReadingStats` page by writing chapter-read events to the same stats store.

---

### Requirement 9: Verse of the Day

**User Story:** As a user, I want to see a featured verse each day, so that I have a daily touchpoint with scripture.

#### Acceptance Criteria

1. THE Bible_Module SHALL display a Verse of the Day on the main Bible landing page.
2. THE Bible_Backend SHALL select or cache a Verse of the Day that changes at midnight UTC.
3. WHEN a user clicks the Verse of the Day, THE Reader SHALL navigate to the full chapter containing that verse.
4. THE Bible_Module SHALL allow users to share the Verse of the Day via the existing Share Cards feature at `/share`.

---

### Requirement 10: Offline Reading Support

**User Story:** As a user, I want to read previously loaded chapters when I am offline, so that I can access scripture without an internet connection.

#### Acceptance Criteria

1. WHEN a chapter is successfully loaded, THE Bible_Module SHALL cache the chapter text in the browser (IndexedDB or Cache API) for offline access.
2. WHILE the app is offline (detected via `OfflineContext`), THE Reader SHALL serve cached chapters and display an offline indicator.
3. IF a user attempts to navigate to a chapter that is not cached while offline, THEN THE Bible_Module SHALL display a message indicating the chapter is unavailable offline and list recently cached chapters.
4. THE Bible_Module SHALL cache the last 20 chapters read per user session.

---

### Requirement 11: Backend API Routes

**User Story:** As a developer, I want a set of Express backend routes that proxy API.Bible and persist user data, so that the frontend has a secure and consistent data layer.

#### Acceptance Criteria

1. THE Bible_Backend SHALL provide a `GET /api/bible/translations` route that returns available Bible translations from API.Bible.
2. THE Bible_Backend SHALL provide a `GET /api/bible/:bibleId/books` route that returns the list of books for a given Bible.
3. THE Bible_Backend SHALL provide a `GET /api/bible/:bibleId/chapters/:chapterId` route that returns the full chapter text.
4. THE Bible_Backend SHALL provide a `GET /api/bible/:bibleId/search?q=` route that proxies full-text search to API.Bible.
5. THE Bible_Backend SHALL provide authenticated CRUD routes for bookmarks: `GET`, `POST`, and `DELETE /api/bible/bookmarks`.
6. THE Bible_Backend SHALL provide authenticated CRUD routes for highlights: `GET`, `POST`, and `DELETE /api/bible/highlights`.
7. THE Bible_Backend SHALL provide authenticated CRUD routes for notes: `GET`, `POST`, `PUT`, and `DELETE /api/bible/notes`.
8. THE Bible_Backend SHALL provide a `POST /api/bible/reading-history` route that records a chapter-read event for the authenticated User.
9. THE Bible_Backend SHALL include the API.Bible API key in all outbound requests to `https://rest.api.bible` via a server-side header, so the key is never exposed to the client.
10. IF an unauthenticated request is made to a protected route (bookmarks, highlights, notes, reading history), THEN THE Bible_Backend SHALL return a 401 Unauthorized response.

---

### Requirement 12: Database Schema

**User Story:** As a developer, I want a Turso (SQLite) schema for Bible user data, so that bookmarks, highlights, notes, and reading history are persisted reliably.

#### Acceptance Criteria

1. THE Bible_Backend SHALL create a `bible_bookmarks` table with columns: `id`, `user_id`, `bible_id`, `book_id`, `chapter`, `verse`, `verse_text`, `created_at`.
2. THE Bible_Backend SHALL create a `bible_highlights` table with columns: `id`, `user_id`, `bible_id`, `book_id`, `chapter`, `verse`, `color`, `created_at`.
3. THE Bible_Backend SHALL create a `bible_notes` table with columns: `id`, `user_id`, `bible_id`, `book_id`, `chapter`, `verse`, `note_text`, `updated_at`, `created_at`.
4. THE Bible_Backend SHALL create a `bible_reading_history` table with columns: `id`, `user_id`, `bible_id`, `book_id`, `chapter`, `read_at`.
5. THE Bible_Backend SHALL enforce a unique constraint on `(user_id, bible_id, book_id, chapter, verse)` for the `bible_bookmarks` and `bible_highlights` tables to prevent duplicate entries.
