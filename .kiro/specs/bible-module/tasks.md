# Implementation Plan: Bible Module

## Overview

Replace the existing `BibleBookExplorer` page with a full Bible reader backed by API.Bible. The implementation is split into three phases: backend routes + DB schema, then the frontend reader component.

## Tasks

- [x] 1. Create backend Bible route with DB schema and API proxy
  - [x] 1.1 Create `server/routes/bible.js` with in-memory caching and DB init
    - Create the file with `require('../lib/turso')` for `execute` and `query`
    - On module load, run `CREATE TABLE IF NOT EXISTS` for `bible_bookmarks` and `bible_highlights`
    - `bible_bookmarks`: `id TEXT PK, user_id TEXT, bible_id TEXT, book_id TEXT, chapter_id TEXT, verse_id TEXT, verse_text TEXT, created_at TEXT`
    - `bible_highlights`: `id TEXT PK, user_id TEXT, bible_id TEXT, chapter_id TEXT, verse_id TEXT, color TEXT, created_at TEXT`
    - Add unique index on `(user_id, bible_id, chapter_id, verse_id)` for both tables
    - Set up in-memory cache Map with TTL helpers (24h for bibles, 1h for books/chapters list, 30min for chapter text)
    - Auth helper: extract `Authorization: Bearer <token>` header → `userId`; return 401 if missing on protected routes
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 11.6, 11.9, 11.10, 12.1, 12.2_

  - [x] 1.2 Implement read-only API proxy routes
    - `GET /api/bible/bibles` — fetch `https://api.scripture.api.bible/v1/bibles` with `api-key` header, cache 24h, return `data` array
    - `GET /api/bible/:bibleId/books` — fetch `/bibles/:bibleId/books`, cache 1h
    - `GET /api/bible/:bibleId/chapters/:bookId` — fetch `/bibles/:bibleId/books/:bookId/chapters`, cache 1h
    - `GET /api/bible/:bibleId/chapter/:chapterId` — fetch `/bibles/:bibleId/chapters/:chapterId?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`, cache 30min
    - `GET /api/bible/:bibleId/search?q=` — proxy to `/bibles/:bibleId/search?query=<q>&limit=20`, no cache
    - Use `node-fetch` or the built-in `fetch` (Node 18+); forward API errors with appropriate status codes
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.9_

  - [x] 1.3 Implement authenticated bookmark CRUD routes
    - `POST /api/bible/bookmarks` — auth required; body: `{ bibleId, bookId, chapterId, verseId, verseText }`; insert with `crypto.randomUUID()` id; use `INSERT OR IGNORE` to respect unique constraint
    - `GET /api/bible/bookmarks` — auth required; return all bookmarks for `userId` ordered by `created_at DESC`
    - `DELETE /api/bible/bookmarks/:id` — auth required; delete only if `user_id = userId`
    - _Requirements: 11.5, 11.10, 12.1_

  - [x] 1.4 Implement authenticated highlight CRUD routes
    - `POST /api/bible/highlights` — auth required; body: `{ bibleId, chapterId, verseId, color }`; insert with `INSERT OR REPLACE` to allow color updates
    - `GET /api/bible/highlights` — auth required; return all highlights for `userId`
    - `DELETE /api/bible/highlights/:id` — auth required; delete only if `user_id = userId`
    - _Requirements: 11.6, 11.10, 12.2_

  - [x] 1.5 Mount the bible router in `server/index.js`
    - Add `app.use('/api/bible', require('./routes/bible'))` after the existing `/api/leaderboard` line
    - _Requirements: 11.1_

