import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const search      = searchParams.get('search')      ?? ''
    const category_id = searchParams.get('category_id') ?? ''
    const page        = parseInt(searchParams.get('page') ?? '1')
    const limit       = 20
    const offset      = (page - 1) * limit

    // Get all products from LIVE shops only
    let query = supabase
      .from('shop_products')
      .select(`
        product_id,
        shop_id,
        shops!inner(
          id, name, slug, logo_url, status
        ),
        products!inner(
          id, name, description, price,
          discount_price, images, stock,
          is_active, sizes, colors,
          categories(id, name)
        )
      `, { count: 'exact' })
      .eq('shops.status', 'live')
      .eq('products.is_active', true)
      .gt('products.stock', 0)
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Flatten — extract product + shop info
    const products = (data ?? []).map(item => ({
      ...item.products,
      shop: item.shops,
    }))

    return NextResponse.json({
      products,
      pagination: {
        total:      count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}