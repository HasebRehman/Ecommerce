'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Filter,
  Loader2, Package, Grid3X3, List,
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
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: '',
    productName: ''
  })
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      productId: id,
      productName: name
    })
  }

  const confirmDelete = async () => {
    if (!deleteModal.productId) return
    
    setIsDeleting(true)
    try {
      await productService.deleteProduct(deleteModal.productId)
      toast.success('Product deleted successfully!')
      loadProducts()
      setDeleteModal({ isOpen: false, productId: '', productName: '' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, productId: '', productName: '' })
  }

  return (
    <div style={{ 
      // background: '#ffffff', 
      fontFamily: "'Open Sans', sans-serif", 
      minHeight: 'calc(100vh - 120px)',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        .inv-header { font-family: 'Montserrat', sans-serif; }
        .inv-body { font-family: 'Open Sans', sans-serif; }
        
        .inv-search-container {
          position: relative;
          flex: 1;
          min-width: 280px;
          max-width: 400px;
        }
        
        .inv-search-input {
          width: 100%;
          padding: 12px 16px 12px 8px;
          border: 2px solid rgba(196,181,253,0.3);
          border-radius: 16px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #1e1b4b;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(124,58,237,0.08);
        }
        
        .inv-search-input:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 8px 25px rgba(124,58,237,0.15), 0 0 0 4px rgba(124,58,237,0.1);
        }
        
        .inv-search-input::placeholder {
          color: #9ca3af;
        }
        
        .inv-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          transition: color 0.3s ease;
        }
        
        .inv-search-container:focus-within .inv-search-icon {
          color: #7C3AED;
        }
        
        .inv-select {
          padding: 12px 16px;
          border: 2px solid rgba(196,181,253,0.3);
          border-radius: 16px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #1e1b4b;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(124,58,237,0.08);
          cursor: pointer;
          min-width: 160px;
        }
        
        .inv-select:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 8px 25px rgba(124,58,237,0.15), 0 0 0 4px rgba(124,58,237,0.1);
        }
        
        .inv-btn-primary {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 16px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(124,58,237,0.25), 0 4px 12px rgba(124,58,237,0.15);
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        
        .inv-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(124,58,237,0.35), 0 8px 20px rgba(124,58,237,0.25);
        }
        
        .inv-btn-secondary {
          background: rgba(124,58,237,0.1);
          color: #7C3AED;
          border: 2px solid rgba(124,58,237,0.2);
          padding: 10px 20px;
          border-radius: 12px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .inv-btn-secondary:hover {
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.4);
        }
        
        .inv-btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .inv-empty-state {
          text-align: center;
          padding: 80px 20px;
          background: linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%);
          border-radius: 24px;
          border: 2px solid rgba(196,181,253,0.3);
        }
        
        .inv-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        @media (max-width: 768px) {
          .inv-pagination {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
        }
        
        .delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .delete-modal {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid rgba(196,181,253,0.3);
          border-radius: 20px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(124,58,237,0.25), 0 10px 25px rgba(124,58,237,0.15);
          animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .delete-modal-title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 20px;
          color: #1e1b4b;
          margin-bottom: 12px;
          text-align: center;
        }
        
        .delete-modal-text {
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        
        .delete-modal-product {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          color: #7C3AED;
        }
        
        .delete-modal-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        
        .delete-btn-cancel {
          background: rgba(124,58,237,0.1);
          color: #7C3AED;
          border: 2px solid rgba(124,58,237,0.2);
          padding: 12px 24px;
          border-radius: 12px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 100px;
        }
        
        .delete-btn-cancel:hover {
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.4);
        }
        
        .delete-btn-confirm {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(239,68,68,0.25);
          min-width: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .delete-btn-confirm:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(239,68,68,0.35);
        }
        
        .delete-btn-confirm:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <div className="space-y-8" style={{ 
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        marginTop: '24px'
      }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="inv-header text-3xl sm:text-4xl font-bold text-[#1e1b4b] mb-2">
              Inventory
            </h1>
            <p className="inv-body text-[#6b7280] text-base">
              {pagination?.total ?? 0} products in your inventory
            </p>
          </div>
          <Link href="/dashboard/inventory/new">
            <button className="inv-btn-primary">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">

          {/* Search */}
          <div className="inv-search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="inv-search-input"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="inv-select"
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
            <Loader2 className="w-10 h-10 animate-spin text-[#7C3AED]" />
          </div>
        ) : products.length === 0 ? (
          <div className="inv-empty-state">
            <Package className="w-20 h-20 text-[#C4B5FD] mx-auto mb-6" />
            <h3 className="inv-header text-2xl font-bold text-[#1e1b4b] mb-2">No products yet</h3>
            <p className="inv-body text-[#6b7280] text-base mb-8 max-w-md mx-auto">
              Add your first product to start selling and managing your inventory
            </p>
            <div className="flex justify-center">
              <Link href="/dashboard/inventory/new">
                <button className="inv-btn-primary">
                  <Plus className="w-5 h-5" />
                  Add First Product
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={(id) => handleDelete(id, product.name)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="inv-pagination">
            <p className="inv-body text-[#6b7280] text-sm">
              Page {page} of {pagination.totalPages}
            </p>
            <div className="flex gap-3">
              <button
                disabled={page === 1}
                onClick={() => {
                  const p = page - 1
                  setPage(p)
                  loadProducts(search, categoryId, p)
                }}
                className="inv-btn-secondary"
              >
                Previous
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => {
                  const p = page + 1
                  setPage(p)
                  loadProducts(search, categoryId, p)
                }}
                className="inv-btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-modal-title">Delete Product</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete{' '}
              <span className="delete-modal-product">"{deleteModal.productName}"</span>?
              <br />
              This action cannot be undone.
            </p>
            <div className="delete-modal-buttons">
              <button
                onClick={cancelDelete}
                className="delete-btn-cancel"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="delete-btn-confirm"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}