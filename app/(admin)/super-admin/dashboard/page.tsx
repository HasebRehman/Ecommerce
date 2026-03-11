'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Building2,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { adminService } from '@/lib/services/admin.service'
import { cn } from '@/lib/utils'

export default function SuperAdminDashboard() {
  const [data, setData]       = useState<any>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await adminService.getStats()
        setData(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = [
    {
      label: 'Total Users',
      value: data?.stats?.totalUsers ?? 0,
      icon:  Users,
      color: 'text-blue-400',
      bg:    'bg-blue-400/10',
    },
    {
      label: 'Total Workspaces',
      value: data?.stats?.totalWorkspaces ?? 0,
      icon:  Building2,
      color: 'text-green-400',
      bg:    'bg-green-400/10',
    },
    {
      label: 'Pending Requests',
      value: data?.stats?.pendingRequests ?? 0,
      icon:  Clock,
      color: 'text-yellow-400',
      bg:    'bg-yellow-400/10',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Super Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-1">
          Platform overview and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                {isLoading ? (
                  <Skeleton className="h-16 w-full bg-slate-800" />
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      stat.bg
                    )}>
                      <Icon className={cn('w-6 h-6', stat.color)} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Pending Role Requests */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-lg">
              Pending Role Requests
            </CardTitle>
            <Link
              href="/super-admin/role-requests"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <Skeleton key={i} className="h-12 w-full bg-slate-800" />
                ))}
              </div>
            ) : data?.stats?.pendingRequests === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">
                  All requests reviewed!
                </p>
              </div>
            ) : (
              <Link
                href="/super-admin/role-requests"
                className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {data?.stats?.pendingRequests} requests waiting
                    </p>
                    <p className="text-slate-400 text-xs">
                      Click to review
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-lg">
              Recent Users
            </CardTitle>
            <Link
              href="/super-admin/users"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <Skeleton key={i} className="h-10 w-full bg-slate-800" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.recentUsers?.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {user.full_name ?? 'Unknown'}
                      </p>
                    </div>
                    <Badge className="bg-slate-700 text-slate-300 text-xs capitalize shrink-0">
                      {user.user_roles?.[0]?.role?.replace('_', ' ') ?? 'customer'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  )
}