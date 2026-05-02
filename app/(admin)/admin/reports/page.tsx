'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle, CheckCircle, XCircle, Loader2,
  User, Store, Package, ChevronRight, FileText, Ban,
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/axios'
import { API } from '@/constants/api'

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
    label:  'Delivered',
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
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(API.ADMIN.REPORTS)
      .then(res => setReports(res.data.reports ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');

        .reports-page * {
          font-family: 'Open Sans', sans-serif;
        }
        .reports-page .font-display {
          font-family: 'Montserrat', sans-serif;
        }

        @keyframes reports-slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reports-card-animate {
          opacity: 0;
          animation: reports-slideUp 0.45s cubic-bezier(.22,1,.36,1) forwards;
        }

        .report-card {
          background: #ffffff;
          border: 1.5px solid rgba(196,181,253,0.35);
          border-radius: 20px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
          box-shadow: 0 4px 20px rgba(124,58,237,0.07);
          height: 100%;
        }
        .report-card:hover {
          border-color: rgba(124,58,237,0.45);
          box-shadow: 0 12px 40px rgba(124,58,237,0.18);
          transform: translateY(-3px);
        }

        .report-divider {
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(196,181,253,0.5), transparent);
          align-self: stretch;
          min-height: 60px;
          flex-shrink: 0;
        }

        .report-avatar-reporter {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
        }
        .report-avatar-reported {
          background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
        }

        .reason-badge {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 8px;
          background: rgba(124,58,237,0.08);
          color: #7C3AED;
          border: 1px solid rgba(124,58,237,0.2);
          letter-spacing: 0.01em;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (min-width: 768px) {
          .reports-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .report-card-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 20px;
          gap: 0;
        }

        .report-card-body {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }

        .report-side {
          flex: 1;
          min-width: 0;
        }

        .report-section-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 10px;
          font-family: 'Montserrat', sans-serif;
        }

        .report-card-footer {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(196,181,253,0.25);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .report-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .report-date {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 500;
          white-space: nowrap;
        }

        .report-arrow {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(124,58,237,0.08);
          border: 1px solid rgba(124,58,237,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s;
        }
        .report-card:hover .report-arrow {
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.35);
        }
      `}</style>

      <div className="reports-page space-y-8">

        {/* ── Header ── */}
        <div
          className="relative rounded-2xl overflow-hidden px-6 py-7 sm:px-8 sm:py-8"
          style={{
            background: 'linear-gradient(125deg, #7C3AED 0%, #6D28D9 55%, #4C1D95 100%)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
          }}
        >
          {/* decorative rings */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />

          <div className="relative">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
              Reports Management
            </h1>
            <p className="text-white/65 text-sm mt-1">
              Review and take action on user-submitted reports
            </p>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1.5px solid rgba(196,181,253,0.4)' }}
            >
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#7C3AED' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#9ca3af' }}>Loading reports…</p>
          </div>
        ) : reports.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-2xl"
            style={{ background: '#ffffff', border: '1.5px dashed rgba(196,181,253,0.5)', boxShadow: '0 4px 20px rgba(124,58,237,0.06)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1.5px solid rgba(196,181,253,0.4)' }}
            >
              <FileText className="w-8 h-8" style={{ color: '#C4B5FD' }} />
            </div>
            <p className="font-display font-bold text-base" style={{ color: '#1e1b4b' }}>No reports yet</p>
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>All user-submitted reports will appear here</p>
          </div>
        ) : (
          <div className="reports-grid">
            {reports.map((report, i) => {
              const status     = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.delivered
              const StatusIcon = status.icon

              return (
                <Link key={report.id} href={`/admin/reports/${report.id}`} className="block h-full">
                  <div
                    className="report-card reports-card-animate"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    <div className="report-card-inner">

                      {/* ── Card body: Reporter | divider | Reported ── */}
                      <div className="report-card-body">

                        {/* Reporter */}
                        <div className="report-side">
                          <p className="report-section-label">Reporter</p>
                          <div className="flex items-center gap-3">
                            {report.reporter?.avatar_url ? (
                              <img
                                src={report.reporter.avatar_url}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                                style={{ border: '1.5px solid rgba(196,181,253,0.4)' }}
                              />
                            ) : (
                              <div
                                className="report-avatar-reporter w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              >
                                {report.reporter?.full_name?.charAt(0)?.toUpperCase() ?? <User className="w-5 h-5" />}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p
                                className="font-semibold text-sm truncate"
                                style={{ color: '#1e1b4b' }}
                              >
                                {report.reporter?.full_name ?? 'Unknown User'}
                              </p>
                              <p className="text-xs truncate" style={{ color: '#9ca3af' }}>
                                @{report.reporter?.username ?? 'unknown'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="report-divider" />

                        {/* Reported */}
                        <div className="report-side">
                          <p className="report-section-label">Reported</p>
                          <div className="flex items-center gap-3">
                            {report.shops?.logo_url ? (
                              <img
                                src={report.shops.logo_url}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                                style={{ border: '1.5px solid rgba(196,181,253,0.4)' }}
                              />
                            ) : (
                              <div
                                className="report-avatar-reported w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              >
                                {report.shops?.name?.charAt(0)?.toUpperCase() ?? <Store className="w-5 h-5" />}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p
                                className="font-semibold text-sm truncate"
                                style={{ color: '#1e1b4b' }}
                              >
                                {report.shops?.name ?? 'Unknown Shop'}
                              </p>
                              {report.products && (
                                <p className="text-xs flex items-center gap-1 truncate" style={{ color: '#9ca3af' }}>
                                  <Package className="w-3 h-3 shrink-0" />
                                  {report.products.name}
                                </p>
                              )}
                              {report.seller && (
                                <p className="text-xs truncate" style={{ color: '#9ca3af' }}>
                                  Seller: {report.seller.full_name ?? 'Unknown'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="report-arrow self-center">
                          <ChevronRight className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />
                        </div>
                      </div>

                      {/* ── Card footer: badges + date ── */}
                      <div className="report-card-footer">
                        <div className="report-badges">
                          <span className="reason-badge">
                            {REASON_LABELS[report.reason] ?? report.reason}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
                            style={{
                              background: status.bg,
                              color:      status.color,
                              border:     `1px solid ${status.border}`,
                            }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>

                        <span className="report-date">
                          {new Date(report.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                          {' at '}
                          {new Date(report.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>

                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
