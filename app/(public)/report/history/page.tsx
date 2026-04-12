'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, Clock, CheckCircle, Loader2,
  Store, Package, ChevronRight, FileText, Plus,
  XCircle,
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
    <div className="min-h-screen px-4 py-8" style={{ background: '#091413' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
        .card-hover {
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          border-color: rgba(64,138,113,0.45) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
      `}</style>

      <div className="max-w-3xl mx-auto fade-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(64,138,113,0.12)', border: '1px solid rgba(64,138,113,0.25)' }}>
                <FileText className="w-5 h-5 text-[#408A71]" />
              </div>
              <h1 className="text-white text-2xl font-bold">Report History</h1>
            </div>
            <p className="text-[#B0E4CC]/40 text-sm ml-13">All your submitted reports</p>
          </div>
          <Link href="/report">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#408A71,#285A48)' }}
            >
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#408A71]" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#285A48]/20 border border-[#285A48]/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[#408A71]/50" />
            </div>
            <p className="text-[#B0E4CC]/40 text-base font-medium mb-2">No reports yet</p>
            <p className="text-[#B0E4CC]/25 text-sm mb-6">You haven't submitted any reports</p>
            <Link href="/report">
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#408A71,#285A48)' }}
              >
                Submit a Report
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report, i) => {
              const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.delivered
              const StatusIcon = status.icon
              const shop    = report.shops
              const product = report.products

              return (
                <Link key={report.id} href={`/report/${report.id}`}>
                  <div
                    className="card-hover rounded-2xl p-5 cursor-pointer"
                    style={{
                      background: '#0a1714',
                      border: '1px solid rgba(40,90,72,0.3)',
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Shop Logo / Avatar */}
                      <div className="shrink-0">
                        {shop?.logo_url ? (
                          <img
                            src={shop.logo_url}
                            alt={shop.name}
                            className="w-14 h-14 rounded-xl object-cover border border-[#285A48]/40"
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                            style={{ background: 'linear-gradient(135deg,#285A48,#1a3d30)' }}
                          >
                            {shop ? shop.name.charAt(0).toUpperCase() : <Store className="w-6 h-6 text-[#408A71]" />}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="text-white font-semibold text-base">
                              {shop?.name ?? 'No store specified'}
                            </p>
                            {product && (
                              <p className="text-[#B0E4CC]/50 text-sm mt-0.5 flex items-center gap-1.5">
                                {product.images?.[0] ? (
                                  <img src={product.images[0]} alt="" className="w-4 h-4 rounded object-cover" />
                                ) : (
                                  <Package className="w-3.5 h-3.5" />
                                )}
                                {product.name}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#408A71]/50 shrink-0 mt-1" />
                        </div>

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {/* Reason badge */}
                          <span
                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                            style={{ background: 'rgba(64,138,113,0.12)', color: '#408A71', border: '1px solid rgba(64,138,113,0.2)' }}
                          >
                            {REASON_LABELS[report.reason] ?? report.reason}
                          </span>

                          {/* Status badge */}
                          <span
                            className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5"
                            style={{ background: status.bg, color: status.color }}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </div>

                        <p className="text-[#B0E4CC]/30 text-xs mt-3">
                          {new Date(report.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
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