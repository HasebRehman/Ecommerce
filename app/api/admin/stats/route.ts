import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is super admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!['super_admin', 'platform_admin'].includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get stats using admin client
    const adminClient = createAdminSupabaseClient()

    const [
      { count: totalUsers },
      { count: totalWorkspaces },
      { count: pendingRequests },
      { data: recentUsers },
    ] = await Promise.all([
      adminClient.from('profiles').select('*', { count: 'exact', head: true }),
      adminClient.from('workspaces').select('*', { count: 'exact', head: true }),
      adminClient.from('role_upgrade_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      adminClient.from('profiles')
        .select('*, user_roles(role)')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    return NextResponse.json({
      stats: {
        totalUsers:       totalUsers ?? 0,
        totalWorkspaces:  totalWorkspaces ?? 0,
        pendingRequests:  pendingRequests ?? 0,
      },
      recentUsers: recentUsers ?? [],
    })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}