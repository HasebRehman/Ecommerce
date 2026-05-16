import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify shop is not deleted and belongs to user
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('id', id)
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .single()

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found or deleted' }, { status: 404 })
    }

    const { data } = await supabase
      .from('shop_products')
      .select('*, products!inner(*, categories(id, name))')
      .eq('shop_id', id)

    // Filter out soft-deleted products
    const activeProducts = (data ?? []).filter((sp: any) => {
      return sp.products && sp.products.deleted_at === null
    })

    return NextResponse.json({ products: activeProducts })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Bulk replace: replaces all shop products with the provided productIds array
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify shop is not deleted and belongs to user
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('id', id)
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .single()

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found or deleted' }, { status: 404 })
    }

    const { productIds } = await request.json()

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'productIds must be an array' }, { status: 400 })
    }

    // Delete all existing assignments for this shop
    const { error: deleteError } = await supabase
      .from('shop_products')
      .delete()
      .eq('shop_id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    // Insert new assignments (skip if empty selection)
    if (productIds.length > 0) {
      const rows = productIds.map((product_id: string) => ({ shop_id: id, product_id }))
      const { error: insertError } = await supabase.from('shop_products').insert(rows)
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ message: 'Shop products updated!' })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { product_id } = await request.json()
    await supabase.from('shop_products').delete().eq('shop_id', id).eq('product_id', product_id)
    return NextResponse.json({ message: 'Product removed from shop!' })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
