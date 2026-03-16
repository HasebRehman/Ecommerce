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

/* ── Status config — colours updated to site palette ── */
const STATUS_CONFIG: Record<string, {
  icon: any; color: string; bg: string; border: string
  dot: string; label: string
}> = {
  pending:               { icon: Clock,       color: '#facc15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.28)',  dot: '#facc15', label: 'Pending'             },
  confirmed:             { icon: CheckCircle, color: '#408A71', bg: 'rgba(64,138,113,0.14)',  border: 'rgba(64,138,113,0.35)',  dot: '#408A71', label: 'Confirmed'           },
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

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAuthStore()
  const router              = useRouter()
  const [orders,     setOrders]     = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  /* ── all logic completely unchanged ── */
  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    api.get(API.STORE.ORDERS)
      .then(res => setOrders(res.data.orders ?? []))
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

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="oh-root oh-loader">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#408A71' }} />
        <span style={{ color: 'rgba(176,228,204,0.40)', fontSize: '0.85rem', fontWeight: 500 }}>
          Loading orders…
        </span>
      </div>
    </>
  )

  return (
    <>
      <style>{styles}</style>

      <div className="oh-root max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-7">

        {/* ── Page header ──────────────────────────── */}
        <div className="oh-fade-up flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="oh-title">Order History</h1>
            <p className="oh-subtitle">
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          </div>

          {/* Order count badge */}
          {/* {orders.length > 0 && (
            <span className="oh-count-badge">
              <Package className="w-3.5 h-3.5" />
              {orders.length} Total
            </span>
          )} */}
        </div>

        {/* ── Filter tabs ───────────────────────────── */}
        <div className="oh-fade-up oh-tabs-wrap" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <Filter className="w-3.5 h-3.5 shrink-0 mr-1" style={{ color: 'rgba(176,228,204,0.35)' }} />
            {FILTER_TABS.map(tab => {
              const active = filter === tab.value
              /* count for each tab */
              const count = tab.value === ''
                ? orders.length
                : orders.filter(o => o.status === tab.value || o.status?.startsWith(tab.value)).length
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className="oh-tab shrink-0"
                  style={{
                    background:  active ? '#408A71' : 'rgba(13,28,25,0.8)',
                    color:       active ? '#fff'    : 'rgba(176,228,204,0.50)',
                    border:      active ? '1px solid rgba(64,138,113,0.6)' : '1px solid rgba(40,90,72,0.28)',
                    boxShadow:   active ? '0 4px 14px rgba(64,138,113,0.25)' : 'none',
                  }}
                >
                  {tab.label}
                  {/* {count > 0 && (
                    <span className="oh-tab-count" style={{
                      background: active ? 'rgba(255,255,255,0.2)' : 'rgba(40,90,72,0.35)',
                      color:      active ? '#fff' : 'rgba(176,228,204,0.55)',
                    }}>
                      {count} 
                     </span>
                   )} */}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Empty state ───────────────────────────── */}
        {filtered.length === 0 && (
          <div className="oh-fade-up oh-empty" style={{ animationDelay: '80ms' }}>
            <div className="oh-empty-icon">
              <ShoppingBag className="w-9 h-9" style={{ color: '#B0E4CC' }} />
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
                <button className="oh-btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                  <ShoppingBag className="w-4 h-4" />
                  Browse Products
                </button>
              </Link>
            )}
          </div>
        )}

        {/* ── Order list ────────────────────────────── */}
        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((order, idx) => {
              const cfg   = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
              const Icon  = cfg.icon
              const items = order.order_items ?? []
              const shop  = order.shops
              const addr  = order.delivery_address ?? {}

              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div
                    className="oh-order-card group oh-fade-up"
                    style={{ animationDelay: `${idx * 55}ms` }}
                  >
                    {/* Left status strip */}
                    <div className="oh-status-strip" style={{ background: cfg.dot }} />

                    <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5">

                      {/* ── Product image stack ─────────────── */}
                      <div className="flex -space-x-2.5 shrink-0">
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
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4" style={{ color: '#285A48' }} />
                              </div>
                            )}
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div
                            className="oh-product-thumb flex items-center justify-center"
                            style={{ zIndex: 0 }}>
                            <span style={{ color: 'rgba(176,228,204,0.55)', fontSize: '11px', fontWeight: 700 }}>
                              +{items.length - 3}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ── Order details ────────────────────── */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">

                          <div className="space-y-1.5 min-w-0">

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
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                            </div>

                            {/* Shop */}
                            {shop && (
                              <div className="flex items-center gap-1.5">
                                {shop.logo_url ? (
                                  <img
                                    src={shop.logo_url}
                                    alt={shop.name}
                                    className="w-4 h-4 rounded-full object-cover"
                                    style={{ border: '1px solid rgba(40,90,72,0.4)' }}
                                  />
                                ) : (
                                  <ShoppingBag className="w-3.5 h-3.5" style={{ color: '#408A71' }} />
                                )}
                                <span style={{ color: '#408A71', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <p className="oh-total">
                              Rs. {order.total_amount?.toLocaleString()}
                            </p>
                            <div className="oh-arrow-btn group-hover:border-[#408A71]/50 group-hover:bg-[#285A48]/30 group-hover:text-[#B0E4CC] transition-all duration-200">
                              <ChevronRight className="w-3.5 h-3.5" />
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

      </div>
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .oh-root * { box-sizing: border-box; }
  .oh-root, .oh-root a, .oh-root button { cursor: pointer !important; }
  .oh-root { font-family: 'Plus Jakarta Sans', sans-serif; }

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
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700; color: #fff; line-height: 1.1;
  }
  .oh-subtitle {
    font-size: 0.85rem; margin-top: 3px;
    color: rgba(176,228,204,0.40);
  }

  /* ── count badge ── */
  .oh-count-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 99px;
    background: rgba(40,90,72,0.22);
    border: 1px solid rgba(64,138,113,0.28);
    color: #408A71;
    font-size: 0.78rem; font-weight: 800;
  }

  /* ── filter tab ── */
  .oh-tab {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 99px;
    font-size: 0.78rem; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.18s ease;
    white-space: nowrap;
  }
  .oh-tab:hover { opacity: 0.85; }
  .oh-tab-count {
    padding: 1px 6px; border-radius: 99px;
    font-size: 10px; font-weight: 800;
  }

  /* ── empty state ── */
  .oh-empty {
    max-width: 22rem; margin: 0 auto;
    padding: 4rem 1rem; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .oh-empty-icon {
    width: 72px; height: 72px; border-radius: 22px; margin-bottom: 6px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #285A48 0%, #1a3d2e 100%);
    border: 1px solid rgba(64,138,113,0.35);
    box-shadow: 0 10px 30px rgba(9,20,19,0.6);
  }
  .oh-empty-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.35rem; font-weight: 700; color: #fff;
  }
  .oh-empty-sub {
    font-size: 0.85rem; line-height: 1.55;
    color: rgba(176,228,204,0.40); margin-bottom: 6px;
  }
  .oh-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: #408A71; color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem; font-weight: 800;
    border: none; border-radius: 14px;
    box-shadow: 0 6px 20px rgba(64,138,113,0.28);
    transition: background 0.18s ease, transform 0.12s ease;
  }
  .oh-btn-primary:hover { background: #4eaa85; transform: translateY(-1px); }

  /* ── order card ── */
  .oh-order-card {
    position: relative; overflow: hidden;
    background: linear-gradient(145deg, rgba(13,28,25,0.95), rgba(10,21,18,0.98));
    border: 1px solid rgba(40,90,72,0.25);
    border-radius: 20px;
    transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  }
  .oh-order-card:hover {
    border-color: rgba(64,138,113,0.45);
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(9,20,19,0.65), 0 0 0 1px rgba(64,138,113,0.12);
  }

  /* coloured left-border strip */
  .oh-status-strip {
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; border-radius: 99px 0 0 99px;
    opacity: 0.7;
  }

  /* ── product thumbnail ── */
  .oh-product-thumb {
    width: 48px; height: 48px;
    border-radius: 12px; overflow: hidden;
    background: #162420;
    border: 2px solid #091413;
    flex-shrink: 0;
  }
  @media (min-width: 640px) {
    .oh-product-thumb { width: 54px; height: 54px; }
  }

  /* ── order id ── */
  .oh-order-id {
    font-family: 'Plus Jakarta Sans', monospace;
    font-size: 11px; font-weight: 700;
    color: rgba(176,228,204,0.35);
    letter-spacing: 0.08em;
    background: rgba(40,90,72,0.18);
    border: 1px solid rgba(40,90,72,0.28);
    padding: 2px 8px; border-radius: 6px;
  }

  /* ── status badge ── */
  .oh-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 99px;
    font-size: 11px; font-weight: 800;
    letter-spacing: 0.02em;
  }

  /* ── item names ── */
  .oh-item-names {
    font-size: 0.85rem; font-weight: 600;
    color: rgba(176,228,204,0.75);
    line-height: 1.4;
  }

  /* ── meta row ── */
  .oh-meta {
    font-size: 11px; font-weight: 500;
    color: rgba(176,228,204,0.32);
    display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
    text-transform: capitalize;
  }
  .oh-meta-dot { color: rgba(64,138,113,0.4); }

  /* ── total price ── */
  .oh-total {
    font-size: 0.95rem; font-weight: 900; color: #B0E4CC; line-height: 1;
  }

  /* ── arrow button ── */
  .oh-arrow-btn {
    width: 28px; height: 28px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(40,90,72,0.18);
    border: 1px solid rgba(40,90,72,0.3);
    color: rgba(176,228,204,0.40);
  }
`