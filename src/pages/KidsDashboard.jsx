import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChildSwitcher } from '../context/ChildSwitcherContext';
import * as db from '../lib/db';

// 30 stickers — a Bible character for every achievement
export const STICKERS = [
  {
    id: 's01',
    emoji: '👑',
    name: 'King David',
    color: '#F59E0B',
    task: 'Play Bible Trivia',
    route: '/play/trivia',
  },
  {
    id: 's02',
    emoji: '🚢',
    name: 'Noah',
    color: '#3B82F6',
    task: 'Complete a Jigsaw Puzzle',
    route: '/kids/jigsaw',
  },
  {
    id: 's03',
    emoji: '🏹',
    name: 'David vs Goliath',
    color: '#EC4899',
    task: 'Play David & Goliath',
    route: '/game/david-goliath',
  },
  {
    id: 's04',
    emoji: '🌈',
    name: 'Rainbow Promise',
    color: '#A855F7',
    task: 'Finish Creation Coloring',
    route: '/kids/coloring',
  },
  {
    id: 's05',
    emoji: '🐋',
    name: 'Jonah',
    color: '#60A5FA',
    task: 'Name 5 Bible Animals',
    route: '/kids/animals',
  },
  {
    id: 's06',
    emoji: '🦁',
    name: 'Daniel',
    color: '#F97316',
    task: 'Spell 5 Bible Words',
    route: '/kids/word-builder',
  },
  {
    id: 's07',
    emoji: '👸',
    name: 'Queen Esther',
    color: '#F472B6',
    task: 'Unscramble 5 Verses',
    route: '/kids/verse-scramble',
  },
  {
    id: 's08',
    emoji: '🌸',
    name: 'Mary',
    color: '#EC4899',
    task: 'Learn 10 Alphabet Letters',
    route: '/kids/alphabet',
  },
  {
    id: 's09',
    emoji: '🔥',
    name: 'Elijah',
    color: '#EF4444',
    task: 'Answer 10 Math Problems',
    route: '/kids/counting',
  },
  {
    id: 's10',
    emoji: '🌾',
    name: 'Ruth',
    color: '#10B981',
    task: 'Identify 5 Shapes',
    route: '/kids/shapes',
  },
  {
    id: 's11',
    emoji: '🎣',
    name: 'Peter',
    color: '#6366F1',
    task: 'Read 5 Bible Stories',
    route: '/kids-stories',
  },
  {
    id: 's12',
    emoji: '🌿',
    name: 'Moses at Bush',
    color: '#22C55E',
    task: 'Complete Day 1-3 Coloring',
    route: '/kids/coloring',
  },
  {
    id: 's13',
    emoji: '✉️',
    name: 'Paul',
    color: '#8B5CF6',
    task: 'Play Bible Trivia 3 times',
    route: '/play/trivia',
  },
  {
    id: 's14',
    emoji: '⭐',
    name: 'Wise Men Star',
    color: '#FCD34D',
    task: 'Complete all Alphabet letters',
    route: '/kids/alphabet',
  },
  {
    id: 's15',
    emoji: '🐑',
    name: 'Lost Sheep',
    color: '#F1F5F9',
    task: 'Do 10 Verse Scrambles',
    route: '/kids/verse-scramble',
  },
  {
    id: 's16',
    emoji: '🌊',
    name: 'Red Sea Parted',
    color: '#0EA5E9',
    task: 'Complete Noah Jigsaw',
    route: '/kids/jigsaw',
  },
  {
    id: 's17',
    emoji: '🏔️',
    name: 'Mount Sinai',
    color: '#78716C',
    task: 'Spell every Bible word',
    route: '/kids/word-builder',
  },
  {
    id: 's18',
    emoji: '💧',
    name: 'Water to Wine',
    color: '#C084FC',
    task: 'Complete Baby Moses Jigsaw',
    route: '/kids/jigsaw',
  },
  {
    id: 's19',
    emoji: '🎵',
    name: 'Miriam Dancing',
    color: '#FB923C',
    task: 'Answer 25 Math Problems',
    route: '/kids/counting',
  },
  {
    id: 's20',
    emoji: '🕊️',
    name: 'Holy Dove',
    color: '#67E8F9',
    task: 'Name all 10 Bible Animals',
    route: '/kids/animals',
  },
  {
    id: 's21',
    emoji: '🍞',
    name: '5 Loaves',
    color: '#D97706',
    task: 'Count to 100 in Bible World',
    route: '/kids/counting',
  },
  {
    id: 's22',
    emoji: '🎁',
    name: 'Baby Jesus',
    color: '#FDE68A',
    task: 'Complete all 7 Creation Days',
    route: '/kids/coloring',
  },
  {
    id: 's23',
    emoji: '🔑',
    name: 'Keys of Kingdom',
    color: '#6B7280',
    task: 'Learn A-Z Alphabet',
    route: '/kids/alphabet',
  },
  {
    id: 's24',
    emoji: '👼',
    name: 'Gabriel Angel',
    color: '#A5B4FC',
    task: 'Identify all 8 Shapes',
    route: '/kids/shapes',
  },
  {
    id: 's25',
    emoji: '🌟',
    name: 'Bethlehem Star',
    color: '#FCD34D',
    task: 'Unscramble 10 Verses',
    route: '/kids/verse-scramble',
  },
  {
    id: 's26',
    emoji: '🪨',
    name: 'Stone of David',
    color: '#9CA3AF',
    task: 'Win Bible Trivia Perfect',
    route: '/play/trivia',
  },
  {
    id: 's27',
    emoji: '🎺',
    name: 'Jericho Walls',
    color: '#F59E0B',
    task: 'Play 10 different games',
    route: '/',
  },
  {
    id: 's28',
    emoji: '🌺',
    name: 'Garden of Eden',
    color: '#4ADE80',
    task: 'Color all Creation pictures',
    route: '/kids/coloring',
  },
  {
    id: 's29',
    emoji: '⚡',
    name: 'Power of God',
    color: '#818CF8',
    task: 'Complete Level 3 Math',
    route: '/kids/counting',
  },
  {
    id: 's30',
    emoji: '❤️',
    name: "God's Love",
    color: '#F472B6',
    task: 'Use BibleFunLand every day!',
    route: '/',
  },
];

