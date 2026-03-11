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
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all group">

      {/* Image */}
      <div className="relative aspect-square bg-slate-800">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-slate-600" />
          </div>
        )}

        {/* Discount badge */}
        {product.discount_price && (
          <div className="absolute top-2 left-2">
            <DiscountBadge
              price={product.price}
              discountPrice={product.discount_price}
            />
          </div>
        )}

        {/* Stock badge */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {/* Action buttons on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link href={`/dashboard/inventory/${product.id}/edit`}>
            <button className="p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors">
              <Edit className="w-4 h-4 text-slate-700" />
            </button>
          </Link>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">

        {/* Category */}
        {product.categories?.name && (
          <span className="text-xs text-slate-500">
            {product.categories.name}
          </span>
        )}

        {/* Name */}
        <p className="text-white text-sm font-medium line-clamp-2 leading-tight">
          {product.name}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2">
          {product.discount_price ? (
            <>
              <span className="text-white font-semibold text-sm">
                Rs. {product.discount_price.toLocaleString()}
              </span>
              <span className="text-slate-500 text-xs line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-white font-semibold text-sm">
              Rs. {product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between">
          <span className={cn(
            'text-xs',
            isOutOfStock ? 'text-red-400'   :
            isLowStock   ? 'text-yellow-400' :
            'text-green-400'
          )}>
            {isOutOfStock
              ? 'Out of stock'
              : isLowStock
              ? `Only ${product.stock} left`
              : `${product.stock} in stock`
            }
          </span>

          {!product.is_active && (
            <Badge className="bg-slate-700 text-slate-400 text-xs">
              Hidden
            </Badge>
          )}
        </div>

      </div>
    </div>
  )
}