'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/lib/services/admin.service'
import { Skeleton } from '@/components/ui/skeleton'

// Role-specific stat components
import SuperAdminStats    from '@/components/dashboard/admin/SuperAdminStats'
import PlatformAdminStats from '@/components/dashboard/admin/PlatformAdminStats'
import OperationsAdminStats from '@/components/dashboard/admin/OperationsAdminStats'
import RecentUsers        from '@/components/dashboard/admin/RecentUsers'
import RoleRequestsWidget from '@/components/dashboard/admin/RoleRequestsWidget'

// Role-specific welcome messages
const WELCOME: Record<string, { title: string; subtitle: string }> = {
  super_admin: {
    title:    'Super Admin Dashboard',
    subtitle: 'Full platform control and oversight',
  },
  platform_admin: {
    title:    'Platform Admin Dashboard',
    subtitle: 'Manage platform modules and features',
  },
  operations_admin: {
    title:    'Operations Dashboard',
    subtitle: 'Monitor system health and technical operations',
  },
}

export default function AdminDashboard() {
  const { role, user }      = useAuthStore()
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const welcome = WELCOME[role ?? ''] ?? WELCOME.super_admin

  useEffect(() => {
    const load = async () => {
      try {
        const result = await adminService.getStats()
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
    totalUsers:      0,
    totalWorkspaces: 0,
    pendingRequests: 0,
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {welcome.title}
          </h1>
          <p className="text-slate-400 mt-1">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋 — {welcome.subtitle}
          </p>
        </div>
      </div>

      {/* Stats — changes based on role */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {role === 'super_admin' && (
            <SuperAdminStats stats={stats} />
          )}
          {role === 'platform_admin' && (
            <PlatformAdminStats stats={stats} />
          )}
          {role === 'operations_admin' && (
            <OperationsAdminStats />
          )}
        </>
      )}

      {/* Bottom Widgets — changes based on role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Users — super_admin + platform_admin */}
        {(role === 'super_admin' || role === 'platform_admin') && (
          <RecentUsers
            users={data?.recentUsers ?? []}
            canViewAll={role === 'super_admin'}
          />
        )}

        {/* Role Requests — super_admin only */}
        {role === 'super_admin' && (
          <RoleRequestsWidget
            pendingCount={stats.pendingRequests}
          />
        )}

        {/* Operations specific widgets */}
        {role === 'operations_admin' && (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">
                System Health
              </h3>
              <div className="space-y-3">
                {['API Server', 'Database', 'Storage', 'Auth Service'].map(service => (
                  <div key={service} className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{service}</span>
                    <span className="flex items-center gap-2 text-green-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                      Healthy
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">
                Recent Alerts
              </h3>
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm">
                  No active alerts
                </p>
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  )
}