'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { productService } from '@/lib/services/product.service'
import ProductForm from '@/components/dashboard/business/inventory/ProductForm'

export default function EditProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService
      .getProduct(params.id as string)
      .then(data => setProduct(data.product))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
      mode="edit"
      productId={params.id as string}
      initialData={product}
    />
  )
}