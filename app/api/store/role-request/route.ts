import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: request } = await supabase
      .from('role_upgrade_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role, sub_roles')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      request:  request ?? null,
      role:     roleRecord?.role,
      subRoles: roleRecord?.sub_roles ?? [],
    })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if already has pending request
    const { data: existing } = await supabase
      .from('role_upgrade_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a pending request' },
        { status: 400 }
      )
    }

    const { data: request, error } = await supabase
      .from('role_upgrade_requests')
      .insert({
        user_id:           user.id,
        requested_role:    'business_owner',
        requested_sub_role: 'retailer',
        status:            'pending',
        reason:            'Customer requesting retailer access',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      request,
      message: 'Request submitted! Admin will review it soon.',
    })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}