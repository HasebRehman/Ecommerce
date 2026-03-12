'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { productService } from '@/lib/services/product.service'
import MediaUpload   from './MediaUpload'
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
  initialData?: any
  productId?:   string
  mode:         'create' | 'edit'
}

export default function ProductForm({
  initialData,
  productId,
  mode,
}: Props) {
  const router = useRouter()

  const [isLoading,   setLoading]   = useState(false)
  const [images,      setImages]    = useState<string[]>(
    initialData?.images ?? []
  )
  const [categoryId,  setCategoryId] = useState<string>(
    initialData?.category_id ?? ''
  )
  const [sizes,       setSizes]     = useState<string[]>(
    initialData?.sizes ?? []
  )
  const [colors,      setColors]    = useState<string[]>(
    initialData?.colors ?? []
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name:           initialData?.name           ?? '',
      description:    initialData?.description    ?? '',
      price:          initialData?.price?.toString() ?? '',
      discount_price: initialData?.discount_price?.toString() ?? '',
      stock:          initialData?.stock?.toString() ?? '0',
      sku:            initialData?.sku            ?? '',
    },
  })

  const price         = parseFloat(watch('price') || '0')
  const discountPrice = parseFloat(watch('discount_price') || '0')

 const onSubmit = async (data: FormData) => {
  if (images.length === 0) {
    toast.error('Please upload at least one product image')
    return
  }

  setLoading(true)
  try {
    const payload = {
      name:           data.name,
      description:    data.description  || null,
      price:          parseFloat(data.price),
      discount_price: data.discount_price
        ? parseFloat(data.discount_price)
        : null,
      stock:          parseInt(data.stock) || 0,
      sku:            data.sku           || null,
      images,
      category_id:    categoryId         || null,
      sizes,
      colors,
    }

    if (mode === 'create') {
      await productService.createProduct(payload)
      toast.success('Product created successfully!')
      router.push('/dashboard/inventory')
    } else {
      await productService.updateProduct(productId!, payload)
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory">
          <button
            type="button"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {mode === 'create'
              ? 'Fill in the details to add product to inventory'
              : 'Update your product information'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column — main info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-slate-200">
                  Product Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  placeholder="e.g. Classic White Shirt"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  {...register('name', { required: 'Product name is required' })}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-slate-200">Description</Label>
                <Textarea
                  placeholder="Describe your product..."
                  rows={4}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                  {...register('description')}
                />
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <Label className="text-slate-200">SKU (optional)</Label>
                <Input
                  placeholder="e.g. SHIRT-WHT-001"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  {...register('sku')}
                />
              </div>

            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">
                Pricing & Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-4">

                {/* Price */}
                <div className="space-y-2">
                  <Label className="text-slate-200">
                    Price (Rs.) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 1, message: 'Price must be greater than 0' },
                    })}
                  />
                  {errors.price && (
                    <p className="text-red-400 text-xs">{errors.price.message}</p>
                  )}
                </div>

                {/* Discount Price */}
                <div className="space-y-2">
                  <Label className="text-slate-200 flex items-center gap-2">
                    Discount Price (Rs.)
                    <DiscountBadge
                      price={price}
                      discountPrice={discountPrice || null}
                    />
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Leave empty for no discount"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    {...register('discount_price', {
                      validate: (val) => {
                        if (!val) return true
                        if (parseFloat(val) >= price) {
                          return 'Discount price must be less than original price'
                        }
                        return true
                      },
                    })}
                  />
                  {errors.discount_price && (
                    <p className="text-red-400 text-xs">
                      {errors.discount_price.message}
                    </p>
                  )}
                  {discountPrice > 0 && discountPrice < price && (
                    <p className="text-green-400 text-xs">
                      Customer saves Rs. {(price - discountPrice).toFixed(2)}
                    </p>
                  )}
                </div>

              </div>

              {/* Stock */}
              <div className="space-y-2">
                <Label className="text-slate-200">Stock Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  {...register('stock', {
                    min: { value: 0, message: 'Stock cannot be negative' },
                  })}
                />
              </div>

            </CardContent>
          </Card>

          {/* Variants */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">
                Variants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>

        </div>

        {/* Right column — media & category */}
        <div className="space-y-6">

          {/* Media Upload */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">
                Product Images <span className="text-red-400">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUpload
                images={images}
                onChange={setImages}
                maxImages={6}
              />
            </CardContent>
          </Card>

          {/* Category */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Category</CardTitle>
            </CardHeader>
            <CardContent>
              <CategorySelect
                value={categoryId}
                onChange={setCategoryId}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create Product' : 'Save Changes'}
              </>
            )}
          </Button>

        </div>
      </div>

    </form>
  )
}