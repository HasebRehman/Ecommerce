import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
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

    const { status } = await request.json()

    if (!['draft', 'live', 'paused'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: shop } = await supabase
      .from('shops')
      .select('id, owner_id')
      .eq('id', id)
      .single()

    if (!shop || shop.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If going live — check shop has products
    if (status === 'live') {
      const { count } = await supabase
        .from('shop_products')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', id)

      if (!count || count === 0) {
        return NextResponse.json(
          { error: 'Add at least one product before going live!' },
          { status: 400 }
        )
      }
    }

    const { data: updated, error } = await supabase
      .from('shops')
      .update({
        status,
        is_active:  status === 'live',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      shop: updated,
      message: status === 'live'
        ? '🎉 Your shop is now live!'
        : status === 'paused'
        ? 'Shop paused successfully'
        : 'Shop set to draft',
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}