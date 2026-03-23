'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Store, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { shopService } from '@/lib/services/shop.service'
import ShopCard from '@/components/dashboard/business/shops/ShopCard'

const SHOPS_PER_PAGE = 6 // 2 rows × 3 columns

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
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Shops</h1>
          <p className="text-slate-400 mt-1">
            {shops.length} shop{shops.length !== 1 ? 's' : ''} created
            {totalPages > 1 && (
              <span className="text-slate-500">
                {' '}· Page {currentPage} of {totalPages}
              </span>
            )}
          </p>
        </div>
        <Link href="/dashboard/shops/new">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Shop
          </Button>
        </Link>
      </div>

      {/* Shops Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-20">
          <Store className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">No shops yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            Create your first shop to start selling
          </p>
          <Link href="/dashboard/shops/new">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create First Shop
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Grid — 3 per row, 2 rows = 6 per page */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            <div className="flex items-center justify-between pt-2">

              {/* Info */}
              <p className="text-slate-500 text-sm">
                Showing {startIndex + 1}–{Math.min(endIndex, shops.length)} of {shops.length} shops
              </p>

              {/* Controls */}
              <div className="flex items-center gap-2">

                {/* Prev */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white text-sm rounded-lg transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white text-sm rounded-lg transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  )
}