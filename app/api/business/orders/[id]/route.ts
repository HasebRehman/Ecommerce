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
        profiles!orders_user_id_fkey(full_name, username),
        shops(id, name, logo_url),
        order_items(
          id, quantity, price,
          products(id, name, images, sku, price, discount_price, stock)
        )
      `)
      .eq('id', id)
      .eq('retailer_id', user.id)
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

    const { status } = await request.json()

    const validStatuses = ['confirmed', 'shipped', 'delivered', 'cancelled_by_seller']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Verify ownership + get current order with items
    const { data: existing } = await supabase
      .from('orders')
      .select(`
        id, status, retailer_id,
        order_items(id, quantity, product_id)
      `)
      .eq('id', id)
      .eq('retailer_id', user.id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // ── STOCK DEDUCTION on confirm ──
    if (status === 'confirmed' && existing.status === 'pending') {
      for (const item of existing.order_items ?? []) {
        // Get current stock
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single()

        if (product) {
          const newStock = Math.max(0, (product.stock ?? 0) - item.quantity)
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id)
        }
      }
    }

    // ── RESTORE STOCK on seller cancel ──
    if (status === 'cancelled_by_seller' && existing.status === 'confirmed') {
      for (const item of existing.order_items ?? []) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single()

        if (product) {
          await supabase
            .from('products')
            .update({ stock: (product.stock ?? 0) + item.quantity })
            .eq('id', item.product_id)
        }
      }
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'cancelled_by_seller') {
      updateData.cancelled_by = 'seller'
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({
      order,
      message: status === 'confirmed'
        ? 'Order confirmed! Stock updated.'
        : status === 'cancelled_by_seller'
        ? 'Order cancelled.'
        : `Order marked as ${status}`,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}