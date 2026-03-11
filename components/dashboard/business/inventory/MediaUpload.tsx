'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  images:    string[]
  onChange:  (images: string[]) => void
  maxImages?: number
}

export default function MediaUpload({
  images,
  onChange,
  maxImages = 6,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    )
    formData.append('folder', 'vendosphere/products')

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    if (!res.ok) throw new Error('Upload failed')

    const data = await res.json()
    return data.secure_url
  }

  const handleFiles = async (files: FileList) => {
    const remaining = maxImages - images.length
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remaining)
    const validFiles    = filesToUpload.filter(f => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image`)
        return false
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 5MB limit`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)
    try {
      const urls = await Promise.all(
        validFiles.map(f => uploadToCloudinary(f))
      )
      onChange([...images, ...urls])
      toast.success(`${urls.length} image(s) uploaded!`)
    } catch {
      toast.error('Upload failed. Check your Cloudinary settings.')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">

      {/* Upload Area */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (!uploading) handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
          uploading
            ? 'border-slate-600 cursor-not-allowed'
            : 'border-slate-700 hover:border-blue-500 hover:bg-blue-500/5'
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <p className="text-slate-400 text-sm">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-slate-500" />
            <p className="text-white text-sm font-medium">
              Click or drag images here
            </p>
            <p className="text-slate-500 text-xs">
              PNG, JPG, WEBP up to 5MB each — max {maxImages} images
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 group"
            >
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* First image badge */}
              {index === 0 && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                  Main
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}

          {/* Add more slot */}
          {images.length < maxImages && (
            <div
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-slate-700 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-colors"
            >
              <ImageIcon className="w-6 h-6 text-slate-500" />
            </div>
          )}
        </div>
      )}

    </div>
  )
}