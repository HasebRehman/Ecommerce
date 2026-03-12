'use client'

import { useEffect } from 'react'
import Topbar from '@/components/layout/Topbar'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { cartService } from '@/lib/services/cart.service'
import { wishlistService } from '@/lib/services/wishlist.service'
import { useState } from 'react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated }   = useAuthStore()
  const { setCart }           = useCartStore()
  const { setWishlist }       = useWishlistStore()
  const [search, setSearch]   = useState('')

  // Load cart and wishlist when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    cartService.getCart()
      .then(data => setCart(data.cart ?? []))
      .catch(() => {})

    wishlistService.getWishlist()
      .then(data => {
        const ids = (data.wishlist ?? []).map((w: any) => w.product_id)
        setWishlist(ids)
      })
      .catch(() => {})

  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar onSearch={setSearch} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}