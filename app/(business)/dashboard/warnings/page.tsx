'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  AlertTriangle, Package, Store, ChevronLeft,
  ChevronRight, Loader2, ShieldAlert, AlertCircle, Clock, Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 7

const REASON_LABELS: Record<string, string> = {
  fake_product:      'Fake Product',
  fraud_seller:      'Fraud Seller',
  offensive_content: 'Offensive Content',
  abuse:             'Abuse',
  wrong_information: 'Wrong Information',
  other:             'Other',
}

const REASON_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  fake_product:      { bg: 'bg-red-500/10',      text: 'text-red-600',      border: 'border-red-500/20' },
  fraud_seller:      { bg: 'bg-orange-500/10',   text: 'text-orange-600',   border: 'border-orange-500/20' },
  offensive_content: { bg: 'bg-pink-500/10',     text: 'text-pink-600',     border: 'border-pink-500/20' },
  abuse:             { bg: 'bg-amber-500/10',    text: 'text-amber-600',    border: 'border-amber-500/20' },
  wrong_information: { bg: 'bg-yellow-500/10',   text: 'text-yellow-600',   border: 'border-yellow-500/20' },
  other:             { bg: 'bg-slate-500/10',    text: 'text-slate-600',    border: 'border-slate-500/20' },
}

interface Warning {
  id:         string
  reason:     string
  message:    string
  is_read:    boolean
  created_at: string
  shops:    { id: string; name: string; logo_url: string | null } | null
  products: { id: string; name: string; images: string[] } | null
}

