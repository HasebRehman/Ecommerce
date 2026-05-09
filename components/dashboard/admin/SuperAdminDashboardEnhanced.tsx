'use client'

import { useEffect, useState } from 'react'
import { 
  Users, FileText, Shield, Bell, AlertTriangle, Mail,
  TrendingUp, Activity, CheckCircle, Clock, XCircle
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  totalUsers: number
  roleRequests: number
  securityScore: number
  systemNotifications: number
  latestReports: any[]
  unreadComplaints: number
  userGrowth: { month: string; users: number }[]
  requestsOverTime: { status: string; count: number }[]
}

export default function SuperAdminDashboardEnhanced() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard-stats', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load dashboard stats:', err)
        setLoading(false)
      })
  }, [])

  const stats = data || {
    totalUsers: 0,
    roleRequests: 0,
    securityScore: 0,
    systemNotifications: 0,
    latestReports: [],
    unreadComplaints: 0,
    userGrowth: [],
    requestsOverTime: [],
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

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(196,181,253,0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7C3AED, #6D28D9);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .chart-bar {
          background: linear-gradient(180deg, #7C3AED, #6D28D9);
          border-radius: 4px 4px 0 0;
          transition: all 0.3s ease;
        }
        .chart-bar:hover {
          background: linear-gradient(180deg, #6D28D9, #5B21B6);
          transform: scaleY(1.05);
        }
      `}</style>

      <div className="space-y-6 dash-body">

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Total Users */}
          <div className="dash-stat-card">
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
              <span className="text-xs font-semibold" style={{ color: '#10B981' }}>+12% this month</span>
            </div>
          </div>

          {/* Role Requests */}
          <Link href="/admin/role-requests">
            <div className="dash-stat-card cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm dash-body" style={{ color: '#6b7280' }}>Role Requests</p>
                  <p className="text-4xl font-black dash-header mt-2" style={{ color: '#1e1b4b' }}>
                    {stats.roleRequests}
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
                  {stats.roleRequests > 0 ? 'Needs attention' : 'All clear'}
                </span>
              </div>
            </div>
          </Link>

          {/* Security Score */}
          <Link href="/admin/monitoring">
            <div className="dash-stat-card cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm dash-body" style={{ color: '#6b7280' }}>Security Score</p>
                  <p className="text-4xl font-black dash-header mt-2" style={{ color: '#1e1b4b' }}>
                    {stats.securityScore}%
                  </p>
                </div>
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                >
                  <Shield style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${stats.securityScore}%` }} />
              </div>
            </div>
          </Link>

          {/* System Notifications */}
          <Link href="/admin/notifications">
            <div className="dash-stat-card cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm dash-body" style={{ color: '#6b7280' }}>System Notifications</p>
                  <p className="text-4xl font-black dash-header mt-2" style={{ color: '#1e1b4b' }}>
                    {stats.systemNotifications}
                  </p>
                </div>
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
                >
                  <Bell style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity style={{ width: '14px', height: '14px', color: '#3B82F6' }} />
                <span className="text-xs font-semibold" style={{ color: '#3B82F6' }}>All platforms</span>
              </div>
            </div>
          </Link>

          {/* Latest Reports */}
          <Link href="/admin/reports">
            <div className="dash-stat-card cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm dash-body" style={{ color: '#6b7280' }}>New Reports</p>
                  <p className="text-4xl font-black dash-header mt-2" style={{ color: '#1e1b4b' }}>
                    {stats.latestReports.length}
                  </p>
                </div>
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                >
                  <AlertTriangle style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>
                  {stats.latestReports.length > 0 ? 'Pending action' : 'No pending reports'}
                </span>
              </div>
            </div>
          </Link>

          {/* Unread Complaints */}
          <Link href="/admin/complaints">
            <div className="dash-stat-card cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm dash-body" style={{ color: '#6b7280' }}>Unread Complaints</p>
                  <p className="text-4xl font-black dash-header mt-2" style={{ color: '#1e1b4b' }}>
                    {stats.unreadComplaints}
                  </p>
                </div>
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
                >
                  <Mail style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: '#8B5CF6' }}>
                  {stats.unreadComplaints > 0 ? 'Needs review' : 'All reviewed'}
                </span>
              </div>
            </div>
          </Link>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* User Growth Chart */}
          <div className="dash-card">
            <h3 className="text-xl font-black dash-header mb-6" style={{ color: '#1e1b4b' }}>
              User Growth (Last 6 Months)
            </h3>
            <div className="flex items-end justify-between gap-3 h-64">
              {stats.userGrowth.map((item, index) => {
                const maxUsers = Math.max(...stats.userGrowth.map(g => g.users))
                const height = (item.users / maxUsers) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                      <div 
                        className="chart-bar w-full relative group"
                        style={{ height: `${height}%`, minHeight: '20px' }}
                        title={`${item.users} users`}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="dash-badge" style={{ background: '#7C3AED', color: 'white' }}>
                            {item.users}
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold dash-header" style={{ color: '#6b7280' }}>
                      {item.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Role Requests Status */}
          <div className="dash-card">
            <h3 className="text-xl font-black dash-header mb-6" style={{ color: '#1e1b4b' }}>
              Role Requests Status
            </h3>
            <div className="space-y-4">
              {stats.requestsOverTime.map((item, index) => {
                const colors: Record<string, { bg: string; text: string; icon: any }> = {
                  pending: { bg: 'rgba(251,191,36,0.12)', text: '#F59E0B', icon: Clock },
                  approved: { bg: 'rgba(16,185,129,0.12)', text: '#10B981', icon: CheckCircle },
                  rejected: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444', icon: XCircle },
                }
                const config = colors[item.status] || colors.pending
                const Icon = config.icon
                const total = stats.requestsOverTime.reduce((sum, r) => sum + r.count, 0)
                const percentage = total > 0 ? (item.count / total) * 100 : 0

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon style={{ width: '16px', height: '16px', color: config.text }} />
                        <span className="text-sm font-semibold dash-header capitalize" style={{ color: '#1e1b4b' }}>
                          {item.status}
                        </span>
                      </div>
                      <span className="text-sm font-bold dash-header" style={{ color: config.text }}>
                        {item.count}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, background: config.text }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Latest Reports List */}
        {stats.latestReports.length > 0 && (
          <div className="dash-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black dash-header" style={{ color: '#1e1b4b' }}>
                Latest Reports (No Action Taken)
              </h3>
              <Link href="/admin/reports">
                <span className="text-sm font-bold dash-header" style={{ color: '#7C3AED' }}>
                  View All →
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {stats.latestReports.slice(0, 5).map((report: any) => (
                <Link key={report.id} href={`/admin/reports/${report.id}`}>
                  <div 
                    className="flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer"
                    style={{ 
                      background: 'white',
                      borderColor: 'rgba(196,181,253,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7C3AED'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(196,181,253,0.3)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.12)' }}
                      >
                        <AlertTriangle style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold dash-header" style={{ color: '#1e1b4b' }}>
                          {report.reason}
                        </p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                          Reported by {report.reporter_name} • {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="dash-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                      Pending
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
