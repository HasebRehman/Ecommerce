import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    if (roleRecord?.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminSupabaseClient()

    // 1. Total Users
    const { count: totalUsers } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // 2. Pending Role Requests
    const { count: pendingRoleRequests } = await adminClient
      .from('role_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // 3. Total Reports
    const { count: totalReports } = await adminClient
      .from('reports')
      .select('*', { count: 'exact', head: true })

    // 4. Scheduled Announcements
    const { count: scheduledAnnouncements } = await adminClient
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled')

    // 5. Latest 3 Users
    const { data: latestUsers } = await adminClient
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(3)

    // Get roles for latest users
    const latestUsersWithRoles = await Promise.all(
      (latestUsers || []).map(async (user) => {
        const { data: roleData } = await adminClient
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        return {
          ...user,
          role: roleData?.role || 'customer'
        }
      })
    )

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      pendingRoleRequests: pendingRoleRequests || 0,
      totalReports: totalReports || 0,
      scheduledAnnouncements: scheduledAnnouncements || 0,
      latestUsers: latestUsersWithRoles,
    })

  } catch (err) {
    console.error('GET /api/admin/platform-dashboard-stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