function SkeletonCard() {
  return (
    <div className="w-full bg-white border border-[#C4B5FD]/20 rounded-xl lg:rounded-2xl p-4 lg:p-6 animate-pulse shadow-lg shadow-[#7C3AED]/5">
      <div className="flex items-start gap-3 lg:gap-4">
        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg lg:rounded-xl bg-[#EDE9FE] shrink-0" />
        <div className="flex-1 space-y-2 lg:space-y-3">
          <div className="h-3 bg-[#EDE9FE] rounded w-1/3" />
          <div className="h-2.5 bg-[#EDE9FE] rounded w-1/4" />
          <div className="h-2.5 bg-[#EDE9FE] rounded w-full" />
          <div className="h-2.5 bg-[#EDE9FE] rounded w-4/5" />
        </div>
      </div>
    </div>
  )
}

export default function WarningsPage() {
  const [warnings,    setWarnings]    = useState<Warning[]>([])
  const [loading,     setLoading]     = useState(true)
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [total,       setTotal]       = useState(0)

  const fetchWarnings = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/business/warnings?page=${p}&limit=${ITEMS_PER_PAGE}`, { credentials: 'include' })
      const data = await res.json()
      setWarnings(data.warnings ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(Math.ceil((data.total ?? 0) / ITEMS_PER_PAGE))

      // Mark all as read silently
      if ((data.unread ?? 0) > 0) {
        fetch('/api/business/warnings/read', { method: 'PUT', credentials: 'include' }).catch(() => {})
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchWarnings(page) }, [page, fetchWarnings])

  const handlePage = (next: number) => {
    if (next < 1 || next > totalPages) return
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

        .glass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(196, 181, 253, 0.2);
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.08), 0 8px 16px rgba(124, 58, 237, 0.06);
        }

        .warning-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(196, 181, 253, 0.25);
          box-shadow: 0 25px 50px rgba(124, 58, 237, 0.12), 0 12px 24px rgba(124, 58, 237, 0.08), 0 4px 8px rgba(124, 58, 237, 0.04);
          transition: all 0.3s ease;
        }

        .warning-card:hover {
          box-shadow: 0 32px 64px rgba(124, 58, 237, 0.15), 0 16px 32px rgba(124, 58, 237, 0.1), 0 8px 16px rgba(124, 58, 237, 0.06);
          transform: translateY(-4px);
        }
      `}</style>

      <div className="min-h-screen" style={{ background: '#FAF5FF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

          {/* Header Section */}
          {/* <div className="mb-8 lg:mb-12 animate-slideUp">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-white border border-[#C4B5FD]/30 shadow-lg shadow-[#7C3AED]/10">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-600 text-xs font-black uppercase tracking-widest" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    Shop Alerts
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e1b4b] mb-3" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Warnings
                </h1>
                
                <p className="text-[#6b7280] text-base sm:text-lg lg:text-xl max-w-2xl" 
                   style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  Warnings issued by admin regarding your shop activity
                </p>
              </div>

              {total > 0 && (
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-amber-600 font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {total}
                    </p>
                    <p className="text-amber-600/70 text-xs uppercase tracking-widest font-semibold" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      Warning{total !== 1 ? 's' : ''} Total
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div> */}

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 lg:py-32 gap-8">
              <div className="relative">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-[#EDE9FE] border-t-[#7C3AED] animate-spin" />
                <div className="absolute inset-2 w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-[#7C3AED]/20 to-[#C4B5FD]/20 animate-pulse" />
              </div>
              {/* <div className="text-center">
                <p className="text-[#1e1b4b] text-lg lg:text-xl font-semibold mb-2" 
                   style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Loading Warnings
                </p>
                <p className="text-[#6b7280] text-sm lg:text-base" 
                   style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  Fetching your shop alerts...
                </p>
              </div> */}
            </div>
          ) : warnings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 lg:py-32 text-center animate-slideUp">
              <div className="relative">
                <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-[#EDE9FE] to-[#C4B5FD]/30 border border-[#C4B5FD]/40 shadow-lg animate-float">
                  <ShieldAlert className="w-16 h-16 lg:w-10 lg:h-10 text-[#7C3AED]/60" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#7C3AED] animate-pulse" />
              </div>
              <h3 className="text-[#1e1b4b] text-2xl lg:text-md font-bold mt-6 mb-3" 
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                No Warnings Yet
              </h3>
              <p className="text-[#6b7280] text-base lg:text-sm max-w-md leading-relaxed" 
                 style={{ fontFamily: 'Open Sans, sans-serif' }}>
                You're in good standing. Keep following platform policies to maintain your excellent reputation.
              </p>
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              {warnings.map((w, i) => (
                <div key={w.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-slideUp">
                  <WarningCard warning={w} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 lg:mt-16 pt-8 lg:pt-12 border-t border-[#C4B5FD]/20 animate-slideUp" style={{ animationDelay: '400ms' }}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6">
                
                {/* Previous Button */}
                <button
                  onClick={() => handlePage(page - 1)}
                  disabled={page === 1}
                  className={cn(
                    'flex items-center gap-2 px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold transition-all duration-300',
                    'text-sm lg:text-base',
                    page === 1
                      ? 'bg-[#EDE9FE] text-[#C4B5FD] cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white hover:shadow-lg hover:shadow-[#7C3AED]/30 hover:scale-105 active:scale-95'
                  )}
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-2 lg:gap-3 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => handlePage(p)}
                      className={cn(
                        'w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold transition-all duration-300',
                        p === page
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white shadow-lg shadow-[#7C3AED]/30 scale-110'
                          : 'bg-white border border-[#C4B5FD]/30 text-[#7C3AED] hover:bg-[#EDE9FE] hover:border-[#7C3AED]/50 hover:scale-105 active:scale-95'
                      )}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePage(page + 1)}
                  disabled={page === totalPages}
                  className={cn(
                    'flex items-center gap-2 px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold transition-all duration-300',
                    'text-sm lg:text-base',
                    page === totalPages
                      ? 'bg-[#EDE9FE] text-[#C4B5FD] cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white hover:shadow-lg hover:shadow-[#7C3AED]/30 hover:scale-105 active:scale-95'
                  )}
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Page Info */}
              <div className="text-center mt-6 lg:mt-8">
                <p className="text-[#6b7280] text-sm lg:text-base" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  Page <span className="font-bold text-[#7C3AED]">{page}</span> of <span className="font-bold text-[#7C3AED]">{totalPages}</span> • Showing <span className="font-bold text-[#7C3AED]">{warnings.length}</span> of <span className="font-bold text-[#7C3AED]">{total}</span> warnings
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

function WarningCard({ warning }: { warning: Warning }) {
  const product  = warning.products
  const shop     = warning.shops
  const imgSrc   = product?.images?.[0] ?? null
  const initials = product?.name?.charAt(0)?.toUpperCase() ?? 'P'
  const reasonColor = REASON_COLORS[warning.reason] || REASON_COLORS.other
  const formattedDate = new Date(warning.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
  const formattedTime = new Date(warning.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="warning-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 group">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">

        {/* Product Image / Avatar */}
        <div className="shrink-0">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product?.name ?? ''}
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg lg:rounded-2xl object-cover border border-[#C4B5FD]/30 shadow-lg shadow-[#7C3AED]/10 group-hover:shadow-xl group-hover:shadow-[#7C3AED]/15 transition-all duration-300"
            />
          ) : (
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg lg:rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold text-xl lg:text-2xl shadow-lg shadow-amber-500/10">
              {initials}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3 lg:space-y-4">

          {/* Top row: Warning badge + date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30 shadow-lg shadow-amber-500/5">
                <AlertTriangle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                Warning
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#6b7280] text-xs lg:text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#7C3AED]" />
              <span>{formattedDate}</span>
              <span className="text-[#C4B5FD]">·</span>
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Product & Shop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 flex-wrap">
            {product && (
              <div className="flex items-center gap-1.5 text-[#1e1b4b] text-xs lg:text-sm font-medium" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <Package className="w-4 h-4 lg:w-5 lg:h-5 text-[#7C3AED]" />
                <span className="truncate">{product.name}</span>
              </div>
            )}
            {shop && (
              <div className="flex items-center gap-1.5 text-[#6b7280] text-xs lg:text-sm font-medium" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <Store className="w-4 h-4 lg:w-5 lg:h-5 text-[#7C3AED]" />
                <span className="truncate">{shop.name}</span>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3">
            <span className="text-xs lg:text-sm text-[#6b7280] uppercase tracking-widest font-bold" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              <Tag className="w-3.5 h-3.5 lg:w-4 lg:h-4 inline mr-1.5 text-[#7C3AED]" />
              Reason:
            </span>
            <span
              className={cn(
                'text-xs lg:text-sm px-3 py-1.5 rounded-lg lg:rounded-xl font-bold border transition-all duration-300',
                reasonColor.bg,
                reasonColor.text,
                reasonColor.border
              )}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {REASON_LABELS[warning.reason] ?? warning.reason}
            </span>
          </div>

          {/* Customer Message */}
          <div className="bg-gradient-to-r from-[#7C3AED]/5 to-[#C4B5FD]/5 border border-[#C4B5FD]/20 rounded-lg lg:rounded-2xl p-3 lg:p-4 shadow-lg shadow-[#7C3AED]/5">
            <p className="text-xs lg:text-sm text-[#6b7280] uppercase tracking-widest font-bold mb-1.5 lg:mb-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Admin Message
            </p>
            <p className="text-[#1e1b4b] text-xs lg:text-sm leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {warning.message}
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
