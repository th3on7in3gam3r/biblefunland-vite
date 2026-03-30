import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BIBLE_BOOKS, resolveBook } from '../lib/bibleMap';

const DEFAULT_BIBLE_ID = 'de4e12af7f28f599-02'; // KJV
const FALLBACK_BIBLES = [
  { id: 'de4e12af7f28f599-02', nameLocal: 'King James Version', abbreviationLocal: 'KJV' },
  { id: '9879dbb7cfe39e4d-04', nameLocal: 'World English Bible', abbreviationLocal: 'WEB' },
  { id: '06125adad2d5898a-01', nameLocal: 'American Standard Version', abbreviationLocal: 'ASV' },
];

const FONT_SIZES = { sm: '15px', md: '18px', lg: '22px' };
const HIGHLIGHT_COLORS = [
  { color: '#FCD34D', label: 'Yellow' },
  { color: '#34D399', label: 'Green' },
  { color: '#60A5FA', label: 'Blue' },
  { color: '#F472B6', label: 'Pink' },
];

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

export default function BibleReader() {
  const { book: bookParam, chapter: chapterParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || null;

  const [bibles, setBibles] = useState([]);
  const [selectedBible, setSelectedBible] = useState(
    () => localStorage.getItem('bible_selected') || DEFAULT_BIBLE_ID
  );
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('bible_font_size') || 'md');
  const [chapterContent, setChapterContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [activeVerse, setActiveVerse] = useState(null);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  const chapterRef = useRef(null);

  // API helpers
  const apiFetch = useCallback(
    async (path) => {
      const headers = { 'Content-Type': 'application/json' };
      if (userId) headers['Authorization'] = `Bearer ${userId}`;
      const res = await fetch('/api/bible' + path, { headers });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return res.json();
    },
    [userId]
  );

  const apiPost = async (path, body) => {
    const headers = { 'Content-Type': 'application/json' };
    if (userId) headers['Authorization'] = `Bearer ${userId}`;
    const res = await fetch('/api/bible' + path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return res.json();
  };

  // Load Bibles
  useEffect(() => {
    apiFetch('/bibles')
      .then((json) =>
        setBibles(
          (json.data || FALLBACK_BIBLES).sort((a, b) => a.nameLocal.localeCompare(b.nameLocal))
        )
      )
      .catch(() => setBibles(FALLBACK_BIBLES));
  }, [apiFetch]);

  // Load User Data
  const loadUserData = useCallback(async () => {
    if (!userId) return;
    try {
      const [bm, hl] = await Promise.all([apiFetch('/bookmarks'), apiFetch('/highlights')]);
      setBookmarks(bm.data || []);
      setHighlights(hl.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [userId, apiFetch]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Resolve Book and navigation
  const resolvedBook = resolveBook(bookParam);
  const currentChapter = parseInt(chapterParam) || null;

  // Load Content
  useEffect(() => {
    if (!resolvedBook || !currentChapter) {
      setChapterContent(null);
      return;
    }

    const chapterId = `${resolvedBook.id}.${currentChapter}`;
    setLoading(true);
    setError(null);
    setActiveVerse(null);

    apiFetch(`/${selectedBible}/chapter/${chapterId}`)
      .then((json) => {
        setChapterContent(json.data);
        window.scrollTo(0, 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [resolvedBook, currentChapter, selectedBible, apiFetch]);

  // Apply highlights/bookmarks to DOM
  useEffect(() => {
    if (!chapterContent || !chapterRef.current) return;
    const container = chapterRef.current;

    // Clear previous
    container.querySelectorAll('.bm-indicator').forEach((el) => el.remove());
    container.querySelectorAll('[data-usfm], [data-verse]').forEach((el) => {
      el.style.borderLeft = '';
      el.style.paddingLeft = '';
      el.style.backgroundColor = '';
    });

    highlights
      .filter((h) => h.chapter_id === chapterContent.id && h.bible_id === selectedBible)
      .forEach((h) => {
        const el = container.querySelector(
          `[data-verse="${h.verse_id}"], [data-usfm="${h.verse_id}"]`
        );
        if (el) {
          el.style.borderLeft = `3px solid ${h.color}`;
          el.style.paddingLeft = '8px';
          el.style.backgroundColor = h.color + '22';
        }
      });

    bookmarks
      .filter((b) => b.chapter_id === chapterContent.id && b.bible_id === selectedBible)
      .forEach((b) => {
        const el = container.querySelector(
          `[data-verse="${b.verse_id}"], [data-usfm="${b.verse_id}"]`
        );
        if (el) {
          const span = document.createElement('span');
          span.className = 'bm-indicator';
          span.textContent = '🔖';
          span.style.cssText = 'font-size:12px;margin-right:4px;';
          el.prepend(span);
        }
      });
  }, [chapterContent, highlights, bookmarks, selectedBible]);

  // Verse interaction
  useEffect(() => {
    if (!chapterContent || !chapterRef.current) return;
    const container = chapterRef.current;

    function handleVerseClick(e) {
      let el = e.target;
      while (el && el !== container) {
        const usfm = el.getAttribute('data-usfm') || el.getAttribute('data-verse');
        if (usfm && usfm.includes('.')) {
          const rect = el.getBoundingClientRect();
          setPopupPos({ top: rect.top + window.scrollY - 60, left: rect.left });
          setActiveVerse({
            id: usfm,
            text: el.textContent?.replace(/^\d+\s*/, '').trim() || '',
            ref: usfm,
          });
          return;
        }
        el = el.parentElement;
      }
      setActiveVerse(null);
    }

    container.addEventListener('click', handleVerseClick);
    return () => container.removeEventListener('click', handleVerseClick);
  }, [chapterContent]);

  const saveBookmark = async () => {
    if (!userId || !activeVerse) return;
    await apiPost('/bookmarks', {
      bibleId: selectedBible,
      bookId: resolvedBook.id,
      chapterId: chapterContent.id,
      verseId: activeVerse.id,
      verseText: activeVerse.text,
    });
    loadUserData();
    setActiveVerse(null);
  };

  const saveHighlight = async (color) => {
    if (!userId || !activeVerse) return;
    await apiPost('/highlights', {
      bibleId: selectedBible,
      chapterId: chapterContent.id,
      verseId: activeVerse.id,
      color,
    });
    loadUserData();
    setActiveVerse(null);
    setShowHighlightPicker(false);
  };

  // Navigation handlers
  const goNext = () => {
    if (!resolvedBook) return;
    if (currentChapter < resolvedBook.chapters) {
      navigate(`/read/${resolvedBook.slug}/${currentChapter + 1}`);
    } else {
      const nextBookIdx = BIBLE_BOOKS.indexOf(resolvedBook) + 1;
      if (nextBookIdx < BIBLE_BOOKS.length) {
        navigate(`/read/${BIBLE_BOOKS[nextBookIdx].slug}/1`);
      }
    }
  };

  const goPrev = () => {
    if (!resolvedBook) return;
    if (currentChapter > 1) {
      navigate(`/read/${resolvedBook.slug}/${currentChapter - 1}`);
    } else {
      const prevBookIdx = BIBLE_BOOKS.indexOf(resolvedBook) - 1;
      if (prevBookIdx >= 0) {
        const prevBook = BIBLE_BOOKS[prevBookIdx];
        navigate(`/read/${prevBook.slug}/${prevBook.chapters}`);
      }
    }
  };

  // Render Helpers
  if (!bookParam) return <BookSelector />;
  if (resolvedBook && !chapterParam) return <ChapterSelector book={resolvedBook} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Reader Header */}
      <Header
        bibles={bibles}
        selectedBible={selectedBible}
        setSelectedBible={(val) => {
          setSelectedBible(val);
          localStorage.setItem('bible_selected', val);
        }}
        fontSize={fontSize}
        setFontSize={(val) => {
          setFontSize(val);
          localStorage.setItem('bible_font_size', val);
        }}
        bookName={resolvedBook?.name}
        chapter={currentChapter}
      />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 100px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 100 }}>📖 Opening the scroll...</div>
        )}
        {error && <div style={{ color: 'var(--red)', textAlign: 'center' }}>⚠️ {error}</div>}

        {chapterContent && (
          <article>
            <h1
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '2.4rem',
                fontWeight: 800,
                marginBottom: 30,
                textAlign: 'center',
              }}
            >
              {chapterContent.reference}
            </h1>

            <style>{`
              .bible-text { font-size: ${FONT_SIZES[fontSize]}; line-height: 1.8; font-family: 'Merriweather', serif; }
              .bible-text .v { font-size: 0.65em; font-weight: 700; color: var(--ink3); vertical-align: super; margin-right: 4px; }
              .bible-text p { margin-bottom: 1.2em; }
              .bible-text span[data-usfm] { cursor: pointer; transition: background 0.2s; padding: 2px 0; border-radius: 3px; }
              .bible-text span[data-usfm]:hover { background: var(--blue-bg); }
            `}</style>

            <div
              ref={chapterRef}
              className="bible-text"
              dangerouslySetInnerHTML={{ __html: chapterContent.content }}
            />

            {/* Bottom Nav */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 60,
                paddingTop: 30,
                borderTop: '1px solid var(--border)',
              }}
            >
              <button
                onClick={goPrev}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--blue)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                ← Previous
              </button>
              <button
                onClick={goNext}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--blue)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Next →
              </button>
            </div>
          </article>
        )}
      </div>

      {activeVerse && (
        <Popup
          verse={activeVerse}
          pos={popupPos}
          userId={userId}
          onClose={() => setActiveVerse(null)}
          onBookmark={saveBookmark}
          onHighlight={saveHighlight}
          showPicker={showHighlightPicker}
          setShowPicker={setShowHighlightPicker}
        />
      )}
    </div>
  );
}

