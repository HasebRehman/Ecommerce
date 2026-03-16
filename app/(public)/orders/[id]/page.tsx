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
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#408A71' }} />
        <span style={{ color: 'rgba(176,228,204,0.40)', fontSize: '0.85rem', fontWeight: 500 }}>
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

      <div className="od-root max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">

        {/* ── Page header ──────────────────────────── */}
        <div className="od-fade-up flex items-start gap-3 sm:gap-4">

          {/* Back button */}
          <button
            onClick={() => router.push('/orders')}
            className="od-back-btn shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="od-title">Order Details</h1>
              <span
                className="od-status-badge"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
              >
                <Icon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <p style={{ color: 'rgba(176,228,204,0.40)', fontSize: '0.8rem' }}>{cfg.desc}</p>
          </div>
        </div>

        {/* ── Meta tiles ───────────────────────────── */}
        <div className="od-fade-up grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ animationDelay: '55ms' }}>
          {[
            { icon: Hash,       label: 'Order ID',  value: '#' + order.id.slice(0, 8).toUpperCase() },
            { icon: Calendar,   label: 'Placed On', value: new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) },
            { icon: Clock,      label: 'Time',      value: new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
            { icon: CreditCard, label: 'Payment',   value: addr.payment_method?.replace(/_/g, ' ') ?? '—' },
          ].map((m, i) => (
            <div key={m.label} className="od-meta-tile">
              <div className="flex items-center gap-1.5 mb-2">
                <m.icon className="w-3.5 h-3.5 shrink-0" style={{ color: '#408A71' }} />
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(176,228,204,0.38)' }}>
                  {m.label}
                </p>
              </div>
              <p className="text-white font-bold text-sm capitalize truncate">{m.value}</p>
            </div>
          ))}
        </div>

        {/* ── Progress tracker ─────────────────────── */}
        {!isTerminal && (
          <div className="od-fade-up od-card p-5 sm:p-6" style={{ animationDelay: '110ms' }}>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="od-icon-tile"><Truck className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} /></div>
              <p className="text-white font-bold text-sm">Order Progress</p>
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
                        className="w-9 h-9 rounded-2xl flex items-center justify-center border-2 transition-all duration-300"
                        style={{
                          background:  done ? '#285A48' : 'rgba(13,28,25,0.8)',
                          borderColor: done ? '#408A71' : 'rgba(40,90,72,0.3)',
                          boxShadow:   current ? `0 0 12px rgba(64,138,113,0.4)` : 'none',
                        }}
                      >
                        {done
                          ? <CheckCircle className="w-4 h-4" style={{ color: current ? '#B0E4CC' : '#408A71' }} />
                          : <span className="text-xs font-black" style={{ color: 'rgba(176,228,204,0.25)' }}>{i + 1}</span>
                        }
                      </div>
                      {/* Label */}
                      <p
                        className="text-[10px] font-bold capitalize whitespace-nowrap hidden sm:block"
                        style={{
                          color: current ? '#B0E4CC' : done ? '#408A71' : 'rgba(176,228,204,0.25)',
                        }}
                      >
                        {s}
                      </p>
                    </div>

                    {/* Connector line */}
                    {i < STATUS_FLOW.length - 1 && (
                      <div className="flex-1 h-0.5 mx-2 mb-5 sm:mb-6 rounded-full transition-all duration-500"
                        style={{ background: stepIndex > i ? '#408A71' : 'rgba(40,90,72,0.25)' }} />
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
            className="od-fade-up flex items-center gap-4 p-4 sm:p-5 rounded-2xl border"
            style={{ background: cfg.bg, borderColor: cfg.border, animationDelay: '110ms' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${cfg.dot}20`, border: `1px solid ${cfg.dot}40` }}>
              <Icon className="w-5 h-5" style={{ color: cfg.color }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</p>
              <p className="text-sm mt-0.5" style={{ color: `${cfg.color}99` }}>{cfg.desc}</p>
            </div>
          </div>
        )}

        {/* ── Cancel button ────────────────────────── */}
        {order.status === 'pending' && (
          <div className="od-fade-up flex justify-end" style={{ animationDelay: '130ms' }}>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="od-cancel-btn flex items-center gap-2"
            >
              {cancelling
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <XCircle className="w-4 h-4" />
              }
              Cancel Order
            </button>
          </div>
        )}

        {/* ── Main grid ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ══ Left — Shop + Items ══════════════════ */}
          <div className="lg:col-span-3 space-y-4">

            {/* Shop card */}
            {shop && (
              <div className="od-fade-up od-card flex items-center gap-4 p-4" style={{ animationDelay: '160ms' }}>
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                  style={{ border: '1px solid rgba(40,90,72,0.35)', background: '#162420' }}>
                  {shop.logo_url
                    ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-5 h-5" style={{ color: '#408A71' }} />
                      </div>
                  }
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'rgba(176,228,204,0.35)' }}>
                    Sold by
                  </p>
                  <p className="text-white font-bold text-sm">{shop.name}</p>
                </div>
              </div>
            )}

            {/* Items card */}
            <div className="od-fade-up od-card overflow-hidden" style={{ animationDelay: '200ms' }}>

              {/* Card header */}
              <div className="flex items-center gap-2.5 px-5 py-4"
                style={{ borderBottom: '1px solid rgba(40,90,72,0.22)' }}>
                <div className="od-icon-tile">
                  <ShoppingBag className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} />
                </div>
                <p className="text-white font-bold text-sm">
                  Items Ordered
                  <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black"
                    style={{ background: 'rgba(40,90,72,0.3)', color: '#408A71' }}>
                    {items.length}
                  </span>
                </p>
              </div>

              {/* Item rows */}
              <div className="od-items-list">
                {items.map((item: any, idx: number) => (
                  <div
                    key={item.id}
                    className="od-item-row flex items-center gap-3 sm:gap-4 px-5 py-4"
                    style={{ animationDelay: `${200 + idx * 45}ms` }}
                  >
                    {/* Product image */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0"
                      style={{ border: '1px solid rgba(40,90,72,0.28)', background: '#162420' }}>
                      {item.products?.images?.[0]
                        ? <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5" style={{ color: '#285A48' }} />
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-2 leading-snug"
                        style={{ color: 'rgba(176,228,204,0.82)' }}>
                        {item.products?.name ?? 'Product'}
                      </p>
                      {item.products?.sku && (
                        <p className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(176,228,204,0.28)' }}>
                          SKU: {item.products.sku}
                        </p>
                      )}
                      <p className="text-xs mt-1 font-medium" style={{ color: 'rgba(176,228,204,0.42)' }}>
                        Rs. {item.price?.toLocaleString()} × {item.quantity}
                      </p>
                    </div>

                    {/* Row total */}
                    <p className="text-white font-black text-sm shrink-0">
                      Rs. {(item.price * item.quantity)?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="px-5 py-4 space-y-2.5"
                style={{ borderTop: '1px solid rgba(40,90,72,0.22)', background: 'rgba(9,20,19,0.4)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'rgba(176,228,204,0.45)' }}>Subtotal</span>
                  <span style={{ color: 'rgba(176,228,204,0.7)' }}>Rs. {order.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span style={{ color: 'rgba(176,228,204,0.45)' }}>Delivery</span>
                  <span className="flex items-center gap-1 text-xs font-black" style={{ color: '#408A71' }}>
                    <Truck className="w-3 h-3" /> Free
                  </span>
                </div>
                <div className="od-divider" />
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-sm">Total Paid</span>
                  <span className="text-lg font-black" style={{ color: '#B0E4CC' }}>
                    Rs. {order.total_amount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ══ Right — Customer + Delivery + Payment ══ */}
          <div className="lg:col-span-2 space-y-4">

            {/* Customer details */}
            <div className="od-fade-up od-card p-5 space-y-4" style={{ animationDelay: '220ms' }}>
              <div className="flex items-center gap-2.5">
                <div className="od-icon-tile"><User className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} /></div>
                <p className="text-white font-bold text-sm">Customer Details</p>
              </div>
              <div className="od-divider" />
              <div className="space-y-3">
                <div>
                  <p className="od-field-label">Full Name</p>
                  <p className="od-field-value">{addr.full_name || '—'}</p>
                </div>
                <div>
                  <p className="od-field-label">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: '#408A71' }} />
                    <p className="od-field-value">{addr.phone || '—'}</p>
                  </div>
                </div>
                {addr.email && (
                  <div>
                    <p className="od-field-label">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: '#408A71' }} />
                      <p className="od-field-value break-all">{addr.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery address */}
            <div className="od-fade-up od-card p-5 space-y-4" style={{ animationDelay: '265ms' }}>
              <div className="flex items-center gap-2.5">
                <div className="od-icon-tile"><MapPin className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} /></div>
                <p className="text-white font-bold text-sm">Delivery Address</p>
              </div>
              <div className="od-divider" />
              <div className="space-y-1">
                <p className="od-field-value">{addr.address || '—'}</p>
                <p className="text-sm" style={{ color: 'rgba(176,228,204,0.45)' }}>{addr.city}</p>
                {addr.notes && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(40,90,72,0.2)' }}>
                    <p className="od-field-label mb-1">Delivery Notes</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(176,228,204,0.50)' }}>
                      {addr.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="od-fade-up od-card p-5 space-y-4" style={{ animationDelay: '310ms' }}>
              <div className="flex items-center gap-2.5">
                <div className="od-icon-tile"><CreditCard className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} /></div>
                <p className="text-white font-bold text-sm">Payment Method</p>
              </div>
              <div className="od-divider" />
              <div
                className="flex items-center gap-3 p-3.5 rounded-xl"
                style={{
                  background: 'rgba(40,90,72,0.18)',
                  border: '1px solid rgba(64,138,113,0.28)',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #285A48, #1a3d2e)',
                    border: '1px solid rgba(64,138,113,0.35)',
                  }}>
                  <PayIcon className="w-4 h-4" style={{ color: '#B0E4CC' }} />
                </div>
                <p className="text-white font-bold text-sm capitalize">
                  {addr.payment_method?.replace(/_/g, ' ') ?? '—'}
                </p>
              </div>
            </div>

            {/* Order notes */}
            {order.notes && (
              <div className="od-fade-up od-card p-5 space-y-4" style={{ animationDelay: '355ms' }}>
                <div className="flex items-center gap-2.5">
                  <div className="od-icon-tile"><FileText className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} /></div>
                  <p className="text-white font-bold text-sm">Order Notes</p>
                </div>
                <div className="od-divider" />
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(176,228,204,0.55)' }}>
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .od-root * { box-sizing: border-box; }
  .od-root, .od-root a, .od-root button { cursor: pointer !important; }
  .od-root { font-family: 'Plus Jakarta Sans', sans-serif; }

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
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.3rem, 3vw, 1.75rem);
    font-weight: 700; color: #fff; line-height: 1.1;
  }

  /* ── status badge ── */
  .od-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 99px;
    font-size: 11px; font-weight: 800; letter-spacing: 0.02em;
  }

  /* ── back button ── */
  .od-back-btn {
    width: 36px; height: 36px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(40,90,72,0.20);
    border: 1px solid rgba(40,90,72,0.35);
    color: rgba(176,228,204,0.55);
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  }
  .od-back-btn:hover {
    background: rgba(40,90,72,0.35);
    border-color: rgba(64,138,113,0.50);
    color: #B0E4CC;
  }

  /* ── meta tile ── */
  .od-meta-tile {
    background: linear-gradient(145deg, rgba(13,28,25,0.95), rgba(10,21,18,0.98));
    border: 1px solid rgba(40,90,72,0.25);
    border-radius: 16px; padding: 14px 16px;
    transition: border-color 0.2s ease;
  }
  .od-meta-tile:hover { border-color: rgba(64,138,113,0.38); }

  /* ── card ── */
  .od-card {
    background: linear-gradient(145deg, rgba(13,28,25,0.95), rgba(10,21,18,0.98));
    border: 1px solid rgba(40,90,72,0.25);
    border-radius: 20px;
  }

  /* ── icon tile ── */
  .od-icon-tile {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    background: linear-gradient(135deg, #285A48, #1a3d2e);
    border: 1px solid rgba(64,138,113,0.35);
  }

  /* ── gradient divider ── */
  .od-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(40,90,72,0.4), transparent);
  }

  /* ── cancel button ── */
  .od-cancel-btn {
    padding: 9px 18px; border-radius: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.825rem; font-weight: 800;
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.28);
    color: #f87171;
    transition: background 0.18s ease, border-color 0.18s ease;
  }
  .od-cancel-btn:hover:not(:disabled) {
    background: rgba(248,113,113,0.16);
    border-color: rgba(248,113,113,0.45);
  }
  .od-cancel-btn:disabled { opacity: 0.5; cursor: not-allowed !important; }

  /* ── item row divider ── */
  .od-items-list > .od-item-row {
    border-bottom: 1px solid rgba(40,90,72,0.14);
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
    font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.09em;
    color: rgba(176,228,204,0.35); margin-bottom: 3px;
  }
  .od-field-value {
    font-size: 0.875rem; font-weight: 600; color: #fff;
  }
`    