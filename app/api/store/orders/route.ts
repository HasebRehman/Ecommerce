import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items, delivery_address, notes, payment_method } = await request.json()
    if (!items?.length) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    const total_amount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity, 0
    )

    // Get retailer_id + shop name
    let retailer_id = null
    let shop_name   = ''

    if (items[0].shop_id) {
      const { data: shop } = await supabase
        .from('shops')
        .select('owner_id, name')
        .eq('id', items[0].shop_id)
        .single()
      retailer_id = shop?.owner_id ?? null
      shop_name   = shop?.name     ?? ''
    }

    if (!retailer_id && items[0].product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('owner_id')
        .eq('id', items[0].product_id)
        .single()
      retailer_id = product?.owner_id ?? null
    }

    // Get product names for notification
    const productIds = items.map((i: any) => i.product_id).filter(Boolean)
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, discount_price')
      .in('id', productIds)

    const productMap: Record<string, any> = {}
    for (const p of products ?? []) productMap[p.id] = p

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id:          user.id,
        retailer_id,
        shop_id:          items[0].shop_id ?? null,
        status:           'pending',
        total_amount,
        delivery_address: { ...delivery_address, payment_method },
        notes:            notes ?? null,
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 })
    }

    const orderItems = items.map((item: any) => ({
      order_id:   order.id,
      product_id: item.product_id,
      quantity:   item.quantity,
      price:      item.price,
    }))

    await supabase.from('order_items').insert(orderItems)
    await supabase.from('carts').delete().eq('user_id', user.id)

    // ── Create notification for customer ──
    const productNames = items
      .map((i: any) => productMap[i.product_id]?.name ?? 'Product')
      .join(', ')

    const now     = new Date()
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    })

    await supabase.from('notifications').insert({
      user_id:  user.id,
      title:    '🛍️ Order Placed Successfully!',
      message:  `You ordered ${productNames}${shop_name ? ` from ${shop_name}` : ''}. Total: Rs. ${total_amount.toLocaleString()}. ${dateStr} at ${timeStr}`,
      type:     'order_placed',
      order_id: order.id,
    })

    return NextResponse.json({ order, message: 'Order placed successfully!' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: orders } = await supabase
      .from('orders')
      .select(`
        *,
        shops(id, name, logo_url),
        order_items(
          id, quantity, price, product_id,
          products(id, name, images)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ orders: orders ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}