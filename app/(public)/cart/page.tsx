'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cartService } from '@/lib/services/cart.service'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import CheckoutForm from '@/components/store/CheckoutForm'
import { cn } from '@/lib/utils'

export default function CartPage() {
  const { isAuthenticated }           = useAuthStore()
  const { items, total, count, setCart } = useCartStore()
  const [loading,      setLoading]    = useState(true)
  const [checkingOut,  setCheckingOut] = useState(false)
  const [updating,     setUpdating]   = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    cartService.getCart()
      .then(data => setCart(data.cart ?? []))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleUpdateQuantity = async (id: string, qty: number) => {
    setUpdating(id)
    try {
      await cartService.updateQuantity(id, qty)
      const data = await cartService.getCart()
      setCart(data.cart ?? [])
    } catch {
      toast.error('Failed to update cart')
    } finally {
      setUpdating(null)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await cartService.removeFromCart(id)
      const data = await cartService.getCart()
      setCart(data.cart ?? [])
      toast.success('Item removed from cart')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-white text-xl font-bold">Your cart is empty</p>
        <p className="text-slate-400 mt-2 mb-6">
          Login to view your cart and start shopping
        </p>
        <Link href="/login">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
            Login to Continue
          </button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-white text-xl font-bold">Your cart is empty</p>
        <p className="text-slate-400 mt-2 mb-6">
          Start adding products to your cart
        </p>
        <Link href="/">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
            Continue Shopping
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">
        My Cart ({count} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const product     = item.products
            const displayPrice = product.discount_price ?? product.price

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl"
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-white font-bold mt-1">
                    Rs. {displayPrice.toLocaleString()}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={updating === item.id}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-white text-sm font-medium w-6 text-center">
                    {updating === item.id
                      ? <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                      : item.quantity
                    }
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={updating === item.id || item.quantity >= product.stock}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-sm">
                    Rs. {(displayPrice * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-400 hover:text-red-300 mt-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Checkout */}
        <div className="space-y-4">

          {/* Order summary */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-white font-semibold">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal ({count} items)</span>
              <span className="text-white">Rs. {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Delivery</span>
              <span className="text-green-400">Free</span>
            </div>
            <div className="border-t border-slate-700 pt-3 flex justify-between">
              <span className="text-white font-semibold">Total</span>
              <span className="text-white font-bold text-lg">
                Rs. {total.toLocaleString()}
              </span>
            </div>
          </div>

          {!checkingOut ? (
            <button
              onClick={() => setCheckingOut(true)}
              className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
            >
              Proceed to Checkout
            </button>
          ) : (
            <CheckoutForm
              items={items}
              total={total}
              onCancel={() => setCheckingOut(false)}
              onSuccess={() => {
                setCheckingOut(false)
                cartService.getCart().then(d => setCart(d.cart ?? []))
              }}
            />
          )}

        </div>
      </div>
    </div>
  )
}