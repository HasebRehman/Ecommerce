'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { shopService } from '@/lib/services/shop.service'
import ShopForm from '@/components/dashboard/business/shops/ShopForm'

export default function EditShopPage() {
  const params              = useParams()
  const [shop, setShop]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    shopService
      .getShop(params.id as string)
      .then(data => setShop(data.shop))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <ShopForm
      mode="edit"
      shopId={params.id as string}
      initialData={shop}
    />
  )
}