import { createAdminSupabaseClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase      = await createClient()
    const adminSupabase = await createAdminSupabaseClient()

    // Get current logged in user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Current user:', user?.id, authError)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use REGULAR supabase (not admin) to check role — so RLS uses current user
    const { data: roleRecord, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    console.log('Role record:', roleRecord, roleError)

    const adminRoles = ['super_admin', 'platform_admin', 'operations_admin']
    if (!roleRecord || !adminRoles.includes(roleRecord.role)) {
      return NextResponse.json(
        { error: 'Forbidden', role: roleRecord?.role },
        { status: 403 }
      )
    }

    // Now use admin client to fetch ALL requests bypassing RLS
    const { data: requests, error } = await adminSupabase
      .from('role_upgrade_requests')
      .select(`
        *,
        profiles!role_upgrade_requests_user_id_fkey(
          full_name,
          username
        )
      `)
      .order('created_at', { ascending: false })

    console.log('Requests count:', requests?.length, error)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get emails via admin auth
    const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
    const emailMap: Record<string, string> = {}
    authUsers?.users?.forEach(u => {
      emailMap[u.id] = u.email ?? ''
    })

    const enriched = (requests ?? []).map(r => ({
      ...r,
      email: emailMap[r.user_id] ?? '',
    }))

    return NextResponse.json({ requests: enriched })

  } catch (err) {
    console.error('GET role-requests error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}