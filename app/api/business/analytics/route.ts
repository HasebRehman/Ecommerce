import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') ?? 'daily' // daily | weekly | yearly

    const now = new Date()

    // ── Get all delivered orders for this seller ──
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total_amount, created_at, status')
      .eq('retailer_id', user.id)
      .eq('status', 'delivered')
      .order('created_at', { ascending: true })

    const allOrders = orders ?? []

    if (tab === 'daily') {
      // Last 7 days including today
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d     = new Date(now)
        d.setDate(d.getDate() - i)
        const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).toISOString()
        const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString()

        const revenue = allOrders
          .filter(o => o.created_at >= start && o.created_at <= end)
          .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

        days.push({ label, revenue })
      }
      return NextResponse.json({ data: days, tab })
    }

    if (tab === 'weekly') {
      // Last 4 weeks including current week
      const weeks = []
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now)
        // Get Monday of current week
        const day = weekStart.getDay()
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
        weekStart.setDate(diff - i * 7)
        weekStart.setHours(0, 0, 0, 0)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)

        const label = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`

        const revenue = allOrders
          .filter(o => {
            const d = new Date(o.created_at)
            return d >= weekStart && d <= weekEnd
          })
          .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

        weeks.push({ label, revenue })
      }
      return NextResponse.json({ data: weeks, tab })
    }

    if (tab === 'yearly') {
      // Last 7 years including current year
      const years = []
      const currentYear = now.getFullYear()
      for (let i = 6; i >= 0; i--) {
        const year  = currentYear - i
        const start = new Date(year, 0, 1, 0, 0, 0).toISOString()
        const end   = new Date(year, 11, 31, 23, 59, 59).toISOString()

        const revenue = allOrders
          .filter(o => o.created_at >= start && o.created_at <= end)
          .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

        years.push({ label: String(year), revenue })
      }
      return NextResponse.json({ data: years, tab })
    }

    return NextResponse.json({ data: [], tab })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}