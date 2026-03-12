'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, ShoppingBag } from 'lucide-react'
import { storeService } from '@/lib/services/store.service'
import { categoryService } from '@/lib/services/category.service'
import StoreProductCard from '@/components/store/ProductCard'
import QuickBuyModal from '@/components/store/QuickBuyModal'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export default function LandingPage() {
  const { isAuthenticated }       = useAuthStore()
  const [products,   setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading,    setLoading]  = useState(true)
  const [search,     setSearch]   = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [quickBuyProduct, setQuickBuyProduct] = useState<any>(null)

  const loadProducts = useCallback(async (s = '', cat = '') => {
    setLoading(true)
    try {
      const data = await storeService.getProducts({
        search:      s,
        category_id: cat,
      })
      setProducts(data.products ?? [])
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
    categoryService.getCategories()
      .then(d => setCategories(d.categories ?? []))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadProducts(search, categoryId), 400)
    return () => clearTimeout(t)
  }, [search, categoryId])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-8 md:p-12">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Shop Everything<br />
            <span className="text-blue-200">You Love</span>
          </h1>
          <p className="text-blue-200 mt-3 text-lg max-w-md">
            Discover products from local retailers — clothing, pets, electronics and more.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">
                {products.length}+ Products
              </span>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-blue-400/10 rounded-full translate-y-1/2" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setCategoryId('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            categoryId === ''
              ? 'bg-blue-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              categoryId === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">No products found</p>
          <p className="text-slate-400 text-sm mt-1">
            Try a different search or category
          </p>
        </div>
      ) : (
        <>
          <p className="text-slate-400 text-sm">
            Showing {products.length} products
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(product => (
              <StoreProductCard
                key={product.id}
                product={product}
                onQuickBuy={setQuickBuyProduct}
              />
            ))}
          </div>
        </>
      )}

      {/* Quick Buy Modal */}
      {quickBuyProduct && (
        <QuickBuyModal
          product={quickBuyProduct}
          onClose={() => setQuickBuyProduct(null)}
          onSuccess={() => setQuickBuyProduct(null)}
        />
      )}

    </div>
  )
}