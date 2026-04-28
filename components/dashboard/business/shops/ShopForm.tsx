'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft, Store, Sparkles } from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { shopService } from '@/lib/services/shop.service'
import MediaUpload from '@/components/dashboard/business/inventory/MediaUpload'
import Link from 'next/link'

interface FormData {
  name:        string
  description: string
}

interface Props {
  initialData?:  any
  shopId?:       string
  mode?:         'create' | 'edit'
  onSubmit?:     (data: any) => Promise<void>
  isSubmitting?: boolean
}

export default function ShopForm({
  initialData,
  shopId,
  mode = 'create',
  onSubmit: externalOnSubmit,
  isSubmitting = false,
}: Props) {
  const router = useRouter()

  const [isLoading, setLoading] = useState(false)
  const [logo,      setLogo]    = useState<string[]>(
    initialData?.logo_url   ? [initialData.logo_url]   : []
  )
  const [banner,    setBanner]  = useState<string[]>(
    initialData?.banner_url ? [initialData.banner_url] : []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name:        initialData?.name        ?? '',
      description: initialData?.description ?? '',
    },
  })

  const loading = isLoading || isSubmitting

  const onSubmit = async (data: FormData) => {
    const payload = {
      name:        data.name,
      description: data.description || undefined,
      logo_url:    logo[0]   ?? undefined,
      banner_url:  banner[0] ?? undefined,
    }

    // ── If external onSubmit provided (edit page) — use it ──
    if (externalOnSubmit) {
      try {
        await externalOnSubmit(payload)
      } catch (err: any) {
        toast.error(err.message || 'Something went wrong')
      }
      return
    }

    // ── Otherwise handle internally (create / edit with shopId) ──
    setLoading(true)
    try {
      if (mode === 'create') {
        const result = await shopService.createShop(payload)
        toast.success('Shop created! Now add products to it.')
        router.push(`/dashboard/shops/${result.shop.id}`)
      } else {
        if (!shopId) {
          toast.error('Shop ID missing')
          return
        }
        await shopService.updateShop(shopId, payload)
        toast.success('Shop updated successfully!')
        router.push(`/dashboard/shops/${shopId}`)
      }
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen" style={{ background: '#FAF5FF', fontFamily: "'Open Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        
        .sf-header { font-family: 'Montserrat', sans-serif; }
        .sf-body { font-family: 'Open Sans', sans-serif; }
        
        .sf-card {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(196,181,253,0.4);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.12), 0 2px 8px rgba(124,58,237,0.08);
          transition: all 0.3s ease;
        }
        .sf-card:hover {
          border-color: rgba(124,58,237,0.6);
          box-shadow: 0 12px 48px rgba(124,58,237,0.18), 0 4px 12px rgba(124,58,237,0.12);
        }
        
        .sf-input {
          background: rgba(255,255,255,0.6);
          border: 1.5px solid rgba(196,181,253,0.3);
          border-radius: 12px;
          color: #1e1b4b;
          font-family: 'Open Sans', sans-serif;
          transition: all 0.2s ease;
        }
        .sf-input::placeholder { color: rgba(107,114,128,0.5); }
        .sf-input:focus {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
          background: rgba(255,255,255,0.9);
        }
        
        .sf-label {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          color: #1e1b4b;
          font-size: 0.95rem;
        }
        
        .sf-btn-back {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.2);
          color: #7C3AED;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .sf-btn-back:hover {
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.4);
        }
        
        .sf-btn-submit {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          border: none;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          border-radius: 14px;
          height: 48px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(124,58,237,0.3);
        }
        .sf-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124,58,237,0.4);
        }
        .sf-btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .sf-error {
          color: #dc2626;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .sf-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 8px;
          color: #7C3AED;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .sf-section-title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          color: #1e1b4b;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .sf-hint {
          color: rgba(107,114,128,0.7);
          font-size: 0.85rem;
          font-weight: 500;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white/60 border-b border-[#C4B5FD]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/shops">
              <button type="button" className="sf-btn-back">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="sf-header text-3xl sm:text-4xl font-bold text-[#1e1b4b]">
                {mode === 'create' ? 'Create Your Shop' : 'Edit Shop'}
              </h1>
              <p className="sf-body text-[#6b7280] text-sm mt-1">
                {mode === 'create'
                  ? 'Set up your shop and start selling today'
                  : 'Update your shop information'
                }
              </p>
            </div>
            {mode === 'create' && (
              <div className="sf-badge hidden sm:flex">
                <Sparkles className="w-4 h-4" />
                New Shop
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Left — Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Shop Information Card */}
            <div className="sf-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-12 bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <h2 className="sf-section-title">Shop Information</h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="sf-label">
                    Shop Name <span className="text-[#dc2626]">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Hassan's Clothing Store"
                    className="sf-input"
                    {...register('name', { required: 'Shop name is required' })}
                  />
                  {errors.name && (
                    <p className="sf-error">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="sf-label">Description</Label>
                  <Textarea
                    placeholder="Tell customers what your shop sells, your specialties, and what makes you unique..."
                    rows={5}
                    className="sf-input resize-none"
                    {...register('description')}
                  />
                  <p className="sf-hint">Write a compelling description to attract more customers</p>
                </div>
              </div>
            </div>

            {/* Banner Card */}
            <div className="sf-card p-6 sm:p-8">
              <h2 className="sf-section-title mb-1">Shop Banner</h2>
              <p className="sf-hint mb-4">
                Recommended size: 1200×300px — displayed at the top of your shop page
              </p>
              <div className="rounded-16 overflow-hidden border-2 border-dashed border-[#C4B5FD]/40 bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE]">
                <MediaUpload images={banner} onChange={setBanner} maxImages={1} />
              </div>
            </div>

          </div>

          {/* Right — Logo + Submit */}
          <div className="space-y-6">

            {/* Logo Card */}
            <div className="sf-card p-6 sm:p-8">
              <h2 className="sf-section-title mb-1">Shop Logo</h2>
              <p className="sf-hint mb-4">
                Square image recommended — 300×300px
              </p>
              <div className="rounded-16 overflow-hidden border-2 border-dashed border-[#C4B5FD]/40 bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE]">
                <MediaUpload images={logo} onChange={setLogo} maxImages={1} />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="sf-btn-submit w-full flex items-center justify-center gap-2 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {mode === 'create' ? 'Create Shop' : 'Save Changes'}
                </>
              )}
            </button>

            {/* Info Box */}
            <div className="sf-card p-4 bg-gradient-to-br from-[#F3E8FF] to-[#EDE9FE] border-[#C4B5FD]/30">
              <p className="sf-body text-sm text-[#6b7280]">
                <span className="font-semibold text-[#7C3AED]">💡 Tip:</span> You can add products to your shop after creation.
              </p>
            </div>

          </div>

        </div>
      </div>
    </form>
  )
}