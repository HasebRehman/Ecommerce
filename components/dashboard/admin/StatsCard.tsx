import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title:   string
  value:   string | number
  icon:    LucideIcon
  color?:  string
  change?: string
}

export default function StatsCard({ title, value, icon: Icon, color = 'text-blue-400', change }: StatsCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{title}</p>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <p className="text-white text-2xl font-bold">{value}</p>
      {change && <p className="text-slate-500 text-xs">{change}</p>}
    </div>
  )
}