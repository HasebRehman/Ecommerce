'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/lib/services/admin.service'
import { announcementService } from '@/lib/services/announcement.service'
import AnnouncementBannerDisplay from '@/components/announcements/AnnouncementBannerDisplay'
import type { Announcement } from '@/types'

// Role-specific stat components
import SuperAdminDashboardEnhanced from '@/components/dashboard/admin/SuperAdminDashboardEnhanced'
import PlatformAdminDashboardEnhanced from '@/components/dashboard/admin/PlatformAdminDashboardEnhanced'
import OperationsAdminStats from '@/components/dashboard/admin/OperationsAdminStats'
import RecentUsers        from '@/components/dashboard/admin/RecentUsers'

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
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([])

  const welcome = WELCOME[role ?? ''] ?? WELCOME.super_admin

  useEffect(() => {
    const load = async () => {
      try {
        const result = await adminService.getStats()
        setData(result)
      } catch (err) {
        console.error(err)
      }
    }
    load()

    // Load active announcements silently
    announcementService.getActive()
      .then(data => setActiveAnnouncements(data))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {welcome.title}
          </h1>
          <p className="text-slate-400 mt-1">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋 — {welcome.subtitle}
          </p>
        </div>
      </div>

      {/* Announcement Banner */}
      <AnnouncementBannerDisplay announcements={activeAnnouncements} />

      {/* Stats — changes based on role */}
      <>
        {(role as string) === 'super_admin' && (
          <SuperAdminDashboardEnhanced />
        )}
        {role === 'platform_admin' && (
          <PlatformAdminDashboardEnhanced />
        )}
        {role === 'operations_admin' && (
          <OperationsAdminStats />
        )}
      </>

      {/* Recent Users — platform_admin (Full Width) */}
      {role === 'platform_admin' && (
        <RecentUsers
          users={(data?.recentUsers ?? []).slice(0, 3)}
          canViewAll={true}
        />
      )}

    </div>
  )
}