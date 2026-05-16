import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: shops, error } = await supabase
      .from('shops')
      .select(`
        id, name, slug, description,
        logo_url, banner_url, status, is_active, owner_id, deleted_at,
        shop_products(
          products(
            id, name, price, discount_price, images, is_active, deleted_at
          )
        )
      `)
      .eq('status', 'live')
      .eq('is_active', true)
      .is('deleted_at', null)
      .limit(8)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get banned seller ids
    const { data: bannedRoles } = await supabase
      .from('user_roles').select('user_id').eq('is_banned', true)
    const bannedIds = new Set((bannedRoles ?? []).map((r: any) => r.user_id))

    const enriched = (shops ?? [])
      .filter((shop: any) => shop.status === 'live' && shop.is_active === true && !bannedIds.has(shop.owner_id))
      .map((shop: any) => {
        // Filter out soft-deleted and inactive products
        const activeProducts = (shop.shop_products ?? []).filter((sp: any) => {
          const product = Array.isArray(sp.products) ? sp.products[0] : sp.products
          return product && product.is_active === true && product.deleted_at === null
        })

        return {
          ...shop,
          product_count: activeProducts.length,
          preview_images: activeProducts
            .slice(0, 4)
            .map((sp: any) => {
              const product = Array.isArray(sp.products) ? sp.products[0] : sp.products
              return product?.images?.[0]
            })
            .filter(Boolean),
        }
      })

    return NextResponse.json({ shops: enriched })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
