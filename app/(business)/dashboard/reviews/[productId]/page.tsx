'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Package, Loader2, Star,
  Calendar, Store, Tag,
} from 'lucide-react'
import api from '@/lib/axios'
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
      <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
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
    <div style={{ fontFamily: "'Open Sans', sans-serif", width: '100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');

        .rv-header  { font-family: 'Montserrat', sans-serif; }
        .rv-body    { font-family: 'Open Sans',   sans-serif; }

        .rv-card {
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 20px;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          box-shadow: 0 4px 18px rgba(124,58,237,0.09), 0 1px 4px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        .rv-review-card {
          background: #F3E8FF;
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 18px;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          box-shadow: 0 3px 14px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.03);
          padding: 20px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .rv-review-card:hover {
          border-color: rgba(124,58,237,0.35);
          box-shadow: 0 6px 24px rgba(124,58,237,0.13), 0 2px 8px rgba(0,0,0,0.05);
        }

        .rv-product-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(124,58,237,0.07);
          border: 1px solid rgba(196,181,253,0.4);
          border-radius: 14px;
        }

        .rv-back-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(124,58,237,0.10);
          border: 1.5px solid rgba(196,181,253,0.5);
          color: #7C3AED;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
          flex-shrink: 0;
        }
        .rv-back-btn:hover {
          background: rgba(124,58,237,0.16);
          border-color: rgba(124,58,237,0.45);
        }

        .rv-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
          overflow: hidden;
          box-shadow: 0 3px 10px rgba(124,58,237,0.25);
        }

        .rv-rating-bar-track {
          flex: 1;
          height: 7px;
          background: rgba(196,181,253,0.35);
          border-radius: 999px;
          overflow: hidden;
        }
        .rv-rating-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #7C3AED, #A855F7);
          border-radius: 999px;
          transition: width 0.6s ease;
        }

        /* Responsive grid for summary card */
        .rv-summary-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 640px) {
          .rv-summary-grid {
            grid-template-columns: 1fr;
          }
        }

        .rv-overview-row {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .rv-bars-block {
          min-width: 180px;
          flex: 1;
        }

        @media (max-width: 480px) {
          .rv-review-card { padding: 16px; }
        }
      `}</style>

      <div style={{ width: '100%' }} className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => router.push('/dashboard/reviews')}
            className="rv-back-btn"
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </button>
          <div>
            <h1 className="rv-header text-2xl sm:text-3xl font-bold text-[#1e1b4b]">
              Product Reviews
            </h1>
            <p className="rv-body text-[#6b7280] text-sm mt-0.5">{product?.name}</p>
          </div>
        </div>

        {/* ── Product + Rating Summary ── */}
        <div className="rv-card">
          <div style={{ padding: '20px 22px 16px', borderBottom: '1.5px solid rgba(196,181,253,0.3)' }}>
            <p className="rv-header text-base font-bold text-[#1e1b4b]">Summary</p>
          </div>
          <div style={{ padding: '20px 22px' }}>

            {/* Product info + overview */}
            <div className="rv-summary-grid">

              {/* Left: image + name */}
              <div className="flex items-center gap-4">
                <div style={{
                  width: '72px', height: '72px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: '#DDD6FE',
                  flexShrink: 0,
                  border: '2px solid rgba(196,181,253,0.5)',
                }}>
                  {product?.images?.[0]
                    ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package style={{ width: '28px', height: '28px', color: '#A78BFA' }} />
                      </div>
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="rv-header text-[#1e1b4b] font-bold text-base truncate">{product?.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Tag style={{ width: '13px', height: '13px', color: '#7C3AED', flexShrink: 0 }} />
                    <span className="rv-body text-[#6b7280] text-sm">
                      Rs. {(product?.discount_price ?? product?.price)?.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <Store style={{ width: '13px', height: '13px', color: '#7C3AED', flexShrink: 0 }} />
                    <span className="rv-body text-[#6b7280] text-sm">{shopName}</span>
                  </div>
                </div>
              </div>

              {/* Right: score + bars */}
              <div className="rv-overview-row">

                {/* Big score */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <p className="rv-header font-bold text-[#7C3AED]" style={{ fontSize: '3rem', lineHeight: 1 }}>
                    {average_rating || '—'}
                  </p>
                  <div style={{ marginTop: '6px' }}>
                    <StarRating value={Math.round(average_rating)} readonly size="md" />
                  </div>
                  <p className="rv-body text-[#9ca3af] text-xs mt-1">
                    {total_reviews} review{total_reviews !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Rating bars */}
                <div className="rv-bars-block" style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {ratingCounts.map(({ star, count, pct }) => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="rv-body text-[#6b7280] text-xs" style={{ width: '10px', textAlign: 'right' }}>{star}</span>
                      <Star style={{ width: '12px', height: '12px', color: '#F59E0B', fill: '#F59E0B', flexShrink: 0 }} />
                      <div className="rv-rating-bar-track">
                        <div className="rv-rating-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="rv-body text-[#9ca3af] text-xs" style={{ width: '16px' }}>{count}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews List ── */}
        <div className="space-y-4">
          <p className="rv-header text-[#1e1b4b] font-bold text-lg">
            All Reviews
            <span className="rv-body text-[#9ca3af] font-normal text-sm ml-2">({total_reviews})</span>
          </p>

          {reviews.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: '#EDE9FE',
              border: '1.5px solid rgba(196,181,253,0.5)',
              borderRadius: '20px',
            }}>
              <Star style={{ width: '44px', height: '44px', color: '#C4B5FD', margin: '0 auto 12px' }} />
              <p className="rv-body text-[#6b7280]">No reviews for this product yet</p>
            </div>
          ) : (
            reviews.map((review: any) => (
              <div key={review.id} className="rv-review-card">

                {/* Top row: customer + stars/date */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>

                  {/* Customer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="rv-avatar">
                      {review.profiles?.avatar_url
                        ? <img src={review.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : review.profiles?.full_name?.charAt(0)?.toUpperCase() ?? 'U'
                      }
                    </div>
                    <div>
                      <p className="rv-header text-[#1e1b4b] font-bold text-sm">
                        {review.profiles?.full_name ?? 'Customer'}
                      </p>
                      <p className="rv-body text-[#9ca3af] text-xs mt-0.5">
                        @{review.profiles?.username ?? '—'}
                      </p>
                    </div>
                  </div>

                  {/* Stars + date */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <StarRating value={review.rating} readonly size="sm" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', marginTop: '5px' }}>
                      <Calendar style={{ width: '12px', height: '12px', color: '#A78BFA' }} />
                      <span className="rv-body text-[#9ca3af] text-xs">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="rv-body text-[#c4b5fd] text-xs mt-0.5">
                      {new Date(review.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Product info row */}
                <div className="rv-product-row" style={{ marginBottom: '14px' }}>
                  <div style={{
                    width: '38px', height: '38px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#DDD6FE',
                    flexShrink: 0,
                    border: '1.5px solid rgba(196,181,253,0.5)',
                  }}>
                    {product?.images?.[0]
                      ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package style={{ width: '18px', height: '18px', color: '#A78BFA' }} />
                        </div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="rv-header text-[#1e1b4b] text-sm font-bold truncate">{product?.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', flexWrap: 'wrap' }}>
                      <span className="rv-body text-[#7C3AED] text-xs font-semibold">
                        Rs. {(product?.discount_price ?? product?.price)?.toLocaleString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Store style={{ width: '11px', height: '11px', color: '#A78BFA' }} />
                        <span className="rv-body text-[#9ca3af] text-xs">{shopName}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review text */}
                {review.review_text ? (
                  <p className="rv-body text-[#4c1d95] text-sm leading-relaxed" style={{
                    background: 'rgba(124,58,237,0.06)',
                    border: '1px solid rgba(196,181,253,0.35)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontStyle: 'italic',
                  }}>
                    "{review.review_text}"
                  </p>
                ) : (
                  <p className="rv-body text-[#c4b5fd] text-sm italic">
                    No written review
                  </p>
                )}

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
