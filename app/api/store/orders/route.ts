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

    // Get retailer_id from shop
    let retailer_id = null
    if (items[0].shop_id) {
      const { data: shop } = await supabase
        .from('shops')
        .select('owner_id')
        .eq('id', items[0].shop_id)
        .single()
      retailer_id = shop?.owner_id ?? null
    }

    // If no shop_id, find retailer from product
    if (!retailer_id && items[0].product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('owner_id')
        .eq('id', items[0].product_id)
        .single()
      retailer_id = product?.owner_id ?? null
    }

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

    return NextResponse.json({ order, message: 'Order placed successfully!' })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
        order_items(
          id, quantity, price,
          products(id, name, images)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ orders: orders ?? [] })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}