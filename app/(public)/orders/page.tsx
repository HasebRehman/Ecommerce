'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronRight, Loader2, Package, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { API } from '@/constants/api'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { icon: any, color: string, bg: string, label: string }> = {
  pending:               { icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30',  label: 'Pending'              },
  confirmed:             { icon: CheckCircle,  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',      label: 'Confirmed'            },
  shipped:               { icon: Truck,        color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30',  label: 'Shipped'              },
  delivered:             { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',    label: 'Delivered'            },
  cancelled_by_customer: { icon: XCircle,      color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'Cancelled by You'     },
  cancelled_by_seller:   { icon: AlertCircle,  color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',        label: 'Cancelled by Seller'  },
  cancelled:             { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',        label: 'Cancelled'            },
}

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAuthStore()
  const router              = useRouter()
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    api.get(API.STORE.ORDERS)
      .then(res => setOrders(res.data.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])


  // Re-fetch when page becomes visible again (coming back from detail page)
  useEffect(() => {
    const handleFocus = () => setRefreshKey(k => k + 1)
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  const FILTER_TABS = [
    { value: '',           label: 'All' },
    { value: 'pending',    label: 'Pending' },
    { value: 'confirmed',  label: 'Confirmed' },
    { value: 'shipped',    label: 'Shipped' },
    { value: 'delivered',  label: 'Delivered' },
    { value: 'cancelled',  label: 'Cancelled' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Order History</h1>
        <p className="text-slate-400 text-sm mt-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0',
              filter === tab.value
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            )}
          >
            {tab.label}
            {tab.value === '' && orders.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({orders.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-medium text-lg">No orders yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            {filter ? 'No orders with this status' : 'Start shopping to see your orders here'}
          </p>
          {!filter && (
            <Link href="/">
              <button className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors">
                Browse Products
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const cfg   = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
            const Icon  = cfg.icon
            const items = order.order_items ?? []
            const shop  = order.shops
            const addr  = order.delivery_address ?? {}

            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-5 transition-all cursor-pointer group">
                  <div className="flex items-start gap-4">

                    {/* Product images preview */}
                    <div className="flex -space-x-3 shrink-0">
                      {items.slice(0, 3).map((item: any, i: number) => (
                        <div
                          key={i}
                          className="w-14 h-14 rounded-xl border-2 border-slate-900 overflow-hidden bg-slate-800 shrink-0"
                          style={{ zIndex: 3 - i }}
                        >
                          {item.products?.images?.[0]
                            ? <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-slate-600" />
                              </div>
                          }
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="w-14 h-14 rounded-xl border-2 border-slate-900 bg-slate-800 flex items-center justify-center" style={{ zIndex: 0 }}>
                          <span className="text-slate-400 text-xs font-medium">+{items.length - 3}</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-500 text-xs font-mono">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className={cn(
                              'flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                              cfg.bg, cfg.color
                            )}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </div>

                          {/* Shop */}
                          {shop && (
                            <div className="flex items-center gap-1.5">
                              {shop.logo_url
                                ? <img src={shop.logo_url} alt={shop.name} className="w-4 h-4 rounded object-cover" />
                                : <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                              }
                              <span className="text-slate-400 text-xs">{shop.name}</span>
                            </div>
                          )}

                          {/* Item names */}
                          <p className="text-white text-sm font-medium line-clamp-1">
                            {items.map((i: any) => i.products?.name).filter(Boolean).join(', ')}
                          </p>

                          <p className="text-slate-500 text-xs">
                            {items.length} item{items.length !== 1 ? 's' : ''} ·{' '}
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                        </div>

                        {/* Price + arrow */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <p className="text-white font-bold">
                            Rs. {order.total_amount?.toLocaleString()}
                          </p>
                          <p className="text-slate-500 text-xs capitalize">
                            {addr.payment_method?.replace(/_/g, ' ')}
                          </p>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors mt-1" />
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
  )
}