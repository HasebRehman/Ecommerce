'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Package, Loader2, ChevronRight, MessageSquare } from 'lucide-react'
import api from '@/lib/axios'
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

  const totalReviews  = products.reduce((s, p) => s + p.total_reviews, 0)
  const overallRating = products.length
    ? (products.reduce((s, p) => s + p.avg_rating, 0) / products.length).toFixed(1)
    : null

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", width: '100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');

        .rv-header  { font-family: 'Montserrat', sans-serif; }
        .rv-body    { font-family: 'Open Sans',   sans-serif; }

        .rv-stat-card {
          background: #EDE9FE;
          border: 2px solid rgba(196,181,253,0.5);
          border-radius: 20px;
          padding: 20px 24px;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 4px 18px rgba(124,58,237,0.09), 0 2px 6px rgba(0,0,0,0.04);
        }
        .rv-stat-card:hover {
          border-color: rgba(124,58,237,0.4);
          box-shadow: 0 8px 28px rgba(124,58,237,0.14);
        }

        .rv-product-card {
          background: #EDE9FE;
          border: 2px solid rgba(196,181,253,0.5);
          border-radius: 20px;
          padding: 18px 20px;
          cursor: pointer;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
          box-shadow: 0 4px 18px rgba(124,58,237,0.09), 0 2px 6px rgba(0,0,0,0.04);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .rv-product-card:hover {
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 8px 28px rgba(124,58,237,0.16);
          transform: translateZ(0) translateY(-2px);
        }

        .rv-empty {
          background: #EDE9FE;
          border: 2px dashed rgba(196,181,253,0.6);
          border-radius: 24px;
          padding: 64px 24px;
          text-align: center;
        }

        .rv-bar-track {
          flex: 1;
          height: 6px;
          background: rgba(196,181,253,0.3);
          border-radius: 999px;
          overflow: hidden;
        }
        .rv-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #7C3AED, #6D28D9);
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        @media (max-width: 640px) {
          .rv-product-card { flex-wrap: wrap; gap: 12px; }
          .rv-dist-preview  { display: none !important; }
        }
      `}</style>

      {/* Page title */}
      <div style={{ marginBottom: '28px', marginTop: '8px' }}>
        <h1 className="rv-header" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#1e1b4b', marginBottom: '6px' }}>
          Reviews
        </h1>
        <p className="rv-body" style={{ color: '#6b7280', fontSize: '15px' }}>
          See what customers say about your products
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 style={{ width: '36px', height: '36px', color: '#7C3AED' }} className="animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Stats row ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {/* Total Products */}
            <div className="rv-stat-card">
              <p className="rv-body" style={{ fontSize: '12px', fontWeight: 600, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Total Products Reviewed
              </p>
              <p className="rv-header" style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b', lineHeight: 1 }}>
                {products.length}
              </p>
            </div>

            {/* Total Reviews */}
            <div className="rv-stat-card">
              <p className="rv-body" style={{ fontSize: '12px', fontWeight: 600, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Total Reviews
              </p>
              <p className="rv-header" style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b', lineHeight: 1 }}>
                {totalReviews}
              </p>
            </div>

            {/* Overall Rating */}
            <div className="rv-stat-card">
              <p className="rv-body" style={{ fontSize: '12px', fontWeight: 600, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Overall Rating
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p className="rv-header" style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b', lineHeight: 1 }}>
                  {overallRating ?? '—'}
                </p>
                {overallRating && (
                  <Star style={{ width: '22px', height: '22px', color: '#F59E0B', fill: '#F59E0B' }} />
                )}
              </div>
            </div>
          </div>

          {/* ── Products list ── */}
          {products.length === 0 ? (
            <div className="rv-empty">
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'rgba(124,58,237,0.1)', border: '2px solid rgba(196,181,253,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <MessageSquare style={{ width: '32px', height: '32px', color: '#C4B5FD' }} />
              </div>
              <p className="rv-header" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e1b4b', marginBottom: '6px' }}>
                No reviews yet
              </p>
              <p className="rv-body" style={{ color: '#9ca3af', fontSize: '14px' }}>
                Reviews from customers will appear here
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {products.map((p: any) => (
                <div
                  key={p.product?.id}
                  className="rv-product-card"
                  onClick={() => router.push(`/dashboard/reviews/${p.product?.id}`)}
                >
                  {/* Product image */}
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '14px',
                    overflow: 'hidden', background: '#DDD6FE',
                    border: '2px solid rgba(196,181,253,0.5)', flexShrink: 0,
                  }}>
                    {p.product?.images?.[0]
                      ? <img src={p.product.images[0]} alt={p.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package style={{ width: '24px', height: '24px', color: '#A78BFA' }} />
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="rv-header" style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.product?.name}
                    </p>
                    <p className="rv-body" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: 600, marginBottom: '6px' }}>
                      Rs. {(p.product?.discount_price ?? p.product?.price)?.toLocaleString()}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <StarRating value={Math.round(p.avg_rating)} readonly size="sm" />
                      <span className="rv-header" style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>
                        {p.avg_rating}
                      </span>
                      <span className="rv-body" style={{ fontSize: '12px', color: '#9ca3af' }}>
                        ({p.total_reviews} review{p.total_reviews !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>

                  {/* Rating distribution bars */}
                  <div className="rv-dist-preview" style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
                    {[5,4,3,2,1].map(star => {
                      const count = p.reviews.filter((r: any) => r.rating === star).length
                      const pct   = p.total_reviews ? (count / p.total_reviews) * 100 : 0
                      return (
                        <div key={star} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '6px', height: '40px', background: 'rgba(196,181,253,0.3)', borderRadius: '999px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <div style={{
                              width: '100%',
                              height: `${pct}%`,
                              background: 'linear-gradient(180deg, #7C3AED, #6D28D9)',
                              borderRadius: '999px',
                              transition: 'height 0.4s ease',
                            }} />
                          </div>
                          <span className="rv-body" style={{ fontSize: '10px', color: '#9ca3af' }}>{star}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Arrow */}
                  <ChevronRight style={{ width: '20px', height: '20px', color: '#C4B5FD', flexShrink: 0, transition: 'color 0.2s' }} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
