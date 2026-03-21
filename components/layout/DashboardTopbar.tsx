'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Bell, X, CheckCircle, Truck, XCircle, ShoppingBag, Package } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

// ── Page title + description map ──
const PAGE_CONFIG: Record<string, { title: string, desc: string }> = {
  '/dashboard':                    { title: 'Dashboard',       desc: 'Overview of your store performance'         },
  '/dashboard/orders':             { title: 'Orders',          desc: 'Manage and fulfill customer orders'         },
  '/dashboard/inventory':          { title: 'Inventory',       desc: 'Manage your products and stock'             },
  '/dashboard/inventory/new':      { title: 'Add Product',     desc: 'Add a new product to your inventory'        },
  '/dashboard/shops':              { title: 'My Shops',        desc: 'Manage your shops'                          },
  '/dashboard/shops/new':          { title: 'Create Shop',     desc: 'Set up a new shop'                          },
  '/dashboard/analytics':          { title: 'Analytics',       desc: 'Track your sales and performance'           },
  '/dashboard/reviews':            { title: 'Reviews',         desc: 'See what customers say about your products' },
  '/dashboard/settings':           { title: 'Settings',        desc: 'Manage your account settings'               },
  '/dashboard/riders':             { title: 'Riders',          desc: 'Manage delivery riders'                     },
  '/admin/dashboard':              { title: 'Dashboard',       desc: 'Platform overview and statistics'           },
  '/admin/users':                  { title: 'Users',           desc: 'Manage platform users'                      },
  '/admin/role-requests':          { title: 'Role Requests',   desc: 'Review and approve seller requests'         },
  '/admin/workspaces':             { title: 'Workspaces',      desc: 'Manage workspaces'                          },
  '/admin/modules':                { title: 'Modules',         desc: 'Manage platform modules'                    },
  '/admin/monitoring':             { title: 'Monitoring',      desc: 'System monitoring and health'               },
  '/admin/logs':                   { title: 'System Logs',     desc: 'View system activity logs'                  },
  '/admin/settings':               { title: 'Settings',        desc: 'Platform settings and configuration'        },
}

const getPageConfig = (pathname: string) => {
  // Exact match first
  if (PAGE_CONFIG[pathname]) return PAGE_CONFIG[pathname]

  // Dynamic routes — check startsWith
  if (pathname.startsWith('/dashboard/orders/'))    return { title: 'Order Details',   desc: 'View and manage this order'          }
  if (pathname.startsWith('/dashboard/inventory/')) return { title: 'Product Details', desc: 'View and edit this product'          }
  if (pathname.startsWith('/dashboard/shops/'))     return { title: 'Shop Details',    desc: 'View and manage this shop'           }
  if (pathname.startsWith('/dashboard/reviews/'))   return { title: 'Product Reviews', desc: 'Reviews for this product'            }
  if (pathname.startsWith('/admin/users/'))         return { title: 'User Details',    desc: 'View and manage this user'           }
  if (pathname.startsWith('/admin/role-requests/')) return { title: 'Role Request',    desc: 'Review this role upgrade request'    }

  return { title: 'Dashboard', desc: 'Welcome back' }
}

const TYPE_CONFIG: Record<string, { icon: any, color: string, bg: string }> = {
  new_order:             { icon: ShoppingBag,  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  order_placed:          { icon: ShoppingBag,  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  confirmed:             { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-500/10'  },
  shipped:               { icon: Truck,        color: 'text-purple-400', bg: 'bg-purple-500/10' },
  delivered:             { icon: Package,      color: 'text-green-400',  bg: 'bg-green-500/10'  },
  cancelled_by_seller:   { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10'    },
  cancelled_by_customer: { icon: XCircle,      color: 'text-orange-400', bg: 'bg-orange-500/10' },
  order:                 { icon: ShoppingBag,  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
}

interface Props {
  variant: 'business' | 'admin'
}

export default function DashboardTopbar({ variant }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user } = useAuthStore()
  const {
    notifications, unread,
    setNotifications, addNotification, markAllRead,
  } = useNotificationStore()

  const [bellOpen, setBellOpen] = useState(false)
  const bellRef                 = useRef<HTMLDivElement>(null)
  const pollRef                 = useRef<NodeJS.Timeout | null>(null)
  const knownIds                = useRef<Set<string>>(new Set())
  const isFirst                 = useRef(true)

  const page = getPageConfig(pathname)

  const notifEndpoint     = variant === 'business' ? '/api/business/notifications'       : '/api/business/notifications'
  const notifReadEndpoint = variant === 'business' ? '/api/business/notifications/read'  : '/api/business/notifications/read'
  const orderLinkBase     = variant === 'business' ? '/dashboard/orders'                 : '/admin'

  // ── Fetch notifications ──
  const fetchNotifications = async () => {
    try {
      const res  = await fetch(notifEndpoint, { credentials: 'include' })
      const data = await res.json()
      const list = data.notifications ?? []
      const unreadCount = data.unread ?? 0

      if (isFirst.current) {
        // First load — set everything and record all IDs
        setNotifications(list, unreadCount)
        list.forEach((n: any) => knownIds.current.add(n.id))
        isFirst.current = false
        return
      }

      // Only add genuinely new ones
      const newOnes = list.filter((n: any) => !knownIds.current.has(n.id))
      if (newOnes.length > 0) {
        newOnes.forEach((n: any) => {
          knownIds.current.add(n.id)
          addNotification(n)
        })
      }
    } catch { /* silent */ }
  }

  // ── Start polling ──
  useEffect(() => {
    if (!user?.id) return
    fetchNotifications()
    pollRef.current = setInterval(fetchNotifications, 4000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [user?.id])

  // ── Close on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleBellOpen = async () => {
    const next = !bellOpen
    setBellOpen(next)
    if (next && unread > 0) {
      try {
        await fetch(notifReadEndpoint, { method: 'PUT', credentials: 'include' })
        markAllRead()
      } catch { /* silent */ }
    }
  }

  // const handleNotifClick = (notif: any) => {
  //   setBellOpen(false)
  //   if (notif.order_id) {
  //     router.push(`${orderLinkBase}/${notif.order_id}`)
  //   }
  // }

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">

      {/* Left — Page title */}
      <div>
        <h1 className="text-white font-bold text-lg leading-tight">{page.title}</h1>
        <p className="text-slate-400 text-xs mt-0.5">{page.desc}</p>
      </div>

      {/* Right — Bell + Home */}
      <div className="flex items-center gap-3">

        {/* Notification Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={handleBellOpen}
            className="relative p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {bellOpen && (
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
                  onClick={() => setBellOpen(false)}
                  className="p-1 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-10">
                    <Bell className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No notifications yet</p>
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
                          'flex items-start gap-3 px-4 py-3 border-b border-slate-800 last:border-0 cursor-pointer hover:bg-slate-800/50 transition-colors',
                          !notif.is_read && 'bg-slate-800/30'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                          cfg.bg
                        )}>
                          <Icon className={cn('w-4 h-4', cfg.color)} />
                        </div>
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
                          <p className="text-slate-600 text-xs mt-1">
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
              {/* {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-slate-800 text-center">
                  <button
                    onClick={() => { setBellOpen(false); router.push(orderLinkBase) }}
                    className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                  >
                    View all orders →
                  </button>
                </div>
              )} */}
            </div>
          )}
        </div>

        {/* Go to Main Website */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all border border-slate-700 hover:border-slate-600"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Main Site</span>
        </button>

      </div>
    </header>
  )
}