'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle, XCircle, Loader2, Search,
  UserCheck, Clock, Ban,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { adminService } from '@/lib/services/admin.service'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

type RequestStatus = 'pending' | 'approved' | 'rejected'
type FilterTab     = 'all' | RequestStatus

interface RoleRequest {
  id:            string
  user_id:       string
  status:        RequestStatus
  request_count: number
  created_at:    string
  reviewed_at:   string | null
  profiles: {
    full_name:  string | null
    username:   string | null
    avatar_url: string | null
  } | null
  email: string
}

// ── Constants ────────────────────────────────────────────────────────────────

const ATTEMPT_LABEL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }

const STATUS_BADGE: Record<RequestStatus, string> = {
  pending:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20  text-green-400  border-green-500/30',
  rejected: 'bg-red-500/20    text-red-400    border-red-500/30',
}

const ATTEMPT_BADGE: Record<number, string> = {
  1: 'bg-blue-500/20   text-blue-400   border-blue-500/30',
  2: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  3: 'bg-red-500/20    text-red-400    border-red-500/30',
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'pending',  label: 'Pending'  },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

// ── Component ────────────────────────────────────────────────────────────────

// Track which specific button is loading: `${id}-approve` or `${id}-reject`
type ProcessingKey = `${string}-approve` | `${string}-reject` | null

export default function RoleRequestsPage() {
  const [requests,   setRequests]   = useState<RoleRequest[]>([])
  const [isLoading,  setLoading]    = useState(true)
  const [processing, setProcessing] = useState<ProcessingKey>(null)
  const [search,     setSearch]     = useState('')
  const [activeTab,  setActiveTab]  = useState<FilterTab>('all')

  const loadRequests = async () => {
    try {
      const data = await adminService.getRoleRequests()
      setRequests(data.requests ?? [])
    } catch {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    const key: ProcessingKey = `${id}-${action}`
    setProcessing(key)
    try {
      await adminService.reviewRoleRequest(id, action)
      toast.success(action === 'approve' ? 'Request approved!' : 'Request rejected.')
      loadRequests()
    } catch (err: any) {
      toast.error(err.message || 'Failed to process request')
    } finally {
      setProcessing(null)
    }
  }

  // ── Filter logic ──────────────────────────────────────────────────────────

  const filtered = requests.filter(r => {
    const matchesTab    = activeTab === 'all' || r.status === activeTab
    const searchLower   = search.toLowerCase()
    const matchesSearch = !search
      || r.profiles?.full_name?.toLowerCase().includes(searchLower)
      || r.profiles?.username?.toLowerCase().includes(searchLower)
      || r.email?.toLowerCase().includes(searchLower)
    return matchesTab && matchesSearch
  })

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Role Requests</h1>
        <p className="text-slate-400 mt-1">
          Review seller access requests from customers
        </p>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or username…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 pl-10"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                activeTab === tab.key
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {tab.label}
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-bold',
                activeTab === tab.key ? 'bg-slate-600 text-slate-200' : 'bg-slate-800 text-slate-500'
              )}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16 text-center">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-medium">No requests found</p>
            <p className="text-slate-500 text-sm mt-1">
              {search ? 'Try a different search term' : 'No role requests yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <RequestCard
              key={req.id}
              req={req}
              processing={processing}
              onReview={handleReview}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── RequestCard ───────────────────────────────────────────────────────────────

function RequestCard({
  req,
  processing,
  onReview,
}: {
  req:        RoleRequest
  processing: string | null
  onReview:   (id: string, action: 'approve' | 'reject') => void
}) {
  const isBlocked       = req.status === 'rejected' && req.request_count >= 3
  const isPending       = req.status === 'pending'
  const approvingThis   = processing === `${req.id}-approve`
  const rejectingThis   = processing === `${req.id}-reject`
  const anyProcessing   = approvingThis || rejectingThis
  const attemptLabel    = ATTEMPT_LABEL[req.request_count] ?? `${req.request_count}th`
  const attemptBadge    = ATTEMPT_BADGE[req.request_count] ?? ATTEMPT_BADGE[3]

  return (
    <Card className={cn(
      'border transition-all',
      isBlocked
        ? 'bg-slate-900/60 border-slate-800/60 opacity-75'
        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">

          {/* Avatar */}
          <div className="w-11 h-11 rounded-full shrink-0 overflow-hidden">
            {req.profiles?.avatar_url ? (
              <img
                src={req.profiles.avatar_url}
                alt={req.profiles.full_name ?? 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base">
                {req.profiles?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-semibold text-sm">
                {req.profiles?.full_name ?? 'Unknown User'}
              </p>
              <span className="text-slate-600 text-xs">·</span>
              <p className="text-slate-400 text-xs">
                @{req.profiles?.username ?? 'no-username'}
              </p>
            </div>

            <p className="text-slate-400 text-xs mt-1">
              <span className="text-blue-400 font-medium">Customer</span>
              <span className="mx-1.5 text-slate-600">→</span>
              <span className="text-green-400 font-medium">Seller</span>
            </p>

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <Badge className={cn('text-xs border capitalize', STATUS_BADGE[req.status])}>
                {req.status === 'pending'  && <Clock        className="w-3 h-3 mr-1" />}
                {req.status === 'approved' && <CheckCircle  className="w-3 h-3 mr-1" />}
                {req.status === 'rejected' && <XCircle      className="w-3 h-3 mr-1" />}
                {req.status}
              </Badge>

              <Badge className={cn('text-xs border', attemptBadge)}>
                {attemptLabel} request
              </Badge>

              <span className="text-slate-500 text-xs">
                {new Date(req.created_at).toLocaleDateString('en-US', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            </div>

            {isBlocked && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Ban className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-red-400 text-xs font-medium">
                  This user can no longer send seller requests.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {isPending && !isBlocked && (
            <div className="flex items-center gap-2 shrink-0 self-start mt-0.5">
              {/* Approve */}
              <button
                disabled={anyProcessing}
                onClick={() => onReview(req.id, 'approve')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  'bg-green-500/15 text-green-400 border border-green-500/30',
                  !anyProcessing && 'hover:bg-green-500 hover:text-white hover:border-green-500',
                  anyProcessing && 'opacity-50 cursor-not-allowed'
                )}
              >
                {approvingThis
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCircle className="w-3.5 h-3.5" />
                }
                Approve
              </button>

              {/* Reject */}
              <button
                disabled={anyProcessing}
                onClick={() => onReview(req.id, 'reject')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  'bg-red-500/15 text-red-400 border border-red-500/30',
                  !anyProcessing && 'hover:bg-red-500 hover:text-white hover:border-red-500',
                  anyProcessing && 'opacity-50 cursor-not-allowed'
                )}
              >
                {rejectingThis
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <XCircle className="w-3.5 h-3.5" />
                }
                Reject
              </button>
            </div>
          )}

          {/* Disabled state after final rejection */}
          {isBlocked && (
            <div className="flex items-center gap-2 shrink-0 self-start mt-0.5">
              <button disabled className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-40">
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button disabled className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-40">
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
