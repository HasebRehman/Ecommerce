import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Step 1 — get seller's products
    const { data: myProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, images, price, discount_price')
      .eq('owner_id', user.id)

    if (prodError || !myProducts?.length) {
      return NextResponse.json({ products: [] })
    }

    const productIds = myProducts.map(p => p.id)

    // Step 2 — get reviews for those products
    const { data: reviews, error: revError } = await supabase
      .from('reviews')
      .select('id, rating, review_text, created_at, user_id, product_id')
      .in('product_id', productIds)
      .order('created_at', { ascending: false })

    if (revError) {
      console.log('Reviews error:', revError)
      return NextResponse.json({ error: revError.message }, { status: 400 })
    }

    if (!reviews?.length) {
      return NextResponse.json({ products: [] })
    }

    // Step 3 — get profiles separately
    const userIds = [...new Set(reviews.map(r => r.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds)

    const profileMap: Record<string, any> = {}
    for (const p of profiles ?? []) profileMap[p.id] = p

    // Step 4 — get shop names
    const { data: shopProducts } = await supabase
      .from('shop_products')
      .select('product_id, shops(id, name)')
      .in('product_id', productIds)

    const shopMap: Record<string, string> = {}
    for (const sp of shopProducts ?? []) {
      shopMap[sp.product_id] = (sp.shops as any)?.name ?? '—'
    }

    // Step 5 — group by product
    const grouped: Record<string, any> = {}
    for (const review of reviews) {
      const pid = review.product_id
      if (!grouped[pid]) {
        const prod = myProducts.find(p => p.id === pid)
        grouped[pid] = {
          product:       { ...prod, shop_name: shopMap[pid] ?? '—' },
          reviews:       [],
          avg_rating:    0,
          total_reviews: 0,
        }
      }
      grouped[pid].reviews.push({
        ...review,
        profiles: profileMap[review.user_id] ?? null,
      })
    }

    // Step 6 — calculate averages
    for (const pid in grouped) {
      const g         = grouped[pid]
      g.total_reviews = g.reviews.length
      g.avg_rating    = Math.round(
        (g.reviews.reduce((s: number, r: any) => s + r.rating, 0) / g.reviews.length) * 10
      ) / 10
    }

    return NextResponse.json({
      products: Object.values(grouped).filter((g: any) => g.total_reviews > 0)
    })
  } catch (err: any) {
    console.error('Business reviews error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}