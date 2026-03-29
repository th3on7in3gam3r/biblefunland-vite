import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './Creators.module.css'

// ProPlan pricing for earnings calculator
const PRO_PRICE = 9.99
const COMMISSION_RATE = 0.20

const FAQS = [
  { q: 'How do I get paid?', a: 'We track referrals manually and pay out via PayPal or Venmo on the 1st of each month for the previous month\'s conversions. A minimum payout threshold of $10 applies.' },
  { q: 'How does the tracking work?', a: 'Your unique link adds ?ref=yourname to the URL. When a visitor clicks it, we store that code in their browser. If they upgrade to Pro within 30 days, you earn 20% of their subscription.' },
  { q: 'Who is eligible?', a: 'Any Christian content creator — YouTubers, podcasters, bloggers, TikTokers, Instagram ministers — is welcome. We just ask that your content aligns with our faith values.' },
  { q: 'Is there a limit to how much I can earn?', a: 'No cap! The more your audience converts, the more you earn. Some creators can significantly fund their ministry through referrals alone.' },
  { q: 'How do I verify my dashboard stats are accurate?', a: 'The dashboard shows locally tracked data from your browser. For verified conversion reports, email us at hello@biblefunland.com and we\'ll send your official report.' },
]

// localStorage key
const STORAGE_KEY = 'bfl_creator_stats'

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { clicks: 0, visits: [], handle: '' }
  } catch {
    return { clicks: 0, visits: [], handle: '' }
  }
}

function saveStats(stats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)) } catch {}
}

