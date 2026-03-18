// src/components/RevenueDashboard.jsx
// Drop this inside your Admin.jsx page

import { useState, useEffect } from 'react'

// Simulated revenue data — replace with real AdSense Reporting API
// or embed AdSense dashboard iframe when ready
function generateRevenueData() {
  const today = new Date()
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const impressions = Math.floor(800 + Math.random() * 1200)
    const clicks = Math.floor(impressions * (0.015 + Math.random() * 0.025))
    const rpm = (6 + Math.random() * 9).toFixed(2)
    const earnings = ((impressions / 1000) * parseFloat(rpm)).toFixed(2)
    days.push({ date: dayStr, impressions, clicks, rpm, earnings: parseFloat(earnings) })
  }
  return days
}

const TOP_PAGES = [
  { page: '/ (Home)',                   impressions: '8,420', rpm: '$8.40',  earnings: '$70.73',  trend: '+18%' },
  { page: '/trivia',                     impressions: '6,180', rpm: '$6.20',  earnings: '$38.32',  trend: '+24%' },
  { page: '/devotional',                 impressions: '5,340', rpm: '$11.20', earnings: '$59.81',  trend: '+31%' },
  { page: '/game/david-goliath',         impressions: '4,920', rpm: '$7.40',  earnings: '$36.41',  trend: '+45%' },
  { page: '/blog',                       impressions: '4,200', rpm: '$12.80', earnings: '$53.76',  trend: '+12%' },
  { page: '/prayer',                     impressions: '3,680', rpm: '$9.60',  earnings: '$35.33',  trend: '+8%'  },
  { page: '/map',                        impressions: '2,940', rpm: '$8.20',  earnings: '$24.11',  trend: '+20%' },
  { page: '/flashcards',                 impressions: '2,560', rpm: '$10.40', earnings: '$26.62',  trend: '+15%' },
]

const AD_UNITS = [
  { name: 'Sticky Footer',   type: 'Anchor',      impressions: '22,400', ctr: '2.8%', rpm: '$7.20',  earnings: '$161.28', color: 'var(--blue)'   },
  { name: 'In-Content',      type: 'Native',      impressions: '14,200', ctr: '3.4%', rpm: '$11.40', earnings: '$161.88', color: 'var(--violet)' },
  { name: 'After-Game',      type: 'Display',     impressions: '8,800',  ctr: '4.1%', rpm: '$8.60',  earnings: '$75.68',  color: 'var(--green)'  },
  { name: 'Sidebar',         type: 'Rectangle',   impressions: '6,200',  ctr: '1.9%', rpm: '$9.80',  earnings: '$60.76',  color: 'var(--orange)' },
  { name: 'Banner',          type: 'Leaderboard', impressions: '5,400',  ctr: '1.2%', rpm: '$4.20',  earnings: '$22.68',  color: 'var(--teal)'   },
]

