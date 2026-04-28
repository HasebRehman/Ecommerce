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
  { value: 'pending',             label: 'Pending',              icon: Clock,        color: 'text-yellow-600' },
  { value: 'confirmed',           label: 'Confirmed',            icon: CheckCircle,  color: 'text-blue-600'   },
  { value: 'shipped',             label: 'Shipped',              icon: Truck,        color: 'text-purple-600' },
  { value: 'delivered',           label: 'Delivered',            icon: CheckCircle,  color: 'text-green-600'  },
  { value: 'cancelled_by_seller', label: 'Cancel Order',         icon: XCircle,      color: 'text-red-600'    },
]

const STATUS_CONFIG: Record<string, { color: string, bg: string, label: string, icon: any }> = {
  pending:               { icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-100 border-yellow-200',  label: 'Pending'               },
  confirmed:             { icon: CheckCircle,  color: 'text-blue-600',   bg: 'bg-blue-100 border-blue-200',      label: 'Confirmed'             },
  shipped:               { icon: Truck,        color: 'text-purple-600', bg: 'bg-purple-100 border-purple-200',  label: 'Shipped'               },
  delivered:             { icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-100 border-green-200',    label: 'Delivered'             },
  cancelled_by_seller:   { icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-100 border-red-200',        label: 'Cancelled by Seller'   },
  cancelled_by_customer: { icon: AlertCircle,  color: 'text-orange-600', bg: 'bg-orange-100 border-orange-200', label: 'Cancelled by Customer' },
  cancelled:             { icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-100 border-red-200',        label: 'Cancelled'             },
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
    <div style={{ background: '#ffffff', minHeight: '100vh' }} className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
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
    <div style={{ 
      background: '#ffffff', 
      fontFamily: "'Open Sans', sans-serif", 
      minHeight: '100vh',
      overflowX: 'hidden',
      width: '100%',
      maxWidth: '100vw'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        
        .sod-header { font-family: 'Montserrat', sans-serif; }
        .sod-body { font-family: 'Open Sans', sans-serif; }
        
        .sod-card {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(196,181,253,0.3);
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.12), 0 8px 32px rgba(124,58,237,0.08);
        }
        
        .sod-btn-back {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.2);
          color: #7C3AED;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
          flex-shrink: 0;
        }
        .sod-btn-back:hover {
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.4);
        }
        
        .sod-dropdown {
          background: white;
          border: 1px solid rgba(196,181,253,0.3);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .sod-btn-save {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          border: none;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          border-radius: 12px;
          padding: 10px 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
          cursor: pointer;
          flex-shrink: 0;
        }
        .sod-btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(124,58,237,0.4);
        }
        .sod-btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="w-full px-4 sm:px-6 py-6" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
          <div className="flex items-center justify-between flex-wrap gap-4" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <button
                onClick={() => router.push('/dashboard/orders')}
                className="sod-btn-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="sod-header text-2xl sm:text-3xl font-bold text-[#1e1b4b]">Order Details</h1>
                  <span className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
                    cfg.bg, cfg.color
                  )}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>
                <p className="sod-body text-[#9ca3af] text-sm mt-1">
                  #{order.id?.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Status Dropdown + Save */}
            {!isTerminal(order.status) && availableOptions.length > 0 && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(o => !o)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-12 border text-sm font-semibold transition-all min-w-[180px] justify-between',
                      selectedOpt
                        ? `${STATUS_CONFIG[selectedStatus]?.bg ?? 'bg-white border-[#E5E7EB]'} ${STATUS_CONFIG[selectedStatus]?.color ?? 'text-[#1e1b4b]'}`
                        : 'bg-white border-[#E5E7EB] text-[#1e1b4b]'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {selectedOpt && <selectedOpt.icon className="w-4 h-4" />}
                      {selectedOpt?.label ?? 'Select Status'}
                    </span>
                    <ChevronDown className={cn(
                      'w-4 h-4 transition-transform',
                      dropdownOpen && 'rotate-180'
                    )} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 sod-dropdown z-50 overflow-hidden">
                      <div className="px-3 py-2 border-b border-[#E5E7EB]">
                        <p className="sod-body text-[#9ca3af] text-xs">Current Status</p>
                        <p className={cn('sod-body text-sm font-semibold mt-0.5', cfg.color)}>
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
                              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors sod-body',
                              selectedStatus === opt.value
                                ? `${STATUS_CONFIG[opt.value]?.bg} ${opt.color} font-semibold`
                                : 'text-[#6b7280] hover:bg-[#F9FAFB]'
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
                    className="sod-btn-save flex items-center gap-2 text-sm"
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
              <div className="flex-shrink-0">
                <span className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-12 text-sm font-semibold border',
                  cfg.bg, cfg.color
                )}>
                  <Icon className="w-4 h-4" />
                  {cfg.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 py-8 sm:py-12" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        <div className="space-y-6" style={{ width: '100%', maxWidth: '100%' }}>

          {/* Order Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ width: '100%', maxWidth: '100%' }}>
            {[
              { icon: Hash,       label: 'Order ID',  value: '#' + order.id?.slice(0, 8).toUpperCase() },
              { icon: Calendar,   label: 'Placed On', value: new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { icon: Clock,      label: 'Time',      value: new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
              { icon: CreditCard, label: 'Payment',   value: addr.payment_method?.replace(/_/g, ' ') ?? '—' },
            ].map(m => (
              <div key={m.label} className="sod-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <m.icon className="w-4 h-4 text-[#7C3AED]" />
                  <p className="sod-body text-[#9ca3af] text-xs font-semibold">{m.label}</p>
                </div>
                <p className="sod-header text-[#1e1b4b] font-bold text-sm capitalize">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ width: '100%', maxWidth: '100%' }}>

            {/* Left — Customer + Items */}
            <div className="lg:col-span-3 space-y-6">

              {/* Customer Info */}
              <div className="sod-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#7C3AED]" />
                  <p className="sod-header text-[#1e1b4b] font-bold text-lg">Customer</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="sod-body text-[#9ca3af] text-xs font-semibold mb-1">Name</p>
                    <p className="sod-body text-[#1e1b4b] text-sm font-semibold">
                      {order.profiles?.full_name || addr.full_name || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="sod-body text-[#9ca3af] text-xs font-semibold mb-1">Username</p>
                    <p className="sod-body text-[#1e1b4b] text-sm">
                      @{order.profiles?.username || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="sod-body text-[#9ca3af] text-xs font-semibold mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#7C3AED]" />
                      <p className="sod-body text-[#1e1b4b] text-sm">{addr.phone || '—'}</p>
                    </div>
                  </div>
                  {addr.email && (
                    <div>
                      <p className="sod-body text-[#9ca3af] text-xs font-semibold mb-1">Email</p>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#7C3AED]" />
                        <p className="sod-body text-[#1e1b4b] text-sm truncate">{addr.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="sod-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#7C3AED]" />
                  <p className="sod-header text-[#1e1b4b] font-bold text-lg">Delivery Address</p>
                </div>
                <p className="sod-body text-[#1e1b4b] text-sm font-semibold">{addr.address || '—'}</p>
                <p className="sod-body text-[#6b7280] text-sm">{addr.city}</p>
                {addr.notes && (
                  <div className="pt-3 border-t border-[#E5E7EB]">
                    <p className="sod-body text-[#9ca3af] text-xs font-semibold mb-1">Delivery Notes</p>
                    <p className="sod-body text-[#6b7280] text-sm">{addr.notes}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="sod-card overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#7C3AED]" />
                  <p className="sod-header text-[#1e1b4b] font-bold text-lg">Items ({items.length})</p>
                </div>
                <div className="divide-y divide-[#E5E7EB]">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-4">
                      <div className="w-16 h-16 rounded-12 overflow-hidden bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE] shrink-0">
                        {item.products?.images?.[0]
                          ? <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-[#C4B5FD]" />
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="sod-header text-[#1e1b4b] font-bold text-sm line-clamp-2">
                          {item.products?.name ?? 'Product'}
                        </p>
                        {item.products?.sku && (
                          <p className="sod-body text-[#9ca3af] text-xs mt-1">SKU: {item.products.sku}</p>
                        )}
                        <p className="sod-body text-[#6b7280] text-xs mt-1">
                          Rs. {item.price?.toLocaleString()} × {item.quantity}
                        </p>
                        {order.status !== 'pending' && item.products?.stock !== undefined && (
                          <p className="sod-body text-[#9ca3af] text-xs mt-1">
                            Stock remaining: {item.products.stock}
                          </p>
                        )}
                      </div>
                      <p className="sod-header text-[#1e1b4b] font-bold text-sm shrink-0">
                        Rs. {(item.price * item.quantity)?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="px-6 py-4 border-t border-[#E5E7EB] space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="sod-body text-[#6b7280]">Subtotal</span>
                    <span className="sod-body text-[#6b7280]">Rs. {order.total_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="sod-body text-[#6b7280]">Delivery</span>
                    <span className="sod-body text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E5E7EB] pt-2">
                    <span className="sod-header text-[#1e1b4b] font-bold">Total</span>
                    <span className="sod-header text-[#1e1b4b] font-bold text-lg">
                      Rs. {order.total_amount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Payment + Shop + Status Flow */}
            <div className="lg:col-span-2 space-y-6">

              {/* Payment */}
              <div className="sod-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#7C3AED]" />
                  <p className="sod-header text-[#1e1b4b] font-bold text-lg">Payment</p>
                </div>
                <div className={cn(
                  'flex items-center gap-3 p-3 rounded-12 border',
                  addr.payment_method === 'cod'
                    ? 'bg-green-100 border-green-200'
                    : 'bg-blue-100 border-blue-200'
                )}>
                  <CreditCard className={cn(
                    'w-5 h-5',
                    addr.payment_method === 'cod' ? 'text-green-600' : 'text-blue-600'
                  )} />
                  <p className="sod-body text-[#1e1b4b] text-sm font-semibold capitalize">
                    {addr.payment_method?.replace(/_/g, ' ') ?? '—'}
                  </p>
                </div>
              </div>

              {/* Shop */}
              {shop && (
                <div className="sod-card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#7C3AED]" />
                    <p className="sod-header text-[#1e1b4b] font-bold text-lg">Shop</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-12 overflow-hidden bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE] shrink-0">
                      {shop.logo_url
                        ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Store className="w-6 h-6 text-[#C4B5FD]" />
                          </div>
                      }
                    </div>
                    <p className="sod-header text-[#1e1b4b] font-bold text-sm">{shop.name}</p>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              {order.notes && (
                <div className="sod-card p-6 space-y-3">
                  <p className="sod-header text-[#1e1b4b] font-bold text-lg">Order Notes</p>
                  <p className="sod-body text-[#6b7280] text-sm leading-relaxed">{order.notes}</p>
                </div>
              )}

              {/* Status Flow */}
              <div className="sod-card p-6 space-y-4">
                <p className="sod-header text-[#1e1b4b] font-bold text-lg">Status Flow</p>
                <div className="space-y-3">
                  {['pending', 'confirmed', 'shipped', 'delivered'].map((s, i) => {
                    const scfg   = STATUS_CONFIG[s]
                    const SIcon  = scfg.icon
                    const isDone = ['pending', 'confirmed', 'shipped', 'delivered']
                      .indexOf(order.status) >= i
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                          isDone ? 'bg-[#7C3AED]' : 'bg-[#F3E8FF]'
                        )}>
                          <SIcon className={cn('w-4 h-4', isDone ? 'text-white' : 'text-[#C4B5FD]')} />
                        </div>
                        <span className={cn(
                          'sod-body text-sm capitalize',
                          isDone ? 'text-[#1e1b4b] font-semibold' : 'text-[#9ca3af]'
                        )}>
                          {scfg.label}
                        </span>
                        {order.status === s && (
                          <span className="sod-body text-xs bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-1 rounded-full border border-[#7C3AED]/20 font-semibold">
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