const FEATURES = [
  {
    emoji: '📖',
    label: 'Word Builder',
    desc: 'Learn Bible words letter by letter',
    route: '/kids/word-builder',
    color: '#6366F1',
  },
  {
    emoji: '🔢',
    label: 'Counting World',
    desc: 'Math through Bible stories',
    route: '/kids/counting',
    color: '#3B82F6',
  },
  {
    emoji: '🎨',
    label: 'Creation Coloring',
    desc: 'Color the 7 Days of Creation',
    route: '/kids/coloring',
    color: '#10B981',
  },
  {
    emoji: '🔷',
    label: "God's Shapes",
    desc: "Shapes from God's creation",
    route: '/kids/shapes',
    color: '#F59E0B',
  },
  {
    emoji: '🧩',
    label: 'Bible Jigsaw',
    desc: 'Put Bible scenes together',
    route: '/kids/jigsaw',
    color: '#EC4899',
  },
  {
    emoji: '💬',
    label: 'Verse Scramble',
    desc: 'Unscramble Bible verses',
    route: '/kids/verse-scramble',
    color: '#A855F7',
  },
  {
    emoji: '🔤',
    label: 'Bible Alphabet',
    desc: 'A is for Angel, Z is for Zacchaeus!',
    route: '/kids/alphabet',
    color: '#F97316',
  },
  {
    emoji: '🎯',
    label: 'Bible Animals',
    desc: 'Guess Bible animals from silhouettes',
    route: '/kids/animals',
    color: '#14B8A6',
  },
  {
    emoji: '📚',
    label: 'Bible Stories',
    desc: 'AI stories for your age level',
    route: '/kids-stories',
    color: '#D97706',
  },
  {
    emoji: '🎮',
    label: 'Bible Trivia',
    desc: "Fun quiz about God's Word!",
    route: '/play/trivia',
    color: '#EF4444',
  },
  {
    emoji: '🏹',
    label: 'David & Goliath',
    desc: 'Sling stones of faith!',
    route: '/game/david-goliath',
    color: '#8B5CF6',
  },
  {
    emoji: '🏃',
    label: 'Scripture Runner',
    desc: 'Run and collect fruits of the Spirit',
    route: '/game/runner',
    color: '#06B6D4',
  },
];

