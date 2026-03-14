'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value:      number
  onChange?:  (val: number) => void
  readonly?:  boolean
  size?:      'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' }

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: Props) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn(
              'transition-all',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
          >
            <Star className={cn(
              SIZES[size],
              'transition-colors',
              filled
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-600'
            )} />
          </button>
        )
      })}
    </div>
  )
}