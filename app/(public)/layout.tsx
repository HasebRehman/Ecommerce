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
  /* ── all logic is completely unchanged ── */
  const { isAuthenticated } = useAuthStore()
  const { setCart }         = useCartStore()
  const { setWishlist }     = useWishlistStore()

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        /* ── Base reset for public pages ── */
        .pl-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: #091413;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Ambient blobs — subtle, non-distracting ── */
        .pl-blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(110px);
        }
        .pl-blob-tl {
          width: 600px; height: 600px;
          top: -200px; left: -200px;
          background: radial-gradient(circle, rgba(40,90,72,0.18) 0%, transparent 70%);
          animation: plDrift1 20s ease-in-out infinite alternate;
        }
        .pl-blob-br {
          width: 500px; height: 500px;
          bottom: -150px; right: -150px;
          background: radial-gradient(circle, rgba(64,138,113,0.12) 0%, transparent 70%);
          animation: plDrift2 25s ease-in-out infinite alternate;
        }
        .pl-blob-mid {
          width: 350px; height: 350px;
          top: 40%; left: 60%;
          background: radial-gradient(circle, rgba(40,90,72,0.07) 0%, transparent 70%);
          animation: plDrift3 30s ease-in-out infinite alternate;
        }

        @keyframes plDrift1 {
          from { transform: translate(0, 0); }
          to   { transform: translate(50px, 40px); }
        }
        @keyframes plDrift2 {
          from { transform: translate(0, 0); }
          to   { transform: translate(-40px, -30px); }
        }
        @keyframes plDrift3 {
          from { transform: translate(0, 0); }
          to   { transform: translate(-30px, 25px); }
        }

        /* ── Dot grid texture ── */
        .pl-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: radial-gradient(rgba(64,138,113,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        /* ── Main content sits above decorative layers ── */
        .pl-main {
          position: relative;
          z-index: 1;
        }

        /* ── Scrollbar styling ── */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(40,90,72,0.4) transparent;
        }
        *::-webkit-scrollbar { width: 6px; height: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb {
          background: rgba(40,90,72,0.4);
          border-radius: 99px;
        }
        *::-webkit-scrollbar-thumb:hover { background: rgba(64,138,113,0.55); }

        /* ── Selection colour ── */
        ::selection {
          background: rgba(64,138,113,0.35);
          color: #B0E4CC;
        }

        /* ── Global cursor for interactive elements ── */
        a, button, [role="button"], label, [class*="cursor-pointer"] {
          cursor: pointer !important;
        }
      `}</style>

      <div className="pl-root">

        {/* Ambient background blobs */}
        <div className="pl-blob pl-blob-tl" />
        <div className="pl-blob pl-blob-br" />
        <div className="pl-blob pl-blob-mid" />

        {/* Dot grid texture */}
        <div className="pl-grid" />

        {/* Topbar — sits above everything */}
        <div className="relative z-50">
          <Topbar />
        </div>

        {/* Page content */}
        <main className="pl-main pt-16">
          {children}
        </main>

      </div>
    </>
  )
}