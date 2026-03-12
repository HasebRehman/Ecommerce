'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/lib/services/auth.service'
import LoadingScreen from '@/components/common/LoadingScreen'

const PUBLIC_ROUTES  = ['/', '/login', '/signup', '/forgot-password',
                        '/cart', '/wishlist', '/request-seller']
const AUTH_ROUTES    = ['/login', '/signup', '/forgot-password']
const PUBLIC_PREFIXES = ['/product', '/shop']

// Routes that require a specific role
const PROTECTED_PREFIXES: Record<string, string[]> = {
  '/admin':      ['super_admin', 'platform_admin', 'operations_admin'],
  '/dashboard':  ['business_owner'],
  '/workspaces': ['business_owner'],
  '/rider':      ['courier'],
  '/account':    ['customer', 'business_owner', 'courier',
                  'super_admin', 'platform_admin', 'operations_admin'],
}

// Where to redirect if user tries a protected route they can't access
const ROLE_HOME: Record<string, string> = {
  super_admin:      '/admin/dashboard',
  platform_admin:   '/admin/dashboard',
  operations_admin: '/admin/dashboard',
  business_owner:   '/',
  courier:          '/',
  customer:         '/',
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return true
  return false
}

function getRequiredRoles(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(PROTECTED_PREFIXES)) {
    if (pathname.startsWith(prefix)) return roles
  }
  return null
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router   = useRouter()
  const pathname = usePathname()
  const {
    setUser, setRole, setSubRoles,
    setLoading, clearAuth, isLoading,
  } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    const initializeAuth = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          const userData = await authService.getMe()
          if (!userData?.profile) {
            clearAuth()
            setLoading(false)
            return
          }

          setUser(userData.profile)
          setRole(userData.role)
          setSubRoles(userData.subRoles)

          const role = userData.role

          // If on auth page (login/signup) → go to landing
          if (AUTH_ROUTES.some(r => pathname.startsWith(r))) {
            router.replace('/')
            return
          }

          // If on a protected route, check role access
          const requiredRoles = getRequiredRoles(pathname)
          if (requiredRoles && !requiredRoles.includes(role)) {
            router.replace(ROLE_HOME[role] ?? '/')
            return
          }

        } else {
          clearAuth()

          // If on a protected route → redirect to login
          if (!isPublicPath(pathname)) {
            const requiredRoles = getRequiredRoles(pathname)
            if (requiredRoles) {
              router.replace('/login')
              return
            }
          }
        }
      } catch {
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

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
          router.replace('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (isLoading) return <LoadingScreen />
  return <>{children}</>
}