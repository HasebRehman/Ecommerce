'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Building2,
  Settings,
  LogOut,
  Shield,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'

const menuItems = [
  {
    label: 'Dashboard',
    href:  '/super-admin/dashboard',
    icon:  LayoutDashboard,
  },
  {
    label: 'Users',
    href:  '/super-admin/users',
    icon:  Users,
  },
  {
    label: 'Role Requests',
    href:  '/super-admin/role-requests',
    icon:  TrendingUp,
    badge: 'pending',
  },
  {
    label: 'Workspaces',
    href:  '/super-admin/workspaces',
    icon:  Building2,
  },
  {
    label: 'Settings',
    href:  '/super-admin/settings',
    icon:  Settings,
  },
]

export default function AdminSidebar({ role }: { role: string }) {
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/">
          <h1 className="text-xl font-bold text-white">
            Vendo<span className="text-blue-400">Sphere</span>
          </h1>
        </Link>
        <Badge className="mt-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs">
          <Shield className="w-3 h-3 mr-1" />
          {role?.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.full_name ?? 'Admin'}
            </p>
            <p className="text-slate-400 text-xs capitalize">
              {role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon     = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-red-500/20 text-red-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
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