'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ShoppingCart, Zap, Heart, Loader2, Store } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { wishlistService } from '@/lib/services/wishlist.service'
import { cartService } from '@/lib/services/cart.service'
import QuickBuyModal from '@/components/store/QuickBuyModal'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'
import { cn } from '@/lib/utils'

export default function ProductPage() {
  const params              = useParams()
  const { isAuthenticated } = useAuthStore()
  const { productIds, addItem, removeItem } = useWishlistStore()
  const { setCart }         = useCartStore()

  const [product,      setProduct]      = useState<any>(null)
  const [loading,      setLoading]      = useState(true)
  const [mainImage,    setMainImage]    = useState(0)
  const [quickBuy,     setQuickBuy]     = useState(false)
  const [addingCart,   setAddingCart]   = useState(false)
  const [togglingWish, setTogglingWish] = useState(false)

  const fetchProduct = async () => {
  setLoading(true)
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select(`*, categories(id, name), shop_products(shops(id, name, logo_url))`)
      .eq('id', params.id as string)
      .single()

    if (error) throw error
    setProduct(data)   // ✅ Correct state setter
  } catch (err: any) {
    console.error(err)
    toast.error('Failed to fetch product')
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  fetchProduct()
}, [params.id])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  )

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-slate-400">Product not found</p>
    </div>
  )

  const isWishlisted = productIds.has(product.id)
  const displayPrice = product.discount_price ?? product.price
  const shop         = product.shop_products?.[0]?.shops

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Login to add to wishlist'); return }
    setTogglingWish(true)
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(product.id)
        removeItem(product.id)
        toast.success('Removed from wishlist')
      } else {
        await wishlistService.addToWishlist(product.id)
        addItem(product.id)
        toast.success('Added to wishlist ❤️')
      }
    } catch (err: any) { toast.error(err.message) }
    finally { setTogglingWish(false) }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Login to add to cart'); return }
    setAddingCart(true)
    try {
      await cartService.addToCart(product.id)
      const data = await cartService.getCart()
      setCart(data.cart)
      toast.success('Added to cart 🛒')
    } catch (err: any) { toast.error(err.message) }
    finally { setAddingCart(false) }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            {product.images?.[mainImage]
              ? <img src={product.images[mainImage]} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><ShoppingCart className="w-16 h-16 text-slate-600" /></div>
            }
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={cn('w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors',
                    i === mainImage ? 'border-blue-500' : 'border-slate-700'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {shop && (
            <Link href={`/shop/${shop.id}`}>
              <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {shop.logo_url
                  ? <img src={shop.logo_url} alt={shop.name} className="w-6 h-6 rounded-full object-cover" />
                  : <Store className="w-4 h-4 text-slate-500" />
                }
                <span className="text-slate-400 text-sm">{shop.name}</span>
              </div>
            </Link>
          )}

          <h1 className="text-2xl font-bold text-white">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-white">Rs. {displayPrice.toLocaleString()}</span>
            {product.discount_price && (
              <>
                <span className="text-slate-500 text-lg line-through">Rs. {product.price.toLocaleString()}</span>
                <DiscountBadge price={product.price} discountPrice={product.discount_price} />
              </>
            )}
          </div>

          {product.description && (
            <p className="text-slate-400 leading-relaxed">{product.description}</p>
          )}

          <p className="text-sm">
            <span className="text-slate-400">Stock: </span>
            <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingCart || product.stock === 0}
              className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              {addingCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
            </button>
            <button
              onClick={() => { if (!isAuthenticated) { toast.error('Login to buy'); return } setQuickBuy(true) }}
              disabled={product.stock === 0}
              className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4" /> Quick Buy
            </button>
            <button
              onClick={handleWishlist}
              disabled={togglingWish}
              className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-colors border',
                isWishlisted
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400'
              )}
            >
              <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
            </button>
          </div>
        </div>
      </div>

      {quickBuy && (
        <QuickBuyModal
          product={{ ...product, shop }}
          onClose={() => setQuickBuy(false)}
          onSuccess={() => setQuickBuy(false)}
        />
      )}
    </div>
  )
}