import { useState, useEffect } from 'react';

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Homeschool Mom',
    location: 'Texas',
    quote:
      'My kids beg to do Bible trivia every morning now. BibleFunLand has completely transformed our devotional time!',
    emoji: '👩‍👧‍👦',
    stars: 5,
  },
  {
    name: 'Pastor James',
    role: "Children's Pastor",
    location: 'Georgia',
    quote:
      'I use the activity sheets every Sunday. The kids love them and parents keep asking where I get them. Incredible resource.',
    emoji: '⛪',
    stars: 5,
  },
  {
    name: 'The Williams Family',
    role: 'Family of 5',
    location: 'Ohio',
    quote:
      "We do the weekly challenge together every Monday. It's become our favorite family tradition. The leaderboard makes it so fun!",
    emoji: '👨‍👩‍👧‍👦',
    stars: 5,
  },
  {
    name: 'Mrs. Thompson',
    role: 'Sunday School Teacher',
    location: 'California',
    quote:
      'The AI lesson plan generator saves me hours every week. I just type the topic and get a complete lesson. Absolutely amazing.',
    emoji: '🎓',
    stars: 5,
  },
  {
    name: 'David K.',
    role: 'Dad of 3',
    location: 'Florida',
    quote:
      'My 8-year-old has memorized more scripture in 2 months with BibleFunLand than in 2 years of Sunday school. The games work!',
    emoji: '🏆',
    stars: 5,
  },
  {
    name: 'Grace Community Church',
    role: 'Church of 200',
    location: 'Tennessee',
    quote:
      "We recommend BibleFunLand to every family in our congregation. It's the best free Christian resource we've found.",
    emoji: '✝️',
    stars: 5,
  },
];

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, [paused]);

  const t = TESTIMONIALS[current];

  return (
    <section style={{ padding: '60px 24px', background: 'white' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '.72rem',
              fontWeight: 800,
              letterSpacing: '.5px',
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: 100,
              background: '#F5F3FF',
              color: '#8B5CF6',
              marginBottom: 12,
            }}
          >
            ❤️ Loved by Families
          </div>
          <h2
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1.5rem,3.5vw,2.2rem)',
              fontWeight: 800,
              color: '#1E1B4B',
              marginBottom: 6,
            }}
          >
            Used by Families &amp; Churches Worldwide
          </h2>
          <p style={{ color: '#6B7280', fontSize: '.88rem' }}>
            Join thousands of families making Bible learning fun
          </p>
        </div>

        {/* Main testimonial */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            background: 'linear-gradient(135deg,#F5F3FF,#EFF6FF)',
            borderRadius: 24,
            padding: '36px 40px',
            textAlign: 'center',
            marginBottom: 20,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 200,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -10,
              left: 20,
              fontSize: '6rem',
              opacity: 0.06,
              fontFamily: 'Georgia,serif',
              lineHeight: 1,
            }}
          >
            "
          </div>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{t.emoji}</div>
          <p
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1rem,2.5vw,1.25rem)',
              fontWeight: 700,
              color: '#1E1B4B',
              lineHeight: 1.65,
              marginBottom: 16,
              maxWidth: 600,
              margin: '0 auto 16px',
              fontStyle: 'italic',
            }}
          >
            "{t.quote}"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800, color: '#1E1B4B', fontSize: '.9rem' }}>{t.name}</div>
              <div style={{ fontSize: '.75rem', color: '#6B7280' }}>
                {t.role} · {t.location}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10, color: '#FBBF24', fontSize: '1rem', letterSpacing: 2 }}>
            {'★'.repeat(t.stars)}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setPaused(true);
              }}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 99,
                background: i === current ? '#8B5CF6' : '#E5E7EB',
                border: 'none',
                cursor: 'pointer',
                transition: 'all .3s',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
            gap: 14,
          }}
        >
          {[
            { n: '10,000+', l: 'Families', emoji: '👨‍👩‍👧' },
            { n: '500+', l: 'Churches', emoji: '⛪' },
            { n: '80+', l: 'Free Features', emoji: '🎮' },
            { n: '100%', l: 'Scripture-Based', emoji: '📖' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: '#F8FAFF',
                borderRadius: 16,
                border: '1.5px solid #E5E7EB',
                padding: '18px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{s.emoji}</div>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#1E1B4B',
                }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: '.72rem', color: '#6B7280', fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
