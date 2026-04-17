import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('seller_warnings')
      .update({ is_read: true })
      .eq('seller_id', user.id)
      .eq('is_read', false)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'All warnings marked as read' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
