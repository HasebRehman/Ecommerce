'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Loader2, CheckCircle, CreditCard,
  Banknote, Smartphone, ArrowLeft,
  ShoppingBag, FileText,
} from 'lucide-react'
import { orderService } from '@/lib/services/order.service'
import AddressSelector from './AddressSelector'
import { cn } from '@/lib/utils'

interface Props {
  items:     any[]
  total:     number
  onCancel:  () => void
  onSuccess: () => void
}

const PAYMENT_METHODS = [
  { value: 'cod',           label: 'Cash on Delivery', icon: Banknote    },
  { value: 'bank_transfer', label: 'Bank Transfer',    icon: CreditCard  },
  { value: 'easypaisa',     label: 'EasyPaisa',        icon: Smartphone  },
  { value: 'jazzcash',      label: 'JazzCash',         icon: Smartphone  },
]

export default function CheckoutForm({ items, total, onCancel, onSuccess }: Props) {
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [paymentMethod,   setPaymentMethod]   = useState('cod')
  const [notes,           setNotes]           = useState('')
  const [loading,         setLoading]         = useState(false)
  const [ordered,         setOrdered]         = useState(false)

  /* ── logic completely unchanged ── */
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address')
      return
    }
    setLoading(true)
    try {
      const orderItems = items.map((item: any) => ({
        product_id: item.product_id ?? item.products?.id,
        quantity:   item.quantity,
        price:      item.products?.discount_price ?? item.products?.price,
        shop_id:    item.products?.shop_products?.[0]?.shops?.id ?? null,
      }))

      await orderService.placeOrder({
        items:            orderItems,
        delivery_address: {
          full_name: selectedAddress.full_name,
          phone:     selectedAddress.phone,
          address:   selectedAddress.address,
          city:      selectedAddress.city,
        },
        payment_method: paymentMethod,
        notes:          notes || undefined,
      })

      setOrdered(true)
      toast.success('Order placed successfully! 🎉')
      setTimeout(() => onSuccess(), 1500)
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  /* ── Success state ── */
  if (ordered) return (
    <>
      <style>{styles}</style>
      <div className="cf-root cf-success-card p-8 text-center">
        <div className="cf-success-icon mx-auto mb-5">
          <CheckCircle className="w-10 h-10" style={{ color: '#408A71' }} />
        </div>
        <h3 className="text-white font-extrabold text-xl mb-1"
          style={{ fontFamily: "'DM Serif Display', serif" }}>
          Order Placed!
        </h3>
        <p className="text-sm" style={{ color: 'rgba(176,228,204,0.50)' }}>
          We'll contact you soon to confirm delivery
        </p>
        <div className="cf-progress-bar mt-6" />
      </div>
    </>
  )

  return (
    <>
      <style>{styles}</style>

      <div className="cf-root space-y-3 p-1">

        {/* ── Address selector ─────────────────────── */}
        <div className="cf-section">
          <AddressSelector
            selected={selectedAddress}
            onSelect={setSelectedAddress}
          />
        </div>

        {/* ── Payment method ───────────────────────── */}
        <div className="cf-section space-y-3">

          {/* Title */}
          <div className="flex items-center gap-2.5">
            <div className="cf-icon-tile">
              <CreditCard className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} />
            </div>
            <p className="text-white font-bold text-sm">Payment Method</p>
          </div>

          <div className="cf-divider" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(pm => {
              const active = paymentMethod === pm.value
              const Icon   = pm.icon
              return (
                <div
                  key={pm.value}
                  onClick={() => setPaymentMethod(pm.value)}
                  className="cf-payment-option flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
                  style={{
                    background:  active ? 'rgba(40,90,72,0.30)' : 'rgba(13,28,25,0.7)',
                    border:      active ? '1px solid rgba(64,138,113,0.6)' : '1px solid rgba(40,90,72,0.22)',
                    boxShadow:   active ? '0 0 0 1px rgba(64,138,113,0.15)' : 'none',
                    cursor:      'pointer',
                  }}
                >
                  {/* Radio */}
                  <div className="shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: active ? '#408A71' : 'rgba(40,90,72,0.5)',
                      background:  active ? '#408A71' : 'transparent',
                      boxShadow:   active ? '0 0 6px rgba(64,138,113,0.4)' : 'none',
                    }}>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: active ? 'rgba(64,138,113,0.25)' : 'rgba(40,90,72,0.2)',
                      border: '1px solid rgba(40,90,72,0.3)',
                    }}>
                    <Icon className="w-3 h-3" style={{ color: active ? '#B0E4CC' : 'rgba(176,228,204,0.45)' }} />
                  </div>

                  <span className="text-sm font-semibold transition-colors"
                    style={{ color: active ? '#B0E4CC' : 'rgba(176,228,204,0.50)' }}>
                    {pm.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Order notes ──────────────────────────── */}
        <div className="cf-section space-y-3">

          {/* Title */}
          <div className="flex items-center gap-2.5">
            <div className="cf-icon-tile">
              <FileText className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-white font-bold text-sm">Notes</p>
              <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(40,90,72,0.2)',
                  color: 'rgba(176,228,204,0.38)',
                  border: '1px solid rgba(40,90,72,0.3)',
                }}>
                optional
              </span>
            </div>
          </div>

          <div className="cf-divider" />

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Special instructions for your order…"
            rows={2}
            className="cf-textarea w-full resize-none"
          />
        </div>

        {/* ── Action buttons ───────────────────────── */}
        <div className="flex gap-2.5 pt-1">

          {/* Back */}
          <button
            type="button"
            onClick={onCancel}
            className="cf-btn-ghost flex items-center justify-center gap-2"
            style={{ flex: '0 0 auto', padding: '0 1.2rem', height: '44px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Place order */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddress}
            className="cf-btn-primary flex-1 flex items-center justify-center gap-2"
            style={{ height: '44px' }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Place Order · Rs. {total.toLocaleString()}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </>
  )
}

/* ── Shared styles ─────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .cf-root * { box-sizing: border-box; }
  .cf-root, .cf-root button, .cf-root a { cursor: pointer !important; }
  .cf-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* section card */
  .cf-section {
    background: linear-gradient(145deg, rgba(13,28,25,0.95) 0%, rgba(10,21,18,0.98) 100%);
    border: 1px solid rgba(40,90,72,0.28);
    border-radius: 18px;
    padding: 1rem;
  }

  /* icon tile */
  .cf-icon-tile {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    background: linear-gradient(135deg, #285A48, #1a3d2e);
    border: 1px solid rgba(64,138,113,0.35);
  }

  /* gradient divider */
  .cf-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(40,90,72,0.4), transparent);
  }

  /* payment option hover */
  .cf-payment-option:hover { border-color: rgba(64,138,113,0.38) !important; }

  /* textarea */
  .cf-textarea {
    background: rgba(9,20,19,0.7);
    border: 1px solid rgba(40,90,72,0.38);
    border-radius: 12px;
    padding: 0.6rem 0.85rem;
    color: #B0E4CC;
    font-size: 0.825rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    caret-color: #408A71;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .cf-textarea::placeholder { color: rgba(176,228,204,0.22); }
  .cf-textarea:focus {
    border-color: #408A71;
    background: rgba(9,20,19,0.95);
    box-shadow: 0 0 0 3px rgba(64,138,113,0.13);
  }

  /* primary button */
  .cf-btn-primary {
    background: #408A71;
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.825rem; font-weight: 800;
    border: none; border-radius: 14px;
    box-shadow: 0 6px 20px rgba(64,138,113,0.30);
    transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }
  .cf-btn-primary:hover:not(:disabled) {
    background: #4eaa85;
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(64,138,113,0.38);
  }
  .cf-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .cf-btn-primary:disabled { opacity: 0.45; cursor: not-allowed !important; }

  /* ghost button */
  .cf-btn-ghost {
    background: rgba(40,90,72,0.18);
    border: 1px solid rgba(40,90,72,0.38);
    color: rgba(176,228,204,0.55);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.825rem; font-weight: 700;
    border-radius: 14px;
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  }
  .cf-btn-ghost:hover {
    background: rgba(40,90,72,0.30);
    border-color: rgba(64,138,113,0.45);
    color: #B0E4CC;
  }

  /* success state */
  .cf-success-card {
    background: linear-gradient(145deg, rgba(13,28,25,0.95), rgba(10,21,18,0.98));
    border: 1px solid rgba(64,138,113,0.3);
    border-radius: 20px;
  }

  .cf-success-icon {
    width: 64px; height: 64px; border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(40,90,72,0.4), rgba(26,61,46,0.6));
    border: 1px solid rgba(64,138,113,0.4);
    box-shadow: 0 8px 24px rgba(64,138,113,0.2);
  }

  /* progress bar animation after success */
  @keyframes cfProgress {
    from { width: 0%; }
    to   { width: 100%; }
  }
  .cf-progress-bar {
    height: 3px; border-radius: 99px;
    background: linear-gradient(90deg, #285A48, #408A71, #B0E4CC);
    animation: cfProgress 1.4s ease-in-out forwards;
  }

  /* animate sections in */
  @keyframes cfFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cf-section { animation: cfFadeUp 0.35s cubic-bezier(.22,1,.36,1) both; }
  .cf-section:nth-child(1) { animation-delay: 0ms; }
  .cf-section:nth-child(2) { animation-delay: 60ms; }
  .cf-section:nth-child(3) { animation-delay: 120ms; }
`