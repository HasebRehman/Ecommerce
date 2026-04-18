'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Package, MapPin, Phone, CreditCard,
  Clock, Loader2, Store, User, Mail,
  CheckCircle, Truck, XCircle, AlertCircle,
  Calendar, Hash, ShoppingBag, Banknote,
  Smartphone, FileText, Tag,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered']

const STATUS_CONFIG: Record<string, {
  icon: any; color: string; bg: string; border: string; dot: string; label: string; desc: string
}> = {
  pending:               { icon: Clock,       color: '#facc15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.28)',  dot: '#facc15', label: 'Pending',             desc: 'Waiting for seller to confirm'    },
  confirmed:             { icon: CheckCircle, color: '#408A71', bg: 'rgba(64,138,113,0.14)',  border: 'rgba(64,138,113,0.35)',  dot: '#408A71', label: 'Confirmed',           desc: 'Seller confirmed your order'      },
  shipped:               { icon: Truck,       color: '#c084fc', bg: 'rgba(192,132,252,0.10)', border: 'rgba(192,132,252,0.28)', dot: '#c084fc', label: 'Shipped',             desc: 'Your order is on the way'         },
  delivered:             { icon: CheckCircle, color: '#4ade80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.28)',  dot: '#4ade80', label: 'Delivered',           desc: 'Order delivered successfully'     },
  cancelled_by_customer: { icon: XCircle,     color: '#fb923c', bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.28)',  dot: '#fb923c', label: 'Cancelled by You',    desc: 'You cancelled this order'         },
  cancelled_by_seller:   { icon: AlertCircle, color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.28)', dot: '#f87171', label: 'Cancelled by Seller', desc: 'The seller cancelled this order'  },
  cancelled:             { icon: XCircle,     color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.28)', dot: '#f87171', label: 'Cancelled',           desc: 'Order was cancelled'              },
}

const PAYMENT_ICON: Record<string, any> = {
  cod:           Banknote,
  bank_transfer: CreditCard,
  easypaisa:     Smartphone,
  jazzcash:      Smartphone,
}

