import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']
const HIDDEN_FROM_PLATFORM_ADMIN = ['super_admin', 'platform_admin', 'operations_admin']

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!ADMIN_ROLES.includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search  = searchParams.get('search') ?? ''
    const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit   = 10
    const offset  = (page - 1) * limit

    const adminClient = createAdminSupabaseClient()
    const isPlatformAdmin = roleRecord?.role === 'platform_admin'

    // ── Build profiles query ──────────────────────────────────────────────
    let query = adminClient
      .from('profiles')
      .select(`*, user_roles!user_roles_user_id_fkey(role, sub_roles, is_active, is_banned)`, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('full_name', `%${search}%`)
    }

    // Fetch ALL matching profiles (needed to filter by role server-side)
    const { data: allProfiles, count: rawCount, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // ── Filter out admin roles for platform_admin ─────────────────────────
    let filteredProfiles = allProfiles ?? []
    if (isPlatformAdmin) {
      filteredProfiles = filteredProfiles.filter(profile => {
        const role = profile.user_roles?.[0]?.role ?? 'customer'
        return !HIDDEN_FROM_PLATFORM_ADMIN.includes(role)
      })
    }

    const total = filteredProfiles.length

    // ── Apply pagination after filtering ─────────────────────────────────
    const paginatedProfiles = filteredProfiles.slice(offset, offset + limit)

    // ── Fetch auth emails for only the paginated users ────────────────────
    const { data: authUsersData } = await adminClient.auth.admin.listUsers({
      page:    1,
      perPage: 1000,
    })

    const emailMap: Record<string, string> = {}
    authUsersData?.users?.forEach(u => { emailMap[u.id] = u.email ?? '' })

    const users = paginatedProfiles.map(profile => ({
      ...profile,
      email: emailMap[profile.id] ?? '',
    }))

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })

  } catch (err) {
    console.error('Admin users error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
