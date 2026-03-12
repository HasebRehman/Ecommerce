'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, ShoppingBag, SlidersHorizontal } from 'lucide-react'
import { storeService } from '@/lib/services/store.service'
import { categoryService } from '@/lib/services/category.service'
import StoreProductCard from '@/components/store/ProductCard'
import QuickBuyModal from '@/components/store/QuickBuyModal'
import { toast } from 'sonner'

export default function AllProductsPage() {
  const [products,    setProducts]    = useState<any[]>([])
  const [categories,  setCategories]  = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [categoryId,  setCategoryId]  = useState('')
  const [quickBuy,    setQuickBuy]    = useState<any>(null)
  const [pagination,  setPagination]  = useState({
    total: 0, page: 1, totalPages: 1,
  })

  const loadProducts = useCallback(async (s = '', cat = '', page = 1) => {
    setLoading(true)
    try {
      const data = await storeService.getProducts({
        search:      s,
        category_id: cat,
        page,
      })
      setProducts(data.products ?? [])
      setPagination(data.pagination ?? { total: 0, page: 1, totalPages: 1 })
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
    const t = setTimeout(() => loadProducts(search, categoryId, 1), 400)
    return () => clearTimeout(t)
  }, [search, categoryId])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">All Products</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pagination.total} products available
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-64 h-10 pl-4 pr-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setCategoryId('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
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
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              categoryId === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(product => (
            <StoreProductCard
              key={product.id}
              product={product}
              onQuickBuy={setQuickBuy}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => loadProducts(search, categoryId, p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                p === pagination.page
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
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