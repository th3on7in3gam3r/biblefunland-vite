import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStreak } from '../context/StreakContext';
import { useBadges, BADGE_DEFS, RARITY_COLORS } from '../context/BadgeContext';
import { useT } from '../i18n/useT';
import { Link } from 'react-router-dom';
import { useKidsMode } from '../context/KidsModeContext';
import { useBedtimeMode } from '../context/BedtimeModeContext';
import * as db from '../lib/db';
import PinSetupModal from '../components/PinSetupModal';

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

// ── Avatar roster ─────────────────────────────────────────────────────────────
const AVATARS = [
  { id: 'david', emoji: '👑', name: 'David', desc: 'Warrior King', color: '#8B5CF6' },
  { id: 'esther', emoji: '👸', name: 'Esther', desc: 'Courageous Queen', color: '#EC4899' },
  { id: 'moses', emoji: '🏔️', name: 'Moses', desc: 'The Deliverer', color: '#F59E0B' },
  { id: 'mary', emoji: '🌸', name: 'Mary', desc: 'Mother of Jesus', color: '#F472B6' },
  { id: 'paul', emoji: '✉️', name: 'Paul', desc: 'The Apostle', color: '#3B82F6' },
  { id: 'noah', emoji: '🚢', name: 'Noah', desc: 'Man of Faith', color: '#14B8A6' },
  { id: 'daniel', emoji: '🦁', name: 'Daniel', desc: 'Lion of God', color: '#F97316' },
  { id: 'ruth', emoji: '🌾', name: 'Ruth', desc: 'Loyal & Faithful', color: '#10B981' },
  { id: 'peter', emoji: '🎣', name: 'Peter', desc: 'Rock of the Church', color: '#6366F1' },
  { id: 'elijah', emoji: '🔥', name: 'Elijah', desc: 'Prophet of Fire', color: '#EF4444' },
  { id: 'joseph', emoji: '🌈', name: 'Joseph', desc: 'Dreamer & Leader', color: '#A855F7' },
  { id: 'deborah', emoji: '⚔️', name: 'Deborah', desc: 'Judge of Israel', color: '#06B6D4' },
];

const BADGE_CATEGORIES = ['Streak', 'Games', 'AI', 'Community', 'Learning', 'Soul'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}
function saveLocal(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function last30() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });
}

function calcLongestStreak(days) {
  if (!days?.length) return 0;
  const sorted = [...days].sort();
  let max = 1,
    cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000;
    if (diff === 1) {
      cur++;
      if (cur > max) max = cur;
    } else cur = 1;
  }
  return max;
}

function getMemberSince(user) {
  const raw = user?.createdAt || user?.created_at;
  if (raw) return new Date(raw).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return 'BibleFunLand member';
}

