'use client'

import { useEffect, useState } from 'react'
import { 
  Bell, Loader2, User, ShoppingBag, 
  CheckCircle, Truck, XCircle, Package,
  ChevronDown, Shield, Briefcase
} from 'lucide-react'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  order_id: string | null
  is_read: boolean
  created_at: string
  user: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  }
  user_role: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  super_admin:       { label: 'Super Admin',       color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', icon: Shield },
  platform_admin:    { label: 'Platform Admin',    color: '#6D28D9', bg: 'rgba(109,40,217,0.12)', icon: Shield },
  operations_admin:  { label: 'Operations Admin',  color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', icon: Shield },
  business_owner:    { label: 'Seller',            color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: Briefcase },
  customer:          { label: 'Customer',          color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: User },
}

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  order_placed:          { icon: ShoppingBag, color: '#3B82F6' },
  confirmed:             { icon: CheckCircle, color: '#10B981' },
  shipped:               { icon: Truck,       color: '#8B5CF6' },
  delivered:             { icon: Package,     color: '#10B981' },
  cancelled_by_seller:   { icon: XCircle,     color: '#EF4444' },
  cancelled_by_customer: { icon: XCircle,     color: '#F59E0B' },
  order:                 { icon: ShoppingBag, color: '#3B82F6' },
  announcement:          { icon: Bell,        color: '#7C3AED' },
}

export default function SystemNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchNotifications = async (page: number = 1, append: boolean = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)

    try {
      const res = await fetch(`/api/admin/all-notifications?page=${page}`, {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.notifications) {
        if (append) {
          setNotifications(prev => [...prev, ...data.notifications])
        } else {
          setNotifications(data.notifications)
        }
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchNotifications(1, false)
  }, [])

  const handleLoadMore = () => {
    if (pagination && pagination.hasMore) {
      fetchNotifications(pagination.page + 1, true)
    }
  }

  const getRoleConfig = (role: string) => {
    return ROLE_CONFIG[role] || ROLE_CONFIG.customer
  }

  const getTypeConfig = (type: string) => {
    return TYPE_CONFIG[type] || TYPE_CONFIG.order
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .sn-header { font-family: 'Montserrat', sans-serif; }
        .sn-body   { font-family: 'Open Sans',   sans-serif; }
        
        .sn-card {
          background: linear-gradient(135deg, rgba(237,233,254,0.6), rgba(250,245,255,0.4));
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(124,58,237,0.08);
          transition: all 0.2s ease;
        }
        .sn-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(124,58,237,0.15);
        }

        .sn-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Montserrat', sans-serif;
        }

        .sn-btn-load {
          width: 100%;
          padding: 12px 24px;
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          border: none;
          border-radius: 12px;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(124,58,237,0.35);
        }
        .sn-btn-load:hover:not(:disabled) {
          background: linear-gradient(135deg, #6D28D9, #5B21B6);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.45);
        }
        .sn-btn-load:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>

      <div className="space-y-6 sn-body">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl sn-header font-bold" style={{ color: '#1e1b4b' }}>
            System Notifications
          </h1>
          <p className="mt-2 text-sm sm:text-base" style={{ color: '#6b7280' }}>
            View all user notifications across the platform
          </p>
        </div>

        {/* Stats */}
        {pagination && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="sn-badge" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.3)' }}>
              <Bell style={{ width: '12px', height: '12px' }} />
              Total: {pagination.total}
            </div>
            <div className="sn-badge" style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)' }}>
              Showing: {notifications.length}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#7C3AED' }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="sn-card text-center py-12">
            <Bell style={{ width: '48px', height: '48px', color: '#C4B5FD', margin: '0 auto 16px' }} />
            <p className="sn-header font-bold" style={{ color: '#1e1b4b', marginBottom: '8px' }}>
              No notifications yet
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Notifications will appear here as users receive them
            </p>
          </div>
        ) : (
          <>
            {/* Notifications List */}
            <div className="space-y-3">
              {notifications.map((notif) => {
                const roleConfig = getRoleConfig(notif.user_role)
                const typeConfig = getTypeConfig(notif.type)
                const RoleIcon = roleConfig.icon
                const TypeIcon = typeConfig.icon

                return (
                  <div key={notif.id} className="sn-card">
                    <div className="flex items-start gap-4">

                      {/* Type Icon */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: `${typeConfig.color}20`,
                          border: `1.5px solid ${typeConfig.color}40`,
                        }}
                      >
                        <TypeIcon style={{ width: '18px', height: '18px', color: typeConfig.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        
                        {/* User Info & Role */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {notif.user.avatar_url ? (
                              <img 
                                src={notif.user.avatar_url} 
                                alt={notif.user.full_name}
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: roleConfig.bg }}
                              >
                                <span className="text-xs font-bold" style={{ color: roleConfig.color }}>
                                  {notif.user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            )}
                            <span className="text-sm font-semibold sn-header truncate" style={{ color: '#1e1b4b' }}>
                              {notif.user.full_name || 'Unknown User'}
                            </span>
                          </div>
                          
                          <div className="sn-badge flex-shrink-0" style={{ 
                            background: roleConfig.bg, 
                            color: roleConfig.color,
                            border: `1px solid ${roleConfig.color}40`,
                          }}>
                            <RoleIcon style={{ width: '11px', height: '11px' }} />
                            {roleConfig.label}
                          </div>
                        </div>

                        {/* Notification Title */}
                        <h3 className="text-sm font-bold sn-header mb-1" style={{ color: '#1e1b4b' }}>
                          {notif.title}
                        </h3>

                        {/* Notification Message */}
                        <p className="text-sm leading-relaxed mb-2" style={{ color: '#6b7280' }}>
                          {notif.message}
                        </p>

                        {/* Footer: Time & Status */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs" style={{ color: '#9ca3af' }}>
                            {new Date(notif.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {notif.order_id && (
                            <span className="text-xs sn-badge" style={{ 
                              background: 'rgba(59,130,246,0.1)', 
                              color: '#3B82F6',
                              border: '1px solid rgba(59,130,246,0.2)',
                            }}>
                              Order: {notif.order_id.slice(0, 8)}...
                            </span>
                          )}
                          <span className="text-xs sn-badge" style={{ 
                            background: notif.is_read ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: notif.is_read ? '#10B981' : '#EF4444',
                            border: `1px solid ${notif.is_read ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                          }}>
                            {notif.is_read ? 'Read' : 'Unread'}
                          </span>
                        </div>

                      </div>

                    </div>
                  </div>
                )
              })}
            </div>

            {/* Load More Button */}
            {pagination && pagination.hasMore && (
              <div className="pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="sn-btn-load"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown style={{ width: '16px', height: '16px' }} />
                      Load More
                    </>
                  )}
                </button>
              </div>
            )}

            {/* End Message */}
            {pagination && !pagination.hasMore && notifications.length > 0 && (
              <div className="text-center py-6">
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  You've reached the end of all notifications
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </>
  )
}