export default function Creators() {
  const [handle, setHandle] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [followers, setFollowers] = useState(1000)
  const [stats, setStats] = useState(loadStats)
  const genRef = useRef(null)

  // Load saved handle on mount
  useEffect(() => {
    const saved = loadStats()
    if (saved.handle) {
      setHandle(saved.handle)
      setGeneratedLink(`https://biblefunland.com/?ref=${saved.handle}`)
    }
  }, [])

  const generateLink = () => {
    const clean = handle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (!clean) return
    const link = `https://biblefunland.com/?ref=${clean}`
    setGeneratedLink(link)
    // Save handle to stats
    const updated = { ...stats, handle: clean }
    setStats(updated)
    saveStats(updated)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      // Record a simulated click
      const updated = {
        ...stats,
        clicks: stats.clicks + 1,
        visits: [...(stats.visits || []), Date.now()],
        handle: handle.trim(),
      }
      setStats(updated)
      saveStats(updated)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const resetStats = () => {
    const fresh = { clicks: 0, visits: [], handle: stats.handle }
    setStats(fresh)
    saveStats(fresh)
  }

  // Earnings calc
  const conversionRate = 0.02 // 2% estimated
  const conversions = Math.round(followers * conversionRate)
  const monthlyEarning = (conversions * PRO_PRICE * COMMISSION_RATE).toFixed(2)
  const annualEarning = (parseFloat(monthlyEarning) * 12).toFixed(2)

  const scrollToGen = () => genRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🎙️ Creator Affiliate Program</div>
          <h1 className={styles.heroTitle}>Turn Your Audience into<br />Kingdom Income</h1>
          <p className={styles.heroSub}>
            You share the link. Your followers discover BibleFunLand. You earn <strong style={{ color: '#fb923c' }}>20% commission</strong> on every Pro upgrade from your referrals — for as long as they're subscribed.
          </p>
          <div className={styles.heroActions}>
            <button onClick={scrollToGen} className={styles.btnPrimary}>
              🔗 Get My Referral Link
            </button>
            <Link to="/premium" className={styles.btnSecondary}>
              👑 See What's in Pro
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>⚡ Simple Process</span>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSub}>Three steps. No setup fees. No contracts.</p>
        </div>
        <div className={styles.stepsRow}>
          {[
            { n: 1, title: 'Get Your Link', desc: 'Enter your creator handle below to generate your unique referral URL.' },
            { n: 2, title: 'Share It', desc: 'Add it to YouTube descriptions, podcast show notes, Instagram bio, blog posts — anywhere.' },
            { n: 3, title: 'Earn 20%', desc: 'When a follower upgrades to Pro within 30 days, you earn 20% of their subscription.' },
          ].map(s => (
            <div key={s.n} className={styles.step}>
              <div className={styles.stepNum}>{s.n}</div>
              <div className={styles.stepTitle}>{s.title}</div>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.divider} />

      {/* ── Earnings Calculator ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>💰 Earnings Estimator</span>
          <h2 className={styles.sectionTitle}>See What You Could Earn</h2>
        </div>
        <div className={styles.calcCard}>
          <div className={styles.calcTitle}>Move the slider to your audience size</div>
          <p className={styles.calcSub}>Based on a 2% conversion rate and $9.99/mo Pro plan</p>
          <input
            type="range"
            min={100}
            max={100000}
            step={100}
            value={followers}
            onChange={e => setFollowers(Number(e.target.value))}
            className={styles.calcSlider}
          />
          <div className={styles.calcValues}>
            <span className={styles.calcLabel}>100</span>
            <span className={styles.calcLabel} style={{ fontWeight: 800, color: 'var(--ink)' }}>
              {followers.toLocaleString()} followers
            </span>
            <span className={styles.calcLabel}>100K</span>
          </div>
          <div className={styles.calcResult}>
            <div className={styles.calcEarning}>${monthlyEarning}/mo</div>
            <div className={styles.calcEarningLabel}>
              ~{conversions} conversions × 20% = <strong>${monthlyEarning}/month</strong> · ${annualEarning}/year
            </div>
          </div>
        </div>
      </section>

      <div className={styles.divider} />

      {/* ── Link Generator ── */}
      <section className={`${styles.generatorSection}`} ref={genRef}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow} style={{ color: '#fb923c' }}>🔗 Your Link</span>
            <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>Generate Your Referral Link</h2>
            <p className={styles.sectionSub} style={{ color: 'rgba(255,255,255,0.4)' }}>
              Enter your creator handle (YouTube channel name, podcast name, etc.)
            </p>
          </div>

          <div className={styles.generatorCard}>
            <label className={styles.genLabel}>Your Creator Handle</label>
            <div className={styles.genInputRow}>
              <input
                value={handle}
                onChange={e => setHandle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateLink()}
                placeholder="e.g. graceministry, biblewithjohn, faithpodcast"
                className={styles.genInput}
              />
              <button onClick={generateLink} className={styles.genBtn}>
                Generate →
              </button>
            </div>

            {generatedLink && (
              <>
                <div className={styles.linkDisplay}>
                  <span className={styles.linkUrl}>{generatedLink}</span>
                  <button
                    onClick={copyLink}
                    className={`${styles.copyBtn} ${copied ? styles.copySuccess : ''}`}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className={styles.genHint}>
                  📋 Copy this link and add it to your YouTube description, Instagram bio, or podcast show notes.
                  Every click is tracked and stored right here.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Dashboard ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>📊 Your Stats</span>
          <h2 className={styles.sectionTitle}>Creator Dashboard</h2>
          <p className={styles.sectionSub}>
            Locally tracked referral data. For official earnings reports, email us.
          </p>
        </div>

        <div className={styles.dashboard}>
          <div className={styles.dashHeader}>
            <div className={styles.dashTitle}>
              {stats.handle ? `@${stats.handle}` : 'Your Dashboard'}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className={styles.dashTag}>Frontend Preview</span>
              {stats.clicks > 0 && (
                <button
                  onClick={resetStats}
                  style={{ background: 'none', border: 'none', color: 'var(--ink3)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className={styles.dashGrid}>
            <div className={styles.dashStat}>
              <div className={styles.dashStatNum}>{stats.clicks}</div>
              <div className={styles.dashStatLabel}>Link Copies / Shares</div>
            </div>
            <div className={styles.dashStat}>
              <div className={styles.dashStatNum}>
                {stats.visits?.length > 0
                  ? new Date(Math.max(...stats.visits)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '—'}
              </div>
              <div className={styles.dashStatLabel}>Last Activity</div>
            </div>
            <div className={styles.dashStat}>
              <div className={styles.dashStatNum} style={{ color: '#34d399' }}>
                ${(stats.clicks * 0.02 * PRO_PRICE * COMMISSION_RATE).toFixed(2)}
              </div>
              <div className={styles.dashStatLabel}>Est. Earnings</div>
            </div>
          </div>
          <div className={styles.dashNote}>
            📌 This dashboard uses your browser's local storage for a preview only. For your official verified
            conversion report and payout details, email{' '}
            <a href="mailto:hello@biblefunland.com" className={styles.dashNoteLink}>
              hello@biblefunland.com
            </a>{' '}
            with your creator handle.
          </div>
        </div>
      </section>

      <div className={styles.divider} />

      {/* ── FAQ ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>❓ Questions</span>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
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
  )
}
