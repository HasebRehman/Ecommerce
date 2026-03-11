import { Store, Warehouse, ShoppingBag, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  stats: {
    totalShops:      number
    totalWarehouses: number
    totalOrders:     number
    totalRevenue:    number
  }
}

export default function MerchantStats({ stats }: Props) {
  const items = [
    {
      label: 'My Shops',
      value: stats.totalShops,
      icon:  Store,
      color: 'text-purple-400',
      bg:    'bg-purple-400/10',
      desc:  'Active retail stores',
    },
    {
      label: 'Warehouses',
      value: stats.totalWarehouses,
      icon:  Warehouse,
      color: 'text-blue-400',
      bg:    'bg-blue-400/10',
      desc:  'Storage facilities',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon:  ShoppingBag,
      color: 'text-green-400',
      bg:    'bg-green-400/10',
      desc:  'All time orders',
    },
    {
      label: 'Revenue',
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon:  TrendingUp,
      color: 'text-yellow-400',
      bg:    'bg-yellow-400/10',
      desc:  'Total earnings',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{item.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {item.value}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">{item.desc}</p>
                </div>
                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                  item.bg
                )}>
                  <Icon className={cn('w-5 h-5', item.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}