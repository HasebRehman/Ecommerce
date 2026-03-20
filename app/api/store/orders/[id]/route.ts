import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getAdmin = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops(id, name, logo_url),
        order_items(
          id, quantity, price,
          products(id, name, images, sku)
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const admin    = getAdmin()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = await request.json()
    if (action !== 'cancel') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('orders')
      .select(`id, status, user_id, retailer_id, total_amount, shops(name)`)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order can only be cancelled when pending' },
        { status: 400 }
      )
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status:       'cancelled_by_customer',
        cancelled_by: 'customer',
        updated_at:   new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Get customer name
    const { data: customerProfile } = await supabase
      .from('profiles').select('full_name').eq('id', user.id).single()
    const customerName = customerProfile?.full_name ?? 'Customer'

    const shopName = (existing.shops as any)?.name ?? ''
    const now      = new Date()
    const dateStr  = now.toLocaleDateString('en-US', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
    const timeStr  = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    })

    // ── Notification for CUSTOMER ──
    await admin.from('notifications').insert({
      user_id:  user.id,
      title:    '🚫 Order Cancelled',
      message:  `You cancelled your order${shopName ? ` from ${shopName}` : ''}. Total: Rs. ${existing.total_amount?.toLocaleString()}. ${dateStr} at ${timeStr}`,
      type:     'cancelled_by_customer',
      order_id: id,
    })

    // ── Notification for SELLER ──
    if (existing.retailer_id) {
      await admin.from('notifications').insert({
        user_id:  existing.retailer_id,
        title:    '🚫 Order Cancelled by Customer',
        message:  `${customerName} cancelled their order${shopName ? ` from ${shopName}` : ''}. Total: Rs. ${existing.total_amount?.toLocaleString()}. ${dateStr} at ${timeStr}`,
        type:     'cancelled_by_customer',
        order_id: id,
      })
    }

    return NextResponse.json({ order, message: 'Order cancelled successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}