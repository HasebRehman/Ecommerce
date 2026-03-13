'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Package, MapPin, Phone, CreditCard,
  Clock, Loader2, Store, User, Mail,
  CheckCircle, Truck, XCircle, AlertCircle,
  Calendar, Hash, ShoppingBag,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered']

const STATUS_CONFIG: Record<string, {
  icon: any, color: string, bg: string, label: string, desc: string
}> = {
  pending:   { icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'Pending',   desc: 'Waiting for seller to confirm'    },
  confirmed: { icon: CheckCircle,  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',     label: 'Confirmed', desc: 'Seller confirmed your order'       },
  shipped:   { icon: Truck,        color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', label: 'Shipped',   desc: 'Your order is on the way'          },
  delivered: { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',   label: 'Delivered', desc: 'Order delivered successfully'      },
  cancelled: { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',       label: 'Cancelled', desc: 'Order was cancelled'               },
  rejected:  { icon: AlertCircle,  color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',       label: 'Rejected',  desc: 'Order was rejected by the seller'  },
}

export default function CustomerOrderDetailPage() {
  const params              = useParams()
  const router              = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [order,   setOrder]   = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    api.get(`/api/store/orders/${params.id}`)
      .then(res => setOrder(res.data.order))
      .catch(() => router.push('/orders'))
      .finally(() => setLoading(false))
  }, [params.id, isAuthenticated])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  )

  if (!order) return null

  const cfg        = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const Icon       = cfg.icon
  const addr       = order.delivery_address ?? {}
  const items      = order.order_items ?? []
  const shop       = order.shops
  const stepIndex  = STATUS_FLOW.indexOf(order.status)
  const isTerminal = ['cancelled', 'rejected'].includes(order.status)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/orders')}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-white">Order Details</h1>
            <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', cfg.bg, cfg.color)}>
              <Icon className="w-3 h-3" />{cfg.label}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{cfg.desc}</p>
        </div>
      </div>

      {/* Order Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Hash,       label: 'Order ID',  value: '#' + order.id.slice(0, 8).toUpperCase() },
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

      {/* Progress */}
      {!isTerminal && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-white font-semibold mb-5">Order Progress</p>
          <div className="flex items-center">
            {STATUS_FLOW.map((s, i) => {
              const done    = stepIndex >= i
              const current = order.status === s
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all',
                      done ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-600'
                    )}>
                      {done ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                    </div>
                    <p className={cn('text-xs mt-2 capitalize font-medium whitespace-nowrap',
                      current ? 'text-blue-400' : done ? 'text-slate-300' : 'text-slate-600'
                    )}>
                      {s}
                    </p>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all',
                      stepIndex > i ? 'bg-blue-500' : 'bg-slate-700'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {isTerminal && (
        <div className={cn('flex items-center gap-3 p-4 rounded-2xl border', cfg.bg, cfg.color)}>
          <Icon className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">{cfg.label}</p>
            <p className="text-sm opacity-80 mt-0.5">{cfg.desc}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left — Items */}
        <div className="lg:col-span-3 space-y-4">
          {shop && (
            <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                {shop.logo_url
                  ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Store className="w-5 h-5 text-slate-500" /></div>
                }
              </div>
              <div>
                <p className="text-xs text-slate-500">Sold by</p>
                <p className="text-white font-medium text-sm">{shop.name}</p>
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <p className="text-white font-semibold">Items Ordered ({items.length})</p>
            </div>
            <div className="divide-y divide-slate-800">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                    {item.products?.images?.[0]
                      ? <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-slate-600" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm line-clamp-2">{item.products?.name ?? 'Product'}</p>
                    {item.products?.sku && <p className="text-slate-500 text-xs mt-0.5">SKU: {item.products.sku}</p>}
                    <p className="text-slate-400 text-xs mt-1">
                      Rs. {item.price?.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-white font-bold text-sm shrink-0">
                    Rs. {(item.price * item.quantity)?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
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
                <span className="text-white font-semibold">Total Paid</span>
                <span className="text-white font-bold text-lg">Rs. {order.total_amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Customer + Delivery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <p className="text-white font-semibold">Customer Details</p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Full Name</p>
                <p className="text-white text-sm font-medium">{addr.full_name || '—'}</p>
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
                    <p className="text-white text-sm">{addr.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <p className="text-white font-semibold">Delivery Address</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-white">{addr.address || '—'}</p>
              <p className="text-slate-400">{addr.city}</p>
              {addr.notes && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <p className="text-slate-500 text-xs mb-0.5">Delivery Notes</p>
                  <p className="text-slate-300 text-xs">{addr.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <p className="text-white font-semibold">Payment Method</p>
            </div>
            <div className={cn('flex items-center gap-3 p-3 rounded-xl border',
              addr.payment_method === 'cod' ? 'bg-green-500/10 border-green-500/20' : 'bg-blue-500/10 border-blue-500/20'
            )}>
              <CreditCard className={cn('w-5 h-5', addr.payment_method === 'cod' ? 'text-green-400' : 'text-blue-400')} />
              <p className="text-white text-sm font-medium capitalize">
                {addr.payment_method?.replace(/_/g, ' ') ?? '—'}
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="text-white font-semibold text-sm">Order Notes</p>
              <p className="text-slate-400 text-sm leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}