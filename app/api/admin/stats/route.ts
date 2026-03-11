import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

export async function GET() {
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

    const adminClient = createAdminSupabaseClient()

    const [
      { count: totalUsers },
      { count: totalWorkspaces },
      { count: pendingRequests },
      { data: recentUsers },
    ] = await Promise.all([
      adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      adminClient
        .from('workspaces')
        .select('*', { count: 'exact', head: true }),
      adminClient
        .from('role_upgrade_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      adminClient
        .from('profiles')
        .select('*, user_roles!user_roles_user_id_fkey(role)')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    return NextResponse.json({
      stats: {
        totalUsers:      totalUsers      ?? 0,
        totalWorkspaces: totalWorkspaces ?? 0,
        pendingRequests: pendingRequests ?? 0,
      },
      recentUsers: recentUsers ?? [],
    })

  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}