export default function RevenueDashboard() {
  const [period, setPeriod] = useState('30d')
  const [data] = useState(generateRevenueData)
  const [tab, setTab] = useState('overview') // overview | pages | units | setup

  const totalEarnings = data.reduce((s, d) => s + d.earnings, 0).toFixed(2)
  const totalImpressions = data.reduce((s, d) => s + d.impressions, 0).toLocaleString()
  const totalClicks = data.reduce((s, d) => s + d.clicks, 0).toLocaleString()
  const avgRpm = (data.reduce((s, d) => s + parseFloat(d.rpm), 0) / data.length).toFixed(2)

  const adsenseId = import.meta.env.VITE_ADSENSE_CLIENT || null
  const isConfigured = adsenseId && adsenseId !== 'ca-pub-XXXXXXXXXX'

  const maxEarnings = Math.max(...data.map(d => d.earnings))

  const s = {
    card: { background: 'var(--surface)', borderRadius: 20, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', overflow: 'hidden' },
    th: { fontSize: '.68rem', fontWeight: 700, color: 'var(--ink3)', letterSpacing: '.5px', textTransform: 'uppercase', padding: '8px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' },
    td: { fontSize: '.82rem', padding: '11px 16px', borderBottom: '1px solid var(--border)', color: 'var(--ink2)', fontWeight: 500 },
    tabBtn: (active) => ({ fontFamily: 'Poppins,sans-serif', fontSize: '.82rem', fontWeight: 700, padding: '8px 18px', border: 'none', background: active ? 'var(--blue)' : 'none', color: active ? 'white' : 'var(--ink3)', borderRadius: 9, cursor: 'pointer', transition: 'all .2s' }),
  }

  return (
    <div style={{ fontFamily: 'Poppins,sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink)' }}>
          💰 Revenue Dashboard
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['7d','30d','90d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ fontSize: '.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${period === p ? 'var(--blue)' : 'var(--border)'}`, background: period === p ? 'var(--blue)' : 'var(--surface)', color: period === p ? 'white' : 'var(--ink3)', cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Not configured warning */}
      {!isConfigured && (
        <div style={{ background: 'var(--orange-bg)', border: '1.5px solid rgba(249,115,22,.3)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, fontSize: '.84rem', color: 'var(--ink2)', fontWeight: 500 }}>
          ⚠️ <strong>AdSense not configured.</strong> Add <code style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4, fontSize: '.78rem' }}>VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXX</code> to your <code style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4, fontSize: '.78rem' }}>.env</code> file. Data below is <strong>simulated</strong>.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg2)', borderRadius: 12, padding: 4, marginBottom: 22, width: 'fit-content' }}>
        {[['overview','📊 Overview'],['pages','📄 Top Pages'],['units','📣 Ad Units'],['setup','⚙️ Setup Guide']].map(([id,label]) => (
          <button key={id} style={s.tabBtn(tab === id)} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
            {[
              ['💰', `$${totalEarnings}`, `Est. Earnings (${period})`, 'linear-gradient(135deg,#F59E0B,#F97316)', '+22%'],
              ['👁️', totalImpressions, 'Total Impressions', 'var(--blue)', '+18%'],
              ['🖱️', totalClicks, 'Total Clicks', 'var(--violet)', '+31%'],
              ['📈', `$${avgRpm}`, 'Avg. Page RPM', 'var(--green)', '+9%'],
            ].map(([emoji, val, label, color, trend], i) => (
              <div key={i} style={{ ...s.card, padding: 20, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{emoji}</div>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.7rem', fontWeight: 800, lineHeight: 1, background: color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 }}>{val}</div>
                <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--ink3)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--green)' }}>↑ {trend} vs last period</div>
              </div>
            ))}
          </div>

          {/* Earnings bar chart */}
          <div style={{ ...s.card, padding: 24, marginBottom: 22 }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 18 }}>Daily Earnings — Last 30 Days</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120, overflowX: 'auto', paddingBottom: 8 }}>
              {data.slice(-30).map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: '0 0 auto', width: 22, position: 'relative' }} title={`${d.date}: $${d.earnings.toFixed(2)}`}>
                  <div style={{
                    width: '100%',
                    height: `${Math.max(4, (d.earnings / maxEarnings) * 100)}px`,
                    borderRadius: '4px 4px 0 0',
                    background: `linear-gradient(180deg,#3B82F6,#6366F1)`,
                    transition: 'height .4s ease',
                    cursor: 'pointer',
                  }} />
                  {i % 7 === 0 && (
                    <div style={{ fontSize: '.5rem', color: 'var(--ink3)', fontWeight: 600, whiteSpace: 'nowrap', transform: 'rotate(-45deg)', marginTop: 4 }}>{d.date}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Monthly projection */}
          <div style={{ background: 'linear-gradient(135deg,var(--green-bg),var(--blue-bg))', border: '1.5px solid rgba(16,185,129,.2)', borderRadius: 16, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.5rem' }}>🎯</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
                Monthly Projection: <span style={{ color: 'var(--green)' }}>${(parseFloat(totalEarnings) * (30 / parseInt(period))).toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '.82rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.6 }}>
                At current RPM rates with 10% monthly traffic growth, you could hit <strong>$200-600/month</strong> within 6 months. Faith-based content commands premium CPMs ($6-15) from Christian advertisers.
              </div>
            </div>
            <a href="/premium" className="btn btn-green btn-sm">💎 Boost with Pro Tier</a>
          </div>
        </div>
      )}

      {/* ── TOP PAGES TAB ── */}
      {tab === 'pages' && (
        <div style={s.card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Page', 'Impressions', 'RPM', 'Earnings', 'Trend'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {TOP_PAGES.map((row, i) => (
                <tr key={i}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ ...s.td, color: 'var(--blue)', fontWeight: 700 }}>{row.page}</td>
                  <td style={s.td}>{row.impressions}</td>
                  <td style={{ ...s.td, color: 'var(--green)', fontWeight: 700 }}>{row.rpm}</td>
                  <td style={{ ...s.td, fontWeight: 700, color: 'var(--ink)' }}>{row.earnings}</td>
                  <td style={{ ...s.td, color: 'var(--green)', fontWeight: 700 }}>↑ {row.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── AD UNITS TAB ── */}
      {tab === 'units' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {AD_UNITS.map((unit, i) => (
            <div key={i} style={{ ...s.card, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: unit.color + '18', border: `1.5px solid ${unit.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>📣</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '.95rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 2 }}>{unit.name}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 600 }}>{unit.type} · CTR: {unit.ctr}</div>
              </div>
              {[['Impressions', unit.impressions], ['RPM', unit.rpm], ['Earnings', unit.earnings]].map(([l, v]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', fontWeight: 800, color: unit.color }}>{v}</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--ink3)', fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── SETUP GUIDE TAB ── */}
      {tab === 'setup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { step: 1, status: 'done', title: 'Privacy Policy page created', desc: 'Available at /privacy — required by Google AdSense', icon: '📄' },
            { step: 2, status: 'done', title: 'Cookie Consent banner added', desc: 'GDPR & CCPA compliant — loads before any tracking', icon: '🍪' },
            { step: 3, status: 'done', title: 'Contact page at /contact', desc: 'Google requires a visible way to contact the site owner', icon: '📬' },
            { step: 4, status: 'done', title: 'sitemap.xml & robots.txt', desc: 'Added to /public — submit sitemap to Google Search Console', icon: '🗺️' },
            { step: 5, status: !isConfigured ? 'todo' : 'done', title: 'Add AdSense Publisher ID to .env', desc: 'VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXX', icon: '🔑' },
            { step: 6, status: 'todo', title: 'Add AdSense script to index.html', desc: 'See AdUnit.jsx comments for the exact script tag', icon: '📝' },
            { step: 7, status: 'todo', title: 'Replace slot IDs in AdUnit.jsx', desc: 'Create ad units in AdSense dashboard, copy slot IDs', icon: '📣' },
            { step: 8, status: 'todo', title: 'Apply to Google AdSense', desc: 'Go to adsense.google.com → Add Site → biblefunland.com', icon: '✅' },
            { step: 9, status: 'todo', title: 'Add VITE_GA_MEASUREMENT_ID to .env', desc: 'Google Analytics 4 — free at analytics.google.com', icon: '📊' },
            { step: 10, status: 'todo', title: 'Submit sitemap to Search Console', desc: 'search.google.com/search-console → Sitemaps → Submit', icon: '🚀' },
          ].map((item) => (
            <div key={item.step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--surface)', borderRadius: 16, padding: '16px 20px', border: `1.5px solid ${item.status === 'done' ? 'rgba(16,185,129,.3)' : 'var(--border)'}`, background: item.status === 'done' ? 'var(--green-bg)' : 'var(--surface)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: item.status === 'done' ? 'var(--green)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: item.status === 'done' ? '.9rem' : '.85rem', flexShrink: 0, fontFamily: "'Baloo 2',cursive", fontWeight: 800, color: item.status === 'done' ? 'white' : 'var(--ink3)' }}>
                {item.status === 'done' ? '✓' : item.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{item.icon} {item.title}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--ink3)', fontWeight: 500 }}>{item.desc}</div>
              </div>
              <div style={{ fontSize: '.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: item.status === 'done' ? 'var(--green)' : 'var(--bg3)', color: item.status === 'done' ? 'white' : 'var(--ink3)', flexShrink: 0 }}>
                {item.status === 'done' ? '✓ Done' : 'To Do'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
