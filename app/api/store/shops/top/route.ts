import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: shops, error } = await supabase
      .from('shops')
      .select(`
        id, name, slug, description,
        logo_url, banner_url, status, is_active,
        shop_products(
          products(
            id, name, price, discount_price, images
          )
        )
      `)
      .eq('status', 'live')
      .eq('is_active', true)
      .limit(8)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Filter in JS to ensure conditions are met, then enrich with product count and preview images
    const enriched = (shops ?? [])
      .filter((shop: any) => shop.status === 'live' && shop.is_active === true)
      .map((shop: any) => ({
        ...shop,
        product_count: shop.shop_products?.length ?? 0,
        preview_images: (shop.shop_products ?? [])
          .slice(0, 4)
          .map((sp: any) => {
            const product = Array.isArray(sp.products) ? sp.products[0] : sp.products
            return product?.images?.[0]
          })
          .filter(Boolean),
      }))

    return NextResponse.json({ shops: enriched })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
