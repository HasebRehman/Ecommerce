'use client'

import { useEffect, useState } from 'react'
import { 
  Users, FileText, AlertCircle, Calendar,
  TrendingUp, Mail, User, Clock
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  totalUsers: number
  pendingRoleRequests: number
  totalReports: number
  scheduledAnnouncements: number
  latestUsers: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    created_at: string
    role: string
  }[]
}

export default function PlatformAdminDashboardEnhanced() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/platform-dashboard-stats', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load platform dashboard stats:', err)
        setLoading(false)
      })
  }, [])

  const stats = data || {
    totalUsers: 0,
    pendingRoleRequests: 0,
    totalReports: 0,
    scheduledAnnouncements: 0,
    latestUsers: [],
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'seller':
        return { bg: 'rgba(16,185,129,0.12)', text: '#10B981', border: '#34d399' }
      case 'customer':
        return { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6', border: '#60a5fa' }
      default:
        return { bg: 'rgba(107,114,128,0.12)', text: '#6b7280', border: '#9ca3af' }
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .dash-header { font-family: 'Montserrat', sans-serif; }
        .dash-body   { font-family: 'Open Sans',   sans-serif; }
        
        .dash-card {
          background: linear-gradient(135deg, rgba(237,233,254,0.6), rgba(250,245,255,0.4));
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.1);
          transition: all 0.3s ease;
        }
        .dash-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(124,58,237,0.2);
        }

        .dash-stat-card {
          background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(109,40,217,0.08));
          border: 2px solid rgba(196,181,253,0.4);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.2s ease;
        }
        .dash-stat-card:hover {
          border-color: #7C3AED;
          box-shadow: 0 4px 16px rgba(124,58,237,0.15);
        }

        .dash-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Montserrat', sans-serif;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }
      `}</style>

      <div className="space-y-6 dash-body">

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Total Users */}
          <Link href="/admin/users">
            <div className="dash-stat-card cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm dash-body" style={{ color: '#6b7280' }}>Total Users</p>
                  <p className="text-4xl font-black dash-header mt-2" style={{ color: '#1e1b4b' }}>
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                >
                  <Users style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp style={{ width: '14px', height: '14px', color: '#10B981' }} />
                <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Platform users</span>
              </div>
            </div>
          </Link>

          {/* Pending Role Requests */}
          <Link href="/admin/role-requests">
            <div className="dash-stat-card cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm dash-body" style={{ color: '#6b7280' }}>Pending Requests</p>
                  <p className="text-4xl font-black dash-header mt-2" style={{ color: '#1e1b4b' }}>
                    {stats.pendingRoleRequests}
                  </p>
                </div>
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
                >
                  <Clock style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: '#F59E0B' }}>
                  {stats.pendingRoleRequests > 0 ? 'Needs review' : 'All clear'}
                </span>
              </div>
            </div>
          </Link>

          {/* Total Reports */}
          <Link href="/admin/reports">
            <div className="dash-stat-card cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm dash-body" style={{ color: '#6b7280' }}>Total Reports</p>
                  <p className="text-4xl font-black dash-header mt-2" style={{ color: '#1e1b4b' }}>
                    {stats.totalReports}
                  </p>
                </div>
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                >
                  <AlertCircle style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText style={{ width: '14px', height: '14px', color: '#EF4444' }} />
                <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>All reports</span>
              </div>
            </div>
          </Link>

          {/* Scheduled Announcements */}
          <Link href="/admin/announcements">
            <div className="dash-stat-card cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm dash-body" style={{ color: '#6b7280' }}>Scheduled</p>
                  <p className="text-4xl font-black dash-header mt-2" style={{ color: '#1e1b4b' }}>
                    {stats.scheduledAnnouncements}
                  </p>
                </div>
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
                >
                  <Calendar style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail style={{ width: '14px', height: '14px', color: '#3B82F6' }} />
                <span className="text-xs font-semibold" style={{ color: '#3B82F6' }}>Announcements</span>
              </div>
            </div>
          </Link>

        </div>

        {/* Latest Users Section - Full Width */}
        {stats.latestUsers.length > 0 && (
          <div className="dash-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black dash-header" style={{ color: '#1e1b4b' }}>
                  Latest Users
                </h3>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                  Top 3 recently registered users on the platform
                </p>
              </div>
              <Link href="/admin/users">
                <span className="text-sm font-bold dash-header cursor-pointer hover:underline" style={{ color: '#7C3AED' }}>
                  View All →
                </span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.latestUsers.map((user, index) => {
                const roleColor = getRoleBadgeColor(user.role)
                const initials = user.full_name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                
                return (
                  <Link key={user.id} href={`/admin/users/${user.id}`}>
                    <div 
                      className="relative p-5 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden"
                      style={{ 
                        background: 'white',
                        borderColor: 'rgba(196,181,253,0.4)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#7C3AED'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.2)'
                        e.currentTarget.style.transform = 'translateY(-4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(196,181,253,0.4)'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      {/* Background Gradient */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-20 opacity-30"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(196,181,253,0.1))',
                          borderRadius: '16px 16px 0 0'
                        }}
                      />

                      {/* Avatar */}
                      <div className="relative flex justify-center mb-4">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.full_name}
                            className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black"
                            style={{ 
                              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                              color: 'white'
                            }}
                          >
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="text-center space-y-2">
                        <p className="text-lg font-black dash-header truncate" style={{ color: '#1e1b4b' }}>
                          {user.full_name}
                        </p>
                        <p className="text-sm truncate" style={{ color: '#6b7280' }}>
                          {user.email}
                        </p>

                        {/* Role Badge */}
                        <div className="flex justify-center pt-2">
                          <div 
                            className="dash-badge"
                            style={{ 
                              background: roleColor.bg, 
                              color: roleColor.text,
                              border: `1px solid ${roleColor.border}`
                            }}
                          >
                            <User style={{ width: '12px', height: '12px' }} />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </div>
                        </div>

                        {/* Date */}
                        <div 
                          className="text-xs pt-2 border-t"
                          style={{ 
                            color: '#6b7280',
                            borderColor: 'rgba(196,181,253,0.2)'
                          }}
                        >
                          Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
