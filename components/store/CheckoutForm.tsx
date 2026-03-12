'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { orderService } from '@/lib/services/order.service'

interface FormData {
  full_name:      string
  phone:          string
  address:        string
  city:           string
  payment_method: string
  notes:          string
}

interface Props {
  items:     any[]
  total:     number
  onCancel:  () => void
  onSuccess: () => void
}

export default function CheckoutForm({
  items, total, onCancel, onSuccess,
}: Props) {
  const [loading,  setLoading]  = useState(false)
  const [ordered,  setOrdered]  = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const orderItems = items.map(item => ({
        product_id: item.products.id,
        quantity:   item.quantity,
        price:      item.products.discount_price ?? item.products.price,
        shop_id:    item.products.shops?.shop_products?.[0]?.shops?.id ?? null,
      }))

      await orderService.placeOrder({
        items:            orderItems,
        delivery_address: {
          full_name: data.full_name,
          phone:     data.phone,
          address:   data.address,
          city:      data.city,
        },
        payment_method: data.payment_method,
        notes:          data.notes,
      })

      setOrdered(true)
      toast.success('Order placed successfully! 🎉')
      setTimeout(() => {
        onSuccess()
      }, 2000)

    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (ordered) {
    return (
      <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <p className="text-white font-semibold">Order Placed!</p>
        <p className="text-slate-400 text-sm mt-1">
          We'll contact you soon to confirm delivery
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
      <h3 className="text-white font-semibold">Delivery Details</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Full Name *</Label>
          <Input
            placeholder="Your full name"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
            {...register('full_name', { required: true })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Phone *</Label>
          <Input
            placeholder="+92 300 1234567"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
            {...register('phone', { required: true })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Address *</Label>
          <Input
            placeholder="Street address"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
            {...register('address', { required: true })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">City *</Label>
          <Input
            placeholder="City"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
            {...register('city', { required: true })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Payment Method *</Label>
          <select
            className="w-full h-9 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            {...register('payment_method', { required: true })}
          >
            <option value="">Select method</option>
            <option value="cod">Cash on Delivery</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="easypaisa">EasyPaisa</option>
            <option value="jazzcash">JazzCash</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Notes (optional)</Label>
          <Input
            placeholder="Special instructions..."
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
            {...register('notes')}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : `Place Order • Rs. ${total.toLocaleString()}`
            }
          </button>
        </div>

      </form>
    </div>
  )
}