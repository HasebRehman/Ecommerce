import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ cart: [] })

    const { data, error } = await supabase
      .from('carts')
      .select(`
        id, quantity,
        products(id, name, price, discount_price, images, stock, deleted_at)
      `)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Filter out items with soft-deleted products
    const activeCartItems = (data ?? []).filter((item: any) => {
      return item.products && item.products.deleted_at === null
    })

    return NextResponse.json({ cart: activeCartItems })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Login to add to cart' }, { status: 401 })

    const { product_id, quantity = 1 } = await request.json()

    const { data: existing } = await supabase
      .from('carts')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single()

    if (existing) {
      await supabase
        .from('carts')
        .update({
          quantity:   existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      return NextResponse.json({ message: 'Cart updated!' })
    }

    await supabase
      .from('carts')
      .insert({ user_id: user.id, product_id, quantity })

    return NextResponse.json({ message: 'Added to cart!' })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}