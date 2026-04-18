'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ShoppingCart, Zap, Heart, Loader2, Store,
  Package, ChevronLeft, Star, CheckCircle,
  Truck, Shield, RotateCcw, Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { wishlistService } from '@/lib/services/wishlist.service'
import { cartService } from '@/lib/services/cart.service'
import api from '@/lib/axios'
import QuickBuyModal from '@/components/store/QuickBuyModal'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'
import StarRating from '@/components/store/StarRating'
import ReviewForm from '@/components/store/ReviewForm'
import { cn } from '@/lib/utils'

export default function ProductPage() {
  const params                              = useParams()
  const { isAuthenticated, user }           = useAuthStore()
  const { productIds, addItem, removeItem } = useWishlistStore()
  const { setCart }                         = useCartStore()

  const [product,        setProduct]        = useState<any>(null)
  const [loading,        setLoading]        = useState(true)
  const [mainImage,      setMainImage]      = useState(0)
  const [quickBuy,       setQuickBuy]       = useState(false)
  const [addingCart,     setAddingCart]     = useState(false)
  const [togglingWish,   setTogglingWish]   = useState(false)
  const [reviews,        setReviews]        = useState<any[]>([])
  const [avgRating,      setAvgRating]      = useState(0)
  const [totalReviews,   setTotalReviews]   = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userReview,     setUserReview]     = useState<any>(null)
  const [deliveredOrder, setDeliveredOrder] = useState<any>(null)

  /* ── all logic completely unchanged ── */
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
      setProduct(data)
    } catch { toast.error('Failed to fetch product') }
    finally { setLoading(false) }
  }

  const fetchReviews = async (pid: string) => {
    try {
      const res = await api.get(`/api/store/reviews/${pid}`)
      setReviews(res.data.reviews ?? [])
      setAvgRating(res.data.average_rating ?? 0)
      setTotalReviews(res.data.total_reviews ?? 0)
      if (isAuthenticated && user?.id) {
        const mine = res.data.reviews?.find((r: any) => r.user_id === user.id)
        if (mine) setUserReview(mine)
        try {
          const ordersRes = await api.get('/api/store/orders')
          const orders    = ordersRes.data.orders ?? []
          const matched   = orders.find((o: any) => {
            if (o.status !== 'delivered') return false
            return (o.order_items ?? []).some((i: any) => i.product_id === pid || i.products?.id === pid)
          })
          if (matched) setDeliveredOrder(matched)
        } catch { /* silent */ }
      }
    } catch { /* silent */ }
  }

  useEffect(() => {
    const pid = params.id as string
    if (!pid) return
    fetchProduct()
    fetchReviews(pid)
  }, [params.id, isAuthenticated])

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Login to add to wishlist'); return }
    setTogglingWish(true)
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(product.id)
        removeItem(product.id); toast.success('Removed from wishlist')
      } else {
        await wishlistService.addToWishlist(product.id)
        addItem(product.id); toast.success('Added to wishlist ❤️')
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
      setCart(data.cart); toast.success('Added to cart 🛒')
    } catch (err: any) { toast.error(err.message) }
    finally { setAddingCart(false) }
  }

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="pp-root pp-loader">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7C3AED' }} />
        <span style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 500 }}>
          Loading product…
        </span>
      </div>
    </>
  )

  if (!product) return (
    <>
      <style>{styles}</style>
      <div className="pp-root pp-loader">
        <Package className="w-12 h-12" style={{ color: '#7C3AED' }} />
        <p style={{ color: '#9CA3AF', fontWeight: 600 }}>Product not found</p>
      </div>
    </>
  )

  const isWishlisted = productIds.has(product.id)
  const displayPrice = product.discount_price ?? product.price
  const shop         = product.shop_products?.[0]?.shops
  const inStock      = product.stock > 0
  const lowStock     = inStock && product.stock <= 5

  // const ratingLabel = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <>
      <style>{styles}</style>

      <div className="pp-root max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* ── Breadcrumb ───────────────────────────── */}
        <div className="pp-fade-up flex items-center gap-2 mb-7 text-xs font-medium" style={{ color: '#7C3AED' }}>
          <Link href="/" className="pp-crumb-link">Home</Link>
          <span>/</span>
          <Link href="/products" className="pp-crumb-link">Products</Link>
          <span>/</span>
          <span className="truncate max-w-[140px]" style={{ color: '#7C3AED' }}>{product.name}</span>
        </div>

        {/* ── Product grid ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">

          {/* ── Images ── */}
          <div className="pp-fade-up space-y-3" style={{ animationDelay: '40ms' }}>

            {/* Main image */}
            <div className="pp-main-img-wrap">
              {product.images?.[mainImage] ? (
                <img
                  src={product.images[mainImage]}
                  alt={product.name}
                  className="pp-main-img w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                  style={{ background: '#F3E8FF' }}>
                  <Package className="w-14 h-14" style={{ color: '#7C3AED' }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D1D5DB' }}>
                    No image
                  </span>
                </div>
              )}

              {/* Discount badge overlay */}
              {product.discount_price && (
                <div className="absolute top-3 left-3 pointer-events-none">
                  <DiscountBadge price={product.price} discountPrice={product.discount_price} />
                </div>
              )}

              {/* Out of stock overlay */}
              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(9,20,19,0.65)', backdropFilter: 'blur(2px)' }}>
                  <span className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide"
                    style={{
                      background: 'rgba(248,113,113,0.15)',
                      border: '1px solid rgba(248,113,113,0.35)',
                      color: '#f87171',
                    }}>
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    className="pp-thumb shrink-0"
                    style={{
                      border: i === mainImage
                        ? '2px solid #7C3AED'
                        : '2px solid rgba(124,58,237,0.15)',
                      boxShadow: i === mainImage ? '0 0 10px rgba(124,58,237,0.3)' : 'none',
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info panel ── */}
          <div className="pp-fade-up space-y-5" style={{ animationDelay: '80ms' }}>

            {/* Shop link */}
            {/* {shop && (
              <Link href={`/shop/${shop.id}`}>
                <div className="pp-shop-row">
                  {shop.logo_url
                    ? <img src={shop.logo_url} alt={shop.name}
                        className="w-6 h-6 rounded-full object-cover"
                        style={{ border: '1px solid rgba(124,58,237,0.25)' }} />
                    : <div className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                        <Store className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />
                      </div>
                  }
                  <span className="pp-shop-name">{shop.name}</span>
                </div>
              </Link>
            )} */}

            {/* Product name */}
            <h1 className="pp-product-title">{product.name}</h1>

            {/* Rating bar */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap">
                <StarRating value={Math.round(avgRating)} readonly size="sm" />
                <span className="font-black text-sm" style={{ color: '#facc15' }}>{avgRating}</span>
                <span className="text-xs" style={{ color: 'rgba(176,228,204,0.38)' }}>
                  ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Price block */}
            <div className="pp-price-block">
              <span className="pp-price">Rs. {displayPrice.toLocaleString()}</span>
              {product.discount_price && (
                <span className="pp-price-original">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="pp-description">{product.description}</p>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0"
                style={{ background: inStock ? '#4ade80' : '#f87171',
                  boxShadow: inStock ? '0 0 6px rgba(74,222,128,0.5)' : '0 0 6px rgba(248,113,113,0.5)' }} />
              <span className="text-sm font-semibold"
                style={{ color: inStock ? '#4ade80' : '#f87171' }}>
                {inStock ? `${product.stock} in stock` : 'Out of stock'}
              </span>
              {lowStock && (
                <span className="pp-low-stock">Only {product.stock} left!</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={handleAddToCart}
                disabled={addingCart || !inStock}
                className="pp-btn-cart flex-1"
              >
                {addingCart
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><ShoppingCart className="w-4 h-4 shrink-0" /> Add to Cart</>
                }
              </button>
              <button
                onClick={() => {
                  if (!isAuthenticated) { toast.error('Login to buy'); return }
                  setQuickBuy(true)
                }}
                disabled={!inStock}
                className="pp-btn-buy flex-1"
              >
                <Zap className="w-4 h-4 shrink-0" /> Quick Buy
              </button>
              <button
                onClick={handleWishlist}
                disabled={togglingWish}
                className="pp-btn-wish"
                style={{
                  background:   isWishlisted ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.1)',
                  borderColor:  isWishlisted ? 'rgba(248,113,113,0.5)' : 'rgba(124,58,237,0.25)',
                  color:        isWishlisted ? '#f87171'                : '#7C3AED',
                }}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
              </button>
            </div>

            {/* Trust strip — safe visual addition */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: Truck,    label: 'Free Delivery' },
                { icon: Shield,   label: 'Secure Buy' },
                { icon: RotateCcw,label: 'Easy Return' },
              ].map(t => (
                <div key={t.label} className="pp-trust-tile">
                  <t.icon className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />
                  <span>{t.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Quick Buy Modal */}
        {quickBuy && (
          <QuickBuyModal
            product={{ ...product, shop }}
            onClose={() => setQuickBuy(false)}
            onSuccess={() => setQuickBuy(false)}
          />
        )}

        {/* ── Reviews section ───────────────────────── */}
        <div className="mt-14 space-y-6">

          {/* Section header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="pp-icon-tile">
                  <Star className="w-3.5 h-3.5" style={{ color: '#fff' }} />
                </div>
                <h2 className="pp-section-title">Customer Reviews</h2>
              </div>
              {avgRating > 0 ? (
                <div className="flex items-center gap-2.5 pl-10 flex-wrap">
                  <StarRating value={Math.round(avgRating)} readonly size="sm" />
                  <span className="font-black text-sm" style={{ color: '#facc15' }}>{avgRating}</span>
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>
                    ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              ) : (
                <p className="text-xs pl-10" style={{ color: '#9CA3AF' }}>
                  No reviews yet — be the first!
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && deliveredOrder && !userReview && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="pp-btn-review"
                >
                  ⭐ Write a Review
                </button>
              )}
              {userReview && (
                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    color: '#7C3AED',
                  }}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  You reviewed this
                </span>
              )}
              {isAuthenticated && !deliveredOrder && !userReview && (
                <span className="text-xs" style={{ color: '#9CA3AF' }}>
                  Purchase &amp; receive to review
                </span>
              )}
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && deliveredOrder && (
            <ReviewForm
              productId={product.id}
              orderId={deliveredOrder.id}
              productName={product.name}
              onSubmitted={() => { setShowReviewForm(false); fetchReviews(product.id) }}
              onCancel={() => setShowReviewForm(false)}
            />
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="pp-empty-reviews">
              <p className="text-3xl">⭐</p>
              <p className="text-sm font-semibold" style={{ color: '#7C3AED', opacity: '50%' }}>
                No reviews yet for this product
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review, idx) => (
                <div
                  key={review.id}
                  className="pp-review-card"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">

                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div className="pp-avatar">
                        {review.profiles?.avatar_url
                          ? <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-white text-sm font-black">
                              {review.profiles?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                            </span>
                        }
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold text-sm leading-tight">
                          {review.profiles?.full_name ?? 'Customer'}
                        </p>
                        <p className="text-xs" style={{ color: '#7C3AED' }}>
                          @{review.profiles?.username ?? '—'}
                        </p>
                      </div>
                    </div>

                    {/* Stars + date */}
                    <div className="text-right shrink-0">
                      <StarRating value={review.rating} readonly size="sm" />
                      <p className="text-[10px] mt-1" style={{ color: '#9CA3AF' }}>
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Review text */}
                  {review.review_text && (
                    <p className="text-sm leading-relaxed mt-3"
                      style={{ color: '#374151' }}>
                      {review.review_text}
                    </p>
                  )}

                  {/* Rating label pill */}
                  {/* <div className="mt-3">
                    <span className="pp-rating-pill"
                      style={{
                        background: review.rating >= 4 ? 'rgba(74,222,128,0.10)'
                          : review.rating === 3 ? 'rgba(250,204,21,0.10)'
                          : 'rgba(248,113,113,0.10)',
                        border: review.rating >= 4 ? '1px solid rgba(74,222,128,0.28)'
                          : review.rating === 3 ? '1px solid rgba(250,204,21,0.28)'
                          : '1px solid rgba(248,113,113,0.28)',
                        color: review.rating >= 4 ? '#4ade80'
                          : review.rating === 3 ? '#facc15'
                          : '#f87171',
                      }}>
                      {ratingLabel[review.rating]}
                    </span>
                  </div> */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;500;600&display=swap');

  .pp-root * { box-sizing: border-box; }
  .pp-root { font-family: 'Open Sans', sans-serif; }

  .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }

  /* ── fade-up ── */
  @keyframes ppFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pp-fade-up { animation: ppFadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }

  /* ── loader ── */
  .pp-loader {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; padding: 8rem 1rem;
  }

  /* ── breadcrumb ── */
  .pp-crumb-link {
    color: #7C3AED; transition: color 0.15s ease;
  }
  .pp-crumb-link:hover { color: #6D28D9; }

  /* ── main image ── */
  .pp-main-img-wrap {
    position: relative; aspect-ratio: 1/1; border-radius: 22px; overflow: hidden;
    background: rgba(243,232,255,0.5);
    border: 1px solid rgba(124,58,237,0.2);
    box-shadow: 0 4px 16px rgba(124,58,237,0.12), 0 2px 8px rgba(124,58,237,0.08);
  }
  .pp-main-img {
    transition: transform 0.5s cubic-bezier(.25,.46,.45,.94);
  }
  .pp-main-img-wrap:hover .pp-main-img { transform: scale(1.04); }

  /* ── thumbnails ── */
  .pp-thumb {
    width: 64px; height: 64px; border-radius: 12px;
    overflow: hidden; transition: all 0.18s ease;
  }
  .pp-thumb:hover { opacity: 0.85; }

  /* ── shop row ── */
  .pp-shop-row {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 5px 12px; border-radius: 99px;
    background: rgba(124,58,237,0.12);
    border: 1px solid rgba(124,58,237,0.25);
    transition: background 0.18s ease;
  }
  .pp-shop-row:hover { background: rgba(124,58,237,0.18); }
  .pp-shop-name {
    font-size: 11px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: #7C3AED;
  }

  /* ── product title ── */
  .pp-product-title {
    margin-top: 30px;
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(1.4rem, 3.5vw, 1.9rem);
    font-weight: 700; color: #1F2937; line-height: 1.15;
  }

  /* ── price ── */
  .pp-price-block { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
  .pp-price {
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    font-weight: 900; color: #7C3AED; line-height: 1;
  }
  .pp-price-original {
    font-size: 1rem; font-weight: 500;
    color: #D1D5DB; text-decoration: line-through; line-height: 1;
  }

  /* ── description ── */
  .pp-description {
    font-size: 0.875rem; line-height: 1.7;
    color: #6B7280;
  }

  /* ── low stock ── */
  .pp-low-stock {
    padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 900;
    background: rgba(251,146,60,0.12); border: 1px solid rgba(251,146,60,0.28);
    color: #fb923c;
    animation: stockBlink 1.6s ease-in-out infinite;
  }
  @keyframes stockBlink { 0%,100%{opacity:1} 50%{opacity:0.5} }

  /* ── action buttons ── */
  .pp-btn-cart {
    height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: rgba(124,58,237,0.12);
    border: 1px solid rgba(124,58,237,0.25);
    color: #7C3AED; font-size: 0.875rem; font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease, transform 0.12s ease;
  }
  .pp-btn-cart:hover:not(:disabled) {
    background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4);
    transform: translateY(-1px);
  }
  .pp-btn-cart:disabled { opacity: 0.40; cursor: not-allowed; }

  .pp-btn-buy {
    height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #7C3AED; color: #fff;
    font-size: 0.875rem; font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    border: none; cursor: pointer;
    box-shadow: 0 6px 20px rgba(124,58,237,0.30);
    transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;
  }
  .pp-btn-buy:hover:not(:disabled) {
    background: #6D28D9; transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(124,58,237,0.40);
  }
  .pp-btn-buy:disabled { opacity: 0.40; cursor: not-allowed; }

  .pp-btn-wish {
    width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid; cursor: pointer; transition: all 0.2s ease;
  }
  .pp-btn-wish:hover { opacity: 0.85; transform: scale(1.04); }
  .pp-btn-wish:disabled { opacity: 0.50; cursor: not-allowed; }

  /* ── trust strip ── */
  .pp-trust-tile {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 10px 8px; border-radius: 14px; text-align: center;
    background: rgba(243,232,255,0.5);
    border: 1px solid rgba(124,58,237,0.15);
    box-shadow: 0 2px 8px rgba(124,58,237,0.08);
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.07em; color: #7C3AED;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .pp-trust-tile:hover { border-color: rgba(124,58,237,0.3); box-shadow: 0 4px 12px rgba(124,58,237,0.12); }

  /* ── section title + icon tile ── */
  .pp-icon-tile {
    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #7C3AED, #6D28D9);
    border: 1px solid rgba(124,58,237,0.35);
  }
  .pp-section-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.2rem; font-weight: 700; color: #1F2937;
  }

  /* ── write review btn ── */
  .pp-btn-review {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 12px;
    background: rgba(124,58,237,0.12);
    border: 1px solid rgba(124,58,237,0.25);
    color: #7C3AED; font-size: 0.8rem; font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer;
    transition: background 0.18s ease;
  }
  .pp-btn-review:hover { background: rgba(124,58,237,0.2); }

  /* ── empty reviews ── */
  .pp-empty-reviews {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px;
    padding: 3rem 1rem; border-radius: 20px; text-align: center;
    background: rgba(243,232,255,0.5);
    border: 1px solid rgba(124,58,237,0.15);
    box-shadow: 0 4px 16px rgba(124,58,237,0.12);
  }

  /* ── review card ── */
  @keyframes ppRevIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pp-review-card {
    padding: 18px 20px; border-radius: 18px;
    background: linear-gradient(145deg, rgba(243,232,255,0.5) 0%, rgba(237,233,254,0.4) 100%);
    border: 1px solid rgba(124,58,237,0.15);
    box-shadow: 0 4px 16px rgba(124,58,237,0.12), 0 2px 8px rgba(124,58,237,0.08);
    animation: ppRevIn 0.38s cubic-bezier(.22,1,.36,1) both;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .pp-review-card:hover { border-color: rgba(124,58,237,0.25); box-shadow: 0 8px 24px rgba(124,58,237,0.16); }

  /* ── reviewer avatar ── */
  .pp-avatar {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
    background: linear-gradient(135deg, #7C3AED, #6D28D9);
    border: 1px solid rgba(124,58,237,0.3);
    color: #fff; font-weight: 900;
  }

  /* ── rating label pill ── */
  .pp-rating-pill {
    display: inline-block; padding: 3px 10px; border-radius: 99px;
    font-size: 11px; font-weight: 800; letter-spacing: 0.04em;
  }
`