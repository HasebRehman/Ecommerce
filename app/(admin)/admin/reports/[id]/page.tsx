'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, AlertTriangle, CheckCircle, Clock, XCircle,
  User, Store, Package, Image as ImageIcon, Video,
  Loader2, X, Play, Ban, Save, ChevronDown, FileText,
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
    color:  '#16a34a',
    bg:     'rgba(22,163,74,0.08)',
    border: 'rgba(22,163,74,0.25)',
    icon:   CheckCircle,
  },
  neglected: {
    label:  'Neglected',
    color:  '#6b7280',
    bg:     'rgba(107,114,128,0.08)',
    border: 'rgba(107,114,128,0.25)',
    icon:   XCircle,
  },
  warning_issued: {
    label:  'Warning Issued',
    color:  '#d97706',
    bg:     'rgba(217,119,6,0.08)',
    border: 'rgba(217,119,6,0.25)',
    icon:   AlertTriangle,
  },
  seller_banned: {
    label:  'Seller Banned',
    color:  '#dc2626',
    bg:     'rgba(220,38,38,0.08)',
    border: 'rgba(220,38,38,0.25)',
    icon:   Ban,
  },
}

const ACTION_OPTIONS = [
  { value: 'neglect', label: 'Neglect Report', icon: XCircle,       color: '#6b7280' },
  { value: 'warning', label: 'Warning Seller', icon: AlertTriangle,  color: '#d97706' },
  { value: 'ban',     label: 'Ban Seller',     icon: Ban,            color: '#dc2626' },
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
  shops:    { id: string; name: string; logo_url: string | null } | null
  products: { id: string; name: string; images: string[] } | null
}

