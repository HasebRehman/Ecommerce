'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Store, Loader2, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import StoreProductCard from '@/components/store/ProductCard'
import QuickBuyModal from '@/components/store/QuickBuyModal'

export default function ShopPage() {
  const params              = useParams()
  const [shop,    setShop]  = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quickBuy, setQuickBuy] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('shops')
      .select(`
        *,
        shop_products(
          products(
            id, name, price, discount_price,
            images, stock, is_active,
            categories(id, name)
          )
        )
      `)
      .eq('id', params.id as string)
      .eq('status', 'live')
      .single()
      .then(({ data }) => setShop(data))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="text-center py-20">
        <Store className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-white text-lg font-medium">Shop not found</p>
      </div>
    )
  }

  const products = shop.shop_products
    ?.map((sp: any) => ({ ...sp.products, shop: { id: shop.id, name: shop.name, logo_url: shop.logo_url } }))
    .filter((p: any) => p?.is_active) ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* Banner */}
      {shop.banner_url && (
        <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-800">
          <img src={shop.banner_url} alt={shop.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Shop info */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
          {shop.logo_url
            ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 text-slate-500" /></div>
          }
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{shop.name}</h1>
          {shop.description && <p className="text-slate-400 text-sm mt-1">{shop.description}</p>}
          <p className="text-slate-500 text-xs mt-1">{products.length} products</p>
        </div>
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No products in this shop yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product: any) => (
            <StoreProductCard key={product.id} product={product} onQuickBuy={setQuickBuy} />
          ))}
        </div>
      )}

      {quickBuy && (
        <QuickBuyModal
          product={quickBuy}
          onClose={() => setQuickBuy(null)}
          onSuccess={() => setQuickBuy(null)}
        />
      )}
    </div>
  )
}