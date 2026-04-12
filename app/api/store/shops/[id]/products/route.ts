import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public endpoint — returns products for a specific shop (no auth required)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // First check if shop owner is banned
    const { data: shop } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (shop?.owner_id) {
      const { data: roleRecord } = await supabase
        .from('user_roles')
        .select('is_banned')
        .eq('user_id', shop.owner_id)
        .single()

      if (roleRecord?.is_banned === true) {
        return NextResponse.json({ products: [] })
      }
    }

    const { data, error } = await supabase
      .from('shop_products')
      .select('products(id, name, images)')
      .eq('shop_id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const products = (data ?? []).map((row: any) => {
      const p = Array.isArray(row.products) ? row.products[0] : row.products
      return p
    }).filter(Boolean)

    return NextResponse.json({ products })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
