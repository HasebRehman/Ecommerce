'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/lib/services/auth.service'
import LoadingScreen from '@/components/common/LoadingScreen'

// Pages anyone can visit without login
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password']

// Auth pages — logged-in users should NOT see these
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password']

// Where each role goes after login
const ROLE_HOME: Record<string, string> = {
  super_admin:       '/admin/dashboard',
  platform_admin:    '/admin/dashboard',
  operations_admin:  '/admin/dashboard',
  business_owner:    '/dashboard',
  courier:           '/rider/dashboard',
  customer:          '/account',
}

// Which route prefixes each role is allowed to access
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  super_admin:       ['/admin'],
  platform_admin:    ['/admin'],
  operations_admin:  ['/admin'],
  business_owner:    ['/dashboard', '/workspaces'],
  courier:           ['/rider'],
  customer:          ['/account', '/cart', '/wishlist'],
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router   = usePathname()
  const pathname = usePathname()
  const {
    setUser,
    setRole,
    setSubRoles,
    setLoading,
    clearAuth,
    isLoading,
  } = useAuthStore()

  const routerNav = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const initializeAuth = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          // ── Logged in ──
          const userData = await authService.getMe()

          if (!userData?.profile) {
            clearAuth()
            setLoading(false)
            return
          }

          setUser(userData.profile)
          setRole(userData.role)
          setSubRoles(userData.subRoles)

          const userRole = userData.role
          const home     = ROLE_HOME[userRole] ?? '/account'

          // If on auth page → redirect to their home
          if (AUTH_ROUTES.some(r => pathname.startsWith(r))) {
            routerNav.replace(home)
            return
          }

          // If on wrong role page → redirect to their home
          const allowedPrefixes = ROLE_ALLOWED_PREFIXES[userRole] ?? ['/account']
          const isPublic        = PUBLIC_ROUTES.includes(pathname)
          const isAllowed       = allowedPrefixes.some(prefix =>
            pathname.startsWith(prefix)
          )

          if (!isAllowed && !isPublic) {
            routerNav.replace(home)
          }

        } else {
          // ── Not logged in ──
          clearAuth()

          const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
          if (!isPublic) {
            routerNav.replace('/login')
          }
        }
      } catch {
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const userData = await authService.getMe()
            if (userData?.profile) {
              setUser(userData.profile)
              setRole(userData.role)
              setSubRoles(userData.subRoles)
            }
          } catch {
            clearAuth()
          }
        }

        if (event === 'SIGNED_OUT') {
          clearAuth()
          routerNav.replace('/login')
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Session refreshed automatically')
        }
      }
    )

    return () => subscription.unsubscribe()

  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return <>{children}</>
}