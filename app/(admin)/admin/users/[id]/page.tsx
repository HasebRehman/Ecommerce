'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Shield, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

export default function AdminUserDetailPage() {
  const params              = useParams()
  const router              = useRouter()
  const [data,    setData]  = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    api.get(`/api/admin/users/${params.id}`)
      .then(res => setData(res.data))
      .catch(() => router.push('/admin/users'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleToggleActive = async () => {
    setSaving(true)
    try {
      const newVal = !data.role?.is_active
      await api.put(`/api/admin/users/${params.id}`, { is_active: newVal })
      setData((p: any) => ({ ...p, role: { ...p.role, is_active: newVal } }))
      toast.success(newVal ? 'User activated' : 'User deactivated')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
  if (!data)   return null

  const { profile, role, email } = data

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/users')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-white">User Details</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <h2 className="text-white text-lg font-bold">{profile?.full_name ?? '—'}</h2>
            <p className="text-slate-400 text-sm">@{profile?.username ?? '—'}</p>
          </div>
        </div>

        {[
          { icon: Mail,   label: 'Email',    value: email },
          { icon: User,   label: 'Phone',    value: profile?.phone ?? '—' },
          { icon: Shield, label: 'Role',     value: role?.role?.replace(/_/g, ' ') ?? '—' },
          { icon: Shield, label: 'Sub Roles', value: role?.sub_roles?.join(', ') || '—' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
            <item.icon className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <p className="text-slate-500 text-xs">{item.label}</p>
              <p className="text-white text-sm capitalize">{item.value}</p>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
          <div>
            <p className="text-slate-400 text-sm">Account Status</p>
            <p className={cn('text-sm font-medium', role?.is_active ? 'text-green-400' : 'text-red-400')}>
              {role?.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
          <button onClick={handleToggleActive} disabled={saving} className="text-slate-400 hover:text-white transition-colors">
            {role?.is_active
              ? <ToggleRight className="w-8 h-8 text-green-400" />
              : <ToggleLeft  className="w-8 h-8 text-slate-500" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}