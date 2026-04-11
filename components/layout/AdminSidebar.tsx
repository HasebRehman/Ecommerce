'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, TrendingUp, Building2,
  Settings, LogOut, Shield, Activity, FileText,
  Layers, Bell, ChevronRight, MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/types'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import api from '@/lib/axios'

// Menu item type
interface MenuItem {
  label:      string
  href:       string
  icon:       any
  roles:      UserRole[]
  badge?:     string
}

// ALL menu items with role access control
const ALL_MENU_ITEMS: MenuItem[] = [
  // ── Shared by all admins ──
  {
    label: 'Dashboard',
    href:  '/admin/dashboard',
    icon:  LayoutDashboard,
    roles: ['super_admin', 'platform_admin', 'operations_admin'],
  },

  // ── Super Admin only ──
  {
    label: 'Users',
    href:  '/admin/users',
    icon:  Users,
    roles: ['super_admin'],
  },
  {
    label: 'Role Requests',
    href:  '/admin/role-requests',
    icon:  TrendingUp,
    roles: ['super_admin'],
    badge: 'pending',
  },
  {
    label: 'Workspaces',
    href:  '/admin/workspaces',
    icon:  Building2,
    roles: ['super_admin'],
  },
  {
    label: 'Settings',
    href:  '/admin/settings',
    icon:  Settings,
    roles: ['super_admin'],
  },

  // ── Platform Admin ──
  {
    label: 'Users',
    href:  '/admin/users',
    icon:  Users,
    roles: ['platform_admin'],
  },
  {
    label: 'Workspaces',
    href:  '/admin/workspaces',
    icon:  Building2,
    roles: ['platform_admin'],
  },
  {
    label: 'Modules',
    href:  '/admin/modules',
    icon:  Layers,
    roles: ['platform_admin'],
  },

  // ── Operations Admin ──
  {
    label: 'Monitoring',
    href:  '/admin/monitoring',
    icon:  Activity,
    roles: ['operations_admin'],
  },
  {
    label: 'System Logs',
    href:  '/admin/logs',
    icon:  FileText,
    roles: ['operations_admin'],
  },

  // ── Messages (all admins) ──
  {
    label: 'Messages',
    href:  '/admin/messages',
    icon:  MessageSquare,
    roles: ['super_admin', 'platform_admin', 'operations_admin'],
  },
]

// Role display config
const ROLE_CONFIG: Record<string, {
  label: string
  color: string
  badgeClass: string
  avatarClass: string
}> = {
  super_admin: {
    label:       'Super Admin',
    color:       'text-red-400',
    badgeClass:  'bg-red-500/20 text-red-400 border-red-500/30',
    avatarClass: 'bg-red-500',
  },
  platform_admin: {
    label:       'Platform Admin',
    color:       'text-orange-400',
    badgeClass:  'bg-orange-500/20 text-orange-400 border-orange-500/30',
    avatarClass: 'bg-orange-500',
  },
  operations_admin: {
    label:       'Operations Admin',
    color:       'text-yellow-400',
    badgeClass:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    avatarClass: 'bg-yellow-500',
  },
}

export default function AdminSidebar() {
  const pathname              = usePathname()
  const router                = useRouter()
  const { clearAuth, user, role } = useAuthStore()
  const [unreadMessages, setUnreadMessages] = useState(0)

  const userRole   = role as UserRole
  const config     = ROLE_CONFIG[userRole] ?? ROLE_CONFIG.super_admin

  // Load initial unread count + subscribe to new messages
  useEffect(() => {
    if (!user) return

    api.get('/api/admin/messages')
      .then(res => setUnreadMessages(res.data.totalUnread ?? 0))
      .catch(() => {})

    const supabase = createClient()
    const channel  = supabase
      .channel('sidebar-unread')
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'admin_messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        setUnreadMessages(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  // Filter menu items based on current user's role
  const menuItems = ALL_MENU_ITEMS.filter(item =>
    item.roles.includes(userRole)
  )

  // Remove duplicate hrefs (platform_admin has Users in both)
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
        <Link href="/admin/dashboard">
          <h1 className="text-xl font-bold text-white">
            Vendo<span className="text-blue-400">Sphere</span>
          </h1>
        </Link>
        <div className="flex items-center gap-2 mt-3">
          <Shield className={cn('w-3.5 h-3.5', config.color)} />
          <Badge className={cn('text-xs', config.badgeClass)}>
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            'text-white font-semibold text-sm shrink-0',
            config.avatarClass
          )}>
            {user?.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.full_name ?? 'Admin User'}
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
          const isActive = pathname.startsWith(item.href)
          const isMessages = item.href === '/admin/messages'
          // Reset unread when visiting messages page
          const handleClick = () => {
            if (isMessages) setUnreadMessages(0)
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group',
                isActive
                  ? cn('font-medium',
                      userRole === 'super_admin'       && 'bg-red-500/15 text-red-400',
                      userRole === 'platform_admin'    && 'bg-orange-500/15 text-orange-400',
                      userRole === 'operations_admin'  && 'bg-yellow-500/15 text-yellow-400',
                    )
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isMessages && unreadMessages > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
              {isActive && !isMessages && (
                <ChevronRight className="w-3 h-3 opacity-60" />
              )}
              {isActive && isMessages && unreadMessages === 0 && (
                <ChevronRight className="w-3 h-3 opacity-60" />
              )}
            </Link>
          )
        })}

      </nav>

      {/* Notifications + Logout */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all w-full">
          <Bell className="w-4 h-4" />
          Notifications
        </button>
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