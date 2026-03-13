import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { quantity } = await request.json()
    if (quantity < 1) {
      await supabase.from('carts').delete().eq('id', id).eq('user_id', user.id)
      return NextResponse.json({ message: 'Item removed' })
    }

    await supabase.from('carts')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', id).eq('user_id', user.id)

    return NextResponse.json({ message: 'Cart updated!' })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase.from('carts').delete().eq('id', id).eq('user_id', user.id)
    return NextResponse.json({ message: 'Removed from cart' })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}