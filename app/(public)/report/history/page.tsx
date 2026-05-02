'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, Clock, CheckCircle, Loader2,
  Store, Package, ChevronRight, FileText, Plus,
  XCircle, Shield,
} from 'lucide-react'
import Link from 'next/link'
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  delivered: {
    label: 'Delivered',
    color: '#4ade80',
    bg:    'rgba(74,222,128,0.10)',
    icon:  CheckCircle,
  },
  reviewing: {
    label: 'Under Review',
    color: '#facc15',
    bg:    'rgba(250,204,21,0.10)',
    icon:  Clock,
  },
  neglected: {
    label: 'Neglected',
    color: '#94a3b8',
    bg:    'rgba(148,163,184,0.10)',
    icon:  XCircle,
  },
  warning_issued: {
    label: 'Warning Issued',
    color: '#facc15',
    bg:    'rgba(250,204,21,0.10)',
    icon:  AlertTriangle,
  },
  seller_banned: {
    label: 'Seller Banned',
    color: '#f87171',
    bg:    'rgba(248,113,113,0.10)',
    icon:  XCircle,
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

export default function ReportHistoryPage() {
  const router              = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [reports,  setReports]  = useState<Report[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    api.get(API.REPORTS.LIST)
      .then(res => setReports(res.data.reports ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  return (
    <div className="min-h-screen rh-font-body" style={{ background: '#FAF5FF' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        .rh-font-display { font-family: 'Montserrat', sans-serif; }
        .rh-font-body    { font-family: 'Open Sans', sans-serif; }

        @keyframes rh-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rh-fade-up { animation: rh-fadeUp 0.42s cubic-bezier(.22,1,.36,1) both; }

        .rh-card {
          background: white;
          border: 1px solid rgba(196,181,253,0.35);
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.12);
          transition: all 0.25s ease;
        }
        .rh-card:hover {
          border-color: rgba(124,58,237,0.5);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124,58,237,0.18);
        }
      `}</style>

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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Header */}
        <div className="rh-fade-up flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-[#7C3AED]/20"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED] px-2.5 py-0.5 rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/10 rh-font-display">
                  Safety
                </span>
              </div>
            </div>
            <h1 className="rh-font-display text-2xl sm:text-3xl font-bold text-[#1e1b4b] leading-tight">
              Report History
            </h1>
            <p className="text-[#6b7280] text-sm mt-1">
              {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
            </p>
          </div>
          <Link href="/report">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black text-white transition-all duration-200 hover:scale-[1.03] shadow-xl shadow-[#7C3AED]/25 cursor-pointer rh-font-display"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
            <span className="text-sm font-medium text-[#6b7280]">Loading reports…</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="rh-fade-up text-center py-20" style={{ animationDelay: '80ms' }}>
            <div className="w-20 h-20 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/25 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#7C3AED]/15">
              <Shield className="w-10 h-10 text-[#7C3AED]" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED] mb-3 px-3 py-1 rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/10 rh-font-display">
              No Reports Yet
            </span>
            <h2 className="rh-font-display text-xl font-bold text-[#1e1b4b] mt-3 mb-2">
              You Haven't Submitted Any Reports
            </h2>
            <p className="text-[#6b7280] text-sm mb-6 leading-relaxed max-w-md mx-auto">
              Help us keep VendoSphere safe by reporting suspicious products or sellers
            </p>
            <Link href="/report">
              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all duration-200 hover:scale-[1.03] shadow-xl shadow-[#7C3AED]/25 cursor-pointer rh-font-display mx-auto"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
                <Shield className="w-4 h-4" />
                Submit a Report
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            {reports.map((report, i) => {
              const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.delivered
              const StatusIcon = status.icon
              const shop    = report.shops
              const product = report.products

              return (
                <Link key={report.id} href={`/report/${report.id}`} className="flex">
                  <div
                    className="rh-card rh-fade-up p-5 sm:p-6 cursor-pointer group flex flex-col w-full"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Shop Logo */}
                      <div className="shrink-0">
                        {shop?.logo_url ? (
                          <img
                            src={shop.logo_url}
                            alt={shop.name}
                            className="w-14 h-14 rounded-xl object-cover border border-[#C4B5FD]/40 shadow-md shadow-[#7C3AED]/10"
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-[#7C3AED]/20"
                            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
                          >
                            {shop ? shop.name.charAt(0).toUpperCase() : <Store className="w-6 h-6" />}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="text-[#1e1b4b] font-bold text-base truncate rh-font-display">
                              {shop?.name ?? 'No store specified'}
                            </p>
                            {product && (
                              <p className="text-[#6b7280] text-sm mt-0.5 flex items-center gap-1.5 truncate">
                                {product.images?.[0] ? (
                                  <img src={product.images[0]} alt="" className="w-4 h-4 rounded object-cover" />
                                ) : (
                                  <Package className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span className="truncate">{product.name}</span>
                              </p>
                            )}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0 group-hover:bg-[#7C3AED]/15 transition-colors">
                            <ChevronRight className="w-4 h-4 text-[#7C3AED]" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {/* Reason badge */}
                          <span
                            className="text-xs px-3 py-1.5 rounded-lg font-bold rh-font-display"
                            style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.25)' }}
                          >
                            {REASON_LABELS[report.reason] ?? report.reason}
                          </span>

                          {/* Status badge */}
                          <span
                            className="text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 rh-font-display"
                            style={{ background: status.bg, color: status.color }}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </div>

                        <p className="text-[#9CA3AF] text-xs mt-auto pt-3 rh-font-display">
                          {new Date(report.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })} at {new Date(report.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
