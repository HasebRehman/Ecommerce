'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package,
  Building2, BarChart3, Settings,
  LogOut, ChevronRight, Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'

const MENU_ITEMS = [
  {
    label: 'Dashboard',
    href:  '/dashboard',
    icon:  LayoutDashboard,
  },
  {
    label: 'Workspaces',
    href:  '/workspaces',
    icon:  Building2,
  },
  {
    label: 'My Shops',
    href:  '/dashboard/shops',
    icon:  Store,
  },
  {
    label: 'Orders',
    href:  '/dashboard/orders',
    icon:  ShoppingBag,
  },
  {
    label: 'Inventory',
    href:  '/dashboard/inventory',
    icon:  Package,
  },
  {
    label: 'Analytics',
    href:  '/dashboard/analytics',
    icon:  BarChart3,
  },
  {
    label: 'Settings',
    href:  '/dashboard/settings',
    icon:  Settings,
  },
]

interface Props {
  subRoles: string[]
}

export default function BusinessSidebar({ subRoles }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const { clearAuth, user } = useAuthStore()

  const handleLogout = async () => {
    try {
      await authService.logout()
      clearAuth()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch {
      toast.error('Failed to logout')
    }
  }

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
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
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