'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, AlertTriangle, CheckCircle, Clock, XCircle,
  User, Store, Package, Image as ImageIcon, Video,
  Loader2, X, Play, Ban, Save, ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { API } from '@/constants/api'
import { cn } from '@/lib/utils'

const REASON_LABELS: Record<string, string> = {
  fake_product:      'Fake Product',
  fraud_seller:      'Fraud Seller',
  offensive_content: 'Offensive Content',
  abuse:             'Abuse',
  wrong_information: 'Wrong Information',
  other:             'Other',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  delivered: {
    label:  'Report Delivered',
    color:  '#4ade80',
    bg:     'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.25)',
    icon:   CheckCircle,
  },
  neglected: {
    label:  'Neglected',
    color:  '#94a3b8',
    bg:     'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.25)',
    icon:   XCircle,
  },
  warning_issued: {
    label:  'Warning Issued',
    color:  '#facc15',
    bg:     'rgba(250,204,21,0.08)',
    border: 'rgba(250,204,21,0.25)',
    icon:   AlertTriangle,
  },
  seller_banned: {
    label:  'Seller Banned',
    color:  '#f87171',
    bg:     'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.25)',
    icon:   Ban,
  },
}

const ACTION_OPTIONS = [
  { value: 'neglect', label: 'Neglect Report', icon: XCircle, color: '#94a3b8' },
  { value: 'warning', label: 'Warning Seller', icon: AlertTriangle, color: '#facc15' },
  { value: 'ban',     label: 'Ban Seller',     icon: Ban, color: '#f87171' },
]

interface Report {
  id:         string
  reason:     string
  message:    string
  media_urls: string[]
  status:     string
  created_at: string
  user_id:    string
  reporter: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
    phone: string | null
    email: string | null
    role: string
  } | null
  seller: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
    phone: string | null
    email: string | null
  } | null
  shops: { id: string; name: string; logo_url: string | null } | null
  products: { id: string; name: string; images: string[] } | null
}

