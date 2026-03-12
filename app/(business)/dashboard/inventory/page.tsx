'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Filter,
  Loader2, Package,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { productService } from '@/lib/services/product.service'
import { categoryService } from '@/lib/services/category.service'
import ProductCard from '@/components/dashboard/business/inventory/ProductCard'

export default function InventoryPage() {
  const [products,   setProducts]   = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [pagination, setPagination] = useState<any>(null)
  const [page,       setPage]       = useState(1)

  const loadProducts = useCallback(async (
    s = search,
    cat = categoryId,
    p = page,
  ) => {
    setLoading(true)
    try {
      const data = await productService.getProducts({
        search:      s,
        category_id: cat,
        page:        p,
      })
      setProducts(data.products ?? [])
      setPagination(data.pagination)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load categories once
  useEffect(() => {
    categoryService.getCategories().then(d =>
      setCategories(d.categories ?? [])
    )
  }, [])

  // Initial load
  useEffect(() => { loadProducts() }, [])

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      loadProducts(search, categoryId, 1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  // Category filter
  useEffect(() => {
    setPage(1)
    loadProducts(search, categoryId, 1)
  }, [categoryId])

  const handleDelete = (id: string) => {
  toast('Delete this product?', {
    description: 'This action cannot be undone.',
    duration: 10000,
    action: {
      label: 'Yes, Delete',
      onClick: () => {
        // Use void to handle async in sync context
        void deleteProduct(id)
      },
    },
    cancel: {
      label: 'Cancel',
      onClick: () => {},
    },
  })
}

// Separate async function for actual deletion
const deleteProduct = async (id: string) => {
  const toastId = toast.loading('Deleting product...')
  try {
    await productService.deleteProduct(id)
    toast.dismiss(toastId)
    toast.success('Product deleted!')
    loadProducts()
  } catch (err: any) {
    toast.dismiss(toastId)
    toast.error(err.message || 'Failed to delete product')
  }
}

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-slate-400 mt-1">
            {pagination?.total ?? 0} products in your inventory
          </p>
        </div>
        <Link href="/dashboard/inventory/new">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 pl-10"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">No products yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            Add your first product to start selling
          </p>
          <Link href="/dashboard/inventory/new">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add First Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-slate-400 text-sm">
            Page {page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => {
                const p = page - 1
                setPage(p)
                loadProducts(search, categoryId, p)
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === pagination.totalPages}
              onClick={() => {
                const p = page + 1
                setPage(p)
                loadProducts(search, categoryId, p)
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}