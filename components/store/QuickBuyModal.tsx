'use client'

import { useState } from 'react'
import { X, Loader2, Zap, CreditCard, Banknote, Smartphone, FileText, Tag, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { orderService } from '@/lib/services/order.service'
import DiscountBadge from '@/components/dashboard/business/inventory/DiscountBadge'
import AddressSelector from './AddressSelector'
import { cn } from '@/lib/utils'

interface Product {
  id:             string
  name:           string
  price:          number
  discount_price: number | null
  images:         string[]
  shop:           { id: string; name: string } | null
}

interface Props {
  product:   Product
  onClose:   () => void
  onSuccess: () => void
}

const PAYMENT_METHODS = [
  { value: 'cod',           label: 'Cash on Delivery', icon: Banknote   },
  { value: 'bank_transfer', label: 'Bank Transfer',    icon: CreditCard },
  { value: 'easypaisa',     label: 'EasyPaisa',        icon: Smartphone },
  { value: 'jazzcash',      label: 'JazzCash',         icon: Smartphone },
]

export default function QuickBuyModal({ product, onClose, onSuccess }: Props) {
  const router = useRouter()

  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [paymentMethod,   setPaymentMethod]   = useState('cod')
  const [notes,           setNotes]           = useState('')
  const [loading,         setLoading]         = useState(false)

  /* ── logic completely unchanged ── */
  const price = product.discount_price ?? product.price

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address')
      return
    }
    setLoading(true)
    try {
      await orderService.placeOrder({
        items: [{
          product_id: product.id,
          quantity:   1,
          price,
          shop_id:    product.shop?.id ?? null,
        }],
        delivery_address: {
          full_name: selectedAddress.full_name,
          phone:     selectedAddress.phone,
          address:   selectedAddress.address,
          city:      selectedAddress.city,
        },
        payment_method: paymentMethod,
        notes:          notes || undefined,
      })
      toast.success('Order placed successfully! 🎉')
      onSuccess()
      onClose()
      router.push('/orders')
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>

      {/* ── Backdrop ── */}
      <div className="qb-root fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">

        {/* Blurred backdrop */}
        <div
          className="qb-backdrop absolute inset-0"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="qb-panel relative w-full max-w-6xl overflow-y-auto">

          {/* ── Sticky header ── */}
          <div className="mt-10 qb-header sticky top-0 z-10 flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="qb-icon-tile">
                <Zap className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} />
              </div>
              <div>
                <h2 className="text-white font-black text-sm tracking-tight">Quick Buy</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(176,228,204,0.38)' }}>
                  Fast checkout
                </p>
              </div>
            </div>
            <button onClick={onClose} className="qb-close-btn">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="qb-divider" />

          {/* ── Body — two-column on md+, stacked on mobile ── */}
          <div className="px-5 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* ── LEFT column: product + address ── */}
              <div className="space-y-4">

                {/* Product preview */}
                <div className="qb-product-row flex items-center gap-3 p-3.5">
                  <div className="qb-product-img shrink-0">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"
                          style={{ background: '#162420' }}>
                          <Tag className="w-5 h-5" style={{ color: '#285A48' }} />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="font-black text-sm" style={{ color: '#B0E4CC' }}>
                        Rs. {price.toLocaleString()}
                      </span>
                      {product.discount_price && (
                        <>
                          <span className="text-xs line-through" style={{ color: 'rgba(176,228,204,0.28)' }}>
                            Rs. {product.price.toLocaleString()}
                          </span>
                          <DiscountBadge price={product.price} discountPrice={product.discount_price} />
                        </>
                      )}
                    </div>
                    {product.shop && (
                      <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: '#408A71' }}>
                        {product.shop.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address selector */}
                <div className="qb-section">
                  <AddressSelector
                    selected={selectedAddress}
                    onSelect={setSelectedAddress}
                  />
                </div>
              </div>

              {/* ── RIGHT column: payment + notes + CTA ── */}
              <div className="space-y-4 flex flex-col">

                {/* Payment method */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="qb-icon-tile">
                      <CreditCard className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} />
                    </div>
                    <p className="text-white font-bold text-sm">Payment Method</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map(pm => {
                      const active = paymentMethod === pm.value
                      const Icon   = pm.icon
                      return (
                        <div
                          key={pm.value}
                          onClick={() => setPaymentMethod(pm.value)}
                          className="qb-payment-option flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
                          style={{
                            background:  active ? 'rgba(40,90,72,0.30)' : 'rgba(13,28,25,0.7)',
                            border:      active ? '1px solid rgba(64,138,113,0.6)' : '1px solid rgba(40,90,72,0.22)',
                            boxShadow:   active ? '0 0 0 1px rgba(64,138,113,0.12)' : 'none',
                          }}
                        >
                          {/* Radio */}
                          <div className="shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all"
                            style={{
                              borderColor: active ? '#408A71' : 'rgba(40,90,72,0.5)',
                              background:  active ? '#408A71' : 'transparent',
                              boxShadow:   active ? '0 0 5px rgba(64,138,113,0.4)' : 'none',
                            }}>
                            {active && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                          </div>
                          {/* Icon */}
                          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                            style={{
                              background: active ? 'rgba(64,138,113,0.22)' : 'rgba(40,90,72,0.18)',
                              border: '1px solid rgba(40,90,72,0.28)',
                            }}>
                            <Icon className="w-3 h-3" style={{ color: active ? '#B0E4CC' : 'rgba(176,228,204,0.4)' }} />
                          </div>
                          <span className="text-xs font-semibold leading-tight"
                            style={{ color: active ? '#B0E4CC' : 'rgba(176,228,204,0.48)' }}>
                            {pm.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="qb-icon-tile">
                      <FileText className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-sm">Notes</p>
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(40,90,72,0.2)',
                          border: '1px solid rgba(40,90,72,0.3)',
                          color: 'rgba(176,228,204,0.38)',
                        }}>
                        optional
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Special instructions…"
                    rows={3}
                    className="qb-textarea w-full resize-none"
                  />
                </div>

                {/* Spacer pushes total+btn to bottom on desktop */}
                <div className="flex-1" />

                {/* Order total row */}
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(40,90,72,0.12)',
                    border: '1px solid rgba(40,90,72,0.28)',
                  }}>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 shrink-0" style={{ color: '#408A71' }} />
                    <span className="text-sm font-semibold" style={{ color: 'rgba(176,228,204,0.55)' }}>
                      Total (free delivery)
                    </span>
                  </div>
                  <span className="font-black text-base" style={{ color: '#B0E4CC' }}>
                    Rs. {price.toLocaleString()}
                  </span>
                </div>

                {/* Place order button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddress}
                  className="qb-btn-order"
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <>
                        <Zap className="w-4 h-4 shrink-0" />
                        Place Order · Rs. {price.toLocaleString()}
                      </>
                  }
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .qb-root * { box-sizing: border-box; }
  .qb-root, .qb-root button, .qb-root a { cursor: pointer !important; }
  .qb-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── backdrop ── */
  .qb-backdrop {
    background: rgba(9,20,19,0.82);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  /* ensure the root wrapper covers the full real viewport */
  .qb-root {
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
  }

  /* ── panel ── */
  @keyframes qbSlideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  .qb-panel {
    background: linear-gradient(165deg, rgba(13,28,25,0.98), rgba(9,20,19,1));
    border: 1px solid rgba(40,90,72,0.38);
    border-radius: 24px;
    box-shadow: 0 32px 72px rgba(9,20,19,0.85), 0 0 0 1px rgba(64,138,113,0.10);
    animation: qbSlideUp 0.28s cubic-bezier(.22,1,.36,1) both;
    max-height: calc(100dvh - 48px);
  }
  /* fallback for browsers that don't support dvh */
  @supports not (height: 100dvh) {
    .qb-panel { max-height: calc(100vh - 48px); }
  }

  /* ── header ── */
  .qb-header {
    background: linear-gradient(135deg, rgba(22,36,32,0.7), rgba(13,28,25,0.5));
    border-radius: 24px 24px 0 0;
  }

  /* ── icon tile ── */
  .qb-icon-tile {
    width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #285A48, #1a3d2e);
    border: 1px solid rgba(64,138,113,0.35);
  }

  /* ── close btn ── */
  .qb-close-btn {
    width: 30px; height: 30px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(40,90,72,0.18);
    border: 1px solid rgba(40,90,72,0.32);
    color: rgba(176,228,204,0.45);
    transition: background 0.15s ease, color 0.15s ease;
  }
  .qb-close-btn:hover { background: rgba(40,90,72,0.32); color: #B0E4CC; }

  /* ── gradient divider ── */
  .qb-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(40,90,72,0.4), transparent);
  }

  /* ── product preview row ── */
  .qb-product-row {
    background: rgba(22,36,32,0.6);
    border: 1px solid rgba(40,90,72,0.28);
    border-radius: 16px;
  }
  .qb-product-img {
    width: 60px; height: 60px; border-radius: 12px; overflow: hidden;
    border: 1px solid rgba(40,90,72,0.35);
  }

  /* ── address / notes section wrapper ── */
  .qb-section {
    background: rgba(9,20,19,0.7);
    border: 1px solid rgba(40,90,72,0.28);
    border-radius: 16px;
    padding: 14px;
  }

  /* ── payment option hover ── */
  .qb-payment-option { cursor: pointer !important; }
  .qb-payment-option:hover { border-color: rgba(64,138,113,0.38) !important; }

  /* ── textarea ── */
  .qb-textarea {
    background: rgba(9,20,19,0.7);
    border: 1px solid rgba(40,90,72,0.35);
    border-radius: 12px;
    padding: 0.6rem 0.85rem;
    color: #B0E4CC;
    font-size: 0.825rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; caret-color: #408A71;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .qb-textarea::placeholder { color: rgba(176,228,204,0.20); }
  .qb-textarea:focus {
    border-color: #408A71;
    box-shadow: 0 0 0 3px rgba(64,138,113,0.12);
  }

  /* ── place order button ── */
  .qb-btn-order {
    width: 100%; height: 50px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #408A71; color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem; font-weight: 900;
    border: none; border-radius: 16px;
    box-shadow: 0 6px 22px rgba(64,138,113,0.35);
    transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.2s ease, opacity 0.18s ease;
  }
  .qb-btn-order:hover:not(:disabled) {
    background: #4eaa85;
    transform: translateY(-1px);
    box-shadow: 0 10px 30px rgba(64,138,113,0.45);
  }
  .qb-btn-order:active:not(:disabled) { transform: translateY(0); }
  .qb-btn-order:disabled { opacity: 0.40; cursor: not-allowed !important; }

  /* ── scrollbar ── */
  .qb-panel { scrollbar-width: thin; scrollbar-color: rgba(40,90,72,0.4) transparent; }
  .qb-panel::-webkit-scrollbar { width: 4px; }
  .qb-panel::-webkit-scrollbar-track { background: transparent; }
  .qb-panel::-webkit-scrollbar-thumb { background: rgba(40,90,72,0.4); border-radius: 99px; }
`