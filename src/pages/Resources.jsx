import { useState, useMemo } from 'react'
import { CATEGORIES, PRODUCTS } from '../data/affiliateProducts'
import styles from './Resources.module.css'

function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className={styles.card}>
      {product.badge && (
        <div 
          className={styles.cardBadge} 
          style={{ background: product.badgeColor || '#6366F1' }}
        >
          {product.badge}
        </div>
      )}

      {/* Image Area with Fallback */}
      <div className={styles.imageArea}>
        {!imgError ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className={styles.productImg}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.emojiFallback}>
            {product.emoji || '📖'}
          </div>
        )}
        
        <div className={styles.rating}>
          ⭐ {product.rating}
        </div>
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        <div className={styles.productName}>
          {product.name}
        </div>
        <p className={styles.productDesc}>
          {product.description}
        </p>
        <div className={styles.cardFooter}>
          <div className={styles.productPrice}>
            {product.price}
          </div>
          <a
            href={product.amazonLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.amazonBtn}
          >
            🛒 Buy on Amazon
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = activeCategory === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.categoryId === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeCategory, search])

  const staffPicks = useMemo(() => {
    // Only show staff picks on the "All" tab and when not searching
    if (activeCategory !== 'all' || search.trim()) return []
    return PRODUCTS.filter(p => p.badge)
  }, [activeCategory, search])

  return (
    <div className={styles.resources}>

      {/* ── Hero Section ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            🛍️ Kingdom Affiliate Store
          </div>
          <h1 className={styles.title}>
            Resources for the Journey
          </h1>
          <p className={styles.subtitle}>
            A curated collection of Bibles, devotionals, and tools to help your family grow in faith. 
            Every purchase supports our mission to make the Bible fun for everyone.
          </p>
          
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className={styles.searchInput}
            />
          </div>
        </div>
      </section>

      {/* ── Disclosure ── */}
      <div className={styles.disclosure}>
        💛 Transparency Note: As an Amazon Associate, BibleFunLand earns from qualifying purchases at no extra cost to you.
      </div>

      {/* ── Tabs Navigation ── */}
      <nav className={styles.tabs}>
        <div className={styles.tabsInner}>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id
            const count = cat.id === 'all' 
              ? PRODUCTS.length 
              : PRODUCTS.filter(p => p.categoryId === cat.id).length

            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearch('') }}
                className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
              >
                {cat.icon} {cat.label}
                <span className={styles.count}>{count}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className={styles.container}>

        {/* Staff Picks Section */}
        {staffPicks.length > 0 && (
          <div style={{ marginBottom: 56 }}>
            <header className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>⭐ Staff Picks</div>
              <div className={styles.badge} style={{ marginBottom: 0 }}>Highly Recommended</div>
            </header>
            <div className={styles.grid}>
              {staffPicks.map(p => <ProductCard key={`staff-${p.id}`} product={p} />)}
            </div>
            <div style={{ height: 1, background: 'var(--border)', margin: '48px 0 0' }} />
          </div>
        )}

        {/* All Products Grid */}
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            {search ? `Results for "${search}"` : CATEGORIES.find(c => c.id === activeCategory)?.label || 'Products'}
          </div>
          <div className={styles.count}>{filtered.length} items</div>
        </header>

        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>No resources found</h3>
            <p>Try adjusting your search or category filters.</p>
            <button onClick={() => setSearch('')} className={styles.clearBtn}>
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
