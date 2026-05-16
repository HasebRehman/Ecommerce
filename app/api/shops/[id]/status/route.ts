import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify shop is not deleted
    const { data: existingShop } = await supabase
      .from('shops')
      .select('deleted_at')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    if (!existingShop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    if (existingShop.deleted_at) {
      return NextResponse.json({ error: 'Cannot update status of a deleted shop' }, { status: 400 })
    }

    const { status } = await request.json()
    if (!['draft', 'live', 'paused'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
    if (status === 'live') updatePayload.is_active = true
    if (status === 'draft' || status === 'paused') updatePayload.is_active = false

    const { data: shop, error } = await supabase
      .from('shops')
      .update(updatePayload)
      .eq('id', id)
      .eq('owner_id', user.id)
      .is('deleted_at', null)  // Only update non-deleted shops
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ shop, message: `Shop is now ${status}` })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}