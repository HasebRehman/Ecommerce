import { createAdminSupabaseClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase      = await createClient()
    const adminSupabase = createAdminSupabaseClient()

    // Step 1 — get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('1. User:', user?.id, '| Auth error:', authError?.message)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 2 — check role using admin client (bypasses RLS)
    const { data: roleRecord, error: roleError } = await adminSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    console.log('2. Role record:', roleRecord, '| Role error:', roleError?.message)

    const adminRoles = ['super_admin', 'platform_admin', 'operations_admin']

    if (!roleRecord || !adminRoles.includes(roleRecord.role)) {
      return NextResponse.json({
        error:  'Forbidden',
        userId: user.id,
        role:   roleRecord?.role ?? 'not found',
      }, { status: 403 })
    }

    // Step 3 — fetch all requests
    const { data: requests, error: reqError } = await adminSupabase
      .from('role_upgrade_requests')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('3. Requests:', requests?.length, '| Req error:', reqError?.message)

    if (reqError) {
      return NextResponse.json({ error: reqError.message }, { status: 400 })
    }

    // Step 4 — get profiles
    const userIds = (requests ?? []).map(r => r.user_id)
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])

    const profileMap: Record<string, any> = {}
    profiles?.forEach(p => { profileMap[p.id] = p })

    // Step 5 — get emails
    const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
    const emailMap: Record<string, string> = {}
    authUsers?.users?.forEach(u => { emailMap[u.id] = u.email ?? '' })

    const enriched = (requests ?? []).map(r => ({
      ...r,
      profiles: profileMap[r.user_id] ?? null,
      email:    emailMap[r.user_id]   ?? '',
    }))

    return NextResponse.json({ requests: enriched })

  } catch (err: any) {
    console.error('GET role-requests error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}