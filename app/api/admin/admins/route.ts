import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

export async function GET() {
  try {
    const supabase      = await createClient()
    const adminSupabase = createAdminSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roleRecord } = await supabase
      .from('user_roles').select('role').eq('user_id', user.id).single()

    if (!ADMIN_ROLES.includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all admin user_roles
    const { data: adminRoles } = await adminSupabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', ADMIN_ROLES)
      .eq('is_active', true)

    const adminIds = (adminRoles ?? [])
      .map(r => r.user_id)
      .filter(id => id !== user.id) // exclude self

    if (adminIds.length === 0) {
      return NextResponse.json({ admins: [] })
    }

    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', adminIds)

    const roleMap: Record<string, string> = {}
    adminRoles?.forEach(r => { roleMap[r.user_id] = r.role })

    const admins = (profiles ?? []).map(p => ({
      id:         p.id,
      full_name:  p.full_name,
      username:   p.username,
      avatar_url: p.avatar_url,
      role:       roleMap[p.id] ?? 'admin',
    }))

    return NextResponse.json({ admins })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
