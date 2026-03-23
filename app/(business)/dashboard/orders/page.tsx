'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Package, Clock, CheckCircle, Truck,
  XCircle, ChevronRight, Loader2, RefreshCw,
  ChevronLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { businessOrderService } from '@/lib/services/business-order.service'
import { useAuthStore } from '@/store/authStore'
import { useNewOrdersStore } from '@/store/newOrdersStore'
import { cn } from '@/lib/utils'

const POLL_INTERVAL  = 8000
const ORDERS_PER_PAGE = 10

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
  const [orders,      setOrders]      = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isPolling,   setIsPolling]   = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const activeTabRef  = useRef('')
  const knownOrderIds = useRef<Set<string>>(new Set())
  const isFirstLoad   = useRef(true)
  const pollTimer     = useRef<NodeJS.Timeout | null>(null)

  const { clearNewOrders } = useNewOrdersStore()

  const fetchOrders = useCallback(async (status: string, silent = false) => {
    if (!silent) setLoading(true)
    else setIsPolling(true)

    try {
      const data  = await businessOrderService.getOrders(status)
      const fresh: any[] = data.orders ?? []

      if (isFirstLoad.current) {
        setOrders(fresh)
        fresh.forEach(o => knownOrderIds.current.add(o.id))
        isFirstLoad.current = false
      } else {
        const newOrders = fresh.filter(o => !knownOrderIds.current.has(o.id))

        if (newOrders.length > 0) {
          setOrders(prev => {
            const existingIds = new Set(prev.map((o: any) => o.id))
            const toAdd = newOrders.filter(o => !existingIds.has(o.id))
            return [...toAdd, ...prev]
          })
          newOrders.forEach(o => knownOrderIds.current.add(o.id))
          newOrders.forEach(order => {
            const customerName = order.profiles?.full_name ?? 'A customer'
            toast.success(`🛍️ New Order!`, {
              description: `${customerName} placed an order · Rs. ${order.total_amount?.toLocaleString()}`,
              duration: 8000,
            })
            useNewOrdersStore.getState().increment()
          })
        } else {
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

  // Reset to page 1 when tab or orders change
  useEffect(() => {
    setCurrentPage(1)
    activeTabRef.current = activeTab
    isFirstLoad.current  = true
    knownOrderIds.current.clear()

    fetchOrders(activeTab, false)
    clearNewOrders()

    if (pollTimer.current) clearInterval(pollTimer.current)
    pollTimer.current = setInterval(() => {
      fetchOrders(activeTabRef.current, true)
    }, POLL_INTERVAL)

    return () => { if (pollTimer.current) clearInterval(pollTimer.current) }
  }, [activeTab])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders(activeTabRef.current, true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // ── Pagination logic ──
  const totalOrders = orders.length
  const totalPages  = Math.ceil(totalOrders / ORDERS_PER_PAGE)
  const startIndex  = (currentPage - 1) * ORDERS_PER_PAGE
  const endIndex    = startIndex + ORDERS_PER_PAGE
  const currentOrders = orders.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-slate-400 mt-1">Manage and fulfill customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          {isPolling && <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" />}
          <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-medium">Live</span>
            {lastUpdated && (
              <span className="text-slate-500">
                · {lastUpdated.toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                })}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchOrders(activeTab, false)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
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
            {tab.value === '' && totalOrders > 0 && (
              <span className="ml-2 text-xs text-slate-500">({totalOrders})</span>
            )}
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
            New orders appear automatically every {POLL_INTERVAL / 1000} seconds
          </p>
        </div>
      ) : (
        <>
          {/* Results info */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-slate-400">
              Showing{' '}
              <span className="text-white font-medium">{startIndex + 1}</span>
              {' '}–{' '}
              <span className="text-white font-medium">{Math.min(endIndex, totalOrders)}</span>
              {' '}of{' '}
              <span className="text-white font-medium">{totalOrders}</span>
              {' '}orders
            </p>
            {totalPages > 1 && (
              <p className="text-slate-500">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          {/* Orders */}
          <div className="space-y-3">
            {currentOrders.map(order => {
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
                            {items.length > 3 && (
                              <div className="w-8 h-8 rounded-lg border-2 border-slate-900 bg-slate-700 flex items-center justify-center">
                                <span className="text-slate-300 text-xs font-medium">
                                  +{items.length - 3}
                                </span>
                              </div>
                            )}
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
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">

              {/* Prev */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-white text-sm rounded-lg transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((page, i) => (
                page === '...' ? (
                  <span key={`dots-${i}`} className="px-2 text-slate-600">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page as number)}
                    className={cn(
                      'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    )}
                  >
                    {page}
                  </button>
                )
              ))}

              {/* Next */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-white text-sm rounded-lg transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          )}
        </>
      )}

    </div>
  )
}