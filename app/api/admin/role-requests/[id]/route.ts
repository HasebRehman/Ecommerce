import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }        = await params
    const supabase      = await createClient()
    const adminSupabase = createAdminSupabaseClient() // no await

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, review_notes } = await request.json()

    console.log('Reviewing request:', id, 'Action:', status)

    // Update the request status
    const { data: updated, error: updateError } = await adminSupabase
      .from('role_upgrade_requests')
      .update({
        status,
        review_notes: review_notes ?? null,
        reviewed_by:  user.id,
        reviewed_at:  new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    console.log('Updated request:', updated, 'Error:', updateError)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // If approved → upgrade user role to business_owner + retailer
    if (status === 'approved' && updated) {
      const { error: roleError } = await adminSupabase
        .from('user_roles')
        .update({
          role:      'business_owner',
          sub_roles: ['retailer'],
          is_active: true,
        })
        .eq('user_id', updated.user_id)

      console.log('Role update error:', roleError)

      if (roleError) {
        return NextResponse.json({ error: roleError.message }, { status: 400 })
      }
    }

    return NextResponse.json({
      request: updated,
      message: status === 'approved'
        ? 'Request approved! User is now a Retailer.'
        : 'Request rejected.',
    })

  } catch (err) {
    console.error('PUT role-request error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}