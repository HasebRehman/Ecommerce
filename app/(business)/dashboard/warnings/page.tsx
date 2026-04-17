'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  AlertTriangle, Package, Store, ChevronLeft,
  ChevronRight, Loader2, ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const REASON_LABELS: Record<string, string> = {
  fake_product:      'Fake Product',
  fraud_seller:      'Fraud Seller',
  offensive_content: 'Offensive Content',
  abuse:             'Abuse',
  wrong_information: 'Wrong Information',
  other:             'Other',
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
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-800 rounded w-1/4" />
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-4/5" />
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
      const res  = await fetch(`/api/business/warnings?page=${p}`, { credentials: 'include' })
      const data = await res.json()
      setWarnings(data.warnings ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)

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
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-yellow-400" />
            Warnings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Warnings issued by admin regarding your shop activity
          </p>
        </div>
        {total > 0 && (
          <span className="text-slate-400 text-sm">
            {total} warning{total !== 1 ? 's' : ''} total
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : warnings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-white font-semibold text-lg">No warnings yet</p>
          <p className="text-slate-400 text-sm mt-1">
            You're in good standing. Keep following platform policies.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {warnings.map(w => (
            <WarningCard key={w.id} warning={w} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => handlePage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => handlePage(p)}
                className={cn(
                  'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                  p === page
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePage(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function WarningCard({ warning }: { warning: Warning }) {
  const product  = warning.products
  const shop     = warning.shops
  const imgSrc   = product?.images?.[0] ?? null
  const initials = product?.name?.charAt(0)?.toUpperCase() ?? 'P'

  return (
    <div
      className={cn(
        'w-full bg-slate-900 border rounded-2xl p-5 transition-all',
        warning.is_read
          ? 'border-slate-800'
          : 'border-yellow-500/30 bg-yellow-500/[0.03]'
      )}
    >
      <div className="flex items-start gap-4">

        {/* Product Image / Avatar */}
        <div className="shrink-0">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product?.name ?? ''}
              className="w-14 h-14 rounded-xl object-cover border border-slate-700"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-xl">
              {initials}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2.5">

          {/* Top row: Warning badge + date */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
              <AlertTriangle className="w-3 h-3" />
              Warning
            </span>
            <span className="text-slate-500 text-xs">
              {new Date(warning.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
              {' · '}
              {new Date(warning.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>

          {/* Product & Shop */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {product && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Package className="w-3.5 h-3.5 text-slate-500" />
                {product.name}
              </span>
            )}
            {shop && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                {shop.name}
              </span>
            )}
          </div>

          {/* Reason */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Reason:</span>
            <span
              className="text-xs px-2.5 py-1 rounded-lg font-medium"
              style={{ background: 'rgba(64,138,113,0.12)', color: '#408A71', border: '1px solid rgba(64,138,113,0.2)' }}
            >
              {REASON_LABELS[warning.reason] ?? warning.reason}
            </span>
          </div>

          {/* Customer Message */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1.5">Customer Message</p>
            <p className="text-slate-300 text-sm leading-relaxed">{warning.message}</p>
          </div>

        </div>
      </div>
    </div>
  )
}
