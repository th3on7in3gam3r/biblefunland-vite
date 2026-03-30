import { useState } from 'react';
const VIDS = [
  {
    id: 1,
    title: 'The Bible Project: Overview',
    desc: "A cinematic walk through the entire Bible's story from Genesis to Revelation.",
    thumb: '📖',
    bg: 'linear-gradient(135deg,#EFF6FF,#EDE9FE)',
    cat: 'Bible Story',
    views: '12M',
    dur: '5:32',
    yt: '7_CGP-12AE0',
    featured: true,
  },
  {
    id: 2,
    title: 'David & Goliath (Saddleback Kids)',
    desc: 'The epic battle of faith retold in stunning animation for kids.',
    thumb: '🏹',
    bg: 'linear-gradient(135deg,#FDF2F8,#F5F3FF)',
    cat: 'Kids',
    views: '14M',
    dur: '3:14',
    yt: 'NuedVFB8-7Y',
  },
  {
    id: 3,
    title: "Noah's Ark — God's Covenant",
    desc: 'The story of Noah, the great flood, and the promise of the rainbow.',
    thumb: '🚢',
    bg: 'linear-gradient(135deg,#ECFDF5,#F0FDFA)',
    cat: 'Kids',
    views: '8.8M',
    dur: '4:45',
    yt: 'qzYjy6lhRag',
  },
  {
    id: 4,
    title: 'The Life of Jesus — Luke Part 1',
    desc: 'Explore the early life of Jesus and the beginning of His ministry.',
    thumb: '✝️',
    bg: 'linear-gradient(135deg,#FFFBEB,#FFF7ED)',
    cat: 'Bible Story',
    views: '10M',
    dur: '14:22',
    yt: 'XIb_dCIxzr0',
  },
  {
    id: 5,
    title: 'Jonah & the Whale (BibleProject)',
    desc: "The story of a reluctant prophet and God's overwhelming mercy.",
    thumb: '🐟',
    bg: 'linear-gradient(135deg,#F0FDFA,#ECFDF5)',
    cat: 'Bible Story',
    views: '4.2M',
    dur: '8:45',
    yt: 'dLIabZc0O4c',
  },
  {
    id: 6,
    title: 'Creation Story (Saddleback Kids)',
    desc: 'The miraculous story of how God created the world in six days.',
    thumb: '🌍',
    bg: 'linear-gradient(135deg,#EFF6FF,#ECFDF5)',
    cat: 'Kids',
    views: '11M',
    dur: '7:18',
    yt: 'teu7BCZTgDs',
  },
  {
    id: 7,
    title: 'Worship: What A Beautiful Name',
    desc: 'Hillsong Worship anthem performed live with powerful lyrics.',
    thumb: '🎵',
    bg: 'linear-gradient(135deg,#EDE9FE,#FDF2F8)',
    cat: 'Worship',
    views: '88M',
    dur: '5:41',
    yt: 'nQWFzMvEEZA',
  },
  {
    id: 8,
    title: 'Worship: Graves Into Gardens',
    desc: 'Elevation Worship — Turning failure into victory in Christ.',
    thumb: '🙌',
    bg: 'linear-gradient(135deg,#FFF7ED,#FFFBEB)',
    cat: 'Worship',
    views: '22M',
    dur: '6:03',
    yt: 'Kw8Bw5X2Wsg',
  },
  {
    id: 9,
    title: 'Jeremiah (BibleProject)',
    desc: "God's promise of a new heart in a changing world.",
    thumb: '🌅',
    bg: 'linear-gradient(135deg,#FFFBEB,#FFF7ED)',
    cat: 'Bible Story',
    views: '3.3M',
    dur: '7:02',
    yt: 'RSK36cHbrk0',
  },
  {
    id: 10,
    title: 'How to Read the Bible: Prose Discourse',
    desc: 'Learn the different ways the Bible tells its grand story.',
    thumb: '📝',
    bg: 'linear-gradient(135deg,#FEF2F2,#FDF2F8)',
    cat: 'Devotional',
    views: '6.1M',
    dur: '5:55',
    yt: '3AYoSpGAOHI',
  },
  {
    id: 11,
    title: 'Moses & The Red Sea (Saddleback)',
    desc: "God's miraculous deliverance of His people from slavery.",
    thumb: '🔥',
    bg: 'linear-gradient(135deg,#FFF7ED,#FFFBEB)',
    cat: 'Kids',
    views: '18M',
    dur: '5:20',
    yt: 'g25492m54D8',
  },
  {
    id: 12,
    title: "Daniel in the Lions' Den (Saddleback)",
    desc: 'Saddleback Kids presents the courage of Daniel in the den.',
    thumb: '🦁',
    bg: 'linear-gradient(135deg,#ECFDF5,#F0FDFA)',
    cat: 'Kids',
    views: '14.9M',
    dur: '3:30',
    yt: 'bEM_X25DWPk',
  },
  {
    id: 13,
    title: 'Acts Part 1 (BibleProject)',
    desc: 'The journey of the early church from Jerusalem to Samaria.',
    thumb: '🛤️',
    bg: 'linear-gradient(135deg,#FDF2F8,#F5F3FF)',
    cat: 'Bible Story',
    views: '4.5M',
    dur: '12:10',
    yt: 'CGbNw855ksw',
  },
  {
    id: 14,
    title: 'Fruit of the Spirit — Kids Lesson',
    desc: 'Love, Joy, Peace... learn how God grows us from the inside.',
    thumb: '🍓',
    bg: 'linear-gradient(135deg,#FFFBEB,#ECFDF5)',
    cat: 'Kids',
    views: '12M',
    dur: '4:15',
    yt: 'x1NHe0m_1d8',
  },
  {
    id: 15,
    title: 'The Farmer & The Seeds (Parable)',
    desc: 'Minno Kids — Jesus explains how our hearts grow spiritual fruit.',
    thumb: '🌱',
    bg: 'linear-gradient(135deg,#ECFDF5,#FFFBEB)',
    cat: 'Kids',
    views: '4.8M',
    dur: '6:40',
    yt: 'b4wS9_vW9s8',
  },
  {
    id: 16,
    title: 'The Good Samaritan — Loving Neighbors',
    desc: 'A timeless lesson on kindness and compassion for our neighbors.',
    thumb: '🤝',
    bg: 'linear-gradient(135deg,#F5F3FF,#FDF2F8)',
    cat: 'Kids',
    views: '7.2M',
    dur: '5:30',
    yt: 'osfQg4yKtq8',
  },
  {
    id: 17,
    title: 'Joseph & His Coat of Colors',
    desc: "Genesis 37: A story of family, jealousy, and God's greater plan.",
    thumb: '👑',
    bg: 'linear-gradient(135deg,#FFF7ED,#FDE68A)',
    cat: 'Kids',
    views: '9.7M',
    dur: '3:45',
    yt: 'VnlqKPIZQzI',
  },
  {
    id: 18,
    title: 'Peter Walks on Water (Saddleback)',
    desc: 'Teaching us to keep our eyes on Jesus even in the storms.',
    thumb: '🌊',
    bg: 'linear-gradient(135deg,#EFF6FF,#EDE9FE)',
    cat: 'Kids',
    views: '5.1M',
    dur: '4:25',
    yt: 'oVy9HGr3Qig',
  },
  {
    id: 19,
    title: 'The Law — BibleProject',
    desc: "Understanding God's instructions at Mt. Sinai and their purpose.",
    thumb: '📜',
    bg: 'linear-gradient(135deg,#F3F4F6,#E5E7EB)',
    cat: 'Bible Story',
    views: '2.2M',
    dur: '6:05',
    yt: 'qgU3Z28S_50',
  },
  {
    id: 20,
    title: 'Revelation (Part 1) — BibleProject',
    desc: 'The epic vision of John and the promise of a world made new.',
    thumb: '🌈',
    bg: 'linear-gradient(135deg,#EDE9FE,#C084FC)',
    cat: 'Bible Story',
    views: '15M',
    dur: '12:44',
    yt: '5nvVVcYD-0w',
  },
];
const FILTERS = ['All', 'Bible Story', 'Devotional', 'Kids', 'Worship'];
export default function Videos() {
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const visible = filter === 'All' ? VIDS : VIDS.filter((v) => v.cat === filter);
  const featured = VIDS.find((v) => v.featured);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {modal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.88)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              background: '#0F0F1A',
              borderRadius: 24,
              overflow: 'hidden',
              width: '100%',
              maxWidth: 860,
              boxShadow: '0 40px 120px rgba(0,0,0,.5)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setModal(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255,255,255,.12)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
            <div style={{ aspectRatio: '16/9', background: '#000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${modal.yt}?autoplay=1`}
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                title={modal.title}
              />
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: 5,
                }}
              >
                {modal.title}
              </div>
              <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>
                {modal.desc}
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ background: 'var(--ink)', padding: '60px 36px 44px', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,4.5vw,3.4rem)',
            fontWeight: 800,
            letterSpacing: -1,
            background: 'linear-gradient(90deg,#60A5FA,#C084FC,#F472B6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          Bible Videos
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500 }}>
          Inspiring stories, tutorials, and devotionals — new content every week!
        </p>
      </div>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 24px' }}>
        {/* Featured */}
        {featured && (
          <div style={{ marginBottom: 44 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--red-bg)',
                color: 'var(--red)',
                fontSize: '.7rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 100,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--red)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              Featured This Week
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}`}</style>
            <h2
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              {featured.title}
            </h2>
            <p
              style={{
                fontSize: '.88rem',
                color: 'var(--ink2)',
                fontWeight: 500,
                marginBottom: 18,
                maxWidth: 680,
              }}
            >
              {featured.desc}
            </p>
            <div
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(0,0,0,.15)',
                aspectRatio: '16/9',
                background: '#0A0A1A',
                border: '1.5px solid var(--border)',
                maxWidth: 800,
                position: 'relative',
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${featured.yt}?rel=0&modestbranding=1`}
                title={featured.title}
                allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            </div>
            <button
              onClick={() => setModal(featured)}
              style={{
                marginTop: 20,
                padding: '12px 28px',
                borderRadius: 16,
                background: 'var(--blue)',
                color: 'white',
                border: 'none',
                fontSize: '.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 10px 30px var(--blue-bg)',
              }}
            >
              ▶ Watch Full Screen
            </button>
          </div>
        )}
        {/* Grid */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'var(--ink)',
            }}
          >
            More Videos
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: '.76rem',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 100,
                  cursor: 'pointer',
                  border: `1.5px solid ${filter === f ? 'var(--blue)' : 'var(--border)'}`,
                  background: filter === f ? 'var(--blue)' : 'var(--surface)',
                  color: filter === f ? 'white' : 'var(--ink2)',
                  transition: 'all .2s',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
            gap: 24,
          }}
        >
          {visible
            .filter((v) => !v.featured)
            .map((v) => (
              <div
                key={v.id}
                onClick={() => setModal(v)}
                style={{
                  borderRadius: 20,
                  background: 'var(--surface)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1.5px solid var(--border)',
                  transition: 'all .28s',
                  boxShadow: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    aspectRatio: '16/9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: v.bg,
                    position: 'relative',
                    fontSize: '3.2rem',
                  }}
                >
                  {v.thumb}
                  <div
                    style={{
                      position: 'absolute',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,.92)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 18px rgba(0,0,0,.2)',
                      opacity: 0,
                      transition: 'opacity .25s',
                    }}
                    className="vc-play"
                  >
                    ▶
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      background: 'rgba(0,0,0,.75)',
                      color: 'white',
                      fontSize: '.65rem',
                      fontWeight: 700,
                      padding: '3px 7px',
                      borderRadius: 5,
                    }}
                  >
                    {v.dur}
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      fontSize: '.63rem',
                      fontWeight: 700,
                      padding: '2px 9px',
                      borderRadius: 100,
                      background: 'var(--blue-bg)',
                      color: 'var(--blue)',
                      display: 'inline-block',
                      marginBottom: 7,
                    }}
                  >
                    {v.cat}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '.92rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      lineHeight: 1.35,
                      marginBottom: 5,
                    }}
                  >
                    {v.title}
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>
                    👁️ {v.views} · ⏱️ {v.dur}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
