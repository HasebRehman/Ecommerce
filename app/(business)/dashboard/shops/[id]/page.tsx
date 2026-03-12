'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Store,
  Loader2, Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { shopService } from '@/lib/services/shop.service'
import ShopProductsManager from '@/components/dashboard/business/shops/ShopProductsManager'
import StatusToggle from '@/components/dashboard/business/shops/StatusToggle'

export default function ShopDetailPage() {
  const params            = useParams()
  const [shop, setShop]   = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    shopService
      .getShop(params.id as string)
      .then(data => setShop(data.shop))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Shop not found</p>
      </div>
    )
  }

  // Get IDs of products already in shop
  const assignedProductIds = shop.shop_products?.map(
    (sp: any) => sp.product_id
  ) ?? []

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/shops">
            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{shop.name}</h1>
            {shop.description && (
              <p className="text-slate-400 text-sm">{shop.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live/Draft toggle */}
          <StatusToggle
            shopId={shop.id}
            status={shop.status}
            onChange={(newStatus) =>
              setShop((prev: any) => ({ ...prev, status: newStatus }))
            }
          />

          {/* Edit shop */}
          <Link href={`/dashboard/shops/${shop.id}/edit`}>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Shop
            </Button>
          </Link>
        </div>
      </div>

      {/* Banner Preview */}
      {shop.banner_url && (
        <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-800">
          <img
            src={shop.banner_url}
            alt="Shop banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Shop Info */}
      <div className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
          {shop.logo_url ? (
            <img
              src={shop.logo_url}
              alt="Shop logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-8 h-8 text-slate-500" />
            </div>
          )}
        </div>
        <div>
          <p className="text-white font-semibold">{shop.name}</p>
          <p className="text-slate-400 text-sm flex items-center gap-2 mt-0.5">
            <Package className="w-3.5 h-3.5" />
            {assignedProductIds.length} products assigned
          </p>
        </div>
      </div>

      {/* Status warning if not live */}
      {shop.status !== 'live' && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-400 text-sm font-medium">
            ⚠️ This shop is not live yet
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Customers cannot see this shop or its products until you click
            "Go Live"
          </p>
        </div>
      )}

      {/* Products Manager */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Assign Products to This Shop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ShopProductsManager
            shopId={shop.id}
            initialProductIds={assignedProductIds}
          />
        </CardContent>
      </Card>

    </div>
  )
}