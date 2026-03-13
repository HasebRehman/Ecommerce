'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Package, Clock, CheckCircle, Truck,
  XCircle, ChevronRight, Loader2, Bell, RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { businessOrderService } from '@/lib/services/business-order.service'
import { useAuthStore } from '@/store/authStore'
import { useNewOrdersStore } from '@/store/newOrdersStore'
import { cn } from '@/lib/utils'

const POLL_INTERVAL = 8000 // 8 seconds

const STATUS_TABS = [
  { value: '',                      label: 'All Orders'            },
  { value: 'pending',               label: 'Pending'               },
  { value: 'confirmed',             label: 'Confirmed'             },
  { value: 'shipped',               label: 'Shipped'               },
  { value: 'delivered',             label: 'Delivered'             },
  { value: 'cancelled_by_seller',   label: 'Cancelled by Me'       },
  { value: 'cancelled_by_customer', label: 'Cancelled by Customer' },
]

const STATUS_CONFIG: Record<string, { icon: any, color: string, bg: string, label: string }> = {
  pending:               { icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30',  label: 'Pending'               },
  confirmed:             { icon: CheckCircle,  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',      label: 'Confirmed'             },
  shipped:               { icon: Truck,        color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30',  label: 'Shipped'               },
  delivered:             { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',    label: 'Delivered'             },
  cancelled_by_seller:   { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',        label: 'Cancelled by Seller'   },
  cancelled_by_customer: { icon: XCircle,      color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'Cancelled by Customer' },
  cancelled:             { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',        label: 'Cancelled'             },
}

export default function OrdersPage() {
  const [orders,       setOrders]       = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState('')
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null)
  const [isPolling,    setIsPolling]    = useState(false)

  const activeTabRef   = useRef('')
  const knownOrderIds  = useRef<Set<string>>(new Set())
  const isFirstLoad    = useRef(true)
  const pollTimer      = useRef<NodeJS.Timeout | null>(null)

  const { user }           = useAuthStore()
  const { clearNewOrders } = useNewOrdersStore()

  // ── Core fetch function ──
  const fetchOrders = useCallback(async (status: string, silent = false) => {
    if (!silent) setLoading(true)
    else setIsPolling(true)

    try {
      const data = await businessOrderService.getOrders(status)
      const fresh: any[] = data.orders ?? []

      if (isFirstLoad.current) {
        // First load — just set everything, record known IDs
        setOrders(fresh)
        fresh.forEach(o => knownOrderIds.current.add(o.id))
        isFirstLoad.current = false
      } else {
        // Subsequent polls — find NEW orders
        const newOrders = fresh.filter(o => !knownOrderIds.current.has(o.id))

        if (newOrders.length > 0) {
          // Add new orders to top
          setOrders(prev => {
            const existingIds = new Set(prev.map((o: any) => o.id))
            const toAdd = newOrders.filter(o => !existingIds.has(o.id))
            return [...toAdd, ...prev]
          })

          // Register new IDs
          newOrders.forEach(o => knownOrderIds.current.add(o.id))

          // Toast for each new order
          newOrders.forEach(order => {
            const customerName = order.profiles?.full_name ?? 'A customer'
            toast.success(`🛍️ New Order!`, {
              description: `${customerName} placed an order · Rs. ${order.total_amount?.toLocaleString()}`,
              duration: 8000,
              action: {
                label: 'View',
                onClick: () => {},
              },
            })
            useNewOrdersStore.getState().increment()
          })
        } else {
          // No new orders — just silently update existing statuses
          setOrders(fresh)
        }
      }

      setLastUpdated(new Date())
    } catch {
      if (!silent) toast.error('Failed to load orders')
    } finally {
      setLoading(false)
      setIsPolling(false)
    }
  }, [])

  // ── Initial load + tab change ──
  useEffect(() => {
    activeTabRef.current = activeTab
    isFirstLoad.current  = true
    knownOrderIds.current.clear()

    fetchOrders(activeTab, false)
    clearNewOrders()

    // Clear old timer
    if (pollTimer.current) clearInterval(pollTimer.current)

    // Start polling
    pollTimer.current = setInterval(() => {
      fetchOrders(activeTabRef.current, true)
    }, POLL_INTERVAL)

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current)
    }
  }, [activeTab])

  // ── Also poll when tab becomes visible again ──
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders(activeTabRef.current, true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-slate-400 mt-1">Manage and fulfill customer orders</p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-3">
          {isPolling && (
            <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" />
          )}
          <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-medium">Live</span>
            {lastUpdated && (
              <span className="text-slate-500">
                · {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchOrders(activeTab, false)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
            title="Refresh now"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
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

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">No orders yet</p>
          <p className="text-slate-400 text-sm mt-1">
            New orders will appear here automatically every {POLL_INTERVAL / 1000} seconds
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const cfg      = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
            const Icon     = cfg.icon
            const addr     = order.delivery_address ?? {}
            const items    = order.order_items      ?? []
            const customer = order.profiles?.full_name ?? 'Customer'

            return (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-4 flex-wrap">

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-slate-400 text-xs font-mono">
                          #{order.id?.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                          cfg.bg, cfg.color
                        )}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>

                      <p className="text-white font-semibold">{customer}</p>
                      <p className="text-slate-400 text-sm">
                        {addr.phone} · {addr.city}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                          {items.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-lg border-2 border-slate-900 overflow-hidden bg-slate-800">
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
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 mt-1" />
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