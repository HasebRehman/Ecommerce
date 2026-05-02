'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, AlertTriangle, CheckCircle, Clock,
  Store, Package, Image as ImageIcon, Video,
  Loader2, X, Play, XCircle, Shield,
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#FAF5FF' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
        <span className="text-sm font-medium text-[#6b7280]">Loading report…</span>
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
    <div className="min-h-screen rd-font-body" style={{ background: '#FAF5FF' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        .rd-font-display { font-family: 'Montserrat', sans-serif; }
        .rd-font-body    { font-family: 'Open Sans', sans-serif; }

        @keyframes rd-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rd-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .rd-fade-up { animation: rd-fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
        .rd-fade-in { animation: rd-fadeIn 0.2s ease both; }

        .rd-card {
          background: white;
          border: 1px solid rgba(196,181,253,0.35);
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.12);
        }
      `}</style>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 rd-fade-in overflow-y-auto cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}
        >
          {/* Close button */}
          <button
            className="fixed top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer z-20"
            onClick={e => { e.stopPropagation(); setLightbox(null) }}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {/* Padding area — clicks here bubble up to overlay and close it */}
          <div className="flex justify-center px-4 pt-20 pb-10">
            {/* Only the image itself stops propagation so clicking the image doesn't close */}
            <img
              src={lightbox}
              alt=""
              className="max-w-[90vw] max-h-[75vh] rounded-2xl object-contain shadow-2xl cursor-default"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center rd-fade-in"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setVideoOpen(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
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

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div style={{
          position: 'absolute', top: '-10%', right: '-8%',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,181,253,0.22) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '-10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Back */}
        <button
          onClick={() => router.push('/report/history')}
          className="rd-fade-up group flex items-center gap-2 text-[#7C3AED] hover:text-[#6D28D9] text-sm font-bold transition-colors cursor-pointer rd-font-display"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to History
        </button>

        {/* Store + Product Header */}
        <div className="rd-card rd-fade-up p-6 sm:p-8" style={{ animationDelay: '60ms' }}>
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Logo */}
            <div className="shrink-0">
              {shop?.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={shop.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#C4B5FD]/40 shadow-md shadow-[#7C3AED]/10"
                />
              ) : (
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-[#7C3AED]/20"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
                >
                  {shop ? shop.name.charAt(0).toUpperCase() : <Store className="w-8 h-8" />}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-[#1e1b4b] text-xl sm:text-2xl font-bold rd-font-display">
                {shop?.name ?? 'No store specified'}
              </h2>
              {product && (
                <div className="flex items-center gap-2 mt-2">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-5 h-5 rounded-md object-cover" />
                  ) : (
                    <Package className="w-4 h-4 text-[#7C3AED]" />
                  )}
                  <p className="text-[#6b7280] text-sm font-medium">{product.name}</p>
                </div>
              )}
              <p className="text-[#9CA3AF] text-xs mt-3 rd-font-display">
                Submitted on {new Date(report.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })} at {new Date(report.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Details */}
          <div className="rd-card rd-fade-up p-6 sm:p-8 space-y-5" style={{ animationDelay: '80ms' }}>
            <h3 className="text-[#1e1b4b] font-bold text-lg rd-font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#7C3AED]" />
              Report Details
            </h3>

            {/* Reason */}
            <div>
              <p className="text-[#9CA3AF] text-xs uppercase tracking-wider font-bold mb-2 rd-font-display">Reason</p>
              <span
                className="text-sm px-4 py-2 rounded-xl font-bold inline-block rd-font-display"
                style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.25)' }}
              >
                {REASON_LABELS[report.reason] ?? report.reason}
              </span>
            </div>

            {/* Message */}
            <div>
              <p className="text-[#9CA3AF] text-xs uppercase tracking-wider font-bold mb-2 rd-font-display">Message</p>
              <p className="text-[#1e1b4b] text-sm leading-relaxed bg-[#FAF5FF] rounded-xl p-4 border border-[#C4B5FD]/30">
                {report.message}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="rd-card rd-fade-up p-6 sm:p-8" style={{ animationDelay: '100ms' }}>
            <h3 className="text-[#1e1b4b] font-bold text-lg mb-5 rd-font-display">Report Status</h3>
            <div
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: status.bg, border: `1px solid ${status.border}` }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${status.bg}`, border: `2px solid ${status.border}` }}
              >
                <StatusIcon className="w-7 h-7" style={{ color: status.color }} />
              </div>
              <div>
                <p className="font-bold text-base rd-font-display" style={{ color: status.color }}>{status.label}</p>
                <p className="text-[#6b7280] text-sm mt-1 leading-relaxed">{status.desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="rd-card rd-fade-up p-6 sm:p-8" style={{ animationDelay: '120ms' }}>
          <h3 className="text-[#1e1b4b] font-bold text-lg mb-5 rd-font-display flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#7C3AED]" />
            Attached Media
          </h3>

          {mediaUrls.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/25 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-[#7C3AED]/50" />
              </div>
              <p className="text-[#9CA3AF] text-sm font-medium">No media attached to this report</p>
            </div>
          ) : (
            <>
              {images.length > 0 && (
                <div className="mb-6">
                  <p className="text-[#9CA3AF] text-xs uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5 rd-font-display">
                    <ImageIcon className="w-3.5 h-3.5" /> Images ({images.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((url: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(url)}
                        className="relative group overflow-hidden rounded-xl border border-[#C4B5FD]/40 transition-all hover:border-[#7C3AED]/60 aspect-square cursor-pointer shadow-md shadow-[#7C3AED]/10 hover:shadow-lg hover:shadow-[#7C3AED]/20"
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
                  <p className="text-[#9CA3AF] text-xs uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5 rd-font-display">
                    <Video className="w-3.5 h-3.5" /> Video
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {videos.map((url: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setVideoOpen(url)}
                        className="aspect-square rounded-xl border border-[#C4B5FD]/40 bg-[#EDE9FE] flex flex-col items-center justify-center gap-2 hover:border-[#7C3AED]/60 transition-all group cursor-pointer shadow-md shadow-[#7C3AED]/10 hover:shadow-lg hover:shadow-[#7C3AED]/20"
                      >
                        <div className="w-14 h-14 rounded-full bg-[#7C3AED]/15 flex items-center justify-center group-hover:bg-[#7C3AED]/25 transition-all">
                          <Play className="w-6 h-6 text-[#7C3AED] ml-0.5" />
                        </div>
                        <span className="text-[#7C3AED] text-xs font-bold rd-font-display">Play Video</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
