'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Bell, Package, CheckCircle, Truck, XCircle, ShoppingBag, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { icon: any, color: string, bg: string }> = {
  order_placed:          { icon: ShoppingBag,  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  confirmed:             { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-500/10'  },
  shipped:               { icon: Truck,        color: 'text-purple-400', bg: 'bg-purple-500/10' },
  delivered:             { icon: Package,      color: 'text-green-400',  bg: 'bg-green-500/10'  },
  cancelled_by_seller:   { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10'    },
  cancelled_by_customer: { icon: XCircle,      color: 'text-orange-400', bg: 'bg-orange-500/10' },
  order:                 { icon: ShoppingBag,  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
}

const POLL_MS = 4000 // 4 seconds — feels instant

export default function NotificationBell() {
  const router                    = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const {
    notifications, unread,
    setNotifications, addNotification, markAllRead,
  } = useNotificationStore()

  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)

  const panelRef     = useRef<HTMLDivElement>(null)
  const pollRef      = useRef<NodeJS.Timeout | null>(null)
  const knownIdsRef  = useRef<Set<string>>(new Set())
  const mountedRef   = useRef(false)

  // ── Initial fetch ──
  const fetchOnce = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res  = await api.get('/api/store/notifications')
      const list = res.data.notifications ?? []
      const unreadCount = res.data.unread ?? 0
      setNotifications(list, unreadCount)
      // Record all known IDs
      list.forEach((n: any) => knownIdsRef.current.add(n.id))
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [isAuthenticated])

  // ── Silent poll — only adds NEW ones ──
  const silentPoll = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res   = await api.get('/api/store/notifications')
      const fresh = res.data.notifications ?? []

      // Find notifications we haven't seen yet
      const newOnes = fresh.filter((n: any) => !knownIdsRef.current.has(n.id))

      if (newOnes.length > 0) {
        // Add each new notification to store
        newOnes.forEach((n: any) => {
          knownIdsRef.current.add(n.id)
          addNotification(n)
        })
      }
    } catch { /* silent */ }
  }, [isAuthenticated, addNotification])

  // ── Start/stop polling ──
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    // Initial load
    fetchOnce()

    // Start polling
    pollRef.current = setInterval(silentPoll, POLL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [isAuthenticated, user?.id])

  // ── Re-poll when tab becomes visible ──
  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        silentPoll()
      }
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => document.removeEventListener('visibilitychange', handleVisible)
  }, [isAuthenticated, silentPoll])

  // ── Close panel on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = async () => {
    const next = !open
    setOpen(next)

    // Mark all read when opening
    if (next && unread > 0) {
      try {
        await api.put('/api/store/notifications/read')
        markAllRead()
      } catch { /* silent */ }
    }
  }

  const handleClick = (notif: any) => {
    setOpen(false)
    if (notif.order_id) router.push(`/orders/${notif.order_id}`)
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={panelRef}>

      {/* Bell */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <p className="text-white font-semibold text-sm">Notifications</p>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                  {unread} new
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
                <p className="text-slate-600 text-xs mt-1">
                  You'll see order updates here
                </p>
              </div>
            ) : (
              notifications.map(notif => {
                const cfg  = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.order
                const Icon = cfg.icon
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b border-slate-800 last:border-0 cursor-pointer transition-colors hover:bg-slate-800/50',
                      !notif.is_read && 'bg-slate-800/30'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      cfg.bg
                    )}>
                      <Icon className={cn('w-4 h-4', cfg.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'text-sm font-medium leading-tight',
                          notif.is_read ? 'text-slate-300' : 'text-white'
                        )}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-slate-600 text-xs mt-1.5">
                        {new Date(notif.created_at).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-800 text-center">
              <button
                onClick={() => { setOpen(false); router.push('/orders') }}
                className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
              >
                View all orders →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}