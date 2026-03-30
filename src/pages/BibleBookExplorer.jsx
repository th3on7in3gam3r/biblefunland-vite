import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_BIBLE_ID = 'de4e12af7f28f599-02'; // KJV

const FALLBACK_BIBLES = [
  { id: 'de4e12af7f28f599-02', nameLocal: 'King James Version', abbreviationLocal: 'KJV' },
  { id: '9879dbb7cfe39e4d-04', nameLocal: 'World English Bible', abbreviationLocal: 'WEB' },
  { id: '06125adad2d5898a-01', nameLocal: 'American Standard Version', abbreviationLocal: 'ASV' },
];

const HIGHLIGHT_COLORS = [
  { color: '#FCD34D', label: 'Yellow' },
  { color: '#34D399', label: 'Green' },
  { color: '#60A5FA', label: 'Blue' },
  { color: '#F472B6', label: 'Pink' },
];

const FONT_SIZES = { sm: '15px', md: '18px', lg: '22px' };

// ─── API helpers ──────────────────────────────────────────────────────────────
function makeApiFetch(userId) {
  return async function apiFetch(path) {
    const headers = { 'Content-Type': 'application/json' };
    if (userId) headers['Authorization'] = `Bearer ${userId}`;
    const res = await fetch('/api/bible' + path, { headers });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  };
}

