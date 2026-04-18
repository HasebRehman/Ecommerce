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
  const { isAuthenticated }                 = useAuthStore()
  const { productIds, addItem, removeItem } = useWishlistStore()
  const { setCart }                         = useCartStore()

  const [addingCart,   setAddingCart]   = useState(false)
  const [togglingWish, setTogglingWish] = useState(false)

  const isWishlisted = productIds.has(product.id)
  const isOutOfStock = (product.stock ?? 0) <= 0
  const displayPrice = product.discount_price ?? product.price

  /* ── handlers — completely unchanged ── */
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to update wishlist')
    } finally {
      setTogglingWish(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Login to add to cart'); return }
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
    if (!isAuthenticated) { toast.error('Login to buy'); return }
    onQuickBuy?.(product)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .pc-root * { box-sizing: border-box; }
        .pc-root, .pc-root button, .pc-root a { cursor: pointer !important; }
        .pc-root { font-family: 'Inter', sans-serif; }

        /* ── card lift on hover ── */
        .pc-card {
          transition: transform 0.32s cubic-bezier(.22,1,.36,1),
                      box-shadow 0.32s cubic-bezier(.22,1,.36,1),
                      border-color 0.25s ease;
        }
        .pc-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(124,58,237,0.12), 0 0 0 1px rgba(124,58,237,0.25);
        }

        /* ── image zoom ── */
        .pc-img {
          transition: transform 0.55s cubic-bezier(.25,.46,.45,.94);
        }
        .pc-card:hover .pc-img {
          transform: scale(1.09);
        }

        /* ── overlay fades in ── */
        .pc-overlay {
          opacity: 0;
          transition: opacity 0.28s ease;
        }
        .pc-card:hover .pc-overlay {
          opacity: 1;
        }

        /* ── action panel slides up ── */
        .pc-actions {
          transform: translateY(110%);
          opacity: 0;
          transition: transform 0.28s cubic-bezier(.22,1,.36,1),
                      opacity  0.22s ease;
        }
        .pc-card:hover .pc-actions {
          transform: translateY(0);
          opacity: 1;
        }
        .pc-actions-always {
          transform: translateY(0) !important;
          opacity: 1 !important;
        }

        /* ── wishlist always visible on hover ── */
        .pc-wish {
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
        }
        .pc-card:hover .pc-wish,
        .pc-wish-active {
          opacity: 1 !important;
          transform: scale(1) !important;
        }

        /* ── heart burst ── */
        @keyframes heartBurst {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.55); }
          60%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .heart-burst { animation: heartBurst 0.38s cubic-bezier(.36,.07,.19,.97); }

        /* ── stock pulse ── */
        @keyframes stockBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.45; }
        }
        .stock-blink { animation: stockBlink 1.6s ease-in-out infinite; }

        /* ── shimmer on card border when wishlisted ── */
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%      { box-shadow: 0 0 12px 2px rgba(239,68,68,0.25); }
        }
        .pc-wishlisted-glow { animation: borderGlow 2s ease-in-out infinite; }

        /* ── button press ── */
        .pc-btn:active { transform: scale(0.95); }
        .pc-btn { transition: background 0.18s ease, transform 0.12s ease, opacity 0.18s ease; }
      `}</style>

      <div className={cn(
        'pc-root pc-card group relative flex flex-col rounded-2xl overflow-hidden',
        'border',
        isOutOfStock
          ? 'bg-[#0a1512] border-[#7C3AED]/15 opacity-70'
          : isWishlisted
            ? 'bg-white border-red-500/30 pc-wishlisted-glow'
            : 'bg-white border-[#C4B5FD]/30'
      )}>

        {/* ╔══════════════════════════════════════════╗
            ║  IMAGE ZONE                              ║
            ╚══════════════════════════════════════════╝ */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '1 / 1' }}>

          {/* Image */}
          <Link href={`/product/${product.id}`} className="block w-full h-full">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className={cn(
                  'pc-img w-full h-full object-cover',
                  isOutOfStock && 'grayscale-[50%] brightness-75'
                )}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#EDE9FE]">
                <Store className="w-10 h-10 text-[#7C3AED]" />
                <span className="text-[#7C3AED] text-[10px] font-bold uppercase tracking-widest">No Image</span>
              </div>
            )}
          </Link>

          {/* Dark overlay on hover for contrast */}
          <div
            className="pc-overlay absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(237,233,254,0.85) 0%, rgba(237,233,254,0.15) 55%, transparent 100%)' }}
          />

          {/* Permanent soft bottom scrim */}
          <div
            className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(237,233,254,0.5), transparent)' }}
          />

          {/* ── Category chip (top-left when no badge) ── */}
          {product.categories?.name && !product.discount_price && !isOutOfStock && (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#7C3AED]/80 backdrop-blur-sm border border-[#7C3AED]/30 text-[#7C3AED] text-[9px] font-black uppercase tracking-widest pointer-events-none">
              {product.categories.name}
            </div>
          )}

          {/* ── Out of stock badge ── */}
          {isOutOfStock && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF5FF]/85 backdrop-blur-md border border-red-500/30 text-red-400 text-[10px] font-black tracking-wide shadow-lg pointer-events-none">
              <PackageX className="w-3 h-3 shrink-0" />
              Out of Stock
            </div>
          )}

          {/* ── Discount badge ── */}
          {!isOutOfStock && product.discount_price && (
            <div className="absolute top-2.5 left-2.5 pointer-events-none">
              <DiscountBadge price={product.price} discountPrice={product.discount_price} />
            </div>
          )}

          {/* ── Wishlist button ── */}
          <button
            onClick={handleWishlist}
            disabled={togglingWish}
            className={cn(
              'pc-wish absolute top-2.5 right-2.5 z-10',
              'w-9 h-9 rounded-xl flex items-center justify-center',
              'backdrop-blur-md border shadow-lg',
              togglingWish && 'opacity-50 pointer-events-none',
              isWishlisted
                ? 'pc-wish-active bg-red-500 border-red-400/60 text-white heart-burst'
                : 'bg-[#FAF5FF]/75 border-[#7C3AED]/50 text-[#6b7280] hover:bg-red-500/15 hover:border-red-500/50 hover:text-red-400'
            )}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn('w-4 h-4 transition-all', isWishlisted && 'fill-current scale-110')} />
          </button>

          {/* ── Action bar slides up on hover ── */}
          <div className={cn(
            'pc-actions absolute bottom-0 inset-x-0 z-10 p-2.5 flex gap-2',
            isOutOfStock && 'pc-actions-always'
          )}>
            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={addingCart}
              className={cn(
                'pc-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl',
                'text-[11px] font-black tracking-wide uppercase',
                'bg-[#7C3AED] hover:bg-[#7C3AED] text-white hover:text-white',
                'border border-[#7C3AED]/30 hover:border-[#7C3AED]/60',
                'shadow-lg backdrop-blur-sm',
                addingCart && 'opacity-50'
              )}
            >
              <ShoppingCart className={cn('w-3.5 h-3.5 shrink-0', addingCart && 'animate-spin')} />
              {addingCart ? 'Adding…' : 'Cart'}
            </button>

            {/* Quick Buy */}
            <button
              onClick={handleQuickBuy}
              disabled={isOutOfStock}
              className={cn(
                'pc-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl',
                'text-[11px] font-black tracking-wide uppercase',
                'shadow-lg backdrop-blur-sm border',
                isOutOfStock
                  ? 'bg-[#EDE9FE]/80 border-[#7C3AED]/20 text-[#d1d5db] cursor-not-allowed'
                  : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-[#7C3AED]/50 hover:border-transparent'
              )}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              {isOutOfStock ? 'N/A' : 'Buy Now'}
            </button>
          </div>
        </div>

        {/* ╔══════════════════════════════════════════╗
            ║  INFO ZONE                               ║
            ╚══════════════════════════════════════════╝ */}
        <div className="flex flex-col gap-2 p-3 flex-1">

          {/* Shop row */}
          {product.shop?.id && (
            <Link href={`/shop/${product.shop.id}`}>
              <div className="flex items-center gap-1.5 w-fit group/shop">
                {/* Shop logo or fallback */}
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-[#7C3AED]/30 shrink-0 bg-[#EDE9FE]">
                  {product.shop?.logo_url ? (
                    <img
                      src={product.shop.logo_url}
                      alt={product.shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-2.5 h-2.5 text-[#7C3AED]" />
                    </div>
                  )}
                </div>
                <span className="text-[#7C3AED] group-hover/shop:text-[#6D28D9] text-[10px] font-bold uppercase tracking-widest truncate max-w-[110px] transition-colors">
                  {product.shop?.name}
                </span>
              </div>
            </Link>
          )}

          {/* Product name */}
          <Link href={`/product/${product.id}`}>
            <p className={cn(
              'text-sm font-semibold line-clamp-2 leading-snug transition-colors duration-200',
              isOutOfStock
                ? 'text-[#9ca3af]'
                : 'text-[#374151] hover:text-[#7C3AED]'
            )}>
              {product.name}
            </p>
          </Link>

          {/* ── Price block ── */}
          <div className="mt-auto pt-1.5 flex items-end justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              {isOutOfStock ? (
                <>
                  <span className="text-[#d1d5db] font-black text-base line-through leading-none">
                    Rs. {displayPrice.toLocaleString()}
                  </span>
                  <span className="text-red-400 text-[9px] font-black uppercase tracking-widest">
                    Unavailable
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[#1e1b4b] font-black text-base leading-none">
                    Rs. {displayPrice.toLocaleString()}
                  </span>
                  {product.discount_price && (
                    <span className="text-[#9ca3af] text-[11px] line-through leading-none">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Low stock pill (right-aligned) */}
            {!isOutOfStock && product.stock > 0 && product.stock <= 5 && (
              <span className="stock-blink shrink-0 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-400 text-[9px] font-black uppercase tracking-wide whitespace-nowrap">
                {product.stock} left
              </span>
            )}
          </div>

          {/* ── Bottom CTA strip (always visible — great for mobile) ── */}
          <button
            onClick={handleAddToCart}
            disabled={addingCart || isOutOfStock}
            className={cn(
              'pc-btn w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl',
              'text-[11px] font-black uppercase tracking-wide border transition-all',
              isOutOfStock
                ? 'bg-[#EDE9FE]/60 border-[#7C3AED]/15 text-[#e5e7eb] cursor-not-allowed'
                : 'bg-[#7C3AED]/20 hover:bg-[#7C3AED] border-[#7C3AED]/40 hover:border-[#7C3AED] text-[#4b5563] hover:text-white',
              addingCart && 'opacity-50'
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            {isOutOfStock ? 'Out of Stock' : addingCart ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>

      </div>
    </>
  )
}
