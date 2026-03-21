'use client'

import {
  Store, ShoppingBag, Package, TrendingUp,
  CheckCircle, Truck, XCircle, Calendar,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
  totalShops:          number
  liveShops:           number
  totalProducts:       number
  totalOrders:         number
  confirmedOrders:     number
  shippedOrders:       number
  deliveredOrders:     number
  cancelledOrders:     number
  totalRevenue:        number
  currentMonthRevenue: number
  currentMonth:        string
}

interface Props {
  stats: Stats
}

export default function RetailerStats({ stats }: Props) {

  const cards = [
    // Row 1 — Shops + Products + Orders + Revenue
    {
      label:  'Total Shops',
      value:  stats.totalShops,
      sub:    `${stats.liveShops} live`,
      icon:   Store,
      color:  'text-blue-400',
      bg:     'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label:  'Products Listed',
      value:  stats.totalProducts,
      sub:    'All products',
      icon:   Package,
      color:  'text-purple-400',
      bg:     'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      label:  'Total Orders',
      value:  stats.totalOrders,
      sub:    'All time',
      icon:   ShoppingBag,
      color:  'text-slate-300',
      bg:     'bg-slate-700/50',
      border: 'border-slate-600/30',
    },
    {
      label:  'Total Revenue',
      value:  `Rs. ${stats.totalRevenue.toLocaleString()}`,
      sub:    'From delivered orders',
      icon:   TrendingUp,
      color:  'text-yellow-400',
      bg:     'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },

    // Row 2 — Order status breakdown + Month Revenue
    {
      label:  'Confirmed Orders',
      value:  stats.confirmedOrders,
      sub:    'Awaiting shipment',
      icon:   CheckCircle,
      color:  'text-blue-400',
      bg:     'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label:  'Shipped Orders',
      value:  stats.shippedOrders,
      sub:    'On the way',
      icon:   Truck,
      color:  'text-purple-400',
      bg:     'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      label:  'Delivered Orders',
      value:  stats.deliveredOrders,
      sub:    'Completed',
      icon:   CheckCircle,
      color:  'text-green-400',
      bg:     'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label:  'Cancelled Orders',
      value:  stats.cancelledOrders,
      sub:    'By seller or customer',
      icon:   XCircle,
      color:  'text-red-400',
      bg:     'bg-red-500/10',
      border: 'border-red-500/20',
    },
    {
      label:  `${stats.currentMonth} Revenue`,
      value:  `Rs. ${stats.currentMonthRevenue.toLocaleString()}`,
      sub:    'Current month earnings',
      icon:   Calendar,
      color:  'text-orange-400',
      bg:     'bg-orange-500/10',
      border: 'border-orange-500/20',
      wide:   true,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Row 1 — 4 cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.slice(0, 4).map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Row 2 — 4 cards + 1 wide */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.slice(4, 8).map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Row 3 — Month revenue full width */}
      <div className="grid grid-cols-1 gap-4">
        <StatCard {...cards[8]} />
      </div>
    </div>
  )
}

interface CardProps {
  label:   string
  value:   string | number
  sub:     string
  icon:    any
  color:   string
  bg:      string
  border:  string
  wide?:   boolean
}

function StatCard({ label, value, sub, icon: Icon, color, bg, border }: CardProps) {
  return (
    <div className={cn(
      'bg-slate-900 border rounded-2xl p-5 flex items-start justify-between gap-4',
      border
    )}>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <p className={cn(
          'font-bold mt-2 leading-tight',
          typeof value === 'string' && value.startsWith('Rs.')
            ? 'text-2xl'
            : 'text-3xl',
          'text-white'
        )}>
          {value}
        </p>
        <p className="text-slate-500 text-xs mt-1.5">{sub}</p>
      </div>
      <div className={cn(
        'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
        bg
      )}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
    </div>
  )
}