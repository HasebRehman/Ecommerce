import Link from 'next/link'
import { Edit, Trash2, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import DiscountBadge from './DiscountBadge'
import { cn } from '@/lib/utils'

interface Product {
  id:             string
  name:           string
  price:          number
  discount_price: number | null
  stock:          number
  images:         string[]
  is_active:      boolean
  categories?:    { name: string } | null
}

interface Props {
  product:   Product
  onDelete:  (id: string) => void
}

export default function ProductCard({ product, onDelete }: Props) {
  const isOutOfStock = product.stock === 0
  const isLowStock   = product.stock > 0 && product.stock <= 5

  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '2px solid rgba(196,181,253,0.3)',
      borderRadius: '20px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(124,58,237,0.15), 0 4px 12px rgba(124,58,237,0.08), 0 2px 6px rgba(0,0,0,0.05)',
      fontFamily: "'Open Sans', sans-serif",
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}
    className="group hover:shadow-[0_12px_35px_rgba(124,58,237,0.25),_0_8px_20px_rgba(124,58,237,0.15),_0_4px_10px_rgba(0,0,0,0.08)] hover:border-[rgba(124,58,237,0.5)] hover:-translate-y-1"
    >

      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE] overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-[#C4B5FD]" />
          </div>
        )}

        {/* Discount badge */}
        {product.discount_price && (
          <div className="absolute top-3 left-3">
            <DiscountBadge
              price={product.price}
              discountPrice={product.discount_price}
            />
          </div>
        )}

        {/* Stock badge */}
        {isOutOfStock && (
          <div className="absolute top-3 right-3">
            <span style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '12px',
              fontWeight: '600',
              fontFamily: "'Montserrat', sans-serif",
              boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
            }}>
              Out of Stock
            </span>
          </div>
        )}

        {/* Action buttons on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          <Link
            href={`/dashboard/inventory/${product.id}/edit`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '2px solid rgba(124,58,237,0.2)',
                borderRadius: '12px',
                padding: '10px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(124,58,237,0.15)'
              }}
              className="hover:border-[#7C3AED] hover:bg-[rgba(124,58,237,0.1)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.25)]"
            >
              <Edit className="w-4 h-4 text-[#7C3AED]" />
            </button>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete(product.id)
            }}
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(239,68,68,0.2)',
              borderRadius: '12px',
              padding: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(239,68,68,0.15)'
            }}
            className="hover:border-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] hover:shadow-[0_8px_25px_rgba(239,68,68,0.25)]"
          >
            <Trash2 className="w-4 h-4 text-[#EF4444]" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">

        {/* Category */}
        {product.categories?.name && (
          <span style={{
            fontSize: '12px',
            color: '#9ca3af',
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {product.categories.name}
          </span>
        )}

        {/* Name */}
        <h3 style={{
          color: '#1e1b4b',
          fontSize: '15px',
          fontWeight: '600',
          fontFamily: "'Montserrat', sans-serif",
          lineHeight: '1.4',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.discount_price ? (
            <>
              <span style={{
                color: '#1e1b4b',
                fontWeight: '700',
                fontSize: '16px',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Rs. {product.discount_price.toLocaleString()}
              </span>
              <span style={{
                color: '#9ca3af',
                fontSize: '13px',
                textDecoration: 'line-through',
                fontFamily: "'Open Sans', sans-serif"
              }}>
                Rs. {product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span style={{
              color: '#1e1b4b',
              fontWeight: '700',
              fontSize: '16px',
              fontFamily: "'Montserrat', sans-serif"
            }}>
              Rs. {product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span style={{
            fontSize: '12px',
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: '500',
            color: isOutOfStock ? '#EF4444' : isLowStock ? '#F59E0B' : '#10B981'
          }}>
            {isOutOfStock
              ? 'Out of stock'
              : isLowStock
              ? `Only ${product.stock} left`
              : `${product.stock} in stock`
            }
          </span>

          {!product.is_active && (
            <span style={{
              background: 'rgba(156,163,175,0.2)',
              color: '#6b7280',
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '8px',
              fontWeight: '500',
              fontFamily: "'Montserrat', sans-serif"
            }}>
              Hidden
            </span>
          )}
        </div>

      </div>
    </div>
  )
}