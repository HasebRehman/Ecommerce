'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard, ShoppingBag, Package,
  BarChart3, Settings, LogOut, ChevronRight,
  Store, Star, Bell, X, CheckCircle, Truck,
  XCircle, Package as PackageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { useNewOrdersStore } from '@/store/newOrdersStore'
import { useNotificationStore } from '@/store/notificationStore'
import { Badge } from '@/components/ui/badge'

interface Props {
  subRoles: string[]
}

const TYPE_CONFIG: Record<string, { icon: any, color: string, bg: string }> = {
  new_order:             { icon: ShoppingBag,  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  confirmed:             { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-500/10'  },
  shipped:               { icon: Truck,        color: 'text-purple-400', bg: 'bg-purple-500/10' },
  delivered:             { icon: PackageIcon,  color: 'text-green-400',  bg: 'bg-green-500/10'  },
  cancelled_by_seller:   { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10'    },
  cancelled_by_customer: { icon: XCircle,      color: 'text-orange-400', bg: 'bg-orange-500/10' },
  order:                 { icon: ShoppingBag,  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
}

export default function BusinessSidebar({ subRoles }: Props) {
  const pathname            = usePathname()
  const router              = useRouter()
  const { clearAuth, user } = useAuthStore()
  const { count, increment, clearNewOrders } = useNewOrdersStore()
  const {
    notifications, unread,
    setNotifications, addNotification, markAllRead,
  } = useNotificationStore()

  const [bellOpen, setBellOpen] = useState(false)
  const bellRef                 = useRef<HTMLDivElement>(null)
  const pollRef                 = useRef<NodeJS.Timeout | null>(null)
  const orderPollRef            = useRef<NodeJS.Timeout | null>(null)
  const knownNotifIds           = useRef<Set<string>>(new Set())
  const isFirstNotif            = useRef(true)

  // ── Close bell on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Fetch seller notifications ──
  const fetchNotifications = async () => {
    try {
      const res  = await fetch('/api/business/notifications', { credentials: 'include' })
      const data = await res.json()
      const list = data.notifications ?? []
      const unreadCount = data.unread ?? 0

      if (isFirstNotif.current) {
        setNotifications(list, unreadCount)
        list.forEach((n: any) => knownNotifIds.current.add(n.id))
        isFirstNotif.current = false
        return
      }

      // Find new ones
      const newOnes = list.filter((n: any) => !knownNotifIds.current.has(n.id))
      if (newOnes.length > 0) {
        newOnes.forEach((n: any) => {
          knownNotifIds.current.add(n.id)
          addNotification(n)
        })
      }
    } catch { /* silent */ }
  }

  // ── Poll notifications every 4s ──
  useEffect(() => {
    if (!user?.id) return
    fetchNotifications()
    pollRef.current = setInterval(fetchNotifications, 4000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [user?.id])

  // ── Poll new orders every 8s ──
  useEffect(() => {
    if (!user?.id) return

    let lastKnownCount = 0
    let isFirst        = true

    const checkNewOrders = async () => {
      try {
        const res    = await fetch('/api/business/orders?status=pending', { credentials: 'include' })
        const data   = await res.json()
        const orders = data.orders ?? []

        if (isFirst) {
          lastKnownCount = orders.length
          isFirst        = false
          return
        }

        if (orders.length > lastKnownCount) {
          const newCount = orders.length - lastKnownCount
          const newest   = orders[0]
          const name     = newest?.profiles?.full_name ?? 'A customer'

          if (!window.location.pathname.startsWith('/dashboard/orders')) {
            for (let i = 0; i < newCount; i++) increment()
            toast.success(`🛍️ New Order!`, {
              description: `${name} placed an order · Rs. ${newest?.total_amount?.toLocaleString()}`,
              duration:    8000,
              action: {
                label:   'View Orders',
                onClick: () => router.push('/dashboard/orders'),
              },
            })
          }

          lastKnownCount = orders.length
        }
      } catch { /* silent */ }
    }

    checkNewOrders()
    orderPollRef.current = setInterval(checkNewOrders, 8000)
    return () => { if (orderPollRef.current) clearInterval(orderPollRef.current) }
  }, [user?.id])

  // ── Clear order badge on orders page ──
  useEffect(() => {
    if (pathname.startsWith('/dashboard/orders')) clearNewOrders()
  }, [pathname])

  const handleBellOpen = async () => {
    const next = !bellOpen
    setBellOpen(next)
    if (next && unread > 0) {
      try {
        await fetch('/api/business/notifications/read', {
          method: 'PUT', credentials: 'include'
        })
        markAllRead()
      } catch { /* silent */ }
    }
  }

  // const handleNotifClick = (notif: any) => {
  //   setBellOpen(false)
  //   if (notif.order_id) router.push(`/dashboard/orders/${notif.order_id}`)
  // }

  const handleLogout = async () => {
    try {
      if (pollRef.current)      clearInterval(pollRef.current)
      if (orderPollRef.current) clearInterval(orderPollRef.current)
      await authService.logout()
      clearAuth()
      clearNewOrders()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch {
      toast.error('Failed to logout')
    }
  }

  const MENU_ITEMS = [
    { label: 'Dashboard', href: '/dashboard',           icon: LayoutDashboard },
    { label: 'My Shops',  href: '/dashboard/shops',     icon: Store           },
    { label: 'Orders',    href: '/dashboard/orders',    icon: ShoppingBag     },
    { label: 'Inventory', href: '/dashboard/inventory', icon: Package         },
    { label: 'Reviews',   href: '/dashboard/reviews',   icon: Star            },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3       },
    { label: 'Settings',  href: '/dashboard/settings',  icon: Settings        },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">

      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold text-white">
            Vendo<span className="text-blue-400">Sphere</span>
          </h1>
        </Link>
        <div className="mt-3">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
            Retailer
          </Badge>
        </div>
      </div>

      {/* User Info + Bell */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              : user?.full_name?.charAt(0)?.toUpperCase() ?? 'R'
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.full_name ?? 'Retailer'}
            </p>
            <p className="text-blue-400 text-xs">Retailer</p>
          </div>

          {/* Bell icon */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={handleBellOpen}
              className="relative p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {bellOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                style={{ left: 'auto', right: '-8px' }}
              >
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-blue-400" />
                    <p className="text-white font-semibold text-xs">Notifications</p>
                    {unread > 0 && (
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full border border-red-500/30">
                        {unread} new
                      </span>
                    )}
                  </div>
                  <button onClick={() => setBellOpen(false)} className="text-slate-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(notif => {
                      const cfg  = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.order
                      const Icon = cfg.icon
                      return (
                        <div
                          key={notif.id}
                          // onClick={() => handleNotifClick(notif)}
                          className={cn(
                            'flex items-start gap-2.5 px-3 py-2.5 border-b border-slate-800 last:border-0 cursor-pointer hover:bg-slate-800/50 transition-colors',
                            !notif.is_read && 'bg-slate-800/30'
                          )}
                        >
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                            cfg.bg
                          )}>
                            <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <p className={cn(
                                'text-xs font-medium leading-tight',
                                notif.is_read ? 'text-slate-300' : 'text-white'
                              )}>
                                {notif.title}
                              </p>
                              {!notif.is_read && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-slate-600 text-[10px] mt-1">
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

                {/* {notifications.length > 0 && (
                  <div className="px-3 py-2 border-t border-slate-800 text-center">
                    <button
                      onClick={() => { setBellOpen(false); router.push('/dashboard/orders') }}
                      className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                    >
                      View all orders →
                    </button>
                  </div>
                )} */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-slate-500 text-xs uppercase tracking-wider font-medium px-3 mb-3">
          Main Menu
        </p>

        {MENU_ITEMS.map((item) => {
          const Icon     = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const isOrders = item.href === '/dashboard/orders'

          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-blue-500/15 text-blue-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isOrders && count > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                  {count > 99 ? '99+' : count}
                </span>
              )}
              {isActive && !(isOrders && count > 0) && (
                <ChevronRight className="w-3 h-3 opacity-60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

    </aside>
  )
}