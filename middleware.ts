import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that logged-in users should NOT access
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password']

// Routes that require login
const PROTECTED_ROUTES = [
  '/account',
  '/dashboard',
  '/workspaces',
  '/cart',
  '/wishlist',
  '/super-admin',
  '/platform-admin',
  '/operations-admin',
  '/rider',
]

// Role-based route protection
const ROLE_ROUTES: Record<string, string[]> = {
  '/super-admin':       ['super_admin'],
  '/platform-admin':    ['platform_admin', 'super_admin'],
  '/operations-admin':  ['operations_admin', 'super_admin'],
  '/dashboard':         ['business_owner', 'super_admin'],
  '/rider':             ['courier', 'super_admin'],
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

  // Get current session
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // ── Rule 1: Logged-in users can't access auth pages ──
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  // ── Rule 2: Protected routes need login ──
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Rule 3: Role-based protection ──
  if (user && isProtected) {
    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const userRole = roleRecord?.role ?? 'customer'

    for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate page based on role
        return NextResponse.redirect(new URL('/account', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}