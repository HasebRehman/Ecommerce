'use client'

import {
  Store, ShoppingBag, Package, TrendingUp,
  CheckCircle, Truck, XCircle, Calendar,
} from 'lucide-react'

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
      iconColor:  '#7C3AED',
      iconBg:     'rgba(124, 58, 237, 0.1)',
    },
    {
      label:  'Products Listed',
      value:  stats.totalProducts,
      sub:    'All products',
      icon:   Package,
      iconColor:  '#6D28D9',
      iconBg:     'rgba(109, 40, 217, 0.1)',
    },
    {
      label:  'Total Orders',
      value:  stats.totalOrders,
      sub:    'All time',
      icon:   ShoppingBag,
      iconColor:  '#1e1b4b',
      iconBg:     'rgba(30, 27, 75, 0.1)',
    },
    {
      label:  'Total Revenue',
      value:  `Rs. ${stats.totalRevenue.toLocaleString()}`,
      sub:    'From delivered orders',
      icon:   TrendingUp,
      iconColor:  '#f59e0b',
      iconBg:     'rgba(245, 158, 11, 0.1)',
    },

    // Row 2 — Order status breakdown
    {
      label:  'Confirmed Orders',
      value:  stats.confirmedOrders,
      sub:    'Awaiting shipment',
      icon:   CheckCircle,
      iconColor:  '#3b82f6',
      iconBg:     'rgba(59, 130, 246, 0.1)',
    },
    {
      label:  'Shipped Orders',
      value:  stats.shippedOrders,
      sub:    'On the way',
      icon:   Truck,
      iconColor:  '#7C3AED',
      iconBg:     'rgba(124, 58, 237, 0.1)',
    },
    {
      label:  'Delivered Orders',
      value:  stats.deliveredOrders,
      sub:    'Completed',
      icon:   CheckCircle,
      iconColor:  '#10b981',
      iconBg:     'rgba(16, 185, 129, 0.1)',
    },
    {
      label:  'Cancelled Orders',
      value:  stats.cancelledOrders,
      sub:    'By seller or customer',
      icon:   XCircle,
      iconColor:  '#ef4444',
      iconBg:     'rgba(239, 68, 68, 0.1)',
    },
    {
      label:  `${stats.currentMonth} Revenue`,
      value:  `Rs. ${stats.currentMonthRevenue.toLocaleString()}`,
      sub:    'Current month earnings',
      icon:   Calendar,
      iconColor:  '#f97316',
      iconBg:     'rgba(249, 115, 22, 0.1)',
      wide:   true,
    },
  ]

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Row 1 — 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.slice(0, 4).map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Row 2 — 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.slice(4, 8).map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Row 3 — Month revenue full width */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <StatCard {...cards[8]} />
      </div>
    </div>
  )
}

interface CardProps {
  label:      string
  value:      string | number
  sub:        string
  icon:       any
  iconColor:  string
  iconBg:     string
  wide?:      boolean
}

function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg }: CardProps) {
  return (
    <div 
      className="rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 transition-all duration-300 hover:-translate-y-1 cursor-default border"
      style={{ 
        background: 'white',
        boxShadow: '0 12px 32px rgba(124, 58, 237, 0.15)',
        borderColor: 'rgba(196, 181, 253, 0.3)'
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="font-open-sans text-xs sm:text-sm font-medium" style={{ color: '#6b7280' }}>
          {label}
        </p>
        <p 
          className="font-montserrat font-bold mt-2 leading-tight text-xl sm:text-2xl lg:text-3xl"
          style={{ 
            color: '#1e1b4b',
            fontSize: typeof value === 'string' && value.startsWith('Rs.') ? 'clamp(1.25rem, 3vw, 1.5rem)' : 'clamp(1.5rem, 4vw, 1.875rem)'
          }}
        >
          {value}
        </p>
        <p className="font-open-sans text-xs mt-1.5" style={{ color: '#9ca3af' }}>
          {sub}
        </p>
      </div>
      <div 
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: iconColor }} />
      </div>
    </div>
  )
}