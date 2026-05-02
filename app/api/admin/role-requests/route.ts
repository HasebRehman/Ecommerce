import { createAdminSupabaseClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase      = await createClient()
    const adminSupabase = createAdminSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roleRecord } = await adminSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!['super_admin', 'platform_admin'].includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch ALL requests (multiple rows per user possible)
    const { data: allRequests, error: reqError } = await adminSupabase
      .from('role_upgrade_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (reqError) return NextResponse.json({ error: reqError.message }, { status: 400 })

    // Count rows per user to derive request_count
    const countPerUser: Record<string, number> = {}
    for (const r of allRequests ?? []) {
      countPerUser[r.user_id] = (countPerUser[r.user_id] ?? 0) + 1
    }

    // Deduplicate — keep only the latest row per user
    const latestPerUser = new Map<string, any>()
    for (const r of allRequests ?? []) {
      if (!latestPerUser.has(r.user_id)) {
        latestPerUser.set(r.user_id, r)
      }
    }
    const requests = Array.from(latestPerUser.values())

    const userIds     = requests.map(r => r.user_id)
    const placeholder = ['00000000-0000-0000-0000-000000000000']

    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds.length > 0 ? userIds : placeholder)

    const profileMap: Record<string, any> = {}
    profiles?.forEach(p => { profileMap[p.id] = p })

    const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
    const emailMap: Record<string, string> = {}
    authUsers?.users?.forEach(u => { emailMap[u.id] = u.email ?? '' })

    const enriched = requests.map(r => ({
      ...r,
      request_count: countPerUser[r.user_id] ?? 1,
      profiles:      profileMap[r.user_id] ?? null,
      email:         emailMap[r.user_id]   ?? '',
    }))

    return NextResponse.json({ requests: enriched })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
