'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Edit, ArrowLeft, Package } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { productService } from '@/lib/services/product.service'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const params              = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    productService
      .getProduct(params.id as string)
      .then(data => setProduct(data.product))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Product not found</p>
      </div>
    )
  }

  const isOutOfStock = product.stock === 0
  const isLowStock   = product.stock > 0 && product.stock <= 5

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/inventory">
            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-white truncate">
            {product.name}
          </h1>
        </div>
        <Link href={`/dashboard/inventory/${product.id}/edit`}>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-slate-800">
            {product.images[activeImg] ? (
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-slate-600" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img: string, i: number) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    activeImg === i
                      ? 'border-blue-500'
                      : 'border-slate-700 hover:border-slate-500'
                  )}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">

          {product.categories?.name && (
            <Badge className="bg-slate-700 text-slate-300">
              {product.categories.name}
            </Badge>
          )}

          <h2 className="text-2xl font-bold text-white">{product.name}</h2>

          {/* Price */}
          <div className="flex items-center gap-3">
            {product.discount_price ? (
              <>
                <span className="text-2xl font-bold text-white">
                  Rs. {product.discount_price.toLocaleString()}
                </span>
                <span className="text-slate-500 line-through">
                  Rs. {product.price.toLocaleString()}
                </span>
                <DiscountBadge
                  price={product.price}
                  discountPrice={product.discount_price}
                />
              </>
            ) : (
              <span className="text-2xl font-bold text-white">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
            isOutOfStock
              ? 'bg-red-500/10 text-red-400'
              : isLowStock
              ? 'bg-yellow-500/10 text-yellow-400'
              : 'bg-green-500/10 text-green-400'
          )}>
            <span className={cn(
              'w-2 h-2 rounded-full',
              isOutOfStock ? 'bg-red-400'    :
              isLowStock   ? 'bg-yellow-400' :
              'bg-green-400'
            )} />
            {isOutOfStock
              ? 'Out of Stock'
              : `${product.stock} in stock`
            }
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">
                Description
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="text-slate-500 text-xs">SKU: {product.sku}</p>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <p className="text-slate-400 text-sm font-medium mb-2">Sizes</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-slate-800 text-white text-sm rounded-lg"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div>
              <p className="text-slate-400 text-sm font-medium mb-2">Colors</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c: string) => (
                  <span
                    key={c}
                    className="px-3 py-1 bg-slate-800 text-white text-sm rounded-lg"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}