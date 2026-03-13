'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import ShopForm from '@/components/dashboard/business/shops/ShopForm'

export default function EditShopPage() {
  const params            = useParams()
  const router            = useRouter()
  const [shop,    setShop]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  const id = params?.id as string

  useEffect(() => {
    if (!id || id === 'undefined') return
    api.get(`/api/shops/${id}`)
      .then(res => setShop(res.data.shop))
      .catch(() => router.push('/dashboard/shops'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (data: any) => {
    if (!id || id === 'undefined') {
      toast.error('Invalid shop ID')
      return
    }
    setSaving(true)
    try {
      await api.put(`/api/shops/${id}`, data)
      toast.success('Shop updated!')
      router.push(`/dashboard/shops`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update shop')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Shop not found</p>
      </div>
    )
  }

  return (
    <ShopForm
      initialData={shop}
      mode="edit"
      onSubmit={handleSubmit}
      isSubmitting={saving}
    />
  )
}