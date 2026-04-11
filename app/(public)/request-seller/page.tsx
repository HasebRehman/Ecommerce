'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, Clock, CheckCircle, XCircle,
  Loader2, Store, LayoutDashboard,
  ArrowRight, Ban, Package, BarChart3, Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { API } from '@/constants/api'

const ATTEMPT_LABEL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }

const STATUS_CONFIG = {
  pending: {
    icon:   Clock,
    color:  '#facc15',
    bg:     'rgba(250,204,21,0.10)',
    border: 'rgba(250,204,21,0.28)',
    label:  'Pending Review',
    desc:   'Your request is being reviewed by our admin team',
  },
  approved: {
    icon:   CheckCircle,
    color:  '#4ade80',
    bg:     'rgba(74,222,128,0.10)',
    border: 'rgba(74,222,128,0.28)',
    label:  'Approved!',
    desc:   'You are now a Retailer. Login again to access your dashboard.',
  },
  rejected: {
    icon:   XCircle,
    color:  '#f87171',
    bg:     'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.28)',
    label:  'Request Rejected',
    desc:   'Your request was not approved. You can submit a new request.',
  },
}

const BENEFITS = [
  { icon: Store,     title: 'Create Multiple Shops', desc: 'Set up shops for different categories and grow your brand' },
  { icon: Package,   title: 'Manage Inventory',      desc: 'Add, edit and manage your products with ease' },
  { icon: BarChart3, title: 'Track Orders',          desc: 'Monitor your sales and orders in real-time' },
  { icon: Zap,       title: 'Go Live Anytime',       desc: 'Control when your shop is visible to buyers' },
]

