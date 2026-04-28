'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { Button }       from '@/components/ui/button'
import { Input }        from '@/components/ui/input'
import { Label }        from '@/components/ui/label'
import { Textarea }     from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { productService } from '@/lib/services/product.service'
import MediaUpload    from './MediaUpload'
import CategorySelect from './CategorySelect'
import VariantsInput  from './VariantsInput'
import DiscountBadge  from './DiscountBadge'
import Link from 'next/link'

interface FormData {
  name:           string
  description:    string
  price:          string
  discount_price: string
  stock:          string
  sku:            string
}

interface Props {
  initialData?:  any
  productId?:    string
  mode?:         'create' | 'edit'
  onSubmit?:     (data: any) => Promise<void>
  isSubmitting?: boolean
}

export default function ProductForm({
  initialData,
  productId,
  mode = 'create',
  onSubmit: externalOnSubmit,
  isSubmitting = false,
}: Props) {
  const router = useRouter()

  const [isLoading,  setLoading]     = useState(false)
  const [images,     setImages]      = useState<string[]>(initialData?.images      ?? [])
  const [categoryId, setCategoryId]  = useState<string>(initialData?.category_id  ?? '')
  const [sizes,      setSizes]       = useState<string[]>(initialData?.sizes       ?? [])
  const [colors,     setColors]      = useState<string[]>(initialData?.colors      ?? [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name:           initialData?.name                    ?? '',
      description:    initialData?.description             ?? '',
      price:          initialData?.price?.toString()       ?? '',
      discount_price: initialData?.discount_price?.toString() ?? '',
      stock:          initialData?.stock?.toString()       ?? '0',
      sku:            initialData?.sku                     ?? '',
    },
  })

  const price         = parseFloat(watch('price')          || '0')
  const discountPrice = parseFloat(watch('discount_price') || '0')

  const loading = isLoading || isSubmitting

  const onSubmit = async (data: FormData) => {
    if (images.length === 0) {
      toast.error('Please upload at least one product image')
      return
    }

    const payload = {
      name:           data.name,
      description:    data.description   || undefined,
      price:          parseFloat(data.price),
      discount_price: data.discount_price ? parseFloat(data.discount_price) : undefined,
      stock:          parseInt(data.stock) || 0,
      sku:            data.sku            || undefined,
      images,
      category_id:    categoryId          || undefined,
      sizes,
      colors,
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

    // ── Otherwise handle internally (create/edit with productId) ──
    setLoading(true)
    try {
      if (mode === 'create') {
        await productService.createProduct(payload)
        toast.success('Product created successfully!')
        router.push('/dashboard/inventory')
      } else {
        if (!productId) {
          toast.error('Product ID missing')
          return
        }
        await productService.updateProduct(productId, payload)
        toast.success('Product updated successfully!')
        router.push('/dashboard/inventory')
      }
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      // background: '#ffffff', 
      fontFamily: "'Open Sans', sans-serif", 
      minHeight: 'calc(100vh - 120px)',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        .pf-header { font-family: 'Montserrat', sans-serif; }
        .pf-body { font-family: 'Open Sans', sans-serif; }
        
        .pf-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid rgba(196,181,253,0.3);
          border-radius: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(124,58,237,0.15), 0 4px 12px rgba(124,58,237,0.08), 0 2px 6px rgba(0,0,0,0.05);
          margin-bottom: 24px;
          overflow: hidden;
        }
        
        .pf-card:hover {
          border-color: rgba(124,58,237,0.4);
          box-shadow: 0 12px 35px rgba(124,58,237,0.2), 0 8px 20px rgba(124,58,237,0.12), 0 4px 10px rgba(0,0,0,0.08);
        }
        
        .pf-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid rgba(196,181,253,0.3);
          border-radius: 12px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #1e1b4b;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(124,58,237,0.05);
        }
        
        .pf-input:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 4px 16px rgba(124,58,237,0.15), 0 0 0 4px rgba(124,58,237,0.1);
        }
        
        .pf-input::placeholder {
          color: #9ca3af;
        }
        
        .pf-textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid rgba(196,181,253,0.3);
          border-radius: 12px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #1e1b4b;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(124,58,237,0.05);
          resize: none;
          min-height: 100px;
        }
        
        .pf-textarea:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 4px 16px rgba(124,58,237,0.15), 0 0 0 4px rgba(124,58,237,0.1);
        }
        
        .pf-label {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #1e1b4b;
          margin-bottom: 8px;
          display: block;
        }
        
        .pf-btn-back {
          background: rgba(124,58,237,0.1);
          color: #7C3AED;
          border: 2px solid rgba(124,58,237,0.2);
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pf-btn-back:hover {
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.4);
          transform: translateY(-1px);
        }
        
        .pf-btn-primary {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 16px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(124,58,237,0.25), 0 4px 12px rgba(124,58,237,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 56px;
        }
        
        .pf-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(124,58,237,0.35), 0 8px 20px rgba(124,58,237,0.25);
        }
        
        .pf-btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .pf-error {
          color: #EF4444;
          font-size: 12px;
          font-family: 'Open Sans', sans-serif;
          margin-top: 4px;
        }
        
        .pf-success {
          color: #10B981;
          font-size: 12px;
          font-family: 'Open Sans', sans-serif;
          margin-top: 4px;
        }
        
        .pf-required {
          color: #EF4444;
        }
        
        .pf-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        @media (max-width: 768px) {
          .pf-grid-2 {
            grid-template-columns: 1fr;
          }
        }
        
        .pf-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        
        @media (min-width: 1024px) {
          .pf-main-grid {
            grid-template-columns: 2fr 1fr;
          }
        }
      `}</style>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" style={{ 
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        marginTop: '24px'
      }}>

        {/* Header */}
        <div className="flex items-start gap-4 flex-wrap">
          <Link href="/dashboard/inventory">
            <button type="button" className="pf-btn-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="pf-header text-3xl sm:text-4xl font-bold text-[#1e1b4b] mb-2">
              {mode === 'create' ? 'Add New Product' : 'Edit Product'}
            </h1>
            <p className="pf-body text-[#6b7280] text-base">
              {mode === 'create'
                ? 'Fill in the details to add product to inventory'
                : 'Update your product information'
              }
            </p>
          </div>
        </div>

        <div className="pf-main-grid">

          {/* Left — main info */}
          <div className="space-y-6">

            {/* Basic Info */}
            <div className="pf-card">
              <div style={{ padding: '24px 24px 16px 24px', borderBottom: '2px solid rgba(196,181,253,0.2)' }}>
                <h2 className="pf-header text-xl font-bold text-[#1e1b4b]">Basic Information</h2>
              </div>
              <div style={{ padding: '24px' }} className="space-y-6">

                <div className="space-y-2">
                  <label className="pf-label">
                    Product Name <span className="pf-required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Classic White Shirt"
                    className="pf-input"
                    {...register('name', { required: 'Product name is required' })}
                  />
                  {errors.name && (
                    <p className="pf-error">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="pf-label">Description</label>
                  <textarea
                    placeholder="Describe your product..."
                    rows={4}
                    className="pf-textarea"
                    {...register('description')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="pf-label">SKU (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. SHIRT-WHT-001"
                    className="pf-input"
                    {...register('sku')}
                  />
                </div>

              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="pf-card">
              <div style={{ padding: '24px 24px 16px 24px', borderBottom: '2px solid rgba(196,181,253,0.2)' }}>
                <h2 className="pf-header text-xl font-bold text-[#1e1b4b]">Pricing & Stock</h2>
              </div>
              <div style={{ padding: '24px' }} className="space-y-6">

                <div className="pf-grid-2">
                  <div className="space-y-2">
                    <label className="pf-label">
                      Price (Rs.) <span className="pf-required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pf-input"
                      {...register('price', {
                        required: 'Price is required',
                        min: { value: 1, message: 'Price must be greater than 0' },
                      })}
                    />
                    {errors.price && (
                      <p className="pf-error">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="pf-label flex items-center gap-2">
                      Discount Price (Rs.)
                      <DiscountBadge price={price} discountPrice={discountPrice || null} />
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Leave empty for no discount"
                      className="pf-input"
                      {...register('discount_price', {
                        validate: (val) => {
                          if (!val) return true
                          if (parseFloat(val) >= price) return 'Discount price must be less than original price'
                          return true
                        },
                      })}
                    />
                    {errors.discount_price && (
                      <p className="pf-error">{errors.discount_price.message}</p>
                    )}
                    {discountPrice > 0 && discountPrice < price && (
                      <p className="pf-success">
                        Customer saves Rs. {(price - discountPrice).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <label className="pf-label">
                    Stock Quantity <span className="pf-required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="pf-input"
                    {...register('stock', {
                      required: 'Stock is required',
                      min: { value: 0, message: 'Stock cannot be negative' },
                    })}
                  />
                  {errors.stock && (
                    <p className="pf-error">{errors.stock.message}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Variants */}
            <div className="pf-card">
              <div style={{ padding: '24px 24px 16px 24px', borderBottom: '2px solid rgba(196,181,253,0.2)' }}>
                <h2 className="pf-header text-xl font-bold text-[#1e1b4b]">Variants</h2>
              </div>
              <div style={{ padding: '24px' }} className="space-y-6">
                <VariantsInput
                  label="Sizes"
                  values={sizes}
                  onChange={setSizes}
                  placeholder="Type custom size and press Enter"
                />
                <VariantsInput
                  label="Colors"
                  values={colors}
                  onChange={setColors}
                  placeholder="Type custom color and press Enter"
                  colorMode
                />
              </div>
            </div>

          </div>

          {/* Right — media & category */}
          <div className="space-y-6">

            <div className="pf-card">
              <div style={{ padding: '24px 24px 16px 24px', borderBottom: '2px solid rgba(196,181,253,0.2)' }}>
                <h2 className="pf-header text-xl font-bold text-[#1e1b4b]">
                  Product Images <span className="pf-required">*</span>
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                <MediaUpload images={images} onChange={setImages} maxImages={6} />
              </div>
            </div>

            <div className="pf-card">
              <div style={{ padding: '24px 24px 16px 24px', borderBottom: '2px solid rgba(196,181,253,0.2)' }}>
                <h2 className="pf-header text-xl font-bold text-[#1e1b4b]">Category</h2>
              </div>
              <div style={{ padding: '24px' }}>
                <CategorySelect value={categoryId} onChange={setCategoryId} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pf-btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {mode === 'create' ? 'Create Product' : 'Save Changes'}
                </>
              )}
            </button>

          </div>
        </div>

      </form>
    </div>
  )
}