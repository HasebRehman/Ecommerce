import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const supabase      = await createClient()

    // Step 1 — get reviews
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, rating, review_text, created_at, user_id, product_id')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Reviews fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!reviews?.length) {
      return NextResponse.json({
        reviews:        [],
        average_rating: 0,
        total_reviews:  0,
      })
    }

    // Step 2 — get profiles separately
    const userIds = [...new Set(reviews.map(r => r.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds)

    const profileMap: Record<string, any> = {}
    for (const p of profiles ?? []) {
      profileMap[p.id] = p
    }

    // Step 3 — merge
    const enriched = reviews.map(r => ({
      ...r,
      profiles: profileMap[r.user_id] ?? null,
    }))

    const avg = enriched.reduce((sum, r) => sum + r.rating, 0) / enriched.length

    return NextResponse.json({
      reviews:        enriched,
      average_rating: Math.round(avg * 10) / 10,
      total_reviews:  enriched.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}