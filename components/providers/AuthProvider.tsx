'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/lib/services/auth.service'
import LoadingScreen from '@/components/common/LoadingScreen'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
]

const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
]

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { isLoading } = useAuthStore()
    const router = useRouter()
    const pathname = usePathname()
    const { setUser, setRole, setSubRoles, setLoading, clearAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Check session on first load
    const initializeAuth = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()

        

        if (session) {
          // Session exists — get user data
          const userData = await authService.getMe()
          setUser(userData.profile)
          setRole(userData.role)
          setSubRoles(userData.subRoles)

          // If on auth page, redirect to account
          if (AUTH_ROUTES.includes(pathname)) {
            router.push('/account')
          }


        } else {
          // No session — clear auth
          clearAuth()

          // If on protected page, redirect to login
          const isProtected = !PUBLIC_ROUTES.includes(pathname)
          if (isProtected) {
            router.push('/login')
          }
        }
      } catch {
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const userData = await authService.getMe()
            setUser(userData.profile)
            setRole(userData.role)
            setSubRoles(userData.subRoles)
          } catch {
            clearAuth()
          }
        }

        if (event === 'SIGNED_OUT') {
          clearAuth()
          router.push('/login')
        }

        if (event === 'TOKEN_REFRESHED' && session) {
          // Token auto-refreshed — session continues silently
          console.log('Session refreshed automatically')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return <LoadingScreen />
}

return <>{children}</>
}