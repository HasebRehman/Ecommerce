import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server' 

// Get all reports (admin only)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check admin role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || !['super_admin', 'platform_admin', 'operations_admin'].includes(userRole.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('reports')
      .select(`
        id, reason, message, media_urls, status, created_at,
        user_id,
        shops(id, name, logo_url, owner_id),
        products(id, name, images)
      `)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Get reporter profiles
    const userIds = [...new Set(data?.map(r => r.user_id).filter(Boolean))] as string[]
    const { data: reporters } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds)

    // Get seller profiles
    const rawOwnerIds = data?.map((r: any) => {
      const shop = Array.isArray(r.shops) ? r.shops[0] : r.shops
      return shop?.owner_id
    }).filter(Boolean)
    const ownerIds = [...new Set(rawOwnerIds)] as string[]
    const { data: sellers } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, phone')
      .in('id', ownerIds)

    // Fetch emails via admin client (getUserById per user is reliable)
    const emailMap = new Map<string, string>()
    try {
      const adminClient = createAdminSupabaseClient()
      const allIds = [...new Set([...userIds, ...ownerIds])]
      await Promise.all(
        allIds.map(async uid => {
          const { data: u } = await adminClient.auth.admin.getUserById(uid)
          if (u?.user?.email) emailMap.set(uid, u.user.email)
        })
      )
    } catch {
      // emails stay empty on failure
    }

    // Combine data
    const reports = (data ?? []).map((report: any) => {
      const shopData = Array.isArray(report.shops) ? report.shops[0] : report.shops
      const reporter = reporters?.find(r => r.id === report.user_id)
      const seller   = sellers?.find(s => s.id === shopData?.owner_id)

      return {
        ...report,
        shops: shopData,
        reporter: reporter ? {
          ...reporter,
          email: emailMap.get(report.user_id) || null,
        } : null,
        seller: seller ? {
          ...seller,
          email: emailMap.get(shopData?.owner_id) || null,
        } : null,
      }
    })

    return NextResponse.json({ reports })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}