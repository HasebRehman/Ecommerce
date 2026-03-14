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
import api from '@/lib/axios'
import QuickBuyModal from '@/components/store/QuickBuyModal'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'
import StarRating from '@/components/store/StarRating'
import ReviewForm from '@/components/store/ReviewForm'
import { cn } from '@/lib/utils'

export default function ProductPage() {
  const params                    = useParams()
  const { isAuthenticated, user } = useAuthStore()
  const { productIds, addItem, removeItem } = useWishlistStore()
  const { setCart }               = useCartStore()

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

  // ── Fetch product ──
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
    } catch (err: any) {
      toast.error('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  // ── Fetch reviews ──
  const fetchReviews = async (pid: string) => {
  try {
    const res = await api.get(`/api/store/reviews/${pid}`)
    setReviews(res.data.reviews          ?? [])
    setAvgRating(res.data.average_rating  ?? 0)
    setTotalReviews(res.data.total_reviews ?? 0)

    if (isAuthenticated && user?.id) {
      // Check if already reviewed
      const mine = res.data.reviews?.find((r: any) => r.user_id === user.id)
      if (mine) setUserReview(mine)

      // Check delivered orders containing this product
      try {
        const ordersRes = await api.get('/api/store/orders')
        const orders    = ordersRes.data.orders ?? []

        const matched = orders.find((o: any) => {
          if (o.status !== 'delivered') return false
          const items = o.order_items ?? []
          return items.some((i: any) =>
            i.product_id === pid || i.products?.id === pid
          )
        })

        if (matched) {
          setDeliveredOrder(matched)
        }
      } catch { /* silent */ }
    }
  } catch { /* silent */ }
}

  // ── Run on mount ──
  useEffect(() => {
    const pid = params.id as string
    if (!pid) return
    fetchProduct()
    fetchReviews(pid)
  }, [params.id, isAuthenticated])

  // ── Handlers ──
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

  // ── Guards ──
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Product Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            {product.images?.[mainImage]
              ? <img src={product.images[mainImage]} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-16 h-16 text-slate-600" />
                </div>
            }
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors',
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

          {/* Shop */}
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

          {/* Avg rating inline */}
          {avgRating > 0 && (
            <div className="flex items-center gap-2">
              <StarRating value={Math.round(avgRating)} readonly size="sm" />
              <span className="text-yellow-400 text-sm font-medium">{avgRating}</span>
              <span className="text-slate-500 text-xs">
                ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-white">
              Rs. {displayPrice.toLocaleString()}
            </span>
            {product.discount_price && (
              <>
                <span className="text-slate-500 text-lg line-through">
                  Rs. {product.price.toLocaleString()}
                </span>
                <DiscountBadge price={product.price} discountPrice={product.discount_price} />
              </>
            )}
          </div>

          {product.description && (
            <p className="text-slate-400 leading-relaxed">{product.description}</p>
          )}

          {/* Stock */}
          <p className="text-sm">
            <span className="text-slate-400">Stock: </span>
            <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingCart || product.stock === 0}
              className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              {addingCart
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
              }
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) { toast.error('Login to buy'); return }
                setQuickBuy(true)
              }}
              disabled={product.stock === 0}
              className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4" /> Quick Buy
            </button>
            <button
              onClick={handleWishlist}
              disabled={togglingWish}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors border',
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

      {/* Quick Buy Modal */}
      {quickBuy && (
        <QuickBuyModal
          product={{ ...product, shop }}
          onClose={() => setQuickBuy(false)}
          onSuccess={() => setQuickBuy(false)}
        />
      )}

      {/* ── Reviews Section ── */}
      <div className="mt-12 space-y-6">

        {/* Reviews Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Customer Reviews</h2>
            <div className="flex items-center gap-3 mt-1">
              {avgRating > 0 ? (
                <>
                  <StarRating value={Math.round(avgRating)} readonly size="sm" />
                  <span className="text-yellow-400 font-bold">{avgRating}</span>
                  <span className="text-slate-500 text-sm">
                    ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                  </span>
                </>
              ) : (
                <span className="text-slate-500 text-sm">
                  No reviews yet — be the first!
                </span>
              )}
            </div>
          </div>

          {/* Write review button */}
          {isAuthenticated && deliveredOrder && !userReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded-xl border border-yellow-500/30 transition-colors"
          >
            ⭐ Write a Review
          </button>
        )}
        {userReview && (
          <span className="text-green-400 text-sm font-medium">
            ✅ You reviewed this product
          </span>
        )}
        {isAuthenticated && !deliveredOrder && !userReview && (
          <span className="text-slate-500 text-xs">
            Purchase & receive this product to leave a review
          </span>
        )}
        </div>

        {/* Review Form */}
        {showReviewForm && deliveredOrder && (
          <ReviewForm
            productId={product.id}
            orderId={deliveredOrder.id}
            productName={product.name}
            onSubmitted={() => {
              setShowReviewForm(false)
              fetchReviews(product.id)
            }}
            onCancel={() => setShowReviewForm(false)}
          />
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-slate-400">No reviews yet for this product</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div
                key={review.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">

                  {/* Customer info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden">
                      {review.profiles?.avatar_url
                        ? <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        : review.profiles?.full_name?.charAt(0)?.toUpperCase() ?? 'U'
                      }
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {review.profiles?.full_name ?? 'Customer'}
                      </p>
                      <p className="text-slate-500 text-xs">
                        @{review.profiles?.username ?? '—'}
                      </p>
                    </div>
                  </div>

                  {/* Stars + date */}
                  <div className="text-right shrink-0">
                    <StarRating value={review.rating} readonly size="sm" />
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Review text */}
                {review.review_text && (
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {review.review_text}
                  </p>
                )}

                {/* Rating badge */}
                <span className={cn(
                  'inline-block text-xs font-medium px-2.5 py-1 rounded-full',
                  review.rating >= 4 ? 'bg-green-500/10 text-green-400' :
                  review.rating === 3 ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                )}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][review.rating]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}