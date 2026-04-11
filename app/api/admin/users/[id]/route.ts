import { createAdminSupabaseClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminSupabase = createAdminSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roleRecord } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    if (!ADMIN_ROLES.includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get profile and role
    const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', id).single()
    const { data: role } = await adminSupabase.from('user_roles').select('*').eq('user_id', id).single()
    const { data: authUser } = await adminSupabase.auth.admin.getUserById(id)

    // Calculate stats based on role
    let stats: any = {
      moneySpent: 0,
    }

    // Money spent — sum of delivered orders where this user is the buyer (user_id)
    const { data: customerOrders } = await adminSupabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', id)
      .eq('status', 'delivered')

    stats.moneySpent = customerOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ?? 0

    // Business owner stats (match exactly with business dashboard)
    if (role?.role === 'business_owner') {
      // Shops (all shops, not just active)
      const { data: shops } = await adminSupabase
        .from('shops')
        .select('id, status')
        .eq('owner_id', id)

      stats.shops = shops?.length ?? 0
      stats.liveShops = shops?.filter(s => s.status === 'live').length ?? 0

      // Products (owned by this user)
      const { count: productsCount } = await adminSupabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', id)

      stats.products = productsCount ?? 0

      // Orders (where this user is the retailer)
      const { data: orders } = await adminSupabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('retailer_id', id)

      const allOrders = orders ?? []

      // Total orders
      stats.totalOrders = allOrders.length

      // Confirmed orders
      stats.confirmedOrders = allOrders.filter(o => o.status === 'confirmed').length

      // Shipped orders
      stats.shippedOrders = allOrders.filter(o => o.status === 'shipped').length

      // Delivered orders
      stats.deliveredOrders = allOrders.filter(o => o.status === 'delivered').length

      // Cancelled orders (by seller or customer)
      stats.cancelledOrders = allOrders.filter(o =>
        o.status === 'cancelled_by_seller' ||
        o.status === 'cancelled_by_customer' ||
        o.status === 'cancelled'
      ).length

      // Total revenue (delivered orders only)
      stats.totalRevenue = allOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

      // Current month revenue
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

      stats.currentMonthRevenue = allOrders
        .filter(o =>
          o.status === 'delivered' &&
          o.created_at >= monthStart &&
          o.created_at <= monthEnd
        )
        .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

      // Reviews count — reviews on products owned by this user
      const { data: ownerProducts } = await adminSupabase
        .from('products')
        .select('id')
        .eq('owner_id', id)

      const ownerProductIds = ownerProducts?.map(p => p.id) ?? []

      if (ownerProductIds.length > 0) {
        const { count: reviewsCount } = await adminSupabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .in('product_id', ownerProductIds)

        stats.reviews = reviewsCount ?? 0
      } else {
        stats.reviews = 0
      }
    }

    return NextResponse.json({
      profile,
      role,
      email: authUser?.user?.email ?? '',
      stats,
    })
  } catch (err) {
    console.error('Get user error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminSupabase = createAdminSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roleRecord } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    if (!ADMIN_ROLES.includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Update role
    if (body.role) {
      await adminSupabase.from('user_roles').update({ role: body.role }).eq('user_id', id)
    }

    // Update active status
    if (body.is_active !== undefined) {
      await adminSupabase.from('user_roles').update({ is_active: body.is_active }).eq('user_id', id)

      if (!body.is_active) {
        // Ban the user to immediately invalidate all active sessions
        await adminSupabase.auth.admin.updateUserById(id, {
          ban_duration: '876600h', // ~100 years = effectively permanent until re-activated
        })
      } else {
        // Unban when re-activating
        await adminSupabase.auth.admin.updateUserById(id, {
          ban_duration: 'none',
        })
      }
    }

    // Update password (only for admins)
    if (body.password && roleRecord?.role === 'super_admin') {
      const { data: targetRole } = await adminSupabase
        .from('user_roles')
        .select('role')
        .eq('user_id', id)
        .single()

      if (ADMIN_ROLES.includes(targetRole?.role)) {
        await adminSupabase.auth.admin.updateUserById(id, {
          password: body.password,
        })
      }
    }

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (err) {
    console.error('Update user error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminSupabase = createAdminSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roleRecord } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    if (!ADMIN_ROLES.includes(roleRecord?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete user from auth (this will cascade to related tables via RLS/triggers)
    await adminSupabase.auth.admin.deleteUser(id)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error('Delete user error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
