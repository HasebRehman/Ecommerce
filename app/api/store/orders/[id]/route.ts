import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops(id, name, logo_url),
        order_items(
          id, quantity, price,
          products(id, name, images, sku)
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ order })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = await request.json()

    if (action !== 'cancel') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Only allow cancel if status is pending
    const { data: existing } = await supabase
      .from('orders')
      .select('id, status, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order can only be cancelled when pending' },
        { status: 400 }
      )
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status:        'cancelled_by_customer',
        cancelled_by:  'customer',
        updated_at:    new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ order, message: 'Order cancelled successfully' })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}