'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft, Store } from 'lucide-react'
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/shops">
          <button
            type="button"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create New Shop' : 'Edit Shop'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {mode === 'create'
              ? 'Set up your shop details'
              : 'Update your shop information'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — main info */}
        <div className="lg:col-span-2 space-y-6">

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-400" />
                Shop Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-2">
                <Label className="text-slate-200">
                  Shop Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  placeholder="e.g. Hassan's Clothing Store"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  {...register('name', { required: 'Shop name is required' })}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Description</Label>
                <Textarea
                  placeholder="Tell customers what your shop sells..."
                  rows={4}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                  {...register('description')}
                />
              </div>

            </CardContent>
          </Card>

          {/* Banner */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Shop Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-xs mb-3">
                Recommended size: 1200×300px — shown at top of your shop page
              </p>
              <MediaUpload images={banner} onChange={setBanner} maxImages={1} />
            </CardContent>
          </Card>

        </div>

        {/* Right — logo + submit */}
        <div className="space-y-6">

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Shop Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-xs mb-3">
                Square image recommended — 300×300px
              </p>
              <MediaUpload images={logo} onChange={setLogo} maxImages={1} />
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white h-11"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create Shop' : 'Save Changes'}
              </>
            )}
          </Button>

        </div>
      </div>

    </form>
  )
}