'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { businessService } from '@/lib/services/business.service'
import { Skeleton } from '@/components/ui/skeleton'
import RetailerStats from '@/components/dashboard/business/RetailerStats'
import WorkspacesWidget from '@/components/dashboard/business/WorkspacesWidget'
import RecentOrders from '@/components/dashboard/business/RecentOrders'


export default function BusinessDashboard() {
  const { user }              = useAuthStore()
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    totalShops:    0,
    totalOrders:   0,
    totalProducts: 0,
    totalRevenue:  0,
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Retailer Dashboard
        </h1>
        <p className="text-slate-400 mt-1">
          Welcome back, {user?.full_name?.split(' ')[0]} 👋 — Manage your shops and orders
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : (
        <RetailerStats stats={stats} />
      )}

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WorkspacesWidget workspaces={data?.workspaces ?? []} />
        <RecentOrders />
      </div>

    </div>
  )
}