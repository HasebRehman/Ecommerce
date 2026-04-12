'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, ChevronDown, Upload, X, Image as ImageIcon,
  Video, Loader2, CheckCircle, FileText, Store, Package, Trash2,
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

  // Fetch all shops on mount
  useEffect(() => {
    api.get(API.STORE.SHOPS)
      .then(res => setShops(res.data.shops ?? []))
      .catch(() => {})
      .finally(() => setLoadShops(false))
  }, [])

  // Fetch all products on mount (for when no shop selected)
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

  // When shop changes, filter products
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

  // Check for duplicate report when both shop and product are selected
  useEffect(() => {
    if (!shopId || !productId || !isAuthenticated) {
      setDuplicateCheck({ checking: false, exists: false })
      return
    }

    setDuplicateCheck({ checking: true, exists: false })
    
    // Check if user has reported this product from this store in last 24 hours
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

      if (!isImage && !isVideo) {
        errors.push(`${file.name}: unsupported file type`)
        return
      }
      if (isImage && images.length >= 3) {
        errors.push('Maximum 3 images allowed')
        return
      }
      if (isVideo && videos.length >= 1) {
        errors.push('Maximum 1 video allowed')
        return
      }

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
        if (res.data.url) {
          urls.push(res.data.url)
        }
      } catch (err: any) {
        console.error('Upload error:', err)
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

    if (duplicateCheck.exists) {
      toast.error('You already reported this product recently')
      return
    }

    setSubmitting(true)
    try {
      // Upload media files
      const media_urls = await uploadMedia(media)

      await api.post(API.REPORTS.CREATE, {
        reason,
        shop_id:    shopId,
        product_id: productId,
        message:    message.trim(),
        media_urls,
      })

      setSubmitted(true)
      toast.success('Report submitted successfully')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to submit report'
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedReason  = REASONS.find(r => r.value === reason)
  const selectedShop    = shops.find(s => s.id === shopId)
  const selectedProduct = products.find(p => p.id === productId)
  const imageCount      = media.filter(m => m.type === 'image').length
  const videoCount      = media.filter(m => m.type === 'video').length

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#091413' }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[#285A48]/30 border border-[#408A71]/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#4ade80]" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Report Submitted</h2>
          <p className="text-[#B0E4CC]/50 text-sm mb-8 leading-relaxed">
            Your report has been received. Our team will review it and take appropriate action.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/report/history">
              <button className="px-5 py-2.5 rounded-xl bg-[#285A48]/40 border border-[#408A71]/30 text-[#B0E4CC] text-sm font-semibold hover:bg-[#285A48]/60 transition-all">
                View History
              </button>
            </Link>
            <button
              onClick={() => { setSubmitted(false); setReason(''); setShopId(''); setProductId(''); setMessage(''); setMedia([]) }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg,#408A71,#285A48)', color: '#fff' }}
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: '#091413' }}>
      <style>{`
        .rp-select { position: relative; }
        .rp-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 50;
          background: #0e1e1b; border: 1px solid rgba(64,138,113,0.25);
          border-radius: 14px; overflow: hidden;
          animation: dropIn 0.15s cubic-bezier(.22,1,.36,1) both;
          max-height: 220px; overflow-y: auto;
        }
        .rp-dropdown::-webkit-scrollbar { width: 4px; }
        .rp-dropdown::-webkit-scrollbar-track { background: transparent; }
        .rp-dropdown::-webkit-scrollbar-thumb { background: rgba(64,138,113,0.3); border-radius: 4px; }
        .rp-opt { padding: 10px 14px; font-size: 14px; color: rgba(176,228,204,0.6); cursor: pointer; transition: all 0.12s; }
        .rp-opt:hover, .rp-opt.active { background: rgba(64,138,113,0.15); color: #B0E4CC; }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div className="max-w-3xl mx-auto fade-up">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h1 className="text-white text-2xl font-bold">Submit a Report</h1>
          </div>
          <p className="text-[#B0E4CC]/40 text-sm ml-13">
            Help us keep VendoSphere safe. All fields marked with <span className="text-red-400">*</span> are required.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Link href="/report/history">
              <span className="text-[#408A71] hover:text-[#B0E4CC] text-sm transition-colors cursor-pointer">
                View Report History →
              </span>
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl p-6 space-y-5" style={{ background: '#0a1714', border: '1px solid rgba(40,90,72,0.3)' }}>

          {/* Reason */}
          <div>
            <label className="block text-[#B0E4CC]/70 text-xs font-semibold uppercase tracking-wider mb-2">
              Reason <span className="text-red-400">*</span>
            </label>
            <div className="rp-select" onClick={() => { setReasonOpen(o => !o); setShopOpen(false); setProductOpen(false) }}>
              <div className={cn(
                'flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all',
                'border',
                reasonOpen ? 'border-[#408A71]/60 bg-[#0e1e1b]' : 'border-[#285A48]/40 bg-[#0d1a17]',
              )}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#408A71]" />
                  <span className={cn('text-sm', reason ? 'text-white' : 'text-[#B0E4CC]/30')}>
                    {selectedReason?.label ?? 'Select a reason'}
                  </span>
                </div>
                <ChevronDown className={cn('w-4 h-4 text-[#408A71] transition-transform', reasonOpen && 'rotate-180')} />
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
            <label className="block text-[#B0E4CC]/70 text-xs font-semibold uppercase tracking-wider mb-2">
              Store <span className="text-red-400">*</span>
            </label>
            <div className="rp-select" onClick={() => { setShopOpen(o => !o); setReasonOpen(false); setProductOpen(false) }}>
              <div className={cn(
                'flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all border',
                shopOpen ? 'border-[#408A71]/60 bg-[#0e1e1b]' : 'border-[#285A48]/40 bg-[#0d1a17]',
              )}>
                <div className="flex items-center gap-2">
                  {selectedShop?.logo_url ? (
                    <img src={selectedShop.logo_url} alt="" className="w-5 h-5 rounded-md object-cover" />
                  ) : (
                    <Store className="w-4 h-4 text-[#408A71]" />
                  )}
                  <span className={cn('text-sm', shopId ? 'text-white' : 'text-[#B0E4CC]/30')}>
                    {selectedShop?.name ?? (loadShops ? 'Loading stores...' : 'Select a store')}
                  </span>
                </div>
                <ChevronDown className={cn('w-4 h-4 text-[#408A71] transition-transform', shopOpen && 'rotate-180')} />
              </div>
              {shopOpen && (
                <div className="rp-dropdown">
                  {shops.map(s => (
                    <div
                      key={s.id}
                      className={cn('rp-opt flex items-center gap-2', shopId === s.id && 'active')}
                      onClick={e => { e.stopPropagation(); setShopId(s.id); setShopOpen(false) }}
                    >
                      {s.logo_url ? (
                        <img src={s.logo_url} alt="" className="w-5 h-5 rounded-md object-cover shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-md bg-[#285A48]/50 flex items-center justify-center text-[#408A71] text-[10px] font-bold shrink-0">
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
            <label className="block text-[#B0E4CC]/70 text-xs font-semibold uppercase tracking-wider mb-2">
              Product <span className="text-red-400">*</span>
            </label>
            <div className="rp-select" onClick={() => { setProductOpen(o => !o); setReasonOpen(false); setShopOpen(false) }}>
              <div className={cn(
                'flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all border',
                productOpen ? 'border-[#408A71]/60 bg-[#0e1e1b]' : 'border-[#285A48]/40 bg-[#0d1a17]',
              )}>
                <div className="flex items-center gap-2">
                  {selectedProduct?.images?.[0] ? (
                    <img src={selectedProduct.images[0]} alt="" className="w-5 h-5 rounded-md object-cover" />
                  ) : (
                    <Package className="w-4 h-4 text-[#408A71]" />
                  )}
                  <span className={cn('text-sm', productId ? 'text-white' : 'text-[#B0E4CC]/30')}>
                    {loadProds ? 'Loading products...' : (selectedProduct?.name ?? 'Select a product')}
                  </span>
                </div>
                <ChevronDown className={cn('w-4 h-4 text-[#408A71] transition-transform', productOpen && 'rotate-180')} />
              </div>
              {productOpen && !loadProds && (
                <div className="rp-dropdown">
                  {products.length === 0 ? (
                    <div className="rp-opt text-[#B0E4CC]/30">No products found</div>
                  ) : products.map(p => (
                    <div
                      key={p.id}
                      className={cn('rp-opt flex items-center gap-2', productId === p.id && 'active')}
                      onClick={e => { e.stopPropagation(); setProductId(p.id); setProductOpen(false) }}
                    >
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-5 h-5 rounded-md object-cover shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-md bg-[#285A48]/50 flex items-center justify-center shrink-0">
                          <Package className="w-3 h-3 text-[#408A71]" />
                        </div>
                      )}
                      <span className="truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {shopId && (
              <p className="text-[#408A71]/70 text-xs mt-1.5 ml-1">
                Showing products from selected store only
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-[#B0E4CC]/70 text-xs font-semibold uppercase tracking-wider mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#B0E4CC]/25 resize-none outline-none transition-all"
              style={{
                background: '#0d1a17',
                border: '1px solid rgba(40,90,72,0.4)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(64,138,113,0.6)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(40,90,72,0.4)'}
            />
            <p className="text-[#B0E4CC]/25 text-xs mt-1 text-right">{message.length} chars</p>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-[#B0E4CC]/70 text-xs font-semibold uppercase tracking-wider mb-2">
              Media <span className="text-[#B0E4CC]/30 font-normal normal-case">(optional)</span>
            </label>

            {/* Previews */}
            {media.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {media.map((m, i) => (
                  <div key={i} className="relative group">
                    {m.type === 'image' ? (
                      <img
                        src={m.preview}
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover border border-[#285A48]/40"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-[#285A48]/40 bg-[#0d1a17] flex flex-col items-center justify-center gap-1">
                        <Video className="w-6 h-6 text-[#408A71]" />
                        <span className="text-[#B0E4CC]/40 text-[10px]">Video</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed text-sm transition-all w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: 'rgba(64,138,113,0.35)', color: 'rgba(176,228,204,0.5)', background: 'rgba(13,26,23,0.5)' }}
            >
              <Upload className="w-4 h-4" />
              <span>
                {imageCount >= 3 && videoCount >= 1
                  ? 'Upload limit reached'
                  : 'Upload images or video'}
              </span>
            </button>
          </div>

          {/* Submit */}
          {/* Duplicate Warning */}
          {duplicateCheck.exists && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}
            >
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold text-sm">Already Reported</p>
                <p className="text-[#B0E4CC]/50 text-xs mt-1">
                  You already submitted a report for this product recently. Please wait {duplicateCheck.hoursLeft} hour(s) before submitting again.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || duplicateCheck.exists}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#408A71,#285A48)' }}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <><AlertTriangle className="w-4 h-4" /> Submit Report</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}