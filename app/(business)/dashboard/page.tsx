'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import RetailerStats from '@/components/dashboard/business/RetailerStats'
import { announcementService } from '@/lib/services/announcement.service'
import AnnouncementBannerDisplay from '@/components/announcements/AnnouncementBannerDisplay'
import type { Announcement } from '@/types'
// import RecentOrders from '@/components/dashboard/business/RecentOrders'

const POLL_INTERVAL = 30000 // 30 seconds for dashboard stats

const DEFAULT_STATS = {
  totalShops:          0,
  liveShops:           0,
  totalProducts:       0,
  totalOrders:         0,
  confirmedOrders:     0,
  shippedOrders:       0,
  deliveredOrders:     0,
  cancelledOrders:     0,
  totalRevenue:        0,
  currentMonthRevenue: 0,
  currentMonth:        '',
}

export default function BusinessDashboard() {
  const { user }          = useAuthStore()
  const [stats,   setStats]   = useState(DEFAULT_STATS)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([])
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const fetchStats = useCallback(async (silent = false) => {
    try {
      const res  = await fetch('/api/business/stats', { credentials: 'include' })
      const data = await res.json()
      if (data.stats) {
        setStats(data.stats)
        setLastUpdated(new Date())
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchStats(false)

    // Load active announcements silently
    announcementService.getActive()
      .then(data => setActiveAnnouncements(data))
      .catch(() => {})

    // Poll every 30s
    pollRef.current = setInterval(() => fetchStats(true), POLL_INTERVAL)

    // Also refresh when tab becomes visible
    const handleVisible = () => {
      if (document.visibilityState === 'visible') fetchStats(true)
    }
    document.addEventListener('visibilitychange', handleVisible)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      document.removeEventListener('visibilitychange', handleVisible)
    }
  }, [fetchStats])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-open-sans { font-family: 'Open Sans', sans-serif; }
      `}</style>
      
      <div className="space-y-6 font-open-sans">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-montserrat font-bold" style={{ color: '#1e1b4b' }}>
              Welcome back, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="mt-2 text-sm sm:text-base font-open-sans" style={{ color: '#6b7280' }}>
              Here's what's happening with your store today
            </p>
          </div>
        </div>

        {/* Announcement Banner */}
        <AnnouncementBannerDisplay announcements={activeAnnouncements} />

        {/* Stats */}
        <div style={{ marginTop: '24px' }}>
          <RetailerStats stats={stats} />
        </div>

        {/* Recent Orders */}
        {/* <RecentOrders /> */}

      </div>
    </>
  )
}