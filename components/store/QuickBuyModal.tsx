'use client'

import { useState } from 'react'
import { X, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { orderService } from '@/lib/services/order.service'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'
import AddressSelector from './AddressSelector'
import { cn } from '@/lib/utils'

interface Product {
  id:             string
  name:           string
  price:          number
  discount_price: number | null
  images:         string[]
  shop:           { id: string; name: string } | null
}

interface Props {
  product:   Product
  onClose:   () => void
  onSuccess: () => void
}

const PAYMENT_METHODS = [
  { value: 'cod',           label: 'Cash on Delivery' },
  { value: 'bank_transfer', label: 'Bank Transfer'    },
  { value: 'easypaisa',     label: 'EasyPaisa'        },
  { value: 'jazzcash',      label: 'JazzCash'         },
]

export default function QuickBuyModal({ product, onClose, onSuccess }: Props) {
  const router = useRouter()

  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [paymentMethod,   setPaymentMethod]   = useState('cod')
  const [notes,           setNotes]           = useState('')
  const [loading,         setLoading]         = useState(false)

  const price = product.discount_price ?? product.price

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address')
      return
    }

    setLoading(true)
    try {
      await orderService.placeOrder({
        items: [{
          product_id: product.id,
          quantity:   1,
          price,
          shop_id:    product.shop?.id ?? null,
        }],
        delivery_address: {
          full_name: selectedAddress.full_name,
          phone:     selectedAddress.phone,
          address:   selectedAddress.address,
          city:      selectedAddress.city,
        },
        payment_method: paymentMethod,
        notes:          notes || undefined,
      })

      toast.success('Order placed successfully! 🎉')
      onSuccess()
      onClose()
      router.push('/orders')
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-semibold">Quick Buy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Product Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-700 shrink-0">
              {product.images?.[0] && (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium line-clamp-2">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white font-bold text-sm">Rs. {price.toLocaleString()}</span>
                {product.discount_price && (
                  <>
                    <span className="text-slate-500 text-xs line-through">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <DiscountBadge price={product.price} discountPrice={product.discount_price} />
                  </>
                )}
              </div>
              {product.shop && (
                <p className="text-slate-500 text-xs mt-0.5">{product.shop.name}</p>
              )}
            </div>
          </div>

          {/* Address Selector */}
          <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl">
            <AddressSelector
              selected={selectedAddress}
              onSelect={setSelectedAddress}
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
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
                    paymentMethod === pm.value ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                  )} />
                  {pm.label}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <p className="text-slate-400 text-sm">
              Notes <span className="text-slate-600">(optional)</span>
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Special instructions..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Total + Place Order */}
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-sm">Total</span>
            <span className="text-white font-bold">Rs. {price.toLocaleString()}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddress}
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Zap className="w-4 h-4" /> Place Order — Rs. {price.toLocaleString()}</>
            }
          </button>

        </div>
      </div>
    </div>
  )
}