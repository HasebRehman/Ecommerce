'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Package, Check, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { productService } from '@/lib/services/product.service'
import { shopService } from '@/lib/services/shop.service'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'
import { cn } from '@/lib/utils'

interface Props {
  shopId:           string
  initialProductIds: string[]
}

export default function ShopProductsManager({
  shopId,
  initialProductIds,
}: Props) {
  const [allProducts,      setAllProducts]      = useState<any[]>([])
  const [selectedIds,      setSelectedIds]      = useState<Set<string>>(
    new Set(initialProductIds)
  )
  const [loading,          setLoading]          = useState(true)
  const [saving,           setSaving]           = useState(false)
  const [hasChanges,       setHasChanges]       = useState(false)

  useEffect(() => {
    productService.getProducts({ page: 1 })
      .then(data => setAllProducts(data.products ?? []))
      .finally(() => setLoading(false))
  }, [])

  const toggleProduct = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await shopService.updateShopProducts(
        shopId,
        Array.from(selectedIds)
      )
      toast.success('Shop products updated!')
      setHasChanges(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update products')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    )
  }

  if (allProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-white font-medium">No products in inventory</p>
        <p className="text-slate-400 text-sm mt-1">
          Add products to your inventory first
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-medium">
            Select Products for This Shop
          </p>
          <p className="text-slate-400 text-sm">
            {selectedIds.size} of {allProducts.length} products selected
          </p>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Selection
              </>
            )}
          </Button>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {allProducts.map(product => {
          const isSelected   = selectedIds.has(product.id)
          const isOutOfStock = product.stock === 0

          return (
            <div
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={cn(
                'relative rounded-xl border-2 cursor-pointer transition-all overflow-hidden',
                isSelected
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-900'
              )}
            >
              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              {/* Image */}
              <div className="aspect-square bg-slate-800 relative">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-600" />
                  </div>
                )}

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xs font-medium bg-red-500 px-2 py-1 rounded">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5 space-y-1">
                <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                  {product.name}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {product.discount_price ? (
                    <>
                      <span className="text-white text-xs font-semibold">
                        Rs. {product.discount_price.toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-xs line-through">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      <DiscountBadge
                        price={product.price}
                        discountPrice={product.discount_price}
                      />
                    </>
                  ) : (
                    <span className="text-white text-xs font-semibold">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}