function Header({
  bibles,
  selectedBible,
  setSelectedBible,
  fontSize,
  setFontSize,
  bookName,
  chapter,
}) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(var(--bg-rgb), 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 20px',
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 15,
        }}
      >
        <Link
          to="/read"
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <span style={{ fontSize: '1.4rem' }}>📖</span>
          <span
            style={{
              fontWeight: 800,
              color: 'var(--ink)',
              fontSize: '1.1rem',
              fontFamily: "'Baloo 2', cursive",
            }}
          >
            {bookName} {chapter}
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={selectedBible}
            onChange={(e) => setSelectedBible(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              fontSize: '0.8rem',
              color: 'var(--ink)',
            }}
          >
            {bibles.map((b) => (
              <option key={b.id} value={b.id}>
                {b.abbreviationLocal}
              </option>
            ))}
          </select>

          <div
            style={{
              display: 'flex',
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {['sm', 'md', 'lg'].map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                style={{
                  padding: '6px 10px',
                  background: fontSize === sz ? 'var(--blue)' : 'var(--surface)',
                  color: fontSize === sz ? 'white' : 'var(--ink)',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {sz.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookSelector() {
  const ot = BIBLE_BOOKS.slice(0, 39);
  const nt = BIBLE_BOOKS.slice(39);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: '3rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          The Holy Bible
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--ink3)', marginBottom: 50 }}>
          Select a book to begin reading God's Word
        </p>

        <h2
          style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--orange)', marginBottom: 20 }}
        >
          📜 Old Testament
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 12,
            marginBottom: 50,
          }}
        >
          {ot.map((b) => (
            <Link
              key={b.id}
              to={`/read/${b.slug}`}
              style={{
                padding: '15px',
                background: 'var(--surface)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontWeight: 700,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
            >
              <span style={{ fontSize: '1.2rem' }}>{BOOK_EMOJI[b.id] || '📖'}</span> {b.name}
            </Link>
          ))}
        </div>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--blue)', marginBottom: 20 }}>
          ✝️ New Testament
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 12,
          }}
        >
          {nt.map((b) => (
            <Link
              key={b.id}
              to={`/read/${b.slug}`}
              style={{
                padding: '15px',
                background: 'var(--surface)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontWeight: 700,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
            >
              <span style={{ fontSize: '1.2rem' }}>{BOOK_EMOJI[b.id] || '📖'}</span> {b.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChapterSelector({ book }) {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Link
          to="/read"
          style={{
            color: 'var(--blue)',
            textDecoration: 'none',
            fontWeight: 700,
            marginBottom: 20,
            display: 'block',
          }}
        >
          ← All Books
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <span style={{ fontSize: '4rem' }}>{BOOK_EMOJI[book.id] || '📖'}</span>
          <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '2.5rem', fontWeight: 800 }}>
            {book.name}
          </h1>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
            gap: 10,
          }}
        >
          {chapters.map((c) => (
            <Link
              key={c}
              to={`/read/${book.slug}/${c}`}
              style={{
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'var(--ink)',
                fontWeight: 700,
                fontSize: '1.2rem',
                fontFamily: "'Baloo 2', cursive",
              }}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Popup({
  verse,
  pos,
  userId,
  onClose,
  onBookmark,
  onHighlight,
  showPicker,
  setShowPicker,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        zIndex: 100,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        padding: 10,
        minWidth: 200,
      }}
    >
      <div style={{ fontSize: '0.7rem', color: 'var(--ink3)', fontWeight: 800, marginBottom: 8 }}>
        {verse.ref}
      </div>
      {userId ? (
        <>
          <button
            onClick={onBookmark}
            style={{
              width: '100%',
              padding: '8px',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              color: 'var(--ink)',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            🔖 Bookmark
          </button>
          <button
            onClick={() => setShowPicker(!showPicker)}
            style={{
              width: '100%',
              padding: '8px',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              color: 'var(--ink)',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            🎨 Highlight
          </button>
          {showPicker && (
            <div style={{ display: 'flex', gap: 6, padding: 8 }}>
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => onHighlight(c.color)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: c.color,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ fontSize: '0.8rem', padding: 8 }}>Sign in to save</div>
      )}
      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '8px',
          textAlign: 'center',
          background: 'none',
          border: 'none',
          color: 'var(--ink3)',
          fontSize: '0.7rem',
          cursor: 'pointer',
        }}
      >
        Close
      </button>
    </div>
  );
}
