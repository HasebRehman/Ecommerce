'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, TrendingUp,
  LogOut, Activity,
  Layers, ChevronRight, MessageSquare,
  AlertTriangle, Megaphone, Bell, Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import api from '@/lib/axios'

interface MenuItem {
  label: string
  href:  string
  icon:  any
  roles: UserRole[]
}

const ALL_MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    href:  '/admin/dashboard',
    icon:  LayoutDashboard,
    roles: ['super_admin', 'platform_admin', 'operations_admin'],
  },
  {
    label: 'Users',
    href:  '/admin/users',
    icon:  Users,
    roles: ['super_admin', 'platform_admin'],
  },
  {
    label: 'Role Requests',
    href:  '/admin/role-requests',
    icon:  TrendingUp,
    roles: ['super_admin', 'platform_admin'],
  },
  {
    label: 'Modules',
    href:  '/admin/modules',
    icon:  Layers,
    roles: [],
  },
  {
    label: 'System Monitoring',
    href:  '/admin/monitoring',
    icon:  Activity,
    roles: ['super_admin', 'operations_admin'],
  },
  {
    label: 'System Notifications',
    href:  '/admin/notifications',
    icon:  Bell,
    roles: ['super_admin', 'operations_admin'],
  },
  {
    label: 'Messages',
    href:  '/admin/messages',
    icon:  MessageSquare,
    roles: ['super_admin', 'platform_admin', 'operations_admin'],
  },
  {
    label: 'Reports',
    href:  '/admin/reports',
    icon:  AlertTriangle,
    roles: ['super_admin', 'platform_admin', 'operations_admin'],
  },
  {
    label: 'Announcements',
    href:  '/admin/announcements',
    icon:  Megaphone,
    roles: ['super_admin', 'platform_admin'],
  },
  {
    label: 'Complaints',
    href:  '/admin/complaints',
    icon:  Mail,
    roles: ['super_admin', 'operations_admin'],
  },
]

const ROLE_CONFIG: Record<string, { label: string }> = {
  super_admin:       { label: 'Super Admin'       },
  platform_admin:    { label: 'Platform Admin'    },
  operations_admin:  { label: 'Operations Admin'  },
}

interface Props {
  isCollapsed: boolean
}

export default function AdminSidebar({ isCollapsed }: Props) {
  const pathname              = usePathname()
  const router                = useRouter()
  const { clearAuth, user, role } = useAuthStore()
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Use the role from the store. While the store is hydrating (role === null),
  // we cannot determine which items to show, so we wait.
  const userRole = role as UserRole | null
  const config   = ROLE_CONFIG[userRole ?? 'super_admin'] ?? ROLE_CONFIG.super_admin

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
      }, () => setUnreadMessages(prev => prev + 1))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const menuItems = ALL_MENU_ITEMS
    .filter(item => {
      // While the store is hydrating, show nothing (avoids flash of wrong items)
      if (!userRole) return false
      return item.roles.includes(userRole)
    })
    .filter((item, idx, self) => idx === self.findIndex(i => i.href === item.href))

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .as-header { font-family: 'Montserrat', sans-serif; }
        .as-body   { font-family: 'Open Sans',   sans-serif; }
        a, button, [role="button"] { cursor: pointer !important; }
        .as-nav::-webkit-scrollbar { display: none; }
        .as-nav { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <aside
        className={cn(
          'fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
        style={{
          background: 'linear-gradient(180deg, #7C3AED 0%, #6D28D9 50%, #4C1D95 100%)',
          boxShadow: '4px 0 24px rgba(124,58,237,0.30)',
        }}
      >

        {/* ── Logo ── */}
        <div
          className={cn('border-b transition-all duration-300', isCollapsed ? 'p-4' : 'p-6')}
          style={{ borderColor: 'rgba(255,255,255,0.12)' }}
        >
          <Link href="/admin/dashboard" className="block cursor-pointer">
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
        </div>

        {/* ── User Info ── */}
        {!isCollapsed && (
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white as-header font-bold text-sm shrink-0 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.20)' }}
              >
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : user?.full_name?.charAt(0)?.toUpperCase() ?? 'A'
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="as-header text-white text-sm font-bold truncate">
                  {user?.full_name ?? 'Admin'}
                </p>
                <p className="as-body text-xs" style={{ color: '#C4B5FD' }}>
                  {config.label}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav
          className={cn('flex-1 overflow-y-auto space-y-1 as-nav', isCollapsed ? 'mt-6 p-2' : 'p-4')}
        >
          {!isCollapsed && (
            <p
              className="as-header text-xs uppercase tracking-wider font-bold px-3 mb-3"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Main Menu
            </p>
          )}

          {menuItems.map(item => {
            const Icon       = item.icon
            const isActive   = pathname.startsWith(item.href)
            const isMessages = item.href === '/admin/messages'

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (isMessages) setUnreadMessages(0) }}
                className={cn(
                  'flex items-center gap-3 rounded-xl text-sm transition-all duration-300 group relative',
                  isCollapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
                )}
                style={{
                  background: isActive ? 'rgba(255,255,255,0.16)' : 'transparent',
                  color:      isActive ? '#ffffff' : 'rgba(255,255,255,0.70)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.70)'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />

                {!isCollapsed && (
                  <>
                    <span className="flex-1 as-body">{item.label}</span>
                    {isMessages && unreadMessages > 0 && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-400 text-white text-xs font-bold rounded-full">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                    {isActive && !(isMessages && unreadMessages > 0) && (
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    )}
                  </>
                )}

                {isCollapsed && isMessages && unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* ── Logout ── */}
        <div
          className={cn('border-t', isCollapsed ? 'p-2' : 'p-4')}
          style={{ borderColor: 'rgba(255,255,255,0.12)' }}
        >
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 rounded-xl text-sm transition-all duration-300 w-full group',
              isCollapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
            )}
            style={{ color: 'rgba(255,255,255,0.70)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
              e.currentTarget.style.color = '#FCA5A5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.70)'
            }}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-300 transition-colors" />
            {!isCollapsed && (
              <span className="as-body group-hover:text-white transition-colors">Logout</span>
            )}
          </button>
        </div>

      </aside>
    </>
  )
}
