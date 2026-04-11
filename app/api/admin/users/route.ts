import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

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
    const search = searchParams.get('search') ?? ''
    const page   = parseInt(searchParams.get('page') ?? '1')
    const limit  = 10
    const offset = (page - 1) * limit

    const adminClient = createAdminSupabaseClient()

    // Get all users with their auth data
    const { data: authUsers } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 1000, // Get all to filter properly
    })

    let query = adminClient
      .from('profiles')
      .select(`*, user_roles!user_roles_user_id_fkey(role, sub_roles, is_active)`, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('full_name', `%${search}%`)
    }

    const { data: profiles, count, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Merge profiles with email from auth
    const users = (profiles ?? []).map(profile => {
      const authUser = authUsers?.users.find(u => u.id === profile.id)
      return {
        ...profile,
        email: authUser?.email ?? '',
      }
    })

    // Apply pagination
    const paginatedUsers = users.slice(offset, offset + limit)

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        total:      count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
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
