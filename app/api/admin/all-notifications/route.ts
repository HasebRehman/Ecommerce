import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    if (!roleRecord || !['super_admin', 'operations_admin'].includes(roleRecord.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get pagination params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10
    const offset = (page - 1) * limit

    const adminClient = createAdminSupabaseClient()

    // Get total count
    const { count: totalCount } = await adminClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })

    // Get paginated notifications with user info
    const { data: notifications, error } = await adminClient
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get user info and roles for each notification
    const notificationsWithUserData = await Promise.all(
      (notifications || []).map(async (notif) => {
        // Get user profile
        const { data: userProfile } = await adminClient
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('id', notif.user_id)
          .single()

        // Get user role
        const { data: userRole } = await adminClient
          .from('user_roles')
          .select('role')
          .eq('user_id', notif.user_id)
          .single()

        return {
          ...notif,
          user: userProfile || {
            id: notif.user_id,
            full_name: 'Unknown User',
            email: '',
            avatar_url: null,
          },
          user_role: userRole?.role || 'customer',
        }
      })
    )

    return NextResponse.json({
      notifications: notificationsWithUserData,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        hasMore: (offset + limit) < (totalCount || 0),
      },
    })

  } catch (err) {
    console.error('GET /api/admin/all-notifications error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
