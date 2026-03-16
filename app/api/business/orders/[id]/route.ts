import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin client bypasses RLS
const getAdminClient = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const admin    = getAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { status } = await request.json()

    const validStatuses = ['confirmed', 'shipped', 'delivered', 'cancelled_by_seller']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get order with items + shop + customer
    const { data: existing } = await supabase
      .from('orders')
      .select(`
        id, status, retailer_id, user_id, total_amount,
        shops(name),
        order_items(id, quantity, product_id)
      `)
      .eq('id', id)
      .eq('retailer_id', user.id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // ── STOCK DEDUCTION on confirm ──
    if (status === 'confirmed' && existing.status === 'pending') {
      for (const item of existing.order_items ?? []) {
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

    // ── Create notification for customer using ADMIN client ──
    const shopName = (existing.shops as any)?.name ?? ''
    const now      = new Date()
    const dateStr  = now.toLocaleDateString('en-US', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
    const timeStr  = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    })

    const STATUS_NOTIF: Record<string, { title: string, message: string }> = {
      confirmed: {
        title:   '✅ Order Confirmed!',
        message: `Your order${shopName ? ` from ${shopName}` : ''} has been confirmed by the seller. Total: Rs. ${existing.total_amount?.toLocaleString()}. ${dateStr} at ${timeStr}`,
      },
      shipped: {
        title:   '🚚 Order Shipped!',
        message: `Your order${shopName ? ` from ${shopName}` : ''} is on the way! Total: Rs. ${existing.total_amount?.toLocaleString()}. ${dateStr} at ${timeStr}`,
      },
      delivered: {
        title:   '🎉 Order Delivered!',
        message: `Your order${shopName ? ` from ${shopName}` : ''} has been delivered successfully. Total: Rs. ${existing.total_amount?.toLocaleString()}. ${dateStr} at ${timeStr}`,
      },
      cancelled_by_seller: {
        title:   '❌ Order Cancelled by Seller',
        message: `Your order${shopName ? ` from ${shopName}` : ''} was cancelled by the seller. Total: Rs. ${existing.total_amount?.toLocaleString()}. ${dateStr} at ${timeStr}`,
      },
    }

    const notif = STATUS_NOTIF[status]
    if (notif && existing.user_id) {
      // Use admin client to bypass RLS — inserting for customer's user_id
      const { error: notifError } = await admin
        .from('notifications')
        .insert({
          user_id:  existing.user_id,
          title:    notif.title,
          message:  notif.message,
          type:     status,
          order_id: id,
        })

      if (notifError) {
        console.error('Notification insert error:', notifError)
      }
    }

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