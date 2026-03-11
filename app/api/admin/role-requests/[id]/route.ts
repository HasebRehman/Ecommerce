import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    if (!['super_admin', 'platform_admin'].includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, review_notes } = body
    // action = 'approve' | 'reject'

    const adminClient = createAdminSupabaseClient()

    // Get the request
    const { data: upgradeRequest } = await adminClient
      .from('role_upgrade_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!upgradeRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Update request status
    await adminClient
      .from('role_upgrade_requests')
      .update({
        status:       action === 'approve' ? 'approved' : 'rejected',
        reviewed_by:  user.id,
        reviewed_at:  new Date().toISOString(),
        review_notes,
      })
      .eq('id', params.id)

    // If approved — update user role
    if (action === 'approve') {
      const { data: existingRole } = await adminClient
        .from('user_roles')
        .select('*')
        .eq('user_id', upgradeRequest.user_id)
        .single()

      // Handle sub_role upgrades
      if (upgradeRequest.requested_sub_role) {
        const currentSubRoles = existingRole?.sub_roles ?? []
        let newSubRoles = [...currentSubRoles, upgradeRequest.requested_sub_role]

        // Auto-upgrade to merchant if has both retailer and supplier
        const isMerchant =
          newSubRoles.includes('retailer') &&
          newSubRoles.includes('supplier')

        if (isMerchant) {
          newSubRoles = ['merchant']
        }

        await adminClient
          .from('user_roles')
          .update({
            role:      'business_owner',
            sub_roles: newSubRoles,
          })
          .eq('user_id', upgradeRequest.user_id)

      } else {
        // Full role upgrade
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
        : 'Request rejected',
    })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}