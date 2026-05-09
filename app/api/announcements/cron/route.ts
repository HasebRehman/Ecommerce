import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ── GET /api/announcements/cron — Vercel Cron: publish due announcements ──
// Called every minute by Vercel Cron. Protected by CRON_SECRET.
export async function GET(request: Request) {
  try {
    // Verify Vercel Cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminSupabaseClient()

    // Update all scheduled announcements whose scheduled_at has passed
    const { data, error } = await adminClient
      .from('announcements')
      .update({ status: 'published' })
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())
      .select('id')

    if (error) {
      console.error('Cron update error:', error)
      return NextResponse.json(
        { error: 'Cron failed', details: error.message },
        { status: 500 }
      )
    }

    const updated = data?.length ?? 0
    console.log(`[announcements/cron] Published ${updated} announcement(s)`)

    return NextResponse.json({ updated })

  } catch (err: any) {
    console.error('GET /api/announcements/cron error:', err)
    return NextResponse.json(
      { error: 'Cron failed', details: err.message },
      { status: 500 }
    )
  }
}
