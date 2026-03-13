import { createAdminSupabaseClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }        = await params
    const supabase      = await createClient()
    const adminSupabase = createAdminSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roleRecord } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    if (!ADMIN_ROLES.includes(roleRecord?.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', id).single()
    const { data: role }    = await adminSupabase.from('user_roles').select('*').eq('user_id', id).single()
    const { data: authUser } = await adminSupabase.auth.admin.getUserById(id)

    return NextResponse.json({
      profile,
      role,
      email: authUser?.user?.email ?? '',
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }        = await params
    const supabase      = await createClient()
    const adminSupabase = createAdminSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roleRecord } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    if (!ADMIN_ROLES.includes(roleRecord?.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()

    if (body.role) {
      await adminSupabase.from('user_roles').update({ role: body.role }).eq('user_id', id)
    }
    if (body.is_active !== undefined) {
      await adminSupabase.from('user_roles').update({ is_active: body.is_active }).eq('user_id', id)
    }

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}