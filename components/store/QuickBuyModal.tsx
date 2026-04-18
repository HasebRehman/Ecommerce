'use client'

import { useState } from 'react'
import { X, Loader2, Zap, CreditCard, Banknote, Smartphone, FileText, Tag, Truck, ShoppingBag } from 'lucide-react'
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
      <div className="qb-root fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6">

        {/* Blurred backdrop */}
        <div
          className="qb-backdrop absolute inset-0"
          onClick={onClose}
        />

        {/* Modal panel — fixed size, no scroll needed */}
        <div className="qb-panel relative w-full max-w-2xl mt-8">

          {/* ── Header ── */}
          <div className="qb-header flex items-center justify-between px-4 sm:px-6 py-4 cursor-default">
            <div className="flex items-center gap-3">
              <div className="qb-icon-tile">
                <Zap className="w-4 h-4" style={{ color: '#C4B5FD' }} />
              </div>
              <div>
                <h2 className="font-display text-[#1e1b4b] font-bold text-base sm:text-lg tracking-tight">Quick Buy</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">
                  Fast checkout
                </p>
              </div>
            </div>
            <button onClick={onClose} className="qb-close-btn">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="qb-divider" />

          {/* ── Body — responsive grid ── */}
          <div className="px-4 sm:px-6 py-5 max-h-[calc(100dvh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* ── LEFT column: product + address ── */}
              <div className="space-y-4">

                {/* Product preview */}
                <div className="qb-product-row flex items-center gap-3 p-4">
                  <div className="qb-product-img shrink-0">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center bg-[#EDE9FE]">
                          <Tag className="w-5 h-5 text-[#7C3AED]" />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[#1e1b4b] text-sm font-semibold line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="font-black text-base text-[#7C3AED]">
                        Rs. {price.toLocaleString()}
                      </span>
                      {product.discount_price && (
                        <>
                          <span className="text-xs line-through text-[#9CA3AF]">
                            Rs. {product.price.toLocaleString()}
                          </span>
                          <DiscountBadge price={product.price} discountPrice={product.discount_price} />
                        </>
                      )}
                    </div>
                    {product.shop && (
                      <p className="text-[10px] font-bold uppercase tracking-wider mt-1 text-[#6D28D9]">
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
                      <CreditCard className="w-4 h-4" style={{ color: '#C4B5FD' }} />
                    </div>
                    <p className="font-display text-[#1e1b4b] font-bold text-sm">Payment Method</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map(pm => {
                      const active = paymentMethod === pm.value
                      const Icon   = pm.icon
                      return (
                        <div
                          key={pm.value}
                          onClick={() => setPaymentMethod(pm.value)}
                          className="qb-payment-option flex items-center gap-2 p-2.5 rounded-xl transition-all"
                          style={{
                            background:  active ? 'rgba(124,58,237,0.12)' : 'rgba(237,233,254,0.5)',
                            border:      active ? '1.5px solid #7C3AED' : '1px solid rgba(124,58,237,0.2)',
                            boxShadow:   active ? '0 0 0 2px rgba(124,58,237,0.1)' : 'none',
                          }}
                        >
                          {/* Radio */}
                          <div className="shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all"
                            style={{
                              borderColor: active ? '#7C3AED' : '#C4B5FD',
                              background:  active ? '#7C3AED' : 'transparent',
                              boxShadow:   active ? '0 0 6px rgba(124,58,237,0.4)' : 'none',
                            }}>
                            {active && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                          </div>
                          {/* Icon */}
                          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                            style={{
                              background: active ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)',
                              border: '1px solid rgba(124,58,237,0.2)',
                            }}>
                            <Icon className="w-3 h-3" style={{ color: active ? '#7C3AED' : '#9CA3AF' }} />
                          </div>
                          <span className="text-xs font-semibold leading-tight font-body"
                            style={{ color: active ? '#1e1b4b' : '#6B7280' }}>
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
                      <FileText className="w-4 h-4" style={{ color: '#C4B5FD' }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-[#1e1b4b] font-bold text-sm">Notes</p>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(124,58,237,0.1)',
                          border: '1px solid rgba(124,58,237,0.2)',
                          color: '#7C3AED',
                        }}>
                        optional
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Special instructions…"
                    rows={2}
                    className="qb-textarea w-full resize-none"
                  />
                </div>

                {/* Spacer pushes total+btn to bottom */}
                <div className="flex-1" />

                {/* Order total row */}
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(124,58,237,0.08)',
                    border: '1px solid rgba(124,58,237,0.2)',
                  }}>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 shrink-0 text-[#7C3AED]" />
                    <span className="text-sm font-semibold font-body text-[#6B7280]">
                      Total (free delivery)
                    </span>
                  </div>
                  <span className="font-black text-base text-[#7C3AED]">
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
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');

  .qb-root * { box-sizing: border-box; }
  .qb-root { font-family: 'Open Sans', sans-serif; cursor: default; }
  .qb-root button, .qb-root a { cursor: pointer; }
  .font-display { font-family: 'Montserrat', sans-serif; }
  .font-body { font-family: 'Open Sans', sans-serif; }

  /* ── backdrop ── */
  .qb-backdrop {
    background: rgba(124,58,237,0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  /* ── panel ── */
  @keyframes qbSlideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  .qb-panel {
    background: linear-gradient(135deg, #FAF5FF 0%, #F3EEFF 100%);
    border: 1.5px solid rgba(196,181,253,0.4);
    border-radius: 28px;
    box-shadow: 0 32px 80px rgba(124,58,237,0.2), 0 0 0 1px rgba(124,58,237,0.1);
    animation: qbSlideUp 0.28s cubic-bezier(.22,1,.36,1) both;
    max-height: calc(100dvh - 48px);
    display: flex;
    flex-direction: column;
  }

  /* ── header ── */
  .qb-header {
    background: linear-gradient(135deg, rgba(237,233,254,0.8), rgba(250,245,255,0.6));
    border-bottom: 1px solid rgba(196,181,253,0.3);
    border-radius: 28px 28px 0 0;
    flex-shrink: 0;
    cursor: default;
  }

  /* ── icon tile ── */
  .qb-icon-tile {
    width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #EDE9FE, #F3EEFF);
    border: 1.5px solid rgba(124,58,237,0.3);
  }

  /* ── close btn ── */
  .qb-close-btn {
    width: 36px; height: 36px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.2);
    color: #7C3AED;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .qb-close-btn:hover { background: rgba(124,58,237,0.15); color: #6D28D9; }

  /* ── gradient divider ── */
  .qb-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent);
    flex-shrink: 0;
  }

  /* ── product preview row ── */
  .qb-product-row {
    background: white;
    border: 1px solid rgba(196,181,253,0.3);
    border-radius: 18px;
    box-shadow: 0 4px 12px rgba(124,58,237,0.08);
  }
  .qb-product-img {
    width: 70px; height: 70px; border-radius: 14px; overflow: hidden;
    border: 1px solid rgba(196,181,253,0.3);
  }

  /* ── address / notes section wrapper ── */
  .qb-section {
    background: white;
    border: 1px solid rgba(196,181,253,0.3);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(124,58,237,0.06);
  }

  /* ── payment option hover ── */
  .qb-payment-option { cursor: pointer; }
  .qb-payment-option:hover { 
    border-color: rgba(124,58,237,0.4) !important;
    background: rgba(124,58,237,0.08) !important;
  }

  /* ── textarea ── */
  .qb-textarea {
    background: white;
    border: 1px solid rgba(196,181,253,0.3);
    border-radius: 12px;
    padding: 0.7rem 0.9rem;
    color: #1e1b4b;
    font-size: 0.875rem;
    font-family: 'Open Sans', sans-serif;
    outline: none; caret-color: #7C3AED;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .qb-textarea::placeholder { color: #D1D5DB; }
  .qb-textarea:focus {
    border-color: #7C3AED;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  }

  /* ── place order button ── */
  .qb-btn-order {
    width: 100%; height: 48px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.95rem; font-weight: 700;
    border: none; border-radius: 14px;
    box-shadow: 0 8px 24px rgba(124,58,237,0.3);
    transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.2s ease, opacity 0.18s ease;
    flex-shrink: 0;
    cursor: pointer;
  }
  .qb-btn-order:hover:not(:disabled) {
    background: linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(124,58,237,0.4);
  }
  .qb-btn-order:active:not(:disabled) { transform: translateY(0); }
  .qb-btn-order:disabled { opacity: 0.5; cursor: not-allowed !important; }

  /* ── scrollbar ── */
  .qb-panel { scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.3) transparent; }
  .qb-panel::-webkit-scrollbar { width: 6px; }
  .qb-panel::-webkit-scrollbar-track { background: transparent; }
  .qb-panel::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 99px; }
  .qb-panel::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.5); }

  /* ── Responsive adjustments ── */
  @media (max-width: 640px) {
    .qb-panel {
      max-width: calc(100vw - 24px);
      border-radius: 24px;
    }
    .qb-header {
      padding: 14px 16px !important;
      border-radius: 24px 24px 0 0;
    }
    .qb-icon-tile {
      width: 28px;
      height: 28px;
    }
    .qb-product-img {
      width: 60px;
      height: 60px;
    }
  }

  @media (max-width: 480px) {
    .qb-panel {
      max-width: calc(100vw - 16px);
    }
    .qb-header {
      padding: 12px 14px !important;
    }
  }
`
