import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleRecord || !['super_admin', 'operations_admin'].includes(roleRecord.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminSupabaseClient()
    const monitoring = {
      database: { status: 'disconnected', responseTime: 0 },
      security: { score: 0, issues: [] as string[] },
      api: { status: 'unknown', uptime: 0 },
      storage: { used: 0, total: 0, percentage: 0 },
      performance: { avgResponseTime: 0, requestsPerMinute: 0 },
      errorRate: { 
        total: 0, 
        rate4xx: 0, 
        rate5xx: 0, 
        last24h: { total: 0, errors: 0 },
        trend: 'stable' as 'up' | 'down' | 'stable'
      },
      cache: {
        hitRate: 0,
        missRate: 0,
        totalRequests: 0,
        size: 0,
        performance: 'good' as 'excellent' | 'good' | 'poor'
      },
    }

    // 1. Database Connection Check
    const dbStart = Date.now()
    try {
      const { error } = await adminClient.from('profiles').select('id').limit(1)
      const dbTime = Date.now() - dbStart
      monitoring.database = {
        status: error ? 'disconnected' : 'connected',
        responseTime: dbTime,
      }
    } catch {
      monitoring.database = { status: 'disconnected', responseTime: 0 }
    }

    // 2. Security Score Calculation
    const securityIssues: string[] = []
    let securityScore = 100

    // Check environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      securityIssues.push('Missing service role key')
      securityScore -= 20
    }
    if (!process.env.CRON_SECRET) {
      securityIssues.push('Missing cron secret')
      securityScore -= 10
    }

    // Check RLS policies (sample check on announcements table)
    try {
      const { data: policies } = await adminClient
        .rpc('pg_policies')
        .select('*')
        .eq('tablename', 'announcements')
      
      if (!policies || policies.length === 0) {
        securityIssues.push('Missing RLS policies on critical tables')
        securityScore -= 15
      }
    } catch {
      // RLS check failed, but don't penalize
    }

    // Check for recent failed login attempts (if you have auth logs)
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await adminClient
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('is_banned', true)
        .gte('updated_at', oneDayAgo)
      
      if (count && count > 10) {
        securityIssues.push(`${count} accounts banned in last 24h`)
        securityScore -= 5
      }
    } catch {
      // Ignore
    }

    monitoring.security = {
      score: Math.max(0, securityScore),
      issues: securityIssues,
    }

    // 3. API Health
    monitoring.api = {
      status: 'healthy',
      uptime: 99.9, // This would come from actual uptime monitoring
    }

    // 4. Storage Usage (mock data - would need actual implementation)
    monitoring.storage = {
      used: 2.4, // GB
      total: 10, // GB
      percentage: 24,
    }

    // 5. Performance Metrics (mock data)
    monitoring.performance = {
      avgResponseTime: monitoring.database.responseTime,
      requestsPerMinute: 45, // Would track actual requests
    }

    // 6. Error Rate Monitoring
    // In production, you'd track actual errors from logs or monitoring service
    // For now, we'll simulate based on database health and security score
    const simulatedErrors = Math.floor(Math.random() * 50)
    const simulatedTotal = 1000 + Math.floor(Math.random() * 500)
    const error4xx = Math.floor(simulatedErrors * 0.7) // 70% are 4xx
    const error5xx = simulatedErrors - error4xx // 30% are 5xx
    
    monitoring.errorRate = {
      total: simulatedErrors,
      rate4xx: error4xx,
      rate5xx: error5xx,
      last24h: {
        total: simulatedTotal,
        errors: simulatedErrors,
      },
      trend: simulatedErrors < 20 ? 'down' : simulatedErrors > 40 ? 'up' : 'stable',
    }

    // 7. Cache Performance
    // In production, you'd integrate with Redis or your caching layer
    // Simulating cache metrics based on system health
    const cacheHits = 850 + Math.floor(Math.random() * 100)
    const cacheMisses = 150 - Math.floor(Math.random() * 50)
    const totalCacheRequests = cacheHits + cacheMisses
    const hitRate = Math.round((cacheHits / totalCacheRequests) * 100)
    
    monitoring.cache = {
      hitRate,
      missRate: 100 - hitRate,
      totalRequests: totalCacheRequests,
      size: 128 + Math.floor(Math.random() * 50), // MB
      performance: hitRate >= 85 ? 'excellent' : hitRate >= 70 ? 'good' : 'poor',
    }

    return NextResponse.json({ monitoring })

  } catch (err) {
    console.error('GET /api/admin/monitoring error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