export default function RequestSellerPage() {
  const router                          = useRouter()
  const { isAuthenticated, role, user } = useAuthStore()
  const [request,    setRequest]        = useState<any>(null)
  const [userRole,   setUserRole]       = useState<string>('')
  const [loading,    setLoading]        = useState(true)
  const [submitting, setSubmitting]     = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    api.get(API.STORE.ROLE_REQUEST)
      .then(res => {
        setRequest(res.data.request)
        setUserRole(res.data.role)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    const supabase = createClient()
    const sub = supabase
      .channel('role-request-changes')
      .on('postgres_changes', {
        event: '*', schema: 'public',
        table: 'role_upgrade_requests',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setRequest(payload.new)
        if ((payload.new as any).status === 'approved') {
          toast.success('Your request was approved! You are now a Retailer!')
        } else if ((payload.new as any).status === 'rejected') {
          toast.error('Your request was rejected by admin')
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [isAuthenticated, user])

  const handleSubmit = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    setSubmitting(true)
    try {
      const res = await api.post(API.STORE.ROLE_REQUEST)
      setRequest(res.data.request)
      toast.success('Request submitted!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const isBlocked   = request?.status === 'rejected' && (request?.request_count ?? 0) >= 3
  const canResubmit = request?.status === 'rejected' && !isBlocked
  const statusConfig  = request ? STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] : null
  const attemptLabel  = request?.request_count ? (ATTEMPT_LABEL[request.request_count] ?? `${request.request_count}th`) : null
  const attemptsLeft  = 3 - (request?.request_count ?? 0)

  const isRetailer = userRole === 'business_owner' || role === 'business_owner'

  return (
    <>
      <style>{styles}</style>

      <div className="rs-root">

        {/* Already a retailer */}
        {isRetailer && (
          <div className="rs-center-state">
            <div className="rs-hero-icon">
              <Store className="w-10 h-10" style={{ color: '#B0E4CC' }} />
            </div>
            <div className="rs-badge-approved">
              <CheckCircle className="w-3.5 h-3.5" />
              Active Retailer
            </div>
            <h1 className="rs-title">You are already a Retailer!</h1>
            <p className="rs-subtitle">Access your dashboard to manage your shops and orders</p>
            <button onClick={() => router.push('/dashboard')} className="rs-btn-primary rs-btn-auto">
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading */}
        {!isRetailer && loading && (
          <div className="rs-loader">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#408A71' }} />
            <span style={{ color: 'rgba(176,228,204,0.40)', fontSize: '0.85rem', fontWeight: 500 }}>
              Loading...
            </span>
          </div>
        )}

        {/* Main content */}
        {!isRetailer && !loading && (
          <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

            {/* Hero */}
            <div className="rs-fade-up text-center mb-10">
              <div className="rs-hero-icon mx-auto mb-5">
                <TrendingUp className="w-10 h-10" style={{ color: '#B0E4CC' }} />
              </div>
              <h1 className="rs-title mb-2">Become a Retailer</h1>
              <p className="rs-subtitle">
                Join hundreds of local sellers on VendoSphere and start earning today
              </p>
            </div>

            {/* Benefits */}
            <div className="rs-fade-up space-y-2.5 mb-8" style={{ animationDelay: '70ms' }}>
              {BENEFITS.map((b, i) => (
                <div key={b.title} className="rs-benefit-card" style={{ animationDelay: `${80 + i * 55}ms` }}>
                  <div className="rs-benefit-icon shrink-0">
                    <b.icon className="w-5 h-5" style={{ color: '#B0E4CC' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{b.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(176,228,204,0.45)' }}>{b.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'rgba(64,138,113,0.45)' }} />
                </div>
              ))}
            </div>

            {/* CTA / Status */}
            <div className="rs-fade-up" style={{ animationDelay: '320ms' }}>

              {/* Not logged in */}
              {!isAuthenticated && (
                <button onClick={() => router.push('/login')} className="rs-btn-primary">
                  Login to Request Access
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Permanently blocked */}
              {isAuthenticated && isBlocked && (
                <div className="rs-status-card" style={{
                  background:  'rgba(248,113,113,0.08)',
                  borderColor: 'rgba(248,113,113,0.25)',
                }}>
                  <div className="flex items-start gap-4">
                    <div className="rs-status-icon shrink-0" style={{
                      background: 'rgba(248,113,113,0.12)',
                      border:     '1px solid rgba(248,113,113,0.30)',
                    }}>
                      <Ban className="w-5 h-5" style={{ color: '#f87171' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base" style={{ color: '#f87171' }}>
                        Request Limit Reached
                      </p>
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: 'rgba(176,228,204,0.55)' }}>
                        You have not been approved by the admin team to become a seller.
                        You can no longer send requests.
                      </p>
                    </div>
                  </div>
                  <div className="rs-divider" />
                  <p className="text-xs text-center" style={{ color: 'rgba(248,113,113,0.55)' }}>
                    3 requests submitted · All rejected · No further requests allowed
                  </p>
                </div>
              )}

              {/* Has existing request */}
              {isAuthenticated && request && statusConfig && !isBlocked && (
                <div className="rs-status-card" style={{ background: statusConfig.bg, borderColor: statusConfig.border }}>
                  <div className="flex items-start gap-4">
                    <div className="rs-status-icon shrink-0" style={{
                      background: `${statusConfig.color}18`,
                      border:     `1px solid ${statusConfig.color}35`,
                    }}>
                      {(() => { const Icon = statusConfig.icon; return <Icon className="w-5 h-5" style={{ color: statusConfig.color }} /> })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base" style={{ color: statusConfig.color }}>
                        {statusConfig.label}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: 'rgba(176,228,204,0.55)' }}>
                        {statusConfig.desc}
                      </p>
                    </div>
                  </div>

                  <div className="rs-divider" />

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-xs" style={{ color: 'rgba(176,228,204,0.35)' }}>
                        Submitted:{' '}
                        <span style={{ color: 'rgba(176,228,204,0.60)' }}>
                          {new Date(request.created_at).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </p>
                      {attemptLabel && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{
                          background: 'rgba(64,138,113,0.15)',
                          border:     '1px solid rgba(64,138,113,0.30)',
                          color:      '#4ade80',
                        }}>
                          {attemptLabel} request
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
                      background: 'rgba(64,138,113,0.12)',
                      border:     '1px solid rgba(64,138,113,0.25)',
                    }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                      <span className="text-xs font-bold" style={{ color: '#408A71' }}>
                        Live updates enabled
                      </span>
                    </div>
                  </div>

                  {canResubmit && (
                    <>
                      <p className="text-xs text-center" style={{ color: 'rgba(176,228,204,0.35)' }}>
                        {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                      </p>
                      <button onClick={handleSubmit} disabled={submitting} className="rs-btn-primary mt-1">
                        {submitting
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <><TrendingUp className="w-4 h-4" /> Submit New Request</>
                        }
                      </button>
                    </>
                  )}

                  {request.status === 'approved' && (
                    <button onClick={() => router.push('/dashboard')} className="rs-btn-primary mt-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* No request yet */}
              {isAuthenticated && !request && (
                <div className="space-y-3">
                  <button onClick={handleSubmit} disabled={submitting} className="rs-btn-primary">
                    {submitting
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <><TrendingUp className="w-5 h-5" /> Request Seller Access</>
                    }
                  </button>
                  <p className="text-center text-xs" style={{ color: 'rgba(176,228,204,0.30)' }}>
                    Free to request · Usually approved within 24 hours
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const styles = `
  .rs-root * { box-sizing: border-box; }
  .rs-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  @keyframes rsFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rs-fade-up { animation: rsFadeUp 0.42s cubic-bezier(.22,1,.36,1) both; }

  .rs-loader {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; padding: 8rem 1rem;
  }

  .rs-center-state {
    max-width: 28rem; margin: 0 auto;
    padding: 5rem 1rem; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }

  .rs-hero-icon {
    width: 80px; height: 80px; border-radius: 24px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #285A48 0%, #1a3d2e 100%);
    border: 1px solid rgba(64,138,113,0.38);
    box-shadow: 0 12px 32px rgba(9,20,19,0.65);
    flex-shrink: 0;
  }

  .rs-badge-approved {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px; border-radius: 99px;
    background: rgba(74,222,128,0.12);
    border: 1px solid rgba(74,222,128,0.3);
    color: #4ade80;
    font-size: 11px; font-weight: 800;
  }

  .rs-title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700; color: #fff; line-height: 1.1; margin: 0;
  }
  .rs-subtitle {
    font-size: 0.875rem; line-height: 1.6;
    color: rgba(176,228,204,0.45); margin: 0;
  }

  .rs-benefit-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 18px;
    background: linear-gradient(145deg, rgba(13,28,25,0.95), rgba(10,21,18,0.98));
    border: 1px solid rgba(40,90,72,0.25);
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .rs-benefit-card:hover {
    border-color: rgba(64,138,113,0.42);
    transform: translateX(3px);
  }

  .rs-benefit-icon {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(40,90,72,0.25);
    border: 1px solid rgba(64,138,113,0.25);
    flex-shrink: 0;
  }

  .rs-btn-primary {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 0.875rem 1.5rem;
    background: #408A71; color: #fff;
    font-size: 0.9rem; font-weight: 800;
    border: none; border-radius: 16px;
    box-shadow: 0 6px 22px rgba(64,138,113,0.30);
    transition: background 0.18s ease, transform 0.12s ease;
    cursor: pointer;
  }
  .rs-btn-primary:hover:not(:disabled) {
    background: #4eaa85; transform: translateY(-1px);
  }
  .rs-btn-primary:disabled { opacity: 0.50; cursor: not-allowed; }
  .rs-btn-auto { width: auto; padding: 0.75rem 2rem; }

  .rs-status-card {
    border-radius: 20px; border-width: 1px; border-style: solid;
    padding: 20px;
    display: flex; flex-direction: column; gap: 16px;
  }

  .rs-status-icon {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
  }

  .rs-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(40,90,72,0.4), transparent);
  }
`