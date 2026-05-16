import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public endpoint — returns all live shops (no auth required)
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shops')
      .select('id, name, logo_url, slug, owner_id')
      .eq('status', 'live')
      .is('deleted_at', null)  // Only show non-deleted shops
      .order('name', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Get banned seller ids
    const { data: bannedRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('is_banned', true)
    const bannedIds = new Set((bannedRoles ?? []).map((r: any) => r.user_id))

    // Filter out shops owned by banned sellers
    const shops = (data ?? [])
      .filter((shop: any) => !bannedIds.has(shop.owner_id))
      .map(({ owner_id, ...shop }) => shop) // Remove owner_id from response

    return NextResponse.json({ shops })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
