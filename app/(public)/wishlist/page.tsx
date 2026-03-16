'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Loader2, ShoppingCart, X, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { wishlistService } from '@/lib/services/wishlist.service'
import { cartService } from '@/lib/services/cart.service'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'

export default function WishlistPage() {
  const { isAuthenticated }   = useAuthStore()
  const { removeItem }        = useWishlistStore()
  const { setCart }           = useCartStore()
  const [items,   setItems]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [moving,  setMoving]  = useState<string | null>(null)

  /* ── all logic completely unchanged ── */
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

  /* ─────────────────────────────────────────────
     NOT LOGGED IN
  ───────────────────────────────────────────── */
  if (!isAuthenticated) return (
    <>
      <style>{sharedStyles}</style>
      <div className="wl-root wl-empty-state">
        <div className="wl-hero-icon">
          <Heart className="w-9 h-9" style={{ color: '#B0E4CC' }} />
        </div>
        <h2 className="wl-empty-title">Login to view your wishlist</h2>
        <p className="wl-empty-sub">Save your favourite products and come back to them anytime</p>
        <Link href="/login">
          <button className="wl-btn-primary" style={{ width: 'auto', padding: '0.75rem 2.2rem' }}>
            Login to Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </>
  )

  /* ─────────────────────────────────────────────
     LOADING
  ───────────────────────────────────────────── */
  if (loading) return (
    <>
      <style>{sharedStyles}</style>
      <div className="wl-root wl-loader">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#408A71' }} />
        <span style={{ color: 'rgba(176,228,204,0.40)', fontSize: '0.85rem', fontWeight: 500 }}>
          Loading wishlist…
        </span>
      </div>
    </>
  )

  /* ─────────────────────────────────────────────
     EMPTY
  ───────────────────────────────────────────── */
  if (items.length === 0) return (
    <>
      <style>{sharedStyles}</style>
      <div className="wl-root wl-empty-state">
        <div className="wl-hero-icon">
          <Heart className="w-9 h-9" style={{ color: '#B0E4CC' }} />
        </div>
        <h2 className="wl-empty-title">No saved items yet</h2>
        <p className="wl-empty-sub">Browse our products and heart the ones you love</p>
        <Link href="/">
          <button className="wl-btn-primary" style={{ width: 'auto', padding: '0.75rem 2.2rem' }}>
            <Sparkles className="w-4 h-4" />
            Discover Products
          </button>
        </Link>
      </div>
    </>
  )

  /* ─────────────────────────────────────────────
     MAIN WISHLIST
  ───────────────────────────────────────────── */
  return (
    <>
      <style>{sharedStyles}</style>

      <div className="wl-root max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Page header */}
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="wl-page-title">My Wishlist</h1>
            <p style={{ color: 'rgba(176,228,204,0.40)', fontSize: '0.85rem', marginTop: '2px' }}>
              {items.length} saved {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Item count badge */}
          <span className="wl-count-badge">
            <Heart className="w-3.5 h-3.5" style={{ fill: 'currentColor' }} />
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item, idx) => {
            const p = item.products
            if (!p) return null
            const price          = p.discount_price ?? p.price
            const isMoving       = moving === item.product_id
            const hasDiscount    = p.discount_price && p.discount_price < p.price

            return (
              <div
                key={item.id}
                className="wl-card group"
                style={{ animationDelay: `${idx * 55}ms` }}
              >
                {/* ── Image zone ── */}
                <div className="relative overflow-hidden wl-img-wrap">

                  {/* Product image */}
                  <Link href={`/product/${p.id}`} className="block w-full h-full">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="wl-img w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: '#162420' }}>
                        <Heart className="w-8 h-8" style={{ color: '#285A48' }} />
                      </div>
                    )}
                  </Link>

                  {/* Hover overlay */}
                  <div className="wl-img-overlay absolute inset-0 pointer-events-none" />

                  {/* Bottom scrim */}
                  <div className="absolute inset-x-0 bottom-0 h-14 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(9,20,19,0.65), transparent)' }} />

                  {/* Discount badge */}
                  {hasDiscount && (
                    <div className="absolute top-2.5 left-2.5 pointer-events-none">
                      <span className="wl-discount-badge">
                        -{Math.round(((p.price - p.discount_price) / p.price) * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Remove button — appears on hover */}
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="wl-remove-btn absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center"
                    aria-label="Remove from wishlist"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Move to cart — slides up on hover */}
                  <div className="wl-cart-bar absolute bottom-0 inset-x-0 p-2">
                    <button
                      onClick={() => handleMoveToCart(item.product_id)}
                      disabled={isMoving}
                      className="wl-move-btn w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide"
                    >
                      {isMoving
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <>
                            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                            Move to Cart
                          </>
                      }
                    </button>
                  </div>
                </div>

                {/* ── Info zone ── */}
                <div className="wl-info p-3 flex flex-col gap-1.5">

                  {/* Shop name */}
                  {p.shop?.id && (
                    <Link href={`/shop/${p.shop.id}`}>
                      <span className="wl-shop-name truncate block"
                        style={{ maxWidth: '100%' }}>
                        {p.shop.name}
                      </span>
                    </Link>
                  )}

                  {/* Product name */}
                  <Link href={`/product/${p.id}`}>
                    <p className="wl-product-name line-clamp-2">{p.name}</p>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
                    <span className="wl-price">Rs. {price.toLocaleString()}</span>
                    {hasDiscount && (
                      <span className="wl-price-original">Rs. {p.price.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Move to cart — always visible on mobile */}
                  <button
                    onClick={() => handleMoveToCart(item.product_id)}
                    disabled={isMoving}
                    className="wl-move-btn-bottom w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all"
                  >
                    {isMoving
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <>
                          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                          Move to Cart
                        </>
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </>
  )
}

/* ── All shared styles ───────────────────────────────────── */
const sharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .wl-root * { box-sizing: border-box; }
  .wl-root, .wl-root a, .wl-root button { cursor: pointer !important; }
  .wl-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── page title ── */
  .wl-page-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    color: #fff;
    line-height: 1.1;
  }

  /* ── count badge ── */
  .wl-count-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 99px;
    background: rgba(40,90,72,0.22);
    border: 1px solid rgba(64,138,113,0.3);
    color: #408A71;
    font-size: 0.78rem; font-weight: 800;
    letter-spacing: 0.03em;
  }

  /* ── empty / auth states ── */
  .wl-empty-state {
    max-width: 26rem; margin: 0 auto;
    padding: 5rem 1rem; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .wl-hero-icon {
    width: 80px; height: 80px; border-radius: 24px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #285A48 0%, #1a3d2e 100%);
    border: 1px solid rgba(64,138,113,0.38);
    box-shadow: 0 10px 30px rgba(9,20,19,0.6), 0 0 0 1px rgba(64,138,113,0.12);
    margin-bottom: 8px;
  }
  .wl-empty-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem; font-weight: 700;
    color: #fff; margin: 0;
  }
  .wl-empty-sub {
    color: rgba(176,228,204,0.42);
    font-size: 0.875rem; line-height: 1.55;
    margin: 0 0 12px;
  }
  .wl-loader {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 12px;
    padding: 8rem 1rem;
  }

  /* ── primary btn ── */
  .wl-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%;
    background: #408A71; color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem; font-weight: 800;
    border: none; border-radius: 14px;
    padding: 0.8rem 1.5rem;
    box-shadow: 0 6px 20px rgba(64,138,113,0.30);
    transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;
  }
  .wl-btn-primary:hover {
    background: #4eaa85;
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(64,138,113,0.38);
  }
  .wl-btn-primary:active { transform: translateY(0); }

  /* ── product card ── */
  @keyframes wlFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .wl-card {
    display: flex; flex-direction: column;
    background: linear-gradient(145deg, rgba(13,28,25,0.95), rgba(10,21,18,0.98));
    border: 1px solid rgba(40,90,72,0.25);
    border-radius: 18px; overflow: hidden;
    opacity: 0;
    animation: wlFadeUp 0.45s cubic-bezier(.22,1,.36,1) both;
    transition: border-color 0.25s ease, transform 0.28s ease, box-shadow 0.28s ease;
  }
  .wl-card:hover {
    border-color: rgba(64,138,113,0.50);
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(9,20,19,0.70), 0 0 0 1px rgba(64,138,113,0.18);
  }

  /* ── image wrap ── */
  .wl-img-wrap { aspect-ratio: 1 / 1; background: #162420; }

  /* ── image zoom ── */
  .wl-img {
    transition: transform 0.5s cubic-bezier(.25,.46,.45,.94);
  }
  .wl-card:hover .wl-img { transform: scale(1.08); }

  /* ── image hover overlay ── */
  .wl-img-overlay {
    background: linear-gradient(to top, rgba(9,20,19,0.70) 0%, rgba(9,20,19,0.10) 45%, transparent 100%);
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .wl-card:hover .wl-img-overlay { opacity: 1; }

  /* ── discount badge ── */
  .wl-discount-badge {
    display: inline-block;
    padding: 2px 8px; border-radius: 8px;
    background: rgba(239,68,68,0.85);
    color: #fff;
    font-size: 10px; font-weight: 900; letter-spacing: 0.05em;
    backdrop-filter: blur(4px);
  }

  /* ── remove button ── */
  .wl-remove-btn {
    background: rgba(9,20,19,0.72);
    border: 1px solid rgba(40,90,72,0.4);
    color: rgba(176,228,204,0.45);
    backdrop-filter: blur(8px);
    opacity: 0; transform: scale(0.8);
    transition: opacity 0.2s ease, transform 0.2s ease,
                background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  }
  .wl-card:hover .wl-remove-btn {
    opacity: 1; transform: scale(1);
  }
  .wl-remove-btn:hover {
    background: rgba(239,68,68,0.22) !important;
    border-color: rgba(239,68,68,0.40) !important;
    color: #f87171 !important;
  }

  /* ── hover cart bar (desktop) ── */
  .wl-cart-bar {
    transform: translateY(110%);
    opacity: 0;
    transition: transform 0.25s cubic-bezier(.22,1,.36,1), opacity 0.2s ease;
  }
  .wl-card:hover .wl-cart-bar {
    transform: translateY(0);
    opacity: 1;
  }
  .wl-move-btn {
    background: rgba(40,90,72,0.85);
    border: 1px solid rgba(64,138,113,0.45);
    color: #B0E4CC;
    backdrop-filter: blur(10px);
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.18s ease, color 0.18s ease;
  }
  .wl-move-btn:hover:not(:disabled) {
    background: #408A71;
    color: #fff;
  }
  .wl-move-btn:disabled { opacity: 0.55; cursor: not-allowed !important; }

  /* ── info zone ── */
  .wl-info { flex: 1; }

  /* ── shop name ── */
  .wl-shop-name {
    display: block;
    font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: #408A71;
    transition: color 0.15s ease;
  }
  .wl-shop-name:hover { color: #B0E4CC; }

  /* ── product name ── */
  .wl-product-name {
    font-size: 0.8rem; font-weight: 600;
    color: rgba(176,228,204,0.75); line-height: 1.4;
    transition: color 0.15s ease;
  }
  .wl-product-name:hover { color: #B0E4CC; }

  /* ── prices ── */
  .wl-price {
    font-size: 0.9rem; font-weight: 900;
    color: #B0E4CC; line-height: 1;
  }
  .wl-price-original {
    font-size: 0.72rem; font-weight: 500;
    color: rgba(176,228,204,0.28);
    text-decoration: line-through; line-height: 1;
  }

  /* ── bottom CTA (always visible — mobile friendly) ── */
  .wl-move-btn-bottom {
    background: rgba(40,90,72,0.20);
    border: 1px solid rgba(40,90,72,0.38);
    color: rgba(176,228,204,0.60);
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  }
  .wl-move-btn-bottom:hover:not(:disabled) {
    background: #408A71;
    border-color: #408A71;
    color: #fff;
  }
  .wl-move-btn-bottom:disabled { opacity: 0.50; cursor: not-allowed !important; }
`