export default function Profile() {
  const { user, signOut, refreshProfile } = useAuth();
  const { streak, readDays, checkinCount, checkedToday, checkIn } = useStreak();
  const { earned } = useBadges();
  const { kidsMode, requestToggle, enableKidsMode } = useKidsMode();
  const { bedtimeMode, bedtimeSettings, toggleBedtimeMode, updateBedtimeSettings, isBedtime } =
    useBedtimeMode();
  const { t } = useT();

  // ── Profile form ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(() => ({
    avatar: 'david',
    displayName: '',
    bio: '',
    favoriteVerse: '',
    age: '',
    role: 'General',
    is_age_locked: 0,
    ...getLocal('bfl_profile', {}),
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [kidsModal, setKidsModal] = useState(false);
  const [children, setChildren] = useState([]);
  const [childForm, setChildForm] = useState({ name: '', age: '', avatar: 'david' }); // Default avatar for child
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePin, setDeletePin] = useState('');
  const [deletePinError, setDeletePinError] = useState(false);
  const [deletePinShake, setDeletePinShake] = useState(false);
  const [childToDelete, setChildToDelete] = useState(null);
  const [childCreateError, setChildCreateError] = useState(null);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pendingChildData, setPendingChildData] = useState(null);

  // ── Pastor verification modal ─────────────────────────────────────────
  const [showPastorModal, setShowPastorModal] = useState(false);
  const [pastorModalTab, setPastorModalTab] = useState('code'); // 'code' | 'request'
  const [pastorCode, setPastorCode] = useState('');
  const [pastorCodeError, setPastorCodeError] = useState(false);
  const [pastorCodeShake, setPastorCodeShake] = useState(false);
  // Request form state
  const [pastorReqForm, setPastorReqForm] = useState({
    fullName: '',
    churchName: '',
    city: '',
    denomination: '',
    website: '',
    message: '',
  });
  const [pastorReqSubmitting, setPastorReqSubmitting] = useState(false);
  const [pastorReqSuccess, setPastorReqSuccess] = useState(false);
  const [pastorReqError, setPastorReqError] = useState(null);

  // ── Pastor code verifier ──────────────────────────────────────────────
  async function verifyPastorCode() {
    if (!pastorCode.trim()) return;
    try {
      const res = await fetch(`${API_URL}/profiles/${user?.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'Pastor', pastor_code: pastorCode.trim() }),
      });
      if (!res.ok) {
        setPastorCodeError(true);
        setPastorCodeShake(true);
        setPastorCode('');
        setTimeout(() => {
          setPastorCodeShake(false);
          setPastorCodeError(false);
        }, 600);
        return;
      }
      // Success — set role locally and persist
      setProfile((p) => ({ ...p, role: 'Pastor' }));
      setShowPastorModal(false);
      setPastorCode('');
      setPastorCodeError(false);
      // Persist role immediately without full save
      await refreshProfile();
    } catch {
      setPastorCodeError(true);
      setPastorCodeShake(true);
      setPastorCode('');
      setTimeout(() => {
        setPastorCodeShake(false);
        setPastorCodeError(false);
      }, 600);
    }
  }

  // ── Close / reset pastor modal ────────────────────────────────────────
  function closePastorModal() {
    setShowPastorModal(false);
    setPastorCode('');
    setPastorCodeError(false);
    setPastorModalTab('code');
    setPastorReqForm({
      fullName: '',
      churchName: '',
      city: '',
      denomination: '',
      website: '',
      message: '',
    });
    setPastorReqSuccess(false);
    setPastorReqError(null);
  }

  // ── Submit pastor access request ──────────────────────────────────────
  async function submitPastorRequest() {
    const { fullName, churchName, city } = pastorReqForm;
    if (!fullName.trim() || !churchName.trim() || !city.trim()) {
      setPastorReqError('Please fill in your name, church name, and city.');
      return;
    }
    setPastorReqSubmitting(true);
    setPastorReqError(null);
    try {
      const res = await fetch(`${API_URL}/pastor-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          user_email: user?.email,
          full_name: fullName.trim(),
          church_name: churchName.trim(),
          city: city.trim(),
          denomination: pastorReqForm.denomination.trim() || null,
          website: pastorReqForm.website.trim() || null,
          message: pastorReqForm.message.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPastorReqError(
          data.detail === 'duplicate_request'
            ? "You already have a pending request. We'll be in touch shortly!"
            : data.error || 'Submission failed. Please try again.'
        );
        return;
      }
      setPastorReqSuccess(true);
    } catch {
      setPastorReqError('Network error — please check your connection and try again.');
    } finally {
      setPastorReqSubmitting(false);
    }
  }

  // ── UI state ─────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('profile');
  const [badgeCat, setBadgeCat] = useState('All');
  const [badgeRarity, setBadgeRarity] = useState('All');
  const [shareOpen, setShareOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentAvatar = AVATARS.find((a) => a.id === profile.avatar) || AVATARS[0];
  const earnedCount = earned.size;
  const totalBadges = Object.keys(BADGE_DEFS).length;
  const displayName = profile.displayName || user?.email?.split('@')[0] || 'Bible Explorer';
  const dates30 = last30();
  const heatmap = Object.fromEntries((readDays || []).map((d) => [d, true]));
  const longestStreak = calcLongestStreak(readDays);
  const notes = getLocal('bfl_notes', []);
  const chaptersRead = (() => {
    try {
      const rb = getLocal('bfl_read_books', {});
      return Object.values(rb).reduce((n, c) => n + (Array.isArray(c) ? c.length : 0), 0);
    } catch {
      return 0;
    }
  })();
  const pctBible = Math.min(100, Math.round((chaptersRead / 1189) * 100));
  const dayCount = Array(7).fill(0);
  (readDays || []).forEach((d) => {
    dayCount[new Date(d).getDay()]++;
  });
  const bestDayIdx = dayCount.indexOf(Math.max(...dayCount));

  // ── Load Turso profile + subscription ────────────────────────────────────
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    db.getProfile(user.id)
      .then(({ data }) => {
        if (data) {
          const p = {
            avatar: data.avatar_url || 'david',
            displayName: data.display_name || '',
            bio: data.bio || '',
            favoriteVerse: data.favorite_verse || '',
            age: data.age || '',
            role: data.role || 'General',
            is_age_locked: data.is_age_locked || 0,
          };
          setProfile(p);
          saveLocal('bfl_profile', p);
        }
        setProfileLoaded(true);
      })
      .catch(() => {
        setProfileLoaded(true);
      });

    db.getChildProfiles(user.id, true)
      .then(({ data }) => {
        console.log('[Profile] Child profiles loaded:', data);
        if (data) setChildren(data);
      })
      .catch((err) => {
        console.error('[Profile] Error loading child profiles:', err);
        if (err.message?.includes('no such table')) {
          console.warn('Child profiles table not available');
        }
        setChildren([]);
      });
    db.getSubscription(user.id)
      .then(({ data }) => {
        if (data?.status === 'active') setIsPro(true);
      })
      .catch(() => {});
  }, [user?.id]); // only runs once when user loads — does NOT re-run on typing

  async function save() {
    // If age is set and not previously locked, lock it now
    const willLockAge = profile.age && !profile.is_age_locked;
    const updatedProfile = {
      ...profile,
      is_age_locked: willLockAge ? 1 : profile.is_age_locked,
    };

    // Auto Kids Mode logic
    if (updatedProfile.age && parseInt(updatedProfile.age) < 13 && !kidsMode) {
      requestToggle('enable');
    }

    setProfile(updatedProfile);
    saveLocal('bfl_profile', updatedProfile);

    if (user?.id) {
      setSaving(true);
      setSaveError(null);
      try {
        // Call backend enforcement endpoints for age and role
        if (updatedProfile.age && willLockAge) {
          const ageRes = await fetch(`${API_URL}/profiles/${user.id}/age`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ age: parseInt(updatedProfile.age) }),
          });
          if (!ageRes.ok) {
            const err = await ageRes.json();
            throw new Error(err.error || 'Failed to set age');
          }
        }

        if (updatedProfile.role !== profile.role) {
          const roleRes = await fetch(`${API_URL}/profiles/${user.id}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: updatedProfile.role }),
          });
          if (!roleRes.ok) {
            const err = await roleRes.json();
            throw new Error(err.error || 'Failed to set role');
          }
        }

        // Save full profile to database
        const { error } = await db.upsertProfile(user.id, {
          display_name: updatedProfile.displayName,
          avatar_url: updatedProfile.avatar,
          bio: updatedProfile.bio,
          favorite_verse: updatedProfile.favoriteVerse,
          age:
            updatedProfile.age !== '' && updatedProfile.age != null
              ? parseInt(updatedProfile.age) || null
              : null,
          role: updatedProfile.role,
          is_age_locked: updatedProfile.is_age_locked,
        });

        if (error) {
          console.error('[Profile save]', error);
          setSaveError(error.message || 'Failed to save — check console');
          setSaving(false);
          return;
        }

        // Refresh profile in AuthContext so Nav and other components see the updated role
        await refreshProfile();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);

        // Auto-activate Kids Mode for under-13 users
        if (updatedProfile.age && parseInt(updatedProfile.age) < 13 && !kidsMode) {
          enableKidsMode();
        }
      } catch (err) {
        console.error('[Profile save error]', err);
        setSaveError(err.message || 'Failed to save profile');
      } finally {
        setSaving(false);
      }
    }
  }

  async function addChild() {
    if (!childForm.name.trim() || !user?.id) return;
    setChildCreateError(null);

    try {
      // Check if this is the first child and if parent has default PIN
      if (children.length === 0) {
        const { data: controls } = await db.getParentalControls(user.id);
        if (!controls || controls.parent_pin === '4318') {
          // Show PIN setup modal before creating child
          setPendingChildData({
            display_name: childForm.name,
            age: childForm.age ? parseInt(childForm.age) : null,
            avatar_url: childForm.avatar,
          });
          setShowPinSetup(true);
          return;
        }
      }

      // Proceed with child creation
      await createChild({
        display_name: childForm.name,
        age: childForm.age ? parseInt(childForm.age) : null,
        avatar_url: childForm.avatar,
      });
    } catch (e) {
      console.error('[addChild] Error:', e);
      setChildCreateError(e.message || 'Failed to check parental controls');
    }
  }

  async function createChild(childData) {
    try {
      const res = await fetch(`${API_URL}/children/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childData),
      });

      if (!res.ok) {
        const err = await res.json();
        setChildCreateError(err.error || 'Failed to add child');
        return;
      }

      // Auto-activate Kids Mode for children under 13
      const childAge = childData.age;
      if (childAge && childAge < 13) {
        await db.upsertChildProfile(user.id, {
          display_name: childData.display_name,
          age: childAge,
          avatar_url: childData.avatar_url,
          kids_mode: true,
        });
      }

      const { data } = await db.getChildProfiles(user.id, true);
      setChildren(data || []);
      setChildForm({ name: '', age: '', avatar: 'david' });
    } catch (e) {
      setChildCreateError(e.message || 'Failed to add child');
    }
  }

  async function handlePinSetupComplete(newPin) {
    try {
      // Save the new PIN via API endpoint
      const res = await fetch(`${API_URL}/parental-controls/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: '4318', // Current default PIN
          new_pin: newPin,
          ai_toggles: {},
          daily_limit: 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save PIN');
      }

      // Create the child profile
      if (pendingChildData) {
        await createChild(pendingChildData);
        setPendingChildData(null);
      }

      setShowPinSetup(false);
    } catch (e) {
      console.error('[handlePinSetupComplete] Error:', e);
      setChildCreateError(e.message || 'Failed to set up PIN');
      setShowPinSetup(false);
    }
  }

  function handlePinSetupSkip() {
    // User chose to skip PIN setup, create child with default PIN
    if (pendingChildData) {
      createChild(pendingChildData);
      setPendingChildData(null);
    }
    setShowPinSetup(false);
  }

  async function deleteChild(id) {
    if (!user?.id) return;
    setChildToDelete(id);
    setDeletePin('');
    setDeletePinError(false);
    setDeleteModal(true);
  }

  async function confirmDeleteChild() {
    if (!childToDelete || !user?.id) return;

    try {
      const res = await fetch(`${API_URL}/children/${user.id}/${childToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: deletePin }),
      });

      if (!res.ok) {
        const err = await res.json();
        setDeletePinError(true);
        setDeletePinShake(true);
        setDeletePin('');
        setTimeout(() => {
          setDeletePinShake(false);
          setDeletePinError(false);
        }, 600);
        return;
      }

      const { data } = await db.getChildProfiles(user.id, true);
      setChildren(data || []);
      setDeleteModal(false);
      setChildToDelete(null);
      setDeletePin('');
    } catch (e) {
      setDeletePinError(true);
      setDeletePinShake(true);
      setDeletePin('');
      setTimeout(() => {
        setDeletePinShake(false);
        setDeletePinError(false);
      }, 600);
    }
  }

  function copyShareCard() {
    const txt = `✝️ ${displayName} on BibleFunLand\n🔥 ${streak} day streak · 🏆 ${earnedCount}/${totalBadges} badges · 📖 ${chaptersRead} chapters read${profile.favoriteVerse ? `\n\n"${profile.favoriteVerse}"` : ''}\n\n🌐 biblefunland.com`;
    navigator.clipboard.writeText(txt);
    setShareOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // ── Filtered badges ────────────────────────────────────────────────────
  const filteredBadges = Object.entries(BADGE_DEFS).filter(
    ([id, b]) =>
      (badgeCat === 'All' || b.category === badgeCat) &&
      (badgeRarity === 'All' || b.rarity === badgeRarity)
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: 'linear-gradient(160deg,#0F0F1A 0%,#1E1B4B 55%,#0A1A14 100%)',
          paddingTop: 'clamp(44px,8vw,64px)',
          paddingBottom: 0,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: '18%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: `radial-gradient(circle,${currentAvatar.color}14,transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: '14%',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(99,102,241,.1),transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
          <div
            style={{
              width: 'clamp(88px,14vw,108px)',
              height: 'clamp(88px,14vw,108px)',
              borderRadius: '50%',
              background: `linear-gradient(135deg,${currentAvatar.color}44,${currentAvatar.color}11)`,
              border: `3px solid ${currentAvatar.color}66`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(2.8rem,5.5vw,3.6rem)',
              boxShadow: `0 0 0 6px ${currentAvatar.color}16,0 12px 40px rgba(0,0,0,.4)`,
              margin: '0 auto',
              transition: 'all .3s',
            }}
          >
            {currentAvatar.emoji}
          </div>
          {isPro && (
            <div
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                background: 'linear-gradient(135deg,#F59E0B,#F97316)',
                borderRadius: '50%',
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '.75rem',
                border: '2px solid var(--bg)',
                boxShadow: '0 2px 8px rgba(0,0,0,.3)',
              }}
            >
              💎
            </div>
          )}
          {streak >= 7 && (
            <div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: 'linear-gradient(135deg,#F97316,#EF4444)',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '.58rem',
                fontWeight: 800,
                color: 'white',
                border: '2px solid var(--bg)',
              }}
            >
              {streak}
            </div>
          )}
        </div>

        {/* Name */}
        <div
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.5rem,4.5vw,2rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 3,
            letterSpacing: '-.4px',
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            fontSize: '.82rem',
            color: 'rgba(255,255,255,.45)',
            fontWeight: 500,
            marginBottom: 3,
          }}
        >
          {currentAvatar.name} · {currentAvatar.desc}
        </div>
        {user && (
          <div
            style={{
              fontSize: '.7rem',
              color: 'rgba(255,255,255,.22)',
              fontWeight: 500,
              marginBottom: 14,
            }}
          >
            {getMemberSince(user)}
            {isPro && <span style={{ color: '#F59E0B', fontWeight: 700 }}> · 💎 Pro</span>}
          </div>
        )}

        {/* Stat pills */}
        <div
          style={{
            display: 'flex',
            gap: 7,
            justifyContent: 'center',
            flexWrap: 'wrap',
            padding: '0 16px',
            marginBottom: 14,
          }}
        >
          {[
            ['🔥', streak, 'streak'],
            ['🏆', `${earnedCount}/${totalBadges}`, 'badges'],
            ['📖', chaptersRead, 'chapters'],
            ['📅', readDays?.length || 0, 'days'],
          ].map(([e, v, l]) => (
            <div
              key={l}
              style={{
                background: 'rgba(255,255,255,.07)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 100,
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ fontSize: '.82rem' }}>{e}</span>
              <span
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: 'white',
                  fontSize: '.82rem',
                }}
              >
                {v}
              </span>
              <span style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>
                {l}
              </span>
            </div>
          ))}
        </div>

        {/* Share button */}
        <div
          style={{
            marginBottom: 0,
            padding: '0 16px 0',
            position: 'relative',
            display: 'inline-block',
          }}
        >
          <button
            onClick={() => setShareOpen((s) => !s)}
            style={{
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.15)',
              color: 'rgba(255,255,255,.65)',
              borderRadius: 100,
              padding: '6px 16px',
              cursor: 'pointer',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '.72rem',
              fontWeight: 700,
              transition: 'all .2s',
            }}
          >
            📤 Share Profile
          </button>
          {shareOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 98 }}
                onClick={() => setShareOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 99,
                  background: 'var(--surface)',
                  borderRadius: 16,
                  border: '1.5px solid var(--border)',
                  padding: '16px 20px',
                  width: 300,
                  textAlign: 'left',
                  boxShadow: 'var(--sh-lg)',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontWeight: 800,
                    color: 'var(--ink)',
                    fontSize: '.9rem',
                    marginBottom: 10,
                  }}
                >
                  📤 Share Your Profile
                </div>
                <div
                  style={{
                    background: 'var(--bg2)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    marginBottom: 12,
                    fontSize: '.74rem',
                    color: 'var(--ink2)',
                    lineHeight: 1.75,
                    fontWeight: 500,
                  }}
                >
                  ✝️ <strong>{displayName}</strong>
                  <br />
                  🔥 {streak} streak · 🏆 {earnedCount}/{totalBadges} badges
                  <br />
                  📖 {chaptersRead} chapters read
                </div>
                <button className="btn btn-blue btn-full btn-sm" onClick={copyShareCard}>
                  📋 Copy to Clipboard
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 0,
            marginTop: 18,
            overflowX: 'auto',
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}
        >
          {[
            ['profile', '👤 Profile'],
            ['badges', '🏆 Badges'],
            ['stats', '📊 Stats'],
            ['activity', '⚡ Activity'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flexShrink: 0,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: tab === id ? 'white' : 'rgba(255,255,255,.38)',
                fontFamily: 'Poppins,sans-serif',
                fontWeight: 700,
                fontSize: '.82rem',
                padding: '12px 18px',
                borderBottom: tab === id ? '3px solid var(--blue)' : '3px solid transparent',
                transition: 'all .2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ TAB CONTENT ═══════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(20px,5vw,32px) 16px' }}>
        {/* ─ PROFILE ─────────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Avatar picker */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 24,
                border: '1.5px solid var(--border)',
                padding: 24,
                boxShadow: 'var(--sh)',
              }}
            >
              <div
                style={{
                  fontSize: '.68rem',
                  fontWeight: 800,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 14,
                }}
              >
                Choose Your Character
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))',
                  gap: 9,
                }}
              >
                {AVATARS.map((a) => {
                  const active = profile.avatar === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => setProfile((p) => ({ ...p, avatar: a.id }))}
                      style={{
                        borderRadius: 16,
                        padding: '12px 8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all .22s',
                        border: `2px solid ${active ? a.color : 'var(--border)'}`,
                        background: active ? a.color + '14' : 'var(--surface)',
                        boxShadow: active ? `0 4px 16px ${a.color}28` : 'none',
                        transform: active ? 'scale(1.05)' : 'scale(1)',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.borderColor = a.color + '55';
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: 3 }}>{a.emoji}</div>
                      <div
                        style={{
                          fontSize: '.58rem',
                          fontWeight: 700,
                          color: active ? a.color : 'var(--ink)',
                          lineHeight: 1.2,
                        }}
                      >
                        {a.name}
                      </div>
                      {active && (
                        <div
                          style={{
                            fontSize: '.5rem',
                            color: a.color,
                            fontWeight: 500,
                            marginTop: 1,
                          }}
                        >
                          {a.desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info fields */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 24,
                border: '1.5px solid var(--border)',
                padding: 24,
                boxShadow: 'var(--sh)',
              }}
            >
              <div
                style={{
                  fontSize: '.68rem',
                  fontWeight: 800,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 16,
                }}
              >
                Profile Info
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: '.68rem',
                      fontWeight: 700,
                      color: 'var(--ink3)',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Display Name
                  </label>
                  <input
                    className="input-field"
                    placeholder={user?.email?.split('@')[0] || 'Your name...'}
                    value={profile.displayName}
                    onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: '.68rem',
                      fontWeight: 700,
                      color: 'var(--ink3)',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Favorite Verse
                  </label>
                  <input
                    className="input-field"
                    placeholder="e.g. Jer 29:11 or Phil 4:13..."
                    value={profile.favoriteVerse}
                    onChange={(e) => setProfile((p) => ({ ...p, favoriteVerse: e.target.value }))}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: '.68rem',
                      fontWeight: 700,
                      color: 'var(--ink3)',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Age {profile.is_age_locked ? '🔒' : ''}
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    placeholder="Years"
                    value={profile.age}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Client-side validation: only allow [1, 120]
                      if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 120)) {
                        setProfile((p) => ({ ...p, age: val }));
                      }
                    }}
                    disabled={profile.is_age_locked === 1}
                    style={{
                      background: profile.is_age_locked ? 'var(--bg2)' : 'var(--surface)',
                      cursor: profile.is_age_locked ? 'not-allowed' : 'text',
                    }}
                  />
                  {profile.is_age_locked === 1 && (
                    <div
                      style={{
                        fontSize: '.55rem',
                        color: 'var(--green)',
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      ✓ Age locked permanently
                    </div>
                  )}
                  {profile.is_age_locked === 0 && profile.age && (
                    <div
                      style={{
                        fontSize: '.55rem',
                        color: 'var(--red)',
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      ⚠️ Locked after first save
                    </div>
                  )}
                  {profile.age && (parseInt(profile.age) < 1 || parseInt(profile.age) > 120) && (
                    <div
                      style={{
                        fontSize: '.55rem',
                        color: 'var(--red)',
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      ❌ Age must be 1-120
                    </div>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      fontSize: '.68rem',
                      fontWeight: 700,
                      color: 'var(--ink3)',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Account Role
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['General', 'Parent', 'Teacher', 'Pastor'].map((r) => {
                      // Only restrict Parent/Teacher for under-13 (Keep Pastor open)
                      const isRestricted =
                        (r === 'Parent' || r === 'Teacher') &&
                        profile.age &&
                        parseInt(profile.age) < 13;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            if (r === 'Pastor' && profile.role !== 'Pastor') {
                              setPastorCode('');
                              setPastorCodeError(false);
                              setShowPastorModal(true);
                              return;
                            }
                            setProfile((p) => ({ ...p, role: r }));
                          }}
                          disabled={isRestricted}
                          title={isRestricted ? 'Only available for ages 13+' : ''}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: 10,
                            border: `1.5px solid ${profile.role === r ? 'var(--blue)' : 'var(--border)'}`,
                            background:
                              profile.role === r
                                ? 'var(--blue-bg)'
                                : isRestricted
                                  ? 'var(--bg3)'
                                  : 'var(--surface)',
                            color:
                              profile.role === r
                                ? 'var(--blue)'
                                : isRestricted
                                  ? 'var(--ink3)'
                                  : 'var(--ink3)',
                            fontSize: '.72rem',
                            fontWeight: 700,
                            cursor: isRestricted ? 'not-allowed' : 'pointer',
                            transition: 'all .2s',
                            opacity: isRestricted ? 0.5 : 1,
                          }}
                        >
                          {r === 'Parent'
                            ? '👨‍👩‍👧 Parent'
                            : r === 'Teacher'
                              ? '🏫 Teacher'
                              : r === 'Pastor'
                                ? '⛪ Pastor'
                                : '👤 User'}
                        </button>
                      );
                    })}
                  </div>
                  {profile.age &&
                    parseInt(profile.age) < 13 &&
                    (profile.role === 'Parent' || profile.role === 'Teacher') && (
                      <div
                        style={{
                          fontSize: '.55rem',
                          color: 'var(--red)',
                          fontWeight: 600,
                          marginTop: 4,
                        }}
                      >
                        ⚠️ Parent/Teacher only for 13+
                      </div>
                    )}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: '.68rem',
                    fontWeight: 700,
                    color: 'var(--ink3)',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Bio — share your faith journey
                </label>
                <textarea
                  className="textarea-field"
                  placeholder="Share where you are in your faith journey..."
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  style={{ height: 80 }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  paddingTop: 16,
                  borderTop: '1px solid var(--border)',
                }}
              >
                <button className="btn btn-blue" onClick={save} disabled={saving}>
                  {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Profile'}
                </button>
                {saveError && (
                  <p
                    style={{ fontSize: '.76rem', color: 'var(--red)', fontWeight: 600, margin: 0 }}
                  >
                    ⚠️ {saveError}
                  </p>
                )}
                {!user && (
                  <p
                    style={{ fontSize: '.76rem', color: 'var(--ink3)', fontWeight: 500, margin: 0 }}
                  >
                    <Link to="/auth" style={{ color: 'var(--blue)', fontWeight: 700 }}>
                      Sign in
                    </Link>{' '}
                    to sync across devices
                  </p>
                )}
                {user && !saving && !saveError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '.7rem',
                      fontWeight: 600,
                      color: 'var(--green)',
                    }}
                  >
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: 'var(--green)',
                        animation: 'pulse 2s ease-in-out infinite',
                      }}
                    />{' '}
                    Cloud Sync Active
                  </div>
                )}
              </div>
            </div>

            {/* ── Child Profiles (for Parents & Pastors) ─────────────────────────────── */}
            {(profile.role === 'Parent' ||
              profile.role === 'Pastor' ||
              profile.role === 'Admin') && (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 24,
                  border: '1.5px solid var(--border)',
                  padding: 24,
                  boxShadow: 'var(--sh)',
                }}
              >
                <div
                  style={{
                    fontSize: '.68rem',
                    fontWeight: 800,
                    color: 'var(--ink3)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 16,
                  }}
                >
                  👨‍👩‍👧 Child Profiles
                </div>

                {/* Add Child Form */}
                <div
                  style={{
                    background: 'var(--bg2)',
                    borderRadius: 16,
                    border: '1.5px dashed var(--border)',
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: '.68rem',
                          fontWeight: 700,
                          color: 'var(--ink3)',
                          display: 'block',
                          marginBottom: 6,
                        }}
                      >
                        Child's Name
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g. Emma"
                        value={childForm.name}
                        onChange={(e) => setChildForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: '.68rem',
                          fontWeight: 700,
                          color: 'var(--ink3)',
                          display: 'block',
                          marginBottom: 6,
                        }}
                      >
                        Age
                      </label>
                      <input
                        className="input-field"
                        type="number"
                        placeholder="Years"
                        value={childForm.age}
                        onChange={(e) => setChildForm((f) => ({ ...f, age: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        fontSize: '.68rem',
                        fontWeight: 700,
                        color: 'var(--ink3)',
                        display: 'block',
                        marginBottom: 8,
                      }}
                    >
                      Choose Avatar
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill,minmax(60px,1fr))',
                        gap: 8,
                      }}
                    >
                      {AVATARS.map((a) => {
                        const active = childForm.avatar === a.id;
                        return (
                          <div
                            key={a.id}
                            onClick={() => setChildForm((f) => ({ ...f, avatar: a.id }))}
                            style={{
                              borderRadius: 12,
                              padding: '8px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all .22s',
                              border: `2px solid ${active ? a.color : 'var(--border)'}`,
                              background: active ? a.color + '14' : 'var(--surface)',
                              boxShadow: active ? `0 4px 12px ${a.color}28` : 'none',
                              transform: active ? 'scale(1.05)' : 'scale(1)',
                            }}
                          >
                            <div style={{ fontSize: '1.5rem', marginBottom: 2 }}>{a.emoji}</div>
                            <div
                              style={{
                                fontSize: '.5rem',
                                fontWeight: 700,
                                color: active ? a.color : 'var(--ink3)',
                                lineHeight: 1,
                              }}
                            >
                              {a.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button className="btn btn-blue btn-full" onClick={addChild}>
                    ➕ Add Child
                  </button>
                  {childCreateError && (
                    <div
                      style={{
                        fontSize: '.75rem',
                        color: 'var(--red)',
                        fontWeight: 600,
                        marginTop: 8,
                        padding: '8px 12px',
                        background: 'var(--red-bg)',
                        borderRadius: 8,
                        border: '1px solid rgba(239,68,68,.2)',
                      }}
                    >
                      ⚠️ {childCreateError}
                    </div>
                  )}
                </div>

                {/* Children List */}
                {children.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {children.map((child) => (
                      <div
                        key={child.id}
                        style={{
                          background: 'var(--bg2)',
                          borderRadius: 12,
                          padding: 14,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                          <div style={{ fontSize: '1.8rem' }}>
                            {AVATARS.find((a) => a.id === child.avatar_url)?.emoji || '👤'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '.85rem' }}
                            >
                              {child.display_name}
                            </div>
                            <div
                              style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}
                            >
                              Age: {child.age || 'Not set'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Link
                            to={`/child/${child.id}`}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 10,
                              background: 'var(--blue)',
                              color: 'white',
                              fontSize: '.75rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              transition: 'all .2s',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = 'translateY(-2px)')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = 'translateY(0)')
                            }
                          >
                            📊 View Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              setChildToDelete(child.id);
                              setDeletePin('');
                              setDeletePinError(false);
                              setDeleteModal(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              padding: '4px 8px',
                              color: 'var(--red)',
                              opacity: 0.6,
                              transition: 'opacity .2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '.6')}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px 16px',
                      color: 'var(--ink3)',
                      fontSize: '.8rem',
                      fontWeight: 500,
                    }}
                  >
                    No child profiles yet. Add one above!
                  </div>
                )}
              </div>
            )}

            {/* ── Teacher Classrooms (for Teachers & Pastors) ─────────────────────────── */}
            {(profile.role === 'Teacher' ||
              profile.role === 'Pastor' ||
              profile.role === 'Admin') && (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 24,
                  border: '1.5px solid var(--border)',
                  padding: 24,
                  boxShadow: 'var(--sh)',
                }}
              >
                <div
                  style={{
                    fontSize: '.68rem',
                    fontWeight: 800,
                    color: 'var(--ink3)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 16,
                  }}
                >
                  🏫 My Classrooms
                </div>

                <div
                  style={{
                    background: 'var(--bg2)',
                    borderRadius: 16,
                    border: '1.5px dashed var(--border)',
                    padding: 16,
                    marginBottom: 16,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>📚</div>
                  <p
                    style={{
                      color: 'var(--ink2)',
                      fontSize: '.85rem',
                      fontWeight: 500,
                      marginBottom: 14,
                    }}
                  >
                    Manage your Bible study classrooms, assign activities, and track student
                    progress.
                  </p>
                  <Link
                    to="/parent-hub"
                    style={{
                      display: 'inline-block',
                      padding: '10px 20px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg,#A855F7,#7C3AED)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '.8rem',
                      textDecoration: 'none',
                      transition: 'all .2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    🏫 Go to Teachers Hub
                  </Link>
                </div>

                <div
                  style={{
                    background: 'var(--bg2)',
                    borderRadius: 12,
                    padding: 14,
                    textAlign: 'center',
                    color: 'var(--ink3)',
                    fontSize: '.8rem',
                    fontWeight: 500,
                  }}
                >
                  💡 Create classrooms, add students, and assign Bible reading plans in the Teachers
                  Hub
                </div>
              </div>
            )}

            {/* ── Bedtime Mode card ─────────────────────────────────────── */}
            <div
              style={{
                borderRadius: 24,
                border: `1.5px solid ${bedtimeMode ? 'rgba(159,122,234,.4)' : 'var(--border)'}`,
                padding: '20px 24px',
                boxShadow: 'var(--sh)',
                background: bedtimeMode
                  ? 'linear-gradient(135deg,rgba(159,122,234,.06),rgba(139,92,246,.04))'
                  : 'var(--surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '.68rem',
                      fontWeight: 800,
                      color: 'var(--ink3)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    🌙 Bedtime Mode
                  </div>
                  <div style={{ fontSize: '.8rem', color: 'var(--ink2)', fontWeight: 500 }}>
                    {bedtimeMode ? 'Active — calm mode is on' : 'Peaceful late-night devotionals'}
                  </div>
                </div>
                {/* Master toggle — plain button, no label wrapper */}
                <button
                  onClick={toggleBedtimeMode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: '.8rem',
                      fontWeight: 700,
                      color: bedtimeMode ? '#9F7AEA' : 'var(--ink3)',
                    }}
                  >
                    {bedtimeMode ? 'ON' : 'OFF'}
                  </span>
                  <div
                    style={{
                      width: 52,
                      height: 28,
                      borderRadius: 14,
                      background: bedtimeMode
                        ? 'linear-gradient(135deg,#9F7AEA,#8B5CF6)'
                        : 'var(--bg3)',
                      border: `2px solid ${bedtimeMode ? '#9F7AEA' : 'var(--border)'}`,
                      position: 'relative',
                      transition: 'all .3s',
                      boxShadow: bedtimeMode ? '0 0 12px rgba(159,122,234,.3)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: bedtimeMode ? 26 : 3,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: bedtimeMode ? 'white' : 'var(--ink3)',
                        transition: 'left .3s',
                        boxShadow: '0 2px 4px rgba(0,0,0,.2)',
                      }}
                    />
                  </div>
                </button>
              </div>

              {/* Quick settings row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {[
                  { key: 'dimUI', label: 'Dim UI', icon: '🌑' },
                  { key: 'calmContent', label: 'Calm Colors', icon: '🎨' },
                  { key: 'showBedtimeStory', label: 'Bedtime Stories', icon: '📖' },
                  { key: 'quietSounds', label: 'Ambient Sounds', icon: '🎵' },
                ].map(({ key, label, icon }) => (
                  <div
                    key={key}
                    onClick={() => updateBedtimeSettings({ [key]: !bedtimeSettings[key] })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all .2s',
                      border: `1.5px solid ${bedtimeSettings[key] ? 'rgba(159,122,234,.4)' : 'var(--border)'}`,
                      background: bedtimeSettings[key] ? 'rgba(159,122,234,.08)' : 'var(--bg2)',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                    <span
                      style={{
                        fontSize: '.78rem',
                        fontWeight: 700,
                        color: bedtimeSettings[key] ? '#9F7AEA' : 'var(--ink3)',
                      }}
                    >
                      {label}
                    </span>
                    <div
                      style={{
                        marginLeft: 'auto',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: bedtimeSettings[key] ? '#9F7AEA' : 'var(--bg3)',
                        border: `2px solid ${bedtimeSettings[key] ? '#9F7AEA' : 'var(--border)'}`,
                        transition: 'all .2s',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Schedule row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--bg2)',
                  border: '1.5px solid var(--border)',
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>⏰</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '.75rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      marginBottom: 2,
                    }}
                  >
                    Auto Schedule
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}>
                    {bedtimeSettings.autoEnable && bedtimeSettings.enabled
                      ? `${bedtimeSettings.bedtime} → ${bedtimeSettings.wakeTime}`
                      : 'Not scheduled'}
                  </div>
                </div>
                {isBedtime && (
                  <div
                    style={{
                      fontSize: '.65rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 100,
                      background: 'rgba(159,122,234,.15)',
                      color: '#9F7AEA',
                      border: '1px solid rgba(159,122,234,.3)',
                    }}
                  >
                    🌙 Active Now
                  </div>
                )}
              </div>

              {/* Links */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link
                  to="/bedtime-settings"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg,rgba(159,122,234,.15),rgba(139,92,246,.1))',
                    border: '1.5px solid rgba(159,122,234,.3)',
                    color: '#9F7AEA',
                    fontWeight: 700,
                    fontSize: '.8rem',
                    textDecoration: 'none',
                  }}
                >
                  ⚙️ Full Settings
                </Link>
                <Link
                  to="/bedtime"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg,rgba(30,58,95,.8),rgba(45,27,105,.8))',
                    border: '1.5px solid rgba(165,180,252,.2)',
                    color: '#A5B4FC',
                    fontWeight: 700,
                    fontSize: '.8rem',
                    textDecoration: 'none',
                  }}
                >
                  🌙 Open Sleep Mode
                </Link>
              </div>
            </div>

            {/* Account card */}
            {user && (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 24,
                  border: '1.5px solid var(--border)',
                  padding: '20px 24px',
                  boxShadow: 'var(--sh)',
                }}
              >
                <div
                  style={{
                    fontSize: '.68rem',
                    fontWeight: 800,
                    color: 'var(--ink3)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 14,
                  }}
                >
                  Account
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink2)' }}>
                      {user.email}
                    </div>
                    <div
                      style={{
                        fontSize: '.7rem',
                        color: 'var(--ink3)',
                        fontWeight: 500,
                        marginTop: 2,
                      }}
                    >
                      {getMemberSince(user)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {isPro ? (
                      <div
                        style={{
                          background:
                            'linear-gradient(135deg,rgba(245,158,11,.15),rgba(249,115,22,.1))',
                          border: '1px solid rgba(245,158,11,.3)',
                          borderRadius: 100,
                          padding: '6px 14px',
                          fontSize: '.72rem',
                          fontWeight: 800,
                          color: '#F59E0B',
                        }}
                      >
                        💎 Pro Member
                      </div>
                    ) : (
                      <Link to="/premium" className="btn btn-orange btn-sm">
                        💎 Upgrade to Pro
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="btn btn-red btn-sm"
                      style={{ fontSize: '.72rem', fontWeight: 700 }}
                    >
                      🚪 Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─ BADGES ──────────────────────────────────────────────────────── */}
        {tab === 'badges' && (
          <div>
            {/* Progress */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                padding: '20px 24px',
                marginBottom: 16,
                boxShadow: 'var(--sh)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontWeight: 800,
                    color: 'var(--ink)',
                    fontSize: '1rem',
                  }}
                >
                  🏆 Badge Collection
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontWeight: 800,
                    color: 'var(--yellow)',
                    fontSize: '1rem',
                  }}
                >
                  {earnedCount} / {totalBadges}
                </div>
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 100,
                  background: 'var(--bg3)',
                  overflow: 'hidden',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 100,
                    background: 'linear-gradient(90deg,#F59E0B,#F97316)',
                    width: `${(earnedCount / totalBadges) * 100}%`,
                    transition: 'width .6s ease',
                    boxShadow: '0 0 10px rgba(245,158,11,.4)',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(RARITY_COLORS).map(([rarity, rc]) => {
                  const total = Object.values(BADGE_DEFS).filter((b) => b.rarity === rarity).length;
                  const got = Object.entries(BADGE_DEFS).filter(
                    ([id, b]) => b.rarity === rarity && earned.has(id)
                  ).length;
                  return (
                    <div
                      key={rarity}
                      style={{
                        fontSize: '.66rem',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: 100,
                        background: rc.bg,
                        color: rc.color,
                        border: `1px solid ${rc.color}33`,
                      }}
                    >
                      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}: {got}/{total}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
              {['All', ...BADGE_CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setBadgeCat(c)}
                  style={{
                    fontSize: '.7rem',
                    fontWeight: 700,
                    padding: '5px 11px',
                    borderRadius: 100,
                    cursor: 'pointer',
                    border: `1.5px solid ${badgeCat === c ? 'var(--blue)' : 'var(--border)'}`,
                    background: badgeCat === c ? 'var(--blue-bg)' : 'var(--surface)',
                    color: badgeCat === c ? 'var(--blue)' : 'var(--ink3)',
                    transition: 'all .2s',
                  }}
                >
                  {c}
                </button>
              ))}
              {['All', 'common', 'uncommon', 'rare', 'legendary'].map((r) => {
                const rc = RARITY_COLORS[r];
                return (
                  <button
                    key={r}
                    onClick={() => setBadgeRarity(r)}
                    style={{
                      fontSize: '.68rem',
                      fontWeight: 700,
                      padding: '5px 10px',
                      borderRadius: 100,
                      cursor: 'pointer',
                      border: `1.5px solid ${badgeRarity === r ? rc?.color || 'var(--blue)' : 'var(--border)'}`,
                      background: badgeRarity === r ? rc?.bg || 'var(--blue-bg)' : 'var(--surface)',
                      color: badgeRarity === r ? rc?.color || 'var(--blue)' : 'var(--ink3)',
                      transition: 'all .2s',
                      textTransform: 'capitalize',
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(138px,1fr))',
                gap: 11,
              }}
            >
              {filteredBadges.map(([id, badge]) => {
                const isEarned = earned.has(id);
                const rc = RARITY_COLORS[badge.rarity];
                return (
                  <div
                    key={id}
                    style={{
                      borderRadius: 18,
                      padding: '18px 12px',
                      textAlign: 'center',
                      border: `2px solid ${isEarned ? rc.color : 'var(--border)'}`,
                      background: isEarned ? 'var(--surface)' : 'var(--bg2)',
                      filter: isEarned ? 'none' : 'grayscale(.85)',
                      opacity: isEarned ? 1 : 0.4,
                      transition: 'all .25s',
                      boxShadow: isEarned ? `0 4px 20px ${rc.color}20` : 'none',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isEarned && badge.rarity === 'legendary' && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(135deg,rgba(245,158,11,.06),transparent,rgba(245,158,11,.06))',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                    <div
                      style={{
                        fontSize: '2.2rem',
                        marginBottom: 7,
                        filter: isEarned ? `drop-shadow(0 2px 8px ${rc.color}44)` : 'none',
                      }}
                    >
                      {badge.emoji}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Baloo 2',cursive",
                        fontSize: '.8rem',
                        fontWeight: 800,
                        color: isEarned ? rc.color : 'var(--ink)',
                        marginBottom: 3,
                        lineHeight: 1.2,
                      }}
                    >
                      {badge.name}
                    </div>
                    <div
                      style={{
                        fontSize: '.58rem',
                        color: 'var(--ink3)',
                        fontWeight: 500,
                        lineHeight: 1.4,
                        marginBottom: 6,
                      }}
                    >
                      {badge.desc}
                    </div>
                    <div
                      style={{
                        fontSize: '.56rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 100,
                        background: rc.bg,
                        color: rc.color,
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {badge.rarity}
                    </div>
                    {isEarned && (
                      <div
                        style={{
                          fontSize: '.58rem',
                          fontWeight: 700,
                          color: 'var(--green)',
                          marginTop: 5,
                        }}
                      >
                        ✓ Earned
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredBadges.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink3)' }}>
                <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: 8 }}>🏆</div>
                <div
                  style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, color: 'var(--ink)' }}
                >
                  No badges match this filter
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─ STATS ────────────────────────────────────────────────────────── */}
        {tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stat grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(148px,1fr))',
                gap: 11,
              }}
            >
              {[
                ['🔥', streak, 'Current Streak', 'linear-gradient(135deg,#F97316,#EF4444)'],
                ['⚡', longestStreak, 'Longest Streak', 'var(--violet)'],
                ['📅', readDays?.length || 0, 'Total Days Read', 'var(--green)'],
                ['✅', checkinCount || 0, 'Total Check-ins', 'var(--blue)'],
                ['🏆', earnedCount, 'Badges Earned', 'var(--yellow)'],
                ['📖', chaptersRead, 'Chapters Read', 'var(--teal)'],
                ['📝', notes.length, 'Sermon Notes', '#A855F7'],
                ['📈', pctBible + '%', 'Bible Complete', 'var(--green)'],
              ].map(([e, v, l, c], i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 18,
                    padding: '18px 14px',
                    border: '1.5px solid var(--border)',
                    textAlign: 'center',
                    boxShadow: 'var(--sh-sm)',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 5 }}>{e}</div>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '2rem',
                      fontWeight: 800,
                      lineHeight: 1,
                      marginBottom: 4,
                      background: c,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      fontSize: '.62rem',
                      fontWeight: 600,
                      color: 'var(--ink3)',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>

            {/* Heatmap — 30 days */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                padding: '22px 24px',
                boxShadow: 'var(--sh)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontWeight: 800,
                    color: 'var(--ink)',
                    fontSize: '.95rem',
                  }}
                >
                  📅 Last 30 Days
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 600 }}>
                  {dates30.filter((d) => heatmap[d]).length} / 30 read
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: 5 }}>
                {dates30.map((d) => {
                  const read = heatmap[d];
                  const isToday = d === new Date().toISOString().split('T')[0];
                  return (
                    <div
                      key={d}
                      title={d}
                      style={{
                        aspectRatio: 1,
                        borderRadius: 6,
                        background: read ? 'linear-gradient(135deg,#059669,#34D399)' : 'var(--bg3)',
                        border: isToday ? '2px solid var(--blue)' : '2px solid transparent',
                        boxShadow: read ? '0 2px 8px rgba(16,185,129,.25)' : 'none',
                        transition: 'transform .15s',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  );
                })}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 10,
                  fontSize: '.66rem',
                  color: 'var(--ink3)',
                  fontWeight: 600,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg,#059669,#34D399)',
                    }}
                  />{' '}
                  Read
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div
                    style={{ width: 11, height: 11, borderRadius: 3, background: 'var(--bg3)' }}
                  />{' '}
                  Missed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 3,
                      border: '2px solid var(--blue)',
                    }}
                  />{' '}
                  Today
                </div>
              </div>
            </div>

            {/* Bible progress */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                padding: '22px 24px',
                boxShadow: 'var(--sh)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontWeight: 800,
                    color: 'var(--ink)',
                    fontSize: '.95rem',
                  }}
                >
                  📖 Bible Progress
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontWeight: 800,
                    color: 'var(--green)',
                    fontSize: '.95rem',
                  }}
                >
                  {chaptersRead} / 1,189
                </div>
              </div>
              <div
                style={{
                  height: 13,
                  borderRadius: 100,
                  background: 'var(--bg3)',
                  overflow: 'hidden',
                  marginBottom: 7,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 100,
                    background: 'linear-gradient(90deg,#059669,#34D399)',
                    width: `${pctBible}%`,
                    transition: 'width .6s',
                    boxShadow: '0 0 10px rgba(16,185,129,.3)',
                  }}
                />
              </div>
              <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}>
                {pctBible}% complete · {1189 - chaptersRead} chapters to go
              </div>
              <Link
                to="/reading-stats"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 12,
                  fontSize: '.76rem',
                  fontWeight: 700,
                  color: 'var(--blue)',
                  textDecoration: 'none',
                }}
              >
                View Full Reading Stats →
              </Link>
            </div>

            {/* Day-of-week bars */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                padding: '22px 24px',
                boxShadow: 'var(--sh)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 14,
                  fontSize: '.95rem',
                }}
              >
                📊 When You Read Most
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 70 }}>
                {DAYS_SHORT.map((day, i) => {
                  const max = Math.max(...dayCount, 1);
                  const h = Math.round((dayCount[i] / max) * 60);
                  const isTop = dayCount[i] === Math.max(...dayCount) && dayCount[i] > 0;
                  return (
                    <div
                      key={day}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: h || 4,
                          borderRadius: '5px 5px 0 0',
                          background: isTop ? 'var(--green)' : 'var(--bg3)',
                          minHeight: 4,
                          transition: 'all .3s',
                          boxShadow: isTop ? '0 0 8px rgba(16,185,129,.3)' : 'none',
                        }}
                      />
                      <div
                        style={{
                          fontSize: '.58rem',
                          fontWeight: isTop ? 800 : 600,
                          color: isTop ? 'var(--green)' : 'var(--ink3)',
                        }}
                      >
                        {day}
                      </div>
                    </div>
                  );
                })}
              </div>
              {Math.max(...dayCount) > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: '.72rem',
                    color: 'var(--ink3)',
                    fontWeight: 500,
                  }}
                >
                  Most active on{' '}
                  <strong style={{ color: 'var(--green)' }}>{DAYS_FULL[bestDayIdx]}s</strong>
                </div>
              )}
            </div>

            {/* Check-in CTA */}
            {!checkedToday ? (
              <button className="btn btn-green btn-full btn-lg" onClick={checkIn}>
                ✅ Mark Today as Read — Keep Your Streak!
              </button>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: 16,
                  background: 'var(--green-bg)',
                  borderRadius: 16,
                  border: '1.5px solid rgba(16,185,129,.2)',
                  fontSize: '.88rem',
                  fontWeight: 700,
                  color: 'var(--green)',
                }}
              >
                ✅ Checked in today! See you tomorrow 🔥
              </div>
            )}
          </div>
        )}

        {/* ─ ACTIVITY ────────────────────────────────────────────────────── */}
        {tab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Streak milestones */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                padding: '22px 24px',
                boxShadow: 'var(--sh)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 16,
                  fontSize: '.95rem',
                }}
              >
                🏅 Streak Milestones
              </div>
              {[
                [1, '🌱', 'First Step', 'Started your Bible reading journey'],
                [3, '🔥', '3-Day Streak', 'Building a consistent habit'],
                [7, '💪', 'One Full Week', 'A week in the Word'],
                [14, '📖', 'Two Weeks', 'Halfway to a monthly habit'],
                [30, '🏆', 'Monthly Faithful', '30 days — a true disciple'],
                [60, '🌟', 'Two Months', 'Consistency becoming character'],
                [100, '👑', 'Century Saint', '100 days — extraordinary faithfulness'],
                [365, '✝️', 'Year of Grace', 'A full year walking with God'],
              ].map(([target, emoji, title, desc]) => {
                const reached = streak >= target;
                return (
                  <div
                    key={target}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '11px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: reached ? 'var(--green-bg)' : 'var(--bg2)',
                        border: `2px solid ${reached ? 'var(--green)' : 'var(--border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        flexShrink: 0,
                        filter: reached ? 'none' : 'grayscale(.8)',
                        opacity: reached ? 1 : 0.4,
                      }}
                    >
                      {emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Baloo 2',cursive",
                          fontWeight: 800,
                          color: reached ? 'var(--ink)' : 'var(--ink3)',
                          fontSize: '.86rem',
                        }}
                      >
                        {title}
                      </div>
                      <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}>
                        {desc}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '.7rem',
                        fontWeight: 700,
                        color: reached ? 'var(--green)' : 'var(--ink3)',
                        flexShrink: 0,
                      }}
                    >
                      {reached ? '✅ Reached' : `${target} days`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Earned badges list */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                padding: '22px 24px',
                boxShadow: 'var(--sh)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 16,
                  fontSize: '.95rem',
                }}
              >
                🏆 Earned Badges ({earnedCount})
              </div>
              {earnedCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink3)' }}>
                  <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: 8 }}>🏆</div>
                  <p style={{ fontSize: '.84rem', marginBottom: 12 }}>
                    No badges yet — start playing to earn your first!
                  </p>
                  <Link
                    to="/trivia"
                    className="btn btn-blue btn-sm"
                    style={{ display: 'inline-flex' }}
                  >
                    Start with Bible Trivia →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[...earned]
                    .filter((id) => BADGE_DEFS[id])
                    .map((id) => {
                      const badge = BADGE_DEFS[id],
                        rc = RARITY_COLORS[badge.rarity];
                      return (
                        <div
                          key={id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 0',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: rc.bg,
                              border: `1.5px solid ${rc.color}44`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              flexShrink: 0,
                            }}
                          >
                            {badge.emoji}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontFamily: "'Baloo 2',cursive",
                                fontWeight: 800,
                                color: 'var(--ink)',
                                fontSize: '.86rem',
                              }}
                            >
                              {badge.name}
                            </div>
                            <div
                              style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 500 }}
                            >
                              {badge.desc}
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: '.58rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 100,
                              background: rc.bg,
                              color: rc.color,
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                            }}
                          >
                            {badge.rarity}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Favorite verse display */}
            {profile.favoriteVerse && (
              <div
                style={{
                  background: 'linear-gradient(135deg,rgba(16,185,129,.08),rgba(99,102,241,.06))',
                  borderRadius: 20,
                  border: '1.5px solid rgba(16,185,129,.2)',
                  padding: '22px 24px',
                }}
              >
                <div
                  style={{
                    fontSize: '.68rem',
                    fontWeight: 800,
                    color: 'var(--green)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  ✝️ Favorite Verse
                </div>
                <p
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  "{profile.favoriteVerse}"
                </p>
              </div>
            )}

            {/* Quick links to earn more */}
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                padding: '22px 24px',
                boxShadow: 'var(--sh)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 14,
                  fontSize: '.95rem',
                }}
              >
                🚀 Earn More Badges
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 9 }}>
                {[
                  ['/trivia', '🎮', 'Bible Trivia'],
                  ['/devotional', '🙏', 'AI Devotional'],
                  ['/game/runner', '🏃', 'Scripture Runner'],
                  ['/prayer', '🌍', 'Prayer Wall'],
                  ['/certification', '🎓', 'Certification'],
                  ['/flashcards', '🧠', 'Flashcards'],
                  ['/game/battle-arena', '⚔️', 'Battle Arena'],
                  ['/wordle', '🟩', 'Bible Wordle'],
                ].map(([to, emoji, label]) => (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: '11px 14px',
                      borderRadius: 12,
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg2)',
                      transition: 'all .2s',
                      color: 'var(--ink2)',
                      fontWeight: 600,
                      fontSize: '.8rem',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--blue)';
                      e.currentTarget.style.color = 'var(--blue)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--ink2)';
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>

      {/* ── Delete Child PIN Modal ─────────────────────────────────────── */}
      {deleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              padding: '36px 32px',
              maxWidth: 360,
              width: '100%',
              textAlign: 'center',
              fontFamily: 'Poppins,sans-serif',
              boxShadow: '0 40px 100px rgba(0,0,0,.4)',
              animation: deletePinShake ? 'shake .4s ease' : 'none',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
            <h3
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              Delete Child Profile?
            </h3>
            <p
              style={{
                fontSize: '.82rem',
                color: 'var(--ink3)',
                fontWeight: 500,
                marginBottom: 22,
                lineHeight: 1.6,
              }}
            >
              Enter your 4-digit parent PIN to confirm deletion.
              <br />
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 48,
                    height: 56,
                    borderRadius: 12,
                    border: `2.5px solid ${deletePinError ? 'var(--red)' : deletePin.length > i ? 'var(--blue)' : 'var(--border)'}`,
                    background: deletePin.length > i ? 'var(--blue-bg)' : 'var(--bg2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    transition: 'all .2s',
                  }}
                >
                  {deletePin.length > i ? '●' : ''}
                </div>
              ))}
            </div>
            {/* PIN Pad */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 10,
                maxWidth: 220,
                margin: '0 auto 20px',
              }}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (k === '⌫') setDeletePin((v) => v.slice(0, -1));
                    else if (k === '') return;
                    else if (deletePin.length < 4) setDeletePin((v) => v + k);
                  }}
                  style={{
                    height: 52,
                    borderRadius: 12,
                    border: '1.5px solid var(--border)',
                    background: k === '' ? 'transparent' : 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: k === '' ? 'default' : 'pointer',
                    fontFamily: 'Poppins,sans-serif',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={(e) => {
                    if (k) e.currentTarget.style.background = 'var(--blue-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = k === '' ? 'transparent' : 'var(--surface)';
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setChildToDelete(null);
                  setDeletePin('');
                  setDeletePinError(false);
                }}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--ink2)',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '.86rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteChild}
                disabled={deletePin.length < 4}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: deletePin.length === 4 ? 'var(--red)' : 'var(--bg3)',
                  color: deletePin.length === 4 ? 'white' : 'var(--ink3)',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '.86rem',
                  cursor: deletePin.length === 4 ? 'pointer' : 'default',
                  transition: 'all .2s',
                }}
              >
                Delete
              </button>
            </div>
            {deletePinError && (
              <div
                style={{ fontSize: '.78rem', color: 'var(--red)', fontWeight: 700, marginTop: 10 }}
              >
                ❌ Wrong PIN. Try again.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PIN Setup Modal ─────────────────────────────────────────────── */}
      {showPinSetup && (
        <PinSetupModal onComplete={handlePinSetupComplete} onSkip={handlePinSetupSkip} />
      )}

      {/* ── Pastor Verification Modal ───────────────────────────────────── */}
      {showPastorModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.75)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 28,
              padding: '40px 36px',
              maxWidth: 480,
              width: '100%',
              textAlign: 'center',
              fontFamily: 'Poppins,sans-serif',
              boxShadow: '0 40px 100px rgba(0,0,0,.5)',
              animation: pastorCodeShake ? 'shake .4s ease' : 'slideUp .35s ease',
              border: '1.5px solid var(--border)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: '3.2rem', marginBottom: 14 }}>⛪</div>
            <h3
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.55rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 8,
              }}
            >
              Pastor Access
            </h3>

            <div
              style={{
                display: 'flex',
                borderRadius: 12,
                background: 'var(--bg2)',
                padding: 4,
                marginBottom: 24,
                border: '1.5px solid var(--border)',
              }}
            >
              <button
                onClick={() => setPastorModalTab('code')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: pastorModalTab === 'code' ? 'var(--surface)' : 'transparent',
                  color: pastorModalTab === 'code' ? 'var(--blue)' : 'var(--ink3)',
                  fontWeight: 700,
                  fontSize: '.85rem',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  boxShadow: pastorModalTab === 'code' ? 'var(--sh-sm)' : 'none',
                }}
              >
                I have a Code
              </button>
              <button
                onClick={() => setPastorModalTab('request')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: pastorModalTab === 'request' ? 'var(--surface)' : 'transparent',
                  color: pastorModalTab === 'request' ? 'var(--blue)' : 'var(--ink3)',
                  fontWeight: 700,
                  fontSize: '.85rem',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  boxShadow: pastorModalTab === 'request' ? 'var(--sh-sm)' : 'none',
                }}
              >
                Request Access
              </button>
            </div>

            {pastorModalTab === 'code' && (
              <>
                <p
                  style={{
                    fontSize: '.82rem',
                    color: 'var(--ink3)',
                    fontWeight: 500,
                    marginBottom: 24,
                    lineHeight: 1.65,
                  }}
                >
                  Enter the unique access code provided to your congregation's leadership to unlock
                  your Pastor account and Church Hub.
                </p>

                {/* Code input */}
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter pastor code…"
                  value={pastorCode}
                  onChange={(e) => {
                    setPastorCode(e.target.value.toUpperCase());
                    setPastorCodeError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && verifyPastorCode()}
                  style={{
                    textAlign: 'center',
                    letterSpacing: 4,
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    width: '100%',
                    border: `2px solid ${pastorCodeError ? 'var(--red)' : 'var(--blue)'}`,
                    marginBottom: pastorCodeError ? 8 : 20,
                  }}
                />
                {pastorCodeError && (
                  <div
                    style={{
                      fontSize: '.78rem',
                      color: 'var(--red)',
                      fontWeight: 700,
                      marginBottom: 16,
                    }}
                  >
                    ❌ Invalid code. Please try again.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={closePastorModal}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: 14,
                      border: '1.5px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--ink2)',
                      fontFamily: 'Poppins,sans-serif',
                      fontWeight: 700,
                      fontSize: '.86rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyPastorCode}
                    disabled={!pastorCode.trim()}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: 14,
                      border: 'none',
                      background: pastorCode.trim() ? 'var(--blue)' : 'var(--bg3)',
                      color: pastorCode.trim() ? 'white' : 'var(--ink3)',
                      fontFamily: 'Poppins,sans-serif',
                      fontWeight: 700,
                      fontSize: '.86rem',
                      cursor: pastorCode.trim() ? 'pointer' : 'default',
                      transition: 'all .2s',
                    }}
                  >
                    ✅ Verify
                  </button>
                </div>

                <p
                  style={{
                    fontSize: '.7rem',
                    color: 'var(--ink3)',
                    fontWeight: 500,
                    marginTop: 18,
                    lineHeight: 1.5,
                  }}
                >
                  Don't have a code? Tap "Request Access" above to verify your church leadership.
                </p>
              </>
            )}

            {pastorModalTab === 'request' && (
              <>
                {pastorReqSuccess ? (
                  <div style={{ padding: '20px 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                    <h4
                      style={{
                        fontFamily: "'Baloo 2',cursive",
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: 'var(--green)',
                        marginBottom: 8,
                      }}
                    >
                      Request Received!
                    </h4>
                    <p
                      style={{
                        fontSize: '.85rem',
                        color: 'var(--ink3)',
                        fontWeight: 500,
                        marginBottom: 24,
                        lineHeight: 1.6,
                      }}
                    >
                      We've received your request to unlock Church Hub features for{' '}
                      <strong>{pastorReqForm.churchName}</strong>. Our team will review this and
                      email you within 24-48 hours.
                    </p>
                    <button
                      onClick={closePastorModal}
                      style={{
                        width: '100%',
                        padding: '12px 0',
                        borderRadius: 14,
                        border: 'none',
                        background: 'var(--blue)',
                        color: 'white',
                        fontFamily: 'Poppins,sans-serif',
                        fontWeight: 700,
                        fontSize: '.86rem',
                        cursor: 'pointer',
                      }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'left' }}>
                    <p
                      style={{
                        fontSize: '.82rem',
                        color: 'var(--ink3)',
                        fontWeight: 500,
                        marginBottom: 20,
                        lineHeight: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      To protect our community, please provide your church details to unlock the
                      Church Hub tools.
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        marginBottom: 20,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: '.68rem',
                            fontWeight: 700,
                            color: 'var(--ink3)',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          Your Full Name *
                        </label>
                        <input
                          className="input-field"
                          placeholder="Pastor John Smith"
                          value={pastorReqForm.fullName}
                          onChange={(e) =>
                            setPastorReqForm((f) => ({ ...f, fullName: e.target.value }))
                          }
                          style={{ fontSize: '.85rem' }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '.68rem',
                            fontWeight: 700,
                            color: 'var(--ink3)',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          Church Name *
                        </label>
                        <input
                          className="input-field"
                          placeholder="Grace Community Church"
                          value={pastorReqForm.churchName}
                          onChange={(e) =>
                            setPastorReqForm((f) => ({ ...f, churchName: e.target.value }))
                          }
                          style={{ fontSize: '.85rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              fontSize: '.68rem',
                              fontWeight: 700,
                              color: 'var(--ink3)',
                              display: 'block',
                              marginBottom: 4,
                            }}
                          >
                            City / Location *
                          </label>
                          <input
                            className="input-field"
                            placeholder="Atlanta, GA"
                            value={pastorReqForm.city}
                            onChange={(e) =>
                              setPastorReqForm((f) => ({ ...f, city: e.target.value }))
                            }
                            style={{ fontSize: '.85rem' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              fontSize: '.68rem',
                              fontWeight: 700,
                              color: 'var(--ink3)',
                              display: 'block',
                              marginBottom: 4,
                            }}
                          >
                            Denomination
                          </label>
                          <input
                            className="input-field"
                            placeholder="e.g. Baptist (Optional)"
                            value={pastorReqForm.denomination}
                            onChange={(e) =>
                              setPastorReqForm((f) => ({ ...f, denomination: e.target.value }))
                            }
                            style={{ fontSize: '.85rem' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '.68rem',
                            fontWeight: 700,
                            color: 'var(--ink3)',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          Church Website (Optional)
                        </label>
                        <input
                          className="input-field"
                          placeholder="https://..."
                          value={pastorReqForm.website}
                          onChange={(e) =>
                            setPastorReqForm((f) => ({ ...f, website: e.target.value }))
                          }
                          style={{ fontSize: '.85rem' }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '.68rem',
                            fontWeight: 700,
                            color: 'var(--ink3)',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          className="textarea-field"
                          placeholder="Any specific needs for your congregation?"
                          value={pastorReqForm.message}
                          onChange={(e) =>
                            setPastorReqForm((f) => ({ ...f, message: e.target.value }))
                          }
                          style={{ height: 60, fontSize: '.85rem' }}
                        />
                      </div>
                    </div>

                    {pastorReqError && (
                      <div
                        style={{
                          fontSize: '.75rem',
                          color: 'var(--red)',
                          fontWeight: 600,
                          background: 'var(--red-bg)',
                          padding: '8px 12px',
                          borderRadius: 8,
                          marginBottom: 16,
                        }}
                      >
                        ⚠️ {pastorReqError}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={closePastorModal}
                        style={{
                          flex: 1,
                          padding: '12px 0',
                          borderRadius: 14,
                          border: '1.5px solid var(--border)',
                          background: 'var(--surface)',
                          color: 'var(--ink2)',
                          fontFamily: 'Poppins,sans-serif',
                          fontWeight: 700,
                          fontSize: '.86rem',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitPastorRequest}
                        disabled={
                          pastorReqSubmitting ||
                          !pastorReqForm.fullName.trim() ||
                          !pastorReqForm.churchName.trim() ||
                          !pastorReqForm.city.trim()
                        }
                        style={{
                          flex: 2,
                          padding: '12px 0',
                          borderRadius: 14,
                          border: 'none',
                          background: 'var(--blue)',
                          color: 'white',
                          fontFamily: 'Poppins,sans-serif',
                          fontWeight: 700,
                          fontSize: '.86rem',
                          cursor: 'pointer',
                          opacity:
                            pastorReqSubmitting ||
                            !pastorReqForm.fullName.trim() ||
                            !pastorReqForm.churchName.trim() ||
                            !pastorReqForm.city.trim()
                              ? 0.6
                              : 1,
                          transition: 'all .2s',
                        }}
                      >
                        {pastorReqSubmitting ? '⏳ Sending...' : '📬 Submit Request'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
