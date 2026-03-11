import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    if (!ADMIN_ROLES.includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action, review_notes } = await request.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const adminClient = createAdminSupabaseClient()

    const { data: upgradeRequest, error: fetchError } = await adminClient
      .from('role_upgrade_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !upgradeRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Update request status
    await adminClient
      .from('role_upgrade_requests')
      .update({
        status:       action === 'approve' ? 'approved' : 'rejected',
        reviewed_by:  user.id,
        reviewed_at:  new Date().toISOString(),
        review_notes: review_notes ?? null,
      })
      .eq('id', params.id)

    // If approved — upgrade the user's role
    if (action === 'approve') {
      const { data: existingRole } = await adminClient
        .from('user_roles')
        .select('*')
        .eq('user_id', upgradeRequest.user_id)
        .single()

      if (upgradeRequest.requested_sub_role) {
        const currentSubRoles = existingRole?.sub_roles ?? []
        let newSubRoles = [...currentSubRoles, upgradeRequest.requested_sub_role]

        // Auto-upgrade to merchant if has both retailer and supplier
        if (
          newSubRoles.includes('retailer') &&
          newSubRoles.includes('supplier')
        ) {
          newSubRoles = ['merchant']
        }

        await adminClient
          .from('user_roles')
          .update({ role: 'business_owner', sub_roles: newSubRoles })
          .eq('user_id', upgradeRequest.user_id)

      } else {
        await adminClient
          .from('user_roles')
          .update({ role: upgradeRequest.requested_role })
          .eq('user_id', upgradeRequest.user_id)
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? 'Request approved and role upgraded!'
        : 'Request rejected.',
    })

  } catch (err) {
    console.error('Role request review error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}