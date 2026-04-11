import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch all requests for this user to count rejections
    const { data: allRequests } = await supabase
      .from('role_upgrade_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const request      = allRequests?.[0] ?? null
    const totalCount   = allRequests?.length ?? 0
    // Attach a virtual request_count based on total rows
    const enriched     = request ? { ...request, request_count: totalCount } : null

    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role, sub_roles')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      request:  enriched,
      role:     roleRecord?.role,
      subRoles: roleRecord?.sub_roles ?? [],
    })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch all existing requests for this user
    const { data: allRequests } = await supabase
      .from('role_upgrade_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const totalCount = allRequests?.length ?? 0
    const latest     = allRequests?.[0] ?? null

    // Block if already pending
    if (latest?.status === 'pending') {
      return NextResponse.json({ error: 'You already have a pending request' }, { status: 400 })
    }

    // Block if approved
    if (latest?.status === 'approved') {
      return NextResponse.json({ error: 'Your request has already been approved' }, { status: 400 })
    }

    // Block if 3 requests already submitted
    if (totalCount >= 3) {
      return NextResponse.json(
        { error: 'You have reached the maximum number of requests (3). You can no longer send requests.' },
        { status: 400 }
      )
    }

    // Insert a new request row each time
    const { data: request, error } = await supabase
      .from('role_upgrade_requests')
      .insert({
        user_id:            user.id,
        requested_role:     'business_owner',
        requested_sub_role: 'retailer',
        status:             'pending',
        reason:             'Customer requesting retailer access',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Attach virtual request_count
    const enriched = { ...request, request_count: totalCount + 1 }

    return NextResponse.json({
      request: enriched,
      message: 'Request submitted! Admin will review it soon.',
    })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