- [x] 2. Build the Bible reader frontend component
  - [x] 2.1 Scaffold `src/pages/BibleBookExplorer.jsx` — state, API helpers, and layout shell
    - Replace entire file content
    - Import `useState, useEffect, useRef, useCallback` from React; import `useAuth` from `../context/AuthContext`
    - Define `DEFAULT_BIBLE_ID = 'de4e12af7f28f599-02'` (KJV)
    - Define `API` helper functions: `apiFetch(path)` → `fetch('/api/bible' + path)` with auth header when user is present
    - Top-level state: `bibles, selectedBible, books, selectedBook, chapters, selectedChapter, chapterContent, bookmarks, highlights, tab ('read'|'search'|'bookmarks'), fontSize ('md'|'sm'|'lg'), loading, error, activeVerse, versePopup`
    - Restore `selectedBible` from `localStorage` on mount; default to KJV
    - Layout: full-height flex column using CSS variables `--bg, --surface, --border, --ink, --ink2`
    - _Requirements: 1.1, 1.3, 3.5, 3.6_

  - [x] 2.2 Implement translation selector and book/chapter navigation
    - On mount: fetch `/api/bible/bibles` → populate `bibles` dropdown; if error show fallback `[{id:'de4e12af7f28f599-02',nameLocal:'King James Version',abbreviationLocal:'KJV'}, ...]`
    - Translation `<select>` at top: on change → set `selectedBible`, save to `localStorage`, reload chapter if one is open
    - Book selector: fetch `/api/bible/:bibleId/books` on bible change; render two-column grouped list (OT / NT) with search input filtering by name
    - Chapter selector: fetch `/api/bible/:bibleId/chapters/:bookId` on book select; render grid of chapter number buttons
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3_

  - [x] 2.3 Implement chapter reader with verse rendering
    - Fetch `/api/bible/:bibleId/chapter/:chapterId` on chapter select; store raw HTML in `chapterContent`
    - Render chapter HTML via `dangerouslySetInnerHTML` inside a styled `div.chapter-content`
    - Apply inline `<style>` scoped to `.chapter-content`: verse number spans (`[data-number]`, `.v`) styled small + muted; `h3,h4` headings styled; base font size driven by `fontSize` state (`sm=15px, md=18px, lg=22px`)
    - After render, attach click handlers to verse elements to set `activeVerse` and show `versePopup`
    - Show skeleton (3 animated gray bars) while `loading === true`
    - Show error card with retry button when `error` is set
    - Prev / Next chapter navigation buttons at bottom; disable at first/last chapter of book
    - Persistent header showing `{bookName} {chapterNum} · {translationAbbr}`
    - _Requirements: 2.3, 2.4, 3.1, 3.2, 3.3, 3.5, 3.6, 2.7_

  - [x] 2.4 Implement verse interaction popup (bookmark, highlight, copy, share)
    - When `activeVerse` is set, render a small floating popup near the verse with 4 actions: Bookmark 🔖, Highlight 🎨, Copy 📋, Share 🔗
    - Highlight sub-menu: 4 color swatches (yellow `#FCD34D`, green `#34D399`, blue `#60A5FA`, pink `#F472B6`); clicking a color calls `POST /api/bible/highlights`
    - Bookmark action: calls `POST /api/bible/bookmarks` with verse text extracted from the DOM element
    - Copy: `navigator.clipboard.writeText(verseText + ' — ' + verseRef)`
    - Share: `navigator.share` if available, else copy link to clipboard
    - If user is not authenticated: show inline prompt "Sign in to save bookmarks & highlights" instead of save actions
    - After save: close popup, refresh bookmarks/highlights state
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7_

  - [x] 2.5 Render highlights and bookmark indicators inline on verses
    - After chapter loads and highlights/bookmarks are fetched, iterate over verse DOM elements
    - For each verse matching a highlight: apply `borderLeft: '3px solid <color>'` and a faint background tint (`<color>22`)
    - For each verse matching a bookmark: prepend a 🔖 indicator span
    - Re-apply on every chapter navigation or after save/delete
    - _Requirements: 4.5, 4.7_

  - [x] 2.6 Implement search tab
    - Tab button "Search" switches `tab` to `'search'`
    - Text input with 400ms debounce; on submit calls `GET /api/bible/:bibleId/search?q=<query>`
    - Render results list: each item shows verse reference + snippet; clicking navigates to that chapter and scrolls to verse
    - Show total result count; show "No results found" when empty; show error state on API failure
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 2.7 Implement bookmarks panel tab
    - Tab button "Bookmarks 🔖" switches `tab` to `'bookmarks'`
    - Fetch `GET /api/bible/bookmarks` on tab open (if authenticated)
    - Render list of bookmarks with verse reference, verse text preview, and delete button
    - Clicking a bookmark navigates to that chapter; delete calls `DELETE /api/bible/bookmarks/:id` then refreshes list
    - If not authenticated: show "Sign in to view your bookmarks"
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.8 Add font size toggle and final polish
    - Three-button toggle (A- / A / A+) in the header toolbar sets `fontSize` state (`sm/md/lg`)
    - Ensure all interactive elements use CSS variable colors (`--ink`, `--surface`, `--border`, `--blue`, etc.)
    - Ensure the component works for unauthenticated users (read-only mode)
    - Verify prev/next chapter navigation wraps correctly across books
    - _Requirements: 3.3, 4.6_

- [x] 3. Checkpoint — verify backend and frontend wire up correctly
  - Ensure all tests pass, ask the user if questions arise.
  - Confirm `/api/bible/bibles` returns data with the API key in the server header (key never sent to client)
  - Confirm bookmarks and highlights persist across page reloads for authenticated users
  - Confirm unauthenticated users can read chapters but see the sign-in prompt on save attempts

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The API key `I8LpaQ_H2CEc1BTNLIXj8` must only appear in `server/routes/bible.js`, never in frontend code
- Chapter IDs from API.Bible look like `GEN.1`, `JHN.3` — pass them as-is to the chapter endpoint
- Chapter HTML from API.Bible contains verse spans with class `v` for verse numbers — style these in the scoped inline `<style>` block
- All inline styles should use CSS variables where possible to respect light/dark theme
