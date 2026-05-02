'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Mail, Shield, Loader2,
  Phone, Calendar, Clock, DollarSign, Store,
  Package, ShoppingBag, XCircle, Star, Eye, EyeOff, Save, User,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  super_admin:      { label: 'Super Admin',      bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)'  },
  platform_admin:   { label: 'Platform Admin',   bg: 'rgba(249,115,22,0.12)', color: '#f97316', border: 'rgba(249,115,22,0.3)' },
  operations_admin: { label: 'Operations Admin', bg: 'rgba(234,179,8,0.12)',  color: '#ca8a04', border: 'rgba(234,179,8,0.3)'  },
  business_owner:   { label: 'Business Owner',   bg: 'rgba(124,58,237,0.12)', color: '#7C3AED', border: 'rgba(124,58,237,0.3)' },
  courier:          { label: 'Courier',          bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', border: 'rgba(34,197,94,0.3)'  },
  customer:         { label: 'Customer',         bg: 'rgba(59,130,246,0.12)', color: '#2563eb', border: 'rgba(59,130,246,0.3)' },
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data,            setData]            = useState<any>(null)
  const [loading,         setLoading]         = useState(true)
  const [saving,          setSaving]          = useState(false)
  const [showPassword,    setShowPassword]    = useState(false)
  const [newPassword,     setNewPassword]     = useState('')
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
    if (!newPassword || newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (!/[A-Z]/.test(newPassword))              { toast.error('Password must contain at least one uppercase letter'); return }
    if (!/[0-9]/.test(newPassword))              { toast.error('Password must contain at least one number'); return }
    setSaving(true)
    try {
      await api.put(`/api/admin/users/${params.id}`, { password: newPassword })
      toast.success('Password updated successfully')
      setNewPassword(''); setPasswordChanged(false); setShowPassword(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
    </div>
  )
  if (!data) return null

  const { profile, role, email, stats } = data
  const userRole       = role?.role ?? 'customer'
  const roleCfg        = ROLE_CONFIG[userRole] ?? ROLE_CONFIG.customer
  const isAdmin        = ['super_admin', 'platform_admin', 'operations_admin'].includes(userRole)
  const isBusinessOwner = userRole === 'business_owner'
  const joinedDate     = new Date(profile?.created_at)
  const initials       = profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", width: '100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .ud-header { font-family: 'Montserrat', sans-serif; }
        .ud-body   { font-family: 'Open Sans',   sans-serif; }
        a, button  { cursor: pointer !important; }

        .ud-card {
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 20px;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          box-shadow: 0 4px 18px rgba(124,58,237,0.09), 0 1px 4px rgba(0,0,0,0.04);
          overflow: hidden;
          width: 100%;
        }

        .ud-info-tile {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(124,58,237,0.06);
          border: 1px solid rgba(196,181,253,0.4);
          border-radius: 14px;
        }

        .ud-stat-tile {
          padding: 18px;
          background: rgba(124,58,237,0.06);
          border: 1px solid rgba(196,181,253,0.4);
          border-radius: 14px;
        }

        .ud-back-btn {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: rgba(124,58,237,0.10);
          border: 1.5px solid rgba(196,181,253,0.5);
          color: #7C3AED;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease;
          flex-shrink: 0;
        }
        .ud-back-btn:hover { background: rgba(124,58,237,0.18); }

        .ud-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 999px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 11px;
          border: 1px solid;
        }

        .ud-pw-input {
          width: 100%;
          height: 46px;
          padding: 0 44px 0 14px;
          background: #FAF5FF;
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 12px;
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #1e1b4b;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .ud-pw-input:focus {
          border-color: #7C3AED;
          box-shadow: 0 0 0 4px rgba(124,58,237,0.10);
        }
        .ud-pw-input::placeholder { color: #9ca3af; }

        .ud-section-title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 16px;
          color: #1e1b4b;
          padding: 18px 22px 14px;
          border-bottom: 1.5px solid rgba(196,181,253,0.3);
        }

        .ud-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ud-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }

        @media (max-width: 768px) {
          .ud-grid-4 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .ud-grid-2 { grid-template-columns: 1fr; }
          .ud-grid-4 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="space-y-6" style={{ width: '100%' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button className="ud-back-btn" onClick={() => router.push('/admin/users')}>
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </button>
          <div>
            <h1 className="ud-header text-2xl sm:text-3xl font-bold text-[#1e1b4b]">User Details</h1>
            <p className="ud-body text-[#6b7280] text-sm mt-0.5">View and manage user information</p>
          </div>
        </div>

        {/* ── Profile card ── */}
        <div className="ud-card">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>

              {/* Avatar */}
              <div style={{
                width: '80px', height: '80px',
                borderRadius: '18px',
                overflow: 'hidden',
                flexShrink: 0,
                border: '2.5px solid rgba(196,181,253,0.6)',
                boxShadow: '0 4px 16px rgba(124,58,237,0.18)',
              }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile?.full_name ?? 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800,
                    fontSize: '28px',
                  }}>
                    {initials}
                  </div>
                )}
              </div>

              {/* Name + username + badges */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 className="ud-header text-[#1e1b4b] font-bold" style={{ fontSize: '1.5rem' }}>
                    {profile?.full_name ?? 'Unknown User'}
                  </h2>
                  <span className="ud-badge" style={{ background: roleCfg.bg, color: roleCfg.color, borderColor: roleCfg.border }}>
                    {roleCfg.label}
                  </span>
                  {role?.is_banned && (
                    <span className="ud-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                      BANNED
                    </span>
                  )}
                </div>
                <p className="ud-body text-[#9ca3af] text-sm mt-1">@{profile?.username ?? 'no-username'}</p>
                {profile?.bio && (
                  <p className="ud-body text-[#4c1d95] text-sm mt-3 leading-relaxed"
                    style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(196,181,253,0.35)', borderRadius: '10px', padding: '10px 12px' }}>
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── User Information ── */}
        <div className="ud-card">
          <p className="ud-section-title">User Information</p>
          <div style={{ padding: '18px 22px' }}>
            <div className="ud-grid-2">

              {[
                { icon: Mail,        iconColor: '#7C3AED', label: 'Email',       value: email || '—' },
                { icon: Phone,       iconColor: '#16a34a', label: 'Phone Number', value: profile?.phone || '—' },
                { icon: Calendar,    iconColor: '#7C3AED', label: 'Joined Date',  value: joinedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                { icon: Clock,       iconColor: '#f97316', label: 'Joined Time',  value: joinedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
                { icon: DollarSign,  iconColor: '#ca8a04', label: 'Money Spent',  value: `Rs. ${stats?.moneySpent?.toLocaleString() ?? 0}` },
                { icon: Shield,      iconColor: roleCfg.color, label: 'Role',    value: userRole.replace(/_/g, ' ') },
              ].map(({ icon: Icon, iconColor, label, value }) => (
                <div key={label} className="ud-info-tile">
                  <Icon style={{ width: '18px', height: '18px', color: iconColor, flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="ud-body text-[#9ca3af] text-xs mb-1">{label}</p>
                    <p className="ud-header text-[#1e1b4b] text-sm font-bold break-all">{value}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* ── Admin Password Management ── */}
        {isAdmin && (
          <div className="ud-card">
            <p className="ud-section-title">Admin Password Management</p>
            <div style={{ padding: '18px 22px' }}>
              <p className="ud-body text-[#9ca3af] text-xs mb-14px" style={{ marginBottom: '14px' }}>
                Min 8 characters, at least 1 uppercase letter and 1 number
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setPasswordChanged(true) }}
                      placeholder="Enter new password"
                      className="ud-pw-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        color: '#A78BFA', display: 'flex', alignItems: 'center',
                      }}
                    >
                      {showPassword
                        ? <EyeOff style={{ width: '16px', height: '16px' }} />
                        : <Eye    style={{ width: '16px', height: '16px' }} />
                      }
                    </button>
                  </div>

                  {newPassword.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {[
                        { ok: newPassword.length >= 8,    label: '8+ chars'  },
                        { ok: /[A-Z]/.test(newPassword),  label: 'Uppercase' },
                        { ok: /[0-9]/.test(newPassword),  label: 'Number'    },
                      ].map(({ ok, label }) => (
                        <span key={label} className="ud-body text-xs" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: ok ? '#16a34a' : '#9ca3af' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ok ? '#16a34a' : '#C4B5FD', flexShrink: 0 }} />
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePasswordUpdate}
                  disabled={saving || !passwordChanged}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '0 20px',
                    height: '46px',
                    background: saving || !passwordChanged
                      ? 'rgba(196,181,253,0.4)'
                      : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    color: saving || !passwordChanged ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    opacity: saving || !passwordChanged ? 0.7 : 1,
                    boxShadow: saving || !passwordChanged ? 'none' : '0 4px 14px rgba(124,58,237,0.3)',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {saving
                    ? <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
                    : <Save    style={{ width: '16px', height: '16px' }} />
                  }
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Business Statistics ── */}
        {isBusinessOwner && (
          <div className="ud-card">
            <p className="ud-section-title">Business Statistics</p>
            <div style={{ padding: '18px 22px' }} className="space-y-4">

              {/* Main stats */}
              <div className="ud-grid-4">
                {[
                  { icon: Store,       iconColor: '#7C3AED', label: 'Total Shops',    value: stats?.shops ?? 0,                                    sub: `${stats?.liveShops ?? 0} live`          },
                  { icon: Package,     iconColor: '#2563eb', label: 'Products Listed', value: stats?.products ?? 0,                                 sub: 'All products'                           },
                  { icon: ShoppingBag, iconColor: '#f97316', label: 'Total Orders',   value: stats?.totalOrders ?? 0,                              sub: 'All time'                               },
                  { icon: DollarSign,  iconColor: '#ca8a04', label: 'Total Revenue',  value: `Rs. ${stats?.totalRevenue?.toLocaleString() ?? 0}`,  sub: 'From delivered orders'                  },
                ].map(({ icon: Icon, iconColor, label, value, sub }) => (
                  <div key={label} className="ud-stat-tile">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Icon style={{ width: '16px', height: '16px', color: iconColor, flexShrink: 0 }} />
                      <p className="ud-body text-[#9ca3af] text-xs">{label}</p>
                    </div>
                    <p className="ud-header text-[#1e1b4b] font-bold" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{value}</p>
                    <p className="ud-body text-[#9ca3af] text-xs mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Order status */}
              <div className="ud-grid-4">
                {[
                  { icon: Clock,       iconColor: '#2563eb', label: 'Confirmed',  value: stats?.confirmedOrders ?? 0,  sub: 'Awaiting shipment' },
                  { icon: Package,     iconColor: '#7C3AED', label: 'Shipped',    value: stats?.shippedOrders ?? 0,    sub: 'On the way'        },
                  { icon: ShoppingBag, iconColor: '#16a34a', label: 'Delivered',  value: stats?.deliveredOrders ?? 0,  sub: 'Completed'         },
                  { icon: XCircle,     iconColor: '#ef4444', label: 'Cancelled',  value: stats?.cancelledOrders ?? 0,  sub: 'By seller/customer'},
                ].map(({ icon: Icon, iconColor, label, value, sub }) => (
                  <div key={label} className="ud-stat-tile">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Icon style={{ width: '16px', height: '16px', color: iconColor, flexShrink: 0 }} />
                      <p className="ud-body text-[#9ca3af] text-xs">{label}</p>
                    </div>
                    <p className="ud-header text-[#1e1b4b] font-bold" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{value}</p>
                    <p className="ud-body text-[#9ca3af] text-xs mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Revenue + Reviews */}
              <div className="ud-grid-2">
                {[
                  { icon: DollarSign, iconColor: '#f97316', label: 'Current Month Revenue', value: `Rs. ${stats?.currentMonthRevenue?.toLocaleString() ?? 0}`, sub: 'Current month earnings' },
                  { icon: Star,       iconColor: '#ca8a04', label: 'Total Reviews',          value: stats?.reviews ?? 0,                                         sub: 'Customer feedback'     },
                ].map(({ icon: Icon, iconColor, label, value, sub }) => (
                  <div key={label} className="ud-stat-tile">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Icon style={{ width: '16px', height: '16px', color: iconColor, flexShrink: 0 }} />
                      <p className="ud-body text-[#9ca3af] text-xs">{label}</p>
                    </div>
                    <p className="ud-header text-[#1e1b4b] font-bold" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{value}</p>
                    <p className="ud-body text-[#9ca3af] text-xs mt-1">{sub}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* ── Account Status (non-admin only) ── */}
        {!isAdmin && (
          <div className="ud-card">
            <p className="ud-section-title">Account Status</p>
            <div style={{ padding: '18px 22px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '16px', flexWrap: 'wrap',
                padding: '18px',
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(196,181,253,0.4)',
                borderRadius: '14px',
              }}>
                <div>
                  <p className="ud-body text-[#9ca3af] text-sm mb-1">Status</p>
                  <p className="ud-header font-bold text-lg" style={{ color: role?.is_active ? '#16a34a' : '#ef4444' }}>
                    {role?.is_active ? 'Active' : 'Inactive'}
                  </p>
                  <p className="ud-body text-[#9ca3af] text-xs mt-1">
                    {role?.is_active
                      ? 'User can log in and access the platform'
                      : 'User cannot log in. If logged in, they will be forced to logout.'
                    }
                  </p>
                </div>

                <button
                  onClick={handleToggleActive}
                  disabled={saving}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '13px',
                    border: '1.5px solid',
                    background: role?.is_active ? 'rgba(239,68,68,0.10)' : 'rgba(34,197,94,0.10)',
                    color:      role?.is_active ? '#ef4444'               : '#16a34a',
                    borderColor: role?.is_active ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)',
                    transition: 'background 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving
                    ? <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
                    : role?.is_active ? 'Deactivate' : 'Activate'
                  }
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
