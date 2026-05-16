import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ── GET /api/announcements/active — published announcements for the caller's role ──
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

    const userRole = roleRecord?.role ?? 'customer'

    // First, auto-publish any scheduled announcements that are due
    await supabase
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

    // Filter published announcements whose target_roles contains the user's role
    // Only show announcements from today onwards (auto-expire at midnight)
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('id, subject, message, scheduled_at, target_roles, status, created_at')
      .eq('status', 'published')
      .contains('target_roles', [userRole])
      .gte('scheduled_at', startOfToday.toISOString())
      .order('scheduled_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ announcements })

  } catch (err) {
    console.error('GET /api/announcements/active error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
