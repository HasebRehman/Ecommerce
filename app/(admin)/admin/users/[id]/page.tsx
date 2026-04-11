'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, Mail, Shield, Loader2, 
  Phone, Calendar, Clock, DollarSign, Store,
  Package, ShoppingBag, XCircle, Star, Eye, EyeOff, Save
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const ROLE_COLORS: Record<string, string> = {
  super_admin:      'bg-red-500/20 text-red-400 border-red-500/30',
  platform_admin:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  operations_admin: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  business_owner:   'bg-purple-500/20 text-purple-400 border-purple-500/30',
  courier:          'bg-green-500/20 text-green-400 border-green-500/30',
  customer:         'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordChanged, setPasswordChanged] = useState(false)

  useEffect(() => {
    api.get(`/api/admin/users/${params.id}`)
      .then(res => setData(res.data))
      .catch(() => router.push('/admin/users'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleToggleActive = async () => {
    setSaving(true)
    try {
      const newVal = !data.role?.is_active
      await api.put(`/api/admin/users/${params.id}`, { is_active: newVal })
      setData((p: any) => ({ ...p, role: { ...p.role, is_active: newVal } }))
      toast.success(newVal ? 'User activated' : 'User deactivated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error('Password must contain at least one uppercase letter')
      return
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.error('Password must contain at least one number')
      return
    }
    setSaving(true)
    try {
      await api.put(`/api/admin/users/${params.id}`, { password: newPassword })
      toast.success('Password updated successfully')
      setNewPassword('')
      setPasswordChanged(false)
      setShowPassword(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!data) return null

  const { profile, role, email, stats } = data
  const userRole = role?.role ?? 'customer'
  const isAdmin = ['super_admin', 'platform_admin', 'operations_admin'].includes(userRole)
  const isBusinessOwner = userRole === 'business_owner'
  const joinedDate = new Date(profile?.created_at)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/users')}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">User Details</h1>
          <p className="text-slate-400 text-sm">View and manage user information</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile?.full_name ?? 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-white text-2xl font-bold">{profile?.full_name ?? 'Unknown User'}</h2>
            <p className="text-slate-400 text-sm mt-1">@{profile?.username ?? 'no-username'}</p>
            {profile?.bio && (
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-xl">
            <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs mb-1">Email</p>
              <p className="text-white text-sm break-all">{email || '—'}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-xl">
            <Phone className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs mb-1">Phone Number</p>
              <p className="text-white text-sm">{profile?.phone || '—'}</p>
            </div>
          </div>

          {/* Joined Date */}
          <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-xl">
            <Calendar className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs mb-1">Joined Date</p>
              <p className="text-white text-sm">
                {joinedDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Joined Time */}
          <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-xl">
            <Clock className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs mb-1">Joined Time</p>
              <p className="text-white text-sm">
                {joinedDate.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Money Spent */}
          <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-xl">
            <DollarSign className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs mb-1">Money Spent</p>
              <p className="text-white text-sm font-semibold">
                Rs. {stats?.moneySpent?.toLocaleString() ?? 0}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-xl">
            <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs mb-1">Role</p>
              <p className="text-white text-sm capitalize">{userRole.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Password Field */}
      {isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white text-lg font-bold mb-1">Admin Password Management</h3>
          <p className="text-slate-500 text-xs mb-4">Min 8 characters, at least 1 uppercase letter and 1 number</p>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordChanged(true)
                  }}
                  placeholder="Enter new password"
                  className="bg-slate-800 border-slate-700 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Inline validation hints */}
              {newPassword.length > 0 && (
                <div className="flex items-center gap-3 mt-2">
                  <span className={cn('text-xs flex items-center gap-1', newPassword.length >= 8 ? 'text-green-400' : 'text-slate-500')}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', newPassword.length >= 8 ? 'bg-green-400' : 'bg-slate-600')} />
                    8+ chars
                  </span>
                  <span className={cn('text-xs flex items-center gap-1', /[A-Z]/.test(newPassword) ? 'text-green-400' : 'text-slate-500')}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', /[A-Z]/.test(newPassword) ? 'bg-green-400' : 'bg-slate-600')} />
                    Uppercase
                  </span>
                  <span className={cn('text-xs flex items-center gap-1', /[0-9]/.test(newPassword) ? 'text-green-400' : 'text-slate-500')}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', /[0-9]/.test(newPassword) ? 'bg-green-400' : 'bg-slate-600')} />
                    Number
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handlePasswordUpdate}
              disabled={saving || !passwordChanged}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* Business Owner Stats */}
      {isBusinessOwner && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Business Statistics</h3>
          
          {/* Top Row - Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-purple-400" />
                <p className="text-slate-400 text-xs">Total Shops</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats?.shops ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">{stats?.liveShops ?? 0} live</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-400" />
                <p className="text-slate-400 text-xs">Products Listed</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats?.products ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">All products</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4 text-orange-400" />
                <p className="text-slate-400 text-xs">Total Orders</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats?.totalOrders ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">All time</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <p className="text-slate-400 text-xs">Total Revenue</p>
              </div>
              <p className="text-white text-2xl font-bold">Rs. {stats?.totalRevenue?.toLocaleString() ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">From delivered orders</p>
            </div>
          </div>

          {/* Order Status Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <p className="text-slate-400 text-xs">Confirmed Orders</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats?.confirmedOrders ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">Awaiting shipment</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-purple-400" />
                <p className="text-slate-400 text-xs">Shipped Orders</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats?.shippedOrders ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">On the way</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4 text-green-400" />
                <p className="text-slate-400 text-xs">Delivered Orders</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats?.deliveredOrders ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">Completed</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <p className="text-slate-400 text-xs">Cancelled Orders</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats?.cancelledOrders ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">By seller or customer</p>
            </div>
          </div>

          {/* Revenue Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-orange-400" />
                <p className="text-slate-400 text-xs">Current Month Revenue</p>
              </div>
              <p className="text-white text-2xl font-bold">Rs. {stats?.currentMonthRevenue?.toLocaleString() ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">Current month earnings</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-orange-400" />
                <p className="text-slate-400 text-xs">Total Reviews</p>
              </div>
              <p className="text-white text-2xl font-bold">{stats?.reviews ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">Customer feedback</p>
            </div>
          </div>
        </div>
      )}

      {/* Account Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4">Account Status</h3>
        <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
          <div>
            <p className="text-slate-400 text-sm mb-1">Status</p>
            <p className={cn('text-lg font-bold', role?.is_active ? 'text-green-400' : 'text-red-400')}>
              {role?.is_active ? 'Active' : 'Inactive'}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {role?.is_active 
                ? 'User can log in and access the platform' 
                : 'User cannot log in. If logged in, they will be forced to logout.'
              }
            </p>
          </div>
          <button
            onClick={handleToggleActive}
            disabled={saving}
            className={cn(
              'px-6 py-3 rounded-xl font-semibold transition-all',
              role?.is_active
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30'
            )}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : role?.is_active ? (
              'Deactivate'
            ) : (
              'Activate'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
