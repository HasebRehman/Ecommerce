'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { TrendingUp, Loader2, BarChart3, DollarSign, TrendingDown, Activity, Target, Zap } from 'lucide-react'
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

// ── Premium SVG Line Chart with Purple Theme ──
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

  // Determine if tooltip should appear above or below based on dot position
  const getTooltipPosition = () => {
    if (!tooltip) return { y: 0, arrowDirection: 'down' }
    
    const distanceFromBottom = (PT + chartH) - tooltip.y
    const distanceFromTop = tooltip.y - PT
    
    // If dot is in bottom third, show tooltip above
    if (distanceFromBottom < 80) {
      return { y: tooltip.y - 70, arrowDirection: 'down' }
    }
    // If dot is in top third, show tooltip below
    else if (distanceFromTop < 80) {
      return { y: tooltip.y + 20, arrowDirection: 'up' }
    }
    // Otherwise show below (default)
    else {
      return { y: tooltip.y + 20, arrowDirection: 'up' }
    }
  }

  const tooltipPos = getTooltipPosition()

  return (
    <div className="relative w-full overflow-visible">
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
              stroke="rgba(124, 58, 237, 0.15)"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <text
              x={PL - 8}
              y={yPos(tick) + 4}
              textAnchor="end"
              fontSize="11"
              fill="rgba(107, 114, 128, 0.8)"
              fontFamily="Open Sans, sans-serif"
            >
              {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#purpleAreaGrad)"
          opacity="0.15"
        />

        {/* Gradient def */}
        <defs>
          <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7C3AED" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0"   />
          </linearGradient>
        </defs>

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#7C3AED"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="drop-shadow(0 2px 8px rgba(124, 58, 237, 0.25))"
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
              fill="rgba(107, 114, 128, 0.7)"
              fontFamily="Open Sans, sans-serif"
            >
              {d.label}
            </text>

            {/* Dot */}
            <circle
              cx={xPos(i)}
              cy={yPos(d.revenue)}
              r="5"
              fill={d.revenue > 0 ? '#7C3AED' : 'rgba(196, 181, 253, 0.4)'}
              stroke="#FFFFFF"
              strokeWidth="2"
              style={{ cursor: 'pointer', filter: 'drop-shadow(0 2px 6px rgba(124, 58, 237, 0.3))' }}
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
              stroke="#7C3AED"
              strokeWidth="2"
              strokeDasharray="4,3"
              opacity="0.6"
            />
            {/* Box - smart positioning */}
            <rect
              x={Math.min(Math.max(tooltip.x - 70, PL), W - PR - 145)}
              y={tooltipPos.y}
              width="150"
              height="56"
              rx="14"
              fill="rgba(255, 255, 255, 1)"
              stroke="#7C3AED"
              strokeWidth="2.5"
              filter="drop-shadow(0 16px 40px rgba(124, 58, 237, 0.35)) drop-shadow(0 8px 20px rgba(124, 58, 237, 0.25))"
            />
            {/* Arrow pointing to dot - changes direction based on position */}
            {tooltipPos.arrowDirection === 'up' ? (
              // Arrow pointing up (when tooltip is below dot)
              <polygon
                points={`${tooltip.x},${tooltip.y + 15} ${tooltip.x - 8},${tooltip.y + 25} ${tooltip.x + 8},${tooltip.y + 25}`}
                fill="rgba(255, 255, 255, 1)"
                stroke="#7C3AED"
                strokeWidth="2"
              />
            ) : (
              // Arrow pointing down (when tooltip is above dot)
              <polygon
                points={`${tooltip.x},${tooltip.y - 15} ${tooltip.x - 8},${tooltip.y - 25} ${tooltip.x + 8},${tooltip.y - 25}`}
                fill="rgba(255, 255, 255, 1)"
                stroke="#7C3AED"
                strokeWidth="2"
              />
            )}
            {/* Label text */}
            <text
              x={Math.min(Math.max(tooltip.x - 70, PL), W - PR - 145) + 14}
              y={tooltipPos.y + 28}
              fontSize="12"
              fontWeight="600"
              fill="#6b7280"
              fontFamily="Open Sans, sans-serif"
            >
              {tooltip.label}
            </text>
            {/* Value text */}
            <text
              x={Math.min(Math.max(tooltip.x - 70, PL), W - PR - 145) + 14}
              y={tooltipPos.y + 46}
              fontSize="16"
              fontWeight="900"
              fill="#7C3AED"
              fontFamily="Montserrat, sans-serif"
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
    finally { 
      if (!silent) {
        // Add a small delay to show instant switching effect
        setTimeout(() => setLoading(false), 100)
      }
    }
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.1); }
          50%      { box-shadow: 0 0 30px rgba(124, 58, 237, 0.2); }
        }

        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-fadeIn { animation: fadeIn 0.5s ease both; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #7C3AED 20%, #C4B5FD 45%, #7C3AED 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(196, 181, 253, 0.2);
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.08), 0 8px 16px rgba(124, 58, 237, 0.06);
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(196, 181, 253, 0.25);
          box-shadow: 0 25px 50px rgba(124, 58, 237, 0.12), 0 12px 24px rgba(124, 58, 237, 0.08), 0 4px 8px rgba(124, 58, 237, 0.04);
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(196, 181, 253, 0.25);
          box-shadow: 0 32px 64px rgba(124, 58, 237, 0.15), 0 16px 32px rgba(124, 58, 237, 0.1), 0 8px 16px rgba(124, 58, 237, 0.06);
        }

        .gradient-border {
          position: relative;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #7C3AED, #C4B5FD) border-box;
          border: 2px solid transparent;
        }
      `}</style>

      <div className="min-h-screen" style={{ background: '#FAF5FF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

          {/* Header Section */}
          {/* <div className="text-center lg:text-left mb-8 lg:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-white border border-[#C4B5FD]/30 shadow-lg shadow-[#7C3AED]/10 animate-slideUp">
              <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
              <span className="text-[#7C3AED] text-xs font-black uppercase tracking-widest" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Business Intelligence
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e1b4b] mb-4 animate-slideUp" 
                style={{ fontFamily: 'Montserrat, sans-serif', animationDelay: '100ms' }}>
              <span className="shimmer-text">Analytics</span> Dashboard
            </h1>
            
            <p className="text-[#6b7280] text-base sm:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 animate-slideUp" 
               style={{ fontFamily: 'Open Sans, sans-serif', animationDelay: '200ms' }}>
              Track your revenue performance and business insights over time
            </p>
          </div> */}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-12">
            {[
              { 
                label: 'Total Revenue', 
                value: `Rs. ${totalRevenue.toLocaleString()}`,
                icon: DollarSign,
                gradient: 'from-[#7C3AED] to-[#6D28D9]',
                bgGradient: 'from-[#7C3AED]/10 to-[#6D28D9]/5',
                iconBg: 'bg-[#7C3AED]',
                delay: '0ms'
              },
              { 
                label: 'Peak Revenue', 
                value: `Rs. ${maxRevenue.toLocaleString()}`,
                icon: TrendingUp,
                gradient: 'from-emerald-500 to-emerald-600',
                bgGradient: 'from-emerald-500/10 to-emerald-600/5',
                iconBg: 'bg-emerald-500',
                delay: '100ms'
              },
              { 
                label: 'Average Revenue', 
                value: `Rs. ${avgRevenue.toLocaleString()}`,
                icon: BarChart3,
                gradient: 'from-blue-500 to-blue-600',
                bgGradient: 'from-blue-500/10 to-blue-600/5',
                iconBg: 'bg-blue-500',
                delay: '200ms'
              },
            ].map((card, index) => {
              const IconComponent = card.icon
              return (
                <div key={card.label} 
                     className={cn(
                       "relative overflow-hidden rounded-2xl lg:rounded-3xl summary-card transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#7C3AED]/20 animate-slideUp group cursor-pointer",
                       "bg-gradient-to-br", card.bgGradient
                     )}
                     style={{ animationDelay: card.delay }}>
                  
                  {/* Floating background elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-[#C4B5FD]/20 to-transparent animate-float" />
                  <div className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full bg-gradient-to-tr from-[#EDE9FE]/30 to-transparent animate-float" style={{ animationDelay: '2s' }} />
                  
                  <div className="relative p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4 lg:mb-6">
                      <div className={cn(
                        "p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300",
                        card.iconBg
                      )}>
                        <IconComponent className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Activity className="w-5 h-5 text-[#7C3AED]/60" />
                      </div>
                    </div>
                    
                    <div className="space-y-1 lg:space-y-2">
                      <p className="text-[#6b7280] text-sm lg:text-base font-medium" 
                         style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {card.label}
                      </p>
                      <p className="text-[#1e1b4b] font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl group-hover:text-[#7C3AED] transition-colors duration-300 leading-tight" 
                         style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {card.value}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              )
            })}
          </div>

          {/* Chart Section */}
          <div className="chart-card rounded-2xl lg:rounded-3xl overflow-hidden animate-slideUp" 
               style={{ animationDelay: '400ms' }}>

            {/* Chart Header */}
            <div className="relative bg-gradient-to-r from-[#7C3AED]/5 via-[#C4B5FD]/5 to-[#7C3AED]/5 border-b border-[#C4B5FD]/20 p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
                
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl lg:rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] shadow-lg animate-pulse-glow">
                    <TrendingUp className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[#1e1b4b] font-bold text-xl lg:text-2xl" 
                        style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Revenue Analytics
                    </h2>
                    <p className="text-[#6b7280] text-sm lg:text-base" 
                       style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      Performance over time
                    </p>
                  </div>
                </div>
                
                {/* Tab Buttons */}
                <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-2xl p-1.5 gap-1 border border-[#C4B5FD]/30 shadow-xl shadow-[#7C3AED]/10">
                  {TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200',
                        'hover:scale-105 active:scale-95',
                        activeTab === tab.key
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white shadow-lg shadow-[#7C3AED]/30 transform scale-105'
                          : 'text-[#6b7280] hover:text-[#7C3AED] hover:bg-[#EDE9FE]/50'
                      )}
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart Content */}
            <div className="p-6 lg:p-8 min-h-[400px] lg:min-h-[500px] overflow-visible">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[300px] lg:h-[400px] gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-4 border-[#EDE9FE] border-t-[#7C3AED] animate-spin" />
                    <div className="absolute inset-2 w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-[#7C3AED]/20 to-[#C4B5FD]/20 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-[#1e1b4b] text-lg lg:text-xl font-semibold mb-2" 
                       style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Loading Analytics
                    </p>
                    <p className="text-[#6b7280] text-sm lg:text-base" 
                       style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      Gathering your business insights...
                    </p>
                  </div>
                </div>
              ) : data.every(d => d.revenue === 0) ? (
                <div className="flex flex-col items-center justify-center h-[300px] lg:h-[400px] gap-6">
                  <div className="relative">
                    <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-[#EDE9FE] to-[#C4B5FD]/30 border border-[#C4B5FD]/40 animate-float shadow-lg">
                      <TrendingDown className="w-16 h-16 lg:w-20 lg:h-20 text-[#7C3AED]/60" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#7C3AED] animate-pulse" />
                  </div>
                  <div className="text-center max-w-md">
                    <h3 className="text-[#1e1b4b] text-xl lg:text-2xl font-bold mb-3" 
                        style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      No Revenue Data Yet
                    </h3>
                    <p className="text-[#6b7280] text-sm lg:text-base leading-relaxed" 
                       style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      Revenue is counted from delivered orders only. Start selling to see your analytics here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 lg:space-y-8">
                  <LineChart data={data} />
                </div>
              )}
            </div>

            {/* Data Table */}
            {!loading && data.some(d => d.revenue > 0) && (
              <div className="border-t border-[#C4B5FD]/20 bg-gradient-to-r from-[#FAF5FF] to-white p-4 lg:p-6 -mt-50">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-[#C4B5FD]/30 shadow-xl shadow-[#7C3AED]/8">
                  
                  <div className="bg-gradient-to-r from-[#7C3AED]/5 to-[#C4B5FD]/5 p-4 lg:p-6 border-b border-[#C4B5FD]/20">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 lg:w-6 lg:h-6 text-[#7C3AED]" />
                      <h3 className="text-[#1e1b4b] font-bold text-lg lg:text-xl" 
                          style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Detailed Breakdown
                      </h3>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {/* Headers */}
                    <div className="grid border-b border-[#C4B5FD]/20 bg-[#FAF5FF]/50"
                      style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 7)}, 1fr)` }}
                    >
                      {data.slice(0, 7).map((d, i) => (
                        <div
                          key={i}
                          className="px-4 py-4 text-center border-r border-[#C4B5FD]/20 last:border-0"
                        >
                          <p className="text-[#6b7280] text-xs lg:text-sm font-medium truncate" 
                             style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {d.label}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Values */}
                    <div className="grid"
                      style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 7)}, 1fr)` }}
                    >
                      {data.slice(0, 7).map((d, i) => (
                        <div
                          key={i}
                          className={cn(
                            'px-4 py-4 text-center border-r border-[#C4B5FD]/20 last:border-0 transition-all duration-300',
                            d.revenue > 0 && 'bg-[#7C3AED]/5 hover:bg-[#7C3AED]/10 cursor-pointer'
                          )}
                        >
                          <p className={cn(
                            'text-sm lg:text-base font-bold',
                            d.revenue > 0 ? 'text-[#7C3AED]' : 'text-[#9ca3af]'
                          )} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {d.revenue > 0
                              ? `Rs. ${(d.revenue / 1000).toFixed(1)}k`
                              : '—'
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagination info */}
                  {data.length > 7 && (
                    <div className="p-4 lg:p-6 border-t border-[#C4B5FD]/20 text-center bg-[#FAF5FF]/30">
                      <p className="text-[#6b7280] text-sm lg:text-base" 
                         style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        Showing first 7 of {data.length} data points
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}