import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Auth pages — logged in users can't access these
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password']

// Role-based route map — which roles can access which routes
const ROLE_ROUTE_MAP: Record<string, string[]> = {
  '/super-admin':       ['super_admin'],
  '/platform-admin':    ['platform_admin', 'super_admin'],
  '/operations-admin':  ['operations_admin', 'super_admin'],
  '/dashboard':         ['business_owner', 'super_admin'],
  '/workspaces':        ['business_owner', 'super_admin'],
  '/rider':             ['courier', 'super_admin'],
  '/account':           ['customer', 'super_admin', 'platform_admin', 'operations_admin', 'business_owner', 'courier'],
}

// Where each role should go after login
const ROLE_HOME: Record<string, string> = {
  super_admin:       '/super-admin/dashboard',
  platform_admin:    '/platform-admin/dashboard',
  operations_admin:  '/operations-admin/dashboard',
  business_owner:    '/dashboard',
  courier:           '/rider/dashboard',
  customer:          '/account',
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // ── Rule 1: Redirect logged-in users away from auth pages ──
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  if (isAuthRoute && user) {
    // Get their role and redirect to correct home
    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = roleRecord?.role ?? 'customer'
    const home = ROLE_HOME[role] ?? '/account'
    return NextResponse.redirect(new URL(home, request.url))
  }

  // ── Rule 2: Redirect logged-out users to login ──
  const isProtected = Object.keys(ROLE_ROUTE_MAP).some(r =>
    pathname.startsWith(r)
  )
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Rule 3: Role-based access control ──
  if (user && isProtected) {
    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const userRole = roleRecord?.role ?? 'customer'

    // Check if user has permission for this route
    for (const [route, allowedRoles] of Object.entries(ROLE_ROUTE_MAP)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          // Redirect to their correct home page
          const home = ROLE_HOME[userRole] ?? '/account'
          return NextResponse.redirect(new URL(home, request.url))
        }
        break
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}