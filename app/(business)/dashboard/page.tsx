'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Loader2, RefreshCw } from 'lucide-react'
import RetailerStats from '@/components/dashboard/business/RetailerStats'
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
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res  = await fetch('/api/business/stats', { credentials: 'include' })
      const data = await res.json()
      if (data.stats) {
        setStats(data.stats)
        setLastUpdated(new Date())
      }
    } catch { /* silent */ }
    finally { if (!silent) setLoading(false) }
  }, [])

  useEffect(() => {
    fetchStats(false)

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
  }, [])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Here's what's happening with your store today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-medium">Live</span>
            {lastUpdated && (
              <span>· {lastUpdated.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}</span>
            )}
          </div>
          <button
            onClick={() => fetchStats(false)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : (
        <RetailerStats stats={stats} />
      )}

      {/* Recent Orders */}
      {/* <RecentOrders /> */}

    </div>
  )
}