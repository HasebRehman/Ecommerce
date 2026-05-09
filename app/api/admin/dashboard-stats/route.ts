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

    if (roleRecord?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminSupabaseClient()

    // 1. Total Users
    const { count: totalUsers } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // 2. Role Requests (pending)
    const { count: roleRequests } = await adminClient
      .from('role_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // 3. Security Score (from monitoring - same logic as monitoring page)
    const securityIssues: string[] = []
    let securityScore = 100

    // Check environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      securityIssues.push('Missing service role key')
      securityScore -= 20
    }
    if (!process.env.CRON_SECRET) {
      securityIssues.push('Missing cron secret')
      securityScore -= 10
    }

    // Check RLS policies (sample check on announcements table)
    try {
      const { data: policies } = await adminClient
        .rpc('pg_policies')
        .select('*')
        .eq('tablename', 'announcements')
      
      if (!policies || policies.length === 0) {
        securityIssues.push('Missing RLS policies on critical tables')
        securityScore -= 15
      }
    } catch {
      // RLS check failed, but don't penalize
    }

    // Check for recent failed login attempts (if you have auth logs)
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await adminClient
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('is_banned', true)
        .gte('updated_at', oneDayAgo)
      
      if (count && count > 10) {
        securityIssues.push(`${count} accounts banned in last 24h`)
        securityScore -= 5
      }
    } catch {
      // Ignore
    }

    // 4. System Notifications (total)
    const { count: systemNotifications } = await adminClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })

    // 5. Latest Reports (no action taken - status = pending)
    const { data: latestReports } = await adminClient
      .from('reports')
      .select(`
        id,
        reason,
        created_at,
        user_id,
        profiles!reports_user_id_fkey (
          full_name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)

    const reportsWithNames = (latestReports || []).map(report => ({
      id: report.id,
      reason: report.reason,
      created_at: report.created_at,
      reporter_name: (report.profiles as any)?.full_name || 'Unknown User',
    }))

    // 6. Unread Complaints
    const { count: unreadComplaints } = await adminClient
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)

    // 7. User Growth (last 6 months)
    const userGrowth = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const { count } = await adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())

      userGrowth.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        users: count || 0,
      })
    }

    // 8. Role Requests Over Time (by status)
    const { data: allRequests } = await adminClient
      .from('role_requests')
      .select('status')

    const requestsOverTime = [
      { status: 'pending', count: 0 },
      { status: 'approved', count: 0 },
      { status: 'rejected', count: 0 },
    ]

    allRequests?.forEach(req => {
      const item = requestsOverTime.find(r => r.status === req.status)
      if (item) item.count++
    })

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      roleRequests: roleRequests || 0,
      securityScore: Math.max(0, securityScore),
      systemNotifications: systemNotifications || 0,
      latestReports: reportsWithNames,
      unreadComplaints: unreadComplaints || 0,
      userGrowth,
      requestsOverTime,
    })

  } catch (err) {
    console.error('GET /api/admin/dashboard-stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
