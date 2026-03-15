'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, CheckCircle } from 'lucide-react'
import { orderService } from '@/lib/services/order.service'
import AddressSelector from './AddressSelector'
import { cn } from '@/lib/utils'

interface Props {
  items:     any[]
  total:     number
  onCancel:  () => void
  onSuccess: () => void
}

const PAYMENT_METHODS = [
  { value: 'cod',           label: 'Cash on Delivery' },
  { value: 'bank_transfer', label: 'Bank Transfer'    },
  { value: 'easypaisa',     label: 'EasyPaisa'        },
  { value: 'jazzcash',      label: 'JazzCash'         },
]

export default function CheckoutForm({ items, total, onCancel, onSuccess }: Props) {
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [paymentMethod,   setPaymentMethod]   = useState('cod')
  const [notes,           setNotes]           = useState('')
  const [loading,         setLoading]         = useState(false)
  const [ordered,         setOrdered]         = useState(false)

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address')
      return
    }

    setLoading(true)
    try {
      const orderItems = items.map((item: any) => ({
        product_id: item.product_id ?? item.products?.id,
        quantity:   item.quantity,
        price:      item.products?.discount_price ?? item.products?.price,
        shop_id:    item.products?.shop_products?.[0]?.shops?.id ?? null,
      }))

      await orderService.placeOrder({
        items:            orderItems,
        delivery_address: {
          full_name: selectedAddress.full_name,
          phone:     selectedAddress.phone,
          address:   selectedAddress.address,
          city:      selectedAddress.city,
        },
        payment_method: paymentMethod,
        notes:          notes || undefined,
      })

      setOrdered(true)
      toast.success('Order placed successfully! 🎉')
      setTimeout(() => onSuccess(), 1500)
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (ordered) return (
    <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
      <p className="text-white font-semibold">Order Placed!</p>
      <p className="text-slate-400 text-sm mt-1">We'll contact you soon to confirm delivery</p>
    </div>
  )

  return (
    <div className="space-y-4">

      {/* Address Selector */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <AddressSelector
          selected={selectedAddress}
          onSelect={setSelectedAddress}
        />
      </div>

      {/* Payment Method */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <p className="text-white font-semibold text-sm">Payment Method</p>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map(pm => (
            <div
              key={pm.value}
              onClick={() => setPaymentMethod(pm.value)}
              className={cn(
                'flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm',
                paymentMethod === pm.value
                  ? 'bg-blue-500/10 border-blue-500/40 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              )}
            >
              <div className={cn(
                'w-3.5 h-3.5 rounded-full border-2 shrink-0',
                paymentMethod === pm.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-slate-600'
              )} />
              {pm.label}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <p className="text-white text-sm font-semibold">
          Notes <span className="text-slate-500 font-normal">(optional)</span>
        </p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Special instructions for your order..."
          rows={2}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={loading || !selectedAddress}
          className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : `Place Order • Rs. ${total.toLocaleString()}`
          }
        </button>
      </div>

    </div>
  )
}