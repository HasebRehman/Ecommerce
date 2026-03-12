'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Loader2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { wishlistService } from '@/lib/services/wishlist.service'
import { cartService } from '@/lib/services/cart.service'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'

export default function WishlistPage() {
  const { isAuthenticated }         = useAuthStore()
  const { removeItem }              = useWishlistStore()
  const { setCart }                 = useCartStore()
  const [items,   setItems]         = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [moving,  setMoving]        = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    wishlistService.getWishlist()
      .then(data => setItems(data.wishlist ?? []))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleRemove = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId)
      removeItem(productId)
      setItems(prev => prev.filter(i => i.product_id !== productId))
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const handleMoveToCart = async (productId: string) => {
    setMoving(productId)
    try {
      await cartService.addToCart(productId)
      await wishlistService.removeFromWishlist(productId)
      removeItem(productId)
      setItems(prev => prev.filter(i => i.product_id !== productId))
      const cartData = await cartService.getCart()
      setCart(cartData.cart ?? [])
      toast.success('Moved to cart!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to move to cart')
    } finally {
      setMoving(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-white text-xl font-bold">Your wishlist is empty</p>
        <p className="text-slate-400 mt-2 mb-6">Login to save your favourite products</p>
        <Link href="/login">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium">
            Login
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">
        My Wishlist ({items.length} items)
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">No saved items</p>
          <Link href="/">
            <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
              Discover Products
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map(item => {
            const p = item.products
            if (!p) return null
            const price = p.discount_price ?? p.price

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group"
              >
                <div className="relative aspect-square bg-slate-800">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {p.name}
                  </p>
                  <p className="text-white font-bold text-sm">
                    Rs. {price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleMoveToCart(item.product_id)}
                    disabled={moving === item.product_id}
                    className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {moving === item.product_id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <><ShoppingCart className="w-3 h-3" /> Move to Cart</>
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}