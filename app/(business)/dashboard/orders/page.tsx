'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Package, Clock, CheckCircle, Truck,
  XCircle, ChevronRight, Loader2,
  ChevronLeft, ShoppingBag,
} from 'lucide-react'
import { toast } from 'sonner'
import { businessOrderService } from '@/lib/services/business-order.service'
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
  pending:               { icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-100 border-yellow-200',  label: 'Pending'               },
  confirmed:             { icon: CheckCircle,  color: 'text-blue-600',   bg: 'bg-blue-100 border-blue-200',      label: 'Confirmed'             },
  shipped:               { icon: Truck,        color: 'text-purple-600', bg: 'bg-purple-100 border-purple-200',  label: 'Shipped'               },
  delivered:             { icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-100 border-green-200',    label: 'Delivered'             },
  cancelled_by_seller:   { icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-100 border-red-200',        label: 'Cancelled by Seller'   },
  cancelled_by_customer: { icon: XCircle,      color: 'text-orange-600', bg: 'bg-orange-100 border-orange-200', label: 'Cancelled by Customer' },
  cancelled:             { icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-100 border-red-200',        label: 'Cancelled'             },
}

export default function OrdersPage() {
  const [orders,      setOrders]      = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const activeTabRef  = useRef('')
  const knownOrderIds = useRef<Set<string>>(new Set())
  const isFirstLoad   = useRef(true)
  const pollTimer     = useRef<NodeJS.Timeout | null>(null)

  const { clearNewOrders } = useNewOrdersStore()

  const fetchOrders = useCallback(async (status: string, silent = false) => {
    if (!silent) setLoading(true)

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
    } catch {
      if (!silent) toast.error('Failed to load orders')
    } finally {
      setLoading(false)
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
    <div style={{ 
      background: '#ffffff', 
      fontFamily: "'Open Sans', sans-serif", 
      minHeight: 'calc(100vh - 120px)',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        .op-header { font-family: 'Montserrat', sans-serif; }
        .op-body { font-family: 'Open Sans', sans-serif; }
        
        .op-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(196,181,253,0.3);
          border-radius: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(124,58,237,0.15), 0 4px 12px rgba(124,58,237,0.08), 0 2px 6px rgba(0,0,0,0.05);
          margin-bottom: 16px;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
        .op-card:hover {
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 12px 35px rgba(124,58,237,0.25), 0 8px 20px rgba(124,58,237,0.15), 0 4px 10px rgba(0,0,0,0.08);
          transform: translateY(-3px);
        }
        
        .op-tab {
          padding: 10px 16px;
          border-radius: 12px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .op-tab.active {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(124,58,237,0.3);
        }
        .op-tab:not(.active) {
          background: rgba(124,58,237,0.1);
          color: #7C3AED;
          border: 1px solid rgba(124,58,237,0.2);
        }
        .op-tab:not(.active):hover {
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.4);
        }
        
        .op-tabs-container {
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 100%;
          max-width: 100%;
        }
        .op-tabs-container::-webkit-scrollbar {
          display: none;
        }
        
        .op-tabs-wrapper {
          display: flex;
          gap: 12px;
          padding-bottom: 8px;
          min-width: max-content;
        }
        
        .op-pagination-btn {
          padding: 8px 16px;
          border-radius: 10px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          cursor: pointer;
          border: 1px solid rgba(196,181,253,0.3);
          flex-shrink: 0;
        }
        .op-pagination-btn.active {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          color: white;
          border-color: #7C3AED;
        }
        .op-pagination-btn:not(.active) {
          background: white;
          color: #7C3AED;
        }
        .op-pagination-btn:not(.active):hover {
          background: rgba(124,58,237,0.1);
        }
        .op-pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .op-pagination-container {
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 100%;
        }
        .op-pagination-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Content - No Header */}
      <div className="space-y-6" style={{ 
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        marginTop: '24px'
      }}>



        {/* Status Tabs */}
        <div className="op-tabs-container">
          <div className="op-tabs-wrapper">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn('op-tab', activeTab === tab.value && 'active')}
              >
                {tab.label}
                {tab.value === '' && totalOrders > 0 && (
                  <span className="ml-2 text-xs opacity-70">({totalOrders})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 rounded-20 bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE] border border-[#C4B5FD]/30">
            <ShoppingBag className="w-16 h-16 text-[#C4B5FD] mx-auto mb-4" />
            <p className="op-header text-xl font-bold text-[#1e1b4b]">No orders yet</p>
            <p className="op-body text-[#6b7280] text-sm mt-2">
              New orders appear automatically every {POLL_INTERVAL / 1000} seconds
            </p>
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            {/* Results info */}
            <div className="flex items-center justify-between text-sm mb-6 flex-wrap gap-2">
              <p className="op-body text-[#6b7280]">
                Showing{' '}
                <span className="text-[#1e1b4b] font-semibold">{startIndex + 1}</span>
                {' '}–{' '}
                <span className="text-[#1e1b4b] font-semibold">{Math.min(endIndex, totalOrders)}</span>
                {' '}of{' '}
                <span className="text-[#1e1b4b] font-semibold">{totalOrders}</span>
                {' '}orders
              </p>
              {totalPages > 1 && (
                <p className="op-body text-[#9ca3af]">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>

            {/* Orders */}
            <div className="space-y-0" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
              {currentOrders.map(order => {
                const cfg      = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
                const Icon     = cfg.icon
                const addr     = order.delivery_address ?? {}
                const items    = order.order_items      ?? []
                const customer = order.profiles?.full_name ?? 'Customer'

                return (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                    <div className="op-card p-4 sm:p-5 group">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">

                        <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <span className="op-body text-[#9ca3af] text-xs font-mono">
                              #{order.id?.slice(0, 8).toUpperCase()}
                            </span>
                            <span className={cn(
                              'flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border',
                              cfg.bg, cfg.color
                            )}>
                              <Icon className="w-3 h-3" />
                              <span className="hidden sm:inline">{cfg.label}</span>
                              <span className="sm:hidden">{cfg.label.split(' ')[0]}</span>
                            </span>
                          </div>

                          <p className="op-header text-[#1e1b4b] font-bold text-base sm:text-lg truncate">{customer}</p>
                          <p className="op-body text-[#6b7280] text-sm truncate">
                            {addr.phone} · {addr.city}
                          </p>

                          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                            <div className="flex -space-x-1 sm:-space-x-2">
                              {items.slice(0, 3).map((item: any, i: number) => (
                                <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-white overflow-hidden bg-[#F3E8FF] shadow-sm">
                                  {item.products?.images?.[0]
                                    ? <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#C4B5FD]" />
                                      </div>
                                  }
                                </div>
                              ))}
                              {items.length > 3 && (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-white bg-[#7C3AED] flex items-center justify-center shadow-sm">
                                  <span className="text-white text-xs font-bold">
                                    +{items.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="op-body text-[#6b7280] text-sm">
                              {items.length} item{items.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 sm:gap-2 shrink-0 text-right">
                          <p className="op-header text-[#1e1b4b] font-bold text-lg sm:text-xl">
                            Rs. {order.total_amount?.toLocaleString()}
                          </p>
                          <p className="op-body text-[#9ca3af] text-xs">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                          <p className="op-body text-[#9ca3af] text-xs capitalize hidden sm:block">
                            {addr.payment_method?.replace('_', ' ')}
                          </p>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#C4B5FD] group-hover:text-[#7C3AED] mt-1 sm:mt-2 transition-colors" />
                        </div>

                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="op-pagination-container pt-4">
                <div className="flex items-center justify-center gap-2 flex-wrap">

                  {/* Prev */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="op-pagination-btn flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((page, i) => (
                    page === '...' ? (
                      <span key={`dots-${i}`} className="px-2 text-[#9ca3af]">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page as number)}
                        className={cn(
                          'op-pagination-btn w-10 h-10 flex items-center justify-center',
                          currentPage === page && 'active'
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
                    className="op-pagination-btn flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}