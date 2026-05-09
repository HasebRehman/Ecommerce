'use client'

import { useEffect, useState } from 'react'
import { 
  Database, Shield, Activity, HardDrive, 
  Zap, RefreshCw, CheckCircle, XCircle,
  AlertTriangle, TrendingUp, Clock, Server
} from 'lucide-react'

interface MonitoringData {
  database: { status: string; responseTime: number }
  security: { score: number; issues: string[] }
  api: { status: string; uptime: number }
  storage: { used: number; total: number; percentage: number }
  performance: { avgResponseTime: number; requestsPerMinute: number }
  errorRate: { 
    total: number
    rate4xx: number
    rate5xx: number
    last24h: { total: number; errors: number }
    trend: 'up' | 'down' | 'stable'
  }
  cache: {
    hitRate: number
    missRate: number
    totalRequests: number
    size: number
    performance: 'excellent' | 'good' | 'poor'
  }
}

export default function SystemMonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchMonitoring = async () => {
    try {
      const res = await fetch('/api/admin/monitoring', { credentials: 'include' })
      const json = await res.json()
      if (json.monitoring) {
        setData(json.monitoring)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Failed to fetch monitoring data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonitoring()
    const interval = setInterval(fetchMonitoring, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const getSecurityColor = (score: number) => {
    if (score >= 90) return { bg: '#10b981', text: '#d1fae5', border: '#34d399' }
    if (score >= 70) return { bg: '#f59e0b', text: '#fef3c7', border: '#fbbf24' }
    return { bg: '#ef4444', text: '#fee2e2', border: '#f87171' }
  }

  const securityColor = data ? getSecurityColor(data.security.score) : { bg: '#6b7280', text: '#e5e7eb', border: '#9ca3af' }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .sm-header { font-family: 'Montserrat', sans-serif; }
        .sm-body   { font-family: 'Open Sans',   sans-serif; }
        
        .sm-card {
          background: linear-gradient(135deg, rgba(237,233,254,0.6), rgba(250,245,255,0.4));
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 18px rgba(124,58,237,0.09);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .sm-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124,58,237,0.15);
        }

        .sm-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sm-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Montserrat', sans-serif;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        /* Security Circle */
        .security-circle {
          position: relative;
          width: 160px;
          height: 160px;
        }
        .security-circle svg {
          transform: rotate(-90deg);
        }
        .security-circle-bg {
          fill: none;
          stroke: rgba(196,181,253,0.2);
          stroke-width: 12;
        }
        .security-circle-progress {
          fill: none;
          stroke-width: 12;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease;
        }
      `}</style>

      <div className="space-y-6 sm-body">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl sm-header font-bold" style={{ color: '#1e1b4b' }}>
              System Monitoring
            </h1>
            <p className="mt-2 text-sm sm:text-base" style={{ color: '#6b7280' }}>
              Real-time system health, security, and performance metrics
            </p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchMonitoring() }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              color: 'white',
              border: 'none',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} style={{ width: '14px', height: '14px' }} />
            Refresh
          </button>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-2 text-xs" style={{ color: '#6b7280' }}>
          <Clock style={{ width: '14px', height: '14px' }} />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin" style={{ width: '32px', height: '32px', color: '#7C3AED' }} />
          </div>
        ) : data ? (
          <>
            {/* Row 1: Database & Security */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Database Connection */}
              <div className="sm-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="sm-icon-box" style={{
                      background: data.database.status === 'connected' 
                        ? 'linear-gradient(135deg, #10b981, #059669)' 
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                    }}>
                      <Database style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div>
                      <h3 className="sm-header text-base font-bold" style={{ color: '#1e1b4b' }}>
                        Database Connection
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        Supabase PostgreSQL
                      </p>
                    </div>
                  </div>
                  <span className="sm-badge" style={{
                    background: data.database.status === 'connected' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: data.database.status === 'connected' ? '#059669' : '#dc2626',
                    border: `1px solid ${data.database.status === 'connected' ? '#34d399' : '#f87171'}`,
                  }}>
                    {data.database.status === 'connected' ? (
                      <><CheckCircle style={{ width: '14px', height: '14px' }} /> Connected</>
                    ) : (
                      <><XCircle style={{ width: '14px', height: '14px' }} /> Disconnected</>
                    )}
                  </span>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#6b7280' }}>Status</span>
                    <span className="text-sm font-bold sm-header" style={{ 
                      color: data.database.status === 'connected' ? '#059669' : '#dc2626' 
                    }}>
                      {data.database.status === 'connected' ? 'Operational' : 'Down'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#6b7280' }}>Response Time</span>
                    <span className="text-sm font-bold sm-header" style={{ color: '#1e1b4b' }}>
                      {data.database.responseTime}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#6b7280' }}>Health</span>
                    <span className="text-sm font-bold sm-header" style={{ 
                      color: data.database.responseTime < 100 ? '#059669' : data.database.responseTime < 300 ? '#f59e0b' : '#dc2626'
                    }}>
                      {data.database.responseTime < 100 ? 'Excellent' : data.database.responseTime < 300 ? 'Good' : 'Slow'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Score */}
              <div className="sm-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="sm-icon-box" style={{
                      background: `linear-gradient(135deg, ${securityColor.bg}, ${securityColor.bg}dd)`,
                      border: '1.5px solid rgba(255,255,255,0.3)',
                    }}>
                      <Shield style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div>
                      <h3 className="sm-header text-base font-bold" style={{ color: '#1e1b4b' }}>
                        Security Score
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        System security analysis
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-6">
                  <div className="security-circle">
                    <svg width="160" height="160">
                      <circle className="security-circle-bg" cx="80" cy="80" r="70" />
                      <circle 
                        className="security-circle-progress"
                        cx="80" 
                        cy="80" 
                        r="70"
                        style={{
                          stroke: securityColor.bg,
                          strokeDasharray: `${2 * Math.PI * 70}`,
                          strokeDashoffset: `${2 * Math.PI * 70 * (1 - data.security.score / 100)}`,
                        }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}>
                      <div className="sm-header" style={{ fontSize: '36px', fontWeight: 900, color: securityColor.bg }}>
                        {data.security.score}
                      </div>
                      <div className="text-xs" style={{ color: '#6b7280', marginTop: '4px' }}>
                        Security Score
                      </div>
                    </div>
                  </div>
                </div>

                {data.security.issues.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold sm-header" style={{ color: '#dc2626' }}>
                      <AlertTriangle style={{ width: '14px', height: '14px' }} />
                      Security Issues
                    </div>
                    {data.security.issues.map((issue, idx) => (
                      <div key={idx} className="text-xs pl-5" style={{ color: '#6b7280' }}>
                        • {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Row 2: API Health, Storage, Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* API Health */}
              <div className="sm-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="sm-icon-box" style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                  }}>
                    <Server style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="sm-header text-sm font-bold" style={{ color: '#1e1b4b' }}>
                      API Health
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#6b7280' }}>Status</span>
                    <span className="text-xs font-bold sm-header" style={{ color: '#059669' }}>
                      {data.api.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#6b7280' }}>Uptime</span>
                    <span className="text-xs font-bold sm-header" style={{ color: '#1e1b4b' }}>
                      {data.api.uptime}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Storage Usage */}
              <div className="sm-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="sm-icon-box" style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                  }}>
                    <HardDrive style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="sm-header text-sm font-bold" style={{ color: '#1e1b4b' }}>
                      Storage
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#6b7280' }}>Used</span>
                    <span className="text-xs font-bold sm-header" style={{ color: '#1e1b4b' }}>
                      {data.storage.used} GB
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(196,181,253,0.3)' }}>
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${data.storage.percentage}%`,
                        background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)',
                      }}
                    />
                  </div>
                  <div className="text-xs text-right" style={{ color: '#6b7280' }}>
                    {data.storage.percentage}% of {data.storage.total} GB
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="sm-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="sm-icon-box" style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                  }}>
                    <Zap style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="sm-header text-sm font-bold" style={{ color: '#1e1b4b' }}>
                      Performance
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#6b7280' }}>Avg Response</span>
                    <span className="text-xs font-bold sm-header" style={{ color: '#1e1b4b' }}>
                      {data.performance.avgResponseTime}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#6b7280' }}>Requests/min</span>
                    <span className="text-xs font-bold sm-header" style={{ color: '#1e1b4b' }}>
                      {data.performance.requestsPerMinute}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Row 3: Error Rate & Cache Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Error Rate Monitoring */}
              <div className="sm-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="sm-icon-box" style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                    }}>
                      <AlertTriangle style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div>
                      <h3 className="sm-header text-base font-bold" style={{ color: '#1e1b4b' }}>
                        Error Rate Monitoring
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        Last 24 hours
                      </p>
                    </div>
                  </div>
                  <span className="sm-badge" style={{
                    background: data.errorRate.trend === 'down' ? 'rgba(16,185,129,0.15)' : 
                                data.errorRate.trend === 'up' ? 'rgba(239,68,68,0.15)' : 
                                'rgba(251,191,36,0.15)',
                    color: data.errorRate.trend === 'down' ? '#059669' : 
                           data.errorRate.trend === 'up' ? '#dc2626' : 
                           '#d97706',
                    border: `1px solid ${data.errorRate.trend === 'down' ? '#34d399' : 
                                         data.errorRate.trend === 'up' ? '#f87171' : 
                                         '#fbbf24'}`,
                  }}>
                    {data.errorRate.trend === 'down' ? (
                      <><TrendingUp style={{ width: '14px', height: '14px', transform: 'rotate(180deg)' }} /> Decreasing</>
                    ) : data.errorRate.trend === 'up' ? (
                      <><TrendingUp style={{ width: '14px', height: '14px' }} /> Increasing</>
                    ) : (
                      <><Activity style={{ width: '14px', height: '14px' }} /> Stable</>
                    )}
                  </span>
                </div>

                <div className="space-y-4 mt-6">
                  {/* Error Rate Percentage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: '#6b7280' }}>Error Rate</span>
                      <span className="text-sm font-bold sm-header" style={{ color: '#1e1b4b' }}>
                        {((data.errorRate.last24h.errors / data.errorRate.last24h.total) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: 'rgba(239,68,68,0.2)' }}>
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${(data.errorRate.last24h.errors / data.errorRate.last24h.total) * 100}%`,
                          background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Error Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
                      <div className="text-xs" style={{ color: '#92400e' }}>4xx Errors</div>
                      <div className="text-xl font-bold sm-header mt-1" style={{ color: '#d97706' }}>
                        {data.errorRate.rate4xx}
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#92400e' }}>Client errors</div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <div className="text-xs" style={{ color: '#7f1d1d' }}>5xx Errors</div>
                      <div className="text-xl font-bold sm-header mt-1" style={{ color: '#dc2626' }}>
                        {data.errorRate.rate5xx}
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#7f1d1d' }}>Server errors</div>
                    </div>
                  </div>

                  {/* Total Stats */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(196,181,253,0.3)' }}>
                    <span className="text-sm" style={{ color: '#6b7280' }}>Total Requests</span>
                    <span className="text-sm font-bold sm-header" style={{ color: '#1e1b4b' }}>
                      {data.errorRate.last24h.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#6b7280' }}>Total Errors</span>
                    <span className="text-sm font-bold sm-header" style={{ color: '#dc2626' }}>
                      {data.errorRate.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cache Performance */}
              <div className="sm-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="sm-icon-box" style={{
                      background: data.cache.performance === 'excellent' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                  data.cache.performance === 'good' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                                  'linear-gradient(135deg, #f59e0b, #d97706)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                    }}>
                      <Zap style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div>
                      <h3 className="sm-header text-base font-bold" style={{ color: '#1e1b4b' }}>
                        Cache Performance
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        Real-time cache metrics
                      </p>
                    </div>
                  </div>
                  <span className="sm-badge" style={{
                    background: data.cache.performance === 'excellent' ? 'rgba(16,185,129,0.15)' :
                                data.cache.performance === 'good' ? 'rgba(59,130,246,0.15)' :
                                'rgba(245,158,11,0.15)',
                    color: data.cache.performance === 'excellent' ? '#059669' :
                           data.cache.performance === 'good' ? '#2563eb' :
                           '#d97706',
                    border: `1px solid ${data.cache.performance === 'excellent' ? '#34d399' :
                                         data.cache.performance === 'good' ? '#60a5fa' :
                                         '#fbbf24'}`,
                  }}>
                    {data.cache.performance === 'excellent' ? (
                      <><CheckCircle style={{ width: '14px', height: '14px' }} /> Excellent</>
                    ) : data.cache.performance === 'good' ? (
                      <><CheckCircle style={{ width: '14px', height: '14px' }} /> Good</>
                    ) : (
                      <><AlertTriangle style={{ width: '14px', height: '14px' }} /> Poor</>
                    )}
                  </span>
                </div>

                <div className="space-y-4 mt-6">
                  {/* Hit Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: '#6b7280' }}>Cache Hit Rate</span>
                      <span className="text-sm font-bold sm-header" style={{ color: '#1e1b4b' }}>
                        {data.cache.hitRate}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: 'rgba(196,181,253,0.3)' }}>
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${data.cache.hitRate}%`,
                          background: data.cache.hitRate >= 85 ? 'linear-gradient(90deg, #10b981, #059669)' :
                                      data.cache.hitRate >= 70 ? 'linear-gradient(90deg, #3b82f6, #2563eb)' :
                                      'linear-gradient(90deg, #f59e0b, #d97706)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Hit vs Miss */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <div className="text-xs" style={{ color: '#065f46' }}>Cache Hits</div>
                      <div className="text-xl font-bold sm-header mt-1" style={{ color: '#059669' }}>
                        {Math.round((data.cache.hitRate / 100) * data.cache.totalRequests)}
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#065f46' }}>{data.cache.hitRate}%</div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <div className="text-xs" style={{ color: '#7f1d1d' }}>Cache Misses</div>
                      <div className="text-xl font-bold sm-header mt-1" style={{ color: '#dc2626' }}>
                        {Math.round((data.cache.missRate / 100) * data.cache.totalRequests)}
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#7f1d1d' }}>{data.cache.missRate}%</div>
                    </div>
                  </div>

                  {/* Cache Stats */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(196,181,253,0.3)' }}>
                    <span className="text-sm" style={{ color: '#6b7280' }}>Total Requests</span>
                    <span className="text-sm font-bold sm-header" style={{ color: '#1e1b4b' }}>
                      {data.cache.totalRequests.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#6b7280' }}>Cache Size</span>
                    <span className="text-sm font-bold sm-header" style={{ color: '#1e1b4b' }}>
                      {data.cache.size} MB
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="sm-card text-center py-12">
            <AlertTriangle style={{ width: '48px', height: '48px', color: '#ef4444', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>Failed to load monitoring data</p>
          </div>
        )}

      </div>
    </>
  )
}
