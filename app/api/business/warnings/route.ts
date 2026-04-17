import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = 10
    const from  = (page - 1) * limit
    const to    = from + limit - 1

    const { data, error, count } = await supabase
      .from('seller_warnings')
      .select(`
        id, reason, message, is_read, created_at,
        shops(id, name, logo_url),
        products(id, name, images)
      `, { count: 'exact' })
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const unread = await supabase
      .from('seller_warnings')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({
      warnings:    data ?? [],
      total:       count ?? 0,
      unread:      unread.count ?? 0,
      page,
      totalPages:  Math.ceil((count ?? 0) / limit),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
