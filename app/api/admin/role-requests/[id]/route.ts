import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

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

    const body   = await request.json()
    const status = body.status ?? (body.action === 'approve' ? 'approved' : body.action === 'reject' ? 'rejected' : null)

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data: upgradeRequest, error: fetchError } = await adminSupabase
      .from('role_upgrade_requests').select('*').eq('id', id).single()

    if (fetchError || !upgradeRequest) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

    await adminSupabase.from('role_upgrade_requests').update({
      status,
      reviewed_by:  user.id,
      reviewed_at:  new Date().toISOString(),
      review_notes: body.review_notes ?? null,
    }).eq('id', id)

    if (status === 'approved') {
      await adminSupabase.from('user_roles').update({
        role:      'business_owner',
        sub_roles: ['retailer'],
        is_active: true,
      }).eq('user_id', upgradeRequest.user_id)
    }

    return NextResponse.json({
      success: true,
      message: status === 'approved' ? 'Request approved! User is now a Retailer.' : 'Request rejected.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}