'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package,
  Building2, BarChart3, Truck, Settings,
  LogOut, ChevronRight, Warehouse, Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'

interface MenuItem {
  label:    string
  href:     string
  icon:     any
  subRoles: string[]   // which sub-roles can see this item
}

const ALL_MENU_ITEMS: MenuItem[] = [
  // ── All business owners ──
  {
    label:    'Dashboard',
    href:     '/dashboard',
    icon:     LayoutDashboard,
    subRoles: ['merchant', 'retailer', 'supplier'],
  },
  {
    label:    'Workspaces',
    href:     '/workspaces',
    icon:     Building2,
    subRoles: ['merchant', 'retailer', 'supplier'],
  },

  // ── Merchant + Retailer (has shops) ──
  {
    label:    'My Shops',
    href:     '/dashboard/shops',
    icon:     Store,
    subRoles: ['merchant', 'retailer'],
  },
  {
    label:    'Orders',
    href:     '/dashboard/orders',
    icon:     ShoppingBag,
    subRoles: ['merchant', 'retailer'],
  },

  // ── Merchant + Supplier (has warehouses) ──
  {
    label:    'Warehouses',
    href:     '/dashboard/warehouses',
    icon:     Warehouse,
    subRoles: ['merchant', 'supplier'],
  },
  {
    label:    'Inventory',
    href:     '/dashboard/inventory',
    icon:     Package,
    subRoles: ['merchant', 'supplier'],
  },

  // ── Merchant only (has everything) ──
  {
    label:    'Riders',
    href:     '/dashboard/riders',
    icon:     Truck,
    subRoles: ['merchant'],
  },
  {
    label:    'Analytics',
    href:     '/dashboard/analytics',
    icon:     BarChart3,
    subRoles: ['merchant', 'retailer', 'supplier'],
  },

  // ── All business owners ──
  {
    label:    'Settings',
    href:     '/dashboard/settings',
    icon:     Settings,
    subRoles: ['merchant', 'retailer', 'supplier'],
  },
]

// Sub-role display config
const SUBROLE_CONFIG: Record<string, {
  label:       string
  color:       string
  badgeClass:  string
  avatarClass: string
}> = {
  merchant: {
    label:       'Merchant',
    color:       'text-purple-400',
    badgeClass:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
    avatarClass: 'bg-purple-500',
  },
  retailer: {
    label:       'Retailer',
    color:       'text-blue-400',
    badgeClass:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
    avatarClass: 'bg-blue-500',
  },
  supplier: {
    label:       'Supplier',
    color:       'text-green-400',
    badgeClass:  'bg-green-500/20 text-green-400 border-green-500/30',
    avatarClass: 'bg-green-500',
  },
}

interface Props {
  subRoles: string[]
}

export default function BusinessSidebar({ subRoles }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const { clearAuth, user } = useAuthStore()

  // Primary sub-role for display
  const primarySubRole = subRoles[0] ?? 'retailer'
  const config         = SUBROLE_CONFIG[primarySubRole] ?? SUBROLE_CONFIG.retailer

  // Filter menu items based on user's sub-roles
  const menuItems = ALL_MENU_ITEMS.filter(item =>
    item.subRoles.some(sr => subRoles.includes(sr))
  )

  // Remove duplicates
  const uniqueMenuItems = menuItems.filter((item, index, self) =>
    index === self.findIndex(i => i.href === item.href)
  )

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
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {subRoles.map(sr => (
            <Badge
              key={sr}
              className={cn(
                'text-xs capitalize',
                SUBROLE_CONFIG[sr]?.badgeClass ?? ''
              )}
            >
              {SUBROLE_CONFIG[sr]?.label ?? sr}
            </Badge>
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            'text-white font-semibold text-sm shrink-0',
            config.avatarClass
          )}>
            {user?.full_name?.charAt(0)?.toUpperCase() ?? 'B'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.full_name ?? 'Business Owner'}
            </p>
            <p className={cn('text-xs', config.color)}>
              {config.label}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

        <p className="text-slate-500 text-xs uppercase tracking-wider font-medium px-3 mb-3">
          Main Menu
        </p>

        {uniqueMenuItems.map((item) => {
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
                  ? cn(
                      'font-medium',
                      primarySubRole === 'merchant' && 'bg-purple-500/15 text-purple-400',
                      primarySubRole === 'retailer' && 'bg-blue-500/15 text-blue-400',
                      primarySubRole === 'supplier' && 'bg-green-500/15 text-green-400',
                    )
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
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