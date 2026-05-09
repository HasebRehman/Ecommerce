'use client'

import { useEffect } from 'react'
import Topbar from '@/components/layout/Topbar'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { cartService } from '@/lib/services/cart.service'
import { wishlistService } from '@/lib/services/wishlist.service'
import { announcementService } from '@/lib/services/announcement.service'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore()
  const { setCart }         = useCartStore()
  const { setWishlist }     = useWishlistStore()
  const { addNotification } = useNotificationStore()

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

    // Push customer-targeted announcements into the notification bell
    announcementService.getActive()
      .then(announcements => {
        announcements.forEach(a => {
          addNotification({
            id:         a.id,
            title:      a.subject,
            message:    a.message,
            type:       'announcement',
            order_id:   null,
            is_read:    false,
            created_at: a.scheduled_at,
          })
        })
      })
      .catch(() => {})
  }, [isAuthenticated])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');

        .pl-root {
          font-family: 'Open Sans', sans-serif;
          min-height: 100vh;
          background: #FAF5FF;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient purple blobs */
        .pl-blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(120px);
        }
        .pl-blob-tl {
          width: 700px; height: 700px;
          top: -250px; left: -250px;
          background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
          animation: plDrift1 22s ease-in-out infinite alternate;
        }
        .pl-blob-br {
          width: 600px; height: 600px;
          bottom: -200px; right: -200px;
          background: radial-gradient(circle, rgba(196,181,253,0.18) 0%, transparent 70%);
          animation: plDrift2 28s ease-in-out infinite alternate;
        }
        .pl-blob-mid {
          width: 400px; height: 400px;
          top: 45%; left: 55%;
          background: radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%);
          animation: plDrift3 32s ease-in-out infinite alternate;
        }

        @keyframes plDrift1 {
          from { transform: translate(0, 0); }
          to   { transform: translate(60px, 50px); }
        }
        @keyframes plDrift2 {
          from { transform: translate(0, 0); }
          to   { transform: translate(-50px, -40px); }
        }
        @keyframes plDrift3 {
          from { transform: translate(0, 0); }
          to   { transform: translate(-35px, 30px); }
        }

        /* Subtle dot grid */
        .pl-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: radial-gradient(rgba(124,58,237,0.08) 1px, transparent 1px);
          background-size: 30px 30px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        .pl-main {
          position: relative;
          z-index: 1;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(124,58,237,0.3) transparent;
        }
        *::-webkit-scrollbar { width: 6px; height: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb {
          background: rgba(124,58,237,0.3);
          border-radius: 99px;
        }
        *::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.5); }

        ::selection {
          background: rgba(124,58,237,0.2);
          color: #7C3AED;
        }

        a, button, [role="button"], label, [class*="cursor-pointer"] {
          cursor: pointer !important;
        }
      `}</style>

      <div className="pl-root">
        <div className="pl-blob pl-blob-tl" />
        <div className="pl-blob pl-blob-br" />
        <div className="pl-blob pl-blob-mid" />
        <div className="pl-grid" />

        <div className="relative z-50">
          <Topbar />
        </div>

        <main className="pl-main pt-16">
          {children}
        </main>
      </div>
    </>
  )
}
