import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

// GET /api/admin/messages — unread count per sender for current user
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

    // Unread messages sent TO current user
    const { data: unread } = await adminSupabase
      .from('admin_messages')
      .select('sender_id')
      .eq('receiver_id', user.id)
      .eq('is_read', false)

    // Count per sender
    const unreadMap: Record<string, number> = {}
    unread?.forEach(m => {
      unreadMap[m.sender_id] = (unreadMap[m.sender_id] ?? 0) + 1
    })

    const totalUnread = unread?.length ?? 0

    return NextResponse.json({ unreadMap, totalUnread })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/admin/messages — send a message
export async function POST(request: Request) {
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

    const { receiver_id, message } = await request.json()
    if (!receiver_id || !message?.trim()) {
      return NextResponse.json({ error: 'receiver_id and message are required' }, { status: 400 })
    }

    // Verify receiver is also an admin
    const { data: receiverRole } = await adminSupabase
      .from('user_roles').select('role').eq('user_id', receiver_id).single()
    if (!ADMIN_ROLES.includes(receiverRole?.role)) {
      return NextResponse.json({ error: 'Receiver is not an admin' }, { status: 400 })
    }

    const { data: msg, error } = await adminSupabase
      .from('admin_messages')
      .insert({
        sender_id:   user.id,
        receiver_id,
        message:     message.trim(),
        is_read:     false,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Database error inserting message:', error)
      
      // Provide helpful error message if table doesn't exist
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Database table "admin_messages" does not exist. Please run the migration script in supabase-migrations/create-admin-messages-table.sql' 
        }, { status: 500 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('✅ Message inserted successfully:', msg)
    return NextResponse.json({ message: msg })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
