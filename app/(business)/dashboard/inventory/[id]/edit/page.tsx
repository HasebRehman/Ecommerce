'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import ProductForm from '@/components/dashboard/business/inventory/ProductForm'

export default function EditProductPage() {
  const params            = useParams()
  const router            = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  const id = params?.id as string

  useEffect(() => {
    if (!id || id === 'undefined') return
    api.get(`/api/products/${id}`)
      .then(res => setProduct(res.data.product))
      .catch(() => router.push('/dashboard/inventory'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (data: any) => {
    if (!id || id === 'undefined') {
      toast.error('Invalid product ID')
      return
    }
    setSaving(true)
    try {
      await api.put(`/api/products/${id}`, data)
      toast.success('Product updated!')
      router.push(`/dashboard/inventory/${id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product')
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

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Product not found</p>
      </div>
    )
  }

  return (
    <ProductForm
      initialData={product}
      mode="edit"
      onSubmit={handleSubmit}
      isSubmitting={saving}
    />
  )
}