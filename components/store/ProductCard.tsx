'use client'

import { useState } from 'react'
import { Heart, ShoppingCart, Zap, Store, PackageX } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { wishlistService } from '@/lib/services/wishlist.service'
import { cartService } from '@/lib/services/cart.service'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'
import Link from 'next/link'

interface Product {
  id:             string
  name:           string
  price:          number
  discount_price: number | null
  images:         string[]
  stock:          number
  shop:           { id: string; name: string; logo_url: string | null }
  categories?:    { name: string } | null
}

interface Props {
  product:      Product
  onQuickBuy?:  (product: Product) => void
}

export default function StoreProductCard({ product, onQuickBuy }: Props) {
  const { isAuthenticated }                = useAuthStore()
  const { productIds, addItem, removeItem } = useWishlistStore()
  const { setCart }                        = useCartStore()

  const [addingCart,   setAddingCart]   = useState(false)
  const [togglingWish, setTogglingWish] = useState(false)

  const isWishlisted  = productIds.has(product.id)
  const isOutOfStock  = (product.stock ?? 0) <= 0
  const displayPrice  = product.discount_price ?? product.price

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Login to add to wishlist')
      return
    }
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to update wishlist')
    } finally {
      setTogglingWish(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Login to add to cart')
      return
    }
    setAddingCart(true)
    try {
      await cartService.addToCart(product.id)
      const cartData = await cartService.getCart()
      setCart(cartData.cart)
      toast.success('Added to cart 🛒')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add to cart')
    } finally {
      setAddingCart(false)
    }
  }

  const handleQuickBuy = () => {
    if (isOutOfStock) return
    if (!isAuthenticated) {
      toast.error('Login to buy')
      return
    }
    onQuickBuy?.(product)
  }

  return (
    <div className={cn(
      'bg-slate-900 border rounded-xl overflow-hidden transition-all group',
      isOutOfStock
        ? 'border-slate-800 opacity-80'
        : 'border-slate-800 hover:border-slate-700'
    )}>

      {/* Image */}
      <div className="relative aspect-square bg-slate-800 overflow-hidden">
        <Link href={`/product/${product.id}`}>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className={cn(
                'w-full h-full object-cover transition-transform duration-300',
                isOutOfStock ? 'grayscale-[30%]' : 'group-hover:scale-105'
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-12 h-12 text-slate-600" />
            </div>
          )}
        </Link>

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
            <PackageX className="w-3 h-3" />
            Out of Stock
          </div>
        )}

        {/* Discount Badge — only if in stock */}
        {!isOutOfStock && product.discount_price && (
          <div className="absolute top-2 left-2">
            <DiscountBadge
              price={product.price}
              discountPrice={product.discount_price}
            />
          </div>
        )}

        {/* Wishlist button — always visible for out of stock */}
        <button
          onClick={handleWishlist}
          disabled={togglingWish}
          className={cn(
            'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all',
            isWishlisted
              ? 'bg-red-500 text-white'
              : isOutOfStock
                ? 'bg-slate-900/80 text-slate-400 hover:text-red-400 opacity-100'
                : 'bg-slate-900/80 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100'
          )}
        >
          <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
        </button>

        {/* Hover Actions */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 p-2 flex gap-2 transition-transform duration-200',
          isOutOfStock
            ? 'translate-y-0'
            : 'translate-y-full group-hover:translate-y-0'
        )}>
          {/* Add to Cart — always allowed */}
          <button
            onClick={handleAddToCart}
            disabled={addingCart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900/95 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {addingCart ? 'Adding...' : 'Add to Cart'}
          </button>

          {/* Quick Buy — disabled if out of stock */}
          <button
            onClick={handleQuickBuy}
            disabled={isOutOfStock}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors',
              isOutOfStock
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Unavailable' : 'Quick Buy'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">

        {/* Shop name */}
        {product.shop?.id && (
          <Link href={`/shop/${product.shop.id}`}>
            <div className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              {product.shop?.logo_url ? (
                <img
                  src={product.shop.logo_url}
                  alt={product.shop.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <Store className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="text-slate-500 text-xs truncate">
                {product.shop?.name}
              </span>
            </div>
          </Link>
        )}

        {/* Name */}
        <Link href={`/product/${product.id}`}>
          <p className="text-white text-sm font-medium line-clamp-2 leading-tight hover:text-blue-400 transition-colors">
            {product.name}
          </p>
        </Link>

        {/* Price */}
        {isOutOfStock ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium text-sm line-through">
              Rs. {displayPrice.toLocaleString()}
            </span>
            <span className="text-red-400 text-xs font-medium">Unavailable</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-sm">
              Rs. {displayPrice.toLocaleString()}
            </span>
            {product.discount_price && (
              <span className="text-slate-500 text-xs line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Stock indicator — low stock warning */}
        {!isOutOfStock && product.stock <= 5 && (
          <p className="text-orange-400 text-xs font-medium">
            Only {product.stock} left!
          </p>
        )}

      </div>
    </div>
  )
}