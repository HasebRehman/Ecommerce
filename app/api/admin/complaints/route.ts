import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    if (!roleRecord || !['super_admin', 'operations_admin'].includes(roleRecord.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminSupabaseClient()

    // Get all contact messages
    const { data: complaints, error } = await adminClient
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching complaints:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      complaints: complaints || [],
      total: complaints?.length || 0,
    })

  } catch (err) {
    console.error('GET /api/admin/complaints error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Mark complaint as read
export async function PATCH(request: Request) {
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

    if (!roleRecord || !['super_admin', 'operations_admin'].includes(roleRecord.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, read } = await request.json()

    const adminClient = createAdminSupabaseClient()

    const { error } = await adminClient
      .from('contact_messages')
      .update({ read })
      .eq('id', id)

    if (error) {
      console.error('Error updating complaint:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('PATCH /api/admin/complaints error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
