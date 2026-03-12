'use client'

import { useState } from 'react'
import { X, Loader2, Zap } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { orderService } from '@/lib/services/order.service'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'

interface Product {
  id:             string
  name:           string
  price:          number
  discount_price: number | null
  images:         string[]
  shop:           { id: string; name: string }
}

interface Props {
  product:  Product
  onClose:  () => void
  onSuccess: () => void
}

interface FormData {
  full_name:       string
  phone:           string
  address:         string
  city:            string
  payment_method:  string
  notes:           string
}

export default function QuickBuyModal({ product, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const price = product.discount_price ?? product.price

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await orderService.placeOrder({
        items: [{
          product_id: product.id,
          quantity:   1,
          price,
          shop_id:    product.shop?.id,
        }],
        delivery_address: {
          full_name: data.full_name,
          phone:     data.phone,
          address:   data.address,
          city:      data.city,
        },
        payment_method: data.payment_method,
        notes:          data.notes,
      })
      toast.success('Order placed successfully! 🎉')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
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

        <div className="p-5 space-y-5">

          {/* Product preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-700 shrink-0">
              {product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium line-clamp-2">
                {product.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white font-bold text-sm">
                  Rs. {price.toLocaleString()}
                </span>
                {product.discount_price && (
                  <>
                    <span className="text-slate-500 text-xs line-through">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <DiscountBadge
                      price={product.price}
                      discountPrice={product.discount_price}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Order form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-2">
              <Label className="text-slate-200">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                placeholder="Your full name"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register('full_name', { required: 'Name is required' })}
              />
              {errors.full_name && (
                <p className="text-red-400 text-xs">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">
                Phone <span className="text-red-400">*</span>
              </Label>
              <Input
                placeholder="+92 300 1234567"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register('phone', { required: 'Phone is required' })}
              />
              {errors.phone && (
                <p className="text-red-400 text-xs">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">
                Delivery Address <span className="text-red-400">*</span>
              </Label>
              <Input
                placeholder="Street address, area"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register('address', { required: 'Address is required' })}
              />
              {errors.address && (
                <p className="text-red-400 text-xs">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">
                City <span className="text-red-400">*</span>
              </Label>
              <Input
                placeholder="Lahore, Karachi, Islamabad..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register('city', { required: 'City is required' })}
              />
              {errors.city && (
                <p className="text-red-400 text-xs">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">
                Payment Method <span className="text-red-400">*</span>
              </Label>
              <select
                className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                {...register('payment_method', { required: true })}
              >
                <option value="">Select payment method</option>
                <option value="cod">Cash on Delivery</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="jazzcash">JazzCash</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Notes (optional)</Label>
              <Input
                placeholder="Any special instructions..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register('notes')}
              />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
              <span className="text-slate-400 text-sm">Total Amount</span>
              <span className="text-white font-bold">
                Rs. {price.toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Place Order
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}