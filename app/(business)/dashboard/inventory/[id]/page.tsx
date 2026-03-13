'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import api from '@/lib/axios'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'

export default function ProductDetailPage() {
  const params              = useParams()
  const router              = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.get(`/api/products/${params.id}`)
      .then(res => setProduct(res.data.product))
      .catch(() => router.push('/dashboard/inventory'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('Delete this product?')) return
    setDeleting(true)
    try {
      await api.delete(`/api/products/${params.id}`)
      toast.success('Product deleted')
      router.push('/dashboard/inventory')
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
  if (!product) return null

  const displayPrice = product.discount_price ?? product.price

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/inventory')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-white">Product Detail</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/inventory/${params.id}/edit`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition-colors">
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
          </Link>
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-xl border border-red-500/30 transition-colors">
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
          {product.images?.[0]
            ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Package className="w-16 h-16 text-slate-600" /></div>
          }
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">{product.name}</h2>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">Rs. {displayPrice?.toLocaleString()}</span>
            {product.discount_price && <DiscountBadge price={product.price} discountPrice={product.discount_price} />}
          </div>
          {product.description && <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>}
          {[
            { label: 'SKU',      value: product.sku ?? '—' },
            { label: 'Stock',    value: product.stock },
            { label: 'Category', value: product.categories?.name ?? '—' },
            { label: 'Status',   value: product.is_active ? 'Active' : 'Inactive' },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400 text-sm">{r.label}</span>
              <span className="text-white text-sm font-medium">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}