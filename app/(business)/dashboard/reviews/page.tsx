'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Package, Loader2, ChevronRight } from 'lucide-react'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'
import StarRating from '@/components/store/StarRating'

export default function SellerReviewsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/api/business/reviews')
      .then(res => setProducts(res.data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-slate-400 mt-1">See what customers say about your products</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Total Products Reviewed</p>
          <p className="text-white text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Total Reviews</p>
          <p className="text-white text-2xl font-bold">
            {products.reduce((s, p) => s + p.total_reviews, 0)}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Overall Rating</p>
          <div className="flex items-center gap-2">
            <p className="text-yellow-400 text-2xl font-bold">
              {products.length
                ? (products.reduce((s, p) => s + p.avg_rating, 0) / products.length).toFixed(1)
                : '—'
              }
            </p>
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      </div>

      {/* Products with Reviews */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">No reviews yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Reviews from customers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p: any) => (
            <div
              key={p.product?.id}
              onClick={() => router.push(`/dashboard/reviews/${p.product?.id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all group flex items-center gap-4"
            >
              {/* Product Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                {p.product?.images?.[0]
                  ? <img src={p.product.images[0]} alt={p.product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-600" />
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{p.product?.name}</p>
                <p className="text-slate-400 text-sm mt-0.5">
                  Rs. {(p.product?.discount_price ?? p.product?.price)?.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StarRating value={Math.round(p.avg_rating)} readonly size="sm" />
                  <span className="text-yellow-400 text-sm font-medium">{p.avg_rating}</span>
                  <span className="text-slate-500 text-xs">
                    ({p.total_reviews} review{p.total_reviews !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {/* Rating distribution preview */}
              <div className="hidden md:flex items-center gap-1 shrink-0">
                {[5,4,3,2,1].map(star => {
                  const count   = p.reviews.filter((r: any) => r.rating === star).length
                  const pct     = p.total_reviews ? (count / p.total_reviews) * 100 : 0
                  return (
                    <div key={star} className="flex flex-col items-center gap-1">
                      <div className="w-1.5 bg-slate-700 rounded-full h-8 overflow-hidden">
                        <div
                          className="w-full bg-yellow-400 rounded-full transition-all"
                          style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                        />
                      </div>
                      <span className="text-slate-600 text-xs">{star}</span>
                    </div>
                  )
                })}
              </div>

              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}