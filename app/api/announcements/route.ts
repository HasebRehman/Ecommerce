import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_ROLES = ['super_admin', 'platform_admin']

// ── GET /api/announcements — list all (super_admin / platform_admin only) ──
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

    if (!ALLOWED_ROLES.includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminSupabaseClient()
    
    // First, auto-publish any scheduled announcements that are due
    await adminClient
      .from('announcements')
      .update({ status: 'published' })
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())

    // Calculate start of today (midnight UTC) for auto-expiry
    const now = new Date()
    const startOfToday = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ))

    // Then fetch all announcements from today onwards (auto-expire at midnight)
    const { data: announcements, error } = await adminClient
      .from('announcements')
      .select('*')
      .gte('scheduled_at', startOfToday.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ announcements })

  } catch (err) {
    console.error('GET /api/announcements error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/announcements — create announcement (super_admin / platform_admin only) ──
export async function POST(request: Request) {
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

    if (!ALLOWED_ROLES.includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { subject, message, scheduledAt, targetRoles } = body

    // Validate required fields
    if (!subject?.trim()) {
      return NextResponse.json({ error: 'Missing required field: subject' }, { status: 400 })
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Missing required field: message' }, { status: 400 })
    }
    if (!scheduledAt) {
      return NextResponse.json({ error: 'Missing required field: scheduledAt' }, { status: 400 })
    }
    if (!targetRoles || !Array.isArray(targetRoles) || targetRoles.length === 0) {
      return NextResponse.json({ error: 'Missing required field: targetRoles' }, { status: 400 })
    }

    // Validate scheduledAt is a valid date
    const scheduledDate = new Date(scheduledAt)
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledAt format' }, { status: 400 })
    }

    // Compute status based on scheduled time vs now
    const now = new Date()
    const status = scheduledDate <= now ? 'published' : 'scheduled'

    const adminClient = createAdminSupabaseClient()
    const { data: announcement, error } = await adminClient
      .from('announcements')
      .insert({
        subject:      subject.trim(),
        message:      message.trim(),
        scheduled_at: scheduledDate.toISOString(),
        status,
        target_roles: targetRoles,
        created_by:   user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating announcement:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to create announcement',
        details: error.details || 'Database operation failed',
        hint: error.hint || 'Check if the announcements table exists'
      }, { status: 400 })
    }

    return NextResponse.json({ announcement }, { status: 201 })

  } catch (err) {
    console.error('POST /api/announcements error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
