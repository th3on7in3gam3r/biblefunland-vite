import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Link } from 'react-router-dom';
import { PARTNERS } from '../data/partners';
import styles from './Partner.module.css';

const EMAILJS_SERVICE_ID = 'service_lj55mn5';
const EMAILJS_TEMPLATE_ID = 'template_wgqpffy';
const EMAILJS_PUBLIC_KEY = 'nrGYIKFTFPWeBJTBf';

const BENEFITS = [
  {
    icon: '🏛️',
    title: 'Co-Branded Landing Page',
    desc: 'Your church gets a dedicated page at /partner/your-church with your logo, welcome message, and featured content.',
  },
  {
    icon: '📡',
    title: 'Instant Reach',
    desc: 'Share your custom URL with members and they land on a page built just for them — no sign-up friction.',
  },
  {
    icon: '🤝',
    title: 'Zero Cost to You',
    desc: 'Ministry partnerships are completely free. There are no fees, no hidden costs, ever.',
  },
  {
    icon: '🛠️',
    title: 'Curated Resources',
    desc: 'We highlight the BibleFunLand features most relevant to your congregation — kids, adults, couples, and teachers.',
  },
  {
    icon: '📣',
    title: 'Community Promotion',
    desc: 'Your church events and announcements can be featured in our Community Calendar.',
  },
  {
    icon: '📈',
    title: 'Skin in the Game',
    desc: 'Partners who share their page help grow BibleFunLand — a win for the whole Kingdom.',
  },
];

const FAQS = [
  {
    q: 'How long until my church page is live?',
    a: 'After approval, we typically set up your co-branded page within 2–3 business days and send you the URL.',
  },
  {
    q: 'Can I customize what features appear on my page?',
    a: "Yes! In the application form, tell us which BibleFunLand features your congregation will use most. We'll feature those prominently.",
  },
  {
    q: 'Do I need to provide a logo?',
    a: "Not required — we'll use a church emoji placeholder. If you'd like your actual logo, email it to us after your application is approved.",
  },
  {
    q: 'Can I change my welcome message later?',
    a: "Absolutely. Email us any time and we'll update your co-branded page within 24 hours.",
  },
  {
    q: 'Is this different from the /affiliate Tier System?',
    a: "Yes. The /affiliate page covers business and ministry tiers with paid options. The Ministry Partnership (/partner) is specifically for churches who want a co-branded page — it's always free.",
  },
];

const EMPTY = {
  name: '',
  ministry: '',
  website: '',
  email: '',
  phone: '',
  size: '',
  location: '',
  slug: '',
  usage: '',
  welcome: '',
};

