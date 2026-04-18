'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Store, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { shopService } from '@/lib/services/shop.service'
import ShopCard from '@/components/dashboard/business/shops/ShopCard'

const SHOPS_PER_PAGE = 9 // 3 rows × 3 columns

export default function ShopsPage() {
  const [shops,       setShops]       = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const loadShops = async () => {
    try {
      const data = await shopService.getShops()
      setShops(data.shops ?? [])
    } catch {
      toast.error('Failed to load shops')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadShops() }, [])

  // ── Pagination logic ──
  const totalPages   = Math.ceil(shops.length / SHOPS_PER_PAGE)
  const startIndex   = (currentPage - 1) * SHOPS_PER_PAGE
  const endIndex     = startIndex + SHOPS_PER_PAGE
  const currentShops = shops.slice(startIndex, endIndex)

  const handleDelete = (id: string) => {
    toast('Delete this shop?', {
      description: 'All shop data and product assignments will be removed.',
      duration:    10000,
      action: {
        label:   'Yes, Delete',
        onClick: () => void deleteShop(id),
      },
      cancel: {
        label:   'Cancel',
        onClick: () => {},
      },
    })
  }

  const deleteShop = async (id: string) => {
    const toastId = toast.loading('Deleting shop...')
    try {
      await shopService.deleteShop(id)
      toast.dismiss(toastId)
      toast.success('Shop deleted!')
      // If last item on page, go back one page
      const newTotal = shops.length - 1
      const newPages = Math.ceil(newTotal / SHOPS_PER_PAGE)
      if (currentPage > newPages && currentPage > 1) {
        setCurrentPage(p => p - 1)
      }
      loadShops()
    } catch (err: any) {
      toast.dismiss(toastId)
      toast.error(err.message || 'Failed to delete shop')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-open-sans { font-family: 'Open Sans', sans-serif; }
      `}</style>

      <div className="space-y-6 font-open-sans">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-montserrat font-bold" style={{ color: '#1e1b4b' }}>
              My Shops
            </h1>
            <p className="mt-2 text-sm sm:text-base font-open-sans" style={{ color: '#6b7280' }}>
              {shops.length} shop{shops.length !== 1 ? 's' : ''} created
              {totalPages > 1 && (
                <span style={{ color: '#9ca3af' }}>
                  {' '}· Page {currentPage} of {totalPages}
                </span>
              )}
            </p>
          </div>
          <Link href="/dashboard/shops/new">
            <button 
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 font-montserrat text-sm"
              style={{ 
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Shop</span>
              <span className="sm:hidden">Create</span>
            </button>
          </Link>
        </div>

        {/* Shops Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7C3AED' }} />
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed" style={{ borderColor: 'rgba(196, 181, 253, 0.3)', background: 'rgba(124, 58, 237, 0.05)' }}>
            <Store className="w-16 h-16 mx-auto mb-4" style={{ color: '#C4B5FD' }} />
            <p className="text-lg font-semibold font-montserrat" style={{ color: '#1e1b4b' }}>No shops yet</p>
            <p className="text-sm mt-1 mb-6 font-open-sans" style={{ color: '#6b7280' }}>
              Create your first shop to start selling
            </p>
            <Link href="/dashboard/shops/new">
              <button 
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 font-montserrat"
                style={{ 
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                }}
              >
                <Plus className="w-5 h-5" />
                Create First Shop
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Grid — 3 per row, 3 rows = 9 per page */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {currentShops.map(shop => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: 'rgba(196, 181, 253, 0.2)' }}>

                {/* Info */}
                <p className="text-sm font-open-sans" style={{ color: '#6b7280' }}>
                  Showing <span style={{ color: '#1e1b4b', fontWeight: '600' }}>{startIndex + 1}–{Math.min(endIndex, shops.length)}</span> of <span style={{ color: '#1e1b4b', fontWeight: '600' }}>{shops.length}</span> shops
                </p>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">

                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer font-montserrat"
                    style={{
                      background: currentPage === 1 ? 'rgba(196, 181, 253, 0.1)' : 'rgba(124, 58, 237, 0.15)',
                      color: currentPage === 1 ? '#C4B5FD' : '#7C3AED',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      pointerEvents: currentPage === 1 ? 'none' : 'auto'
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer font-montserrat"
                        style={{
                          background: currentPage === page 
                            ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                            : 'rgba(196, 181, 253, 0.1)',
                          color: currentPage === page ? '#ffffff' : '#7C3AED',
                          boxShadow: currentPage === page ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer font-montserrat"
                    style={{
                      background: currentPage === totalPages ? 'rgba(196, 181, 253, 0.1)' : 'rgba(124, 58, 237, 0.15)',
                      color: currentPage === totalPages ? '#C4B5FD' : '#7C3AED',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      pointerEvents: currentPage === totalPages ? 'none' : 'auto'
                    }}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </>
  )
}