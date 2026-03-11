import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role, sub_roles')
      .eq('user_id', user.id)
      .single()

    if (roleRecord?.role !== 'business_owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const subRoles = roleRecord?.sub_roles ?? []

    // Get workspaces belonging to this user
    const { data: workspaces, count: workspaceCount } = await supabase
      .from('workspaces')
      .select('*', { count: 'exact' })
      .eq('owner_id', user.id)

    // Separate shops and warehouses
    const shops      = workspaces?.filter(w => w.type === 'shop')      ?? []
    const warehouses = workspaces?.filter(w => w.type === 'warehouse') ?? []

    return NextResponse.json({
      subRoles,
      stats: {
        totalWorkspaces: workspaceCount ?? 0,
        totalShops:      shops.length,
        totalWarehouses: warehouses.length,
        totalOrders:     0,   // will fill when orders feature is built
        totalProducts:   0,   // will fill when products feature is built
        totalRevenue:    0,   // will fill when orders feature is built
      },
      workspaces: workspaces ?? [],
    })

  } catch (err) {
    console.error('Business stats error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}