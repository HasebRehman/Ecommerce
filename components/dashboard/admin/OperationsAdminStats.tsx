'use client'

import { useEffect, useState } from 'react'
import { 
  Database, Shield, Bell, AlertCircle, 
  MessageSquare, Activity, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OperationsStats {
  databaseConnection: {
    status: 'healthy' | 'warning' | 'error'
    responseTime: number
    activeConnections: number
    maxConnections: number
  }
  securityScore: {
    score: number
    lastScan: string
    vulnerabilities: number
  }
  notifications: {
    total: number
  }
  reports: {
    pending: number
    resolved: number
  }
  complaints: {
    unread: number
    resolved: number
    total: number
  }
}

export default function OperationsAdminStats() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OperationsStats>({
    databaseConnection: {
      status: 'healthy',
      responseTime: 0,
      activeConnections: 0,
      maxConnections: 100
    },
    securityScore: {
      score: 0,
      lastScan: new Date().toISOString(),
      vulnerabilities: 0
    },
    notifications: {
      total: 0
    },
    reports: {
      pending: 0,
      resolved: 0
    },
    complaints: {
      unread: 0,
      resolved: 0,
      total: 0
    }
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch all data in parallel
        const [monitoringRes, notificationsRes, reportsRes, complaintsRes] = await Promise.all([
          fetch('/api/admin/monitoring', { credentials: 'include' }),
          fetch('/api/admin/all-notifications?page=1', { credentials: 'include' }),
          fetch('/api/admin/reports', { credentials: 'include' }),
          fetch('/api/admin/complaints', { credentials: 'include' })
        ])

        const [monitoringData, notificationsData, reportsData, complaintsData] = await Promise.all([
          monitoringRes.json(),
          notificationsRes.json(),
          reportsRes.json(),
          complaintsRes.json()
        ])

        // Extract database connection from monitoring
        const dbConnection = monitoringData.monitoring?.database || {
          status: 'connected',
          responseTime: 0
        }

        // Extract security score from monitoring
        const security = monitoringData.monitoring?.security || {
          score: 0,
          issues: []
        }

        // Count total notifications
        const totalNotifications = notificationsData.pagination?.total || 0

        // Count pending reports (reports without action taken)
        const reports = reportsData.reports || []
        const pendingReports = reports.filter((r: any) => r.status === 'delivered').length
        const resolvedReports = reports.filter((r: any) => r.status !== 'delivered').length

        // Count unread complaints
        const complaints = complaintsData.complaints || []
        const unreadComplaints = complaints.filter((c: any) => !c.read).length
        const resolvedComplaints = complaints.filter((c: any) => c.read).length

        setStats({
          databaseConnection: {
            status: dbConnection.status === 'connected' ? 'healthy' : 'error',
            responseTime: dbConnection.responseTime,
            activeConnections: 12,
            maxConnections: 100
          },
          securityScore: {
            score: security.score,
            lastScan: new Date().toISOString(),
            vulnerabilities: security.issues?.length || 0
          },
          notifications: {
            total: totalNotifications
          },
          reports: {
            pending: pendingReports,
            resolved: resolvedReports
          },
          complaints: {
            unread: unreadComplaints,
            resolved: resolvedComplaints,
            total: complaints.length
          }
        })
      } catch (error) {
        console.error('Failed to load operations stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/15'
      case 'warning': return 'bg-yellow-500/15'
      case 'error': return 'bg-red-500/15'
      default: return 'bg-gray-500/15'
    }
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-green-500', bg: 'bg-green-500/15', border: 'border-green-500/25' }
    if (score >= 70) return { text: 'text-yellow-500', bg: 'bg-yellow-500/15', border: 'border-yellow-500/25' }
    return { text: 'text-red-500', bg: 'bg-red-500/15', border: 'border-red-500/25' }
  }

  const securityColors = getSecurityScoreColor(stats.securityScore.score)
  const dbConnectionPercent = (stats.databaseConnection.activeConnections / stats.databaseConnection.maxConnections) * 100

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-display { font-family: 'Montserrat', sans-serif; }
        .font-body    { font-family: 'Open Sans', sans-serif; }
        
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 0; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
      `}</style>

      <div className="font-body space-y-4">
        {/* First Row - 3 Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Database Connection */}
          <div 
            className="bg-white border border-[#C4B5FD]/30 rounded-2xl p-6 shadow-xl shadow-[#7C3AED]/15 hover:shadow-2xl hover:shadow-[#7C3AED]/20 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(196,181,253,0.12) 0%, transparent 70%), white',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center',
                getStatusBg(stats.databaseConnection.status)
              )}>
                <Database className={cn('w-5 h-5', getStatusColor(stats.databaseConnection.status))} />
              </div>
              <div className="relative">
                <span className={cn(
                  'w-2 h-2 rounded-full inline-block',
                  stats.databaseConnection.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                )} />
                <span className={cn(
                  'absolute inset-0 w-2 h-2 rounded-full animate-pulse-ring',
                  stats.databaseConnection.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                )} />
              </div>
            </div>
            <p className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider mb-2">
              Database
            </p>
            <p className="text-[#1e1b4b] text-2xl font-bold font-display mb-1">
              {stats.databaseConnection.status === 'healthy' ? 'Connected' : 'Error'}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#6b7280] mt-3">
              <Activity className="w-3 h-3" />
              <span>{stats.databaseConnection.responseTime}ms</span>
              <span className="text-[#C4B5FD]">•</span>
              <span>{stats.databaseConnection.activeConnections}/{stats.databaseConnection.maxConnections}</span>
            </div>
            {/* Connection bar */}
            <div className="mt-3 h-1.5 bg-[#EDE9FE] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-full transition-all duration-500"
                style={{ width: `${dbConnectionPercent}%` }}
              />
            </div>
          </div>

          {/* Security Score */}
          <div 
            className="bg-white border border-[#C4B5FD]/30 rounded-2xl p-6 shadow-xl shadow-[#7C3AED]/15 hover:shadow-2xl hover:shadow-[#7C3AED]/20 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(196,181,253,0.12) 0%, transparent 70%), white',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center border',
                securityColors.bg,
                securityColors.border
              )}>
                <Shield className={cn('w-5 h-5', securityColors.text)} />
              </div>
              {stats.securityScore.vulnerabilities > 0 && (
                <span className="px-2 py-0.5 bg-red-500/15 text-red-600 text-[10px] font-bold rounded-full border border-red-500/25">
                  {stats.securityScore.vulnerabilities} issues
                </span>
              )}
            </div>
            <p className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider mb-2">
              Security Score
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <p className={cn('text-3xl font-bold font-display', securityColors.text)}>
                {stats.securityScore.score}
              </p>
              <span className="text-[#6b7280] text-sm font-medium">/100</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280] mt-3">
              <Clock className="w-3 h-3" />
              <span>Last scan: {new Date(stats.securityScore.lastScan).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Notifications */}
          <div 
            className="bg-white border border-[#C4B5FD]/30 rounded-2xl p-6 shadow-xl shadow-[#7C3AED]/15 hover:shadow-2xl hover:shadow-[#7C3AED]/20 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(196,181,253,0.12) 0%, transparent 70%), white',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/25">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              {stats.notifications.total > 0 && (
                <span className="px-2.5 py-1 bg-[#7C3AED] text-white text-xs font-bold rounded-full shadow-lg">
                  {stats.notifications.total}
                </span>
              )}
            </div>
            <p className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider mb-2">
              Notifications
            </p>
            <p className="text-[#1e1b4b] text-2xl font-bold font-display mb-1">
              {stats.notifications.total}
            </p>
            <p className="text-[#6b7280] text-xs mt-3">
              Total system notifications
            </p>
          </div>

        </div>

        {/* Second Row - 2 Boxes (Full Width) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Pending Reports */}
          <div 
            className="bg-white border border-[#C4B5FD]/30 rounded-2xl p-6 shadow-xl shadow-[#7C3AED]/15 hover:shadow-2xl hover:shadow-[#7C3AED]/20 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(196,181,253,0.12) 0%, transparent 70%), white',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center border border-orange-500/25">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              {stats.reports.pending > 0 && (
                <span className="px-2 py-0.5 bg-orange-500/15 text-orange-600 text-[10px] font-bold rounded-full border border-orange-500/25">
                  Action needed
                </span>
              )}
            </div>
            <p className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider mb-2">
              Pending Reports
            </p>
            <p className="text-[#1e1b4b] text-2xl font-bold font-display mb-1">
              {stats.reports.pending}
            </p>
            <div className="flex items-center gap-3 text-xs text-[#6b7280] mt-3">
              <span className="font-bold text-green-500">{stats.reports.resolved}</span> reports resolved
            </div>
          </div>

          {/* Unread Complaints */}
          <div 
            className="bg-white border border-[#C4B5FD]/30 rounded-2xl p-6 shadow-xl shadow-[#7C3AED]/15 hover:shadow-2xl hover:shadow-[#7C3AED]/20 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(196,181,253,0.12) 0%, transparent 70%), white',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-purple-500/15 flex items-center justify-center border border-purple-500/25">
                <MessageSquare className="w-5 h-5 text-purple-500" />
              </div>
              {stats.complaints.unread > 0 && (
                <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                  {stats.complaints.unread}
                </span>
              )}
            </div>
            <p className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider mb-2">
              Unread Complaints
            </p>
            <p className="text-[#1e1b4b] text-2xl font-bold font-display mb-1">
              {stats.complaints.unread}
            </p>
            <p className="text-[#6b7280] text-xs mt-3">
              <span className="font-bold text-green-500">{stats.complaints.resolved}</span> of {stats.complaints.total} resolved
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
