import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { product_id, order_id, rating, review_text } = await request.json()

    if (!product_id || !order_id || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify customer actually ordered this product
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('id, order_id, orders!inner(user_id, status)')
      .eq('product_id', product_id)
      .eq('order_id', order_id)
      .single()

    if (!orderItem) {
      return NextResponse.json({ error: 'You can only review products you have ordered' }, { status: 403 })
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        user_id:     user.id,
        product_id,
        order_id,
        rating,
        review_text: review_text || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ review, message: 'Review submitted!' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}