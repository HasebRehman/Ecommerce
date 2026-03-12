import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shop_products')
      .select(`
        product_id,
        shops!inner(id, name, slug, logo_url, status),
        products!inner(
          id, name, price, discount_price,
          images, stock, is_active,
          categories(id, name)
        )
      `)
      .eq('shops.status', 'live')
      .eq('products.is_active', true)
      .gt('products.stock', 0)
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const products = (data ?? []).map(item => ({
      ...(item.products as any),
      shop: item.shops,
    }))

    return NextResponse.json({ products })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}