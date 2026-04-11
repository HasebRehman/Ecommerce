'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Package, MapPin, Phone, CreditCard,
  Loader2, Store, User, Mail, Clock,
  CheckCircle, Truck, XCircle, AlertCircle,
  Calendar, Hash, ShoppingBag, ChevronDown, Save,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const STATUS_OPTIONS = [
  { value: 'pending',             label: 'Pending',              icon: Clock,        color: 'text-yellow-400' },
  { value: 'confirmed',           label: 'Confirmed',            icon: CheckCircle,  color: 'text-blue-400'   },
  { value: 'shipped',             label: 'Shipped',              icon: Truck,        color: 'text-purple-400' },
  { value: 'delivered',           label: 'Delivered',            icon: CheckCircle,  color: 'text-green-400'  },
  { value: 'cancelled_by_seller', label: 'Cancel Order',         icon: XCircle,      color: 'text-red-400'    },
]

const STATUS_CONFIG: Record<string, { color: string, bg: string, label: string, icon: any }> = {
  pending:               { icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30',  label: 'Pending'               },
  confirmed:             { icon: CheckCircle,  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',      label: 'Confirmed'             },
  shipped:               { icon: Truck,        color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30',  label: 'Shipped'               },
  delivered:             { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',    label: 'Delivered'             },
  cancelled_by_seller:   { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',        label: 'Cancelled by Seller'   },
  cancelled_by_customer: { icon: AlertCircle,  color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'Cancelled by Customer' },
  cancelled:             { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',        label: 'Cancelled'             },
}

export default function SellerOrderDetailPage() {
  const params              = useParams()
  const router              = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [order,          setOrder]          = useState<any>(null)
  const [loading,        setLoading]        = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [updating,       setUpdating]       = useState(false)
  const [dropdownOpen,   setDropdownOpen]   = useState(false)

  const id = params?.id as string

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (!id || id === 'undefined') return

    api.get(`/api/business/orders/${id}`)
      .then(res => {
        setOrder(res.data.order)
        setSelectedStatus(res.data.order.status)
      })
      .catch(() => router.push('/dashboard/orders'))
      .finally(() => setLoading(false))
  }, [id, isAuthenticated])

  useEffect(() => {
    if (!id || id === 'undefined') return

    const supabase = createClient()
    const channelName = `order-seller-${id}-${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'orders',
          filter: `id=eq.${id}`,
        },
        (payload: any) => {
          setOrder((prev: any) => ({ ...prev, ...payload.new }))
          setSelectedStatus(payload.new.status)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === order?.status) return

    if (selectedStatus === 'cancelled_by_seller') {
      if (!confirm('Are you sure you want to cancel this order?')) {
        setSelectedStatus(order.status)
        return
      }
    }

    setUpdating(true)
    try {
      await api.put(`/api/business/orders/${id}`, { status: selectedStatus })
      setOrder((prev: any) => ({ ...prev, status: selectedStatus }))
      toast.success(
        selectedStatus === 'confirmed'           ? '✅ Order confirmed! Stock updated.' :
        selectedStatus === 'shipped'             ? '🚚 Order marked as shipped!'        :
        selectedStatus === 'delivered'           ? '🎉 Order delivered!'                :
        selectedStatus === 'cancelled_by_seller' ? '❌ Order cancelled.'                :
        'Status updated!'
      )
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
      setSelectedStatus(order.status)
    } finally {
      setUpdating(false)
    }
  }

  const isTerminal = (s: string) => [
    'delivered', 'cancelled_by_seller', 'cancelled_by_customer', 'cancelled'
  ].includes(s)

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  )

  if (!order) return null

  const cfg   = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const Icon  = cfg.icon
  const addr  = order.delivery_address ?? {}
  const items = order.order_items      ?? []
  const shop  = order.shops

  const availableOptions = STATUS_OPTIONS.filter(opt => {
    if (isTerminal(order.status)) return false
    if (order.status === 'pending')   return ['confirmed', 'cancelled_by_seller'].includes(opt.value)
    if (order.status === 'confirmed') return ['shipped',   'cancelled_by_seller'].includes(opt.value)
    if (order.status === 'shipped')   return ['delivered'].includes(opt.value)
    return false
  })

  const selectedOpt = STATUS_OPTIONS.find(o => o.value === selectedStatus)

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">Order Details</h1>
              <span className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                cfg.bg, cfg.color
              )}>
                <Icon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              #{order.id?.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Status Dropdown + Save */}
        {!isTerminal(order.status) && availableOptions.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all min-w-[180px] justify-between',
                  selectedOpt
                    ? `${STATUS_CONFIG[selectedStatus]?.bg ?? 'bg-slate-800 border-slate-700'} ${STATUS_CONFIG[selectedStatus]?.color ?? 'text-white'}`
                    : 'bg-slate-800 border-slate-700 text-white'
                )}
              >
                <span className="flex items-center gap-2">
                  {selectedOpt && <selectedOpt.icon className="w-3.5 h-3.5" />}
                  {selectedOpt?.label ?? 'Select Status'}
                </span>
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  dropdownOpen && 'rotate-180'
                )} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-slate-500 text-xs">Current Status</p>
                    <p className={cn('text-sm font-medium mt-0.5', cfg.color)}>
                      {cfg.label}
                    </p>
                  </div>
                  <div className="p-1">
                    {availableOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSelectedStatus(opt.value)
                          setDropdownOpen(false)
                        }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors',
                          selectedStatus === opt.value
                            ? `${STATUS_CONFIG[opt.value]?.bg} ${opt.color} font-medium`
                            : 'text-slate-300 hover:bg-slate-800'
                        )}
                      >
                        <opt.icon className={cn('w-4 h-4', opt.color)} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedStatus !== order.status && (
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {updating
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />
                }
                Save
              </button>
            )}
          </div>
        )}

        {isTerminal(order.status) && (
          <span className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border',
            cfg.bg, cfg.color
          )}>
            <Icon className="w-4 h-4" />
            {cfg.label}
          </span>
        )}
      </div>

      {/* Order Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Hash,       label: 'Order ID',  value: '#' + order.id?.slice(0, 8).toUpperCase() },
          { icon: Calendar,   label: 'Placed On', value: new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) },
          { icon: Clock,      label: 'Time',      value: new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
          { icon: CreditCard, label: 'Payment',   value: addr.payment_method?.replace(/_/g, ' ') ?? '—' },
        ].map(m => (
          <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <m.icon className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-slate-500 text-xs">{m.label}</p>
            </div>
            <p className="text-white font-medium text-sm capitalize">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left — Customer + Items */}
        <div className="lg:col-span-3 space-y-4">

          {/* Customer Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <p className="text-white font-semibold">Customer</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Name</p>
                <p className="text-white text-sm font-medium">
                  {order.profiles?.full_name || addr.full_name || '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Username</p>
                <p className="text-white text-sm">
                  @{order.profiles?.username || '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Phone</p>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-white text-sm">{addr.phone || '—'}</p>
                </div>
              </div>
              {addr.email && (
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Email</p>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <p className="text-white text-sm truncate">{addr.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <p className="text-white font-semibold">Delivery Address</p>
            </div>
            <p className="text-white text-sm">{addr.address || '—'}</p>
            <p className="text-slate-400 text-sm">{addr.city}</p>
            {addr.notes && (
              <div className="pt-2 border-t border-slate-800">
                <p className="text-slate-500 text-xs mb-1">Delivery Notes</p>
                <p className="text-slate-300 text-sm">{addr.notes}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <p className="text-white font-semibold">Items ({items.length})</p>
            </div>
            <div className="divide-y divide-slate-800">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                    {item.products?.images?.[0]
                      ? <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-600" />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm line-clamp-2">
                      {item.products?.name ?? 'Product'}
                    </p>
                    {item.products?.sku && (
                      <p className="text-slate-500 text-xs mt-0.5">SKU: {item.products.sku}</p>
                    )}
                    <p className="text-slate-400 text-xs mt-1">
                      Rs. {item.price?.toLocaleString()} × {item.quantity}
                    </p>
                    {order.status !== 'pending' && item.products?.stock !== undefined && (
                      <p className="text-slate-500 text-xs mt-0.5">
                        Stock remaining: {item.products.stock}
                      </p>
                    )}
                  </div>
                  <p className="text-white font-bold text-sm shrink-0">
                    Rs. {(item.price * item.quantity)?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="px-5 py-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-300">Rs. {order.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Delivery</span>
                <span className="text-green-400 font-medium">Free</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-white font-semibold">Total</span>
                <span className="text-white font-bold text-lg">
                  Rs. {order.total_amount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Payment + Shop + Notes */}
        <div className="lg:col-span-2 space-y-4">

          {/* Payment */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <p className="text-white font-semibold">Payment</p>
            </div>
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-xl border',
              addr.payment_method === 'cod'
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-blue-500/10 border-blue-500/20'
            )}>
              <CreditCard className={cn(
                'w-5 h-5',
                addr.payment_method === 'cod' ? 'text-green-400' : 'text-blue-400'
              )} />
              <p className="text-white text-sm font-medium capitalize">
                {addr.payment_method?.replace(/_/g, ' ') ?? '—'}
              </p>
            </div>
          </div>

          {/* Shop */}
          {shop && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-400" />
                <p className="text-white font-semibold">Shop</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                  {shop.logo_url
                    ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-5 h-5 text-slate-500" />
                      </div>
                  }
                </div>
                <p className="text-white font-medium text-sm">{shop.name}</p>
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="text-white font-semibold text-sm">Order Notes</p>
              <p className="text-slate-400 text-sm leading-relaxed">{order.notes}</p>
            </div>
          )}

          {/* Status Flow */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <p className="text-white font-semibold text-sm">Status Flow</p>
            <div className="space-y-2">
              {['pending', 'confirmed', 'shipped', 'delivered'].map((s, i) => {
                const scfg   = STATUS_CONFIG[s]
                const SIcon  = scfg.icon
                const isDone = ['pending', 'confirmed', 'shipped', 'delivered']
                  .indexOf(order.status) >= i
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                      isDone ? 'bg-blue-500' : 'bg-slate-800'
                    )}>
                      <SIcon className={cn('w-3 h-3', isDone ? 'text-white' : 'text-slate-600')} />
                    </div>
                    <span className={cn(
                      'text-sm capitalize',
                      isDone ? 'text-white font-medium' : 'text-slate-600'
                    )}>
                      {scfg.label}
                    </span>
                    {order.status === s && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                        Current
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  )
}