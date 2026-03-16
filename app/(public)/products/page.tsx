'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, ShoppingBag, Search, SlidersHorizontal, X, Tag } from 'lucide-react'
import { storeService } from '@/lib/services/store.service'
import { categoryService } from '@/lib/services/category.service'
import StoreProductCard from '@/components/store/ProductCard'
import QuickBuyModal from '@/components/store/QuickBuyModal'
import { toast } from 'sonner'

export default function AllProductsPage() {
  const [products,   setProducts]   = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [quickBuy,   setQuickBuy]   = useState<any>(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })

  /* ── all logic completely unchanged ── */
  const loadProducts = useCallback(async (s = '', cat = '', page = 1) => {
    setLoading(true)
    try {
      const data = await storeService.getProducts({ search: s, category_id: cat, page })
      setProducts(data.products ?? [])
      setPagination(data.pagination ?? { total: 0, page: 1, totalPages: 1 })
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
    categoryService.getCategories().then(d => setCategories(d.categories ?? []))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadProducts(search, categoryId, 1), 400)
    return () => clearTimeout(t)
  }, [search, categoryId])

  /* active category name — for display */
  const activeCatName = categories.find(c => c.id === categoryId)?.name ?? ''

  return (
    <>
      <style>{styles}</style>

      <div className="ap-root max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-7">

        {/* ── Page header ──────────────────────────── */}
        <div className="ap-fade-up flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="ap-title">All Products</h1>
            <p className="ap-subtitle">
              {pagination.total > 0
                ? `${pagination.total.toLocaleString()} products available`
                : 'Browse our full catalogue'}
            </p>
          </div>

          {/* Search bar */}
          {/* <div className="ap-search-wrap">
            <Search className="ap-search-icon w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="ap-search-input"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="ap-search-clear"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div> */}
        </div>

        {/* ── Category pills ────────────────────────── */}
        <div className="ap-fade-up" style={{ animationDelay: '55ms' }}>
          {/* <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide"> */}
            {/* Filter icon anchor */}
            {/* <SlidersHorizontal
              className="w-3.5 h-3.5 shrink-0 mr-1"
              style={{ color: 'rgba(176,228,204,0.35)' }}
            /> */}

            {/* All tab */}
            {/* <button
              onClick={() => setCategoryId('')}
              className="ap-cat-pill shrink-0"
              style={{
                background:  categoryId === '' ? '#408A71' : 'rgba(13,28,25,0.8)',
                color:       categoryId === '' ? '#fff'    : 'rgba(176,228,204,0.50)',
                border:      categoryId === '' ? '1px solid rgba(64,138,113,0.6)' : '1px solid rgba(40,90,72,0.28)',
                boxShadow:   categoryId === '' ? '0 4px 14px rgba(64,138,113,0.25)' : 'none',
              }}
            >
              All
            </button> */}

            {/* Category tabs */}
            {/* {categories.map(cat => {
              const active = categoryId === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className="ap-cat-pill shrink-0"
                  style={{
                    background:  active ? '#408A71' : 'rgba(13,28,25,0.8)',
                    color:       active ? '#fff'    : 'rgba(176,228,204,0.50)',
                    border:      active ? '1px solid rgba(64,138,113,0.6)' : '1px solid rgba(40,90,72,0.28)',
                    boxShadow:   active ? '0 4px 14px rgba(64,138,113,0.25)' : 'none',
                  }}
                >
                  {cat.name}
                </button>
              )
            })} */}
          {/* </div> */}

          {/* Active filter badge */}
          {(search || activeCatName) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {search && (
                <span className="ap-active-filter">
                  <Search className="w-3 h-3" />
                  "{search}"
                  <button onClick={() => setSearch('')} className="ap-filter-x">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {activeCatName && (
                <span className="ap-active-filter">
                  <Tag className="w-3 h-3" />
                  {activeCatName}
                  <button onClick={() => setCategoryId('')} className="ap-filter-x">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Product grid ──────────────────────────── */}
        {loading ? (
          <div className="ap-loader">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#408A71' }} />
            <span style={{ color: 'rgba(176,228,204,0.40)', fontSize: '0.85rem', fontWeight: 500 }}>
              Loading products…
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="ap-empty">
            <div className="ap-empty-icon">
              <ShoppingBag className="w-9 h-9" style={{ color: '#B0E4CC' }} />
            </div>
            <h2 className="ap-empty-title">No products found</h2>
            <p className="ap-empty-sub">
              {search || categoryId
                ? 'Try a different search or category'
                : 'Check back soon — new products are added daily'}
            </p>
            {(search || categoryId) && (
              <button
                onClick={() => { setSearch(''); setCategoryId('') }}
                className="ap-btn-clear"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
          >
            {products.map((product, i) => (
              <div
                key={product.id}
                className="ap-card-wrap"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <StoreProductCard product={product} onQuickBuy={setQuickBuy} />
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────── */}
        {pagination.totalPages > 1 && (
          <div className="ap-pagination">

            {/* Prev */}
            <button
              onClick={() => pagination.page > 1 && loadProducts(search, categoryId, pagination.page - 1)}
              disabled={pagination.page === 1}
              className="ap-page-btn"
              style={{
                background:   pagination.page === 1 ? 'rgba(13,28,25,0.4)' : 'rgba(13,28,25,0.85)',
                color:        pagination.page === 1 ? 'rgba(176,228,204,0.20)' : 'rgba(176,228,204,0.55)',
                border:       '1px solid rgba(40,90,72,0.25)',
                cursor:       pagination.page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ←
            </button>

            {/* Page numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => {
              const active = p === pagination.page
              /* only show nearby pages + first/last to avoid overflow */
              const show = p === 1 || p === pagination.totalPages ||
                Math.abs(p - pagination.page) <= 1
              if (!show) {
                /* ellipsis — only once per gap */
                if (p === 2 || p === pagination.totalPages - 1) {
                  return (
                    <span key={`ellipsis-${p}`} className="ap-ellipsis">…</span>
                  )
                }
                return null
              }
              return (
                <button
                  key={p}
                  onClick={() => loadProducts(search, categoryId, p)}
                  className="ap-page-btn"
                  style={{
                    background:  active ? '#408A71' : 'rgba(13,28,25,0.85)',
                    color:       active ? '#fff'    : 'rgba(176,228,204,0.55)',
                    border:      active ? '1px solid rgba(64,138,113,0.55)' : '1px solid rgba(40,90,72,0.25)',
                    boxShadow:   active ? '0 4px 14px rgba(64,138,113,0.28)' : 'none',
                    fontWeight:  active ? 800 : 600,
                  }}
                >
                  {p}
                </button>
              )
            })}

            {/* Next */}
            <button
              onClick={() => pagination.page < pagination.totalPages && loadProducts(search, categoryId, pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="ap-page-btn"
              style={{
                background:   pagination.page === pagination.totalPages ? 'rgba(13,28,25,0.4)' : 'rgba(13,28,25,0.85)',
                color:        pagination.page === pagination.totalPages ? 'rgba(176,228,204,0.20)' : 'rgba(176,228,204,0.55)',
                border:       '1px solid rgba(40,90,72,0.25)',
                cursor:       pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              →
            </button>
          </div>
        )}

        {/* Page info — below pagination */}
        {pagination.totalPages > 1 && (
          <p className="text-center text-xs" style={{ color: 'rgba(176,228,204,0.28)', marginTop: '-12px' }}>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total.toLocaleString()} products
          </p>
        )}

      </div>

      {/* Quick Buy Modal — unchanged */}
      {quickBuy && (
        <QuickBuyModal
          product={quickBuy}
          onClose={() => setQuickBuy(null)}
          onSuccess={() => setQuickBuy(null)}
        />
      )}
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .ap-root * { box-sizing: border-box; }
  .ap-root, .ap-root a, .ap-root button { cursor: pointer !important; }
  .ap-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }

  /* ── fade-up ── */
  @keyframes apFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ap-fade-up { animation: apFadeUp 0.42s cubic-bezier(.22,1,.36,1) both; }

  /* ── card stagger ── */
  @keyframes apCardIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ap-card-wrap { animation: apCardIn 0.42s cubic-bezier(.22,1,.36,1) both; }

  /* ── title / subtitle ── */
  .ap-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700; color: #fff; line-height: 1.1;
  }
  .ap-subtitle {
    font-size: 0.85rem; margin-top: 4px;
    color: rgba(176,228,204,0.40);
  }

  /* ── search ── */
  .ap-search-wrap {
    position: relative; display: flex; align-items: center;
    width: 100%; max-width: 280px;
  }
  @media (max-width: 640px) { .ap-search-wrap { max-width: 100%; } }
  .ap-search-icon {
    position: absolute; left: 12px;
    color: rgba(64,138,113,0.65); pointer-events: none; flex-shrink: 0;
  }
  .ap-search-input {
    width: 100%; height: 40px;
    padding: 0 36px 0 36px;
    background: rgba(13,28,25,0.9);
    border: 1px solid rgba(40,90,72,0.35);
    border-radius: 12px;
    color: #B0E4CC; font-size: 0.85rem; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; caret-color: #408A71;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .ap-search-input::placeholder { color: rgba(176,228,204,0.22); }
  .ap-search-input:focus {
    border-color: #408A71;
    box-shadow: 0 0 0 3px rgba(64,138,113,0.13);
  }
  .ap-search-clear {
    position: absolute; right: 10px;
    width: 22px; height: 22px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(40,90,72,0.25);
    color: rgba(176,228,204,0.5);
    border: none; transition: background 0.15s ease, color 0.15s ease;
  }
  .ap-search-clear:hover { background: rgba(40,90,72,0.45); color: #B0E4CC; }

  /* ── category pill ── */
  .ap-cat-pill {
    padding: 7px 16px; border-radius: 99px;
    font-size: 0.78rem; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.18s ease; white-space: nowrap;
  }
  .ap-cat-pill:hover { opacity: 0.85; }

  /* ── active filter badge ── */
  .ap-active-filter {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 99px;
    background: rgba(64,138,113,0.12);
    border: 1px solid rgba(64,138,113,0.3);
    color: #408A71; font-size: 11px; font-weight: 800;
  }
  .ap-filter-x {
    width: 16px; height: 16px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(64,138,113,0.2); color: #408A71;
    border: none; transition: background 0.15s;
  }
  .ap-filter-x:hover { background: rgba(64,138,113,0.4); }

  /* ── loader ── */
  .ap-loader {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; padding: 6rem 1rem;
  }

  /* ── empty state ── */
  .ap-empty {
    max-width: 22rem; margin: 0 auto;
    padding: 4rem 1rem; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .ap-empty-icon {
    width: 72px; height: 72px; border-radius: 22px; margin-bottom: 6px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #285A48 0%, #1a3d2e 100%);
    border: 1px solid rgba(64,138,113,0.35);
    box-shadow: 0 10px 30px rgba(9,20,19,0.6);
  }
  .ap-empty-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.35rem; font-weight: 700; color: #fff;
  }
  .ap-empty-sub {
    font-size: 0.85rem; line-height: 1.55;
    color: rgba(176,228,204,0.40); margin-bottom: 4px;
  }
  .ap-btn-clear {
    padding: 8px 22px; border-radius: 12px;
    background: rgba(40,90,72,0.22);
    border: 1px solid rgba(64,138,113,0.35);
    color: #408A71; font-size: 0.8rem; font-weight: 800;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.18s ease, color 0.18s ease;
  }
  .ap-btn-clear:hover { background: rgba(40,90,72,0.38); color: #B0E4CC; }

  /* ── pagination ── */
  .ap-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; padding-top: 8px; flex-wrap: wrap;
  }
  .ap-page-btn {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.18s ease;
  }
  .ap-page-btn:hover:not(:disabled) { border-color: rgba(64,138,113,0.5) !important; }
  .ap-ellipsis {
    width: 36px; height: 36px; display: flex;
    align-items: center; justify-content: center;
    color: rgba(176,228,204,0.28); font-size: 0.85rem;
  }
`