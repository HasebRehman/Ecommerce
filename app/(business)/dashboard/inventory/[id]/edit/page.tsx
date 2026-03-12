'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { productService } from '@/lib/services/product.service'
import ProductForm from '@/components/dashboard/business/inventory/ProductForm'

export default function EditProductPage() {
  const params            = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    const id = params.id as string
    if (!id) return

    productService
      .getProduct(id)
      .then(data => {
        if (data?.product) {
          setProduct(data.product)
        } else {
          setError('Product not found')
        }
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 font-medium">{error}</p>
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