export default function KidsDashboard() {
  const { user } = useAuth();
  const { activeChild, isChildSession } = useChildSwitcher();
  const targetId = isChildSession && activeChild ? activeChild.id : user?.id;

  const [stickers, setStickers] = useState(new Set());
  const [newSticker, setNewSticker] = useState(null);
  const [activeTab, setActiveTab] = useState('play'); // play | wall | progress

  // Fetch stickers from database
  useEffect(() => {
    if (!targetId) return;
    let mounted = true;
    db.getBadges(targetId)
      .then(({ data }) => {
        if (!mounted) return;
        if (data) {
          setStickers(new Set(data.map((b) => b.badge_id)));
        }
      })
      .catch((err) => console.error('Error fetching stickers:', err));
    return () => {
      mounted = false;
    };
  }, [targetId]);

  const earned = stickers.size;
  const pct = Math.round((earned / STICKERS.length) * 100);

  function awardSticker(id) {
    if (stickers.has(id)) return;
    const s = new Set([...stickers, id]);
    setStickers(s);

    if (targetId) {
      db.awardBadge(targetId, id).catch((err) => console.error('Error saving sticker:', err));
    }

    setNewSticker(STICKERS.find((st) => st.id === id));
    setTimeout(() => setNewSticker(null), 3000);
  }

  // First sticker on first visit
  useEffect(() => {
    if (stickers.size === 0 && targetId) {
      const timer = setTimeout(() => awardSticker('s01'), 2000);
      return () => clearTimeout(timer);
    }
  }, [stickers.size, targetId]);

  return (
    <div
      style={{
        background: 'linear-gradient(180deg,#EFF6FF 0%,#FDF4FF 50%,#ECFDF5 100%)',
        minHeight: '100vh',
        fontFamily: 'Poppins,sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg,#1D4ED8,#7C3AED,#059669)',
          padding: '32px 24px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating decorations */}
        {['⭐', '🌈', '✝️', '❤️', '🦁', '🕊️', '⭐', '🎉'].map((e, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              fontSize: '1.2rem',
              opacity: 0.25,
              animation: `bob${i % 2 === 0 ? 'L' : 'R'} ${3 + i * 0.4}s ease-in-out ${i * -0.5}s infinite`,
              left: `${5 + i * 12}%`,
              top: `${10 + (i % 3) * 25}%`,
              pointerEvents: 'none',
            }}
          >
            {e}
          </div>
        ))}

        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🏆</div>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(1.8rem,5vw,2.8rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 6,
          }}
        >
          My Bible World!
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,.8)',
            fontSize: '.84rem',
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Play, learn, and collect Bible stickers! 🎉
        </p>

        {/* Progress ring summary */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            ['⭐', `${earned}/${STICKERS.length}`, 'Stickers'],
            ['📚', '12', 'Activities'],
            ['🎮', "Let's Go!", 'Play Now'],
          ].map(([e, v, l]) => (
            <div
              key={l}
              style={{
                background: 'rgba(255,255,255,.15)',
                borderRadius: 16,
                padding: '10px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.3rem' }}>{e}</div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: 'white',
                  fontSize: '1rem',
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontSize: '.62rem',
                  color: 'rgba(255,255,255,.6)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New sticker toast */}
      {newSticker && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
            background: 'white',
            borderRadius: 20,
            padding: '16px 20px',
            boxShadow: `0 8px 40px ${newSticker.color}44`,
            border: `3px solid ${newSticker.color}`,
            animation: 'stickerPop .5s cubic-bezier(.34,1.56,.64,1)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: newSticker.color + '18',
              border: `2px solid ${newSticker.color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
            }}
          >
            {newSticker.emoji}
          </div>
          <div>
            <div
              style={{
                fontSize: '.68rem',
                fontWeight: 800,
                color: newSticker.color,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              🎉 New Sticker!
            </div>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontWeight: 800,
                color: '#1F2937',
                fontSize: '.9rem',
              }}
            >
              {newSticker.name}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 14px' }}>
        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 20,
            background: 'white',
            borderRadius: 16,
            padding: 6,
            boxShadow: '0 2px 12px rgba(0,0,0,.08)',
          }}
        >
          {[
            ['play', '🎮 Play & Learn'],
            ['wall', '⭐ My Sticker Wall'],
            ['progress', '📊 My Progress'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1,
                padding: '11px 8px',
                borderRadius: 12,
                border: 'none',
                background:
                  activeTab === id ? 'linear-gradient(135deg,#1D4ED8,#7C3AED)' : 'transparent',
                color: activeTab === id ? 'white' : '#6B7280',
                fontFamily: 'Poppins,sans-serif',
                fontWeight: 800,
                fontSize: '.78rem',
                cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Play & Learn */}
        {activeTab === 'play' && (
          <div>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#1F2937',
                marginBottom: 14,
                textAlign: 'center',
              }}
            >
              🌟 Pick something fun to do!
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))',
                gap: 12,
              }}
            >
              {FEATURES.map((f) => (
                <Link
                  key={f.route}
                  to={f.route}
                  style={{
                    background: 'white',
                    borderRadius: 20,
                    padding: '18px 14px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    border: `2px solid ${f.color}22`,
                    transition: 'all .25s',
                    boxShadow: '0 4px 16px rgba(0,0,0,.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 10px 28px ${f.color}22`;
                    e.currentTarget.style.borderColor = f.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.06)';
                    e.currentTarget.style.borderColor = f.color + '22';
                  }}
                >
                  <div
                    style={{
                      fontSize: '2.5rem',
                      marginBottom: 8,
                      filter: `drop-shadow(0 2px 8px ${f.color}44)`,
                    }}
                  >
                    {f.emoji}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontWeight: 800,
                      color: f.color,
                      fontSize: '.88rem',
                      marginBottom: 4,
                      lineHeight: 1.2,
                    }}
                  >
                    {f.label}
                  </div>
                  <div
                    style={{
                      fontSize: '.68rem',
                      color: '#6B7280',
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {f.desc}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sticker Wall */}
        {activeTab === 'wall' && (
          <div>
            {/* Progress */}
            <div
              style={{
                background: 'white',
                borderRadius: 20,
                padding: '18px 20px',
                marginBottom: 16,
                boxShadow: '0 4px 16px rgba(0,0,0,.06)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: '#1F2937',
                  fontSize: '1.1rem',
                  marginBottom: 8,
                }}
              >
                ⭐ {earned} / {STICKERS.length} Stickers Collected!
              </div>
              <div
                style={{
                  height: 14,
                  borderRadius: 100,
                  background: '#F1F5F9',
                  overflow: 'hidden',
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 100,
                    background: 'linear-gradient(90deg,#FCD34D,#F97316)',
                    width: `${pct}%`,
                    transition: 'width .6s',
                    boxShadow: '0 0 10px rgba(252,211,77,.5)',
                  }}
                />
              </div>
              <div style={{ fontSize: '.72rem', color: '#6B7280', fontWeight: 600 }}>
                {pct}% complete — keep playing to fill your wall!
              </div>
            </div>

            {/* Sticker grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(95px,1fr))',
                gap: 10,
              }}
            >
              {STICKERS.map((s) => {
                const isEarned = stickers.has(s.id);
                return (
                  <div
                    key={s.id}
                    title={isEarned ? s.name : s.task}
                    style={{
                      background: 'white',
                      borderRadius: 18,
                      padding: '14px 8px',
                      textAlign: 'center',
                      border: `2.5px solid ${isEarned ? s.color : '#E5E7EB'}`,
                      transition: 'all .2s',
                      boxShadow: isEarned ? `0 4px 16px ${s.color}28` : 'none',
                      opacity: isEarned ? 1 : 0.35,
                      filter: isEarned ? 'none' : 'grayscale(1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isEarned && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          background: `${s.color}06`,
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                    <div
                      style={{
                        fontSize: '2rem',
                        marginBottom: 5,
                        filter: isEarned ? `drop-shadow(0 2px 6px ${s.color}66)` : 'none',
                      }}
                    >
                      {s.emoji}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Baloo 2',cursive",
                        fontWeight: 800,
                        color: isEarned ? s.color : '#9CA3AF',
                        fontSize: '.62rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {s.name}
                    </div>
                    {!isEarned && (
                      <div
                        style={{
                          fontSize: '.52rem',
                          color: '#9CA3AF',
                          marginTop: 2,
                          lineHeight: 1.3,
                        }}
                      >
                        {s.task}
                      </div>
                    )}
                    {isEarned && (
                      <div
                        style={{
                          fontSize: '.58rem',
                          color: '#059669',
                          fontWeight: 700,
                          marginTop: 3,
                        }}
                      >
                        ✅ Earned!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p
              style={{
                textAlign: 'center',
                fontSize: '.72rem',
                color: '#6B7280',
                marginTop: 16,
                fontWeight: 500,
              }}
            >
              Play games and activities to unlock all 30 stickers! 🌟
            </p>
          </div>
        )}

        {/* Progress */}
        {activeTab === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                background: 'white',
                borderRadius: 20,
                padding: '22px',
                boxShadow: '0 4px 16px rgba(0,0,0,.06)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: '#1F2937',
                  marginBottom: 16,
                  fontSize: '1rem',
                }}
              >
                🌟 Your Journey
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  ['⭐', earned, 'Stickers'],
                  ['📚', FEATURES.length, 'Activities'],
                  ['💪', pct + '%', 'Complete'],
                ].map(([e, v, l]) => (
                  <div
                    key={l}
                    style={{
                      background: 'linear-gradient(135deg,#EFF6FF,#FDF4FF)',
                      borderRadius: 16,
                      padding: '16px 8px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.6rem' }}>{e}</div>
                    <div
                      style={{
                        fontFamily: "'Baloo 2',cursive",
                        fontWeight: 800,
                        color: '#1D4ED8',
                        fontSize: '1.3rem',
                      }}
                    >
                      {v}
                    </div>
                    <div
                      style={{
                        fontSize: '.62rem',
                        color: '#6B7280',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next sticker to earn */}
            <div
              style={{
                background: 'white',
                borderRadius: 20,
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,.06)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontWeight: 800,
                  color: '#1F2937',
                  marginBottom: 12,
                  fontSize: '1rem',
                }}
              >
                🎯 Next Sticker to Earn
              </div>
              {STICKERS.filter((s) => !stickers.has(s.id))
                .slice(0, 3)
                .map((s) => (
                  <Link
                    key={s.id}
                    to={s.route}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom: '1px solid #F1F5F9',
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: '#F1F5F9',
                        border: '2px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0,
                      }}
                    >
                      {s.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Baloo 2',cursive",
                          fontWeight: 800,
                          color: '#1F2937',
                          fontSize: '.86rem',
                        }}
                      >
                        {s.name}
                      </div>
                      <div style={{ fontSize: '.72rem', color: '#6B7280', fontWeight: 500 }}>
                        {s.task}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '.72rem',
                        fontWeight: 700,
                        color: '#3B82F6',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Go! →
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bobL{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(3deg)}}
        @keyframes bobR{0%,100%{transform:translateY(0) rotate(3deg)}50%{transform:translateY(-10px) rotate(-3deg)}}
        @keyframes stickerPop{from{opacity:0;transform:scale(.7) translateX(40px)}to{opacity:1;transform:scale(1) translateX(0)}}
      `}</style>
    </div>
  );
}
