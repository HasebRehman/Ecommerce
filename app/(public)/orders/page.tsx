'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag, Clock, CheckCircle, Truck,
  XCircle, ChevronRight, Loader2, Package,
  AlertCircle, ArrowRight, Filter,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { API } from '@/constants/api'
import { cn } from '@/lib/utils'

/* ── Status config — updated to purple theme ── */
const STATUS_CONFIG: Record<string, {
  icon: any; color: string; bg: string; border: string
  dot: string; label: string
}> = {
  pending:               { icon: Clock,       color: '#facc15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.28)',  dot: '#facc15', label: 'Pending'             },
  confirmed:             { icon: CheckCircle, color: '#7C3AED', bg: 'rgba(124,58,237,0.10)',  border: 'rgba(124,58,237,0.28)',  dot: '#7C3AED', label: 'Confirmed'           },
  shipped:               { icon: Truck,       color: '#c084fc', bg: 'rgba(192,132,252,0.10)', border: 'rgba(192,132,252,0.28)', dot: '#c084fc', label: 'Shipped'             },
  delivered:             { icon: CheckCircle, color: '#4ade80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.28)',  dot: '#4ade80', label: 'Delivered'           },
  cancelled_by_customer: { icon: XCircle,     color: '#fb923c', bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.28)',  dot: '#fb923c', label: 'Cancelled by You'    },
  cancelled_by_seller:   { icon: AlertCircle, color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.28)', dot: '#f87171', label: 'Cancelled by Seller' },
  cancelled:             { icon: XCircle,     color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.28)', dot: '#f87171', label: 'Cancelled'           },
}

