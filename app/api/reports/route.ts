import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('reports')
      .select(`
        id, reason, message, media_urls, status, created_at,
        shops(id, name, logo_url),
        products(id, name, images)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ reports: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { reason, shop_id, product_id, message, media_urls } = body

    if (!reason) return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
    if (!shop_id) return NextResponse.json({ error: 'Store is required' }, { status: 400 })
    if (!product_id) return NextResponse.json({ error: 'Product is required' }, { status: 400 })
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

    // Check if user already submitted a report for this product from this store in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('shop_id', shop_id)
      .eq('product_id', product_id)
      .gte('created_at', twentyFourHoursAgo)
      .maybeSingle()

    if (existingReport) {
      const timeLeft = new Date(existingReport.created_at).getTime() + 24 * 60 * 60 * 1000 - Date.now()
      const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000))
      return NextResponse.json({ 
        error: `You already reported this product recently. Please wait ${hoursLeft} hour(s) before submitting again.` 
      }, { status: 429 })
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id:    user.id,
        reason,
        shop_id,
        product_id,
        message:    message.trim(),
        media_urls: media_urls ?? [],
        status:     'delivered',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ report: data, message: 'Report submitted successfully' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
