'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Package, Loader2, Star,
  User, Calendar, Store, Tag,
} from 'lucide-react'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'
import StarRating from '@/components/store/StarRating'

export default function ProductReviewsPage() {
  const params              = useParams()
  const router              = useRouter()
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const id = params?.productId as string

  useEffect(() => {
    if (!id) return
    api.get(`/api/business/reviews/${id}`)
      .then(res => setData(res.data))
      .catch(() => router.push('/dashboard/reviews'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  )

  if (!data) return null

  const { reviews, average_rating, total_reviews, product } = data

  const ratingCounts = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    pct:   total_reviews ? (reviews.filter((r: any) => r.rating === star).length / total_reviews) * 100 : 0,
  }))

  const shopName = product?.shop_name ?? '—'

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/reviews')}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Product Reviews</h1>
          <p className="text-slate-500 text-sm mt-0.5">{product?.name}</p>
        </div>
      </div>

      {/* Product + Rating Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-start gap-5 flex-wrap">

          {/* Product info */}
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0">
            {product?.images?.[0]
              ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-600" />
                </div>
            }
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-white font-bold text-lg">{product?.name}</p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Tag className="w-3.5 h-3.5" />
              Rs. {(product?.discount_price ?? product?.price)?.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Store className="w-3.5 h-3.5" />
              {shopName}
            </div>
          </div>

          {/* Rating overview */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <p className="text-yellow-400 text-4xl font-bold">{average_rating || '—'}</p>
            <StarRating value={Math.round(average_rating)} readonly size="md" />
            <p className="text-slate-500 text-xs">{total_reviews} review{total_reviews !== 1 ? 's' : ''}</p>
          </div>

          {/* Rating bars */}
          <div className="w-full md:w-48 space-y-1.5">
            {ratingCounts.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-slate-400 text-xs w-3">{star}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-slate-500 text-xs w-4">{count}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <p className="text-white font-semibold">
          All Reviews ({total_reviews})
        </p>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No reviews for this product yet</p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">

              {/* Top row */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                {/* Customer */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                    {review.profiles?.avatar_url
                      ? <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      : review.profiles?.full_name?.charAt(0)?.toUpperCase() ?? 'U'
                    }
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {review.profiles?.full_name ?? 'Customer'}
                    </p>
                    <p className="text-slate-500 text-xs">
                      @{review.profiles?.username ?? '—'}
                    </p>
                  </div>
                </div>

                {/* Stars + date */}
                <div className="text-right">
                  <StarRating value={review.rating} readonly size="sm" />
                  <div className="flex items-center gap-1.5 justify-end mt-1">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    <p className="text-slate-500 text-xs">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {new Date(review.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Product info row */}
              <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-700 shrink-0">
                  {product?.images?.[0]
                    ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    : <Package className="w-5 h-5 text-slate-500 m-auto mt-2.5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{product?.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-slate-400 text-xs">
                      Rs. {(product?.discount_price ?? product?.price)?.toLocaleString()}
                    </span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      {shopName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review text */}
              {review.review_text ? (
                <p className="text-slate-300 text-sm leading-relaxed">
                  "{review.review_text}"
                </p>
              ) : (
                <p className="text-slate-600 text-sm italic">No written review</p>
              )}

              {/* Rating badge */}
              <span className={cn(
                'inline-block text-xs font-semibold px-3 py-1 rounded-full',
                review.rating >= 4 ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                review.rating === 3 ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                'bg-red-500/15 text-red-400 border border-red-500/20'
              )}>
                {'⭐'.repeat(review.rating)} {['','Poor','Fair','Good','Very Good','Excellent'][review.rating]}
              </span>

            </div>
          ))
        )}
      </div>

    </div>
  )
}