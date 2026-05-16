import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — list all products for current retailer
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search      = searchParams.get('search')      ?? ''
    const category_id = searchParams.get('category_id') ?? ''
    const page        = parseInt(searchParams.get('page') ?? '1')
    const limit       = 12
    const offset      = (page - 1) * limit

    let query = supabase
      .from('products')
      .select(`
        *,
        categories(id, name)
      `, { count: 'exact' })
      .eq('owner_id', user.id)
      .is('deleted_at', null)  // Only get non-deleted products
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    const { data: products, count, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      products: products ?? [],
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

// POST — create new product
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
      name,
      description,
      price,
      discount_price,
      stock,
      sku,
      images,
      videos,
      category_id,
      sizes,
      colors,
    } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 }
      )
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        owner_id:       user.id,
        name:           name.trim(),
        description:    description?.trim() ?? null,
        price:          parseFloat(price),
        discount_price: discount_price
          ? parseFloat(discount_price)
          : null,
        stock:          parseInt(stock) ?? 0,
        sku:            sku?.trim() ?? null,
        images:         images   ?? [],
        videos:         videos   ?? [],
        category_id:    category_id ?? null,
        sizes:          sizes    ?? [],
        colors:         colors   ?? [],
        is_active:      true,
      })
      .select(`*, categories(id, name)`)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      product,
      message: 'Product created successfully!',
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}