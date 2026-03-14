'use client'

import { useState } from 'react'
import { Loader2, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import StarRating from './StarRating'
import { cn } from '@/lib/utils'

interface Props {
  productId:   string
  orderId:     string
  productName: string
  onSubmitted: () => void
  onCancel:    () => void
}

export default function ReviewForm({ productId, orderId, productName, onSubmitted, onCancel }: Props) {
  const [rating,     setRating]     = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/store/reviews', {
        product_id:  productId,
        order_id:    orderId,
        rating,
        review_text: reviewText.trim() || null,
      })
      toast.success('Review submitted! Thank you 🎉')
      onSubmitted()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white font-semibold">Write a Review</p>
          <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{productName}</p>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stars */}
      <div className="space-y-1.5">
        <p className="text-slate-400 text-sm">Your Rating <span className="text-red-400">*</span></p>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-yellow-400 text-xs font-medium">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
          </p>
        )}
      </div>

      {/* Review Text */}
      <div className="space-y-1.5">
        <p className="text-slate-400 text-sm">Your Review <span className="text-slate-500">(optional)</span></p>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={3}
          maxLength={500}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
        />
        <p className="text-slate-600 text-xs text-right">{reviewText.length}/500</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 h-10 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {submitting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />
          }
          Submit Review
        </button>
      </div>
    </div>
  )
}