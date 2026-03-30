import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useKidsMode } from '../context/KidsModeContext';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import FamilyDevotionalSection from '../components/FamilyDevotionalSection';
import AggregatedProgressSection from '../components/AggregatedProgressSection';

// Hardcoded resource data
const ALL_RESOURCES = [
  // Lesson Plans
  {
    id: 'lp-1',
    title: 'Fruit of the Spirit: Love',
    description: "Interactive lesson on God's love with activities and crafts for young learners.",
    category: 'Lesson Plans',
    role: 'Teacher',
    ageRange: '4-8',
    ageAppropriate: true,
    icon: '🍎',
    link: '#',
    downloadable: true,
  },
  {
    id: 'lp-2',
    title: 'David and Goliath: Faith',
    description:
      "Teaching faith through David's courage with interactive storytelling and discussion.",
    category: 'Lesson Plans',
    role: 'Teacher',
    ageRange: '6-12',
    ageAppropriate: true,
    icon: '🏹',
    link: '#',
    downloadable: true,
  },
  {
    id: 'lp-3',
    title: 'Parables for Parents',
    description: "Guide to teaching Jesus's parables to children with modern-day applications.",
    category: 'Lesson Plans',
    role: 'Parent',
    ageRange: '5-10',
    ageAppropriate: true,
    icon: '📖',
    link: '#',
    downloadable: true,
  },
  {
    id: 'lp-4',
    title: 'Ten Commandments Exploration',
    description: 'Deep dive into the Ten Commandments with age-appropriate explanations.',
    category: 'Lesson Plans',
    role: 'Teacher',
    ageRange: '8-14',
    ageAppropriate: false,
    icon: '⛪',
    link: '#',
    downloadable: true,
  },

  // Devotionals
  {
    id: 'dev-1',
    title: 'Family Prayer Time Guide',
    description: 'Structured guide for meaningful family prayer sessions with discussion prompts.',
    category: 'Devotionals',
    role: 'Parent',
    ageRange: 'All',
    ageAppropriate: true,
    icon: '🕯️',
    link: '#',
    downloadable: false,
  },
  {
    id: 'dev-2',
    title: 'Bedtime Bible Stories',
    description: 'Calming Bible stories perfect for bedtime routines with peaceful themes.',
    category: 'Devotionals',
    role: 'Parent',
    ageRange: '3-8',
    ageAppropriate: true,
    icon: '🌙',
    link: '#',
    downloadable: false,
  },
  {
    id: 'dev-3',
    title: "Teacher's Daily Devotional",
    description: 'Inspirational devotionals designed specifically for educators and mentors.',
    category: 'Devotionals',
    role: 'Teacher',
    ageRange: 'Adult',
    ageAppropriate: false,
    icon: '✝️',
    link: '#',
    downloadable: false,
  },
  {
    id: 'dev-4',
    title: 'Morning Verses for Kids',
    description: 'Short, uplifting Bible verses to start the day with joy and purpose.',
    category: 'Devotionals',
    role: 'Parent',
    ageRange: '4-12',
    ageAppropriate: true,
    icon: '☀️',
    link: '#',
    downloadable: false,
  },

  // Activity Ideas
  {
    id: 'act-1',
    title: 'Armor of God Craft',
    description: 'Hands-on craft to help children remember spiritual armor with fun materials.',
    category: 'Activity Ideas',
    role: 'Teacher',
    ageRange: '5-10',
    ageAppropriate: true,
    icon: '🛡️',
    link: '#',
    downloadable: true,
  },
  {
    id: 'act-2',
    title: 'Bible Verse Memory Games',
    description: 'Interactive games to help children memorize Scripture in a fun way.',
    category: 'Activity Ideas',
    role: 'Parent',
    ageRange: '4-12',
    ageAppropriate: true,
    icon: '🎮',
    link: '#',
    downloadable: true,
  },
  {
    id: 'act-3',
    title: 'Creation Week Art Project',
    description: "Multi-day art project exploring God's creation with daily activities.",
    category: 'Activity Ideas',
    role: 'Teacher',
    ageRange: '6-11',
    ageAppropriate: true,
    icon: '🎨',
    link: '#',
    downloadable: true,
  },
  {
    id: 'act-4',
    title: 'Parenting Challenges & Rewards',
    description: 'Structured challenges to encourage spiritual growth in family settings.',
    category: 'Activity Ideas',
    role: 'Parent',
    ageRange: 'Family',
    ageAppropriate: true,
    icon: '🏆',
    link: '#',
    downloadable: false,
  },

  // Teaching Resources
  {
    id: 'tr-1',
    title: 'Classroom Discussion Guides',
    description: 'Comprehensive guides for leading meaningful Bible discussions in classrooms.',
    category: 'Teaching Resources',
    role: 'Teacher',
    ageRange: '6-14',
    ageAppropriate: false,
    icon: '💬',
    link: '#',
    downloadable: true,
  },
  {
    id: 'tr-2',
    title: 'Parent-Teacher Communication Templates',
    description: 'Ready-to-use templates for communicating with parents about spiritual growth.',
    category: 'Teaching Resources',
    role: 'Teacher',
    ageRange: 'Adult',
    ageAppropriate: false,
    icon: '📧',
    link: '#',
    downloadable: true,
  },
  {
    id: 'tr-3',
    title: 'Bible Verse Reference Guide',
    description: 'Quick reference guide to key Bible verses organized by topic and age group.',
    category: 'Teaching Resources',
    role: 'Parent',
    ageRange: 'All',
    ageAppropriate: true,
    icon: '📚',
    link: '#',
    downloadable: true,
  },
  {
    id: 'tr-4',
    title: 'Assessment Tools for Spiritual Growth',
    description: 'Tools to measure and track spiritual development in children.',
    category: 'Teaching Resources',
    role: 'Teacher',
    ageRange: 'All',
    ageAppropriate: false,
    icon: '📊',
    link: '#',
    downloadable: true,
  },
];

