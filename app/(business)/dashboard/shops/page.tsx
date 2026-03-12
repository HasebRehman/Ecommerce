'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Store, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { shopService } from '@/lib/services/shop.service'
import ShopCard from '@/components/dashboard/business/shops/ShopCard'

export default function ShopsPage() {
  const [shops,   setShops]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleDelete = (id: string) => {
    toast('Delete this shop?', {
      description: 'All shop data and product assignments will be removed.',
      duration: 10000,
      action: {
        label: 'Yes, Delete',
        onClick: () => void deleteShop(id),
      },
      cancel: {
        label: 'Cancel',
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shops.map(shop => (
            <ShopCard
              key={shop.id}
              shop={shop}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  )
}