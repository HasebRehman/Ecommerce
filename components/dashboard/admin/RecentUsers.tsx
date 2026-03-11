import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const ROLE_COLORS: Record<string, string> = {
  super_admin:      'bg-red-500/20 text-red-400',
  platform_admin:   'bg-orange-500/20 text-orange-400',
  operations_admin: 'bg-yellow-500/20 text-yellow-400',
  business_owner:   'bg-purple-500/20 text-purple-400',
  courier:          'bg-green-500/20 text-green-400',
  customer:         'bg-blue-500/20 text-blue-400',
}

interface Props {
  users: any[]
  canViewAll?: boolean
}

export default function RecentUsers({ users, canViewAll = true }: Props) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-white text-base font-semibold">
          Recent Users
        </CardTitle>
        {canViewAll && (
          <Link
            href="/admin/users"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {users.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            No users yet
          </p>
        ) : (
          users.map((user: any) => {
            const role = user.user_roles?.[0]?.role ?? 'customer'
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user.full_name ?? 'Unknown'}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={cn(
                  'text-xs capitalize shrink-0',
                  ROLE_COLORS[role]
                )}>
                  {role.replace('_', ' ')}
                </Badge>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}