const CATEGORIES = ['Lesson Plans', 'Devotionals', 'Activity Ideas', 'Teaching Resources'];

export default function ParentsTeachers() {
  const { user, profile } = useAuth();
  const { kidsMode } = useKidsMode();
  const [activeCategory, setActiveCategory] = useState('Lesson Plans');
  const [showSignInModal, setShowSignInModal] = useState(false);

  // Filter resources based on category, role, kids mode, and auth status
  const filteredResources = useMemo(() => {
    let filtered = ALL_RESOURCES.filter((r) => r.category === activeCategory);

    // Apply Kids Mode filter
    if (kidsMode) {
      filtered = filtered.filter((r) => r.ageAppropriate === true);
    }

    // Apply role-based sorting
    if (user && profile?.role) {
      // Sort by role: user's role first, then others
      filtered.sort((a, b) => {
        const aIsUserRole = a.role === profile.role;
        const bIsUserRole = b.role === profile.role;
        if (aIsUserRole && !bIsUserRole) return -1;
        if (!aIsUserRole && bIsUserRole) return 1;
        return 0;
      });
    }

    // For unauthenticated users, show limited preview (first 3 per category)
    if (!user) {
      filtered = filtered.slice(0, 3);
    }

    return filtered;
  }, [activeCategory, user, profile, kidsMode]);

  function handleUnauthorizedClick() {
    setShowSignInModal(true);
  }

  const heroStyle = {
    background: 'linear-gradient(160deg,#0F0F1A 0%,#1E1B4B 55%,#0A1A14 100%)',
    paddingTop: 'clamp(44px,8vw,64px)',
    paddingBottom: 'clamp(32px,6vw,48px)',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const glowStyle1 = {
    position: 'absolute',
    top: -80,
    left: '18%',
    width: 320,
    height: 320,
    borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(99,102,241,.15),transparent 70%)',
    pointerEvents: 'none',
  };

  const glowStyle2 = {
    position: 'absolute',
    top: 10,
    right: '14%',
    width: 220,
    height: 220,
    borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(99,102,241,.1),transparent 70%)',
    pointerEvents: 'none',
  };

  const titleStyle = {
    fontFamily: "'Baloo 2', cursive",
    fontSize: 'clamp(1.8rem,5vw,2.4rem)',
    fontWeight: 800,
    color: 'white',
    marginBottom: 8,
    letterSpacing: '-.4px',
    position: 'relative',
    zIndex: 1,
  };

  const subtitleStyle = {
    fontSize: '.95rem',
    color: 'rgba(255,255,255,.65)',
    fontWeight: 500,
    marginBottom: 6,
    position: 'relative',
    zIndex: 1,
  };

  const welcomeStyle = {
    fontSize: '.85rem',
    color: 'rgba(255,255,255,.45)',
    fontWeight: 500,
    marginBottom: 20,
    position: 'relative',
    zIndex: 1,
  };

  const tabsContainerStyle = {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: '0 16px',
    position: 'relative',
    zIndex: 1,
  };

  const tabStyle = (active) => ({
    padding: '10px 20px',
    borderRadius: 14,
    border: 'none',
    background: active ? 'var(--blue)' : 'rgba(255,255,255,.08)',
    color: active ? 'white' : 'rgba(255,255,255,.65)',
    fontWeight: 700,
    fontSize: '.85rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'Poppins,sans-serif',
  });

  const contentStyle = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 'clamp(24px,5vw,40px) 16px',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
    marginBottom: 32,
  };

  const emptyStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--ink3)',
  };

  const previewBannerStyle = {
    background: 'linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.08))',
    border: '1.5px solid rgba(99,102,241,.2)',
    borderRadius: 16,
    padding: '16px 20px',
    marginBottom: 24,
    textAlign: 'center',
    fontSize: '.85rem',
    fontWeight: 600,
    color: 'var(--ink2)',
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={glowStyle1} />
        <div style={glowStyle2} />

        <div style={titleStyle}>👨‍👩‍👧 Parents & Teachers Hub</div>
        <div style={subtitleStyle}>Resources for Faith-Filled Families & Classrooms</div>

        {/* Role-aware welcome message */}
        {user && profile ? (
          <div style={welcomeStyle}>
            {profile.role === 'Teacher'
              ? '🏫 Welcome, Teacher! Explore resources designed for your classroom.'
              : profile.role === 'Parent'
                ? '👨‍👩‍👧 Welcome, Parent! Find activities and devotionals for your family.'
                : '👤 Welcome! Browse resources for families and educators.'}
          </div>
        ) : (
          <div style={welcomeStyle}>
            📖 Sign in to unlock full access to all resources and features.
          </div>
        )}

        {/* Category Tabs */}
        <div style={tabsContainerStyle}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={tabStyle(activeCategory === cat)}
              onMouseEnter={(e) => {
                if (activeCategory !== cat) {
                  e.currentTarget.style.background = 'rgba(255,255,255,.12)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat) {
                  e.currentTarget.style.background = 'rgba(255,255,255,.08)';
                }
              }}
            >
              {cat === 'Lesson Plans' && '📚'}
              {cat === 'Devotionals' && '🙏'}
              {cat === 'Activity Ideas' && '🎨'}
              {cat === 'Teaching Resources' && '📖'} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div style={contentStyle}>
        {/* Preview banner for unauthenticated users */}
        {!user && (
          <div style={previewBannerStyle}>
            👀 You're viewing a limited preview.{' '}
            <Link
              to="/auth"
              style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' }}
            >
              Sign in
            </Link>{' '}
            to access all resources.
          </div>
        )}

        {/* Kids Mode indicator */}
        {kidsMode && (
          <div
            style={{
              ...previewBannerStyle,
              background: 'linear-gradient(135deg,rgba(252,211,77,.1),rgba(245,158,11,.08))',
              borderColor: 'rgba(252,211,77,.2)',
              color: 'var(--ink2)',
            }}
          >
            👶 Kids Mode is active — showing age-appropriate resources only.
          </div>
        )}

        {/* Aggregated Progress Section (Teacher role) */}
        {user && profile?.role === 'Teacher' && (
          <div style={{ marginBottom: 32 }}>
            <AggregatedProgressSection />
          </div>
        )}

        {/* Family Devotional Section (Devotionals tab + Parent role) */}
        {activeCategory === 'Devotionals' && user && profile?.role === 'Parent' && (
          <div style={{ marginBottom: 32 }}>
            <FamilyDevotionalSection />
          </div>
        )}

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div style={gridStyle}>
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onUnauthorizedClick={handleUnauthorizedClick}
              />
            ))}
          </div>
        ) : (
          <div style={emptyStyle}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.3 }}>📚</div>
            <div
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              No resources available
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--ink3)' }}>
              {kidsMode
                ? 'No age-appropriate resources in this category. Try another category or disable Kids Mode.'
                : 'No resources found in this category.'}
            </div>
          </div>
        )}
      </div>

      {/* Sign-In Modal for Unauthenticated Users */}
      {showSignInModal && (
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
          onClick={() => setShowSignInModal(false)}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              padding: '36px 32px',
              maxWidth: 400,
              width: '100%',
              textAlign: 'center',
              fontFamily: 'Poppins,sans-serif',
              boxShadow: '0 40px 100px rgba(0,0,0,.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔐</div>
            <h3
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 8,
              }}
            >
              Sign In to Access
            </h3>
            <p
              style={{
                fontSize: '.85rem',
                color: 'var(--ink2)',
                fontWeight: 500,
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Create an account or sign in to unlock full access to all resources, save your
              favorites, and track your family's progress.
            </p>
            <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
              <Link
                to="/auth"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: 'var(--blue)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '.9rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                ✝️ Sign In / Create Account
              </Link>
              <button
                onClick={() => setShowSignInModal(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--ink2)',
                  fontWeight: 700,
                  fontSize: '.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
