import { useState, useMemo } from 'react'

export default function ChristianFinance() {
  const [tab, setTab] = useState('tithe')
  
  // Tithing State
  const [income, setIncome] = useState(5000)
  const [frequency, setFrequency] = useState('monthly')
  
  // Debt State
  const [debts, setDebts] = useState([
    { id: 1, name: 'Student Loan', total: 25000, paid: 12500 },
    { id: 2, name: 'Credit Card', total: 4000, paid: 1000 }
  ])
  const [newDebtName, setNewDebtName] = useState('')
  const [newDebtTotal, setNewDebtTotal] = useState('')

  // Generosity State
  const [generosityTitle, setGenerosityTitle] = useState('')
  const [generosityTarget, setGenerosityTarget] = useState('')
  const [goals, setGoals] = useState([
    { id: 1, title: 'Local Food Bank Drive', target: 500, current: 250 },
    { id: 2, title: 'Mission Trip Support', target: 1200, current: 300 }
  ])

  // Computed Tithing
  const titheAmount = useMemo(() => income * 0.1, [income])
  const breakdown = [
    { label: 'Tithe (First Fruits)', pct: 10, amount: income * 0.10, color: 'var(--blue)' },
    { label: 'Savings & Investing', pct: 10, amount: income * 0.10, color: '#F59E0B' },
    { label: 'Generosity / Offerings', pct: 5, amount: income * 0.05, color: '#10B981' },
    { label: 'Living Expenses', pct: 75, amount: income * 0.75, color: 'var(--border)' }
  ]

  const handleAddDebt = () => {
    if (!newDebtName || !newDebtTotal) return
    setDebts([...debts, { id: Date.now(), name: newDebtName, total: Number(newDebtTotal), paid: 0 }])
    setNewDebtName('')
    setNewDebtTotal('')
  }

  const handleAddGoal = () => {
    if (!generosityTitle || !generosityTarget) return
    setGoals([...goals, { id: Date.now(), title: generosityTitle, target: Number(generosityTarget), current: 0 }])
    setGenerosityTitle('')
    setGenerosityTarget('')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ 
        position: 'relative', 
        padding: '80px 24px 60px', 
        textAlign: 'center', 
        background: 'linear-gradient(160deg,#064E3B 0%,#0F172A 100%)',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ 
            display: 'inline-block', padding: '6px 14px', borderRadius: 100, 
            background: 'rgba(255,255,255,0.1)', color: '#34D399', fontSize: '.8rem', 
            fontWeight: 700, marginBottom: 16, border: '1px solid rgba(52,211,153,0.3)'
          }}>
            Biblical Stewardship
          </div>
          <h1 style={{ 
            fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
            fontWeight: 800, color: 'white', lineHeight: 1.1, margin: '0 0 16px' 
          }}>
            Christian Financial Tools
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
            "For where your treasure is, there your heart will be also." – Matthew 6:21
          </p>
        </div>
      </section>

      {/* ── TABS ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {[
          { id: 'tithe', label: 'Tithe & Budget', icon: '💰' },
          { id: 'debt', label: 'Debt Tracker', icon: '⛓️' },
          { id: 'generosity', label: 'Generosity Goals', icon: '🕊️' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ 
              padding: '10px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.9rem', transition: 'all .2s',
              background: tab === t.id ? 'var(--blue)' : 'var(--bg2)', 
              color: tab === t.id ? 'white' : 'var(--ink)' 
            }}
          >
            <span style={{ marginRight: 8 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

        {/* 1. TITHE & BUDGET CALENDAR */}
        {tab === 'tithe' && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              
              {/* Input Card */}
              <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 32, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)' }}>
                <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.6rem', color: 'var(--ink)', marginBottom: 24, fontWeight: 700 }}>
                  The First Fruits Calculator
                </h2>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, color: 'var(--ink2)', marginBottom: 8 }}>Your Income Amount</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: 12, border: '1.5px solid var(--border)', padding: '0 16px' }}>
                    <span style={{ fontSize: '1.2rem', color: 'var(--ink)', fontWeight: 700 }}>$</span>
                    <input 
                      type="number" 
                      value={income} 
                      onChange={e => setIncome(Number(e.target.value))}
                      style={{ border: 'none', background: 'transparent', padding: '16px 8px', width: '100%', fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, color: 'var(--ink2)', marginBottom: 8 }}>Frequency</label>
                  <select 
                    value={frequency} 
                    onChange={e => setFrequency(e.target.value)}
                    style={{ width: '100%', padding: '16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '1rem', outline: 'none', fontFamily: 'Poppins, sans-serif' }}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Annually</option>
                  </select>
                </div>
                
                <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', padding: '24px', borderRadius: 16, border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div style={{ fontSize: '.85rem', color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                    Your 10% Tithe
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--ink)', fontFamily: "'Baloo 2',cursive", lineHeight: 1 }}>
                    ${titheAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <p style={{ fontSize: '.85rem', color: 'var(--ink2)', marginTop: 8, lineHeight: 1.5 }}>
                    "Bring the whole tithe into the storehouse... test me in this," says the LORD Almighty. (Malachi 3:10)
                  </p>
                </div>
              </div>

              {/* Budget Breakdown */}
              <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 32, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)' }}>
                <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.6rem', color: 'var(--ink)', marginBottom: 24, fontWeight: 700 }}>
                  The Generous Steward Budget
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {breakdown.map((item, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--ink)' }}>{item.label} ({item.pct}%)</span>
                        <span style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--ink)' }}>${item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div style={{ height: 12, background: 'var(--bg2)', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 6 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24, padding: 16, background: 'var(--bg2)', borderRadius: 12 }}>
                  <p style={{ margin: 0, fontSize: '.85rem', color: 'var(--ink3)', fontStyle: 'italic' }}>
                    *This breakdown aligns with the classic Christian stewardship model: give God your first fruits (10%), save/invest for the future (10%), be generous (5%), and live joyfully on the remaining 75%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. DEBT JOURNEY */}
        {tab === 'debt' && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 32, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>⛓️</div>
                <div>
                  <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.6rem', color: 'var(--ink)', margin: 0, fontWeight: 700 }}>
                    Debt Freedom Journey
                  </h2>
                  <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--ink2)' }}>
                    "The borrower is slave to the lender." – Proverbs 22:7
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                {debts.map(debt => {
                  const pct = Math.min(100, Math.round((debt.paid / debt.total) * 100))
                  return (
                    <div key={debt.id} style={{ padding: 20, border: '1.5px solid var(--border)', borderRadius: 16, background: 'var(--bg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{debt.name}</span>
                        <span style={{ fontWeight: 800, color: 'var(--ink)' }}>${debt.paid.toLocaleString()} / ${debt.total.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 16, background: 'var(--bg2)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #F59E0B, #10B981)', borderRadius: 8, transition: 'width 1s ease' }} />
                        <span style={{ position: 'absolute', top: 0, bottom: 0, right: 8, fontSize: '.6rem', fontWeight: 800, color: 'var(--ink3)', display: 'flex', alignItems: 'center' }}>
                          {pct}% FREE
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <span style={{ fontSize: '.75rem', color: 'var(--ink3)', textTransform: 'uppercase', fontWeight: 700 }}>📍 God-Sized Faith Goal</span>
                        <button 
                          style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: 'var(--blue-bg)', color: 'var(--blue)', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' }}
                          onClick={() => {
                            setDebts(debts.map(d => d.id === debt.id ? { ...d, paid: Math.min(d.total, d.paid + 500) } : d))
                          }}
                        >
                          + Log $500 Payment
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add New Debt */}
              <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 24, border: '1.5px dashed var(--border)', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 16px', color: 'var(--ink)', fontSize: '1.2rem', fontWeight: 700 }}>Declare War on Debt</h3>
                <div style={{ display: 'flex', gap: 12, maxWidth: 500, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <input 
                    type="text" placeholder="Debt Name (e.g. Car Loan)" value={newDebtName} onChange={e => setNewDebtName(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: 14, borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', outline: 'none' }}
                  />
                  <input 
                    type="number" placeholder="Total Amount" value={newDebtTotal} onChange={e => setNewDebtTotal(e.target.value)}
                    style={{ width: 140, padding: 14, borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', outline: 'none' }}
                  />
                  <button 
                    onClick={handleAddDebt}
                    style={{ padding: '0 24px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'var(--bg)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Add
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. GENEROSITY GOALS */}
        {tab === 'generosity' && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>
            <div style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', borderRadius: 24, padding: 40, color: 'white', display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '4rem', background: 'rgba(255,255,255,0.2)', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 32 }}>🕊️</div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '2.2rem', margin: '0 0 8px', fontWeight: 800, lineHeight: 1 }}>
                  The Joy of Giving
                </h2>
                <p style={{ margin: 0, fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.5 }}>
                  "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." – 2 Corinthians 9:7
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
              {goals.map(goal => {
                const pct = Math.min(100, Math.round((goal.current / goal.target) * 100))
                return (
                  <div key={goal.id} style={{ background: 'var(--surface)', borderRadius: 20, padding: 24, border: '1.5px solid var(--border)', boxShadow: 'var(--sh)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 16px', background: '#D1FAE5', color: '#059669', fontSize: '.75rem', fontWeight: 800, borderBottomLeftRadius: 16 }}>
                      {pct}% RAISED
                    </div>
                    <h3 style={{ margin: '0 0 8px', color: 'var(--ink)', fontSize: '1.2rem', fontWeight: 700, paddingRight: 80 }}>{goal.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)', fontFamily: "'Baloo 2',cursive" }}>${goal.current}</span>
                      <span style={{ fontSize: '.9rem', color: 'var(--ink3)', fontWeight: 600 }}>/ ${goal.target} goal</span>
                    </div>
                    <div style={{ height: 12, background: 'var(--bg2)', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#10B981', borderRadius: 6, transition: 'width 1s ease' }} />
                    </div>
                    <button 
                      style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'var(--bg2)', color: 'var(--ink)', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', transition: 'all .2s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#D1FAE5'}
                      onMouseOut={e => e.currentTarget.style.background = 'var(--bg2)'}
                      onClick={() => {
                        setGoals(goals.map(g => g.id === goal.id ? { ...g, current: Math.min(g.target, g.current + 50) } : g))
                      }}
                    >
                      🎉 Add $50 Gift
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Create Goal */}
            <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 24, border: '1.5px dashed var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', marginRight: 'auto' }}>Set New Generosity Goal</div>
              <input 
                type="text" placeholder="e.g. Sponsor a child" value={generosityTitle} onChange={e => setGenerosityTitle(e.target.value)}
                style={{ flex: 1, minWidth: 200, padding: 12, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
              />
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)', fontWeight: 700 }}>$</span>
                <input 
                  type="number" placeholder="Target" value={generosityTarget} onChange={e => setGenerosityTarget(e.target.value)}
                  style={{ width: 120, padding: '12px 12px 12px 28px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
                />
              </div>
              <button 
                onClick={handleAddGoal}
                style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: '#10B981', color: 'white', fontWeight: 700, cursor: 'pointer' }}
              >
                Create Goal
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
