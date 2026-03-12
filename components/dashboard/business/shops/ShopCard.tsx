import Link from 'next/link'
import { Edit, Trash2, Store, Package, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Shop {
  id:          string
  name:        string
  description: string | null
  logo_url:    string | null
  banner_url:  string | null
  status:      'draft' | 'live' | 'paused'
  shop_products: { count: number }[]
}

interface Props {
  shop:     Shop
  onDelete: (id: string) => void
}

const STATUS_STYLES = {
  live:   'bg-green-500/20 text-green-400 border-green-500/30',
  draft:  'bg-slate-500/20 text-slate-400 border-slate-500/30',
  paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

export default function ShopCard({ shop, onDelete }: Props) {
  const productCount = shop.shop_products?.[0]?.count ?? 0

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all group">

      {/* Banner */}
      <div className="relative h-24 bg-slate-800">
        {shop.banner_url ? (
          <img
            src={shop.banner_url}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
            <Store className="w-8 h-8 text-slate-600" />
          </div>
        )}

        {/* Action buttons on hover */}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/dashboard/shops/${shop.id}/edit`}>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-white rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete(shop.id)
            }}
            className="p-1.5 bg-white rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Logo + Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Logo */}
          <div className="w-12 h-12 rounded-xl border-2 border-slate-700 bg-slate-800 overflow-hidden shrink-0 -mt-8 relative z-10">
            {shop.logo_url ? (
              <img
                src={shop.logo_url}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="w-6 h-6 text-slate-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-semibold text-sm truncate">
                {shop.name}
              </p>
              <Badge className={cn(
                'text-xs capitalize',
                STATUS_STYLES[shop.status]
              )}>
                {shop.status === 'live' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1 inline-block" />
                )}
                {shop.status}
              </Badge>
            </div>

            {shop.description && (
              <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                {shop.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800">
          <span className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Package className="w-3.5 h-3.5" />
            {productCount} products
          </span>
        </div>

        {/* Manage button */}
        <Link href={`/dashboard/shops/${shop.id}`}>
          <button className="w-full mt-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm transition-all">
            Manage Shop
          </button>
        </Link>
      </div>

    </div>
  )
}