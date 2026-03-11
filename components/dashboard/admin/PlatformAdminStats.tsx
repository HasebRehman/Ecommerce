import { Layers, Users, Building2, ToggleLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  stats: {
    totalUsers:      number
    totalWorkspaces: number
    pendingRequests: number
  }
}

export default function PlatformAdminStats({ stats }: Props) {
  const items = [
    {
      label: 'Active Users',
      value: stats.totalUsers,
      icon:  Users,
      color: 'text-blue-400',
      bg:    'bg-blue-400/10',
      desc:  'Platform users',
    },
    {
      label: 'Active Workspaces',
      value: stats.totalWorkspaces,
      icon:  Building2,
      color: 'text-green-400',
      bg:    'bg-green-400/10',
      desc:  'Shops & warehouses',
    },
    {
      label: 'Active Modules',
      value: '12',
      icon:  Layers,
      color: 'text-purple-400',
      bg:    'bg-purple-400/10',
      desc:  'Platform features',
    },
    {
      label: 'Feature Flags',
      value: '8',
      icon:  ToggleLeft,
      color: 'text-orange-400',
      bg:    'bg-orange-400/10',
      desc:  'Active toggles',
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