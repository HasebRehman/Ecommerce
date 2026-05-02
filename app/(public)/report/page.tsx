'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, ChevronDown, Upload, X,
  Video, Loader2, CheckCircle, FileText, Store, Package, ArrowRight, Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import api from '@/lib/axios'
import { API } from '@/constants/api'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const REASONS = [
  { value: 'fake_product',      label: 'Fake Product' },
  { value: 'fraud_seller',      label: 'Fraud Seller' },
  { value: 'offensive_content', label: 'Offensive Content' },
  { value: 'abuse',             label: 'Abuse' },
  { value: 'wrong_information', label: 'Wrong Information' },
  { value: 'other',             label: 'Other' },
]

interface Shop    { id: string; name: string; logo_url: string | null }
interface Product { id: string; name: string; images: string[] }
interface MediaFile { file: File; preview: string; type: 'image' | 'video'; uploading?: boolean; url?: string }

export default function ReportPage() {
  const router              = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [reason,     setReason]     = useState('')
  const [shopId,     setShopId]     = useState('')
  const [productId,  setProductId]  = useState('')
  const [message,    setMessage]    = useState('')
  const [media,      setMedia]      = useState<MediaFile[]>([])
  const [shops,      setShops]      = useState<Shop[]>([])
  const [products,   setProducts]   = useState<Product[]>([])
  const [allProducts,setAllProducts]= useState<Product[]>([])
  const [loadShops,  setLoadShops]  = useState(true)
  const [loadProds,  setLoadProds]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [duplicateCheck, setDuplicateCheck] = useState<{ checking: boolean; exists: boolean; hoursLeft?: number }>({ checking: false, exists: false })

  const [reasonOpen,  setReasonOpen]  = useState(false)
  const [shopOpen,    setShopOpen]    = useState(false)
  const [productOpen, setProductOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get(API.STORE.SHOPS)
      .then(res => setShops(res.data.shops ?? []))
      .catch(() => {})
      .finally(() => setLoadShops(false))
  }, [])

  useEffect(() => {
    api.get(API.STORE.PRODUCTS)
      .then(res => {
        const prods = (res.data.products ?? []).map((p: any) => ({
          id: p.id, name: p.name, images: p.images ?? [],
        }))
        setAllProducts(prods)
        setProducts(prods)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setProductId('')
    setDuplicateCheck({ checking: false, exists: false })
    if (!shopId) {
      setProducts(allProducts)
      return
    }
    setLoadProds(true)
    api.get(API.STORE.SHOP_PRODUCTS(shopId))
      .then(res => setProducts(res.data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoadProds(false))
  }, [shopId, allProducts])

  useEffect(() => {
    if (!shopId || !productId || !isAuthenticated) {
      setDuplicateCheck({ checking: false, exists: false })
      return
    }
    setDuplicateCheck({ checking: true, exists: false })
    const checkDuplicate = async () => {
      try {
        const res = await api.get(API.REPORTS.LIST)
        const reports = res.data.reports ?? []
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
        const existingReport = reports.find((r: any) => {
          if (r.shops?.id !== shopId || r.products?.id !== productId) return false
          const reportTime = new Date(r.created_at).getTime()
          return reportTime > twentyFourHoursAgo
        })
        if (existingReport) {
          const timeLeft = new Date(existingReport.created_at).getTime() + 24 * 60 * 60 * 1000 - Date.now()
          const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000))
          setDuplicateCheck({ checking: false, exists: true, hoursLeft })
        } else {
          setDuplicateCheck({ checking: false, exists: false })
        }
      } catch {
        setDuplicateCheck({ checking: false, exists: false })
      }
    }
    checkDuplicate()
  }, [shopId, productId, isAuthenticated])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const images = media.filter(m => m.type === 'image')
    const videos = media.filter(m => m.type === 'video')
    const errors: string[] = []
    files.forEach(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      if (!isImage && !isVideo) { errors.push(`${file.name}: unsupported file type`); return }
      if (isImage && images.length >= 3) { errors.push('Maximum 3 images allowed'); return }
      if (isVideo && videos.length >= 1) { errors.push('Maximum 1 video allowed'); return }
      const preview = URL.createObjectURL(file)
      const newFile: MediaFile = { file, preview, type: isImage ? 'image' : 'video' }
      if (isImage) images.push(newFile)
      else videos.push(newFile)
    })
    if (errors.length) toast.error(errors[0])
    setMedia([...images, ...videos])
    e.target.value = ''
  }

  const removeMedia = (idx: number) => {
    setMedia(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const uploadMedia = async (files: MediaFile[]): Promise<string[]> => {
    const urls: string[] = []
    for (const m of files) {
      try {
        const formData = new FormData()
        formData.append('file', m.file)
        const res = await api.post(API.MEDIA.UPLOAD, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        if (res.data.url) urls.push(res.data.url)
      } catch (err: any) {
        toast.error(`Failed to upload ${m.file.name}: ${err.message || 'Unknown error'}`)
      }
    }
    return urls
  }

  const handleSubmit = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (!reason)          { toast.error('Please select a reason'); return }
    if (!shopId)          { toast.error('Please select a store'); return }
    if (!productId)       { toast.error('Please select a product'); return }
    if (!message.trim())  { toast.error('Please enter a message'); return }
    if (duplicateCheck.exists) { toast.error('You already reported this product recently'); return }
    setSubmitting(true)
    try {
      const media_urls = await uploadMedia(media)
      await api.post(API.REPORTS.CREATE, {
        reason, shop_id: shopId, product_id: productId, message: message.trim(), media_urls,
      })
      setSubmitted(true)
      toast.success('Report submitted successfully')
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedReason  = REASONS.find(r => r.value === reason)
  const selectedShop    = shops.find(s => s.id === shopId)
  const selectedProduct = products.find(p => p.id === productId)
  const imageCount      = media.filter(m => m.type === 'image').length
  const videoCount      = media.filter(m => m.type === 'video').length

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: '#FAF5FF' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
          .rp-font-display { font-family: 'Montserrat', sans-serif; }
          .rp-font-body    { font-family: 'Open Sans', sans-serif; }
          @keyframes rp-fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          .rp-fade-up { animation: rp-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        `}</style>
        <div className="text-center max-w-md rp-fade-up rp-font-body">
          <div className="w-20 h-20 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/25 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#7C3AED]/15">
            <CheckCircle className="w-10 h-10 text-[#7C3AED]" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED] mb-3 px-3 py-1 rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/10 rp-font-display">
            Report Submitted
          </span>
          <h2 className="rp-font-display text-2xl sm:text-3xl font-bold text-[#1e1b4b] mt-3 mb-3">
            Thank You for Keeping Us Safe
          </h2>
          <p className="text-[#6b7280] text-sm mb-8 leading-relaxed">
            Your report has been received. Our team will review it and take appropriate action within 24 hours.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/report/history">
              <button className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-[#C4B5FD]/40 hover:border-[#7C3AED]/40 text-[#7C3AED] text-sm font-bold transition-all duration-200 shadow-lg shadow-[#7C3AED]/10 hover:shadow-xl hover:shadow-[#7C3AED]/15 cursor-pointer rp-font-display">
                View History
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <button
              onClick={() => { setSubmitted(false); setReason(''); setShopId(''); setProductId(''); setMessage(''); setMedia([]) }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black text-white transition-all duration-200 hover:scale-[1.03] shadow-xl shadow-[#7C3AED]/25 cursor-pointer rp-font-display"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Main form ── */
  return (
    <div className="min-h-screen rp-font-body rp-root" style={{ background: '#FAF5FF' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        .rp-font-display { font-family: 'Montserrat', sans-serif; }
        .rp-font-body    { font-family: 'Open Sans', sans-serif; }

        /* Default cursor for everything; only interactive elements get pointer */
        .rp-root, .rp-root * { cursor: default; }
        .rp-root button,
        .rp-root a,
        .rp-root [role="button"],
        .rp-root .rp-select-trigger,
        .rp-root .rp-opt,
        .rp-root .rp-upload-zone,
        .rp-root label[for] { cursor: pointer; }
        .rp-root input,
        .rp-root textarea { cursor: text; }
        .rp-root button:disabled,
        .rp-root .rp-upload-zone:disabled { cursor: not-allowed; }

        @keyframes rp-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rp-dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .rp-fade-up  { animation: rp-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }

        .rp-select { position: relative; }
        .rp-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 50;
          background: #ffffff;
          border: 1px solid rgba(196,181,253,0.5);
          border-radius: 14px; overflow: hidden;
          animation: rp-dropIn 0.15s cubic-bezier(.22,1,.36,1) both;
          max-height: 220px; overflow-y: auto;
          box-shadow: 0 12px 32px rgba(124,58,237,0.15);
        }
        .rp-dropdown::-webkit-scrollbar { width: 4px; }
        .rp-dropdown::-webkit-scrollbar-track { background: transparent; }
        .rp-dropdown::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 4px; }
        .rp-opt {
          padding: 10px 14px; font-size: 14px;
          color: #6b7280; cursor: pointer;
          transition: all 0.12s;
          font-family: 'Open Sans', sans-serif;
        }
        .rp-opt:hover, .rp-opt.active {
          background: rgba(124,58,237,0.08);
          color: #7C3AED;
        }

        .rp-input-field {
          width: 100%;
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 14px;
          color: #1e1b4b;
          background: white;
          border: 1px solid rgba(196,181,253,0.4);
          outline: none;
          transition: all 0.18s ease;
          font-family: 'Open Sans', sans-serif;
          box-shadow: 0 2px 8px rgba(124,58,237,0.06);
        }
        .rp-input-field::placeholder { color: #D1D5DB; }
        .rp-input-field:focus {
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08), 0 2px 8px rgba(124,58,237,0.1);
        }

        .rp-select-trigger {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 14px; cursor: pointer;
          transition: all 0.18s ease;
          background: white;
          border: 1px solid rgba(196,181,253,0.4);
          box-shadow: 0 2px 8px rgba(124,58,237,0.06);
        }
        .rp-select-trigger:hover {
          border-color: rgba(124,58,237,0.35);
          box-shadow: 0 2px 12px rgba(124,58,237,0.1);
        }
        .rp-select-trigger.open {
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08), 0 2px 8px rgba(124,58,237,0.1);
        }

        .rp-upload-zone {
          border: 2px dashed rgba(196,181,253,0.5);
          border-radius: 14px;
          background: rgba(237,233,254,0.3);
          transition: all 0.18s ease;
        }
        .rp-upload-zone:hover:not(:disabled) {
          border-color: rgba(124,58,237,0.45);
          background: rgba(237,233,254,0.5);
        }

        .rp-card {
          background: white;
          border: 1px solid rgba(196,181,253,0.35);
          border-radius: 20px;
          box-shadow: 0 12px 32px rgba(124,58,237,0.1);
        }

        .rp-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #6b7280;
          margin-bottom: 8px;
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      {/* Page wrapper with ambient blobs */}
      <div className="relative overflow-x-hidden">
        {/* Ambient blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div style={{
            position: 'absolute', top: '-10%', right: '-8%',
            width: '480px', height: '480px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,181,253,0.22) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', left: '-10%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
          }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-2xl mx-auto">

          {/* ── Page Header ── */}
          <div className="mb-8 rp-fade-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-[#7C3AED]/20"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED] px-2.5 py-0.5 rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/10 rp-font-display">
                  Safety
                </span>
              </div>
            </div>
            <h1 className="rp-font-display text-2xl sm:text-3xl font-bold text-[#1e1b4b] leading-tight mb-2">
              Submit a Report
            </h1>
            <p className="text-[#6b7280] text-sm leading-relaxed">
              Help us keep VendoSphere safe. All fields marked with{' '}
              <span className="text-red-500 font-semibold">*</span> are required.
            </p>
            <div className="mt-4">
              <Link href="/report/history">
                <button className="group inline-flex items-center gap-1.5 text-[#7C3AED] hover:text-[#6D28D9] text-sm font-bold transition-colors duration-200 cursor-pointer rp-font-display">
                  View Report History
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </Link>
            </div>
          </div>

          {/* ── Form Card ── */}
          <div className="rp-card p-6 sm:p-8 space-y-6 rp-fade-up" style={{ animationDelay: '80ms' }}>

            {/* Reason */}
            <div>
              <label className="rp-label">
                Reason <span className="text-red-500 normal-case font-bold">*</span>
              </label>
              <div className="rp-select" onClick={() => { setReasonOpen(o => !o); setShopOpen(false); setProductOpen(false) }}>
                <div className={cn('rp-select-trigger', reasonOpen && 'open')}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                    </div>
                    <span className={cn('text-sm', reason ? 'text-[#1e1b4b] font-medium' : 'text-[#D1D5DB]')}>
                      {selectedReason?.label ?? 'Select a reason'}
                    </span>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-[#7C3AED] transition-transform duration-200 shrink-0', reasonOpen && 'rotate-180')} />
                </div>
                {reasonOpen && (
                  <div className="rp-dropdown">
                    {REASONS.map(r => (
                      <div
                        key={r.value}
                        className={cn('rp-opt', reason === r.value && 'active')}
                        onClick={e => { e.stopPropagation(); setReason(r.value); setReasonOpen(false) }}
                      >
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Store */}
            <div>
              <label className="rp-label">
                Store <span className="text-red-500 normal-case font-bold">*</span>
              </label>
              <div className="rp-select" onClick={() => { setShopOpen(o => !o); setReasonOpen(false); setProductOpen(false) }}>
                <div className={cn('rp-select-trigger', shopOpen && 'open')}>
                  <div className="flex items-center gap-2.5">
                    {selectedShop?.logo_url ? (
                      <img src={selectedShop.logo_url} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                        <Store className="w-3.5 h-3.5 text-[#7C3AED]" />
                      </div>
                    )}
                    <span className={cn('text-sm', shopId ? 'text-[#1e1b4b] font-medium' : 'text-[#D1D5DB]')}>
                      {selectedShop?.name ?? (loadShops ? 'Loading stores...' : 'Select a store')}
                    </span>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-[#7C3AED] transition-transform duration-200 shrink-0', shopOpen && 'rotate-180')} />
                </div>
                {shopOpen && (
                  <div className="rp-dropdown">
                    {shops.map(s => (
                      <div
                        key={s.id}
                        className={cn('rp-opt flex items-center gap-2.5', shopId === s.id && 'active')}
                        onClick={e => { e.stopPropagation(); setShopId(s.id); setShopOpen(false) }}
                      >
                        {s.logo_url ? (
                          <img src={s.logo_url} alt="" className="w-5 h-5 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-md bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] text-[10px] font-black shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product */}
            <div>
              <label className="rp-label">
                Product <span className="text-red-500 normal-case font-bold">*</span>
              </label>
              <div className="rp-select" onClick={() => { setProductOpen(o => !o); setReasonOpen(false); setShopOpen(false) }}>
                <div className={cn('rp-select-trigger', productOpen && 'open')}>
                  <div className="flex items-center gap-2.5">
                    {selectedProduct?.images?.[0] ? (
                      <img src={selectedProduct.images[0]} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5 text-[#7C3AED]" />
                      </div>
                    )}
                    <span className={cn('text-sm', productId ? 'text-[#1e1b4b] font-medium' : 'text-[#D1D5DB]')}>
                      {loadProds ? 'Loading products...' : (selectedProduct?.name ?? 'Select a product')}
                    </span>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-[#7C3AED] transition-transform duration-200 shrink-0', productOpen && 'rotate-180')} />
                </div>
                {productOpen && !loadProds && (
                  <div className="rp-dropdown">
                    {products.length === 0 ? (
                      <div className="rp-opt text-[#D1D5DB]">No products found</div>
                    ) : products.map(p => (
                      <div
                        key={p.id}
                        className={cn('rp-opt flex items-center gap-2.5', productId === p.id && 'active')}
                        onClick={e => { e.stopPropagation(); setProductId(p.id); setProductOpen(false) }}
                      >
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-5 h-5 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-md bg-[#EDE9FE] flex items-center justify-center shrink-0">
                            <Package className="w-3 h-3 text-[#7C3AED]" />
                          </div>
                        )}
                        <span className="truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {shopId && (
                <p className="text-[#7C3AED]/60 text-xs mt-1.5 ml-1 rp-font-display font-semibold">
                  Showing products from selected store only
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="rp-label">
                Message <span className="text-red-500 normal-case font-bold">*</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="rp-input-field resize-none"
              />
              <p className="text-[#9CA3AF] text-xs mt-1.5 text-right rp-font-display">{message.length} chars</p>
            </div>

            {/* Media Upload */}
            <div>
              <label className="rp-label">
                Media{' '}
                <span className="text-[#9CA3AF] font-normal normal-case tracking-normal" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  (optional — up to 3 images &amp; 1 video)
                </span>
              </label>

              {media.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {media.map((m, i) => (
                    <div key={i} className="relative group">
                      {m.type === 'image' ? (
                        <img
                          src={m.preview}
                          alt=""
                          className="w-20 h-20 rounded-xl object-cover border border-[#C4B5FD]/40 shadow-md shadow-[#7C3AED]/10"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl border border-[#C4B5FD]/40 bg-[#EDE9FE] flex flex-col items-center justify-center gap-1 shadow-md shadow-[#7C3AED]/10">
                          <Video className="w-6 h-6 text-[#7C3AED]" />
                          <span className="text-[#7C3AED]/60 text-[10px] font-semibold rp-font-display">Video</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageCount >= 3 && videoCount >= 1}
                className="rp-upload-zone flex items-center gap-2.5 px-4 py-4 text-sm w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div className="text-left">
                  <p className="text-[#7C3AED] font-bold text-sm rp-font-display">
                    {imageCount >= 3 && videoCount >= 1 ? 'Upload limit reached' : 'Upload images or video'}
                  </p>
                  <p className="text-[#9CA3AF] text-xs mt-0.5">
                    {imageCount >= 3 && videoCount >= 1
                      ? 'Remove a file to upload more'
                      : `${3 - imageCount} image${3 - imageCount !== 1 ? 's' : ''} and ${1 - videoCount} video remaining`}
                  </p>
                </div>
              </button>
            </div>

            {/* Duplicate Warning */}
            {duplicateCheck.exists && (
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-600 font-bold text-sm rp-font-display">Already Reported</p>
                  <p className="text-red-500/70 text-xs mt-1 leading-relaxed">
                    You already submitted a report for this product recently. Please wait{' '}
                    <span className="font-semibold">{duplicateCheck.hoursLeft} hour(s)</span> before submitting again.
                  </p>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-[#C4B5FD]/20" />

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || duplicateCheck.exists}
              className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] shadow-xl shadow-[#7C3AED]/25 cursor-pointer rp-font-display"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Report...</>
              ) : (
                <><Shield className="w-4 h-4" /> Submit Report</>
              )}
            </button>

            <p className="text-center text-[#9CA3AF] text-xs leading-relaxed">
              Reports are reviewed by our safety team within 24 hours. False reports may result in account restrictions.
            </p>
          </div>
          </div>{/* end max-w-2xl centering wrapper */}
        </div>
      </div>
    </div>
  )
}
