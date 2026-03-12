'use client'

import { useEffect } from 'react'
import Topbar from '@/components/layout/Topbar'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { cartService } from '@/lib/services/cart.service'
import { wishlistService } from '@/lib/services/wishlist.service'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore()
  const { setCart }         = useCartStore()
  const { setWishlist }     = useWishlistStore()

  useEffect(() => {
    // Only load cart and wishlist if logged in
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
      <Topbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}