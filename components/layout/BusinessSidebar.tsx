'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  LayoutDashboard, ShoppingBag, Package,
  BarChart3, Settings, LogOut, ChevronRight, Store, Star 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { useNewOrdersStore } from '@/store/newOrdersStore'
import { Badge } from '@/components/ui/badge'

interface Props {
  subRoles: string[]
}

export default function BusinessSidebar({ subRoles }: Props) {
  const pathname            = usePathname()
  const router              = useRouter()
  const { clearAuth, user } = useAuthStore()
  const { count, increment, clearNewOrders } = useNewOrdersStore()
  const channelRef = useRef<any>(null)
  const userIdRef  = useRef<string | null>(null)

  // ── Replace the realtime useEffect in BusinessSidebar with this ──
  useEffect(() => {
    if (!user?.id) return

    let lastKnownCount = 0
    let isFirst = true

    const checkNewOrders = async () => {
      try {
        const res = await fetch(`/api/business/orders?status=pending`)
        const data = await res.json()
        const orders: any[] = data.orders ?? []

        if (isFirst) {
          lastKnownCount = orders.length
          isFirst = false
          return
        }

        if (orders.length > lastKnownCount) {
          const newCount   = orders.length - lastKnownCount
          const newest     = orders[0]
          const name       = newest?.profiles?.full_name ?? 'A customer'

          // Only notify if not on orders page
          if (!window.location.pathname.startsWith('/dashboard/orders')) {
            for (let i = 0; i < newCount; i++) {
              increment()
            }
            toast.success(`🛍️ New Order!`, {
              description: `${name} placed an order · Rs. ${newest?.total_amount?.toLocaleString()}`,
              duration: 8000,
              action: {
                label: 'View Orders',
                onClick: () => router.push('/dashboard/orders'),
              },
            })
          }

          lastKnownCount = orders.length
        }
      } catch { /* silent */ }
    }

    // Check every 8 seconds
    const timer = setInterval(checkNewOrders, 8000)
    checkNewOrders() // initial check

    return () => clearInterval(timer)
  }, [user?.id])

  // ── Clear badge when visiting orders page ──
  useEffect(() => {
    if (pathname.startsWith('/dashboard/orders')) {
      clearNewOrders()
    }
  }, [pathname])

  const handleLogout = async () => {
    try {
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

      {/* User Info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() ?? 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.full_name ?? 'Retailer'}
            </p>
            <p className="text-blue-400 text-xs">Retailer</p>
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
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-blue-500/15 text-blue-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>

              {/* New orders badge */}
              {isOrders && count > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                  {count > 99 ? '99+' : count}
                </span>
              )}

              {isActive && count === 0 && (
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