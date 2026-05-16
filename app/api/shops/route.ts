import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: shops, error } = await supabase
      .from('shops')
      .select(`
        *,
        shop_products(
          products(id, deleted_at)
        )
      `)
      .eq('owner_id', user.id)
      .is('deleted_at', null)  // Only get non-deleted shops
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Calculate product count for each shop, excluding soft-deleted products
    const shopsWithCount = (shops ?? []).map((shop: any) => {
      const productCount = (shop.shop_products ?? []).filter((sp: any) => {
        const product = Array.isArray(sp.products) ? sp.products[0] : sp.products
        return product && product.deleted_at === null
      }).length

      return {
        ...shop,
        shop_products: [{ count: productCount }]
      }
    })

    // Return with no-cache headers to prevent stale data
    return NextResponse.json(
      { shops: shopsWithCount },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, logo_url, banner_url } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Shop name is required' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    const slug = `${baseSlug}-${Date.now()}`

    const { data: shop, error } = await supabase
      .from('shops')
      .insert({
        owner_id:    user.id,
        name:        name.trim(),
        slug,
        description: description?.trim() ?? null,
        logo_url:    logo_url    ?? null,
        banner_url:  banner_url  ?? null,
        status:      'draft',
        is_active:   false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      shop,
      message: 'Shop created successfully!',
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}