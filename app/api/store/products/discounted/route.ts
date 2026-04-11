import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shop_products')
      .select(`
        product_id,
        shops!inner(id, name, slug, logo_url, status),
        products!inner(
          id, name, price, discount_price,
          images, stock, is_active,
          categories(id, name)
        )
      `)
      .eq('shops.status', 'live')
      .eq('products.is_active', true)
      .gt('products.stock', 0)
      .not('products.discount_price', 'is', null)
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const seen = new Set()
    const products = (data ?? [])
      .filter((item: any) => {
        const shop    = Array.isArray(item.shops)    ? item.shops[0]    : item.shops
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        if (!shop || !product) return false
        if (shop?.status !== 'live') return false
        if (!product?.is_active || product?.stock <= 0) return false
        if (!product?.discount_price) return false
        if (seen.has(product.id)) return false
        seen.add(product.id)
        return true
      })
      .sort((a: any, b: any) => {
        const pA = Array.isArray(a.products) ? a.products[0] : a.products
        const pB = Array.isArray(b.products) ? b.products[0] : b.products
        const discA = ((pA?.price - pA?.discount_price) / pA?.price) * 100
        const discB = ((pB?.price - pB?.discount_price) / pB?.price) * 100
        return discB - discA
      })
      .slice(0, 10)
      .map((item: any) => {
        const shop    = Array.isArray(item.shops)    ? item.shops[0]    : item.shops
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        return { ...product, shop }
      })

    return NextResponse.json({ products })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}