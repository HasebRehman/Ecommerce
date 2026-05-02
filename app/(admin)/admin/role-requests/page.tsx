'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle, XCircle, Loader2, Search,
  UserCheck, Clock, Ban,
} from 'lucide-react'
import { toast } from 'sonner'
import { adminService } from '@/lib/services/admin.service'

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

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'pending',  label: 'Pending'  },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

// Avatar color generator
const AVATAR_COLORS = [
  '#7C3AED','#6D28D9','#2563eb','#0891b2','#16a34a','#ca8a04','#dc2626','#db2777',
]
const avatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

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
    <div style={{ fontFamily: "'Open Sans', sans-serif", width: '100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .rr-header { font-family: 'Montserrat', sans-serif; }
        .rr-body   { font-family: 'Open Sans',   sans-serif; }
        a, button  { cursor: pointer !important; }

        .rr-card {
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 20px;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          box-shadow: 0 4px 18px rgba(124,58,237,0.09), 0 1px 4px rgba(0,0,0,0.04);
          overflow: hidden;
          width: 100%;
          transition: all 0.2s ease;
        }
        .rr-card:hover {
          border-color: rgba(124,58,237,0.4);
          box-shadow: 0 6px 24px rgba(124,58,237,0.12), 0 2px 6px rgba(0,0,0,0.06);
        }

        .rr-search-wrap {
          position: relative;
          width: 100%;
          max-width: 420px;
        }
        .rr-search {
          width: 100%;
          height: 46px;
          padding: 0 16px 0 42px;
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 14px;
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #1e1b4b;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 2px 8px rgba(124,58,237,0.06);
        }
        .rr-search::placeholder { color: #9ca3af; }
        .rr-search:focus {
          border-color: #7C3AED;
          box-shadow: 0 0 0 4px rgba(124,58,237,0.10);
        }

        /* Tabs */
        .rr-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 14px;
          padding: 6px;
          box-shadow: 0 2px 8px rgba(124,58,237,0.06);
        }
        .rr-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          color: #6b7280;
          white-space: nowrap;
        }
        .rr-tab:hover {
          color: #7C3AED;
          background: rgba(124,58,237,0.08);
        }
        .rr-tab.active {
          background: white;
          color: #7C3AED;
          box-shadow: 0 2px 8px rgba(124,58,237,0.12);
        }
        .rr-tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
        }
        .rr-tab.active .rr-tab-count {
          background: rgba(124,58,237,0.15);
          color: #7C3AED;
        }
        .rr-tab:not(.active) .rr-tab-count {
          background: rgba(107,114,128,0.15);
          color: #6b7280;
        }

        /* Status badges */
        .rr-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 999px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 11px;
          border: 1px solid;
          white-space: nowrap;
          text-transform: capitalize;
        }
        .rr-badge.pending {
          background: rgba(234,179,8,0.12);
          color: #ca8a04;
          border-color: rgba(234,179,8,0.3);
        }
        .rr-badge.approved {
          background: rgba(34,197,94,0.12);
          color: #16a34a;
          border-color: rgba(34,197,94,0.3);
        }
        .rr-badge.rejected {
          background: rgba(239,68,68,0.12);
          color: #ef4444;
          border-color: rgba(239,68,68,0.3);
        }
        .rr-badge.attempt-1 {
          background: rgba(59,130,246,0.12);
          color: #2563eb;
          border-color: rgba(59,130,246,0.3);
        }
        .rr-badge.attempt-2 {
          background: rgba(249,115,22,0.12);
          color: #f97316;
          border-color: rgba(249,115,22,0.3);
        }
        .rr-badge.attempt-3 {
          background: rgba(239,68,68,0.12);
          color: #ef4444;
          border-color: rgba(239,68,68,0.3);
        }

        /* Action buttons */
        .rr-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 12px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 13px;
          border: 1.5px solid;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .rr-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed !important;
        }
        .rr-btn-approve {
          background: rgba(34,197,94,0.12);
          color: #16a34a;
          border-color: rgba(34,197,94,0.3);
        }
        .rr-btn-approve:not(:disabled):hover {
          background: #16a34a;
          color: white;
          border-color: #16a34a;
          box-shadow: 0 4px 12px rgba(34,197,94,0.25);
        }
        .rr-btn-reject {
          background: rgba(239,68,68,0.12);
          color: #ef4444;
          border-color: rgba(239,68,68,0.3);
        }
        .rr-btn-reject:not(:disabled):hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          box-shadow: 0 4px 12px rgba(239,68,68,0.25);
        }

        /* Warning banner */
        .rr-warning {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(239,68,68,0.08);
          border: 1.5px solid rgba(239,68,68,0.25);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .rr-tabs {
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .rr-tabs::-webkit-scrollbar {
            display: none;
          }
          .rr-card-actions {
            width: 100%;
            flex-direction: column;
          }
          .rr-btn {
            width: 100%;
            justify-content: center;
          }
        }
        @media (max-width: 640px) {
          .rr-tab {
            padding: 6px 12px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="rr-header text-2xl sm:text-3xl font-bold text-[#1e1b4b]">Role Requests</h1>
          <p className="rr-body text-[#6b7280] text-sm mt-1">
            Review seller access requests from customers
          </p>
        </div>

        {/* ── Search + Tabs ── */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="rr-search-wrap">
            <Search style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)',
              width: '16px', height: '16px', color: '#A78BFA', pointerEvents: 'none',
            }} />
            <input
              className="rr-search"
              placeholder="Search by name or username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="rr-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rr-tab ${activeTab === tab.key ? 'active' : ''}`}
              >
                {tab.label}
                <span className="rr-tab-count">{counts[tab.key]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
            <Loader2 style={{ width: '40px', height: '40px', color: '#7C3AED' }} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rr-card">
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <UserCheck style={{ width: '48px', height: '48px', color: '#C4B5FD', margin: '0 auto 16px' }} />
              <p className="rr-header text-[#1e1b4b] font-bold text-lg">No requests found</p>
              <p className="rr-body text-[#6b7280] text-sm mt-2">
                {search ? 'Try a different search term' : 'No role requests yet'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
  const attemptClass    = req.request_count === 1 ? 'attempt-1' : req.request_count === 2 ? 'attempt-2' : 'attempt-3'
  const initials        = req.profiles?.full_name?.charAt(0)?.toUpperCase() ?? 'U'
  const bgColor         = avatarColor(req.profiles?.full_name ?? 'U')

  return (
    <div className="rr-card">
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{
            width: '56px', height: '56px',
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            border: '2px solid rgba(196,181,253,0.5)',
          }}>
            {req.profiles?.avatar_url ? (
              <img
                src={req.profiles.avatar_url}
                alt={req.profiles.full_name ?? 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: bgColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '20px',
              }}>
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <p className="rr-header text-[#1e1b4b] font-bold text-base">
                {req.profiles?.full_name ?? 'Unknown User'}
              </p>
              <span style={{ color: '#C4B5FD', fontSize: '12px' }}>·</span>
              <p className="rr-body text-[#6b7280] text-sm">
                @{req.profiles?.username ?? 'no-username'}
              </p>
            </div>

            <p className="rr-body text-[#6b7280] text-sm" style={{ marginBottom: '12px' }}>
              <span style={{ color: '#2563eb', fontWeight: 600 }}>Customer</span>
              <span style={{ margin: '0 8px', color: '#C4B5FD' }}>→</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>Seller</span>
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`rr-badge ${req.status}`}>
                {req.status === 'pending'  && <Clock        style={{ width: '12px', height: '12px' }} />}
                {req.status === 'approved' && <CheckCircle  style={{ width: '12px', height: '12px' }} />}
                {req.status === 'rejected' && <XCircle      style={{ width: '12px', height: '12px' }} />}
                {req.status}
              </span>

              <span className={`rr-badge ${attemptClass}`}>
                {attemptLabel} request
              </span>

              <span className="rr-body text-[#9ca3af] text-xs">
                {new Date(req.created_at).toLocaleDateString('en-US', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            </div>

            {isBlocked && (
              <div className="rr-warning" style={{ marginTop: '12px' }}>
                <Ban style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0 }} />
                <p className="rr-body text-[#ef4444] text-xs font-semibold">
                  This user can no longer send seller requests.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {isPending && (
            <div className="rr-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <button
                disabled={anyProcessing}
                onClick={() => onReview(req.id, 'approve')}
                className="rr-btn rr-btn-approve"
              >
                {approvingThis
                  ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" />
                  : <CheckCircle style={{ width: '14px', height: '14px' }} />
                }
                Approve
              </button>

              <button
                disabled={anyProcessing}
                onClick={() => onReview(req.id, 'reject')}
                className="rr-btn rr-btn-reject"
              >
                {rejectingThis
                  ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" />
                  : <XCircle style={{ width: '14px', height: '14px' }} />
                }
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
