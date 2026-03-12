'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Radio, PauseCircle, FileEdit } from 'lucide-react'
import { shopService } from '@/lib/services/shop.service'
import { cn } from '@/lib/utils'

interface Props {
  shopId:   string
  status:   'draft' | 'live' | 'paused'
  onChange: (status: string) => void
}

const STATUS_CONFIG = {
  draft: {
    label:     'Draft',
    color:     'text-slate-400',
    bg:        'bg-slate-500/10 border-slate-500/30',
    dot:       'bg-slate-400',
    icon:      FileEdit,
  },
  live: {
    label:     'Live',
    color:     'text-green-400',
    bg:        'bg-green-500/10 border-green-500/30',
    dot:       'bg-green-400',
    icon:      Radio,
  },
  paused: {
    label:     'Paused',
    color:     'text-yellow-400',
    bg:        'bg-yellow-500/10 border-yellow-500/30',
    dot:       'bg-yellow-400',
    icon:      PauseCircle,
  },
}

export default function StatusToggle({ shopId, status, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const config = STATUS_CONFIG[status]
  const Icon   = config.icon

  const handleToggle = async () => {
    const newStatus = status === 'live' ? 'paused' : 'live'
    setLoading(true)
    try {
      const result = await shopService.updateStatus(shopId, newStatus)
      onChange(newStatus)
      toast.success(result.message)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">

      {/* Current status badge */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium',
        config.bg, config.color
      )}>
        <span className={cn(
          'w-2 h-2 rounded-full',
          config.dot,
          status === 'live' && 'animate-pulse'
        )} />
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </div>

      {/* Toggle button */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
          status === 'live'
            ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/30'
            : 'bg-green-500 text-white hover:bg-green-600'
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status === 'live' ? (
          'Pause Shop'
        ) : (
          'Go Live 🚀'
        )}
      </button>

    </div>
  )
}