export default function Partner() {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  const onChange = (e) => {
    const val =
      e.target.name === 'slug'
        ? e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
        : e.target.value;
    setForm((p) => ({ ...p, [e.target.name]: val }));
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.ministry || !form.email || !form.size) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          organization: form.ministry,
          org_type: 'Ministry Partnership Application',
          website: form.website || 'N/A',
          reply_to: form.email,
          phone: form.phone || 'N/A',
          location: form.location || 'N/A',
          tier: `Size: ${form.size} | Desired slug: /partner/${form.slug || 'tbd'}`,
          message: `HOW THEY\'LL USE IT:\n${form.usage || 'N/A'}\n\nDESIRED WELCOME MESSAGE:\n${form.welcome || 'N/A'}`,
        },
        EMAILJS_PUBLIC_KEY
      );
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please email us at hello@biblefunland.com');
    } finally {
      setSending(false);
    }
  };

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>⛪ Ministry Partnerships</div>
          <h1 className={styles.heroTitle}>
            Your Church, Co-Branded
            <br />
            on BibleFunLand
          </h1>
          <p className={styles.heroSub}>
            Give your congregation their own entry point into God's Word — a custom-branded landing
            page at
            <strong style={{ color: '#34d399' }}> /partner/your-church</strong>, built for your
            members, completely free.
          </p>
          <div className={styles.heroActions}>
            <button onClick={scrollToForm} className={styles.btnPrimary}>
              ⛪ Apply for Your Church Page
            </button>
            <Link to="/affiliate" className={styles.btnSecondary}>
              🏛️ View All Partnership Tiers
            </Link>
          </div>
        </div>
      </section>

      {/* ── Active Partners Preview ── */}
      {PARTNERS.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>🌐 Live Church Pages</span>
            <h2 className={styles.sectionTitle}>Partner Churches</h2>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {PARTNERS.map((p) => (
              <Link
                key={p.slug}
                to={`/partner/${p.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderRadius: 14,
                  border: '1px solid rgba(16,185,129,0.3)',
                  background: 'rgba(16,185,129,0.06)',
                  textDecoration: 'none',
                  color: 'var(--ink)',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#34d399' }}>View their page →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className={styles.divider} />

      {/* ── Benefits ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>✨ What You Get</span>
          <h2 className={styles.sectionTitle}>Everything Included, Free</h2>
          <p className={styles.sectionSub}>
            No fees. No contracts. Just a powerful co-branded presence for your congregation.
          </p>
        </div>
        <div className={styles.benefitsGrid}>
          {BENEFITS.map((b) => (
            <div key={b.title} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{b.icon}</span>
              <div className={styles.benefitTitle}>{b.title}</div>
              <p className={styles.benefitDesc}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.divider} />

      {/* ── How It Works ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>📋 The Process</span>
          <h2 className={styles.sectionTitle}>How It Works</h2>
        </div>
        <div className={styles.steps}>
          {[
            {
              n: 1,
              title: 'Apply Below',
              desc: 'Fill out the short application — it takes 3 minutes.',
            },
            {
              n: 2,
              title: 'We Review',
              desc: 'We confirm your ministry aligns with our values (2–3 days).',
            },
            {
              n: 3,
              title: 'Page Goes Live',
              desc: 'Your co-branded page is set up and we send you the URL.',
            },
            {
              n: 4,
              title: 'Share with Members',
              desc: 'Announce it in church, text it, post it — your congregation has a home.',
            },
          ].map((s) => (
            <div key={s.n} className={styles.step}>
              <div className={styles.stepNum}>{s.n}</div>
              <div className={styles.stepTitle}>{s.title}</div>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Application Form ── */}
      <section className={styles.formSection} ref={formRef}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow} style={{ color: '#34d399' }}>
              📬 Apply Now
            </span>
            <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>
              Ministry Partnership Application
            </h2>
            <p className={styles.sectionSub} style={{ color: 'rgba(255,255,255,0.4)' }}>
              Free for all qualifying Christian ministries. We respond within 3 business days.
            </p>
          </div>

          {sent ? (
            <div className={styles.successBox}>
              <span className={styles.successIcon}>🎉</span>
              <div>
                <div className={styles.successTitle}>Application Received!</div>
                <p className={styles.successText}>
                  Thank you for applying! We'll review your ministry and reach out within 3 business
                  days to confirm your co-branded page details. God bless your congregation!
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.formCard}>
              <form onSubmit={onSubmit} noValidate>
                <div className={styles.formGrid}>
                  <div>
                    <label className={styles.formLabel} htmlFor="p-name">
                      Your Name *
                    </label>
                    <input
                      id="p-name"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="Pastor John Smith"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel} htmlFor="p-ministry">
                      Ministry Name *
                    </label>
                    <input
                      id="p-ministry"
                      name="ministry"
                      value={form.ministry}
                      onChange={onChange}
                      placeholder="Grace Community Church"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel} htmlFor="p-email">
                      Email Address *
                    </label>
                    <input
                      id="p-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="pastor@gracechurch.org"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel} htmlFor="p-size">
                      Congregation Size *
                    </label>
                    <select
                      id="p-size"
                      name="size"
                      value={form.size}
                      onChange={onChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="">Select size...</option>
                      <option value="Under 50">Under 50 members</option>
                      <option value="50–200">50–200 members</option>
                      <option value="200–500">200–500 members</option>
                      <option value="500–1,000">500–1,000 members</option>
                      <option value="1,000+">1,000+ members</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.formLabel} htmlFor="p-website">
                      Website (optional)
                    </label>
                    <input
                      id="p-website"
                      name="website"
                      type="url"
                      value={form.website}
                      onChange={onChange}
                      placeholder="https://gracechurch.org"
                      className={styles.formInput}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel} htmlFor="p-phone">
                      Phone (optional)
                    </label>
                    <input
                      id="p-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="+1 (555) 000-0000"
                      className={styles.formInput}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel} htmlFor="p-location">
                      City, State / Country
                    </label>
                    <input
                      id="p-location"
                      name="location"
                      value={form.location}
                      onChange={onChange}
                      placeholder="Atlanta, GA  /  Lagos, Nigeria"
                      className={styles.formInput}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel} htmlFor="p-slug">
                      Desired Page URL *
                      <span
                        style={{
                          color: '#34d399',
                          fontWeight: 400,
                          textTransform: 'none',
                          letterSpacing: 0,
                        }}
                      >
                        {' '}
                        → biblefunland.com/partner/{form.slug || 'grace-community'}
                      </span>
                    </label>
                    <input
                      id="p-slug"
                      name="slug"
                      value={form.slug}
                      onChange={onChange}
                      placeholder="grace-community"
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <label className={styles.formLabel} htmlFor="p-usage">
                      How will your congregation use BibleFunLand?
                    </label>
                    <textarea
                      id="p-usage"
                      name="usage"
                      value={form.usage}
                      onChange={onChange}
                      placeholder="E.g. Sunday school kids using the Bible games, adults using daily devotionals, teens in youth groups..."
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <label className={styles.formLabel} htmlFor="p-welcome">
                      Desired welcome message for your members (optional)
                    </label>
                    <textarea
                      id="p-welcome"
                      name="welcome"
                      value={form.welcome}
                      onChange={onChange}
                      placeholder="E.g. Welcome, Grace family! Your pastor has partnered with BibleFunLand to bring God's Word to life for every age..."
                      className={styles.formTextarea}
                    />
                  </div>
                </div>

                {error && <div className={styles.errorBox}>⚠️ {error}</div>}

                <div className={styles.formSubmitRow}>
                  <button type="submit" disabled={sending} className={styles.submitBtn}>
                    {sending ? '⏳ Submitting...' : '⛪ Submit Application'}
                  </button>
                  <p className={styles.formNote}>
                    Free for all qualifying ministries. We review every application personally.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>❓ Questions</span>
          <h2 className={styles.sectionTitle}>Common Questions</h2>
        </div>
        <div className={styles.faqList}>
          {FAQS.map(({ q, a }) => (
            <details key={q} className={styles.faqItem}>
              <summary className={styles.faqQ}>{q}</summary>
              <p className={styles.faqA}>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