const FILTER_TABS = [
  { value: '',          label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped',   label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const ITEMS_PER_PAGE = 10

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAuthStore()
  const router              = useRouter()
  const [orders,     setOrders]     = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    api.get(API.STORE.ORDERS)
      .then(res => {
        const sortedOrders = (res.data.orders ?? []).sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setOrders(sortedOrders)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    const handleFocus = () => setRefreshKey(k => k + 1)
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const filtered = filter
    ? orders.filter(o => o.status === filter || o.status?.startsWith(filter))
    : orders

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="oh-root oh-loader">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
        <span className="text-sm font-medium text-[#6b7280]">
          Loading orders…
        </span>
      </div>
    </>
  )

  return (
    <>
      <style>{styles}</style>

      <div className="oh-root w-full min-h-screen" style={{ background: '#FAF5FF' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

          {/* ── Page header ──────────────────────────── */}
          <div className="oh-fade-up flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="oh-title">Order History</h1>
              <p className="oh-subtitle">
                {orders.length} order{orders.length !== 1 ? 's' : ''} placed
              </p>
            </div>
          </div>

          {/* ── Filter tabs ───────────────────────────── */}
          <div className="oh-fade-up oh-tabs-wrap" style={{ animationDelay: '60ms' }}>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Filter className="w-4 h-4 shrink-0 text-[#9ca3af]" />
              {FILTER_TABS.map(tab => {
                const active = filter === tab.value
                const count = tab.value === ''
                  ? orders.length
                  : orders.filter(o => o.status === tab.value || o.status?.startsWith(tab.value)).length
                return (
                  <button
                    key={tab.value}
                    onClick={() => { setFilter(tab.value); setCurrentPage(1) }}
                    className="oh-tab shrink-0"
                    style={{
                      background:  active ? '#7C3AED' : 'rgba(196,181,253,0.1)',
                      color:       active ? '#fff'    : '#7C3AED',
                      border:      active ? '1px solid #7C3AED' : '1px solid rgba(196,181,253,0.3)',
                      boxShadow:   active ? '0 4px 14px rgba(124,58,237,0.25)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Empty state ───────────────────────────── */}
          {filtered.length === 0 && (
            <div className="oh-fade-up oh-empty" style={{ animationDelay: '80ms' }}>
              <div className="oh-empty-icon">
                <ShoppingBag className="w-10 h-10 text-[#C4B5FD]" />
              </div>
              <h2 className="oh-empty-title">
                {filter ? 'No orders with this status' : 'No orders yet'}
              </h2>
              <p className="oh-empty-sub">
                {filter
                  ? 'Try a different filter or check back later'
                  : 'Start shopping to see your orders here'}
              </p>
              {!filter && (
                <Link href="/">
                  <button className="oh-btn-primary">
                    <ShoppingBag className="w-4 h-4" />
                    Browse Products
                  </button>
                </Link>
              )}
            </div>
          )}

          {/* ── Order list ────────────────────────────── */}
          {paginatedOrders.length > 0 && (
            <div className="space-y-5 sm:space-y-6">
              {paginatedOrders.map((order, idx) => {
                const cfg   = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
                const Icon  = cfg.icon
                const items = order.order_items ?? []
                const shop  = order.shops
                const addr  = order.delivery_address ?? {}

                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div
                      className="oh-order-card group oh-fade-up"
                      style={{ marginBottom: '15px', animationDelay: `${idx * 55}ms` }}
                    >
                      {/* Left status strip */}
                      <div className="oh-status-strip" style={{ background: cfg.dot }} />

                      <div className="flex items-start gap-4 sm:gap-6 p-5 sm:p-6">

                        {/* ── Product image stack ─────────────── */}
                        <div className="flex -space-x-3 shrink-0">
                          {items.slice(0, 3).map((item: any, i: number) => (
                            <div
                              key={i}
                              className="oh-product-thumb"
                              style={{ zIndex: 3 - i }}
                            >
                              {item.products?.images?.[0] ? (
                                <img
                                  src={item.products.images[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7C3AED] to-[#6D28D9]">
                                  <Package className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div
                              className="oh-product-thumb flex items-center justify-center bg-[#EDE9FE]"
                              style={{ zIndex: 0 }}>
                              <span className="text-[#7C3AED] text-xs font-bold">
                                +{items.length - 3}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ── Order details ────────────────────── */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">

                            <div className="space-y-2 min-w-0">

                              {/* Order ID + status badge */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="oh-order-id">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </span>
                                <span
                                  className="oh-status-badge"
                                  style={{
                                    background: cfg.bg,
                                    border: `1px solid ${cfg.border}`,
                                    color: cfg.color,
                                  }}>
                                  <Icon className="w-3.5 h-3.5" />
                                  {cfg.label}
                                </span>
                              </div>

                              {/* Shop */}
                              {shop && (
                                <div className="flex items-center gap-2">
                                  {shop.logo_url ? (
                                    <img
                                      src={shop.logo_url}
                                      alt={shop.name}
                                      className="w-5 h-5 rounded-full object-cover"
                                      style={{ border: '1px solid rgba(196,181,253,0.3)' }}
                                    />
                                  ) : (
                                    <ShoppingBag className="w-4 h-4 text-[#7C3AED]" />
                                  )}
                                  <span className="text-[#7C3AED] text-xs font-bold uppercase tracking-wide">
                                    {shop.name}
                                  </span>
                                </div>
                              )}

                              {/* Item names */}
                              <p className="oh-item-names line-clamp-1">
                                {items.map((i: any) => i.products?.name).filter(Boolean).join(', ')}
                              </p>

                              {/* Meta row */}
                              <p className="oh-meta">
                                {items.length} item{items.length !== 1 ? 's' : ''}
                                <span className="oh-meta-dot">·</span>
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                })}
                                {addr.payment_method && (
                                  <>
                                    <span className="oh-meta-dot">·</span>
                                    {addr.payment_method.replace(/_/g, ' ')}
                                  </>
                                )}
                              </p>
                            </div>

                            {/* Price + chevron */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <p className="oh-total">
                                Rs. {order.total_amount?.toLocaleString()}
                              </p>
                              <div className="oh-arrow-btn group-hover:border-[#7C3AED]/50 group-hover:bg-[#7C3AED]/10 group-hover:text-[#7C3AED] transition-all duration-200">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* ── Pagination ────────────────────────────── */}
          {totalPages > 1 && (
            <div className="oh-fade-up flex items-center justify-center gap-2 pt-4" style={{ animationDelay: '200ms' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="oh-pagination-btn"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'oh-pagination-number',
                      currentPage === page && 'oh-pagination-active'
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="oh-pagination-btn"
              >
                Next →
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700&display=swap');

  .oh-root * { box-sizing: border-box; }
  .oh-root { font-family: 'Open Sans', sans-serif; }
  .oh-root button, .oh-root a, .oh-root [role="button"], .oh-root label, .oh-root [class*="cursor-pointer"] { cursor: pointer !important; }

  /* scrollbar hide */
  .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }

  /* ── loader ── */
  .oh-loader {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; padding: 8rem 1rem;
  }

  /* ── fade-up animation ── */
  @keyframes ohFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .oh-fade-up { animation: ohFadeUp 0.42s cubic-bezier(.22,1,.36,1) both; }

  /* ── page title ── */
  .oh-title {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800; color: #1e1b4b; line-height: 1.1;
  }
  .oh-subtitle {
    font-size: 1rem; margin-top: 6px;
    color: #6b7280; font-weight: 500;
  }

  /* ── filter tab ── */
  .oh-tab {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 12px;
    font-size: 0.875rem; font-weight: 700;
    font-family: 'Open Sans', sans-serif;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .oh-tab:hover { opacity: 0.9; }

  /* ── empty state ── */
  .oh-empty {
    max-w-md; margin: 0 auto;
    padding: 4rem 1rem; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .oh-empty-icon {
    width: 80px; height: 80px; border-radius: 24px; margin-bottom: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(196,181,253,0.3);
  }
  .oh-empty-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem; font-weight: 800; color: #1e1b4b;
  }
  .oh-empty-sub {
    font-size: 0.95rem; line-height: 1.6;
    color: #6b7280; margin-bottom: 8px;
  }
  .oh-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: #7C3AED; color: #fff;
    font-family: 'Open Sans', sans-serif;
    font-size: 0.95rem; font-weight: 700;
    border: none; border-radius: 16px;
    padding: 12px 24px;
    box-shadow: 0 4px 14px rgba(124,58,237,0.25);
    transition: all 0.2s ease;
  }
  .oh-btn-primary:hover { background: #6D28D9; transform: translateY(-1px); }

  /* ── order card ── */
  .oh-order-card {
    position: relative; overflow: hidden;
    background: white;
    border: 1px solid rgba(196,181,253,0.3);
    border-radius: 20px;
    box-shadow: 0 4px 16px rgba(124,58,237,0.12), 0 2px 8px rgba(124,58,237,0.08);
    transition: all 0.25s ease;
  }
  .oh-order-card:hover {
    border-color: rgba(124,58,237,0.5);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(124,58,237,0.18), 0 4px 16px rgba(124,58,237,0.12);
  }

  /* coloured left-border strip */
  .oh-status-strip {
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 4px; border-radius: 99px 0 0 99px;
    opacity: 0.8;
  }

  /* ── product thumbnail ── */
  .oh-product-thumb {
    width: 56px; height: 56px;
    border-radius: 14px; overflow: hidden;
    background: #EDE9FE;
    border: 2px solid white;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(124,58,237,0.1);
  }
  @media (min-width: 640px) {
    .oh-product-thumb { width: 64px; height: 64px; }
  }

  /* ── order id ── */
  .oh-order-id {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 700;
    color: #7C3AED;
    letter-spacing: 0.08em;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.3);
    padding: 4px 10px; border-radius: 8px;
  }

  /* ── status badge ── */
  .oh-status-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 99px;
    font-size: 12px; font-weight: 700;
    letter-spacing: 0.02em;
  }

  /* ── item names ── */
  .oh-item-names {
    font-size: 0.95rem; font-weight: 600;
    color: #1e1b4b;
    line-height: 1.4;
  }

  /* ── meta row ── */
  .oh-meta {
    font-size: 12px; font-weight: 500;
    color: #9ca3af;
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    text-transform: capitalize;
  }
  .oh-meta-dot { color: #d1d5db; }

  /* ── total price ── */
  .oh-total {
    font-size: 1.1rem; font-weight: 800; color: #7C3AED; line-height: 1;
    font-family: 'Montserrat', sans-serif;
  }

  /* ── arrow button ── */
  .oh-arrow-btn {
    width: 32px; height: 32px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(196,181,253,0.1);
    border: 1px solid rgba(196,181,253,0.3);
    color: #7C3AED;
  }

  /* ── pagination ── */
  .oh-pagination-btn {
    padding: 8px 16px; border-radius: 12px;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.3);
    color: #7C3AED;
    font-weight: 700;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }
  .oh-pagination-btn:hover:not(:disabled) {
    background: #7C3AED;
    color: white;
  }
  .oh-pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
  }

  .oh-pagination-number {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.2);
    color: #7C3AED;
    font-weight: 700;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }
  .oh-pagination-number:hover {
    background: rgba(124,58,237,0.2);
  }
  .oh-pagination-active {
    background: #7C3AED;
    color: white;
    border-color: #7C3AED;
  }

  @media (max-width: 768px) {
    .oh-order-card { border-radius: 16px; }
    .oh-product-thumb { width: 48px; height: 48px; }
  }
`
