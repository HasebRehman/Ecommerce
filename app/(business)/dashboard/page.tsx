'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { businessService } from '@/lib/services/business.service'
import { Skeleton } from '@/components/ui/skeleton'
import MerchantStats  from '@/components/dashboard/business/MerchantStats'
import RetailerStats  from '@/components/dashboard/business/RetailerStats'
import SupplierStats  from '@/components/dashboard/business/SupplierStats'
import WorkspacesWidget from '@/components/dashboard/business/WorkspacesWidget'
import RecentOrders   from '@/components/dashboard/business/RecentOrders'

const WELCOME: Record<string, { title: string; subtitle: string }> = {
  merchant: {
    title:    'Merchant Dashboard',
    subtitle: 'Manage your shops, warehouses and riders',
  },
  retailer: {
    title:    'Retailer Dashboard',
    subtitle: 'Manage your shops and orders',
  },
  supplier: {
    title:    'Supplier Dashboard',
    subtitle: 'Manage your warehouses and inventory',
  },
}

export default function BusinessDashboard() {
  const { user, subRoles }    = useAuthStore()
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const primarySubRole = subRoles?.[0] ?? 'retailer'
  const welcome        = WELCOME[primarySubRole] ?? WELCOME.retailer

  useEffect(() => {
    const load = async () => {
      try {
        const result = await businessService.getStats()
        setData(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = data?.stats ?? {
    totalShops:      0,
    totalWarehouses: 0,
    totalOrders:     0,
    totalProducts:   0,
    totalRevenue:    0,
  }

  const workspaces = data?.workspaces ?? []

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {welcome.title}
        </h1>
        <p className="text-slate-400 mt-1">
          Welcome back, {user?.full_name?.split(' ')[0]} 👋 — {welcome.subtitle}
        </p>
      </div>

      {/* Stats — changes based on sub-role */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {primarySubRole === 'merchant' && (
            <MerchantStats stats={stats} />
          )}
          {primarySubRole === 'retailer' && (
            <RetailerStats stats={stats} />
          )}
          {primarySubRole === 'supplier' && (
            <SupplierStats stats={stats} />
          )}
        </>
      )}

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Workspaces — all business owners */}
        <WorkspacesWidget workspaces={workspaces} />

        {/* Recent Orders — merchant + retailer */}
        {(primarySubRole === 'merchant' ||
          primarySubRole === 'retailer') && (
          <RecentOrders />
        )}

        {/* Supplier — stock info instead of orders */}
        {primarySubRole === 'supplier' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">
              Stock Overview
            </h3>
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm">
                Stock tracking coming in inventory feature
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Upgrade Banner — retailer or supplier can upgrade to merchant */}
      {(primarySubRole === 'retailer' || primarySubRole === 'supplier') && (
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">
                Upgrade to Merchant
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                {primarySubRole === 'retailer'
                  ? 'Add warehouses by becoming a Merchant'
                  : 'Add shops by becoming a Merchant'
                }
              </p>
            </div>
            <Link href="/account/upgrade">
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                Request Upgrade
              </button>
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}