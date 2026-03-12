import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password']

const ROLE_ROUTE_MAP: Record<string, string[]> = {
  '/admin':      ['super_admin', 'platform_admin', 'operations_admin'],
  '/dashboard':  ['business_owner'],
  '/workspaces': ['business_owner'],
  '/rider':      ['courier'],
  '/account':    ['customer', 'business_owner', 'courier',
                  'super_admin', 'platform_admin', 'operations_admin'],
  // NOTE: /, /cart, /wishlist, /product, /shop are PUBLIC
  // so they are NOT in this map
}

export const ROLE_HOME: Record<string, string> = {
  super_admin:       '/admin/dashboard',
  platform_admin:    '/admin/dashboard',
  operations_admin:  '/admin/dashboard',
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
        getAll() { return request.cookies.getAll() },
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

  // Rule 1: Auth pages — redirect logged-in users
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  if (isAuthRoute && user) {
    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    const home = ROLE_HOME[roleRecord?.role ?? 'customer'] ?? '/account'
    return NextResponse.redirect(new URL(home, request.url))
  }

  // Rule 2: Protected routes — redirect logged-out users
  const isProtected = Object.keys(ROLE_ROUTE_MAP).some(r =>
    pathname.startsWith(r)
  )
  if (isProtected && !user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Rule 3: Role-based access control
  if (user && isProtected) {
    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const userRole = roleRecord?.role ?? 'customer'

    for (const [route, allowedRoles] of Object.entries(ROLE_ROUTE_MAP)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}