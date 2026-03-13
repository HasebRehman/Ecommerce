'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import ShopForm from '@/components/dashboard/business/shops/ShopForm'

export default function EditShopPage() {
  const params            = useParams()
  const router            = useRouter()
  const [shop,    setShop]    = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/shops/${params.id}`)
      .then(res => setShop(res.data.shop))
      .catch(() => router.push('/dashboard/shops'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSubmit = async (data: any) => {
    await api.put(`/api/shops/${params.id}`, data)
    toast.success('Shop updated!')
    router.push(`/dashboard/shops/${params.id}`)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-white">Edit Shop</h1>
      </div>
      <ShopForm initialData={shop} onSubmit={handleSubmit} />
    </div>
  )
}