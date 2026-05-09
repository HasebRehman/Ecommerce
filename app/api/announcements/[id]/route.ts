import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_ROLES = ['super_admin', 'platform_admin']

// ── PATCH /api/announcements/[id] — update announcement (super_admin / platform_admin only) ──
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Build update object from provided fields only
    const updates: Record<string, unknown> = {}

    if (subject !== undefined) {
      if (!subject?.trim()) {
        return NextResponse.json({ error: 'subject cannot be empty' }, { status: 400 })
      }
      updates.subject = subject.trim()
    }

    if (message !== undefined) {
      if (!message?.trim()) {
        return NextResponse.json({ error: 'message cannot be empty' }, { status: 400 })
      }
      updates.message = message.trim()
    }

    if (scheduledAt !== undefined) {
      const scheduledDate = new Date(scheduledAt)
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json({ error: 'Invalid scheduledAt format' }, { status: 400 })
      }
      updates.scheduled_at = scheduledDate.toISOString()
      // Recompute status when scheduledAt changes
      updates.status = scheduledDate <= new Date() ? 'published' : 'scheduled'
    }

    if (targetRoles !== undefined) {
      if (!Array.isArray(targetRoles) || targetRoles.length === 0) {
        return NextResponse.json({ error: 'targetRoles must be a non-empty array' }, { status: 400 })
      }
      updates.target_roles = targetRoles
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const adminClient = createAdminSupabaseClient()
    const { data: announcement, error } = await adminClient
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    return NextResponse.json({ announcement })

  } catch (err) {
    console.error('PATCH /api/announcements/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
