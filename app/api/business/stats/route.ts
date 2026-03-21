import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role, sub_roles')
      .eq('user_id', user.id)
      .single()

    if (roleRecord?.role !== 'business_owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── Shops ──
    const { data: shops } = await supabase
      .from('shops')
      .select('id, status')
      .eq('owner_id', user.id)

    const totalShops = shops?.length ?? 0
    const liveShops  = shops?.filter(s => s.status === 'live').length ?? 0

    // ── Products ──
    const { count: totalProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)

    // ── Orders ──
    const { data: orders } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .eq('retailer_id', user.id)

    const allOrders = orders ?? []

    const totalOrders    = allOrders.length
    const confirmedOrders = allOrders.filter(o => o.status === 'confirmed').length
    const shippedOrders   = allOrders.filter(o => o.status === 'shipped').length
    const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length
    const cancelledOrders = allOrders.filter(o =>
      o.status === 'cancelled_by_seller' ||
      o.status === 'cancelled_by_customer' ||
      o.status === 'cancelled'
    ).length

    // ── Revenue (delivered orders only) ──
    const totalRevenue = allOrders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

    // ── Current Month Revenue ──
    const now           = new Date()
    const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthEnd      = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const currentMonthRevenue = allOrders
      .filter(o =>
        o.status === 'delivered' &&
        o.created_at >= monthStart &&
        o.created_at <= monthEnd
      )
      .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

    const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return NextResponse.json({
      stats: {
        totalShops,
        liveShops,
        totalProducts:      totalProducts   ?? 0,
        totalOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        currentMonthRevenue,
        currentMonth,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}