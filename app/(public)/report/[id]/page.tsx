'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, AlertTriangle, CheckCircle, Clock,
  Store, Package, Image as ImageIcon, Video,
  Loader2, X, Play, XCircle,
} from 'lucide-react'
import api from '@/lib/axios'
import { API } from '@/constants/api'
import { useAuthStore } from '@/store/authStore'

const REASON_LABELS: Record<string, string> = {
  fake_product:      'Fake Product',
  fraud_seller:      'Fraud Seller',
  offensive_content: 'Offensive Content',
  abuse:             'Abuse',
  wrong_information: 'Wrong Information',
  other:             'Other',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; desc: string }> = {
  delivered: {
    label:  'Report Delivered',
    color:  '#4ade80',
    bg:     'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.25)',
    icon:   CheckCircle,
    desc:   'Your report has been received by our team.',
  },
  reviewing: {
    label:  'Under Review',
    color:  '#facc15',
    bg:     'rgba(250,204,21,0.08)',
    border: 'rgba(250,204,21,0.25)',
    icon:   Clock,
    desc:   'Our team is currently reviewing your report.',
  },
  neglected: {
    label:  'Neglected',
    color:  '#94a3b8',
    bg:     'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.25)',
    icon:   XCircle,
    desc:   'This report was reviewed and no action was needed.',
  },
  warning_issued: {
    label:  'Warning Issued',
    color:  '#facc15',
    bg:     'rgba(250,204,21,0.08)',
    border: 'rgba(250,204,21,0.25)',
    icon:   AlertTriangle,
    desc:   'A warning has been issued to the seller.',
  },
  seller_banned: {
    label:  'Seller Banned',
    color:  '#f87171',
    bg:     'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.25)',
    icon:   XCircle,
    desc:   'The seller has been banned from the platform.',
  },
}

interface Report {
  id:         string
  reason:     string
  message:    string
  media_urls: string[]
  status:     string
  created_at: string
  shops:      { id: string; name: string; logo_url: string | null } | null
  products:   { id: string; name: string; images: string[] } | null
}

export default function ReportDetailPage() {
  const params              = useParams()
  const router              = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [report,    setReport]    = useState<Report | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [lightbox,  setLightbox]  = useState<string | null>(null)
  const [videoOpen, setVideoOpen] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    api.get(API.REPORTS.DETAIL(params.id as string))
      .then(res => setReport(res.data.report))
      .catch(() => router.push('/report/history'))
      .finally(() => setLoading(false))
  }, [params.id, isAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#091413' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#408A71]" />
      </div>
    )
  }

  if (!report) return null

  const status     = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.delivered
  const StatusIcon = status.icon
  const shop       = report.shops
  const product    = report.products
  const mediaUrls  = report.media_urls ?? []
  const images     = mediaUrls.filter((u: string) => !u.match(/\.(mp4|webm|ogg|mov)$/i))
  const videos     = mediaUrls.filter((u: string) => u.match(/\.(mp4|webm|ogg|mov)$/i))

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: '#091413' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .fade-in { animation: fadeIn 0.2s ease both; }
      `}</style>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center fade-in"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Video Modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center fade-in"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setVideoOpen(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            onClick={() => setVideoOpen(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <video
            src={videoOpen}
            controls
            autoPlay
            className="max-w-[90vw] max-h-[85vh] rounded-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto fade-up space-y-5">
        {/* Back */}
        <button
          onClick={() => router.push('/report/history')}
          className="flex items-center gap-2 text-[#B0E4CC]/50 hover:text-[#B0E4CC] text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>

        {/* Store + Product Header */}
        <div className="rounded-2xl p-6" style={{ background: '#0a1714', border: '1px solid rgba(40,90,72,0.3)' }}>
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="shrink-0">
              {shop?.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={shop.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#285A48]/40"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                  style={{ background: 'linear-gradient(135deg,#285A48,#1a3d30)' }}
                >
                  {shop ? shop.name.charAt(0).toUpperCase() : <Store className="w-7 h-7 text-[#408A71]" />}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-white text-xl font-bold">
                {shop?.name ?? 'No store specified'}
              </h2>
              {product && (
                <div className="flex items-center gap-2 mt-1.5">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-5 h-5 rounded-md object-cover" />
                  ) : (
                    <Package className="w-4 h-4 text-[#408A71]" />
                  )}
                  <p className="text-[#B0E4CC]/60 text-sm">{product.name}</p>
                </div>
              )}
              <p className="text-[#B0E4CC]/30 text-xs mt-2">
                Submitted on {new Date(report.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })} at {new Date(report.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Report Details */}
        <div className="rounded-2xl p-6 space-y-5" style={{ background: '#0a1714', border: '1px solid rgba(40,90,72,0.3)' }}>
          <h3 className="text-white font-bold text-base">Report Details</h3>

          {/* Reason */}
          <div>
            <p className="text-[#B0E4CC]/40 text-xs uppercase tracking-wider font-semibold mb-2">Reason</p>
            <span
              className="text-sm px-4 py-2 rounded-xl font-medium inline-block"
              style={{ background: 'rgba(64,138,113,0.12)', color: '#408A71', border: '1px solid rgba(64,138,113,0.2)' }}
            >
              {REASON_LABELS[report.reason] ?? report.reason}
            </span>
          </div>

          {/* Message */}
          <div>
            <p className="text-[#B0E4CC]/40 text-xs uppercase tracking-wider font-semibold mb-2">Message</p>
            <p className="text-[#B0E4CC]/80 text-sm leading-relaxed bg-[#0d1a17] rounded-xl p-4 border border-[#285A48]/25">
              {report.message}
            </p>
          </div>
        </div>

        {/* Media */}
        <div className="rounded-2xl p-6" style={{ background: '#0a1714', border: '1px solid rgba(40,90,72,0.3)' }}>
          <h3 className="text-white font-bold text-base mb-4">Attached Media</h3>

          {mediaUrls.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-[#285A48]/20 border border-[#285A48]/30 flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-[#408A71]/50" />
              </div>
              <p className="text-[#B0E4CC]/30 text-sm">No media attached to this report</p>
            </div>
          ) : (
            <>
              {images.length > 0 && (
                <div className="mb-5">
                  <p className="text-[#B0E4CC]/40 text-xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Images ({images.length})
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((url: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(url)}
                        className="relative group overflow-hidden rounded-xl border border-[#285A48]/40 transition-all hover:border-[#408A71]/60 aspect-square"
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {videos.length > 0 && (
                <div>
                  <p className="text-[#B0E4CC]/40 text-xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Video
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {videos.map((url: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setVideoOpen(url)}
                        className="aspect-square rounded-xl border border-[#285A48]/40 bg-[#0d1a17] flex flex-col items-center justify-center gap-2 hover:border-[#408A71]/60 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#285A48]/40 flex items-center justify-center group-hover:bg-[#408A71]/30 transition-all">
                          <Play className="w-5 h-5 text-[#408A71] ml-0.5" />
                        </div>
                        <span className="text-[#B0E4CC]/40 text-xs">Play Video</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status */}
        <div className="rounded-2xl p-6" style={{ background: '#0a1714', border: '1px solid rgba(40,90,72,0.3)' }}>
          <h3 className="text-white font-bold text-base mb-4">Report Status</h3>
          <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: status.bg, border: `1px solid ${status.border}` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${status.bg}`, border: `1px solid ${status.border}` }}
            >
              <StatusIcon className="w-6 h-6" style={{ color: status.color }} />
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: status.color }}>{status.label}</p>
              <p className="text-[#B0E4CC]/40 text-sm mt-0.5">{status.desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}