'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Package, Check, Loader2, Save, Grid3x3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { productService } from '@/lib/services/product.service'
import { shopService } from '@/lib/services/shop.service'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'
import { cn } from '@/lib/utils'

interface Props {
  shopId: string
}

export default function ShopProductsManager({ shopId }: Props) {
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading,          setLoading]          = useState(true)
  const [saving,           setSaving]           = useState(false)
  const [hasChanges,       setHasChanges]       = useState(false)

  useEffect(() => {
    Promise.all([
      productService.getProducts({ page: 1 }),
      shopService.getShopProducts(shopId),
    ]).then(([productsData, shopProductsData]) => {
      setAllProducts(productsData.products ?? [])
      const existingIds = (shopProductsData.products ?? []).map((sp: any) => sp.product_id)
      setSelectedIds(new Set(existingIds))
    }).finally(() => setLoading(false))
  }, [shopId])

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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    )
  }

  if (allProducts.length === 0) {
    return (
      <div className="text-center py-20 rounded-20 bg-white border border-[#E5E7EB] shadow-sm">
        <Package className="w-16 h-16 text-[#C4B5FD] mx-auto mb-4" />
        <p className="font-bold text-[#1e1b4b] text-lg">No products in inventory</p>
        <p className="text-[#6b7280] text-sm mt-2">
          Add products to your inventory first
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        
        .spm-header { font-family: 'Montserrat', sans-serif; }
        .spm-body { font-family: 'Open Sans', sans-serif; }
        
        .spm-card {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(196,181,253,0.4);
          border-radius: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
          overflow: hidden;
        }
        .spm-card:hover {
          border-color: rgba(124,58,237,0.6);
          box-shadow: 0 8px 32px rgba(124,58,237,0.15);
          transform: translateY(-2px);
        }
        .spm-card.selected {
          border-color: #7C3AED;
          background: rgba(124,58,237,0.05);
          box-shadow: 0 8px 32px rgba(124,58,237,0.2);
        }
        
        .spm-btn-save {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          border: none;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          border-radius: 12px;
          padding: 12px 24px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(124,58,237,0.3);
          cursor: pointer;
        }
        .spm-btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124,58,237,0.4);
        }
        .spm-btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white rounded-16 border border-[#E5E7EB] p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Grid3x3 className="w-5 h-5 text-[#7C3AED]" />
              <h2 className="spm-header text-xl sm:text-2xl font-bold text-[#1e1b4b]">
                Select Products
              </h2>
            </div>
            <p className="spm-body text-[#6b7280] text-sm">
              <span className="font-semibold text-[#7C3AED]">{selectedIds.size}</span> of <span className="font-semibold text-[#7C3AED]">{allProducts.length}</span> products selected
            </p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="spm-btn-save flex items-center gap-2 text-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Selection
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {allProducts.map(product => {
          const isSelected   = selectedIds.has(product.id)
          const isOutOfStock = product.stock === 0

          return (
            <div
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={cn(
                'spm-card relative',
                isSelected && 'spm-card.selected'
              )}
            >
              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-7 h-7 bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE] relative overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-[#C4B5FD]" />
                  </div>
                )}

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white text-xs font-bold bg-[#dc2626] px-3 py-1.5 rounded-8">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <p className="spm-header text-[#1e1b4b] text-xs font-bold line-clamp-2 leading-tight">
                  {product.name}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {product.discount_price ? (
                    <>
                      <span className="spm-body text-[#1e1b4b] text-xs font-bold">
                        Rs. {product.discount_price.toLocaleString()}
                      </span>
                      <span className="spm-body text-[#9ca3af] text-xs line-through">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      <DiscountBadge
                        price={product.price}
                        discountPrice={product.discount_price}
                      />
                    </>
                  ) : (
                    <span className="spm-body text-[#1e1b4b] text-xs font-bold">
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