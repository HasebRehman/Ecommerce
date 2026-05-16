import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shop_products')
      .select(`
        product_id,
        shops!inner(id, name, slug, logo_url, status, owner_id, deleted_at),
        products!inner(
          id, name, price, discount_price,
          images, stock, is_active, deleted_at,
          categories(id, name)
        )
      `)
      .eq('shops.status', 'live')
      .is('shops.deleted_at', null)
      .eq('products.is_active', true)
      .is('products.deleted_at', null)
      .gt('products.stock', 0)
      .limit(50)

    if (error) {
      console.error('Featured products query error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get banned seller ids (with error handling)
    let bannedIds = new Set()
    try {
      const { data: bannedRoles, error: bannedError } = await supabase
        .from('user_roles').select('user_id').eq('is_banned', true)
      
      if (bannedError) {
        console.error('Error fetching banned users:', bannedError)
        // Continue without filtering banned users if this fails
      } else {
        bannedIds = new Set((bannedRoles ?? []).map((r: any) => r.user_id))
      }
    } catch (err) {
      console.error('Exception fetching banned users:', err)
      // Continue without filtering
    }

    const seen = new Set()
    const products = (data ?? [])
      .filter((item: any) => {
        const shop    = Array.isArray(item.shops)    ? item.shops[0]    : item.shops
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        if (!shop || !product) return false
        if (shop?.status !== 'live') return false
        if (!product?.is_active || product?.stock <= 0) return false
        if (bannedIds.has(shop?.owner_id)) return false
        if (seen.has(product.id)) return false
        seen.add(product.id)
        return true
      })
      .slice(0, 10)
      .map((item: any) => {
        const shop    = Array.isArray(item.shops)    ? item.shops[0]    : item.shops
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        return { ...product, shop }
      })

    return NextResponse.json({ products })

  } catch (err: any) {
    console.error('Featured products error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}