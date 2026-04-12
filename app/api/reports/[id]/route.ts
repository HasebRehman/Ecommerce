import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    return NextResponse.json({ report: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