export default function AdminReportDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [report,     setReport]     = useState<Report | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [lightbox,   setLightbox]   = useState<string | null>(null)
  const [videoOpen,  setVideoOpen]  = useState<string | null>(null)
  const [action,     setAction]     = useState('')
  const [actionOpen, setActionOpen] = useState(false)

  useEffect(() => {
    api.get(API.ADMIN.REPORT_DETAIL(params.id as string))
      .then(res => setReport(res.data.report))
      .catch(() => router.push('/admin/reports'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleAction = async () => {
    if (!action) { toast.error('Please select an action'); return }
    if (action === 'ban') {
      const confirmed = confirm('Are you sure you want to BAN this seller? This action cannot be undone.')
      if (!confirmed) return
    }
    setSaving(true)
    try {
      await api.patch(API.ADMIN.REPORT_DETAIL(params.id as string), { action })
      const actionLabel = ACTION_OPTIONS.find(a => a.value === action)?.label
      toast.success(`Action "${actionLabel}" applied successfully`)
      setReport(prev =>
        prev ? {
          ...prev,
          status: action === 'neglect' ? 'neglected' : action === 'warning' ? 'warning_issued' : 'seller_banned',
        } : prev
      )
      setAction('')
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to apply action')
    } finally {
      setSaving(false)
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
          .rd-page * { font-family: 'Open Sans', sans-serif; }
          .rd-display { font-family: 'Montserrat', sans-serif !important; }
        `}</style>
        <div className="rd-page flex flex-col items-center justify-center py-28 gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1.5px solid rgba(196,181,253,0.4)' }}>
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#7C3AED' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#9ca3af' }}>Loading report…</p>
        </div>
      </>
    )
  }

  if (!report) return null

  const status          = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.delivered
  const StatusIcon      = status.icon
  const mediaUrls       = report.media_urls ?? []
  const images          = mediaUrls.filter((u: string) => !u.match(/\.(mp4|webm|ogg|mov)$/i))
  const videos          = mediaUrls.filter((u: string) =>  u.match(/\.(mp4|webm|ogg|mov)$/i))
  const selectedAction  = ACTION_OPTIONS.find(a => a.value === action)
  const alreadyActioned = report.status !== 'delivered'

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');

        .rd-page * { font-family: 'Open Sans', sans-serif; }
        .rd-display { font-family: 'Montserrat', sans-serif !important; }

        @keyframes rd-slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rd-animate { opacity: 0; animation: rd-slideUp 0.45s cubic-bezier(.22,1,.36,1) forwards; }

        .rd-card {
          background: #ffffff;
          border: 1.5px solid rgba(196,181,253,0.35);
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(124,58,237,0.07);
        }

        .rd-card-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7C3AED;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rd-card-title-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #7C3AED;
          flex-shrink: 0;
        }

        .rd-info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #6b7280;
          padding: 7px 0;
          border-bottom: 1px solid rgba(196,181,253,0.15);
        }
        .rd-info-row:last-child { border-bottom: none; }
        .rd-info-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: rgba(124,58,237,0.07);
          border: 1px solid rgba(196,181,253,0.3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .rd-avatar-reporter { background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); }
        .rd-avatar-reported  { background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); }

        .rd-reason-badge {
          display: inline-flex; align-items: center;
          font-size: 13px; font-weight: 700;
          padding: 6px 16px; border-radius: 10px;
          background: rgba(124,58,237,0.08);
          color: #7C3AED;
          border: 1px solid rgba(124,58,237,0.2);
        }

        .rd-message-box {
          background: rgba(124,58,237,0.04);
          border: 1.5px solid rgba(196,181,253,0.3);
          border-radius: 14px;
          padding: 16px;
          font-size: 14px;
          color: #374151;
          line-height: 1.7;
          min-height: 80px;
        }

        .rd-action-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px;
          border-radius: 12px;
          background: #ffffff;
          border: 1.5px solid rgba(196,181,253,0.4);
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rd-action-btn:hover {
          border-color: rgba(124,58,237,0.4);
          box-shadow: 0 2px 12px rgba(124,58,237,0.1);
        }

        .rd-action-dropdown {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0; right: 0;
          background: #ffffff;
          border: 1.5px solid rgba(196,181,253,0.4);
          border-radius: 14px;
          overflow: hidden;
          z-index: 20;
          box-shadow: 0 8px 32px rgba(124,58,237,0.15);
        }
        .rd-action-opt {
          width: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s;
          border: none; background: transparent;
          color: #374151;
        }
        .rd-action-opt:hover { background: rgba(124,58,237,0.05); }
        .rd-action-opt.active { background: rgba(124,58,237,0.08); color: #1e1b4b; font-weight: 600; }

        .rd-save-btn {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: #ffffff;
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap-8px;
          gap: 8px;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }
        .rd-save-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(124,58,237,0.35);
        }
        .rd-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .rd-media-img {
          border-radius: 12px;
          border: 1.5px solid rgba(196,181,253,0.3);
          overflow: hidden;
          aspect-ratio: 1;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
        }
        .rd-media-img:hover {
          border-color: rgba(124,58,237,0.45);
          transform: scale(1.02);
        }

        .rd-section-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(196,181,253,0.4), transparent);
          margin: 18px 0;
        }
      `}</style>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            onClick={() => setLightbox(null)}>
            <X className="w-5 h-5 text-white" />
          </button>
          <img src={lightbox} alt="" className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
            onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* ── Video Modal ── */}
      {videoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setVideoOpen(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            onClick={() => setVideoOpen(null)}>
            <X className="w-5 h-5 text-white" />
          </button>
          <video src={videoOpen} controls autoPlay className="max-w-[90vw] max-h-[85vh] rounded-2xl"
            onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div className="rd-page w-full space-y-6">

        {/* ── Back button ── */}
        <button
          onClick={() => router.push('/admin/reports')}
          className="rd-animate flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: '#7C3AED', animationDelay: '0ms' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </button>

        {/* ── Hero header ── */}
        <div
          className="rd-animate relative rounded-2xl overflow-hidden px-6 py-7 sm:px-8 sm:py-8"
          style={{
            background: 'linear-gradient(125deg, #7C3AED 0%, #6D28D9 55%, #4C1D95 100%)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
            animationDelay: '40ms',
          }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="rd-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                Report Details
              </h1>
              <p className="text-white/65 text-sm mt-1">Review and take action on this report</p>
            </div>

            <div
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <StatusIcon className="w-4 h-4 text-white" />
              <span className="rd-display text-sm font-bold text-white">{status.label}</span>
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">

          {/* ════ LEFT COLUMN ════ */}
          <div className="space-y-6">

            {/* Reporter Details */}
            <div className="rd-card rd-animate p-6" style={{ animationDelay: '80ms' }}>
              <p className="rd-card-title">
                <span className="rd-card-title-dot" />
                Reporter Details
              </p>

              <div className="flex items-center gap-4 mb-5">
                {report.reporter?.avatar_url ? (
                  <img src={report.reporter.avatar_url} alt=""
                    className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                    style={{ border: '2px solid rgba(196,181,253,0.5)' }} />
                ) : (
                  <div className="rd-avatar-reporter w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {report.reporter?.full_name?.charAt(0)?.toUpperCase() ?? <User className="w-7 h-7" />}
                  </div>
                )}
                <div>
                  <p className="rd-display font-bold text-base" style={{ color: '#1e1b4b' }}>
                    {report.reporter?.full_name ?? 'Unknown User'}
                  </p>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>
                    @{report.reporter?.username ?? 'unknown'}
                  </p>
                </div>
              </div>

              <div>
                <div className="rd-info-row">
                  <div className="rd-info-icon"><User className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} /></div>
                  <span className="capitalize">{report.reporter?.role?.replace(/_/g, ' ') ?? 'User'}</span>
                </div>
                <div className="rd-info-row">
                  <div className="rd-info-icon">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="#7C3AED" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>{report.reporter?.email ?? '—'}</span>
                </div>
                <div className="rd-info-row">
                  <div className="rd-info-icon">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="#7C3AED" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span>{report.reporter?.phone ?? '—'}</span>
                </div>
                <div className="rd-info-row">
                  <div className="rd-info-icon"><Clock className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} /></div>
                  <span>
                    {new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {' at '}
                    {new Date(report.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Seller / Shop Details */}
            <div className="rd-card rd-animate p-6" style={{ animationDelay: '120ms' }}>
              <p className="rd-card-title">
                <span className="rd-card-title-dot" />
                Seller Details
              </p>

              <div className="flex items-center gap-4 mb-5">
                {report.shops?.logo_url ? (
                  <img src={report.shops.logo_url} alt=""
                    className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                    style={{ border: '2px solid rgba(196,181,253,0.5)' }} />
                ) : (
                  <div className="rd-avatar-reported w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {report.shops?.name?.charAt(0)?.toUpperCase() ?? <Store className="w-7 h-7" />}
                  </div>
                )}
                <div>
                  <p className="rd-display font-bold text-base" style={{ color: '#1e1b4b' }}>
                    {report.shops?.name ?? 'Unknown Shop'}
                  </p>
                  {report.products && (
                    <p className="text-sm flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
                      <Package className="w-3.5 h-3.5" />
                      {report.products.name}
                    </p>
                  )}
                </div>
              </div>

              {report.seller && (
                <>
                  <div className="rd-section-divider" />
                  <p className="rd-display text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>
                    Seller Info
                  </p>
                  <div>
                    <div className="rd-info-row">
                      <div className="rd-info-icon"><User className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} /></div>
                      <span style={{ color: '#1e1b4b', fontWeight: 600 }}>{report.seller.full_name ?? 'Unknown'}</span>
                      <span style={{ color: '#9ca3af' }}>@{report.seller.username ?? 'unknown'}</span>
                    </div>
                    <div className="rd-info-row">
                      <div className="rd-info-icon">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="#7C3AED" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span>{report.seller.email ?? '—'}</span>
                    </div>
                    <div className="rd-info-row">
                      <div className="rd-info-icon">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="#7C3AED" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span>{report.seller.phone ?? '—'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ════ RIGHT COLUMN ════ */}
          <div className="space-y-6">

            {/* Report Reason */}
            <div className="rd-card rd-animate p-6" style={{ animationDelay: '100ms' }}>
              <p className="rd-card-title">
                <span className="rd-card-title-dot" />
                Report Reason
              </p>
              <span className="rd-reason-badge">
                {REASON_LABELS[report.reason] ?? report.reason}
              </span>
            </div>

            {/* User Message */}
            <div className="rd-card rd-animate p-6" style={{ animationDelay: '140ms' }}>
              <p className="rd-card-title">
                <span className="rd-card-title-dot" />
                User Message
              </p>
              <div className="rd-message-box">
                {report.message || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No message provided.</span>}
              </div>
            </div>

            {/* Attached Media */}
            <div className="rd-card rd-animate p-6" style={{ animationDelay: '180ms' }}>
              <p className="rd-card-title">
                <span className="rd-card-title-dot" />
                Attached Media
              </p>

              {mediaUrls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(124,58,237,0.07)', border: '1.5px solid rgba(196,181,253,0.35)' }}>
                    <ImageIcon className="w-5 h-5" style={{ color: '#C4B5FD' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>No media attached</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {images.length > 0 && (
                    <div>
                      <p className="rd-display text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
                        <ImageIcon className="w-3 h-3" /> Images ({images.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((url: string, i: number) => (
                          <button key={i} onClick={() => setLightbox(url)} className="rd-media-img block">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {videos.length > 0 && (
                    <div>
                      <p className="rd-display text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
                        <Video className="w-3 h-3" /> Video
                      </p>
                      <button
                        onClick={() => setVideoOpen(videos[0])}
                        className="w-full aspect-video rounded-2xl flex items-center justify-center transition-all"
                        style={{ background: 'rgba(124,58,237,0.05)', border: '1.5px solid rgba(196,181,253,0.35)' }}
                      >
                        <div className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Take Action */}
            <div className="rd-card rd-animate p-6" style={{ animationDelay: '220ms' }}>
              <p className="rd-card-title">
                <span className="rd-card-title-dot" />
                Take Action
              </p>

              {alreadyActioned ? (
                <div className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: status.bg, border: `1.5px solid ${status.border}` }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${status.border}` }}>
                    <StatusIcon className="w-5 h-5" style={{ color: status.color }} />
                  </div>
                  <div>
                    <p className="rd-display font-bold text-sm" style={{ color: '#1e1b4b' }}>Action Already Taken</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                      This report was marked as{' '}
                      <span style={{ color: status.color, fontWeight: 700 }}>{status.label}</span>.
                      {' '}No further actions allowed.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Dropdown */}
                  <div className="relative mb-4">
                    <button className="rd-action-btn" onClick={() => setActionOpen(!actionOpen)}>
                      <div className="flex items-center gap-2.5">
                        {selectedAction ? (
                          <>
                            <selectedAction.icon className="w-4 h-4" style={{ color: selectedAction.color }} />
                            <span className="font-semibold" style={{ color: '#1e1b4b' }}>{selectedAction.label}</span>
                          </>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>Select an action…</span>
                        )}
                      </div>
                      <ChevronDown
                        className="w-4 h-4 transition-transform"
                        style={{ color: '#7C3AED', transform: actionOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </button>

                    {actionOpen && (
                      <div className="rd-action-dropdown">
                        {ACTION_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            className={cn('rd-action-opt', action === opt.value && 'active')}
                            onClick={() => { setAction(opt.value); setActionOpen(false) }}
                          >
                            <opt.icon className="w-4 h-4 flex-shrink-0" style={{ color: opt.color }} />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className="rd-save-btn"
                    onClick={handleAction}
                    disabled={saving || !action}
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
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
    </>
  )
}
