'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard, ShoppingBag, Package,
  BarChart3, LogOut, ChevronRight,
  Store, Star, ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { useNewOrdersStore } from '@/store/newOrdersStore'
import { Badge } from '@/components/ui/badge'

interface Props {
  subRoles: string[]
  isCollapsed: boolean
}

export default function BusinessSidebar({ subRoles, isCollapsed }: Props) {
  const pathname            = usePathname()
  const router              = useRouter()
  const { clearAuth, user } = useAuthStore()
  const { count, increment, clearNewOrders } = useNewOrdersStore()

  const orderPollRef            = useRef<NodeJS.Timeout | null>(null)
  const [unreadWarnings, setUnreadWarnings] = useState(0)

  // ── Poll unread warnings count every 15s ──
  useEffect(() => {
    if (!user?.id) return
    const fetchUnreadWarnings = async () => {
      try {
        const res  = await fetch('/api/business/warnings?page=1', { credentials: 'include' })
        const data = await res.json()
        setUnreadWarnings(data.unread ?? 0)
      } catch { /* silent */ }
    }
    fetchUnreadWarnings()
    const t = setInterval(fetchUnreadWarnings, 15000)
    return () => clearInterval(t)
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
  }, [user?.id, increment, router])

  // ── Clear order badge on orders page ──
  useEffect(() => {
    if (pathname.startsWith('/dashboard/orders')) clearNewOrders()
  }, [pathname, clearNewOrders])

  // ── Clear warnings badge when on warnings page ──
  useEffect(() => {
    if (pathname.startsWith('/dashboard/warnings') && unreadWarnings > 0) {
      setUnreadWarnings(0)
    }
  }, [pathname, unreadWarnings])

  const handleLogout = async () => {
    try {
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
    { label: 'Warnings',  href: '/dashboard/warnings',  icon: ShieldAlert     },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-open-sans { font-family: 'Open Sans', sans-serif; }
        
        /* Cursor pointer for all clickable elements */
        a, button, [role="button"], .cursor-pointer {
          cursor: pointer !important;
        }

        /* Hide scrollbar while keeping scroll functionality */
        .sidebar-nav::-webkit-scrollbar {
          display: none;
        }
        .sidebar-nav {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <aside 
        className={cn(
          'fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-300 font-open-sans',
          isCollapsed ? 'w-20' : 'w-64'
        )}
        style={{ 
          background: 'linear-gradient(180deg, #7C3AED 0%, #6D28D9 50%, #4C1D95 100%)',
          boxShadow: '4px 0 24px rgba(124, 58, 237, 0.3)'
        }}
      >

        {/* Logo */}
        <div className={cn(
          'border-b transition-all duration-300',
          isCollapsed ? 'p-4' : 'p-6'
        )} style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <Link href="/dashboard" className="block cursor-pointer">
            {isCollapsed ? (
              <div className="flex items-center justify-center">
                <img 
                  src="/logo-for-dark-short.png" 
                  alt="VendoSphere" 
                  className="object-contain"
                  style={{ maxWidth: '100px', maxHeight: '100px' }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-start">
                <img 
                  src="/logo-for-dark-removebg-preview.png" 
                  alt="VendoSphere" 
                  className="h-10 w-auto object-contain"
                  style={{ maxHeight: '40px', maxWidth: '200px' }}
                />
              </div>
            )}
          </Link>
          {/* {!isCollapsed && (
            <div className="mt-3">
              <Badge 
                className="text-xs font-montserrat font-bold"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#EDE9FE',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                Retailer
              </Badge>
            </div>
          )} */}
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              >
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : user?.full_name?.charAt(0)?.toUpperCase() ?? 'R'
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate font-montserrat">
                  {user?.full_name ?? 'Retailer'}
                </p>
                <p className="text-xs" style={{ color: '#EDE9FE' }}>Retailer</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          'flex-1 overflow-y-auto space-y-1 sidebar-nav',
          isCollapsed ? 'mt-8 p-2' : 'p-4'
        )}>
          {!isCollapsed && (
            <p 
              className="text-xs uppercase tracking-wider font-bold px-3 mb-3 font-montserrat"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              Main Menu
            </p>
          )}

          {MENU_ITEMS.map((item) => {
            const Icon       = item.icon
            const isActive   = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const isOrders   = item.href === '/dashboard/orders'
            const isWarnings = item.href === '/dashboard/warnings'

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl text-sm transition-all duration-200 group relative cursor-pointer',
                  isCollapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
                  isActive
                    ? 'text-white font-semibold'
                    : 'hover:text-white'
                )}
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 font-open-sans">{item.label}</span>
                    {isOrders && count > 0 && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                    {isWarnings && unreadWarnings > 0 && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-yellow-400 text-black text-xs font-bold rounded-full animate-pulse">
                        {unreadWarnings > 99 ? '99+' : unreadWarnings}
                      </span>
                    )}
                    {isActive && !(isOrders && count > 0) && !(isWarnings && unreadWarnings > 0) && (
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    )}
                  </>
                )}
                {isCollapsed && (isOrders && count > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
                {isCollapsed && (isWarnings && unreadWarnings > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadWarnings > 9 ? '9+' : unreadWarnings}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className={cn(
          'border-t',
          isCollapsed ? 'p-2' : 'p-4'
        )} style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 rounded-xl text-sm transition-all w-full group cursor-pointer',
              isCollapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5'
            )}
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-300 transition-colors" />
            {!isCollapsed && <span className="font-open-sans group-hover:text-white">Logout</span>}
          </button>
        </div>

      </aside>
    </>
  )
}