async function apiPost(path, body, userId) {
  const headers = { 'Content-Type': 'application/json' };
  if (userId) headers['Authorization'] = `Bearer ${userId}`;
  const res = await fetch('/api/bible' + path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function apiDelete(path, userId) {
  const headers = { 'Content-Type': 'application/json' };
  if (userId) headers['Authorization'] = `Bearer ${userId}`;
  const res = await fetch('/api/bible' + path, { method: 'DELETE', headers });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ padding: '24px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            height: i % 3 === 0 ? '14px' : '18px',
            background: 'var(--border)',
            borderRadius: '6px',
            marginBottom: '14px',
            width: i % 2 === 0 ? '80%' : '100%',
            animation: 'pulse 1.5s ease-in-out infinite',
            opacity: 0.6,
          }}
        />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BibleBookExplorer() {
  const { user } = useAuth();
  const userId = user?.id || null;

  // Translation / navigation state
  const [bibles, setBibles] = useState([]);
  const [selectedBible, setSelectedBible] = useState(
    () => localStorage.getItem('bible_selected') || DEFAULT_BIBLE_ID
  );
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterContent, setChapterContent] = useState(null); // { content, reference, next, previous }

  // User data
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);

  // UI state
  const [tab, setTab] = useState('read'); // 'read' | 'search' | 'bookmarks'
  const [fontSize, setFontSize] = useState('md');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookSearch, setBookSearch] = useState('');

  // Verse popup
  const [activeVerse, setActiveVerse] = useState(null); // { verseId, verseText, ref, el }
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchDebounce = useRef(null);

  const chapterRef = useRef(null);
  const apiFetch = useCallback(makeApiFetch(userId), [userId]);

  // ─── Load bibles on mount ────────────────────────────────────────────────
  useEffect(() => {
    apiFetch('/bibles')
      .then((json) =>
        setBibles(
          (json.data || FALLBACK_BIBLES).sort((a, b) => a.nameLocal.localeCompare(b.nameLocal))
        )
      )
      .catch(() => setBibles(FALLBACK_BIBLES));
  }, [apiFetch]);

  // ─── Load books when bible changes ──────────────────────────────────────
  useEffect(() => {
    if (!selectedBible) return;
    setBooks([]);
    setSelectedBook(null);
    setChapters([]);
    setSelectedChapter(null);
    setChapterContent(null);
    apiFetch(`/${selectedBible}/books`)
      .then((json) => setBooks(json.data || []))
      .catch((err) => console.error('Books fetch error:', err));
  }, [selectedBible, apiFetch]);

  // ─── Load chapters when book changes ────────────────────────────────────
  useEffect(() => {
    if (!selectedBook) return;
    setChapters([]);
    setSelectedChapter(null);
    setChapterContent(null);
    apiFetch(`/${selectedBible}/chapters/${selectedBook.id}`)
      .then((json) => {
        const real = (json.data || []).filter((c) => !c.id.endsWith('intro'));
        setChapters(real);
      })
      .catch((err) => console.error('Chapters fetch error:', err));
  }, [selectedBook, selectedBible, apiFetch]);

  // ─── Handle Deep Links (?q=Luke 1:1-25) ─────────────────────────────────
  useEffect(() => {
    if (books.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      // Standardize "1 Corinthians" etc to parse safely
      const match = q.match(/^(\d?\s*[a-zA-Z]+)\s+(\d+)/);
      if (match) {
        const bookName = match[1].trim();
        const chapterNum = match[2];
        // Exact or strong partial match for book
        const book = books.find(
          (b) =>
            b.name.toLowerCase() === bookName.toLowerCase() ||
            b.name.toLowerCase().startsWith(bookName.toLowerCase())
        );
        if (book) {
          setSelectedBook(book);
          // Pre-emptively load chapter content without waiting for chapters array
          apiFetch(`/${selectedBible}/chapter/${book.id}.${chapterNum}`)
            .then((json) => {
              setChapterContent(json.data);
              setSelectedChapter(json.data);
              setTab('read');
            })
            .catch((err) => console.error(err));

          // Clear query to prevent re-triggering
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }
      // Fallback: Perform general search
      setTab('search');
      handleSearchInput(q);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [books]);

  // ─── Load chapter content ────────────────────────────────────────────────
  const loadChapter = useCallback(
    async (chapterId) => {
      setLoading(true);
      setError(null);
      setChapterContent(null);
      setActiveVerse(null);
      try {
        const json = await apiFetch(`/${selectedBible}/chapter/${chapterId}`);
        setChapterContent(json.data);
        setSelectedChapter(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [selectedBible, apiFetch]
  );

  // ─── Load user bookmarks & highlights ───────────────────────────────────
  const loadUserData = useCallback(async () => {
    if (!userId) return;
    try {
      const [bm, hl] = await Promise.all([apiFetch('/bookmarks'), apiFetch('/highlights')]);
      setBookmarks(bm.data || []);
      setHighlights(hl.data || []);
    } catch (err) {
      console.error('User data fetch error:', err);
    }
  }, [userId, apiFetch]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // ─── DOM Preparation & Event Handling ────────────────────────────────────
  useEffect(() => {
    if (!chapterContent || !chapterRef.current) return;
    const container = chapterRef.current;

    // 1. Wrap un-wrapped text nodes into clickable spans
    if (container.dataset.wrapped !== chapterContent.id) {
      const markers = Array.from(container.querySelectorAll('.v'));
      markers.forEach((marker) => {
        const sid = marker.getAttribute('data-sid') || marker.getAttribute('data-number');
        if (!sid) return;

        const wrapper = document.createElement('span');
        wrapper.className = 'verse-wrap';
        wrapper.setAttribute('data-verse', sid);

        marker.parentNode.insertBefore(wrapper, marker);
        let curr = marker;
        while (curr) {
          if (curr !== marker && curr.nodeType === 1 && curr.classList.contains('v')) {
            break;
          }
          const next = curr.nextSibling;
          wrapper.appendChild(curr);
          curr = next;
        }
      });
      container.dataset.wrapped = chapterContent.id;
    }

    // 2. Clear old highlights visually
    container.querySelectorAll('.bm-indicator').forEach((el) => el.remove());
    container.querySelectorAll('.verse-wrap').forEach((el) => {
      el.style.borderLeft = '';
      el.style.paddingLeft = '';
      el.style.backgroundColor = '';
      el.style.borderRadius = '';
    });

    // 3. Apply highlights
    highlights
      .filter((h) => h.chapter_id === chapterContent.id && h.bible_id === selectedBible)
      .forEach((h) => {
        const el = container.querySelector(`.verse-wrap[data-verse="${h.verse_id}"]`);
        if (el) {
          el.style.borderLeft = `3px solid ${h.color}`;
          el.style.paddingLeft = '8px';
          el.style.backgroundColor = h.color + '22';
          el.style.borderRadius = '2px';
        }
      });

    // 4. Apply bookmarks
    bookmarks
      .filter((b) => b.chapter_id === chapterContent.id && b.bible_id === selectedBible)
      .forEach((b) => {
        const el = container.querySelector(`.verse-wrap[data-verse="${b.verse_id}"]`);
        if (el) {
          const span = document.createElement('span');
          span.className = 'bm-indicator';
          span.textContent = '🔖';
          span.style.cssText = 'font-size:12px;margin-right:4px;';
          el.prepend(span);
        }
      });

    // 5. Handle Clicks
    function handleVerseClick(e) {
      let el = e.target;
      while (el && el !== container) {
        const usfm = el.getAttribute('data-verse');
        if (usfm) {
          const rect = el.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          setPopupPos({
            top: rect.top - containerRect.top + container.scrollTop - 60,
            left: Math.min(rect.left - containerRect.left, containerRect.width - 220),
          });
          setActiveVerse({
            verseId: usfm,
            verseText: el.textContent?.replace(/^\d+\s*/, '').trim() || '',
            ref: usfm,
            el,
          });
          setShowHighlightPicker(false);
          return;
        }
        el = el.parentElement;
      }
      setActiveVerse(null);
    }

    container.addEventListener('click', handleVerseClick);
    return () => container.removeEventListener('click', handleVerseClick);
  }, [chapterContent, highlights, bookmarks, selectedBible]);

  // ─── Bookmark save ───────────────────────────────────────────────────────
  async function saveBookmark() {
    if (!userId || !activeVerse || !chapterContent) return;
    try {
      await apiPost(
        '/bookmarks',
        {
          bibleId: selectedBible,
          bookId: selectedBook?.id || '',
          chapterId: chapterContent.id,
          verseId: activeVerse.verseId,
          verseText: activeVerse.verseText,
        },
        userId
      );
      await loadUserData();
      setActiveVerse(null);
    } catch (err) {
      console.error('Bookmark save error:', err);
    }
  }

  // ─── Highlight save ──────────────────────────────────────────────────────
  async function saveHighlight(color) {
    if (!userId || !activeVerse || !chapterContent) return;
    try {
      await apiPost(
        '/highlights',
        {
          bibleId: selectedBible,
          chapterId: chapterContent.id,
          verseId: activeVerse.verseId,
          color,
        },
        userId
      );
      await loadUserData();
      setActiveVerse(null);
      setShowHighlightPicker(false);
    } catch (err) {
      console.error('Highlight save error:', err);
    }
  }

  // ─── Delete bookmark ─────────────────────────────────────────────────────
  async function deleteBookmark(id) {
    try {
      await apiDelete(`/bookmarks/${id}`, userId);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Delete bookmark error:', err);
    }
  }

  // ─── Search ──────────────────────────────────────────────────────────────
  function handleSearchInput(val) {
    setSearchQuery(val);
    clearTimeout(searchDebounce.current);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }
    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const json = await apiFetch(`/${selectedBible}/search?q=${encodeURIComponent(val)}`);
        setSearchResults(json.data || { verses: [], total: 0 });
      } catch (err) {
        setSearchError(err.message);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }

  // ─── Navigate to chapter from bookmark/search ────────────────────────────
  async function navigateToChapter(bibleId, bookId, chapterId) {
    if (bibleId !== selectedBible) {
      setSelectedBible(bibleId);
      localStorage.setItem('bible_selected', bibleId);
    }
    // Find book
    const book = books.find((b) => b.id === bookId);
    if (book) setSelectedBook(book);
    await loadChapter(chapterId);
    setTab('read');
  }

  // ─── Derived values ──────────────────────────────────────────────────────
  const currentBibleMeta = bibles.find((b) => b.id === selectedBible) || FALLBACK_BIBLES[0];
  const otBooks = books.filter((b) => {
    const ntStart = books.findIndex((x) => x.id === 'MAT');
    const idx = books.indexOf(b);
    return ntStart === -1 ? true : idx < ntStart;
  });
  const ntBooks = books.filter((b) => !otBooks.includes(b));
  const filteredOT = otBooks.filter((b) => b.name.toLowerCase().includes(bookSearch.toLowerCase()));
  const filteredNT = ntBooks.filter((b) => b.name.toLowerCase().includes(bookSearch.toLowerCase()));

  const currentChapterIdx = chapters.findIndex((c) => c.id === chapterContent?.id);
  const prevChapter = currentChapterIdx > 0 ? chapters[currentChapterIdx - 1] : null;
  const nextChapter =
    currentChapterIdx < chapters.length - 1 ? chapters[currentChapterIdx + 1] : null;

  // ─── Styles ──────────────────────────────────────────────────────────────
  const s = {
    page: {
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--ink)',
      fontFamily: 'inherit',
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      flexWrap: 'wrap',
    },
    select: {
      background: 'var(--bg)',
      color: 'var(--ink)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      padding: '5px 8px',
      fontSize: '13px',
      cursor: 'pointer',
    },
    tabBar: {
      display: 'flex',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
    },
    tab: (active) => ({
      padding: '10px 18px',
      fontSize: '13px',
      fontWeight: active ? '600' : '400',
      color: active ? 'var(--blue)' : 'var(--ink2)',
      cursor: 'pointer',
      background: 'none',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottom: active ? '2px solid var(--blue)' : '2px solid transparent',
    }),
    body: {
      maxWidth: '720px',
      margin: '0 auto',
      padding: '0 16px 80px',
    },
    fontBtn: (active) => ({
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: active ? '700' : '400',
      background: active ? 'var(--blue-bg)' : 'transparent',
      color: active ? 'var(--blue)' : 'var(--ink2)',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      cursor: 'pointer',
    }),
    navBtn: (disabled) => ({
      padding: '8px 16px',
      background: disabled ? 'var(--border)' : 'var(--blue)',
      color: disabled ? 'var(--ink3)' : '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: disabled ? 'default' : 'pointer',
      fontSize: '13px',
      fontWeight: '500',
    }),
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Hero header */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
          padding: '60px 36px 44px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,4.5vw,3.4rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#60A5FA,#C084FC,#F472B6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          📖 Bible Explorer
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500 }}>
          Read, search, bookmark, and highlight scripture across multiple translations
        </p>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <span style={{ fontWeight: '700', fontSize: '16px', marginRight: '4px' }}>📖</span>
        <select
          style={s.select}
          value={selectedBible}
          onChange={(e) => {
            setSelectedBible(e.target.value);
            localStorage.setItem('bible_selected', e.target.value);
          }}
        >
          {bibles.map((b) => (
            <option key={b.id} value={b.id}>
              {b.abbreviationLocal} — {b.nameLocal}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          {['sm', 'md', 'lg'].map((sz) => (
            <button key={sz} style={s.fontBtn(fontSize === sz)} onClick={() => setFontSize(sz)}>
              {sz === 'sm' ? 'A−' : sz === 'md' ? 'A' : 'A+'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={s.tabBar}>
        <button style={s.tab(tab === 'read')} onClick={() => setTab('read')}>
          Read
        </button>
        <button style={s.tab(tab === 'search')} onClick={() => setTab('search')}>
          Search
        </button>
      </div>

      <div style={s.body}>
        {/* ── READ TAB ── */}
        {tab === 'read' && (
          <>
            {/* Book selector */}
            {!selectedBook && (
              <BookSelector
                filteredOT={filteredOT}
                filteredNT={filteredNT}
                bookSearch={bookSearch}
                setBookSearch={setBookSearch}
                onSelect={(book) => setSelectedBook(book)}
              />
            )}

            {/* Chapter selector */}
            {selectedBook && !chapterContent && !loading && (
              <ChapterSelector
                book={selectedBook}
                chapters={chapters}
                onBack={() => setSelectedBook(null)}
                onSelect={(ch) => loadChapter(ch.id)}
              />
            )}

            {/* Loading skeleton */}
            {loading && <Skeleton />}

            {/* Error state */}
            {error && !loading && (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ color: 'var(--red)', marginBottom: '12px' }}>⚠️ {error}</p>
                <button
                  style={{ ...s.navBtn(false), background: 'var(--red)' }}
                  onClick={() => selectedChapter && loadChapter(selectedChapter.id)}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Chapter reader */}
            {chapterContent && !loading && (
              <ChapterReader
                chapterContent={chapterContent}
                selectedBook={selectedBook}
                currentBibleMeta={currentBibleMeta}
                fontSize={fontSize}
                chapterRef={chapterRef}
                activeVerse={activeVerse}
                setActiveVerse={setActiveVerse}
                showHighlightPicker={showHighlightPicker}
                setShowHighlightPicker={setShowHighlightPicker}
                popupPos={popupPos}
                userId={userId}
                prevChapter={prevChapter}
                nextChapter={nextChapter}
                onPrev={() => prevChapter && loadChapter(prevChapter.id)}
                onNext={() => nextChapter && loadChapter(nextChapter.id)}
                onBack={() => {
                  setChapterContent(null);
                  setSelectedChapter(null);
                }}
                onBookmark={saveBookmark}
                onHighlight={saveHighlight}
                navBtnStyle={s.navBtn}
              />
            )}
          </>
        )}

        {/* ── SEARCH TAB ── */}
        {tab === 'search' && (
          <SearchTab
            query={searchQuery}
            onQueryChange={handleSearchInput}
            results={searchResults}
            loading={searchLoading}
            error={searchError}
            onNavigate={(verse) => {
              const parts = verse.id.split('.');
              const bookId = parts[0];
              const chapterId = parts.slice(0, 2).join('.');
              navigateToChapter(selectedBible, bookId, chapterId);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BookSelector({ filteredOT, filteredNT, bookSearch, setBookSearch, onSelect }) {
  // Sort alphabetically within each testament
  const sortedOT = [...filteredOT].sort((a, b) => a.name.localeCompare(b.name));
  const sortedNT = [...filteredNT].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <span
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1rem',
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Search books..."
          value={bookSearch}
          onChange={(e) => setBookSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '11px 12px 11px 38px',
            borderRadius: '12px',
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            fontSize: '14px',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>
      {sortedOT.length > 0 && (
        <BookGroup title="📜 Old Testament" books={sortedOT} onSelect={onSelect} color="#F59E0B" />
      )}
      {sortedNT.length > 0 && (
        <BookGroup title="✝️ New Testament" books={sortedNT} onSelect={onSelect} color="#3B82F6" />
      )}
    </div>
  );
}

// Book emoji map for visual flair
const BOOK_EMOJI = {
  GEN: '🌍',
  EXO: '🔥',
  LEV: '🕍',
  NUM: '🏕️',
  DEU: '📜',
  JOS: '⚔️',
  JDG: '🗡️',
  RUT: '🌾',
  '1SA': '👑',
  '2SA': '🏰',
  '1KI': '✨',
  '2KI': '💔',
  '1CH': '📋',
  '2CH': '🏛️',
  EZR: '🏗️',
  NEH: '🧱',
  EST: '👸',
  JOB: '💎',
  PSA: '🎵',
  PRO: '📖',
  ECC: '🌀',
  SNG: '💝',
  ISA: '🦁',
  JER: '😢',
  LAM: '💧',
  EZK: '🌊',
  DAN: '🦁',
  HOS: '💍',
  JOL: '🌾',
  AMO: '⚖️',
  OBA: '📣',
  JON: '🐋',
  MIC: '⚖️',
  NAH: '⚡',
  HAB: '🤔',
  ZEP: '📣',
  HAG: '🏗️',
  ZEC: '🐎',
  MAL: '🌅',
  MAT: '✡️',
  MRK: '⚡',
  LUK: '🏥',
  JHN: '❤️',
  ACT: '🔥',
  ROM: '⚖️',
  '1CO': '💒',
  '2CO': '💪',
  GAL: '🔓',
  EPH: '🛡️',
  PHP: '😊',
  COL: '🌟',
  '1TH': '📬',
  '2TH': '⏰',
  '1TI': '📝',
  '2TI': '🏆',
  TIT: '📋',
  PHM: '🤝',
  HEB: '⛪',
  JAS: '🌿',
  '1PE': '🪨',
  '2PE': '⚠️',
  '1JN': '❤️',
  '2JN': '✉️',
  '3JN': '✉️',
  JUD: '⚔️',
  REV: '🌈',
};

function BookGroup({ title, books, onSelect, color }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '.72rem',
          fontWeight: 800,
          letterSpacing: '.5px',
          textTransform: 'uppercase',
          padding: '4px 14px',
          borderRadius: 100,
          background: color + '18',
          color,
          border: `1px solid ${color}30`,
          marginBottom: '14px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '10px',
        }}
      >
        {books.map((book) => {
          const emoji = BOOK_EMOJI[book.id] || '📖';
          return (
            <button
              key={book.id}
              onClick={() => onSelect(book)}
              style={{
                padding: '14px 12px',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderRadius: '14px',
                color: 'var(--ink)',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = color + '12';
                e.currentTarget.style.borderColor = color + '55';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 20px ${color}18`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{emoji}</span>
              <span style={{ lineHeight: 1.3 }}>{book.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChapterSelector({ book, chapters, onBack, onSelect }) {
  const emoji = BOOK_EMOJI[book.id] || '📖';
  return (
    <div style={{ paddingTop: '20px' }}>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--blue-bg)',
          border: '1px solid var(--blue)',
          color: 'var(--blue)',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 700,
          padding: '6px 14px',
          borderRadius: 99,
          marginBottom: '20px',
        }}
      >
        ← Books
      </button>

      {/* Book header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: '24px',
          padding: '20px 22px',
          borderRadius: 18,
          background: 'linear-gradient(135deg,var(--blue-bg),var(--violet-bg))',
          border: '1.5px solid var(--border)',
        }}
      >
        <div style={{ fontSize: '2.8rem', lineHeight: 1 }}>{emoji}</div>
        <div>
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}
          >
            {book.name}
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--ink3)', fontWeight: 600, marginTop: 3 }}>
            {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: '.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.05em',
          color: 'var(--ink3)',
          marginBottom: '12px',
        }}
      >
        Select a Chapter
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
          gap: '10px',
        }}
      >
        {chapters.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => onSelect(ch)}
            style={{
              padding: '14px 4px',
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--ink)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all .2s',
              fontFamily: "'Baloo 2',cursive",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--blue)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'var(--blue)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(59,130,246,.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.color = 'var(--ink)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChapterReader({
  chapterContent,
  selectedBook,
  currentBibleMeta,
  fontSize,
  chapterRef,
  activeVerse,
  setActiveVerse,
  showHighlightPicker,
  setShowHighlightPicker,
  popupPos,
  userId,
  prevChapter,
  nextChapter,
  onPrev,
  onNext,
  onBack,
  onBookmark,
  onHighlight,
  navBtnStyle,
}) {
  return (
    <div style={{ paddingTop: '16px', position: 'relative' }}>
      {/* Chapter header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--blue)',
            cursor: 'pointer',
            fontSize: '13px',
            padding: 0,
          }}
        >
          ← {selectedBook?.name}
        </button>
        <span style={{ fontSize: '12px', color: 'var(--ink3)', fontWeight: '600' }}>
          {currentBibleMeta?.abbreviationLocal}
        </span>
      </div>

      <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: 'var(--ink)' }}>
        {chapterContent.reference}
      </h1>

      <div
        style={{
          background: 'var(--blue-bg)',
          border: '1px solid var(--blue)',
          color: 'var(--blue)',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 600,
          display: 'inline-block',
          marginBottom: '24px',
        }}
      >
        💡 <strong>Tip:</strong> Tap on any verse text to highlight or bookmark it.
      </div>

      {/* Verse popup */}
      {activeVerse && (
        <VersePopup
          activeVerse={activeVerse}
          popupPos={popupPos}
          userId={userId}
          showHighlightPicker={showHighlightPicker}
          setShowHighlightPicker={setShowHighlightPicker}
          onClose={() => {
            setActiveVerse(null);
            setShowHighlightPicker(false);
          }}
          onBookmark={onBookmark}
          onHighlight={onHighlight}
        />
      )}

      {/* Chapter HTML content */}
      <div ref={chapterRef} style={{ position: 'relative' }}>
        <style>{`
          .chapter-content { font-size: ${FONT_SIZES[fontSize]}; line-height: 1.8; color: var(--ink); }
          .chapter-content .v { font-size: 0.65em; font-weight: 700; color: var(--ink3); vertical-align: super; margin-right: 3px; }
          .chapter-content h3, .chapter-content h4 { font-size: 1em; font-weight: 700; color: var(--ink2); margin: 1.2em 0 0.4em; }
          .chapter-content p { margin: 0 0 0.6em; }
          .chapter-content span.verse-wrap { cursor: pointer; border-radius: 4px; transition: background 0.15s; padding: 2px 0; }
          .chapter-content span.verse-wrap:hover { background: var(--blue-bg); }
        `}</style>
        <div
          className="chapter-content"
          dangerouslySetInnerHTML={{ __html: chapterContent.content || '' }}
        />
      </div>

      {/* Prev / Next navigation */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '12px' }}
      >
        <button style={navBtnStyle(!prevChapter)} disabled={!prevChapter} onClick={onPrev}>
          ← Previous
        </button>
        <button style={navBtnStyle(!nextChapter)} disabled={!nextChapter} onClick={onNext}>
          Next →
        </button>
      </div>
    </div>
  );
}

function VersePopup({
  activeVerse,
  popupPos,
  userId,
  showHighlightPicker,
  setShowHighlightPicker,
  onClose,
  onBookmark,
  onHighlight,
}) {
  const popupStyle = {
    position: 'absolute',
    top: `${popupPos.top}px`,
    left: `${Math.max(0, popupPos.left)}px`,
    zIndex: 100,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    padding: '10px',
    minWidth: '200px',
  };

  const btnStyle = {
    display: 'block',
    width: '100%',
    padding: '7px 10px',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    color: 'var(--ink)',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
  };

  async function handleCopy() {
    const text = `${activeVerse.verseText} — ${activeVerse.ref}`;
    await navigator.clipboard.writeText(text).catch(() => {});
    onClose();
  }

  async function handleShare() {
    const text = `${activeVerse.verseText} — ${activeVerse.ref}`;
    if (navigator.share) {
      await navigator.share({ text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
    }
    onClose();
  }

  return (
    <div style={popupStyle}>
      <div
        style={{ fontSize: '11px', color: 'var(--ink3)', marginBottom: '6px', fontWeight: '600' }}
      >
        {activeVerse.ref}
      </div>

      {!userId ? (
        <div style={{ fontSize: '12px', color: 'var(--ink2)', padding: '4px 0' }}>
          <a href="/auth" style={{ color: 'var(--blue)' }}>
            Sign in
          </a>{' '}
          to save bookmarks & highlights
        </div>
      ) : (
        <>
          <button
            style={btnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            onClick={onBookmark}
          >
            🔖 Bookmark
          </button>
          <button
            style={btnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            onClick={() => setShowHighlightPicker((p) => !p)}
          >
            🎨 Highlight
          </button>
          {showHighlightPicker && (
            <div style={{ display: 'flex', gap: '6px', padding: '6px 10px' }}>
              {HIGHLIGHT_COLORS.map(({ color, label }) => (
                <button
                  key={color}
                  title={label}
                  onClick={() => onHighlight(color)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: color,
                    border: '2px solid var(--border)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      <button
        style={btnStyle}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-bg)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        onClick={handleCopy}
      >
        📋 Copy
      </button>
      <button
        style={btnStyle}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-bg)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        onClick={handleShare}
      >
        🔗 Share
      </button>
      <button style={{ ...btnStyle, color: 'var(--ink3)', fontSize: '11px' }} onClick={onClose}>
        ✕ Close
      </button>
    </div>
  );
}

function SearchTab({ query, onQueryChange, results, loading, error, onNavigate }) {
  return (
    <div style={{ paddingTop: '16px' }}>
      <input
        type="text"
        placeholder="Search the Bible..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--ink)',
          fontSize: '15px',
          marginBottom: '16px',
          boxSizing: 'border-box',
        }}
      />

      {loading && <Skeleton />}

      {error && <p style={{ color: 'var(--red)', fontSize: '13px' }}>⚠️ {error}</p>}

      {results && !loading && (
        <>
          <p style={{ fontSize: '12px', color: 'var(--ink3)', marginBottom: '12px' }}>
            {results.total || results.verses?.length || 0} results
          </p>
          {(!results.verses || results.verses.length === 0) && (
            <p style={{ color: 'var(--ink2)', fontSize: '14px' }}>
              No results found. Try a different translation or search term.
            </p>
          )}
          {(results.verses || []).map((verse) => (
            <button
              key={verse.id}
              onClick={() => onNavigate(verse)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '12px',
                marginBottom: '8px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--ink)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--blue)',
                  marginBottom: '4px',
                }}
              >
                {verse.reference}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink2)', lineHeight: '1.5' }}>
                {verse.text}
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function BookmarksTab({ userId, bookmarks, onDelete, onNavigate }) {
  if (!userId) {
    return (
      <div style={{ paddingTop: '32px', textAlign: 'center', color: 'var(--ink2)' }}>
        <p style={{ fontSize: '15px', marginBottom: '8px' }}>🔖 Your bookmarks will appear here</p>
        <a href="/auth" style={{ color: 'var(--blue)', fontSize: '14px' }}>
          Sign in to save bookmarks
        </a>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div style={{ paddingTop: '32px', textAlign: 'center', color: 'var(--ink2)' }}>
        <p style={{ fontSize: '15px' }}>No bookmarks yet. Tap a verse while reading to save it.</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '16px' }}>
      {bookmarks.map((bm) => (
        <div
          key={bm.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px',
            marginBottom: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        >
          <button
            onClick={() => onNavigate(bm)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
              color: 'var(--ink)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--blue)',
                marginBottom: '4px',
              }}
            >
              {bm.verse_id}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--ink2)', lineHeight: '1.5' }}>
              {bm.verse_text || '—'}
            </div>
          </button>
          <button
            onClick={() => onDelete(bm.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink3)',
              fontSize: '16px',
              padding: '2px 4px',
              flexShrink: 0,
            }}
            title="Delete bookmark"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
