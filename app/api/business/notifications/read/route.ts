import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({ message: 'Marked as read' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}