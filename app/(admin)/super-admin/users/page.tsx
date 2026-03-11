'use client'

import { useEffect, useState } from 'react'
import { Search, Loader2, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { adminService } from '@/lib/services/admin.service'
import { cn } from '@/lib/utils'

const ROLE_COLORS: Record<string, string> = {
  super_admin:      'bg-red-500/20 text-red-400 border-red-500/30',
  platform_admin:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  operations_admin: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  business_owner:   'bg-purple-500/20 text-purple-400 border-purple-500/30',
  courier:          'bg-green-500/20 text-green-400 border-green-500/30',
  customer:         'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<any[]>([])
  const [isLoading, setLoading]   = useState(true)
  const [search, setSearch]       = useState('')
  const [pagination, setPagination] = useState<any>(null)
  const [page, setPage]           = useState(1)

  const loadUsers = async (searchTerm = '', currentPage = 1) => {
    setLoading(true)
    try {
      const data = await adminService.getUsers({
        search: searchTerm,
        page:   currentPage,
      })
      setUsers(data.users ?? [])
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search, 1)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Users</h1>
          <p className="text-slate-400 mt-1">
            {pagination?.total ?? 0} total users
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search users by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 pl-10"
        />
      </div>

      {/* Users Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-slate-400 text-sm font-medium px-6 py-4">User</th>
                    <th className="text-left text-slate-400 text-sm font-medium px-6 py-4">Role</th>
                    <th className="text-left text-slate-400 text-sm font-medium px-6 py-4">Joined</th>
                    <th className="text-left text-slate-400 text-sm font-medium px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => {
                    const role = user.user_roles?.[0]?.role ?? 'customer'
                    return (
                      <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                              {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">
                                {user.full_name ?? 'Unknown'}
                              </p>
                              <p className="text-slate-400 text-xs">
                                @{user.username ?? 'no username'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={cn('capitalize text-xs', ROLE_COLORS[role])}>
                            {role.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-400 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/super-admin/users/${user.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-700 text-slate-300 hover:bg-slate-700 h-8"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Page {page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => {
                setPage(p => p - 1)
                loadUsers(search, page - 1)
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === pagination.totalPages}
              onClick={() => {
                setPage(p => p + 1)
                loadUsers(search, page + 1)
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}