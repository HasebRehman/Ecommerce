'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Clock, CheckCircle, XCircle, Loader2, Store } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { API } from '@/constants/api'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: {
    icon:  Clock,
    color: 'text-yellow-400',
    bg:    'bg-yellow-500/10 border-yellow-500/20',
    label: 'Pending Review',
    desc:  'Your request is being reviewed by our admin team',
  },
  approved: {
    icon:  CheckCircle,
    color: 'text-green-400',
    bg:    'bg-green-500/10 border-green-500/20',
    label: 'Approved! 🎉',
    desc:  'You are now a Retailer. Login again to access your dashboard.',
  },
  rejected: {
    icon:  XCircle,
    color: 'text-red-400',
    bg:    'bg-red-500/10 border-red-500/20',
    label: 'Request Rejected',
    desc:  'Your request was not approved. You can submit a new request.',
  },
}

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

  // Realtime updates
  useEffect(() => {
    if (!isAuthenticated || !user) return
    const supabase = createClient()

    const sub = supabase
      .channel('role-request-changes')
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'role_upgrade_requests',
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

  if (userRole === 'business_owner' || role === 'business_owner') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
          <Store className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">You're already a Retailer!</h1>
        <p className="text-slate-400 mt-2 mb-6">Access your dashboard to manage your shops</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  const statusConfig = request
    ? STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
    : null

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Become a Retailer</h1>
        <p className="text-slate-400 mt-2">Start selling your products on VendoSphere</p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 gap-3 mb-8">
        {[
          { icon: '🏪', title: 'Create Multiple Shops',  desc: 'Set up shops for different categories' },
          { icon: '📦', title: 'Manage Inventory',       desc: 'Add and manage your products easily' },
          { icon: '📊', title: 'Track Orders',           desc: 'Monitor your sales in real-time' },
          { icon: '🚀', title: 'Go Live Anytime',        desc: 'Control when your shop is visible' },
        ].map(b => (
          <div key={b.title} className="flex items-start gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-2xl">{b.icon}</span>
            <div>
              <p className="text-white text-sm font-medium">{b.title}</p>
              <p className="text-slate-400 text-xs mt-0.5">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {!isAuthenticated ? (
        <button
          onClick={() => router.push('/login')}
          className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
        >
          Login to Request
        </button>
      ) : request && statusConfig ? (
        <div className={cn('p-5 rounded-xl border space-y-3', statusConfig.bg)}>
          <div className="flex items-center gap-3">
            {(() => { const Icon = statusConfig.icon; return <Icon className={cn('w-6 h-6', statusConfig.color)} /> })()}
            <div>
              <p className={cn('font-semibold', statusConfig.color)}>{statusConfig.label}</p>
              <p className="text-slate-400 text-sm mt-0.5">{statusConfig.desc}</p>
            </div>
          </div>
          <p className="text-slate-500 text-xs">
            Submitted: {new Date(request.created_at).toLocaleDateString()}
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-400 text-xs">Live updates enabled — no refresh needed</span>
          </div>
          {request.status === 'rejected' && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-10 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors mt-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Submit New Request'}
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-12 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {submitting
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <><TrendingUp className="w-5 h-5" /> Request Seller Access</>
          }
        </button>
      )}
    </div>
  )
}