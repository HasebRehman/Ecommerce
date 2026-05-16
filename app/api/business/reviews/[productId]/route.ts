import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const supabase      = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify product belongs to seller (and is not deleted)
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('id, name, images, price, discount_price')
      .eq('id', productId)
      .eq('owner_id', user.id)
      .is('deleted_at', null)  // Only allow non-deleted products
      .single()

    if (prodError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get shop name
    const { data: sp } = await supabase
      .from('shop_products')
      .select('shops(id, name)')
      .eq('product_id', productId)
      .limit(1)
      .single()

    const shopName = (sp?.shops as any)?.name ?? '—'

    // Get reviews
    const { data: reviews, error: revError } = await supabase
      .from('reviews')
      .select('id, rating, review_text, created_at, user_id, product_id, order_id')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (revError) {
      return NextResponse.json({ error: revError.message }, { status: 400 })
    }

    // Get profiles separately
    const userIds = [...new Set((reviews ?? []).map(r => r.user_id))]
    let profileMap: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', userIds)
      for (const p of profiles ?? []) profileMap[p.id] = p
    }

    const enriched = (reviews ?? []).map(r => ({
      ...r,
      profiles: profileMap[r.user_id] ?? null,
    }))

    const avg = enriched.length
      ? enriched.reduce((s, r) => s + r.rating, 0) / enriched.length
      : 0

    return NextResponse.json({
      reviews:        enriched,
      average_rating: Math.round(avg * 10) / 10,
      total_reviews:  enriched.length,
      product:        { ...product, shop_name: shopName },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}