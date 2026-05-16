'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Store, Loader2, Package, MapPin, Star, Award, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import StoreProductCard from '@/components/store/ProductCard'
import QuickBuyModal from '@/components/store/QuickBuyModal'

export default function ShopPage() {
  const params                  = useParams()
  const [shop,     setShop]     = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const [quickBuy, setQuickBuy] = useState<any>(null)

  useEffect(() => {
  const fetchShop = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Build query
      let query = supabase
        .from('shops')
        .select(`*, shop_products(
          products(id, name, price, discount_price, images, stock, is_active, categories(id, name))
        )`)
        .eq('id', params.id as string)
        .eq('status', 'live')
      
      // Try to filter by deleted_at if column exists
      // This prevents errors if migration hasn't been run yet
      try {
        query = query.is('deleted_at', null)
      } catch (e) {
        // Column doesn't exist yet, skip this filter
        console.log('deleted_at column not found, skipping filter')
      }
      
      const { data, error } = await query.single()

      if (error) throw error
      setShop(data)
    } catch (err: any) {
      console.error('Error fetching shop:', err)
      setShop(null)
    } finally {
      setLoading(false)
    }
  }

  fetchShop()
}, [params.id])

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="min-h-screen font-body" style={{ background: '#FAF5FF' }}>
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center mb-4 animate-pulse">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-[#7C3AED] opacity-20 animate-ping" />
            </div>
            <p className="text-[#7C3AED] text-sm font-semibold mt-4">Loading shop...</p>
          </div>
        </div>
      </>
    )
  }

  if (!shop) {
    return (
      <>
        <style>{styles}</style>
        <div className="min-h-screen font-body" style={{ background: '#FAF5FF' }}>
          <div className="max-w-4xl mx-auto px-4 py-32">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#EDE9FE] border border-[#C4B5FD]/40 flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-[#7C3AED]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#1e1b4b] mb-2">Shop Not Found</h2>
              <p className="text-[#6b7280] text-sm">The shop you're looking for doesn't exist or is no longer available.</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  const products = shop.shop_products
    ?.map((sp: any) => ({
      ...sp.products,
      shop: { id: shop.id, name: shop.name, logo_url: shop.logo_url },
    }))
    .filter((p: any) => p?.is_active) ?? []

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen font-body" style={{ background: '#FAF5FF' }}>
        
        {/* Hero Banner Section */}
        <div className="relative w-full overflow-hidden">
          {shop.banner_url ? (
            <div className="relative w-full h-64 sm:h-80 md:h-96">
              <img 
                src={shop.banner_url} 
                alt={shop.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b]/80 via-[#1e1b4b]/40 to-transparent" />
            </div>
          ) : (
            <div 
              className="relative w-full h-64 sm:h-80 md:h-96"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)',
              }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-white/30" />
                <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full border-2 border-white/20" />
                <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full border-2 border-white/25" />
              </div>
            </div>
          )}
        </div>

        {/* Shop Info Card - Overlapping Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
          <div className="shop-info-card bg-white rounded-3xl border border-[#C4B5FD]/30 p-6 sm:p-8 shadow-2xl shadow-[#7C3AED]/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              
              {/* Shop Logo */}
              <div className="shop-logo-wrapper shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#EDE9FE] border-4 border-white shadow-xl">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7C3AED] to-[#6D28D9]">
                      <Store className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Shop Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {/* <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#7C3AED]/10 border border-[#7C3AED]/25 text-[#7C3AED]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
                        Live Store
                      </span> */}
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1e1b4b] leading-tight mb-2">
                      {shop.name}
                    </h1>
                    {shop.description && (
                      <p className="text-[#6b7280] text-sm sm:text-base leading-relaxed line-clamp-2">
                        {shop.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shop Stats */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] border border-[#C4B5FD]/40 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div>
                      <p className="text-[#1e1b4b] font-bold text-lg leading-none pb-1.5">{products.length}</p>
                      <p className="text-[#7C3AED] text-xs font-semibold">Products</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] border border-[#C4B5FD]/40 flex items-center justify-center">
                      <Award className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div>
                      <p className="text-[#1e1b4b] font-bold text-lg leading-none pb-1.5">Verified</p>
                      <p className="text-[#7C3AED] text-xs font-semibold">Seller</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          
          {/* Section Header */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED] mb-2 px-3 py-1 rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/10">
              Shop Products
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1e1b4b] leading-tight">
              Available Products
            </h2>
            <p className="text-sm mt-1 text-[#6b7280]">Browse our collection of quality items</p>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-[#C4B5FD]/40 bg-white">
              <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] border border-[#C4B5FD]/40 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[#7C3AED]" />
              </div>
              <p className="text-[#1e1b4b] font-semibold text-lg mb-1">No Products Yet</p>
              <p className="text-[#6b7280] text-sm">This shop hasn't added any products yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {products.map((product: any, idx: number) => (
                <div
                  key={product.id}
                  className="product-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <StoreProductCard product={product} onQuickBuy={setQuickBuy} />
                </div>
              ))}
            </div>
          )}
        </div>

        {quickBuy && (
          <QuickBuyModal product={quickBuy} onClose={() => setQuickBuy(null)} onSuccess={() => setQuickBuy(null)} />
        )}
      </div>
    </>
  )
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
  
  .font-display { font-family: 'Montserrat', sans-serif; }
  .font-body { font-family: 'Open Sans', sans-serif; }

  /* Shop info card hover effect */
  .shop-info-card {
    transition: all 0.3s ease;
  }
  .shop-info-card:hover {
    box-shadow: 0 30px 70px rgba(124,58,237,0.15);
    transform: translateY(-2px);
  }

  /* Logo animation */
  .shop-logo-wrapper {
    animation: logoFloat 3s ease-in-out infinite;
  }
  @keyframes logoFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  /* Product fade in animation */
  @keyframes productFadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .product-fade-in {
    opacity: 0;
    animation: productFadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .shop-info-card {
      padding: 20px !important;
    }
  }
`