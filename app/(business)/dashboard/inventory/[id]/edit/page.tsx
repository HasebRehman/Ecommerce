'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import ProductForm from '@/components/dashboard/business/inventory/ProductForm'

export default function EditProductPage() {
  const params              = useParams()
  const router              = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/products/${params.id}`)
      .then(res => setProduct(res.data.product))
      .catch(() => router.push('/dashboard/inventory'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSubmit = async (data: any) => {
    await api.put(`/api/products/${params.id}`, data)
    toast.success('Product updated!')
    router.push(`/dashboard/inventory/${params.id}`)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-white">Edit Product</h1>
      </div>
      <ProductForm initialData={product} onSubmit={handleSubmit} />
    </div>
  )
}