export default function CustomerOrderDetailPage() {
  const params              = useParams()
  const router              = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [order,      setOrder]      = useState<any>(null)
  const [loading,    setLoading]    = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  /* ── all logic completely unchanged ── */
  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    api.get(`/api/store/orders/${params.id}`)
      .then(res => setOrder(res.data.order))
      .catch(() => router.push('/orders'))
      .finally(() => setLoading(false))
  }, [params.id, isAuthenticated])

  useEffect(() => {
    if (!order?.id) return
    let channel: any
    const setupRealtime = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      channel = supabase
        .channel(`order-customer-${order.id}`)
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public',
          table: 'orders', filter: `id=eq.${order.id}`,
        }, (payload) => {
          setOrder((prev: any) => ({ ...prev, ...payload.new }))
          const newLabel = STATUS_CONFIG[payload.new.status]?.label ?? payload.new.status
          toast.success(`Order status updated: ${newLabel}`)
        })
        .subscribe()
    }
    setupRealtime()
    return () => { channel?.unsubscribe() }
  }, [order?.id])

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await api.put(`/api/store/orders/${order.id}`, { action: 'cancel' })
      setOrder((prev: any) => ({ ...prev, status: 'cancelled_by_customer' }))
      toast.success('Order cancelled successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="od-root od-loader">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
        <span className="text-sm font-medium text-[#6b7280]">
          Loading order…
        </span>
      </div>
    </>
  )

  if (!order) return null

  const cfg        = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const Icon       = cfg.icon
  const addr       = order.delivery_address ?? {}
  const items      = order.order_items ?? []
  const shop       = order.shops
  const stepIndex  = STATUS_FLOW.indexOf(order.status)
  const isTerminal = ['cancelled_by_customer', 'cancelled_by_seller', 'cancelled', 'delivered'].includes(order.status)
  const PayIcon    = PAYMENT_ICON[addr.payment_method] ?? CreditCard

  return (
    <>
      <style>{styles}</style>

      <div className="od-root w-full min-h-screen" style={{ background: '#FAF5FF' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

        {/* ── Page header ──────────────────────────── */}
        <div className="od-fade-up flex items-start justify-between gap-4">

          <div className="flex items-start gap-3 sm:gap-4 flex-1">
            {/* Back button */}
            <button
              onClick={() => router.push('/orders')}
              className="od-back-btn shrink-0 mt-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="od-title">Order Details</h1>
                <span
                  className="od-status-badge"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </span>
              </div>
              <p className="text-[#6b7280] text-sm font-medium">{cfg.desc}</p>
            </div>
          </div>

          {/* Cancel button on right */}
          {order.status === 'pending' && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={cancelling}
              className="od-cancel-btn flex items-center gap-2 shrink-0 mt-1"
            >
              {cancelling
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <XCircle className="w-4 h-4" />
              }
              <span className="hidden sm:inline">Cancel Order</span>
              <span className="sm:hidden">Cancel</span>
            </button>
          )}
        </div>

        {/* ── Meta tiles ───────────────────────────── */}
        <div className="od-fade-up grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ animationDelay: '55ms' }}>
          {[
            { icon: Hash,       label: 'Order ID',  value: '#' + order.id.slice(0, 8).toUpperCase() },
            { icon: Calendar,   label: 'Placed On', value: new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) },
            { icon: Clock,      label: 'Time',      value: new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
            { icon: CreditCard, label: 'Payment',   value: addr.payment_method?.replace(/_/g, ' ') ?? '—' },
          ].map((m, i) => (
            <div key={m.label} className="od-meta-tile">
              <div className="flex items-center gap-2 mb-3">
                <m.icon className="w-4 h-4 shrink-0 text-[#7C3AED]" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
                  {m.label}
                </p>
              </div>
              <p className="text-[#1e1b4b] font-bold text-sm capitalize truncate">{m.value}</p>
            </div>
          ))}
        </div>

        {/* ── Progress tracker ─────────────────────── */}
        {!isTerminal && (
          <div className="od-fade-up od-card p-6 sm:p-8" style={{ animationDelay: '110ms' }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="od-icon-tile"><Truck className="w-4 h-4 text-white" /></div>
              <p className="text-[#1e1b4b] font-bold text-base">Order Progress</p>
            </div>

            <div className="flex items-center">
              {STATUS_FLOW.map((s, i) => {
                const done    = stepIndex >= i
                const current = order.status === s
                const scfg    = STATUS_CONFIG[s]

                return (
                  <div key={s} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-2">
                      {/* Step circle */}
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300"
                        style={{
                          background:  done ? 'rgba(124,58,237,0.1)' : '#f3f4f6',
                          borderColor: done ? '#7C3AED' : '#e5e7eb',
                          boxShadow:   current ? `0 0 12px rgba(124,58,237,0.3)` : 'none',
                        }}
                      >
                        {done
                          ? <CheckCircle className="w-5 h-5" style={{ color: current ? '#7C3AED' : '#7C3AED' }} />
                          : <span className="text-xs font-bold text-[#9ca3af]">{i + 1}</span>
                        }
                      </div>
                      {/* Label */}
                      <p
                        className="text-xs font-bold capitalize whitespace-nowrap hidden sm:block"
                        style={{
                          color: current ? '#7C3AED' : done ? '#7C3AED' : '#d1d5db',
                        }}
                      >
                        {s}
                      </p>
                    </div>

                    {/* Connector line */}
                    {i < STATUS_FLOW.length - 1 && (
                      <div className="flex-1 h-1 mx-2 mb-6 sm:mb-8 rounded-full transition-all duration-500"
                        style={{ background: stepIndex > i ? '#7C3AED' : '#e5e7eb' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Terminal banner ──────────────────────── */}
        {isTerminal && (
          <div
            className="od-fade-up flex items-center gap-4 p-5 sm:p-6 rounded-2xl border"
            style={{ background: cfg.bg, borderColor: cfg.border, animationDelay: '110ms' }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${cfg.dot}20`, border: `1px solid ${cfg.dot}40` }}>
              <Icon className="w-5 h-5" style={{ color: cfg.color }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</p>
              <p className="text-sm mt-1" style={{ color: `${cfg.color}99` }}>{cfg.desc}</p>
            </div>
          </div>
        )}

        {/* ── Cancel button ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ══ Left — Shop + Items ══════════════════ */}
          <div className="lg:col-span-3 space-y-6">

            {/* Shop card */}
            {shop && (
              <div className="od-fade-up od-card flex items-center gap-4 p-5 sm:p-6" style={{ animationDelay: '160ms' }}>
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                  style={{ border: '1px solid rgba(196,181,253,0.3)', background: '#EDE9FE' }}>
                  {shop.logo_url
                    ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-[#7C3AED]" />
                      </div>
                  }
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1 text-[#9ca3af]">
                    Sold by
                  </p>
                  <p className="text-[#1e1b4b] font-bold text-base">{shop.name}</p>
                </div>
              </div>
            )}

            {/* Items card */}
            <div className="od-fade-up od-card overflow-hidden" style={{ animationDelay: '200ms' }}>

              {/* Card header */}
              <div className="flex items-center gap-3 px-6 py-5"
                style={{ borderBottom: '1px solid rgba(196,181,253,0.2)' }}>
                <div className="od-icon-tile">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <p className="text-[#1e1b4b] font-bold text-base">
                  Items Ordered
                  <span className="ml-2 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>
                    {items.length}
                  </span>
                </p>
              </div>

              {/* Item rows */}
              <div className="od-items-list">
                {items.map((item: any, idx: number) => (
                  <div
                    key={item.id}
                    className="od-item-row flex items-center gap-4 px-6 py-5"
                    style={{ animationDelay: `${200 + idx * 45}ms` }}
                  >
                    {/* Product image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0"
                      style={{ border: '1px solid rgba(196,181,253,0.2)', background: '#EDE9FE' }}>
                      {item.products?.images?.[0]
                        ? <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7C3AED] to-[#6D28D9]">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold line-clamp-2 leading-snug text-[#1e1b4b]">
                        {item.products?.name ?? 'Product'}
                      </p>
                      {item.products?.sku && (
                        <p className="text-xs font-medium mt-1 text-[#9ca3af]">
                          SKU: {item.products.sku}
                        </p>
                      )}
                      <p className="text-sm mt-2 font-medium text-[#6b7280]">
                        Rs. {item.price?.toLocaleString()} × {item.quantity}
                      </p>
                    </div>

                    {/* Row total */}
                    <p className="text-[#1e1b4b] font-bold text-base shrink-0">
                      Rs. {(item.price * item.quantity)?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="px-6 py-5 space-y-3"
                style={{ borderTop: '1px solid rgba(196,181,253,0.2)', background: 'rgba(124,58,237,0.02)' }}>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b7280]">Subtotal</span>
                  <span className="text-[#1e1b4b] font-semibold">Rs. {order.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-[#6b7280]">Delivery</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED]">
                    <Truck className="w-3.5 h-3.5" /> Free
                  </span>
                </div>
                <div className="od-divider" />
                <div className="flex justify-between items-center">
                  <span className="text-[#1e1b4b] font-bold text-base">Total Paid</span>
                  <span className="text-xl font-bold text-[#7C3AED]">
                    Rs. {order.total_amount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ══ Right — Customer + Delivery + Payment ══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Customer details */}
            <div className="od-fade-up od-card p-6 space-y-5" style={{ animationDelay: '220ms' }}>
              <div className="flex items-center gap-3">
                <div className="od-icon-tile"><User className="w-4 h-4 text-white" /></div>
                <p className="text-[#1e1b4b] font-bold text-base">Customer Details</p>
              </div>
              <div className="od-divider" />
              <div className="space-y-4">
                <div>
                  <p className="od-field-label">Full Name</p>
                  <p className="od-field-value">{addr.full_name || '—'}</p>
                </div>
                <div>
                  <p className="od-field-label">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0 text-[#7C3AED]" />
                    <p className="od-field-value">{addr.phone || '—'}</p>
                  </div>
                </div>
                {addr.email && (
                  <div>
                    <p className="od-field-label">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 shrink-0 text-[#7C3AED]" />
                      <p className="od-field-value break-all">{addr.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery address */}
            <div className="od-fade-up od-card p-6 space-y-5" style={{ animationDelay: '265ms' }}>
              <div className="flex items-center gap-3">
                <div className="od-icon-tile"><MapPin className="w-4 h-4 text-white" /></div>
                <p className="text-[#1e1b4b] font-bold text-base">Delivery Address</p>
              </div>
              <div className="od-divider" />
              <div className="space-y-2">
                <p className="od-field-value">{addr.address || '—'}</p>
                <p className="text-sm text-[#6b7280]">{addr.city}</p>
                {addr.notes && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(196,181,253,0.2)' }}>
                    <p className="od-field-label mb-2">Delivery Notes</p>
                    <p className="text-sm leading-relaxed text-[#6b7280]">
                      {addr.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="od-fade-up od-card p-6 space-y-5" style={{ animationDelay: '310ms' }}>
              <div className="flex items-center gap-3">
                <div className="od-icon-tile"><CreditCard className="w-4 h-4 text-white" /></div>
                <p className="text-[#1e1b4b] font-bold text-base">Payment Method</p>
              </div>
              <div className="od-divider" />
              <div
                className="flex items-center gap-3 p-4"
                style={{
                  background: 'rgba(124,58,237,0.05)',
                  border: '1px solid rgba(196,181,253,0.2)',
                  borderRadius: '12px',
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  }}>
                  <PayIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-[#1e1b4b] font-bold text-base capitalize">
                  {addr.payment_method?.replace(/_/g, ' ') ?? '—'}
                </p>
              </div>
            </div>

            {/* Order notes */}
            {order.notes && (
              <div className="od-fade-up od-card p-6 space-y-5" style={{ animationDelay: '355ms' }}>
                <div className="flex items-center gap-3">
                  <div className="od-icon-tile"><FileText className="w-4 h-4 text-white" /></div>
                  <p className="text-[#1e1b4b] font-bold text-base">Order Notes</p>
                </div>
                <div className="od-divider" />
                <p className="text-sm leading-relaxed text-[#6b7280]">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        </div>
      </div>

      {/* ── Cancel Confirmation Modal ──────────────────────── */}
      {showCancelModal && (
        <div className="od-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="od-modal-content" onClick={e => e.stopPropagation()}>
            <div className="od-modal-header">
              <div className="od-modal-icon">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="od-modal-title">Cancel Order?</h2>
              <p className="od-modal-subtitle">Are you sure you want to cancel this order? This action cannot be undone.</p>
            </div>

            <div className="od-modal-actions">
              <button
                onClick={() => setShowCancelModal(false)}
                className="od-modal-btn od-modal-btn-secondary"
              >
                Keep Order
              </button>
              <button
                onClick={async () => {
                  setShowCancelModal(false)
                  setCancelling(true)
                  try {
                    await api.put(`/api/store/orders/${order.id}`, { action: 'cancel' })
                    setOrder((prev: any) => ({ ...prev, status: 'cancelled_by_customer' }))
                    toast.success('Order cancelled successfully')
                  } catch (err: any) {
                    toast.error(err.message || 'Failed to cancel order')
                  } finally {
                    setCancelling(false)
                  }
                }}
                disabled={cancelling}
                className="od-modal-btn od-modal-btn-danger"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Cancel Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700&display=swap');

  .od-root * { box-sizing: border-box; }
  .od-root { font-family: 'Open Sans', sans-serif; }
  .od-root button, .od-root a, .od-root [role="button"], .od-root label, .od-root [class*="cursor-pointer"] { cursor: pointer !important; }

  /* ── fade-up ── */
  @keyframes odFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .od-fade-up { animation: odFadeUp 0.42s cubic-bezier(.22,1,.36,1) both; }

  /* ── loader ── */
  .od-loader {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; padding: 8rem 1rem;
  }

  /* ── page title ── */
  .od-title {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    font-weight: 800; color: #1e1b4b; line-height: 1.1;
  }

  /* ── status badge ── */
  .od-status-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px; border-radius: 99px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.02em;
  }

  /* ── back button ── */
  .od-back-btn {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(196,181,253,0.1);
    border: 1px solid rgba(196,181,253,0.3);
    color: #7C3AED;
    transition: all 0.2s ease;
  }
  .od-back-btn:hover {
    background: rgba(196,181,253,0.2);
    border-color: rgba(124,58,237,0.5);
    color: #6D28D9;
  }

  /* ── meta tile ── */
  .od-meta-tile {
    background: white;
    border: 1px solid rgba(196,181,253,0.3);
    border-radius: 16px; padding: 16px 18px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(124,58,237,0.12), 0 2px 8px rgba(124,58,237,0.08);
  }
  .od-meta-tile:hover { 
    border-color: rgba(124,58,237,0.5);
    box-shadow: 0 8px 24px rgba(124,58,237,0.15);
  }

  /* ── card ── */
  .od-card {
    background: white;
    border: 1px solid rgba(196,181,253,0.3);
    border-radius: 20px;
    box-shadow: 0 4px 16px rgba(124,58,237,0.12), 0 2px 8px rgba(124,58,237,0.08);
  }

  /* ── icon tile ── */
  .od-icon-tile {
    width: 32px; height: 32px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    background: linear-gradient(135deg, #7C3AED, #6D28D9);
    border: 1px solid rgba(124,58,237,0.3);
  }

  /* ── gradient divider ── */
  .od-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(196,181,253,0.3), transparent);
  }

  /* ── cancel button ── */
  .od-cancel-btn {
    padding: 10px 20px; border-radius: 14px;
    font-family: 'Open Sans', sans-serif;
    font-size: 0.875rem; font-weight: 700;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444;
    transition: all 0.2s ease;
  }
  .od-cancel-btn:hover:not(:disabled) {
    background: rgba(239,68,68,0.2);
    border-color: rgba(239,68,68,0.5);
  }
  .od-cancel-btn:disabled { opacity: 0.6; cursor: not-allowed !important; }

  /* ── item row divider ── */
  .od-items-list > .od-item-row {
    border-bottom: 1px solid rgba(196,181,253,0.15);
  }
  .od-items-list > .od-item-row:last-child { border-bottom: none; }

  /* ── item row animate ── */
  @keyframes odItemIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .od-item-row { animation: odItemIn 0.35s cubic-bezier(.22,1,.36,1) both; }

  /* ── field label / value ── */
  .od-field-label {
    font-size: 11px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: #9ca3af; margin-bottom: 4px;
  }
  .od-field-value {
    font-size: 0.95rem; font-weight: 600; color: #1e1b4b;
  }

  /* ── Modal Styles ── */
  .od-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 50;
    padding: 1rem;
    backdrop-filter: blur(4px);
  }

  .od-modal-content {
    background: white;
    border-radius: 20px;
    border: 1px solid rgba(196,181,253,0.3);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 420px;
    width: 100%;
    overflow: hidden;
    animation: odModalSlideUp 0.3s cubic-bezier(.22,1,.36,1);
  }

  @keyframes odModalSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .od-modal-header {
    padding: 2rem 1.5rem;
    text-align: center;
    border-bottom: 1px solid rgba(196,181,253,0.2);
  }

  .od-modal-icon {
    width: 56px; height: 56px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    margin: 0 auto 1rem;
  }

  .od-modal-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.25rem; font-weight: 800;
    color: #1e1b4b;
    margin-bottom: 0.5rem;
  }

  .od-modal-subtitle {
    font-size: 0.95rem;
    color: #6b7280;
    line-height: 1.5;
  }

  .od-modal-actions {
    display: flex; gap: 1rem;
    padding: 1.5rem;
  }

  .od-modal-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    font-family: 'Open Sans', sans-serif;
    font-weight: 700;
    font-size: 0.875rem;
    border: none;
    display: flex; align-items: center; justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .od-modal-btn-secondary {
    background: rgba(196,181,253,0.1);
    border: 1px solid rgba(196,181,253,0.3);
    color: #7C3AED;
  }

  .od-modal-btn-secondary:hover {
    background: rgba(196,181,253,0.2);
    border-color: rgba(124,58,237,0.5);
  }

  .od-modal-btn-danger {
    background: #ef4444;
    color: white;
  }

  .od-modal-btn-danger:hover:not(:disabled) {
    background: #dc2626;
  }

  .od-modal-btn-danger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`    