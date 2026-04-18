'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, Loader2, ArrowRight, Tag, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { cartService } from '@/lib/services/cart.service'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import CheckoutForm from '@/components/store/CheckoutForm'

export default function CartPage() {
  const { isAuthenticated }              = useAuthStore()
  const { items, total, count, setCart } = useCartStore()
  const [loading,     setLoading]        = useState(true)
  const [checkingOut, setCheckingOut]    = useState(false)
  const [updating,    setUpdating]       = useState<string | null>(null)

  /* ── all logic completely unchanged ── */
  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    cartService.getCart()
      .then(data => setCart(data.cart ?? []))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleUpdateQuantity = async (id: string, qty: number) => {
    setUpdating(id)
    try {
      await cartService.updateQuantity(id, qty)
      const data = await cartService.getCart()
      setCart(data.cart ?? [])
    } catch {
      toast.error('Failed to update cart')
    } finally {
      setUpdating(null)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await cartService.removeFromCart(id)
      const data = await cartService.getCart()
      setCart(data.cart ?? [])
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  /* ─────────────────────────────────────────────────────────
     SHARED STYLES
  ───────────────────────────────────────────────────────── */
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;500;600&display=swap');

    .cp-root * { box-sizing: border-box; }
    .cp-root { font-family: 'Open Sans', sans-serif; }

    /* card */
    .cp-card {
      background: linear-gradient(145deg, rgba(124,58,237,0.08) 0%, rgba(109,40,217,0.06) 100%);
      border: 1px solid rgba(124,58,237,0.15);
      border-radius: 20px;
      box-shadow: 0 4px 16px rgba(124,58,237,0.12), 0 2px 8px rgba(124,58,237,0.08);
    }

    /* divider */
    .cp-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent);
    }

    /* primary btn */
    .cp-btn-primary {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 0.85rem 1.5rem;
      background: #7C3AED; color: #fff;
      font-family: 'Montserrat', sans-serif;
      font-size: 0.875rem; font-weight: 800;
      letter-spacing: 0.03em;
      border: none; border-radius: 14px;
      cursor: pointer;
      transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;
      box-shadow: 0 6px 20px rgba(124,58,237,0.30);
    }
    .cp-btn-primary:hover:not(:disabled) {
      background: #6D28D9;
      transform: translateY(-1px);
      box-shadow: 0 10px 28px rgba(124,58,237,0.40);
    }
    .cp-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .cp-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    /* qty btn */
    .cp-qty-btn {
      width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(124,58,237,0.1);
      border: 1px solid rgba(124,58,237,0.2);
      color: rgba(124,58,237,0.7);
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      font-family: 'Open Sans', sans-serif;
    }
    .cp-qty-btn:hover:not(:disabled) {
      background: rgba(124,58,237,0.2);
      border-color: #7C3AED;
      color: #7C3AED;
    }
    .cp-qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    /* cart item row */
    .cp-item {
      display: flex; align-items: center; gap: 12px;
      padding: 14px;
      background: rgba(124,58,237,0.04);
      border: 1px solid rgba(124,58,237,0.12);
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(124,58,237,0.12), 0 2px 8px rgba(124,58,237,0.08);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .cp-item:hover { 
      border-color: rgba(124,58,237,0.25);
      box-shadow: 0 8px 24px rgba(124,58,237,0.16), 0 4px 12px rgba(124,58,237,0.12);
    }

    /* animate in */
    @keyframes cpFadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cp-anim { animation: cpFadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
  `

  /* ─────────────────────────────────────────────────────────
     NOT LOGGED IN
  ───────────────────────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <>
        <style>{styles}</style>
        <div className="cp-root max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              border: '1px solid rgba(124,58,237,0.35)',
              boxShadow: '0 8px 28px rgba(124,58,237,0.3)',
            }}>
            <ShoppingBag className="w-9 h-9" style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", color: '#1F2937' }}
            className="text-2xl font-bold mb-2">
            Login to view your cart
          </h2>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
            You need to be logged in to view cart items
          </p>
          <Link href="/login">
            <button className="cp-btn-primary" style={{ width: 'auto', display: 'inline-flex', padding: '0.75rem 2rem' }}>
              Login to Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </>
    )
  }

  /* ─────────────────────────────────────────────────────────
     LOADING
  ───────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="cp-root flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7C3AED' }} />
          <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
            Loading your cart…
          </span>
        </div>
      </>
    )
  }

  /* ─────────────────────────────────────────────────────────
     EMPTY CART
  ───────────────────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="cp-root max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              border: '1px solid rgba(124,58,237,0.35)',
              boxShadow: '0 8px 28px rgba(124,58,237,0.3)',
            }}>
            <ShoppingBag className="w-9 h-9" style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", color: '#1F2937' }}
            className="text-2xl font-bold mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
            Discover amazing products and add them to your cart
          </p>
          <Link href="/">
            <button className="cp-btn-primary" style={{ width: 'auto', display: 'inline-flex', padding: '0.75rem 2rem' }}>
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </button>
          </Link>
        </div>
      </>
    )
  }

  /* ─────────────────────────────────────────────────────────
     MAIN CART
  ───────────────────────────────────────────────────────── */
  return (
    <>
      <style>{styles}</style>

      <div className="cp-root max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Page title */}
        <div className="mb-8 cp-anim">
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", color: '#000000' }}
            className="text-2xl sm:text-3xl font-bold leading-tight">
            My Cart
          </h1>
          <p className="text-sm mt-1" style={{ color: '#000000' }}>
            {count} {count === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Cart items ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, idx) => {
              const product      = item.products
              const displayPrice = product.discount_price ?? product.price

              return (
                <div
                  key={item.id}
                  className="cp-item cp-anim"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Product image */}
                  <Link href={`/product/${product.id}`} className="shrink-0">
                    <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl overflow-hidden"
                      style={{ border: '1px solid rgba(124,58,237,0.2)', background: '#F3E8FF' }}>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-7 h-7" style={{ color: '#7C3AED' }} />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Name + price */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${product.id}`}>
                      <p className="text-sm font-semibold line-clamp-2 leading-snug transition-colors"
                        style={{ color: '#000' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#7C3AED')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#000')}>
                        {product.name}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-gray-900 font-black text-sm">
                        Rs. {displayPrice.toLocaleString()}
                      </span>
                      {product.discount_price && (
                        <span className="text-xs line-through" style={{ color: '#000' }}>
                          Rs. {product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={!!updating}
                      className="cp-qty-btn"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="w-6 text-center text-sm font-bold"
                      style={{ color: '#7C3AED' }}>
                      {updating === item.id
                        ? <Loader2 className="w-3 h-3 animate-spin mx-auto" style={{ color: '#7C3AED' }} />
                        : item.quantity}
                    </span>

                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={!!updating || item.quantity >= product.stock}
                      className="cp-qty-btn"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Row total + remove */}
                  <div className="text-right shrink-0 min-w-[72px]">
                    <p className="text-gray-900 font-black text-sm">
                      Rs. {(displayPrice * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="mt-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all ml-auto"
                      style={{ background: 'rgba(239,68,68,0.1)', color: 'rgba(248,113,113,0.7)', cursor: 'pointer' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.22)'
                        ;(e.currentTarget as HTMLButtonElement).style.color = '#f87171'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'
                        ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,113,113,0.7)'
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Order summary + checkout ──────────── */}
          <div className="space-y-4 cp-anim" style={{ animationDelay: '120ms' }}>

            {/* Summary card */}
            <div className="cp-card p-5 space-y-4">

              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                    border: '1px solid rgba(124,58,237,0.35)',
                  }}>
                  <Tag className="w-4 h-4" style={{ color: '#fff' }} />
                </div>
                <h3 className="text-gray-900 font-bold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>Order Summary</h3>
              </div>

              <div className="cp-divider" />

              {/* Line items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: '#6B7280' }}>
                    Subtotal ({count} {count === 1 ? 'item' : 'items'})
                  </span>
                  <span className="text-gray-900 font-semibold">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: '#6B7280' }}>Delivery</span>
                  <span className="flex items-center gap-1.5 font-bold text-xs"
                    style={{ color: '#7C3AED' }}>
                    <Truck className="w-3.5 h-3.5" />
                    Free
                  </span>
                </div>
              </div>

              <div className="cp-divider" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-bold text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>Total</span>
                <span className="font-black text-lg" style={{ color: '#7C3AED' }}>
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              {/* Savings badge */}
              {items.some(i => i.products.discount_price) && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    color: '#7C3AED',
                  }}>
                  <Tag className="w-3.5 h-3.5 shrink-0" />
                  You're saving on discounted items!
                </div>
              )}
            </div>

            {/* Checkout CTA / form */}
            {!checkingOut ? (
              <button
                onClick={() => setCheckingOut(true)}
                className="cp-btn-primary"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="cp-card overflow-hidden">
                <CheckoutForm
                  items={items}
                  total={total}
                  onCancel={() => setCheckingOut(false)}
                  onSuccess={() => {
                    setCheckingOut(false)
                    cartService.getCart().then(d => setCart(d.cart ?? []))
                  }}
                />
              </div>
            )}

            {/* Continue shopping link */}
            {!checkingOut && (
              <Link href="/" className="block text-center text-sm font-semibold transition-colors"
                style={{ color: '#7C3AED' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6D28D9')}
                onMouseLeave={e => (e.currentTarget.style.color = '#7C3AED')}>
                ← Continue Shopping
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}