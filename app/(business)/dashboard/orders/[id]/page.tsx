'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Package, MapPin, Phone,
  CreditCard, Clock, Loader2, User,
} from 'lucide-react'
import { toast } from 'sonner'
import { businessOrderService } from '@/lib/services/business-order.service'
import { cn } from '@/lib/utils'

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered']

const STATUS_CONFIG: Record<string, { color: string, bg: string, label: string }> = {
  pending:              { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'Pending'              },
  confirmed:            { color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',     label: 'Confirmed'            },
  shipped:              { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', label: 'Shipped'              },
  delivered:            { color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',   label: 'Delivered'            },
  cancelled_by_seller:  { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',       label: 'Cancelled by Seller'  },
  cancelled_by_customer:{ color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'Cancelled by Customer'},
  cancelled:            { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',       label: 'Cancelled'            },
}

const NEXT_STATUS: Record<string, string> = {
  pending:   'confirmed',
  confirmed: 'shipped',
  shipped:   'delivered',
}

const NEXT_LABEL: Record<string, string> = {
  pending:   'Confirm Order',
  confirmed: 'Mark as Shipped',
  shipped:   'Mark as Delivered',
}

export default function BusinessOrderDetailPage() {
  const params               = useParams()
  const router               = useRouter()
  const [order,    setOrder]   = useState<any>(null)
  const [loading,  setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    businessOrderService.getOrder(params.id as string)
      .then(data => setOrder(data.order))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true)
    try {
      const data = await businessOrderService.updateStatus(order.id, status)
      setOrder((prev: any) => ({ ...prev, status }))
      toast.success(data.message)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!order) {
    return <div className="text-center py-20"><p className="text-slate-400">Order not found</p></div>
  }

  const cfg        = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const addr       = order.delivery_address ?? {}
  const items      = order.order_items ?? []
  const customer   = order.profiles?.full_name ?? 'Customer'
  const nextStatus = NEXT_STATUS[order.status]

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-white">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border',
              cfg.bg, cfg.color
            )}>
              {cfg.label}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {order.status !== 'cancelled' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-white font-medium mb-4">Order Progress</p>
          <div className="flex items-center">
            {STATUS_FLOW.map((s, i) => {
              const isCompleted = STATUS_FLOW.indexOf(order.status) >= i
              const isCurrent   = order.status === s
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                      isCompleted
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    )}>
                      {i + 1}
                    </div>
                    <p className={cn(
                      'text-xs mt-1.5 capitalize whitespace-nowrap',
                      isCurrent ? 'text-blue-400 font-medium' : isCompleted ? 'text-slate-300' : 'text-slate-600'
                    )}>
                      {s}
                    </p>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-1 mb-5 transition-all',
                      STATUS_FLOW.indexOf(order.status) > i ? 'bg-blue-500' : 'bg-slate-700'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Items + Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <p className="text-white font-semibold">Order Items ({items.length})</p>
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
                    <p className="text-white font-medium text-sm line-clamp-2">{item.products?.name}</p>
                    {item.products?.sku && <p className="text-slate-500 text-xs mt-0.5">SKU: {item.products.sku}</p>}
                    <p className="text-slate-400 text-sm mt-1">
                      Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-white font-bold text-sm shrink-0">
                    Rs. {(item.quantity * item.price)?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-800 flex justify-between">
              <span className="text-slate-400">Total</span>
              <span className="text-white font-bold text-lg">Rs. {order.total_amount?.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {order.status !== 'cancelled_by_seller' &&
          order.status !== 'cancelled_by_customer' &&
          order.status !== 'cancelled' &&
          order.status !== 'delivered' && (
            <div className="flex gap-3">
              {nextStatus && (
                <button
                  onClick={() => handleUpdateStatus(nextStatus)}
                  disabled={updating}
                  className="flex-1 h-11 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {updating
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : NEXT_LABEL[order.status]
                  }
                </button>
              )}
              {/* Seller can cancel only before shipped */}
              {(order.status === 'pending' || order.status === 'confirmed') && (
                <button
                  onClick={() => handleUpdateStatus('cancelled_by_seller')}
                  disabled={updating}
                  className="h-11 px-6 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 font-medium rounded-xl border border-red-500/30 transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <p className="text-white font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" /> Customer
            </p>
            <p className="text-slate-300">{customer}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <p className="text-white font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" /> Delivery Address
            </p>
            <div className="space-y-1.5 text-sm text-slate-300">
              <p>{addr.full_name}</p>
              <p className="flex items-center gap-1.5 text-slate-400">
                <Phone className="w-3.5 h-3.5" />{addr.phone}
              </p>
              <p>{addr.address}</p>
              <p>{addr.city}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <p className="text-white font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" /> Payment
            </p>
            <p className="text-slate-300 capitalize text-sm">
              {addr.payment_method?.replace(/_/g, ' ')}
            </p>
          </div>
          {order.notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <p className="text-white font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Notes
              </p>
              <p className="text-slate-300 text-sm">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}