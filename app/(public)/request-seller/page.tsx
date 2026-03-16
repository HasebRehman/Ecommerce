'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, Clock, CheckCircle, XCircle,
  Loader2, Store, LayoutDashboard, Zap,
  Package, BarChart3, ShoppingBag, ArrowRight,
  Radio,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { API } from '@/constants/api'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: {
    icon:  Clock,
    color: '#facc15',
    bg:    'rgba(250,204,21,0.10)',
    border:'rgba(250,204,21,0.28)',
    label: 'Pending Review',
    desc:  'Your request is being reviewed by our admin team',
  },
  approved: {
    icon:  CheckCircle,
    color: '#4ade80',
    bg:    'rgba(74,222,128,0.10)',
    border:'rgba(74,222,128,0.28)',
    label: 'Approved! 🎉',
    desc:  'You are now a Retailer. Login again to access your dashboard.',
  },
  rejected: {
    icon:  XCircle,
    color: '#f87171',
    bg:    'rgba(248,113,113,0.10)',
    border:'rgba(248,113,113,0.28)',
    label: 'Request Rejected',
    desc:  'Your request was not approved. You can submit a new request.',
  },
}

const BENEFITS = [
  { icon: Store,      emoji: '🏪', title: 'Create Multiple Shops',  desc: 'Set up shops for different categories and grow your brand' },
  { icon: Package,    emoji: '📦', title: 'Manage Inventory',       desc: 'Add, edit and manage your products with ease' },
  { icon: BarChart3,  emoji: '📊', title: 'Track Orders',           desc: 'Monitor your sales and orders in real-time' },
  { icon: Zap,        emoji: '🚀', title: 'Go Live Anytime',        desc: 'Control when your shop is visible to buyers' },
]

