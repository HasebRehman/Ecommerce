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

    const { data, error } = await supabase
      .from('shop_products')
      .select(`
        product_id,
        shops!inner(id, name, slug, logo_url, status),
        products!inner(
          id, name, description, price,
          discount_price, images, stock,
          is_active, sizes, colors,
          categories(id, name)
        )
      `)
      .eq('shops.status', 'live')
      .eq('products.is_active', true)
      .gt('products.stock', 0)
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Filter in JS since Supabase nested filters on joined tables may not apply server-side
    let products = (data ?? [])
      .filter((item: any) => {
        const shop    = Array.isArray(item.shops)    ? item.shops[0]    : item.shops
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        return shop?.status === 'live' && product?.is_active === true && product?.stock > 0
      })
      .map((item: any) => {
        const shop    = Array.isArray(item.shops)    ? item.shops[0]    : item.shops
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        return { ...product, shop }
      })

    // Apply search filter
    if (search) {
      const q = search.toLowerCase()
      products = products.filter((p: any) =>
        p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      )
    }

    // Apply category filter
    if (category_id) {
      products = products.filter((p: any) =>
        p.categories?.id === category_id ||
        (Array.isArray(p.categories) && p.categories.some((c: any) => c.id === category_id))
      )
    }

    return NextResponse.json({
      products,
      pagination: {
        total:      products.length,
        page,
        limit,
        totalPages: Math.ceil(products.length / limit),
      },
    })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
