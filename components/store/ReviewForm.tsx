'use client'

import { useState } from 'react'
import { Loader2, Send, X, Star, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import StarRating from './StarRating'

interface Props {
  productId:   string
  orderId:     string
  productName: string
  onSubmitted: () => void
  onCancel:    () => void
}

/* rating label + colour — safe, purely visual */
const RATING_META: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: 'Poor',      color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.28)' },
  2: { label: 'Fair',      color: '#fb923c', bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.28)'  },
  3: { label: 'Good',      color: '#facc15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.28)'  },
  4: { label: 'Very Good', color: '#4ade80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.28)'  },
  5: { label: 'Excellent', color: '#B0E4CC', bg: 'rgba(176,228,204,0.10)', border: 'rgba(176,228,204,0.28)' },
}

export default function ReviewForm({ productId, orderId, productName, onSubmitted, onCancel }: Props) {
  const [rating,     setRating]     = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  /* ── logic completely unchanged ── */
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

  const meta = rating > 0 ? RATING_META[rating] : null

  return (
    <>
      <style>{styles}</style>

      <div className="rf-root rf-card">

        {/* ── Header ───────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="rf-icon-tile shrink-0">
              <Star className="w-3.5 h-3.5" style={{ color: '#B0E4CC' }} />
            </div>
            <div className="min-w-0">
              <p className="text-white font-black text-sm leading-tight">Write a Review</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(176,228,204,0.40)' }}>
                {productName}
              </p>
            </div>
          </div>

          <button onClick={onCancel} className="rf-close-btn shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rf-divider" />

        {/* ── Star rating ──────────────────────────── */}
        <div className="space-y-2.5">
          <label className="rf-label">
            Your Rating
            <span className="rf-required">*</span>
          </label>

          {/* StarRating component — unchanged */}
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating value={rating} onChange={setRating} size="lg" />

            {/* Rating label pill — appears when star selected */}
            {meta && (
              <span
                className="rf-rating-pill"
                style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
              >
                {meta.label}
              </span>
            )}
          </div>

          {/* Visual star fill indicator strip */}
          {rating > 0 && (
            <div className="rf-star-track">
              <div
                className="rf-star-fill"
                style={{ width: `${(rating / 5) * 100}%`, background: meta?.color }}
              />
            </div>
          )}
        </div>

        {/* ── Review textarea ──────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="rf-label">Your Review</label>
            <span className="rf-optional">optional</span>
          </div>

          <div className="relative">
            <MessageSquare
              className="absolute top-3 left-3 w-4 h-4 pointer-events-none"
              style={{ color: 'rgba(64,138,113,0.5)' }}
            />
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Share your experience with this product…"
              rows={3}
              maxLength={500}
              className="rf-textarea w-full resize-none"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {/* Char count */}
          <div className="flex items-center justify-between">
            <span />
            <span
              className="text-[10px] font-bold tabular-nums"
              style={{
                color: reviewText.length > 450
                  ? '#fb923c'
                  : 'rgba(176,228,204,0.25)',
              }}
            >
              {reviewText.length}/500
            </span>
          </div>
        </div>

        {/* ── Action buttons ───────────────────────── */}
        <div className="flex gap-2.5 pt-1">
          <button onClick={onCancel} className="rf-btn-cancel flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="rf-btn-submit flex-1 flex items-center justify-center gap-2"
          >
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4 shrink-0" />
            }
            Submit Review
          </button>
        </div>

      </div>
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .rf-root * { box-sizing: border-box; }
  .rf-root, .rf-root button { cursor: pointer !important; }
  .rf-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── card ── */
  @keyframes rfFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rf-card {
    background: linear-gradient(145deg, rgba(13,28,25,0.97), rgba(10,21,18,0.99));
    border: 1px solid rgba(64,138,113,0.35);
    border-radius: 20px;
    padding: 20px;
    display: flex; flex-direction: column; gap: 18px;
    box-shadow: 0 8px 32px rgba(9,20,19,0.5);
    animation: rfFadeUp 0.35s cubic-bezier(.22,1,.36,1) both;
  }

  /* ── icon tile ── */
  .rf-icon-tile {
    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #285A48, #1a3d2e);
    border: 1px solid rgba(64,138,113,0.38);
  }

  /* ── close btn ── */
  .rf-close-btn {
    width: 28px; height: 28px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(40,90,72,0.18);
    border: 1px solid rgba(40,90,72,0.30);
    color: rgba(176,228,204,0.45);
    transition: background 0.15s ease, color 0.15s ease;
  }
  .rf-close-btn:hover { background: rgba(40,90,72,0.32); color: #B0E4CC; }

  /* ── divider ── */
  .rf-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(40,90,72,0.4), transparent);
    margin: -4px 0;
  }

  /* ── labels ── */
  .rf-label {
    display: inline-block;
    font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.09em;
    color: rgba(176,228,204,0.45);
  }
  .rf-required {
    color: #f87171; margin-left: 3px; font-weight: 900;
  }
  .rf-optional {
    display: inline-block;
    font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.08em;
    padding: 2px 8px; border-radius: 99px;
    background: rgba(40,90,72,0.2);
    border: 1px solid rgba(40,90,72,0.3);
    color: rgba(176,228,204,0.35);
  }

  /* ── rating pill ── */
  .rf-rating-pill {
    display: inline-block;
    padding: 4px 12px; border-radius: 99px;
    font-size: 11px; font-weight: 900; letter-spacing: 0.04em;
    transition: all 0.2s ease;
  }

  /* ── star fill track ── */
  .rf-star-track {
    height: 3px; border-radius: 99px;
    background: rgba(40,90,72,0.25);
    overflow: hidden; margin-top: 2px;
  }
  .rf-star-fill {
    height: 100%; border-radius: 99px;
    transition: width 0.3s ease, background 0.3s ease;
  }

  /* ── textarea ── */
  .rf-textarea {
    background: rgba(9,20,19,0.75);
    border: 1px solid rgba(40,90,72,0.38);
    border-radius: 14px;
    padding: 0.7rem 0.9rem;
    color: #B0E4CC;
    font-size: 0.85rem; line-height: 1.6;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; caret-color: #408A71;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }
  .rf-textarea::placeholder { color: rgba(176,228,204,0.20); }
  .rf-textarea:focus {
    border-color: #408A71;
    background: rgba(9,20,19,0.95);
    box-shadow: 0 0 0 3px rgba(64,138,113,0.13);
  }

  /* ── cancel btn ── */
  .rf-btn-cancel {
    height: 42px; border-radius: 13px;
    background: rgba(40,90,72,0.18);
    border: 1px solid rgba(40,90,72,0.32);
    color: rgba(176,228,204,0.55);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.825rem; font-weight: 700;
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  }
  .rf-btn-cancel:hover {
    background: rgba(40,90,72,0.30);
    border-color: rgba(64,138,113,0.45);
    color: #B0E4CC;
  }

  /* ── submit btn ── */
  .rf-btn-submit {
    height: 42px; border-radius: 13px;
    background: #408A71; color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.825rem; font-weight: 800;
    border: none;
    box-shadow: 0 4px 16px rgba(64,138,113,0.28);
    transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }
  .rf-btn-submit:hover:not(:disabled) {
    background: #4eaa85;
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(64,138,113,0.38);
  }
  .rf-btn-submit:active:not(:disabled) { transform: translateY(0); }
  .rf-btn-submit:disabled { opacity: 0.40; cursor: not-allowed !important; }
`