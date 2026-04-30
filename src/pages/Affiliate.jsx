import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import styles from './Affiliate.module.css';

// ─── EmailJS Config ─────────────────────────────────────────────────────────
// Service ID → EmailJS Dashboard → Email Services → Service ID
// Template ID → EmailJS Dashboard → Email Templates → Template ID
const EMAILJS_SERVICE_ID = 'service_lj55mn5'; // ✅ Set (Gmail)
const EMAILJS_TEMPLATE_ID = 'template_wgqpffy'; // ✅ Set
const EMAILJS_PUBLIC_KEY = 'nrGYIKFTFPWeBJTBf'; // ✅ Set
// ────────────────────────────────────────────────────────────────────────────

const TIERS = [
  {
    id: 'friend',
    icon: '🤝',
    name: 'Kingdom Friend',
    tagline: 'Perfect for small churches & local ministries',
    badge: 'Free Forever',
    badgeStyle: { background: 'rgba(52, 211, 153, 0.12)', color: '#34d399' },
    perks: [
      'Listed in our Partner Directory',
      'Kingdom Resource Kit (digital)',
      'Shareable BibleFunLand badge for your website',
      'Monthly faith family newsletter',
      'Access to our free printable activity sheets',
    ],
    ctaLabel: 'Apply Now — Free',
    ctaStyle: 'outline',
    featured: false,
  },
  {
    id: 'ally',
    icon: '⚡',
    name: 'Mission Ally',
    tagline: 'For growing churches & faith-based schools',
    badge: 'Most Popular',
    badgeStyle: { background: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa' },
    perks: [
      'Everything in Kingdom Friend',
      'Featured spotlight on our Partners page',
      'Co-branded landing page on BibleFunLand',
      'Church event listed in our Community Calendar',
      'Priority email support & partner Slack channel',
      'Monthly partner impact report',
    ],
    ctaLabel: 'Apply for Mission Ally',
    ctaStyle: 'primary',
    featured: true,
  },
  {
    id: 'partner',
    icon: '👑',
    name: 'Kingdom Partner',
    tagline: 'For businesses, publishers & large ministries',
    badge: 'Max Reach',
    badgeStyle: { background: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24' },
    perks: [
      'Everything in Mission Ally',
      'Logo featured on the BibleFunLand homepage',
      'Dedicated partner profile page',
      'Co-create content & seasonal campaigns',
      'Revenue-share opportunities',
      'Early access to new features & beta tools',
      'Quarterly strategy call with the founder',
    ],
    ctaLabel: 'Apply for Kingdom Partner',
    ctaStyle: 'outline',
    featured: false,
  },
];

const REAL_PARTNERS = [
  {
    name: 'Anointed Worship Center',
    url: 'https://anointedworshipcenter.com',
    icon: '⛪',
    region: 'Kingdom Friend Partner',
    founding: true,
  },
];

const PLACEHOLDER_SLOTS = [
  { icon: '📚', label: 'Your Ministry Here', region: 'Southeast USA' },
  { icon: '🏫', label: 'Your School Here', region: 'Midwest USA' },
  { icon: '✝️', label: 'Your Business Here', region: 'West Coast USA' },
  { icon: '🌍', label: 'Your Church Here', region: 'International' },
  { icon: '🤝', label: 'Your Ministry Here', region: 'Southwest USA' },
];

const FAQS = [
  {
    q: 'Who can apply to be an affiliate partner?',
    a: 'Any registered church, Christian school, faith-based nonprofit, or family-friendly Christian business is welcome to apply. We review each application to ensure alignment with our values and community standards.',
  },
  {
    q: 'Is there a cost to become a Kingdom Friend?',
    a: 'No! The Kingdom Friend tier is completely free and always will be. You get listed in our directory and receive our digital resource kit at no charge.',
  },
  {
    q: 'How long does the application review take?',
    a: 'We typically review and respond to applications within 3–5 business days. During high-volume periods it may take up to 7 days.',
  },
  {
    q: 'Can I upgrade my tier later?',
    a: 'Absolutely. You can start as a Kingdom Friend and upgrade to Mission Ally or Kingdom Partner at any time. We make the upgrade process seamless.',
  },
  {
    q: 'What does "co-branded" mean?',
    a: "For Mission Ally and higher, we create a dedicated page on BibleFunLand.com featuring your organization's name, logo, description, and links to your website and events.",
  },
  {
    q: 'How does revenue sharing work for Kingdom Partners?',
    a: 'Kingdom Partners can participate in our affiliate and co-promotion programs, earning a percentage of referred Premium subscriptions. Full details are shared during the onboarding call.',
  },
];

const EMPTY_FORM = {
  name: '',
  organization: '',
  orgType: '',
  website: '',
  email: '',
  phone: '',
  location: '',
  tier: '',
  message: '',
};

export default function Affiliate() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.name || !form.organization || !form.email || !form.orgType || !form.tier) {
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
          organization: form.organization,
          org_type: form.orgType,
          website: form.website || 'N/A',
          reply_to: form.email,
          phone: form.phone || 'N/A',
          location: form.location || 'N/A',
          tier: form.tier,
          message: form.message || 'No additional message provided.',
        },
        EMAILJS_PUBLIC_KEY
      );
      setSent(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('EmailJS error:', err);
      setError(
        'Something went wrong sending your application. Please try emailing us directly at hello@biblefunland.com'
      );
    } finally {
      setSending(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🏛️ Partnership Program</div>
          <h1 className={styles.heroTitle}>
            Unite Your Mission
            <br />
            with BibleFunLand
          </h1>
          <p className={styles.heroSub}>
            Whether you're a local church, a faith-based school, or a Christian business — partner
            with us to reach thousands of families growing in God's Word together.
          </p>
          <div className={styles.heroActions}>
            <button onClick={scrollToForm} className={styles.btnPrimary}>
              🤝 Apply to Partner
            </button>
            <a href="#tiers" className={styles.btnSecondary}>
              📋 View Partnership Tiers
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statNum}>10K+</div>
          <div className={styles.statLabel}>Families Served</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNum}>40+</div>
          <div className={styles.statLabel}>Countries Reached</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNum}>100+</div>
          <div className={styles.statLabel}>Features & Tools</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNum}>Free</div>
          <div className={styles.statLabel}>Always for Families</div>
        </div>
      </div>

      {/* ── Why Partner ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>✨ Why Partner With Us</span>
          <h2 className={styles.sectionTitle}>Kingdom Impact, Together</h2>
          <p className={styles.sectionSub}>
            When your organization unites with BibleFunLand, you gain a platform, a community, and a
            co-laborer in the great commission.
          </p>
        </div>
        <div className={styles.valuesGrid}>
          {[
            {
              icon: '📡',
              title: 'Massive Reach',
              desc: 'Gain visibility with thousands of Christian families across 40+ countries actively engaging with our platform daily.',
            },
            {
              icon: '🤝',
              title: 'Trusted Branding',
              desc: 'Being listed as a BibleFunLand partner signals trust and spiritual integrity to your community and beyond.',
            },
            {
              icon: '🛠️',
              title: 'Shared Tools',
              desc: 'Co-branded resources, printable materials, and digital tools your congregation can use immediately.',
            },
            {
              icon: '💬',
              title: 'Community Voice',
              desc: "Share your events, sermons, and announcements with an engaged faith audience that's already plugged in.",
            },
            {
              icon: '📈',
              title: 'Growth Opportunities',
              desc: "Kingdom Partners can participate in revenue sharing, helping fund your ministry's next chapter.",
            },
            {
              icon: '❤️',
              title: 'Shared Values',
              desc: 'We only partner with organizations that share our commitment to Scripture, family, and the love of Christ.',
            },
          ].map((v) => (
            <div key={v.title} className={styles.valueCard}>
              <span className={styles.valueIcon}>{v.icon}</span>
              <div className={styles.valueTitle}>{v.title}</div>
              <p className={styles.valueDesc}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.divider} />

      {/* ── Partnership Tiers ── */}
      <section id="tiers" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>🏆 Partnership Tiers</span>
          <h2 className={styles.sectionTitle}>Choose Your Level of Partnership</h2>
          <p className={styles.sectionSub}>
            Start free and grow with us. Every tier is designed to meet you where you are.
          </p>
        </div>
        <div className={styles.tiersGrid}>
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`${styles.tierCard} ${tier.featured ? styles.tierCardFeatured : ''}`}
            >
              {tier.featured && <div className={styles.tierPopularBadge}>⭐ Most Popular</div>}
              <div className={styles.tierIcon}>{tier.icon}</div>
              <div>
                <div className={styles.tierName}>{tier.name}</div>
                <div className={styles.tierTagline}>{tier.tagline}</div>
              </div>
              <div className={styles.tierBadge} style={tier.badgeStyle}>
                {tier.badge}
              </div>
              <ul className={styles.tierPerks}>
                {tier.perks.map((perk) => (
                  <li key={perk} className={styles.tierPerk}>
                    <span className={styles.tierPerkCheck}>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                onClick={scrollToForm}
                className={`${styles.tierCta} ${tier.ctaStyle === 'primary' ? styles.tierCtaPrimary : styles.tierCtaOutline}`}
              >
                {tier.ctaLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Partner Showcase ── */}
      <section className={`${styles.partnerShowcase}`}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>🌐 Partner Directory</span>
            <h2 className={styles.sectionTitle}>Our Growing Partner Family</h2>
            <p className={styles.sectionSub}>
              These spots are open — be among the first partners to join us!
            </p>
          </div>
          <div className={styles.partnerGrid}>
            {/* Real active partners */}
            {REAL_PARTNERS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.partnerSlot}
                style={{
                  border: '1.5px solid rgba(139, 92, 246, 0.4)',
                  textDecoration: 'none',
                  background: 'rgba(139, 92, 246, 0.06)',
                  cursor: 'pointer',
                  opacity: 1,
                }}
              >
                <span className={styles.partnerSlotIcon}>{p.icon}</span>
                <div className={styles.partnerSlotLabel}>
                  <strong style={{ color: 'var(--ink)' }}>{p.name}</strong>
                  <br />
                  <span style={{ fontSize: '0.7rem', color: '#a78bfa' }}>{p.region}</span>
                  {p.founding && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: '0.6rem',
                        background: 'rgba(139,92,246,0.15)',
                        color: '#a78bfa',
                        border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: 100,
                        padding: '2px 8px',
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      ⭐ Founding Partner
                    </div>
                  )}
                </div>
              </a>
            ))}
            {/* Placeholder slots */}
            {PLACEHOLDER_SLOTS.map((slot, i) => (
              <div key={i} className={`${styles.partnerSlot} ${styles.partnerSlotEmpty}`}>
                <span className={styles.partnerSlotIcon}>{slot.icon}</span>
                <div className={styles.partnerSlotLabel}>
                  <strong>{slot.label}</strong>
                  <br />
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{slot.region}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.partnerFirstCta}>
            <p>🎉 Be the first partner in your region!</p>
            <button onClick={scrollToForm} className={styles.btnPrimary}>
              Claim Your Spot
            </button>
          </div>
        </div>
      </section>

      {/* ── Application Form ── */}
      <section className={`${styles.formSection}`} ref={formRef}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow} style={{ color: '#a78bfa' }}>
              📬 Apply Now
            </span>
            <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>
              Start Your Partnership Application
            </h2>
            <p className={styles.sectionSub} style={{ color: 'rgba(255,255,255,0.45)' }}>
              Fill out the form below and we'll get back to you within 3–5 business days.
            </p>
          </div>

          {sent ? (
            <div className={styles.successToast}>
              <span className={styles.successIcon}>🎉</span>
              <div>
                <div className={styles.successTitle}>Application Received!</div>
                <p className={styles.successText}>
                  Thank you for applying to partner with BibleFunLand! We'll review your application
                  and reach out to {form.email || 'you'} within 3–5 business days. In the meantime,
                  feel free to explore everything our platform has to offer. God bless!
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.formCard}>
              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.formGrid}>
                  {/* Name */}
                  <div>
                    <label className={styles.formLabel} htmlFor="aff-name">
                      Your Name *
                    </label>
                    <input
                      id="aff-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Pastor John Smith"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  {/* Organization */}
                  <div>
                    <label className={styles.formLabel} htmlFor="aff-org">
                      Organization Name *
                    </label>
                    <input
                      id="aff-org"
                      name="organization"
                      value={form.organization}
                      onChange={handleChange}
                      placeholder="Grace Community Church"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  {/* Org Type */}
                  <div>
                    <label className={styles.formLabel} htmlFor="aff-type">
                      Organization Type *
                    </label>
                    <select
                      id="aff-type"
                      name="orgType"
                      value={form.orgType}
                      onChange={handleChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="">Select a type...</option>
                      <option value="Church">⛪ Church</option>
                      <option value="School / Academy">🏫 Christian School / Academy</option>
                      <option value="Ministry / Nonprofit">🤲 Ministry / Nonprofit</option>
                      <option value="Christian Business">💼 Christian Business</option>
                      <option value="Publisher / Media">📚 Publisher / Media</option>
                      <option value="Other">🌟 Other</option>
                    </select>
                  </div>

                  {/* Tier Interest */}
                  <div>
                    <label className={styles.formLabel} htmlFor="aff-tier">
                      Partnership Tier *
                    </label>
                    <select
                      id="aff-tier"
                      name="tier"
                      value={form.tier}
                      onChange={handleChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="">Select a tier...</option>
                      <option value="Kingdom Friend (Free)">🤝 Kingdom Friend (Free)</option>
                      <option value="Mission Ally">⚡ Mission Ally</option>
                      <option value="Kingdom Partner">👑 Kingdom Partner</option>
                      <option value="Not Sure Yet">🤔 Not Sure Yet</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={styles.formLabel} htmlFor="aff-email">
                      Email Address *
                    </label>
                    <input
                      id="aff-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="pastor@gracechurch.org"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={styles.formLabel} htmlFor="aff-phone">
                      Phone (optional)
                    </label>
                    <input
                      id="aff-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className={styles.formInput}
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className={styles.formLabel} htmlFor="aff-website">
                      Website (optional)
                    </label>
                    <input
                      id="aff-website"
                      name="website"
                      type="url"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://gracechurch.org"
                      className={styles.formInput}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className={styles.formLabel} htmlFor="aff-location">
                      City, State / Country
                    </label>
                    <input
                      id="aff-location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Atlanta, GA  /  Lagos, Nigeria"
                      className={styles.formInput}
                    />
                  </div>

                  {/* Message */}
                  <div className={styles.formGroupFull}>
                    <label className={styles.formLabel} htmlFor="aff-message">
                      Tell Us About Your Organization
                    </label>
                    <textarea
                      id="aff-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Share your mission, congregation size, what you're hoping to accomplish through this partnership..."
                      className={styles.formTextarea}
                    />
                  </div>
                </div>

                {error && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171',
                      fontSize: '0.88rem',
                    }}
                  >
                    ⚠️ {error}
                  </div>
                )}

                <div className={styles.formSubmitRow}>
                  <button type="submit" disabled={sending} className={styles.formSubmitBtn}>
                    {sending ? '⏳ Sending...' : '🚀 Submit Application'}
                  </button>
                  <p className={styles.formDisclaimer}>
                    By applying, you agree to our{' '}
                    <a href="/terms" style={{ color: '#a78bfa' }}>
                      Terms of Service
                    </a>
                    . We never share your information. We'll only contact you about your
                    partnership.
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
          <span className={styles.sectionEyebrow}>❓ Common Questions</span>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        </div>
        <div className={styles.faqList}>
          {FAQS.map(({ q, a }) => (
            <details key={q} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{q}</summary>
              <p className={styles.faqAnswer}>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