export default function RequestSellerPage() {
  const router                          = useRouter()
  const { isAuthenticated, role, user } = useAuthStore()
  const [request,    setRequest]        = useState<any>(null)
  const [userRole,   setUserRole]       = useState<string>('')
  const [loading,    setLoading]        = useState(true)
  const [submitting, setSubmitting]     = useState(false)

  /* ── all logic completely unchanged ── */
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
          toast.success('🎉 Your request was approved! You are now a Retailer!')
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
      toast.error(err.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Already a retailer ── */
  if (userRole === 'business_owner' || role === 'business_owner') return (
    <>
      <style>{styles}</style>
      <div className="rs-root rs-center-state">
        <div className="rs-hero-icon">
          <Store className="w-10 h-10" style={{ color: '#B0E4CC' }} />
        </div>
        <div className="rs-badge-approved">
          <CheckCircle className="w-3.5 h-3.5" />
          Active Retailer
        </div>
        <h1 className="rs-title">You're already a Retailer!</h1>
        <p className="rs-subtitle">Access your dashboard to manage your shops and orders</p>
        <button onClick={() => router.push('/dashboard')} className="rs-btn-primary rs-btn-auto">
          <LayoutDashboard className="w-4 h-4" />
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </>
  )

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="rs-root rs-loader">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#408A71' }} />
        <span style={{ color: 'rgba(176,228,204,0.40)', fontSize: '0.85rem', fontWeight: 500 }}>
          Loading…
        </span>
      </div>
    </>
  )

  const statusConfig = request
    ? STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
    : null

  return (
    <>
      <style>{styles}</style>

      <div className="rs-root max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Hero header ──────────────────────────── */}
        <div className="rs-fade-up text-center mb-10">
          <div className="rs-hero-icon mx-auto mb-5">
            <TrendingUp className="w-10 h-10" style={{ color: '#B0E4CC' }} />
          </div>
          <h1 className="rs-title mb-2">Become a Retailer</h1>
          <p className="rs-subtitle">
            Join hundreds of local sellers on VendoSphere and start earning today
          </p>
        </div>

        {/* ── Benefits grid ────────────────────────── */}
        <div className="rs-fade-up space-y-2.5 mb-8" style={{ animationDelay: '70ms' }}>
          {BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className="rs-benefit-card"
              style={{ animationDelay: `${80 + i * 55}ms` }}
            >
              {/* Emoji icon */}
              <div className="rs-benefit-icon shrink-0">
                <span className="text-xl">{b.emoji}</span>
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{b.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(176,228,204,0.45)' }}>{b.desc}</p>
              </div>
              {/* Arrow */}
              <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'rgba(64,138,113,0.45)' }} />
            </div>
          ))}
        </div>

        {/* ── CTA / Status area ─────────────────────── */}
        <div className="rs-fade-up" style={{ animationDelay: '320ms' }}>

          {/* Not logged in */}
          {!isAuthenticated && (
            <button onClick={() => router.push('/login')} className="rs-btn-primary">
              Login to Request Access
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Has existing request */}
          {isAuthenticated && request && statusConfig && (
            <div className="rs-status-card" style={{ background: statusConfig.bg, borderColor: statusConfig.border }}>

              {/* Status header */}
              <div className="flex items-start gap-4">
                <div className="rs-status-icon shrink-0"
                  style={{ background: `${statusConfig.color}18`, border: `1px solid ${statusConfig.color}35` }}>
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

              {/* Divider */}
              <div className="rs-divider" />

              {/* Meta row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs" style={{ color: 'rgba(176,228,204,0.35)' }}>
                  Submitted:{' '}
                  <span style={{ color: 'rgba(176,228,204,0.60)' }}>
                    {new Date(request.created_at).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </p>

                {/* Live update indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(64,138,113,0.12)',
                    border: '1px solid rgba(64,138,113,0.25)',
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#408A71] animate-pulse shrink-0" />
                  <span className="text-[10px] font-bold" style={{ color: '#408A71' }}>
                    Live updates enabled
                  </span>
                </div>
              </div>

              {/* Re-submit on rejection */}
              {request.status === 'rejected' && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rs-btn-primary mt-2"
                >
                  {submitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><TrendingUp className="w-4 h-4" /> Submit New Request</>
                  }
                </button>
              )}

              {/* Go to dashboard on approval */}
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
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rs-btn-primary"
              >
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
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .rs-root * { box-sizing: border-box; }
  .rs-root, .rs-root a, .rs-root button { cursor: pointer !important; }
  .rs-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── fade-up ── */
  @keyframes rsFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rs-fade-up { animation: rsFadeUp 0.42s cubic-bezier(.22,1,.36,1) both; }

  /* ── loader ── */
  .rs-loader {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; padding: 8rem 1rem;
  }

  /* ── centre state (already retailer) ── */
  .rs-center-state {
    max-width: 28rem; margin: 0 auto;
    padding: 5rem 1rem; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }

  /* ── hero icon tile ── */
  .rs-hero-icon {
    width: 80px; height: 80px; border-radius: 24px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #285A48 0%, #1a3d2e 100%);
    border: 1px solid rgba(64,138,113,0.38);
    box-shadow: 0 12px 32px rgba(9,20,19,0.65), 0 0 0 1px rgba(64,138,113,0.12);
    flex-shrink: 0;
  }

  /* ── approved badge ── */
  .rs-badge-approved {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px; border-radius: 99px;
    background: rgba(74,222,128,0.12);
    border: 1px solid rgba(74,222,128,0.3);
    color: #4ade80;
    font-size: 11px; font-weight: 800;
    letter-spacing: 0.04em;
  }

  /* ── title / subtitle ── */
  .rs-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700; color: #fff; line-height: 1.1;
    margin: 0;
  }
  .rs-subtitle {
    font-size: 0.875rem; line-height: 1.6;
    color: rgba(176,228,204,0.45);
    margin: 0;
  }

  /* ── benefit card ── */
  @keyframes rsBenefitIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .rs-benefit-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 18px;
    background: linear-gradient(145deg, rgba(13,28,25,0.95), rgba(10,21,18,0.98));
    border: 1px solid rgba(40,90,72,0.25);
    animation: rsBenefitIn 0.38s cubic-bezier(.22,1,.36,1) both;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .rs-benefit-card:hover {
    border-color: rgba(64,138,113,0.42);
    transform: translateX(3px);
  }

  /* ── benefit icon ── */
  .rs-benefit-icon {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(40,90,72,0.25);
    border: 1px solid rgba(64,138,113,0.25);
    flex-shrink: 0;
  }

  /* ── primary button ── */
  .rs-btn-primary {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 0.875rem 1.5rem;
    background: #408A71; color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem; font-weight: 800;
    border: none; border-radius: 16px;
    box-shadow: 0 6px 22px rgba(64,138,113,0.30);
    transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.2s ease;
  }
  .rs-btn-primary:hover:not(:disabled) {
    background: #4eaa85;
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(64,138,113,0.40);
  }
  .rs-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .rs-btn-primary:disabled { opacity: 0.50; cursor: not-allowed !important; }
  .rs-btn-auto { width: auto; padding: 0.75rem 2rem; }

  /* ── status card ── */
  .rs-status-card {
    border-radius: 20px; border-width: 1px; border-style: solid;
    padding: 20px; space-y: 16px;
    display: flex; flex-direction: column; gap: 16px;
  }

  /* ── status icon ── */
  .rs-status-icon {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── divider ── */
  .rs-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(40,90,72,0.4), transparent);
  }
`