'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, Clock, CheckCircle, XCircle, Loader2,
  User, Store, Package, ChevronRight, FileText, Ban,
} from 'lucide-react'
import Link from 'next/link'
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  delivered: {
    label: 'Delivered',
    color: '#4ade80',
    bg:    'rgba(74,222,128,0.10)',
    icon:  CheckCircle,
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
    icon:  Ban,
  },
}

interface Reporter {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  email: string | null
}

interface Seller {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

interface Report {
  id:         string
  reason:     string
  message:    string
  media_urls: string[]
  status:     string
  created_at: string
  user_id:    string
  reporter:   Reporter | null
  seller:     Seller | null
  shops:      { id: string; name: string; logo_url: string | null } | null
  products:   { id: string; name: string; images: string[] } | null
}

export default function AdminReportsPage() {
  const router    = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(API.ADMIN.REPORTS)
      .then(res => setReports(res.data.reports ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <style>{`
        .card-hover {
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          border-color: rgba(64,138,113,0.45) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Reports Management</h1>
          <p className="text-slate-400 text-sm mt-1">Review and take action on user-submitted reports</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">{reports.length} total reports</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400 text-base font-medium mb-2">No reports yet</p>
          <p className="text-slate-500 text-sm">All user-submitted reports will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reports.map((report, i) => {
            const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.delivered
            const StatusIcon = status.icon

            return (
              <Link key={report.id} href={`/admin/reports/${report.id}`}>
                <div
                  className="card-hover rounded-2xl p-5 cursor-pointer bg-slate-900 border border-slate-800"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mb-2">Reporter</p>
                      <div className="flex items-center gap-3">
                        {report.reporter?.avatar_url ? (
                          <img
                            src={report.reporter.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {report.reporter?.full_name?.charAt(0)?.toUpperCase() ?? <User className="w-5 h-5" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {report.reporter?.full_name ?? 'Unknown User'}
                          </p>
                          <p className="text-slate-500 text-xs">@{report.reporter?.username ?? 'unknown'}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs px-2.5 py-1 rounded-lg font-medium"
                          style={{ background: 'rgba(64,138,113,0.12)', color: '#408A71', border: '1px solid rgba(64,138,113,0.2)' }}
                        >
                          {REASON_LABELS[report.reason] ?? report.reason}
                        </span>
                        <span
                          className="text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                          style={{ background: status.bg, color: status.color }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>

                      <p className="text-slate-500 text-xs mt-2">
                        {new Date(report.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })} at {new Date(report.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-24 bg-slate-700/50" />

                    {/* Right: Seller/Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mb-2">Reported</p>
                      <div className="flex items-center gap-3">
                        {report.shops?.logo_url ? (
                          <img
                            src={report.shops.logo_url}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                            {report.shops?.name?.charAt(0)?.toUpperCase() ?? <Store className="w-5 h-5" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {report.shops?.name ?? 'Unknown Shop'}
                          </p>
                          {report.products && (
                            <p className="text-slate-500 text-xs flex items-center gap-1 truncate">
                              <Package className="w-3 h-3 shrink-0" />
                              {report.products.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {report.seller && (
                        <div className="mt-3 pl-1">
                          <p className="text-slate-500 text-xs">Seller: {report.seller.full_name ?? 'Unknown'}</p>
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-slate-600 shrink-0" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}