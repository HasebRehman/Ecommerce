import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — get products assigned to shop
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: shopProducts, error } = await supabase
      .from('shop_products')
      .select(`
        product_id,
        products(
          id, name, price, discount_price,
          images, stock, is_active,
          categories(name)
        )
      `)
      .eq('shop_id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      products: shopProducts?.map(sp => sp.products) ?? [],
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST — update products assigned to shop (full replace)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify shop ownership
    const { data: shop } = await supabase
      .from('shops')
      .select('id, owner_id')
      .eq('id', id)
      .single()

    if (!shop || shop.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { productIds } = await request.json()

    // Delete all existing shop products
    await supabase
      .from('shop_products')
      .delete()
      .eq('shop_id', id)

    // Insert new ones if any selected
    if (productIds?.length > 0) {
      const inserts = productIds.map((pid: string) => ({
        shop_id:    id,
        product_id: pid,
        is_active:  true,
      }))

      const { error } = await supabase
        .from('shop_products')
        .insert(inserts)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json({
      message: 'Shop products updated successfully!',
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}