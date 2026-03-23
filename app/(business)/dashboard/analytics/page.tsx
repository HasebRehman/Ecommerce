'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'daily',  label: 'Last 7 Days'   },
  { key: 'weekly', label: 'Last 4 Weeks'  },
  { key: 'yearly', label: 'Last 7 Years'  },
]

interface DataPoint {
  label:   string
  revenue: number
}

// ── SVG Line Chart (matches screenshot style) ──
function LineChart({ data }: { data: DataPoint[] }) {
  const W      = 900
  const H      = 300
  const PL     = 60  // padding left
  const PR     = 20  // padding right
  const PT     = 20  // padding top
  const PB     = 50  // padding bottom
  const chartW = W - PL - PR
  const chartH = H - PT - PB

  if (!data.length) return null

  const maxRev = Math.max(...data.map(d => d.revenue), 1)
  const minRev = 0

  // Round max up to a nice number
  const niceMax = Math.ceil(maxRev / 10) * 10 || 10

  // Y grid lines values
  const yTicks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax]
    .map(v => Math.round(v))

  // X positions
  const xPos = (i: number) =>
    PL + (i / (data.length - 1 || 1)) * chartW

  // Y positions (inverted — 0 at bottom)
  const yPos = (v: number) =>
    PT + chartH - ((v - minRev) / (niceMax - minRev)) * chartH

  // Build SVG path
  const points = data.map((d, i) => `${xPos(i)},${yPos(d.revenue)}`)
  const linePath = `M ${points.join(' L ')}`

  // Area path (fill under line)
  const areaPath = `M ${xPos(0)},${yPos(0)} L ${points.join(' L ')} L ${xPos(data.length - 1)},${yPos(0)} Z`

  const [tooltip, setTooltip] = useState<{
    x: number, y: number, label: string, revenue: number
  } | null>(null)

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: '500px' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PL} y1={yPos(tick)}
              x2={W - PR} y2={yPos(tick)}
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <text
              x={PL - 8}
              y={yPos(tick) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#64748b"
            >
              {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGrad)"
          opacity="0.15"
        />

        {/* Gradient def */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0"   />
          </linearGradient>
        </defs>

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points + X labels + hover */}
        {data.map((d, i) => (
          <g key={i}>
            {/* X axis label */}
            <text
              x={xPos(i)}
              y={H - 10}
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
            >
              {d.label}
            </text>

            {/* Dot */}
            <circle
              cx={xPos(i)}
              cy={yPos(d.revenue)}
              r="5"
              fill={d.revenue > 0 ? '#f97316' : '#1e293b'}
              stroke="#f97316"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTooltip({
                x:       xPos(i),
                y:       yPos(d.revenue),
                label:   d.label,
                revenue: d.revenue,
              })}
            />
          </g>
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            {/* Vertical line */}
            <line
              x1={tooltip.x} y1={PT}
              x2={tooltip.x} y2={PT + chartH}
              stroke="#f97316"
              strokeWidth="1"
              strokeDasharray="4,3"
              opacity="0.5"
            />
            {/* Box */}
            <rect
              x={Math.min(tooltip.x - 55, W - PR - 115)}
              y={tooltip.y - 42}
              width="115"
              height="36"
              rx="6"
              fill="#1e293b"
              stroke="#f97316"
              strokeWidth="1"
            />
            <text
              x={Math.min(tooltip.x - 55, W - PR - 115) + 8}
              y={tooltip.y - 25}
              fontSize="10"
              fill="#94a3b8"
            >
              {tooltip.label}
            </text>
            <text
              x={Math.min(tooltip.x - 55, W - PR - 115) + 8}
              y={tooltip.y - 12}
              fontSize="11"
              fontWeight="bold"
              fill="#f97316"
            >
              Rs. {tooltip.revenue.toLocaleString()}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('daily')
  const [data,      setData]      = useState<DataPoint[]>([])
  const [loading,   setLoading]   = useState(true)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async (tab: string, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res  = await fetch(`/api/business/analytics?tab=${tab}`, {
        credentials: 'include'
      })
      const json = await res.json()
      setData(json.data ?? [])
    } catch { /* silent */ }
    finally { if (!silent) setLoading(false) }
  }, [])

  useEffect(() => {
    fetchData(activeTab, false)

    // Poll every 60s
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => fetchData(activeTab, true), 60000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeTab])

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const maxRevenue   = Math.max(...data.map(d => d.revenue), 0)
  const avgRevenue   = data.length ? Math.round(totalRevenue / data.length) : 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Track your revenue performance over time</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue',   value: `Rs. ${totalRevenue.toLocaleString()}` },
          { label: 'Peak Revenue',    value: `Rs. ${maxRevenue.toLocaleString()}`   },
          { label: 'Average Revenue', value: `Rs. ${avgRevenue.toLocaleString()}`   },
        ].map(c => (
          <div key={c.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">{c.label}</p>
            <p className="text-white font-bold text-lg">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        {/* Tabs */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <p className="text-white font-semibold">Revenue</p>
          </div>
          <div className="flex items-center bg-slate-800 rounded-xl p-1 gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.key
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
            </div>
          ) : data.every(d => d.revenue === 0) ? (
            <div className="flex flex-col items-center justify-center h-[300px] gap-3">
              <TrendingUp className="w-12 h-12 text-slate-700" />
              <p className="text-slate-400 text-sm">No revenue data for this period</p>
              <p className="text-slate-600 text-xs">
                Revenue is counted from delivered orders only
              </p>
            </div>
          ) : (
            <LineChart data={data} />
          )}
        </div>

        {/* Data Table */}
        {!loading && data.some(d => d.revenue > 0) && (
          <div className="px-6 pb-6">
            <div className="bg-slate-800/50 rounded-xl overflow-hidden">
              <div className="grid border-b border-slate-700"
                style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}
              >
                {data.map((d, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 text-center border-r border-slate-700 last:border-0"
                  >
                    <p className="text-slate-500 text-xs truncate">{d.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid"
                style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}
              >
                {data.map((d, i) => (
                  <div
                    key={i}
                    className={cn(
                      'px-3 py-2 text-center border-r border-slate-700 last:border-0',
                      d.revenue > 0 && 'bg-orange-500/5'
                    )}
                  >
                    <p className={cn(
                      'text-xs font-medium',
                      d.revenue > 0 ? 'text-orange-400' : 'text-slate-600'
                    )}>
                      {d.revenue > 0
                        ? `Rs.${(d.revenue / 1000).toFixed(1)}k`
                        : '—'
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}