'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package, Clock, CheckCircle, Truck,
  XCircle, ChevronRight, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { businessOrderService } from '@/lib/services/business-order.service'
import { cn } from '@/lib/utils'

const STATUS_TABS = [
  { value: '',                    label: 'All Orders'           },
  { value: 'pending',             label: 'Pending'              },
  { value: 'confirmed',           label: 'Confirmed'            },
  { value: 'shipped',             label: 'Shipped'              },
  { value: 'delivered',           label: 'Delivered'            },
  { value: 'cancelled_by_seller', label: 'Cancelled by Me'      },
  { value: 'cancelled_by_customer', label: 'Cancelled by Customer' },
]

const STATUS_CONFIG: Record<string, { icon: any, color: string, bg: string, label: string }> = {
  pending:               { icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30',  label: 'Pending'               },
  confirmed:             { icon: CheckCircle, color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',      label: 'Confirmed'             },
  shipped:               { icon: Truck,       color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30',  label: 'Shipped'               },
  delivered:             { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',    label: 'Delivered'             },
  cancelled_by_seller:   { icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',        label: 'Cancelled by Seller'   },
  cancelled_by_customer: { icon: XCircle,     color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30',  label: 'Cancelled by Customer' },
  cancelled:             { icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',        label: 'Cancelled'             },
}

export default function OrdersPage() {
  const [orders,     setOrders]     = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('')

  const loadOrders = async (status = '') => {
    setLoading(true)
    try {
      const data = await businessOrderService.getOrders(status)
      setOrders(data.orders ?? [])
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders(activeTab) }, [activeTab])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-slate-400 mt-1">Manage and fulfill customer orders</p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.value
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">No orders yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Orders will appear here when customers buy your products
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const cfg      = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
            const Icon     = cfg.icon
            const addr     = order.delivery_address ?? {}
            const items    = order.order_items ?? []
            const customer = order.profiles?.full_name ?? 'Customer'

            return (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-4 flex-wrap">

                    {/* Left */}
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Order ID + Status */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-slate-400 text-xs font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                          cfg.bg, cfg.color
                        )}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Customer */}
                      <p className="text-white font-semibold">{customer}</p>
                      <p className="text-slate-400 text-sm">
                        {addr.phone} · {addr.city}
                      </p>

                      {/* Products preview */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                          {items.slice(0, 3).map((item: any, i: number) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-lg border-2 border-slate-900 overflow-hidden bg-slate-800"
                            >
                              {item.products?.images?.[0]
                                ? <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-4 h-4 text-slate-600" />
                                  </div>
                              }
                            </div>
                          ))}
                        </div>
                        <span className="text-slate-400 text-xs">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-white font-bold text-lg">
                        Rs. {order.total_amount?.toLocaleString()}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-slate-500 text-xs capitalize">
                        {addr.payment_method?.replace('_', ' ')}
                      </p>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors mt-1" />
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