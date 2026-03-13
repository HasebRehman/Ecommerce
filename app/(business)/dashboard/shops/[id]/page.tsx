'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Loader2, Store } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/axios'
import ShopProductsManager from '@/components/dashboard/business/shops/ShopProductsManager'
import StatusToggle from '@/components/dashboard/business/shops/StatusToggle'

export default function ShopDetailPage() {
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

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
  if (!shop)   return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/shops')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            {shop.logo_url
              ? <img src={shop.logo_url} alt={shop.name} className="w-10 h-10 rounded-xl object-cover" />
              : <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"><Store className="w-5 h-5 text-slate-500" /></div>
            }
            <h1 className="text-xl font-bold text-white">{shop.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusToggle shopId={shop.id} currentStatus={shop.status} onStatusChange={s => setShop((p: any) => ({ ...p, status: s }))} />
          <Link href={`/dashboard/shops/${params.id}/edit`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition-colors">
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
          </Link>
        </div>
      </div>
      <ShopProductsManager shopId={shop.id} />
    </div>
  )
}