export default function AdminReportDetailPage() {
  const params    = useParams()
  const router    = useRouter()

  const [report,    setReport]    = useState<Report | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]     = useState(false)
  const [lightbox,  setLightbox]  = useState<string | null>(null)
  const [videoOpen, setVideoOpen] = useState<string | null>(null)
  const [action,    setAction]    = useState('')
  const [actionOpen,setActionOpen]= useState(false)

  useEffect(() => {
    api.get(API.ADMIN.REPORT_DETAIL(params.id as string))
      .then(res => setReport(res.data.report))
      .catch(() => router.push('/admin/reports'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleAction = async () => {
    if (!action) {
      toast.error('Please select an action')
      return
    }

    const actionLabel = ACTION_OPTIONS.find(a => a.value === action)?.label
    if (action === 'ban') {
      const confirmed = confirm('Are you sure you want to BAN this seller? This action cannot be undone.')
      if (!confirmed) return
    }

    setSaving(true)
    try {
      await api.patch(API.ADMIN.REPORT_DETAIL(params.id as string), { action })
      toast.success(`Action "${actionLabel}" applied successfully`)
      setReport(prev => prev ? { ...prev, status: action === 'neglect' ? 'neglected' : action === 'warning' ? 'warning_issued' : 'seller_banned' } : prev)
      setAction('')
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to apply action')
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

  if (!report) return null

  const status     = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.delivered
  const StatusIcon = status.icon
  const mediaUrls  = report.media_urls ?? []
  const images     = mediaUrls.filter((u: string) => !u.match(/\.(mp4|webm|ogg|mov)$/i))
  const videos     = mediaUrls.filter((u: string) => u.match(/\.(mp4|webm|ogg|mov)$/i))
  const selectedAction = ACTION_OPTIONS.find(a => a.value === action)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img src={lightbox} alt="" className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Video Modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92"
          onClick={() => setVideoOpen(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            onClick={() => setVideoOpen(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <video src={videoOpen} controls autoPlay className="max-w-[90vw] max-h-[85vh] rounded-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Back */}
      <button
        onClick={() => router.push('/admin/reports')}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reports
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">Report Details</h1>
          <p className="text-slate-400 text-sm mt-1">Review and take action on this report</p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: status.bg, border: `1px solid ${status.border}` }}
        >
          <StatusIcon className="w-4 h-4" style={{ color: status.color }} />
          <span className="font-semibold text-sm" style={{ color: status.color }}>{status.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* User Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-4">Reporter Details</h3>
            <div className="flex items-center gap-4 mb-4">
              {report.reporter?.avatar_url ? (
                <img src={report.reporter.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-700" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {report.reporter?.full_name?.charAt(0)?.toUpperCase() ?? <User className="w-7 h-7" />}
                </div>
              )}
              <div>
                <p className="text-white font-semibold">{report.reporter?.full_name ?? 'Unknown User'}</p>
                <p className="text-slate-400 text-sm">@{report.reporter?.username ?? 'unknown'}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <User className="w-4 h-4" />
                <span className="capitalize">{report.reporter?.role?.replace(/_/g, ' ') ?? 'User'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>{report.reporter?.email ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>{report.reporter?.phone ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(report.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Seller Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-4">Seller Details</h3>
            <div className="flex items-center gap-4 mb-4">
              {report.shops?.logo_url ? (
                <img src={report.shops.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-700" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                  {report.shops?.name?.charAt(0)?.toUpperCase() ?? <Store className="w-7 h-7" />}
                </div>
              )}
              <div>
                <p className="text-white font-semibold">{report.shops?.name ?? 'Unknown Shop'}</p>
                {report.products && (
                  <p className="text-slate-400 text-sm flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {report.products.name}
                  </p>
                )}
              </div>
            </div>
            {report.seller && (
              <div className="space-y-2 text-sm border-t border-slate-800 pt-4 mt-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2">Seller Info</p>
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4" />
                  <span>{report.seller.full_name ?? 'Unknown'}</span>
                  <span className="text-slate-600">@{report.seller.username ?? 'unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span>{report.seller.email ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>{report.seller.phone ?? '—'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Report Reason */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-4">Report Reason</h3>
            <span
              className="text-sm px-4 py-2 rounded-xl font-medium inline-block"
              style={{ background: 'rgba(64,138,113,0.12)', color: '#408A71', border: '1px solid rgba(64,138,113,0.2)' }}
            >
              {REASON_LABELS[report.reason] ?? report.reason}
            </span>
          </div>

          {/* User Message */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-4">User Message</h3>
            <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              {report.message}
            </p>
          </div>

          {/* Media */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-4">Attached Media</h3>
            {mediaUrls.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-2">
                  <ImageIcon className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-slate-500 text-sm">No media attached</p>
              </div>
            ) : (
              <div className="space-y-4">
                {images.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Images ({images.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((url: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setLightbox(url)}
                          className="relative group overflow-hidden rounded-xl border border-slate-700 hover:border-slate-500 transition-all aspect-square"
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {videos.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" /> Video
                    </p>
                    <button
                      onClick={() => setVideoOpen(videos[0])}
                      className="w-full aspect-video rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center hover:border-slate-500 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-4">Take Action</h3>

            {report.status !== 'delivered' ? (
              /* Action already taken — show locked state */
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: STATUS_CONFIG[report.status]?.bg ?? 'rgba(148,163,184,0.1)', border: `1px solid ${STATUS_CONFIG[report.status]?.border ?? 'rgba(148,163,184,0.25)'}` }}>
                  {(() => { const Icon = STATUS_CONFIG[report.status]?.icon ?? XCircle; return <Icon className="w-5 h-5" style={{ color: STATUS_CONFIG[report.status]?.color ?? '#94a3b8' }} /> })()}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Action Already Taken</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    This report was marked as <span style={{ color: STATUS_CONFIG[report.status]?.color ?? '#94a3b8' }}>{STATUS_CONFIG[report.status]?.label}</span>. No further actions allowed.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Action Dropdown — opens UPWARD */}
                <div className="relative mb-4">
                  <button
                    onClick={() => setActionOpen(!actionOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm transition-all hover:border-slate-600"
                  >
                    <div className="flex items-center gap-2">
                      {selectedAction ? (
                        <>
                          <selectedAction.icon className="w-4 h-4" style={{ color: selectedAction.color }} />
                          <span className="text-white">{selectedAction.label}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">Select an action</span>
                      )}
                    </div>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', actionOpen && 'rotate-180')} />
                  </button>
                  {actionOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10 shadow-xl">
                      {ACTION_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setAction(opt.value); setActionOpen(false) }}
                          className={cn(
                            'w-full flex items-center gap-2 px-4 py-3 text-sm transition-all hover:bg-slate-700',
                            action === opt.value ? 'bg-slate-700 text-white' : 'text-slate-300'
                          )}
                        >
                          <opt.icon className="w-4 h-4" style={{ color: opt.color }} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAction}
                  disabled={saving || !action}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Action</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}